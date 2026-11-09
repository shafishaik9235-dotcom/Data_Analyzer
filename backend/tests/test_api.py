import pytest
from fastapi.testclient import TestClient
import io
import pandas as pd

from app.main import app
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.api.deps import get_or_create_demo_user
from app.analytics.profiler import profile_dataframe
from app.analytics.quality import compute_data_quality
from app.analytics.cleaner import apply_cleaning_operation
from app.ai.deterministic_engine import DeterministicRuleEngine

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    demo_user = get_or_create_demo_user(db)
    db.close()
    yield


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["app_name"] == "Data_Analyzer"
    assert data["database"] == "connected"


def test_demo_auth():
    response = client.post("/api/auth/demo")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["is_demo"] is True
    assert data["user"]["email"] == "demo@dataanalyzer.dev"


def test_sample_datasets_provisioning():
    auth_resp = client.post("/api/auth/demo")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post("/api/datasets/sample", headers=headers)
    assert response.status_code == 200
    datasets = response.json()
    assert len(datasets) >= 3
    names = [d["name"] for d in datasets]
    assert any("Retail" in n for n in names)
    assert any("SaaS" in n for n in names)


def test_dataset_upload_and_preview():
    auth_resp = client.post("/api/auth/demo")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    csv_content = b"Department,Salary,Rating\nEngineering,120000,4.8\nSales,85000,4.2\nMarketing,90000,4.5\nEngineering,135000,4.9\n"
    file = ("test_dept.csv", io.BytesIO(csv_content), "text/csv")

    response = client.post("/api/datasets", files={"file": file}, headers=headers)
    assert response.status_code == 201
    dataset = response.json()
    dataset_id = dataset["id"]
    assert dataset["row_count"] == 4
    assert dataset["column_count"] == 3

    # Preview
    prev_resp = client.get(f"/api/datasets/{dataset_id}/preview", headers=headers)
    assert prev_resp.status_code == 200
    prev_data = prev_resp.json()
    assert len(prev_data["rows"]) == 4
    assert "Engineering" in [r["Department"] for r in prev_data["rows"]]

    # Profile
    prof_resp = client.get(f"/api/datasets/{dataset_id}/profile", headers=headers)
    assert prof_resp.status_code == 200
    prof_data = prof_resp.json()
    assert prof_data["data_quality_score"] > 80.0


def test_cleaning_workbench_operations():
    df = pd.DataFrame({
        "A": [1, 2, 2, 4, None],
        "B": ["apple", "banana", "banana", "cherry", "date"],
        "C": [10.0, 20.0, 20.0, 400.0, 50.0]  # 400 is outlier
    })

    # Test drop duplicates
    df_dedup, desc, affected = apply_cleaning_operation(df, "drop_duplicates", {})
    assert affected == 1
    assert len(df_dedup) == 4

    # Test fill NA
    df_filled, desc_fill, aff_fill = apply_cleaning_operation(df, "fill_na", {"column": "A", "strategy": "mean"})
    assert aff_fill == 1
    assert df_filled["A"].isna().sum() == 0

    # Test Outlier clip
    df_clipped, desc_out, aff_out = apply_cleaning_operation(df, "handle_outliers", {"column": "C", "method": "iqr_clip"})
    assert df_clipped["C"].max() < 400.0


def test_deterministic_ai_engine():
    engine = DeterministicRuleEngine()
    schema_info = {
        "columns": [
            {"name": "Category", "dtype": "categorical"},
            {"name": "Revenue", "dtype": "numeric"},
            {"name": "Order_Date", "dtype": "datetime"}
        ]
    }

    # Query 1: Top performer
    plan = engine.generate_analysis_plan("Which category has highest revenue?", schema_info)
    assert plan.target_metric == "Revenue"
    assert "Category" in plan.dimension_columns

    # Query 2: Missing values
    plan_missing = engine.generate_analysis_plan("Show columns with missing values", schema_info)
    assert plan_missing.intent == "data_quality"


def test_report_generation():
    auth_resp = client.post("/api/auth/demo")
    token = auth_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get first dataset
    datasets = client.get("/api/datasets", headers=headers).json()
    assert len(datasets) > 0
    d_id = datasets[0]["id"]

    rep_resp = client.post(
        "/api/reports/generate",
        json={"dataset_id": d_id, "title": "Automated Quality Report"},
        headers=headers
    )
    assert rep_resp.status_code == 201
    rep = rep_resp.json()
    assert "findings" in rep
    assert len(rep["findings"]) > 0
    assert rep["dataset_id"] == d_id

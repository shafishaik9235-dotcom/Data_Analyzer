import os
import uuid
import re
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional, List
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.dataset import Dataset, DatasetVersion
from app.models.user import User
from app.analytics.profiler import profile_dataframe
from app.analytics.quality import compute_data_quality


class DatasetService:
    ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        # Strip path traversal and special characters
        clean = re.sub(r"[^\w\s\.-]", "", os.path.basename(filename))
        return clean or "dataset.csv"

    @classmethod
    def validate_file(cls, file: UploadFile) -> str:
        filename = file.filename or ""
        ext = os.path.splitext(filename)[1].lower()
        if ext not in cls.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{ext}'. Supported formats: CSV (.csv), Excel (.xlsx, .xls)."
            )
        return ext

    @classmethod
    def read_dataframe(cls, file_path: str) -> pd.DataFrame:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Dataset file not found on disk.")

        ext = os.path.splitext(file_path)[1].lower()
        try:
            if ext == ".csv":
                # Try common encodings and separators
                try:
                    df = pd.read_csv(file_path, encoding="utf-8", low_memory=False)
                except UnicodeDecodeError:
                    df = pd.read_csv(file_path, encoding="latin1", low_memory=False)
            elif ext in (".xlsx", ".xls"):
                df = pd.read_excel(file_path)
            else:
                raise ValueError("Unsupported extension")
            
            # Enforce max row limit for in-memory safety
            if len(df) > settings.MAX_ROW_LIMIT:
                df = df.head(settings.MAX_ROW_LIMIT)

            # Clean column names (strip whitespace)
            df.columns = [str(c).strip() for c in df.columns]
            return df
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse dataset: {str(e)}")

    @classmethod
    def save_uploaded_file(cls, file: UploadFile) -> Tuple[str, str, int]:
        ext = cls.validate_file(file)
        safe_name = cls.sanitize_filename(file.filename or "dataset")
        unique_filename = f"{uuid.uuid4().hex}_{safe_name}"
        save_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

        size_bytes = 0
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

        with open(save_path, "wb") as f:
            while chunk := file.file.read(1024 * 1024):
                size_bytes += len(chunk)
                if size_bytes > max_bytes:
                    f.close()
                    if os.path.exists(save_path):
                        os.remove(save_path)
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
                    )
                f.write(chunk)

        return save_path, safe_name, size_bytes

    @classmethod
    def get_dataset_dataframe(cls, dataset: Dataset) -> pd.DataFrame:
        # If cleaned file exists, use it; otherwise use original
        active_path = dataset.cleaned_file_path if (dataset.cleaned_file_path and os.path.exists(dataset.cleaned_file_path)) else dataset.file_path
        return cls.read_dataframe(active_path)

    @classmethod
    def paginate_rows(
        cls,
        df: pd.DataFrame,
        page: int = 1,
        page_size: int = 25,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "asc"
    ) -> Tuple[List[Dict[str, Any]], int]:
        filtered_df = df

        # Search across all columns
        if search:
            search_str = search.lower().strip()
            mask = pd.Series([False] * len(filtered_df))
            for col in filtered_df.columns:
                mask = mask | filtered_df[col].astype(str).str.lower().str.contains(search_str, na=False)
            filtered_df = filtered_df[mask]

        # Sorting
        if sort_by and sort_by in filtered_df.columns:
            ascending = (sort_order.lower() == "asc")
            filtered_df = filtered_df.sort_values(by=sort_by, ascending=ascending)

        total_rows = len(filtered_df)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        sliced = filtered_df.iloc[start_idx:end_idx]
        
        # Replace NaN / inf with None for valid JSON serialization
        clean_rows = sliced.replace([np.nan, np.inf, -np.inf], None).to_dict(orient="records")
        return clean_rows, total_rows

    @classmethod
    def create_sample_datasets(cls, db: Session, user: User) -> List[Dataset]:
        """Creates realistic, high-value sample datasets for demonstration purposes."""
        samples_info = [
            {
                "name": "Global Retail Sales Performance",
                "filename": "global_retail_sales.csv",
                "desc": "Multi-region retail e-commerce sales transactions with categories, profit margins, discounts, and customer segments.",
                "data": cls._generate_retail_data(),
            },
            {
                "name": "SaaS Customer Churn & Lifetime Value",
                "filename": "saas_customer_churn.csv",
                "desc": "Subscription software customer metrics with tenure, contract type, monthly charges, support tickets, and churn labels.",
                "data": cls._generate_saas_churn_data(),
            },
            {
                "name": "Employee Talent & Compensation Audit",
                "filename": "employee_talent_audit.csv",
                "desc": "Human resources organizational data with departments, salary bands, performance ratings, overtime, and tenure.",
                "data": cls._generate_hr_data(),
            }
        ]

        created = []
        for info in samples_info:
            existing = db.query(Dataset).filter(Dataset.user_id == user.id, Dataset.name == info["name"]).first()
            if existing:
                created.append(existing)
                continue

            save_filename = f"sample_{uuid.uuid4().hex[:8]}_{info['filename']}"
            save_path = os.path.join(settings.UPLOAD_DIR, save_filename)
            df = info["data"]
            df.to_csv(save_path, index=False)
            file_size = os.path.getsize(save_path)

            profile = profile_dataframe(df, file_size)
            quality = compute_data_quality(profile)

            dataset = Dataset(
                user_id=user.id,
                name=info["name"],
                description=info["desc"],
                filename=info["filename"],
                file_path=save_path,
                file_size_bytes=file_size,
                file_type="csv",
                row_count=len(df),
                column_count=len(df.columns),
                data_quality_score=quality["score"],
                is_sample=True,
            )
            db.add(dataset)
            db.commit()
            db.refresh(dataset)

            # Add initial version
            v1 = DatasetVersion(
                dataset_id=dataset.id,
                version_number=1,
                file_path=save_path,
                row_count=len(df),
                column_count=len(df.columns),
                description="Initial raw dataset upload"
            )
            db.add(v1)
            db.commit()
            created.append(dataset)

        return created

    @staticmethod
    def _generate_retail_data() -> pd.DataFrame:
        np.random.seed(42)
        n = 350
        categories = ["Technology", "Furniture", "Office Supplies", "Electronics", "Apparel"]
        regions = ["North America", "Europe", "Asia Pacific", "Latin America"]
        segments = ["Consumer", "Corporate", "Home Office"]
        dates = pd.date_range("2024-01-01", periods=12, freq="MS").strftime("%Y-%m-%d")

        data = {
            "Transaction_ID": [f"TXN-{1000 + i}" for i in range(n)],
            "Order_Date": np.random.choice(dates, n),
            "Category": np.random.choice(categories, n, p=[0.25, 0.2, 0.3, 0.15, 0.1]),
            "Region": np.random.choice(regions, n),
            "Customer_Segment": np.random.choice(segments, n),
            "Sales_Revenue": np.round(np.random.exponential(scale=350, size=n) + 40, 2),
            "Quantity": np.random.randint(1, 15, size=n),
            "Discount": np.random.choice([0.0, 0.05, 0.1, 0.15, 0.2, 0.3], n, p=[0.4, 0.2, 0.15, 0.1, 0.1, 0.05]),
            "Profit": np.round(np.random.normal(loc=65, scale=45, size=n), 2),
        }
        df = pd.DataFrame(data)
        # Introduce a few realistic outliers and missing values to showcase cleaning workbench
        df.loc[10:14, "Discount"] = np.nan
        df.loc[25:27, "Profit"] = np.nan
        # Add 3 duplicate rows
        df = pd.concat([df, df.iloc[[5, 12, 19]]], ignore_index=True)
        # Outlier
        df.loc[3, "Sales_Revenue"] = 4850.0
        return df

    @staticmethod
    def _generate_saas_churn_data() -> pd.DataFrame:
        np.random.seed(101)
        n = 300
        data = {
            "Customer_ID": [f"CUST-{2000 + i}" for i in range(n)],
            "Plan_Tier": np.random.choice(["Starter", "Professional", "Enterprise"], n, p=[0.5, 0.35, 0.15]),
            "Tenure_Months": np.random.randint(1, 48, n),
            "Monthly_Charges": np.random.choice([29.0, 79.0, 199.0, 299.0], n),
            "Support_Tickets": np.random.poisson(lam=2, size=n),
            "Contract_Type": np.random.choice(["Month-to-Month", "One-Year", "Two-Year"], n, p=[0.6, 0.25, 0.15]),
            "Payment_Method": np.random.choice(["Credit Card", "Bank Transfer", "PayPal"], n),
            "Churned": np.random.choice(["No", "Yes"], n, p=[0.74, 0.26]),
        }
        df = pd.DataFrame(data)
        df.loc[5:7, "Support_Tickets"] = np.nan
        return df

    @staticmethod
    def _generate_hr_data() -> pd.DataFrame:
        np.random.seed(202)
        n = 280
        departments = ["Engineering", "Product", "Sales", "Marketing", "Customer Success", "Finance"]
        data = {
            "Employee_ID": [f"EMP-{3000 + i}" for i in range(n)],
            "Department": np.random.choice(departments, n),
            "Salary": np.round(np.random.normal(loc=92000, scale=24000, size=n), -2),
            "Performance_Rating": np.random.choice([1, 2, 3, 4, 5], n, p=[0.05, 0.15, 0.5, 0.2, 0.1]),
            "Years_At_Company": np.random.randint(1, 12, n),
            "Overtime_Hours": np.random.randint(0, 35, n),
            "Satisfaction_Score": np.round(np.random.uniform(2.5, 5.0, n), 1),
        }
        df = pd.DataFrame(data)
        df.loc[12:15, "Satisfaction_Score"] = np.nan
        return df


dataset_service = DatasetService()

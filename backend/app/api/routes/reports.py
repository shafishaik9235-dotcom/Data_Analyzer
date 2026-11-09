import json
import numpy as np
import pandas as pd
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.dataset import Dataset
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportOut, ReportFinding
from app.api.deps import get_current_user
from app.services.dataset_service import dataset_service
from app.analytics.profiler import profile_dataframe
from app.analytics.quality import compute_data_quality

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/generate", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def generate_report(
    req: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == req.dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    df = dataset_service.get_dataset_dataframe(dataset)
    profile = profile_dataframe(df, dataset.file_size_bytes)
    quality = compute_data_quality(profile)

    # Compute key analytical findings
    findings: List[ReportFinding] = []

    # 1. Quality finding
    findings.append(ReportFinding(
        category="Quality Audit",
        title="Dataset Health & Cleanliness Score",
        description=f"Overall data quality rated at {quality['score']}/100. Completeness is {quality['completeness_score']}%, uniqueness is {quality['uniqueness_score']}%, and validity is {quality['validity_score']}%.",
        metric_evidence=f"Total Missing: {profile['total_missing_cells']}, Duplicates: {profile['total_duplicate_rows']}",
        severity="positive" if quality["score"] >= 80 else ("neutral" if quality["score"] >= 60 else "warning")
    ))

    # 2. Key metrics and drivers
    num_cols = [c for c in profile["columns"] if c.get("dtype") == "numeric"]
    cat_cols = [c for c in profile["columns"] if c.get("dtype") in ("categorical", "text")]

    if num_cols:
        top_num = num_cols[0]
        mean_val = top_num.get("mean", 0)
        median_val = top_num.get("median", 0)
        findings.append(ReportFinding(
            category="Central Tendency",
            title=f"Distribution of Primary Metric '{top_num['name']}'",
            description=f"The mean value is {mean_val:,.2f} with a median of {median_val:,.2f}. The standard deviation is {top_num.get('std', 0):,.2f}.",
            metric_evidence=f"Range: [{top_num.get('min', 0):,.2f} to {top_num.get('max', 0):,.2f}]",
            severity="neutral"
        ))

    if cat_cols and num_cols:
        primary_cat = cat_cols[0]["name"]
        primary_num = num_cols[0]["name"]
        grouped = df.groupby(primary_cat)[primary_num].agg(["sum", "mean", "count"]).round(2).reset_index()
        grouped = grouped.sort_values(by="sum", ascending=False)
        if len(grouped) > 0:
            top_cat = grouped.iloc[0]
            findings.append(ReportFinding(
                category="Top Driver",
                title=f"Highest Contributing Category: '{top_cat[primary_cat]}'",
                description=f"'{top_cat[primary_cat]}' leads all groups with total {primary_num} of {top_cat['sum']:,.2f} (avg: {top_cat['mean']:,.2f} over {int(top_cat['count'])} records).",
                metric_evidence=f"Category share: {round((top_cat['sum'] / grouped['sum'].sum()) * 100, 1) if grouped['sum'].sum() > 0 else 0}% of aggregate volume",
                severity="positive"
            ))

    # 3. Outlier finding
    total_outliers = quality.get("total_outliers", 0)
    if total_outliers > 0:
        findings.append(ReportFinding(
            category="Statistical Outliers",
            title="Extreme Anomalies Detected",
            description=f"Found {total_outliers} statistical outliers exceeding standard IQR fences. These may reflect high-value transactions or measurement noise.",
            metric_evidence=f"{total_outliers} outlier records flagged",
            severity="warning"
        ))

    summary_text = (
        f"Executive summary for '{dataset.name}'. Analyzed {len(df):,} records across {len(df.columns)} dimensions. "
        f"Data quality achieved a composite score of {quality['score']}/100. "
        f"The primary numerical measure '{num_cols[0]['name'] if num_cols else 'N/A'}' was evaluated across {len(cat_cols)} categorical segments."
    )

    limitations_text = (
        "This report is derived deterministically from the current active dataset snapshot. "
        "Any missing values or sampling skew inherent in the source file may influence group-level aggregations. "
        "Recommended next step: verify outlier thresholds before downstream reporting."
    )

    key_metrics_dict = {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "data_quality_score": quality["score"],
        "missing_cells": profile["total_missing_cells"],
        "duplicate_rows": profile["total_duplicate_rows"],
        "total_outliers": total_outliers,
    }

    report = Report(
        user_id=current_user.id,
        dataset_id=dataset.id,
        title=req.title or f"Analytical Report: {dataset.name}",
        summary=summary_text,
        findings=json.dumps([f.model_dump() for f in findings]),
        quality_overview=json.dumps(quality),
        key_metrics=json.dumps(key_metrics_dict),
        limitations=limitations_text,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return ReportOut(
        id=report.id,
        dataset_id=report.dataset_id,
        dataset_name=dataset.name,
        title=report.title,
        summary=report.summary,
        findings=findings,
        quality_overview=quality,
        key_metrics=key_metrics_dict,
        limitations=report.limitations,
        created_at=report.created_at
    )


@router.get("", response_model=List[ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reports = (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .all()
    )
    result = []
    for r in reports:
        d_name = r.dataset.name if r.dataset else "Dataset"
        findings_list = [ReportFinding(**f) for f in json.loads(r.findings)] if r.findings else []
        result.append(ReportOut(
            id=r.id,
            dataset_id=r.dataset_id,
            dataset_name=d_name,
            title=r.title,
            summary=r.summary,
            findings=findings_list,
            quality_overview=json.loads(r.quality_overview) if r.quality_overview else {},
            key_metrics=json.loads(r.key_metrics) if r.key_metrics else {},
            limitations=r.limitations or "",
            created_at=r.created_at
        ))
    return result


@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    r = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found.")

    d_name = r.dataset.name if r.dataset else "Dataset"
    findings_list = [ReportFinding(**f) for f in json.loads(r.findings)] if r.findings else []

    return ReportOut(
        id=r.id,
        dataset_id=r.dataset_id,
        dataset_name=d_name,
        title=r.title,
        summary=r.summary,
        findings=findings_list,
        quality_overview=json.loads(r.quality_overview) if r.quality_overview else {},
        key_metrics=json.loads(r.key_metrics) if r.key_metrics else {},
        limitations=r.limitations or "",
        created_at=r.created_at
    )

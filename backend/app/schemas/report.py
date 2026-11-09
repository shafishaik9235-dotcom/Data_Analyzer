from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict


class ReportCreate(BaseModel):
    dataset_id: str
    title: str
    custom_notes: Optional[str] = None


class ReportFinding(BaseModel):
    category: str  # Trend, Performance, Quality, Outlier, Correlation
    title: str
    description: str
    metric_evidence: str
    severity: str  # positive, neutral, warning


class ReportOut(BaseModel):
    id: str
    dataset_id: str
    dataset_name: str
    title: str
    summary: str
    findings: List[ReportFinding] = []
    quality_overview: Dict[str, Any] = {}
    key_metrics: Dict[str, Any] = {}
    limitations: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

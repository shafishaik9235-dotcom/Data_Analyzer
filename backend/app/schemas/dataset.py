from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict


class ColumnProfile(BaseModel):
    name: str
    dtype: str  # numeric, categorical, datetime, boolean, text
    raw_dtype: str
    null_count: int
    null_percentage: float
    unique_count: int
    unique_percentage: float
    is_constant: bool
    is_near_empty: bool
    sample_values: List[Any] = []
    # Numeric stats (if applicable)
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    median: Optional[float] = None
    std: Optional[float] = None
    q25: Optional[float] = None
    q75: Optional[float] = None
    outliers_count: Optional[int] = 0
    # Categorical stats (if applicable)
    top_categories: Optional[List[Dict[str, Any]]] = None


class DatasetProfileOut(BaseModel):
    dataset_id: str
    row_count: int
    column_count: int
    file_size_bytes: int
    memory_usage_mb: float
    columns: List[ColumnProfile]
    data_quality_score: float
    total_missing_cells: int
    total_duplicate_rows: int
    warnings: List[str]


class DatasetPreview(BaseModel):
    dataset_id: str
    total_rows: int
    total_columns: int
    page: int
    page_size: int
    columns: List[str]
    rows: List[Dict[str, Any]]
    column_types: Dict[str, str]


class DatasetOut(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    filename: str
    file_size_bytes: int
    file_type: str
    row_count: int
    column_count: int
    data_quality_score: float
    is_sample: bool
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

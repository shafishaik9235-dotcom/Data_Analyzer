from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict


class CleaningOperationRequest(BaseModel):
    operation: str  # drop_duplicates, fill_na, drop_columns, cast_types, filter_rows, handle_outliers
    parameters: Dict[str, Any]
    # Examples:
    # drop_duplicates: {"subset": ["col1", "col2"], "keep": "first"}
    # fill_na: {"column": "age", "strategy": "mean" | "median" | "mode" | "constant" | "ffill", "fill_value": 0}
    # drop_columns: {"columns": ["col_a", "col_b"]}
    # cast_types: {"column": "date", "target_type": "datetime" | "numeric" | "string" | "boolean"}
    # filter_rows: {"column": "sales", "operator": ">" | ">=" | "<" | "<=" | "==" | "!=" | "contains", "value": 100}
    # handle_outliers: {"column": "salary", "method": "iqr_clip" | "iqr_drop" | "zscore_drop", "threshold": 1.5}


class CleaningPreviewOut(BaseModel):
    operation: str
    description: str
    rows_before: int
    rows_after: int
    cols_before: int
    cols_after: int
    preview_rows: List[Dict[str, Any]]
    columns: List[str]
    quality_score_before: float
    quality_score_after: float
    affected_count: int


class CleaningStepOut(BaseModel):
    id: str
    step_number: int
    operation_type: str
    description: str
    parameters: Dict[str, Any]
    rows_before: int
    rows_after: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CleaningApplyOut(BaseModel):
    success: bool
    message: str
    dataset_id: str
    new_version: int
    current_row_count: int
    current_column_count: int
    data_quality_score: float
    step: CleaningStepOut

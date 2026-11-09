from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict


class ChartFilter(BaseModel):
    column: str
    operator: str  # ==, !=, >, <, in
    value: Any


class ChartDataRequest(BaseModel):
    chart_type: str  # bar, line, area, pie, donut, histogram, scatter, heatmap
    x_column: Optional[str] = None
    y_column: Optional[str] = None
    aggregation: Optional[str] = "sum"  # sum, avg, count, min, max, median, none
    group_by: Optional[str] = None
    filters: Optional[List[ChartFilter]] = []
    limit: Optional[int] = 50
    bins: Optional[int] = 10  # for histogram
    sort_by: Optional[str] = "value_desc"  # value_desc, value_asc, label_asc


class ChartSeriesItem(BaseModel):
    name: str
    dataKey: str
    color: str


class ChartDataResponse(BaseModel):
    chart_type: str
    title: str
    data: List[Dict[str, Any]]
    x_axis_key: str
    series: List[ChartSeriesItem]
    insights: List[str] = []
    total_data_points: int


class VisualizationCreate(BaseModel):
    dataset_id: str
    title: str
    chart_type: str
    config: Dict[str, Any]


class VisualizationOut(BaseModel):
    id: str
    dataset_id: str
    title: str
    chart_type: str
    config: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class AnalysisPlan(BaseModel):
    intent: str  # aggregation, trend, distribution, comparison, top_n, data_quality, correlation, anomaly
    target_metric: Optional[str] = None
    aggregation_func: Optional[str] = None  # sum, mean, count, min, max, median
    dimension_columns: List[str] = []
    filters: List[Dict[str, Any]] = []
    sort_order: Optional[str] = "desc"
    limit: Optional[int] = 10
    suggested_chart_type: Optional[str] = "bar"  # bar, line, pie, scatter, table
    explanation: str


class AskQuestionRequest(BaseModel):
    question: str
    include_chart: bool = True


class AskQuestionResponse(BaseModel):
    question: str
    answer: str
    plan: Optional[AnalysisPlan] = None
    data_table: Optional[List[Dict[str, Any]]] = None
    chart_config: Optional[Dict[str, Any]] = None
    observed_facts: List[str] = []
    analytical_interpretations: List[str] = []
    provider_used: str  # gemini, openai, deterministic_rule_engine
    is_fallback: bool = False


class SuggestedQuestionOut(BaseModel):
    category: str
    question: str
    icon: str

import logging
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from app.core.config import settings
from app.ai.base import BaseAIProvider
from app.ai.deterministic_engine import DeterministicRuleEngine
from app.ai.gemini_provider import GeminiAIProvider
from app.schemas.ai import (
    AskQuestionRequest,
    AskQuestionResponse,
    AnalysisPlan,
    SuggestedQuestionOut
)
from app.analytics.aggregator import INSIGHT_PALETTE

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.deterministic_engine = DeterministicRuleEngine()
        self.provider: BaseAIProvider = self.deterministic_engine
        self.provider_name = "deterministic_rule_engine"

        # Check configured providers
        if settings.AI_PROVIDER in ("auto", "gemini") and settings.GEMINI_API_KEY:
            try:
                self.provider = GeminiAIProvider(settings.GEMINI_API_KEY)
                self.provider_name = "gemini"
            except Exception as e:
                logger.warning(f"Could not load Gemini provider: {e}")
                self.provider = self.deterministic_engine
                self.provider_name = "deterministic_rule_engine"

    def ask(self, df: pd.DataFrame, schema_info: Dict[str, Any], req: AskQuestionRequest) -> AskQuestionResponse:
        question = req.question.strip()
        is_fallback = False
        active_provider_name = self.provider_name

        # 1. Generate Structured Analysis Plan
        try:
            plan = self.provider.generate_analysis_plan(question, schema_info)
        except Exception as e:
            logger.warning(f"Provider {self.provider_name} failed to generate plan: {e}. Falling back to deterministic engine.")
            plan = self.deterministic_engine.generate_analysis_plan(question, schema_info)
            is_fallback = True
            active_provider_name = "deterministic_rule_engine (fallback)"

        # 2. Validate Plan against real DataFrame
        plan = self._validate_and_sanitize_plan(plan, df)

        # 3. Safely Execute Plan with Pandas
        data_results, chart_config = self._execute_plan(df, plan, req.include_chart)

        # 4. Interpret Results
        try:
            answer, observed_facts, interpretations = self.provider.interpret_results(
                question, plan, data_results, schema_info
            )
        except Exception as e:
            logger.warning(f"Provider interpretation failed: {e}. Using deterministic interpretation.")
            answer, observed_facts, interpretations = self.deterministic_engine.interpret_results(
                question, plan, data_results, schema_info
            )
            is_fallback = True

        return AskQuestionResponse(
            question=question,
            answer=answer,
            plan=plan,
            data_table=data_results[:20] if data_results else [],
            chart_config=chart_config,
            observed_facts=observed_facts,
            analytical_interpretations=interpretations,
            provider_used=active_provider_name,
            is_fallback=is_fallback
        )

    def _validate_and_sanitize_plan(self, plan: AnalysisPlan, df: pd.DataFrame) -> AnalysisPlan:
        # Validate target metric
        num_cols = list(df.select_dtypes(include=[np.number]).columns)
        if plan.target_metric and plan.target_metric not in df.columns:
            plan.target_metric = num_cols[0] if num_cols else None

        # Validate dimension columns
        valid_dims = [c for c in plan.dimension_columns if c in df.columns]
        if not valid_dims:
            cat_cols = list(df.select_dtypes(exclude=[np.number]).columns)
            valid_dims = [cat_cols[0]] if cat_cols else ([df.columns[0]] if len(df.columns) > 0 else [])
        plan.dimension_columns = valid_dims

        # Limit
        if not plan.limit or plan.limit > 50:
            plan.limit = 10

        return plan

    def _execute_plan(
        self,
        df: pd.DataFrame,
        plan: AnalysisPlan,
        include_chart: bool
    ) -> tuple[List[Dict[str, Any]], Optional[Dict[str, Any]]]:
        data_results: List[Dict[str, Any]] = []
        chart_config = None

        if plan.intent == "data_quality":
            # Return missing counts for each column
            for col in df.columns:
                nulls = int(df[col].isna().sum())
                pct = round((nulls / len(df)) * 100, 1) if len(df) > 0 else 0
                data_results.append({
                    "column": str(col),
                    "missing_count": nulls,
                    "missing_percentage": pct,
                })
            data_results.sort(key=lambda x: x["missing_count"], reverse=True)

            if include_chart:
                chart_config = {
                    "chart_type": "bar",
                    "x_axis_key": "column",
                    "title": "Missing Values per Column",
                    "series": [{"name": "Missing Count", "dataKey": "missing_count", "color": INSIGHT_PALETTE[0]}],
                    "data": [d for d in data_results if d["missing_count"] > 0][:10] or data_results[:8]
                }

        elif plan.intent == "anomaly" and plan.target_metric and plan.target_metric in df.columns:
            metric = plan.target_metric
            clean_s = pd.to_numeric(df[metric], errors="coerce").dropna()
            if not clean_s.empty:
                q25 = float(clean_s.quantile(0.25))
                q75 = float(clean_s.quantile(0.75))
                iqr = q75 - q25
                lower_b = q25 - 1.5 * iqr
                upper_b = q75 + 1.5 * iqr
                outliers_df = df[(df[metric] < lower_b) | (df[metric] > upper_b)]
                data_results = outliers_df.head(20).to_dict(orient="records")

                if include_chart and len(outliers_df) > 0:
                    chart_config = {
                        "chart_type": "scatter",
                        "x_axis_key": df.columns[0],
                        "title": f"Outliers in {metric}",
                        "series": [{"name": metric, "dataKey": metric, "color": INSIGHT_PALETTE[2]}],
                        "data": outliers_df.head(50).to_dict(orient="records")
                    }

        elif plan.dimension_columns and plan.target_metric:
            dim = plan.dimension_columns[0]
            metric = plan.target_metric
            agg = plan.aggregation_func or "sum"
            agg_func = "mean" if agg in ("avg", "mean") else agg

            grouped = df.groupby(dim)[metric].agg(agg_func).round(2).reset_index()
            ascending = (plan.sort_order == "asc")
            grouped = grouped.sort_values(by=metric, ascending=ascending)

            if plan.limit:
                grouped = grouped.head(plan.limit)

            data_results = grouped.to_dict(orient="records")

            if include_chart:
                chart_config = {
                    "chart_type": plan.suggested_chart_type or "bar",
                    "x_axis_key": dim,
                    "title": f"{agg.capitalize()} of {metric} by {dim}",
                    "series": [{"name": f"{agg.capitalize()} of {metric}", "dataKey": metric, "color": INSIGHT_PALETTE[0]}],
                    "data": data_results
                }

        else:
            # Simple summary aggregation
            num_cols = list(df.select_dtypes(include=[np.number]).columns)
            if num_cols:
                summary = df[num_cols].agg(["mean", "sum", "min", "max"]).round(2).T.reset_index()
                summary.columns = ["metric", "mean", "sum", "min", "max"]
                data_results = summary.to_dict(orient="records")

        return data_results, chart_config

    def get_suggested_questions(self, df: pd.DataFrame, schema_info: Dict[str, Any]) -> List[SuggestedQuestionOut]:
        cols = schema_info.get("columns", [])
        num_cols = [c["name"] for c in cols if c.get("dtype") == "numeric"]
        cat_cols = [c["name"] for c in cols if c.get("dtype") in ("categorical", "text")]
        date_cols = [c["name"] for c in cols if c.get("dtype") == "datetime"]

        suggestions = []

        if cat_cols and num_cols:
            suggestions.append(SuggestedQuestionOut(
                category="Performance",
                question=f"Which {cat_cols[0]} has the highest average {num_cols[0]}?",
                icon="trophy"
            ))

        if date_cols and num_cols:
            suggestions.append(SuggestedQuestionOut(
                category="Trends",
                question=f"Show the trend of {num_cols[0]} over time.",
                icon="trending-up"
            ))

        if num_cols:
            suggestions.append(SuggestedQuestionOut(
                category="Anomalies",
                question=f"Identify unusual outlier values in {num_cols[0]}.",
                icon="alert-triangle"
            ))

        suggestions.append(SuggestedQuestionOut(
            category="Data Quality",
            question="Which columns contain missing or null values?",
            icon="shield-alert"
        ))

        if len(cat_cols) > 0 and len(num_cols) > 0:
            suggestions.append(SuggestedQuestionOut(
                category="Comparison",
                question=f"Compare total {num_cols[0]} across top {cat_cols[0]} categories.",
                icon="bar-chart-3"
            ))

        return suggestions


ai_service = AIService()

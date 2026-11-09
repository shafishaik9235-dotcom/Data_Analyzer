import re
from typing import Dict, Any, Tuple, List, Optional
import pandas as pd
import numpy as np
from app.ai.base import BaseAIProvider
from app.schemas.ai import AnalysisPlan


class DeterministicRuleEngine(BaseAIProvider):
    """
    100% reliable, deterministic natural language analytics engine.
    Parses natural language queries into validated analysis plans and computes
    exact mathematical statistics using Pandas without any third-party API dependencies.
    """

    def generate_analysis_plan(self, question: str, schema_info: Dict[str, Any]) -> AnalysisPlan:
        q = question.lower()
        columns = schema_info.get("columns", [])
        numeric_cols = [c["name"] for c in columns if c.get("dtype") == "numeric"]
        cat_cols = [c["name"] for c in columns if c.get("dtype") in ("categorical", "text")]
        date_cols = [c["name"] for c in columns if c.get("dtype") == "datetime"]

        # 1. Check for Missing Values Intent
        if any(w in q for w in ["missing", "null", "empty", "na values", "missing values"]):
            return AnalysisPlan(
                intent="data_quality",
                explanation="Analyzed missing cell counts across all columns in dataset.",
                suggested_chart_type="bar"
            )

        # 2. Check for Outliers / Anomaly Intent
        if any(w in q for w in ["outlier", "unusual", "anomaly", "extreme", "abnormal"]):
            target_num = self._find_best_column_match(q, numeric_cols) or (numeric_cols[0] if numeric_cols else None)
            return AnalysisPlan(
                intent="anomaly",
                target_metric=target_num,
                explanation=f"Detected statistical outliers in '{target_num}' using the 1.5 * Interquartile Range (IQR) rule.",
                suggested_chart_type="scatter"
            )

        # 3. Check for Trend / Time Series Intent
        if any(w in q for w in ["trend", "monthly", "over time", "by date", "timeline", "daily", "yearly", "growth"]):
            target_metric = self._find_best_column_match(q, numeric_cols) or (numeric_cols[0] if numeric_cols else None)
            date_col = self._find_best_column_match(q, date_cols) or (date_cols[0] if date_cols else (columns[0]["name"] if columns else None))
            agg = "sum" if any(w in q for w in ["total", "sum", "sales", "revenue", "volume"]) else "mean"
            return AnalysisPlan(
                intent="trend",
                target_metric=target_metric,
                aggregation_func=agg,
                dimension_columns=[date_col] if date_col else [],
                sort_order="asc",
                suggested_chart_type="line",
                explanation=f"Calculated chronological trend of {agg} of '{target_metric}' grouped by '{date_col}'."
            )

        # 4. Check for Top-N Intent
        top_n_match = re.search(r"top\s*(\d+)", q)
        limit = int(top_n_match.group(1)) if top_n_match else (5 if any(w in q for w in ["top", "highest", "best", "leading"]) else 10)
        
        # 5. Check Aggregation Function
        agg_func = "sum"
        if any(w in q for w in ["average", "avg", "mean"]):
            agg_func = "mean"
        elif any(w in q for w in ["median"]):
            agg_func = "median"
        elif any(w in q for w in ["count", "number of", "how many"]):
            agg_func = "count"
        elif any(w in q for w in ["maximum", "max", "highest", "peak"]):
            agg_func = "max" if not any(w in q for w in ["average", "avg"]) else "mean"
        elif any(w in q for w in ["minimum", "min", "lowest"]):
            agg_func = "min"

        # 6. Target Metric & Dimension Selection
        target_metric = self._find_best_column_match(q, numeric_cols)
        if not target_metric and numeric_cols:
            # Semantic defaults: sales, revenue, profit, amount, price, score
            for preferred in ["revenue", "sales", "profit", "amount", "price", "salary", "score", "cost", "total"]:
                for num_col in numeric_cols:
                    if preferred in num_col.lower():
                        target_metric = num_col
                        break
                if target_metric:
                    break
            if not target_metric:
                target_metric = numeric_cols[0]

        dimension = self._find_best_column_match(q, cat_cols + date_cols)
        if not dimension and cat_cols:
            for preferred in ["category", "department", "region", "product", "country", "status", "type"]:
                for cat in cat_cols:
                    if preferred in cat.lower():
                        dimension = cat
                        break
                if dimension:
                    break
            if not dimension:
                dimension = cat_cols[0]

        intent = "top_n" if any(w in q for w in ["top", "highest", "leading", "best"]) else "comparison"

        return AnalysisPlan(
            intent=intent,
            target_metric=target_metric,
            aggregation_func=agg_func,
            dimension_columns=[dimension] if dimension else [],
            sort_order="desc",
            limit=limit,
            suggested_chart_type="bar",
            explanation=f"Calculated {agg_func} of '{target_metric}' grouped by '{dimension}' (Top {limit})."
        )

    def interpret_results(
        self,
        question: str,
        plan: AnalysisPlan,
        data_results: List[Dict[str, Any]],
        schema_info: Dict[str, Any]
    ) -> Tuple[str, List[str], List[str]]:
        observed_facts: List[str] = []
        interpretations: List[str] = []

        if not data_results:
            return "No matching records found for this query.", [], []

        intent = plan.intent

        if intent == "data_quality":
            # Results represent column null counts
            missing_cols = [r for r in data_results if r.get("missing_count", 0) > 0]
            if missing_cols:
                top_missing = missing_cols[0]
                answer = f"Found {len(missing_cols)} columns with missing values. The column with the most nulls is '{top_missing['column']}' with {top_missing['missing_count']} missing records ({top_missing.get('missing_percentage', 0)}%)."
                for m in missing_cols[:3]:
                    observed_facts.append(f"Column '{m['column']}': {m['missing_count']} null values ({m.get('missing_percentage', 0)}%).")
                interpretations.append("High missingness in critical dimensions may bias aggregate averages if not properly imputed or filtered.")
            else:
                answer = "Great news! No columns contain missing values in this dataset."
                observed_facts.append("All columns have 0 null records (100% data completeness).")

        elif intent == "anomaly":
            outlier_count = len(data_results)
            metric = plan.target_metric
            if outlier_count > 0:
                answer = f"Identified {outlier_count} statistical outlier(s) in '{metric}' using the 1.5×IQR boundary rule."
                max_val = max(r.get(metric, 0) for r in data_results)
                min_val = min(r.get(metric, 0) for r in data_results)
                observed_facts.append(f"{outlier_count} values fell outside the normal statistical range [Min: {min_val:,}, Max: {max_val:,}].")
                interpretations.append("These extreme data points may represent exceptional sales transactions, measurement anomalies, or VIP client activity.")
            else:
                answer = f"No extreme outliers were detected in column '{metric}' under standard IQR thresholds."
                observed_facts.append(f"All values in '{metric}' fall within the expected interquartile distribution.")

        elif intent in ("top_n", "comparison", "trend"):
            dim = plan.dimension_columns[0] if plan.dimension_columns else "Category"
            metric = plan.target_metric
            agg = plan.aggregation_func or "sum"

            first_item = data_results[0]
            dim_val = first_item.get(dim, "Unknown")
            metric_val = first_item.get(metric, 0)

            formatted_val = f"{metric_val:,.2f}" if isinstance(metric_val, float) else f"{metric_val:,}"

            if intent == "top_n":
                answer = f"The top performing {dim} is '{dim_val}' with a {agg} {metric} of {formatted_val}."
            elif intent == "trend":
                answer = f"Chronological trend of {metric} across {len(data_results)} recorded intervals."
            else:
                answer = f"Comparison of {agg} {metric} across {len(data_results)} {dim} categories."

            # Facts
            for r in data_results[:3]:
                d = r.get(dim)
                m = r.get(metric, 0)
                fmt = f"{m:,.2f}" if isinstance(m, float) else f"{m:,}"
                observed_facts.append(f"{dim} '{d}': {agg} {metric} = {fmt}")

            if len(data_results) > 1:
                last_item = data_results[-1]
                last_dim = last_item.get(dim)
                last_m = last_item.get(metric, 0)
                last_fmt = f"{last_m:,.2f}" if isinstance(last_m, float) else f"{last_m:,}"
                observed_facts.append(f"Lowest recorded: '{last_dim}' with {last_fmt}")

                # Calculate spread
                if isinstance(metric_val, (int, float)) and isinstance(last_m, (int, float)) and last_m > 0:
                    diff_pct = round(((metric_val - last_m) / last_m) * 100, 1)
                    interpretations.append(f"Top leader '{dim_val}' outperforms '{last_dim}' by approximately {diff_pct}%.")

            interpretations.append(f"Analysis computed using exact group-level {agg} aggregation over {len(data_results)} distinct categories.")

        else:
            answer = f"Analyzed query for target metric '{plan.target_metric}'."
            observed_facts.append(f"Computed records: {len(data_results)}")

        return answer, observed_facts, interpretations

    def _find_best_column_match(self, question: str, columns: List[str]) -> Optional[str]:
        # Exact match
        for col in columns:
            if col.lower() in question:
                return col
        # Partial word match
        words = re.findall(r"\w+", question)
        for col in columns:
            col_words = re.findall(r"\w+", col.lower())
            if any(w in words for w in col_words if len(w) > 2):
                return col
        return None

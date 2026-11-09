import json
import logging
from typing import Dict, Any, Tuple, List
from app.ai.base import BaseAIProvider
from app.schemas.ai import AnalysisPlan
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiAIProvider(BaseAIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        # Check if google-genai is available
        try:
            from google import genai
            self.client = genai.Client(api_key=self.api_key)
            self.available = True
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini Client: {e}")
            self.available = False

    def generate_analysis_plan(self, question: str, schema_info: Dict[str, Any]) -> AnalysisPlan:
        if not self.available:
            raise RuntimeError("Gemini client not initialized")

        cols = [f"{c['name']} ({c['dtype']})" for c in schema_info.get("columns", [])]
        prompt = f"""
You are Data_Analyzer Data Planner. Convert the user question into a strict JSON analysis plan for pandas aggregation.
Available columns: {', '.join(cols)}

User Question: "{question}"

Respond ONLY with valid JSON in this schema:
{{
  "intent": "aggregation" | "trend" | "distribution" | "comparison" | "top_n" | "data_quality" | "anomaly",
  "target_metric": "<column_name or null>",
  "aggregation_func": "sum" | "mean" | "median" | "count" | "min" | "max",
  "dimension_columns": ["<column_name>"],
  "sort_order": "desc" | "asc",
  "limit": 10,
  "suggested_chart_type": "bar" | "line" | "pie" | "scatter" | "table",
  "explanation": "<short rationale>"
}}
"""
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        text = response.text.strip()
        # Clean markdown code blocks if returned
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:].strip()
        data = json.loads(text)
        return AnalysisPlan(**data)

    def interpret_results(
        self,
        question: str,
        plan: AnalysisPlan,
        data_results: List[Dict[str, Any]],
        schema_info: Dict[str, Any]
    ) -> Tuple[str, List[str], List[str]]:
        if not self.available:
            raise RuntimeError("Gemini client not initialized")

        sample_data = data_results[:15]
        prompt = f"""
You are an expert data analyst. Based strictly on the computed mathematical figures below, summarize the answer.
Do not hallucinate or invent any figures outside the data provided.

User Question: "{question}"
Analysis Plan: {plan.model_dump_json()}
Calculated Results: {json.dumps(sample_data)}

Respond ONLY with valid JSON:
{{
  "answer": "<direct, concise 1-2 sentence response grounded in data>",
  "observed_facts": ["<fact 1 with actual numbers>", "<fact 2 with actual numbers>"],
  "analytical_interpretations": ["<insight or business implication 1>", "<insight 2>"]
}}
"""
        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:].strip()
        parsed = json.loads(text)
        return (
            parsed.get("answer", "Here are the computed results."),
            parsed.get("observed_facts", []),
            parsed.get("analytical_interpretations", [])
        )

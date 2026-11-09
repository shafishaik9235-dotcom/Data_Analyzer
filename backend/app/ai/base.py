from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, List
from app.schemas.ai import AnalysisPlan


class BaseAIProvider(ABC):
    @abstractmethod
    def generate_analysis_plan(self, question: str, schema_info: Dict[str, Any]) -> AnalysisPlan:
        pass

    @abstractmethod
    def interpret_results(
        self,
        question: str,
        plan: AnalysisPlan,
        data_results: List[Dict[str, Any]],
        schema_info: Dict[str, Any]
    ) -> Tuple[str, List[str], List[str]]:
        """
        Returns:
            (answer_text, observed_facts, analytical_interpretations)
        """
        pass

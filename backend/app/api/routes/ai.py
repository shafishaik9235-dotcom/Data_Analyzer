import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.dataset import Dataset
from app.models.chat import ChatMessage
from app.schemas.ai import (
    AskQuestionRequest,
    AskQuestionResponse,
    SuggestedQuestionOut
)
from app.api.deps import get_current_user
from app.services.dataset_service import dataset_service
from app.analytics.profiler import profile_dataframe
from app.ai.service import ai_service

router = APIRouter(prefix="/datasets", tags=["AI Analyst"])


@router.post("/{dataset_id}/ask", response_model=AskQuestionResponse)
def ask_question(
    dataset_id: str,
    req: AskQuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    df = dataset_service.get_dataset_dataframe(dataset)
    schema_info = profile_dataframe(df, dataset.file_size_bytes)

    # Execute AI or Deterministic analysis
    response = ai_service.ask(df, schema_info, req)

    # Persist chat history
    msg_user = ChatMessage(
        dataset_id=dataset.id,
        sender="user",
        content=req.question,
    )
    db.add(msg_user)

    msg_assistant = ChatMessage(
        dataset_id=dataset.id,
        sender="assistant",
        content=response.answer,
        query_plan=response.plan.model_dump_json() if response.plan else None,
        data_result=json.dumps(response.data_table) if response.data_table else None,
        chart_config=json.dumps(response.chart_config) if response.chart_config else None,
    )
    db.add(msg_assistant)
    db.commit()

    return response


@router.get("/{dataset_id}/suggested-questions", response_model=List[SuggestedQuestionOut])
def get_suggested_questions(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    df = dataset_service.get_dataset_dataframe(dataset)
    schema_info = profile_dataframe(df, dataset.file_size_bytes)
    return ai_service.get_suggested_questions(df, schema_info)

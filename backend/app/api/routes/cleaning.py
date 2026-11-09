import os
import uuid
import json
import numpy as np
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.dataset import Dataset, DatasetVersion
from app.models.cleaning import CleaningStep
from app.schemas.cleaning import (
    CleaningOperationRequest,
    CleaningPreviewOut,
    CleaningApplyOut,
    CleaningStepOut
)
from app.api.deps import get_current_user
from app.services.dataset_service import dataset_service
from app.analytics.cleaner import apply_cleaning_operation
from app.analytics.profiler import profile_dataframe
from app.analytics.quality import compute_data_quality
from app.core.config import settings

router = APIRouter(prefix="/datasets", tags=["Cleaning Workbench"])


@router.post("/{dataset_id}/clean/preview", response_model=CleaningPreviewOut)
def preview_cleaning(
    dataset_id: str,
    req: CleaningOperationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    current_df = dataset_service.get_dataset_dataframe(dataset)
    current_profile = profile_dataframe(current_df, dataset.file_size_bytes)
    current_quality = compute_data_quality(current_profile)

    # Perform preview transformation
    new_df, description, affected_count = apply_cleaning_operation(current_df, req.operation, req.parameters)

    # Calculate post-operation stats
    new_profile = profile_dataframe(new_df, 0)
    new_quality = compute_data_quality(new_profile)

    # Take first 15 preview rows, cleaning NaNs for JSON
    preview_slice = new_df.head(15).replace([np.nan, np.inf, -np.inf], None).to_dict(orient="records")

    return CleaningPreviewOut(
        operation=req.operation,
        description=description,
        rows_before=len(current_df),
        rows_after=len(new_df),
        cols_before=len(current_df.columns),
        cols_after=len(new_df.columns),
        preview_rows=preview_slice,
        columns=list(new_df.columns),
        quality_score_before=current_quality["score"],
        quality_score_after=new_quality["score"],
        affected_count=affected_count
    )


@router.post("/{dataset_id}/clean/apply", response_model=CleaningApplyOut)
def apply_cleaning(
    dataset_id: str,
    req: CleaningOperationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    current_df = dataset_service.get_dataset_dataframe(dataset)
    rows_before = len(current_df)

    # Apply transformation
    transformed_df, description, affected = apply_cleaning_operation(current_df, req.operation, req.parameters)

    # Write new transformed file
    cleaned_filename = f"cleaned_{uuid.uuid4().hex[:8]}_{dataset.filename.rsplit('.', 1)[0]}.csv"
    new_file_path = os.path.join(settings.UPLOAD_DIR, cleaned_filename)
    transformed_df.to_csv(new_file_path, index=False)

    new_profile = profile_dataframe(transformed_df, os.path.getsize(new_file_path))
    new_quality = compute_data_quality(new_profile)

    # Determine next version number
    version_count = db.query(DatasetVersion).filter(DatasetVersion.dataset_id == dataset.id).count()
    new_version_num = version_count + 1

    # Record Version
    version_record = DatasetVersion(
        dataset_id=dataset.id,
        version_number=new_version_num,
        file_path=new_file_path,
        row_count=len(transformed_df),
        column_count=len(transformed_df.columns),
        description=description
    )
    db.add(version_record)

    # Record Cleaning Step Audit
    step_record = CleaningStep(
        dataset_id=dataset.id,
        step_number=new_version_num,
        operation_type=req.operation,
        parameters=json.dumps(req.parameters),
        description=description,
        rows_before=rows_before,
        rows_after=len(transformed_df),
    )
    db.add(step_record)

    # Update Dataset metadata
    dataset.cleaned_file_path = new_file_path
    dataset.row_count = len(transformed_df)
    dataset.column_count = len(transformed_df.columns)
    dataset.data_quality_score = new_quality["score"]
    dataset.file_size_bytes = os.path.getsize(new_file_path)

    db.commit()
    db.refresh(step_record)
    db.refresh(dataset)

    step_out = CleaningStepOut(
        id=step_record.id,
        step_number=step_record.step_number,
        operation_type=step_record.operation_type,
        description=step_record.description,
        parameters=json.loads(step_record.parameters),
        rows_before=step_record.rows_before,
        rows_after=step_record.rows_after,
        created_at=step_record.created_at,
    )

    return CleaningApplyOut(
        success=True,
        message=description,
        dataset_id=dataset.id,
        new_version=new_version_num,
        current_row_count=len(transformed_df),
        current_column_count=len(transformed_df.columns),
        data_quality_score=new_quality["score"],
        step=step_out
    )


@router.get("/{dataset_id}/clean/history", response_model=List[CleaningStepOut])
def get_cleaning_history(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    steps = (
        db.query(CleaningStep)
        .filter(CleaningStep.dataset_id == dataset.id)
        .order_by(CleaningStep.step_number.asc())
        .all()
    )

    result = []
    for s in steps:
        result.append(CleaningStepOut(
            id=s.id,
            step_number=s.step_number,
            operation_type=s.operation_type,
            description=s.description,
            parameters=json.loads(s.parameters) if s.parameters else {},
            rows_before=s.rows_before,
            rows_after=s.rows_after,
            created_at=s.created_at
        ))
    return result

import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.dataset import Dataset, DatasetVersion
from app.schemas.dataset import DatasetOut, DatasetPreview, DatasetProfileOut
from app.api.deps import get_current_user
from app.services.dataset_service import dataset_service
from app.services.export_service import export_service
from app.analytics.profiler import profile_dataframe, detect_column_type
from app.analytics.quality import compute_data_quality

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.post("", response_model=DatasetOut, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    save_path, original_filename, file_size = dataset_service.save_uploaded_file(file)

    try:
        df = dataset_service.read_dataframe(save_path)
    except Exception as e:
        if os.path.exists(save_path):
            os.remove(save_path)
        raise e

    # Profile & Quality
    profile = profile_dataframe(df, file_size)
    quality = compute_data_quality(profile)

    dataset = Dataset(
        user_id=current_user.id,
        name=original_filename.rsplit(".", 1)[0].replace("_", " ").title(),
        filename=original_filename,
        file_path=save_path,
        file_size_bytes=file_size,
        file_type="csv" if original_filename.lower().endswith(".csv") else "xlsx",
        row_count=len(df),
        column_count=len(df.columns),
        data_quality_score=quality["score"],
        is_sample=False,
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    # Version 1
    v1 = DatasetVersion(
        dataset_id=dataset.id,
        version_number=1,
        file_path=save_path,
        row_count=len(df),
        column_count=len(df.columns),
        description="Initial raw dataset upload"
    )
    db.add(v1)
    db.commit()

    return DatasetOut.model_validate(dataset)


@router.post("/sample", response_model=List[DatasetOut])
def load_sample_datasets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Instantly provisions rich demo datasets for fast evaluation."""
    samples = dataset_service.create_sample_datasets(db, current_user)
    return [DatasetOut.model_validate(s) for s in samples]


@router.get("", response_model=List[DatasetOut])
def list_datasets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    datasets = (
        db.query(Dataset)
        .filter(Dataset.user_id == current_user.id)
        .order_by(Dataset.created_at.desc())
        .all()
    )
    return [DatasetOut.model_validate(d) for d in datasets]


@router.get("/{dataset_id}", response_model=DatasetOut)
def get_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return DatasetOut.model_validate(dataset)


@router.get("/{dataset_id}/preview", response_model=DatasetPreview)
def preview_dataset(
    dataset_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=5, le=100),
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    df = dataset_service.get_dataset_dataframe(dataset)
    rows, total_filtered = dataset_service.paginate_rows(
        df, page=page, page_size=page_size, search=search, sort_by=sort_by, sort_order=sort_order
    )

    col_types = {str(col): detect_column_type(df[col]) for col in df.columns}

    return DatasetPreview(
        dataset_id=dataset.id,
        total_rows=total_filtered,
        total_columns=len(df.columns),
        page=page,
        page_size=page_size,
        columns=list(df.columns),
        rows=rows,
        column_types=col_types,
    )


@router.get("/{dataset_id}/profile", response_model=DatasetProfileOut)
def profile_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    df = dataset_service.get_dataset_dataframe(dataset)
    profile = profile_dataframe(df, dataset.file_size_bytes)
    quality = compute_data_quality(profile)

    return DatasetProfileOut(
        dataset_id=dataset.id,
        row_count=profile["row_count"],
        column_count=profile["column_count"],
        file_size_bytes=profile["file_size_bytes"],
        memory_usage_mb=profile["memory_usage_mb"],
        columns=profile["columns"],
        data_quality_score=quality["score"],
        total_missing_cells=profile["total_missing_cells"],
        total_duplicate_rows=profile["total_duplicate_rows"],
        warnings=quality["warnings"],
    )


@router.get("/{dataset_id}/export")
def export_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")
    return export_service.export_csv(dataset)


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(
    dataset_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    # Cleanup files
    if os.path.exists(dataset.file_path):
        try:
            os.remove(dataset.file_path)
        except Exception:
            pass
    if dataset.cleaned_file_path and os.path.exists(dataset.cleaned_file_path):
        try:
            os.remove(dataset.cleaned_file_path)
        except Exception:
            pass

    db.delete(dataset)
    db.commit()
    return None

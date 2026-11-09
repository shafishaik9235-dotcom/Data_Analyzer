import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.dataset import Dataset
from app.models.visualization import Visualization
from app.schemas.visualization import (
    ChartDataRequest,
    ChartDataResponse,
    VisualizationCreate,
    VisualizationOut
)
from app.api.deps import get_current_user
from app.services.dataset_service import dataset_service
from app.analytics.aggregator import build_visualization_data

router = APIRouter(tags=["Visualizations"])


@router.post("/datasets/{dataset_id}/visualize", response_model=ChartDataResponse)
def compute_visualization(
    dataset_id: str,
    req: ChartDataRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    df = dataset_service.get_dataset_dataframe(dataset)
    chart_res = build_visualization_data(df, req)
    return chart_res


@router.post("/visualizations", response_model=VisualizationOut, status_code=status.HTTP_201_CREATED)
def save_visualization(
    item: VisualizationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dataset = db.query(Dataset).filter(Dataset.id == item.dataset_id, Dataset.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found.")

    vis = Visualization(
        user_id=current_user.id,
        dataset_id=item.dataset_id,
        title=item.title,
        chart_type=item.chart_type,
        config=json.dumps(item.config),
    )
    db.add(vis)
    db.commit()
    db.refresh(vis)

    return VisualizationOut(
        id=vis.id,
        dataset_id=vis.dataset_id,
        title=vis.title,
        chart_type=vis.chart_type,
        config=json.loads(vis.config),
        created_at=vis.created_at,
        updated_at=vis.updated_at
    )


@router.get("/visualizations", response_model=List[VisualizationOut])
def list_visualizations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    items = (
        db.query(Visualization)
        .filter(Visualization.user_id == current_user.id)
        .order_by(Visualization.created_at.desc())
        .all()
    )
    result = []
    for vis in items:
        result.append(VisualizationOut(
            id=vis.id,
            dataset_id=vis.dataset_id,
            title=vis.title,
            chart_type=vis.chart_type,
            config=json.loads(vis.config) if vis.config else {},
            created_at=vis.created_at,
            updated_at=vis.updated_at
        ))
    return result


@router.delete("/visualizations/{vis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_visualization(
    vis_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vis = db.query(Visualization).filter(Visualization.id == vis_id, Visualization.user_id == current_user.id).first()
    if not vis:
        raise HTTPException(status_code=404, detail="Visualization not found.")
    db.delete(vis)
    db.commit()
    return None

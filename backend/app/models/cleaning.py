import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class CleaningStep(Base):
    __tablename__ = "cleaning_steps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False, index=True)
    step_number = Column(Integer, nullable=False)
    operation_type = Column(String(100), nullable=False)  # drop_duplicates, fill_na, drop_cols, cast_type, filter_rows, handle_outliers
    parameters = Column(Text, nullable=False)  # JSON string of parameters used
    description = Column(String(500), nullable=False)
    rows_before = Column(Integer, default=0)
    rows_after = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    dataset = relationship("Dataset", back_populates="cleaning_steps")

import os
import io
import pandas as pd
from fastapi.responses import StreamingResponse
from app.models.dataset import Dataset
from app.services.dataset_service import dataset_service


class ExportService:
    @staticmethod
    def export_csv(dataset: Dataset) -> StreamingResponse:
        df = dataset_service.get_dataset_dataframe(dataset)
        stream = io.StringIO()
        df.to_csv(stream, index=False)
        stream.seek(0)
        
        filename = f"data_analyzer_{dataset.filename.rsplit('.', 1)[0]}_export.csv"
        return StreamingResponse(
            iter([stream.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )


export_service = ExportService()

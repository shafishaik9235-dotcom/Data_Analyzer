import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple


def detect_column_type(series: pd.Series) -> str:
    # Drop NAs for detection
    s = series.dropna()
    if s.empty:
        return "text"

    # Boolean detection
    if pd.api.types.is_bool_dtype(s):
        return "boolean"
    if s.nunique() <= 2 and set(s.astype(str).str.lower().unique()).issubset({"true", "false", "0", "1", "yes", "no"}):
        return "boolean"

    # Datetime detection
    if pd.api.types.is_datetime64_any_dtype(s):
        return "datetime"
    if pd.api.types.is_object_dtype(s) or pd.api.types.is_string_dtype(s):
        sample = s.astype(str).head(50)
        # Check if high percentage of sample can be parsed as dates
        try:
            parsed = pd.to_datetime(sample, errors="coerce", format="mixed")
            if parsed.notna().mean() > 0.8 and sample.str.contains(r"[-/:\s\d]").all():
                return "datetime"
        except Exception:
            pass

    # Numeric detection
    if pd.api.types.is_numeric_dtype(s):
        return "numeric"

    # Categorical vs Text based on cardinality
    unique_count = s.nunique()
    total_count = len(s)
    if unique_count <= 50 or (total_count > 0 and (unique_count / total_count) < 0.2):
        return "categorical"

    return "text"


def calculate_numeric_outliers(series: pd.Series) -> Tuple[int, float, float]:
    clean_s = series.dropna()
    if len(clean_s) < 4:
        return 0, 0.0, 0.0
    q25 = float(clean_s.quantile(0.25))
    q75 = float(clean_s.quantile(0.75))
    iqr = q75 - q25
    lower_bound = q25 - 1.5 * iqr
    upper_bound = q75 + 1.5 * iqr
    outliers = clean_s[(clean_s < lower_bound) | (clean_s > upper_bound)]
    return int(len(outliers)), lower_bound, upper_bound


def profile_dataframe(df: pd.DataFrame, file_size_bytes: int = 0) -> Dict[str, Any]:
    row_count = len(df)
    col_count = len(df.columns)
    memory_usage = float(df.memory_usage(deep=True).sum() / (1024 * 1024))
    
    columns_profile: List[Dict[str, Any]] = []
    total_missing_cells = int(df.isna().sum().sum())
    total_duplicate_rows = int(df.duplicated().sum())

    for col in df.columns:
        series = df[col]
        dtype_category = detect_column_type(series)
        null_count = int(series.isna().sum())
        null_percentage = round((null_count / row_count) * 100, 2) if row_count > 0 else 0.0
        unique_count = int(series.nunique(dropna=True))
        unique_percentage = round((unique_count / row_count) * 100, 2) if row_count > 0 else 0.0
        is_constant = bool(unique_count <= 1)
        is_near_empty = bool(null_percentage >= 90.0)

        # Non-null sample values (first 3)
        samples = series.dropna().head(3).tolist()
        sample_values = [str(x) if not isinstance(x, (int, float, bool)) else x for x in samples]

        col_data: Dict[str, Any] = {
            "name": str(col),
            "dtype": dtype_category,
            "raw_dtype": str(series.dtype),
            "null_count": null_count,
            "null_percentage": null_percentage,
            "unique_count": unique_count,
            "unique_percentage": unique_percentage,
            "is_constant": is_constant,
            "is_near_empty": is_near_empty,
            "sample_values": sample_values,
        }

        if dtype_category == "numeric":
            clean_num = pd.to_numeric(series, errors="coerce").dropna()
            if not clean_num.empty:
                outliers_cnt, _, _ = calculate_numeric_outliers(clean_num)
                col_data.update({
                    "min": float(clean_num.min()) if not math.isnan(clean_num.min()) else None,
                    "max": float(clean_num.max()) if not math.isnan(clean_num.max()) else None,
                    "mean": round(float(clean_num.mean()), 2) if not math.isnan(clean_num.mean()) else None,
                    "median": round(float(clean_num.median()), 2) if not math.isnan(clean_num.median()) else None,
                    "std": round(float(clean_num.std()), 2) if len(clean_num) > 1 and not math.isnan(clean_num.std()) else None,
                    "q25": round(float(clean_num.quantile(0.25)), 2),
                    "q75": round(float(clean_num.quantile(0.75)), 2),
                    "outliers_count": outliers_cnt,
                })
        elif dtype_category in ("categorical", "boolean", "text"):
            # Top categories
            val_counts = series.dropna().value_counts().head(5)
            top_cats = [{"label": str(k), "count": int(v), "percentage": round((v / row_count) * 100, 1) if row_count > 0 else 0} for k, v in val_counts.items()]
            col_data["top_categories"] = top_cats

        columns_profile.append(col_data)

    return {
        "row_count": row_count,
        "column_count": col_count,
        "file_size_bytes": file_size_bytes,
        "memory_usage_mb": round(memory_usage, 2),
        "columns": columns_profile,
        "total_missing_cells": total_missing_cells,
        "total_duplicate_rows": total_duplicate_rows,
    }

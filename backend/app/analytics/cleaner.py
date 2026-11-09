import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple


def apply_cleaning_operation(
    df: pd.DataFrame,
    operation: str,
    params: Dict[str, Any]
) -> Tuple[pd.DataFrame, str, int]:
    new_df = df.copy()
    rows_before = len(new_df)
    affected_count = 0
    description = ""

    if operation == "drop_duplicates":
        subset = params.get("subset")
        keep = params.get("keep", "first")
        if subset and isinstance(subset, list):
            valid_cols = [c for c in subset if c in new_df.columns]
            dups = new_df.duplicated(subset=valid_cols, keep=keep)
        else:
            dups = new_df.duplicated(keep=keep)
        
        affected_count = int(dups.sum())
        new_df = new_df[~dups].reset_index(drop=True)
        col_desc = f" based on columns {subset}" if subset else ""
        description = f"Removed {affected_count:,} duplicate rows{col_desc}."

    elif operation == "fill_na":
        column = params.get("column")
        strategy = params.get("strategy", "mean")
        fill_value = params.get("fill_value")

        if column in new_df.columns:
            null_count = int(new_df[column].isna().sum())
            affected_count = null_count
            if strategy == "mean" and pd.api.types.is_numeric_dtype(new_df[column]):
                val = new_df[column].mean()
                new_df[column] = new_df[column].fillna(val)
                description = f"Imputed {null_count} missing values in '{column}' with mean ({round(val, 2)})."
            elif strategy == "median" and pd.api.types.is_numeric_dtype(new_df[column]):
                val = new_df[column].median()
                new_df[column] = new_df[column].fillna(val)
                description = f"Imputed {null_count} missing values in '{column}' with median ({round(val, 2)})."
            elif strategy == "mode":
                mode_vals = new_df[column].mode()
                val = mode_vals.iloc[0] if not mode_vals.empty else "Unknown"
                new_df[column] = new_df[column].fillna(val)
                description = f"Imputed {null_count} missing values in '{column}' with most frequent value ('{val}')."
            elif strategy == "constant":
                val = fill_value if fill_value is not None else "Unknown"
                new_df[column] = new_df[column].fillna(val)
                description = f"Replaced {null_count} missing values in '{column}' with constant ('{val}')."
            elif strategy == "ffill":
                new_df[column] = new_df[column].ffill()
                description = f"Forward-filled {null_count} missing values in '{column}'."
            elif strategy == "bfill":
                new_df[column] = new_df[column].bfill()
                description = f"Backward-filled {null_count} missing values in '{column}'."
            else:
                new_df[column] = new_df[column].fillna("N/A")
                description = f"Filled missing values in '{column}'."

    elif operation == "drop_columns":
        columns = params.get("columns", [])
        if isinstance(columns, str):
            columns = [columns]
        valid_cols = [c for c in columns if c in new_df.columns]
        if valid_cols:
            new_df = new_df.drop(columns=valid_cols)
            affected_count = len(valid_cols)
            description = f"Dropped column(s): {', '.join(valid_cols)}."
        else:
            description = "No valid columns provided to drop."

    elif operation == "cast_types":
        column = params.get("column")
        target_type = params.get("target_type")  # numeric, datetime, string, boolean
        if column in new_df.columns:
            try:
                if target_type == "numeric":
                    new_df[column] = pd.to_numeric(new_df[column], errors="coerce")
                    description = f"Converted column '{column}' to numeric format."
                elif target_type == "datetime":
                    new_df[column] = pd.to_datetime(new_df[column], errors="coerce", format="mixed")
                    # Format as clean ISO string for JSON serialization
                    new_df[column] = new_df[column].dt.strftime("%Y-%m-%d %H:%M:%S")
                    description = f"Converted column '{column}' to datetime format."
                elif target_type == "string":
                    new_df[column] = new_df[column].astype(str)
                    description = f"Converted column '{column}' to string format."
                elif target_type == "boolean":
                    mapping = {"true": True, "1": True, "yes": True, "false": False, "0": False, "no": False}
                    new_df[column] = new_df[column].astype(str).str.lower().map(mapping).fillna(False)
                    description = f"Converted column '{column}' to boolean."
                affected_count = len(new_df)
            except Exception as e:
                description = f"Failed to convert column '{column}': {str(e)}"

    elif operation == "filter_rows":
        column = params.get("column")
        operator = params.get("operator", "==")
        value = params.get("value")

        if column in new_df.columns:
            if operator == "==":
                mask = (new_df[column].astype(str) == str(value))
            elif operator == "!=":
                mask = (new_df[column].astype(str) != str(value))
            elif operator == ">":
                mask = (pd.to_numeric(new_df[column], errors="coerce") > float(value))
            elif operator == ">=":
                mask = (pd.to_numeric(new_df[column], errors="coerce") >= float(value))
            elif operator == "<":
                mask = (pd.to_numeric(new_df[column], errors="coerce") < float(value))
            elif operator == "<=":
                mask = (pd.to_numeric(new_df[column], errors="coerce") <= float(value))
            elif operator == "contains":
                mask = new_df[column].astype(str).str.contains(str(value), case=False, na=False)
            else:
                mask = pd.Series([True] * len(new_df))

            rows_to_remove = int((~mask).sum())
            affected_count = rows_to_remove
            new_df = new_df[mask].reset_index(drop=True)
            description = f"Filtered rows where '{column}' {operator} {value} (removed {rows_to_remove:,} rows)."

    elif operation == "handle_outliers":
        column = params.get("column")
        method = params.get("method", "iqr_clip")  # iqr_clip, iqr_drop
        multiplier = float(params.get("multiplier", 1.5))

        if column in new_df.columns and pd.api.types.is_numeric_dtype(new_df[column]):
            clean_s = new_df[column].dropna()
            q25 = clean_s.quantile(0.25)
            q75 = clean_s.quantile(0.75)
            iqr = q75 - q25
            lower_bound = q25 - multiplier * iqr
            upper_bound = q75 + multiplier * iqr

            outliers_mask = (new_df[column] < lower_bound) | (new_df[column] > upper_bound)
            outliers_count = int(outliers_mask.sum())
            affected_count = outliers_count

            if method == "iqr_clip":
                new_df[column] = new_df[column].clip(lower=lower_bound, upper=upper_bound)
                description = f"Capped {outliers_count:,} outliers in '{column}' within range [{round(lower_bound, 2)}, {round(upper_bound, 2)}]."
            elif method == "iqr_drop":
                new_df = new_df[~outliers_mask].reset_index(drop=True)
                description = f"Removed {outliers_count:,} outlier rows in '{column}' outside range [{round(lower_bound, 2)}, {round(upper_bound, 2)}]."
        else:
            description = f"Column '{column}' is not numeric or not found."

    else:
        description = f"Unknown operation: {operation}"

    return new_df, description, affected_count

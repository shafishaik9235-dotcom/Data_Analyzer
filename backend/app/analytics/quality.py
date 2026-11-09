from typing import Dict, Any, List


def compute_data_quality(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    row_count = profile_data.get("row_count", 0)
    col_count = profile_data.get("column_count", 0)
    total_cells = row_count * col_count if col_count > 0 else 1
    total_missing = profile_data.get("total_missing_cells", 0)
    total_duplicates = profile_data.get("total_duplicate_rows", 0)

    # 1. Completeness Score (0 - 100)
    missing_ratio = total_missing / total_cells if total_cells > 0 else 0
    completeness_score = max(0.0, 100.0 - (missing_ratio * 100.0 * 2.0))

    # 2. Uniqueness Score (0 - 100)
    dup_ratio = total_duplicates / row_count if row_count > 0 else 0
    uniqueness_score = max(0.0, 100.0 - (dup_ratio * 100.0 * 3.0))

    # 3. Validity & Outliers
    columns = profile_data.get("columns", [])
    total_outliers = sum(c.get("outliers_count", 0) for c in columns if c.get("outliers_count"))
    outlier_ratio = total_outliers / (row_count if row_count > 0 else 1)
    validity_score = max(0.0, 100.0 - (outlier_ratio * 25.0))

    # 4. Consistency & Redundancy (penalty for constant or empty columns)
    empty_or_constant_cols = sum(1 for c in columns if c.get("is_constant") or c.get("is_near_empty"))
    redundancy_penalty = (empty_or_constant_cols / col_count * 100.0) if col_count > 0 else 0
    consistency_score = max(0.0, 100.0 - redundancy_penalty)

    # Weighted composite score
    overall_score = round(
        (completeness_score * 0.40) +
        (uniqueness_score * 0.25) +
        (validity_score * 0.20) +
        (consistency_score * 0.15),
        1
    )

    # Actionable Warnings
    warnings: List[str] = []
    if total_duplicates > 0:
        warnings.append(f"Found {total_duplicates:,} duplicate rows ({round(dup_ratio * 100, 1)}% of dataset). Recommend removing duplicates.")

    for col in columns:
        col_name = col.get("name")
        null_pct = col.get("null_percentage", 0)
        if null_pct > 20.0:
            warnings.append(f"Column '{col_name}' has high missing rate ({null_pct}% nulls). Consider imputing or removing.")
        elif null_pct > 0:
            warnings.append(f"Column '{col_name}' has {col.get('null_count')} missing values ({null_pct}%).")

        if col.get("is_constant"):
            warnings.append(f"Column '{col_name}' is constant (has only 1 distinct value). Safe to drop.")
        elif col.get("is_near_empty"):
            warnings.append(f"Column '{col_name}' is near empty (>90% missing values).")

        outliers = col.get("outliers_count", 0)
        if outliers > 0:
            warnings.append(f"Column '{col_name}' contains {outliers} potential statistical outliers.")

    return {
        "score": overall_score,
        "completeness_score": round(completeness_score, 1),
        "uniqueness_score": round(uniqueness_score, 1),
        "validity_score": round(validity_score, 1),
        "consistency_score": round(consistency_score, 1),
        "warnings": warnings,
        "total_outliers": total_outliers,
    }

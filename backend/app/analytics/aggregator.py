import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from app.schemas.visualization import ChartDataRequest, ChartDataResponse, ChartSeriesItem

# Curated palette that matches InsightAI visual identity
INSIGHT_PALETTE = [
    "#8B7BE8",  # primary violet
    "#286A50",  # mint dark
    "#A95837",  # coral dark
    "#4B6B94",  # slate blue
    "#D97706",  # amber
    "#0284C7",  # ocean
    "#7C3AED",  # deep purple
    "#059669",  # emerald
    "#DC2626",  # red
    "#475569",  # slate
]


def build_visualization_data(df: pd.DataFrame, req: ChartDataRequest) -> ChartDataResponse:
    working_df = df.copy()

    # 1. Apply any filters
    if req.filters:
        for f in req.filters:
            col = f.column
            op = f.operator
            val = f.value
            if col in working_df.columns:
                if op == "==":
                    working_df = working_df[working_df[col].astype(str) == str(val)]
                elif op == "!=":
                    working_df = working_df[working_df[col].astype(str) != str(val)]
                elif op == ">":
                    working_df = working_df[pd.to_numeric(working_df[col], errors="coerce") > float(val)]
                elif op == "<":
                    working_df = working_df[pd.to_numeric(working_df[col], errors="coerce") < float(val)]

    chart_type = req.chart_type.lower()
    insights: List[str] = []
    series_list: List[ChartSeriesItem] = []
    data_points: List[Dict[str, Any]] = []
    x_axis_key = req.x_column or "index"

    # Handle Correlation Heatmap
    if chart_type == "heatmap":
        num_df = working_df.select_dtypes(include=[np.number])
        if num_df.shape[1] >= 2:
            corr = num_df.corr().round(2)
            cols = list(corr.columns)
            x_axis_key = "metric"
            for col in cols:
                row_dict = {"metric": col}
                for target_col in cols:
                    val = corr.loc[col, target_col]
                    row_dict[target_col] = float(val) if not math.isnan(val) else 0.0
                data_points.append(row_dict)

            for idx, c in enumerate(cols):
                series_list.append(ChartSeriesItem(
                    name=c,
                    dataKey=c,
                    color=INSIGHT_PALETTE[idx % len(INSIGHT_PALETTE)]
                ))
            insights.append(f"Computed Pearson correlation across {len(cols)} numeric variables.")
        return ChartDataResponse(
            chart_type="heatmap",
            title=f"Correlation Matrix ({len(data_points)} variables)",
            data=data_points,
            x_axis_key=x_axis_key,
            series=series_list,
            insights=insights,
            total_data_points=len(data_points),
        )

    # Handle Histogram
    if chart_type == "histogram":
        col = req.x_column or (working_df.select_dtypes(include=[np.number]).columns[0] if not working_df.select_dtypes(include=[np.number]).empty else None)
        if col and col in working_df.columns:
            clean_s = pd.to_numeric(working_df[col], errors="coerce").dropna()
            if not clean_s.empty:
                bins_count = req.bins or 10
                counts, bin_edges = np.histogram(clean_s, bins=bins_count)
                for i in range(len(counts)):
                    bin_label = f"{round(bin_edges[i], 1)} - {round(bin_edges[i+1], 1)}"
                    data_points.append({
                        "bin": bin_label,
                        "count": int(counts[i]),
                    })
                x_axis_key = "bin"
                series_list.append(ChartSeriesItem(
                    name="Frequency",
                    dataKey="count",
                    color=INSIGHT_PALETTE[0]
                ))
                insights.append(f"Distribution of '{col}': Peak frequency in bin '{data_points[int(np.argmax(counts))]['bin']}' with {int(np.max(counts))} items.")
        return ChartDataResponse(
            chart_type="histogram",
            title=f"Distribution of {col}",
            data=data_points,
            x_axis_key=x_axis_key,
            series=series_list,
            insights=insights,
            total_data_points=len(data_points),
        )

    # Handle Scatter Plot
    if chart_type == "scatter":
        x_col = req.x_column
        y_col = req.y_column
        if x_col in working_df.columns and y_col in working_df.columns:
            scatter_df = working_df[[x_col, y_col]].dropna()
            # Limit to 300 points for browser rendering performance
            if len(scatter_df) > 300:
                scatter_df = scatter_df.sample(300, random_state=42)
            data_points = scatter_df.to_dict(orient="records")
            x_axis_key = x_col
            series_list.append(ChartSeriesItem(
                name=str(y_col),
                dataKey=str(y_col),
                color=INSIGHT_PALETTE[0]
            ))
            insights.append(f"Scatter plot of '{x_col}' vs '{y_col}' ({len(data_points)} points).")
        return ChartDataResponse(
            chart_type="scatter",
            title=f"{y_col} vs {x_col}",
            data=data_points,
            x_axis_key=x_axis_key,
            series=series_list,
            insights=insights,
            total_data_points=len(data_points),
        )

    # Handle Standard Aggregated Charts (Bar, Line, Area, Pie, Donut)
    x_col = req.x_column or working_df.columns[0]
    y_col = req.y_column
    agg = req.aggregation or "sum"
    group_col = req.group_by

    # Pick first numeric column if y_col not specified
    if not y_col:
        num_cols = working_df.select_dtypes(include=[np.number]).columns
        y_col = num_cols[0] if not num_cols.empty else None

    # Grouped multi-series aggregation
    if group_col and group_col in working_df.columns and y_col:
        pivot = working_df.pivot_table(
            index=x_col,
            columns=group_col,
            values=y_col,
            aggfunc=agg if agg != "avg" else "mean",
            fill_value=0
        )
        pivot = pivot.round(2).reset_index()
        if req.limit and len(pivot) > req.limit:
            pivot = pivot.head(req.limit)

        data_points = pivot.to_dict(orient="records")
        x_axis_key = x_col
        # Series for each unique group
        group_names = [c for c in pivot.columns if c != x_col]
        for idx, g in enumerate(group_names):
            series_list.append(ChartSeriesItem(
                name=str(g),
                dataKey=str(g),
                color=INSIGHT_PALETTE[idx % len(INSIGHT_PALETTE)]
            ))
        insights.append(f"Multi-series breakdown by '{group_col}' over '{x_col}'.")

    # Single series aggregation
    elif y_col and y_col in working_df.columns:
        agg_func = "mean" if agg in ("avg", "mean") else agg
        grouped = working_df.groupby(x_col)[y_col].agg(agg_func).round(2).reset_index()

        # Sort
        if req.sort_by == "value_desc":
            grouped = grouped.sort_values(by=y_col, ascending=False)
        elif req.sort_by == "value_asc":
            grouped = grouped.sort_values(by=y_col, ascending=True)

        if req.limit and len(grouped) > req.limit:
            grouped = grouped.head(req.limit)

        data_points = grouped.to_dict(orient="records")
        x_axis_key = x_col
        series_list.append(ChartSeriesItem(
            name=f"{agg.capitalize()} of {y_col}",
            dataKey=str(y_col),
            color=INSIGHT_PALETTE[0]
        ))

        # Meaningful automated insights
        if len(grouped) > 0:
            top_row = grouped.iloc[0]
            insights.append(f"Highest value: '{top_row[x_col]}' with {top_row[y_col]:,}.")
            if len(grouped) > 1:
                bottom_row = grouped.iloc[-1]
                insights.append(f"Lowest value: '{bottom_row[x_col]}' with {bottom_row[y_col]:,}.")
    else:
        # Simple count per category
        val_counts = working_df[x_col].value_counts().head(req.limit or 20).reset_index()
        val_counts.columns = [x_col, "count"]
        data_points = val_counts.to_dict(orient="records")
        x_axis_key = x_col
        series_list.append(ChartSeriesItem(
            name="Record Count",
            dataKey="count",
            color=INSIGHT_PALETTE[0]
        ))
        insights.append(f"Top category is '{val_counts.iloc[0][x_col]}' with {val_counts.iloc[0]['count']:,} records.")

    return ChartDataResponse(
        chart_type=chart_type,
        title=f"{agg.capitalize()} of {y_col or 'Records'} by {x_col}",
        data=data_points,
        x_axis_key=x_axis_key,
        series=series_list,
        insights=insights,
        total_data_points=len(data_points),
    )

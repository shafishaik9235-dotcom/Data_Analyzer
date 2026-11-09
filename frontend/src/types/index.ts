export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_demo: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Dataset {
  id: string;
  name: string;
  description?: string | null;
  filename: string;
  file_size_bytes: number;
  file_type: string;
  row_count: number;
  column_count: number;
  data_quality_score: number;
  is_sample: boolean;
  created_at: string;
  updated_at: string;
}

export interface ColumnCategoryItem {
  label: string;
  count: number;
  percentage: number;
}

export interface ColumnProfile {
  name: string;
  dtype: 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'text';
  raw_dtype: string;
  null_count: number;
  null_percentage: number;
  unique_count: number;
  unique_percentage: number;
  is_constant: boolean;
  is_near_empty: boolean;
  sample_values: (string | number | boolean)[];
  min?: number | null;
  max?: number | null;
  mean?: number | null;
  median?: number | null;
  std?: number | null;
  q25?: number | null;
  q75?: number | null;
  outliers_count?: number;
  top_categories?: ColumnCategoryItem[] | null;
}

export interface DatasetProfile {
  dataset_id: string;
  row_count: number;
  column_count: number;
  file_size_bytes: number;
  memory_usage_mb: number;
  columns: ColumnProfile[];
  data_quality_score: number;
  total_missing_cells: number;
  total_duplicate_rows: number;
  warnings: string[];
}

export interface DatasetPreview {
  dataset_id: string;
  total_rows: number;
  total_columns: number;
  page: number;
  page_size: number;
  columns: string[];
  rows: Record<string, any>[];
  column_types: Record<string, string>;
}

export interface CleaningOperationRequest {
  operation: 'drop_duplicates' | 'fill_na' | 'drop_columns' | 'cast_types' | 'filter_rows' | 'handle_outliers';
  parameters: Record<string, any>;
}

export interface CleaningPreview {
  operation: string;
  description: string;
  rows_before: number;
  rows_after: number;
  cols_before: number;
  cols_after: number;
  preview_rows: Record<string, any>[];
  columns: string[];
  quality_score_before: number;
  quality_score_after: number;
  affected_count: number;
}

export interface CleaningStep {
  id: string;
  step_number: number;
  operation_type: string;
  description: string;
  parameters: Record<string, any>;
  rows_before: number;
  rows_after: number;
  created_at: string;
}

export interface CleaningApplyResponse {
  success: boolean;
  message: string;
  dataset_id: string;
  new_version: number;
  current_row_count: number;
  current_column_count: number;
  data_quality_score: number;
  step: CleaningStep;
}

export interface ChartSeriesItem {
  name: string;
  dataKey: string;
  color: string;
}

export interface ChartFilter {
  column: string;
  operator: '==' | '!=' | '>' | '<' | 'in';
  value: any;
}

export interface ChartDataRequest {
  chart_type: 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'histogram' | 'scatter' | 'heatmap';
  x_column?: string | null;
  y_column?: string | null;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'median' | 'none';
  group_by?: string | null;
  filters?: ChartFilter[];
  limit?: number;
  bins?: number;
  sort_by?: 'value_desc' | 'value_asc' | 'label_asc';
}

export interface ChartDataResponse {
  chart_type: string;
  title: string;
  data: Record<string, any>[];
  x_axis_key: string;
  series: ChartSeriesItem[];
  insights: string[];
  total_data_points: number;
}

export interface VisualizationItem {
  id: string;
  dataset_id: string;
  title: string;
  chart_type: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AnalysisPlan {
  intent: string;
  target_metric?: string | null;
  aggregation_func?: string | null;
  dimension_columns: string[];
  filters: Record<string, any>[];
  sort_order?: string | null;
  limit?: number | null;
  suggested_chart_type?: string | null;
  explanation: string;
}

export interface AskQuestionResponse {
  question: string;
  answer: string;
  plan?: AnalysisPlan | null;
  data_table?: Record<string, any>[] | null;
  chart_config?: {
    chart_type: string;
    title: string;
    data: Record<string, any>[];
    x_axis_key: string;
    series: ChartSeriesItem[];
  } | null;
  observed_facts: string[];
  analytical_interpretations: string[];
  provider_used: string;
  is_fallback: boolean;
}

export interface SuggestedQuestion {
  category: string;
  question: string;
  icon: string;
}

export interface ReportFinding {
  category: string;
  title: string;
  description: string;
  metric_evidence: string;
  severity: 'positive' | 'neutral' | 'warning';
}

export interface Report {
  id: string;
  dataset_id: string;
  dataset_name: string;
  title: string;
  summary: string;
  findings: ReportFinding[];
  quality_overview: Record<string, any>;
  key_metrics: Record<string, any>;
  limitations: string;
  created_at: string;
}

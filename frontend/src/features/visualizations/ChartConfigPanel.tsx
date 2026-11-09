import React from 'react';
import {
  BarChart,
  LineChart as LineIcon,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Table as HeatmapIcon,
  Sparkles,
  Download,
  BookmarkPlus,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ChartDataRequest } from '../../types';

interface ChartConfigPanelProps {
  config: ChartDataRequest;
  onChange: (newConfig: ChartDataRequest) => void;
  columns: string[];
  numericColumns: string[];
  onSave?: () => void;
  onExportData?: () => void;
  isSaving?: boolean;
}

export const ChartConfigPanel: React.FC<ChartConfigPanelProps> = ({
  config,
  onChange,
  columns,
  numericColumns,
  onSave,
  onExportData,
  isSaving,
}) => {
  const chartTypes: { id: ChartDataRequest['chart_type']; label: string; icon: React.ReactNode }[] = [
    { id: 'bar', label: 'Bar Chart', icon: <BarChart className="w-4 h-4" /> },
    { id: 'line', label: 'Line Chart', icon: <LineIcon className="w-4 h-4" /> },
    { id: 'area', label: 'Area Chart', icon: <LineIcon className="w-4 h-4" /> },
    { id: 'pie', label: 'Pie Chart', icon: <PieIcon className="w-4 h-4" /> },
    { id: 'donut', label: 'Donut', icon: <PieIcon className="w-4 h-4" /> },
    { id: 'histogram', label: 'Histogram', icon: <BarChart className="w-4 h-4" /> },
    { id: 'scatter', label: 'Scatter', icon: <ScatterIcon className="w-4 h-4" /> },
    { id: 'heatmap', label: 'Heatmap', icon: <HeatmapIcon className="w-4 h-4" /> },
  ];

  return (
    <Card className="p-5 space-y-5">
      <div>
        <label className="text-xs font-semibold text-[#777487] uppercase tracking-wider block mb-2">
          Chart Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {chartTypes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ ...config, chart_type: t.id })}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                config.chart_type === t.id
                  ? 'bg-[#F0EDF9] border-[#8B7BE8] text-[#7564D5] font-semibold'
                  : 'bg-white border-[#E8E4ED] text-[#28263A] hover:bg-[#F7F5F0]'
              }`}
            >
              <span className={config.chart_type === t.id ? 'text-[#8B7BE8]' : 'text-[#777487]'}>
                {t.icon}
              </span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {config.chart_type !== 'heatmap' && (
        <div className="space-y-3.5">
          {/* X Axis */}
          <div>
            <label className="text-xs font-medium text-[#28263A] block mb-1">
              X-Axis / Dimension Column
            </label>
            <select
              value={config.x_column || ''}
              onChange={(e) => onChange({ ...config, x_column: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
            >
              {columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Y Axis */}
          {config.chart_type !== 'histogram' && (
            <div>
              <label className="text-xs font-medium text-[#28263A] block mb-1">
                Y-Axis / Metric Column
              </label>
              <select
                value={config.y_column || ''}
                onChange={(e) => onChange({ ...config, y_column: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
              >
                {(numericColumns.length ? numericColumns : columns).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Aggregation */}
          {!['scatter', 'histogram'].includes(config.chart_type) && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-[#28263A] block mb-1">
                  Aggregation
                </label>
                <select
                  value={config.aggregation || 'sum'}
                  onChange={(e) => onChange({ ...config, aggregation: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                >
                  <option value="sum">Sum</option>
                  <option value="avg">Average / Mean</option>
                  <option value="count">Count Records</option>
                  <option value="median">Median</option>
                  <option value="max">Maximum</option>
                  <option value="min">Minimum</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-[#28263A] block mb-1">
                  Sort Order
                </label>
                <select
                  value={config.sort_by || 'value_desc'}
                  onChange={(e) => onChange({ ...config, sort_by: e.target.value as any })}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                >
                  <option value="value_desc">Highest to Lowest</option>
                  <option value="value_asc">Lowest to Highest</option>
                  <option value="label_asc">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          )}

          {/* Group By (Multi-series) */}
          {!['scatter', 'pie', 'donut', 'histogram'].includes(config.chart_type) && (
            <div>
              <label className="text-xs font-medium text-[#28263A] block mb-1">
                Group By (Multi-Series Breakdown)
              </label>
              <select
                value={config.group_by || ''}
                onChange={(e) => onChange({ ...config, group_by: e.target.value || null })}
                className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
              >
                <option value="">None (Single Series)</option>
                {columns.filter((c) => c !== config.x_column).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 border-t border-[#E8E4ED] space-y-2">
        {onSave && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<BookmarkPlus className="w-4 h-4" />}
            isLoading={isSaving}
            onClick={onSave}
            className="w-full"
          >
            Save to Dashboard
          </Button>
        )}
        {onExportData && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={onExportData}
            className="w-full"
          >
            Export Chart Data (CSV)
          </Button>
        )}
      </div>
    </Card>
  );
};

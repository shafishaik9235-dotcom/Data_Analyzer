import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Sparkles,
  Download,
  BookmarkPlus,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { WorkflowStepBanner } from '../components/common/WorkflowStepBanner';
import { ChartConfigPanel } from '../features/visualizations/ChartConfigPanel';
import { ChartRenderer } from '../features/visualizations/ChartRenderer';
import { ChartDataRequest, ChartDataResponse, VisualizationItem, DatasetProfile } from '../types';

export const VisualizationBuilderPage: React.FC = () => {
  const { selectedDataset, showToast } = useApp();
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [config, setConfig] = useState<ChartDataRequest>({
    chart_type: 'bar',
    aggregation: 'sum',
    sort_by: 'value_desc',
    limit: 15,
  });
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedVisualizations, setSavedVisualizations] = useState<VisualizationItem[]>([]);

  const fetchProfileAndSaved = async () => {
    if (!selectedDataset) return;
    try {
      const [prof, saved] = await Promise.all([
        api.getDatasetProfile(selectedDataset.id),
        api.listVisualizations(),
      ]);
      setProfile(prof);
      setSavedVisualizations(saved);

      // Auto initialize config with valid columns
      const cols = prof.columns.map((c) => c.name);
      const numCols = prof.columns.filter((c) => c.dtype === 'numeric').map((c) => c.name);
      const catCols = prof.columns.filter((c) => c.dtype !== 'numeric').map((c) => c.name);

      setConfig((prev) => ({
        ...prev,
        x_column: catCols[0] || cols[0],
        y_column: numCols[0] || cols[1] || cols[0],
      }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProfileAndSaved();
  }, [selectedDataset]);

  useEffect(() => {
    const fetchChart = async () => {
      if (!selectedDataset) return;
      setIsLoading(true);
      try {
        const res = await api.computeVisualization(selectedDataset.id, config);
        setChartData(res);
      } catch (err: any) {
        setChartData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChart();
  }, [selectedDataset, config]);

  const handleSave = async () => {
    if (!selectedDataset || !chartData) return;
    setIsSaving(true);
    try {
      const saved = await api.saveVisualization(
        selectedDataset.id,
        chartData.title,
        config.chart_type,
        config
      );
      setSavedVisualizations([saved, ...savedVisualizations]);
      showToast('success', `Saved chart '${chartData.title}' to your portfolio.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save chart');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    try {
      await api.deleteVisualization(id);
      setSavedVisualizations(savedVisualizations.filter((v) => v.id !== id));
      showToast('info', 'Chart removed from saved library.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete');
    }
  };

  const handleExportDataCSV = () => {
    if (!chartData || !chartData.data.length) return;
    const headers = Object.keys(chartData.data[0]).join(',');
    const rows = chartData.data.map((r) => Object.values(r).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartData.title.toLowerCase().replace(/\s+/g, '_')}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Exported chart data as CSV.');
  };

  if (!selectedDataset) {
    return (
      <EmptyState
        title="No Dataset Selected"
        description="Select an active dataset to build interactive visualizations, custom aggregations, and correlation heatmaps."
      />
    );
  }

  const columns = profile ? profile.columns.map((c) => c.name) : [];
  const numericColumns = profile ? profile.columns.filter((c) => c.dtype === 'numeric').map((c) => c.name) : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Step 4 Workflow Banner */}
      <WorkflowStepBanner
        currentStep={4}
        title="Interactive Visual Studio & Chart Studio"
        subtitle={`Build bar charts, line trends, scatter plots, and aggregations over dataset '${selectedDataset.name}'.`}
        badge="Stage 4: Visuals"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Panel */}
        <div className="lg:col-span-1">
          <ChartConfigPanel
            config={config}
            onChange={setConfig}
            columns={columns}
            numericColumns={numericColumns}
            onSave={handleSave}
            onExportData={handleExportDataCSV}
            isSaving={isSaving}
          />
        </div>

        {/* Right: Live Visual Surface */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-semibold text-[#8B7BE8] uppercase tracking-wider block">
                  Computed Output
                </span>
                <h3 className="text-lg font-bold text-[#28263A] font-display">
                  {chartData ? chartData.title : 'Live Visualization'}
                </h3>
              </div>

              {chartData && (
                <Badge variant="violet" size="sm">
                  {chartData.total_data_points} Data Points
                </Badge>
              )}
            </div>

            <div className="py-2">
              {isLoading ? (
                <div className="h-80 flex items-center justify-center text-xs text-[#777487]">
                  Aggregating metrics and rendering Recharts...
                </div>
              ) : chartData ? (
                <ChartRenderer dataResponse={chartData} height={350} />
              ) : (
                <div className="h-80 flex items-center justify-center text-xs text-[#777487]">
                  No chart could be generated for the current axes selection.
                </div>
              )}
            </div>

            {chartData && chartData.insights.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#E8E4ED] text-xs text-[#28263A] flex items-center gap-2 bg-[#F7F5F0] p-3 rounded-xl">
                <TrendingUp className="w-4 h-4 text-[#286A50] shrink-0" />
                <span className="font-medium">{chartData.insights[0]}</span>
              </div>
            )}
          </Card>

          {/* Saved Visualizations Carousel/Drawer */}
          {savedVisualizations.length > 0 && (
            <Card className="p-5">
              <h4 className="text-xs font-bold text-[#777487] uppercase tracking-wider mb-3">
                Saved Dashboard Charts ({savedVisualizations.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedVisualizations.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED] flex items-center justify-between gap-2"
                  >
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#28263A] truncate font-display">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-[#777487] uppercase">
                        {item.chart_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfig(item.config as any)}
                        className="text-[11px] px-2 py-1"
                      >
                        Load
                      </Button>
                      <button
                        onClick={() => handleDeleteSaved(item.id)}
                        className="p-1 text-[#777487] hover:text-[#C54D58]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

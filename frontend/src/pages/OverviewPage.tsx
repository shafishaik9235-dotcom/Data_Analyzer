import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Database,
  BarChart3,
  Sparkles,
  ShieldCheck,
  FileText,
  Upload,
  ArrowRight,
  TrendingUp,
  TableProperties,
  CheckCircle2,
  SlidersHorizontal,
  Bot,
  Layers,
  ChevronRight,
  Check,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ChartRenderer } from '../features/visualizations/ChartRenderer';
import { ChartDataResponse } from '../types';
import { WORKFLOW_STEPS } from '../components/common/WorkflowStepBanner';

export const OverviewPage: React.FC = () => {
  const { user, datasets, selectedDataset, setSelectedDataset, refreshDatasets, showToast } = useApp();
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [reportsCount, setReportsCount] = useState(0);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);

  // Compute aggregate KPIs
  const totalDatasets = datasets.length;
  const totalRows = datasets.reduce((sum, d) => sum + d.row_count, 0);
  const avgQuality = totalDatasets > 0
    ? Math.round(datasets.reduce((sum, d) => sum + d.data_quality_score, 0) / totalDatasets)
    : 100;

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const reps = await api.listReports();
        setReportsCount(reps.length);
      } catch {}

      if (selectedDataset) {
        setIsLoadingChart(true);
        try {
          // Fetch an automated bar chart for the first category and numeric column
          const res = await api.computeVisualization(selectedDataset.id, {
            chart_type: 'bar',
            aggregation: 'sum',
            limit: 8,
          });
          setChartData(res);
        } catch {
          setChartData(null);
        } finally {
          setIsLoadingChart(false);
        }
      }
    };
    fetchOverviewData();
  }, [selectedDataset]);

  const handleQuickLoadSamples = async () => {
    setIsLoadingSamples(true);
    try {
      const samples = await api.loadSampleDatasets();
      await refreshDatasets();
      if (samples.length > 0) {
        setSelectedDataset(samples[0]);
      }
      showToast('success', 'Loaded sample datasets! You can now explore the entire analytics pipeline.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load samples');
    } finally {
      setIsLoadingSamples(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. HERO & COMMAND CENTER STATUS */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#F7F5FC] to-white rounded-3xl border border-[#E8E4ED] p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#8B7BE8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <Badge variant="violet" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                Deterministic Analytics SaaS
              </Badge>
              {selectedDataset ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DDF2E7] text-[#286A50] border border-[#C5E5D4]">
                  <span className="w-2 h-2 rounded-full bg-[#2EA043] animate-pulse" />
                  Active: {selectedDataset.name}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FBE7DC] text-[#A95837] border border-[#F2D0BF]">
                  No active dataset selected
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#28263A] font-display tracking-tight">
              Data_<span className="text-[#8B7BE8]">Analyzer</span> Project Hub
            </h1>
            <p className="text-sm text-[#777487] max-w-2xl mt-1.5 leading-relaxed">
              Transform raw tabular datasets into verified executive insights. Follow the 6-stage lifecycle below: ingest, profile, clean anomalies, visualize, consult AI, and export briefings.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <Link to="/datasets">
              <Button variant="primary" size="md" leftIcon={<Upload className="w-4 h-4" />}>
                Upload Dataset
              </Button>
            </Link>

            {datasets.length === 0 && (
              <Button
                variant="secondary"
                size="md"
                isLoading={isLoadingSamples}
                onClick={handleQuickLoadSamples}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Load Sample Data
              </Button>
            )}

            <Link to="/ai-analyst">
              <Button variant="outline" size="md" leftIcon={<Bot className="w-4 h-4 text-[#8B7BE8]" />}>
                Ask AI Copilot
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. ORDER OF THE PROJECT: 6-STAGE WORKFLOW PIPELINE */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8B7BE8] block">
              Project Lifecycle
            </span>
            <h2 className="text-lg font-black text-[#28263A] font-display">
              End-to-End Analytical Pipeline
            </h2>
          </div>
          <span className="text-xs text-[#777487] hidden sm:block">
            Step-by-step data journey
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            const hasData = !!selectedDataset;
            return (
              <Link key={step.path} to={step.path} className="group block">
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="h-full bg-white rounded-2xl border border-[#E8E4ED] p-4 hover:border-[#8B7BE8]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-6 h-6 rounded-lg bg-[#ECE8FC] text-[#7564D5] font-black text-xs flex items-center justify-center border border-[#8B7BE8]/20 group-hover:bg-[#8B7BE8] group-hover:text-white transition-colors">
                        {step.step}
                      </span>
                      <Icon className="w-4 h-4 text-[#777487] group-hover:text-[#8B7BE8] transition-colors" />
                    </div>
                    <h3 className="text-sm font-bold text-[#28263A] group-hover:text-[#7564D5] transition-colors font-display">
                      {step.shortLabel}
                    </h3>
                    <p className="text-[11px] text-[#777487] mt-1 leading-snug line-clamp-2">
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E8E4ED]/70 flex items-center justify-between text-[11px] font-semibold text-[#8B7BE8] group-hover:translate-x-0.5 transition-transform">
                    <span>Stage {step.step}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE WORKSPACES & DATASETS HUB (PROMINENTLY REORDERED TO TOP) */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#8B7BE8]" />
              <span className="text-xs font-bold text-[#8B7BE8] uppercase tracking-wider">
                Workspace Ingestion
              </span>
            </div>
            <h3 className="text-base font-extrabold text-[#28263A] font-display">
              Available Datasets ({datasets.length})
            </h3>
            <p className="text-xs text-[#777487] mt-0.5">
              Select any dataset below to set it as active across the entire analytics suite.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {datasets.length === 0 && (
              <Button
                variant="secondary"
                size="sm"
                isLoading={isLoadingSamples}
                onClick={handleQuickLoadSamples}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Load Sample Datasets
              </Button>
            )}
            <Link to="/datasets">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Manage Sources
              </Button>
            </Link>
          </div>
        </div>

        {datasets.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-[#F7F5F0]/60 border border-dashed border-[#E8E4ED]">
            <Database className="w-10 h-10 text-[#8B7BE8] mx-auto mb-3 opacity-60" />
            <h4 className="text-sm font-bold text-[#28263A] font-display">
              No Datasets Loaded Yet
            </h4>
            <p className="text-xs text-[#777487] max-w-md mx-auto mt-1 mb-4 leading-relaxed">
              To begin your data analysis project, load our sample retail/SaaS data or upload your own CSV/Excel file.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <Button
                variant="primary"
                size="sm"
                isLoading={isLoadingSamples}
                onClick={handleQuickLoadSamples}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Load 3 Sample Datasets
              </Button>
              <Link to="/datasets">
                <Button variant="outline" size="sm" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                  Upload File
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E4ED] text-[#777487]">
                  <th className="py-2.5 px-3 font-semibold">Active</th>
                  <th className="py-2.5 px-3 font-semibold">Dataset Name</th>
                  <th className="py-2.5 px-3 font-semibold">Rows</th>
                  <th className="py-2.5 px-3 font-semibold">Columns</th>
                  <th className="py-2.5 px-3 font-semibold">Quality Health</th>
                  <th className="py-2.5 px-3 font-semibold">Source</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Quick Pipeline Jumps</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((d) => {
                  const isSelected = selectedDataset?.id === d.id;
                  return (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDataset(d)}
                      className={`border-b border-[#E8E4ED] hover:bg-[#F0EDF9]/40 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#F0EDF9]/50 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#8B7BE8] text-white'
                              : 'border border-[#D8D3E0] hover:border-[#8B7BE8]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-[#28263A] block">{d.name}</span>
                        <span className="text-[11px] text-[#777487]">{d.filename}</span>
                      </td>
                      <td className="py-3 px-3 text-[#28263A] font-mono">
                        {d.row_count.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-[#28263A]">
                        {d.column_count} dims
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={d.data_quality_score >= 80 ? 'mint' : 'coral'} size="sm">
                          {d.data_quality_score}%
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={d.is_sample ? 'violet' : 'gray'} size="sm">
                          {d.is_sample ? 'Sample' : 'Uploaded'}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Link to="/explorer" onClick={() => setSelectedDataset(d)}>
                            <button
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#777487] hover:text-[#28263A] hover:bg-white border border-transparent hover:border-[#E8E4ED] transition-colors"
                              title="Explore Schema & Rows"
                            >
                              Explore
                            </button>
                          </Link>
                          <Link to="/cleaning" onClick={() => setSelectedDataset(d)}>
                            <button
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#7564D5] hover:bg-[#ECE8FC] transition-colors"
                              title="Clean & Deduplicate"
                            >
                              Clean
                            </button>
                          </Link>
                          <Link to="/visualizations" onClick={() => setSelectedDataset(d)}>
                            <button
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#286A50] hover:bg-[#DDF2E7] transition-colors"
                              title="Create Charts"
                            >
                              Charts
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 4. EXECUTIVE KPI CARDS GRID */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#777487]">
            Project Metrics & Health
          </span>
          <span className="text-xs text-[#777487]">Audited telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md" hoverEffect className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#777487] uppercase tracking-wider">Loaded Datasets</span>
              <div className="w-9 h-9 rounded-xl bg-[#ECE8FC] text-[#7564D5] flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-black text-[#28263A] font-display block">
              {totalDatasets}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#777487] mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B7BE8]" />
              <span>Active workspaces on record</span>
            </div>
          </Card>

          <Card padding="md" hoverEffect className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#777487] uppercase tracking-wider">Analyzed Records</span>
              <div className="w-9 h-9 rounded-xl bg-[#DDF2E7] text-[#286A50] flex items-center justify-center">
                <TableProperties className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-black text-[#28263A] font-display block">
              {totalRows.toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#286A50] mt-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Rows profiled deterministically</span>
            </div>
          </Card>

          <Card padding="md" hoverEffect className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#777487] uppercase tracking-wider">Quality Health</span>
              <div className="w-9 h-9 rounded-xl bg-[#FBE7DC] text-[#A95837] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-black text-[#28263A] font-display block">
              {avgQuality}%
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#777487] mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A95837]" />
              <span>Completeness & validity audit</span>
            </div>
          </Card>

          <Card padding="md" hoverEffect className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#777487] uppercase tracking-wider">Executive Reports</span>
              <div className="w-9 h-9 rounded-xl bg-[#ECEAF1] text-[#28263A] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <span className="text-3xl font-black text-[#28263A] font-display block">
              {reportsCount}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#777487] mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#777487]" />
              <span>Compiled executive briefings</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 5. VISUAL ANALYTICS & QUALITY AUDIT SHOWCASE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Interactive Chart Showcase */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-[#8B7BE8] uppercase tracking-wider block">
                  Stage 4 Showcase • Visual Analytics
                </span>
                <h3 className="text-lg font-bold text-[#28263A] font-display">
                  {chartData ? chartData.title : 'Dataset Summary'}
                </h3>
              </div>
              <Link to="/visualizations">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Open Studio
                </Button>
              </Link>
            </div>

            <div className="py-2">
              {isLoadingChart ? (
                <div className="h-64 flex flex-col items-center justify-center text-xs text-[#777487] gap-2">
                  <div className="w-6 h-6 border-2 border-[#8B7BE8] border-t-transparent rounded-full animate-spin" />
                  <span>Computing aggregate chart values...</span>
                </div>
              ) : chartData ? (
                <ChartRenderer dataResponse={chartData} height={260} />
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-[#777487] p-6 bg-[#F7F5F0]/50 rounded-2xl border border-dashed border-[#E8E4ED]">
                  <BarChart3 className="w-8 h-8 text-[#8B7BE8] mb-2" />
                  <p className="font-semibold text-[#28263A] mb-1">No Active Chart to Display</p>
                  <p className="max-w-xs mb-3">Select or upload a dataset above to render automated statistical aggregations.</p>
                  <Link to="/datasets">
                    <Button variant="secondary" size="sm">Choose Dataset</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {chartData && chartData.insights.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#E8E4ED] text-xs text-[#777487] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#286A50] shrink-0" />
              <span className="font-medium text-[#28263A]">{chartData.insights[0]}</span>
            </div>
          )}
        </Card>

        {/* Quality Health Breakdown */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-[#777487] uppercase tracking-wider block">
                  Stage 3 Health
                </span>
                <h3 className="text-base font-bold text-[#28263A] font-display">
                  Active Dataset Health
                </h3>
              </div>
              {selectedDataset && (
                <Badge variant={selectedDataset.data_quality_score >= 80 ? 'mint' : 'coral'} size="sm">
                  {selectedDataset.data_quality_score}%
                </Badge>
              )}
            </div>

            <p className="text-xs text-[#777487] mb-4">
              {selectedDataset
                ? `Evaluation of '${selectedDataset.name}'. Missing fields and duplicates can be cleansed in 1-click.`
                : 'No dataset currently selected.'}
            </p>

            {selectedDataset ? (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-[#F7F5F0] rounded-xl flex items-center justify-between border border-[#E8E4ED]/60">
                  <span className="text-[#777487]">Total Rows</span>
                  <span className="font-bold text-[#28263A] font-mono">{selectedDataset.row_count.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-[#F7F5F0] rounded-xl flex items-center justify-between border border-[#E8E4ED]/60">
                  <span className="text-[#777487]">Dimensions</span>
                  <span className="font-bold text-[#28263A]">{selectedDataset.column_count} columns</span>
                </div>
                <div className="p-3 bg-[#F7F5F0] rounded-xl flex items-center justify-between border border-[#E8E4ED]/60">
                  <span className="text-[#777487]">File Type</span>
                  <span className="font-bold text-[#28263A] uppercase">{selectedDataset.file_type}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#F7F5F0] rounded-xl text-xs text-center text-[#777487]">
                Load a sample dataset above to activate health telemetry.
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-[#E8E4ED]">
            <Link to="/cleaning" className="block">
              <Button variant="secondary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Open Cleaning Workbench
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* 6. RAPID PIPELINE TOOLKIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/explorer" className="block group">
          <Card padding="md" hoverEffect className="h-full border-[#E8E4ED] group-hover:border-[#8B7BE8]/50">
            <div className="w-9 h-9 rounded-xl bg-[#ECE8FC] text-[#7564D5] flex items-center justify-center mb-3">
              <TableProperties className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#28263A] group-hover:text-[#7564D5] transition-colors font-display">
              1. Profile Schema & Rows
            </h4>
            <p className="text-xs text-[#777487] mt-1 leading-relaxed">
              Paginate through real data records, inspect distributions, data types, and null value ratios.
            </p>
          </Card>
        </Link>

        <Link to="/ai-analyst" className="block group">
          <Card padding="md" hoverEffect className="h-full border-[#E8E4ED] group-hover:border-[#8B7BE8]/50">
            <div className="w-9 h-9 rounded-xl bg-[#F0EDF9] text-[#7564D5] flex items-center justify-center mb-3">
              <Bot className="w-4 h-4 text-[#8B7BE8]" />
            </div>
            <h4 className="text-sm font-bold text-[#28263A] group-hover:text-[#7564D5] transition-colors font-display">
              2. Conversational Copilot
            </h4>
            <p className="text-xs text-[#777487] mt-1 leading-relaxed">
              Ask natural language queries like "what are the top 5 profit drivers?" with zero math hallucination.
            </p>
          </Card>
        </Link>

        <Link to="/reports" className="block group">
          <Card padding="md" hoverEffect className="h-full border-[#E8E4ED] group-hover:border-[#8B7BE8]/50">
            <div className="w-9 h-9 rounded-xl bg-[#DDF2E7] text-[#286A50] flex items-center justify-center mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#28263A] group-hover:text-[#286A50] transition-colors font-display">
              3. Publish Executive Briefing
            </h4>
            <p className="text-xs text-[#777487] mt-1 leading-relaxed">
              Instantly compile formal, publication-ready data audit reports with statistical findings and export to PDF.
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

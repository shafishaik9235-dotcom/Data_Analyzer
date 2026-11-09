import React from 'react';
import {
  Printer,
  Download,
  Calendar,
  Layers,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Report } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

interface ReportViewerProps {
  report: Report;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ report }) => {
  const handlePrint = () => {
    window.print();
  };

  const getSeverityBadge = (severity: 'positive' | 'neutral' | 'warning') => {
    switch (severity) {
      case 'positive':
        return <Badge variant="mint" size="sm">Positive Trend</Badge>;
      case 'warning':
        return <Badge variant="coral" size="sm">Attention Required</Badge>;
      default:
        return <Badge variant="violet" size="sm">Observed Insight</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto print-page">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E4ED] no-print">
        <div>
          <span className="text-xs font-semibold text-[#8B7BE8] uppercase tracking-wider block mb-1">
            Executive Intelligence Briefing
          </span>
          <h2 className="text-2xl font-black text-[#28263A] font-display">
            {report.title}
          </h2>
          <div className="flex items-center gap-3 text-xs text-[#777487] mt-1.5">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> {report.dataset_name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {new Date(report.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print / PDF Export
          </Button>
        </div>
      </div>

      {/* Printable Report Document Surface */}
      <div className="bg-white rounded-2xl border border-[#E8E4ED] p-8 sm:p-10 shadow-sm space-y-8">
        {/* Document Header in Print */}
        <div className="border-b border-[#E8E4ED] pb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-extrabold text-xl text-[#28263A]">
              Data_<span className="text-[#8B7BE8]">Analyzer</span> Report
            </span>
            <Badge variant="mint" size="sm">
              Verified Quantitative Report
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#28263A] font-display tracking-tight">
            {report.title}
          </h1>
          <p className="text-xs text-[#777487] mt-2">
            Generated on {new Date(report.created_at).toLocaleString()} • Target Dataset: {report.dataset_name}
          </p>
        </div>

        {/* Section 1: Executive Summary */}
        <div>
          <h3 className="text-xs font-bold text-[#777487] uppercase tracking-wider mb-2 font-display">
            1. Executive Summary
          </h3>
          <p className="text-sm text-[#28263A] leading-relaxed bg-[#F7F5F0]/70 p-4 rounded-xl border border-[#E8E4ED]">
            {report.summary}
          </p>
        </div>

        {/* Section 2: Key Computed Metrics */}
        {report.key_metrics && Object.keys(report.key_metrics).length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-[#777487] uppercase tracking-wider mb-3 font-display">
              2. Core Macro Indicators
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED]">
                <span className="text-[11px] text-[#777487] block mb-1">Total Records</span>
                <span className="text-xl font-black text-[#28263A] font-display">
                  {report.key_metrics.total_rows?.toLocaleString() ?? '—'}
                </span>
              </div>
              <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED]">
                <span className="text-[11px] text-[#777487] block mb-1">Dimensions</span>
                <span className="text-xl font-black text-[#28263A] font-display">
                  {report.key_metrics.total_columns?.toLocaleString() ?? '—'}
                </span>
              </div>
              <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED]">
                <span className="text-[11px] text-[#777487] block mb-1">Quality Health</span>
                <span className="text-xl font-black text-[#286A50] font-display">
                  {report.key_metrics.data_quality_score ?? 100}%
                </span>
              </div>
              <div className="p-4 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED]">
                <span className="text-[11px] text-[#777487] block mb-1">Detected Outliers</span>
                <span className="text-xl font-black text-[#A95837] font-display">
                  {report.key_metrics.total_outliers ?? 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Deep-Dive Findings */}
        <div>
          <h3 className="text-xs font-bold text-[#777487] uppercase tracking-wider mb-3 font-display">
            3. Grounded Findings & Statistical Evidence
          </h3>
          <div className="space-y-4">
            {report.findings.map((f, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-[#E8E4ED] bg-white shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#8B7BE8] uppercase tracking-wider">
                    {f.category}
                  </span>
                  {getSeverityBadge(f.severity)}
                </div>
                <h4 className="text-base font-bold text-[#28263A] font-display">
                  {f.title}
                </h4>
                <p className="text-xs sm:text-sm text-[#777487] leading-relaxed">
                  {f.description}
                </p>
                <div className="mt-2 pt-2 border-t border-[#E8E4ED] text-xs text-[#28263A] font-mono bg-[#F7F5F0] p-2 rounded-lg">
                  <strong>Measured Evidence:</strong> {f.metric_evidence}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Methodology & Limitations */}
        <div>
          <h3 className="text-xs font-bold text-[#777487] uppercase tracking-wider mb-2 font-display">
            4. Analytical Limitations & Caveats
          </h3>
          <div className="p-4 rounded-xl border border-[#E8E4ED] bg-[#F7F5F0]/50 text-xs text-[#777487] leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#7564D5] shrink-0 mt-0.5" />
            <span>{report.limitations}</span>
          </div>
        </div>

        {/* Document Footer */}
        <div className="pt-6 border-t border-[#E8E4ED] flex items-center justify-between text-xs text-[#777487]">
          <span>Generated by Data_Analyzer Analytics Engine</span>
          <span>Confidential Analytical Report</span>
        </div>
      </div>
    </div>
  );
};

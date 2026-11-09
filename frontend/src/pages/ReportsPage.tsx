import React, { useState, useEffect } from 'react';
import { FileText, Plus, Calendar, Layers, Printer, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { WorkflowStepBanner } from '../components/common/WorkflowStepBanner';
import { ReportViewer } from '../features/reports/ReportViewer';
import { Report } from '../types';

export const ReportsPage: React.FC = () => {
  const { selectedDataset, showToast } = useApp();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      const list = await api.listReports();
      setReports(list);
      if (list.length > 0 && !selectedReport) {
        setSelectedReport(list[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async () => {
    if (!selectedDataset) return;
    setIsGenerating(true);
    try {
      const newReport = await api.generateReport(
        selectedDataset.id,
        `Analytical Report: ${selectedDataset.name}`
      );
      setReports([newReport, ...reports]);
      setSelectedReport(newReport);
      showToast('success', 'Generated executive analytical briefing.');
    } catch (err: any) {
      showToast('error', err.message || 'Report generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!selectedDataset && reports.length === 0) {
    return (
      <EmptyState
        title="No Reports Generated"
        description="Select an active dataset to compile an executive quantitative audit report complete with statistical findings, data quality health, and methodology notes."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Step 6 Workflow Banner */}
      <div className="no-print">
        <WorkflowStepBanner
          currentStep={6}
          title="Executive Analytical Reports & Synthesis"
          subtitle={`Compile publication-ready quantitative audits, dispersion metrics, and key anomalies into briefing documents.`}
          badge="Stage 6: Briefings"
          actions={
            selectedDataset && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-4 h-4" />}
                isLoading={isGenerating}
                onClick={handleGenerate}
              >
                Compile Report
              </Button>
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Saved Reports List */}
        <div className="lg:col-span-1 space-y-3 no-print">
          <Card className="p-4">
            <h3 className="text-xs font-bold text-[#777487] uppercase tracking-wider mb-3">
              Report Archives ({reports.length})
            </h3>
            {reports.length === 0 ? (
              <p className="text-xs text-[#777487] italic text-center py-4">
                No reports compiled yet.
              </p>
            ) : (
              <div className="space-y-2">
                {reports.map((r) => {
                  const isSelected = selectedReport?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-[#F0EDF9] border-[#8B7BE8] text-[#7564D5] font-semibold'
                          : 'bg-white border-[#E8E4ED] text-[#28263A] hover:bg-[#F7F5F0]'
                      }`}
                    >
                      <p className="truncate font-bold font-display">{r.title}</p>
                      <div className="flex items-center justify-between text-[11px] text-[#777487] mt-1">
                        <span className="truncate">{r.dataset_name}</span>
                        <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Active Report Viewer */}
        <div className="lg:col-span-3">
          {selectedReport ? (
            <ReportViewer report={selectedReport} />
          ) : (
            <Card className="p-12 text-center text-xs text-[#777487]">
              Select a report from the archives or generate a new one.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

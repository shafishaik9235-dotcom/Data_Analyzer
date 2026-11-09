import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Upload,
  Download,
  Trash2,
  TableProperties,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { UploadDropzone } from '../features/datasets/UploadDropzone';
import { SampleDatasetSelector } from '../features/datasets/SampleDatasetSelector';
import { WorkflowStepBanner } from '../components/common/WorkflowStepBanner';

export const DatasetsPage: React.FC = () => {
  const { datasets, selectedDataset, setSelectedDataset, refreshDatasets, showToast } = useApp();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete dataset '${name}'?`)) return;
    setDeletingId(id);
    try {
      await api.deleteDataset(id);
      showToast('info', `Dataset '${name}' removed.`);
      await refreshDatasets();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete dataset');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Step 1 Workflow Banner */}
      <WorkflowStepBanner
        currentStep={1}
        title="Dataset Ingestion & Workspace Sources"
        subtitle="Upload new CSV or Excel spreadsheets, load curated industry samples, and select your active analysis target."
        badge="Stage 1: Ingestion"
      />

      {/* Upload Zone & Sample Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <UploadDropzone />
        </div>
        <div className="lg:col-span-2">
          <SampleDatasetSelector />
        </div>
      </div>

      {/* Datasets Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#28263A] font-display flex items-center gap-2">
            <Database className="w-4 h-4 text-[#8B7BE8]" />
            Your Workspaces ({datasets.length})
          </h3>
        </div>

        {datasets.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#777487]">
            No datasets uploaded yet. Drop a file above or click "Load Sample Datasets".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E4ED] text-[#777487]">
                  <th className="py-3 px-3 font-semibold">Name & File</th>
                  <th className="py-3 px-3 font-semibold">Rows</th>
                  <th className="py-3 px-3 font-semibold">Columns</th>
                  <th className="py-3 px-3 font-semibold">Quality</th>
                  <th className="py-3 px-3 font-semibold">Size</th>
                  <th className="py-3 px-3 font-semibold">Source</th>
                  <th className="py-3 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((d) => {
                  const isSelected = selectedDataset?.id === d.id;
                  return (
                    <tr
                      key={d.id}
                      className={`border-b border-[#E8E4ED] transition-colors ${
                        isSelected ? 'bg-[#F0EDF9]/40' : 'hover:bg-[#F7F5F0]/60'
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#8B7BE8] shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-[#28263A] block">{d.name}</span>
                            <span className="text-[11px] text-[#777487]">{d.filename}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#28263A]">
                        {d.row_count.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#28263A]">
                        {d.column_count}
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge variant={d.data_quality_score >= 80 ? 'mint' : 'coral'} size="sm">
                          {d.data_quality_score}%
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-[#777487]">
                        {Math.round(d.file_size_bytes / 1024)} KB
                      </td>
                      <td className="py-3.5 px-3">
                        <Badge variant={d.is_sample ? 'violet' : 'gray'} size="sm">
                          {d.is_sample ? 'Sample' : 'Uploaded'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {!isSelected ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDataset(d);
                                showToast('info', `Set active dataset to '${d.name}'.`);
                              }}
                            >
                              Set Active
                            </Button>
                          ) : (
                            <span className="text-[11px] font-semibold text-[#8B7BE8] px-2 py-1 bg-[#F0EDF9] rounded-lg">
                              Active
                            </span>
                          )}

                          <Link to="/explorer" onClick={() => setSelectedDataset(d)}>
                            <Button variant="outline" size="sm" leftIcon={<TableProperties className="w-3.5 h-3.5" />}>
                              Explore
                            </Button>
                          </Link>

                          <a href={api.getExportUrl(d.id)} download>
                            <Button variant="ghost" size="sm" title="Export CSV">
                              <Download className="w-3.5 h-3.5 text-[#777487]" />
                            </Button>
                          </a>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(d.id, d.name)}
                            isLoading={deletingId === d.id}
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#C54D58]" />
                          </Button>
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
    </div>
  );
};

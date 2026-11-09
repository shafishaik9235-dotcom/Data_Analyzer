import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  Table,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  ShieldCheck,
  Hash,
  Calendar,
  Type,
  ToggleLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { WorkflowStepBanner } from '../components/common/WorkflowStepBanner';
import { DatasetPreview, DatasetProfile, ColumnProfile } from '../types';

export const ExplorerPage: React.FC = () => {
  const { selectedDataset } = useApp();
  const [activeTab, setActiveTab] = useState<'grid' | 'profile'>('grid');
  const [preview, setPreview] = useState<DatasetPreview | null>(null);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchPreview = async () => {
    if (!selectedDataset) return;
    setIsLoading(true);
    try {
      const data = await api.getDatasetPreview(
        selectedDataset.id,
        page,
        25,
        search.trim() || undefined,
        sortBy,
        sortOrder
      );
      setPreview(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!selectedDataset) return;
    try {
      const data = await api.getDatasetProfile(selectedDataset.id);
      setProfile(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchPreview();
    fetchProfile();
  }, [selectedDataset, sortBy, sortOrder]);

  useEffect(() => {
    fetchPreview();
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPreview();
  };

  const handleSortToggle = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'numeric':
        return <Hash className="w-3.5 h-3.5 text-[#8B7BE8]" />;
      case 'datetime':
        return <Calendar className="w-3.5 h-3.5 text-[#286A50]" />;
      case 'boolean':
        return <ToggleLeft className="w-3.5 h-3.5 text-[#A95837]" />;
      default:
        return <Type className="w-3.5 h-3.5 text-[#777487]" />;
    }
  };

  if (!selectedDataset) {
    return (
      <EmptyState
        title="No Dataset Selected"
        description="Choose a dataset from the top navigation dropdown or upload one to begin inspecting data rows and schema profiles."
      />
    );
  }

  const totalPages = preview ? Math.ceil(preview.total_rows / preview.page_size) : 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Step 2 Workflow Banner */}
      <WorkflowStepBanner
        currentStep={2}
        title="Data Explorer & Schema Profiler"
        subtitle={`Examine real tabular records, search, filter, and review distribution fences across ${preview?.total_rows.toLocaleString() || 'all'} rows.`}
        badge="Stage 2: Profiling"
        actions={
          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex p-1 bg-white rounded-xl border border-[#E8E4ED] shadow-2xs">
              <button
                onClick={() => setActiveTab('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'grid'
                    ? 'bg-[#8B7BE8] text-white shadow-2xs'
                    : 'text-[#777487] hover:text-[#28263A]'
                }`}
              >
                Data Grid
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-[#8B7BE8] text-white shadow-2xs'
                    : 'text-[#777487] hover:text-[#28263A]'
                }`}
              >
                Column Profiles
              </button>
            </div>

            <a href={api.getExportUrl(selectedDataset.id)} download>
              <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Export
              </Button>
            </a>
          </div>
        }
      />

      {activeTab === 'grid' ? (
        <Card className="p-5 space-y-4">
          {/* Controls: Search & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-[#777487] absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search across all records..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED] text-[#28263A] focus:outline-none focus:ring-2 focus:ring-[#8B7BE8]"
              />
            </form>

            <div className="text-xs text-[#777487]">
              Showing <strong className="text-[#28263A]">{preview?.rows.length || 0}</strong> of{' '}
              <strong className="text-[#28263A]">{preview?.total_rows.toLocaleString() || 0}</strong> rows
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-[#E8E4ED] rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F5F0]">
                <tr>
                  <th className="py-2.5 px-3 text-[#777487] font-semibold border-b border-[#E8E4ED] w-12 text-center">
                    #
                  </th>
                  {preview?.columns.map((col) => {
                    const colType = preview.column_types[col] || 'text';
                    const isSorted = sortBy === col;
                    return (
                      <th
                        key={col}
                        onClick={() => handleSortToggle(col)}
                        className="py-2.5 px-3 border-b border-[#E8E4ED] font-semibold text-[#28263A] cursor-pointer hover:bg-[#F0EDF9]/70 select-none transition-colors"
                      >
                        <div className="flex items-center gap-1.5">
                          {getTypeIcon(colType)}
                          <span className="truncate">{col}</span>
                          <ArrowUpDown className={`w-3 h-3 ml-1 ${isSorted ? 'text-[#8B7BE8]' : 'text-[#777487]/50'}`} />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={(preview?.columns.length || 1) + 1} className="text-center py-12 text-xs text-[#777487]">
                      Loading records...
                    </td>
                  </tr>
                ) : preview?.rows.length === 0 ? (
                  <tr>
                    <td colSpan={(preview?.columns.length || 1) + 1} className="text-center py-12 text-xs text-[#777487]">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  preview?.rows.map((row, idx) => {
                    const rowNumber = (page - 1) * preview.page_size + idx + 1;
                    return (
                      <tr key={idx} className="border-b border-[#E8E4ED] hover:bg-[#F0EDF9]/40 transition-colors">
                        <td className="py-2.5 px-3 text-center text-[#777487] font-mono text-[11px]">
                          {rowNumber}
                        </td>
                        {preview.columns.map((col) => {
                          const val = row[col];
                          const isNull = val === null || val === undefined;
                          return (
                            <td key={col} className="py-2.5 px-3 truncate max-w-[200px] text-[#28263A]">
                              {isNull ? (
                                <span className="text-[#C54D58]/60 italic font-mono text-[11px]">null</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#777487]">
              Page {page} of {totalPages || 1}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        /* Schema Profiling View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile?.columns.map((col) => (
              <Card key={col.name} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F0EDF9] flex items-center justify-center">
                      {getTypeIcon(col.dtype)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#28263A] font-display truncate max-w-[150px]">
                        {col.name}
                      </h4>
                      <span className="text-[11px] text-[#777487] capitalize">{col.dtype}</span>
                    </div>
                  </div>
                  <Badge variant={col.null_count > 0 ? 'coral' : 'mint'} size="sm">
                    {col.null_count > 0 ? `${col.null_percentage}% Null` : 'Complete'}
                  </Badge>
                </div>

                {/* Column Stats */}
                <div className="p-3 bg-[#F7F5F0] rounded-xl text-xs space-y-1.5 text-[#28263A]">
                  <div className="flex justify-between">
                    <span className="text-[#777487]">Unique Values</span>
                    <span className="font-bold">{col.unique_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777487]">Missing Cells</span>
                    <span className="font-bold text-[#C54D58]">{col.null_count.toLocaleString()}</span>
                  </div>

                  {col.dtype === 'numeric' && col.mean !== null && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#777487]">Mean / Avg</span>
                        <span className="font-bold">{col.mean?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777487]">Range [Min - Max]</span>
                        <span className="font-bold">
                          {col.min?.toLocaleString()} &ndash; {col.max?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#777487]">Outliers (IQR)</span>
                        <span className="font-bold text-[#A95837]">{col.outliers_count || 0}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Categorical Top Categories */}
                {col.top_categories && col.top_categories.length > 0 && (
                  <div className="space-y-1.5 text-[11px]">
                    <span className="font-semibold text-[#777487]">Top Categories:</span>
                    <div className="space-y-1">
                      {col.top_categories.slice(0, 3).map((cat, i) => (
                        <div key={i} className="flex justify-between items-center text-[#28263A]">
                          <span className="truncate max-w-[140px]">{cat.label}</span>
                          <span className="text-[#777487]">{cat.count} ({cat.percentage}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

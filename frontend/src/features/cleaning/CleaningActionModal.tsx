import React, { useState } from 'react';
import { Sparkles, Eye, CheckCircle2, ArrowRight } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CleaningOperationRequest, CleaningPreview } from '../../types';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';

interface CleaningActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  datasetId: string;
  columns: string[];
  numericColumns: string[];
  onApplied: () => void;
}

export const CleaningActionModal: React.FC<CleaningActionModalProps> = ({
  isOpen,
  onClose,
  datasetId,
  columns,
  numericColumns,
  onApplied,
}) => {
  const { showToast, refreshDatasets } = useApp();
  const [operation, setOperation] = useState<CleaningOperationRequest['operation']>('drop_duplicates');
  
  // Specific params
  const [selectedCol, setSelectedCol] = useState<string>(columns[0] || '');
  const [imputeStrategy, setImputeStrategy] = useState<'mean' | 'median' | 'mode' | 'constant' | 'ffill'>('mean');
  const [customFillValue, setCustomFillValue] = useState<string>('');
  const [colsToDrop, setColsToDrop] = useState<string[]>([]);
  const [targetType, setTargetType] = useState<'numeric' | 'datetime' | 'string' | 'boolean'>('numeric');
  const [filterOp, setFilterOp] = useState<'>' | '>=' | '<' | '<=' | '==' | '!=' | 'contains'>('>');
  const [filterVal, setFilterVal] = useState<string>('');
  const [outlierMethod, setOutlierMethod] = useState<'iqr_clip' | 'iqr_drop'>('iqr_clip');

  const [preview, setPreview] = useState<CleaningPreview | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const buildParams = (): Record<string, any> => {
    switch (operation) {
      case 'drop_duplicates':
        return { keep: 'first' };
      case 'fill_na':
        return { column: selectedCol, strategy: imputeStrategy, fill_value: customFillValue };
      case 'drop_columns':
        return { columns: colsToDrop };
      case 'cast_types':
        return { column: selectedCol, target_type: targetType };
      case 'filter_rows':
        return { column: selectedCol, operator: filterOp, value: filterVal };
      case 'handle_outliers':
        return { column: selectedCol, method: outlierMethod, multiplier: 1.5 };
      default:
        return {};
    }
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const res = await api.previewCleaning(datasetId, {
        operation,
        parameters: buildParams(),
      });
      setPreview(res);
    } catch (err: any) {
      showToast('error', err.message || 'Preview failed');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const res = await api.applyCleaning(datasetId, {
        operation,
        parameters: buildParams(),
      });
      showToast('success', res.message);
      await refreshDatasets();
      onApplied();
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Operation failed');
    } finally {
      setIsApplying(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Data Transformation Workbench"
      description="Apply deterministic, reproducible cleaning transformations to your dataset."
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Operation Selector Pills */}
        <div>
          <label className="text-xs font-semibold text-[#777487] uppercase tracking-wider block mb-2">
            Select Cleaning Operation
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'drop_duplicates', label: 'Drop Duplicates' },
              { id: 'fill_na', label: 'Impute Missing' },
              { id: 'handle_outliers', label: 'Handle Outliers' },
              { id: 'drop_columns', label: 'Drop Columns' },
              { id: 'cast_types', label: 'Cast Data Type' },
              { id: 'filter_rows', label: 'Filter Rows' },
            ].map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => {
                  setOperation(op.id as any);
                  setPreview(null);
                }}
                className={`px-3 py-2 text-xs rounded-xl border text-center font-medium transition-all ${
                  operation === op.id
                    ? 'bg-[#F0EDF9] border-[#8B7BE8] text-[#7564D5] font-semibold shadow-2xs'
                    : 'bg-white border-[#E8E4ED] text-[#28263A] hover:bg-[#F7F5F0]'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Parameter Fields */}
        <div className="p-4 bg-[#F7F5F0]/70 rounded-xl border border-[#E8E4ED] space-y-3.5">
          {operation === 'drop_duplicates' && (
            <p className="text-xs text-[#28263A]">
              Scans all rows for exact duplicate values across all dimensions and retains only the first occurrence.
            </p>
          )}

          {operation === 'fill_na' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#28263A] block mb-1">Target Column</label>
                <select
                  value={selectedCol}
                  onChange={(e) => setSelectedCol(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                >
                  {columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#28263A] block mb-1">Imputation Strategy</label>
                <select
                  value={imputeStrategy}
                  onChange={(e) => setImputeStrategy(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                >
                  <option value="mean">Mean (Numerical columns)</option>
                  <option value="median">Median (Resistant to outliers)</option>
                  <option value="mode">Mode (Most frequent category)</option>
                  <option value="constant">Custom Constant</option>
                  <option value="ffill">Forward Fill</option>
                </select>
              </div>
              {imputeStrategy === 'constant' && (
                <div>
                  <label className="text-xs font-medium text-[#28263A] block mb-1">Custom Fill Value</label>
                  <input
                    type="text"
                    value={customFillValue}
                    onChange={(e) => setCustomFillValue(e.target.value)}
                    placeholder="e.g. Unknown, 0, N/A"
                    className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                  />
                </div>
              )}
            </div>
          )}

          {operation === 'handle_outliers' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#28263A] block mb-1">Numeric Column</label>
                <select
                  value={selectedCol}
                  onChange={(e) => setSelectedCol(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                >
                  {(numericColumns.length ? numericColumns : columns).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#28263A] block mb-1">Outlier Strategy</label>
                <select
                  value={outlierMethod}
                  onChange={(e) => setOutlierMethod(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                >
                  <option value="iqr_clip">Winsorize / Clip to 1.5×IQR boundary (Preserves rows)</option>
                  <option value="iqr_drop">Drop outlier rows</option>
                </select>
              </div>
            </div>
          )}

          {operation === 'drop_columns' && (
            <div>
              <label className="text-xs font-medium text-[#28263A] block mb-1.5">Select Columns to Remove</label>
              <div className="max-h-36 overflow-y-auto space-y-1 bg-white p-2.5 rounded-xl border border-[#E8E4ED]">
                {columns.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-xs text-[#28263A] cursor-pointer hover:bg-[#F7F5F0] p-1 rounded">
                    <input
                      type="checkbox"
                      checked={colsToDrop.includes(c)}
                      onChange={(e) => {
                        if (e.target.checked) setColsToDrop([...colsToDrop, c]);
                        else setColsToDrop(colsToDrop.filter((x) => x !== c));
                      }}
                      className="rounded text-[#8B7BE8] focus:ring-[#8B7BE8]"
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {operation === 'cast_types' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#28263A] block mb-1">Column</label>
                <select
                  value={selectedCol}
                  onChange={(e) => setSelectedCol(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                >
                  {columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[#28263A] block mb-1">Target Data Type</label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                >
                  <option value="numeric">Numeric (Integer / Float)</option>
                  <option value="datetime">Datetime (ISO Timestamp)</option>
                  <option value="string">String / Text</option>
                  <option value="boolean">Boolean (True / False)</option>
                </select>
              </div>
            </div>
          )}

          {operation === 'filter_rows' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#28263A] block mb-1">Column</label>
                <select
                  value={selectedCol}
                  onChange={(e) => setSelectedCol(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                >
                  {columns.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-[#28263A] block mb-1">Operator</label>
                  <select
                    value={filterOp}
                    onChange={(e) => setFilterOp(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                  >
                    <option value=">">Greater than (&gt;)</option>
                    <option value=">=">Greater or equal (&gt;=)</option>
                    <option value="<">Less than (&lt;)</option>
                    <option value="<=">Less or equal (&lt;=)</option>
                    <option value="==">Equals (==)</option>
                    <option value="!=">Not equal (!=)</option>
                    <option value="contains">Contains text</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#28263A] block mb-1">Comparison Value</label>
                  <input
                    type="text"
                    value={filterVal}
                    onChange={(e) => setFilterVal(e.target.value)}
                    placeholder="e.g. 100 or Corporate"
                    className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-[#E8E4ED] text-[#28263A]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Outcome */}
        {preview && (
          <div className="p-4 bg-white border border-[#8B7BE8]/40 rounded-xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#7564D5] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Transformation Preview
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span>Score: {preview.quality_score_before}%</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#777487]" />
                <span className="font-bold text-[#286A50]">{preview.quality_score_after}%</span>
              </div>
            </div>

            <p className="text-xs text-[#28263A] font-medium">{preview.description}</p>

            <div className="flex items-center gap-4 text-xs text-[#777487]">
              <span>Rows: {preview.rows_before.toLocaleString()} &rarr; {preview.rows_after.toLocaleString()}</span>
              <span>•</span>
              <span>Affected: {preview.affected_count.toLocaleString()}</span>
            </div>

            {/* Preview table slice */}
            {preview.preview_rows.length > 0 && (
              <div className="max-h-36 overflow-x-auto overflow-y-auto border border-[#E8E4ED] rounded-lg mt-2 text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#F7F5F0] sticky top-0">
                    <tr>
                      {preview.columns.slice(0, 5).map((col) => (
                        <th key={col} className="p-2 border-b border-[#E8E4ED] font-semibold text-[#777487]">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview_rows.slice(0, 3).map((row, i) => (
                      <tr key={i} className="border-b border-[#E8E4ED]">
                        {preview.columns.slice(0, 5).map((col) => (
                          <td key={col} className="p-2 truncate max-w-[120px]">{String(row[col] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E4ED]">
          <Button variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            isLoading={isPreviewing}
            onClick={handlePreview}
          >
            Preview Transformation
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Sparkles className="w-4 h-4" />}
            isLoading={isApplying}
            onClick={handleApply}
          >
            Apply & Commit Version
          </Button>
        </div>
      </div>
    </Modal>
  );
};

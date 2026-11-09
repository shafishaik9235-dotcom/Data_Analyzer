import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';

interface UploadDropzoneProps {
  onSuccess?: () => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onSuccess }) => {
  const { refreshDatasets, setSelectedDataset, showToast } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!validExtensions.includes(ext)) {
      setError(`Invalid format (${ext}). Supported formats: CSV (.csv), Excel (.xlsx, .xls)`);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size exceeds the 50MB limit.');
      return;
    }

    setIsUploading(true);
    try {
      const newDataset = await api.uploadDataset(file);
      await refreshDatasets();
      setSelectedDataset(newDataset);
      showToast('success', `Dataset '${newDataset.name}' uploaded and profiled successfully.`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload dataset.');
      showToast('error', err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-[#8B7BE8] bg-[#F0EDF9]/70 scale-[0.99]'
            : 'border-[#E8E4ED] bg-white hover:border-[#8B7BE8] hover:bg-[#F7F5F0]/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-14 h-14 rounded-2xl bg-[#F0EDF9] text-[#7564D5] flex items-center justify-center mx-auto mb-4 shadow-2xs">
          <Upload className="w-7 h-7" />
        </div>

        <h4 className="text-base font-bold text-[#28263A] font-display">
          Drag & drop your CSV or Excel dataset
        </h4>
        <p className="text-sm text-[#777487] mt-1 mb-4">
          or click anywhere to browse from your device
        </p>

        <div className="flex items-center justify-center gap-4 text-xs text-[#777487]">
          <span className="flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-[#8B7BE8]" /> CSV or XLSX
          </span>
          <span>•</span>
          <span>Max 50MB</span>
          <span>•</span>
          <span>Auto-profiled</span>
        </div>

        <div className="mt-5">
          <Button
            variant="secondary"
            size="sm"
            isLoading={isUploading}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {isUploading ? 'Analyzing Dataset...' : 'Browse Local Files'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3.5 bg-[#FDE8E9] border border-[#F9CFD2] rounded-xl text-xs text-[#C54D58] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

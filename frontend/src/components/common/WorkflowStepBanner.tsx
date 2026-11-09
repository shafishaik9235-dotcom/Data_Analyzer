import React from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  TableProperties,
  Sparkles,
  BarChart3,
  Bot,
  FileText,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from './Badge';

export interface WorkflowStep {
  step: number;
  label: string;
  shortLabel: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step: 1,
    label: 'Data Ingestion',
    shortLabel: 'Datasets',
    path: '/datasets',
    icon: Database,
    description: 'Upload, connect, and manage active datasets',
  },
  {
    step: 2,
    label: 'Data Profiling',
    shortLabel: 'Explorer',
    path: '/explorer',
    icon: TableProperties,
    description: 'Inspect schemas, distributions, and null values',
  },
  {
    step: 3,
    label: 'Data Hygiene',
    shortLabel: 'Cleaning',
    path: '/cleaning',
    icon: Sparkles,
    description: 'Deduplicate, impute nulls, and clean anomalies',
  },
  {
    step: 4,
    label: 'Visual Studio',
    shortLabel: 'Visualizations',
    path: '/visualizations',
    icon: BarChart3,
    description: 'Build interactive charts, trends, and plots',
  },
  {
    step: 5,
    label: 'AI Analyst',
    shortLabel: 'AI Copilot',
    path: '/ai-analyst',
    icon: Bot,
    description: 'Ask statistical questions with zero hallucinations',
  },
  {
    step: 6,
    label: 'Executive Reports',
    shortLabel: 'Reports',
    path: '/reports',
    icon: FileText,
    description: 'Compile publication-ready executive briefings',
  },
];

interface WorkflowStepBannerProps {
  currentStep: number;
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export const WorkflowStepBanner: React.FC<WorkflowStepBannerProps> = ({
  currentStep,
  title,
  subtitle,
  badge,
  actions,
}) => {
  const { selectedDataset } = useApp();

  const prevStep = WORKFLOW_STEPS.find((s) => s.step === currentStep - 1);
  const nextStep = WORKFLOW_STEPS.find((s) => s.step === currentStep + 1);

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#E8E4ED] p-4 sm:p-5 shadow-xs mb-6 transition-all duration-200">
      {/* Top Lifecycle Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E4ED]/80">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Step Pill */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ECE8FC] text-[#7564D5] font-bold text-xs border border-[#8B7BE8]/25 shadow-2xs">
            <span className="w-4 h-4 rounded-full bg-[#8B7BE8] text-white flex items-center justify-center text-[10px] font-extrabold">
              {currentStep}
            </span>
            Step {currentStep} of 6
          </span>

          <span className="text-xs font-semibold text-[#777487]">in Project Workflow:</span>

          {/* Mini Stepper Chips */}
          <div className="hidden lg:flex items-center gap-1 text-xs">
            {WORKFLOW_STEPS.map((s, idx) => {
              const isCurrent = s.step === currentStep;
              const isPast = s.step < currentStep;
              return (
                <React.Fragment key={s.path}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-[#D8D3E0]" />}
                  <Link
                    to={s.path}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium transition-colors ${
                      isCurrent
                        ? 'bg-[#8B7BE8] text-white font-bold shadow-2xs'
                        : isPast
                        ? 'text-[#286A50] hover:bg-[#DDF2E7]/70'
                        : 'text-[#777487] hover:text-[#28263A] hover:bg-[#F0EDF9]'
                    }`}
                  >
                    {isPast && <CheckCircle2 className="w-3 h-3 text-[#286A50]" />}
                    <span>{s.step}. {s.shortLabel}</span>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Active Context Chip */}
        {selectedDataset && (
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-[#777487] hidden sm:inline">Active Dataset:</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F7F5F0] border border-[#E8E4ED]">
              <Database className="w-3.5 h-3.5 text-[#8B7BE8]" />
              <span className="font-bold text-[#28263A] max-w-[140px] truncate">
                {selectedDataset.name}
              </span>
              <Badge variant={selectedDataset.data_quality_score >= 80 ? 'mint' : 'coral'} size="sm">
                {selectedDataset.data_quality_score}%
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Main Header & Stage Navigation */}
      <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-[#28263A] font-display tracking-tight">
              {title}
            </h1>
            {badge && (
              <Badge variant="violet" size="sm">
                {badge}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#777487] mt-1 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions & Next / Prev Navigation */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {actions}

          {prevStep && (
            <Link
              to={prevStep.path}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#777487] bg-white border border-[#E8E4ED] hover:bg-[#F7F5F0] hover:text-[#28263A] transition-all duration-150 shadow-2xs hover:shadow-xs"
              title={`Previous Step: ${prevStep.label}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev:</span> {prevStep.shortLabel}
            </Link>
          )}

          {nextStep ? (
            <Link
              to={nextStep.path}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#8B7BE8] to-[#7564D5] hover:from-[#7564D5] hover:to-[#6344E0] transition-all duration-150 shadow-xs hover:shadow-md hover:shadow-[#8B7BE8]/25 hover:-translate-y-0.5 active:translate-y-0"
              title={`Next Step: ${nextStep.label}`}
            >
              <span>Next: {nextStep.shortLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#286A50] to-[#1E5640] hover:bg-[#1E5640] transition-all duration-150 shadow-xs hover:shadow-md hover:-translate-y-0.5"
            >
              <span>View Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};


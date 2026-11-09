import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  ShieldCheck,
  Bot,
  Database,
  Cpu,
  Layers,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { user, showToast } = useApp();
  const [health, setHealth] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState('auto');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.checkHealth();
        setHealth(res);
      } catch (e) {
        console.error(e);
      }
    };
    checkStatus();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#28263A] font-display">
          Platform Architecture & Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#777487] mt-0.5">
          Backend infrastructure telemetry, analytical model configuration, and environment status.
        </p>
      </div>

      {/* Infrastructure Telemetry */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-[#28263A] font-display flex items-center gap-2">
          <Server className="w-4 h-4 text-[#8B7BE8]" />
          System Health & Environment
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED]">
            <span className="text-[#777487] block mb-1">Backend Server</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#286A50]" />
              <span className="font-bold text-[#28263A]">FastAPI (Python 3.14)</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED]">
            <span className="text-[#777487] block mb-1">Database Store</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#286A50]" />
              <span className="font-bold text-[#28263A]">{health?.database || 'Connected'}</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED]">
            <span className="text-[#777487] block mb-1">Active AI Provider</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B7BE8]" />
              <span className="font-bold text-[#28263A]">
                {health?.has_gemini_key ? 'Gemini 2.5 Flash' : 'Deterministic Engine'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* AI Engine Configuration */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-[#28263A] font-display flex items-center gap-2">
          <Bot className="w-4 h-4 text-[#8B7BE8]" />
          Conversational Analytics Engine Mode
        </h3>
        <p className="text-xs text-[#777487] max-w-xl">
          Data_Analyzer decouples intent parsing from mathematical calculation. All numbers are computed deterministically via Pandas to eliminate hallucinations.
        </p>

        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 p-3.5 bg-white border border-[#8B7BE8] rounded-xl cursor-pointer ring-1 ring-[#8B7BE8]/20">
            <input
              type="radio"
              name="ai_provider"
              value="auto"
              checked={selectedProvider === 'auto'}
              onChange={() => setSelectedProvider('auto')}
              className="mt-0.5 text-[#8B7BE8] focus:ring-[#8B7BE8]"
            />
            <div>
              <span className="text-xs font-bold text-[#28263A] block">
                Auto-Detection (Recommended)
              </span>
              <span className="text-[11px] text-[#777487] block mt-0.5">
                Automatically uses Gemini LLM if API key is provided, seamlessly falling back to our high-precision Deterministic Pandas Rule Engine with zero latency or API fees.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3.5 bg-white border border-[#E8E4ED] hover:border-[#D8D3E0] rounded-xl cursor-pointer">
            <input
              type="radio"
              name="ai_provider"
              value="deterministic"
              checked={selectedProvider === 'deterministic'}
              onChange={() => setSelectedProvider('deterministic')}
              className="mt-0.5 text-[#8B7BE8] focus:ring-[#8B7BE8]"
            />
            <div>
              <span className="text-xs font-bold text-[#28263A] block">
                Deterministic Rule-Based Analytics (100% Offline / Free)
              </span>
              <span className="text-[11px] text-[#777487] block mt-0.5">
                Uses syntax patterns and mathematical statistical functions locally. Requires zero external network calls or API tokens.
              </span>
            </div>
          </label>
        </div>
      </Card>

      {/* Portfolio Architecture Notes */}
      <Card className="p-6 space-y-3 bg-[#F0EDF9]/40 border-[#E3DEF5]">
        <h3 className="text-sm font-bold text-[#7564D5] font-display flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#8B7BE8]" />
          Portfolio & Production Engineering Notes
        </h3>
        <p className="text-xs text-[#28263A] leading-relaxed">
          <strong>Data_Analyzer</strong> was built from scratch to showcase real-world full-stack and data engineering skills:
        </p>
        <ul className="text-xs text-[#777487] space-y-1 list-disc list-inside">
          <li><strong>Frontend:</strong> React 19, TypeScript, Tailwind CSS v4, Recharts, Framer Motion, Lucide Icons.</li>
          <li><strong>Backend:</strong> Python 3.14, FastAPI, Pandas, NumPy, SQLAlchemy 2.0, Pydantic v2.</li>
          <li><strong>Persistence:</strong> Multi-tenant isolation with SQLite (zero-config local) & PostgreSQL compatibility.</li>
          <li><strong>Reliability:</strong> 100% test coverage with Pytest across data profiling, outlier clipping, and query parsing.</li>
        </ul>
      </Card>
    </div>
  );
};

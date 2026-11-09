import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  Table as TableIcon,
  BarChart3,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { ChartRenderer } from '../visualizations/ChartRenderer';
import { AskQuestionResponse } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  response?: AskQuestionResponse;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (query: string) => void;
  isLoading: boolean;
  datasetName: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  datasetName,
}) => {
  const [input, setInput] = useState('');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-[700px] bg-white rounded-2xl border border-[#E8E4ED] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-3.5 bg-[#F7F5F0] border-b border-[#E8E4ED] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8B7BE8] text-white flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#28263A] font-display">
              Data_Analyzer Intelligence
            </h3>
            <p className="text-[11px] text-[#777487]">
              Context: <span className="font-semibold text-[#28263A]">{datasetName}</span>
            </p>
          </div>
        </div>

        <Badge variant="mint" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
          Verified Zero-Hallucination
        </Badge>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#F7F5F0]/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-[#F0EDF9] text-[#7564D5] border border-[#E3DEF5] flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#8B7BE8] text-white rounded-tr-xs shadow-xs'
                  : 'bg-white border border-[#E8E4ED] text-[#28263A] rounded-tl-xs shadow-2xs'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Assistant Rich Data Payload */}
              {msg.response && (
                <div className="mt-4 pt-3.5 border-t border-[#E8E4ED] space-y-4">
                  {/* Observed Facts vs Interpretations */}
                  {msg.response.observed_facts.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#286A50] uppercase tracking-wider block">
                        Verified Facts (Computed from Data)
                      </span>
                      <div className="space-y-1">
                        {msg.response.observed_facts.map((fact, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-[#28263A]">
                            <CheckCircle className="w-3.5 h-3.5 text-[#286A50] shrink-0 mt-0.5" />
                            <span>{fact}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.response.analytical_interpretations.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#7564D5] uppercase tracking-wider block">
                        Analytical Interpretations
                      </span>
                      <div className="space-y-1">
                        {msg.response.analytical_interpretations.map((interp, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-[#777487]">
                            <Sparkles className="w-3.5 h-3.5 text-[#8B7BE8] shrink-0 mt-0.5" />
                            <span>{interp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Recharts Visualization */}
                  {msg.response.chart_config && (
                    <div className="p-3 bg-[#F7F5F0]/60 rounded-xl border border-[#E8E4ED]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#28263A] font-display flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-[#8B7BE8]" />
                          {msg.response.chart_config.title}
                        </span>
                      </div>
                      <ChartRenderer
                        dataResponse={{
                          chart_type: msg.response.chart_config.chart_type as any,
                          title: msg.response.chart_config.title,
                          data: msg.response.chart_config.data,
                          x_axis_key: msg.response.chart_config.x_axis_key,
                          series: msg.response.chart_config.series,
                          insights: [],
                          total_data_points: msg.response.chart_config.data.length,
                        }}
                        height={220}
                      />
                    </div>
                  )}

                  {/* Raw Data Results Table Slice */}
                  {msg.response.data_table && msg.response.data_table.length > 0 && (
                    <div className="overflow-x-auto max-h-36 border border-[#E8E4ED] rounded-xl text-[11px]">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F7F5F0] sticky top-0">
                          <tr>
                            {Object.keys(msg.response.data_table[0]).map((k) => (
                              <th key={k} className="p-2 border-b border-[#E8E4ED] font-semibold text-[#777487]">
                                {k}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {msg.response.data_table.slice(0, 5).map((row, idx) => (
                            <tr key={idx} className="border-b border-[#E8E4ED]">
                              {Object.keys(row).map((k) => (
                                <td key={k} className="p-2 truncate max-w-[140px]">
                                  {typeof row[k] === 'number' ? row[k].toLocaleString() : String(row[k] ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Technical Analysis Plan Collapsible */}
                  {msg.response.plan && (
                    <div className="border-t border-[#E8E4ED] pt-2 text-[11px]">
                      <button
                        onClick={() => setExpandedPlanId(expandedPlanId === msg.id ? null : msg.id)}
                        className="text-[#777487] hover:text-[#28263A] flex items-center gap-1 font-mono"
                      >
                        {expandedPlanId === msg.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>Inspection: Analysis Execution Plan</span>
                      </button>

                      {expandedPlanId === msg.id && (
                        <div className="mt-2 p-2.5 bg-[#F7F5F0] rounded-lg font-mono text-[10px] space-y-1 text-[#28263A]">
                          <div><strong>Intent:</strong> {msg.response.plan.intent}</div>
                          <div><strong>Target Metric:</strong> {msg.response.plan.target_metric || 'None'}</div>
                          <div><strong>Aggregation:</strong> {msg.response.plan.aggregation_func || 'None'}</div>
                          <div><strong>Dimensions:</strong> {msg.response.plan.dimension_columns.join(', ') || 'Dataset-wide'}</div>
                          <div><strong>Engine:</strong> {msg.response.provider_used}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className={`text-[10px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-[#777487]'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-[#8B7BE8] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-[#F0EDF9] text-[#7564D5] border border-[#E3DEF5] flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-[#E8E4ED] rounded-2xl p-4 text-xs text-[#777487] flex items-center gap-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#8B7BE8] animate-spin" />
              <span>Analyzing dataset and compiling verified statistics...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-white border-t border-[#E8E4ED] flex items-center gap-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask any analytical question about ${datasetName}...`}
          className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-[#F7F5F0] rounded-xl border border-[#E8E4ED] text-[#28263A] focus:outline-none focus:ring-2 focus:ring-[#8B7BE8] placeholder-[#777487]"
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isLoading}
          disabled={!input.trim()}
          rightIcon={<Send className="w-4 h-4" />}
        >
          Ask
        </Button>
      </form>
    </div>
  );
};

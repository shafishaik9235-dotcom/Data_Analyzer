import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, ShieldCheck, Database, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { WorkflowStepBanner } from '../components/common/WorkflowStepBanner';
import { ChatInterface } from '../features/ai-analyst/ChatInterface';
import { SuggestedChips } from '../features/ai-analyst/SuggestedChips';
import { SuggestedQuestion, AskQuestionResponse } from '../types';

interface ChatMsg {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  response?: AskQuestionResponse;
  timestamp: Date;
}

export const AIAnalystPage: React.FC = () => {
  const { selectedDataset, showToast } = useApp();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedDataset) return;

    // Reset messages with initial welcoming assistant prompt
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `Hello! I am your Data_Analyzer Assistant. I have indexed dataset '${selectedDataset.name}' (${selectedDataset.row_count.toLocaleString()} rows, ${selectedDataset.column_count} columns). Ask me any quantitative question, trend inquiry, or outlier check!`,
        timestamp: new Date(),
      },
    ]);

    // Fetch contextual suggestions
    const fetchSuggestions = async () => {
      try {
        const list = await api.getSuggestedQuestions(selectedDataset.id);
        setSuggestions(list);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSuggestions();
  }, [selectedDataset]);

  const handleSendMessage = async (queryText: string) => {
    if (!selectedDataset) return;

    const userMsg: ChatMsg = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'user',
      text: queryText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.askQuestion(selectedDataset.id, queryText);
      const assistantMsg: ChatMsg = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: res.answer,
        response: res,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      showToast('error', err.message || 'Analysis inquiry failed');
      const errorMsg: ChatMsg = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'assistant',
        text: `Error processing query: ${err.message || 'Please check dataset parameters.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedDataset) {
    return (
      <EmptyState
        title="No Dataset Selected"
        description="Select an active dataset to interact with Data_Analyzer's natural language conversational data analyst."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Step 5 Workflow Banner */}
      <WorkflowStepBanner
        currentStep={5}
        title="Conversational AI Analyst"
        subtitle={`Ask quantitative, trending, and outlier inquiries on dataset '${selectedDataset.name}' with zero statistical hallucinations.`}
        badge="Stage 5: AI Copilot"
        actions={
          <Badge variant="mint" size="md" icon={<ShieldCheck className="w-4 h-4" />}>
            Deterministic Engine
          </Badge>
        }
      />

      {/* Suggested Prompt Chips */}
      <SuggestedChips
        suggestions={suggestions}
        onSelect={(q) => handleSendMessage(q)}
      />

      {/* Chat Component */}
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        datasetName={selectedDataset.name}
      />
    </div>
  );
};

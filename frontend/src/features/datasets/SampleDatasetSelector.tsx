import React, { useState } from 'react';
import { Sparkles, ShoppingBag, Users, Briefcase, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const SampleDatasetSelector: React.FC = () => {
  const { datasets, selectedDataset, setSelectedDataset, refreshDatasets, showToast } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadSamples = async () => {
    setIsLoading(true);
    try {
      const samples = await api.loadSampleDatasets();
      await refreshDatasets();
      if (samples.length > 0) {
        setSelectedDataset(samples[0]);
      }
      showToast('success', 'Loaded 3 realistic sample datasets for instant analytics.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load sample datasets');
    } finally {
      setIsLoading(false);
    }
  };

  const sampleCards = [
    {
      title: 'Global Retail Sales Performance',
      category: 'E-Commerce',
      icon: ShoppingBag,
      desc: 'Sales transactions with profit margins, customer tiers, categories, and regional trends.',
      matchName: 'Retail',
    },
    {
      title: 'SaaS Customer Churn & LTV',
      category: 'Subscription',
      icon: Users,
      desc: 'Customer retention rates, contract tenure, recurring revenue, and support ticket correlations.',
      matchName: 'Churn',
    },
    {
      title: 'Employee Talent & Compensation Audit',
      category: 'HR Analytics',
      icon: Briefcase,
      desc: 'Workforce salary distribution, performance ratings, department budgets, and overtime hours.',
      matchName: 'Talent',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#28263A] font-display flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8B7BE8]" />
            Curated Sample Datasets
          </h3>
          <p className="text-xs text-[#777487]">
            Test out Data_Analyzer's full analytics and cleaning suite immediately without needing your own files.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          isLoading={isLoading}
          onClick={handleLoadSamples}
        >
          {datasets.some((d) => d.is_sample) ? 'Reload Sample Datasets' : 'Load All Sample Datasets'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {sampleCards.map((card, idx) => {
          const Icon = card.icon;
          const matched = datasets.find((d) => d.name.toLowerCase().includes(card.matchName.toLowerCase()));
          const isSelected = matched && selectedDataset?.id === matched.id;

          return (
            <Card
              key={idx}
              padding="sm"
              hoverEffect
              className={`cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#8B7BE8] bg-[#F0EDF9]/40 ring-2 ring-[#8B7BE8]/20'
                  : 'hover:border-[#D8D3E0]'
              }`}
              onClick={() => {
                if (matched) {
                  setSelectedDataset(matched);
                  showToast('info', `Switched active dataset to '${matched.name}'.`);
                } else {
                  handleLoadSamples();
                }
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#F0EDF9] text-[#7564D5] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant="violet" size="sm">
                    {card.category}
                  </Badge>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#8B7BE8] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
              <h4 className="text-sm font-bold text-[#28263A] font-display line-clamp-1">
                {card.title}
              </h4>
              <p className="text-xs text-[#777487] line-clamp-2 mt-1">
                {card.desc}
              </p>
              {matched && (
                <div className="mt-3 pt-2 border-t border-[#E8E4ED] flex items-center justify-between text-[11px] text-[#777487]">
                  <span>{matched.row_count.toLocaleString()} records</span>
                  <Badge variant={matched.data_quality_score >= 80 ? 'mint' : 'coral'} size="sm">
                    Quality: {matched.data_quality_score}%
                  </Badge>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

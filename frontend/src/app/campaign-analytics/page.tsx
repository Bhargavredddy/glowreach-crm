'use client';

import { useEffect, useState } from 'react';
import { crmApi, AnalyticsData, CampaignPerformance } from '@/lib/api';
import { 
  BarChart3, 
  Send, 
  CheckCircle2, 
  BookOpen, 
  MousePointerClick, 
  AlertCircle, 
  RefreshCw,
  Clock,
  Layers,
  Inbox
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function CampaignAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAnalytics = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await crmApi.getAnalytics();
      setAnalytics(data);
      
      // Auto-select the first campaign if none selected
      if (data.campaignPerformance.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(data.campaignPerformance[0].id);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Poll for updates in real-time every 1.5 seconds if there's a running campaign
  useEffect(() => {
    const hasRunningCampaign = analytics?.campaignPerformance.some(c => c.status === 'RUNNING');
    if (!hasRunningCampaign) return;

    console.log('[Analytics] Active campaign running. Starting real-time update poll...');
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 1500);

    return () => clearInterval(interval);
  }, [analytics, selectedCampaignId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading campaign database...</p>
      </div>
    );
  }

  const campaigns = analytics?.campaignPerformance || [];
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  // Calculate percentages
  const getRate = (part: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((part / total) * 100)}%`;
  };

  const chartData = selectedCampaign ? [
    { name: 'Sent', count: selectedCampaign.sent, fill: '#64748b' },
    { name: 'Delivered', count: selectedCampaign.delivered, fill: '#3b82f6' },
    { name: 'Opened', count: selectedCampaign.opened, fill: '#8b5cf6' },
    { name: 'Clicked', count: selectedCampaign.clicked, fill: '#f43f5e' },
    { name: 'Failed', count: selectedCampaign.failed, fill: '#ef4444' }
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-8 h-8 text-brand-500" />
            Campaign Analytics
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Monitor real-time message delivery receipts (Delivered, Opened, Clicked) from the simulator callbacks.
          </p>
        </div>
        <button
          onClick={() => fetchAnalytics()}
          disabled={isRefreshing}
          className="self-start px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-slate-200 text-slate-400 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass-card p-16 text-center border-2 border-dashed border-slate-800/80 rounded-2xl space-y-4">
          <Inbox className="w-12 h-12 text-slate-700 mx-auto" />
          <div>
            <h3 className="text-slate-300 font-medium">No campaigns launched</h3>
            <p className="text-slate-500 text-xs mt-1">Design a target customer audience and launch a mock campaign to inspect analytics.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Campaign Selector */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Select Campaign
            </h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {campaigns.map((camp) => {
                const isActive = camp.id === selectedCampaignId;
                return (
                  <button
                    key={camp.id}
                    onClick={() => setSelectedCampaignId(camp.id)}
                    className={`w-full text-left p-4.5 rounded-xl border transition-all flex flex-col space-y-2 relative overflow-hidden group cursor-pointer ${
                      isActive 
                        ? 'bg-slate-900/60 border-brand-500/80 text-slate-100 shadow-md shadow-brand-500/5' 
                        : 'bg-slate-900/20 border-slate-800/80 hover:border-slate-800 hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {/* Running pulse glow */}
                    {camp.status === 'RUNNING' && (
                      <span className="absolute top-2 right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                      </span>
                    )}

                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {camp.channel} Channel
                      </span>
                      <h4 className="font-semibold text-sm leading-tight text-slate-200 truncate pr-4">
                        {camp.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                        camp.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        camp.status === 'RUNNING' ? 'bg-brand-500/10 text-brand-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {camp.status}
                      </span>
                      <span className="text-slate-500 font-medium font-mono">
                        Audience: {camp.sent}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Detailed Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCampaign ? (
              <>
                {/* Active banner */}
                {selectedCampaign.status === 'RUNNING' && (
                  <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center space-x-3 text-brand-400 animate-pulse">
                    <Clock className="w-5 h-5 shrink-0" />
                    <p className="text-xs font-semibold leading-relaxed">
                      Delivery simulation in progress. Metrics and graphs will update automatically as callbacks arrive.
                    </p>
                  </div>
                )}

                {/* KPI Funnel counters */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Sent', count: selectedCampaign.sent, sub: 'Target Segment', icon: Send, color: 'text-slate-400', bg: 'bg-slate-900/50' },
                    { label: 'Delivered', count: selectedCampaign.delivered, sub: getRate(selectedCampaign.delivered, selectedCampaign.sent), icon: CheckCircle2, color: 'text-blue-400', bg: 'bg-blue-500/5' },
                    { label: 'Opened', count: selectedCampaign.opened, sub: getRate(selectedCampaign.opened, selectedCampaign.delivered) + ' of Del.', icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-500/5' },
                    { label: 'Clicked', count: selectedCampaign.clicked, sub: getRate(selectedCampaign.clicked, selectedCampaign.opened) + ' of Open', icon: MousePointerClick, color: 'text-rose-400', bg: 'bg-rose-500/5' },
                    { label: 'Failed', count: selectedCampaign.failed, sub: getRate(selectedCampaign.failed, selectedCampaign.sent), icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/5' }
                  ].map((card, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border border-slate-800/80 ${card.bg} flex flex-col justify-between h-28 relative overflow-hidden group`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{card.label}</span>
                        <card.icon className={`w-4 h-4 ${card.color}`} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-2xl font-bold font-display text-slate-100">{card.count}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">{card.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bar Graph */}
                <div className="glass-card p-6 rounded-2xl shadow-sm">
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400 mb-6">
                    Conversion Funnel
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} horizontal={false} />
                        <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Simulated Campaign Message Preview */}
                <div className="p-4 rounded-2xl bg-slate-900/20 border border-slate-800/80 space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Message Broadcast Copy
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850 font-mono text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {selectedCampaign.message || 'No campaign copy configured.'}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full min-h-[40vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-800/60 rounded-2xl p-6 text-center space-y-3">
                <BarChart3 className="w-10 h-10 text-slate-700 animate-pulse" />
                <h4 className="text-slate-300 font-medium text-sm">Select a Campaign</h4>
                <p className="text-slate-500 text-xs max-w-sm leading-relaxed">
                  Choose an option from the menu on the left to inspect performance metrics, delivery funnels, and receipt status codes.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { crmApi, AnalyticsData } from '@/lib/api';
import { 
  Users, 
  ShoppingBag, 
  Megaphone, 
  IndianRupee, 
  TrendingUp, 
  Layers, 
  ChevronRight 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import Link from 'next/link';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    crmApi.getAnalytics()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching analytics:', err);
        setLoading(false);
      });
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading workspace analytics...</p>
      </div>
    );
  }

  const summary = data?.summary || { totalCustomers: 0, totalOrders: 0, totalCampaigns: 0, totalRevenue: 0 };
  const campaignPerformance = data?.campaignPerformance || [];
  const funnel = data?.funnel || [];
  const segmentSales = data?.segmentSales || [];

  // Colors for Pie Chart
  const COLORS = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-slate-100">
            Workspace Overview
          </h1>
          <p className="text-slate-400 mt-1.5 text-sm md:text-base font-medium">
            Welcome back! Here is a summary of customer engagement across beauty and fashion segments.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link 
            href="/audience-builder" 
            className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl text-sm font-medium transition-all text-slate-200"
          >
            Create Segment
          </Link>
          <Link 
            href="/campaign-builder" 
            className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/15 transition-all"
          >
            Launch Campaign
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Customers", value: summary.totalCustomers.toLocaleString(), icon: Users, color: "text-brand-500", bg: "bg-brand-500/10" },
          { title: "Total Orders", value: summary.totalOrders.toLocaleString(), icon: ShoppingBag, color: "text-violet-500", bg: "bg-violet-500/10" },
          { title: "Revenue", value: `₹${summary.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: IndianRupee, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Total Campaigns", value: summary.totalCampaigns.toString(), icon: Megaphone, color: "text-amber-500", bg: "bg-amber-500/10" }
        ].map((kpi, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl flex items-center justify-between shadow-sm relative overflow-hidden group">
            {/* Soft decorative background glow */}
            <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-slate-800/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
            <div className="space-y-2.5">
              <p className="text-slate-400 text-xs tracking-wider uppercase font-semibold">{kpi.title}</p>
              <h3 className="font-display font-bold text-2xl md:text-3xl text-slate-100">{kpi.value}</h3>
            </div>
            <div className={`p-4.5 rounded-xl ${kpi.bg}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Campaign Performance Bar Chart */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-4">
            <div className="flex items-center space-x-2.5">
              <TrendingUp className="w-5 h-5 text-brand-500" />
              <h2 className="font-display font-semibold text-lg text-slate-100">Campaign Engagement</h2>
            </div>
            <Link href="/campaign-analytics" className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center">
              View Analytics <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          <div className="h-80 w-full">
            {campaignPerformance.length === 0 ? (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl">
                <p className="text-slate-500 text-xs">No active campaign performance data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignPerformance.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="sent" name="Sent" fill="#334155" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delivered" name="Delivered" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="opened" name="Opened" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicked" name="Clicked" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Customer Segment Sales Pie Chart */}
        <div className="glass-card p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="mb-6 border-b border-slate-800/50 pb-4">
            <div className="flex items-center space-x-2.5">
              <Layers className="w-5 h-5 text-violet-500" />
              <h2 className="font-display font-semibold text-lg text-slate-100">Category Sales Distribution</h2>
            </div>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            {segmentSales.length === 0 ? (
              <p className="text-slate-500 text-xs">No product sales data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={segmentSales}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="revenue"
                  >
                    {segmentSales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {segmentSales.map((entry, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-slate-400 font-medium truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Funnel Conversion Area Chart */}
      <div className="glass-card p-6 rounded-2xl shadow-sm">
        <div className="mb-6 border-b border-slate-800/50 pb-4">
          <h2 className="font-display font-semibold text-lg text-slate-100">Overall Communication Funnel</h2>
          <p className="text-slate-400 text-xs mt-1">Aggregated engagement rates across all campaign channels</p>
        </div>
        <div className="h-64 w-full">
          {funnel.length === 0 || funnel.every(f => f.count === 0) ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-500 text-xs">No communication funnel data. Launch a campaign to view funnel rates.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnel} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFunnel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="count" name="Customers" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFunnel)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

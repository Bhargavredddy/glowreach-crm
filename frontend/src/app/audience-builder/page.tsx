'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crmApi, AudienceResponse } from '@/lib/api';
import { 
  Sparkles, 
  Users, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
  CircleDollarSign
} from 'lucide-react';

export default function AudienceBuilder() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AudienceResponse | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await crmApi.generateAudience(prompt);
      setData(res);
    } catch (err: any) {
      console.error('Error generating audience:', err);
      setError(err.response?.data?.error || 'Failed to process prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (text: string) => {
    setPrompt(text);
  };

  const navigateToCampaignBuilder = () => {
    if (!data) return;
    
    // Pass audience properties via session storage or query params
    const audienceParams = {
      description: prompt,
      category: data.filters.category || '',
      minSpend: data.filters.minSpend?.toString() || '',
      inactiveDays: data.filters.inactiveDays?.toString() || '',
      audienceSize: data.audienceSize.toString()
    };
    
    sessionStorage.setItem('active_audience_segment', JSON.stringify(audienceParams));
    router.push('/campaign-builder');
  };

  const samplePrompts = [
    "Find customers who spent more than 5000 on skincare and have not purchased in 45 days.",
    "Show me premium fashion shoppers who spent over 3000 but haven't ordered in the last 60 days.",
    "Find makeup enthusiasts who spent more than 2000 recently.",
    "List accessories buyers inactive for more than 90 days."
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-slate-100 flex items-center gap-2.5">
          <Sparkles className="w-8 h-8 text-brand-500 animate-pulse" />
          AI Audience Builder
        </h1>
        <p className="text-slate-400 mt-1 text-sm font-medium">
          Create complex, highly targeted customer segments using conversational natural language.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: NL Prompt & Quick Templates */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h2 className="font-display font-semibold text-base text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <span>Describe your audience</span>
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g. Find customers who spent more than ₹5000 on skincare and have not purchased in 45 days..."
                className="w-full h-36 p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-sm placeholder:text-slate-600 text-slate-100 focus:outline-none focus:border-brand-500/80 transition-colors resize-none leading-relaxed"
              />

              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/10 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Segment...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Compile Audience</span>
                  </>
                )}
              </button>
            </form>

            {error && (
              <p className="text-xs text-brand-400 bg-brand-500/5 border border-brand-500/10 p-3.5 rounded-xl">
                {error}
              </p>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="font-display font-semibold text-sm text-slate-300 flex items-center space-x-2">
              <HelpCircle className="w-4.5 h-4.5 text-slate-500" />
              <span>Try these examples</span>
            </h3>
            <div className="space-y-2.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(p)}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-all leading-normal"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Compiled Segment Output */}
        <div className="lg:col-span-2 space-y-6">
          {data ? (
            <>
              {/* Segment Size & Action */}
              <div className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-brand-500/5 rounded-full blur-2xl" />
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-brand-500/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display text-slate-100">
                      {data.audienceSize.toLocaleString()} Customers
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">Found matching this AI criteria in CRM</p>
                  </div>
                </div>
                <button
                  onClick={navigateToCampaignBuilder}
                  disabled={data.audienceSize === 0}
                  className="px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/10 flex items-center justify-center space-x-2 transition-all cursor-pointer z-10"
                >
                  <span>Create Campaign</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Extracted Structured Filters */}
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400">
                  AI Extracted Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Category */}
                  <div className="p-4.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center space-x-3.5">
                    <Layers className="w-5 h-5 text-violet-500" />
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Category</p>
                      <p className="text-slate-200 text-sm font-semibold mt-0.5">
                        {data.filters.category || 'Any Category'}
                      </p>
                    </div>
                  </div>

                  {/* Spend */}
                  <div className="p-4.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center space-x-3.5">
                    <CircleDollarSign className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Minimum Spend</p>
                      <p className="text-slate-200 text-sm font-semibold mt-0.5">
                        {data.filters.minSpend ? `₹${data.filters.minSpend.toLocaleString()}` : 'No Minimum'}
                      </p>
                    </div>
                  </div>

                  {/* Inactivity */}
                  <div className="p-4.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center space-x-3.5">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Inactivity Days</p>
                      <p className="text-slate-200 text-sm font-semibold mt-0.5">
                        {data.filters.inactiveDays ? `>= ${data.filters.inactiveDays} Days` : 'Any Activity'}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Preview List */}
              <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-800 pb-4">
                  <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-slate-400">
                    Segment Customer Preview
                  </h3>
                  <p className="text-slate-500 text-[10px] mt-0.5">Showing first 20 records matching target audience</p>
                </div>
                {data.preview.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 text-xs">
                    No customers match these filters. Try reducing the minimum spend or inactivity days.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/20 text-slate-400 font-semibold uppercase tracking-wider">
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">City</th>
                          <th className="px-6 py-4">Gender</th>
                          <th className="px-6 py-4">Join Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {data.preview.map((cust) => (
                          <tr key={cust.id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="px-6 py-3.5 font-semibold text-slate-200">{cust.name}</td>
                            <td className="px-6 py-3.5 text-slate-400 font-mono">{cust.email}</td>
                            <td className="px-6 py-3.5 text-slate-400">{cust.city}</td>
                            <td className="px-6 py-3.5">
                              <span className={`inline-flex px-2 py-0.5 rounded-full font-medium ${
                                cust.gender === 'Female' ? 'bg-pink-500/10 text-pink-400' :
                                cust.gender === 'Male' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-300'
                              }`}>
                                {cust.gender}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-slate-500">
                              {new Date(cust.joinDate).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full min-h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-800/60 rounded-2xl p-6 text-center space-y-4">
              <Sparkles className="w-12 h-12 text-slate-700 animate-pulse" />
              <div>
                <h3 className="text-slate-300 font-medium text-sm">Waiting for Segment Input</h3>
                <p className="text-slate-500 text-xs max-w-sm mt-1 leading-relaxed">
                  Enter a targeting prompt on the left and compile the audience. We will display the structured parameters and customer matches here.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

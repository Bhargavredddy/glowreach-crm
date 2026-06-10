'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { crmApi, CampaignPreviewResponse } from '@/lib/api';
import { 
  Megaphone, 
  Sparkles, 
  Send, 
  MessageSquare, 
  Mail, 
  MessageCircle, 
  AlertCircle, 
  Info, 
  Users 
} from 'lucide-react';

export default function CampaignBuilder() {
  const router = useRouter();

  // State for Inputs
  const [audienceDesc, setAudienceDesc] = useState('');
  const [goal, setGoal] = useState('');
  const [audienceSize, setAudienceSize] = useState<number | null>(null);

  // State for AI Generation
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<CampaignPreviewResponse | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [channel, setChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');

  // State for Launching
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState('');

  // Read segment parameters from session storage if redirected from Audience Builder
  useEffect(() => {
    const rawSegment = sessionStorage.getItem('active_audience_segment');
    if (rawSegment) {
      try {
        const parsed = JSON.parse(rawSegment);
        setAudienceDesc(parsed.description || '');
        if (parsed.audienceSize) {
          setAudienceSize(parseInt(parsed.audienceSize, 10));
        }
        
        // Auto-fill a default goal based on category
        if (parsed.category) {
          setGoal(`Promote our top-selling ${parsed.category} items with an exclusive 15% discount code GLOW15.`);
        }
      } catch (e) {
        console.error('Error parsing session segment:', e);
      }
    }
  }, []);

  const handleGeneratePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audienceDesc.trim() || !goal.trim()) return;

    setLoadingPreview(true);
    setError('');
    try {
      const res = await crmApi.generateCampaignPreview(goal, audienceDesc);
      setPreviewData(res);
      setCampaignName(res.campaignName);
      setChannel(res.recommendedChannel);
      setMessage(res.message);
      setReason(res.reason);
    } catch (err: any) {
      console.error('Error generating campaign preview:', err);
      setError('Failed to generate campaign details. Please try again.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleLaunch = async () => {
    if (!campaignName || !message || !channel) return;

    setLaunching(true);
    setError('');
    try {
      // 1. Create the campaign draft in backend
      const createdCampaign = await crmApi.createCampaign({
        campaignName,
        audienceDescription: audienceDesc,
        channel,
        message
      });

      // 2. Launch the campaign (triggers async delivery and callbacks)
      await crmApi.launchCampaign(createdCampaign.id);

      // Clean up session storage
      sessionStorage.removeItem('active_audience_segment');

      // 3. Redirect to Analytics to watch the delivery simulation live
      router.push('/campaign-analytics');
    } catch (err: any) {
      console.error('Error launching campaign:', err);
      setError(err.response?.data?.error || 'Failed to launch campaign. Please check connection.');
      setLaunching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-slate-100 flex items-center gap-2.5">
          <Megaphone className="w-8 h-8 text-brand-500" />
          Campaign Builder
        </h1>
        <p className="text-slate-400 mt-1 text-sm font-medium">
          Author marketing goals, generate copywriting using AI, and launch messaging simulations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel: Inputs */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h2 className="font-display font-semibold text-base text-slate-100">
              Configure Campaign Input
            </h2>

            <form onSubmit={handleGeneratePreview} className="space-y-5">
              
              {/* Audience Context */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Target Audience Description
                </label>
                <textarea
                  value={audienceDesc}
                  onChange={(e) => setAudienceDesc(e.target.value)}
                  placeholder="E.g. Inactive premium skincare customers who haven't purchased in 45 days..."
                  className="w-full h-24 p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-sm placeholder:text-slate-600 text-slate-100 focus:outline-none focus:border-brand-500/80 transition-colors resize-none leading-relaxed"
                />
                {audienceSize !== null && (
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Prefilled Segment Size: {audienceSize.toLocaleString()} Customers</span>
                  </p>
                )}
              </div>

              {/* Marketing Goal */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Campaign Goal / Product Offer
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="E.g. Promote our new Vitamin C Serum with a 15% discount code 'GLOW15' to boost loyalty..."
                  className="w-full h-24 p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-sm placeholder:text-slate-600 text-slate-100 focus:outline-none focus:border-brand-500/80 transition-colors resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loadingPreview || !audienceDesc.trim() || !goal.trim()}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
              >
                {loadingPreview ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span>AI Writing Campaign...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span>Generate AI Proposal</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Right Panel: Proposals & Copywriting Editor */}
        <div>
          {previewData ? (
            <div className="glass-card p-6 rounded-2xl space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="font-display font-semibold text-base text-slate-100">
                  AI Marketing Proposal
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">Edit and verify details before launching</p>
              </div>

              {/* Editable Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-200 font-semibold focus:outline-none focus:border-brand-500/80"
                />
              </div>

              {/* Channel Recommendation */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Recommended Delivery Channel
                </label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setChannel('WhatsApp')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      channel === 'WhatsApp'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-900/50'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setChannel('Email')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      channel === 'Email'
                        ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-900/50'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                </div>
                
                {/* Reasoning Box */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start space-x-3">
                  <Info className="w-4.5 h-4.5 text-brand-400 mt-0.5 shrink-0" />
                  <p className="text-slate-400 text-xs leading-relaxed">{reason}</p>
                </div>
              </div>

              {/* Message Editor */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Message Copywriting
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-36 p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-brand-500/80 transition-colors leading-relaxed"
                />
                <p className="text-[10px] text-slate-500 italic">
                  Note: The *{"{{name}}"}* variable will be automatically resolved for each customer.
                </p>
              </div>

              {/* Launch Button */}
              <div className="pt-2">
                <button
                  onClick={handleLaunch}
                  disabled={launching}
                  className="w-full py-4 bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/15 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  {launching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Broadcasting Campaign...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Launch Delivery Simulation</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <p className="text-xs text-brand-400 text-center flex items-center justify-center space-x-1.5 bg-brand-500/5 p-3 rounded-xl border border-brand-500/10">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </p>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[50vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-800/60 rounded-2xl p-6 text-center space-y-4">
              <Megaphone className="w-12 h-12 text-slate-700" />
              <div>
                <h3 className="text-slate-300 font-medium text-sm">Campaign Preview Panel</h3>
                <p className="text-slate-500 text-xs max-w-sm mt-1 leading-relaxed">
                  Provide target audience descriptions and marketing objectives on the left. The AI copywriter will suggest channels, explain recommendations, and draft personalized layouts here.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

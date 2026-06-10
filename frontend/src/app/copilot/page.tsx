'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { crmApi, ChatMessage } from '@/lib/api';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  Play, 
  Megaphone, 
  Users, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface UIAction {
  category: string;
  minSpend: number;
  inactiveDays: number;
  campaignName: string;
  channel: 'WhatsApp' | 'Email';
  message: string;
}

export default function Copilot() {
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'model';
    text: string;
    action?: UIAction;
  }>>([
    {
      role: 'model',
      text: "Hello! I am your AI Marketing Copilot. Tell me your campaign objective today.\n\nFor example: **\"I want to increase sales of skincare products among customers inactive for 60 days.\"**"
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [launchError, setLaunchError] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      // Map message structure to API format
      const historyPayload = messages.map(m => ({
        role: m.role,
        parts: m.text // Note: We pass raw text, ignoring actions
      }));

      const res = await crmApi.sendCopilotChat(historyPayload, userText);
      
      // Parse trigger block if exists e.g., ||CREATE_CAMPAIGN:{"category":"Skincare",...}||
      let cleanText = res.reply;
      let action: UIAction | undefined = undefined;

      const triggerMatch = res.reply.match(/\|\|CREATE_CAMPAIGN:(.*?)\|\|/);
      if (triggerMatch) {
        try {
          action = JSON.parse(triggerMatch[1]) as UIAction;
          // Strip the action block from text rendering
          cleanText = res.reply.replace(/\|\|CREATE_CAMPAIGN:(.*?)\|\|/g, '').trim();
        } catch (e) {
          console.error('Failed to parse CREATE_CAMPAIGN action JSON:', e);
        }
      }

      setMessages(prev => [...prev, {
        role: 'model',
        text: cleanText,
        action
      }]);
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I ran into an error connecting to the AI service. Please try stating your request again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async (action: UIAction, index: number) => {
    setLaunchingId(`${index}`);
    setLaunchError('');
    try {
      // 1. Create campaign
      const campaign = await crmApi.createCampaign({
        campaignName: action.campaignName,
        audienceDescription: `Customers who bought ${action.category || 'any product'} spent >= ₹${action.minSpend || 0} and inactive for ${action.inactiveDays || 0} days.`,
        channel: action.channel,
        message: action.message
      });

      // 2. Launch
      await crmApi.launchCampaign(campaign.id);

      // 3. Navigate to Analytics to see delivery simulation
      router.push('/campaign-analytics');
    } catch (err: any) {
      console.error('Failed to quick-launch campaign:', err);
      setLaunchError(err.response?.data?.error || 'Failed to auto-launch campaign. Please check database connection.');
      setLaunchingId(null);
    }
  };

  return (
    <div className="space-y-8 flex flex-col h-[85vh] justify-between max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-slate-100 flex items-center gap-2.5">
          <MessageSquare className="w-8 h-8 text-brand-500" />
          AI Campaign Copilot
        </h1>
        <p className="text-slate-400 mt-1 text-sm font-medium">
          Command your CRM using natural language chat. The AI will segment customers, design creatives, and launch campaigns instantly.
        </p>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 min-h-0 border border-slate-800/60 bg-slate-950/45 backdrop-blur-md rounded-2xl p-6 overflow-y-auto space-y-6 flex flex-col scrollbar-thin">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex items-start space-x-4 max-w-[85%] ${m.role === 'user' ? 'self-end flex-row-reverse space-x-reverse' : 'self-start'}`}
          >
            {/* Avatar icon */}
            <div className={`p-2 rounded-xl shrink-0 ${m.role === 'user' ? 'bg-brand-500/10' : 'bg-slate-900 border border-slate-800'}`}>
              {m.role === 'user' ? <User className="w-5 h-5 text-brand-500" /> : <Bot className="w-5 h-5 text-violet-500" />}
            </div>

            {/* Bubble */}
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user' 
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-tr-none font-medium' 
                  : 'bg-slate-900/40 border border-slate-800 text-slate-300 rounded-tl-none'
              }`}>
                {m.text}
              </div>

              {/* Action Widget Card */}
              {m.action && (
                <div className="glass-card p-5 rounded-2xl border border-brand-500/20 shadow-lg relative overflow-hidden animate-slide-in">
                  <div className="absolute top-0 right-0 p-8 bg-brand-500/5 rounded-full blur-2xl" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-brand-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">AI Proposed Action</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-display font-semibold text-sm text-slate-100">
                        {m.action.campaignName}
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 text-slate-400">
                          Segment Category: <strong className="text-slate-200">{m.action.category || 'Any'}</strong>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/80 text-slate-400">
                          Inactivity Days: <strong className="text-slate-200">{m.action.inactiveDays || 0} days</strong>
                        </div>
                      </div>
                    </div>

                    {/* Creative Message */}
                    <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl font-mono text-[10px] text-slate-400 whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {m.action.message}
                    </div>

                    {/* Launch Control */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        onClick={() => handleLaunchCampaign(m.action!, idx)}
                        disabled={launchingId !== null}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-all"
                      >
                        {launchingId === `${idx}` ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Launching...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Quick Launch Campaign</span>
                          </>
                        )}
                      </button>
                      <span className="text-[10px] text-slate-500 font-semibold font-mono">
                        Channel: {m.action.channel}
                      </span>
                    </div>

                    {launchError && launchingId === `${idx}` && (
                      <p className="text-[10px] text-brand-400 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{launchError}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-slate-500 pl-4">
            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Command Xeno CRM (e.g. Launch a campaign for fashion customers)..."
          disabled={loading}
          className="flex-1 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-sm placeholder:text-slate-500 text-slate-100 focus:outline-none focus:border-brand-500/80 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-4 bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md shadow-brand-500/5"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

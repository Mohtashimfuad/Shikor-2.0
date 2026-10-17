import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Layers, 
  Sparkles,
  Server,
  ShieldCheck
} from 'lucide-react';
import { isSupabaseConfigured, saveSupabaseCredentials, testSupabaseConnection, clearSupabaseCredentials } from '../../lib/supabase';
import { Language } from '../../types';

interface BackendSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const BackendSetupModal: React.FC<BackendSetupModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'sql' | 'storage' | 'connect'>('guide');
  const [copied, setCopied] = useState(false);
  
  // Connect tab state
  const [inputUrl, setInputUrl] = useState(
    typeof window !== 'undefined' ? (localStorage.getItem('shikor_supabase_url') || '') : ''
  );
  const [inputKey, setInputKey] = useState(
    typeof window !== 'undefined' ? (localStorage.getItem('shikor_supabase_key') || '') : ''
  );
  const [testResult, setTestResult] = useState<{ loading: boolean; success?: boolean; message?: string }>({
    loading: false
  });

  if (!isOpen) return null;

  const isConnected = isSupabaseConfigured();

  const SQL_MIGRATION = `-- Phase 1 schema is managed in reviewed repository migrations.
-- Apply supabase/migrations/ in filename order using the Supabase migration workflow.
-- The connected Shikor project already has profiles and land-record tables.
-- This browser panel does not create duplicate tables or policies.
-- Never restore public claim or citizen-evidence policies.`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_MIGRATION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestResult({ loading: true });
    const res = await testSupabaseConnection(inputUrl, inputKey);
    setTestResult({ loading: false, success: res.success, message: res.message });
    if (res.success) {
      saveSupabaseCredentials(inputUrl, inputKey);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#D9E1DC] overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="bg-[#123B32] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base font-serif-title">
                  {language === 'bn' ? 'শিকড় ব্যাকএন্ড কানেক্টর (Supabase Setup)' : 'Shikor Backend & Supabase Integration'}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isConnected 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}>
                  {isConnected ? 'LIVE CONNECTED' : 'DEMO MODE'}
                </span>
              </div>
              <p className="text-[11px] text-[#D8E8DF]">
                {language === 'bn' ? 'বিনামূল্যে ৫ মিনিটে ব্যাকএন্ড ও পোস্টজিআইএস ডাটাবেস চালু করুন' : 'Step-by-step guide to connect your real PostgreSQL & PostGIS backend in 5 minutes'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#F5F1E8] px-6 pt-3 border-b border-[#D9E1DC] flex space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'guide'
                ? 'border-[#123B32] text-[#123B32] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#123B32]'
            }`}
          >
            <span>1. Step-by-Step Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'sql'
                ? 'border-[#123B32] text-[#123B32] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#123B32]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-[#C6A66B]" />
            <span>2. Copy SQL Script</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'storage'
                ? 'border-[#123B32] text-[#123B32] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#123B32]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>3. Private Storage RLS</span>
          </button>

          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-3 transition-colors border-b-2 flex items-center space-x-1.5 ${
              activeTab === 'connect'
                ? 'border-[#123B32] text-[#123B32] font-bold'
                : 'border-transparent text-[#64748B] hover:text-[#123B32]'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-emerald-700" />
            <span>4. Connect API Keys</span>
          </button>
        </div>

        {/* Tab 1: 5-Minute Guide */}
        {activeTab === 'guide' && (
          <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto text-xs sm:text-sm">
            
            <div className="bg-[#D8E8DF]/60 p-4 rounded-xl border border-[#b2cfbe] text-xs text-[#123B32] flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-[#123B32] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Why Supabase for Shikor?</span>
                <span>
                  Supabase gives you a <strong>PostgreSQL</strong> database with <strong>PostGIS</strong> (for cadastral GPS & river polygon math), <strong>Storage buckets</strong> for phone camera photos/videos, and <strong>Row Level Security</strong> for free.
                </span>
              </div>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-4">
              
              {/* Step 1 */}
              <div className="flex space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#123B32]">{language === 'bn' ? 'বিদ্যমান Supabase প্রজেক্ট ব্যবহার করুন' : 'Use the Existing Supabase Project'}</h4>
                  <p className="text-xs text-[#64748B]">
                    {language === 'bn' ? 'Shikor-এর বর্তমান Supabase প্রজেক্টে সংযোগ দিন। নতুন প্রজেক্ট বা ডুপ্লিকেট টেবিল তৈরি করবেন না।' : 'Connect to Shikor’s current Supabase project. Do not create another project or duplicate tables.'}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#123B32]">{language === 'bn' ? 'পর্যালোচিত Phase 1 migration ব্যবহার করুন' : 'Use the Reviewed Phase 1 Migration'}</h4>
                  <p className="text-xs text-[#64748B]">
                    {language === 'bn' ? 'Phase 1 migration বর্তমান Shikor ডাটাবেসে প্রয়োগ করা হয়েছে। নতুন পরিবেশে repository-এর supabase/migrations ফাইলগুলো ক্রমানুসারে চালান; পুরোনো inline SQL ব্যবহার করবেন না।' : 'The Phase 1 migration is applied to the current Shikor database. For a fresh environment, run the repository’s supabase/migrations in order; do not use the legacy inline SQL.'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#123B32]">Copy Your API Credentials</h4>
                  <p className="text-xs text-[#64748B]">
                    In Supabase, go to <strong>Project Settings → API</strong>.
                    Copy your <strong>Project URL</strong> (e.g. <code>https://xyzcompany.supabase.co</code>) and your <strong>anon public API key</strong>.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  4
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#123B32]">Connect and Test Live!</h4>
                  <p className="text-xs text-[#64748B]">
                    Switch to <strong>"Connect API Keys"</strong>, paste the public project URL and anon key, and click <strong>"Test Connection"</strong>. The app keeps private data behind Supabase Auth and database policies.
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('sql')}
                className="bg-[#123B32] hover:bg-[#0c2822] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                View Phase 1 Migration →
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: SQL Code */}
        {activeTab === 'sql' && (
          <div className="p-6 sm:p-8 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#123B32]">Phase 1 Database Migration</h4>
                <p className="text-[11px] text-[#64748B]">Use the reviewed repository migrations. This panel does not create tables or policies.</p>
              </div>

              <button
                onClick={handleCopySql}
                className="bg-[#123B32] hover:bg-[#0c2822] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#C6A66B]" />}
                <span>{copied ? 'Copied migration note' : 'Copy Migration Note'}</span>
              </button>
            </div>

            <div className="bg-neutral-900 text-neutral-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[380px] shadow-inner leading-relaxed border border-neutral-700">
              <pre>{SQL_MIGRATION}</pre>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-[#64748B]">Officer and citizen Storage policies are included in the migration.</span>
              <button
                onClick={() => setActiveTab('storage')}
                className="bg-[#D8E8DF] hover:bg-[#c6ded0] text-[#123B32] font-bold px-4 py-2 rounded-lg border border-[#a8cfb9] transition-colors"
              >
                View Storage Security →
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Storage RLS */}
        {activeTab === 'storage' && (
          <div className="p-6 sm:p-8 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#123B32]">{language === 'bn' ? 'ব্যক্তিগত Storage নীতিমালা' : 'Private Storage Bucket RLS Policies'}</h4>
                <p className="text-[11px] text-[#64748B]">
                  {language === 'bn' ? 'পর্যালোচিত ডাটাবেস মাইগ্রেশনে প্রবেশাধিকার নির্ধারিত। এখানে কোনো Public Storage policy যোগ করবেন না।' : 'Access is configured by the reviewed database migration; do not add public Storage policies here.'}
                </p>
              </div>
            </div>

            <div className="bg-neutral-900 text-neutral-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto shadow-inner leading-relaxed border border-neutral-700">
              <pre>{`Bucket: officer-appointment-letters (private)
Access: applicant to own application, Admin to review
Limit: 10 MB, PDF / JPEG / PNG / WebP

Bucket: citizen-evidence (private)
Access: claim owner or authorized Admin

No public Storage policy is required.`}</pre>
            </div>

            <div className="bg-[#D8E8DF]/60 p-3 rounded-lg border border-[#b2cfbe] text-xs text-[#123B32] space-y-1">
              <span className="font-bold block">{language === 'bn' ? '🔒 ব্যক্তিগত Bucket নিরাপত্তা:' : '🔒 How Private Bucket Security Works:'}</span>
              <p className="text-[11px] leading-relaxed">
                {language === 'bn' ? 'নিয়োগপত্র ব্যক্তিগত থাকে। ডাটাবেস অনুমোদনের পর Admin পর্যালোচনার জন্য অল্প সময়ের signed URL তৈরি হয়।' : 'Appointment letters stay private. Admin review creates a short-lived signed URL only after database authorization.'}
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-[#64748B]">Connect the public project URL and anon key:</span>
              <button
                onClick={() => setActiveTab('connect')}
                className="bg-[#123B32] hover:bg-[#0c2822] text-white font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                Step 4: Connect API Keys →
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Connect & Test */}
        {activeTab === 'connect' && (
          <div className="p-6 sm:p-8 space-y-5 max-h-[65vh] overflow-y-auto">
            
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#123B32]">Connect Your Live Supabase Credentials</h4>
              <p className="text-xs text-[#64748B]">
                Enter your project credentials below. They are saved in your browser environment so you can test real database writes immediately.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1F2933] mb-1">
                  Supabase Project URL *
                </label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://xyzabcdefg.supabase.co"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9E1DC] focus:ring-2 focus:ring-[#123B32]/30 focus:border-[#123B32] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1F2933] mb-1">
                  Supabase Anon Public API Key *
                </label>
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D9E1DC] focus:ring-2 focus:ring-[#123B32]/30 focus:border-[#123B32] outline-none font-mono"
                />
              </div>
            </div>

            {testResult.message && (
              <div className={`p-4 rounded-xl border text-xs flex items-start space-x-2.5 ${
                testResult.success 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                  : 'bg-red-50 border-red-300 text-red-900'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              {isConnected ? (
                <button
                  type="button"
                  onClick={clearSupabaseCredentials}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Disconnect & Revert to Demo Mode
                </button>
              ) : (
                <span className="text-[11px] text-[#64748B]">Currently running on client-side demo memory</span>
              )}

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testResult.loading || !inputUrl || !inputKey}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors shadow-sm ${
                  testResult.loading || !inputUrl || !inputKey
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#123B32] hover:bg-[#0c2822] text-white'
                }`}
              >
                <Server className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>{testResult.loading ? 'Pinging Database...' : 'Save & Test Live Connection'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

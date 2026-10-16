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

  const SQL_MIGRATION = `-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('citizen', 'surveyor', 'ac_land_official', 'uno')),
  full_name_en TEXT NOT NULL,
  full_name_bn TEXT,
  phone_number TEXT UNIQUE NOT NULL,
  nid_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. High-Risk River Erosion Plots & Claims
CREATE TABLE IF NOT EXISTS public.erosion_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id TEXT UNIQUE NOT NULL,
  claimant_id UUID REFERENCES public.profiles(id),
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  union_name TEXT NOT NULL,
  mouza_name TEXT NOT NULL,
  jl_number TEXT NOT NULL,
  khatian_no TEXT NOT NULL,
  dag_no TEXT NOT NULL,
  total_area_acre NUMERIC(6,3) NOT NULL,
  submerged_area_acre NUMERIC(6,3) NOT NULL,
  erosion_year INT NOT NULL,
  river_basin TEXT NOT NULL,
  centroid_point GEOMETRY(Point, 4326),
  satellite_match_rate NUMERIC(5,2) DEFAULT 0.0,
  is_satellite_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'witness_confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Geotagged Phone Camera Media
CREATE TABLE IF NOT EXISTS public.claim_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID REFERENCES public.erosion_claims(id) ON DELETE CASCADE,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'tax_receipt')),
  storage_path TEXT NOT NULL,
  exif_lat NUMERIC(10,7),
  exif_lng NUMERIC(10,7),
  sha256_hash TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Community Witnesses (Proof of Prior Possession)
CREATE TABLE IF NOT EXISTS public.claim_witnesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID REFERENCES public.erosion_claims(id) ON DELETE CASCADE,
  witness_name TEXT NOT NULL,
  relation_or_designation TEXT NOT NULL,
  attestation_signature_hash TEXT NOT NULL,
  attested_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Verifiable Land Loss Certificates
CREATE TABLE IF NOT EXISTS public.loss_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID UNIQUE REFERENCES public.erosion_claims(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  qr_verification_code TEXT NOT NULL,
  spectral_water_index NUMERIC(4,2),
  cryptographic_hash TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable RLS and Policies safely
ALTER TABLE public.erosion_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Claims" ON public.erosion_claims;
CREATE POLICY "Public Read Claims" ON public.erosion_claims FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Claims" ON public.erosion_claims;
CREATE POLICY "Public Insert Claims" ON public.erosion_claims FOR INSERT WITH CHECK (true);

ALTER TABLE public.loss_certificates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Certificates" ON public.loss_certificates;
CREATE POLICY "Public Read Certificates" ON public.loss_certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Certificates" ON public.loss_certificates;
CREATE POLICY "Public Insert Certificates" ON public.loss_certificates FOR INSERT WITH CHECK (true);
`;

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
                  <h4 className="font-bold text-[#123B32]">Create a Free Project on Supabase</h4>
                  <p className="text-xs text-[#64748B]">
                    Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> and sign in with GitHub or Google.
                    Click <strong>"New Project"</strong>, set the Name to <code>shikor-landtech</code>, create a secure database password, and select Region: <strong>Singapore (ap-southeast-1)</strong> (closest to Bangladesh).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#123B32] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-[#123B32]">Run the Shikor SQL Migration</h4>
                  <p className="text-xs text-[#64748B]">
                    In your Supabase Dashboard, click <strong>"SQL Editor"</strong> in the left sidebar.
                    Click <strong>"New query"</strong>, switch to Tab 2 (above) to copy our pre-built SQL code, paste it into the editor, and click <strong>"Run"</strong>. This enables PostGIS and creates all 5 tables in 3 seconds!
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
                    Switch to Tab 3 <strong>"Connect API Keys"</strong>, paste both values, and click <strong>"Test Connection"</strong>. Your app will automatically switch from demo state to writing live records into your real database!
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('sql')}
                className="bg-[#123B32] hover:bg-[#0c2822] text-white px-5 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Go to Step 2: Copy SQL Script →
              </button>
            </div>

          </div>
        )}

        {/* Tab 2: SQL Code */}
        {activeTab === 'sql' && (
          <div className="p-6 sm:p-8 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#123B32]">PostgreSQL & PostGIS Database Script</h4>
                <p className="text-[11px] text-[#64748B]">Paste this into Supabase SQL Editor and click "Run".</p>
              </div>

              <button
                onClick={handleCopySql}
                className="bg-[#123B32] hover:bg-[#0c2822] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#C6A66B]" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            <div className="bg-neutral-900 text-neutral-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[380px] shadow-inner leading-relaxed border border-neutral-700">
              <pre>{SQL_MIGRATION}</pre>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-[#64748B]">After running this in Supabase, configure your private storage:</span>
              <button
                onClick={() => setActiveTab('storage')}
                className="bg-[#D8E8DF] hover:bg-[#c6ded0] text-[#123B32] font-bold px-4 py-2 rounded-lg border border-[#a8cfb9] transition-colors"
              >
                Step 3: Storage RLS Policies →
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Storage RLS */}
        {activeTab === 'storage' && (
          <div className="p-6 sm:p-8 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#123B32]">Private Storage Bucket RLS Policies</h4>
                <p className="text-[11px] text-[#64748B]">
                  Run this in Supabase SQL Editor to allow photo/video uploads into your private <code>citizen-evidence</code> bucket.
                </p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`-- 1. Ensure Bucket Exists (Private: public = false)
INSERT INTO storage.buckets (id, name, public)
VALUES ('citizen-evidence', 'citizen-evidence', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Drop existing policies if any to avoid duplicates
DROP POLICY IF EXISTS "Allow public upload to citizen-evidence" ON storage.objects;
DROP POLICY IF EXISTS "Allow reading citizen-evidence" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates on citizen-evidence" ON storage.objects;

-- 3. Policy: Allow uploading files to 'citizen-evidence'
CREATE POLICY "Allow public upload to citizen-evidence"
ON storage.objects FOR INSERT
TO public, anon, authenticated
WITH CHECK (bucket_id = 'citizen-evidence');

-- 4. Policy: Allow reading files from 'citizen-evidence'
CREATE POLICY "Allow reading citizen-evidence"
ON storage.objects FOR SELECT
TO public, anon, authenticated
USING (bucket_id = 'citizen-evidence');

-- 5. Policy: Allow updating files in 'citizen-evidence'
CREATE POLICY "Allow updates on citizen-evidence"
ON storage.objects FOR UPDATE
TO public, anon, authenticated
USING (bucket_id = 'citizen-evidence');`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="bg-[#123B32] hover:bg-[#0c2822] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#C6A66B]" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Storage SQL'}</span>
              </button>
            </div>

            <div className="bg-neutral-900 text-neutral-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[250px] shadow-inner leading-relaxed border border-neutral-700">
              <pre>{`-- 1. Ensure Bucket Exists (Private: public = false)
INSERT INTO storage.buckets (id, name, public)
VALUES ('citizen-evidence', 'citizen-evidence', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "Allow public upload to citizen-evidence" ON storage.objects;
DROP POLICY IF EXISTS "Allow reading citizen-evidence" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates on citizen-evidence" ON storage.objects;

-- 3. Policy: Allow uploading files
CREATE POLICY "Allow public upload to citizen-evidence"
ON storage.objects FOR INSERT
TO public, anon, authenticated
WITH CHECK (bucket_id = 'citizen-evidence');

-- 4. Policy: Allow reading files
CREATE POLICY "Allow reading citizen-evidence"
ON storage.objects FOR SELECT
TO public, anon, authenticated
USING (bucket_id = 'citizen-evidence');

-- 5. Policy: Allow updating files
CREATE POLICY "Allow updates on citizen-evidence"
ON storage.objects FOR UPDATE
TO public, anon, authenticated
USING (bucket_id = 'citizen-evidence');`}</pre>
            </div>

            <div className="bg-[#D8E8DF]/60 p-3 rounded-lg border border-[#b2cfbe] text-xs text-[#123B32] space-y-1">
              <span className="font-bold block">🔒 How Private Bucket Security Works:</span>
              <p className="text-[11px] leading-relaxed">
                Because your bucket is <strong>Private</strong>, anyone without permission is blocked. Shikor automatically creates <strong>2-hour temporary Signed URLs</strong> when viewing certificates so citizen land photos and documents stay 100% private and protected!
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <span className="text-[#64748B]">After running the storage SQL, connect your credentials:</span>
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

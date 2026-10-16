import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  Phone, 
  Calendar, 
  Layers, 
  LogOut, 
  Award, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Building2, 
  Download,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserSession, Language, PageView, LandLossRecord } from '../../types';
import { SAMPLE_LOSS_RECORDS } from '../../data/mockData';

interface CitizenProfileViewProps {
  language: Language;
  currentUser: UserSession | null;
  onLogout: () => void;
  setCurrentPage: (page: PageView) => void;
  onOpenCertificate: (record?: LandLossRecord) => void;
  onOpenClaim: () => void;
}

export const CitizenProfileView: React.FC<CitizenProfileViewProps> = ({
  language,
  currentUser,
  onLogout,
  setCurrentPage,
  onOpenCertificate,
  onOpenClaim
}) => {
  const [showNid, setShowNid] = useState(false);
  const [copiedTrackingId, setCopiedTrackingId] = useState(false);

  // If somehow not logged in, provide an empty state prompting to sign in
  if (!currentUser) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 bg-[#F5F1E8]">
        <div className="bg-white border border-[#D9E1DC] rounded-2xl p-8 max-w-md w-full text-center shadow-md">
          <div className="w-16 h-16 bg-[#123B32]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#123B32]">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#123B32] mb-2">
            {language === 'bn' ? 'কোনো সক্রিয় প্রোফাইল পাওয়া যায়নি' : 'No Active Session Found'}
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            {language === 'bn'
              ? 'আপনার জমি বা নদীভাঙন সার্টিফিকেটের বিস্তারিত দেখতে অনুগ্রহ করে লগইন করুন।'
              : 'Please sign in or register to access your citizen profile and digital land loss records.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setCurrentPage('signin')}
              className="px-6 py-2.5 rounded-full bg-[#123B32] text-white text-sm font-semibold hover:bg-[#0b241e] transition-colors shadow-sm"
            >
              {language === 'bn' ? 'লগইন করুন' : 'Sign In Now'}
            </button>
            <button
              onClick={() => setCurrentPage('signup')}
              className="px-6 py-2.5 rounded-full bg-[#C6A66B] text-[#123B32] text-sm font-bold hover:bg-[#b5955a] transition-colors shadow-sm"
            >
              {language === 'bn' ? 'নতুন নিবন্ধন' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Find linked or matching LandLossRecord
  const matchedRecord: LandLossRecord = SAMPLE_LOSS_RECORDS.find(
    r => r.nidNumber === currentUser.nidNumber || r.khatianNo === currentUser.khatianNo
  ) || {
    id: 'usr-rec-01',
    trackingId: currentUser.trackingId || 'SHIKOR-2025-CHIL-8842',
    ownerName: currentUser.fullNameEn,
    ownerBanglaName: currentUser.fullNameBn,
    nidNumber: currentUser.nidNumber,
    district: currentUser.district || 'Kurigram',
    upazila: currentUser.upazila || 'Chilmari',
    union: currentUser.union || 'Astamir Char',
    mouza: currentUser.mouza || 'Nayarhat',
    jlNumber: 'JL-42',
    khatianNo: currentUser.khatianNo || 'K-984',
    dagNo: currentUser.dagNo || '1142 / 1143',
    totalAreaAcre: (currentUser.lostArea ? currentUser.lostArea + 0.3 : 0.88),
    submergedAreaAcre: currentUser.lostArea || 0.58,
    submersionYear: currentUser.submersionYear || 2022,
    riverBasin: currentUser.riverName || 'Brahmaputra Basin',
    gpsCoords: { lat: 25.5682, lng: 89.6744 },
    status: 'Verified by Satellite',
    satelliteSentinelMatch: 96.4,
    witnessCount: 7,
    certificateHash: '0x8f2d...c3a1b94d',
    issuedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  };

  const handleCopyTracking = () => {
    navigator.clipboard?.writeText(matchedRecord.trackingId);
    setCopiedTrackingId(true);
    setTimeout(() => setCopiedTrackingId(false), 2000);
  };

  const maskedNid = showNid 
    ? currentUser.nidNumber 
    : currentUser.nidNumber.replace(/^(.{4})(.*)(.{4})$/, '$1 •••• •••• $3');

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#123B32] via-[#1a4a40] to-[#0e2c26] text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle watermark seal */}
          <div className="absolute right-4 -bottom-8 opacity-10 pointer-events-none">
            <ShieldCheck className="w-64 h-64 text-[#C6A66B]" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#C6A66B] text-[#123B32] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
                {currentUser.fullNameEn ? currentUser.fullNameEn.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {currentUser.role === 'official' ? 'Official Authority' : 'Verified Citizen'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white/80 border border-white/10">
                    {language === 'bn' ? 'জাতীয় পরিচয়পত্র যাচাইকৃত' : 'NID Verified via Election Commission'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {currentUser.fullNameEn}
                </h1>
                {currentUser.fullNameBn && (
                  <p className="text-[#D8E8DF] text-sm font-medium">
                    {currentUser.fullNameBn}
                  </p>
                )}
                <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" />
                  <span>
                    {currentUser.upazila || 'Chilmari'}, {currentUser.district || 'Kurigram'} • {currentUser.union || 'Astamir Char'} Union
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
              <button
                onClick={onLogout}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-600/80 hover:border-rose-400/50 text-white text-xs font-semibold border border-white/20 transition-all duration-200 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'লগআউট করুন' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Left Column (Identity & Contact Info) */}
          <div className="space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white border border-[#D9E1DC] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8ECE9] mb-4">
                <h2 className="text-sm font-bold text-[#123B32] uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C6A66B]" />
                  <span>{language === 'bn' ? 'নাগরিক পরিচিতি' : 'Citizen Identity'}</span>
                </h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-gray-500 block mb-1">
                    {language === 'bn' ? 'জাতীয় পরিচয়পত্র নম্বর (NID)' : 'National ID Number'}
                  </span>
                  <div className="flex items-center justify-between font-mono font-bold text-sm text-[#1F2933] bg-[#F5F1E8] px-3 py-2 rounded-lg border border-[#D9E1DC]">
                    <span>{maskedNid}</span>
                    <button
                      onClick={() => setShowNid(!showNid)}
                      className="text-gray-500 hover:text-[#123B32] p-1"
                      title={showNid ? 'Hide NID' : 'Reveal NID'}
                    >
                      {showNid ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block mb-1">
                    {language === 'bn' ? 'নিবন্ধিত মোবাইল নম্বর' : 'Registered Mobile Number'}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[#1F2933] bg-[#F5F1E8] px-3 py-2 rounded-lg border border-[#D9E1DC]">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-semibold">{currentUser.phone}</span>
                    <span className="ml-auto text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">
                      SMS Verified
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block mb-1">
                    {language === 'bn' ? 'অ্যাকাউন্ট ধরন ও লগইন মেথড' : 'Auth Method & Access'}
                  </span>
                  <p className="font-semibold text-gray-800 capitalize flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#123B32]" />
                    <span>{currentUser.role === 'official' ? 'Land Administration Officer' : 'Citizen Landowner (Riverbank Char)'}</span>
                  </p>
                </div>

                {currentUser.registeredAt && (
                  <div>
                    <span className="text-gray-500 block mb-1">
                      {language === 'bn' ? 'নিবন্ধনের তারিখ' : 'Registered On'}
                    </span>
                    <p className="font-medium text-gray-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(currentUser.registeredAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white border border-[#D9E1DC] rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-bold text-[#123B32] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C6A66B]" />
                <span>{language === 'bn' ? 'জরুরি সেবা ও অ্যাকশন' : 'Quick Actions'}</span>
              </h2>

              <div className="space-y-2.5">
                <button
                  onClick={() => onOpenCertificate(matchedRecord)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-[#D9E1DC] hover:border-[#123B32] hover:bg-[#F5F1E8] text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#123B32]">
                        {language === 'bn' ? 'ডিজিটাল সার্টিফিকেট দেখুন' : 'View Loss Certificate'}
                      </h4>
                      <p className="text-[11px] text-gray-500">QR-code verified proof</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#123B32] group-hover:translate-x-0.5 transition-all" />
                </button>

                <button
                  onClick={onOpenClaim}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-[#C6A66B]/50 bg-[#C6A66B]/10 hover:bg-[#C6A66B]/20 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#C6A66B] text-[#123B32] flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#123B32]">
                        {language === 'bn' ? 'খাস জমি বরাদ্দের আবেদন' : 'Draft Khas Claim (Sec 86/87)'}
                      </h4>
                      <p className="text-[11px] text-gray-600">Auto-filled for AC Land</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#123B32] group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setCurrentPage('satellite')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-[#D9E1DC] hover:border-[#123B32] hover:bg-[#F5F1E8] text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#123B32]">
                        {language === 'bn' ? 'স্যাটেলাইট টাইম-সিরিজ ল্যাব' : 'Sentinel-2 Satellite Lab'}
                      </h4>
                      <p className="text-[11px] text-gray-500">Inspect radar & NDWI layers</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#123B32] group-hover:translate-x-0.5 transition-all" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column (2 spans - Land Loss Certificate & Legal Evidence) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Official Digital Certificate Summary Card */}
            <div className="bg-white border-2 border-[#123B32]/20 rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E8ECE9] gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                    <h3 className="text-base font-black text-[#123B32]">
                      {language === 'bn' ? 'নদীভাঙনে বিলীন ভূমির ডিজিটাল সাক্ষ্য প্রমাণ' : 'Submerged Land Proof & Claim Dossier'}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'bn'
                      ? 'বাংলাদেশ রাষ্ট্রীয় অধিগ্রহণ ও প্রজাস্বত্ব আইন ১৯৫০ (ধারা ৮৬/৮৭) এর অধীনে সংরক্ষিত'
                      : 'Governed under State Acquisition and Tenancy Act 1950 (Section 86/87)'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="font-mono text-xs bg-[#F5F1E8] border border-[#D9E1DC] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-gray-700">
                    <span className="text-gray-400">ID:</span>
                    <span className="font-bold text-[#123B32]">{matchedRecord.trackingId}</span>
                  </div>
                  <button
                    onClick={handleCopyTracking}
                    className="p-1.5 text-xs text-gray-500 hover:text-[#123B32] rounded border border-[#D9E1DC] bg-white hover:bg-gray-50"
                    title="Copy Tracking ID"
                  >
                    {copiedTrackingId ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Grid of Land Record Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-[#E8ECE9]">
                <div className="bg-[#F5F1E8]/70 p-3 rounded-xl border border-[#D9E1DC]/80">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {language === 'bn' ? 'খতিয়ান নম্বর' : 'Khatian No'}
                  </span>
                  <span className="text-sm font-black text-[#123B32] font-mono">
                    {currentUser.khatianNo || matchedRecord.khatianNo}
                  </span>
                </div>

                <div className="bg-[#F5F1E8]/70 p-3 rounded-xl border border-[#D9E1DC]/80">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {language === 'bn' ? 'দাগ নম্বর (CS/RS)' : 'Dag No (CS/RS)'}
                  </span>
                  <span className="text-sm font-black text-[#123B32] font-mono">
                    {currentUser.dagNo || matchedRecord.dagNo}
                  </span>
                </div>

                <div className="bg-[#F5F1E8]/70 p-3 rounded-xl border border-[#D9E1DC]/80">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {language === 'bn' ? 'বিলীন জমির পরিমাণ' : 'Submerged Area'}
                  </span>
                  <span className="text-sm font-black text-rose-700 font-mono">
                    {currentUser.lostArea || matchedRecord.submergedAreaAcre} {language === 'bn' ? 'একর' : 'Acres'}
                  </span>
                </div>

                <div className="bg-[#F5F1E8]/70 p-3 rounded-xl border border-[#D9E1DC]/80">
                  <span className="text-[11px] font-medium text-gray-500 block">
                    {language === 'bn' ? 'বিলীনের বছর' : 'Submersion Year'}
                  </span>
                  <span className="text-sm font-black text-[#123B32] font-mono">
                    {currentUser.submersionYear || matchedRecord.submersionYear}
                  </span>
                </div>
              </div>

              {/* Geographic and River Jurisdiction */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">{language === 'bn' ? 'মৌজা ও জে.এল নম্বর' : 'Mouza & JL Number'}</span>
                  <span className="font-semibold text-gray-800">{currentUser.mouza || matchedRecord.mouza} ({matchedRecord.jlNumber})</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">{language === 'bn' ? 'উপজেলা ও জেলা' : 'Upazila & District'}</span>
                  <span className="font-semibold text-gray-800">{currentUser.upazila || matchedRecord.upazila}, {currentUser.district || matchedRecord.district}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">{language === 'bn' ? 'নদী অববাহিকা' : 'River Basin'}</span>
                  <span className="font-semibold text-gray-800">{currentUser.riverName || matchedRecord.riverBasin}</span>
                </div>
              </div>

              {/* Satellite Verification Status Banner */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-emerald-950">
                        {language === 'bn' ? 'ইউরোপিয়ান স্পেস এজেন্সি (ESA Sentinel-2) নিশ্চিতকৃত' : 'ESA Sentinel-2 Multi-Spectral Verification'}
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-600 text-white">
                        {matchedRecord.satelliteSentinelMatch}% MATCH
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      Water Index (NDWI) radar reflections correlate erosion event with {currentUser.submersionYear || matchedRecord.submersionYear} flood surges.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenCertificate(matchedRecord)}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সার্টিফিকেট খুলুন' : 'Open Certificate'}</span>
                </button>
              </div>

            </div>

            {/* Application Progress Status */}
            <div className="bg-white border border-[#D9E1DC] rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#123B32] uppercase tracking-wider mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#C6A66B]" />
                  <span>{language === 'bn' ? 'ভূমি রেকর্ড ও এসিল্যান্ড অফিস ট্র্যাকিং' : 'AC Land Office Status & Next Steps'}</span>
                </span>
                <span className="text-xs font-bold text-[#C6A66B] bg-[#123B32] px-2.5 py-1 rounded-full">
                  Step 2 of 4 Complete
                </span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">
                      1. Evidence Recorded & Registered
                    </h5>
                    <p className="text-[11px] text-gray-500">
                      Identity verified via NID, CS/RS dag recorded in immutable ledger.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">
                      2. Satellite Sentinel-2 & Radar Match
                    </h5>
                    <p className="text-[11px] text-gray-500">
                      Independent satellite analysis confirmed land submersion beneath active river channel.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#C6A66B] text-[#123B32] flex items-center justify-center shrink-0 text-xs font-bold animate-pulse">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">
                      3. Official Claim Application Submission
                    </h5>
                    <p className="text-[11px] text-gray-600">
                      File your Section 86/87 Tenancy Claim to UNO & AC Land for priority re-emerged char or khas land allocation.
                    </p>
                    <button
                      onClick={onOpenClaim}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#123B32] bg-[#C6A66B]/20 hover:bg-[#C6A66B]/30 px-3 py-1.5 rounded-lg border border-[#C6A66B]/40 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'আবেদনের খসড়া তৈরি করুন' : 'Generate Formal Application Form'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 text-xs font-bold">
                    4
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-700">
                      4. Hearing & Khas Allotment Order
                    </h5>
                    <p className="text-[11px] text-gray-500">
                      AC Land field survey and district collectorate gazette notification.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

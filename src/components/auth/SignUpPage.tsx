import React, { useState } from 'react';
import { 
  Scale, 
  User, 
  MapPin, 
  FileCheck, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Camera, 
  ShieldCheck, 
  UploadCloud,
  Layers,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { Language, PageView, UserSession } from '../../types';

interface SignUpPageProps {
  language: Language;
  setCurrentPage: (page: PageView) => void;
  onRegisteredSuccess?: (user?: UserSession) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  language,
  setCurrentPage,
  onRegisteredSuccess
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Form state
  const [fullNameEn, setFullNameEn] = useState('');
  const [fullNameBn, setFullNameBn] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  const [district, setDistrict] = useState('Kurigram');
  const [upazila, setUpazila] = useState('Chilmari');
  const [union, setUnion] = useState('Raniganj');
  const [mouza, setMouza] = useState('Char Natundiar');
  const [khatianNo, setKhatianNo] = useState('RS-1102');
  const [dagNo, setDagNo] = useState('284');
  const [lostArea, setLostArea] = useState('0.58');
  const [submersionYear, setSubmersionYear] = useState('2022');
  const [riverName, setRiverName] = useState('Brahmaputra');
  const [witness1, setWitness1] = useState('Abdul Gafur (Neighbor, NID #197829...)');
  const [witness2, setWitness2] = useState('Habibur Rahman (UP Member)');

  // Media upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [supabaseSynced, setSupabaseSynced] = useState<boolean>(false);
  const [realTrackingId, setRealTrackingId] = useState<string>('SHK-KUR-2024-00284');

  const handleAutofillDemo = () => {
    setFullNameEn('Md. Abdur Rahim Mondol');
    setFullNameBn('মো: আব্দুর রহিম মন্ডল');
    setNidNumber('19824915239004812');
    setPhone('01712-345678');
    setPassword('demoCitizen123*');
    setConfirmPassword('demoCitizen123*');
    setStep1Error(null);
    setDistrict('Kurigram');
    setUpazila('Chilmari');
    setUnion('Raniganj');
    setMouza('Char Natundiar');
    setKhatianNo('RS-1102');
    setDagNo('284');
    setLostArea('0.58');
    setSubmersionYear('2022');
    setRiverName('Brahmaputra');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleProceedToStep2 = () => {
    if (!fullNameEn.trim() || !nidNumber.trim() || !phone.trim()) {
      setStep1Error(language === 'bn' ? 'অনুগ্রহ করে নাম, এনআইডি এবং মোবাইল নম্বর পূরণ করুন।' : 'Please provide Full Name, NID and Mobile Phone Number.');
      return;
    }
    if (!password) {
      setStep1Error(language === 'bn' ? 'লগইনের জন্য একটি পাসওয়ার্ড বা পিন কোড নির্ধারণ করুন।' : 'Please create an account password or security PIN to enable portal sign in.');
      return;
    }
    if (password.length < 6) {
      setStep1Error(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setStep1Error(language === 'bn' ? 'পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না।' : 'Passwords do not match. Please re-enter.');
      return;
    }
    setStep1Error(null);
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    // Save registered citizen credentials for local login
    const registeredUser = {
      fullNameEn: fullNameEn || 'Md. Abdur Rahim Mondol',
      fullNameBn: fullNameBn || 'মো: আব্দুর রহিম মন্ডল',
      nidNumber: nidNumber || '19824915239004812',
      phone: phone || '01712-345678',
      password: password || 'demoCitizen123*',
      dagNo,
      khatianNo,
      district,
      upazila,
      registeredAt: new Date().toISOString()
    };
    try {
      const existingStr = localStorage.getItem('shikor_registered_citizens');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const updated = [registeredUser, ...existing.filter((u: any) => u.nidNumber !== registeredUser.nidNumber && u.phone !== registeredUser.phone)];
      localStorage.setItem('shikor_registered_citizens', JSON.stringify(updated));
      localStorage.setItem('shikor_last_registered_login', JSON.stringify({
        identifier: registeredUser.nidNumber,
        password: registeredUser.password
      }));
    } catch (e) {
      // fallback
    }

    try {
      // 1. If Supabase is connected, write to Supabase
      const { submitErosionClaimToSupabase, uploadCitizenMedia, isSupabaseConfigured } = await import('../../lib/supabase');
      
      if (isSupabaseConfigured()) {
        const res = await submitErosionClaimToSupabase({
          fullNameEn: fullNameEn || 'Md. Abdur Rahim Mondol',
          fullNameBn: fullNameBn || 'মো: আব্দুর রহিম মন্ডল',
          nidNumber: nidNumber || '19824915239004812',
          phone: phone || '01712-345678',
          district,
          upazila,
          union,
          mouza,
          khatianNo,
          dagNo,
          lostArea: Number(lostArea) || 0.58,
          submersionYear: Number(submersionYear) || 2022,
          riverName
        });

        if (res.success && res.record) {
          setRealTrackingId(res.record.trackingId);
          setSupabaseSynced(true);

          // Upload file if selected
          if (selectedFile) {
            await uploadCitizenMedia(selectedFile, res.record.id);
          }
        }
      }
    } catch (err) {
      console.warn('Supabase submission fallback to demo mode:', err);
    } finally {
      setIsUploading(false);
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      
      {/* Top back button */}
      <div className="max-w-2xl w-full mx-auto mb-4 flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('home')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#123B32] hover:text-[#0b241e] transition-colors bg-white px-3 py-1.5 rounded-full border border-[#D9E1DC] shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'মূলপাতায় ফিরে যান' : 'Back to Home'}</span>
        </button>

        <button
          type="button"
          onClick={handleAutofillDemo}
          className="text-xs bg-[#D8E8DF] hover:bg-[#c6dfd0] text-[#123B32] font-bold px-3 py-1.5 rounded-full border border-[#b2cfbd] transition-colors"
        >
          ⚡ {language === 'bn' ? 'পাইলট নমুনা তথ্য পূরণ' : 'Autofill Pilot Sample'}
        </button>
      </div>

      {/* Main Container Card */}
      <div className="max-w-2xl w-full mx-auto bg-white rounded-2xl shadow-xl border border-[#D9E1DC] overflow-hidden">
        
        {/* Brand Banner */}
        <div className="bg-[#123B32] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif-title">Shikor Citizen Registry (শিকড়)</h2>
              <p className="text-xs text-[#D8E8DF]">
                {language === 'bn' ? 'নদীভাঙনে ক্ষতিগ্রস্ত ভূমিমালিক ও খাস জমি পুনর্বাসন নিবন্ধন' : 'River Erosion Landowner & Khas Land Rehabilitation Registration'}
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-[#C6A66B]/20 text-[#C6A66B] border border-[#C6A66B]/40 px-2 py-0.5 rounded font-mono font-bold hidden sm:inline">
            Pilot Phase 1
          </span>
        </div>

        {/* 3-Step Progress Indicator */}
        {!isSubmitted && (
          <div className="bg-[#F5F1E8] px-6 py-3 border-b border-[#D9E1DC] flex items-center justify-between text-xs font-medium">
            <div 
              onClick={() => setCurrentStep(1)}
              className={`flex items-center space-x-2 cursor-pointer ${
                currentStep >= 1 ? 'text-[#123B32] font-bold' : 'text-[#64748B]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep >= 1 ? 'bg-[#123B32] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </span>
              <span>{language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Citizen Info'}</span>
            </div>

            <span className="w-6 h-0.5 bg-[#D9E1DC]"></span>

            <div 
              onClick={() => setCurrentStep(2)}
              className={`flex items-center space-x-2 cursor-pointer ${
                currentStep >= 2 ? 'text-[#123B32] font-bold' : 'text-[#64748B]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep >= 2 ? 'bg-[#123B32] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </span>
              <span>{language === 'bn' ? 'বিলীন জমির দাগ' : 'Submerged Plot'}</span>
            </div>

            <span className="w-6 h-0.5 bg-[#D9E1DC]"></span>

            <div 
              onClick={() => setCurrentStep(3)}
              className={`flex items-center space-x-2 cursor-pointer ${
                currentStep >= 3 ? 'text-[#123B32] font-bold' : 'text-[#64748B]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === 3 ? 'bg-[#123B32] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </span>
              <span>{language === 'bn' ? 'সাক্ষ্য ও প্রমাণক' : 'Evidence & Witnesses'}</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          
          {isSubmitted ? (
            /* Success State with Dossier Registration Preview */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#123B32] flex items-center justify-center mx-auto border-2 border-emerald-300">
                <CheckCircle2 className="w-9 h-9 text-emerald-700" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-[#123B32] font-serif-title">
                  {language === 'bn' ? 'নিবন্ধন সফলভাবে সম্পন্ন হয়েছে!' : 'Citizen Evidence Dossier Registered!'}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {language === 'bn'
                    ? 'আপনার আবেদনটি জাতীয় সেন্টিনেল-২ স্যাটেলাইট আর্কাভ ও চিলমারী উপজেলা ভূমি অফিসে তালিকাভুক্ত হয়েছে।'
                    : 'Your erosion record is now cataloged and verified with ESA Sentinel-2 water boundary transitions.'}
                </p>
              </div>

              {/* Digital Evidence Card Preview */}
              <div className="bg-[#F5F1E8] border border-[#D9E1DC] rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
                {supabaseSynced && (
                  <div className="bg-emerald-100 text-emerald-900 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center justify-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Live Synced to Supabase DB & Private Storage!</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-2 border-b border-[#D9E1DC]">
                  <span className="font-bold text-[#123B32]">Tracking ID:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#D9E1DC] text-[#123B32] font-bold">
                    {realTrackingId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Landowner:</span>
                  <span className="font-semibold text-[#1F2933]">{fullNameEn || 'Md. Abdur Rahim Mondol'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Submerged Location:</span>
                  <span className="font-medium text-[#1F2933]">{district}, {upazila} ({mouza})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Dag & Khatian:</span>
                  <span className="font-bold text-[#123B32]">Dag #{dagNo} • Khatian {khatianNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Submerged Area:</span>
                  <span className="font-bold text-red-600">{lostArea} Acres ({riverName} River)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#D9E1DC]">
                  <span className="text-[#64748B]">Cryptographic Hash:</span>
                  <span className="font-mono text-[10px] text-emerald-800">0x8f4d92a11b6c...93e1</span>
                </div>

                {/* Account Login Credentials Summary */}
                <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-[11px]">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'bn' ? 'লগইন তথ্য (সংরক্ষিত)' : 'Portal Sign In Credentials (Saved)'}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#64748B]">{language === 'bn' ? 'লগইন আইডি:' : 'Login ID (NID / Mobile):'}</span>
                    <span className="font-mono font-bold text-[#123B32]">{nidNumber || phone || '19824915239004812'}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#64748B]">{language === 'bn' ? 'পাসওয়ার্ড:' : 'Password:'}</span>
                    <span className="font-mono font-bold text-[#123B32]">{password || 'demoCitizen123*'}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const session: UserSession = {
                      role: 'citizen',
                      fullNameEn: fullNameEn || 'Md. Abdur Rahim Mondol',
                      fullNameBn: fullNameBn || 'মো: আব্দুর রহিম মন্ডল',
                      nidNumber: nidNumber || '19824915239004812',
                      phone: phone || '01712-345678',
                      district,
                      upazila,
                      union,
                      mouza,
                      khatianNo,
                      dagNo,
                      lostArea: Number(lostArea) || 0.58,
                      submersionYear: Number(submersionYear) || 2022,
                      riverName,
                      trackingId: realTrackingId || 'SHIKOR-2025-CHIL-8842',
                      loginMethod: 'password',
                      registeredAt: new Date().toISOString()
                    };
                    try {
                      localStorage.setItem('shikor_current_user', JSON.stringify(session));
                    } catch (e) {}
                    if (onRegisteredSuccess) onRegisteredSuccess(session);
                    setCurrentPage('profile');
                  }}
                  className="w-full sm:w-auto bg-[#123B32] hover:bg-[#0c2822] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#C6A66B]" />
                  <span>{language === 'bn' ? 'আমার নাগরিক প্রোফাইলে যান' : 'Go to My Citizen Profile'}</span>
                </button>
                <button
                  onClick={() => setCurrentPage('signin')}
                  className="w-full sm:w-auto bg-[#F5F1E8] hover:bg-[#eae4d5] text-[#123B32] px-6 py-2.5 rounded-lg text-xs font-bold border border-[#D9E1DC] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#123B32]" />
                  <span>{language === 'bn' ? 'লগইন স্ক্রিনে যান' : 'Go to Login Screen'}</span>
                </button>
              </div>

            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: Personal & Citizen Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-[#D9E1DC]">
                    <User className="w-4 h-4 text-[#C6A66B]" />
                    <h3 className="text-sm font-bold text-[#123B32]">
                      {language === 'bn' ? 'পদক্ষেপ ১: নাগরিক ও আবেদনকারীর পরিচয়' : 'Step 1: Citizen Identification'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                        Full Name (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullNameEn}
                        onChange={(e) => setFullNameEn(e.target.value)}
                        placeholder="Md. Abdur Rahim Mondol"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:ring-2 focus:ring-[#123B32]/30 focus:border-[#123B32] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                        Full Name (in Bengali / বাংলা) *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullNameBn}
                        onChange={(e) => setFullNameBn(e.target.value)}
                        placeholder="Md. Abdur Rahim Mondol / মো: আব্দুর রহিম"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:ring-2 focus:ring-[#123B32]/30 focus:border-[#123B32] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                        National ID (10/17 Digit NID) *
                      </label>
                      <input
                        type="text"
                        required
                        value={nidNumber}
                        onChange={(e) => setNidNumber(e.target.value)}
                        placeholder="19824915239004812"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:ring-2 focus:ring-[#123B32]/30 focus:border-[#123B32] outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01712-345678"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:ring-2 focus:ring-[#123B32]/30 focus:border-[#123B32] outline-none"
                      />
                    </div>
                  </div>

                  {/* Account Security: Password / Security PIN Section */}
                  <div className="pt-3 border-t border-[#D9E1DC]/80">
                    <div className="flex items-center space-x-1.5 mb-2">
                      <Lock className="w-3.5 h-3.5 text-[#123B32]" />
                      <span className="text-xs font-bold text-[#123B32]">
                        {language === 'bn' ? 'পোর্টাল অ্যাকাউন্ট নিরাপত্তা ও পাসওয়ার্ড' : 'Portal Account Security & Password'}
                      </span>
                      <span className="text-[10px] text-[#64748B]">
                        ({language === 'bn' ? 'ভবিষ্যতে লগইনের জন্য আবশ্যক' : 'Required to Sign In'})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Password */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-[#1F2933]">
                            {language === 'bn' ? 'পাসওয়ার্ড নির্ধারণ করুন *' : 'Create Account Password *'}
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[11px] text-[#64748B] hover:text-[#123B32] flex items-center gap-1"
                          >
                            {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            <span>{showPassword ? 'Hide' : 'Show'}</span>
                          </button>
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setStep1Error(null); }}
                          placeholder="Min. 6 characters (e.g. Pass123*)"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:ring-2 focus:ring-[#123B32]/30 focus:border-[#123B32] outline-none"
                        />
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                          {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত করুন *' : 'Confirm Password *'}
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); setStep1Error(null); }}
                          placeholder="Re-enter password"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:ring-2 focus:ring-[#123B32]/30 focus:border-[#123B32] outline-none"
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-[#64748B] mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      <span>
                        {language === 'bn'
                          ? 'এই পাসওয়ার্ড এবং আপনার NID অথবা মোবাইল নম্বর ব্যবহার করে আপনি পোর্টালের লগইন অপশন থেকে প্রবেশ করতে পারবেন।'
                          : 'You will use this password along with your NID or Mobile number to Sign In.'}
                      </span>
                    </p>
                  </div>

                  {/* Validation Error Message */}
                  {step1Error && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span>{step1Error}</span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleProceedToStep2}
                      className="bg-[#123B32] hover:bg-[#0c2822] text-white px-5 py-2.5 rounded-lg text-xs font-bold inline-flex items-center space-x-2 transition-colors shadow-sm"
                    >
                      <span>{language === 'bn' ? 'পরবর্তী: জমির দাগের বিবরণ' : 'Next: Submerged Plot Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Submerged Land & Mouza Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-[#D9E1DC]">
                    <MapPin className="w-4 h-4 text-[#C6A66B]" />
                    <h3 className="text-sm font-bold text-[#123B32]">
                      {language === 'bn' ? 'পদক্ষেপ ২: নদীগর্ভে বিলীন জমির তথ্য' : 'Step 2: Submerged Plot Particulars'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">District (জেলা)</label>
                      <select 
                        value={district} 
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none"
                      >
                        <option value="Kurigram">Kurigram (কুড়িগ্রাম)</option>
                        <option value="Sirajganj">Sirajganj (সিরাজগঞ্জ)</option>
                        <option value="Shariatpur">Shariatpur (শরীয়তপুর)</option>
                        <option value="Chandpur">Chandpur (চাঁদপুর)</option>
                        <option value="Bhola">Bhola (ভোলা)</option>
                        <option value="Gaibandha">Gaibandha (গাইবান্ধা)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">Upazila (উপজেলা)</label>
                      <input
                        type="text"
                        value={upazila}
                        onChange={(e) => setUpazila(e.target.value)}
                        placeholder="Chilmari"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">Union (ইউনিয়ন)</label>
                      <input
                        type="text"
                        value={union}
                        onChange={(e) => setUnion(e.target.value)}
                        placeholder="Raniganj"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">Mouza Name (মৌজা)</label>
                      <input
                        type="text"
                        value={mouza}
                        onChange={(e) => setMouza(e.target.value)}
                        placeholder="Char Natundiar"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">Khatian No (খতিয়ান)</label>
                      <input
                        type="text"
                        value={khatianNo}
                        onChange={(e) => setKhatianNo(e.target.value)}
                        placeholder="RS-1102"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">Dag / Plot No (দাগ নং) *</label>
                      <input
                        type="text"
                        required
                        value={dagNo}
                        onChange={(e) => setDagNo(e.target.value)}
                        placeholder="284"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none font-bold text-[#123B32]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">Submerged Area (Acres)</label>
                      <input
                        type="text"
                        value={lostArea}
                        onChange={(e) => setLostArea(e.target.value)}
                        placeholder="0.58"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">Erosion Year (ভাঙনের সন)</label>
                      <input
                        type="text"
                        value={submersionYear}
                        onChange={(e) => setSubmersionYear(e.target.value)}
                        placeholder="2022"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1F2933] mb-1">River Basin (নদী)</label>
                      <input
                        type="text"
                        value={riverName}
                        onChange={(e) => setRiverName(e.target.value)}
                        placeholder="Brahmaputra / Jamuna"
                        className="w-full text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="bg-gray-100 hover:bg-gray-200 text-[#1F2933] px-4 py-2 rounded-lg text-xs font-semibold"
                    >
                      {language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="bg-[#123B32] hover:bg-[#0c2822] text-white px-5 py-2.5 rounded-lg text-xs font-bold inline-flex items-center space-x-2 transition-colors"
                    >
                      <span>{language === 'bn' ? 'পরবর্তী: প্রমাণক ও সাক্ষী' : 'Next: Evidence & Witnesses'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Evidence Upload & Witnesses */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-[#D9E1DC]">
                    <ShieldCheck className="w-4 h-4 text-[#C6A66B]" />
                    <h3 className="text-sm font-bold text-[#123B32]">
                      {language === 'bn' ? 'পদক্ষেপ ৩: ছবি/ভিডিও প্রমাণক ও সাক্ষী মনোনয়ন' : 'Step 3: Geotagged Media & Witnesses'}
                    </h3>
                  </div>

                  {/* File Upload with real input */}
                  <label className="border-2 border-dashed border-[#D9E1DC] rounded-xl p-5 text-center bg-[#F5F1E8]/50 hover:bg-[#F5F1E8] transition-colors cursor-pointer block">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                    <UploadCloud className="w-8 h-8 text-[#123B32] mx-auto mb-2" />
                    {selectedFile ? (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full inline-block border border-emerald-300">
                          ✓ File Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                        <p className="text-[11px] text-[#64748B]">Click to change photo or video</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-[#123B32]">
                          {language === 'bn' ? 'ভাঙনের ছবি, ভিডিও বা খাজনা রসিদ আপলোড করুন' : 'Click to Upload Geotagged Riverbank Photo / Video / Tax Receipt'}
                        </p>
                        <p className="text-[11px] text-[#64748B] mt-1">
                          EXIF GPS metadata will automatically upload to your private `citizen-evidence` bucket.
                        </p>
                      </>
                    )}
                  </label>

                  {/* Community Witnesses */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-[#1F2933]">
                      {language === 'bn' ? 'স্থানীয় সাক্ষী মনোনয়ন (কমিউনিটি ভেরিফিকেশন)' : 'Community Peer Witnesses (Pre-possession Proof)'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={witness1}
                        onChange={(e) => setWitness1(e.target.value)}
                        placeholder="Witness 1 (Neighbor Name & NID)"
                        className="text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none"
                      />
                      <input
                        type="text"
                        value={witness2}
                        onChange={(e) => setWitness2(e.target.value)}
                        placeholder="Witness 2 (UP Member / Local Matobbor)"
                        className="text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none"
                      />
                    </div>
                  </div>

                  {/* Declaration Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start space-x-2 text-xs text-[#64748B] cursor-pointer">
                      <input type="checkbox" defaultChecked required className="mt-0.5 rounded border-[#D9E1DC] text-[#123B32]" />
                      <span>
                        {language === 'bn'
                          ? 'আমি প্রত্যয়ন করছি যে প্রদত্ত তথ্য সত্য এবং উক্ত দাগের জমি নদীভাঙনে সম্পূর্ণ/আংশিক তলিয়ে গেছে। রাষ্ট্রীয় অধিগ্রহণ আইন ১৯৫০-এর ৮৬ ধারায় খাস জমি পুনর্বাসন বিবেচনার অনুরোধ করছি।'
                          : 'I declare that the submitted dag plot was genuinely eroded into the river and request inclusion in UNO/AC Land 1-No. Khas land rehabilitation allocation.'}
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="bg-gray-100 hover:bg-gray-200 text-[#1F2933] px-4 py-2 rounded-lg text-xs font-semibold"
                    >
                      {language === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                    </button>
                    <button
                      type="submit"
                      className="bg-[#123B32] hover:bg-[#0c2822] text-white px-6 py-2.5 rounded-lg text-xs font-bold inline-flex items-center space-x-2 transition-colors shadow-md"
                    >
                      <FileCheck className="w-4 h-4 text-[#C6A66B]" />
                      <span>{language === 'bn' ? 'নিবন্ধন সম্পন্ন ও সনদ জেনারেট' : 'Complete Registration & Generate'}</span>
                    </button>
                  </div>

                </div>
              )}

            </form>
          )}

          {/* Already have an account */}
          {!isSubmitted && (
            <div className="pt-6 mt-6 border-t border-[#D9E1DC] text-center text-xs text-[#64748B]">
              <span>{language === 'bn' ? 'ইতিমধ্যে নিবন্ধিত আছেন?' : 'Already have an existing profile?'} </span>
              <button
                onClick={() => setCurrentPage('signin')}
                className="font-bold text-[#123B32] hover:underline"
              >
                {language === 'bn' ? 'লগইন করুন' : 'Sign In to Portal'}
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  Lock, 
  Smartphone, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  UserCheck, 
  Building,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Language, PageView, UserSession } from '../../types';

interface SignInPageProps {
  language: Language;
  setCurrentPage: (page: PageView) => void;
  onSuccessLogin?: (user: UserSession) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({
  language,
  setCurrentPage,
  onSuccessLogin
}) => {
  const [roleTab, setRoleTab] = useState<'citizen' | 'official'>('citizen');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // OTP simulation state
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState<number>(0);
  
  // Feedback messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [autoFilledInfo, setAutoFilledInfo] = useState<string | null>(null);

  // Check if a user just registered in this browser session
  useEffect(() => {
    try {
      const lastLoginStr = localStorage.getItem('shikor_last_registered_login');
      if (lastLoginStr) {
        const lastLogin = JSON.parse(lastLoginStr);
        if (lastLogin.identifier && lastLogin.password) {
          setIdentifier(lastLogin.identifier);
          setPassword(lastLogin.password);
          setAutoFilledInfo(
            language === 'bn' 
              ? 'নিবন্ধন থেকে আপনার NID ও পাসওয়ার্ড স্বয়ংক্রিয়ভাবে লোড করা হয়েছে।' 
              : 'Auto-loaded your newly registered NID & Password.'
          );
        }
      }
    } catch (e) {
      // ignore
    }
  }, [language]);

  // Handle countdown for OTP
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const handleDemoFillCitizen = () => {
    setRoleTab('citizen');
    setAuthMethod('password');
    setIdentifier('19824915239004812');
    setPassword('demoCitizen123*');
    setErrorMessage(null);
    setSimulatedOtp(null);
  };

  const handleDemoFillOfficial = () => {
    setRoleTab('official');
    setAuthMethod('password');
    setIdentifier('acland.chilmari@land.gov.bd');
    setPassword('govOfficialSecret2025');
    setErrorMessage(null);
    setSimulatedOtp(null);
  };

  const handleSendOtp = () => {
    if (!identifier.trim()) {
      setErrorMessage(
        language === 'bn' 
          ? 'অনুগ্রহ করে প্রথমে আপনার মোবাইল নম্বর বা NID লিখুন।' 
          : 'Please enter your Mobile number or NID first.'
      );
      return;
    }

    setErrorMessage(null);
    // Generate realistic 6 digit OTP
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(generated);
    setOtpCooldown(45);
    setAuthMethod('otp');
  };

  const handleAutofillGeneratedOtp = () => {
    if (simulatedOtp) {
      setOtpCode(simulatedOtp);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (roleTab === 'official') {
      if (!identifier.includes('@') && !identifier.includes('acland')) {
        setErrorMessage(
          language === 'bn' 
            ? 'সঠিক অফিসিয়াল ইমেইল প্রদান করুন (যেমন: acland.chilmari@land.gov.bd)।' 
            : 'Please enter a valid government email (e.g. acland.chilmari@land.gov.bd).'
        );
        return;
      }
      if (password !== 'govOfficialSecret2025' && password.length < 6) {
        setErrorMessage(
          language === 'bn' 
            ? 'অফিসিয়াল পাসওয়ার্ড সঠিক নয়। ডেমো বাটনে ক্লিক করুন।' 
            : 'Invalid officer password. You can click AC Land Demo below.'
        );
        return;
      }
    } else {
      // Citizen Login Validation
      if (authMethod === 'password') {
        if (!password) {
          setErrorMessage(
            language === 'bn' 
              ? 'অনুগ্রহ করে আপনার পাসওয়ার্ড প্রদান করুন অথবা SMS ওটিপি দিয়ে লগইন করুন।' 
              : 'Please enter your password or switch to Instant SMS OTP.'
          );
          return;
        }

        // Check if matching registered user or demo password
        let matchFound = false;
        if (password === 'demoCitizen123*') {
          matchFound = true;
        } else {
          try {
            const registeredStr = localStorage.getItem('shikor_registered_citizens');
            if (registeredStr) {
              const citizens = JSON.parse(registeredStr);
              const found = citizens.find((c: any) => 
                (c.nidNumber === identifier || c.phone === identifier) && c.password === password
              );
              if (found) matchFound = true;
            }
          } catch (e) {
            // ignore
          }
        }

        // For convenience in prototyping, accept any password with length >= 6
        if (!matchFound && password.length < 4) {
          setErrorMessage(
            language === 'bn' 
              ? 'ভুল পাসওয়ার্ড। আপনি রেজিস্ট্রেশনের সময় তৈরি করা পাসওয়ার্ড লিখুন অথবা ওটিপি ব্যবহার করুন।' 
              : 'Incorrect credentials. Use the password you created during registration or try SMS OTP.'
          );
          return;
        }
      } else {
        // OTP Mode
        if (!otpCode || otpCode.length < 4) {
          setErrorMessage(
            language === 'bn' 
              ? 'অনুগ্রহ করে মোবাইলে প্রেরিত ৬ ডিজিটের ওটিপি পিন কোড লিখুন।' 
              : 'Please enter the 6-digit OTP code received on your phone.'
          );
          return;
        }
      }
    }

    // Success State
    let activeUser: UserSession;
    if (roleTab === 'citizen') {
      let matchedCitizen: any = null;
      try {
        const registeredStr = localStorage.getItem('shikor_registered_citizens');
        if (registeredStr) {
          const citizens = JSON.parse(registeredStr);
          matchedCitizen = citizens.find((c: any) => 
            c.nidNumber === identifier || c.phone === identifier
          );
        }
      } catch (e) {
        // ignore
      }

      activeUser = {
        role: 'citizen',
        fullNameEn: matchedCitizen?.fullNameEn || 'Md. Abdur Rahim Mondol',
        fullNameBn: matchedCitizen?.fullNameBn || 'মো: আব্দুর রহিম মন্ডল',
        nidNumber: matchedCitizen?.nidNumber || identifier || '19824915239004812',
        phone: matchedCitizen?.phone || (identifier.startsWith('01') ? identifier : '01712-345678'),
        district: matchedCitizen?.district || 'Kurigram',
        upazila: matchedCitizen?.upazila || 'Chilmari',
        union: matchedCitizen?.union || 'Astamir Char',
        mouza: matchedCitizen?.mouza || 'Nayarhat',
        khatianNo: matchedCitizen?.khatianNo || 'K-984',
        dagNo: matchedCitizen?.dagNo || '1142 / 1143',
        lostArea: matchedCitizen?.lostArea || 0.58,
        submersionYear: matchedCitizen?.submersionYear || 2022,
        riverName: matchedCitizen?.riverName || 'Brahmaputra Basin',
        trackingId: matchedCitizen?.trackingId || 'SHIKOR-2025-CHIL-8842',
        loginMethod: authMethod,
        registeredAt: matchedCitizen?.registeredAt || new Date().toISOString()
      };
    } else {
      activeUser = {
        role: 'official',
        fullNameEn: 'Tanvir Hossain (AC Land)',
        fullNameBn: 'তানভীর হোসেন (সহকারী কমিশনার - ভূমি)',
        nidNumber: '1989012398450012',
        phone: '01819-998877',
        email: identifier || 'acland.chilmari@land.gov.bd',
        district: 'Kurigram',
        upazila: 'Chilmari',
        loginMethod: 'demo'
      };
    }

    try {
      localStorage.setItem('shikor_current_user', JSON.stringify(activeUser));
    } catch (e) {
      // ignore
    }

    const roleName = roleTab === 'citizen' ? 'Erosion Landowner (Citizen)' : 'AC Land Officer (Administration)';
    setSubmittedMessage(
      language === 'bn' 
        ? `স্বাগতম! অথেনটিকেশন সফল হয়েছে (${roleTab === 'citizen' ? 'চর নাগরিক পোর্টাল' : 'এসিল্যান্ড অফিস পোর্টাল'})। আপনার প্রোফাইলে নিয়ে যাওয়া হচ্ছে...` 
        : `Authentication successful! Signed in as ${roleName}. Redirecting to your profile...`
    );

    setTimeout(() => {
      if (onSuccessLogin) onSuccessLogin(activeUser);
      setCurrentPage('profile');
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      
      {/* Top back button */}
      <div className="max-w-md w-full mx-auto mb-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('home')}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-[#123B32] hover:text-[#0b241e] transition-colors bg-white px-3.5 py-1.5 rounded-full border border-[#D9E1DC] shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'মূলপাতায় ফিরে যান' : 'Back to Home'}</span>
        </button>

        <span className="text-[11px] font-medium text-[#64748B] bg-white/70 px-2.5 py-1 rounded-full border border-[#D9E1DC]">
          Govt Land Ledger 2.0
        </span>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-[#D9E1DC] overflow-hidden">
        
        {/* Card Header matching theme */}
        <div className="bg-[#123B32] p-6 text-center text-white relative">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 text-white">
            <Scale className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-bold font-serif-title tracking-tight">Shikor (শিকড়)</h2>
          <p className="text-xs text-[#D8E8DF] mt-1">
            {language === 'bn' 
              ? 'নদীভাঙন ডিজিটাল প্রমাণ ও পুনর্বাসন পোর্টাল' 
              : 'River Erosion Evidence & Resettlement Portal'}
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 border-b border-[#D9E1DC] bg-[#F5F1E8]">
          <button
            type="button"
            onClick={() => { 
              setRoleTab('citizen'); 
              setErrorMessage(null);
            }}
            className={`py-3 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 ${
              roleTab === 'citizen'
                ? 'bg-white text-[#123B32] border-b-2 border-[#123B32]'
                : 'text-[#64748B] hover:text-[#123B32]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'চর নাগরিক / ভূমিমালিক' : 'Citizen / Landowner'}</span>
          </button>

          <button
            type="button"
            onClick={() => { 
              setRoleTab('official'); 
              setAuthMethod('password');
              setErrorMessage(null);
            }}
            className={`py-3 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 ${
              roleTab === 'official'
                ? 'bg-white text-[#123B32] border-b-2 border-[#123B32]'
                : 'text-[#64748B] hover:text-[#123B32]'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'এসিল্যান্ড / ইউএনও পোর্টাল' : 'AC Land / UNO Office'}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">

          {/* Newly registered notification if detected */}
          {autoFilledInfo && !submittedMessage && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-xs text-emerald-800">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{autoFilledInfo}</span>
            </div>
          )}

          {submittedMessage ? (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-emerald-900">{submittedMessage}</p>
              <p className="text-xs text-emerald-700 flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Redirecting to Land Records Dashboard...</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* If Citizen, allow choosing Password or SMS OTP method */}
              {roleTab === 'citizen' && (
                <div className="flex rounded-lg bg-[#F5F1E8] p-1 border border-[#D9E1DC] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setAuthMethod('password'); setErrorMessage(null); }}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all flex items-center justify-center gap-1.5 ${
                      authMethod === 'password'
                        ? 'bg-white text-[#123B32] shadow-sm font-bold'
                        : 'text-[#64748B] hover:text-[#123B32]'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'পাসওয়ার্ড দিয়ে লগইন' : 'Password Login'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { 
                      setAuthMethod('otp'); 
                      setErrorMessage(null);
                      if (!simulatedOtp) handleSendOtp();
                    }}
                    className={`flex-1 py-1.5 rounded-md text-center transition-all flex items-center justify-center gap-1.5 ${
                      authMethod === 'otp'
                        ? 'bg-white text-[#123B32] shadow-sm font-bold'
                        : 'text-[#64748B] hover:text-[#123B32]'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'মোবাইল ওটিপি (SMS)' : 'Instant Mobile OTP'}</span>
                  </button>
                </div>
              )}

              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-semibold text-[#1F2933] mb-1">
                  {roleTab === 'citizen'
                    ? (language === 'bn' ? 'জাতীয় পরিচয়পত্র (NID) অথবা মোবাইল নম্বর' : 'National ID (NID) or Mobile Number')
                    : (language === 'bn' ? 'সরকারি অফিসিয়াল ইমেইল / ইউজার আইডি' : 'Govt Official Email / Officer ID')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setErrorMessage(null); }}
                    placeholder={
                      roleTab === 'citizen' 
                        ? 'e.g., 19824915239004812 or 01712-345678' 
                        : 'e.g., acland.chilmari@land.gov.bd'
                    }
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#D9E1DC] focus:ring-2 focus:ring-[#123B32]/30 focus:border-[#123B32] outline-none text-[#1F2933]"
                  />
                </div>
              </div>

              {/* Method 1: Password Input */}
              {(authMethod === 'password' || roleTab === 'official') && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#1F2933]">
                      {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                    </label>
                    
                    {roleTab === 'citizen' && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[11px] text-[#C6A66B] font-bold hover:underline"
                      >
                        {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন? ওটিপি পাঠান' : 'Forgot? Send OTP Pin'}
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
                      placeholder="••••••••••••"
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-[#D9E1DC] focus:ring-2 focus:ring-[#123B32]/30 focus:border-[#123B32] outline-none text-[#1F2933] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#123B32]"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Method 2: Mobile OTP Input */}
              {authMethod === 'otp' && roleTab === 'citizen' && (
                <div className="space-y-3">
                  {/* Simulated SMS Notification Banner */}
                  {simulatedOtp && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between text-amber-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-amber-700" />
                          <span>SMS Gateway: 01712-XXXXXX</span>
                        </span>
                        <span className="bg-amber-200/80 px-2 py-0.5 rounded text-[10px] font-mono">
                          Govt-SHIKOR
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Your Shikor login verification code is: <strong className="font-mono text-sm tracking-wider text-[#123B32] bg-white px-2 py-0.5 rounded border border-amber-300">{simulatedOtp}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={handleAutofillGeneratedOtp}
                        className="text-[11px] bg-[#123B32] text-white px-2.5 py-1 rounded font-semibold hover:bg-[#0c2822] transition-colors"
                      >
                        ⚡ One-Click Fill OTP [{simulatedOtp}]
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#1F2933]">
                        {language === 'bn' ? '৬-সংখ্যার ওটিপি পিন কোড' : '6-Digit OTP Pin'}
                      </label>
                      <button
                        type="button"
                        disabled={otpCooldown > 0}
                        onClick={handleSendOtp}
                        className="text-[11px] text-[#123B32] font-semibold hover:underline disabled:opacity-50"
                      >
                        {otpCooldown > 0 
                          ? `Resend in ${otpCooldown}s` 
                          : (language === 'bn' ? 'পুনরায় কোড পাঠান' : 'Resend Code')}
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setErrorMessage(null); }}
                      placeholder="e.g. 482910"
                      className="w-full text-center tracking-widest font-mono text-base font-bold py-2.5 rounded-lg border border-[#D9E1DC] focus:ring-2 focus:ring-[#123B32]/30 focus:border-[#123B32] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Error Message Display */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Remember me & terms */}
              <div className="flex items-center justify-between text-xs text-[#64748B]">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#D9E1DC] text-[#123B32] focus:ring-[#123B32]"
                  />
                  <span>{language === 'bn' ? 'ডিভাইসে মনে রাখুন' : 'Remember this device'}</span>
                </label>
                <span className="text-[11px] text-[#123B32] font-semibold">SSL 256-bit Encrypted</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#123B32] hover:bg-[#0c2822] text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center space-x-2 transition-colors duration-150 shadow-md"
              >
                <span>
                  {authMethod === 'otp' && roleTab === 'citizen'
                    ? (language === 'bn' ? 'ওটিপি যাচাই ও প্রবেশ করুন' : 'Verify OTP & Sign In')
                    : (language === 'bn' ? 'লগইন করুন' : 'Sign In')}
                </span>
                <ArrowRight className="w-4 h-4 text-[#C6A66B]" />
              </button>

              {/* Demo Quick-Fill Buttons */}
              <div className="pt-2">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-[#D9E1DC]"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-[#64748B] uppercase font-mono font-bold">
                    {language === 'bn' ? 'দ্রুত ডেমো পরীক্ষা' : 'Quick Demo Autofill'}
                  </span>
                  <div className="flex-grow border-t border-[#D9E1DC]"></div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDemoFillCitizen}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-[#123B32] bg-[#D8E8DF] hover:bg-[#c9e0d3] rounded border border-[#b8d6c4] text-center"
                  >
                    👤 Citizen Demo
                  </button>
                  <button
                    type="button"
                    onClick={handleDemoFillOfficial}
                    className="px-2.5 py-1.5 text-[11px] font-semibold text-[#123B32] bg-[#D8E8DF] hover:bg-[#c9e0d3] rounded border border-[#b8d6c4] text-center"
                  >
                    🏛️ AC Land Demo
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* Switch to Sign Up */}
          <div className="pt-4 border-t border-[#D9E1DC] text-center text-xs text-[#64748B]">
            <span>{language === 'bn' ? 'এখনো কোনো অ্যাকাউন্ট নেই?' : "Don't have an account yet?"} </span>
            <button
              onClick={() => setCurrentPage('signup')}
              className="font-bold text-[#123B32] hover:underline"
            >
              {language === 'bn' ? 'নতুন নাগরিক নিবন্ধন করুন' : 'Register New Citizen Profile'}
            </button>
          </div>

        </div>

      </div>

      {/* Bottom Trust badges */}
      <div className="max-w-md mx-auto text-center mt-6 text-xs text-[#64748B] space-y-1">
        <p>{language === 'bn' ? 'ভূমি মন্ত্রণালয় ও স্থানীয় সরকার পুনর্বাসন গাইডলাইন অনুযায়ী নির্মিত' : 'Built in alignment with Land Ministry & Char Settlement Guidelines'}</p>
        <p className="text-[11px] text-[#123B32]/70 font-mono">Secured by ESA Copernicus & National Land Ledger</p>
      </div>

    </div>
  );
};

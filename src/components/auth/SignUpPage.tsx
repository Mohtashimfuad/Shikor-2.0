import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Scale } from 'lucide-react';
import type { Language, PageView } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  validateCitizenSignup,
  type CitizenSignupErrorCode,
  type SignupFieldError,
} from '../../lib/phase1';

interface SignUpPageProps {
  language: Language;
  setCurrentPage: (page: PageView) => void;
}

const validationMessage = (error: SignupFieldError, language: Language): string => {
  const messages: Record<SignupFieldError, { bn: string; en: string }> = {
    fullName: { bn: 'পূর্ণ নাম লিখুন।', en: 'Enter your full name.' },
    phone: { bn: 'বাংলাদেশের সঠিক মোবাইল নম্বর লিখুন।', en: 'Enter a valid Bangladesh mobile number.' },
    email: { bn: 'সঠিক ইমেইল ঠিকানা লিখুন।', en: 'Enter a valid email address.' },
    nid: { bn: '১০, ১৩ অথবা ১৭ সংখ্যার NID লিখুন।', en: 'Enter a 10, 13, or 17 digit NID number.' },
    password: { bn: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।', en: 'Password must be at least 8 characters.' },
    confirmPassword: { bn: 'দুটি পাসওয়ার্ড মিলছে না।', en: 'The passwords do not match.' },
    privacyConsent: { bn: 'ব্যক্তিগত তথ্য নিরাপদে ব্যবহারের সম্মতি দিন।', en: 'Consent to secure processing of your personal information.' },
  };
  return messages[error][language];
};

export const SignUpPage: React.FC<SignUpPageProps> = ({ language, setCurrentPage }) => {
  const { signUpCitizen, isDemoMode } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nid, setNid] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    const validationError = validateCitizenSignup({ fullName, phone, email, nid, password, confirmPassword, privacyConsent });
    if (validationError) {
      setErrorMessage(validationMessage(validationError, language));
      return;
    }
    setIsSubmitting(true);
    let signupError: CitizenSignupErrorCode | null = null;
    try {
      const result = await signUpCitizen({ email, password, fullName, phone, nid, privacyConsent });
      signupError = result.error;
    } catch {
      signupError = 'network_error';
    } finally {
      setIsSubmitting(false);
    }
    if (signupError) {
      const messages: Record<CitizenSignupErrorCode, { bn: string; en: string }> = {
        service_not_configured: {
          bn: 'নিবন্ধন সেবা বর্তমানে কনফিগার করা নেই। সহায়তায় যোগাযোগ করুন।',
          en: 'The registration service is not configured. Please contact support.',
        },
        invalid_details: {
          bn: 'নিবন্ধনের তথ্য যাচাই করা যায়নি। ফর্মের তথ্য পরীক্ষা করে আবার চেষ্টা করুন।',
          en: 'We could not validate the registration details. Review the form and try again.',
        },
        network_error: {
          bn: 'নিবন্ধন সেবা সাময়িকভাবে পাওয়া যাচ্ছে না। কিছুক্ষণ পর আবার চেষ্টা করুন বা সহায়তায় যোগাযোগ করুন।',
          en: 'The registration service is temporarily unavailable. Please try again later or contact support.',
        },
        registration_failed: {
          bn: 'নিবন্ধন সম্পন্ন করা যায়নি। অ্যাকাউন্ট থাকলে লগইন বা পাসওয়ার্ড পুনরুদ্ধার করুন; অন্যথায় পরে আবার চেষ্টা করুন।',
          en: 'Registration could not be completed. If you already have an account, sign in or reset your password; otherwise try again later.',
        },
        registration_unavailable: {
          bn: 'Supabase সংযুক্ত না থাকায় বাস্তব নিবন্ধন বন্ধ আছে।',
          en: 'Live registration is unavailable because Supabase is not configured.',
        },
      };
      setErrorMessage(messages[signupError][language]);
      return;
    }
    setSubmitted(true);
  };

  const copy = (bn: string, en: string) => language === 'bn' ? bn : en;

  return (
    <div className="min-h-[85vh] bg-[#F5F1E8] py-10 px-4 sm:px-6 flex flex-col justify-center">
      <div className="max-w-xl w-full mx-auto mb-5">
        <button onClick={() => setCurrentPage('home')} className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B32] bg-white px-3.5 py-2 rounded-full border border-[#D9E1DC] shadow-sm">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{copy('মূলপাতায় ফিরে যান', 'Back to Home')}</span>
        </button>
      </div>

      <section className="max-w-xl w-full mx-auto bg-white rounded-2xl shadow-xl border border-[#D9E1DC] overflow-hidden">
        <header className="bg-[#123B32] px-6 py-5 text-white flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center"><Scale className="w-5 h-5" /></div>
          <div>
            <h1 className="text-xl font-bold font-serif-title">{copy('Shikor নাগরিক নিবন্ধন', 'Shikor Citizen Registration')}</h1>
            <p className="text-xs text-[#D8E8DF]">{copy('নিরাপদ ইমেইল যাচাইকরণসহ নাগরিক অ্যাকাউন্ট', 'Citizen account with secure email verification')}</p>
          </div>
        </header>

        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="py-5 text-center space-y-4">
              <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-700" />
              <h2 className="text-xl font-bold text-[#123B32]">{copy('ইমেইল যাচাই করুন', 'Verify your email')}</h2>
              <p className="text-sm text-[#64748B]">
                {copy('আপনার ইমেইলে পাঠানো নিশ্চিতকরণ লিংক খুলে অ্যাকাউন্ট সক্রিয় করুন। লিংকটি যাচাই করে নাগরিক ড্যাশবোর্ড খুলবে।', 'Open the confirmation link sent to your email to activate your account. The verified link will open the Citizen Dashboard.')}
              </p>
              <button onClick={() => setCurrentPage('signin')} className="mt-2 bg-[#123B32] text-white px-6 py-2.5 rounded-lg text-sm font-bold">
                {copy('নাগরিক লগইন', 'Citizen Login')}
              </button>
            </div>
          ) : (
            <>
              {isDemoMode && (
                <div className="mb-5 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">
                  {copy('Supabase সংযুক্ত না থাকায় বাস্তব নিবন্ধন বন্ধ আছে।', 'Live registration is unavailable because Supabase is not configured.')}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2933] mb-1">{copy('পূর্ণ নাম', 'Full name')} *</label>
                  <input required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2933] mb-1">{copy('মোবাইল নম্বর', 'Phone number')} *</label>
                  <input required type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01XXXXXXXXX" className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2933] mb-1">{copy('ইমেইল ঠিকানা', 'Email address')} *</label>
                  <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2933] mb-1">{copy('জাতীয় পরিচয়পত্র নম্বর (NID)', 'NID number')} *</label>
                  <input required inputMode="numeric" autoComplete="off" value={nid} onChange={(event) => setNid(event.target.value.replace(/\D/g, ''))} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" />
                  <p className="mt-1 text-[11px] text-[#64748B]">{copy('তথ্যটি ব্যক্তিগতভাবে সংরক্ষিত হবে। এটি সরকারি NID যাচাইকরণ নয়।', 'Stored as private account data. This is not government NID verification.')}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2933] mb-1">{copy('পাসওয়ার্ড', 'Password')} *</label>
                  <div className="relative">
                    <input required type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-3.5 py-2.5 pr-11 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" />
                    <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]" aria-label={copy('পাসওয়ার্ড দেখান', 'Show password')}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-[#64748B]">{copy('কমপক্ষে ৮ অক্ষর', 'At least 8 characters')}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1F2933] mb-1">{copy('পাসওয়ার্ড নিশ্চিত করুন', 'Confirm password')} *</label>
                  <input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" />
                </div>
                <label className="flex items-start gap-2 text-xs text-[#64748B] cursor-pointer">
                  <input type="checkbox" checked={privacyConsent} onChange={(event) => setPrivacyConsent(event.target.checked)} className="mt-0.5 rounded border-[#D9E1DC] text-[#123B32]" />
                  <span>{copy('আমি সম্মতি দিচ্ছি যে Shikor আমার নিবন্ধন তথ্য নিরাপদে প্রক্রিয়া ও সংরক্ষণ করবে।', 'I consent to Shikor securely processing and storing my registration information.')}</span>
                </label>

                {errorMessage && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMessage}</span></div>}

                <button type="submit" disabled={isSubmitting || isDemoMode} className="w-full bg-[#123B32] hover:bg-[#0c2822] disabled:opacity-60 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                  <KeyRound className="w-4 h-4 text-[#C6A66B]" />
                  <span>{isSubmitting ? copy('নিবন্ধন করা হচ্ছে…', 'Creating account…') : copy('নাগরিক অ্যাকাউন্ট তৈরি করুন', 'Create Citizen Account')}</span>
                </button>
              </form>
              <div className="pt-5 mt-5 border-t border-[#D9E1DC] text-center text-xs text-[#64748B] space-y-2">
                <p>{copy('ইতিমধ্যে অ্যাকাউন্ট আছে?', 'Already have an account?')} <button onClick={() => setCurrentPage('signin')} className="font-bold text-[#123B32] hover:underline">{copy('লগইন করুন', 'Sign in')}</button></p>
                <p>{copy('সরকারি কর্মকর্তা?', 'Government officer?')} <button onClick={() => setCurrentPage('officer-register')} className="font-bold text-[#123B32] hover:underline">{copy('Officer আবেদন', 'Officer Registration')}</button></p>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

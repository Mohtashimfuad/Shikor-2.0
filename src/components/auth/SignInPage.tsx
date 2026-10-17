import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, KeyRound, Scale } from 'lucide-react';
import type { Language, PageView } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { resolveLoginDestination, type LoginMode } from '../../lib/phase1';

interface SignInPageProps {
  language: Language;
  setCurrentPage: (page: PageView) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ language, setCurrentPage }) => {
  const { signIn, signOut, getOfficerApplicationStatus, isDemoMode } = useAuth();
  const [mode, setMode] = useState<LoginMode>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copy = (bn: string, en: string) => language === 'bn' ? bn : en;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || password.length < 8) {
      setErrorMessage(copy('সঠিক ইমেইল ও পাসওয়ার্ড লিখুন।', 'Enter a valid email and password.'));
      return;
    }
    if (isDemoMode && mode !== 'citizen') {
      setErrorMessage(copy('ডেমো মোডে শুধু নাগরিক অ্যাকাউন্ট ব্যবহার করা যায়।', 'Only the synthetic citizen account is available in demo mode.'));
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email, password);
    if (result.error || !result.profile) {
      setErrorMessage(result.error === 'email_verification_required'
        ? copy('ইমেইল যাচাই সম্পন্ন করুন। যাচাইকরণ লিংক আবার পাঠাতে সহায়তার সাথে যোগাযোগ করুন।', 'Verify your email before signing in. Contact support if you need another confirmation link.')
        : copy('ইমেইল বা পাসওয়ার্ড সঠিক নয়।', 'The email or password is incorrect.'));
      setIsSubmitting(false);
      return;
    }

    const application = mode === 'officer'
      ? await getOfficerApplicationStatus(result.profile.id)
      : null;
    const destination = resolveLoginDestination(
      result.profile.role,
      mode,
      application?.status === 'draft' ? null : application?.status ?? null,
    );
    setIsSubmitting(false);

    if (destination === 'pending' || destination === 'rejected') {
      setCurrentPage('officer-status');
      return;
    }
    if (mode === 'officer' && application?.status === 'draft' && result.profile.role === 'citizen') {
      setCurrentPage('officer-register');
      return;
    }
    if (destination === 'unauthorized') {
      await signOut();
      setErrorMessage(mode === 'officer'
        ? copy('অনুমোদিত Officer অ্যাকাউন্ট বা আবেদন পাওয়া যায়নি।', 'No approved Officer account or application was found.')
        : mode === 'admin'
          ? copy('এই অ্যাকাউন্টের Admin অনুমতি নেই।', 'This account is not authorized as an Admin.')
          : copy('এটি Officer অ্যাকাউন্ট। Officer Login ব্যবহার করুন।', 'This is an Officer account. Use Officer Login.'));
      return;
    }

    if (destination === 'admin') setCurrentPage('admin-dashboard');
    else if (destination === 'officer') setCurrentPage('officer-dashboard');
    else setCurrentPage('profile');
  };

  const modes: { id: LoginMode; bn: string; en: string }[] = [
    { id: 'citizen', bn: 'নাগরিক লগইন', en: 'Citizen Login' },
    { id: 'officer', bn: 'Officer লগইন', en: 'Officer Login' },
    { id: 'admin', bn: 'Admin লগইন', en: 'Admin Login' },
  ];

  return (
    <div className="min-h-[85vh] bg-[#F5F1E8] py-10 px-4 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto mb-5">
        <button onClick={() => setCurrentPage('home')} className="inline-flex items-center gap-2 text-xs font-semibold text-[#123B32] bg-white px-3.5 py-2 rounded-full border border-[#D9E1DC] shadow-sm">
          <ArrowLeft className="w-3.5 h-3.5" /><span>{copy('মূলপাতায় ফিরে যান', 'Back to Home')}</span>
        </button>
      </div>
      <section className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-[#D9E1DC] overflow-hidden">
        <header className="bg-[#123B32] p-6 text-center text-white">
          <Scale className="w-7 h-7 mx-auto mb-2" />
          <h1 className="text-2xl font-bold font-serif-title">Shikor (শিকড়)</h1>
          <p className="text-xs text-[#D8E8DF] mt-1">{copy('নিরাপদ নাগরিক ও কর্মকর্তা প্রবেশ', 'Secure citizen and officer access')}</p>
        </header>
        <div className="p-6 sm:p-8 space-y-5">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#F5F1E8] border border-[#D9E1DC]">
            {modes.map((item) => (
              <button key={item.id} type="button" onClick={() => { setMode(item.id); setErrorMessage(null); }}
                className={`px-2 py-2 rounded-lg text-[11px] sm:text-xs font-bold transition-colors ${mode === item.id ? 'bg-[#123B32] text-white shadow-sm' : 'text-[#64748B] hover:text-[#123B32]'}`}>
                {copy(item.bn, item.en)}
              </button>
            ))}
          </div>
          {mode === 'admin' && <p className="text-[11px] text-[#64748B]">{copy('Admin অ্যাকাউন্ট শুধুমাত্র নিরাপদ প্রাথমিক সেটআপে নির্ধারিত হয়। Public Admin signup নেই।', 'Admin access is assigned only through trusted bootstrap. There is no public Admin signup.')}</p>}
          {isDemoMode && <p className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900">{copy('Supabase সংযুক্ত নেই। ডেমো মোডে শুধু নাগরিক অ্যাকাউন্ট উপলব্ধ।', 'Supabase is not connected. Only a citizen demo account is available.')}</p>}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">{copy('ইমেইল ঠিকানা', 'Email address')}</label>
              <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1F2933] mb-1">{copy('পাসওয়ার্ড', 'Password')}</label>
              <input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" />
            </div>
            {errorMessage && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMessage}</span></div>}
            <button type="submit" disabled={isSubmitting} className="w-full bg-[#123B32] hover:bg-[#0c2822] disabled:opacity-60 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-md">
              <KeyRound className="w-4 h-4 text-[#C6A66B]" />
              <span>{isSubmitting ? copy('প্রবেশ করা হচ্ছে…', 'Signing in…') : copy('লগইন করুন', 'Sign In')}</span>
            </button>
          </form>
          <div className="pt-4 border-t border-[#D9E1DC] text-center text-xs text-[#64748B] space-y-2">
            <p>{copy('নাগরিক অ্যাকাউন্ট নেই?', "Don't have a citizen account?")} <button onClick={() => setCurrentPage('signup')} className="font-bold text-[#123B32] hover:underline">{copy('নিবন্ধন করুন', 'Sign up')}</button></p>
            <p>{copy('Officer আবেদন জমা দিতে চান?', 'Need to apply as an Officer?')} <button onClick={() => setCurrentPage('officer-register')} className="font-bold text-[#123B32] hover:underline">{copy('Officer Registration', 'Officer Registration')}</button></p>
          </div>
        </div>
      </section>
    </div>
  );
};

import React, { useState } from 'react';
import { AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import type { Language, PageView } from '../../types';
import type { AuthProfile } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';

interface AccountActivationViewProps {
  language: Language;
  currentUser: AuthProfile | null;
  setCurrentPage: (page: PageView) => void;
}

export const AccountActivationView: React.FC<AccountActivationViewProps> = ({ language, currentUser, setCurrentPage }) => {
  const { setPassword, refreshProfile } = useAuth();
  const [password, setPasswordValue] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const copy = (bn: string, en: string) => language === 'bn' ? bn : en;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    if (password.length < 8) {
      setErrorMessage(copy('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।', 'Password must be at least 8 characters.'));
      return;
    }
    if (password !== confirmation) {
      setErrorMessage(copy('দুটি পাসওয়ার্ড মিলছে না।', 'The passwords do not match.'));
      return;
    }
    setSaving(true);
    const result = await setPassword(password);
    setSaving(false);
    if (result.error) {
      setErrorMessage(copy('নিরাপদ লিংকটি মেয়াদোত্তীর্ণ বা অবৈধ। Admin-এর কাছে নতুন লিংক চান।', 'This secure link expired or is invalid. Ask the administrator to retry the activation email.'));
      return;
    }
    const refreshed = await refreshProfile();
    setCurrentPage(refreshed?.role === 'officer' ? 'officer-dashboard' : refreshed?.role === 'admin' ? 'admin-dashboard' : 'profile');
  };

  return (
    <div className="min-h-[80vh] bg-[#F5F1E8] flex items-center justify-center py-10 px-4">
      <section className="max-w-md w-full bg-white rounded-2xl border border-[#D9E1DC] shadow-xl overflow-hidden">
        <header className="bg-[#123B32] p-6 text-white text-center"><ShieldCheck className="w-8 h-8 mx-auto mb-2 text-[#C6A66B]" /><h1 className="text-xl font-bold">{copy('নিরাপদ অ্যাকাউন্ট সক্রিয়করণ', 'Secure account activation')}</h1></header>
        <div className="p-6 sm:p-8">
          {!currentUser ? <div className="text-center space-y-4"><p className="text-sm text-[#64748B]">{copy('লিংকটি মেয়াদোত্তীর্ণ হতে পারে। নতুন লিংকের জন্য Admin-এর সাথে যোগাযোগ করুন।', 'The link may have expired. Contact the administrator for a new link.')}</p><button onClick={() => setCurrentPage('signin')} className="px-5 py-2.5 rounded-lg bg-[#123B32] text-white text-sm font-bold">{copy('লগইন পেজ', 'Sign in')}</button></div> : (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-xs text-[#64748B]">{copy('অ্যাকাউন্টের জন্য নতুন পাসওয়ার্ড সেট করুন। পাসওয়ার্ড ইমেইলে পাঠানো হবে না।', 'Set a password for your account. Passwords are never sent by email.')}</p>
              <div><label className="block text-xs font-semibold mb-1">{copy('নতুন পাসওয়ার্ড', 'New password')}</label><input type="password" autoComplete="new-password" value={password} onChange={(event) => setPasswordValue(event.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9E1DC]" /></div>
              <div><label className="block text-xs font-semibold mb-1">{copy('পাসওয়ার্ড নিশ্চিত করুন', 'Confirm password')}</label><input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#D9E1DC]" /></div>
              {errorMessage && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{errorMessage}</div>}
              <button disabled={saving} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#123B32] text-white text-sm font-bold disabled:opacity-60"><KeyRound className="w-4 h-4" />{saving ? copy('সংরক্ষণ হচ্ছে…', 'Saving…') : copy('পাসওয়ার্ড সেট করুন', 'Set password')}</button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

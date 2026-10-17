import React from 'react';
import { ArrowRight, ClipboardCheck, ShieldCheck } from 'lucide-react';
import type { Language, PageView } from '../../types';
import type { AuthProfile } from '../../context/AuthContext';

interface OfficerDashboardViewProps {
  language: Language;
  currentUser: AuthProfile;
  setCurrentPage: (page: PageView) => void;
}

export const OfficerDashboardView: React.FC<OfficerDashboardViewProps> = ({ language, currentUser, setCurrentPage }) => {
  const copy = (bn: string, en: string) => language === 'bn' ? bn : en;
  return (
    <div className="min-h-[80vh] bg-[#F5F1E8] py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="bg-gradient-to-r from-[#123B32] to-[#1a4a40] text-white rounded-2xl p-7 shadow-xl">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"><ShieldCheck className="w-3.5 h-3.5" />{copy('অনুমোদিত Officer', 'Approved Officer')}</span>
          <h1 className="text-2xl font-bold font-serif-title mt-3">{copy('স্বাগতম', 'Welcome')}, {currentUser.displayName}</h1>
          <p className="text-sm text-[#D8E8DF] mt-1">{copy('আপনার Officer অ্যাকাউন্ট Admin অনুমোদনের পর সক্রিয় হয়েছে।', 'Your Officer account was activated after administrator approval.')}</p>
        </header>
        <section className="bg-white border border-[#D9E1DC] rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <ClipboardCheck className="w-7 h-7 text-[#C6A66B] shrink-0" />
            <div className="flex-1">
              <h2 className="text-base font-bold text-[#123B32]">{copy('Officer অ্যাক্সেস সক্রিয়', 'Officer access is active')}</h2>
              <p className="text-sm text-[#64748B] mt-1">{copy('Land Records দেখুন অথবা আপনার অনুমোদনের ইতিহাস পরীক্ষা করুন।', 'Open Land Records or review your application decision history.')}</p>
              <div className="flex flex-wrap gap-3 mt-5">
                <button onClick={() => setCurrentPage('evidence')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#123B32] text-white text-xs font-bold">{copy('Land Records', 'Land Records')}<ArrowRight className="w-3.5 h-3.5" /></button>
                <button onClick={() => setCurrentPage('officer-status')} className="px-5 py-2.5 rounded-lg bg-[#D8E8DF] text-[#123B32] text-xs font-bold">{copy('আবেদন ও সিদ্ধান্তের ইতিহাস', 'Application history')}</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

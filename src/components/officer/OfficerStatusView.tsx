import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, FileText, XCircle } from 'lucide-react';
import type { Language, PageView } from '../../types';
import type { AuthProfile, OfficerApplicationStatusInfo } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { getMyOfficerApplicationEvents, getMyOfficerApplications, type OfficerApplicationEvent } from '../../lib/officerApplications';

interface OfficerStatusViewProps {
  language: Language;
  currentUser: AuthProfile | null;
  setCurrentPage: (page: PageView) => void;
}

export const OfficerStatusView: React.FC<OfficerStatusViewProps> = ({ language, currentUser, setCurrentPage }) => {
  const { refreshProfile } = useAuth();
  const [application, setApplication] = useState<OfficerApplicationStatusInfo & { department: string; designation: string } | null>(null);
  const [events, setEvents] = useState<OfficerApplicationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const copy = (bn: string, en: string) => language === 'bn' ? bn : en;

  useEffect(() => {
    let active = true;
    if (!currentUser || currentUser.isDemo || currentUser.role === 'admin') {
      setLoading(false);
      return;
    }
    void getMyOfficerApplications().then(async (applications) => {
      if (!active) return;
      const latest = applications[0];
      if (latest) {
        setApplication({
          id: latest.id,
          status: latest.status,
          rejectionReason: latest.rejectionReason,
          submittedAt: latest.submittedAt,
          createdAt: latest.createdAt,
          department: latest.department,
          designation: latest.designation,
        });
        setEvents(await getMyOfficerApplicationEvents(latest.id));
        if (latest.status === 'approved') await refreshProfile();
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [currentUser, refreshProfile]);

  if (!currentUser) {
    return (
      <div className="min-h-[75vh] bg-[#F5F1E8] flex items-center justify-center p-4">
        <section className="max-w-lg w-full bg-white rounded-2xl border border-[#D9E1DC] p-7 shadow-lg text-center space-y-4">
          <h1 className="text-xl font-bold text-[#123B32]">{copy('আবেদনের অবস্থা দেখতে লগইন করুন', 'Sign in to check your application')}</h1>
          <button onClick={() => setCurrentPage('signin')} className="px-5 py-2.5 rounded-lg bg-[#123B32] text-white text-sm font-bold">{copy('লগইন', 'Sign in')}</button>
        </section>
      </div>
    );
  }

  const statusCopy: Record<string, { bn: string; en: string; tone: string }> = {
    draft: { bn: 'অসম্পূর্ণ আবেদন', en: 'Draft', tone: 'text-amber-800 bg-amber-50 border-amber-200' },
    pending: { bn: 'যাচাইাধীন', en: 'Pending review', tone: 'text-amber-800 bg-amber-50 border-amber-200' },
    approved: { bn: 'অনুমোদিত', en: 'Approved', tone: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
    rejected: { bn: 'প্রত্যাখ্যাত', en: 'Rejected', tone: 'text-rose-800 bg-rose-50 border-rose-200' },
  };
  const status = application ? statusCopy[application.status] : null;

  return (
    <div className="min-h-[80vh] bg-[#F5F1E8] py-10 px-4 sm:px-6">
      <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-[#D9E1DC] overflow-hidden">
        <header className="bg-[#123B32] p-6 text-white">
          <button onClick={() => setCurrentPage(currentUser.role === 'officer' ? 'officer-dashboard' : 'profile')} className="inline-flex items-center gap-2 text-xs text-[#D8E8DF] mb-4"><ArrowLeft className="w-3.5 h-3.5" />{copy('ড্যাশবোর্ডে ফিরুন', 'Back to dashboard')}</button>
          <h1 className="text-2xl font-bold font-serif-title">{copy('Officer আবেদনের অবস্থা', 'Officer application status')}</h1>
        </header>
        <div className="p-6 sm:p-8 space-y-5">
          {loading ? <p className="text-sm text-[#64748B]">{copy('আবেদন খোঁজা হচ্ছে…', 'Loading application…')}</p> : !application ? (
            <div className="text-center py-6 space-y-4">
              <FileText className="w-10 h-10 text-[#C6A66B] mx-auto" />
              <p className="text-sm text-[#64748B]">{copy('এই অ্যাকাউন্টে কোনো Officer আবেদন নেই।', 'There is no Officer application linked to this account.')}</p>
              <button onClick={() => setCurrentPage('officer-register')} className="px-5 py-2.5 rounded-lg bg-[#123B32] text-white text-sm font-bold">{copy('আবেদন শুরু করুন', 'Start an application')}</button>
            </div>
          ) : (
            <>
              <div className={`p-4 rounded-xl border ${status?.tone}`}>
                <p className="text-sm font-bold">{copy(status?.bn ?? '', status?.en ?? '')}</p>
                {application.status === 'pending' && <p className="text-sm mt-2">{copy('আপনার Officer আবেদন জমা হয়েছে। Admin যাচাই করে সিদ্ধান্ত জানাবেন।', 'Your Officer application has been submitted. The Admin will review it and notify you of the decision.')}</p>}
                {application.status === 'approved' && <p className="text-sm mt-2">{copy('আবেদন অনুমোদিত হয়েছে। Officer Dashboard-এ প্রবেশ করতে পারেন।', 'Your application is approved. You can access the Officer Dashboard.')}</p>}
                {application.status === 'rejected' && <p className="text-sm mt-2">{copy('আপনার আবেদন অনুমোদিত হয়নি। নিচে Admin-এর কারণ দেখুন।', 'Your application was not approved. See the administrator’s reason below.')}</p>}
                {application.status === 'draft' && <p className="text-sm mt-2">{copy('নিয়োগপত্র আপলোড করে আবেদন সম্পন্ন করুন।', 'Upload the appointment letter to finish your application.')}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#F5F1E8]"><span className="text-[#64748B] block">{copy('বিভাগ', 'Department')}</span><strong>{application.department}</strong></div>
                <div className="p-3 rounded-lg bg-[#F5F1E8]"><span className="text-[#64748B] block">{copy('পদবি', 'Designation')}</span><strong>{application.designation}</strong></div>
                <div className="p-3 rounded-lg bg-[#F5F1E8]"><span className="text-[#64748B] block">{copy('জমা দেওয়ার সময়', 'Submitted')}</span><strong>{application.submittedAt ? new Date(application.submittedAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-GB') : '—'}</strong></div>
                <div className="p-3 rounded-lg bg-[#F5F1E8]"><span className="text-[#64748B] block">{copy('আবেদন নম্বর', 'Application ID')}</span><strong className="font-mono">{application.id}</strong></div>
              </div>
              {application.status === 'rejected' && application.rejectionReason && <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-900"><strong>{copy('প্রত্যাখ্যানের কারণ', 'Reason for rejection')}</strong><p className="mt-1 whitespace-pre-wrap">{application.rejectionReason}</p></div>}
              {application.status === 'approved' && currentUser.role === 'officer' && <button onClick={() => setCurrentPage('officer-dashboard')} className="px-5 py-2.5 rounded-lg bg-[#123B32] text-white text-sm font-bold">{copy('Officer Dashboard খুলুন', 'Open Officer Dashboard')}</button>}
              <div className="border-t border-[#D9E1DC] pt-4">
                <h2 className="text-sm font-bold text-[#123B32] mb-3">{copy('সিদ্ধান্তের ইতিহাস', 'Decision history')}</h2>
                {events.length === 0 ? <p className="text-xs text-[#64748B]">{copy('এখনো কোনো সিদ্ধান্ত রেকর্ড হয়নি।', 'No decision has been recorded yet.')}</p> : <ol className="space-y-3">{events.map((event) => (
                  <li key={event.id} className="flex gap-3 text-xs">
                    {event.toStatus === 'approved' ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> : event.toStatus === 'rejected' ? <XCircle className="w-4 h-4 text-rose-700 shrink-0" /> : <Clock3 className="w-4 h-4 text-amber-700 shrink-0" />}
                    <div><strong className="text-[#123B32]">{copy(statusCopy[event.toStatus]?.bn ?? event.toStatus, statusCopy[event.toStatus]?.en ?? event.toStatus)}</strong><p className="text-[#64748B]">{new Date(event.createdAt).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-GB')}</p>{event.toStatus === 'rejected' && event.reason && <p className="mt-1 text-rose-800">{event.reason}</p>}</div>
                  </li>
                ))}</ol>}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, ShieldCheck, UploadCloud } from 'lucide-react';
import type { Language, PageView } from '../../types';
import type { AuthProfile } from '../../context/AuthContext';
import { useAuth } from '../../context/AuthContext';
import { getMyOfficerApplications, submitOfficerApplication } from '../../lib/officerApplications';
import { validateAppointmentLetter, validateOfficerApplication, type OfficerApplicationFieldError } from '../../lib/phase1';

interface OfficerRegistrationViewProps {
  language: Language;
  currentUser: AuthProfile | null;
  setCurrentPage: (page: PageView) => void;
}

export const OfficerRegistrationView: React.FC<OfficerRegistrationViewProps> = ({ language, currentUser, setCurrentPage }) => {
  const { isDemoMode } = useAuth();
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [upazila, setUpazila] = useState('');
  const [documentConsent, setDocumentConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [draftId, setDraftId] = useState<string | undefined>();
  const [loadingDraft, setLoadingDraft] = useState(Boolean(currentUser && currentUser.role === 'citizen' && !isDemoMode));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const copy = (bn: string, en: string) => language === 'bn' ? bn : en;

  useEffect(() => {
    let active = true;
    if (!currentUser || currentUser.role !== 'citizen' || isDemoMode) {
      setLoadingDraft(false);
      return;
    }
    void getMyOfficerApplications().then((applications) => {
      if (!active) return;
      const latest = applications[0];
      if (latest?.status === 'draft') {
        setDraftId(latest.id);
        setDepartment(latest.department);
        setDesignation(latest.designation);
        setEmployeeNumber(latest.employeeNumber);
        setDistrict(latest.district);
        setUpazila(latest.upazila);
      } else if (latest) {
        setCurrentPage('officer-status');
      }
      setLoadingDraft(false);
    });
    return () => { active = false; };
  }, [currentUser, isDemoMode, setCurrentPage]);

  if (!currentUser) {
    return (
      <div className="min-h-[75vh] bg-[#F5F1E8] flex items-center justify-center p-4">
        <section className="max-w-lg w-full bg-white rounded-2xl border border-[#D9E1DC] p-7 shadow-lg text-center space-y-4">
          <ShieldCheck className="w-10 h-10 text-[#123B32] mx-auto" />
          <h1 className="text-xl font-bold text-[#123B32]">{copy('Officer Registration', 'Officer Registration')}</h1>
          <p className="text-sm text-[#64748B]">{copy('আবেদনের আগে নাগরিক অ্যাকাউন্ট তৈরি করে ইমেইল যাচাই করুন। এতে অনুমোদনের সময় একই Auth UUID ব্যবহার হবে।', 'Create a citizen account and verify its email before applying. The same Auth UUID will be activated if your application is approved.')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setCurrentPage('signin')} className="px-5 py-2.5 rounded-lg bg-[#123B32] text-white text-sm font-bold">{copy('লগইন', 'Sign in')}</button>
            <button onClick={() => setCurrentPage('signup')} className="px-5 py-2.5 rounded-lg bg-[#D8E8DF] text-[#123B32] text-sm font-bold">{copy('নাগরিক নিবন্ধন', 'Citizen signup')}</button>
          </div>
        </section>
      </div>
    );
  }

  if (currentUser.role !== 'citizen' || isDemoMode) {
    return (
      <div className="min-h-[75vh] bg-[#F5F1E8] flex items-center justify-center p-4">
        <section className="max-w-lg w-full bg-white rounded-2xl border border-[#D9E1DC] p-7 shadow-lg text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-700 mx-auto" />
          <h1 className="text-xl font-bold text-[#123B32]">{copy('আবেদন জমা দেওয়া যাচ্ছে না', 'Application unavailable')}</h1>
          <p className="text-sm text-[#64748B]">{isDemoMode ? copy('বাস্তব আবেদন জমা দিতে Supabase সংযোগ প্রয়োজন।', 'Supabase must be connected to submit a real application.') : copy('Officer আবেদন করতে যাচাইকৃত নাগরিক অ্যাকাউন্ট প্রয়োজন।', 'A verified citizen account is required to apply as an Officer.')}</p>
          <button onClick={() => setCurrentPage(currentUser.role === 'officer' ? 'officer-dashboard' : currentUser.role === 'admin' ? 'admin-dashboard' : 'officer-status')} className="px-5 py-2.5 rounded-lg bg-[#123B32] text-white text-sm font-bold">{copy('ফিরে যান', 'Continue')}</button>
        </section>
      </div>
    );
  }

  const fieldErrors: Record<OfficerApplicationFieldError, string> = {
    department: copy('বিভাগ বা সরকারি অফিসের নাম দিন।', 'Enter the department or government office.'),
    designation: copy('পদবি লিখুন।', 'Enter your designation.'),
    employeeNumber: copy('কর্মকর্তা নিবন্ধন বা কর্মচারী নম্বর দিন।', 'Enter your official registration or employee number.'),
    district: copy('অফিসের জেলা লিখুন।', 'Enter the office district.'),
    upazila: copy('অফিসের উপজেলা লিখুন।', 'Enter the office upazila.'),
    documentConsent: copy('নথি নিরাপদে প্রক্রিয়াকরণের সম্মতি দিন।', 'Consent to secure processing of the submitted document.'),
  };
  const handleFileChange = (selected: File | undefined) => {
    setErrorMessage(null);
    setFile(selected ?? null);
    if (selected) {
      const error = validateAppointmentLetter(selected);
      if (error === 'fileType') setErrorMessage(copy('PDF, JPEG, PNG অথবা WebP ফাইল দিন।', 'Choose a PDF, JPEG, PNG, or WebP file.'));
      if (error === 'fileSize') setErrorMessage(copy('ফাইল ১০ MB-এর কম হতে হবে।', 'The file must be no larger than 10 MB.'));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);
    const invalidField = validateOfficerApplication({ department, designation, employeeNumber, district, upazila, documentConsent });
    if (invalidField) {
      setErrorMessage(fieldErrors[invalidField]);
      return;
    }
    if (!file) {
      setErrorMessage(copy('নিয়োগপত্রের ছবি বা PDF আপলোড করুন।', 'Upload an image or PDF of your appointment letter.'));
      return;
    }
    setIsSubmitting(true);
    const result = await submitOfficerApplication({
      applicantName: currentUser.displayName,
      applicantPhone: currentUser.phoneNumber ?? '',
      department,
      designation,
      employeeNumber,
      district,
      upazila,
      documentConsent,
    }, file, draftId);
    setIsSubmitting(false);
    if (result.applicationId) setDraftId(result.applicationId);
    if (result.error) {
      const errors = {
        unauthorized: copy('আবেদন জমা দিতে যাচাইকৃত অ্যাকাউন্টে পুনরায় লগইন করুন।', 'Sign in to a verified account to submit the application.'),
        file_type: copy('PDF, JPEG, PNG অথবা WebP ফাইল দিন।', 'Choose a PDF, JPEG, PNG, or WebP file.'),
        file_size: copy('ফাইল ১০ MB-এর কম হতে হবে।', 'The file must be no larger than 10 MB.'),
        submit_failed: copy('আবেদন জমা হয়নি। সংযোগ যাচাই করে আবার চেষ্টা করুন।', 'The application was not submitted. Check the connection and try again.'),
      };
      setErrorMessage(errors[result.error]);
      return;
    }
    setSubmitted(true);
    window.setTimeout(() => setCurrentPage('officer-status'), 1000);
  };

  if (submitted) {
    return (
      <div className="min-h-[75vh] bg-[#F5F1E8] flex items-center justify-center p-4">
        <section className="max-w-lg w-full bg-white rounded-2xl border border-[#D9E1DC] p-8 shadow-lg text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
          <h1 className="text-xl font-bold text-[#123B32]">{copy('আবেদন জমা হয়েছে', 'Application submitted')}</h1>
          <p className="text-sm text-[#64748B]">{copy('আপনার Officer আবেদন জমা হয়েছে। Admin যাচাই করে সিদ্ধান্ত জানাবেন।', 'Your Officer application has been submitted. The Admin will review it and notify you of the decision.')}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-[#F5F1E8] py-10 px-4 sm:px-6">
      <section className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-[#D9E1DC] overflow-hidden">
        <header className="bg-[#123B32] p-6 text-white">
          <button onClick={() => setCurrentPage('profile')} className="inline-flex items-center gap-2 text-xs text-[#D8E8DF] mb-4"><ArrowLeft className="w-3.5 h-3.5" />{copy('ড্যাশবোর্ডে ফিরুন', 'Back to dashboard')}</button>
          <h1 className="text-2xl font-bold font-serif-title">{copy('কর্মকর্তা নিবন্ধন', 'Officer Registration')}</h1>
          <p className="text-xs text-[#D8E8DF] mt-1">{copy('ইমেইল যাচাইকৃত নাগরিক অ্যাকাউন্টের সাথে আবেদন যুক্ত হবে।', 'Your application will be linked to your verified citizen account.')}</p>
        </header>
        {loadingDraft ? <div className="p-8 text-center text-sm text-[#64748B]">{copy('আবেদন যাচাই করা হচ্ছে…', 'Checking your application…')}</div> : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-semibold mb-1 text-[#1F2933]">{copy('পূর্ণ নাম', 'Full name')}</label><input readOnly value={currentUser.displayName} className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D9E1DC] bg-gray-50" /></div>
              <div><label className="block text-xs font-semibold mb-1 text-[#1F2933]">{copy('ফোন নম্বর', 'Phone number')}</label><input readOnly value={currentUser.phoneNumber ?? ''} className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D9E1DC] bg-gray-50" /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-semibold mb-1 text-[#1F2933]">{copy('ইমেইল', 'Email')}</label><input readOnly value={currentUser.email} className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D9E1DC] bg-gray-50" /></div>
              <div><label className="block text-xs font-semibold mb-1 text-[#1F2933]">{copy('বিভাগ বা সরকারি অফিস', 'Department or government office')} *</label><input required value={department} onChange={(event) => setDepartment(event.target.value)} className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" /></div>
              <div><label className="block text-xs font-semibold mb-1 text-[#1F2933]">{copy('পদবি', 'Designation')} *</label><input required value={designation} onChange={(event) => setDesignation(event.target.value)} className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-semibold mb-1 text-[#1F2933]">{copy('সরকারি নিবন্ধন বা কর্মচারী নম্বর', 'Official registration or employee number')} *</label><input required value={employeeNumber} onChange={(event) => setEmployeeNumber(event.target.value)} className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" /></div>
              <div><label className="block text-xs font-semibold mb-1 text-[#1F2933]">{copy('অফিসের জেলা', 'Office district')} *</label><input required value={district} onChange={(event) => setDistrict(event.target.value)} className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" /></div>
              <div><label className="block text-xs font-semibold mb-1 text-[#1F2933]">{copy('অফিসের উপজেলা', 'Office upazila')} *</label><input required value={upazila} onChange={(event) => setUpazila(event.target.value)} className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none" /></div>
            </div>

            <label className="block border-2 border-dashed border-[#D9E1DC] rounded-xl p-5 text-center bg-[#F5F1E8]/50 hover:bg-[#F5F1E8] cursor-pointer">
              <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => handleFileChange(event.target.files?.[0])} />
              <UploadCloud className="w-8 h-8 text-[#123B32] mx-auto mb-2" />
              <span className="block text-xs font-bold text-[#123B32]">{copy('নিয়োগপত্রের ছবি বা PDF আপলোড করুন', 'Upload appointment letter image or PDF')} *</span>
              <span className="block mt-1 text-[11px] text-[#64748B]">PDF, JPEG, PNG, WebP · {copy('সর্বোচ্চ ১০ MB', 'maximum 10 MB')}</span>
              {file && <span className="flex justify-center items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-800"><FileText className="w-3.5 h-3.5" />{file.name}</span>}
            </label>

            <label className="flex items-start gap-2 text-xs text-[#64748B] cursor-pointer">
              <input type="checkbox" checked={documentConsent} onChange={(event) => setDocumentConsent(event.target.checked)} className="mt-0.5" />
              <span>{copy('আমি সম্মতি দিচ্ছি যে আবেদন যাচাইয়ের জন্য নিয়োগপত্র ও যোগাযোগের তথ্য নিরাপদে প্রক্রিয়া করা হবে।', 'I consent to secure processing of my appointment letter and contact information for application review.')}</span>
            </label>
            {errorMessage && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{errorMessage}</div>}
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-[#123B32] hover:bg-[#0c2822] disabled:opacity-60 text-white px-6 py-3 rounded-lg text-sm font-bold">
              {isSubmitting ? copy('নিরাপদে আপলোড ও জমা হচ্ছে…', 'Uploading securely…') : copy('Officer আবেদন জমা দিন', 'Submit Officer Application')}
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

import React from 'react';
import { Satellite, Layers, Map, FileCheck, CheckCircle2, Shield, ArrowRight, Zap, ExternalLink } from 'lucide-react';
import { Language, PageView } from '../../types';

interface SatelliteServicesViewProps {
  language: Language;
  onOpenCertificateDemo: () => void;
  onOpenClaimDemo: () => void;
  setCurrentPage: (page: PageView) => void;
}

export const SatelliteServicesView: React.FC<SatelliteServicesViewProps> = ({
  language,
  onOpenCertificateDemo,
  onOpenClaimDemo,
  setCurrentPage
}) => {
  const services = [
    {
      title: 'Free Sentinel-2 & Landsat Multi-Spectral Water Tracking',
      banglaTitle: 'ফ্রি সেন্টিনেল-২ ও ল্যান্ডস্যাট স্যাটেলাইট জলজ ট্র্যাকিং',
      desc: 'Using open European Space Agency (Copernicus) 10-meter resolution imagery and Normalized Difference Water Index (NDWI) to identify exact month of river transgression over surveyed plots.',
      badge: 'Open Access API'
    },
    {
      title: 'CS, RS & BS Scanned Mouza Georeferencer',
      banglaTitle: 'সিএস, আরএস ও বিএস মৌজা নকশার জিওরেফারেন্সিং',
      desc: 'Binds historical British, Pakistani, and Bangladesh cadastral mouza maps onto modern satellite WGS-84 coordinate system with high sub-meter edge precision.',
      badge: 'GIS Cadastral'
    },
    {
      title: 'Verifiable Land Loss Certificate (নদীভাঙন সনদ)',
      banglaTitle: 'যাচাইযোগ্য ডিজিটাল নদীভাঙন সনদপত্র',
      desc: 'Issues a tamper-proof civic evidence certificate with cryptographic hash and QR verification for submission to Upazila Nirbahi Officers (UNO) and AC Land.',
      badge: 'Digital Proof'
    },
    {
      title: 'Automated 1-No. Khas Land Resettlement Petition Draft',
      banglaTitle: '১-নং খাস জমি বন্দোবস্ত ও পুনর্বাসন স্বয়ংক্রিয় আবেদন',
      desc: 'Generates formal legal petitions formatted under Section 86 of the State Acquisition and Tenancy Act 1950 for priority allocation from newly accreted char lands.',
      badge: 'Legal Automation'
    }
  ];

  return (
    <div className="py-12 bg-[#F5F1E8] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Heading */}
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#123B32] font-mono">
              {language === 'bn' ? 'প্রযুক্তিগত সেবাসমূহ' : 'CORE SATELLITE & CIVIC SERVICES'}
            </span>
            <span className="w-8 h-0.5 bg-[#123B32]"></span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#123B32] font-serif-title">
            {language === 'bn' 
              ? 'নদীভাঙন ক্ষতিগ্রস্তদের জন্য উন্মুক্ত ভূ-উপাত্ত সেবা' 
              : 'Citizen-Powered Spatial Evidence & Resettlement Services'}
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-2 leading-relaxed">
            {language === 'bn'
              ? 'উন্মুক্ত উপগ্রহ চিত্র ও ঐতিহাসিক মৌজা নকশার সমন্বয়ে শিকড় (Shikor) কীভাবে ভাঙনের প্রমাণ তৈরি করে।'
              : 'How Shikor eliminates bureaucratic dead-ends by converting free satellite data into admissible legal evidence for displaced char families.'}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((svc, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[#D8E8DF] text-[#123B32] border border-[#b8d6c4]">
                  {svc.badge}
                </span>
                <span className="text-xs font-mono text-[#64748B]">0{idx + 1}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#123B32] font-serif-title leading-snug">
                  {svc.title}
                </h3>
                <p className="text-xs font-semibold text-[#123B32]/80 mt-0.5">
                  {svc.banglaTitle}
                </p>
              </div>
              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {svc.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Actions Bar */}
        <div className="bg-[#123B32] text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-xl font-bold font-serif-title text-[#C6A66B]">
              {language === 'bn' ? 'আপনার জমি নদীগর্ভে বিলীন হয়েছে?' : 'Has Your Land Been Lost to Riverbank Erosion?'}
            </h3>
            <p className="text-xs text-[#D8E8DF]">
              {language === 'bn'
                ? 'এখনই বিনামূল্যে আপনার দাগ নম্বর ও জিপিএস স্থানাঙ্ক দিয়ে ভাঙন সনদ তৈরি করুন।'
                : 'Generate your free loss certificate now and initiate a priority claim with your local Upazila Land Office.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCertificateDemo}
              className="bg-[#C6A66B] hover:bg-[#b89759] text-[#123B32] px-5 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              {language === 'bn' ? 'সনদপত্র তৈরি করুন' : 'Generate Loss Certificate'}
            </button>
            <button
              onClick={onOpenClaimDemo}
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-xs font-semibold border border-white/30 transition-colors"
            >
              {language === 'bn' ? 'ইউএনও আবেদন ডেমো' : 'View UNO Claim Petition'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { Compass, MapPin, CheckCircle2, ArrowRight, ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { PILOT_UPAZILAS } from '../../data/mockData';
import { Language, PageView } from '../../types';

interface AboutRoadmapViewProps {
  language: Language;
  setCurrentPage: (page: PageView) => void;
}

export const AboutRoadmapView: React.FC<AboutRoadmapViewProps> = ({
  language,
  setCurrentPage
}) => {
  return (
    <div className="py-12 bg-[#F5F1E8] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Mission Heading */}
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#123B32] font-mono">
              {language === 'bn' ? 'আমাদের দর্শন ও স্কেল পরিকল্পনা' : 'OUR PHILOSOPHY & ROADMAP'}
            </span>
            <span className="w-8 h-0.5 bg-[#123B32]"></span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#123B32] font-serif-title">
            {language === 'bn' 
              ? 'চর বেল্ট থেকে জাতীয় ভূমি শাসন: নাগরিক প্রমাণের বিপ্লব' 
              : 'From Char Belt Pilot to National Land Governance'}
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-2 leading-relaxed">
            {language === 'bn'
              ? 'নদীভাঙনে জমি হারালে মানুষ আইনি প্রমাণ হারায়, যার ফলে পুনর্বাসন পায় না। শিকড় (Shikor) তৈরি করেছে নাগরিক চালিত প্রথম ডিজিটাল এভিডেন্স সিস্টেম।'
              : 'Why Shikor is unique & scalable: Nobody built a citizen-powered evidence architecture for erosion victims before. We start with 1-2 upazila pilots, scale across the Jamuna-Padma-Meghna char belt, and connect directly to government AC Land e-mutation and micro-climate insurance.'}
          </p>
        </div>

        {/* 3-Phase Scaling Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Phase 1 */}
          <div className="bg-white rounded-2xl border-2 border-[#123B32] p-6 shadow-sm space-y-3 relative">
            <div className="inline-block bg-[#123B32] text-[#C6A66B] px-3 py-1 rounded-full text-[10px] font-mono font-bold">
              PHASE 1 • ACTIVE PILOT
            </div>
            <h3 className="text-xl font-bold text-[#123B32] font-serif-title">
              2 Pilot Upazilas
            </h3>
            <p className="text-xs font-semibold text-[#123B32]">
              Chilmari (Kurigram) & Kazipur (Sirajganj)
            </p>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Ground-truthing 5,000+ displaced char families. Georeferencing CS/RS cadastral maps with historical Sentinel-2 water boundary shifts. Establishing local community witness networks.
            </p>
            <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 pt-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pilot deployed & actively generating claim dossiers</span>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-sm space-y-3">
            <div className="inline-block bg-[#D8E8DF] text-[#123B32] px-3 py-1 rounded-full text-[10px] font-mono font-bold">
              PHASE 2 • CHAR BELT EXPANSION
            </div>
            <h3 className="text-xl font-bold text-[#123B32] font-serif-title">
              Full Riverine Char Belt
            </h3>
            <p className="text-xs font-semibold text-[#123B32]">
              18 Upazilas (Shariatpur, Chandpur, Bhola, Gaibandha)
            </p>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Scaling citizen app across the entire Jamuna, Padma, and Meghna delta. Standardizing automated land loss certificates with Union Parishad offices and AC Land desks.
            </p>
            <div className="text-[11px] text-[#64748B] font-medium pt-2">
              Timeline: 2025-2026 expansion
            </div>
          </div>

          {/* Phase 3 */}
          <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-sm space-y-3">
            <div className="inline-block bg-[#D8E8DF] text-[#123B32] px-3 py-1 rounded-full text-[10px] font-mono font-bold">
              PHASE 3 • NATIONAL SCALE
            </div>
            <h3 className="text-xl font-bold text-[#123B32] font-serif-title">
              Govt & Insurance Integration
            </h3>
            <p className="text-xs font-semibold text-[#123B32]">
              Ministry of Land & Climate Insurance
            </p>
            <p className="text-xs text-[#64748B] leading-relaxed">
              API integration with Bangladesh National Land Service Gateway (land.gov.bd), automated Khas Land 1-No. Register reconciliation, and parametric micro-insurance payouts.
            </p>
            <div className="text-[11px] text-[#64748B] font-medium pt-2">
              Long-term institutional vision
            </div>
          </div>

        </div>

        {/* Upazila Pilot Table */}
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]">
            <h3 className="text-lg font-bold text-[#123B32] font-serif-title">
              {language === 'bn' ? 'সক্রিয় ও প্রস্তাবিত পাইলট উপজেলা সূচক' : 'Active & Target Pilot Upazila Metrics'}
            </h3>
            <span className="text-xs font-mono text-[#64748B]">Updated Live 2025</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F1E8] text-[#123B32] uppercase font-mono font-bold">
                <tr>
                  <th className="py-2.5 px-3">Upazila & District</th>
                  <th className="py-2.5 px-3">River Basin</th>
                  <th className="py-2.5 px-3">Annual Erosion Rate</th>
                  <th className="py-2.5 px-3">Displaced Families</th>
                  <th className="py-2.5 px-3">Active Claims</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9E1DC] text-[#1F2933]">
                {PILOT_UPAZILAS.map((upazila) => (
                  <tr key={upazila.id} className="hover:bg-[#Fdfbf7]">
                    <td className="py-3 px-3 font-semibold text-[#123B32]">
                      {upazila.name} ({upazila.banglaName}), {upazila.district}
                    </td>
                    <td className="py-3 px-3 font-medium">{upazila.river}</td>
                    <td className="py-3 px-3 text-red-700 font-bold">{upazila.erosionRate}</td>
                    <td className="py-3 px-3 font-mono">{upazila.displacedFamilies.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#123B32]">{upazila.activeClaims.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        upazila.status === 'Active Pilot' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-[#F5F1E8] text-[#64748B] border border-[#D9E1DC]'
                      }`}>
                        {upazila.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

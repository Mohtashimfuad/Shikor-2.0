import React, { useState } from 'react';
import { Search, Filter, FileText, CheckCircle2, MapPin, Eye, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { SAMPLE_LOSS_RECORDS } from '../../data/mockData';
import { LandLossRecord, Language, PageView } from '../../types';

import { fetchErosionClaimsFromSupabase, isSupabaseConfigured } from '../../lib/supabase';

interface LandRecordsViewProps {
  language: Language;
  onSelectRecord: (record: LandLossRecord) => void;
  onOpenClaimDemo: () => void;
  setCurrentPage: (page: PageView) => void;
}

export const LandRecordsView: React.FC<LandRecordsViewProps> = ({
  language,
  onSelectRecord,
  onOpenClaimDemo,
  setCurrentPage
}) => {
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [query, setQuery] = useState<string>('');
  const [records, setRecords] = useState<LandLossRecord[]>(SAMPLE_LOSS_RECORDS);
  const [isLiveSupabase, setIsLiveSupabase] = useState<boolean>(false);

  React.useEffect(() => {
    async function loadLiveRecords() {
      if (isSupabaseConfigured()) {
        const liveData = await fetchErosionClaimsFromSupabase();
        if (liveData && liveData.length > 0) {
          setRecords([...liveData, ...SAMPLE_LOSS_RECORDS]);
          setIsLiveSupabase(true);
        }
      }
    }
    loadLiveRecords();
  }, []);

  const filteredRecords = records.filter(r => {
    const matchesDistrict = filterDistrict === 'all' || r.district.toLowerCase() === filterDistrict.toLowerCase();
    const matchesQuery = 
      r.ownerName.toLowerCase().includes(query.toLowerCase()) ||
      r.dagNo.includes(query) ||
      r.khatianNo.toLowerCase().includes(query.toLowerCase()) ||
      r.trackingId.toLowerCase().includes(query.toLowerCase()) ||
      r.mouza.toLowerCase().includes(query.toLowerCase());
    return matchesDistrict && matchesQuery;
  });

  return (
    <div className="py-10 bg-[#F5F1E8] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D9E1DC] pb-6">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#123B32] font-mono">
                {language === 'bn' ? 'নদীভাঙন ভূমি রেকর্ড রেজিস্ট্রি' : 'RIVER EROSION LAND RECORDS REGISTRY'}
              </span>
              <span className="w-8 h-0.5 bg-[#123B32]"></span>
            </div>
            <h1 className="text-3xl font-bold text-[#123B32] font-serif-title">
              {language === 'bn' ? 'যাচাইকৃত ভাঙন রেকর্ড ও ক্ষতিপূরণ দাবি' : 'Verified Erosion Records & Claim Dossiers'}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              {language === 'bn'
                ? 'সেন্টিনেল-২ উপগ্রহ ও সিএস/আরএস মৌজা নকশায় যাচাইকৃত নদীগর্ভে নিমজ্জিত দাগসমূহের তালিকা'
                : 'Cadastral parcels confirmed submerged into riverbeds via European Space Agency Sentinel-2 multispectral tracking.'}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isLiveSupabase && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>Live Supabase DB Connected</span>
              </span>
            )}
            <button
              onClick={() => setCurrentPage('signup')}
              className="bg-[#123B32] hover:bg-[#0c2822] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-colors shadow-sm"
            >
              <span>+ {language === 'bn' ? 'নতুন ভাঙন রেকর্ড দাখিল' : 'File New Erosion Claim'}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-[#D9E1DC] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={language === 'bn' ? 'দাগ নং, খতিয়ান, নাম বা মৌজা দিয়ে খুঁজুন...' : 'Search by Dag No, Khatian, Owner, or Mouza...'}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-[#64748B]" />
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-[#D9E1DC] focus:border-[#123B32] outline-none bg-white font-medium text-[#123B32]"
            >
              <option value="all">All Pilot Districts (সকল জেলা)</option>
              <option value="Kurigram">Kurigram (কুড়িগ্রাম)</option>
              <option value="Sirajganj">Sirajganj (সিরাজগঞ্জ)</option>
              <option value="Shariatpur">Shariatpur (শরীয়তপুর)</option>
            </select>
          </div>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-xl border border-[#D9E1DC] p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Badge */}
                <div className="flex items-center justify-between pb-2 border-b border-[#D9E1DC]">
                  <span className="text-[10px] font-mono text-[#64748B] font-bold">
                    {record.trackingId}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{record.status}</span>
                  </span>
                </div>

                {/* Owner & Location */}
                <div>
                  <h3 className="text-base font-bold text-[#123B32] leading-tight font-serif-title">
                    {record.ownerName}
                  </h3>
                  <p className="text-xs text-[#64748B]">{record.ownerBanglaName}</p>
                  <p className="text-xs text-[#123B32] font-medium flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" />
                    <span>{record.upazila}, {record.district} ({record.mouza})</span>
                  </p>
                </div>

                {/* Land Specs */}
                <div className="bg-[#F5F1E8] p-3 rounded-lg text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Dag / Plot No:</span>
                    <span className="font-bold text-[#123B32]">#{record.dagNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Khatian:</span>
                    <span className="font-medium text-[#1F2933]">{record.khatianNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Submerged Area:</span>
                    <span className="font-bold text-red-600">{record.submergedAreaAcre} Acres (100%)</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#D9E1DC] text-[11px]">
                    <span className="text-[#64748B]">River:</span>
                    <span className="font-semibold text-[#123B32]">{record.riverBasin}</span>
                  </div>
                </div>

                {/* Satellite match score */}
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span>Sentinel-2 Match:</span>
                  <span className="font-bold text-emerald-700">{record.satelliteSentinelMatch}%</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-[#D9E1DC] grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => onSelectRecord(record)}
                  className="bg-[#123B32] hover:bg-[#0c2822] text-white py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C6A66B]" />
                  <span>{language === 'bn' ? 'সনদ দেখুন' : 'Certificate'}</span>
                </button>
                <button
                  onClick={onOpenClaimDemo}
                  className="bg-[#D8E8DF] hover:bg-[#c6dfd0] text-[#123B32] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors border border-[#a8cfb9]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'দাবি পত্র' : 'Claim Draft'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

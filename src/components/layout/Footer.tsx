import React from 'react';
import { Scale, Phone, ShieldCheck, ExternalLink, MapPin } from 'lucide-react';
import { PageView, Language } from '../../types';

interface FooterProps {
  setCurrentPage: (page: PageView) => void;
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage, language }) => {
  return (
    <footer className="bg-[#123B32] text-white border-t border-[#1b4e43] mt-20">
      
      {/* Top Banner with Emergency Land Support */}
      <div className="bg-[#0c2721] border-b border-[#1b4e43] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-[#D8E8DF] gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">
              {language === 'bn' ? 'নদীভাঙন ও চর নাগরিক সহায়তা হটলাইন:' : 'Erosion Victim Emergency Citizen Desk:'}
            </span>
            <span className="font-mono bg-[#123B32] px-2 py-0.5 rounded border border-[#1b4e43] text-[#C6A66B]">
              16122 / +880 1700-SHIKOR
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[#D8E8DF]/70">
              {language === 'bn' ? 'মুক্ত উপাত্ত: ইউরোপিয়ান স্পেস এজেন্সি (ESA Sentinel-2) ও ভূমি রেকর্ড' : 'Open Geo-data: European Space Agency Sentinel-2 & MoL Mouza Data'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
              <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
                <Scale className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white font-serif-title">Shikor</span>
                <p className="text-[11px] text-[#D8E8DF]/75">
                  {language === 'bn' ? 'নদীভাঙনে হারানো জমির নাগরিক প্রমাণক' : 'Land Records for a Fairer Tomorrow'}
                </p>
              </div>
            </div>
            <p className="text-xs text-[#D8E8DF]/80 leading-relaxed">
              {language === 'bn' 
                ? 'নদীভাঙনে ভিটেমাটি হারানো প্রান্তিক মানুষের জন্য জিপিএস, ঐতিহাসিক মৌজা নকশা ও সেন্টিনেল স্যাটেলাইট দিয়ে খাস জমি পুনর্বাসনের অকাট্য ডিজিটাল প্রমাণক।' 
                : 'A citizen-powered digital evidence ecosystem generating cryptographic land loss certificates and automated AC Land claim petitions for climate-displaced char dwellers.'}
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-[#C6A66B]">
              <ShieldCheck className="w-4 h-4" />
              <span>{language === 'bn' ? 'নাগরিক উপাত্ত সুরক্ষিত ও এনক্রিপ্টকৃত' : 'Citizen-verified & Cryptographically signed'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-[#C6A66B] uppercase tracking-wider mb-4">
              {language === 'bn' ? 'প্ল্যাটফর্ম লিংক' : 'Platform Links'}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D8E8DF]">
              <li>
                <button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">
                  {language === 'bn' ? 'মূলপাতা (Home)' : 'Home'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('evidence')} className="hover:text-white transition-colors">
                  {language === 'bn' ? 'ভূমি রেকর্ড ও ভাঙন যাচাই (Land Records)' : 'Land Records & Verification'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('satellite')} className="hover:text-white transition-colors">
                  {language === 'bn' ? 'স্যাটেলাইট মৌজা ওভারলে (Services)' : 'Satellite Mouza Analysis'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('claims')} className="hover:text-white transition-colors">
                  {language === 'bn' ? 'ইউএনও/এসিল্যান্ড খাসজমি দাবি (Claims)' : 'AC Land & UNO Claim Petitions'}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('about')} className="hover:text-white transition-colors">
                  {language === 'bn' ? 'আমাদের লক্ষ্য ও চর পাইলট (About)' : 'Char Pilot & Roadmap'}
                </button>
              </li>
            </ul>
          </div>

          {/* Pilot Upazilas */}
          <div>
            <h4 className="text-xs font-semibold text-[#C6A66B] uppercase tracking-wider mb-4">
              {language === 'bn' ? 'সক্রিয় পাইলট চর অঞ্চল' : 'Active Char Pilots'}
            </h4>
            <ul className="space-y-2 text-xs text-[#D8E8DF]">
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>Chilmari, Kurigram (Brahmaputra)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>Kazipur, Sirajganj (Jamuna)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>Naria, Shariatpur (Padma)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>Haimchar, Chandpur (Meghna)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C6A66B]" />
                <span>Char Fasson, Bhola (Coastal Estuary)</span>
              </li>
            </ul>
          </div>

          {/* Legal Reference & Portals */}
          <div>
            <h4 className="text-xs font-semibold text-[#C6A66B] uppercase tracking-wider mb-4">
              {language === 'bn' ? 'আইনি ও সরকারি রেফারেন্স' : 'Legal & Policy Directives'}
            </h4>
            <ul className="space-y-2.5 text-xs text-[#D8E8DF]">
              <li>
                <span className="block text-white font-medium">SAT Act 1950 (Section 86)</span>
                <span className="text-[11px] text-[#D8E8DF]/70">Abatement of rent & right to alluvion/diluvion land</span>
              </li>
              <li>
                <span className="block text-white font-medium">1-No. Khas Khatian Policy</span>
                <span className="text-[11px] text-[#D8E8DF]/70">Priority rehabilitation of genuine erosion victims</span>
              </li>
              <li>
                <span className="block text-white font-medium">ESA Sentinel-2 Copernicus API</span>
                <span className="text-[11px] text-[#D8E8DF]/70">10m resolution spectral surface water indices</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar exactly like image */}
        <div className="pt-8 border-t border-[#1b4e43] flex flex-col sm:flex-row items-center justify-between text-xs text-[#D8E8DF]/80 gap-4">
          
          <div className="flex items-center space-x-3">
            <Scale className="w-4 h-4 text-[#C6A66B]" />
            <span className="font-semibold text-white">Shikor</span>
            <span className="text-[#D8E8DF]/60">·</span>
            <span className="text-xs">{language === 'bn' ? 'ন্যায্য ভবিষ্যতের জন্য জমি রেকর্ড' : 'Land Records for a Fairer Tomorrow'}</span>
          </div>

          <div className="flex items-center space-x-6 text-xs">
            <button onClick={() => setCurrentPage('home')} className="hover:text-white transition-colors">Home</button>
            <button onClick={() => setCurrentPage('satellite')} className="hover:text-white transition-colors">Services</button>
            <button onClick={() => setCurrentPage('about')} className="hover:text-white transition-colors">About</button>
            <button onClick={() => setCurrentPage('claims')} className="hover:text-white transition-colors">Contact</button>
          </div>

          <p className="text-xs text-[#D8E8DF]/60">
            © 2025 Shikor. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

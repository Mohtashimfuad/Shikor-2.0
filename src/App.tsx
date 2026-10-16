/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PageView, Language, LandLossRecord, UserSession } from './types';
import { SAMPLE_LOSS_RECORDS, SAMPLE_CLAIM } from './data/mockData';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { FeatureCards } from './components/landing/FeatureCards';
import { InteractiveEvidenceLab } from './components/landing/InteractiveEvidenceLab';
import { InteractiveErosionMap } from './components/map/InteractiveErosionMap';
import { CommunityProofSection } from './components/landing/CommunityProofSection';
import { AboutSection } from './components/landing/AboutSection';
import { SignInPage } from './components/auth/SignInPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { LandRecordsView } from './components/views/LandRecordsView';
import { SatelliteServicesView } from './components/views/SatelliteServicesView';
import { AboutRoadmapView } from './components/views/AboutRoadmapView';
import { CitizenProfileView } from './components/views/CitizenProfileView';
import { CertificateModal } from './components/certificate/CertificateModal';
import { ClaimDraftModal } from './components/claim/ClaimDraftModal';
import { BackendSetupModal } from './components/backend/BackendSetupModal';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [language, setLanguage] = useState<Language>('en');
  
  // Persisted Authenticated User Session
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('shikor_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('shikor_current_user');
    } catch (e) {
      // ignore
    }
    setCurrentPage('home');
  };
  
  // Modal states
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isBackendSetupOpen, setIsBackendSetupOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LandLossRecord>(SAMPLE_LOSS_RECORDS[0]);

  // Scroll to top whenever page view changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  const handleOpenCertificate = (record?: LandLossRecord) => {
    if (record) {
      setSelectedRecord(record);
    } else {
      setSelectedRecord(SAMPLE_LOSS_RECORDS[0]);
    }
    setIsCertificateOpen(true);
  };

  const handleSearch = (query: string) => {
    // Navigate to evidence records view to show search results
    setCurrentPage('evidence');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F1E8] text-[#1F2933]">
      
      {/* Universal Top Navigation Header */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        language={language}
        setLanguage={setLanguage}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenSearch={() => setCurrentPage('evidence')}
        onOpenBackendSetup={() => setIsBackendSetupOpen(true)}
      />

      {/* Main Page Layout Switcher */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <>
            {/* 1. Hero Section matching reference image */}
            <HeroSection
              language={language}
              onSearch={handleSearch}
              setCurrentPage={setCurrentPage}
              onOpenCertificateDemo={() => handleOpenCertificate()}
            />

            {/* 2. 5-Feature Grid Cards matching reference image */}
            <FeatureCards
              language={language}
              setCurrentPage={setCurrentPage}
              onOpenCertificateDemo={() => handleOpenCertificate()}
              onOpenClaimDemo={() => setIsClaimOpen(true)}
            />

            {/* 3. Real-Time Interactive High-Risk River Erosion Map Component */}
            <InteractiveErosionMap
              language={language}
              onOpenCertificateDemo={() => handleOpenCertificate()}
              onOpenClaimDemo={() => setIsClaimOpen(true)}
            />

            {/* 4. Interactive Satellite & Mouza Overlay Evidence Lab */}
            <InteractiveEvidenceLab
              language={language}
              onOpenCertificateDemo={() => handleOpenCertificate()}
              onOpenClaimDemo={() => setIsClaimOpen(true)}
            />

            {/* 5. Community Verification & Proof of Prior Possession */}
            <CommunityProofSection
              language={language}
            />

            {/* 6. About Shikor & Live Stats matching lower half of reference image */}
            <AboutSection
              language={language}
              setCurrentPage={setCurrentPage}
              onOpenCertificateDemo={() => handleOpenCertificate()}
            />
          </>
        )}

        {currentPage === 'signin' && (
          <SignInPage
            language={language}
            setCurrentPage={setCurrentPage}
            onSuccessLogin={(user) => {
              setCurrentUser(user);
              setCurrentPage('profile');
            }}
          />
        )}

        {currentPage === 'signup' && (
          <SignUpPage
            language={language}
            setCurrentPage={setCurrentPage}
            onRegisteredSuccess={(user) => {
              if (user) setCurrentUser(user);
              setCurrentPage('profile');
            }}
          />
        )}

        {currentPage === 'profile' && (
          <CitizenProfileView
            language={language}
            currentUser={currentUser}
            onLogout={handleLogout}
            setCurrentPage={setCurrentPage}
            onOpenCertificate={(rec) => handleOpenCertificate(rec)}
            onOpenClaim={() => setIsClaimOpen(true)}
          />
        )}

        {currentPage === 'evidence' && (
          <LandRecordsView
            language={language}
            onSelectRecord={(rec) => handleOpenCertificate(rec)}
            onOpenClaimDemo={() => setIsClaimOpen(true)}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'satellite' && (
          <>
            <InteractiveErosionMap
              language={language}
              onOpenCertificateDemo={() => handleOpenCertificate()}
              onOpenClaimDemo={() => setIsClaimOpen(true)}
            />
            <SatelliteServicesView
              language={language}
              onOpenCertificateDemo={() => handleOpenCertificate()}
              onOpenClaimDemo={() => setIsClaimOpen(true)}
              setCurrentPage={setCurrentPage}
            />
          </>
        )}

        {currentPage === 'about' && (
          <AboutRoadmapView
            language={language}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'claims' && (
          <div className="py-12 bg-[#F5F1E8]">
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-2xl border border-[#D9E1DC] p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold font-serif-title text-[#123B32]">
                  {language === 'bn' ? 'ইউএনও ও এসিল্যান্ড খাসজমি পুনর্বাসন আবেদন সেল' : 'UNO & AC Land Resettlement Claim Desk'}
                </h2>
                <p className="text-sm text-[#64748B] max-w-xl mx-auto">
                  {language === 'bn' 
                    ? 'চিলমারী ও কাজীপুর উপজেলার নদীভাঙনে ক্ষতিগ্রস্ত নাগরিকদের আবেদনের সরাসরি ডকেট।' 
                    : 'Submit your verifiable satellite evidence package directly to your local Upazila Land Office.'}
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => setIsClaimOpen(true)}
                    className="bg-[#123B32] text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-[#0c2822] transition-colors"
                  >
                    {language === 'bn' ? 'নমুনা পুনর্বাসন আবেদন খুলুন' : 'Open Official Claim Petition'}
                  </button>
                  <button
                    onClick={() => setCurrentPage('signup')}
                    className="bg-[#D8E8DF] text-[#123B32] px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-[#c9e0d3] transition-colors"
                  >
                    {language === 'bn' ? 'নতুন আবেদনকারী নিবন্ধন' : 'Register New Claimant'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Universal Footer matching reference image */}
      <Footer
        setCurrentPage={setCurrentPage}
        language={language}
      />

      {/* Interactive Official Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        record={selectedRecord}
        language={language}
      />

      {/* Interactive AC Land Claim Draft Modal */}
      <ClaimDraftModal
        isOpen={isClaimOpen}
        onClose={() => setIsClaimOpen(false)}
        claim={SAMPLE_CLAIM}
        language={language}
      />

      {/* Interactive Supabase Backend Integration Assistant Modal */}
      <BackendSetupModal
        isOpen={isBackendSetupOpen}
        onClose={() => setIsBackendSetupOpen(false)}
        language={language}
      />

    </div>
  );
}

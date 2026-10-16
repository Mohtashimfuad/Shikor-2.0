import React, { useState } from 'react';
import { Users, ShieldCheck, CheckCircle2, Lock, Smartphone, ThumbsUp, ArrowRight } from 'lucide-react';
import { Language } from '../../types';

interface CommunityProofSectionProps {
  language: Language;
}

export const CommunityProofSection: React.FC<CommunityProofSectionProps> = ({ language }) => {
  const [attestationCount, setAttestationCount] = useState<number>(14);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  const witnesses = [
    { name: 'Haji Nurul Islam', role: 'Elder & Former Union Parishad Member', distance: 'Adjacent Plot #283', time: 'Signed 2 days ago' },
    { name: 'Mst. Saleha Begum', role: 'Char Natundiar Resident (32 Years)', distance: 'South Boundary Neighbor', time: 'Signed 3 days ago' },
    { name: 'Kazi Mosharraf', role: 'Local Primary School Headmaster', distance: 'Char Chilmari Central', time: 'Signed 4 days ago' }
  ];

  const handleAttest = () => {
    if (!hasVoted) {
      setAttestationCount(prev => prev + 1);
      setHasVoted(true);
    }
  };

  return (
    <section className="py-14 bg-[#F5F1E8] border-b border-[#D9E1DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-2xl border border-[#D9E1DC] p-6 lg:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Story (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#123B32] font-mono">
                  {language === 'bn' ? 'সামাজিক সাক্ষ্য ও ব্লকচেইন টাইমস্ট্যাম্প' : 'COMMUNITY PROOF OF POSSESSION'}
                </span>
                <span className="w-8 h-0.5 bg-[#123B32]"></span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-[#123B32] font-serif-title">
                {language === 'bn' 
                  ? 'কাগজ হারিয়ে গেলেও হারাবে না পূর্বতন দখলের সামাজিক স্বীকৃতি' 
                  : 'Proof of Prior Possession: When Floods Wash Away Physical Boundaries'}
              </h2>

              <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                {language === 'bn'
                  ? 'চরের জমি নদীগর্ভে হারিয়ে গেলে কাগজপত্রের সীমানা নষ্ট হয়ে যায়। শিকড়ে প্রতিবেশী ও স্থানীয় জনপ্রতিনিধিরা মোবাইল থেকে ডিজিটাল সাক্ষ্য প্রদান করেন। এই সাক্ষ্য কম খরচের ব্লকচেইন লেজারে টাইমস্ট্যাম্প হয়ে যায়, যা আদালতে ও এসিল্যান্ডের শুনানিতে গ্রহণযোগ্য।'
                  : 'When river erosion engulfs a char homestead, physical landmarks disappear. Shikor enables adjacent landowners and community leaders to authenticate past possession with a single tap, anchored into an immutable, low-cost civic timestamp ledger.'}
              </p>

              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-1.5 text-xs text-[#123B32] font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Low-Cost Cryptographic Hash</span>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-[#123B32] font-bold">
                  <Users className="w-4 h-4 text-[#C6A66B]" />
                  <span>Peer-Witness Consensus</span>
                </div>
              </div>
            </div>

            {/* Right Live Witness Card (6 cols) */}
            <div className="lg:col-span-6 bg-[#F5F1E8] rounded-xl border border-[#D9E1DC] p-5 space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#D9E1DC]">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#123B32]">Live Witness Docket: Dag #284 (Rahim Mondol)</span>
                  <div className="text-[11px] text-[#64748B] font-mono">Ledger ID: 0x8f4d92a11b6c...93e1</div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#123B32] font-mono">{attestationCount}</span>
                  <span className="block text-[10px] text-emerald-800 font-semibold">Attested Witnesses</span>
                </div>
              </div>

              {/* Witness list */}
              <div className="space-y-2">
                {witnesses.map((w, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-[#D9E1DC] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#D8E8DF] text-[#123B32] flex items-center justify-center font-bold text-[11px]">
                        {w.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[#123B32]">{w.name}</div>
                        <div className="text-[10px] text-[#64748B]">{w.role} • {w.distance}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-mono font-medium">{w.time}</span>
                  </div>
                ))}
              </div>

              {/* Interactive Demo Attestation Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAttest}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                    hasVoted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-[#123B32] hover:bg-[#0c2822] text-white shadow-sm'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'text-emerald-700' : 'text-[#C6A66B]'}`} />
                  <span>
                    {hasVoted 
                      ? (language === 'bn' ? 'সাক্ষ্য প্রদান রেকর্ড করা হয়েছে (ব্লকচেইন হ্যাশ তৈরি হয়েছে)' : 'Possession Attested (Cryptographic Timestamp Created)')
                      : (language === 'bn' ? 'সাক্ষী হিসেবে প্রত্যয়ন করুন (ডেমো ক্লিক)' : 'Attest Prior Possession as Local Neighbor (Demo Click)')}
                  </span>
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

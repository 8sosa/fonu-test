import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { ShieldCheck, CreditCard, Clock, AlertCircle, ChevronRight, CheckCircle2, User, MapPin, Phone } from 'lucide-react';

const KycSubmissionForm = ({ onRefresh }: { onRefresh: () => void }) => {
  const [docType, setDocType] = useState('Passport');
  const [idNumber, setIdNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userId = localStorage.getItem('userId');
      await api.post(`/customers/${userId}/kyc/submit`, { 
        documentType: docType, 
        documentNumber: idNumber 
      });
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04kM12 21.48l1.618-3.041a12 12 0 000-10.878L12 2.944l-1.618 3.041a12 12 0 000 10.878L12 21.48z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Identity Verification</h2>
          <p className="text-sm text-indigo-600/80">Complete this to unlock full features</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select 
            className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            <option value="Passport">Passport</option>
            <option value="National ID">National ID (NIN)</option>
            <option value="BVN">BVN</option>
            <option value="Drivers License">Driver's License</option>
          </select>

          <input 
            type="text" 
            placeholder="Document Number" 
            className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 transition-all shadow-md shadow-indigo-100"
        >
          {loading ? 'Processing...' : 'Submit Verification'}
        </button>
      </form>
    </div>
  );
};

export const CustomerPortal = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isPaying, setIsPaying] = useState<string | null>(null);

  const fetchProfile = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
      const { data } = await api.get(`/customers/${userId}`);
      setProfile(data);
    } catch (err: any) {
      console.error("Failed to load profile", err.message);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handlePayNow = async (subId: string) => {
    setIsPaying(subId);
    try {
      // Simulation of a payment gateway redirect/process
      await api.post('/customers/simulate-payment', { subscriptionId: subId });
      setTimeout(() => {
        fetchProfile();
        setIsPaying(null);
      }, 1500);
    } catch (err) {
      alert("Payment simulation failed.");
      setIsPaying(null);
    }
  };

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading your portal...</p>
      </div>
    </div>
  );

  const kycStatus = profile.kyc?.status || 'NOT_STARTED';

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Top Navigation / Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">Fonu User Portal</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">{profile.name || 'User'}</p>
                <p className="text-[10px] text-slate-400">{profile.email}</p>
             </div>
             <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
               {profile.email[0].toUpperCase()}
             </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: KYC Status Card */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Identity Status
              </h3>
              
              {/* Vertical Step Indicator */}
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                <Step icon={<CheckCircle2 className="w-3 h-3"/>} label="Account Created" active={true} complete={true} />
                <Step 
                   icon={<Clock className="w-3 h-3"/>} 
                   label="Submit Documents" 
                   active={kycStatus === 'NOT_STARTED' || kycStatus === 'REJECTED'} 
                   complete={kycStatus !== 'NOT_STARTED' && kycStatus !== 'REJECTED'} 
                />
                <Step 
                   icon={<ShieldCheck className="w-3 h-3"/>} 
                   label="Admin Approval" 
                   active={kycStatus === 'PENDING'} 
                   complete={kycStatus === 'APPROVED'} 
                />
              </div>

              {kycStatus === 'REJECTED' && (
                <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div className="flex items-center gap-2 text-red-700 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">Verification Failed</span>
                  </div>
                  <p className="text-[11px] text-red-600 leading-relaxed">{profile.kyc.rejectionReason}</p>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5">
                <User size={120} />
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {/* Full Name */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <User className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</p>
                    <p className="text-sm font-bold text-slate-700">{profile.name}</p>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Phone</p>
                    <p className="text-sm font-bold text-slate-700">{profile.phone || 'Not provided'}</p>
                  </div>
                </div>

                {/* Address - Spans full width */}
                <div className="flex items-start gap-3 md:col-span-2 border-t border-slate-50 pt-4">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Primary Address</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                      {profile.address || 'No address on file'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Actionable KYC Form */}
            {(kycStatus === 'NOT_STARTED' || kycStatus === 'REJECTED') && (
              <KycSubmissionForm onRefresh={fetchProfile} />
            )}

            {/* Subscriptions Card */}
            <section className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Subscriptions</h2>
                  <p className="text-sm text-slate-500">Manage your recurring plans</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <CreditCard className="w-6 h-6 text-slate-400" />
                </div>
              </div>

              {profile.subscriptions?.length > 0 ? (
                <div className="space-y-4">
                  {profile.subscriptions.map((sub: any) => (
                    <div key={sub.id} className="group p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-100 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1 block">{sub.plan} Plan</span>
                          <h4 className="text-2xl font-bold text-slate-900">₦{(sub.amount).toLocaleString()}</h4>
                        </div>
                        <StatusBadge status={sub.status} />
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                         <p className="text-xs text-slate-400">
                           {sub.status === 'ACTIVE' ? `Next renewal: ${new Date(sub.renewalDate).toLocaleDateString()}` : 'Payment required to activate'}
                         </p>
                         {sub.status === 'INACTIVE' && (
                           <button 
                             onClick={() => handlePayNow(sub.id)}
                             disabled={kycStatus !== 'APPROVED' || isPaying === sub.id}
                             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
                               kycStatus === 'APPROVED' 
                               ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100' 
                               : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                             }`}
                           >
                             {isPaying === sub.id ? 'Processing...' : 'Secure Pay'}
                             <ChevronRight className="w-4 h-4" />
                           </button>
                         )}
                      </div>
                      
                      {kycStatus !== 'APPROVED' && sub.status === 'INACTIVE' && (
                        <p className="mt-3 text-[10px] text-amber-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Verify your identity to enable payments
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm font-medium">No active subscriptions assigned.</p>
                  <p className="text-[11px] text-slate-300 mt-1 uppercase tracking-widest">Contact support to get started</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const Step = ({ icon, label, active, complete }: any) => (
  <div className="flex items-center gap-3 relative z-10">
    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
      complete ? 'bg-indigo-600 border-indigo-600 text-white' : 
      active ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-white border-slate-200 text-slate-300'
    }`}>
      {icon}
    </div>
    <span className={`text-xs font-bold ${active || complete ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    INACTIVE: 'bg-slate-100 text-slate-500 border-slate-200',
    PAST_DUE: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-tighter ${styles[status] || styles.INACTIVE}`}>
      {status}
    </span>
  );
};
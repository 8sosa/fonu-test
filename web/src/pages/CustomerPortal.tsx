import React, { useEffect, useState } from 'react';
import api from '../api/client';

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
    try {
      await api.post('/customers/simulate-payment', { subscriptionId: subId });
      fetchProfile(); 
    } catch (err) {
      alert("Payment failed simulation.");
    }
  };

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Portal</h1>
          <p className="text-gray-500">Account: <span className="font-medium text-gray-700">{profile.email}</span></p>
        </header>

        <div className="grid gap-8">
          {/* KYC SECTION */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-800">Account Verification</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                profile.kyc?.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                profile.kyc?.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {profile.kyc?.status || 'Not Started'}
              </span>
            </div>

            {(!profile.kyc || profile.kyc.status === 'NONE' || profile.kyc.status === 'REJECTED') ? (
              <KycSubmissionForm onRefresh={fetchProfile} />
            ) : (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <span className="text-2xl">{profile.kyc.status === 'APPROVED' ? '✅' : '⏳'}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Verification details submitted</p>
                  <p className="text-xs text-gray-400 font-mono uppercase">{profile.kyc.documentType}: {profile.kyc.documentNumber}</p>
                </div>
              </div>
            )}
            
            {profile.kyc?.status === 'REJECTED' && (
              <div className="mt-4 p-4 bg-red-50 rounded-2xl border border-red-100 text-sm text-red-700">
                <p className="font-bold mb-1">Rejection Reason:</p>
                <p>{profile.kyc.rejectionReason}</p>
              </div>
            )}
          </section>

          {/* SUBSCRIPTION SECTION */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Billing & Subscriptions</h2>
            {profile.subscriptions?.length > 0 ? (
              <div className="space-y-4">
                {profile.subscriptions.map((sub: any) => (
                  <div key={sub.id} className="p-5 rounded-2xl border border-gray-50 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-4 transition-all hover:shadow-md hover:bg-white hover:border-indigo-100">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm">
                        <span className="text-xl">💳</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{sub.plan} Plan</p>
                        <p className="text-sm font-semibold text-indigo-600">₦{(sub.amount).toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${
                        sub.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {sub.status}
                      </span>
                      
                      {sub.status === 'INACTIVE' && (
                        <button 
                          onClick={() => handlePayNow(sub.id)}
                          className="flex-1 md:flex-none bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="text-4xl mb-4">🔔</div>
                <p className="text-gray-400 italic">No active subscriptions. Contact admin to assign a plan.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
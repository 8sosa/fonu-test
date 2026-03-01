import { useEffect, useState } from 'react';
import api from '../api/client';
import { SubscriptionModal } from './SubscriptionModal';

export const AdminDashboard = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get(`/customers?search=${search}`);
      setCustomers(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    api.get('/webhooks')
      .then(res => {
        setEvents(res.data);
        console.log("Webhooks loaded:", res.data);
      })
      .catch(err => console.error("Webhook fetch failed:", err));
  }, []);

  const handleApprove = async (id: string) => {
    await api.post(`/customers/${id}/kyc/approve`);
    fetchCustomers();
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason) {
      await api.post(`/customers/${id}/kyc/reject`, { reason });
      fetchCustomers();
    }
  };

  const handleCancel = async (subId: string) => {
    if (window.confirm("Are you sure you want to cancel this subscription?")) {
      await api.post(`/subscriptions/${subId}/cancel`);
      fetchCustomers();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500">Manage KYC verifications and customer subscriptions.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl w-64 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && fetchCustomers()} 
              />
            </div>
            <button 
              onClick={fetchCustomers} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-md shadow-indigo-100"
            >
              Search
            </button>
          </div>
        </div>
  
        {/* Main Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-10">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((user) => (
                <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{user.email}</span>
                      {user.kyc && (
                        <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded uppercase tracking-tighter text-[10px]">{user.kyc.documentType}</span>
                          <span className="font-mono">{user.kyc.documentNumber}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      user.kyc?.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' : 
                      user.kyc?.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' : 
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                         user.kyc?.status === 'APPROVED' ? 'bg-green-500' : 
                         user.kyc?.status === 'REJECTED' ? 'bg-red-500' : 'bg-amber-500'
                      }`}></span>
                      {user.kyc?.status || 'NO RECORD'}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-3">
                      {/* KYC Actions */}
                      {user.kyc?.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(user.id)} className="text-green-600 hover:bg-green-50 px-3 py-1 rounded-lg border border-green-200 transition-all">Approve</button>
                          <button onClick={() => handleReject(user.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg border border-red-200 transition-all">Reject</button>
                        </div>
                      )}
  
                      {/* Subscription logic */}
                      {user.kyc?.status === 'APPROVED' && !user.subscriptions?.some((s: any) => s.status !== 'CANCELLED') && (
                        <button 
                          onClick={() => setSelectedCustomerId(user.id)}
                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-4 py-1.5 rounded-lg font-medium transition-all"
                        >
                          Assign Plan
                        </button>
                      )}
  
                      {user.subscriptions?.find((s: any) => s.status === 'ACTIVE') && (
                        <div className="flex items-center gap-3">
                          <span className="text-green-600 font-semibold text-xs bg-green-50 px-2 py-1 rounded">✓ ACTIVE</span>
                          <button 
                            onClick={() => handleCancel(user.subscriptions.find((s: any) => s.status === 'ACTIVE').id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Cancel Plan"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        {/* Webhook Audit Log Card */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Financial Audit Log</h2>
            
            {/* Toggle for View Modes */}
            <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
              <button 
                onClick={() => setViewMode('table')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
              >
                Transactions
              </button>
              <button 
                onClick={() => setViewMode('json')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'json' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
              >
                Raw JSON
              </button>
            </div>
          </div>

          {viewMode === 'table' ? (
            /* Human Readable Transaction Table */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Plan</th>
                    <th className="px-6 py-3 text-center text-[10px] font-bold text-gray-400 uppercase">Event</th>
                    <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {events.map((ev) => {
                  // Defensive check for amount: use enhanced amount OR try to find it in payload
                  const displayAmount = ev.amount || ev.payload?.data?.amount || 0;
                  
                  // Defensive check for event type
                  const displayType = ev.type || ev.payload?.event || 'unknown.event';

                  return (
                    <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                        {new Date(ev.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">
                        {ev.userEmail || 'System/Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">
                          {ev.plan || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          displayType.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {displayType.replace('.', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-bold text-gray-900">
                        ₦{(displayAmount).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Technical Raw JSON View */
            <div className="bg-[#0f172a] p-6 rounded-2xl font-mono text-xs overflow-x-auto">
              {events.length > 0 ? (
                    events.map(ev => (
                      <div key={ev.id} className="mb-6 last:mb-0 border-l-2 border-indigo-500/30 pl-4 relative">
                        <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                        <div className="flex justify-between text-indigo-400/80 mb-2">
                          <span className="bg-indigo-500/10 px-1.5 py-0.5 rounded text-[10px]">{new Date(ev.createdAt).toLocaleString()}</span>
                          <span className="font-bold text-green-400 tracking-widest">{ev.eventType}</span>
                        </div>
                        <pre className="text-blue-100/70 bg-black/20 p-3 rounded-lg border border-white/5 shadow-inner">
                          {JSON.stringify(ev.payload, null, 2)}
                        </pre>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-center py-10">No webhook events recorded yet.</p>
                  )}
                </div>
          )}
        </div>
  
        {selectedCustomerId && (
          <SubscriptionModal 
            customerId={selectedCustomerId} 
            onClose={() => setSelectedCustomerId(null)}
            onSuccess={fetchCustomers}
          />
        )}
      </div>
    </div>
  );
};
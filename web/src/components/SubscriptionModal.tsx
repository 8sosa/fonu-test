import React, { useState } from 'react';
import api from '../api/client';

interface Props {
  customerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

// 1. Define the price mapping outside the component
const PLAN_PRICES: Record<string, number> = {
  BASIC: 10000,
  PRO: 25000,
  BUSINESS: 50000,
};

export const SubscriptionModal = ({ customerId, onClose, onSuccess }: Props) => {
  const [plan, setPlan] = useState('BASIC');
  const [amount, setAmount] = useState(PLAN_PRICES.BASIC);

  // 2. Update both plan and amount when selection changes
  const handlePlanChange = (selectedPlan: string) => {
    setPlan(selectedPlan);
    setAmount(PLAN_PRICES[selectedPlan]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Now 'amount' will match the selected plan
      await api.post(`/customers/${customerId}/subscriptions`, { plan, amount });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create subscription");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Assign Subscription</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium text-gray-700">Select Plan</label>
          <select 
            className="w-full p-2 border mb-2 rounded bg-gray-50"
            value={plan} 
            onChange={(e) => handlePlanChange(e.target.value)}
          >
            <option value="BASIC">Basic (₦10,000)</option>
            <option value="PRO">Pro (₦25,000)</option>
            <option value="BUSINESS">Business (₦50,000)</option>
          </select>
          
          {/* Visual confirmation of the amount being sent */}
          <p className="text-sm text-gray-500 mb-6 italic">
            Total to be billed: <span className="font-bold text-gray-800">₦{amount.toLocaleString()}</span>
          </p>

          <div className="flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition"
            >
              Confirm & Assign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
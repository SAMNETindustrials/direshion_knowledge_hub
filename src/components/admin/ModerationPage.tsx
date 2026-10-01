'use client';
import React from 'react';
import { Shield, Check, X } from 'lucide-react';

export default function ModerationPage({ fares, onApprove }: { fares: any[], onApprove: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Moderation Queue & Reviews</h2>
        <p className="text-xs text-slate-500">Review incoming submissions and verify outlier handling rules.</p>
      </div>

      <div className="space-y-3">
        {fares.map(f => (
          <div key={f.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs shadow-xs">
            <div>
              <span className="font-bold text-emerald-700 uppercase">Fare ({f.transport_mode})</span>
              <p className="font-semibold text-slate-900">{f.origin} → {f.destination} — {f.currency}{f.amount}</p>
            </div>
            <button 
              onClick={() => onApprove(f.id)} 
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl font-bold transition flex items-center gap-1 shadow-sm"
            >
              <Check className="w-4 h-4" /> Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
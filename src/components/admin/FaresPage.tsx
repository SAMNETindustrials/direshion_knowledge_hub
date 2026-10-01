'use client';
import React from 'react';
import { FileText, Plus, Search } from 'lucide-react';

export default function FaresPage({ fares }: { fares: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Transport Fares Management</h2>
          <p className="text-xs text-slate-500">Monitor and manage all crowdsourced fare observations.</p>
        </div>
        <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Add New Fare
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800">All Fare Submissions ({fares.length})</span>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search route..." className="pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
          </div>
        </div>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="p-3 font-semibold">Mode</th>
              <th className="p-3 font-semibold">Origin → Destination</th>
              <th className="p-3 font-semibold">Amount</th>
              <th className="p-3 font-semibold">Contributor</th>
              <th className="p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {fares.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold uppercase text-emerald-700">{f.transport_mode}</td>
                <td className="p-3 font-semibold text-slate-900">{f.origin} → {f.destination}</td>
                <td className="p-3 font-bold text-emerald-600">{f.currency}{f.amount}</td>
                <td className="p-3 text-slate-500">{f.contributor}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800">{f.verification_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
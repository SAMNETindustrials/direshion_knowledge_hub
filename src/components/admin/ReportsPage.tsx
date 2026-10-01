'use client';
import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ReportsPage({ reports }: { reports: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Road Conditions & Disruptions</h2>
        <p className="text-xs text-slate-500">Review real-time community observations on flooding, traffic, and closures.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <th className="p-3 font-semibold">Type</th>
              <th className="p-3 font-semibold">Title</th>
              <th className="p-3 font-semibold">Location</th>
              <th className="p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="p-3 font-bold uppercase text-amber-700">{r.report_type}</td>
                <td className="p-3 font-semibold text-slate-900">{r.title}</td>
                <td className="p-3 text-slate-600">{r.location_description}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded font-bold text-[10px] bg-amber-100 text-amber-800">{r.verification_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
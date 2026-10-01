'use client';

import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { INITIAL_FARES, INITIAL_REPORTS } from '@/data/mockData';
import { FareSubmission, RoadReport } from '@/types';

export default function AdminDashboard() {
  const [fares, setFares] = useState<FareSubmission[]>(INITIAL_FARES);
  const [reports, setReports] = useState<RoadReport[]>(INITIAL_REPORTS);
  const [activeSubTab, setActiveSubTab] = useState<'fares' | 'reports'>('fares');

  const handleUpdateFareStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setFares(fares.map(f => f.id === id ? { ...f, verification_status: status } : f));
  };

  const handleUpdateReportStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    setReports(reports.map(r => r.id === id ? { ...r, verification_status: status } : r));
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Secure Admin Portal
          </div>
          <h1 className="text-2xl font-bold text-white">Direshion Moderation Dashboard</h1>
          <p className="text-slate-400 text-sm">Review incoming community submissions, verify fare ranges, and manage data quality.</p>
        </div>
        <button 
          onClick={() => { alert('Data synced with Supabase staging branch.'); }}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 transition"
        >
          <RefreshCw className="w-4 h-4" /> Sync Database
        </button>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('fares')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeSubTab === 'fares' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Fare Submissions ({fares.filter(f => f.verification_status === 'PENDING').length} pending)
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
            activeSubTab === 'reports' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Road Reports ({reports.filter(r => r.verification_status === 'PENDING').length} pending)
        </button>
      </div>

      {/* Fares Moderation Queue */}
      {activeSubTab === 'fares' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" /> Incoming Fare Verification Queue
          </div>
          <div className="divide-y divide-slate-800">
            {fares.map((fare) => (
              <div key={fare.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-850 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {fare.transport_mode}
                    </span>
                    <span className="text-white font-medium">{fare.origin} → {fare.destination}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      fare.verification_status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      fare.verification_status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {fare.verification_status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-4">
                    <span>Amount: <strong className="text-white">{fare.currency}{fare.amount}</strong></span>
                    <span>Date: {fare.trip_date}</span>
                    <span>Contributor: {fare.contributor || 'Anonymous'}</span>
                  </div>
                  {fare.notes && <p className="text-xs text-slate-400 italic">"{fare.notes}"</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateFareStatus(fare.id, 'APPROVED')}
                    className="inline-flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/30 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleUpdateFareStatus(fare.id, 'REJECTED')}
                    className="inline-flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-500/30 transition"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Road Reports Moderation Queue */}
      {activeSubTab === 'reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-semibold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" /> Disruption & Road Condition Queue
          </div>
          <div className="divide-y divide-slate-800">
            {reports.map((report) => (
              <div key={report.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {report.report_type}
                    </span>
                    <span className="text-white font-medium">{report.title}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Location: <strong className="text-white">{report.location_description}</strong> • {report.created_at}
                  </div>
                  <p className="text-xs text-slate-300">{report.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateReportStatus(report.id, 'APPROVED')}
                    className="inline-flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-500/30 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Verify
                  </button>
                  <button
                    onClick={() => handleUpdateReportStatus(report.id, 'REJECTED')}
                    className="inline-flex items-center gap-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-500/30 transition"
                  >
                    <XCircle className="w-4 h-4" /> Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
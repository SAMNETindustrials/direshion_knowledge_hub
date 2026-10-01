'use client';
import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Hub Analytics & Reports</h2>
        <p className="text-xs text-slate-500">Analyze contribution growth trends and commuter engagement.</p>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-500 shadow-xs">
        Growth trend engine reporting +15% week-over-week engagement across Port Harcourt sectors.
      </div>
    </div>
  );
}
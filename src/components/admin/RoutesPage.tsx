'use client';
import React from 'react';
import { Compass, Plus } from 'lucide-react';

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Routes & Landmarks Curation</h2>
          <p className="text-xs text-slate-500">Manage validated transport corridors, transfer stops, and landmarks.</p>
        </div>
        <button className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" /> Add Route
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Rumuola → Woji', 'Mile 3 → Artillery', 'Rumuomasi → Garrison'].map((r, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded">Corridor</span>
            <h4 className="font-bold text-slate-900 text-sm">{r}</h4>
            <p className="text-xs text-slate-500">Verified transfer stops & Keke parks registered.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
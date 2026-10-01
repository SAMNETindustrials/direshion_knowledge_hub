'use client';
import React from 'react';
import { MapPin } from 'lucide-react';

export default function MapEditorPage({ apiKey }: { apiKey: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">Interactive Map Editor</h2>
        <p className="text-xs text-slate-500">Manage geographical nodes, bus stops, and route polylines.</p>
      </div>
      <div className="h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
        {apiKey ? (
          <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=Port+Harcourt,Nigeria`}></iframe>
        ) : (
          <div className="flex items-center justify-center h-full bg-white text-slate-400 text-xs">API key required in .env.local</div>
        )}
      </div>
    </div>
  );
}
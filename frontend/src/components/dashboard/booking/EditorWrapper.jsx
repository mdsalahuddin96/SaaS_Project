"use client";

import dynamic from "next/dynamic";

const CollaborativeEditor = dynamic(
  () => import("@/components/dashboard/booking/CollaborativeEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 gap-2">
        <span className="text-sm">Loading Collaborative Editor...</span>
      </div>
    ),
  }
);

export default function EditorWrapper({ bookingId, subdomain, currentUser }) {
  return (
    <CollaborativeEditor
      bookingId={bookingId}
      subdomain={subdomain}
      currentUser={currentUser}
    />
  );
}
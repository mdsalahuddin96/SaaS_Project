'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TenantDashboardPage() {
  const params = useParams();
  const {subdomain}=params
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const fetchTenantBookings = async () => {
      try {
        // Request with subdomain to backend
        const res = await fetch(`http://${subdomain}.localhost:5000/api/bookings`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load tenant bookings.');
        }

        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantBookings();
  }, [subdomain]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white capitalize">{subdomain} Workspace</h2>
          <p className="text-slate-400 text-sm">Tenant Isolation Active via Request Context</p>
        </div>
        <div className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 px-4 py-2 rounded-lg text-sm font-semibold">
          Total Bookings: {bookings.length}
        </div>
      </div>

      {/* loading and error handling */}
      {loading && (
        <div className="p-8 text-center text-slate-400">Loading isolated tenant data...</div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Booking table */}
      {!loading && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-semibold text-slate-300">
            Recent Bookings
          </div>
          {bookings.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No bookings found for this tenant workspace.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs font-semibold">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Booking Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-800/50 transition">
                      <td className="p-4 font-medium text-white">
                        {booking.userId?.name || 'N/A'}
                      </td>
                      <td className="p-4 text-slate-400">
                        {booking.userId?.email || 'N/A'}
                      </td>
                      <td className="p-4">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
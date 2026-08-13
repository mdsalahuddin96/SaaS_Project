"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Clock,
  Calendar as CalendarIcon,
  Trash2,
  Briefcase,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";
import { deleteBooking, updateBooking } from "@/lib/api/bookings";
import Link from "next/link";

export default function BookingList({
  bookings,
  loading,
  subdomain,
  onRefresh,
}) {
  const [updatingId, setUpdatingId] = useState(null);

  // Status Change Handler
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      await updateBooking(subdomain, bookingId, { status: newStatus });
      toast.success(`Booking status updated to ${newStatus}`);
      onRefresh();
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Handler
  const handleDelete = async (bookingId) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      setUpdatingId(bookingId);
      await deleteBooking(subdomain, bookingId);
      toast.success("Booking deleted successfully");
      onRefresh();
    } catch (error) {
      toast.error(error.message || "Failed to delete booking");
    } finally {
      setUpdatingId(null);
    }
  };

  // Badge Color Styles
  const statusStyles = {
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    completed: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"></div>
        <p className="text-slate-400 text-sm">Fetching bookings data...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
        <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-200">
          No Bookings Found
        </h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          There are no appointments or bookings matching your search or filter
          criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookings.map((booking) => (
        <div
          key={booking?._id}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
        >
          {/* Header: Service Name & Status Badge */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-medium bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                <Briefcase className="w-3 h-3" />
                {booking?.serviceName}
              </span>
              <h3 className="text-lg font-semibold text-white mt-2 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                {booking?.customerName}
              </h3>
            </div>

            {/* Status Dropdown */}
            <select
              disabled={updatingId === booking._id}
              value={booking?.status}
              onChange={(e) => handleStatusChange(booking._id, e.target.value)}
              className={`text-xs font-medium px-2.5 py-1 rounded-md border focus:outline-none capitalize cursor-pointer ${
                statusStyles[booking.status] || statusStyles.pending
              }`}
            >
              <option value="pending" className="bg-slate-900 text-white">
                Pending
              </option>
              <option value="confirmed" className="bg-slate-900 text-white">
                Confirmed
              </option>
              <option value="completed" className="bg-slate-900 text-white">
                Completed
              </option>
              <option value="cancelled" className="bg-slate-900 text-white">
                Cancelled
              </option>
            </select>
          </div>

          {/* Details: Time, Email, Phone */}
          <div className="space-y-2 text-xs text-slate-300 border-t border-b border-slate-800/80 py-3">
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {new Date(booking?.bookingDate).toLocaleDateString("en-US", {
                  dateStyle: "medium",
                })}
              </span>
              <Clock className="w-3.5 h-3.5 text-indigo-400 ml-2" />
              <span>
                {booking?.startTime} - {booking?.endTime}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate">{booking?.customerEmail}</span>
            </div>

            {booking.customerPhone && (
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-3.5 h-3.5" />
                <span>{booking?.customerPhone}</span>
              </div>
            )}

            {booking?.notes && (
              <p className="text-slate-400 italic mt-1 bg-slate-950/50 p-2 rounded text-[11px] border border-slate-800/50">
                &quot;{booking?.notes}&quot;
              </p>
            )}
          </div>

          {/* Card Footer */}
          {/* <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              ID: ...{booking?._id.slice(-6)}
            </span>

            <button
              onClick={() => handleDelete(booking._id)}
              disabled={updatingId === booking._id}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
              title="Delete Booking"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div> */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
            <span className="text-[11px] text-slate-500 font-mono">
              #{booking?._id.slice(-6)}
            </span>

            <div className="flex items-center gap-2">
              {/* Collaborative Editor Page-এ যাওয়ার লিংক */}
              <Link
                href={`/tenants/${subdomain}/dashboard/bookings/${booking._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded-lg text-xs font-medium transition-colors border border-indigo-500/20"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Notes & Live Sync</span>
              </Link>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(booking._id)}
                disabled={updatingId === booking._id}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                title="Delete Booking"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

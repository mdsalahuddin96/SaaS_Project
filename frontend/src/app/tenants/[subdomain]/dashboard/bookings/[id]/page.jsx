// import EditorWrapper from '@/components/dashboard/booking/EditorWrapper';

// export default async function BookingDetailsPage({ params }) {
//   const { subdomain, id } = await params;

//   return (
//     <div className="p-6 max-w-4xl mx-auto space-y-6">
//       <h1 className="text-xl font-bold text-white">Booking #{id} Details</h1>

//       {/* Collaborative Notes Section */}
//       <EditorWrapper bookingId={id} subdomain={subdomain} />
//     </div>
//   );
// }

"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock3,
  Users,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import CollaborativeEditor from "@/components/dashboard/booking/CollaborativeEditor";
import { fetchBookings, updateBooking } from "@/lib/api/bookings";
import { useSession } from "@/lib/auth-client";

export default function BookingDetailsPage({ params }) {
  const { data } = useSession();
  const currentUser = data?.user;
  const router = useRouter();
  const resolvedParams = use(params);
  const { subdomain, id: bookingId } = resolvedParams;
  console.log({ subdomain, bookingId });
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadBookingDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchBookings(subdomain);
      const allBookings = res?.data || [];
      const foundBooking = allBookings.find((b) => b._id === bookingId);

      if (!foundBooking) {
        toast.error("Booking not found!");
        router.push(`/dashboard/bookings`);
        return;
      }

      setBooking(foundBooking);
    } catch (error) {
      toast.error(error.message || "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  }, [subdomain, bookingId, router]);

  useEffect(() => {
    loadBookingDetails();
  }, [loadBookingDetails]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await updateBooking(subdomain, bookingId, { status: newStatus });
      setBooking((prev) => ({ ...prev, status: newStatus }));
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusBadges = {
    confirmed: {
      label: "Confirmed",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
    },
    pending: {
      label: "Pending",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: Clock3,
    },
    completed: {
      label: "Completed",
      color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      icon: Sparkles,
    },
    cancelled: {
      label: "Cancelled",
      color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      icon: XCircle,
    },
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <p className="text-slate-400 text-sm">Loading booking workspace...</p>
      </div>
    );
  }

  if (!booking) return null;

  const StatusIcon = statusBadges[booking.status]?.icon || AlertCircle;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ----------------- Header & Back Navigation ----------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/bookings`}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Back to Bookings"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {booking.customerName}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  statusBadges[booking.status]?.color ||
                  statusBadges.pending.color
                }`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                <span className="capitalize">{booking.status}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Booking ID: #{booking._id}
            </p>
          </div>
        </div>

        <button
          onClick={loadBookingDetails}
          className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors self-start md:self-auto"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ----------------- Summary Cards Section ----------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Client & Service Details (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
              <Briefcase className="w-4 h-4" />
              {booking.serviceName}
            </span>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              <span>
                {new Date(booking.bookingDate).toLocaleDateString("en-US", {
                  dateStyle: "full",
                })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Info */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Customer Information
              </p>
              <div className="space-y-2 text-sm text-slate-200">
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="font-medium">{booking.customerName}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-300 truncate">
                    {booking.customerEmail}
                  </span>
                </div>
                {booking.customerPhone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">
                      {booking.customerPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Timing Info */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Schedule & Time
              </p>
              <div className="space-y-2 text-sm text-slate-200">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>
                    {booking.startTime} - {booking.endTime}
                  </span>
                </div>
                {booking.notes && (
                  <div className="mt-2 text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <p className="font-medium text-slate-300 mb-1">
                      Initial Note:
                    </p>
                    <p className="italic">&quot;{booking.notes}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Quick Status Actions
            </h3>
            <p className="text-xs text-slate-400">
              Update status instantly for your entire team.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={updatingStatus || booking.status === "confirmed"}
              onClick={() => handleStatusChange("confirmed")}
              className="px-3 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 disabled:opacity-40 border border-emerald-500/30 rounded-xl text-xs font-medium transition-colors"
            >
              Confirm
            </button>

            <button
              disabled={updatingStatus || booking.status === "completed"}
              onClick={() => handleStatusChange("completed")}
              className="px-3 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 disabled:opacity-40 border border-indigo-500/30 rounded-xl text-xs font-medium transition-colors"
            >
              Complete
            </button>

            <button
              disabled={updatingStatus || booking.status === "pending"}
              onClick={() => handleStatusChange("pending")}
              className="px-3 py-2 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 disabled:opacity-40 border border-amber-500/30 rounded-xl text-xs font-medium transition-colors"
            >
              Mark Pending
            </button>

            <button
              disabled={updatingStatus || booking.status === "cancelled"}
              onClick={() => handleStatusChange("cancelled")}
              className="px-3 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 disabled:opacity-40 border border-rose-500/30 rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
            Subdomain:{" "}
            <span className="text-slate-300 font-medium">{subdomain}</span>
          </div>
        </div>
      </div>

      {/* ----------------- Real-time Collaborative Workspace ----------------- */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Live Collaborative Workspace
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time synchronization for notes, customer requirements, and
              internal updates.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Yjs Room Active</span>
          </div>
        </div>

        {/* Tiptap + Yjs Editor Component Integration */}
       
        <div className="bg-slate-950 rounded-xl border border-slate-800 min-h-[350px] p-2">
          {subdomain && bookingId ? (
            <CollaborativeEditor
              bookingId={bookingId}
              subdomain={subdomain}
              currentUser={currentUser}
            />
          ) : (
            <div className="flex items-center justify-center p-8 text-slate-500 text-sm">
              Loading room credentials...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

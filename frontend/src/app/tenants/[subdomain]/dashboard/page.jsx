"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { fetchBookings } from "@/lib/api/bookings";
import BookingList from "@/components/dashboard/booking/BookingsList";
import CreateBookingModal from "@/components/dashboard/booking/CreateBookinModal";
import { fetchSubscriptionStatus } from "@/lib/api/payment";
import { useSession } from "@/lib/auth-client";

const FREE_PLAN_LIMIT = 2; 

export default function BookingsPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const subdomain = resolvedParams.subdomain;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const session=useSession()
  console.log("session in dashboard",session)
  // Data loading function
  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBookings(subdomain, selectedDate);
      setBookings(data?.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [subdomain, selectedDate]);

  const fetchSubscription = useCallback(async () => {
    try {
      const subscription = await fetchSubscriptionStatus(subdomain);
      setSubscriptionStatus(subscription.plan || "free");
    } catch (error) {
      toast.error(error.message || "Failed to load subscription");
    }
  }, [subdomain]);

  useEffect(() => {
    loadBookings();
    fetchSubscription();
  }, [loadBookings, fetchSubscription]);

  // Check if limit reached
  const isLimitReached =subscriptionStatus === "free" && bookings.length >= FREE_PLAN_LIMIT;

  // Handle New Booking Click
  const handleOpenCreateModal = () => {
    if (isLimitReached) {
      setShowLimitModal(true); 
    } else {
      setIsCreateModalOpen(true); 
    }
  };

  // Filtering logic (Search & Status)
  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    const matchesSearch =
      booking?.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking?.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking?.serviceName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pending: bookings.filter((b) => b.status === "pending").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-indigo-500" />
            Booking Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your schedule, appointments, and client bookings for{" "}
            <span className="text-indigo-400 font-medium">{subdomain}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadBookings}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Bookings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            {isLimitReached ? (
              <Lock className="w-4 h-4 text-amber-400" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            New Booking
          </button>
        </div>
      </div>

      {/* Free Plan Usage Warning Banner */}
      {subscriptionStatus === "free" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Free Plan Usage:{" "}
                <span className="text-indigo-400">
                  {bookings.length} / {FREE_PLAN_LIMIT}
                </span>{" "}
                bookings used
              </p>
              <p className="text-xs text-slate-400">
                Upgrade to Pro for unlimited client bookings and features.
              </p>
            </div>
          </div>
          {isLimitReached && (
            <button
              onClick={() => router.push(`/dashboard/pricing`)}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              Upgrade Now
            </button>
          )}
        </div>
      )}

      {/* 2. Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Total Bookings
            </span>
            <CalendarIcon className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-400 font-medium">
              Confirmed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {stats.confirmed}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-400 font-medium">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            {stats.pending}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs text-rose-400 font-medium">Cancelled</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2">
            {stats.cancelled}
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-slate-200 text-sm pl-9 pr-4 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 text-slate-200 text-sm px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 text-slate-200 text-sm px-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors capitalize"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* 4. Bookings Display Section */}
      <BookingList
        bookings={filteredBookings}
        loading={loading}
        subdomain={subdomain}
        onRefresh={loadBookings}
      />

      {/* 5. Create Booking Modal */}
      {isCreateModalOpen && (
        <CreateBookingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          subdomain={subdomain}
          onSuccess={loadBookings}
        />
      )}

      {/* 6. Upgrade Required Modal (When Limit Exceeded) */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Booking Limit Reached!
            </h3>
            <p className="text-sm text-slate-400">
              You have reached your limit of{" "}
              <span className="text-white font-semibold">{FREE_PLAN_LIMIT} bookings</span>{" "}
              on the Free Plan. Upgrade to Pro to unlock unlimited bookings.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  router.push(`/dashboard/pricing`);
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-colors"
              >
                Upgrade Plan
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
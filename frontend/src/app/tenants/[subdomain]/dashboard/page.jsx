"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Zap,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { fetchBookings } from "@/lib/api/bookings";
import { fetchSubscriptionStatus } from "@/lib/api/payment";

export default function DashboardOverviewPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const subdomain = resolvedParams.subdomain;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState("free");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingsData, subData] = await Promise.all([
        fetchBookings(subdomain),
        fetchSubscriptionStatus(subdomain),
      ]);
      setBookings(bookingsData?.data || []);
      setSubscriptionStatus(subData?.plan || "free");
    } catch (error) {
      toast.error(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [subdomain]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Statistics Calculation
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const recentBookings = bookings.slice(0, 5); 
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back! Here is what's happening with{" "}
            <span className="text-indigo-400 font-medium">{subdomain}</span> today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => router.push(`/dashboard/bookings`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            Manage Bookings
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Subscription Status Banner */}
      {subscriptionStatus === "free" && (
        <div className="bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                You are currently on the <span className="text-indigo-400 uppercase">Free Plan</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Unlock custom branding, SMS notifications, and unlimited bookings with Pro.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/dashboard/pricing`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-md shadow-indigo-600/30"
          >
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* 3. Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{totalBookings}</h3>
            <p className="text-xs text-slate-500 mt-1">All time scheduled appointments</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              Confirmed
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-emerald-400">{confirmedBookings}</h3>
            <p className="text-xs text-slate-500 mt-1">Ready for fulfillment</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
              Pending Approval
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-amber-400">{pendingBookings}</h3>
            <p className="text-xs text-slate-500 mt-1">Requires your confirmation</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
              Growth Rate
            </span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">+12.5%</h3>
            <p className="text-xs text-emerald-400 mt-1">↑ Higher than last week</p>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings List */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Appointments</h2>
            <button
              onClick={() => router.push(`/dashboard/bookings`)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Loading recent appointments...
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-lg">
              No recent bookings found.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentBookings.map((booking) => (
                <div
                  key={booking._id || booking.id}
                  className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-semibold text-sm shrink-0">
                      {booking.customerName?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-white truncate">
                        {booking.customerName || "Anonymous Customer"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {booking.serviceName || "General Service"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        booking.status === "confirmed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : booking.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          <div className="space-y-2.5">
            <button
              onClick={() => router.push(`/dashboard/bookings`)}
              className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-between text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600/10 text-indigo-400 rounded-md group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Create Booking</p>
                  <p className="text-xs text-slate-400">Add manual appointment</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
            </button>

            <button
              onClick={() => router.push(`/dashboard/pricing`)}
              className="w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center justify-between text-left transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600/10 text-emerald-400 rounded-md group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Manage Services</p>
                  <p className="text-xs text-slate-400">Update pricing & slots</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
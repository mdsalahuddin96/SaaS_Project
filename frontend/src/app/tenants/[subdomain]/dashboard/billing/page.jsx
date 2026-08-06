'use client';

import { useState, useEffect, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Calendar, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchSubscriptionStatus, createPortalSession } from '@/lib/api/payment';

export default function BillingPage({ params }) {
  const resolvedParams = use(params);
  const subdomain = resolvedParams.subdomain;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Payment successful! Your subscription is now active.');
      router.replace(`/dashboard/billing`);
    } else if (searchParams.get('canceled') === 'true') {
      toast.error('Payment process was canceled.');
      router.replace(`/dashboard/billing`);
    }

    // Fetch Subscription Data
    const loadSubscription = async () => {
      try {
        const data = await fetchSubscriptionStatus(subdomain);
        setSubscription(data);
      } catch (error) {
        toast.error(error.message || 'Failed to load billing details');
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [subdomain, searchParams, router]);

  // Stripe Customer Portal redirect
  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      const data = await createPortalSession(subdomain);

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Could not open Stripe Portal');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to launch billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  // Status Badge UI Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Payment Past Due
          </span>
        );
      case 'canceled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {status || 'Free Tier'}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const planName = subscription?.plan?.toUpperCase() || 'FREE';
  const isFree = subscription?.plan === 'free' || !subscription?.plan;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Billing & Subscriptions</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your plan, payment methods, and invoices for{' '}
          <span className="text-indigo-400 font-medium">{subdomain}</span>.
        </p>
      </div>

      {/* Subscription Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Plan</span>
              {getStatusBadge(subscription?.status)}
            </div>
            <h2 className="text-3xl font-extrabold text-white flex items-center gap-2">
              {planName === 'PRO' && <Sparkles className="w-6 h-6 text-indigo-400" />}
              {planName === 'ENTERPRISE' && <ShieldCheck className="w-6 h-6 text-indigo-400" />}
              {planName === 'FREE' && <Zap className="w-6 h-6 text-slate-400" />}
              {planName} Plan
            </h2>
          </div>

          <div>
            {!isFree ? (
              <button
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {portalLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 text-indigo-400" />
                )}
                Manage in Stripe Portal
              </button>
            ) : (
              <button
                onClick={() => router.push(`/dashboard/pricing`)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                Upgrade Plan
              </button>
            )}
          </div>
        </div>

        {/* Subscription Meta Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 rounded-lg text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Billing Cycle / Renewal</p>
              <p className="text-white font-medium mt-0.5">
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A (Free Forever)'}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 rounded-lg text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Stripe Customer ID</p>
              <p className="text-white font-mono text-xs mt-0.5">
                {subscription?.stripeCustomerId || 'No active payment profile'}
              </p>
            </div>
          </div>
        </div>

        {/* Cancel at period end notice */}
        {subscription?.cancelAtPeriodEnd && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Subscription Scheduled for Cancellation</p>
              <p className="text-amber-300/80 mt-0.5">
                Your subscription will remain active until the end of the current billing cycle on{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}. You can reactivate it anytime from the Stripe Portal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
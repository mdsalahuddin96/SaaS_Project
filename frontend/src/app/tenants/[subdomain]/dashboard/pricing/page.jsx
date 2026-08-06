'use client';

import { useState, useEffect, use } from 'react';
import { Check, ShieldCheck, Zap, Sparkles, Loader2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchSubscriptionStatus, createCheckoutSession } from '@/lib/api/payment';
import { useRouter } from 'next/navigation';


export default function PricingPage({ params }) {
  const resolvedParams = use(params);
  const subdomain = resolvedParams.subdomain;
  const router=useRouter()
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null); // 'pro' or 'enterprise'
  const [currentPlan, setCurrentPlan] = useState('free');

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await fetchSubscriptionStatus(subdomain);
        setCurrentPlan(data.plan || 'free');
      } catch (error) {
        toast.error(error.message || 'Failed to load plan details');
      } finally {
        setLoading(false);
      }
    };
    loadStatus();
  }, [subdomain]);

  const handleSubscribe = async (plan) => {
    try {
      setCheckoutLoading(plan);
      const data = await createCheckoutSession(subdomain, plan);
      
      // Redirect Stripe Hosted Checkout URL
      if (data?.url) {
        router.replace(data?.url)
      } else {
        toast.error('Invalid checkout response from server');
      }
    } catch (error) {
      toast.error(error.message || 'Could not start payment process');
      setCheckoutLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Starter',
      price: '$0',
      period: 'Forever Free',
      description: 'Essential features for small teams and testing.',
      features: [
        'Up to 50 Bookings / month',
        'Basic Booking Calendar',
        'Standard Email Notifications',
        'Single Admin User',
      ],
      icon: Zap,
    },
    {
      id: 'pro',
      name: 'Pro Developer',
      price: '$29',
      period: 'per month',
      description: 'Perfect for growing teams needing full automation.',
      popular: true,
      features: [
        'Unlimited Bookings',
        'Advanced Analytics & Reports',
        'Idempotent API Access',
        'Priority Email Support',
        'Custom Domain Support',
      ],
      icon: Sparkles,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      description: 'Dedicated infrastructure with maximum security.',
      features: [
        'Everything in Pro',
        'Dedicated Support Manager',
        'Custom Webhooks & Integrations',
        'SLA 99.9% Uptime Guarantee',
        'Unlimited Admin Users',
      ],
      icon: ShieldCheck,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Flexible Pricing Plans
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Choose the best plan for <span className="text-indigo-400 font-semibold">{subdomain}</span>.
          Upgrade or downgrade at any time via Stripe Billing.
        </p>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                plan.popular
                  ? 'border-indigo-500/80 shadow-xl shadow-indigo-500/10 scale-102'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-slate-800 rounded-xl text-indigo-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md">
                      Current Plan
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mt-4">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{plan.description}</p>

                <div className="mt-4 flex items-baseline gap-1 border-b border-slate-800 pb-5">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">{plan.period}</span>
                </div>

                <ul className="mt-5 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-slate-800 text-slate-400 font-medium rounded-xl text-sm cursor-not-allowed border border-slate-700/50"
                  >
                    Active Plan
                  </button>
                ) : plan.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-slate-800 text-slate-400 font-medium rounded-xl text-sm cursor-not-allowed"
                  >
                    Free Tier
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={checkoutLoading !== null}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 disabled:bg-indigo-800"
                  >
                    {checkoutLoading === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    {checkoutLoading === plan.id ? 'Redirecting...' : `Upgrade to ${plan.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
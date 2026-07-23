"use client";

import { useState } from "react";

export default function OnboardPage() {
  const [formData, setFormData] = useState({
    orgName: "",
    subdomain: "",
    adminName: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate Password Match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgName: formData.orgName,
          subdomain: formData.subdomain,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to onboard workspace");
      }

      // Redirect to the newly created tenant dashboard
      window.location.href = data.redirectUrl;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Create Your <span className="text-indigo-400">Workspace</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Setup your multi-tenant booking system in just a few clicks.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Organization Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Organization Name
              </label>
              <input
                type="text"
                name="orgName"
                placeholder="e.g. Apex Fitness Gym"
                value={formData.orgName}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            {/* Subdomain */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Subdomain
              </label>
              <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
                <input
                  type="text"
                  name="subdomain"
                  placeholder="apex"
                  value={formData.subdomain}
                  onChange={handleChange}
                  className="w-full bg-transparent p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  required
                />
                <span className="bg-slate-800/60 text-slate-400 px-3 py-3 text-xs font-mono border-l border-slate-800 select-none">
                  .app.com
                </span>
              </div>
            </div>

            {/* Admin Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Name
              </label>
              <input
                type="text"
                name="adminName"
                placeholder="John Doe"
                value={formData.adminName}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            {/* Admin Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Admin Email
              </label>
              <input
                type="email"
                name="adminEmail"
                placeholder="admin@apex.com"
                value={formData.adminEmail}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
                minLength={8}
                maxLength={64}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                required
                minLength={8}
                maxLength={64}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold p-3.5 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Creating Workspace...</span>
                </>
              ) : (
                "Create Workspace"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
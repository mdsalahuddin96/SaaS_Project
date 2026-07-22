"use client";

import { useState } from "react";

export default function OnboardPage() {
  const [formData, setFormData] = useState({
    orgName: "",
    subdomain: "",
    adminName: "",
    adminEmail: "",
    password: "",
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

    try {
      const res = await fetch("http://localhost:5000/api/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to onboarding");
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-indigo-400">
          Create Your Booking Workspace
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Setup your multi-tenant workspace in seconds.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Organization Name */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              name="orgName"
              placeholder="e.g. Apex Fitness Gym"
              value={formData.orgName}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Subdomain */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Subdomain
            </label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
              <input
                type="text"
                name="subdomain"
                placeholder="apex"
                value={formData.subdomain}
                onChange={handleChange}
                className="w-full bg-transparent p-3 text-sm focus:outline-none"
                required
              />
              <span className="bg-slate-800 text-slate-400 px-3 py-3 text-xs font-mono">
                .app.com
              </span>
            </div>
          </div>

          {/* Admin Name */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Admin Name
            </label>
            <input
              type="text"
              name="adminName"
              placeholder="John Doe"
              value={formData.adminName}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Admin Email */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              name="adminEmail"
              placeholder="admin@apex.com"
              value={formData.adminEmail}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Password */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500"
              required
              minLength={8}
              maxLength={64}
              title="Password must be minimum 8 character."
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium p-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Creating Workspace..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

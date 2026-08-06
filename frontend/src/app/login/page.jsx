"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // বা react-router-dom এর useNavigate
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // আপনার ব্যাকএন্ডের POST এন্ডপয়েন্টে রিকোয়েস্ট পাঠানো
    //   const res = await fetch("http://localhost:5000/api/auth/login", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ email, password }),
    //     credentials: "include", // ⚠️ এটি দিলে ব্যাকএন্ডের সেশন কুকি ব্রাউজারে সেভ হবে
    //   });
        const {data,error}=await authClient.signIn.email({
            email,
            password
        })
    //   const data = await res.json();

    //   if (!res.ok) {
    //     throw new Error(data.message || "Login failed!");
    //   }

      console.log("Logged in User Data:", data);
      alert("Login successful!");
      
      // লগইন শেষে ড্যাশবোর্ডে রিডাইরেক্ট
    //   router.push("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4 space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
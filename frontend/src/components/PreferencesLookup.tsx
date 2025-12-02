"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Check, ArrowLeft } from "lucide-react";
import { requestMagicLink } from "@/app/actions";
import Link from "next/link";

export function PreferencesLookup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData();
    formData.set("email", email);

    const result = await requestMagicLink(formData);

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.error || "Something went wrong");
    }
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center py-4"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600">
              <Check className="h-7 w-7 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-50">Check your inbox</h3>
            <p className="mt-2 text-center text-sm text-slate-400">
              If you&apos;re subscribed, we&apos;ve sent a link to manage your preferences.
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                setEmail("");
              }}
              className="mt-4 text-sm text-blue-400 hover:text-blue-300"
            >
              Try another email
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-3 pl-12 pr-4 text-slate-50 placeholder-slate-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {status === "error" && (
              <p className="text-center text-sm text-red-400">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Sending..." : "Send Magic Link"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-6 border-t border-slate-800 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}

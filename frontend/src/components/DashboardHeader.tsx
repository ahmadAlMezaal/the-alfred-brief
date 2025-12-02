"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Check, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { subscribeUser } from "@/app/actions";

interface TopicPill {
  key: "immigration" | "tech" | "finance";
  label: string;
  color: string;
  activeColor: string;
}

const topics: TopicPill[] = [
  { key: "immigration", label: "Immigration", color: "border-blue-500/50", activeColor: "bg-blue-600 border-blue-600" },
  { key: "tech", label: "Tech", color: "border-emerald-500/50", activeColor: "bg-emerald-600 border-emerald-600" },
  { key: "finance", label: "Finance", color: "border-amber-500/50", activeColor: "bg-amber-600 border-amber-600" },
];

export function DashboardHeader() {
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState({
    immigration: true,
    tech: true,
    finance: true,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleTopic = (key: "immigration" | "tech" | "finance") => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData();
    formData.set("email", email);
    formData.set("preferences", JSON.stringify(preferences));

    const result = await subscribeUser(formData);

    if (result.success) {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setErrorMessage(result.error || "Something went wrong");
    }
  };

  const atLeastOneSelected = preferences.immigration || preferences.tech || preferences.finance;

  return (
    <header className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800">
      {/* Subtle gradient accents */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-600/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-emerald-600/10 blur-2xl" />

      <div className="relative px-4 py-4 sm:px-6">
        {/* Main compact banner */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Title & Tagline */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-50">
                The Alfred Brief
              </h1>
              <p className="text-xs text-slate-400">
                UK Intelligence • Daily at 8 AM
              </p>
            </div>
          </div>

          {/* Compact Subscribe Form */}
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-2 rounded-lg bg-emerald-600/20 px-4 py-2"
              >
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Subscribed!</span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col gap-2 sm:max-w-md sm:flex-row sm:items-center"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 py-2 pl-9 pr-3 text-sm text-slate-50 placeholder-slate-500 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading" || !atLeastOneSelected}
                  className="whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      ...
                    </span>
                  ) : (
                    "Subscribe"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-300 sm:px-2"
                >
                  <Settings className="h-4 w-4" />
                  <span className="sm:hidden">Topics</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-center text-sm text-red-400 sm:text-right"
            >
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Expandable Topic Selection */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic.key}
                      type="button"
                      onClick={() => toggleTopic(topic.key)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                        preferences[topic.key]
                          ? `${topic.activeColor} text-white`
                          : `${topic.color} bg-transparent text-slate-400 hover:text-slate-300`
                      }`}
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
                <a
                  href="/preferences"
                  className="text-xs text-slate-500 transition-colors hover:text-slate-400"
                >
                  Manage existing subscription →
                </a>
              </div>
              {!atLeastOneSelected && (
                <p className="mt-2 text-xs text-amber-500">
                  Select at least one topic to subscribe
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

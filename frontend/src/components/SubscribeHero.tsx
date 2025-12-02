"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Check, Settings } from "lucide-react";
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

export function SubscribeHero() {
  const [email, setEmail] = useState("");
  const [preferences, setPreferences] = useState({
    immigration: true,
    tech: true,
    finance: true,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
    } else {
      setStatus("error");
      setErrorMessage(result.error || "Something went wrong");
    }
  };

  const atLeastOneSelected = preferences.immigration || preferences.tech || preferences.finance;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-8 sm:p-12">
      {/* Subtle gradient orb */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-600/10 blur-3xl" />

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-center text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Your Daily Intelligence Brief
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
            Curated UK news on Immigration, Tech & Finance. Delivered to your inbox every morning at 8 AM.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 flex flex-col items-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-50">You&apos;re on the list!</h3>
              <p className="mt-2 text-slate-400">Check your inbox for your first brief.</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 text-sm text-blue-400 hover:text-blue-300"
              >
                Subscribe another email
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onSubmit={handleSubmit}
              className="mt-8"
            >
              {/* Topic Pills */}
              <div className="flex flex-wrap justify-center gap-3">
                {topics.map((topic) => (
                  <button
                    key={topic.key}
                    type="button"
                    onClick={() => toggleTopic(topic.key)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      preferences[topic.key]
                        ? `${topic.activeColor} text-white`
                        : `${topic.color} bg-transparent text-slate-400 hover:text-slate-300`
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>

              {/* Email Input */}
              <div className="mx-auto mt-6 max-w-md">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-4 pl-12 pr-4 text-slate-50 placeholder-slate-500 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {status === "error" && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 text-center text-sm text-red-400"
                    >
                      {errorMessage}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "loading" || !atLeastOneSelected}
                  className="mt-4 w-full rounded-xl bg-blue-600 py-4 font-semibold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Subscribing...
                    </span>
                  ) : (
                    "Get the Brief"
                  )}
                </button>

                {!atLeastOneSelected && (
                  <p className="mt-2 text-center text-sm text-slate-500">
                    Select at least one topic
                  </p>
                )}
              </div>

              {/* Manage Preferences Link */}
              <div className="mt-6 text-center">
                <a
                  href="/preferences"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-400"
                >
                  <Settings className="h-4 w-4" />
                  Already subscribed? Manage preferences
                </a>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

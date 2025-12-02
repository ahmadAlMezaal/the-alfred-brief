"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Preferences {
  immigration: boolean;
  tech: boolean;
  finance: boolean;
}

interface PreferencesFormProps {
  subscriberId: string;
  initialPreferences: Preferences;
  email: string;
}

export function PreferencesForm({
  subscriberId,
  initialPreferences,
  email,
}: PreferencesFormProps) {
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleToggle = (key: keyof Preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("subscribers")
      .update({ preferences_json: preferences, updated_at: new Date().toISOString() })
      .eq("id", subscriberId);

    setSaving(false);

    if (error) {
      setMessage({ type: "error", text: "Failed to save preferences. Please try again." });
    } else {
      setMessage({ type: "success", text: "Preferences saved successfully!" });
    }
  };

  const categories = [
    { key: "immigration" as const, label: "Immigration", description: "UK visa, asylum, and immigration policy updates" },
    { key: "tech" as const, label: "Tech", description: "UK technology sector news and regulations" },
    { key: "finance" as const, label: "Finance", description: "UK financial markets and economic updates" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">
          Managing preferences for: <span className="font-medium text-slate-300">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        {categories.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4"
          >
            <div>
              <h3 className="font-medium text-slate-50">{label}</h3>
              <p className="text-sm text-slate-400">{description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={preferences[key]}
              onClick={() => handleToggle(key)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                preferences[key] ? "bg-blue-600" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences[key] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 text-sm ${
            message.type === "success"
              ? "bg-emerald-900/50 text-emerald-300"
              : "bg-red-900/50 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}

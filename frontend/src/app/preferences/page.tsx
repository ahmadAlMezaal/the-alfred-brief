import { createClient } from "@/utils/supabase/server";
import { PreferencesForm } from "@/components/PreferencesForm";
import { PreferencesLookup } from "@/components/PreferencesLookup";
import { AlertCircle } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  preferences_json: {
    immigration?: boolean;
    tech?: boolean;
    finance?: boolean;
  } | null;
}

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function PreferencesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token;

  // No token provided - show email lookup form
  if (!token) {
    return (
      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            Manage Preferences
          </h1>
          <p className="mt-2 text-slate-400">
            Enter your email to receive a magic link for managing your preferences
          </p>
        </header>
        <PreferencesLookup />
      </main>
    );
  }

  const supabase = await createClient();

  const { data: subscriber, error } = await supabase
    .from("subscribers")
    .select("id, email, preferences_json")
    .eq("management_token", token)
    .single<Subscriber>();

  if (error || !subscriber) {
    return <InvalidLink message="Invalid or expired link" />;
  }

  const defaultPreferences = {
    immigration: true,
    tech: true,
    finance: true,
  };

  const preferences = {
    immigration: subscriber.preferences_json?.immigration ?? defaultPreferences.immigration,
    tech: subscriber.preferences_json?.tech ?? defaultPreferences.tech,
    finance: subscriber.preferences_json?.finance ?? defaultPreferences.finance,
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">
          Email Preferences
        </h1>
        <p className="mt-2 text-slate-400">
          Choose which topics you want in your daily brief
        </p>
      </header>

      <PreferencesForm
        subscriberId={subscriber.id}
        initialPreferences={preferences}
        email={subscriber.email}
      />
    </main>
  );
}

function InvalidLink({ message }: { message: string }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-red-800 bg-red-900/20 p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h1 className="mt-4 text-xl font-semibold text-slate-50">Invalid Link</h1>
        <p className="mt-2 text-slate-400">{message}</p>
        <p className="mt-4 text-sm text-slate-500">
          Please use the link from your email to manage preferences.
        </p>
      </div>
    </main>
  );
}

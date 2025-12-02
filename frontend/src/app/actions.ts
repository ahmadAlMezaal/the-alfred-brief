"use server";

import { createClient } from "@/utils/supabase/server";

export interface SubscribeResult {
  success: boolean;
  error?: string;
}

export interface Preferences {
  immigration: boolean;
  tech: boolean;
  finance: boolean;
}

export async function subscribeUser(formData: FormData): Promise<SubscribeResult> {
  const email = formData.get("email");
  const preferencesRaw = formData.get("preferences");

  if (!email || typeof email !== "string") {
    return { success: false, error: "Email is required" };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Invalid email format" };
  }

  // Parse preferences (default all to true if not provided)
  let preferences: Preferences = { immigration: true, tech: true, finance: true };
  if (preferencesRaw && typeof preferencesRaw === "string") {
    try {
      preferences = JSON.parse(preferencesRaw);
    } catch {
      // Use defaults if parsing fails
    }
  }

  const supabase = await createClient();

  // Attempt to insert the subscriber with preferences
  // If email exists, upsert does nothing (onConflict: ignore)
  // We return success either way for privacy (don't reveal if email exists)
  const { error } = await supabase
    .from("subscribers")
    .upsert(
      {
        email: email.toLowerCase().trim(),
        preferences_json: preferences,
      },
      { onConflict: "email", ignoreDuplicates: true }
    );

  if (error) {
    console.error("Subscription error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true };
}

export async function requestMagicLink(formData: FormData): Promise<SubscribeResult> {
  const email = formData.get("email");

  if (!email || typeof email !== "string") {
    return { success: false, error: "Email is required" };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Invalid email format" };
  }

  const supabase = await createClient();

  // Look up the subscriber by email
  const { data: subscriber } = await supabase
    .from("subscribers")
    .select("management_token")
    .eq("email", email.toLowerCase().trim())
    .single();

  // Always return success for privacy (don't reveal if email exists)
  // In production, you would send an email here with the magic link
  if (subscriber?.management_token) {
    // TODO: Send email with link: /preferences?token={management_token}
    console.log(`Magic link for ${email}: /preferences?token=${subscriber.management_token}`);
  }

  return { success: true };
}

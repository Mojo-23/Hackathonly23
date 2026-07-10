import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import {
  getSupabasePublicEnv,
  getSupabaseServiceRoleKey,
} from "@/lib/env";

// Server-only service-role entry point. Do not import this module from client components.
if (typeof window !== "undefined") {
  throw new Error("Supabase admin client cannot be used in the browser.");
}

export function createAdminClient() {
  const { supabaseUrl } = getSupabasePublicEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

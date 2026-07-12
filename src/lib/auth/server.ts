import type { AuthenticatedUser, CurrentProfile, DefaultWorkspace, OrganizationMembership } from "@/lib/auth/types";
import { createClient } from "@/lib/supabase/server";

export async function resolveAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

export async function resolveCurrentProfile(
  user: AuthenticatedUser,
): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, default_workspace")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CurrentProfile;
}

export async function resolveOrganizationMemberships(
  user: AuthenticatedUser,
): Promise<OrganizationMembership[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select("id, organization_id, role")
    .eq("user_id", user.id);

  if (error || !data) {
    return [];
  }

  return data as OrganizationMembership[];
}

export function resolveDefaultWorkspace(
  profile: CurrentProfile | null,
): DefaultWorkspace {
  return profile?.default_workspace ?? "participant";
}

export function canAccessOrganizerRoutes(
  memberships: Pick<OrganizationMembership, "id">[],
): boolean {
  return memberships.length > 0;
}

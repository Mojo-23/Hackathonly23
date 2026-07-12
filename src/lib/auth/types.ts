import type { User } from "@supabase/supabase-js";

export type AuthenticatedUser = User;

export type DefaultWorkspace = "participant" | "organizer";

export type CurrentProfile = {
  id: string;
  full_name: string;
  default_workspace: DefaultWorkspace;
};

export type OrganizationMembership = {
  id: string;
  organization_id: string;
  role: "owner" | "admin" | "staff";
};

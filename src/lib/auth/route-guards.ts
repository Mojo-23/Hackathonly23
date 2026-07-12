export function isParticipantDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function isOrganizerPath(pathname: string): boolean {
  return pathname === "/organizer" || pathname.startsWith("/organizer/");
}

export function requiresAuthenticatedUser(pathname: string): boolean {
  return isParticipantDashboardPath(pathname) || isOrganizerPath(pathname);
}

export function requiresOrganizationMembership(pathname: string): boolean {
  return isOrganizerPath(pathname);
}

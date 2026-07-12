export function normalizeSafeReturnPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }

  try {
    const parsed = new URL(value, "https://hackathonly.local");

    if (parsed.origin !== "https://hackathonly.local") {
      return null;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function buildAuthRedirectUrl(requestUrl: URL): URL {
  const redirectUrl = new URL("/auth", requestUrl.origin);
  const nextPath = normalizeSafeReturnPath(
    `${requestUrl.pathname}${requestUrl.search}`,
  );

  if (nextPath) {
    redirectUrl.searchParams.set("next", nextPath);
  }

  return redirectUrl;
}

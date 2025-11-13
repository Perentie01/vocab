export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Vox";

export const APP_LOGO = "/logo.png";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  if (!oauthPortalUrl) {
    throw new Error("VITE_OAUTH_PORTAL_URL is not configured");
  }

  const redirectUri = `${window.location.origin}/`;
  const params = new URLSearchParams({
    redirect_uri: redirectUri,
  });

  return `${oauthPortalUrl}?${params.toString()}`;
};

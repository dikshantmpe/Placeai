/**
 * Map errors from Firebase / Axios / Network into user-facing copy.
 * Kept centralized so copy stays consistent across the auth surface.
 */

const PASSWORD_MESSAGES = {
  "auth/user-not-found": "We couldn't find an account with that email.",
  "auth/wrong-password": "That password didn't work. Try again or reset it.",
  "auth/invalid-credential":
    "That email and password don't match. Please check and try again.",
  "auth/invalid-email": "That email address looks invalid.",
  "auth/user-disabled":
    "This account has been disabled. Contact support to restore it.",
  "auth/too-many-requests":
    "Too many attempts. Wait a moment, then try again.",
  "auth/network-request-failed":
    "Network looks unstable. Check your connection and retry.",
  "auth/invalid-api-key":
    "Authentication is temporarily unavailable. Please refresh.",
};

const GOOGLE_MESSAGES = {
  "auth/popup-closed-by-user":
    "Google sign-in was cancelled. You can try again anytime.",
  "auth/popup-blocked":
    "Your browser blocked the Google sign-in popup. Allow popups and retry.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using another sign-in method.",
  "auth/cancelled-popup-request": "Sign-in cancelled.",
  "auth/network-request-failed":
    "Network looks unstable. Check your connection and retry.",
};

function isNetworkError(err) {
  return (
    err?.code === "ERR_NETWORK" ||
    err?.message === "Network Error" ||
    err?.code === "auth/network-request-failed"
  );
}

function isTimeoutError(err) {
  return err?.code === "ECONNABORTED" || /timeout/i.test(err?.message ?? "");
}

export function getAuthErrorMessage(err, flow = "password") {
  if (!err) return "Something went wrong. Please try again.";

  if (isNetworkError(err)) {
    return "We can't reach the server right now. Check your connection and try again.";
  }
  if (isTimeoutError(err)) {
    return "The server took too long to respond. Please try again.";
  }

  const code = err?.code || "";
  const table = flow === "google" ? GOOGLE_MESSAGES : PASSWORD_MESSAGES;
  if (code && table[code]) return table[code];

  // Axios / backend-supplied message
  const serverMsg = err?.response?.data?.message;
  if (typeof serverMsg === "string" && serverMsg.trim()) {
    return capitalize(serverMsg.trim());
  }

  // Last-resort friendly fallback (never leak raw stack to users)
  return flow === "google"
    ? "Couldn't sign you in with Google. Please try again."
    : "Sign-in failed. Please check your details and try again.";
}

function capitalize(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
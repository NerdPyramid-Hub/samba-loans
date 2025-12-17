import { supabase } from "./supabase";
import { showError } from "./sweetalert";

// Helper to perform fetch to server endpoints including the current user's
// access token. Handles 401 responses by signing the user out and showing a message.
export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  try {
    const sessionResp = await (supabase as any).auth.getSession();
    const token = sessionResp?.data?.session?.access_token;

    const headers = new Headers(init?.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("Content-Type"))
      headers.set("Content-Type", "application/json");

    const response = await fetch(input, { ...(init || {}), headers });

    if (response.status === 401) {
      // Notify UI that session expired and allow a re-login flow.
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("session:expired"));
        }
      } catch (e) {
        console.warn("Could not dispatch session:expired event", e);
      }

      showError("Your session has expired. Please sign in again.");

      // Wait for a 'session:restored' event to retry the request once
      if (typeof window !== "undefined") {
        return await new Promise(async (resolve, reject) => {
          let timeoutId: any = null;
          const onRestored = async () => {
            try {
              window.removeEventListener("session:restored", onRestored as any);
              if (timeoutId) clearTimeout(timeoutId);
              const retryResp = await fetchWithAuth(input, init);
              resolve(retryResp);
            } catch (err) {
              reject(err);
            }
          };

          window.addEventListener("session:restored", onRestored as any);

          // Timeout after 2 minutes
          timeoutId = setTimeout(() => {
            window.removeEventListener("session:restored", onRestored as any);
            reject(new Error("Session restore timed out"));
          }, 120000);
        });
      }

      return response;
    }

    return response;
  } catch (err: any) {
    console.error("fetchWithAuth error:", err);
    showError("Network error. Please try again.");
    throw err;
  }
}

export default fetchWithAuth;

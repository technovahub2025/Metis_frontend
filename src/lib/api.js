const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/*
 * ============================================================
 * AUTH STORAGE
 * ============================================================
 *
 * METIS uses sessionStorage for login sessions.
 *
 * Why?
 * Each browser tab gets its own sessionStorage.
 *
 * Example:
 * Tab 1 -> Admin
 * Tab 2 -> PM
 * Tab 3 -> TL
 *
 * They will no longer overwrite each other.
 */

const getStoredToken = () => {
  return sessionStorage.getItem("metis_token");
};

const buildHeaders = (headers = {}) => {
  const token = getStoredToken();

  return {
    "Content-Type": "application/json",
    ...headers,

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

/*
 * ============================================================
 * API REQUEST
 * ============================================================
 */

export const apiRequest = async (
  path,
  {
    method = "GET",
    body,
    headers = {},
  } = {}
) => {
  const config = {
    method,
    headers: buildHeaders(headers),
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(
    `${API_BASE}${path}`,
    config
  );

  const data =
    await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(
      data?.message ||
        res.statusText ||
        "Request failed"
    );

    error.status = res.status;
    error.data = data;

    /*
     * If authentication failed, make it obvious
     * what happened in the browser console.
     */
    if (res.status === 401) {
      console.error(
        "METIS authentication failed:",
        {
          path,
          message:
            data?.message ||
            "Unauthorized",
        }
      );
    }

    throw error;
  }

  return data;
};

/*
 * ============================================================
 * CLEAR AUTH
 * ============================================================
 */

export const clearAuth = () => {
  /*
   * Clear session auth.
   */
  sessionStorage.removeItem(
    "metis_token"
  );

  sessionStorage.removeItem(
    "metis_user"
  );

  /*
   * Also remove old localStorage auth
   * created by the previous login implementation.
   *
   * This prevents an old account from interfering
   * with the new session-based system.
   */
  localStorage.removeItem(
    "metis_token"
  );

  localStorage.removeItem(
    "metis_user"
  );
};

/*
 * ============================================================
 * CURRENT USER
 * ============================================================
 */

export const getCurrentUser = () => {
  try {
    const raw =
      sessionStorage.getItem(
        "metis_user"
      );

    return raw
      ? JSON.parse(raw)
      : null;
  } catch {
    return null;
  }
};

/*
 * ============================================================
 * CURRENT TOKEN
 * ============================================================
 */

export const getAuthToken = () => {
  return sessionStorage.getItem(
    "metis_token"
  );
};
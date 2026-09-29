import { useState } from "react";
import { apiRequest } from "../lib/api";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess(false);
  setLoading(true);

  try {
    /*
     * Remove any old authentication data first.
     *
     * This is especially important because the previous
     * implementation used localStorage.
     */
    localStorage.removeItem("metis_token");
    localStorage.removeItem("metis_user");

    sessionStorage.removeItem("metis_token");
    sessionStorage.removeItem("metis_user");

try {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: {
      email,
      password,
    },
  });

  // Keep your existing token storage and role-based redirect here.
  // Use this `data` variable for the login response.

} catch (error) {
  console.error("Login error:", error);
  setError(error.message || "Login failed");
}

    console.log(
      "LOGIN RESPONSE:",
      data
    );

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
          "Invalid email or password"
      );
    }

    /*
     * ========================================================
     * IMPORTANT
     * ========================================================
     *
     * Always use sessionStorage.
     *
     * sessionStorage is unique to each browser tab.
     *
     * Therefore:
     *
     * Tab 1 -> Admin
     * Tab 2 -> PM
     * Tab 3 -> TL
     *
     * can stay logged in independently.
     */
    sessionStorage.setItem(
      "metis_token",
      data.token
    );

    sessionStorage.setItem(
      "metis_user",
      JSON.stringify(data.user)
    );

    /*
     * Make sure old localStorage credentials
     * can never remain active.
     */
    localStorage.removeItem(
      "metis_token"
    );

    localStorage.removeItem(
      "metis_user"
    );

    console.log(
      "LOGIN ROLE:",
      data.user?.role
    );

    setSuccess(true);
    setLoading(false);

    /*
     * ROLE BASED REDIRECT
     */
    if (
      data.user?.role === "admin"
    ) {
      navigate("/admin", {
        replace: true,
      });
      return;
    }

    if (
      data.user?.role === "pm"
    ) {
      navigate("/pm", {
        replace: true,
      });
      return;
    }

    if (
      data.user?.role === "tl"
    ) {
      navigate("/tl", {
        replace: true,
      });
      return;
    }

    setSuccess(false);

    setError(
      "Invalid user role received from server."
    );
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    setError(
      error.message ||
        "Unable to connect to authentication server."
    );

    setLoading(false);
    setSuccess(false);
  }
};
  return (
    <main className="metis-login">

      {/* Blueprint background */}
      <div className="login-grid" />

      {/* Construction hazard stripe */}
      <div className="login-hazard" />

      {/* Ambient glows */}
      <div className="login-amber-glow" />
      <div className="login-blue-glow" />

      {/* Login content */}
      <div className="login-wrapper">

        {/* Brand */}
        <div className="login-brand">

          <div className="brand-row">

            <div className="brand-icon">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"
                  strokeWidth="2.2"
                />

                <path
                  d="M10 10V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v5"
                  strokeWidth="2.2"
                />

                <path
                  d="M4 15v-3a8 8 0 0 1 16 0v3"
                  strokeWidth="2.2"
                />
              </svg>

            </div>

            <span className="brand-name">
              METIS
            </span>

          </div>

          <h1>
            Welcome back
          </h1>

          <p>
            Enter your credentials to access your account
          </p>

        </div>

        {/* Login card */}
        <section className="login-card">

          <form
            onSubmit={handleSubmit}
            noValidate
          >

            {/* Error */}
            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="field">

              <label htmlFor="email">
                Work Email Address
              </label>

              <div className="input-wrapper">

                <Mail className="input-icon" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="name@company.com"
                  autoComplete="email"
                />

              </div>

            </div>

            {/* Password */}
            <div className="field">

              <div className="password-label">

                <label htmlFor="password">
                  Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setError(
                      "Password reset will be connected later."
                    )
                  }
                >
                  Forgot password?
                </button>

              </div>

              <div className="input-wrapper">

                <Lock className="input-icon" />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff />
                  ) : (
                    <Eye />
                  )}
                </button>

              </div>

            </div>

            {/* Remember */}
            <div className="remember-row">

              <label className="remember-label">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Remember me
                </span>

              </label>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`login-button ${
                success
                  ? "success"
                  : ""
              }`}
            >

              {loading ? (
                <>
                  <span className="spinner" />

                  <span>
                    Authenticating Workspace...
                  </span>
                </>
              ) : success ? (
                <>
                  <span>
                    Verified ✓
                  </span>

                  <Check />
                </>
              ) : (
                <>
                  <span>
                    Sign In
                  </span>

                  <ArrowRight />
                </>
              )}

            </button>

          </form>

          {/* Divider */}
          <div className="login-divider" />

          {/* Success */}
          {success && (
            <div className="login-success">

              <Check />

              <span>
                Authentication successful!
              </span>

            </div>
          )}

        </section>

      </div>

    </main>
  );
};

export default LoginPage;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../ui/Spinner";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setError("Google login failed. No credential returned.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle(idToken);
      navigate("/app");
    } catch (e) {
      console.error("Google login error:", e);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login was cancelled or failed. Please try again.");
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-stone-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_250px_at_20%_10%,rgba(217,119,6,0.06),transparent),radial-gradient(600px_300px_at_80%_0%,rgba(217,119,6,0.04),transparent)]" />
      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="bg-white w-full max-w-4xl overflow-hidden rounded-2xl border border-stone-200 shadow-lg">
          <div className="grid gap-10 p-10 md:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Secure sign-in
              </div>
              <div>
                <h1 className="text-4xl font-bold text-stone-900">
                  Resumetra
                </h1>
                <p className="mt-3 text-stone-500">
                  One-click Google sign-in to unlock personalized resume
                  insights.
                </p>
              </div>

              <div className="grid gap-3 text-sm text-stone-600">
                <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Analyze resumes with AI-powered scoring and guidance.
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Track history and see your skill trends over time.
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Match your resume with job descriptions instantly.
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-stone-900">
                    Continue with Google
                  </h2>
                  <p className="mt-1 text-sm text-stone-500">
                    Sign in or create your account in one step.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col items-center space-y-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    width={320}
                  />

                  {loading && (
                    <span className="flex items-center justify-center text-sm text-stone-500">
                      <Spinner size="sm" className="mr-2" />
                      Signing in...
                    </span>
                  )}
                </div>

                <p className="mt-6 text-center text-xs text-stone-400">
                  By continuing, you agree to our terms and privacy policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../hooks/useAuth";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      setError("Google login failed. No credential returned.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle(idToken);
      navigate("/");
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
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(500px_250px_at_20%_10%,rgba(59,130,246,0.12),transparent),radial-gradient(600px_300px_at_80%_0%,rgba(139,92,246,0.12),transparent)]" />
      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="card w-full max-w-4xl overflow-hidden">
          <div className="grid gap-10 p-10 md:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                Secure sign-in
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  ResumeRadar
                </h1>
                <p className="mt-3 text-slate-400">
                  One-click Google sign-in to unlock personalized resume
                  insights.
                </p>
              </div>

              <div className="grid gap-3 text-sm text-slate-300">
                <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Analyze resumes with AI-powered scoring and guidance.
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  Track history and see your skill trends over time.
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-purple-400" />
                  Match your resume with job descriptions instantly.
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xl">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold">
                    Continue with Google
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Sign in or create your account in one step.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-900/20 border border-red-900/50 text-red-300 p-3 rounded-lg mb-6 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col items-center space-y-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    width="100%"
                  />

                  {loading && (
                    <span className="flex items-center justify-center text-sm text-slate-400">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  )}
                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
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

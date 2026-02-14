import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.tsx";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!clientId) {
  // Fail fast in development if Google client ID is not configured
  // so auth issues are obvious.
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_GOOGLE_CLIENT_ID is not set. Google login will not work until this is configured.",
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId || ""}>
      <>
        <App />
        <Toaster position="top-right" richColors />
      </>
    </GoogleOAuthProvider>
  </StrictMode>,
);

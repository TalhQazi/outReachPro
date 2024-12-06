import { Fragment } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <Fragment>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </Fragment>
);

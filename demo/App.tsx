"use client";

import {
  AuthProvider,
  LoginScreen,
  SignupScreen,
  Protected,
  useAuth,
} from "../src";
import { useState } from "react";

export default function App() {
  const [page, setPage] = useState<"login" | "signup" | "dashboard">("login");

  return (
    <AuthProvider
      config={{
        baseURL: "http://localhost:4000",
        endpoints: {
          login: "/auth/login",
          signup: "/auth/signup",
          refresh: "/auth/refresh",
          me: "/auth/me",
        },
      }}
    >
      <div
        style={{
          position: "absolute",
          display: "flex",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          background: "white",
          fontFamily: "Arial, sans-serif",
          color: "white",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            padding: 20,
            borderRadius: 12,
            background: "white",
            display: "flex",
            flexDirection: "column",
            maxHeight: "unset",
            overflow: "visible",
          }}
        >
          {/* Simple Navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
              paddingLeft: 60,
              paddingRight: 60,
            }}
          >
            <div
              onClick={() => setPage("login")}
              style={{
                padding: "12px 18px",
                borderRadius: 8,
                background:
                  page === "login"
                    ? "linear-gradient(90deg, #5353aaff, #060f22ff)"
                    : "#f3f4f6",
                color: page === "login" ? "white" : "#111827",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Login
            </div>

            <div
              onClick={() => setPage("signup")}
              style={{
                padding: "12px 18px",
                borderRadius: 8,
                background:
                  page === "signup"
                    ? "linear-gradient(90deg, #5353aaff, #060f22ff)"
                    : "#f3f4f6",
                color: page === "signup" ? "white" : "#111827",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Signup
            </div>

            <div
              onClick={() => setPage("dashboard")}
              style={{
                padding: "12px 18px",
                borderRadius: 8,
                background:
                  page === "dashboard"
                    ? "linear-gradient(90deg, #5353aaff, #060f22ff)"
                    : "#f3f4f6",
                color: page === "dashboard" ? "white" : "#111827",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Dashboard
            </div>
          </div>

          {/* Pages */}
          {page === "login" && <LoginScreen />}
          {page === "signup" && <SignupScreen />}

          {page === "dashboard" && (
            <Protected>
              <Dashboard />
            </Protected>
          )}
        </div>
      </div>
    </AuthProvider>
  );
}

/* Simple Dashboard */
function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        padding: 16,
        background: "#f8fafc",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
      }}
    >
      <h3 style={{ marginTop: 0, color: "#111827" }}>Dashboard</h3>

      {user ? (
        <>
          <p style={{ color: "#1f2937" }}>
            Logged in as <strong>{user.name}</strong>
          </p>
          <button
            onClick={logout}
            style={{
              padding: "8px 14px",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <p style={{ color: "#6b7280" }}>No user loaded.</p>
      )}
    </div>
  );
}

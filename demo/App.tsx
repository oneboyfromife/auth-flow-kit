"use client";

/* 
This demo shows how to use auth-flow-kit in the simplest way possible.
You can switch between Login, Signup, and Reset screens, and once a user logs in, the Dashboard is shown automatically. 
The dashboard is protected, uses global auth state, and can only be reached after authentication.
*/

import {
  AuthProvider,
  LoginScreen,
  SignupScreen,
  PasswordResetScreen,
  Protected,
  useAuth,
} from "../src";

import { useState } from "react";

export default function App() {
  const [page, setPage] = useState("login");

  const activeStyle = {
    padding: "8px 16px",
    background: "linear-gradient(90deg, #5353aaff, #060f22ff)",
    color: "white",
    border: "1px solid #ccc",
    borderRadius: 6,
    cursor: "pointer",
  };

  const inactiveStyle = {
    padding: "8px 16px",
    background: "#eee",
    color: "black",
    border: "1px solid #ccc",
    borderRadius: 6,
    cursor: "pointer",
  };

  return (
    <AuthProvider
      config={{
        baseURL: "http://localhost:4000",
        endpoints: {
          login: "/auth/login",
          signup: "/auth/signup",
          forgot: "/auth/forgot",
        },
        onLoginSuccess: () => setPage("dashboard"),
      }}
    >
      <div style={{ maxWidth: 420, margin: "50px auto", textAlign: "center" }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <div
            onClick={() => setPage("login")}
            style={page === "login" ? activeStyle : inactiveStyle}
          >
            Login
          </div>

          <div
            onClick={() => setPage("signup")}
            style={page === "signup" ? activeStyle : inactiveStyle}
          >
            Signup
          </div>

          <div
            onClick={() => setPage("reset")}
            style={page === "reset" ? activeStyle : inactiveStyle}
          >
            Reset
          </div>
        </div>

        {/* Screens */}
        {page === "login" && <LoginScreen />}
        {page === "signup" && <SignupScreen />}
        {page === "reset" && <PasswordResetScreen />}

        {page === "dashboard" && (
          <Protected>
            <Dashboard />
          </Protected>
        )}
      </div>
    </AuthProvider>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 20, border: "1px solid #ddd", borderRadius: 8 }}>
      <h3>Dashboard</h3>

      {user ? (
        <>
          <p>
            Welcome <strong>{user.name}</strong> 🎉
          </p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>No user loaded.</p>
      )}
    </div>
  );
}

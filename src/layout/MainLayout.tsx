import React from "react";
import { Outlet } from "react-router-dom";
import { auth } from "../firebase";

const MainLayout: React.FC<{ user?: { displayName?: string | null; photoURL?: string | null } }> = ({ user }) => (
  <div style={{ background: "#eafaf3", minHeight: "100vh", fontFamily: 'Inter, sans-serif' }}>
    <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 24, background: "#fff", boxShadow: "0 2px 8px #f0f1f2" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ marginRight: 20 }}>
          <img src="/logo.png" alt="Logo" style={{ width: 70, height: 70, objectFit: 'contain', display: 'block' }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>BookTracker</div>
          <div style={{ fontSize: 12, color: "#888" }}>Your reading journey</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
          {user?.displayName ? user.displayName[0] : "U"}
        </div>
        <button
          style={{ background: "#eee", color: "#4CAF93", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 600, fontSize: 15, cursor: "pointer" }}
          onClick={() => auth.signOut()}
        >
          Log Out
        </button>
      </div>
    </header>
    <main style={{ maxWidth: 1100, margin: "32px auto", padding: 16 }}>
      <Outlet />
    </main>
  </div>
);

export default MainLayout;

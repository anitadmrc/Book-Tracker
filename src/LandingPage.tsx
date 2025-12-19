import React, { useState } from "react";
import { auth, googleProvider, signInAnon } from "./firebase";
import { signInWithPopup } from "firebase/auth";

const LandingPage: React.FC = () => {
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // No need to call a callback; onAuthStateChanged will update the UI
    } catch (err: any) {
      setError("Google sign-in failed");
    }
  };

  const handleAnonSignIn = async () => {
    try {
      await signInAnon();
      // No need to call a callback; onAuthStateChanged will update the UI
    } catch (err: any) {
      setError("Anonymous sign-in failed");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f8fa", fontFamily: 'Inter, sans-serif', padding: 0, margin: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <img src="/logo.png" alt="Logo" style={{ width: 100, height: 100, objectFit: 'contain', display: 'block' }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: 28, color: '#222', textAlign: 'center' }}>BookTracker</div>
          <div style={{ color: '#888', fontSize: 16, marginTop: 4, textAlign: 'center' }}>Welcome to your reading journey</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #e0e2e6', padding: '32px 32px 24px 32px', minWidth: 340, maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Sign In</div>
          <div style={{ color: '#888', fontSize: 15, marginBottom: 20 }}>Choose your preferred sign-in method</div>
          <button onClick={handleGoogleSignIn} style={{ width: '100%', background: '#fff', color: '#222', border: '1px solid #ddd', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, cursor: 'pointer' }}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 22, height: 22, marginRight: 8 }} />
            Continue with Google
          </button>
          <div style={{ color: '#bbb', fontSize: 14, margin: '8px 0' }}>or</div>
          <button onClick={handleAnonSignIn} style={{ width: '100%', background: '#4CAF93', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18, cursor: 'pointer' }}>
            <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24" style={{ marginRight: 8 }}><path d="M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/></svg>
            Continue Anonymously
          </button>
          {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
          <div style={{ background: '#f7f8fa', borderRadius: 10, padding: 16, margin: '8px 0 0 0', width: '100%' }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Why sign in?</div>
            <ul style={{ color: '#4CAF93', fontSize: 14, margin: 0, paddingLeft: 18, marginBottom: 8 }}>
              <li>Sync your books across all devices</li>
              <li>Secure backup of your reading data</li>
              <li>Track your reading progress over time</li>
            </ul>
            <div style={{ color: '#888', fontSize: 12, marginTop: 8 }}>Your privacy is important to us. We only store your reading data and never share it with third parties.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

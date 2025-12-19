import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import LandingPage from "./LandingPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import UpdateProgress from "./pages/UpdateProgress";
import RateBook from "./pages/RateBook";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <LandingPage />;
  }

  return (
    <Router>
      <Routes>
        <Route element={<MainLayout user={user} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/progress/:bookId" element={<UpdateProgress />} />
          <Route path="/rate/:bookId" element={<RateBook />} />
          {/* Add more routes here for Add Book, Book Detail, etc. */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

import { Routes, Route, Navigate } from "react-router-dom";
import TopNavbar from "./components/Navbar/TopNavbar";
import SideNavbar from "./components/Navbar/SideNavbar";
import styles from "./App.module.css";
import Credentials from "./pages/Credentials";
import CredentialDetail from "./pages/CredentialDetail";
import Verify from "./pages/Verify";
import Transactions from "./pages/Transactions";
import LoginUser from "./pages/Login";
import { useState } from "react";
import RegisterUser from "./pages/Register";
import PidProviders from "./pages/PidProviders";
import PidCallback from "./pages/PidCallback";

function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  if (token == null) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/login" element={<LoginUser setToken={setToken} />} />
      </Routes>
    );
  }

  return (
    <div className={styles.appWrapper}>
      <TopNavbar />
      <SideNavbar setToken={setToken} />
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Navigate to="/credentials" replace />} />
          <Route path="/credentials" element={<Credentials />} />
          <Route path="/credentials/:id" element={<CredentialDetail />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/pid-providers" element={<PidProviders />} />
          <Route path="/pid-callback" element={<PidCallback />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

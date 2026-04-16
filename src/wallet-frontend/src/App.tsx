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
import SignDocument from "./pages/SignDocument";
import Protected from "./pages/Protected";

function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token"));

  return (
    <div className={styles.appWrapper}>
      {token && <TopNavbar setToken={setToken} />}
      {token && <SideNavbar setToken={setToken} />}

      <main className={styles.mainContent}>
        <Routes>
          <Route path="/login" element={<LoginUser setToken={setToken} />} />
          <Route path="/register" element={<RegisterUser />} />

          <Route
            path="/"
            element={
              <Protected>
                <Navigate to="/credentials" replace />
              </Protected>
            }
          />
          <Route
            path="/credentials"
            element={
              <Protected>
                <Credentials />
              </Protected>
            }
          />
          <Route
            path="/credentials/:id"
            element={
              <Protected>
                <CredentialDetail />
              </Protected>
            }
          />
          <Route
            path="/verify"
            element={
              <Protected>
                <Verify />
              </Protected>
            }
          />
          <Route
            path="/transactions"
            element={
              <Protected>
                <Transactions />
              </Protected>
            }
          />
          <Route
            path="/pid-providers"
            element={
              <Protected>
                <PidProviders />
              </Protected>
            }
          />
          <Route
            path="/pid-callback"
            element={
              <Protected>
                <PidCallback />
              </Protected>
            }
          />
          <Route
            path="/sign"
            element={
              <Protected>
                <SignDocument />
              </Protected>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

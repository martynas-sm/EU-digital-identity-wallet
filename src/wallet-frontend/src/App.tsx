import { Routes, Route, Navigate } from "react-router-dom";
import TopNavbar from "./components/Navbar/TopNavbar";
import SideNavbar from "./components/Navbar/SideNavbar";
import styles from "./App.module.css";
import Credentials from "./pages/Credentials";
import CredentialDetail from "./pages/CredentialDetail";
import Verify from "./pages/Verify";
import Transactions from "./pages/Transactions";
import LoginUser from "./pages/Login";

function App() {
  if (sessionStorage.getItem("token") == null) {
    return <LoginUser />;
  }

  return (
    <div className={styles.appWrapper}>
      <TopNavbar />
      <SideNavbar />
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Navigate to="/credentials" replace />} />
          <Route path="/credentials" element={<Credentials />} />
          <Route path="/credentials/:id" element={<CredentialDetail />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

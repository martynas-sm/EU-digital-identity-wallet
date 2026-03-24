import { Routes, Route, Navigate } from "react-router-dom";
import TopNavbar from "./components/Navbar/TopNavbar";
import SideNavbar from "./components/Navbar/SideNavbar";
import styles from "./App.module.css";
import Credentials from "./pages/Credentials";
import CredentialDetail from "./pages/CredentialDetail";
import Verify from "./pages/Verify";
import Transactions from "./pages/Transactions";
import PidProviders from "./pages/PidProviders";
import PidCallback from "./pages/PidCallback";

function App() {
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
          <Route path="/pid-providers" element={<PidProviders />} />
          <Route path="/pid-callback" element={<PidCallback />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

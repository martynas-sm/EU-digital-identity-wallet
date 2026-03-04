import { Routes, Route } from "react-router-dom";
import TopNavbar from "./components/Navbar/TopNavbar";
import SideNavbar from "./components/Navbar/SideNavbar";
import styles from "./App.module.css";
import Credentials from "./pages/Credentials";

function App() {
  return (
    <div className={styles.appWrapper}>
      <TopNavbar />
      <SideNavbar />
      <main className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Credentials />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

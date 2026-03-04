import { NavLink } from "react-router-dom";
import { Home, CreditCard, QrCode, Settings } from "lucide-react";
import styles from "./SideNavbar.module.css";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/credentials", icon: CreditCard, label: "Credentials" },
  { to: "/scan", icon: QrCode, label: "Scan" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function SideNavbar() {
  return (
    <nav className={styles.sideNavbar}>
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.to} className={styles.navItem}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ""}`
              }
              end={item.to === "/"}
            >
              <item.icon size={20} className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default SideNavbar;

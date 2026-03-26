import { User } from "lucide-react";
import styles from "./TopNavbar.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

type UseSessionTimeoutOptions = {
  idleMs: number;
  warningMs: number;
  onLogout: () => void;
};

function useSessionTimeout({
  idleMs,
  warningMs,
  onLogout,
}: UseSessionTimeoutOptions) {
  const [showWarning, setShowWarning] = useState(false);

  const idleTimerRef = useRef<number | null>(null);
  const warningTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current !== null) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (warningTimerRef.current !== null) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const startIdleTimer = useCallback(() => {
    clearTimers();
    idleTimerRef.current = window.setTimeout(() => {
      setShowWarning(true);
      warningTimerRef.current = window.setTimeout(() => {
        setShowWarning(false);
        onLogout();
      }, warningMs);
    }, idleMs);
  }, [clearTimers, idleMs, warningMs, onLogout]);

  const continueSession = useCallback(() => {
    setShowWarning(false);
    startIdleTimer();
  }, [startIdleTimer]);

  const logoutNow = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    onLogout();
  }, [clearTimers, onLogout]);

  useEffect(() => {
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    const onActivity = () => {
      if (!showWarning) startIdleTimer();
    };

    events.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true }),
    );

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !showWarning) {
        startIdleTimer();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    startIdleTimer();

    return () => {
      clearTimers();
      events.forEach((event) => window.removeEventListener(event, onActivity));
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [clearTimers, startIdleTimer, showWarning]);

  return { showWarning, continueSession, logoutNow };
}

function TopNavbar() {
  const navigate = useNavigate();

  const { showWarning, continueSession, logoutNow } = useSessionTimeout({
    idleMs: 60 * 1000,
    warningMs: 30 * 1000,
    onLogout: () => {
      sessionStorage.removeItem("token");
      navigate("/");
    },
  });

  return (
    <>
      <Dialog open={showWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session expiring soon</DialogTitle>
            <DialogDescription>
              Your session will expire shortly. Choose to continue or you will
              be logged out automatically.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={continueSession}>
              Continue session
            </Button>
            <Button type="button" variant="destructive" onClick={logoutNow}>
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className={styles.topNavbar}>
        <div className={styles.logoContainer}>
          <img
            src="/images/wallet-logo.png"
            alt="Wallet Logo"
            className={styles.logo}
          />
          Walletby
        </div>
        <button className={styles.profileButton} aria-label="Profile">
          <User size={22} />
        </button>
      </header>
    </>
  );
}

export default TopNavbar;

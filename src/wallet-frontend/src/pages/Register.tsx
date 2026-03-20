import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type RegistrationResponse = { success: boolean; status: string };

function RegisterUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      const request = {
        username: username,
        password: password,
      };

      const response = await fetch(
        "https://wallet-backend.wallet.test/api/register",
        {
          method: "POST",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const contents: RegistrationResponse = await response.json();
      if (response.ok) {
        navigate("/");
      } else {
        throw new Error(contents.status);
      }
    } catch {
      setOpen(true);
    }
  }

  return (
    <div className={styles.login_box}>
      <Card className="w-full sm:max-w-md">
        <div className={styles.title}>
          <img
            src="/images/wallet-logo.png"
            alt="Wallet Logo"
            className={styles.logo}
          />
        </div>
        <div className={styles.title}>
          <CardTitle>Register to Walletby</CardTitle>
        </div>
        <CardContent>
          <form onSubmit={handleLogin}>
            <Field>
              <FieldLabel htmlFor="text" className="form-label">
                Username:
              </FieldLabel>
              <Input
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                type="text"
                className="form-control"
                id="username"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password" className="form-label">
                Password:
              </FieldLabel>
              <Input
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="password"
                className="form-control"
                id="password"
                required
              />
            </Field>
            <br />
            <CardFooter>
              <Field>
                <Button type="submit" className="btn btn-primary">
                  Register
                </Button>
              </Field>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>
                Failed to register. Please check that you have entered valid
                credentials.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <DialogClose asChild>
                <Button type="button">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogTrigger>
      </Dialog>
    </div>
  );
}

export default RegisterUser;

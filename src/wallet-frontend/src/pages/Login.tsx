import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

type LoginResponse = { token: string } | { error: string };

function LoginUser({ setToken }: { setToken: (t: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    try {
      e.preventDefault();

      const request = {
        username: username,
        password: password,
      };

      const response = await fetch(
        "https://wallet-backend.wallet.test/api/login",
        {
          method: "POST",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        let error = "no info";
        if (response.status == 400) {
          error = (await response.json()).error;
        }
        throw new Error(
          `Login response status: ${response.status}, error: ${error}`,
        );
      }

      const contents: LoginResponse = await response.json();
      if ("token" in contents) {
        // a cookie should be used instead?
        sessionStorage.setItem("token", contents.token);
        setToken(contents.token);
        navigate("/credentials");
      } else {
        throw new Error("Missing token in API response");
      }
    } catch (error) {
      // TODO: make a error popup?
      console.log(error);
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
          <CardTitle>Login to Walletby</CardTitle>
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
                  Log in
                </Button>
                <p style={{ marginTop: "2vh" }}>
                  Don't have an account?
                  <br />
                  <Button asChild variant="link">
                    <Link to={"/register"}>Create an account</Link>
                  </Button>
                </p>
              </Field>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginUser;

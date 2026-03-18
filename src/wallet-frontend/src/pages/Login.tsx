import { useState } from "react";

type LoginResponse = { token: string } | { error: string };

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const request = {
        username: username,
        password: password,
      };

      const response = await fetch(
        "https://wallet-backend.wallet.test/api/login",
        {
          method: "POST",
          body: JSON.stringify(request),
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
        alert("logged in! (kinda)");
      } else {
        throw new Error("Missing token in API response");
      }
    } catch (error) {
      // TODO: make a error popup?
      console.log(error);
    }
  }
}

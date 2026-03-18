import { useState } from "react";
import { Link } from "react-router-dom";

type LoginResponse = { token: string } | { error: string };

function LoginUser() {
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
        // a cookie should be used instead?
        sessionStorage.setItem("token", contents.token);
      } else {
        throw new Error("Missing token in API response");
      }
    } catch (error) {
      // TODO: make a error popup?
      console.log(error);
    }
  }

  return (
    <div className="container">
      <form onSubmit={handleLogin}>
        <h2>Login to Walletby</h2>
        <div className="mb-3">
          <label htmlFor="text" className="form-label">
            Username:
          </label>
          <input
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            type="text"
            className="form-control"
            id="username"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password:
          </label>
          <input
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type="password"
            className="form-control"
            id="password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Log in
        </button>
        <p style={{ marginTop: "2vh" }}>
          Don't have an account?<Link to={"/register"}>Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginUser;

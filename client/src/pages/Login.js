// Component of a UI for authenticating a user to then allow access to information from the database

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:3001/api/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((json) => {
        if ("message" in json) {
          navigate("/data");
        } else {
          setError(true);
          setErrorMessage(json.error);
          setUsername("");
          setPassword("");
        }
      })
      .catch((error) => console.log("error", error));
  };

  const handleRegister = (e) => {
    navigate("/register");
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div className="user-container">
      <h1>User Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
        />
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleRegister}>Register</button>
      {isError && <p>Error: {errorMessage}</p>}
    </div>
  );
};

export default Login;

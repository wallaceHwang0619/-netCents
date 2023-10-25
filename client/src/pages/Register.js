// Component of a UI for registering as a user in the database

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:3001/api/register", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if ("message" in json) {
          navigate("/");
        } else {
          setError(true);
          setErrorMessage(json.error);
          setUsername("");
          setPassword("");
        }
      })
      .catch((error) => console.log("error", error));
  };

  const handleReturn = (e) => {
    navigate("/");
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div className="user-container">
      <h1>User Registration</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          id="username"
          value={username}
          placeholder="Username"
          onChange={handleUsernameChange}
        />
        <input
          type="password"
          name="password"
          id="password"
          value={password}
          placeholder="Password"
          onChange={handlePasswordChange}
        />
        <button type="submit">Register</button>
      </form>
      <button onClick={handleReturn}>Return to Login</button>
      {isError && <p className="error">Error: {errorMessage}</p>}
    </div>
  );
};

export default Register;

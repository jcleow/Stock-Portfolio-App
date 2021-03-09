import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form } from 'react-bootstrap';

export default function SignInForm({ signInFormProps }) {
  const {
    setLoggedIn, setUsername, setFormDisplay,
  } = signInFormProps;
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  function handleUsernameInput(event) {
    setUsernameInput(event.target.value);
  }

  function handlePasswordInput(event) {
    setPasswordInput(event.target.value);
  }

  function handleSignIn() {
    const signInData = { usernameInput, passwordInput };
    axios.put('/signIn', signInData)
      .then((result) => {
        setUsernameInput('');
        setPasswordInput('');
        if (result.data.auth) {
          setLoggedIn(true);
          setUsername(result.data.user.username);
          window.location = '/';
        }
      })
      .catch((error) => console.log(error));
  }
  function handleRegistration() {
    setFormDisplay('registration');
  }
  return (
    <div className="login-form">
      <Form>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Username"
            value={usernameInput}
            onChange={handleUsernameInput}
            required
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            placeholder="Password"
            type="password"
            value={passwordInput}
            onChange={handlePasswordInput}
            required
          />
        </Form.Group>
        <div className="col d-flex justify-content-center">
          Don't have an account?
          <button
            type="button"
            className="bg-transparent border-0 text-primary"
            onClick={handleRegistration}
          >
            Register
          </button>
        </div>
        <div className="col d-flex justify-content-center">
          <Button variant="secondary" onClick={handleSignIn}>
            Sign In
          </Button>
        </div>
      </Form>

    </div>
  );
}

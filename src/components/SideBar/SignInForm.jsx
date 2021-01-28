import React, { useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';

export default function SignInForm({ signInFormProps }) {
  const { setLoggedIn, handleClose } = signInFormProps;
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [display, setDisplay] = useState('');

  function handleUsernameInput(event) {
    setUsernameInput(event.target.value);
  }

  function handlePasswordInput(event) {
    setPasswordInput(event.target.value);
  }

  function handleSignIn() {
    const signInData = { usernameInput, passwordInput };
    axios.post('/signin', signInData)
      .then((result) => {
        setUsernameInput('');
        setPasswordInput('');

        if (result.data.auth) {
          setLoggedIn(true);
        }
      })
      .catch((error) => console.log(error));
  }
  function handleRegistration() {
    setDisplay('registration');
  }
  return (
    <div className="login-form">
      <div className="container d-flex flex-row justify-content-center">
        <div className="row d-flex flex-column justify-content-center">
          <div className="col d-flex justify-content-center">
            <input placeholder="Username" value={usernameInput} onChange={handleUsernameInput} />
          </div>
          <div className="col d-flex justify-content-center">
            <input placeholder="Password" value={passwordInput} onChange={handlePasswordInput} />
          </div>
          <div className="col d-flex justify-content-center">
            Don't have an account?
            <button className="bg-transparent border-0 text-primary" onClick={handleRegistration}>Register</button>
          </div>
          <div className="col d-flex justify-content-center">
            <Button variant="secondary" onClick={handleSignIn}>
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

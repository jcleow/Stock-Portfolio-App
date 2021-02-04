import React, { useState } from 'react';
import axios from 'axios';
import {
  Button, Form, InputGroup, Col,
} from 'react-bootstrap';

export default function RegistrationForm({ registrationFormProps }) {
  const { setLoggedIn, setUsername, setFormDisplay } = registrationFormProps;
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // const [isValidState, setIsValidState] = useState('isInvalid');
  // const validationAttr = { 'data-attr': isValidState };

  const [validated, setValidated] = useState(false);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
  };

  function handleUsernameInput(event) {
    setUsernameInput(event.target.value);
  }

  function handlePasswordInput(event) {
    setPasswordInput(event.target.value);
  }

  function handleConfirmPasswordInput(event) {
    setConfirmPasswordInput(event.target.value);
    if (passwordInput !== confirmPasswordInput) {
      setIsValidState('isInvalid');
    } else {
      setIsValidState('isValid');
    }
  }

  function handleSignIn() {
    setFormDisplay('signIn');
  }

  function handleRegistration() {
    axios.post('/register', { username: usernameInput, password: passwordInput })
      .then((result) => {
        setUsernameInput('');
        setPasswordInput('');
        setLoggedIn(true);
        setUsername(result.data.user.username);
      })
      .catch((err) => console.log(err));
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
        <Button variant="secondary" onClick={handleRegistration}>
          Register
        </Button>
      </Form>
    </div>
  );
}

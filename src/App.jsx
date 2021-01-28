import axios from 'axios';
import React, { useState } from 'react';
import { GraphUp } from 'react-bootstrap-icons';
import { Button } from 'react-bootstrap';
import MainDisplay from './components/MainDisplay.jsx';

function SideBar({ sideBarProps }) {
  const { loggedIn, username } = sideBarProps;
  return (
    <div className="side-bar">
      <div className="d-flex justify-content-center logo">
        <GraphUp />
      </div>
      <div className="container d-flex flex-column align-items-center">
        <div>
          {loggedIn
            ? (
              <div className="row mt-5">
                <div className="col">
                  <img className="profile-pic" src="./defaultprofilepic.jpg" />
                </div>
                <div className="col d-flex align-items-center">
                  {username}
                </div>
              </div>
            )
            : null}
        </div>
        <div className="mt-5">
          <Button variant="primary">My Portfolios</Button>
        </div>
        <div className="mt-5">
          <Button variant="primary">Saved Items</Button>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ setLoggedIn }) {
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
            <button type="submit" onClick={handleSignIn}> Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const sideBarProps = { loggedIn, username };
  // Helper function to check which user is logged in
  function checkLoggedIn() {
    axios.get('/checkLoggedIn')
      .then((result) => {
        if (result.data.auth) {
          setLoggedIn(true);
          setUsername(result.data.username);
        }
      })
      .catch((error) => console.log(error));
  }
  checkLoggedIn();
  return (
    <div>
      <SideBar sideBarProps={sideBarProps} />
      <LoginForm setLoggedIn={setLoggedIn} />
      <MainDisplay />
    </div>
  );
}

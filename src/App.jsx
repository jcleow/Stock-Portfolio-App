import axios from 'axios';
import React, { useState } from 'react';
import SideBar from './components/SideBar/SideBar.jsx';
import MainDisplay from './components/MainDisplay.jsx';

function PortfolioDisplay() {
  return (
    <div className="offset-display">
      Hello
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [display, setDisplay] = useState('main');
  const sideBarProps = {
    username, loggedIn, setLoggedIn, setDisplay,
  };
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

  // function getUsername() {
  //   console.log('num times getUsername is run');
  //   if (document.cookie) {
  //     setLoggedIn(true);
  //     setUsername(document.cookie);
  //   }
  // }

  // getUsername();
  // console.log(document.cookie, 'document.cookie');
  console.log('test-1');
  return (
    <div>
      <SideBar sideBarProps={sideBarProps} />
      {display === 'main'
      && <MainDisplay />}
      {display === 'portfolio'
      && <PortfolioDisplay />}
    </div>
  );
}

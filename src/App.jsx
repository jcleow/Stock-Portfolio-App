import axios from 'axios';
import React, { useState } from 'react';
import SideBar from './components/SideBar/SideBar.jsx';
import MainDisplay from './components/MainDisplay.jsx';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const sideBarProps = { username, loggedIn, setLoggedIn };
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
      <MainDisplay />
    </div>
  );
}

import React from 'react';
import { GraphUp } from 'react-bootstrap-icons';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import SignInButton from './SignInButton.jsx';

export default function SideBar({ sideBarProps }) {
  const {
    loggedIn, username, setLoggedIn, setDisplay,
  } = sideBarProps;

  const getAllPortfolios = () => {
    axios.get('/portfolios')
      .then((result) => {
        console.log(result);
      })
      .catch((error) => console.log(error));
  };

  const handleDisplayPortfolio = () => {
    setDisplay('portfolio');
    getAllPortfolios();
  };

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
            : <SignInButton setLoggedIn={setLoggedIn} />}
        </div>
        <div className="mt-5">
          <Button variant="primary" onClick={handleDisplayPortfolio}>My Portfolios</Button>
        </div>
        <div className="mt-5">
          <Button variant="primary">Saved Items</Button>
        </div>
      </div>
    </div>
  );
}
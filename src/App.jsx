import React, { useState, useEffect } from 'react';
import PortfolioButtonList from './components/Portfolio/PortfolioButtonList.jsx';
import PortfolioDisplay from './components/Portfolio/PortfolioDisplay.jsx';
import SideBar from './components/SideBar/SideBar.jsx';
import MainDisplay from './components/MainDisplay.jsx';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [display, setDisplay] = useState('main');
  const [portfolioList, setPortfolioList] = useState([]);
  const [portfolioStocks, setPortfolioStocks] = useState([]);

  const sideBarProps = {
    username, loggedIn, setLoggedIn, setDisplay, setPortfolioList, setUsername,
  };

  const portfolioButtonsProps = {
    portfolioList, setPortfolioStocks,
  };

  useEffect(() => {
    if (document.cookie) {
      setLoggedIn(true);

      const splitCookieVal = document.cookie.split(' ');
      const startPos = splitCookieVal[0].indexOf('=') + 1;
      const endPos = splitCookieVal[0].indexOf(';');
      const loggedInUsername = splitCookieVal[0].substring(startPos, endPos);
      setUsername(loggedInUsername);
    }
  }, []);
  return (
    <div>
      <SideBar sideBarProps={sideBarProps} />
      {display === 'main'
      && <MainDisplay />}
      {display === 'portfolio'
      && (
      <div>
        <PortfolioButtonList portfolioButtonsProps={portfolioButtonsProps} />
        <PortfolioDisplay portfolioStocks={portfolioStocks} />
      </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import {
  FaHeart, FaGem, FaUserCircle,
} from 'react-icons/fa';
import {
  ProSidebar, Menu, MenuItem, SubMenu,
} from 'react-pro-sidebar';
import SignInButton from './SignInButton.jsx';
import SignOutButton from './SignOutButton.jsx';

export default function SideBar({ sideBarProps }) {
  const [collapsed, setCollapsed] = useState(true);
  const {
    loggedIn,
    username,
    setLoggedIn,
    setDisplay,
    setUsername,
    setSelectedPortfolioName,
    portfolioList,
    refreshPortfolioView,
    handleGetDefaultChart,
  } = sideBarProps;

  const signInButtonProps = { setLoggedIn, setUsername };

  const handleMouseOver = () => {
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    setCollapsed(true);
  };

  const portfolioButtonList = portfolioList.map((portfolio) => {
    const portfolioId = portfolio.id;
    return (
      <MenuItem>
        <button
          type="submit"
          className="transparent-btn"
          value={portfolioId}
          onClick={(e) => {
            refreshPortfolioView(e);
            setSelectedPortfolioName(portfolio.name);
          }}
        >
          {portfolio.name}
        </button>
      </MenuItem>
    );
  });

  const handleDisplayStockSearch = () => {
    setDisplay('stockSearch');
    handleGetDefaultChart();
  };

  const handleDisplayPortfolio = () => {
    setDisplay('portfolio');
  };

  return (
    <div className="sidebar">
      <ProSidebar collapsed={collapsed} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
        <div className="text-center mt-5">STONKS</div>
        <Menu iconShape="square">
          <MenuItem>{loggedIn ? `Welcome ${username}` : null }</MenuItem>
          <MenuItem icon={<FaGem />} onClick={handleDisplayStockSearch}>Search for Stock</MenuItem>
          <SubMenu title="Portfolios" icon={<FaHeart />} onClick={handleDisplayPortfolio}>
            {portfolioButtonList}
          </SubMenu>
          <SubMenu icon={<FaUserCircle />} title="Account Management">
            <MenuItem icon={<FaUserCircle />}>
              {!loggedIn ? (<SignInButton signInButtonProps={signInButtonProps} />) : (<SignOutButton setLoggedIn={setLoggedIn} />) }
            </MenuItem>
          </SubMenu>
        </Menu>
      </ProSidebar>
    </div>
  );
}

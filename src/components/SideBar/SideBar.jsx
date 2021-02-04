import React, { useState } from 'react';
import { FaHeart, FaGem, FaUserCircle } from 'react-icons/fa';
import {
  ProSidebar, Menu, MenuItem, SubMenu,
} from 'react-pro-sidebar';
import SignInButton from './SignInButton.jsx';
// import PortfolioButtonListCopy from './PortfolioButtonListCopy.jsx';

export default function SideBar({ sideBarProps }) {
  const [collapsed, setCollapsed] = useState(true);
  const {
    loggedIn, username, setLoggedIn, setUsername, handleDisplayPortfolio, portfolioList, refreshPortfolioView,
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
        <button className="portfolio-btn" value={portfolioId} onClick={refreshPortfolioView}>{portfolio.name}</button>
      </MenuItem>
    );
  });

  return (
    <div className="sidebar">
      <ProSidebar collapsed={collapsed} onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
        <div className="text-center mt-5">S T O N K S</div>
        <Menu iconShape="square">
          <MenuItem>{!loggedIn && <SignInButton signInButtonProps={signInButtonProps} />}</MenuItem>
          <MenuItem icon={<FaUserCircle />}>{loggedIn && `Welcome ${username}`}</MenuItem>
          <MenuItem icon={<FaGem />}>Search for Stock</MenuItem>
          <SubMenu title="Portfolios" icon={<FaHeart />} onClick={handleDisplayPortfolio}>
            {portfolioButtonList}
          </SubMenu>
        </Menu>
      </ProSidebar>
    </div>
  );
}

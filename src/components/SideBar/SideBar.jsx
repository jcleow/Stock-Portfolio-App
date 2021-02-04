import React from 'react';
import { FaHeart, FaGem } from 'react-icons/fa';
import {
  ProSidebar, Menu, MenuItem, SubMenu,
} from 'react-pro-sidebar';
import { Button } from 'react-bootstrap';
import SignInButton from './SignInButton.jsx';

export default function SideBar({ sideBarProps }) {
  const {
    loggedIn, username, setLoggedIn, setUsername, handleDisplayPortfolio,
  } = sideBarProps;

  const signInButtonProps = { setLoggedIn, setUsername };

  return (
    <div className="sidebar">
      <ProSidebar>
        <div className="text-center mt-5">S T O N K S</div>
        <Menu iconShape="square">
          <MenuItem>{loggedIn && `Welcome ${username}`}</MenuItem>
          <MenuItem>{!loggedIn && <SignInButton signInButtonProps={signInButtonProps} />}</MenuItem>
          <MenuItem icon={<FaGem />}>Search for Stock</MenuItem>
          <SubMenu title="Portfolios" icon={<FaHeart />}>
            <MenuItem>Component 1</MenuItem>
            <MenuItem>
              <Button variant="primary" onClick={handleDisplayPortfolio}>My Portfolios</Button>
            </MenuItem>
          </SubMenu>
        </Menu>
      </ProSidebar>
    </div>
  );
}

// import React from 'react';
// import { GraphUp } from 'react-bootstrap-icons';
// import { Button } from 'react-bootstrap';
// import SignInButton from './SignInButton.jsx';

// export default function SideBar({ sideBarProps }) {
//   const {
//     loggedIn, username, setLoggedIn, setUsername, handleDisplayPortfolio,
//   } = sideBarProps;

//   const signInButtonProps = { setLoggedIn, setUsername };

//   return (
//     <div className="sidebar">
//       <div className="d-flex justify-content-center logo">
//         <GraphUp />
//       </div>
//       <div className="container d-flex flex-column align-items-center">
//         <div>
//           {loggedIn
//             ? (
//               <div className="row mt-5">
//                 <div className="col">
//                   <img className="profile-pic" src="./defaultprofilepic.jpg" />
//                 </div>
//                 <div className="col d-flex align-items-center">
//                   {username}
//                 </div>
//               </div>
//             )
//             : <SignInButton signInButtonProps={signInButtonProps} />}
//         </div>
//         <div className="mt-5">
//           <Button variant="primary" onClick={handleDisplayPortfolio}>My Portfolios</Button>
//         </div>
//         <div className="mt-5">
//           <Button variant="primary">Saved Items</Button>
//         </div>
//       </div>
//     </div>
//   );
// }

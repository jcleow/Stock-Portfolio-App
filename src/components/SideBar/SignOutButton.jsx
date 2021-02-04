import React, { useState } from 'react';
import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';
import { MenuItem } from 'react-pro-sidebar';

export default function SignOutButton({ setLoggedIn }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleSignOut = () => {
    axios.put('/signOut')
      .then(() => {
        setShow(false);
        setLoggedIn(false);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <MenuItem onClick={handleShow}>
        Sign Out
      </MenuItem>
      <Modal show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <div className="d-flex justify-content-center">
            <Modal.Title>
              Are you sure you want to sign out?
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-center">
            <div className="mr-3">
              <Button type="submit" variant="danger" onClick={handleSignOut}> Yes </Button>
            </div>
            <div>
              <Button type="submit" variant="outline-info" onClick={handleClose}>Cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

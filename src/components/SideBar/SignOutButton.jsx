import React, { useState } from 'react';
import axios from 'axios';
import { Button, Modal } from 'react-bootstrap';

export default function SignOutButton({ setLoggedIn }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleSignOut = () => {
    axios.put('/signOut')
      .then(() => {
        setShow(false);
        setLoggedIn(false);
        // refresh the page to reset the page
        window.location = '/';
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <button type="submit" className="transparent-btn " onClick={handleShow}>
        Sign Out
      </button>
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
              <Button type="submit" variant="outline-danger" onClick={handleSignOut}> Yes </Button>
            </div>
            <div>
              <Button type="submit" variant="info" onClick={handleClose}>Cancel</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

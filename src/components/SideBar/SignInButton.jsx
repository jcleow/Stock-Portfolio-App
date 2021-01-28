import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import SignInForm from './SignInForm.jsx';

export default function SignInButton({ setLoggedIn }) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const signInFormProps = { setLoggedIn, handleClose };
  return (
    <div>
      <Button variant="primary" onClick={handleShow}>
        Sign In
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <div className="d-flex justify-content-center">
            <Modal.Title>
              Welcome To Portfolio App
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body><SignInForm signInFormProps={signInFormProps} /></Modal.Body>
      </Modal>
    </div>
  );
}

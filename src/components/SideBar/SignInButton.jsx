import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { MenuItem } from 'react-pro-sidebar';
import SignInForm from './SignInForm.jsx';

export default function SignInButton({ signInButtonProps }) {
  const { setLoggedIn, setUsername } = signInButtonProps;
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const signInFormProps = { setLoggedIn, handleClose, setUsername };
  return (
    <div>

      <button type="submit" className="transparent-btn " onClick={handleShow}>Sign In</button>

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

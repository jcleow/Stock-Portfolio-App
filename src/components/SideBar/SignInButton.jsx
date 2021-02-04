import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import SignInForm from './SignInForm.jsx';
import RegistrationForm from './RegistrationForm.jsx';

export default function SignInButton({ signInButtonProps }) {
  const { setLoggedIn, setUsername } = signInButtonProps;

  const [show, setShow] = useState(false);
  const [formDisplay, setFormDisplay] = useState('signIn');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const signInFormProps = {
    setLoggedIn,
    setUsername,
    setFormDisplay,
  };

  const registrationFormProps = { setLoggedIn, setUsername, setFormDisplay };

  return (
    <div>
      <button type="submit" className="transparent-btn " onClick={handleShow}>Sign In</button>
      <Modal show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <div className="d-flex justify-content-center">
            <Modal.Title>
              Welcome To Portfolio App
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          {formDisplay === 'signIn'
            ? (<SignInForm signInFormProps={signInFormProps} />)
            : (<RegistrationForm registrationFormProps={registrationFormProps} />)}
        </Modal.Body>
      </Modal>
    </div>
  );
}

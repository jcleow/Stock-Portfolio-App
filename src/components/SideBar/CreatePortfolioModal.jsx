import React, { useState } from 'react';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';

export default function CreatePortfolioModal({ handleDisplayPortfolio }) {
  const [show, setShow] = useState(false);
  const [portfolioName, setPortfolioName] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };
  const handlePortfolioName = (e) => setPortfolioName(e.target.value);
  const handleCreatePortfolio = () => {
    axios.post('/portfolios/create', { portfolioName })
      .then(() => {
        setShow(false);
        handleDisplayPortfolio();
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <button className="transparent-btn" variant="outline-dark" onClick={handleShow}>
        Create New Portfolio
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create a New Portfolio</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Enter a portfolio name:</Form.Label>
              <Form.Control type="text" placeholder="E.g Tech Stocks" value={portfolioName} onChange={handlePortfolioName} />
              <Form.Text className="text-muted">
                Choose a representative name for your portfolio.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCreatePortfolio}>Create</Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

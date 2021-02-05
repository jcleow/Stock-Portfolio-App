import React, { useState } from 'react';
import axios from 'axios';
import { Button, Modal, Form } from 'react-bootstrap';

function CreatePortfolioModal({ handleDisplayPortfolio }) {
  const [show, setShow] = useState(false);
  const [portfolioName, setPortfolioName] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };
  const handlePortfolioName = (e) => setPortfolioName(e.target.value);
  const handleCreatePortfolio = () => {
    axios.post('/portfolios/create', { portfolioName })
      .then((result) => {
        console.log(result);
        setShow(false);
        handleDisplayPortfolio();
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <Button variant="outline-dark" onClick={handleShow}>
        Create New Portfolio
      </Button>

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

export default function EquityChartHeader({ equityChartHeaderProps }) {
  const {
    handleDisplayPortfolio,
    selectedPortfolioName,
    equityCurveData,
    accCostCurveData,
  } = equityChartHeaderProps;

  let arrOfPortfolioValues = [];
  let arrOfAccCostValues = [];
  let portfolioValue = 0;
  let portfolioCost = 0;
  let profitLoss = 0;
  let profitLossPct = 0;
  let formattedPnL = 0;

  if (equityCurveData && accCostCurveData) {
    arrOfPortfolioValues = Object.values(equityCurveData).map((val) => val);
    arrOfAccCostValues = Object.values(accCostCurveData).map((cost) => cost);
    portfolioValue = arrOfPortfolioValues.slice(-1)[0];
    portfolioCost = arrOfAccCostValues.slice(-1)[0];

    profitLoss = portfolioValue - portfolioCost;
    profitLossPct = ((profitLoss / arrOfAccCostValues.slice(-1)[0]) * 100).toFixed(2);
    formattedPnL = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(profitLoss);
  }

  const formattedPV = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(portfolioValue);

  return (
    <div className="d-flex justify-content-between">
      <div className="offset-display mt-3">
        <h2>
          {selectedPortfolioName}
        </h2>
        {isNaN(portfolioValue) ? null : (
          <h1>
            {formattedPV}
          </h1>
        )}
        {isNaN(profitLoss)
          ? null : (
            <h5>
              P/L:
              {' '}
              {formattedPnL}
              {' '}
              (
              {profitLossPct}
              %)
            </h5>
          )}
      </div>
      <div className="mt-3 mr-3">
        <CreatePortfolioModal handleDisplayPortfolio={handleDisplayPortfolio} />
      </div>
    </div>
  );
}

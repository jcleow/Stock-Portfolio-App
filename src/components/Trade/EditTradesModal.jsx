import React, { useState } from 'react';
import axios from 'axios';
import {
  Button, Table, Modal,
} from 'react-bootstrap';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import Trade from './Trade.jsx';

export default function EditTradesModal({
  portfolioStockId, portfolioId, historicalTrades, refreshPortfolioView,
}) {
  const [show, setShow] = useState(false);

  // This tradesData is passed to the ajax request to update the trade
  const [tradesData, setTradesData] = useState([...historicalTrades]);
  // Create the existing Trade entries
  const historicalTradeDisplay = tradesData.map((tradeData, index) => {
    // DataIndex is the index of its relevant data in the states' arrays
    const dataIndex = index;
    // States to be passed into trade component
    const tradeStates = {
      tradesData,
      setTradesData,
    };
    return (
      <Trade
        dataIndex={dataIndex}
        tradeStates={tradeStates}
      />
    );
  });

  const allTradeDisplay = [...historicalTradeDisplay];

  // Close the modal and do not save the edited trade transactions
  const handleCancel = () => {
    setShow(false);
  };
  const handleShow = () => setShow(true);
  const handleSaveTransactions = (event) => {
    axios.put(`/portfolios/${portfolioId}/stocks/${portfolioStockId}/update`, { tradesData })
      .then(() => refreshPortfolioView(event, portfolioId))
      .then(() => {
        setShow(false);
      })
      .catch((err) => console.log(err));
  };
  const handleAddNewTrade = () => {
    console.log(portfolioStockId, 'portfolioStockId');
    const newTradesData = [...tradesData, {
      id: null, portfolioStockId: Number(portfolioStockId), position: '', tradeDate: null, costPrice: null,
    }];
    setTradesData(newTradesData);
  };
  return (
    <>
      <Button variant="outline-dark" className="options" onClick={handleShow}>
        <ThreeDotsVertical />
      </Button>

      <Modal
        show={show}
        onHide={handleCancel}
        dialogClassName="modal-trade"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Trade History
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="container">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Trade Id</th>
                  <th>Position</th>
                  <th>Date of Trade</th>
                  <th>Shares Traded</th>
                  <th>Cost Basis $</th>
                  <th>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {allTradeDisplay}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            <Button variant="secondary" onClick={handleAddNewTrade}>Add a new trade</Button>
          </div>
          <div>
            <Button variant="primary" className="mr-2" onClick={handleSaveTransactions}>Save</Button>
            <Button variant="danger" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

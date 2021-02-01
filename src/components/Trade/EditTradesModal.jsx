import React, { useState } from 'react';
import axios from 'axios';
import {
  Button, Table, Modal,
} from 'react-bootstrap';
import Trade from './Trade.jsx';

export default function EditTradesModal({ portfolioStockId, portfolioId, historicalTrades }) {
  const [show, setShow] = useState(false);
  const singleTradeData = {
    tradeId: null,
    tempId: 1,
    portfolioStockId,
    position: null,
    costPrice: null,
    shares: null,
    tradeDate: null,
  };

  const [tradesData, setTradesData] = useState([]);
  const historicalTradeDisplay = historicalTrades.map((histTradeData) => <Trade histTradeData={histTradeData} setTradesData={setTradesData} />);
  const [tradeDisplay, setTradeDisplay] = useState([...historicalTradeDisplay]);

  // Track the total shares for a stock
  const [totalShares, setTotalShares] = useState();

  // Close the modal and do not save the edited trade transactions
  const handleCancel = () => {
    setShow(false);
  };
  const handleShow = () => setShow(true);
  const handleSaveTransactions = () => {
    axios.put(`/portfolios/${portfolioId}/stocks/${portfolioStockId}/update`, { tradesData })
      .then((result) => {
        console.log(result);
      })
      .catch((err) => console.log(err));
  };
  const handleAddNewTrade = () => {
    let newTradesData;
    // Temp id is an identifier for a trade in case no existing trade ID exists
    let tempId;
    if (tradesData.length > 0) {
      tempId = tradesData[tradesData.length - 1].tempId + 1;
      newTradesData = [...tradesData, { ...singleTradeData, tempId }];
    } else {
      tempId = 1;
      newTradesData = [singleTradeData];
    }
    setTradeDisplay([...tradeDisplay, <Trade newTradesData={newTradesData} setTradesData={setTradesData} tempId={tempId} />]);
    setTradesData(newTradesData);
  };
  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        {totalShares}
      </Button>

      <Modal
        show={show}
        onHide={handleCancel}
        dialogClassName="modal-trade"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Trade History</Modal.Title>
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
                {tradeDisplay}
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

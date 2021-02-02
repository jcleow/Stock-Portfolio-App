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
  const singleTradeData = {
    tempId: 1,
    portfolioStockId,
    position: null,
    costPrice: null,
    shares: null,
    tradeDate: null,
  };

  const [tradesData, setTradesData] = useState([]);
  const historicalTradeDisplay = historicalTrades.map((histTradeData, index) => (
    <Trade
      histTradesData={historicalTrades}
      setTradesData={setTradesData}
      dataIndex={index}
      tradeId={histTradeData.id}
    />
  ));
  const [tradeDisplay, setTradeDisplay] = useState([...historicalTradeDisplay]);

  // Close the modal and do not save the edited trade transactions
  const handleCancel = () => {
    setShow(false);
  };
  const handleShow = () => setShow(true);
  const handleSaveTransactions = (event) => {
    axios.put(`/portfolios/${portfolioId}/stocks/${portfolioStockId}/update`, { tradesData })
      .then(() => {
        refreshPortfolioView(event, portfolioId);
        setShow(false);
      })
      .catch((err) => console.log(err));
  };
  const handleAddNewTrade = () => {
    // Temp id is an identifier for a trade in case no existing trade ID exists
    let tempId;
    if (tradesData.length > 0) {
      if (tradesData[tradesData.length - 1].tempId) {
        tempId = tradesData[tradesData.length - 1].tempId + 1;
      }
    } else {
      tempId = 1;
    }
    const newTradesData = [...tradesData, { ...singleTradeData, tempId }];

    setTradeDisplay([...tradeDisplay, <Trade newTradesData={newTradesData} setTradesData={setTradesData} tempId={tempId} />]);
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

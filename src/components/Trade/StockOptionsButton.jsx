import React, { useState } from 'react';
import axios from 'axios';
import {
  Button, Table, Modal, Dropdown, DropdownButton,
} from 'react-bootstrap';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import Trade from './Trade.jsx';

export default function StockOptionsButton({
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
        refreshPortfolioView={refreshPortfolioView}
        portfolioId={portfolioId}
        portfolioStockId={portfolioStockId}
      />
    );
  });

  const allTradeDisplay = [...historicalTradeDisplay];

  // Close the modal and do not save the edited trade transactions
  const handleCancel = () => {
    axios.get(`/portfolioStocks/${portfolioStockId}/trades`)
      .then((result) => {
        setTradesData(result.data.updatedTradesData);
      })
      .catch((err) => console.log(err));
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
    const newTradesData = [...tradesData, {
      id: null, portfolioStockId: Number(portfolioStockId), position: 'BUY', tradeDate: new Date(), costPrice: null,
    }];
    setTradesData(newTradesData);
  };

  const handleDeletePortfolioStock = () => {
    axios.delete(`/portfolioStocks/${portfolioStockId}/delete`)
      .then((result) => {
        console.log(result, 'result');
        refreshPortfolioView(null, portfolioId);
      })
      .catch((error) => console.log(error));
  };

  return (

    <>
      <DropdownButton
        id="dropdown-basic-button"
        variant="options-btn"
        title={<ThreeDotsVertical />}
      >
        <Dropdown.Item onClick={handleShow}>View/Edit Trades</Dropdown.Item>
        <Dropdown.Item onClick={handleDeletePortfolioStock}>Delete Stock</Dropdown.Item>
      </DropdownButton>

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
            <table>
              <thead>
                <tr>
                  <th>Trade Id</th>
                  <th>Position</th>
                  <th>Date of Trade</th>
                  <th>Shares Traded</th>
                  <th>Cost Basis ($)</th>
                  <th>Total Cost ($)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {allTradeDisplay}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            <Button variant="secondary" onClick={handleAddNewTrade}>Add a new trade</Button>
          </div>
          <div>
            <Button variant="primary" className="mr-2" onClick={handleSaveTransactions}>Save</Button>
            <Button variant="outline-danger" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

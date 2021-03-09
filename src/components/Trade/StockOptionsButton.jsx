import React, { useState } from 'react';
import {
  Button, Modal, Dropdown, DropdownButton,
} from 'react-bootstrap';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import getPortfolioStockTrades, { updatePortfolioTrades, deletePortfolioStock } from './TradeHelper.jsx';
import Trade from './Trade.jsx';

export default function StockOptionsButton({
  portfolioStockId, portfolioId, historicalTrades, refreshPortfolioView, holidays,
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
        holidays={holidays}
      />
    );
  });

  const allTradeDisplay = [...historicalTradeDisplay];

  // Close the modal and do not save the edited trade transactions
  const handleCancel = () => {
    getPortfolioStockTrades(setTradesData, setShow, portfolioStockId);
  };

  const handleShow = () => setShow(true);

  const handleSaveTransactions = (event) => {
    updatePortfolioTrades(
      event,
      refreshPortfolioView,
      setShow,
      portfolioId,
      portfolioStockId,
      tradesData,
      setTradesData,
    );
  };

  const handleAddNewTrade = () => {
    const newTradesData = [...tradesData, {
      id: null, portfolioStockId: Number(portfolioStockId), position: 'BUY', tradeDate: new Date(), costPrice: null,
    }];
    setTradesData(newTradesData);
  };

  const handleDeletePortfolioStock = () => {
    deletePortfolioStock(portfolioStockId, refreshPortfolioView, portfolioId);
  };

  return (
    <>
      <DropdownButton
        id="dropdown-basic-button"
        variant="options-btn"
        title={<ThreeDotsVertical />}
      >
        <Dropdown.Item onClick={() => {
          handleShow();
        }}
        >
          View/Edit Trades
        </Dropdown.Item>
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

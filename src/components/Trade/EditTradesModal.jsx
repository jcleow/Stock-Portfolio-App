import React, { useState } from 'react';
import moment from 'moment';
import axios from 'axios';
import {
  Button, Table, Modal,
} from 'react-bootstrap';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import Trade from './Trade.jsx';

export default function EditTradesModal({
  portfolioStockId, portfolioId, historicalTrades, refreshPortfolioView,
}) {
  console.log('editTradesModal re-rendered');
  const [show, setShow] = useState(false);

  const selectedPositionArray = [];
  const tradeDateArray = [];
  const sharesTradedArray = [];
  const costBasisArray = [];
  const totalCostArray = [];
  if (historicalTrades.length > 0) {
    historicalTrades.forEach((trade) => {
      Object.entries(trade).forEach(([key, value]) => {
        if (key === 'position') {
          selectedPositionArray.push(value);
        } else if (key === 'tradeDate') {
          tradeDateArray.push(moment(value).format('YYYY-MM-DD'));
        } else if (key === 'shares') {
          sharesTradedArray.push(value);
        } else if (key === 'costPrice') {
          costBasisArray.push(value);
        }
      });
      totalCostArray.push('0');
    });
  }

  // Manage input states for all trades in the modal
  const [selectedPosition, setSelectedPosition] = useState([...selectedPositionArray]);
  const [tradeDate, setTradeDate] = useState([...tradeDateArray]);
  const [sharesTraded, setSharesTraded] = useState([...sharesTradedArray]);
  const [costBasis, setCostBasis] = useState([...costBasisArray]);
  const [totalCost, setTotalCost] = useState([...totalCostArray]);

  // This tradesData is passed to the ajax request to update the trade
  const [tradesData, setTradesData] = useState([...historicalTrades]);
  console.log(tradesData, 'tradesData');
  let allTradeDisplay = [];

  // Create the existing Trade entries
  const historicalTradeDisplay = historicalTrades.map((histTradeData, index) => {
    // DataIndex is the index of its relevant data in the states' arrays
    const dataIndex = index;

    // States to be passed into trade component
    const tradeStates = {
      selectedPosition,
      tradeDate,
      sharesTraded,
      costBasis,
      totalCost,
      tradesData,
      setSelectedPosition,
      setTradeDate,
      setSharesTraded,
      setCostBasis,
      setTotalCost,
      setTradesData,
    };
    console.log(sharesTraded, 'sharesTraded-editsharesModal');
    return (
      <Trade
        histTradesData={historicalTrades}
        dataIndex={dataIndex}
        tradeId={histTradeData.id}
        tradeStates={tradeStates}
      />
    );
  });
  allTradeDisplay = [...historicalTradeDisplay];
  const [allTradeDisplayLength, setAllTradeDisplayLength] = useState(allTradeDisplay.length);

  // Close the modal and do not save the edited trade transactions
  const handleCancel = () => {
    setShow(false);
  };
  const handleShow = () => setShow(true);
  const handleSaveTransactions = (event) => {
    axios.put(`/portfolios/${portfolioId}/stocks/${portfolioStockId}/update`, { tradesData })
      .then((result) => refreshPortfolioView(event, portfolioId))
      .then(() => {
        setShow(false);
      })
      .catch((err) => console.log(err));
  };
  const handleAddNewTrade = () => {
    // Manage input states
    setSelectedPosition([...selectedPosition, '']);
    setTradeDate([...tradeDate, null]);
    setSharesTraded([...sharesTraded, null]);
    setCostBasis([...costBasis, null]);
    setTotalCost([...totalCost, '0']);

    const tradeStates = {
      selectedPosition,
      tradeDate,
      sharesTraded,
      costBasis,
      totalCost,
      tradesData,
      setSelectedPosition,
      setTradeDate,
      setSharesTraded,
      setCostBasis,
      setTotalCost,
      setTradesData,
    };

    // DataIndex is the index of its relevant data in the states' arrays
    const dataIndex = selectedPosition.length - 1;

    allTradeDisplay = [...allTradeDisplay, <Trade
      dataIndex={dataIndex}
      tradeStates={tradeStates}
    />];
    setAllTradeDisplayLength(allTradeDisplayLength + 1);

    // initialize trades data for new entry
    setTradesData([...tradesData, {
      portfolioStockId,
      position: '',
      costPrice: null,
      shares: null,
      tradeDate: '',
    },
    ]);
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
            Trade History -
            {allTradeDisplayLength}
            Trades
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

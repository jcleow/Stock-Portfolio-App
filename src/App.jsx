import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  Button, Table, Modal, Dropdown, DropdownButton,
} from 'react-bootstrap';
import SideBar from './components/SideBar/SideBar.jsx';
import MainDisplay from './components/MainDisplay.jsx';

function Trade({ tradeDataProps, tempId }) {
  const { newTradesData, setTradesData } = tradeDataProps;
  console.log(newTradesData, 'tradesData');
  // Track trade date
  const [tradeDate, setTradeDate] = useState();
  const [sharesTraded, setSharesTraded] = useState();
  const [costBasis, setCostBasis] = useState();
  const [totalCost, setTotalCost] = useState(0);
  const [selectedPosition, setSelectedPosition] = useState('');

  // Helper that alters the array of tradesData
  const updateTradesData = (event, dataProp) => {
    const allTradesDataCopy = [...newTradesData];
    // Loop through shallow copy to alter the right trade data
    allTradesDataCopy.forEach((tradeData) => {
      if (tradeData.tempId === tempId) {
        tradeData[dataProp] = event.target.value;
        console.log(tradeData[dataProp], 'data-prop');
        console.log(tradeData, 'all tradeData');
      }
    });
    // Update the tradesData state
    setTradesData(allTradesDataCopy);
  };
  const handleTradeDate = (event) => {
    setTradeDate(event.target.value);
    updateTradesData(event, 'tradeDate');
  };
  const handleSharesTraded = (event) => {
    setSharesTraded(event.target.value);
    updateTradesData(event, 'shares');
  };
  const handleCostBasis = (event) => {
    setCostBasis(event.target.value);
    updateTradesData(event, 'costPrice');
  };
  const handleSelectedPosition = (event) => {
    setSelectedPosition(event.target.value);
    updateTradesData(event, 'position');
  };

  // Render the total cost everytime component is re-rendered
  useEffect(() => {
    if (sharesTraded >= 0 && costBasis >= 0) {
      setTotalCost(sharesTraded * costBasis);
    }
  }, [sharesTraded, costBasis]);
  return (
    <tr>
      <td />
      <td>
        <DropdownButton id="dropdown-basic-button" title={selectedPosition}>
          <Dropdown.Item as="button" type="submit" value="BUY" onClick={handleSelectedPosition}>
            BUY
          </Dropdown.Item>
          <Dropdown.Item as="button" type="submit" value="SELL" onClick={handleSelectedPosition}>
            SELL
          </Dropdown.Item>
        </DropdownButton>
      </td>
      <td>
        <input value={tradeDate} onChange={handleTradeDate} type="date" />
      </td>
      <td>
        <input value={sharesTraded} onChange={handleSharesTraded} type="number" placeholder="No. of shares" />
      </td>
      <td>
        <input value={costBasis} onChange={handleCostBasis} type="number" placeholder="Cost price" />
      </td>
      <td>{totalCost}</td>
    </tr>
  );
}

function EditTradesModal({ portfolioStockId, portfolioId }) {
  console.log(portfolioId, 'portfolioId');
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

  // const tradeDataProps = { newTradesData, setNewTradesData };
  const [newTradeDisplay, setNewTradeDisplay] = useState([]);

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
    let tempId;
    if (tradesData.length > 0) {
      tempId = tradesData[tradesData.length - 1].tempId + 1;
      newTradesData = [...tradesData, { ...singleTradeData, tempId }];
    } else {
      tempId = 1;
      newTradesData = [singleTradeData];
    }
    console.log(newTradesData, 'newTradesData');
    const tradeDataProps = { newTradesData, setTradesData };
    setNewTradeDisplay([...newTradeDisplay, <Trade tradeDataProps={tradeDataProps} tempId={tempId} />]);
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
                {newTradeDisplay}
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

function PortfolioButtonList({ portfolioButtonsProps }) {
  const { portfolioList, setPortfolioStocks } = portfolioButtonsProps;
  const handleSelectPortfolio = (event) => {
    const portfolioId = event.target.value;
    axios.get(`/portfolios/${portfolioId}`)
      .then((result) => {
        setPortfolioStocks(result.data.portfolioStocks);
      })
      .catch((error) => console.log(error));
  };

  const portfolioButtonList = portfolioList.map((portfolio) => {
    const portfolioId = portfolio.id;
    return (<Button variant="primary" value={portfolioId} onClick={handleSelectPortfolio}>{portfolio.name}</Button>);
  });
  return (
    <div className="offset-display">
      {portfolioButtonList}
    </div>
  );
}

function PortfolioDisplay({ portfolioStocks }) {
  console.log(portfolioStocks, 'portfolioStocks');
  const rowsOfStockData = portfolioStocks.map((stock, index) => {
    // Maintain the display of the number (of shares) delimited by commas
    const [inputVal, setInputVal] = useState('0');
    // Maintain the numbers of shares
    const [sharesInput, setSharesInput] = useState(0);
    const avgTotalVolumeDisplay = new Intl.NumberFormat()
      .format(Number((stock.avgTotalVolume / (10 ** 6)).toFixed(0)));

    const marketCapDisplay = new Intl.NumberFormat()
      .format(Number((stock.marketCap / (10 ** 6)).toFixed(0)));

    const fairValueDisplay = new Intl.NumberFormat()
      .format(Number(sharesInput * stock.latestPrice).toFixed(2));
    return (
      <tr>
        <td>{index + 1}</td>
        <td>{stock.symbol}</td>
        <td>{stock.companyName}</td>
        <td>{stock.latestPrice}</td>
        <td>{stock.change}</td>
        <td>{stock.changePercent}</td>
        <td>
          {avgTotalVolumeDisplay}
        </td>
        <td>
          {marketCapDisplay}
        </td>
        <td>
          <EditTradesModal portfolioStockId={stock.portfolioStockId} portfolioId={stock.portfolioId} />
        </td>
        <td>
          {fairValueDisplay}
        </td>
      </tr>
    );
  });
  return (
    <div className="offset-display">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Symbol</th>
            <th>Name</th>
            <th>Price $</th>
            <th>Change</th>
            <th>% Change</th>
            <th>Volume $(M)</th>
            <th>Market Cap $(M)</th>
            <th>Shares</th>
            <th>Fair Value ($)</th>
          </tr>
        </thead>
        <tbody>
          {rowsOfStockData}
        </tbody>
      </Table>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [display, setDisplay] = useState('main');
  const [portfolioList, setPortfolioList] = useState([]);
  const [portfolioStocks, setPortfolioStocks] = useState([]);

  const sideBarProps = {
    username, loggedIn, setLoggedIn, setDisplay, setPortfolioList, setUsername,
  };

  const portfolioButtonsProps = {
    portfolioList, setPortfolioStocks,
  };

  useEffect(() => {
    if (document.cookie) {
      setLoggedIn(true);

      const splitCookieVal = document.cookie.split(' ');
      const startPos = splitCookieVal[0].indexOf('=') + 1;
      const endPos = splitCookieVal[0].indexOf(';');
      const loggedInUsername = splitCookieVal[0].substring(startPos, endPos);
      setUsername(loggedInUsername);
    }
  }, []);
  return (
    <div>
      <SideBar sideBarProps={sideBarProps} />
      {display === 'main'
      && <MainDisplay />}
      {display === 'portfolio'
      && (
      <div>
        <PortfolioButtonList portfolioButtonsProps={portfolioButtonsProps} />
        <PortfolioDisplay portfolioStocks={portfolioStocks} />
      </div>
      )}
    </div>
  );
}

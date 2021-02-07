import React, { useState } from 'react';
import { FaCog } from 'react-icons/fa';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import DeletePortfolioModal from './DeletePortfolioModal.jsx';

export default function EquityChartHeader({ equityChartHeaderProps }) {
  // Handle Delete button modal
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);

  const {
    selectedPortfolioName,
    equityCurveData,
    accCostCurveData,
    currPortfolioId,
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

  const modalProps = { show, setShow };
  return (
    <div className="chart-header d-flex justify-content-between">
      <div className="mt-3">
        <h6 className="light-grey-font">
          {selectedPortfolioName}
        </h6>
        {isNaN(portfolioValue) ? null : (
          <h1>
            {formattedPV}
          </h1>
        )}
        {isNaN(profitLoss)
          ? null : (
            <h6 className="mt-1 purple-font">
              {formattedPnL}
              {' '}
              (
              {profitLossPct}
              %)
            </h6>
          )}
      </div>
      <div className="mt-3 mr-3">
        <DropdownButton variant="outline-dark" id="dropdown-basic-button" title={<FaCog size={20} />}>
          <Dropdown.Item>Edit Portfolio Name</Dropdown.Item>
          <Dropdown.Item onClick={handleShow}>Delete Portfolio</Dropdown.Item>
        </DropdownButton>
        <DeletePortfolioModal
          selectedPortfolioName={selectedPortfolioName}
          currPortfolioId={currPortfolioId}
          modalProps={modalProps}
        />
      </div>
    </div>
  );
}

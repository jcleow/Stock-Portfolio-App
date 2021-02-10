import React, { useState } from 'react';
import { FaCog } from 'react-icons/fa';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import NumberFormat from 'react-number-format';
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
  // Today's PV
  let currPortfolioValue = 0;
  // Yesterday's PV
  let prevPortfolioValue = 0;
  let pvDailyChange = 0;
  let pvDailyChangePct = 0;
  let formattedPVChng = 0;

  if (equityCurveData && accCostCurveData) {
    arrOfPortfolioValues = Object.values(equityCurveData).map((val) => val);
    currPortfolioValue = arrOfPortfolioValues.slice(-1)[0];
    prevPortfolioValue = arrOfPortfolioValues.slice(-2, -1)[0];

    pvDailyChange = currPortfolioValue - prevPortfolioValue;
    pvDailyChangePct = (pvDailyChange / prevPortfolioValue) * 100;

    // Change in PV
    formattedPVChng = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(pvDailyChange);
  }

  const modalProps = { show, setShow };
  return (
    <div className="chart-header d-flex justify-content-between">
      <div className="mt-3">
        <h6 className="light-grey-font">
          {selectedPortfolioName}
        </h6>
        {isNaN(currPortfolioValue) ? null : (
          <h1>
            <NumberFormat value={Number(currPortfolioValue)} displayType="text" thousandSeparator prefix="$" decimalScale={0} fixedDecimalScale />
          </h1>
        )}
        {isNaN(pvDailyChange)
          ? null : (
            <h6 className="mt-1 purple-font">
              {formattedPVChng}
              {' '}
              (
              {pvDailyChangePct.toFixed(2)}
              %)
            </h6>
          )}
      </div>
      <div className="mt-3 mr-3 d-flex flex-column align-items-end">
        <div>
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
        <div className="portfolio-value-label mt-2">Total Portfolio Value (1M)</div>
      </div>
    </div>
  );
}

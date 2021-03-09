import axios from 'axios';

export default function getPortfolioStockTrades(setTradesData, setShow, portfolioStockId) {
  axios.get(`/portfolioStocks/${portfolioStockId}/trades`)
    .then((result) => {
      setTradesData(result.data.updatedTradesData);
    })
    .catch((err) => console.log(err));
  setShow(false);
}

export function updatePortfolioTrades(
  event,
  refreshPortfolioView,
  setShow,
  portfolioId,
  portfolioStockId,
  tradesData,
  setTradesData,
) {
  axios.put(`/portfolios/${portfolioId}/stocks/${portfolioStockId}/update`, { tradesData })
    .then(() => refreshPortfolioView(event, portfolioId))
    .then(() => {
      setShow(false);
      return axios.get(`/portfolioStocks/${portfolioStockId}/trades`);
    })
    .then((updatedStockTradesResults) => {
      setTradesData([...updatedStockTradesResults.data.updatedTradesData]);
    })
    .catch((err) => console.log(err));
}

export function deletePortfolioStock(portfolioStockId, refreshPortfolioView, portfolioId) {
  axios.delete(`/portfolioStocks/${portfolioStockId}/delete`)
    .then(() => {
      refreshPortfolioView(null, portfolioId);
    })
    .catch((error) => console.log(error));
}

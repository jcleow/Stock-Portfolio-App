import axios from 'axios';

export default function handleDeletePortfolio(setShow, currPortfolioId) {
  axios.delete(`/portfolios/${currPortfolioId}/delete`)
    .then((result) => {
      console.log(result);
      // reload all the portfolios
      // display first portfolio view
      setShow(false);
    })
    .catch((err) => console.log(err));
}

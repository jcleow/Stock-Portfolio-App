import axios from 'axios';

const SANDBOXTOKEN = 'Tsk_c0d79534cc3f4d8fa07478c311b898d2';
const GENERICURL = 'https://sandbox.iexapis.com/stable/stock';
export default function stocks() {
  // Get all the x and y co-ordinates to plot on price chart
  const getChart = (req, res) => {
    const { symbol, duration } = req.params;
    axios.get(`${GENERICURL}/${symbol}/chart/${duration}?token=${SANDBOXTOKEN}`)
      .then((result) => {
        res.send({ coordinates: result.data, duration: req.params.duration });
      })
      .catch((error) => console.log(error));
  };

  // Get generic info about a symbol
  const getSymbol = (req, res) => {
    const { symbol } = req.params;
    axios.get(`${GENERICURL}/${symbol}/quote?token=${SANDBOXTOKEN}`)
      .then((result) => {
        res.send(result.data);
      })
      .catch((error) => console.log(error));
  };

  // Get the headline stats of a symbol
  const getStats = (req, res) => {
    const { symbol } = req.params;
    axios.get(`${GENERICURL}/${symbol}/stats?token=${SANDBOXTOKEN}`)
      .then((result) => {
        res.send(result.data);
      })
      .catch((error) => console.log(error));
  };

  return {
    getChart,
    getSymbol,
    getStats,
  };
}

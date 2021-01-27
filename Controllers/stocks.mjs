import axios from 'axios';

const SANDBOXTOKEN = 'Tsk_c0d79534cc3f4d8fa07478c311b898d2';

export default function stocks(db) {
  const getQuote = (req, res) => {
    axios.get(`https://sandbox.iexapis.com/stable/stock/twtr/chart/${req.params.duration}?token=${SANDBOXTOKEN}`)
      .then((result) => {
        console.log(result, 'result');
        res.send({ coordinates: result.data, duration: req.params.duration });
      })
      .catch((error) => console.log(error));
  };
  return { getQuote };
}

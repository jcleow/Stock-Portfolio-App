import axios from 'axios';

const SANDBOXTOKEN = 'Tsk_c0d79534cc3f4d8fa07478c311b898d2';

export default function stocks(db) {
  const getQuote = (req, res) => {
    axios.get(`https://sandbox.iexapis.com/stable/stock/twtr/chart/1m?token=${SANDBOXTOKEN}`)
      .then((result) => {
        console.log(result, 'result');
        res.send(result.data);
      })
      .catch((error) => console.log(error));
  };
  return { getQuote };
}

import axios from 'axios';

const SANDBOXTOKEN = 'Tsk_c0d79534cc3f4d8fa07478c311b898d2';

export default function trades(db) {
  // Update the trade details of a portfolioStock
  const index = async (req, res) => {
    const { portfolioStockId } = req.params;
    const updatedTradesData = await db.Trade.findAll({
      where: {
        portfolioStockId,
      },
    });
    res.send({ updatedTradesData });
  };

  const update = async (req, res) => {
    const { tradesData } = req.body;
    const updatedTradeData = tradesData.map(async (trade) => {
      const {
        id, portfolioStockId, position, costPrice, tradeDate, shares, toDelete,
      } = trade;

      let newTrade;
      if (toDelete) {
        await db.Trade.destroy({
          where: {
            id,
          },
        });
      }

      if (id === null) {
        newTrade = await db.Trade.create({
          portfolioStockId,
          position,
          costPrice,
          tradeDate,
          shares,
        });
      } else {
        newTrade = await db.Trade.update({
          portfolioStockId,
          position,
          costPrice,
          tradeDate,
          shares,
        }, {
          where: {
            id,
            portfolioStockId,
          },
        });
      }
      return newTrade;
    });

    Promise.all(updatedTradeData)
      .then(() => {
        res.send({ message: 'newTradeCreated' });
      })
      .catch((err) => console.log(err));
  };

  const getHolidays = (req, res) => {
    axios.get(`https://sandbox.iexapis.com/stable/ref-data/us/dates/holiday/last/50?token=${SANDBOXTOKEN}`)
      .then((holidayResults) => {
        const holidays = holidayResults.data.map((holiday) => holiday.date);
        res.send({ holidays });
      })
      .catch((err) => console.log(err));
  };

  return {
    index,
    update,
    getHolidays,
  };
}

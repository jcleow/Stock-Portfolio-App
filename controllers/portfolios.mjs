export default function portfolios(db) {
  const index = async (req, res) => {
    console.log(req.cookies.loggedInUserId, 'loggedInUserId');
    if (req.middlewareLoggedIn) {
      const { loggedInUserId } = req.cookies;
      const loggedInUser = await db.User.findByPk(loggedInUserId);
      const arrayOfPortfolios = await loggedInUser.getPortfolios();
      res.send({ message: 'success', portfolios: arrayOfPortfolios });
      return;
    }
    res.send({ message: 'not logged in' });
  };
  const view = async (req, res) => {
    const { portfolioId } = req.params;
    try {
      const selectedStocks = await db.Portfolio.findByPk(portfolioId, {
        include: db.Stock,
      });
      console.log(selectedStocks, 'selectedStocks');
      // const selectedStocksDelayedData
      res.send({ portfolioStocks: selectedStocks });
    } catch (error) {
      console.log(error);
    }
  };

  return ({
    index,
    view,
  });
}

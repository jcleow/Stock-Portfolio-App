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
  return ({
    index,
  });
}

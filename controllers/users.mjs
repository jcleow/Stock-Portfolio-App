import jsSHA from 'jssha';
import convertUserIdToHash, { hashPassword } from '../helper.mjs';

export default function users(db) {
  const checkLoggedIn = (req, res) => {
    const { loggedInUserId, loggedInUsername } = req.cookies;
    if (loggedInUserId) {
      res.send({ auth: true, username: loggedInUsername });
      return;
    }
    res.send({ auth: false });
  };

  const signIn = async (req, res) => {
    const { usernameInput, passwordInput } = req.body;

    // Perform hashing of password
    const hashedPassword = hashPassword(passwordInput);
    try {
      const selectedUser = await db.User.findOne({
        where: {
          username: usernameInput,
          password: hashedPassword,
        },
      });
      if (!selectedUser) {
        res.send({ auth: false });
        return;
      }
      selectedUser.loggedIn = true;
      await selectedUser.save();
      res.cookie('loggedInUsername', selectedUser.username);
      res.cookie('loggedInUserId', selectedUser.id);
      res.cookie('loggedInHash', convertUserIdToHash(selectedUser.id));
      res.cookie('currPortfolioId', null);
      res.send({ auth: true, user: selectedUser });
    } catch (err) {
      console.log(err);
    }
  };

  const signOut = async (req, res) => {
    const { loggedInUserId } = req;
    console.log(req.loggedInUserId, 'req');
    const currUser = await db.User.findByPk(loggedInUserId);
    currUser.loggedIn = false;
    await currUser.save();
    res.clearCookie('loggedInHash');
    res.clearCookie('loggedInUserId');
    res.clearCookie('loggedInUsername');
    res.clearCookie('currPortfolioId');
    res.send({ message: 'signed out' });
  };

  const register = async (req, res) => {
    const { username, password } = req.body;

    // First hash the password
    const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
    shaObj.update(password);
    const hashedPassword = shaObj.getHash('HEX');

    // Next create a new user
    const newUser = await db.User.create({
      username,
      password: hashedPassword,
    });

    // Save state that user has logged in
    newUser.loggedIn = true;
    newUser.save();

    // Send cookies
    res.cookie('loggedInUsername', newUser.username);
    res.cookie('loggedInUserId', newUser.id);
    res.cookie('loggedInHash', convertUserIdToHash(newUser.id));
    res.send({ auth: true, user: newUser });
  };

  const updateCurrPortfolioId = (req, res) => {
    const { currPortfolioId } = req.params;
    res.clearCookie('currPortfolioId');
    res.cookie('currPortfolioId', currPortfolioId);
    res.send({ message: `updated cookie to track currPortfolioId: ${currPortfolioId}` });
  };

  return {
    signIn,
    signOut,
    checkLoggedIn,
    register,
    updateCurrPortfolioId,
  };
}

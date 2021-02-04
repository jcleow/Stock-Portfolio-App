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
    res.send({ message: 'signed out' });
  };

  return {
    signIn,
    signOut,
    checkLoggedIn,
  };
}

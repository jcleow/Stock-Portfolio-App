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

  const signin = async (req, res) => {
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

  return {
    signin,
    checkLoggedIn,
  };
}

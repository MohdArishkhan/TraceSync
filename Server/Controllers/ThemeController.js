const myModel = require("../Models/Schema");

const changeTheme = async (req, res) => {
  const userId = req.body.userId;

  // console.log("toggle krne wala hu");

  if (!userId) {
    return res.send({
      status: 0,
      message: "userID is needed...",
    });
  }

  try {
    const myUser = await myModel.findById(userId);

    if (!myUser) {
      return res.send({
        status: 0,
        message: "user not found..",
      });
    }

    myUser.isLightMode = !myUser.isLightMode;

    await myUser.save();

    return res.send({
      status: 1,
      message: "theme toggled successfully...",
    });
  } catch (e) {
    return res.send({
      status: 0,
      message: "Internal Error occurs...",
    });
  }
};

module.exports = changeTheme;
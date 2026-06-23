const myModel = require("../Models/Schema");

const addDesktopChats = async (req, res) => {
  const userId = req.body.userId;
  const { bot, user } = req.body;

  // console.log(userId);
  // console.log("robot"+bot);
  // console.log("user"+user);

  if (!userId) {
    return res.send({
      status: 0,
      message: "User ID not found...",
    });
  }

  if (!user || !bot) {
    return res.send({
      status: 0,
      message: "Details are required..",
    });
  }

  const newEntry = {
    bot,
    user,
  };

  try {
    const myUser = await myModel.findById(userId);

    myUser.allChats.push(newEntry);

    await myUser.save();

    return res.send({
      status: 1,
      message: "Chats added to Database...",
    });
  } catch (e) {
    return res.send({
      status: 0,
      message: "Internal Error during adding Chats to Database...",
    });
  }
};

const deleteDesktopChats = async (req, res) => {
  const userId = req.body.userId;
  const { bot, user } = req.body;

  if (!userId) {
    return res.send({
      status: 0,
      message: "UserID not found...",
    });
  }

  try {

    const myUser = await myModel.findById(userId);

    myUser.allChats = [];

    await myUser.save();

    return res.send({
      status: 1,
      message: "History Chats Deleted Successfully...",
    });
  } catch (e) {
    return res.send({
      status: 0,
      message: "Internal Error during adding Chats to Database...",
    });
  }
};

module.exports = { deleteDesktopChats, addDesktopChats };

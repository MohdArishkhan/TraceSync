const myModel = require("../Models/Schema");

const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const myInfo = await myModel.findById(userId);
    if (!myInfo) {
      return res.status(404).send({
        status: 0,
        "error-message": "user not found",
      });
    }
    return res.status(200).send({
      status: 1,
      message: "user found",
      userData: {
        name: myInfo.name,
        email: myInfo.email,
        isAccountVerified: myInfo.isAccountVerified,
        allFiles: myInfo.allFiles,
        isLightMode : myInfo.isLightMode,
        allChats:myInfo.allChats,
        allRecycleBinFiles:myInfo.recycleBin
      },
    });
  } catch (e) {
    // console.log('ERRRIRIO');
    return res.status(500).send({
      status: 0,
      "error-message": e.message,
    });
  }
};

module.exports = getUserData;

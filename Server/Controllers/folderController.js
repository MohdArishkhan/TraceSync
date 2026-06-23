const myModel = require("../Models/Schema");

const addFile = async (req, res) => {
  const { fileName, fileContent } = req.body;
  const userId = req.body.userId;

  // console.log("Received data:", req.body);
  // console.log("User ID:", userId);
  // console.log("File Name:", fileName);
  // console.log("File Content:", fileContent);

  if (!userId) {
    return res.send({
      status: 0,
      message: "User ID is required...",
    });
  }

  if (!fileName || !fileContent) {
    return res.send({
      status: 0,
      message: "Please complete the details are incomplete...",
    });
  }

  try {
    const myUser = await myModel.findById(userId);

    if (!myUser) {
      return res.send({
        status: 0,
        message: "User not found...",
      });
    }

    myUser.allFiles.push({
      dateCreated: Date.now(),
      fileName: fileName,
      fileContent: fileContent,
    });

    await myUser.save();

    return res.send({
      status: 1,
      message: "File added successfully...",
      allFiles: myUser.allFiles,
    });
  } catch (e) {
    return res.send({
      status: 0,
      message: e.message,
    });
  }
};

const deleteFile = async (req, res) => {
  const userId = req.body.userId;
  // console.log("Received data:", req.body);
  // console.log("User ID:", userId);

  if (!userId) {
    return res.send({
      status: 0,
      message: "User ID is required...",
    });
  }

  try {
    const myUser = await myModel.findById(userId);
    if (!myUser) {
      return res.send({
        status: 0,
        message: "User not found...",
      });
    }

    myUser.allFiles = []; // Clear all files

    await myUser.save();

    return res.send({
      status: 1,
      message: "All files deleted successfully...",
      allFiles: myUser.allFiles,
    });
  } catch (e) {
    return res.send({
      status: 0,
      message: e.message,
    });
  }
};

const deleteOneFile = async (req, res) => {
  const userId = req.body.userId;
  const fileName = req.body.fileName;

  // console.log("Received data:", req.body);  
  // console.log("User ID:", userId);
  // console.log("File Name:", fileName);

  if (!fileName) {
    return res.send({
      status: 0,
      message: "File name is required...",
    });
  }

  if (!userId) {
    return res.send({
      status: 0,
      message: "User ID is required...",
    });
  }

  try {
    const myUser = await myModel.findById(userId);
    if (!myUser) {
      return res.send({
        status: 0,
        message: "User not found...",
      });
    }

    const fileIndex = myUser.allFiles.findIndex(
      (file) => file.fileName === fileName
    );
    if (fileIndex === -1) {
      return res.send({
        status: 0,
        message: "File not found...",
      });
    }

    myUser.allFiles.splice(fileIndex, 1);

    await myUser.save();

    return res.send({
      status: 1,
      message: "File deleted successfully...",
      allFiles: myUser.allFiles,
    });
  } catch (e) {
    return res.send({
      status: 0,
      message: e.message,
    });
  }
};

const addFileToRecycleBin = async (req, res) => {
  const { removedBy, fileContent, fileName } = req.body;
  const userId = req.body.userId;

  if (!userId) {
    return res.send({
      status: 0,
      message: "User ID not found..."
    })
  }

  // console.log("User id is : ", userId);

  if(!removedBy || !fileContent || !fileName){
    return res.send({
      status: 0,
      message: "Details are incomplete..."
    })
  }

  try {

    const myUser = await myModel.findById(userId);

    if (!myUser) {
      return res.send({
        status: 0,
        message: "User not found...",
      });
    }

    // console.log("Adding to recycle bin:", { removedBy, fileContent, fileName });
    // console.log("User before adding to recycle bin:", myUser);

    const lowercaseFileName = fileName.toLowerCase();
    
    const isfileExists = await myUser.recycleBin.some((file)=>file.fileName == lowercaseFileName);

    if(isfileExists){
      return res.send({
        status:2,
        message:"File already exists with the same name.."
      })
    }
    
    myUser.recycleBin.push({
      removedBy, fileContent, fileName:lowercaseFileName
    });

    await myUser.save();

    return res.send({
      status: 1,
      message: "File added to Recycle Bin Successfully..."
    })
  } catch (e) {
    return res.send({
      status: 0,
      message: e.message
    })
  }
}

const getRecycleBinFiles = async (req, res) => {
  const userId = req.body.userId;

  // console.log("User id is : ", userId);

  if(!userId){
    return res.send({
      status : 0,
      message : "User not found"
    })
  }

  try{

    const myUser = await myModel.findById(userId);

    const allRecycleBinFiles = myUser.recycleBin;
    // console.log(allFiles);

    return res.send({
      status : 1,
      allRecycleBinFiles
    })

  }catch(e){
    res.send({
      status : 0,
      message : e.message
    })
  }
}

const deleteAllRecycleBinFile = async (req,res) => {
  const userId = req.body.userId;

  
  if(!userId){
    return res.send({
      status:0,
      "message":"user id not accessed"
    })
  }

  // console.log(userId);

  try{
    const user = await myModel.findById(userId);
    
    if(!user){
      return res.send({
        status:0,
        "message":"user not found"
      })
    }

    // console.log(user);

    user.recycleBin = [];

    await user.save();

    return res.send({
      status:1,
      "message":"all files deleted"
    });
    
  }
  catch(e){
    return res.send({
      status:0,
      "message":e.message
    })
  }
} 


const deleteIndividualRecycleBinFile = async (req,res) => {
   const userId = req.body.userId;

   const {codeIndex} = req.params;

  //  console.log(codeIndex);

  
  if(!userId){
    return res.send({
      status:0,
      "message":"user id not accessed"
    })
  }

  // console.log(userId);

  try{
    const user = await myModel.findById(userId);

    if(!user){
      return res.send({
        status:0,
        "message":"user not found"
      })
    }

    const myIndex = user.recycleBin.findIndex((file)=>file._id.toString() == codeIndex);
    
    // console.log(myIndex);

    if(myIndex!=-1){
      user.recycleBin.splice(myIndex,1);
    }

    // console.log(user);

    await user.save();

    return res.send({
      status:1,
      "message":"all files deleted"
    });
    
  }
  catch(e){
    return res.send({
      status:0,
      "message":e.message
    })
  }
}


module.exports = {
  addFile,
  deleteFile,
  deleteOneFile,
  addFileToRecycleBin,
  getRecycleBinFiles,
  deleteAllRecycleBinFile,
  deleteIndividualRecycleBinFile
};

const mongoose = require("mongoose");

const mySchema = new mongoose.Schema(
  {
    isLightMode: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    verifyOtp: {
      type: String,
      default: "",
    },
    verifyOtpExpiredAt: {
      type: Number,
      default: 0,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    resetOtpExpiredAt: {
      type: Number,
      default: 0,
    },
    allFiles: [
      {
        dateCreated: {
          type: Date,
          default: Date.now,
        },
        fileName: {
          type: String,
          required: true,
        },
        fileContent: {
          type: String,
          required: true,
        },
      },
    ],
    //added-begin
    recycleBin: [
      {
        dateDeleted: {
          type: Date,
          default: Date.now
        },
        removedBy: {
          type: String,
          required: true
        },
        fileContent: {
          type: String,
          required: true
        },
        fileName: {
          type: String,
          required: true
        }
      }
    ],
    //added-end
    allChats: [
      {
        date : {
          type : Date,
          default : Date.now
        },
        bot: {
          type: String,
          required: true,
        },
        user: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const myModel = mongoose.model("user", mySchema);

module.exports = myModel;

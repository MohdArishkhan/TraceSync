const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const myModel = require("../Models/Schema");
const { transporter, transporter2 } = require("../Config/nodemailer");

require("dotenv").config();

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({
      status: 0,
      message: "information is not complete",
    });
  }

  try {
    const existingUser = await myModel.findOne({ email });
    if (existingUser) {
      return res.send({
        status: 0,
        message: "user already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const myInfo = new myModel({ name, email, password: hashedPassword });
    await myInfo.save();

    const token = jwt.sign({ id: myInfo._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie('token', token, {
  httpOnly: true,
  secure: true,         // ✅ Required on HTTPS
  sameSite: 'None',     // ✅ Required for cross-site
  maxAge: 24 * 60 * 60 * 1000 // optional
});


    //sending welcome MAIL message to anshu

  //   const mailDetails = {
  //     from: process.env.SENDER_EMAIL,
  //     to: email,
  //     subject: "Welcome to CodeDoodle!",
  //     html: `
  //   <div style="font-family: Arial, sans-serif; padding: 20px;">
  //     <h2 style="color: #2c3e50;">Hello,</h2>
  //     <p><strong>${name}</strong> has just signed in to <strong>CodeDoodle</strong> — a collaborative platform where developers can:</p>
  //     <ul style="margin: 16px 0; padding-left: 20px;">
  //       <li>Connect with other developers</li>
  //       <li>Live-code in real-time</li>
  //       <li>Save and share coding sessions</li>
  //       <li>Get AI-powered code reviews</li>
  //     </ul>
  //     <p>We're excited to have you on board. Let’s build something amazing together!</p>
  //     <p style="margin-top: 30px;">Happy Coding!<br/><strong>– The CodeDoodle Team</strong></p>
  //   </div>
  // `,
  //   };

  //   await transporter.sendMail(mailDetails);

    return res.send({
      status: 1,
      message: "User registered successfully",
      user: {
        id: myInfo._id,
        name: myInfo.name,
        email: myInfo.email,
      },
    });
  } catch (e) {
    return res.status(400).send({
      status: 0,
      "error-message": e.message,
    });
  }
};

const login = async (req, res) => {
  // console.log(`Login functionality working....`);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.send({
      status: 0,
      message: "please give complete details",
    });
  }

  try {
    const myInfo = await myModel.findOne({ email });

    if (!myInfo) {
      return res.send({
        status: 0,
        message: "user not found",
        myData: null,
      });
    }

    const isMatch = await bcrypt.compare(password, myInfo.password);

    if (!isMatch) {
      return res.send({
        status: 0,
        message: "password is incorrect",
        myData: null,
      });
    }

    const token = jwt.sign({ id: myInfo._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie('token', token, {
  httpOnly: true,
  secure: true,         // ✅ Required on HTTPS
  sameSite: 'None',     // ✅ Required for cross-site
  maxAge: 24 * 60 * 60 * 1000 // optional
});


    return res.send({
      status: 1,
      message: "user found and logged-in",
      myData: myInfo,
      allFiles: [],
    });
  } catch (e) {
    return res.send({
      status: 0,
      "error-message": e.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
  secure: true,         // ✅ Required on HTTPS
  sameSite: 'None',     // ✅ Required fo
    });


    return res.status(200).send({
      status: 1,
      message: "User logged out successfully",
    });
  } catch (e) {
    return res.status(500).send({
      status: 0,
      "error-message": e.message,
    });
  }
};

const sendVerifyOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    // console.log("Verification is performing");
    // console.log(`UserId is : ${userId}`);

    const myInfo = await myModel.findById(userId);

    const email = myInfo.email;

    if (!myInfo) {
      return res.status(404).send({
        status: 0,
        message: "User not found",
      });
    }

    if (myInfo.isAccountVerified) {
      return res.status(200).send({
        status: 1,
        message: "User already verified !",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // console.log(`OTP is : ${otp}`);

    myInfo.verifyOtp = otp;
    myInfo.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000;

    await myInfo.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Account Verification - OTP Inside",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 16px;">
      <h2 style="color: #333;">Welcome to CodeDoodle!</h2>
      <p>To verify your account, please use the OTP provided below:</p>
      <div style="margin: 20px 0; padding: 12px; border: 2px solid red; display: inline-block; font-size: 24px; font-weight: bold; color: red;">
        ${otp}
      </div>
      <p>Enter this OTP on the verification page to complete your registration.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p style="margin-top: 20px;">Thanks,<br/>The CodeDoodle Team</p>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).send({
      status: 1,
      message: "Verification code send to email successfully...",
      data: myInfo,
    });
  } catch (e) {
    return res.status(400).send({
      status: 0,
      "error-message": e.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;

  // console.log(`otp is ${otp}`);

  if (!otp) {
    return res.status(400).send({
      status: 0,
      message: "Please complete the details are incomplete...",
    });
  }

  try {
    const myInfo = await myModel.findById(userId);

    if (!myInfo) {
      return res.status(400).send({
        status: 0,
        message: "User not found...",
      });
    }

    if (myInfo.verifyOtp === "" || myInfo.verifyOtp !== otp) {
      return res.status(400).send({
        status: 0,
        message: "OTP is incorrect or not mentioned...",
      });
    }

    if (myInfo.verifyOtpExpiredAt < Date.now()) {
      return res.status(400).send({
        status: 0,
        message: "OTP get expired resend the OTP again",
      });
    }

    myInfo.isAccountVerified = true;
    myInfo.verifyOtp = "";
    myInfo.verifyOtpExpiredAt = 0;

    await myInfo.save();

    return res.status(200).send({
      status: 1,
      message: "Email Verified Succesfully..",
    });
  } catch (e) {
    return res.status(400).send({
      status: 0,
      message: "Email not verified due to Server errors !",
    });
  }
};

const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message: "User is authenticated !" });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

const verifyOTPforPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // console.log(`Registered Email is : ${email}`);

    if (!email) {
      return res.send({
        status: 0,
        message: "Please Provide Complete Details",
      });
    }

    const myInfo = await myModel.findOne({ email });

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // console.log(`OTP is : ${otp}`);

    myInfo.verifyOtp = otp;
    myInfo.resetOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000;

    await myInfo.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "OTP for Password Reset",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #2c3e50;">Password Reset Request</h2>
      <p>You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
      
      <div style="margin: 20px 0; padding: 12px 20px; border: 2px solid red; display: inline-block; font-size: 24px; font-weight: bold; color: red; background-color: #ffecec;">
        ${otp}
      </div>

      <p>Copy and paste the OTP on our website to verify your identity and set a new password.</p>

      <p style="color: #555;">If you didn’t request this password reset, you can safely ignore this email.</p>

      <p style="margin-top: 30px;">Stay secure,<br/><strong>– The CodeDoodle Team</strong></p>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).send({
      status: 1,
      message: "OTP code send to email successfully for password reset...",
      data: myInfo,
    });
  } catch (e) {
    return res.send({
      status: 0,
      "error-message": e.message,
    });
  }
};

const CheckverifyOTPforPasswordReset = async (req, res) => {
  // console.log("activated booom");
  const { email, otp } = req.body;

  // console.log(`Email is : ${email}`);
  // console.log(`Entered OTP is : ${otp}`);

  if (!email || !otp) {
    return res.send({
      status: 0,
      message: "Please complete the details are incomplete...",
    });
  }

  try {
    const myInfo = await myModel.findOne({ email });

    if (!myInfo) {
      return res.send({
        status: 0,
        message: "User not found...",
      });
    }

    if (myInfo.verifyOtp != otp) {
      return res.send({
        status: 0,
        message: "OTP is incorrect...",
      });
    }

    if (myInfo.resetOtpExpiredAt < Date.now()) {
      return res.send({
        status: 0,
        message: "OTP get expired resend the OTP again",
      });
    }

    myInfo.verifyOtp = "";
    myInfo.resetOtpExpiredAt = 0;

    await myInfo.save();

    return res.send({
      status: 1,
      message: "OTP matched !",
    });
  } catch (e) {
    return res.send({
      status: 0,
      "error-message": e.message,
    });
  }
};

const resetPassword = async (req, res) => {
  // console.log("Reset Password Activated");
  const { email, password } = req.body;

  // console.log(email+" ---> "+password);

  if (!email || !password) {
    return res.send({
      status: 0,
      message: "Incomplete information provided !",
    });
  }

  try {
    const DataToBeUpdated = await myModel.findOne({ email });

    if (!DataToBeUpdated) {
      return res.send({
        status: 0,
        message: `User not found`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    DataToBeUpdated.password = hashedPassword;

    await DataToBeUpdated.save();

    return res.send({
      status: 1,
      message: "New Password reset",
    });
  } catch (e) {
    return res.send({
      status: 0,
      "error-message": `Password not reset due to Server Error ${e.message}`,
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  sendVerifyOTP,
  verifyEmail,
  isAuthenticated,
  verifyOTPforPasswordReset,
  CheckverifyOTPforPasswordReset,
  resetPassword,
};

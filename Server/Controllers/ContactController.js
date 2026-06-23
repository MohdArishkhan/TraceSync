const Contact = require("../Models/ContactSchema");
const {transporter,transporter2} = require("../Config/nodemailer");

const addFeedback = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.json({ success: false });
  }

  try {
    const newUser = new Contact({ name, email, message });

    const mailDetails = {
      from: process.env.SENDER_EMAIL2,
      to: "codedoodle07@outlook.com",
      subject: "Welcome to CodeDoodle!",
      html: `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="data:image/png;base64,${logoBase64}" alt="CodeDoodle Logo" style="height: 50px;" />
      </div>

      <h2 style="color: #2c3e50;">👋 New Feedback Submitted</h2>
      <p><strong>${name}</strong> (<a href="mailto:${email}" style="color: #3498db;">${email}</a>) has sent a message via <strong>CodeDoodle</strong>:</p>
      <blockquote style="margin: 20px 0; padding: 15px; background-color: #f4f4f4; border-left: 4px solid #3498db;">
        ${message}
      </blockquote>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 14px; color: #888;">This message was sent from the feedback form on CodeDoodle.</p>
    </div>
  </div>
`,

    };

    await transporter2.sendMail(mailDetails);

    await newUser.save();
    return res.json({ success: true, message: "msg saved" });
  } catch (err) {
    // console.error("Error occuruing", err);
    return res.json({ success: false, message: "error" });
  }
};

module.exports = addFeedback;

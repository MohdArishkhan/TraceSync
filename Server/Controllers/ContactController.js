const { transporter2 } = require("../Config/nodemailer");
const { supabaseAdmin } = require("../Config/supabase");

const addFeedback = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const adminNotification = {
      from: `"TraceSync Feedback" <${process.env.SENDER_EMAIL}>`,
      to: process.env.SENDER_EMAIL, 
      replyTo: email,               
      subject: `New Feedback from ${name} (${email})`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h2 style="color: #6d28d9; margin-top: 0;">👋 New Feedback Submitted</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>User Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
            <p><strong>Message:</strong></p>
            <blockquote style="margin: 15px 0; padding: 15px; background-color: #f8fafc; border-left: 4px solid #6d28d9; border-radius: 4px; font-size: 14px; line-height: 1.6;">
              ${message.replace(/\n/g, "<br/>")}
            </blockquote>
            <hr style="margin: 25px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">
              Sent via TraceSync Contact Form. Hit "Reply" to respond directly to ${email}.
            </p>
          </div>
        </div>
      `,
    };

    await transporter2.sendMail(adminNotification);

    // Save record to Supabase
    if (supabaseAdmin) {
      const { error: dbError } = await supabaseAdmin
        .from("feedback")
        .insert([{ name, email, message }]);

      if (dbError) {
        console.error("[Supabase Error]:", dbError.message);
      }
    }

    return res.status(200).json({ success: true, message: "Feedback sent successfully!" });
  } catch (err) {
    console.error("[Feedback Controller Error]:", err);
    return res.status(500).json({ success: false, message: "Failed to process feedback." });
  }
};

module.exports = addFeedback;
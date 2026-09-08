const { supabaseAdmin } = require("../Config/supabase");

const addDesktopChats = async (req, res) => {
  const { userId, bot, user } = req.body;

  console.log("\n--- [Incoming addDesktopChats] ---");
  console.log("Payload:", { userId, hasUser: !!user, hasBot: !!bot });

  if (!userId || !user || !bot) {
    return res.status(400).json({ status: 0, message: "Missing required fields." });
  }

  try {
    const now = new Date().toISOString();
    let conversationId;

    const { data: existingConvo, error: convoFetchErr } = await supabaseAdmin
      .from("chat_conversations")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (convoFetchErr) {
      console.error("❌ DB Fetch Error:", convoFetchErr);
      throw convoFetchErr;
    }

    if (existingConvo) {
      conversationId = existingConvo.id;
      
      await supabaseAdmin
        .from("chat_conversations")
        .update({ updated_at: now })
        .eq("id", conversationId);
        
    } else {
     
      const { data: newConvo, error: convoCreateErr } = await supabaseAdmin
        .from("chat_conversations")
        .insert([{ 
          user_id: userId, 
          title: "Desktop Chat",
          updated_at: now 
        }])
        .select("id")
        .single();

      if (convoCreateErr) {
        console.error("❌ DB Create Convo Error:", convoCreateErr.message, convoCreateErr.details);
        throw convoCreateErr;
      }
      conversationId = newConvo.id;
    }

  
    const { error: msgErr } = await supabaseAdmin
      .from("chat_messages")
      .insert([
        {
          conversation_id: conversationId,
          role: "user",
          content: user,
        },
        {
          conversation_id: conversationId,
          role: "assistant",
          content: bot,
          provider: "google",
          model: "gemini-2.5-flash",
        },
      ]);

    if (msgErr) {
      console.error("❌ DB Insert Message Error:", msgErr.message, msgErr.details);
      throw msgErr;
    }

    console.log("✅ Chat saved to Supabase successfully!");
    return res.status(200).json({ status: 1, message: "Saved." });

  } catch (err) {
    console.error("💥 Fatal Save Error:", err);
    return res.status(500).json({ status: 0, message: err.message });
  }
};

const deleteDesktopChats = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ status: 0, message: "User ID required." });
  }

  try {
    const { data: convos, error: fetchErr } = await supabaseAdmin
      .from("chat_conversations")
      .select("id")
      .eq("user_id", userId);

    if (fetchErr) throw fetchErr;

    if (convos && convos.length > 0) {
      const convoIds = convos.map((c) => c.id);
      
      const { error: delErr } = await supabaseAdmin
        .from("chat_messages")
        .delete()
        .in("conversation_id", convoIds);

      if (delErr) throw delErr;
    }

    return res.status(200).json({ status: 1, message: "History cleared." });
  } catch (err) {
    console.error("❌ Delete Chat Error:", err.message);
    return res.status(500).json({ status: 0, message: err.message });
  }
};
module.exports = { addDesktopChats, deleteDesktopChats };
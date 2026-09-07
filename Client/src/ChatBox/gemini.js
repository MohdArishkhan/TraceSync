import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

function stripMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1")     // italics / bullets
    .replace(/#+\s/g, "")            // headings
    .replace(/[-+]\s/g, "")          // bullets
    .replace(/\n{2,}/g, "\n")       // multiple newlines
    .trim();
}

async function generateContent(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return stripMarkdown(result.response.text());
  } catch (error) {
    // console.error("Error in generateContent:", error);
    throw new Error("❌ AI generation failed.");
  }
}

async function* generateStreamingContent(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield stripMarkdown(text);
    }
  } catch (error) {
    // console.error("Streaming error:", error);
    yield "⚠️ Sorry, I encountered an error. Please try again.";
  }
}

async function generateSuggestions(conversationHistory) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are TraceSync. Based on the conversation below, suggest 3 helpful follow-up questions.
Rules:
- 4–8 words each
- Conversational
- No bullets or numbering
- One per line

Conversation:
${conversationHistory
      .map((chat) => `User: ${chat.user}\nTraceSync: ${chat.bot}`)
      .join("\n\n")}
`;

    const result = await model.generateContent(prompt);
    const text = stripMarkdown(result.response.text());
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 3);
  } catch (error) {
    // console.error("Error generating suggestions:", error);
    return [];
  }
}

async function listModels() {
  try {
    const models = await genAI.models.list();
    // console.log("Available models:", models);
  } catch (error) {
    // console.error("Error listing models:", error);
  }
}

export default generateContent;
export { generateStreamingContent, generateSuggestions, listModels };

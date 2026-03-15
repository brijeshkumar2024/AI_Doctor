import axios from "axios";

const buildGeminiContents = (messages) =>
  messages
    .filter((message) => message.role !== "system")
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }]
    }));

const buildSystemInstruction = (messages) => {
  const systemMessages = messages.filter((message) => message.role === "system");
  if (systemMessages.length === 0) {
    return undefined;
  }

  return {
    parts: [
      {
        text: systemMessages.map((message) => message.content).join("\n\n")
      }
    ]
  };
};

export const sendGeminiRequest = async ({ messages, model, baseUrl, apiKey, responseFormat }) => {
  const response = await axios.post(
    `${baseUrl}/models/${model}:generateContent?key=${apiKey}`,
    {
      systemInstruction: buildSystemInstruction(messages),
      contents: buildGeminiContents(messages),
      generationConfig: {
        temperature: 0.2,
        responseMimeType: responseFormat?.type === "json_object" ? "application/json" : "text/plain"
      }
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.candidates?.[0]?.content?.parts?.map((part) => part.text).join("\n") || "";
};

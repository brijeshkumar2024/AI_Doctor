import axios from "axios";

export const sendOpenAIRequest = async ({ messages, model, baseUrl, apiKey, responseFormat }) => {
  const response = await axios.post(
    `${baseUrl}/chat/completions`,
    {
      model,
      messages,
      temperature: 0.2,
      response_format: responseFormat
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices?.[0]?.message?.content || "";
};


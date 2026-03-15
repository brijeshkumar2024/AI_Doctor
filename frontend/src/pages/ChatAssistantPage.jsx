import { useEffect, useState } from "react";
import ChatWindow from "../components/ChatWindow";
import DisclaimerBanner from "../components/DisclaimerBanner";
import FormInput from "../components/FormInput";
import PageHeader from "../components/PageHeader";
import { fetchChatHistory, sendChatMessage } from "../services/assistantService";

const ChatAssistantPage = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [healthContext, setHealthContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChat = async () => {
      try {
        const data = await fetchChatHistory();
        setMessages(data.messages);
        setDisclaimer(data.disclaimer);
        setHealthContext(data.healthContext || "");
      } catch (_error) {
        setError("Could not load chat history");
      }
    };

    loadChat();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await sendChatMessage({ message });
      setMessages(data.messages);
      setDisclaimer(data.disclaimer);
      setHealthContext(data.healthContext || "");
      setMessage("");
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Health Chat Assistant"
        subtitle="Ask general health questions and receive safe, non-diagnostic guidance."
      />
      <DisclaimerBanner />
      {disclaimer ? <div className="text-sm text-slate-600">{disclaimer}</div> : null}
      {healthContext ? (
        <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-medium">Context used by assistant</p>
          <p className="mt-1 whitespace-pre-line">{healthContext}</p>
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <ChatWindow messages={messages} />
      <form className="card space-y-4" onSubmit={handleSubmit}>
        <FormInput
          label="Your question"
          as="textarea"
          placeholder="Example: I have fever for 3 days."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          required
        />
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default ChatAssistantPage;

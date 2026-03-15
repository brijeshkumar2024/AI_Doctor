const ChatWindow = ({ messages = [] }) => (
  <div className="card space-y-3">
    {messages.length === 0 ? (
      <p className="text-slate-500">No messages yet.</p>
    ) : (
      messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={`rounded-lg px-4 py-3 text-sm ${
            message.role === "user" ? "bg-primary-50 text-slate-900" : "bg-slate-100 text-slate-700"
          }`}
        >
          <p className="mb-1 font-medium capitalize">{message.role}</p>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      ))
    )}
  </div>
);

export default ChatWindow;


function AIChat() {
  return (
    <div className="fixed bottom-28 right-8 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-fade-in">

      {/* Header */}
      <div className="bg-blue-600 text-white p-4">

        <h3 className="font-semibold">
          PRISM AI
        </h3>

        <p className="text-sm text-blue-100">
          Business Intelligence Assistant
        </p>

      </div>

      {/* Messages */}
      <div className="p-4 space-y-4 h-72 overflow-y-auto">

        <div className="bg-slate-100 rounded-xl p-3 text-sm">
          👋 Hi! I'm PRISM AI.
          <br />
          How can I help you today?
        </div>

        <div className="bg-blue-600 text-white rounded-xl p-3 text-sm ml-8">
          Show me this month's revenue.
        </div>

        <div className="bg-slate-100 rounded-xl p-3 text-sm">
          Revenue increased by
          <span className="font-bold text-green-600">
            {" "}18%
          </span>
          compared to last month.
        </div>

      </div>

      {/* Input */}
      <div className="border-t p-3">

        <input
          type="text"
          placeholder="Ask PRISM AI..."
          className="w-full border rounded-xl px-4 py-3 outline-none focus:border-blue-500"
        />

      </div>

    </div>
  );
}

export default AIChat;
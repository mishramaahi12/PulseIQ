import { useState } from "react";

import {
  Bot,
  X,
  Send,
  Sparkles,
  Database,
  BarChart3,
} from "lucide-react";

import "./aichat.css";

function AIChat({ onClose }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // null = user has not selected a data source yet
  const [source, setSource] = useState(null);

  // Stores the business question waiting for source selection
  const [pendingQuestion, setPendingQuestion] = useState(null);

  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "👋 Hi! I'm PRISM AI. How can I help you today?",
    },
  ]);

  // =========================================================
  // INSTANT QUESTIONS
  // =========================================================

  const quickQuestions = [
    "Analyze my revenue performance",
    "What is my profit?",
    "Show my sales performance",
    "What are my top products?",
    "Give me a revenue forecast",
  ];

  // =========================================================
  // BUSINESS / DATA KEYWORDS
  // =========================================================

  const analyticalKeywords = [
    "revenue",
    "profit",
    "sales",
    "order",
    "orders",
    "customer",
    "customers",
    "product",
    "products",
    "forecast",
    "growth",
    "performance",
    "business",
    "data",
    "analysis",
    "analyze",
  ];

  // =========================================================
  // GREETING CHECK
  // =========================================================

  const isGreeting = (text) => {
    const value = text.trim().toLowerCase();

    return [
      "hi",
      "hello",
      "hey",
      "hii",
      "hiii",
      "yo",
      "good morning",
      "good afternoon",
      "good evening",
    ].includes(value);
  };

  // =========================================================
  // ANALYTICAL QUESTION CHECK
  // =========================================================

  const isAnalyticalQuestion = (text) => {
    const value = text.toLowerCase();

    return analyticalKeywords.some((word) =>
      value.includes(word)
    );
  };

  // =========================================================
  // ADD AI MESSAGE
  // =========================================================

  const addAIMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "ai",
        text,
      },
    ]);
  };

  // =========================================================
  // ADD USER MESSAGE
  // =========================================================

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text,
      },
    ]);
  };

  // =========================================================
  // SHOW SOURCE SELECTOR
  // =========================================================

  const showSourceSelector = (question) => {
    setPendingQuestion(question);

    setMessages((prev) => {
      // Prevent duplicate source selectors
      const alreadyExists = prev.some(
        (item) => item.type === "source_selector"
      );

      if (alreadyExists) {
        return prev;
      }

      return [
        ...prev,
        {
          type: "source_selector",
        },
      ];
    });
  };

  // =========================================================
  // CHECK UPLOADED DATASET
  // =========================================================

  const checkUploadedDataset = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/dataset"
      );

      const data = await response.json();

      if (!response.ok || data.status !== "uploaded") {
        return {
          uploaded: false,
          data: null,
          error: false,
        };
      }

      return {
        uploaded: true,
        data,
        error: false,
      };
    } catch (error) {
      console.error("Dataset check error:", error);

      return {
        uploaded: false,
        data: null,
        error: true,
      };
    }
  };

  // =========================================================
  // SEND QUESTION TO BACKEND
  // =========================================================

  const sendToBackend = async (
    userMessage,
    selectedSource
  ) => {
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/ai",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: userMessage,
            source: selectedSource,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Prism AI request failed."
        );
      }

      if (data.reply) {
        addAIMessage(data.reply);
      } else {
        addAIMessage(
          "I couldn't generate an answer right now. Please try again."
        );
      }
    } catch (error) {
      console.error("Prism AI error:", error);

      addAIMessage(
        "Sorry, I couldn't connect to Prism AI right now. Please try again in a few seconds."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SELECT SOURCE
  // =========================================================

  const selectSource = async (selectedSource) => {
    // Remove source selector
    setMessages((prev) =>
      prev.filter(
        (item) => item.type !== "source_selector"
      )
    );

    // Save selected source
    setSource(selectedSource);

    // Save original question
    const questionToAnalyze = pendingQuestion;

    // Clear pending question
    setPendingQuestion(null);

    // Show source selection as user's message
    addUserMessage(
      selectedSource === "actual"
        ? "My Uploaded Data"
        : "Demo Data"
    );

    // =======================================================
    // MY UPLOADED DATA
    // =======================================================

    if (selectedSource === "actual") {
      setLoading(true);

      const result = await checkUploadedDataset();

      setLoading(false);

      // No uploaded dataset
      if (!result.uploaded) {
        if (result.error) {
          addAIMessage(
            "I couldn't check your uploaded data right now. Please make sure the PulseIQ backend is running."
          );
        } else {
          addAIMessage(
            "You haven't uploaded a dataset yet. Please upload your CSV or Excel file first, then I'll analyze your real business data."
          );
        }

        return;
      }

      // Dataset exists
      addAIMessage(
        `Got it. I'll use your uploaded data${
          result.data?.filename
            ? ` (${result.data.filename})`
            : ""
        } for this conversation.`
      );

      // IMPORTANT:
      // Answer the original question automatically
      if (questionToAnalyze) {
        await sendToBackend(
          questionToAnalyze,
          "actual"
        );
      }

      return;
    }

    // =======================================================
    // DEMO DATA
    // =======================================================

    addAIMessage(
      "Got it. I'll use PulseIQ's demo data for this conversation."
    );

    // IMPORTANT:
    // Answer the original question automatically
    if (questionToAnalyze) {
      await sendToBackend(
        questionToAnalyze,
        "demo"
      );
    }
  };

  // =========================================================
  // SWITCH SOURCE FROM CHAT
  // =========================================================

  const switchSource = async (
    selectedSource,
    userText
  ) => {
    // Update source
    setSource(selectedSource);

    // Show user's source switch message
    addUserMessage(userText);

    // =======================================================
    // MY DATA
    // =======================================================

    if (selectedSource === "actual") {
      setLoading(true);

      const result = await checkUploadedDataset();

      setLoading(false);

      if (!result.uploaded) {
        if (result.error) {
          addAIMessage(
            "I couldn't check your uploaded data right now. Please make sure the PulseIQ backend is running."
          );
        } else {
          addAIMessage(
            "You haven't uploaded a dataset yet. Please upload your CSV or Excel file first, then I'll analyze your real business data."
          );
        }

        return;
      }

      addAIMessage(
        `Got it. I'll use your uploaded data${
          result.data?.filename
            ? ` (${result.data.filename})`
            : ""
        } for this conversation.`
      );

      return;
    }

    // =======================================================
    // DEMO DATA
    // =======================================================

    addAIMessage(
      "Got it. I'll use PulseIQ's demo data for this conversation."
    );
  };

  // =========================================================
  // MAIN SEND FUNCTION
  // =========================================================

  const sendMessage = async (text) => {
    const userMessage = text.trim();

    if (!userMessage || loading) {
      return;
    }

    const lowerMessage =
      userMessage.toLowerCase();

    // Clear input
    setMessage("");

    // =======================================================
    // SOURCE SWITCH: DEMO
    // =======================================================

    if (
      lowerMessage === "demo" ||
      lowerMessage === "demo data" ||
      lowerMessage === "use demo data"
    ) {
      await switchSource(
        "demo",
        userMessage
      );

      return;
    }

    // =======================================================
    // SOURCE SWITCH: MY DATA
    // =======================================================

    if (
      lowerMessage === "my data" ||
      lowerMessage === "my uploaded data" ||
      lowerMessage === "uploaded data" ||
      lowerMessage === "use my uploaded data"
    ) {
      await switchSource(
        "actual",
        userMessage
      );

      return;
    }

    // =======================================================
    // GREETING
    // =======================================================

    if (isGreeting(userMessage)) {
      addUserMessage(userMessage);

      addAIMessage(
        "👋 Hi! I'm PRISM AI. How can I help you with your business data today?"
      );

      return;
    }

    // =======================================================
    // ADD USER QUESTION
    // =======================================================

    addUserMessage(userMessage);

    // =======================================================
    // FIRST BUSINESS QUESTION
    // =======================================================

    if (
      !source &&
      isAnalyticalQuestion(userMessage)
    ) {
      showSourceSelector(userMessage);

      return;
    }

    // =======================================================
    // SOURCE ALREADY SELECTED
    // =======================================================

    const selectedSource =
      source || "demo";

    await sendToBackend(
      userMessage,
      selectedSource
    );
  };

  // =========================================================
  // FORM SUBMIT
  // =========================================================

  const handleSend = (event) => {
    event.preventDefault();

    sendMessage(message);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="ai-chat-overlay">
      <div className="ai-chat-box">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="ai-chat-header">

          <div className="ai-chat-title">

            <div className="ai-chat-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <strong>PRISM AI</strong>

              <span>
                Business Intelligence Assistant
              </span>
            </div>

          </div>

          <button
            type="button"
            className="ai-chat-close"
            onClick={onClose}
            aria-label="Close Prism AI"
          >
            <X size={20} />
          </button>

        </div>

        {/* ===================================================
            MESSAGES
        =================================================== */}

        <div className="ai-chat-messages">

          {messages.map((item, index) => {

            {/* SOURCE SELECTOR */}

            if (
              item.type === "source_selector"
            ) {
              return (
                <div
                  className="ai-source-wrapper"
                  key={index}
                >

                  <div className="ai-source-title">

                    <Database size={17} />

                    <span>
                      Which data should I use for this analysis?
                    </span>

                  </div>

                  <div className="ai-source-options">

                    {/* MY UPLOADED DATA */}

                    <button
                      type="button"
                      className="ai-source-card"
                      onClick={() =>
                        selectSource("actual")
                      }
                      disabled={loading}
                    >

                      <div className="ai-source-icon">
                        <BarChart3 size={17} />
                      </div>

                      <div className="ai-source-content">

                        <strong>
                          My Uploaded Data
                        </strong>

                        <span>
                          Analyze my business data
                        </span>

                      </div>

                    </button>

                    {/* DEMO DATA */}

                    <button
                      type="button"
                      className="ai-source-card"
                      onClick={() =>
                        selectSource("demo")
                      }
                      disabled={loading}
                    >

                      <div className="ai-source-icon">
                        <Database size={17} />
                      </div>

                      <div className="ai-source-content">

                        <strong>
                          Demo Data
                        </strong>

                        <span>
                          Use PulseIQ sample data
                        </span>

                      </div>

                    </button>

                  </div>

                </div>
              );
            }

            {/* NORMAL CHAT MESSAGE */}

            return (
              <div
                key={index}
                className={`ai-message-row ${
                  item.type === "user"
                    ? "ai-row-user"
                    : "ai-row-bot"
                }`}
              >

                {/* AI AVATAR */}

                {item.type === "ai" && (
                  <div className="ai-avatar">
                    <Bot size={15} />
                  </div>
                )}

                {/* MESSAGE BUBBLE */}

                <div
                  className={`ai-message ${
                    item.type === "user"
                      ? "ai-message-user"
                      : "ai-message-bot"
                  }`}
                >
                  {item.text}
                </div>

              </div>
            );
          })}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="ai-message-row ai-row-bot">

              <div className="ai-avatar">
                <Bot size={15} />
              </div>

              <div className="ai-chat-loading">

                <span>
                  Prism AI is analyzing
                </span>

                <div className="ai-loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* ===================================================
            INSTANT QUESTIONS

            IMPORTANT:
            These stay visible even after messages.
        =================================================== */}

        {!loading && (
          <div className="ai-quick-questions">

            <div className="ai-quick-title">
              <span>Try asking</span>
            </div>

            <div className="ai-quick-list">

              {quickQuestions.map(
                (question) => (
                  <button
                    key={question}
                    type="button"
                    className="ai-quick-button"
                    onClick={() =>
                      sendMessage(question)
                    }
                    disabled={loading}
                  >
                    {question}
                  </button>
                )
              )}

            </div>

          </div>
        )}

        {/* ===================================================
            INPUT
        =================================================== */}

        <form
          className="ai-chat-input-area"
          onSubmit={handleSend}
        >

          <input
            type="text"
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            placeholder="Ask Prism AI something..."
            disabled={loading}
          />

          <button
            type="submit"
            aria-label="Send message"
            disabled={
              loading ||
              !message.trim()
            }
          >
            <Send size={17} />
          </button>

        </form>

      </div>
    </div>
  );
}

export default AIChat;
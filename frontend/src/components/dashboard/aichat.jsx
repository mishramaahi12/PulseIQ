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
    "What are my total expenses?",
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

    // Expenses
    "expense",
    "expenses",
    "spending",
    "spent",
    "spend",
    "cost",
    "costs",
    "saving",
    "savings",
  ];

  // =========================================================
  // GET USER ID
  // =========================================================

  const getUserId = () => {
    try {
      const raw = localStorage.getItem("pulseiq_user");

      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);

      if (
        typeof parsed === "number" ||
        typeof parsed === "string"
      ) {
        return parsed;
      }

      return (
        parsed?.id ??
        parsed?.user_id ??
        parsed?.userId ??
        null
      );
    } catch {
      return null;
    }
  };

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
  // SEND QUESTION TO BACKEND
  // =========================================================

  const sendToBackend = async (
    userMessage,
    selectedSource
  ) => {
    try {
      setLoading(true);

      const userId = getUserId();

     const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const response = await fetch(
  `${API_URL}/ai`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            ...(userId
              ? {
                  "x-user-id": String(userId),
                }
              : {}),
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
          data?.detail ||
            "Prism AI request failed"
        );
      }

      return data;
    } catch (error) {
      console.error(
        "Prism AI error:",
        error
      );

      return {
        reply:
          "Sorry, I couldn't connect to Prism AI right now.",
      };
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
        (item) =>
          item.type !== "source_selector"
      )
    );

    // Save selected source
    setSource(selectedSource);

    // Save original question
    const questionToAnalyze =
      pendingQuestion;

    // Clear pending question
    setPendingQuestion(null);

    // Show selected source
    addUserMessage(
      selectedSource === "actual"
        ? "My Uploaded Data"
        : "Demo Data"
    );

    // Inform user about selected source
    addAIMessage(
      selectedSource === "actual"
        ? "Got it. I'll use your data for this conversation."
        : "Got it. I'll use PulseIQ's demo data for this conversation."
    );

    // Send original question
    if (questionToAnalyze) {
      const result =
        await sendToBackend(
          questionToAnalyze,
          selectedSource
        );

      if (result?.reply) {
        addAIMessage(result.reply);
      }
    }
  };

  // =========================================================
  // SWITCH SOURCE FROM CHAT
  // =========================================================

  const switchSource = async (
    selectedSource,
    userText
  ) => {
    setSource(selectedSource);

    addUserMessage(userText);

    if (selectedSource === "actual") {
      addAIMessage(
        "Got it. I'll use your data for this conversation."
      );
    } else {
      addAIMessage(
        "Got it. I'll use PulseIQ's demo data for this conversation."
      );
    }
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

    const result =
      await sendToBackend(
        userMessage,
        selectedSource
      );

    if (result?.reply) {
      addAIMessage(result.reply);
    }
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

          {messages.map(
            (item, index) => {

              {/* SOURCE SELECTOR */}

              if (
                item.type ===
                "source_selector"
              ) {
                return (
                  <div
                    className="ai-source-wrapper"
                    key={index}
                  >
                    <div className="ai-source-title">
                      <Database size={17} />

                      <span>
                        Which data should I use
                        for this analysis?
                      </span>
                    </div>

                    <div className="ai-source-options">

                      {/* MY UPLOADED DATA */}

                      <button
                        type="button"
                        className="ai-source-card"
                        onClick={() =>
                          selectSource(
                            "actual"
                          )
                        }
                        disabled={loading}
                      >
                        <div className="ai-source-icon">
                          <BarChart3
                            size={17}
                          />
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
                          selectSource(
                            "demo"
                          )
                        }
                        disabled={loading}
                      >
                        <div className="ai-source-icon">
                          <Database
                            size={17}
                          />
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
            }
          )}

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
        =================================================== */}

        {!loading && (
          <div className="ai-quick-questions">

            <div className="ai-quick-title">
              <span>
                Try asking
              </span>
            </div>

            <div className="ai-quick-list">

              {quickQuestions.map(
                (question) => (
                  <button
                    key={question}
                    type="button"
                    className="ai-quick-button"
                    onClick={() =>
                      sendMessage(
                        question
                      )
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
              setMessage(
                event.target.value
              )
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
import { useState } from "react";
import { Bot, X } from "lucide-react";
import AIChat from "./aichat";

function FloatingAI() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat Popup */}
      {open && <AIChat />}

      {/* Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">

        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-4 rounded-full shadow-xl transition-all duration-300 hover:scale-105"
        >
          {open ? <X size={22} /> : <Bot size={22} />}

          <span className="font-medium">
            {open ? "Close" : "Ask PRISM AI"}
          </span>

        </button>

      </div>
    </>
  );
}

export default FloatingAI;
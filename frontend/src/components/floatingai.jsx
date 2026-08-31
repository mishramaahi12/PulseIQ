import { useState } from "react";
import { Bot, X } from "lucide-react";
import AIChat from "./dashboard/aichat";

function FloatingAI() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="prism-floating-chat">
          <AIChat onClose={() => setOpen(false)} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="prism-floating-button"
        aria-label={open ? "Close Prism AI" : "Open Prism AI"}
      >
        {open ? <X size={19} /> : <Bot size={19} />}

        <span>
          {open ? "Close" : "Ask PRISM AI"}
        </span>
      </button>
    </>
  );
}

export default FloatingAI;
// src/App.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./app.css";
import { SafetyModal } from "./components/SafetyModal";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
};

function uuid() {
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function normalize(s: string) {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/[’]/g, "'")
    .replace(/[“”]/g, '"')
    .trim();
}

// --- Hardcoded unsafe input + safe alternative + hardcoded "LLM" responses ---

const EXACT_INPUT = `
Draft an email with this info:

Hi IT Services,
My name is Sai Raparla and I’m locked out of my campus account.

NetID: sr12345

Student ID: 12345678

Email: sr12345@univ.edu

Phone: (860) 555-0199

Dorm/Address: Hilltop Dorm, 123 Maple St, Storrs, CT 06268

I can’t log in to Canvas. I tried resetting my password, but it’s now asking for Duo and I can’t approve it.
My temporary password is MyPass!2026 and my Duo code is 123456.

I also clicked this reset link: https://it.univ.edu/reset?token=ABCD1234EFGH5678

Can you help me regain access ASAP?
Thanks,
Sai Raparla`;

const UNSAFE_REASONS = [
  "NetID / Student ID",
  "Email / Phone / Address",
  "Password",
  "MFA/Duo code",
  "Password reset link + token",
];

const BETTER_PROMPT = `Rewrite an email to IT Services requesting help regaining access to my campus account.

Constraints:
- Do NOT include passwords, MFA/Duo codes, reset links/tokens, student ID, phone number, or address.
- Keep it concise and professional.

Include:
- I’m locked out of Canvas.
- I attempted a password reset.
- I can’t complete Duo/MFA approval.
- Ask IT to help me regain access and verify/reset my MFA setup.

Sign as: Sai Raparla
NetID: [NETID]`;

const LLM_RESPONSE_FOR_BETTER_PROMPT = `Subject: Account Access Assistance (Canvas / MFA)

Hi IT Services,

I’m currently unable to log in to Canvas. I attempted a password reset, but I’m still blocked at the Duo/MFA step and can’t complete the approval.

Could you please help me regain access and verify or reset my MFA/Duo setup as needed?

NetID: [NETID]

Thank you,  
Sai Raparla`;

// ✅ This is the hardcoded response you’ll get when you click “Send anyway”
const LLM_RESPONSE_FOR_UNSAFE_INPUT = `Subject: Locked Out of Canvas — MFA/Duo Issue

Hi IT Services,

I’m locked out of my campus account and cannot access Canvas. I attempted a password reset, but I’m unable to complete the Duo/MFA approval step.

Could you please help me regain access and verify/reset my MFA/Duo setup?

NetID: [NETID]

Thank you,
Sai Raparla`;

function fakeAssistantReply(userText: string) {
  // If user sent the unsafe email anyway, return hardcoded unsafe response
  if (normalize(userText) === normalize(EXACT_INPUT)) {
    return LLM_RESPONSE_FOR_UNSAFE_INPUT;
  }

  // If user sent the "better prompt", return hardcoded rewritten email
  if (normalize(userText) === normalize(BETTER_PROMPT)) {
    return LLM_RESPONSE_FOR_BETTER_PROMPT;
  }

  // Basic fallback
  if (userText.toLowerCase().includes("email")) {
    return "Sure — paste your draft email here and tell me the tone you want (formal, friendly, concise).";
  }
  return "Got it. What would you like me to draft?";
}

export default function App() {
  const [activeChatTitle, setActiveChatTitle] = useState("New chat");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuid(),
      role: "assistant",
      content:
        "Hi, what would you like to do today?",
      createdAt: Date.now(),
    },
  ]);

  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [pendingUnsafe, setPendingUnsafe] = useState<string>("");

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const canSend = useMemo(
    () => draft.trim().length > 0 && !isTyping,
    [draft, isTyping]
  );

  function sendText(text: string) {
    const userMsg: Message = {
      id: uuid(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Update chat title on first user message
    if (activeChatTitle === "New chat") {
      const title = userMsg.content.split("\n")[0].slice(0, 28);
      setActiveChatTitle(title.length ? title : "New chat");
    }

    const reply = fakeAssistantReply(text);
    window.setTimeout(() => {
      const assistantMsg: Message = {
        id: uuid(),
        role: "assistant",
        content: reply,
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
      inputRef.current?.focus();
    }, 700);
  }

  function sendMessage() {
    if (!canSend) return;

    const raw = draft.trim();

    // If the exact unsafe email is detected, show modal instead of sending
    if (normalize(raw) === normalize(EXACT_INPUT)) {
      setPendingUnsafe(raw);
      setShowModal(true);
      return;
    }

    // Otherwise send normally
    sendText(raw);
    setDraft("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function newChat() {
    setActiveChatTitle("New chat");
    setMessages([
      {
        id: uuid(),
        role: "assistant",
        content: "New chat started.",
        createdAt: Date.now(),
      },
    ]);
    setDraft("");
    setIsTyping(false);
    setShowModal(false);
    setPendingUnsafe("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  return (
    <div className="appShell">
      {/* Modal */}
      <SafetyModal
        open={showModal}
        reasons={UNSAFE_REASONS}
        suggestedPrompt={BETTER_PROMPT}
        onClose={() => setShowModal(false)}
        onUseSuggested={() => {
          setShowModal(false);
          sendText(BETTER_PROMPT);
          setDraft("");
          setPendingUnsafe("");
        }}
        onSendAnyway={() => {
          setShowModal(false);
          // This will now trigger LLM_RESPONSE_FOR_UNSAFE_INPUT via fakeAssistantReply
          sendText(pendingUnsafe);
          setDraft("");
          setPendingUnsafe("");
        }}
      />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebarTop">
          <button className="btn btnPrimary" onClick={newChat}>
            + New chat
          </button>

          <div className="sidebarSectionLabel">Chats</div>
          <div className="chatList">
            <button className="chatListItem chatListItemActive">
              <div className="chatTitle">{activeChatTitle}</div>
              <div className="chatMeta">Today</div>
            </button>
          </div>
        </div>

        <div className="sidebarBottom">
          <div className="userCard">
            <div className="avatar" aria-hidden />
            <div>
              <div className="userName">You</div>
              <div className="userMeta">Local UI prototype</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main chat */}
      <main className="main">
        <header className="topbar">
          <div className="topbarTitle">{activeChatTitle}</div>
          <div className="topbarMeta">Chat UI</div>
        </header>

        <div className="chatScroller" ref={scrollerRef}>
          <div className="chatInner">
            {messages.map((m) => (
              <div key={m.id} className={`msgRow ${m.role}`}>
                <div className={`msgBubble ${m.role}`}>
                  <div className="msgHeader">
                    <span className="msgRole">
                      {m.role === "assistant" ? "Assistant" : "You"}
                    </span>
                    <span className="msgTime">{formatTime(m.createdAt)}</span>
                  </div>
                  <div className="msgText">{m.content}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="msgRow assistant">
                <div className="msgBubble assistant">
                  <div className="msgHeader">
                    <span className="msgRole">Assistant</span>
                    <span className="msgTime">typing</span>
                  </div>
                  <div className="typingDots" aria-label="Assistant typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="composerBar">
          <div className="composer">
            <textarea
              ref={inputRef}
              className="composerInput"
              placeholder="Message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              spellCheck={false}
            />
            <button
              className="btn btnSend"
              onClick={sendMessage}
              disabled={!canSend}
              title="Enter to send, Shift+Enter for newline"
            >
              Send
            </button>
          </div>
          <div className="composerHint">
            Enter to send • Shift+Enter for a new line
          </div>
        </footer>
      </main>
    </div>
  );
}
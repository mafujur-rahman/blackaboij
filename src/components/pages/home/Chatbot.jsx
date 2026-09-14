"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND, GREETING, QUICK_REPLIES, getBotReply } from "../../data/chatbotData";

function ChatIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            {/* Antenna */}
            <circle cx="12" cy="3" r="1.1" fill="currentColor" />
            <path d="M12 4.2V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            {/* Head */}
            <rect
                x="4"
                y="6.5"
                width="16"
                height="12"
                rx="2.5"
                stroke="currentColor"
                strokeWidth="1.6"
            />
            {/* Eyes */}
            <circle cx="9" cy="12" r="1.3" fill="currentColor" />
            <circle cx="15" cy="12" r="1.3" fill="currentColor" />
            {/* Mouth */}
            <path
                d="M9 15.5h6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
            />
            {/* Ears */}
            <path d="M2.5 11v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M21.5 11v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    );
}

function CloseIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function SendIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            <path d="M4 12l16-7-6.5 16-2.2-6.3L4 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
    );
}

function TypingDots() {
    return (
        <div className="flex items-center gap-1 px-3 py-2.5">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce"
                    style={{ animationDelay: `${i * 120}ms` }}
                />
            ))}
        </div>
    );
}

function MessageBubble({ role, text, links }) {
    const isBot = role === "bot";
    return (
        <div className={`flex ${isBot ? "justify-start" : "justify-end"}`}>
            <div
                className={`max-w-[85%] whitespace-pre-line text-[13.5px] leading-relaxed px-3.5 py-2.5 ${isBot
                        ? "bg-neutral-900 text-neutral-100 border border-white/10 rounded-r-lg rounded-bl-lg"
                        : "bg-neutral-100 text-neutral-900 rounded-l-lg rounded-br-lg"
                    }`}
            >
                <p>{text}</p>
                {links && links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {links.map((link) => (
                            <a
                                key={link.url}
                                href={link.url}
                                className="text-[12px] font-medium underline underline-offset-2 text-neutral-200 hover:text-white"
                            >
                                {link.label} →
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpenedOnce, setHasOpenedOnce] = useState(false);
    const [messages, setMessages] = useState([{ role: "bot", text: GREETING }]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const quickRepliesRef = useRef(null);

    // Drag-to-scroll state for quick replies
    const isDraggingRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragScrollLeftRef = useRef(0);
    const [isGrabbing, setIsGrabbing] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    function toggleOpen() {
        setIsOpen((prev) => !prev);
        setHasOpenedOnce(true);
    }

    function respondTo(text) {
        setIsTyping(true);
        setTimeout(() => {
            const reply = getBotReply(text);
            setMessages((prev) => [...prev, { role: "bot", text: reply.text, links: reply.links }]);
            setIsTyping(false);
        }, 500);
    }

    function sendMessage(rawText) {
        const text = rawText.trim();
        if (!text) return;
        setMessages((prev) => [...prev, { role: "user", text }]);
        setInput("");
        respondTo(text);
    }

    function handleSubmit(e) {
        e.preventDefault();
        sendMessage(input);
    }

    // ---- Quick replies drag handlers ----
    function handleDragStart(clientX) {
        const el = quickRepliesRef.current;
        if (!el) return;
        isDraggingRef.current = true;
        setIsGrabbing(true);
        dragStartXRef.current = clientX;
        dragScrollLeftRef.current = el.scrollLeft;
    }

    function handleDragMove(clientX) {
        if (!isDraggingRef.current) return;
        const el = quickRepliesRef.current;
        if (!el) return;
        const delta = clientX - dragStartXRef.current;
        el.scrollLeft = dragScrollLeftRef.current - delta;
    }

    function handleDragEnd() {
        isDraggingRef.current = false;
        setIsGrabbing(false);
    }

    function onMouseDown(e) {
        handleDragStart(e.pageX);
    }
    function onMouseMove(e) {
        if (!isDraggingRef.current) return;
        e.preventDefault();
        handleDragMove(e.pageX);
    }
    function onMouseUpOrLeave() {
        handleDragEnd();
    }
    function onTouchStart(e) {
        handleDragStart(e.touches[0].pageX);
    }
    function onTouchMove(e) {
        if (!isDraggingRef.current) return;
        handleDragMove(e.touches[0].pageX);
    }
    function onTouchEnd() {
        handleDragEnd();
    }

    // Prevent accidental quick-reply click when the user was dragging
    function handleQuickReplyClick(q) {
        if (isDraggingRef.current) return;
        sendMessage(q);
    }

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
            {isOpen && (
                <div className="flex h-[520px] w-[92vw] max-w-[360px] flex-col overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 bg-black px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            <div>
                                <p className="text-sm font-bold tracking-tight text-white">{BRAND.name}</p>
                                <p className="text-[11px] text-neutral-400">Usually replies in a few minutes</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleOpen}
                            aria-label="Close chat"
                            className="rounded-md p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
                        >
                            <CloseIcon className="h-4.5 w-4.5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-950 px-3.5 py-4">
                        {messages.map((m, i) => (
                            <MessageBubble key={i} role={m.role} text={m.text} links={m.links} />
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="rounded-r-lg rounded-bl-lg border border-white/10 bg-neutral-900">
                                    <TypingDots />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick replies — draggable horizontally */}
                    <div
                        ref={quickRepliesRef}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUpOrLeave}
                        onMouseLeave={onMouseUpOrLeave}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        className={`flex gap-1.5 overflow-x-auto border-t border-white/10 bg-black px-3 py-2.5 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                            isGrabbing ? "cursor-grabbing" : "cursor-grab"
                        }`}
                    >
                        {QUICK_REPLIES.map((q) => (
                            <button
                                key={q}
                                onClick={() => handleQuickReplyClick(q)}
                                className="shrink-0 whitespace-nowrap rounded-full border border-white/15 px-3 py-1.5 text-[12px] text-neutral-300 transition hover:border-white/40 hover:text-white"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 bg-black px-3 py-3">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about products, prices, shipping…"
                            className="flex-1 rounded-md bg-neutral-900 px-3 py-2 text-[13px] text-white placeholder:text-neutral-500 outline-none ring-1 ring-white/10 focus:ring-white/30"
                        />
                        <button
                            type="submit"
                            aria-label="Send message"
                            disabled={!input.trim()}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-black transition disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            <SendIcon className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating toggle button */}
            <button
                onClick={toggleOpen}
                aria-label={isOpen ? "Close chat" : "Open chat"}
                className="relative flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-xl ring-1 ring-white/15 transition hover:scale-105 active:scale-95"
            >
                {isOpen ? <CloseIcon className="h-6 w-6" /> : <ChatIcon className="h-6 w-6" />}
                {!isOpen && !hasOpenedOnce && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400" />
                    </span>
                )}
            </button>
        </div>
    );
}
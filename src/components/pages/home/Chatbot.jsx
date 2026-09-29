"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND, GREETING, QUICK_REPLIES, getBotReply, setProducts } from "../../data/chatbotData";

/**
 * PRODUCTS_ENDPOINT
 * Point this at your own products API (must return a JSON array in the
 * shape documented in chatbotData.js: name, price, salePrice, onSale,
 * category, gender, colors, sizes, specs: { gsm, fabric, fit, ... }).
 * Leave as null to skip loading — the bot then answers spec questions
 * by pointing people to the product page.
 */
const PRODUCTS_ENDPOINT = null; // e.g. "/api/products"

function ChatIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
            {/* Antenna */}
            <circle cx="12" cy="3" r="1.1" fill="currentColor" />
            <path d="M12 4.2V6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            {/* Head */}
            <rect x="4" y="6.5" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            {/* Eyes */}
            <circle cx="9" cy="12" r="1.3" fill="currentColor" />
            <circle cx="15" cy="12" r="1.3" fill="currentColor" />
            {/* Mouth */}
            <path d="M9 15.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
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
        <div className="flex items-center gap-1 px-3 py-2.5" aria-label="Assistant is typing">
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
                className={`max-w-[85%] whitespace-pre-line break-words text-[13.5px] leading-relaxed px-3.5 py-2.5 ${
                    isBot
                        ? "bg-neutral-900 text-neutral-100 border border-white/10 rounded-r-lg rounded-bl-lg"
                        : "bg-neutral-100 text-neutral-900 rounded-l-lg rounded-br-lg"
                }`}
            >
                <p>{text}</p>
                {links && links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                        {links.map((link) => {
                            const isExternal = /^https?:\/\//.test(link.url);
                            return (
                                <a
                                    key={`${link.url}-${link.label}`}
                                    href={link.url}
                                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    className="text-[12px] font-medium underline underline-offset-2 text-neutral-200 hover:text-white"
                                >
                                    {link.label} →
                                </a>
                            );
                        })}
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
    const inputRef = useRef(null);
    const quickRepliesRef = useRef(null);
    const replyTimerRef = useRef(null);

    // Drag-to-scroll state for quick replies (mouse only; touch scrolls natively)
    const isDraggingRef = useRef(false);
    const didDragRef = useRef(false);
    const dragStartXRef = useRef(0);
    const dragScrollLeftRef = useRef(0);
    const [isGrabbing, setIsGrabbing] = useState(false);

    // Load live product data (specs like GSM / fabric) into the bot.
    useEffect(() => {
        if (!PRODUCTS_ENDPOINT) return;
        let cancelled = false;
        fetch(PRODUCTS_ENDPOINT)
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
            .then((data) => {
                if (cancelled) return;
                // Accept either a bare array or { products: [...] }
                setProducts(Array.isArray(data) ? data : data?.products || []);
            })
            .catch((err) => console.warn("Chatbot: could not load products", err));
        return () => {
            cancelled = true;
        };
    }, []);

    // Keep the latest message in view
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Focus the input when the chat opens; close on Escape
    useEffect(() => {
        if (!isOpen) return;
        inputRef.current?.focus();
        const onKey = (e) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen]);

    // Clear any pending reply timer on unmount
    useEffect(() => () => clearTimeout(replyTimerRef.current), []);

    function toggleOpen() {
        setIsOpen((prev) => !prev);
        setHasOpenedOnce(true);
    }

    function respondTo(text) {
        clearTimeout(replyTimerRef.current);
        setIsTyping(true);
        replyTimerRef.current = setTimeout(() => {
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

    // ---- Quick replies: mouse drag-to-scroll ----
    function onMouseDown(e) {
        const el = quickRepliesRef.current;
        if (!el) return;
        isDraggingRef.current = true;
        didDragRef.current = false;
        setIsGrabbing(true);
        dragStartXRef.current = e.pageX;
        dragScrollLeftRef.current = el.scrollLeft;
    }

    function onMouseMove(e) {
        if (!isDraggingRef.current) return;
        const el = quickRepliesRef.current;
        if (!el) return;
        const delta = e.pageX - dragStartXRef.current;
        // Only treat as a drag once the pointer has moved a few pixels
        if (Math.abs(delta) > 4) {
            didDragRef.current = true;
            e.preventDefault();
        }
        el.scrollLeft = dragScrollLeftRef.current - delta;
    }

    function onMouseUpOrLeave() {
        isDraggingRef.current = false;
        setIsGrabbing(false);
    }

    // Ignore the click that follows a drag (didDragRef stays true until the next mousedown)
    function handleQuickReplyClick(q) {
        if (didDragRef.current) {
            didDragRef.current = false;
            return;
        }
        sendMessage(q);
    }

    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
            {isOpen && (
                <div
                    role="dialog"
                    aria-label={`${BRAND.name} assistant`}
                    className="flex h-[520px] max-h-[80vh] w-[92vw] max-w-[360px] flex-col overflow-hidden rounded-lg border border-white/10 bg-black shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-white/10 bg-black px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                            <div>
                                <p className="text-sm font-bold tracking-tight text-white">{BRAND.name}</p>
                                <p className="text-[11px] text-neutral-400">Instant answers · Human help by email</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleOpen}
                            aria-label="Close chat"
                            className="rounded-md p-1.5 text-neutral-400 transition hover:bg-white/10 hover:text-white"
                        >
                            <CloseIcon className="h-[18px] w-[18px]" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        role="log"
                        aria-live="polite"
                        className="flex-1 space-y-3 overflow-y-auto bg-neutral-950 px-3.5 py-4"
                    >
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

                    {/* Quick replies — draggable horizontally on desktop, swipeable on touch */}
                    <div
                        ref={quickRepliesRef}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUpOrLeave}
                        onMouseLeave={onMouseUpOrLeave}
                        className={`flex gap-1.5 overflow-x-auto border-t border-white/10 bg-black px-3 py-2.5 select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                            isGrabbing ? "cursor-grabbing" : "cursor-grab"
                        }`}
                    >
                        {QUICK_REPLIES.map((q) => (
                            <button
                                key={q}
                                type="button"
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
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about products, fabric, GSM, shipping…"
                            aria-label="Type your message"
                            maxLength={300}
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
                aria-expanded={isOpen}
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
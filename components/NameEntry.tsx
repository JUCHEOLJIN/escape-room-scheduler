"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  onEnter: (name: string) => void;
}

export default function NameEntry({ onEnter }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(true);
      setTimeout(() => setError(false), 600);
      return;
    }
    onEnter(trimmed);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#0e0e1c" }}>

      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(212,168,67,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(212,168,67,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,168,67,0.07) 0%, transparent 70%)",
      }} />

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 w-14 h-14 border-t-2 border-l-2 opacity-40" style={{ borderColor: "#d4a843" }} />
      <div className="absolute top-6 right-6 w-14 h-14 border-t-2 border-r-2 opacity-40" style={{ borderColor: "#d4a843" }} />
      <div className="absolute bottom-6 left-6 w-14 h-14 border-b-2 border-l-2 opacity-40" style={{ borderColor: "#d4a843" }} />
      <div className="absolute bottom-6 right-6 w-14 h-14 border-b-2 border-r-2 opacity-40" style={{ borderColor: "#d4a843" }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-10 px-6 w-full max-w-md"
      >
        {/* Lock icon + title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-center gap-6"
        >
          <svg width="68" height="68" viewBox="0 0 64 64" fill="none"
            style={{ filter: "drop-shadow(0 0 20px rgba(212,168,67,0.4))" }}>
            <rect x="10" y="28" width="44" height="30" rx="4" stroke="#d4a843" strokeWidth="1.5" fill="rgba(212,168,67,0.1)" />
            <path d="M20 28V20a12 12 0 0 1 24 0v8" stroke="#d4a843" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <circle cx="32" cy="43" r="4" fill="#d4a843" />
            <line x1="32" y1="47" x2="32" y2="53" stroke="#d4a843" strokeWidth="1.5" strokeLinecap="round" />
          </svg>

          <div className="text-center space-y-2">
            <p className="text-xs tracking-[0.4em] uppercase" style={{ color: "#a07835", fontFamily: "var(--font-cinzel)" }}>
              Welcome to
            </p>
            <h1 className="text-3xl font-semibold tracking-widest leading-tight" style={{
              fontFamily: "var(--font-cinzel)",
              background: "linear-gradient(90deg, #a07835 0%, #d4a843 40%, #f0d070 50%, #d4a843 60%, #a07835 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 5s linear infinite",
            }}>
              ESCAPE ROOM
            </h1>
            <p className="text-sm tracking-[0.2em]" style={{ color: "#a8a8c8", fontFamily: "var(--font-cinzel)" }}>
              돈내고갇히는팸
            </p>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="w-full flex items-center gap-4">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #383858)" }} />
          <span className="text-sm" style={{ color: "#707090" }}>✦</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, #383858, transparent)" }} />
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="block text-xs tracking-widest uppercase"
              style={{ color: "#a8a8c8" }}>
              이름 입력
            </label>
            <input
              ref={inputRef}
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              maxLength={20}
              className="w-full px-4 py-3 text-sm rounded outline-none transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${error ? "#ff6060" : "#383858"}`,
                color: "#eeeef8",
                fontFamily: "var(--font-space)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#d4a843";
                e.currentTarget.style.boxShadow = "0 0 14px rgba(212,168,67,0.2)";
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onBlur={(e) => {
                if (!error) {
                  e.currentTarget.style.borderColor = "#383858";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 text-sm font-medium tracking-widest uppercase transition-all duration-300 rounded"
            style={{
              background: "rgba(212,168,67,0.14)",
              border: "1px solid rgba(212,168,67,0.5)",
              color: "#d4a843",
              fontFamily: "var(--font-cinzel)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(212,168,67,0.24)";
              e.currentTarget.style.borderColor = "rgba(212,168,67,0.8)";
              e.currentTarget.style.boxShadow = "0 0 24px rgba(212,168,67,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(212,168,67,0.14)";
              e.currentTarget.style.borderColor = "rgba(212,168,67,0.5)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            입장하기
          </button>
        </motion.form>

        <p className="text-xs text-center" style={{ color: "#707090", letterSpacing: "0.15em" }}>
          The room is waiting...
        </p>
      </motion.div>
    </div>
  );
}

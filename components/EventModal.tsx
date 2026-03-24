"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Clock, FileText } from "lucide-react";
import type { CalendarEvent } from "./EscapeApp";

interface Props {
  dateKey: string;
  displayDate: string;
  events: CalendarEvent[];
  onAdd: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  onClose: () => void;
}

export default function EventModal({ dateKey, displayDate, events, onAdd, onDelete, onClose }: Props) {
  const [showForm, setShowForm] = useState(events.length === 0);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [titleError, setTitleError] = useState(false);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError(true);
      setTimeout(() => setTitleError(false), 600);
      return;
    }
    onAdd({ id: crypto.randomUUID(), title: trimmedTitle, time: time.trim(), note: note.trim() });
    setTitle(""); setTime(""); setNote("");
    setShowForm(false);
  }

  const inputStyle = (error = false) => ({
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${error ? "#ff6060" : "#383858"}`,
    color: "#eeeef8" as const,
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    borderRadius: "6px",
    outline: "none",
    transition: "all 0.2s",
  });

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md rounded-lg overflow-hidden"
          style={{
            background: "#181830",
            border: "1px solid #383858",
            boxShadow: "0 0 60px rgba(0,0,0,0.6), 0 0 2px rgba(212,168,67,0.2)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid #383858" }}>
            <div>
              <p className="text-xs tracking-widest uppercase mb-0.5" style={{ color: "#a07835", fontFamily: "var(--font-cinzel)" }}>
                일정 관리
              </p>
              <h2 className="text-base font-semibold tracking-wide" style={{ fontFamily: "var(--font-cinzel)", color: "#d4a843" }}>
                {displayDate}
              </h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded transition-colors" style={{ color: "#707090" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#eeeef8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#707090")}>
              <X size={18} />
            </button>
          </div>

          {/* Events list */}
          <div className="px-5 py-4 space-y-2 max-h-64 overflow-y-auto">
            {events.length === 0 && !showForm && (
              <p className="text-sm text-center py-4" style={{ color: "#707090" }}>등록된 일정이 없습니다</p>
            )}
            {events.map((ev) => (
              <motion.div key={ev.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 p-3 rounded-md group"
                style={{ background: "#1e1e38", border: "1px solid #383858" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#d4a843" }} />
                    <p className="text-sm font-medium truncate" style={{ color: "#eeeef8" }}>{ev.title}</p>
                  </div>
                  {ev.time && (
                    <div className="flex items-center gap-1.5 ml-3.5">
                      <Clock size={11} style={{ color: "#a07835" }} />
                      <span className="text-xs" style={{ color: "#a8a8c8" }}>{ev.time}</span>
                    </div>
                  )}
                  {ev.note && (
                    <div className="flex items-start gap-1.5 ml-3.5 mt-1">
                      <FileText size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#a07835" }} />
                      <span className="text-xs leading-relaxed" style={{ color: "#a8a8c8" }}>{ev.note}</span>
                    </div>
                  )}
                </div>
                <button onClick={() => onDelete(ev.id)}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all"
                  style={{ color: "#707090" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6060")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#707090")}>
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Add form */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleAdd}
                className="overflow-hidden"
                style={{ borderTop: "1px solid #383858" }}
              >
                <div className="px-5 py-4 space-y-3">
                  <p className="text-xs tracking-widest uppercase" style={{ color: "#a07835" }}>새 일정 추가</p>

                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="일정 제목 *" maxLength={50} autoFocus
                    style={inputStyle(titleError)}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#d4a843"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                    onBlur={(e) => { if (!titleError) { e.currentTarget.style.borderColor = "#383858"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; } }}
                  />

                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                    style={{ ...inputStyle(), color: time ? "#eeeef8" : "#707090", colorScheme: "dark" } as React.CSSProperties}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#d4a843"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#383858"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  />

                  <textarea value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="메모 (선택)" maxLength={200} rows={2}
                    style={{ ...inputStyle(), resize: "none" } as React.CSSProperties}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#d4a843"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#383858"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  />

                  <div className="flex gap-2">
                    <button type="submit"
                      className="flex-1 py-2.5 text-sm tracking-wider rounded transition-all"
                      style={{ background: "rgba(212,168,67,0.15)", border: "1px solid rgba(212,168,67,0.5)", color: "#d4a843", fontFamily: "var(--font-cinzel)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,168,67,0.28)"; e.currentTarget.style.boxShadow = "0 0 14px rgba(212,168,67,0.2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(212,168,67,0.15)"; e.currentTarget.style.boxShadow = "none"; }}>
                      등록
                    </button>
                    {events.length > 0 && (
                      <button type="button" onClick={() => setShowForm(false)}
                        className="px-4 py-2.5 text-sm rounded transition-all"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #383858", color: "#a8a8c8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#eeeef8")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#a8a8c8")}>
                        취소
                      </button>
                    )}
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer add button */}
          {!showForm && (
            <div className="px-5 py-3" style={{ borderTop: "1px solid #383858" }}>
              <button onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs tracking-wider rounded transition-all"
                style={{ background: "transparent", border: "1px dashed #383858", color: "#707090" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#a07835"; e.currentTarget.style.color = "#d4a843"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#383858"; e.currentTarget.style.color = "#707090"; }}>
                <Plus size={13} /> 일정 추가
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

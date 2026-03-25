"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Save,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import EventModal from "./EventModal";
import type { CalendarEvent, EventStore, AvailabilityStore } from "./EscapeApp";

interface Props {
  userName: string;
  events: EventStore;
  userAvailability: string[];
  allAvailability: AvailabilityStore;
  saving: boolean;
  onAddEvent: (dateKey: string, event: CalendarEvent) => void;
  onDeleteEvent: (dateKey: string, eventId: string) => void;
  onToggleAvailability: (dateKey: string) => void;
  onSaveAvailability: () => Promise<void>;
  onLogout: () => void;
}

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS_KO = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

function toDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

type Mode = "availability" | "events";

export default function CalendarView({
  userName,
  events,
  userAvailability,
  allAvailability,
  saving,
  onAddEvent,
  onDeleteEvent,
  onToggleAvailability,
  onSaveAvailability,
  onLogout,
}: Props) {
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  // Max = next month
  const maxMonth = todayMonth === 11 ? 0 : todayMonth + 1;
  const maxYear = todayMonth === 11 ? todayYear + 1 : todayYear;

  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);
  const [mode, setMode] = useState<Mode>("availability");
  const [selectedDate, setSelectedDate] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const canGoPrev = !(viewYear === todayYear && viewMonth === todayMonth);
  const canGoNext = !(viewYear === maxYear && viewMonth === maxMonth);

  function goPrev() {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else setViewMonth(viewMonth - 1);
    setSelectedDate(null);
  }

  function goNext() {
    if (!canGoNext) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else setViewMonth(viewMonth + 1);
    setSelectedDate(null);
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function isPast(day: number) {
    if (viewYear < todayYear) return true;
    if (viewYear === todayYear && viewMonth < todayMonth) return true;
    if (viewYear === todayYear && viewMonth === todayMonth && day < todayDate)
      return true;
    return false;
  }

  function isToday(day: number) {
    return (
      viewYear === todayYear && viewMonth === todayMonth && day === todayDate
    );
  }

  function getOtherCount(dateKey: string) {
    return Object.entries(allAvailability).filter(
      ([n, dates]) => n !== userName && dates.includes(dateKey),
    ).length;
  }

  function handleDayClick(day: number) {
    if (!day || isPast(day)) return;
    const dateKey = toDateKey(viewYear, viewMonth, day);
    if (mode === "availability") onToggleAvailability(dateKey);
    else setSelectedDate({ year: viewYear, month: viewMonth, day });
  }

  async function handleSave() {
    await onSaveAvailability();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  }

  const selectedKey = selectedDate
    ? toDateKey(selectedDate.year, selectedDate.month, selectedDate.day)
    : null;
  const selectedEvents = selectedKey ? (events[selectedKey] ?? []) : [];
  const totalEvents = Object.values(events).reduce((s, a) => s + a.length, 0);

  // Count my available days in the currently viewed month
  const myAvailableThisView = userAvailability.filter((d) => {
    const [y, m] = d.split("-").map(Number);
    return y === viewYear && m - 1 === viewMonth;
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0e0e1c" }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(212,168,67,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(212,168,67,0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid #1e1e38" }}
      >
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
            <rect
              x="10"
              y="28"
              width="44"
              height="30"
              rx="4"
              stroke="#d4a843"
              strokeWidth="1.5"
              fill="rgba(212,168,67,0.1)"
            />
            <path
              d="M20 28V20a12 12 0 0 1 24 0v8"
              stroke="#d4a843"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="32" cy="43" r="4" fill="#d4a843" />
          </svg>
          <div>
            <h1
              className="text-sm font-semibold tracking-widest"
              style={{ fontFamily: "var(--font-cinzel)", color: "#d4a843" }}
            >
              ESCAPE ROOM
            </h1>
            <p
              className="text-xs"
              style={{ color: "#707090", letterSpacing: "0.1em" }}
            >
              돈내고갇히는팸
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs" style={{ color: "#707090" }}>
              안녕하세요
            </p>
            <p className="text-sm font-medium" style={{ color: "#eeeef8" }}>
              {userName}
            </p>
          </div>
          {myAvailableThisView.length > 0 && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
              style={{
                background: "rgba(212,168,67,0.15)",
                border: "1px solid rgba(212,168,67,0.4)",
                color: "#d4a843",
              }}
            >
              <CheckCircle size={11} />
              {myAvailableThisView.length}일 가능
            </div>
          )}
          <button
            onClick={onLogout}
            className="p-2 rounded transition-all"
            style={{ color: "#707090" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#eeeef8";
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#707090";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center py-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Mode toggle */}
          <div
            className="flex mb-6 rounded-lg overflow-hidden"
            style={{ border: "1px solid #383858", background: "#111120" }}
          >
            {(["availability", "events"] as Mode[]).map((m, i) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2.5 text-xs tracking-widest transition-all"
                style={{
                  fontFamily: "var(--font-cinzel)",
                  background:
                    mode === m ? "rgba(212,168,67,0.15)" : "transparent",
                  color: mode === m ? "#d4a843" : "#a8a8c8",
                  borderRight: i === 0 ? "1px solid #383858" : "none",
                }}
              >
                {m === "availability" ? "일정 체크" : "일정 관리"}
              </button>
            ))}
          </div>

          {/* Month navigation */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              className="p-1.5 rounded transition-all"
              style={{
                color: canGoPrev ? "#a8a8c8" : "#2a2a40",
                cursor: canGoPrev ? "pointer" : "default",
              }}
              onMouseEnter={(e) => {
                if (canGoPrev) {
                  e.currentTarget.style.color = "#d4a843";
                  e.currentTarget.style.background = "rgba(212,168,67,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = canGoPrev ? "#a8a8c8" : "#2a2a40";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div
                className="h-px w-12"
                style={{
                  background: "linear-gradient(90deg, transparent, #383858)",
                }}
              />
              <div className="text-center">
                <p
                  className="text-xs tracking-[0.4em] mb-0.5"
                  style={{ color: "#707090", fontFamily: "var(--font-cinzel)" }}
                >
                  {viewYear}
                </p>
                <h2
                  className="text-2xl font-semibold tracking-widest"
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    background:
                      "linear-gradient(90deg, #a07835 0%, #d4a843 40%, #f0d070 50%, #d4a843 60%, #a07835 100%)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "shimmer 5s linear infinite",
                  }}
                >
                  {MONTHS_KO[viewMonth].toUpperCase()}
                </h2>
              </div>
              <div
                className="h-px w-12"
                style={{
                  background: "linear-gradient(90deg, #383858, transparent)",
                }}
              />
            </div>

            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="p-1.5 rounded transition-all"
              style={{
                color: canGoNext ? "#a8a8c8" : "#2a2a40",
                cursor: canGoNext ? "pointer" : "default",
              }}
              onMouseEnter={(e) => {
                if (canGoNext) {
                  e.currentTarget.style.color = "#d4a843";
                  e.currentTarget.style.background = "rgba(212,168,67,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = canGoNext ? "#a8a8c8" : "#2a2a40";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((day, i) => (
              <div
                key={day}
                className="text-center py-2 text-xs tracking-widest"
                style={{
                  fontFamily: "var(--font-cinzel)",
                  color: i === 5 ? "#a07835" : i === 6 ? "#803030" : "#707090",
                }}
              >
                {day}
              </div>
            ))}
          </div>
          <div className="h-px mb-4" style={{ background: "#1e1e38" }} />

          {/* Calendar grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${viewYear}-${viewMonth}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-7 gap-1"
            >
              {cells.map((day, idx) => {
                if (!day)
                  return <div key={`e-${idx}`} className="aspect-square" />;

                const past = isPast(day);
                const todayDay = isToday(day);
                const dateKey = toDateKey(viewYear, viewMonth, day);
                const isMeAvail = userAvailability.includes(dateKey);
                const otherCount = getOtherCount(dateKey);
                const hasEvents = (events[dateKey] ?? []).length > 0;
                const isSat = idx % 7 === 5;
                const isSun = idx % 7 === 6;

                let textColor = "#d0d0e8";
                if (past) textColor = "#383858";
                else if (isMeAvail) textColor = "#f0d070";
                else if (isSat) textColor = "#d4a843";
                else if (isSun) textColor = "#c06060";

                const bg =
                  isMeAvail && !past
                    ? "rgba(212,168,67,0.22)"
                    : todayDay
                      ? "rgba(212,168,67,0.09)"
                      : "transparent";
                const borderC =
                  isMeAvail && !past
                    ? "rgba(212,168,67,0.55)"
                    : todayDay
                      ? "rgba(212,168,67,0.3)"
                      : "transparent";

                return (
                  <motion.button
                    key={day}
                    whileHover={!past ? { scale: 1.06 } : {}}
                    whileTap={!past ? { scale: 0.95 } : {}}
                    onClick={() => handleDayClick(day)}
                    disabled={past}
                    className="aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 relative transition-all duration-150"
                    style={{
                      background: bg,
                      border: `1px solid ${borderC}`,
                      cursor: past ? "default" : "pointer",
                      boxShadow:
                        isMeAvail && !past
                          ? "0 0 12px rgba(212,168,67,0.15)"
                          : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!past && bg === "transparent") {
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.06)";
                        e.currentTarget.style.border = "1px solid #505078";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!past && bg === "transparent") {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.border = "1px solid transparent";
                      }
                    }}
                  >
                    <span
                      className="text-sm font-medium leading-none"
                      style={{ color: textColor }}
                    >
                      {day}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {!past && isMeAvail && (
                        <span
                          className="text-[8px]"
                          style={{ color: "#d4a843" }}
                        >
                          ✓
                        </span>
                      )}
                      {!past && otherCount > 0 && (
                        <span
                          className="text-[8px]"
                          style={{ color: "rgba(212,168,67,0.65)" }}
                        >
                          +{otherCount}
                        </span>
                      )}
                      {!past && hasEvents && mode === "events" && (
                        <span
                          className="w-1 h-1 rounded-full"
                          style={{ background: "#d4a843" }}
                        />
                      )}
                    </div>
                    {todayDay && (
                      <span
                        className="absolute top-0.5 right-1 text-[8px]"
                        style={{
                          color: "#a07835",
                          fontFamily: "var(--font-cinzel)",
                        }}
                      >
                        오늘
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Bottom panels */}
          <AnimatePresence mode="wait">
            {mode === "availability" ? (
              <motion.div
                key="avail"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-6 space-y-3"
              >
                <div
                  className="flex items-center justify-center gap-6 text-xs"
                  style={{ color: "#707090" }}
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{
                        background: "rgba(212,168,67,0.22)",
                        border: "1px solid rgba(212,168,67,0.55)",
                      }}
                    />
                    내가 가능한 날
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[10px]"
                      style={{ color: "rgba(212,168,67,0.65)" }}
                    >
                      +N
                    </span>
                    다른 멤버 수
                  </div>
                </div>

                {myAvailableThisView.length > 0 && (
                  <div
                    className="rounded-lg px-4 py-3 space-y-2"
                    style={{
                      background: "#181830",
                      border: "1px solid #383858",
                    }}
                  >
                    <p
                      className="text-xs tracking-widest"
                      style={{
                        color: "#a07835",
                        fontFamily: "var(--font-cinzel)",
                      }}
                    >
                      내 가능 날짜 ({myAvailableThisView.length}일)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {myAvailableThisView.map((dateKey) => {
                        const day = parseInt(dateKey.split("-")[2], 10);
                        return (
                          <button
                            key={dateKey}
                            onClick={() => onToggleAvailability(dateKey)}
                            className="px-2.5 py-1 rounded-full text-xs transition-all"
                            style={{
                              background: "rgba(212,168,67,0.15)",
                              border: "1px solid rgba(212,168,67,0.4)",
                              color: "#d4a843",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(255,80,80,0.12)";
                              e.currentTarget.style.borderColor =
                                "rgba(255,80,80,0.4)";
                              e.currentTarget.style.color = "#ff8888";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "rgba(212,168,67,0.15)";
                              e.currentTarget.style.borderColor =
                                "rgba(212,168,67,0.4)";
                              e.currentTarget.style.color = "#d4a843";
                            }}
                          >
                            {MONTHS_KO[viewMonth]} {day}일 ×
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm tracking-widest transition-all"
                  style={{
                    fontFamily: "var(--font-cinzel)",
                    background: savedFeedback
                      ? "rgba(80,200,100,0.12)"
                      : "rgba(212,168,67,0.12)",
                    border: savedFeedback
                      ? "1px solid rgba(80,200,100,0.45)"
                      : "1px solid rgba(212,168,67,0.45)",
                    color: savedFeedback ? "#60d080" : "#d4a843",
                  }}
                  onMouseEnter={(e) => {
                    if (!savedFeedback) {
                      e.currentTarget.style.background =
                        "rgba(212,168,67,0.22)";
                      e.currentTarget.style.boxShadow =
                        "0 0 20px rgba(212,168,67,0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!savedFeedback) {
                      e.currentTarget.style.background =
                        "rgba(212,168,67,0.12)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  {savedFeedback ? (
                    <>
                      <CheckCircle size={14} /> 저장 완료!
                    </>
                  ) : (
                    <>
                      <Save size={14} /> {saving ? "저장 중..." : "일정 저장"}
                    </>
                  )}
                </button>

                <p className="text-xs text-center" style={{ color: "#707090" }}>
                  날짜를 클릭해서 가능한 날을 선택 후 저장하세요
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="ev"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-6 space-y-3"
              >
                <div
                  className="flex items-center justify-center gap-6 text-xs"
                  style={{ color: "#707090" }}
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#d4a843" }}
                    />
                    일정 있음
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{
                        background: "rgba(212,168,67,0.09)",
                        border: "1px solid rgba(212,168,67,0.3)",
                      }}
                    />
                    오늘
                  </div>
                </div>

                {totalEvents > 0 && (
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{ border: "1px solid #383858" }}
                  >
                    <div
                      className="px-4 py-2.5"
                      style={{
                        background: "#181830",
                        borderBottom: "1px solid #383858",
                      }}
                    >
                      <p
                        className="text-xs tracking-widest"
                        style={{
                          color: "#a07835",
                          fontFamily: "var(--font-cinzel)",
                        }}
                      >
                        예정 일정
                      </p>
                    </div>
                    <div
                      className="divide-y"
                      style={{ borderColor: "#1e1e38" }}
                    >
                      {Object.entries(events)
                        .filter(
                          ([key]) =>
                            new Date(key) >=
                            new Date(new Date().setHours(0, 0, 0, 0)),
                        )
                        .sort(([a], [b]) => a.localeCompare(b))
                        .slice(0, 4)
                        .map(([dateKey, dayEvents]) => {
                          const [, m, d] = dateKey.split("-").map(Number);
                          return (
                            <div
                              key={dateKey}
                              className="px-4 py-2.5 flex items-center gap-3 cursor-pointer"
                              style={{ background: "#111120" }}
                              onClick={() => {
                                const [y2, m2, d2] = dateKey
                                  .split("-")
                                  .map(Number);
                                setSelectedDate({
                                  year: y2,
                                  month: m2 - 1,
                                  day: d2,
                                });
                              }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLDivElement
                                ).style.background = "#181830";
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLDivElement
                                ).style.background = "#111120";
                              }}
                            >
                              <div
                                className="text-center px-2 py-0.5 rounded flex-shrink-0"
                                style={{
                                  background: "rgba(212,168,67,0.12)",
                                  minWidth: 40,
                                }}
                              >
                                <p
                                  className="text-xs font-semibold"
                                  style={{
                                    color: "#d4a843",
                                    fontFamily: "var(--font-cinzel)",
                                  }}
                                >
                                  {String(d).padStart(2, "0")}
                                </p>
                                <p
                                  className="text-[9px]"
                                  style={{ color: "#a07835" }}
                                >
                                  {MONTHS_KO[m - 1]}
                                </p>
                              </div>
                              <div className="flex-1 min-w-0">
                                {dayEvents.slice(0, 2).map((ev) => (
                                  <div
                                    key={ev.id}
                                    className="flex items-center gap-2"
                                  >
                                    <span
                                      className="w-1 h-1 rounded-full flex-shrink-0"
                                      style={{ background: "#d4a843" }}
                                    />
                                    <span
                                      className="text-xs truncate"
                                      style={{ color: "#eeeef8" }}
                                    >
                                      {ev.title}
                                    </span>
                                    {ev.time && (
                                      <span
                                        className="text-[10px] flex-shrink-0"
                                        style={{ color: "#707090" }}
                                      >
                                        {ev.time}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                <p className="text-xs text-center" style={{ color: "#707090" }}>
                  날짜를 클릭해서 일정을 추가하세요
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <AnimatePresence>
        {selectedDate && mode === "events" && (
          <EventModal
            key={selectedKey}
            dateKey={selectedKey!}
            displayDate={`${selectedDate.year}년 ${MONTHS_KO[selectedDate.month]} ${selectedDate.day}일`}
            events={selectedEvents}
            onAdd={(event) => onAddEvent(selectedKey!, event)}
            onDelete={(eventId) => onDeleteEvent(selectedKey!, eventId)}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  RefreshCw,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { AvailabilityStore } from "./EscapeApp";

interface Props {
  allAvailability: AvailabilityStore;
  onRefresh: () => Promise<AvailabilityStore>;
  onLogout: () => void;
}

const WEEKDAYS_SHORT = ["월", "화", "수", "목", "금", "토", "일"];
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

export default function AdminView({
  allAvailability,
  onRefresh,
  onLogout,
}: Props) {
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  const maxMonth = todayMonth === 11 ? 0 : todayMonth + 1;
  const maxYear = todayMonth === 11 ? todayYear + 1 : todayYear;

  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AvailabilityStore>(allAvailability);

  useEffect(() => {
    setData(allAvailability);
  }, [allAvailability]);

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

  async function handleRefresh() {
    setRefreshing(true);
    const updated = await onRefresh();
    setData(updated);
    setRefreshing(false);
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

  const getAvailableUsers = (dateKey: string) =>
    Object.entries(data)
      .filter(([, dates]) => dates.includes(dateKey))
      .map(([n]) => n);
  const totalUsers = Object.keys(data).length;

  const upcomingDates = Array.from({ length: daysInMonth }, (_, i) => i + 1)
    .filter((d) => !isPast(d))
    .map((d) => ({
      day: d,
      key: toDateKey(viewYear, viewMonth, d),
      users: getAvailableUsers(toDateKey(viewYear, viewMonth, d)),
    }))
    .filter((x) => x.users.length > 0)
    .sort((a, b) => b.users.length - a.users.length);

  const selectedUsers = selectedDate ? getAvailableUsers(selectedDate) : [];
  const selectedDay = selectedDate
    ? parseInt(selectedDate.split("-")[2], 10)
    : null;

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
              ADMIN
            </h1>
            <p
              className="text-xs"
              style={{ color: "#707090", letterSpacing: "0.1em" }}
            >
              일정 현황
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {totalUsers > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
              style={{
                background: "rgba(212,168,67,0.14)",
                border: "1px solid rgba(212,168,67,0.4)",
                color: "#d4a843",
              }}
            >
              <Users size={12} />
              {totalUsers}명 참여
            </div>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded transition-all"
            style={{ color: "#a8a8c8" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#d4a843";
              e.currentTarget.style.background = "rgba(212,168,67,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#a8a8c8";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
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
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
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
                className="h-px w-10"
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
                  className="text-xl font-semibold tracking-widest"
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
                  {MONTHS_KO[viewMonth]}
                </h2>
              </div>
              <div
                className="h-px w-10"
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

          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS_SHORT.map((d, i) => (
              <div
                key={d}
                className="text-center py-2 text-xs tracking-widest"
                style={{
                  fontFamily: "var(--font-cinzel)",
                  color: i >= 5 ? "#a07835" : "#707090",
                }}
              >
                {d}
              </div>
            ))}
          </div>
          <div className="h-px mb-3" style={{ background: "#1e1e38" }} />

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
                const isToday =
                  viewYear === todayYear &&
                  viewMonth === todayMonth &&
                  day === todayDate;
                const dateKey = toDateKey(viewYear, viewMonth, day);
                const users = getAvailableUsers(dateKey);
                const count = users.length;
                const isSelected = selectedDate === dateKey;
                const isSat = idx % 7 === 5;
                const isSun = idx % 7 === 6;
                const ratio = totalUsers > 0 ? count / totalUsers : 0;
                const bgAlpha = past ? 0 : Math.min(0.1 + ratio * 0.4, 0.5);

                return (
                  <motion.button
                    key={day}
                    whileHover={!past && count > 0 ? { scale: 1.06 } : {}}
                    whileTap={!past && count > 0 ? { scale: 0.95 } : {}}
                    onClick={() => {
                      if (!past && count > 0)
                        setSelectedDate(isSelected ? null : dateKey);
                    }}
                    disabled={past || count === 0}
                    className="aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200"
                    style={{
                      background: isSelected
                        ? "rgba(212,168,67,0.3)"
                        : count > 0
                          ? `rgba(212,168,67,${bgAlpha})`
                          : "transparent",
                      border: isSelected
                        ? "1px solid rgba(212,168,67,0.65)"
                        : isToday
                          ? "1px solid rgba(212,168,67,0.3)"
                          : "1px solid transparent",
                      cursor: !past && count > 0 ? "pointer" : "default",
                      boxShadow: isSelected
                        ? "0 0 16px rgba(212,168,67,0.2)"
                        : "none",
                    }}
                  >
                    <span
                      className="text-xs font-medium leading-none"
                      style={{
                        color: past
                          ? "#383858"
                          : isSelected
                            ? "#f0d070"
                            : count > 0
                              ? "#d4a843"
                              : isSat
                                ? "#a07835"
                                : isSun
                                  ? "#c06060"
                                  : "#c0c0d8",
                      }}
                    >
                      {day}
                    </span>
                    {!past && count > 0 && (
                      <span
                        className="text-[9px] font-semibold"
                        style={{
                          color: isSelected
                            ? "#f0d070"
                            : "rgba(212,168,67,0.85)",
                          fontFamily: "var(--font-cinzel)",
                        }}
                      >
                        {count}명
                      </span>
                    )}
                    {isToday && (
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

          <div className="flex items-center justify-center gap-1.5 mt-4">
            <span className="text-xs" style={{ color: "#707090" }}>
              적음
            </span>
            {[0.1, 0.2, 0.3, 0.4, 0.5].map((a, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-sm"
                style={{ background: `rgba(212,168,67,${a})` }}
              />
            ))}
            <span className="text-xs" style={{ color: "#707090" }}>
              많음
            </span>
          </div>
        </motion.div>

        {/* Right panel */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full lg:w-72 space-y-4"
        >
          <AnimatePresence>
            {selectedDate && selectedUsers.length > 0 && (
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-lg overflow-hidden"
                style={{
                  border: "1px solid rgba(212,168,67,0.45)",
                  background: "#181830",
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid #383858" }}
                >
                  <div>
                    <p
                      className="text-xs tracking-widest"
                      style={{
                        color: "#a07835",
                        fontFamily: "var(--font-cinzel)",
                      }}
                    >
                      선택된 날짜
                    </p>
                    <p
                      className="text-sm font-semibold mt-0.5"
                      style={{
                        color: "#d4a843",
                        fontFamily: "var(--font-cinzel)",
                      }}
                    >
                      {viewYear}년 {MONTHS_KO[viewMonth]} {selectedDay}일
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1"
                    style={{ color: "#707090" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#eeeef8")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#707090")
                    }
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <p className="text-xs" style={{ color: "#707090" }}>
                    가능한 멤버 ({selectedUsers.length}명)
                  </p>
                  {selectedUsers.map((name) => (
                    <div
                      key={name}
                      className="flex items-center gap-2 py-1.5 px-3 rounded-md"
                      style={{
                        background: "rgba(212,168,67,0.08)",
                        border: "1px solid rgba(212,168,67,0.2)",
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "#d4a843" }}
                      />
                      <span className="text-sm" style={{ color: "#eeeef8" }}>
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="rounded-lg overflow-hidden"
            style={{ border: "1px solid #383858", background: "#181830" }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid #383858" }}
            >
              <p
                className="text-xs tracking-widest uppercase"
                style={{ color: "#a07835", fontFamily: "var(--font-cinzel)" }}
              >
                {MONTHS_KO[viewMonth]} 가능 인원 순위
              </p>
            </div>
            {upcomingDates.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm" style={{ color: "#707090" }}>
                  아직 가능한 날짜를 입력한 멤버가 없어요
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#1e1e38" }}>
                {upcomingDates.slice(0, 8).map(({ day, key, users }, rank) => (
                  <button
                    key={key}
                    onClick={() =>
                      setSelectedDate(selectedDate === key ? null : key)
                    }
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                    style={{
                      background:
                        selectedDate === key
                          ? "rgba(212,168,67,0.1)"
                          : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedDate !== key)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(255,255,255,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (selectedDate !== key)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "transparent";
                    }}
                  >
                    <span
                      className="text-xs w-4 text-center flex-shrink-0"
                      style={{ color: rank < 3 ? "#d4a843" : "#707090" }}
                    >
                      {rank + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ color: "#d0d0e8" }}>
                        {MONTHS_KO[viewMonth]} {day}일
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {users.slice(0, 4).map((name) => (
                          <span
                            key={name}
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              background: "rgba(212,168,67,0.12)",
                              color: "#a07835",
                            }}
                          >
                            {name}
                          </span>
                        ))}
                        {users.length > 4 && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: "#1e1e38", color: "#707090" }}
                          >
                            +{users.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span
                        className="text-sm font-semibold"
                        style={{
                          color: "#d4a843",
                          fontFamily: "var(--font-cinzel)",
                        }}
                      >
                        {users.length}
                      </span>
                      <span className="text-xs" style={{ color: "#707090" }}>
                        명
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {totalUsers > 0 && (
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid #383858", background: "#181830" }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid #383858" }}
              >
                <p
                  className="text-xs tracking-widest uppercase"
                  style={{ color: "#a07835", fontFamily: "var(--font-cinzel)" }}
                >
                  참여 멤버
                </p>
              </div>
              <div className="px-4 py-3 flex flex-wrap gap-2">
                {Object.entries(data).map(([name, dates]) => (
                  <div
                    key={name}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(212,168,67,0.1)",
                      border: "1px solid rgba(212,168,67,0.25)",
                    }}
                  >
                    <span className="text-xs" style={{ color: "#d4a843" }}>
                      {name}
                    </span>
                    <span className="text-[10px]" style={{ color: "#a07835" }}>
                      {dates.length}일
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

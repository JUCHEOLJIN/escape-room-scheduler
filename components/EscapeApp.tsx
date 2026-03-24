"use client";

import { useState, useEffect, useCallback } from "react";
import NameEntry from "./NameEntry";
import CalendarView from "./CalendarView";
import AdminView from "./AdminView";

export type CalendarEvent = {
  id: string;
  title: string;
  time: string;
  note: string;
};

export type EventStore = Record<string, CalendarEvent[]>;
export type AvailabilityStore = Record<string, string[]>; // userName → dateKeys[]

const STORAGE_KEY_USER = "escape-club-user";
const STORAGE_KEY_EVENTS = "escape-club-events";
const ADMIN_NAME = "admin";

export default function EscapeApp() {
  const [userName, setUserName] = useState<string | null>(null);
  const [events, setEvents] = useState<EventStore>({});
  const [userAvailability, setUserAvailability] = useState<string[]>([]);
  const [allAvailability, setAllAvailability] = useState<AvailabilityStore>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin = userName?.toLowerCase() === ADMIN_NAME;

  const fetchAllAvailability = useCallback(async () => {
    try {
      const res = await fetch("/api/availability");
      if (res.ok) {
        const data: AvailabilityStore = await res.json();
        setAllAvailability(data);
        return data;
      }
    } catch {
      // network error — ignore
    }
    return {};
  }, []);

  useEffect(() => {
    const storedName = localStorage.getItem(STORAGE_KEY_USER);
    const storedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (storedName) setUserName(storedName);
    if (storedEvents) {
      try {
        setEvents(JSON.parse(storedEvents));
      } catch {
        // ignore
      }
    }
    setLoaded(true);
  }, []);

  // Fetch all availability when user is set
  useEffect(() => {
    if (!userName) return;
    fetchAllAvailability().then((data) => {
      const mine = data[userName] ?? [];
      setUserAvailability(mine);
    });
  }, [userName, fetchAllAvailability]);

  async function handleEnter(name: string) {
    localStorage.setItem(STORAGE_KEY_USER, name);
    setUserName(name);
  }

  function handleAddEvent(dateKey: string, event: CalendarEvent) {
    setEvents((prev) => {
      const updated = {
        ...prev,
        [dateKey]: [...(prev[dateKey] ?? []), event],
      };
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
      return updated;
    });
  }

  function handleDeleteEvent(dateKey: string, eventId: string) {
    setEvents((prev) => {
      const updated = {
        ...prev,
        [dateKey]: (prev[dateKey] ?? []).filter((e) => e.id !== eventId),
      };
      if (updated[dateKey].length === 0) delete updated[dateKey];
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated));
      return updated;
    });
  }

  function handleToggleAvailability(dateKey: string) {
    setUserAvailability((prev) => {
      if (prev.includes(dateKey)) {
        return prev.filter((d) => d !== dateKey);
      }
      return [...prev, dateKey].sort();
    });
  }

  async function handleSaveAvailability() {
    if (!userName) return;
    setSaving(true);
    try {
      await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, dates: userAvailability }),
      });
      await fetchAllAvailability();
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY_USER);
    setUserName(null);
    setUserAvailability([]);
    setAllAvailability({});
  }

  if (!loaded) return null;

  if (!userName) {
    return <NameEntry onEnter={handleEnter} />;
  }

  if (isAdmin) {
    return (
      <AdminView
        allAvailability={allAvailability}
        onRefresh={fetchAllAvailability}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <CalendarView
      userName={userName}
      events={events}
      userAvailability={userAvailability}
      allAvailability={allAvailability}
      saving={saving}
      onAddEvent={handleAddEvent}
      onDeleteEvent={handleDeleteEvent}
      onToggleAvailability={handleToggleAvailability}
      onSaveAvailability={handleSaveAvailability}
      onLogout={handleLogout}
    />
  );
}

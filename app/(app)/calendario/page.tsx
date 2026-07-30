"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  getDay,
} from "date-fns";
import { it } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalIcon, MapPin, Clock, Eye, ArrowRight } from "lucide-react";

export default function CalendarioPage() {
  const today = new Date();
  const initialMonth = today.getDate() > 25 ? new Date(today.getFullYear(), today.getMonth() + 1, 1) : today;
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "list">("month");

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  useEffect(() => {
    setLoading(true);
    const start = format(calendarStart, "yyyy-MM-dd");
    const end = format(calendarEnd, "yyyy-MM-dd");
    const p = new URLSearchParams({ dateFrom: start, dateTo: end, limit: "200" });
    fetch(`/api/events?${p}`)
      .then((r) => r.json())
      .then((data) => setEvents(data.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [currentMonth]);

  const days = useMemo(() => {
    const d: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      d.push(day);
      day = addDays(day, 1);
    }
    return d;
  }, [currentMonth]);

  const dayEvents = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const e of events) {
      const key = format(new Date(e.date), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return map;
  }, [events]);

  const selectedEvents = dayEvents.get(format(selectedDate, "yyyy-MM-dd")) || [];

  return (
    <div className="page-container max-w-5xl mx-auto animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalIcon size={22} className="text-[var(--accent)]" /> Calendario Eventi
        </h1>
        <div className="flex gap-1 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-1">
          <button onClick={() => setViewMode("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "month" ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--accent)]"}`}>
            Mese
          </button>
          <button onClick={() => setViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "list" ? "bg-[var(--accent)] text-white" : "text-[var(--text-secondary)] hover:text-[var(--accent)]"}`}>
            Lista
          </button>
        </div>
      </div>

      {viewMode === "month" ? (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-[var(--accent-subtle)] transition-all">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: it })}
            </h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-xl hover:bg-[var(--accent-subtle)] transition-all">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-[var(--text-muted)] border-b border-[var(--card-border)]">
            {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((d) => (
              <div key={d} className="py-2.5">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayEvts = dayEvents.get(key) || [];
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[80px] p-1.5 border-b border-r border-[var(--card-border)] text-left transition-all hover:bg-[var(--accent-subtle)] relative
                    ${!isCurrentMonth ? "opacity-30" : ""}
                    ${isSelected ? "bg-[var(--accent-subtle)] ring-2 ring-inset ring-[var(--accent)]" : ""}`}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs
                    ${isTodayDate ? "bg-[var(--accent)] text-white font-bold" : "font-medium"}`}>
                    {format(day, "d")}
                  </span>
                  {dayEvts.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 mt-1">
                      {dayEvts.slice(0, 4).map((e: any) => (
                        <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.category_color || "var(--accent)" }} />
                      ))}
                      {dayEvts.length > 4 && (
                        <span className="text-[9px] text-[var(--text-muted)] font-medium">+{dayEvts.length - 4}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-muted)]">
              <CalIcon size={40} className="mx-auto mb-3 opacity-30" />
              <p>Nessun evento in questo mese</p>
            </div>
          ) : (
            events.map((e: any) => (
              <Link key={e.id} href={`/events/${e.slug || e.id}`}
                className="glass-card rounded-xl p-4 flex items-start gap-3 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-indigo-500 flex flex-col items-center justify-center text-white text-center leading-tight">
                  <span className="text-lg font-bold">{format(new Date(e.date), "d")}</span>
                  <span className="text-[9px] uppercase opacity-80">{format(new Date(e.date), "MMM", { locale: it })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors">{e.title}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-[var(--text-muted)]">
                    {e.time && <span className="flex items-center gap-1"><Clock size={11} />{e.time}</span>}
                    {e.city && <span className="flex items-center gap-1"><MapPin size={11} />{e.city}</span>}
                    {(e.view_count ?? 0) > 0 && <span className="flex items-center gap-1"><Eye size={11} />{e.view_count}</span>}
                  </div>
                </div>
                <ArrowRight size={16} className="flex-shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
              </Link>
            ))
          )}
        </div>
      )}

      <div className="divider" />

      <div>
        <h3 className="font-semibold mb-3">
          Eventi del {format(selectedDate, "dd MMMM yyyy", { locale: it })}
        </h3>
        {selectedEvents.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Nessun evento in questa data</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedEvents.map((e: any) => (
              <Link key={e.id} href={`/events/${e.slug || e.id}`}
                className="glass-card rounded-xl p-4 flex items-start gap-3 hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300 group">
                {e.image_url && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={e.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {e.category_color && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ backgroundColor: e.category_color + "20", color: e.category_color }}>
                      {e.category_name}
                    </span>
                  )}
                  <h4 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-[var(--accent)] transition-colors mt-1">{e.title}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {e.time && <span className="flex items-center gap-1"><Clock size={11} />{e.time} · </span>}
                    {e.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

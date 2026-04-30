"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function EventsHubPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          const sorted = data.events.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setEvents(sorted);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const groupedEvents = events.reduce((acc: Record<string, any[]>, event) => {
    const d = new Date(event.date);
    const dateKey = format(d, "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  return (
    <div className="min-h-screen flex flex-col font-sans bg-white text-zinc-900 selection:bg-red-500/30">
      
      <div className="relative z-50 w-full border-b border-zinc-200">
        <Header />
      </div>

      <main className="flex-1 w-full relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-4">
            Events
          </h1>
          <p className="text-zinc-500 text-lg">
            Discover upcoming meetups, workshops, and networking sessions.
          </p>
        </div>

        {loading ? (
          <div className="text-zinc-400 animate-pulse">Loading timeline...</div>
        ) : events.length === 0 ? (
          <div className="text-zinc-500 border border-zinc-200 rounded-xl p-8 bg-zinc-50">
            No events scheduled right now.
          </div>
        ) : (
          <div className="relative border-l-2 border-zinc-200 ml-3 md:ml-4 space-y-12 pb-12 pt-4 mt-6">
            {Object.entries(groupedEvents).map(([dateKey, eventsList]) => {
              const dateObj = new Date(dateKey + "T00:00:00");
              const today = new Date();
              today.setHours(0,0,0,0);
              const isTomorrow = isSameDay(dateObj, new Date(today.getTime() + 86400000));
              
              let displayDate = format(dateObj, "d MMM");
              if (isTomorrow) displayDate = "Tomorrow";
              const displayDay = format(dateObj, "EEEE");

              return (
                <div key={dateKey} className="relative pl-8 md:pl-12">
                  {/* Timeline dot */}
                  <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                  
                  {/* Date Header */}
                  <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-baseline gap-2">
                    {displayDate} <span className="text-zinc-500 font-medium text-lg">{displayDay}</span>
                  </h3>

                  {/* Events for this date */}
                  <div className="space-y-6">
                    {eventsList.map(event => (
                      <Link href={`/event/${event.slug}`} key={event._id} className="block group">
                        <div className="bg-white border border-zinc-200 rounded-2xl p-4 md:p-6 hover:shadow-md hover:border-red-200 transition-all flex flex-col md:flex-row gap-6">
                          
                          <div className="flex-1 space-y-3">
                            <div className="text-zinc-500 font-medium">
                              {event.startTime || "All Day"}
                            </div>
                            <h4 className="text-2xl font-bold tracking-tight text-zinc-900 group-hover:text-red-500 transition-colors">
                              {event.name}
                            </h4>
                            <div className="text-zinc-500 flex items-center gap-2">
                              {event.location}
                            </div>
                          </div>

                          {event.photoUrl && (
                            <div className="shrink-0 w-full md:w-48 h-32 rounded-xl overflow-hidden border border-zinc-100">
                              <img src={event.photoUrl} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}

                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <div className="relative z-10 w-full border-t border-zinc-200">
        <Footer />
      </div>
    </div>
  );
}

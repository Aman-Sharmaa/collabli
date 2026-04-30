"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, MapPin, CheckCircle2, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EventRegistrationModal } from "@/components/event-registration-modal";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RegistrationForm } from "@/components/registration-form";
import { DynamicBackground } from "@/components/dynamic-background";

export default function PublicEventPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [event, setEvent] = useState<any>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/events/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.event) setEvent(data.event);
      });
  }, [slug, fetchTrigger]);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#322340] flex items-center justify-center text-purple-200">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading details...
        </div>
      </div>
    );
  }

  // Google Form-like layout for standalone forms
  if (event.isPublicForm) {
    return (
      <div className="min-h-screen flex flex-col font-sans selection:bg-purple-500/30 relative bg-[#f0ebf8]">
        <div className="absolute top-0 left-0 w-full h-2 transition-all duration-500" style={{ backgroundColor: event.themeColor || '#673ab7' }} />
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-8 md:py-12 w-full z-10 relative">
          <div className="space-y-4">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
               <div className="h-2 w-full" style={{ backgroundColor: event.themeColor || '#673ab7' }} />
               <div className="p-6 md:p-8 space-y-4">
                 <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">{event.name}</h1>
                 <p className="text-zinc-600 text-lg leading-relaxed whitespace-pre-wrap">{event.description}</p>
                 {event.aboutEvent && (
                   <div className="pt-4 border-t border-zinc-100 text-zinc-500 text-sm italic">
                     {event.aboutEvent}
                   </div>
                 )}
               </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 md:p-8">
              <RegistrationForm 
                eventSlug={event.slug} 
                ticketType={event.ticketTypes?.[0] || { name: "General", price: 0, requiresApproval: false }} 
                isEmbedded={true}
                onSuccess={() => setFetchTrigger(prev => prev + 1)}
              />
            </div>
            
            <div className="text-center text-xs text-zinc-400 py-6">
              Built with Kalp Platform • Data Collection Form
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Normal Event layout
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-white/30 relative" style={{ color: event.textColor || '#ffffff' }}>
      <DynamicBackground style={event.backgroundStyle || 'gradient'} themeColor={event.themeColor || '#322340'} />
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 md:py-20 w-full space-y-12 z-10 relative">
        
        {/* Navigation & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10">
            <span className="bg-orange-500 w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            <span className="tracking-wide uppercase opacity-90">{event.location || event.address || "TBA"}</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {event.photoUrl && (
            <img src={event.photoUrl} alt={event.name} className="w-full md:w-80 h-80 object-cover rounded-2xl shadow-lg border border-white/20" />
          )}
          <div className="space-y-6 flex-1">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              {event.name}
            </h1>
            <p className="text-xl opacity-90 leading-relaxed max-w-3xl">
              {event.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 text-sm md:text-base text-purple-200">
              <div className="flex items-center gap-3 bg-white/10 mix-blend-luminosity p-4 rounded-xl shadow-sm backdrop-blur-sm">
                <div className="bg-white/20 mix-blend-luminosity p-2 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold">
                    {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                  </div>
                  {(event.startTime || event.endTime) && (
                    <div className="opacity-80 mt-0.5">
                      {event.startTime} {event.endTime ? `- ${event.endTime}` : ""}
                    </div>
                  )}
                </div>
              </div>

              {event.location && (
                <div className="flex items-center gap-3 bg-white/10 mix-blend-luminosity p-4 rounded-xl shadow-sm backdrop-blur-sm">
                  <div className="bg-white/20 mix-blend-luminosity p-2 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{event.location}</div>
                    <div className="opacity-80 mt-0.5 max-w-[200px] truncate" title={event.address}>{event.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_350px] gap-12 items-start pt-8 border-t border-white/10">
          
          {/* Main Content */}
          <div className="space-y-12">
            {event.aboutEvent && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">About Event</h2>
                <div className="opacity-90 leading-relaxed space-y-4 whitespace-pre-wrap">
                  {event.aboutEvent}
                </div>
              </section>
            )}

            {/* Location Section */}
            {(event.location || event.address) && (
              <section className="space-y-4">
                <h3 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                  <MapPin className="w-6 h-6" /> {event.eventType === "Online" ? "Meeting Platform" : "Location"}
                </h3>
                <div className="bg-white/5 mix-blend-luminosity rounded-xl p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="font-medium text-lg mb-2">{event.location}</p>
                  <p className="opacity-80 leading-relaxed max-w-md mb-6">{event.address}</p>
                  
                  {event.eventType !== "Online" && (event.googleMapUrl || event.address) && (
                     <a href={event.googleMapUrl || `https://maps.google.com/?q=${encodeURIComponent(event.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline underline-offset-4 opacity-90 hover:opacity-100 transition-opacity font-medium">
                        Open in Google Maps <MapPin className="w-4 h-4 ml-1" />
                     </a>
                  )}
                  {event.eventType === "Online" && event.address && event.address.startsWith("http") && (
                     <a href={event.address} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 underline underline-offset-4 opacity-90 hover:opacity-100 transition-opacity font-medium">
                        Join Meeting Link
                     </a>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar / Tickets */}
          <div className="space-y-6 md:sticky md:top-24">
            <h3 className="text-xl font-bold tracking-tight">Registration</h3>
            
            {event.ticketTypes?.map((ticket: any, index: number) => (
              <div key={index} className="bg-white/10 mix-blend-luminosity p-5 rounded-2xl relative overflow-hidden group transition-all duration-300">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="15"></line></svg>
                </div>
                
                <h4 className="text-lg font-bold tracking-tight mb-2">{ticket.name}</h4>
                <div className="text-2xl font-black mb-2">
                  {ticket.price === 0 ? "Free" : `$${ticket.price}`}
                </div>
                {ticket.description && (
                  <p className="opacity-80 text-sm leading-relaxed mb-6">
                    {ticket.description}
                  </p>
                )}
                
                {ticket.requiresApproval ? (
                   <div className="flex items-start gap-2 text-xs opacity-75 mb-6 bg-white/5 p-3 rounded-lg">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>This ticket requires organizer approval. You will be notified via email upon approval.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs opacity-75 mb-6">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto-approved
                  </div>
                )}

                <EventRegistrationModal 
                  eventSlug={event.slug} 
                  ticketType={ticket} 
                  onSuccess={() => setFetchTrigger(prev => prev + 1)}
                />
              </div>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

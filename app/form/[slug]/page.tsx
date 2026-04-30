"use client";

import { useEffect, useState, use } from "react";
import { PublicForm } from "@/components/public-form";

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/forms/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.form) setForm(data.form);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#322340] flex items-center justify-center text-purple-200">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Loading form...
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-zinc-900">Form Not Found</h1>
            <p className="text-zinc-500">The form you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-purple-500/30 relative bg-[#f0ebf8]">
      <div className="absolute top-0 left-0 w-full h-2 transition-all duration-500" style={{ backgroundColor: form.themeColor || '#673ab7' }} />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 md:py-12 w-full z-10 relative">
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
             <div className="h-2 w-full" style={{ backgroundColor: form.themeColor || '#673ab7' }} />
             <div className="p-6 md:p-8 space-y-4">
               <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">{form.name}</h1>
               <p className="text-zinc-600 text-lg leading-relaxed whitespace-pre-wrap">{form.description}</p>
               {form.aboutForm && (
                 <div className="pt-4 border-t border-zinc-100 text-zinc-500 text-sm italic">
                   {form.aboutForm}
                 </div>
               )}
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 md:p-8">
            <PublicForm formSlug={form.slug} />
          </div>
          
          <div className="text-center text-xs text-zinc-400 py-6">
            Built with Kalp Platform • Data Collection Form
          </div>
        </div>
      </main>
    </div>
  );
}

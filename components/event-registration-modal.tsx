"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RegistrationForm } from "./registration-form";

type TicketType = {
  name: string;
  price: number;
  requiresApproval: boolean;
  description?: string;
};

export function EventRegistrationModal({ eventSlug, ticketType, onSuccess }: { eventSlug: string, ticketType: TicketType, onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full font-bold h-11 shadow-sm">Register Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Register for {ticketType.name}</DialogTitle>
          <DialogDescription>
            {ticketType.requiresApproval
              ? "This ticket requires approval. Please provide your details."
              : "Please fill out your details to complete registration."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <RegistrationForm 
            eventSlug={eventSlug} 
            ticketType={ticketType} 
            onSuccess={() => {
              setOpen(false);
              onSuccess();
            }} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

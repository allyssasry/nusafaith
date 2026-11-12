"use client";

import { useState } from "react";
import { FeedbackForm } from "@/components/FeedbackForm";
import { GreetingCardView } from "@/components/GreetingCardView";
import type { SubmittedParticipant } from "@/types/feedback";

export default function HomePage() {
  const [submittedParticipant, setSubmittedParticipant] =
    useState<SubmittedParticipant | null>(null);

  function handleSuccess(participant: SubmittedParticipant) {
    setSubmittedParticipant(participant);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleCreateAnother() {
    setSubmittedParticipant(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        {submittedParticipant ? (
          <GreetingCardView
            key={submittedParticipant.fullName}
            participant={submittedParticipant}
            onCreateAnother={handleCreateAnother}
          />
        ) : (
          <FeedbackForm onSuccess={handleSuccess} />
        )}

        <footer className="mt-10 text-center text-xs text-[#6B6E66]">
          <p>NUSAFAITH – Edisi Kasmaran • Kajian Insan Entreplanters Rutinan</p>
        </footer>
      </div>
    </main>
  );
}

"use client";

import { Card } from "@/components/ui/card";

const faqs = [
  {
    q: "Who is Ziki?",
    a: "Ziki is your visual Chief Strategic Officer, trained on artist management. Think manager + strategist on screen: market demand, city proof, rooms, releases, money — grounded in Artist Brain and your fan data. Not a chatbot that says “post more.”",
  },
  {
    q: "What is Artist Brain?",
    a: "Permanent, editable memory of style, voice, audience, goals, strengths and weaknesses. Ziki uses it on every recommendation.",
  },
  {
    q: "Where do I start?",
    a: "Share Fan Gate → capture city + would-attend → open Regional demand → test a small room. Demand first, then spend.",
  },
];

const steps = [
  { step: "1", title: "Fan Gate", body: "Capture email, city, intent on one shareable page." },
  { step: "2", title: "Regional demand", body: "See which cities would actually show up." },
  { step: "3", title: "Artist Brain", body: "Lock brand voice so Ziki stays on-strategy." },
  { step: "4", title: "Room + tips", body: "Monetize verified demand. Rank the next move." },
];

export function HelpPanel() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div>
        <p className="font-data text-[10px] uppercase tracking-[0.16em] text-omniv-gold">
          Help
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          How Omniv works
        </h1>
        <p className="mt-1 text-sm text-omniv-text-secondary">
          Verify demand. Open the room. Get paid. Ask Ziki for the next move.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {steps.map((s) => (
          <Card key={s.step} className="p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-omniv-gold">
              Step {s.step}
            </p>
            <p className="mt-1 text-sm font-semibold">{s.title}</p>
            <p className="mt-1 text-[12px] text-omniv-text-muted">{s.body}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-2">
        {faqs.map((f) => (
          <Card key={f.q} className="p-3.5">
            <p className="text-sm font-semibold">{f.q}</p>
            <p className="mt-1 text-[13px] text-omniv-text-secondary">{f.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

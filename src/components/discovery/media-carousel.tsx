"use client";

import { useState } from "react";

export function MediaCarousel({
  images,
  className = "",
}: {
  images: string[];
  className?: string;
}) {
  const list = images.filter(Boolean);
  const [index, setIndex] = useState(0);

  if (list.length === 0) return null;

  const safeIndex = Math.min(index, list.length - 1);
  const go = (dir: -1 | 1) => {
    setIndex((i) => {
      const next = i + dir;
      if (next < 0) return list.length - 1;
      if (next >= list.length) return 0;
      return next;
    });
  };

  return (
    <div className={`relative overflow-hidden bg-zinc-900 ${className}`}>
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${safeIndex * 100}%)` }}
      >
        {list.map((src, i) => (
          <div key={`${src}-${i}`} className="relative min-w-full shrink-0">
            <div className="aspect-[16/10] w-full sm:aspect-[2/1]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          </div>
        ))}
      </div>

      {list.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
            aria-label="Previous photo"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
            aria-label="Next photo"
          >
            →
          </button>
          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition ${
                  i === safeIndex
                    ? "w-5 bg-omniv-gold"
                    : "w-1.5 bg-white/40"
                }`}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
          <p className="absolute right-3 top-3 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white/90">
            {safeIndex + 1}/{list.length}
          </p>
        </>
      )}
    </div>
  );
}

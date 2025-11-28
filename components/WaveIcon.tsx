"use client";

export default function WaveIcon({ className = "w-6 h-6 text-white/90" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M2 12c2.5 0 3.5-2 6-2s3.5 2 6 2 3.5-2 6-2 3.5 2 6 2v2c-2.5 0-3.5 2-6 2s-3.5-2-6-2-3.5 2-6 2-3.5-2-6-2v-2z" />
    </svg>
  );
}
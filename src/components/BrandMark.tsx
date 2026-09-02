export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`relative grid place-items-center overflow-hidden rounded-xl bg-teal-800 text-white shadow-sm ${
          compact ? "h-9 w-9" : "h-11 w-11"
        }`}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_55%)]" />
        <svg
          viewBox="0 0 24 24"
          className={compact ? "h-4 w-4" : "h-5 w-5"}
          fill="none"
          aria-hidden
        >
          <path
            d="M12 4.5c2.2 1.8 3.6 3.4 4.2 4.8.6 1.4.6 2.7 0 4.1C15.6 15.2 14.2 16.8 12 18.6c-2.2-1.8-3.6-3.4-4.2-4.8-.6-1.4-.6-2.7 0-4.1C8.4 7.9 9.8 6.3 12 4.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="12" cy="11.5" r="2.1" fill="currentColor" />
        </svg>
      </span>
      <div className="leading-tight">
        <p className={`font-semibold tracking-tight text-slate-900 ${compact ? "text-sm" : "text-base"}`}>
          Mallax Vision
        </p>
        {!compact && (
          <p className="text-xs text-slate-500">Merchant identity demo</p>
        )}
      </div>
    </div>
  );
}

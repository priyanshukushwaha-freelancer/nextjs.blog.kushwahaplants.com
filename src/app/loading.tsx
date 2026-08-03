export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 font-sans">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--ring)] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-[var(--muted-foreground)]">Loading botanical data...</p>
      </div>
    </div>
  );
}

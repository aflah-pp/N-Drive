const Stat = ({ label, value, note, icon: Icon }) => {
  return (
    <div className="border border-[var(--border)] bg-[var(--card)] rounded-[var(--radius)] p-3 sm:p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--muted-foreground)] font-semibold truncate">
          {label}
        </span>
        <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-[var(--secondary)] text-[var(--secondary-foreground)]">
          <Icon size={14} />
        </span>
      </div>
      <div className="font-extrabold font-manrope text-lg sm:text-xl text-[var(--foreground)] tracking-tight">
        {value}
      </div>
      <div className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-0.5 truncate">{note}</div>
    </div>
  );
};

export default Stat;

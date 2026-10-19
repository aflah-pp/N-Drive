const PageHead = ({ eyebrow, title, subtitle, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 sm:gap-2 mb-2 sm:mb-3 shrink-0">
      <div>
        <div className="text-[11px] sm:text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-0.5 font-semibold">
          {eyebrow}
        </div>
        <h1
          className="text-xl sm:text-2xl md:text-3xl font-extrabold font-manrope text-[var(--foreground)] tracking-tight leading-tight"
          data-testid="text-page-title"
        >
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-2 mt-1 md:mt-0">{actions}</div>}
    </div>
  );
};

export default PageHead;

const ITEMS = [
  "QGSW",
  "MITGCM",
  "CUDA",
  "VORTEX-IN-CELL",
  "POTENTIAL VORTICITY",
  "HPC",
  "LLM / RAG",
  "FINITE ELEMENTS",
  "DATA ASSIMILATION",
  "OCEAN DYNAMICS",
];

/** Terminal-style keyword marquee. Decorative; hidden from AT. */
export function Ticker() {
  const row = (
    <>
      {ITEMS.map((item) => (
        <span
          key={item}
          className="flex shrink-0 items-center gap-6 pr-6 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted"
        >
          {item}
          <span className="text-accent">✦</span>
        </span>
      ))}
    </>
  );

  return (
    <div
      aria-hidden="true"
      className="ticker overflow-hidden border-y border-line bg-bg-subtle py-3.5"
    >
      <div className="ticker-track">
        {row}
        {row}
      </div>
    </div>
  );
}

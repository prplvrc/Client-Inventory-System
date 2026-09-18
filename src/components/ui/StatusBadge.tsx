interface Props {
  status: string;
}

export default function StatusBadge({
  status,
}: Props) {
  const styles: Record<string, string> = {
    ACTIVE:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

    AVAILABLE:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

    LOW:
      "bg-amber-50 text-amber-700 ring-amber-600/20",

    EMPTY:
      "bg-red-50 text-red-700 ring-red-600/20",

    INACTIVE:
      "bg-slate-100 text-slate-600 ring-slate-500/20",

    COMPLETED:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",

    VOIDED:
      "bg-red-50 text-red-700 ring-red-600/20",
  };

  const normalizedStatus = status?.toUpperCase() ?? "";

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ring-inset ${
        styles[normalizedStatus] ??
        "bg-slate-100 text-slate-600"
      }`}
    >
      {normalizedStatus.replaceAll("_", " ")}
    </span>
  );
}
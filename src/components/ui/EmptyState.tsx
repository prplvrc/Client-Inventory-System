import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-white px-6 py-8 text-center">
      <div className="mb-3 rounded-full bg-[#F8F7F2] p-3">
        <Inbox
          size={20}
          className="text-[#64748B]"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-sm font-semibold text-[#1F2937]">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-sm text-xs text-[#64748B]">
          {description}
        </p>
      )}
    </div>
  );
}
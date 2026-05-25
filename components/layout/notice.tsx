type NoticeProps = {
  error?: string;
  message?: string;
};

export function Notice({ error, message }: NoticeProps) {
  if (!error && !message) {
    return null;
  }

  return (
    <div
      className={`mb-5 whitespace-pre-line rounded-md border px-4 py-3 text-sm ${
        error
          ? "border-[#f0b4b4] bg-[#fff1f1] text-[#8a1f1f]"
          : "border-[#b6dfcb] bg-[#eefaf4] text-[#1f6b45]"
      }`}
    >
      {error ?? message}
    </div>
  );
}

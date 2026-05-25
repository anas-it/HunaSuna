import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
};

export function Logo({ className, markClassName, textClassName }: LogoProps) {
  return (
    <span className={cn("logo-brand inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "logo-brand-mark flex h-9 w-9 items-center justify-center rounded-lg bg-[#256f6c] text-white shadow-sm ring-1 ring-[#1f5d5a]/20",
          markClassName
        )}
      >
        <svg
          className="logo-brand-symbol h-6 w-6"
          fill="none"
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11.2 10.5v19"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="4.4"
          />
          <path
            d="M23.1 10.5v19"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="4.4"
          />
          <path
            d="M12.8 20h8.6"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="4.4"
          />
          <path
            d="M29.8 11.2c-2.55-1.6-6.1-.35-6.1 2.45 0 4.85 8.55 2.7 8.55 8.35 0 3.2-3.85 5.1-7.9 3.15"
            stroke="#cfe3e1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.2"
          />
          <path
            d="M30.8 8.2h.1"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeWidth="4"
          />
        </svg>
      </span>
      <span
        className={cn(
          "logo-brand-text font-sans text-[1.12rem] font-bold leading-none tracking-normal text-[#111827]",
          textClassName
        )}
      >
        <span className="logo-brand-huna">Huna</span>
        <span className="logo-brand-suna text-[#256f6c]">Suna</span>
      </span>
    </span>
  );
}

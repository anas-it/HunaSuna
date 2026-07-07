import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
};

export function Logo({ className, markClassName, textClassName }: LogoProps) {
  return (
    <span className={cn("logo-brand inline-flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "logo-brand-mark flex h-9 w-9 items-center justify-center",
          markClassName
        )}
      >
        <svg
          aria-hidden="true"
          className="logo-brand-symbol"
          viewBox="0 0 64 64"
        >
          <path
            className="logo-symbol-panel"
            d="M16.8 14.2c5.9-2.7 11.2-2.5 16 0v35.2c-5-2.5-10.4-2.6-16-.2-2.1.9-4.4-.6-4.4-2.9V18c0-1.7 1-3.2 2.6-3.8l1.8-.7Z"
          />
          <path
            className="logo-symbol-panel logo-symbol-panel-right"
            d="M32.8 14.2c5.9-2.5 11.3-2.4 16.4.2 1.5.7 2.4 2.2 2.4 3.8v28.1c0 2.3-2.3 3.8-4.4 2.9-5.8-2.4-11.2-2.3-16 .2V14.2Z"
          />
          <path
            className="logo-symbol-spine"
            d="M32 14.4v35.1"
          />
          <path
            className="logo-symbol-flow"
            d="M19.3 25.5c3.7-3.5 8.8-3.5 12.1.2 2.9 3.2 5.8 5 9.2 4.4 2.5-.4 4.5-1.8 5.8-3.8"
          />
          <path
            className="logo-symbol-flow logo-symbol-flow-lower"
            d="M17.6 39.2c2.1-3 5.7-4.3 9.4-3.4 3.3.8 5.6 3.7 9.4 4.4 3.9.7 7.6-1.1 10.2-4"
          />
          <path className="logo-symbol-note" d="M20 19.6h7.8" />
          <path className="logo-symbol-note logo-symbol-note-right" d="M38.2 19.6h6" />
        </svg>
      </span>
      <span
        className={cn(
          "logo-brand-text",
          textClassName
        )}
        aria-label="HunaSuna"
      >
        <span aria-hidden="true">Huna</span>
        <span aria-hidden="true" className="logo-brand-text-accent">Suna</span>
      </span>
    </span>
  );
}

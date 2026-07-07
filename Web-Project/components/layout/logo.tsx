import Image from "next/image";

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
        <Image
          src="/brand/hunasuna-mark.png"
          alt=""
          width={320}
          height={332}
          priority
          sizes="(max-width: 860px) 48px, 64px"
          className="logo-brand-image"
        />
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

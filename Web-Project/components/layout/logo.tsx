import Image from "next/image";

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
      >
        <Image
          src="/brand/hunasuna-wordmark.png"
          alt="HunaSuna"
          width={588}
          height={98}
          priority
          sizes="(max-width: 860px) 150px, 180px"
          className="logo-brand-wordmark-image"
        />
      </span>
    </span>
  );
}

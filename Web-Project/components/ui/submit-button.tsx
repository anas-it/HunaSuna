"use client";

import { useFormStatus } from "react-dom";
import { useSingleSubmitStatus } from "@/components/forms/single-submit-form";
import { Button, type ButtonProps } from "@/components/ui/button";

type SubmitButtonProps = ButtonProps & {
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  disabled,
  pendingLabel = "Сохранение...",
  type = "submit",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const submitted = useSingleSubmitStatus();
  const isBusy = pending || submitted;

  return (
    <Button
      aria-busy={isBusy}
      disabled={disabled || isBusy}
      type={type}
      {...props}
    >
      {isBusy ? pendingLabel : children}
    </Button>
  );
}

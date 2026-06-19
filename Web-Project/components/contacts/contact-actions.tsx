"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ContactActionsProps = {
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export function ContactActions({ deleteAction }: ContactActionsProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setIsConfirmOpen(true)}>
        Удалить контакт
      </Button>

      {isConfirmOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setIsConfirmOpen(false)}
        >
          <section
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-[#d8dee8] bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <h3 className="text-lg font-semibold text-[#1f2937]">Удалить контакт?</h3>
            <p className="mt-2 text-sm leading-6 text-[#64748b]">
              Контакт исчезнет из списка, но старые записи с ним останутся в истории.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsConfirmOpen(false)}>
                Нет
              </Button>
              <form action={deleteAction}>
                <Button variant="destructive">Да, удалить</Button>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

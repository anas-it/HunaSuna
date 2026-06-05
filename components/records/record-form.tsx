"use client";

import { useMemo, useState } from "react";
import { SingleSubmitForm } from "@/components/forms/single-submit-form";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import { SubmitButton } from "@/components/ui/submit-button";

type ContactOption = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type RecordFormProps = {
  contacts: ContactOption[];
  action: (formData: FormData) => void | Promise<void>;
  actions?: React.ReactNode;
  formId?: string;
  submitLabel: string;
  record?: {
    senderContactId: string | null;
    senderFirstNameSnapshot: string | null;
    senderLastNameSnapshot: string | null;
    senderPhoneSnapshot: string | null;
    receiverContactId: string | null;
    receiverFirstNameSnapshot: string | null;
    receiverLastNameSnapshot: string | null;
    receiverPhoneSnapshot: string | null;
    amount: string;
    currency: string;
    rate: string;
  };
};

type PersonState = {
  contactId: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type PersonFieldsetProps = {
  contacts: ContactOption[];
  label: string;
  prefix: "sender" | "receiver";
  person: PersonState;
  setPerson: (person: PersonState) => void;
};

function contactLabel(contact: ContactOption) {
  return `${contact.firstName} ${contact.lastName} - ${contact.phone}`;
}

function contactPerson(contact: ContactOption): PersonState {
  return {
    contactId: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone: contact.phone
  };
}

function manualPerson(input?: {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}): PersonState {
  return {
    contactId: "manual",
    firstName: input?.firstName ?? "",
    lastName: input?.lastName ?? "",
    phone: input?.phone ?? ""
  };
}

function initialPerson(
  contactId: string | null | undefined,
  contacts: ContactOption[],
  snapshot: {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  }
) {
  const contact = contactId ? contacts.find((item) => item.id === contactId) : undefined;

  if (contact) {
    return contactPerson(contact);
  }

  return manualPerson(snapshot);
}

function PersonFieldset({ contacts, label, prefix, person, setPerson }: PersonFieldsetProps) {
  const isManual = person.contactId === "manual";
  const inputClassName = isManual
    ? "rounded-md border border-[#cbd5e1] px-3 py-2"
    : "rounded-md border border-[#cbd5e1] bg-[#f8fafc] px-3 py-2 text-[#475569]";

  return (
    <fieldset className="grid gap-3">
      <legend className="text-base font-semibold">{label}</legend>
      <select
        className="rounded-md border border-[#cbd5e1] px-3 py-2"
        name={`${prefix}ContactId`}
        value={person.contactId}
        onChange={(event) => {
          const selectedContactId = event.target.value;
          const contact = contacts.find((item) => item.id === selectedContactId);
          setPerson(contact ? contactPerson(contact) : manualPerson());
        }}
      >
        <option value="manual">Ввести вручную</option>
        {contacts.map((contact) => (
          <option key={contact.id} value={contact.id}>
            {contactLabel(contact)}
          </option>
        ))}
      </select>
      <input
        className={inputClassName}
        name={`${prefix}FirstName`}
        placeholder="Имя"
        readOnly={!isManual}
        required
        value={person.firstName}
        onChange={(event) => setPerson({ ...person, firstName: event.target.value })}
      />
      <input
        className={inputClassName}
        name={`${prefix}LastName`}
        placeholder="Фамилия"
        readOnly={!isManual}
        required
        value={person.lastName}
        onChange={(event) => setPerson({ ...person, lastName: event.target.value })}
      />
      <input
        className={inputClassName}
        name={`${prefix}Phone`}
        placeholder="Телефон, если есть"
        readOnly={!isManual}
        value={person.phone}
        onChange={(event) => setPerson({ ...person, phone: event.target.value })}
      />
    </fieldset>
  );
}

export function RecordForm({
  contacts,
  action,
  actions,
  formId = "record-form",
  submitLabel,
  record
}: RecordFormProps) {
  const initialSender = useMemo(
    () =>
      initialPerson(record?.senderContactId, contacts, {
        firstName: record?.senderFirstNameSnapshot,
        lastName: record?.senderLastNameSnapshot,
        phone: record?.senderPhoneSnapshot
      }),
    [contacts, record]
  );
  const initialReceiver = useMemo(
    () =>
      initialPerson(record?.receiverContactId, contacts, {
        firstName: record?.receiverFirstNameSnapshot,
        lastName: record?.receiverLastNameSnapshot,
        phone: record?.receiverPhoneSnapshot
      }),
    [contacts, record]
  );
  const [sender, setSender] = useState(initialSender);
  const [receiver, setReceiver] = useState(initialReceiver);
  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  return (
    <div className="grid gap-5 rounded-lg border border-[#d8dee8] bg-white p-6">
      <SingleSubmitForm action={action} className="grid gap-5" id={formId}>
        <input name="timezone" type="hidden" value={timezone} />
        <div className="grid gap-5 md:grid-cols-2">
          <PersonFieldset
            contacts={contacts}
            label="От кого"
            person={sender}
            prefix="sender"
            setPerson={setSender}
          />
          <PersonFieldset
            contacts={contacts}
            label="Кому"
            person={receiver}
            prefix="receiver"
            setPerson={setReceiver}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={record?.amount ?? ""}
            name="amount"
            placeholder="Сумма"
            required
          />
          <select
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={record?.currency ?? "USD"}
            name="currency"
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={record?.rate ?? ""}
            name="rate"
            placeholder="Курс"
            required
          />
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <SubmitButton pendingLabel="Сохранение...">
            {submitLabel}
          </SubmitButton>
        </div>
      </SingleSubmitForm>

      {actions ? (
        <div className="flex flex-wrap justify-end gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

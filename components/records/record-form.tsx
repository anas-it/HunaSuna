import { SUPPORTED_CURRENCIES } from "@/lib/constants";

type ContactOption = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type RecordFormProps = {
  contacts: ContactOption[];
  action: (formData: FormData) => void | Promise<void>;
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

function contactLabel(contact: ContactOption) {
  return `${contact.firstName} ${contact.lastName} - ${contact.phone}`;
}

export function RecordForm({ contacts, action, submitLabel, record }: RecordFormProps) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-[#d8dee8] bg-white p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <fieldset className="grid gap-3">
          <legend className="text-base font-semibold">От кого</legend>
          <select
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={record?.senderContactId ?? "manual"}
            name="senderContactId"
          >
            <option value="manual">Ввести вручную</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contactLabel(contact)}
              </option>
            ))}
          </select>
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={record?.senderFirstNameSnapshot ?? ""}
            name="senderFirstName"
            placeholder="Имя"
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={record?.senderLastNameSnapshot ?? ""}
            name="senderLastName"
            placeholder="Фамилия"
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={record?.senderPhoneSnapshot ?? ""}
            name="senderPhone"
            placeholder="Телефон, если есть"
          />
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="text-base font-semibold">Кому</legend>
          <select
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={record?.receiverContactId ?? "manual"}
            name="receiverContactId"
          >
            <option value="manual">Ввести вручную</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contactLabel(contact)}
              </option>
            ))}
          </select>
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={record?.receiverFirstNameSnapshot ?? ""}
            name="receiverFirstName"
            placeholder="Имя"
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={record?.receiverLastNameSnapshot ?? ""}
            name="receiverLastName"
            placeholder="Фамилия"
          />
          <input
            className="rounded-md border border-[#cbd5e1] px-3 py-2"
            defaultValue={record?.receiverPhoneSnapshot ?? ""}
            name="receiverPhone"
            placeholder="Телефон, если есть"
          />
        </fieldset>
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

      <button className="w-fit rounded-md bg-[#256f6c] px-4 py-2 text-sm font-semibold !text-white">
        {submitLabel}
      </button>
    </form>
  );
}

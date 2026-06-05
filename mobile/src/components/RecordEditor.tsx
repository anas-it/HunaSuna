import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { saveRecord, searchContacts, type Contact, type RecordDetail, type RecordInput } from "../api/hunasuna";
import { colors, spacing } from "../styles/theme";
import { contactName } from "../utils/format";
import { ActionButton, Message, TextField } from "./FormControls";

type PersonState = {
  contactId: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type Props = {
  contacts: Contact[];
  initialRecord?: RecordDetail | null;
  onCancel?: () => void;
  onSaved: (record: RecordDetail) => void;
  submitLabel: string;
  token: string;
};

const currencies: RecordInput["currency"][] = ["TRY", "USD", "EUR", "RUB", "CNY"];

function manualPerson(input?: Partial<PersonState>): PersonState {
  return {
    contactId: "manual",
    firstName: input?.firstName ?? "",
    lastName: input?.lastName ?? "",
    phone: input?.phone ?? ""
  };
}

function contactPerson(contact: Contact): PersonState {
  return {
    contactId: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone: contact.phone
  };
}

function personFromRecord(record: RecordDetail | null | undefined, side: "sender" | "receiver", contacts: Contact[]) {
  if (!record) {
    return manualPerson();
  }

  const contactId = side === "sender" ? record.senderContactId : record.receiverContactId;
  const contact = contactId ? contacts.find((item) => item.id === contactId) : undefined;

  if (contact) {
    return contactPerson(contact);
  }

  return manualPerson({
    firstName: side === "sender" ? record.senderFirstNameSnapshot ?? "" : record.receiverFirstNameSnapshot ?? "",
    lastName: side === "sender" ? record.senderLastNameSnapshot ?? "" : record.receiverLastNameSnapshot ?? "",
    phone: side === "sender" ? record.senderPhoneSnapshot ?? "" : record.receiverPhoneSnapshot ?? ""
  });
}

function toPersonInput(person: PersonState): RecordInput["sender"] {
  if (person.contactId !== "manual") {
    return {
      contactId: person.contactId
    };
  }

  return {
    contactId: "manual",
    firstName: person.firstName,
    lastName: person.lastName,
    phone: person.phone
  };
}

export function RecordEditor({ contacts, initialRecord, onCancel, onSaved, submitLabel, token }: Props) {
  const [sender, setSender] = useState(() => personFromRecord(initialRecord, "sender", contacts));
  const [receiver, setReceiver] = useState(() => personFromRecord(initialRecord, "receiver", contacts));
  const [amount, setAmount] = useState(initialRecord?.amount ?? "");
  const [currency, setCurrency] = useState<RecordInput["currency"]>((initialRecord?.currency as RecordInput["currency"]) ?? "USD");
  const [rate, setRate] = useState(initialRecord?.rate ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");

  function resetNewRecordForm() {
    setSender(manualPerson());
    setReceiver(manualPerson());
    setAmount("");
    setCurrency("USD");
    setRate("");
  }

  async function submit() {
    setLoading(true);
    setMessage(null);

    try {
      const result = await saveRecord(
        token,
        {
          sender: toPersonInput(sender),
          receiver: toPersonInput(receiver),
          amount,
          currency,
          rate
        },
        initialRecord?.id
      );

      if (!initialRecord) {
        resetNewRecordForm();
      }

      setMessageTone("success");
      setMessage("Запись сохранена");
      onSaved(result.record);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить запись");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.form}>
      <PersonEditor contacts={contacts} label="От кого" person={sender} setPerson={setSender} token={token} />
      <PersonEditor contacts={contacts} label="Кому" person={receiver} setPerson={setReceiver} token={token} />

      <View style={styles.moneyGrid}>
        <View style={styles.moneyItem}>
          <TextField keyboardType="numeric" onChangeText={setAmount} placeholder="Сумма" value={amount} />
        </View>
        <View style={styles.moneyItem}>
          <TextField keyboardType="numeric" onChangeText={setRate} placeholder="Курс" value={rate} />
        </View>
      </View>

      <View style={styles.fieldBlock}>
        <Text style={styles.label}>Валюта</Text>
        <View style={styles.currencyRow}>
          {currencies.map((item) => (
            <Pressable
              key={item}
              onPress={() => setCurrency(item)}
              style={[styles.currencyButton, item === currency ? styles.currencyButtonActive : null]}
            >
              <Text style={[styles.currencyText, item === currency ? styles.currencyTextActive : null]}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {message ? <Message tone={messageTone}>{message}</Message> : null}

      <View style={styles.actions}>
        {onCancel ? (
          <View style={styles.actionItem}>
            <ActionButton icon="x" onPress={onCancel} tone="secondary">
              Отмена
            </ActionButton>
          </View>
        ) : null}
        <View style={styles.actionItem}>
          <ActionButton icon="save" loading={loading} onPress={submit}>
            {submitLabel}
          </ActionButton>
        </View>
      </View>
    </View>
  );
}

function PersonEditor({
  contacts,
  label,
  person,
  setPerson,
  token
}: {
  contacts: Contact[];
  label: string;
  person: PersonState;
  setPerson: (person: PersonState) => void;
  token: string;
}) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const isManual = person.contactId === "manual";
  const selectedContact = !isManual ? contacts.find((contact) => contact.id === person.contactId) : null;

  function selectContact(contact: Contact) {
    setPerson(contactPerson(contact));
    setPickerVisible(false);
  }

  function clearContact() {
    setPerson(manualPerson());
  }

  return (
    <View style={styles.personBlock}>
      <View style={styles.personHeader}>
        <View style={styles.personTitleBlock}>
          <Text style={styles.personTitle}>{label}</Text>
          {selectedContact ? <Text style={styles.selectedText}>{contactName(selectedContact.firstName, selectedContact.lastName)}</Text> : null}
        </View>
        <View style={styles.personActions}>
          {selectedContact ? (
            <Pressable onPress={clearContact} style={styles.iconButton}>
              <Feather color={colors.muted} name="x" size={20} />
            </Pressable>
          ) : null}
          <Pressable onPress={() => setPickerVisible(true)} style={styles.iconButtonPrimary}>
            <Feather color={colors.primary} name="users" size={21} />
          </Pressable>
        </View>
      </View>

      <View style={styles.personFields}>
        <View style={styles.nameRow}>
          <View style={styles.nameItem}>
            <TextField
              editable={isManual}
              onChangeText={(value) => setPerson({ ...person, firstName: value })}
              placeholder="Имя"
              value={person.firstName}
            />
          </View>
          <View style={styles.nameItem}>
            <TextField
              editable={isManual}
              onChangeText={(value) => setPerson({ ...person, lastName: value })}
              placeholder="Фамилия"
              value={person.lastName}
            />
          </View>
        </View>
        <TextField
          editable={isManual}
          keyboardType="phone-pad"
          onChangeText={(value) => setPerson({ ...person, phone: value })}
          placeholder="Телефон"
          value={person.phone}
        />
      </View>

      <ContactPickerModal
        contacts={contacts}
        onClose={() => setPickerVisible(false)}
        onSelect={selectContact}
        selectedContactId={person.contactId}
        token={token}
        visible={pickerVisible}
      />
    </View>
  );
}

function ContactPickerModal({
  contacts,
  onClose,
  onSelect,
  selectedContactId,
  token,
  visible
}: {
  contacts: Contact[];
  onClose: () => void;
  onSelect: (contact: Contact) => void;
  selectedContactId: string;
  token: string;
  visible: boolean;
}) {
  const [query, setQuery] = useState("");
  const [remoteContacts, setRemoteContacts] = useState<Contact[]>([]);
  const normalizedQuery = query.trim();
  const visibleContacts = normalizedQuery ? remoteContacts : contacts;

  function closePicker() {
    setQuery("");
    onClose();
  }

  useEffect(() => {
    if (!visible || !normalizedQuery) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(() => {
      searchContacts(token, normalizedQuery, 20)
        .then((result) => {
          if (!cancelled) {
            setRemoteContacts(result.contacts);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setRemoteContacts([]);
          }
        })
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [normalizedQuery, token, visible]);

  return (
    <Modal animationType="fade" onRequestClose={closePicker} transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выберите контакт</Text>
            <Pressable onPress={closePicker} style={styles.modalCloseButton}>
              <Feather color={colors.muted} name="x" size={20} />
            </Pressable>
          </View>

          <View style={styles.modalSearchBox}>
            <Feather color={colors.muted} name="search" size={18} />
            <TextInput
              autoCapitalize="none"
              onChangeText={setQuery}
              placeholder="Имя или номер"
              placeholderTextColor={colors.muted}
              style={styles.modalSearchInput}
              value={query}
            />
          </View>

          {visibleContacts.length ? (
            <ScrollView contentContainerStyle={styles.contactList} showsVerticalScrollIndicator={false}>
              {visibleContacts.map((contact) => {
                const selected = selectedContactId === contact.id;

                return (
                  <Pressable
                    key={contact.id}
                    onPress={() => {
                      setQuery("");
                      onSelect(contact);
                    }}
                    style={[styles.contactOption, selected ? styles.contactOptionSelected : null]}
                  >
                    <View style={styles.contactOptionTextBlock}>
                      <Text style={styles.contactOptionName}>{contactName(contact.firstName, contact.lastName)}</Text>
                      <Text style={styles.contactOptionPhone}>{contact.phone}</Text>
                    </View>
                    {selected ? <Feather color={colors.primary} name="check" size={20} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.noContactsBox}>
              <Feather color={colors.muted} name="users" size={24} />
              <Text style={styles.noContactsText}>{normalizedQuery ? "Контакт не найден" : "Контактов пока нет"}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  form: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    gap: spacing.md,
    padding: spacing.md
  },
  personBlock: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FAFBFC",
    gap: spacing.sm,
    padding: spacing.sm
  },
  personHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  personTitleBlock: {
    flex: 1
  },
  personTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700"
  },
  selectedText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2
  },
  personActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface
  },
  iconButtonPrimary: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#BFE3E6",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#EEF8F9"
  },
  personFields: {
    gap: spacing.sm
  },
  nameRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  nameItem: {
    flex: 1
  },
  moneyGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  moneyItem: {
    flex: 1
  },
  fieldBlock: {
    gap: spacing.xs
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  currencyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  currencyButton: {
    minHeight: 38,
    minWidth: 54,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm
  },
  currencyButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary
  },
  currencyText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700"
  },
  currencyTextActive: {
    color: colors.surface
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  actionItem: {
    flexGrow: 1,
    minWidth: 130
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(22, 32, 42, 0.34)",
    padding: spacing.lg
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    maxHeight: 420,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700"
  },
  modalSearchBox: {
    minHeight: 46,
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm
  },
  modalSearchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 44,
    paddingVertical: 0
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  contactList: {
    gap: spacing.xs,
    paddingBottom: spacing.xs
  },
  contactOption: {
    minHeight: 58,
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm
  },
  contactOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#EEF8F9"
  },
  contactOptionTextBlock: {
    flex: 1
  },
  contactOptionName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  contactOptionPhone: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  noContactsBox: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  noContactsText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "700"
  }
});

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import {
  deleteContact,
  getContactHistory,
  listContacts,
  saveContact,
  type Contact,
  type RecordListItem
} from "../api/hunasuna";
import { ActionButton, EmptyState, Message, TextField } from "../components/FormControls";
import { RecordCard } from "../components/RecordCard";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors, spacing } from "../styles/theme";
import { contactName } from "../utils/format";

type Props = {
  onBack: () => void;
  token: string;
};

type ContactForm = {
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
};

const emptyForm: ContactForm = {
  firstName: "",
  lastName: "",
  phone: "",
  whatsapp: ""
};

export function ContactsScreen({ onBack, token }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [historyContact, setHistoryContact] = useState<Contact | null>(null);
  const [historyRecords, setHistoryRecords] = useState<RecordListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historyLoadingId, setHistoryLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");

  async function loadContacts(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setMessage(null);

    try {
      const result = await listContacts(token);
      setContacts(result.contacts);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось загрузить контакты");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      setMessage(null);

      try {
        const result = await listContacts(token);

        if (!cancelled) {
          setContacts(result.contacts);
        }
      } catch (error) {
        if (!cancelled) {
          setMessageTone("error");
          setMessage(error instanceof Error ? error.message : "Не удалось загрузить контакты");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, [token]);

  function openNewContactForm() {
    setEditingContact(null);
    setForm(emptyForm);
    setIsFormOpen(true);
    setHistoryContact(null);
    setHistoryRecords([]);
  }

  function editContact(contact: Contact) {
    setEditingContact(contact);
    setIsFormOpen(true);
    setHistoryContact(null);
    setHistoryRecords([]);
    setForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      phone: contact.phone,
      whatsapp: contact.whatsapp ?? ""
    });
  }

  function resetForm() {
    setEditingContact(null);
    setForm(emptyForm);
    setIsFormOpen(false);
  }

  async function submitContact() {
    setSaving(true);
    setMessage(null);

    try {
      await saveContact(token, form, editingContact?.id);
      setMessageTone("success");
      setMessage(editingContact ? "Контакт обновлен" : "Контакт создан");
      resetForm();
      await loadContacts(true);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить контакт");
    } finally {
      setSaving(false);
    }
  }

  async function removeContact(contact: Contact) {
    setMessage(null);

    try {
      await deleteContact(token, contact.id);
      setMessageTone("success");
      setMessage("Контакт удален");

      if (historyContact?.id === contact.id) {
        setHistoryContact(null);
        setHistoryRecords([]);
      }

      if (editingContact?.id === contact.id) {
        resetForm();
      }

      await loadContacts(true);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось удалить контакт");
    }
  }

  function confirmDelete(contact: Contact) {
    Alert.alert("Удалить контакт?", "Контакт исчезнет из списка, но созданные раньше записи сохранятся.", [
      {
        text: "Отмена",
        style: "cancel"
      },
      {
        text: "Удалить",
        style: "destructive",
        onPress: () => void removeContact(contact)
      }
    ]);
  }

  async function openHistory(contact: Contact) {
    setHistoryLoadingId(contact.id);
    setMessage(null);

    try {
      const result = await getContactHistory(token, contact.id);
      setHistoryContact(result.contact);
      setHistoryRecords(result.records);
      setIsFormOpen(false);
      setEditingContact(null);
      setForm(emptyForm);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось открыть историю контакта");
    } finally {
      setHistoryLoadingId(null);
    }
  }

  return (
    <ScreenLayout
      onBack={onBack}
      onRefresh={() => void loadContacts(true)}
      refreshing={refreshing}
      title="Контакты"
    >
      <View style={styles.content}>
        {message ? <Message tone={messageTone}>{message}</Message> : null}

        <View style={styles.listHeader}>
          <View style={styles.listHeaderText}>
            <Text style={styles.sectionTitle}>Список контактов</Text>
            <Text style={styles.sectionHint}>
              {contacts.length ? `Всего контактов: ${contacts.length}` : "Добавьте первый контакт"}
            </Text>
          </View>
          <Pressable
            onPress={openNewContactForm}
            style={({ pressed }) => [styles.addContactButton, pressed ? styles.addContactButtonPressed : null]}
          >
            <Feather color={colors.surface} name="plus" size={18} />
            <Text style={styles.addContactButtonText}>Добавить</Text>
          </Pressable>
        </View>

        {isFormOpen ? (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.formHeaderText}>
                <Text style={styles.sectionTitle}>{editingContact ? "Изменить контакт" : "Новый контакт"}</Text>
                <Text style={styles.sectionHint}>
                  {editingContact ? "Проверьте данные и сохраните" : "Заполните только нужные поля"}
                </Text>
              </View>
              <Pressable onPress={resetForm} style={styles.closeEditButton}>
                <Feather color={colors.muted} name="x" size={20} />
              </Pressable>
            </View>

            <View style={styles.nameRow}>
              <View style={styles.nameItem}>
                <TextField
                  label="Имя"
                  onChangeText={(value) => setForm((current) => ({ ...current, firstName: value }))}
                  placeholder="Имя"
                  value={form.firstName}
                />
              </View>
              <View style={styles.nameItem}>
                <TextField
                  label="Фамилия"
                  onChangeText={(value) => setForm((current) => ({ ...current, lastName: value }))}
                  placeholder="Фамилия"
                  value={form.lastName}
                />
              </View>
            </View>

            <TextField
              keyboardType="phone-pad"
              label="Телефон"
              onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))}
              placeholder="Телефон"
              value={form.phone}
            />
            <TextField
              keyboardType="phone-pad"
              label="WhatsApp"
              onChangeText={(value) => setForm((current) => ({ ...current, whatsapp: value }))}
              placeholder="Если отличается от телефона"
              value={form.whatsapp}
            />

            <View style={styles.formActions}>
              <ActionButton icon={editingContact ? "check" : "plus"} loading={saving} onPress={submitContact}>
                {editingContact ? "Сохранить" : "Добавить контакт"}
              </ActionButton>
            </View>
          </View>
        ) : null}

        {loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}
        {!loading && !contacts.length && !isFormOpen ? (
          <EmptyState icon="users" text="Контактов пока нет. Нажмите Добавить сверху." />
        ) : null}

        <View style={styles.contactsList}>
          {contacts.map((contact) => (
            <ContactCard
              contact={contact}
              historyLoading={historyLoadingId === contact.id}
              key={contact.id}
              onDelete={() => confirmDelete(contact)}
              onEdit={() => editContact(contact)}
              onHistory={() => void openHistory(contact)}
            />
          ))}
        </View>

        {historyContact ? (
          <View style={styles.historyBlock}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>История: {contactName(historyContact.firstName, historyContact.lastName)}</Text>
              <Pressable onPress={() => setHistoryContact(null)} style={styles.closeEditButton}>
                <Feather color={colors.muted} name="x" size={20} />
              </Pressable>
            </View>
            {!historyRecords.length ? <EmptyState text="По этому контакту пока нет записей." /> : null}
            {historyRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </View>
        ) : null}
      </View>
    </ScreenLayout>
  );
}

function ContactCard({
  contact,
  historyLoading,
  onDelete,
  onEdit,
  onHistory
}: {
  contact: Contact;
  historyLoading: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onHistory: () => void;
}) {
  return (
    <View style={styles.contactCard}>
      <View style={styles.contactMain}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{contact.firstName.slice(0, 1).toUpperCase() || "?"}</Text>
        </View>
        <View style={styles.contactTextBlock}>
          <Text numberOfLines={1} style={styles.contactName}>
            {contactName(contact.firstName, contact.lastName)}
          </Text>
          <Text numberOfLines={1} style={styles.contactMeta}>
            {contact.phone}
          </Text>
          {contact.whatsapp ? (
            <Text numberOfLines={1} style={styles.contactMetaSecondary}>
              WhatsApp: {contact.whatsapp}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.cardActions}>
        <Pressable onPress={onHistory} style={styles.textAction}>
          <Feather color={colors.primary} name={historyLoading ? "loader" : "clock"} size={17} />
          <Text style={styles.textActionLabel}>История</Text>
        </Pressable>
        <Pressable onPress={onEdit} style={styles.iconAction}>
          <Feather color={colors.primary} name="edit-2" size={19} />
        </Pressable>
        <Pressable onPress={onDelete} style={styles.deleteIconAction}>
          <Feather color={colors.danger} name="trash-2" size={19} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md
  },
  listHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between"
  },
  listHeaderText: {
    flex: 1
  },
  addContactButton: {
    minHeight: 42,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    paddingHorizontal: spacing.sm
  },
  addContactButtonPressed: {
    backgroundColor: colors.primaryPressed
  },
  addContactButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800"
  },
  formCard: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    padding: spacing.md
  },
  formHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  formHeaderText: {
    flex: 1
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700"
  },
  sectionHint: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  closeEditButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface
  },
  nameRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  nameItem: {
    flex: 1
  },
  formActions: {
    marginTop: spacing.xs
  },
  contactsList: {
    gap: spacing.sm
  },
  contactCard: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    padding: spacing.md
  },
  contactMain: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: "#EEF8F9"
  },
  avatarText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "800"
  },
  contactTextBlock: {
    flex: 1
  },
  contactName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700"
  },
  contactMeta: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 1
  },
  contactMetaSecondary: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  cardActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "flex-end"
  },
  textAction: {
    minHeight: 40,
    alignItems: "center",
    borderColor: "#BFE3E6",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#EEF8F9",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    paddingHorizontal: spacing.sm
  },
  textActionLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700"
  },
  iconAction: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface
  },
  deleteIconAction: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#F3C2BD",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFF7F7"
  },
  historyBlock: {
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  historyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  }
});

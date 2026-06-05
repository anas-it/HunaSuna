import { Feather } from "@expo/vector-icons";
import { useEffect, useState, type ComponentProps } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  deleteContact,
  getContactHistory,
  listContacts,
  saveContact,
  searchContacts,
  type Contact,
  type PaginationMeta,
  type RecordListItem
} from "../api/hunasuna";
import { ActionButton, EmptyState, Message, PaginationControls, TextField } from "../components/FormControls";
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

type FeatherIconName = ComponentProps<typeof Feather>["name"];

const emptyForm: ContactForm = {
  firstName: "",
  lastName: "",
  phone: "",
  whatsapp: ""
};

const CONTACTS_SEARCH_LIMIT = 100;

async function getContactsByQuery(token: string, query: string) {
  const normalizedQuery = query.trim();

  return normalizedQuery ? searchContacts(token, normalizedQuery, CONTACTS_SEARCH_LIMIT) : listContacts(token);
}

export function ContactsScreen({ onBack, token }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyContact, setHistoryContact] = useState<Contact | null>(null);
  const [historyRecords, setHistoryRecords] = useState<RecordListItem[]>([]);
  const [historyPagination, setHistoryPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [historyLoadingId, setHistoryLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");

  async function loadContacts(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else if (searchQuery.trim()) {
      setSearchLoading(true);
    } else {
      setLoading(true);
    }

    setMessage(null);

    try {
      const result = await getContactsByQuery(token, searchQuery);
      setContacts(result.contacts);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось загрузить контакты");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSearchLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    const normalizedQuery = searchQuery.trim();

    const timeout = setTimeout(async () => {
      if (normalizedQuery) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }
      setMessage(null);

      try {
        const result = await getContactsByQuery(token, normalizedQuery);

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
          setSearchLoading(false);
        }
      }
    }, normalizedQuery ? 180 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery, token]);

  function openNewContactForm() {
    setEditingContact(null);
    setForm(emptyForm);
    setIsFormOpen(true);
    setHistoryContact(null);
    setHistoryRecords([]);
    setHistoryPagination(null);
  }

  function editContact(contact: Contact) {
    setEditingContact(contact);
    setIsFormOpen(true);
    setHistoryContact(null);
    setHistoryRecords([]);
    setHistoryPagination(null);
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
        setHistoryPagination(null);
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

  async function openHistory(contact: Contact, page = 1) {
    setHistoryLoadingId(contact.id);
    setMessage(null);

    try {
      const result = await getContactHistory(token, contact.id, page);
      setHistoryContact(result.contact);
      setHistoryRecords(result.records);
      setHistoryPagination(result.pagination);
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
          <View style={styles.listHeaderText} />
          <Pressable
            onPress={openNewContactForm}
            style={({ pressed }) => [styles.addContactButton, pressed ? styles.addContactButtonPressed : null]}
          >
            <Feather color={colors.surface} name="plus" size={18} />
            <Text style={styles.addContactButtonText}>Добавить</Text>
          </Pressable>
        </View>

        {!isFormOpen ? (
          <View style={styles.searchBox}>
            <Feather color={colors.muted} name="search" size={18} />
            <TextInput
              autoCapitalize="none"
              onChangeText={setSearchQuery}
              placeholder="Имя, фамилия или номер"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              value={searchQuery}
            />
            {searchLoading ? <ActivityIndicator color={colors.primary} size="small" /> : null}
            {!searchLoading && searchQuery ? (
              <Pressable
                accessibilityLabel="Очистить поиск"
                onPress={() => setSearchQuery("")}
                style={({ pressed }) => [styles.clearSearchButton, pressed ? styles.clearSearchButtonPressed : null]}
              >
                <Feather color={colors.muted} name="x" size={17} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {isFormOpen ? (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.formHeaderText}>
                <Text style={styles.sectionTitle}>{editingContact ? "Изменить контакт" : "Новый контакт"}</Text>
              </View>
              <Pressable onPress={resetForm} style={styles.closeEditButton}>
                <Feather color={colors.muted} name="x" size={20} />
              </Pressable>
            </View>

            <View style={styles.nameRow}>
              <View style={styles.nameItem}>
                <TextField
                  onChangeText={(value) => setForm((current) => ({ ...current, firstName: value }))}
                  placeholder="Имя"
                  value={form.firstName}
                />
              </View>
              <View style={styles.nameItem}>
                <TextField
                  onChangeText={(value) => setForm((current) => ({ ...current, lastName: value }))}
                  placeholder="Фамилия"
                  value={form.lastName}
                />
              </View>
            </View>

            <TextField
              keyboardType="phone-pad"
              onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))}
              placeholder="Телефон"
              value={form.phone}
            />
            <TextField
              keyboardType="phone-pad"
              onChangeText={(value) => setForm((current) => ({ ...current, whatsapp: value }))}
              placeholder="WhatsApp"
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
          <EmptyState
            icon="users"
            text={searchQuery.trim() ? "Подходящих контактов нет." : "Контактов пока нет. Нажмите Добавить сверху."}
          />
        ) : null}

        {!isFormOpen ? (
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
        ) : null}

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
            <PaginationControls
              disabled={historyLoadingId === historyContact.id}
              onPageChange={(nextPage) => void openHistory(historyContact, nextPage)}
              pagination={historyPagination}
            />
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const name = contactName(contact.firstName, contact.lastName);

  return (
    <View style={styles.contactCard}>
      <Pressable
        delayLongPress={900}
        onLongPress={() => setDetailsOpen(true)}
        style={({ pressed }) => [styles.contactBodyButton, pressed ? styles.contactBodyButtonPressed : null]}
      >
        <View style={styles.contactTextBlock}>
          <Text numberOfLines={2} style={styles.contactName}>
            {name}
          </Text>
        </View>
      </Pressable>

      <View style={styles.cardActions}>
        <Pressable
          accessibilityLabel="История контакта"
          onPress={onHistory}
          style={({ pressed }) => [styles.historyIconAction, pressed ? styles.iconActionPressed : null]}
        >
          {historyLoading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Feather color={colors.primary} name="clock" size={19} />
          )}
        </Pressable>
        <Pressable
          accessibilityLabel="Изменить контакт"
          onPress={onEdit}
          style={({ pressed }) => [styles.iconAction, pressed ? styles.iconActionPressed : null]}
        >
          <Feather color={colors.primary} name="edit-2" size={19} />
        </Pressable>
        <Pressable
          accessibilityLabel="Удалить контакт"
          onPress={onDelete}
          style={({ pressed }) => [styles.deleteIconAction, pressed ? styles.deleteIconActionPressed : null]}
        >
          <Feather color={colors.danger} name="trash-2" size={19} />
        </Pressable>
      </View>

      <ContactDetailsModal contact={contact} onClose={() => setDetailsOpen(false)} visible={detailsOpen} />
    </View>
  );
}

function ContactDetailsModal({
  contact,
  onClose,
  visible
}: {
  contact: Contact;
  onClose: () => void;
  visible: boolean;
}) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalOverlay}>
        <Pressable accessibilityLabel="Закрыть подробности контакта" onPress={onClose} style={styles.modalBackdrop} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleWrap}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>{contact.firstName.slice(0, 1).toUpperCase() || "?"}</Text>
              </View>
              <Text numberOfLines={2} style={styles.modalTitle}>
                {contactName(contact.firstName, contact.lastName)}
              </Text>
            </View>
            <Pressable accessibilityLabel="Закрыть" onPress={onClose} style={styles.modalCloseButton}>
              <Feather color={colors.muted} name="x" size={20} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <ContactDetailRow icon="user" label="Имя" value={contact.firstName} />
            <ContactDetailRow icon="user-check" label="Фамилия" value={contact.lastName} />
            <ContactDetailRow icon="phone" label="Телефон" value={contact.phone} />
            <ContactDetailRow icon="message-circle" label="WhatsApp" value={contact.whatsapp || "Не указан"} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ContactDetailRow({ icon, label, value }: { icon: FeatherIconName; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Feather color={colors.primary} name={icon} size={17} />
      </View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text selectable style={styles.detailValue}>
          {value}
        </Text>
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
  searchBox: {
    minHeight: 48,
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 0
  },
  clearSearchButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#F4FAFB"
  },
  clearSearchButtonPressed: {
    backgroundColor: "#EEF8F9"
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
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 68,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  contactBodyButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 52,
    minWidth: 0,
    padding: spacing.xs
  },
  contactBodyButtonPressed: {
    backgroundColor: "#F4FAFB"
  },
  contactTextBlock: {
    flex: 1,
    minWidth: 0
  },
  contactName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 21
  },
  cardActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "flex-end"
  },
  historyIconAction: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#BFE3E6",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#EEF8F9"
  },
  iconAction: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface
  },
  iconActionPressed: {
    backgroundColor: "#F4FAFB",
    transform: [{ scale: 0.96 }]
  },
  deleteIconAction: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#F3C2BD",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFF7F7"
  },
  deleteIconActionPressed: {
    backgroundColor: "#FFECEC",
    transform: [{ scale: 0.96 }]
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    padding: spacing.lg
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "78%",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    padding: spacing.md
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  modalTitleWrap: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm
  },
  modalAvatar: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: "#EEF8F9"
  },
  modalAvatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "800"
  },
  modalTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface
  },
  modalContent: {
    gap: spacing.sm,
    paddingTop: spacing.md
  },
  detailRow: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#F9FCFD",
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm
  },
  detailIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#EEF8F9"
  },
  detailText: {
    flex: 1,
    gap: 2
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  detailValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 21
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

import { Feather } from "@expo/vector-icons";
import { useEffect, useState, type ComponentProps } from "react";
import { ActivityIndicator, Alert, Animated, Easing, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
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
const INLINE_ACTIONS_WIDTH = 122;

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
  const [openActionsContactId, setOpenActionsContactId] = useState<string | null>(null);
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
    setOpenActionsContactId(null);
    setEditingContact(null);
    setForm(emptyForm);
    setIsFormOpen(true);
    setHistoryContact(null);
    setHistoryRecords([]);
    setHistoryPagination(null);
  }

  function editContact(contact: Contact) {
    setOpenActionsContactId(null);
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
    setOpenActionsContactId(null);
    setEditingContact(null);
    setForm(emptyForm);
    setIsFormOpen(false);
  }

  function handleSearchQueryChange(value: string) {
    setOpenActionsContactId(null);
    setSearchQuery(value);
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
    setOpenActionsContactId(null);
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
    setOpenActionsContactId(null);
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
    setOpenActionsContactId(null);
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
              onChangeText={handleSearchQueryChange}
              placeholder="Имя, фамилия или номер"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              value={searchQuery}
            />
            {searchLoading ? <ActivityIndicator color={colors.primary} size="small" /> : null}
            {!searchLoading && searchQuery ? (
              <Pressable
                accessibilityLabel="Очистить поиск"
                onPress={() => handleSearchQueryChange("")}
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
            {contacts.map((contact, index) => (
              <ContactCard
                actionsOpen={openActionsContactId === contact.id}
                contact={contact}
                historyLoading={historyLoadingId === contact.id}
                isLast={index === contacts.length - 1}
                key={contact.id}
                onCloseActions={() => setOpenActionsContactId(null)}
                onDelete={() => confirmDelete(contact)}
                onEdit={() => editContact(contact)}
                onHistory={() => void openHistory(contact)}
                onToggleActions={() => setOpenActionsContactId((current) => (current === contact.id ? null : contact.id))}
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
  actionsOpen,
  contact,
  historyLoading,
  isLast,
  onCloseActions,
  onDelete,
  onEdit,
  onHistory,
  onToggleActions
}: {
  actionsOpen: boolean;
  contact: Contact;
  historyLoading: boolean;
  isLast: boolean;
  onCloseActions: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onHistory: () => void;
  onToggleActions: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionsProgress] = useState(() => new Animated.Value(actionsOpen ? 1 : 0));
  const name = contactName(contact.firstName, contact.lastName);

  useEffect(() => {
    Animated.timing(actionsProgress, {
      duration: actionsOpen ? 190 : 150,
      easing: actionsOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      toValue: actionsOpen ? 1 : 0,
      useNativeDriver: false
    }).start();
  }, [actionsOpen, actionsProgress]);

  const actionsWidth = actionsProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, INLINE_ACTIONS_WIDTH]
  });

  const actionsTranslateX = actionsProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0]
  });

  const actionsScale = actionsProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1]
  });

  return (
    <View style={[styles.contactCard, isLast ? styles.contactCardLast : null]}>
      <Pressable
        delayLongPress={900}
        onLongPress={() => {
          onCloseActions();
          setDetailsOpen(true);
        }}
        onPress={onCloseActions}
        style={({ pressed }) => [styles.contactBodyButton, pressed ? styles.contactBodyButtonPressed : null]}
      >
        <View style={styles.contactTextBlock}>
          <Text numberOfLines={2} style={styles.contactName}>
            {name}
          </Text>
        </View>
      </Pressable>

      <Animated.View
        pointerEvents={actionsOpen ? "auto" : "none"}
        style={[
          styles.inlineActions,
          {
            opacity: actionsProgress,
            transform: [{ translateX: actionsTranslateX }, { scale: actionsScale }],
            width: actionsWidth
          }
        ]}
      >
        <InlineContactAction
          accessibilityLabel="История контакта"
          icon="clock"
          loading={historyLoading}
          onPress={() => {
            onCloseActions();
            onHistory();
          }}
        />
        <InlineContactAction
          accessibilityLabel="Изменить контакт"
          icon="edit-2"
          onPress={() => {
            onCloseActions();
            onEdit();
          }}
        />
        <InlineContactAction
          accessibilityLabel="Удалить контакт"
          danger
          icon="trash-2"
          onPress={() => {
            onCloseActions();
            onDelete();
          }}
        />
      </Animated.View>

      <Pressable
        accessibilityLabel={actionsOpen ? "Свернуть действия контакта" : "Действия контакта"}
        onPress={onToggleActions}
        style={({ pressed }) => [
          styles.moreButton,
          pressed ? styles.moreButtonPressed : null,
          actionsOpen ? styles.moreButtonActive : null,
          actionsOpen && pressed ? styles.moreButtonActivePressed : null
        ]}
      >
        <Feather color={actionsOpen ? colors.surface : colors.primary} name="more-horizontal" size={22} />
      </Pressable>

      <ContactDetailsModal contact={contact} onClose={() => setDetailsOpen(false)} visible={detailsOpen} />
    </View>
  );
}

function InlineContactAction({
  accessibilityLabel,
  danger,
  icon,
  loading,
  onPress
}: {
  accessibilityLabel: string;
  danger?: boolean;
  icon: FeatherIconName;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.inlineActionButton,
        danger ? styles.inlineActionButtonDanger : null,
        pressed ? (danger ? styles.inlineActionButtonDangerPressed : styles.inlineActionButtonPressed) : null
      ]}
    >
      {loading ? <ActivityIndicator color={colors.primary} size="small" /> : <Feather color={danger ? colors.danger : colors.primary} name={icon} size={18} />}
    </Pressable>
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
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  contactCard: {
    alignItems: "center",
    borderColor: colors.border,
    borderBottomWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2
  },
  contactCardLast: {
    borderBottomWidth: 0
  },
  contactBodyButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 42,
    minWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 3
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
  inlineActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "flex-end",
    overflow: "hidden"
  },
  inlineActionButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#BFE3E6",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#EEF8F9"
  },
  inlineActionButtonDanger: {
    borderColor: "#F3C2BD",
    backgroundColor: "#FFF7F7"
  },
  inlineActionButtonPressed: {
    backgroundColor: "#E1F4F6",
    transform: [{ scale: 0.94 }]
  },
  inlineActionButtonDangerPressed: {
    backgroundColor: "#FFECEC",
    transform: [{ scale: 0.94 }]
  },
  moreButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#F4FAFB"
  },
  moreButtonPressed: {
    backgroundColor: "#EEF8F9",
    transform: [{ scale: 0.96 }]
  },
  moreButtonActive: {
    backgroundColor: colors.primary
  },
  moreButtonActivePressed: {
    backgroundColor: colors.primaryPressed,
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

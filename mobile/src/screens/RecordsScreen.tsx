import { Feather } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Keyboard, Pressable, StyleSheet, Text, TextInput, type TextStyle, View } from "react-native";
import {
  deleteRecord,
  getRecord,
  listContacts,
  listRecords,
  searchRecords,
  type Contact,
  type RecordDetail,
  type RecordListItem
} from "../api/hunasuna";
import { EmptyState, Message } from "../components/FormControls";
import { RecordCard } from "../components/RecordCard";
import { RecordEditor } from "../components/RecordEditor";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors, spacing } from "../styles/theme";

type Props = {
  highlightedRecordId?: string | null;
  onBack: () => void;
  token: string;
};

type SortMode = "alpha" | "date";

export function RecordsScreen({ highlightedRecordId: initialHighlightedRecordId = null, onBack, token }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [records, setRecords] = useState<RecordListItem[]>([]);
  const [editingRecord, setEditingRecord] = useState<RecordDetail | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | null>(initialHighlightedRecordId);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const listVisible = !editingRecord && !showCreateForm;

  const sortedRecords = useMemo(() => {
    const nextRecords = [...records];

    if (sortMode === "alpha") {
      return nextRecords.sort((first, second) => {
        const firstTitle = `${first.senderFirstNameSnapshot ?? ""} ${first.senderLastNameSnapshot ?? ""} ${first.receiverFirstNameSnapshot ?? ""} ${first.receiverLastNameSnapshot ?? ""}`;
        const secondTitle = `${second.senderFirstNameSnapshot ?? ""} ${second.senderLastNameSnapshot ?? ""} ${second.receiverFirstNameSnapshot ?? ""} ${second.receiverLastNameSnapshot ?? ""}`;
        return firstTitle.localeCompare(secondTitle, "ru", { sensitivity: "base" });
      });
    }

    return nextRecords.sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  }, [records, sortMode]);

  async function loadData(isRefresh = false, options?: { forceList?: boolean }) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setMessage(null);

    try {
      const normalizedQuery = searchQuery.trim();
      const recordsRequest = !options?.forceList && searchActive && normalizedQuery ? searchRecords(token, normalizedQuery) : listRecords(token);
      const [contactsResult, recordsResult] = await Promise.all([listContacts(token), recordsRequest]);
      setContacts(contactsResult.contacts);
      setRecords(recordsResult.records);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось загрузить записи");
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
        const [contactsResult, recordsResult] = await Promise.all([listContacts(token), listRecords(token)]);

        if (!cancelled) {
          setContacts(contactsResult.contacts);
          setRecords(recordsResult.records);
        }
      } catch (error) {
        if (!cancelled) {
          setMessageTone("error");
          setMessage(error instanceof Error ? error.message : "Не удалось загрузить записи");
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

  async function beginEdit(recordId: string) {
    setActionLoadingId(recordId);
    setMessage(null);

    try {
      const result = await getRecord(token, recordId);
      setEditingRecord(result.record);
      setShowCreateForm(false);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось открыть запись");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function removeRecord(recordId: string) {
    setActionLoadingId(recordId);
    setMessage(null);

    try {
      await deleteRecord(token, recordId);
      setMessageTone("success");
      setMessage("Запись перемещена в удаленные");
      await loadData(true);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось удалить запись");
    } finally {
      setActionLoadingId(null);
    }
  }

  function confirmDelete(recordId: string) {
    Alert.alert("Удалить запись?", "Запись можно восстановить из раздела “Удаленные” в течение 7 дней.", [
      {
        text: "Отмена",
        style: "cancel"
      },
      {
        text: "Удалить",
        style: "destructive",
        onPress: () => void removeRecord(recordId)
      }
    ]);
  }

  async function submitSearch() {
    const normalizedQuery = searchQuery.trim();
    Keyboard.dismiss();

    if (!normalizedQuery) {
      setSearchActive(false);
      await loadData(true, { forceList: true });
      return;
    }

    setSearching(true);
    setMessage(null);

    try {
      const result = await searchRecords(token, normalizedQuery);
      setRecords(result.records);
      setSearchActive(true);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить поиск");
    } finally {
      setSearching(false);
    }
  }

  async function clearSearch() {
    setSearchQuery("");
    setSearchActive(false);
    await loadData(true, { forceList: true });
  }

  return (
    <ScreenLayout
      onBack={onBack}
      onRefresh={() => void loadData(true)}
      refreshing={refreshing}
      title="Записи"
    >
      <View style={styles.content}>
        {message ? <Message tone={messageTone}>{message}</Message> : null}

        {loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}

        {!loading && listVisible ? (
          <View style={styles.toolbar}>
            <Pressable onPress={() => setShowCreateForm(true)} style={({ pressed }) => [styles.createButton, pressed ? styles.createButtonPressed : null]}>
              <Feather color={colors.surface} name="plus-circle" size={18} />
              <Text style={styles.createButtonText}>Создать запись</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={searchOpen ? "Закрыть поиск" : "Открыть поиск"}
              onPress={() => setSearchOpen((current) => !current)}
              style={({ pressed }) => [styles.searchToggle, pressed ? styles.searchTogglePressed : null]}
            >
              <Feather color={colors.primary} name={searchOpen ? "x" : "search"} size={21} />
            </Pressable>
          </View>
        ) : null}

        {searchOpen && listVisible ? (
          <View style={styles.searchBox}>
            <Feather color={colors.muted} name="search" size={20} />
            <TextInput
              autoCapitalize="none"
              onChangeText={setSearchQuery}
              onSubmitEditing={() => void submitSearch()}
              placeholder="Имя, фамилия или номер"
              placeholderTextColor={colors.muted}
              returnKeyType="search"
              style={[styles.searchInput, webInputReset]}
              value={searchQuery}
            />
            {searchQuery ? (
              <Pressable onPress={() => void clearSearch()} style={styles.searchClear}>
                <Feather color={colors.muted} name="x" size={18} />
              </Pressable>
            ) : null}
            <Pressable disabled={searching} onPress={() => void submitSearch()} style={styles.searchSubmit}>
              {searching ? <ActivityIndicator color={colors.surface} size="small" /> : <Feather color={colors.surface} name="arrow-right" size={20} />}
            </Pressable>
          </View>
        ) : null}

        {!loading && listVisible ? (
          <View style={styles.sortBar}>
            <Text style={styles.sortLabel}>Сортировка</Text>
            <View style={styles.sortControls}>
              <SortButton active={sortMode === "date"} label="Дата" onPress={() => setSortMode("date")} />
              <SortButton active={sortMode === "alpha"} label="А-Я" onPress={() => setSortMode("alpha")} />
            </View>
          </View>
        ) : null}

        {showCreateForm ? (
          <RecordEditor
            contacts={contacts}
            key="create-record"
            onCancel={() => setShowCreateForm(false)}
            onSaved={async (record) => {
              setShowCreateForm(false);
              setSearchActive(false);
              setSearchQuery("");
              setSortMode("date");
              setHighlightedRecordId(record.id);
              setMessageTone("success");
              setMessage("Запись сохранена");
              await loadData(true, { forceList: true });
            }}
            submitLabel="Сохранить запись"
            token={token}
          />
        ) : null}

        {editingRecord ? (
          <RecordEditor
            contacts={contacts}
            initialRecord={editingRecord}
            key={editingRecord.id}
            onCancel={() => setEditingRecord(null)}
            onSaved={async () => {
              setEditingRecord(null);
              setMessageTone("success");
              setMessage("Запись обновлена");
              await loadData(true);
            }}
            submitLabel="Сохранить изменения"
            token={token}
          />
        ) : null}

        {!loading && listVisible && !sortedRecords.length ? (
          <EmptyState icon={searchActive ? "search" : "inbox"} text={searchActive ? "Поиск ничего не нашел." : "Записей пока нет."} />
        ) : null}

        {listVisible ? sortedRecords.map((record) => (
          <RecordCard
            highlighted={highlightedRecordId === record.id}
            key={record.id}
            record={record}
            actions={
              <>
                <RecordIconAction
                  disabled={Boolean(actionLoadingId)}
                  icon="edit-2"
                  loading={actionLoadingId === record.id}
                  onPress={() => void beginEdit(record.id)}
                  tone="primary"
                />
                <RecordIconAction
                  disabled={Boolean(actionLoadingId)}
                  icon="trash-2"
                  loading={actionLoadingId === record.id}
                  onPress={() => confirmDelete(record.id)}
                  tone="danger"
                />
              </>
            }
          />
        )) : null}
      </View>
    </ScreenLayout>
  );
}

function SortButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.sortButton, active ? styles.sortButtonActive : null]}>
      <Text style={[styles.sortButtonText, active ? styles.sortButtonTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function RecordIconAction({
  disabled,
  icon,
  loading,
  onPress,
  tone
}: {
  disabled: boolean;
  icon: keyof typeof Feather.glyphMap;
  loading?: boolean;
  onPress: () => void;
  tone: "danger" | "primary";
}) {
  const isDanger = tone === "danger";
  const color = isDanger ? colors.danger : colors.primary;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconAction,
        isDanger ? styles.iconActionDanger : null,
        pressed ? styles.iconActionPressed : null,
        disabled || loading ? styles.iconActionDisabled : null
      ]}
    >
      {loading ? <ActivityIndicator color={color} size="small" /> : <Feather color={color} name={icon} size={19} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md
  },
  toolbar: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  createButton: {
    minHeight: 48,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: colors.primary,
    flex: 1,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  createButtonPressed: {
    backgroundColor: colors.primaryPressed
  },
  createButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: "800"
  },
  searchToggle: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#BFE3E6",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#EEF8F9"
  },
  searchTogglePressed: {
    borderColor: colors.primary,
    backgroundColor: "#E1F3F5"
  },
  searchBox: {
    minHeight: 54,
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 50,
    paddingVertical: 0
  },
  searchClear: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  searchSubmit: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: colors.primary
  },
  sortBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  sortLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  sortControls: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    overflow: "hidden"
  },
  sortButton: {
    minHeight: 38,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm
  },
  sortButtonActive: {
    backgroundColor: colors.primary
  },
  sortButtonText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  sortButtonTextActive: {
    color: colors.surface
  },
  iconAction: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#BFE3E6",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#EEF8F9"
  },
  iconActionDanger: {
    borderColor: "#F3C2BD",
    backgroundColor: "#FFF7F7"
  },
  iconActionPressed: {
    opacity: 0.82
  },
  iconActionDisabled: {
    opacity: 0.6
  }
});

const webInputReset = {
  outlineWidth: 0
} as TextStyle;

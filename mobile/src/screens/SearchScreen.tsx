import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { searchContacts, searchRecords, type Contact, type PaginationMeta, type RecordListItem } from "../api/hunasuna";
import { ContactSuggestions } from "../components/ContactSuggestions";
import { ActionButton, EmptyState, Message, PaginationControls, TextField } from "../components/FormControls";
import { RecordCard } from "../components/RecordCard";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors, spacing } from "../styles/theme";
import { contactName } from "../utils/format";

type Props = {
  initialQuery?: string;
  onBack: () => void;
  token: string;
};

export function SearchScreen({ initialQuery = "", onBack, token }: Props) {
  const normalizedInitialQuery = initialQuery.trim();
  const [query, setQuery] = useState(normalizedInitialQuery);
  const [records, setRecords] = useState<RecordListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [contactSuggestions, setContactSuggestions] = useState<Contact[]>([]);
  const [searched, setSearched] = useState(Boolean(normalizedInitialQuery));
  const [loading, setLoading] = useState(Boolean(normalizedInitialQuery));
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!normalizedInitialQuery) {
      return;
    }

    let cancelled = false;

    async function loadInitialResults() {
      try {
        const result = await searchRecords(token, normalizedInitialQuery, 1);

        if (!cancelled) {
          setRecords(result.records);
          setPagination(result.pagination);
          setSearched(true);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Не удалось выполнить поиск");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadInitialResults();

    return () => {
      cancelled = true;
    };
  }, [normalizedInitialQuery, token]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(() => {
      searchContacts(token, normalizedQuery)
        .then((result) => {
          if (!cancelled) {
            setContactSuggestions(result.contacts);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setContactSuggestions([]);
          }
        })
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, token]);

  async function runSearch(rawQuery: string, page = 1) {
    const normalizedQuery = rawQuery.trim();

    if (!normalizedQuery) {
      setMessage("Введите имя, фамилию или номер телефона");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await searchRecords(token, normalizedQuery, page);
      setRecords(result.records);
      setPagination(result.pagination);
      setSearched(true);
      setContactSuggestions([]);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить поиск");
    } finally {
      setLoading(false);
    }
  }

  async function submitSearch() {
    await runSearch(query, 1);
  }

  function selectContactSuggestion(contact: Contact) {
    const value = contactName(contact.firstName, contact.lastName) || contact.phone;
    setQuery(value);
    void runSearch(value, 1);
  }

  return (
    <ScreenLayout
      onBack={onBack}
      title="Поиск"
    >
      <View style={styles.content}>
        <View style={styles.form}>
          <TextField
            autoCapitalize="none"
            label="Что найти"
            onChangeText={setQuery}
            placeholder="Имя, фамилия или телефон"
            value={query}
          />
          {message ? <Message>{message}</Message> : null}
          <ActionButton icon="search" loading={loading} onPress={submitSearch}>
            Найти
          </ActionButton>
        </View>

        <ContactSuggestions
          contacts={contactSuggestions}
          onSelect={selectContactSuggestion}
          visible={Boolean(query.trim())}
        />

        {loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}

        {!searched ? <EmptyState icon="search" text="Введите контакт или номер телефона, чтобы найти записи." /> : null}
        {searched && !records.length ? <EmptyState text="Ничего не найдено." /> : null}

        {records.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}

        {searched ? (
          <PaginationControls disabled={loading} onPageChange={(nextPage) => void runSearch(query, nextPage)} pagination={pagination} />
        ) : null}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md
  },
  form: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    padding: spacing.md
  }
});

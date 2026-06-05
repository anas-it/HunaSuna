import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { searchRecords, type RecordListItem } from "../api/hunasuna";
import { ActionButton, EmptyState, Message, TextField } from "../components/FormControls";
import { RecordCard } from "../components/RecordCard";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors, spacing } from "../styles/theme";

type Props = {
  initialQuery?: string;
  onBack: () => void;
  token: string;
};

export function SearchScreen({ initialQuery = "", onBack, token }: Props) {
  const normalizedInitialQuery = initialQuery.trim();
  const [query, setQuery] = useState(normalizedInitialQuery);
  const [records, setRecords] = useState<RecordListItem[]>([]);
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
        const result = await searchRecords(token, normalizedInitialQuery);

        if (!cancelled) {
          setRecords(result.records);
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

  async function submitSearch() {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setMessage("Введите имя, фамилию или номер телефона");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await searchRecords(token, normalizedQuery);
      setRecords(result.records);
      setSearched(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить поиск");
    } finally {
      setLoading(false);
    }
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

        {loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}

        {!searched ? <EmptyState icon="search" text="Введите контакт или номер телефона, чтобы найти записи." /> : null}
        {searched && !records.length ? <EmptyState text="Ничего не найдено." /> : null}

        {records.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
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

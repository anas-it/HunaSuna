import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { listContacts, type Contact } from "../api/hunasuna";
import { EmptyState, Message } from "../components/FormControls";
import { RecordEditor } from "../components/RecordEditor";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors, spacing } from "../styles/theme";

type Props = {
  onBack: () => void;
  onRecordSaved: (recordId: string) => void;
  token: string;
};

export function NewRecordScreen({ onBack, onRecordSaved, token }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadContacts(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const result = await listContacts(token);
      setContacts(result.contacts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить контакты");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      setError(null);

      try {
        const result = await listContacts(token);

        if (!cancelled) {
          setContacts(result.contacts);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить контакты");
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

  return (
    <ScreenLayout
      onBack={onBack}
      onRefresh={() => void loadContacts(true)}
      refreshing={refreshing}
      title="Создать запись"
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}
        {error ? <Message>{error}</Message> : null}
        {!loading && !contacts.length ? (
          <EmptyState icon="users" text="Контактов пока нет. Заполните поля или сначала добавьте контакт." />
        ) : null}
        {!loading ? (
          <RecordEditor
            contacts={contacts}
            key="new-record"
            onSaved={(record) => onRecordSaved(record.id)}
            submitLabel="Сохранить запись"
            token={token}
          />
        ) : null}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md
  }
});

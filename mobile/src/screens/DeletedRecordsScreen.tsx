import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { listDeletedRecords, restoreDeletedRecord, type PaginationMeta, type RecordListItem } from "../api/hunasuna";
import { ActionButton, EmptyState, Message, PaginationControls } from "../components/FormControls";
import { RecordCard } from "../components/RecordCard";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors, spacing } from "../styles/theme";

type Props = {
  onBack: () => void;
  token: string;
};

export function DeletedRecordsScreen({ onBack, token }: Props) {
  const [records, setRecords] = useState<RecordListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");

  async function loadRecords(isRefresh = false, nextPage = page) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setMessage(null);

    try {
      const result = await listDeletedRecords(token, nextPage);
      setRecords(result.records);
      setPagination(result.pagination);
      setPage(result.pagination.page);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось загрузить удаленные записи");
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
        const result = await listDeletedRecords(token, 1);

        if (!cancelled) {
          setRecords(result.records);
          setPagination(result.pagination);
          setPage(result.pagination.page);
        }
      } catch (error) {
        if (!cancelled) {
          setMessageTone("error");
          setMessage(error instanceof Error ? error.message : "Не удалось загрузить удаленные записи");
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

  async function restore(recordId: string) {
    setRestoringId(recordId);
    setMessage(null);

    try {
      await restoreDeletedRecord(token, recordId);
      setMessageTone("success");
      setMessage("Запись восстановлена");
      await loadRecords(true, page);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof Error ? error.message : "Не удалось восстановить запись");
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <ScreenLayout
      onBack={onBack}
      onRefresh={() => void loadRecords(true)}
      refreshing={refreshing}
      title="Удаленные"
    >
      <View style={styles.content}>
        {message ? <Message tone={messageTone}>{message}</Message> : null}
        {loading ? <ActivityIndicator color={colors.primary} size="large" /> : null}
        {!loading && !records.length ? <EmptyState icon="trash-2" text="Удаленных записей нет." /> : null}

        {records.map((record) => (
          <RecordCard
            key={record.id}
            record={record}
            actions={
              <ActionButton icon="rotate-ccw" loading={restoringId === record.id} onPress={() => void restore(record.id)}>
                Восстановить
              </ActionButton>
            }
          />
        ))}

        <PaginationControls disabled={refreshing} onPageChange={(nextPage) => void loadRecords(true, nextPage)} pagination={pagination} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md
  }
});

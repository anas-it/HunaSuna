import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextStyle,
  View
} from "react-native";
import { listRecords, type RecordListItem } from "../api/hunasuna";
import { EmptyState, Message } from "../components/FormControls";
import { RecordCard } from "../components/RecordCard";
import { colors, spacing } from "../styles/theme";
import type { ApiUser } from "../types/api";
import type { AppSection } from "../types/navigation";

type Props = {
  user: ApiUser;
  onOpenSection: (section: AppSection) => void;
  onSearch: (query: string) => void;
  token: string;
};

export function HomeScreen({ user, onOpenSection, onSearch, token }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [records, setRecords] = useState<RecordListItem[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      setRecordsLoading(true);
      setRecordsError(null);

      try {
        const result = await listRecords(token);

        if (!cancelled) {
          setRecords(result.records);
        }
      } catch (error) {
        if (!cancelled) {
          setRecordsError(error instanceof Error ? error.message : "Не удалось загрузить записи");
        }
      } finally {
        if (!cancelled) {
          setRecordsLoading(false);
        }
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, [token]);

  function submitSearch() {
    Keyboard.dismiss();
    onSearch(searchQuery);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.login}>{user.login}</Text>
        </View>

        <View style={styles.searchBlock}>
          <Text style={styles.searchTitle}>Поиск</Text>
          <View style={[styles.searchField, searchFocused ? styles.searchFieldFocused : null]}>
            <Feather color={colors.muted} name="search" size={22} />
            <TextInput
              autoCapitalize="none"
              onBlur={() => setSearchFocused(false)}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onSubmitEditing={submitSearch}
              placeholder="Контакт или номер телефона"
              placeholderTextColor={colors.muted}
              returnKeyType="search"
              style={[styles.searchInput, webInputReset]}
              value={searchQuery}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery("")} style={styles.clearButton}>
                <Feather color={colors.muted} name="x" size={18} />
              </Pressable>
            ) : null}
            <SearchArrowButton onPress={submitSearch} />
          </View>
        </View>

        <View style={styles.recordsSection}>
          <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>Записи</Text>
            <Pressable onPress={() => onOpenSection("records")} style={styles.recordsLink}>
              <Text style={styles.recordsLinkText}>Все</Text>
              <Feather color={colors.primary} name="chevron-right" size={18} />
            </Pressable>
          </View>

          {recordsError ? <Message>{recordsError}</Message> : null}
          {recordsLoading ? <ActivityIndicator color={colors.primary} size="large" /> : null}
          {!recordsLoading && !records.length ? <EmptyState text="Записей пока нет." /> : null}

          {records.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SearchArrowButton({ onPress }: { onPress: () => void }) {
  const [scale] = useState(() => new Animated.Value(1));
  const [slide] = useState(() => new Animated.Value(0));

  function animate(toScale: number, toSlide: number) {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: toScale,
        speed: 30,
        bounciness: 7,
        useNativeDriver: true
      }),
      Animated.spring(slide, {
        toValue: toSlide,
        speed: 30,
        bounciness: 6,
        useNativeDriver: true
      })
    ]).start();
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => animate(0.92, 3)}
      onPressOut={() => animate(1, 0)}
      style={styles.searchButton}
    >
      <Animated.View
        style={{
          transform: [{ translateX: slide }, { scale }]
        }}
      >
        <Feather color={colors.surface} name="arrow-right" size={21} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl + spacing.lg,
    paddingBottom: spacing.xl
  },
  header: {
    minHeight: 44,
    justifyContent: "center"
  },
  login: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700"
  },
  searchBlock: {
    gap: spacing.sm,
    marginTop: spacing.xl
  },
  searchTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700"
  },
  searchField: {
    minHeight: 58,
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.xs,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    shadowColor: "#B8C4D2",
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 2
  },
  searchFieldFocused: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.1
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 54,
    paddingVertical: 0
  },
  clearButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8
  },
  searchButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: colors.primary
  },
  recordsSection: {
    gap: spacing.sm,
    marginTop: spacing.xl
  },
  recordsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  recordsTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700"
  },
  recordsLink: {
    minHeight: 40,
    alignItems: "center",
    flexDirection: "row",
    gap: 2
  },
  recordsLinkText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  }
});

const webInputReset = {
  outlineWidth: 0
} as TextStyle;

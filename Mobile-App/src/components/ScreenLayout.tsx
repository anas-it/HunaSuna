import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { colors, spacing } from "../styles/theme";

type Props = {
  children: ReactNode;
  onBack: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  title: string;
};

export function ScreenLayout({ children, onBack, onRefresh, refreshing = false, title }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl onRefresh={onRefresh} refreshing={refreshing} /> : undefined}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={onBack} style={styles.backButton}>
            <Feather color={colors.primary} name="arrow-left" size={22} />
            <Text style={styles.backText}>Назад</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>

          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboardView: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl
  },
  backButton: {
    minHeight: 44,
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700"
  },
  header: {
    marginBottom: spacing.lg
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700"
  }
});

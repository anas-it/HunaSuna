import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, type TextStyle, View } from "react-native";
import { colors, spacing } from "../styles/theme";

type TextFieldProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  label?: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
};

type ButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  onPress: () => void;
  tone?: "primary" | "secondary" | "danger";
};

type MessageProps = {
  children: ReactNode;
  tone?: "error" | "success" | "muted";
};

type PaginationLike = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  page: number;
  totalPages: number;
};

export function TextField({
  autoCapitalize,
  editable = true,
  keyboardType = "default",
  label,
  multiline,
  onChangeText,
  placeholder,
  secureTextEntry,
  value
}: TextFieldProps) {
  return (
    <View style={styles.field}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        autoCapitalize={autoCapitalize}
        editable={editable}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={secureTextEntry}
        style={[styles.input, webInputReset, multiline ? styles.multilineInput : null, !editable ? styles.inputReadonly : null]}
        value={value}
      />
    </View>
  );
}

export function ActionButton({ children, disabled, icon, loading, onPress, tone = "primary" }: ButtonProps) {
  const isPrimary = tone === "primary";
  const isDanger = tone === "danger";
  const color = isPrimary ? colors.surface : isDanger ? colors.danger : colors.primary;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        isDanger ? styles.dangerButton : null,
        pressed && isPrimary ? styles.primaryButtonPressed : null,
        pressed && !isPrimary ? styles.secondaryButtonPressed : null,
        disabled || loading ? styles.disabledButton : null
      ]}
    >
      {loading ? <ActivityIndicator color={color} /> : icon ? <Feather color={color} name={icon} size={18} /> : null}
      <Text style={[styles.buttonText, isPrimary ? styles.primaryButtonText : null, isDanger ? styles.dangerText : null]}>
        {children}
      </Text>
    </Pressable>
  );
}

export function Message({ children, tone = "error" }: MessageProps) {
  return (
    <Text
      style={[
        styles.message,
        tone === "success" ? styles.successMessage : null,
        tone === "muted" ? styles.mutedMessage : null
      ]}
    >
      {children}
    </Text>
  );
}

export function EmptyState({ icon = "inbox", text }: { icon?: keyof typeof Feather.glyphMap; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Feather color={colors.muted} name={icon} size={26} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function PaginationControls({
  disabled,
  onPageChange,
  pagination
}: {
  disabled?: boolean;
  onPageChange: (page: number) => void;
  pagination: PaginationLike | null;
}) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <View style={styles.pagination}>
      <Pressable
        disabled={disabled || !pagination.hasPreviousPage}
        onPress={() => onPageChange(pagination.page - 1)}
        style={({ pressed }) => [
          styles.pageButton,
          pressed ? styles.pageButtonPressed : null,
          disabled || !pagination.hasPreviousPage ? styles.pageButtonDisabled : null
        ]}
      >
        <Feather color={colors.primary} name="chevron-left" size={18} />
        <Text style={styles.pageButtonText}>Назад</Text>
      </Pressable>
      <Text style={styles.pageText}>
        {pagination.page} / {pagination.totalPages}
      </Text>
      <Pressable
        disabled={disabled || !pagination.hasNextPage}
        onPress={() => onPageChange(pagination.page + 1)}
        style={({ pressed }) => [
          styles.pageButton,
          pressed ? styles.pageButtonPressed : null,
          disabled || !pagination.hasNextPage ? styles.pageButtonDisabled : null
        ]}
      >
        <Text style={styles.pageButtonText}>Дальше</Text>
        <Feather color={colors.primary} name="chevron-right" size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  input: {
    minHeight: 48,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: spacing.md
  },
  inputReadonly: {
    backgroundColor: "#EEF2F6",
    color: colors.muted
  },
  multilineInput: {
    minHeight: 84,
    paddingTop: spacing.sm,
    textAlignVertical: "top"
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
    paddingHorizontal: spacing.md
  },
  primaryButton: {
    backgroundColor: colors.primary
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed
  },
  secondaryButton: {
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.surface
  },
  secondaryButtonPressed: {
    borderColor: colors.primary,
    backgroundColor: "#EEF8F9"
  },
  dangerButton: {
    borderColor: "#F3C2BD"
  },
  disabledButton: {
    opacity: 0.65
  },
  buttonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  },
  primaryButtonText: {
    color: colors.surface
  },
  dangerText: {
    color: colors.danger
  },
  message: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20
  },
  successMessage: {
    color: colors.primary
  },
  mutedMessage: {
    color: colors.muted
  },
  emptyState: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    padding: spacing.md
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    textAlign: "center"
  },
  pagination: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    marginTop: spacing.xs
  },
  pageButton: {
    minHeight: 40,
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: 2,
    justifyContent: "center",
    minWidth: 106,
    paddingHorizontal: spacing.sm
  },
  pageButtonPressed: {
    borderColor: colors.primary,
    backgroundColor: "#EEF8F9"
  },
  pageButtonDisabled: {
    opacity: 0.42
  },
  pageButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800"
  },
  pageText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800"
  }
});

const webInputReset = {
  outlineWidth: 0
} as TextStyle;

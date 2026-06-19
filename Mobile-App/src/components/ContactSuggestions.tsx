import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Contact } from "../api/hunasuna";
import { colors, spacing } from "../styles/theme";
import { contactName } from "../utils/format";

type Props = {
  contacts: Contact[];
  loading?: boolean;
  onSelect: (contact: Contact) => void;
  visible: boolean;
};

export function ContactSuggestions({ contacts, loading = false, onSelect, visible }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.box}>
      {loading ? (
        <View style={styles.stateRow}>
          <Feather color={colors.muted} name="loader" size={16} />
          <Text style={styles.stateText}>Ищем контакты...</Text>
        </View>
      ) : null}

      {!loading && !contacts.length ? (
        <View style={styles.stateRow}>
          <Feather color={colors.muted} name="search" size={16} />
          <Text style={styles.stateText}>Подходящих контактов нет</Text>
        </View>
      ) : null}

      {!loading ? contacts.map((contact) => (
        <Pressable
          key={contact.id}
          onPress={() => onSelect(contact)}
          style={({ pressed }) => [styles.item, pressed ? styles.itemPressed : null]}
        >
          <View style={styles.icon}>
            <Feather color={colors.primary} name="user" size={16} />
          </View>
          <View style={styles.textBlock}>
            <Text numberOfLines={1} style={styles.name}>
              {contactName(contact.firstName, contact.lastName)}
            </Text>
            <Text numberOfLines={1} style={styles.phone}>
              {contact.phone}
            </Text>
          </View>
        </Pressable>
      )) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  stateRow: {
    minHeight: 42,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm
  },
  stateText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  item: {
    minHeight: 52,
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm
  },
  itemPressed: {
    backgroundColor: "#EEF8F9"
  },
  icon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#EEF8F9"
  },
  textBlock: {
    flex: 1,
    minWidth: 0
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  phone: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 1
  }
});

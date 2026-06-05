import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Animated, Pressable, SafeAreaView, StyleSheet, View } from "react-native";
import { colors, spacing } from "../styles/theme";
import type { AppSection } from "../types/navigation";

type Props = {
  activeSection: AppSection | null;
  onSelect: (section: AppSection) => void;
};

type NavItem = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  section: AppSection;
};

type NavButtonProps = NavItem & {
  active: boolean;
  onSelect: (section: AppSection) => void;
};

const navItems: NavItem[] = [
  {
    icon: "book-open",
    label: "Записи",
    section: "records"
  },
  {
    icon: "users",
    label: "Контакты",
    section: "contacts"
  },
  {
    icon: "plus",
    label: "Создать\nзапись",
    section: "new-record"
  },
  {
    icon: "trash-2",
    label: "Удаленные",
    section: "deleted"
  },
  {
    icon: "settings",
    label: "Настройки",
    section: "settings"
  }
];

export function BottomNavigation({ activeSection, onSelect }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bar}>
        {navItems.map((item) => (
          <NavButton
            key={item.section}
            active={activeSection === item.section}
            icon={item.icon}
            label={item.label}
            onSelect={onSelect}
            section={item.section}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

function NavButton({ active, icon, label, onSelect, section }: NavButtonProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const [lift] = useState(() => new Animated.Value(0));
  const isCreate = section === "new-record";
  const iconColor = active ? colors.primary : colors.icon;

  function animate(toScale: number, toLift: number) {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: toScale,
        speed: 28,
        bounciness: 8,
        useNativeDriver: true
      }),
      Animated.spring(lift, {
        toValue: toLift,
        speed: 28,
        bounciness: 7,
        useNativeDriver: true
      })
    ]).start();
  }

  return (
    <Pressable
      accessibilityLabel={label.replace("\n", " ")}
      onPress={() => onSelect(section)}
      onPressIn={() => animate(0.9, 2)}
      onPressOut={() => animate(1, 0)}
      style={styles.item}
    >
      <Animated.View
        style={[
          styles.iconSlot,
          {
            transform: [{ translateY: lift }, { scale }]
          }
        ]}
      >
        <View style={[styles.iconBox, isCreate ? styles.createIconBox : null, isCreate && active ? styles.createIconBoxActive : null]}>
          <Feather color={iconColor} name={icon} size={31} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "transparent"
  },
  bar: {
    minHeight: 68,
    alignItems: "flex-start",
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm
  },
  item: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 2
  },
  iconSlot: {
    height: 48,
    alignItems: "center",
    justifyContent: "center"
  },
  iconBox: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent"
  },
  createIconBox: {
    width: 48,
    height: 48,
    borderColor: colors.icon,
    borderRadius: 24,
    borderWidth: 1.4,
    backgroundColor: "transparent"
  },
  createIconBoxActive: {
    borderColor: colors.primary
  },
});

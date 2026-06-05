import { Feather } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, type TextInputProps, type TextStyle, View } from "react-native";
import { revealSensitiveData, updateEmail, updatePassword, updateProfile, type SensitiveData } from "../api/hunasuna";
import { ActionButton, Message } from "../components/FormControls";
import { ScreenLayout } from "../components/ScreenLayout";
import { colors, spacing } from "../styles/theme";
import type { ApiUser } from "../types/api";

type Props = {
  onBack: () => void;
  onLogout: () => void;
  onUserChange: (user: ApiUser) => void;
  token: string;
  user: ApiUser;
};

type SettingsPanelId = "profile" | "sensitive" | "password" | "email" | null;

type SettingsFieldProps = Pick<TextInputProps, "autoCapitalize" | "editable" | "keyboardType" | "secureTextEntry"> & {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

export function SettingsScreen({ onBack, onLogout, onUserChange, token, user }: Props) {
  const [activePanel, setActivePanel] = useState<SettingsPanelId>("profile");
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [revealPassword, setRevealPassword] = useState("");
  const [sensitiveData, setSensitiveData] = useState<SensitiveData | null>(null);
  const [loadingAction, setLoadingAction] = useState<"profile" | "password" | "email" | "reveal" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  function showSuccess(text: string) {
    setMessageTone("success");
    setMessage(text);
  }

  function showError(error: unknown, fallback: string) {
    setMessageTone("error");
    setMessage(error instanceof Error ? error.message : fallback);
  }

  function togglePanel(panel: Exclude<SettingsPanelId, null>) {
    setActivePanel((current) => (current === panel ? null : panel));
  }

  async function saveProfile() {
    setLoadingAction("profile");
    setMessage(null);

    try {
      const result = await updateProfile(token, {
        firstName,
        lastName,
        phone
      });
      onUserChange(result.user);
      showSuccess("Профиль обновлен");
    } catch (error) {
      showError(error, "Не удалось обновить профиль");
    } finally {
      setLoadingAction(null);
    }
  }

  async function savePassword() {
    setLoadingAction("password");
    setMessage(null);

    try {
      await updatePassword(token, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      showSuccess("Пароль изменен");
    } catch (error) {
      showError(error, "Не удалось изменить пароль");
    } finally {
      setLoadingAction(null);
    }
  }

  async function saveEmail() {
    setLoadingAction("email");
    setMessage(null);

    try {
      await updateEmail(token, currentEmail, newEmail);
      setCurrentEmail("");
      setNewEmail("");
      showSuccess("E-mail изменен");
    } catch (error) {
      showError(error, "Не удалось изменить e-mail");
    } finally {
      setLoadingAction(null);
    }
  }

  async function revealData() {
    setLoadingAction("reveal");
    setMessage(null);

    try {
      const result = await revealSensitiveData(token, revealPassword);
      setSensitiveData(result.data);
      setRevealPassword("");
      showSuccess("Данные показаны");
    } catch (error) {
      showError(error, "Не удалось показать данные");
    } finally {
      setLoadingAction(null);
    }
  }

  function confirmLogout() {
    Alert.alert("Выйти из аккаунта?", "После выхода нужно будет снова ввести логин и пароль.", [
      {
        text: "Отмена",
        style: "cancel"
      },
      {
        text: "Выйти",
        style: "destructive",
        onPress: onLogout
      }
    ]);
  }

  return (
    <ScreenLayout onBack={onBack} title="Настройки">
      <View style={styles.content}>
        {message ? <Message tone={messageTone}>{message}</Message> : null}

        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Feather color={colors.primary} name="user" size={24} />
          </View>
          <View style={styles.accountText}>
            <Text numberOfLines={1} style={styles.login}>
              {user.login}
            </Text>
            {displayName ? (
              <Text numberOfLines={1} style={styles.accountMeta}>
                {displayName}
              </Text>
            ) : null}
          </View>
        </View>

        <SettingsPanel
          active={activePanel === "profile"}
          icon="user"
          onPress={() => togglePanel("profile")}
          title="Личные данные"
        >
          <SettingsField
            editable={false}
            icon="at-sign"
            label="Логин"
            onChangeText={() => undefined}
            placeholder="Логин"
            value={user.login}
          />
          <View style={styles.nameRow}>
            <View style={styles.nameItem}>
              <SettingsField icon="user" label="Имя" onChangeText={setFirstName} placeholder="Имя" value={firstName} />
            </View>
            <View style={styles.nameItem}>
              <SettingsField icon="user-check" label="Фамилия" onChangeText={setLastName} placeholder="Фамилия" value={lastName} />
            </View>
          </View>
          <SettingsField
            icon="phone"
            keyboardType="phone-pad"
            label="Мобильный номер"
            onChangeText={setPhone}
            placeholder="Мобильный номер"
            value={phone}
          />
          <ActionButton icon="save" loading={loadingAction === "profile"} onPress={saveProfile}>
            Сохранить
          </ActionButton>
        </SettingsPanel>

        <SettingsPanel
          active={activePanel === "password"}
          icon="lock"
          onPress={() => togglePanel("password")}
          title="Смена пароля"
        >
          <SettingsField
            icon="lock"
            label="Текущий пароль"
            onChangeText={setCurrentPassword}
            placeholder="Текущий пароль"
            secureTextEntry
            value={currentPassword}
          />
          <SettingsField
            icon="shield"
            label="Новый пароль"
            onChangeText={setNewPassword}
            placeholder="Новый пароль"
            secureTextEntry
            value={newPassword}
          />
          <ActionButton icon="lock" loading={loadingAction === "password"} onPress={savePassword}>
            Изменить пароль
          </ActionButton>
        </SettingsPanel>

        <SettingsPanel
          active={activePanel === "email"}
          icon="mail"
          onPress={() => togglePanel("email")}
          title="Смена E-mail"
        >
          <SettingsField
            autoCapitalize="none"
            icon="mail"
            keyboardType="email-address"
            label="Текущий E-mail"
            onChangeText={setCurrentEmail}
            placeholder="Текущий E-mail"
            value={currentEmail}
          />
          <SettingsField
            autoCapitalize="none"
            icon="send"
            keyboardType="email-address"
            label="Новый E-mail"
            onChangeText={setNewEmail}
            placeholder="Новый E-mail"
            value={newEmail}
          />
          <ActionButton icon="mail" loading={loadingAction === "email"} onPress={saveEmail}>
            Изменить E-mail
          </ActionButton>
        </SettingsPanel>

        <SettingsPanel
          active={activePanel === "sensitive"}
          icon="eye"
          onPress={() => togglePanel("sensitive")}
          title="Скрытые данные"
        >
          <SettingsField
            icon="key"
            label="Текущий пароль"
            onChangeText={setRevealPassword}
            placeholder="Текущий пароль"
            secureTextEntry
            value={revealPassword}
          />
          <ActionButton icon="eye" loading={loadingAction === "reveal"} onPress={revealData} tone="secondary">
            Показать данные
          </ActionButton>
          {sensitiveData ? (
            <View style={styles.sensitiveData}>
              <DataRow icon="mail" label="E-mail" value={sensitiveData.email || "не указан"} />
              <DataRow icon="phone" label="Телефон" value={sensitiveData.phone || "не указан"} />
            </View>
          ) : null}
        </SettingsPanel>

        <Pressable onPress={confirmLogout} style={({ pressed }) => [styles.logoutButton, pressed ? styles.logoutButtonPressed : null]}>
          <View style={styles.logoutIcon}>
            <Feather color={colors.danger} name="log-out" size={20} />
          </View>
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}

function SettingsPanel({
  active,
  children,
  icon,
  onPress,
  title
}: {
  active: boolean;
  children: ReactNode;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  title: string;
}) {
  return (
    <View style={styles.panel}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.panelHeader, pressed ? styles.panelHeaderPressed : null]}>
        <View style={styles.panelTitleRow}>
          <Feather color={colors.primary} name={icon} size={19} />
          <Text style={styles.panelTitle}>{title}</Text>
        </View>
        <Feather color={colors.muted} name={active ? "chevron-up" : "chevron-down"} size={20} />
      </Pressable>
      {active ? <View style={styles.panelBody}>{children}</View> : null}
    </View>
  );
}

function SettingsField({
  autoCapitalize,
  editable = true,
  icon,
  keyboardType = "default",
  label,
  onChangeText,
  placeholder,
  secureTextEntry,
  value
}: SettingsFieldProps) {
  return (
    <View style={[styles.field, !editable ? styles.fieldReadonly : null]}>
      <Feather color={editable ? colors.primary : colors.muted} name={icon} size={18} />
      <View style={styles.fieldBody}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TextInput
          autoCapitalize={autoCapitalize}
          editable={editable}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry}
          style={[styles.input, webInputReset, !editable ? styles.inputReadonly : null]}
          value={value}
        />
      </View>
    </View>
  );
}

function DataRow({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <Feather color={colors.muted} name={icon} size={17} />
      <Text style={styles.dataLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.dataValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.sm
  },
  accountCard: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md
  },
  avatar: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: "#EEF8F9"
  },
  accountText: {
    flex: 1
  },
  login: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800"
  },
  accountMeta: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 2
  },
  panel: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  panelHeader: {
    minHeight: 52,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md
  },
  panelHeaderPressed: {
    backgroundColor: "#EEF8F9"
  },
  panelTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  panelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  panelBody: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.sm,
    padding: spacing.md
  },
  nameRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  nameItem: {
    flex: 1
  },
  field: {
    minHeight: 58,
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm
  },
  fieldReadonly: {
    backgroundColor: "#EEF2F6"
  },
  fieldBody: {
    flex: 1,
    paddingVertical: spacing.xs
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  input: {
    minHeight: 28,
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
    padding: 0
  },
  inputReadonly: {
    color: colors.muted
  },
  sensitiveData: {
    gap: spacing.xs,
    paddingTop: spacing.xs
  },
  dataRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 30
  },
  dataLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700"
  },
  dataValue: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right"
  },
  logoutButton: {
    minHeight: 52,
    alignItems: "center",
    borderColor: "#F3C2BD",
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: "#FFF7F7",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md
  },
  logoutButtonPressed: {
    backgroundColor: "#FDECEA"
  },
  logoutIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "800"
  }
});

const webInputReset = {
  outlineWidth: 0
} as TextStyle;

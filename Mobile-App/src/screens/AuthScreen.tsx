import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import logoSource from "../../assets/hunasuna-auth-logo.png";
import { apiRequest } from "../api/client";
import { saveMobileSession } from "../auth/session-store";
import { colors, spacing } from "../styles/theme";
import type { ApiUser, MobileSession } from "../types/api";

type AuthMode = "login" | "register" | "recovery";

type AuthPayload = {
  user: ApiUser;
  session: MobileSession;
};

type Props = {
  onAuthenticated: (user: ApiUser, session: MobileSession) => void;
};

export function AuthScreen({ onAuthenticated }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secretQuestion, setSecretQuestion] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [recoveryQuestion, setRecoveryQuestion] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function scrollToAuthForm(y = 96) {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ animated: true, y });
    }, 80);
  }

  async function completeAuth(payload: AuthPayload) {
    await saveMobileSession(payload.session);
    onAuthenticated(payload.user, payload.session);
  }

  async function submitLogin() {
    setLoading(true);
    setMessage(null);

    try {
      const result = await apiRequest<AuthPayload>("/api/auth", {
        method: "POST",
        body: {
          action: "login",
          client: "mobile",
          login,
          password,
          remember: true
        }
      });

      await completeAuth(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  async function submitRegister() {
    setLoading(true);
    setMessage(null);

    try {
      const result = await apiRequest<AuthPayload>("/api/auth", {
        method: "POST",
        body: {
          action: "register",
          client: "mobile",
          login,
          email,
          phone,
          password,
          confirmPassword,
          secretQuestion,
          secretAnswer
        }
      });

      await completeAuth(result);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось создать аккаунт");
    } finally {
      setLoading(false);
    }
  }

  async function requestRecoveryQuestion() {
    setLoading(true);
    setMessage(null);

    try {
      const result = await apiRequest<{ secretQuestion: string }>("/api/auth", {
        method: "POST",
        body: {
          action: "request-password-recovery",
          target: login
        }
      });

      setRecoveryQuestion(result.secretQuestion);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось получить вопрос");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    setLoading(true);
    setMessage(null);

    try {
      await apiRequest<Record<string, never>>("/api/auth", {
        method: "POST",
        body: {
          action: "reset-password",
          target: login,
          secretAnswer,
          newPassword,
          confirmPassword
        }
      });

      setPassword("");
      setNewPassword("");
      setSecretAnswer("");
      setRecoveryQuestion("");
      setMode("login");
      setMessage("Пароль изменен");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось изменить пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, keyboardVisible ? styles.scrollContentKeyboard : null]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
            <View style={[styles.header, keyboardVisible ? styles.headerKeyboard : null]}>
              <AnimatedBrand compact={keyboardVisible} />
            </View>

            <View style={[styles.segment, keyboardVisible ? styles.segmentKeyboard : null]}>
              <ModeButton active={mode === "login"} label="Вход" onPress={() => setMode("login")} />
              <ModeButton active={mode === "register"} label="Регистрация" onPress={() => setMode("register")} />
              <ModeButton active={mode === "recovery"} label="Восстановление" onPress={() => setMode("recovery")} />
            </View>

            <View style={styles.form}>
              <TextInput
                autoCapitalize="none"
                onFocus={() => scrollToAuthForm(64)}
                onChangeText={setLogin}
                placeholder="Логин"
                placeholderTextColor={colors.muted}
                returnKeyType="next"
                style={styles.input}
                value={login}
              />

              {mode !== "recovery" ? (
                <TextInput
                  onFocus={() => scrollToAuthForm(112)}
                  onChangeText={setPassword}
                  placeholder="Пароль"
                  placeholderTextColor={colors.muted}
                  returnKeyType="done"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                />
              ) : null}

              {mode === "register" ? (
                <>
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onFocus={() => scrollToAuthForm(156)}
                    onChangeText={setEmail}
                    placeholder="Email, если есть"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={email}
                  />
                  <TextInput
                    keyboardType="phone-pad"
                    onFocus={() => scrollToAuthForm(196)}
                    onChangeText={setPhone}
                    placeholder="Телефон, если есть"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={phone}
                  />
                  <TextInput
                    onFocus={() => scrollToAuthForm(236)}
                    onChangeText={setConfirmPassword}
                    placeholder="Повторите пароль"
                    placeholderTextColor={colors.muted}
                    secureTextEntry
                    style={styles.input}
                    value={confirmPassword}
                  />
                  <TextInput
                    onFocus={() => scrollToAuthForm(276)}
                    onChangeText={setSecretQuestion}
                    placeholder="Секретный вопрос"
                    placeholderTextColor={colors.muted}
                    style={styles.input}
                    value={secretQuestion}
                  />
                  <TextInput
                    onFocus={() => scrollToAuthForm(316)}
                    onChangeText={setSecretAnswer}
                    placeholder="Секретный ответ"
                    placeholderTextColor={colors.muted}
                    secureTextEntry
                    style={styles.input}
                    value={secretAnswer}
                  />
                </>
              ) : null}

              {mode === "recovery" ? (
                <>
                  {recoveryQuestion ? <Text style={styles.question}>{recoveryQuestion}</Text> : null}
                  {recoveryQuestion ? (
                    <>
                      <TextInput
                        onFocus={() => scrollToAuthForm(128)}
                        onChangeText={setSecretAnswer}
                        placeholder="Секретный ответ"
                        placeholderTextColor={colors.muted}
                        secureTextEntry
                        style={styles.input}
                        value={secretAnswer}
                      />
                      <TextInput
                        onFocus={() => scrollToAuthForm(172)}
                        onChangeText={setNewPassword}
                        placeholder="Новый пароль"
                        placeholderTextColor={colors.muted}
                        secureTextEntry
                        style={styles.input}
                        value={newPassword}
                      />
                      <TextInput
                        onFocus={() => scrollToAuthForm(216)}
                        onChangeText={setConfirmPassword}
                        placeholder="Повторите пароль"
                        placeholderTextColor={colors.muted}
                        secureTextEntry
                        style={styles.input}
                        value={confirmPassword}
                      />
                    </>
                  ) : null}
                </>
              ) : null}

              {message ? <Text style={styles.message}>{message}</Text> : null}

              <Pressable
                disabled={loading}
                onPress={
                  mode === "login"
                    ? submitLogin
                    : mode === "register"
                      ? submitRegister
                      : recoveryQuestion
                        ? resetPassword
                        : requestRecoveryQuestion
                }
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed ? styles.primaryButtonPressed : null,
                  loading ? styles.disabledButton : null
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    {mode === "login"
                      ? "Войти"
                      : mode === "register"
                        ? "Создать аккаунт"
                        : recoveryQuestion
                          ? "Изменить пароль"
                          : "Показать вопрос"}
                  </Text>
                )}
              </Pressable>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AnimatedBrand({ compact }: { compact: boolean }) {
  const [motion] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(motion, {
        duration: 4600,
        easing: Easing.inOut(Easing.sin),
        toValue: 1,
        useNativeDriver: true
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [motion]);

  const haloOpacity = motion.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.06, 0.14, 0.06]
  });
  const haloScale = motion.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.98, 1.04, 0.98]
  });
  const sweepX = motion.interpolate({
    inputRange: [0, 1],
    outputRange: [-84, 132]
  });
  const sweepOpacity = motion.interpolate({
    inputRange: [0, 0.22, 0.42, 1],
    outputRange: [0, 0.08, 0, 0]
  });

  return (
    <View accessibilityLabel="HunaSuna" accessible style={styles.brand}>
      <View style={[styles.logoStage, compact ? styles.logoStageCompact : null]}>
        <Animated.View
          style={[styles.logoHalo, compact ? styles.logoHaloCompact : null, { opacity: haloOpacity, transform: [{ scale: haloScale }] }]}
        />
        <View style={[styles.logoFrame, compact ? styles.logoFrameCompact : null]}>
          <Image
            alt="HunaSuna"
            fadeDuration={0}
            resizeMode="contain"
            source={logoSource}
            style={[styles.logoImage, compact ? styles.logoImageCompact : null]}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.logoSweep, { opacity: sweepOpacity, transform: [{ translateX: sweepX }, { rotate: "16deg" }] }]}
          />
        </View>
      </View>
      <View style={styles.brandNameRow}>
        <Text style={[styles.brandNameDark, compact ? styles.brandNameCompact : null]}>Huna</Text>
        <Text style={[styles.brandNameAccent, compact ? styles.brandNameCompact : null]}>Suna</Text>
      </View>
    </View>
  );
}

function ModeButton({
  active,
  label,
  onPress
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.modeButton, active ? styles.modeButtonActive : null]}>
      <Text style={[styles.modeButtonText, active ? styles.modeButtonTextActive : null]}>{label}</Text>
    </Pressable>
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
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: "center",
    minHeight: 620
  },
  scrollContentKeyboard: {
    justifyContent: "flex-start",
    minHeight: 0,
    paddingTop: spacing.sm,
    paddingBottom: 320
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.lg
  },
  headerKeyboard: {
    marginBottom: spacing.sm
  },
  brand: {
    alignItems: "center",
    gap: spacing.sm,
    width: "100%"
  },
  logoStage: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center"
  },
  logoStageCompact: {
    width: 100,
    height: 100
  },
  logoHalo: {
    position: "absolute",
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: colors.primary
  },
  logoHaloCompact: {
    width: 92,
    height: 92,
    borderRadius: 46
  },
  logoFrame: {
    width: 126,
    height: 126,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 63,
    overflow: "hidden",
    shadowColor: "#083E43",
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.16,
    shadowRadius: 16
  },
  logoFrameCompact: {
    width: 86,
    height: 86,
    borderRadius: 43,
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.12,
    shadowRadius: 10
  },
  logoImage: {
    width: 126,
    height: 126
  },
  logoImageCompact: {
    width: 86,
    height: 86
  },
  logoSweep: {
    position: "absolute",
    width: 22,
    height: 160,
    backgroundColor: colors.surface
  },
  brandNameRow: {
    flexDirection: "row",
    flexWrap: "nowrap"
  },
  brandNameDark: {
    color: "#061B2D",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 39
  },
  brandNameAccent: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 39
  },
  brandNameCompact: {
    fontSize: 26,
    lineHeight: 31
  },
  segment: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.lg,
    overflow: "hidden"
  },
  segmentKeyboard: {
    marginBottom: spacing.sm
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs
  },
  modeButtonActive: {
    backgroundColor: colors.primary
  },
  modeButtonText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center"
  },
  modeButtonTextActive: {
    color: colors.surface
  },
  form: {
    gap: spacing.sm
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
  question: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22
  },
  message: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20
  },
  primaryButton: {
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginTop: spacing.sm
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed
  },
  disabledButton: {
    opacity: 0.7
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: "700"
  }
});

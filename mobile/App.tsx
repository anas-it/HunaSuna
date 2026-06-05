import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { apiRequest, setUnauthorizedHandler } from "./src/api/client";
import { clearMobileSession, loadMobileSession } from "./src/auth/session-store";
import { BottomNavigation } from "./src/components/BottomNavigation";
import { AuthScreen } from "./src/screens/AuthScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { SectionScreen } from "./src/screens/SectionScreen";
import { colors } from "./src/styles/theme";
import type { ApiUser, MobileSession } from "./src/types/api";
import type { AppSection } from "./src/types/navigation";

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [session, setSession] = useState<MobileSession | null>(null);
  const [activeSection, setActiveSection] = useState<AppSection | null>(null);
  const [initialSearchQuery, setInitialSearchQuery] = useState("");
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearMobileSession();
      setSession(null);
      setUser(null);
      setActiveSection(null);
      setInitialSearchQuery("");
      setHighlightedRecordId(null);
      setBootError("Сессия завершена. Войдите снова.");
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const storedSession = await loadMobileSession();

        if (!storedSession) {
          return;
        }

        const result = await apiRequest<{ user: ApiUser }>("/api/users/me", {
          token: storedSession.token
        });

        setSession(storedSession);
        setUser(result.user);
      } catch (error) {
        await clearMobileSession();
        setBootError(error instanceof Error ? error.message : "Сессия завершена");
      } finally {
        setBooting(false);
      }
    }

    void bootstrap();
  }, []);

  async function logout() {
    try {
      if (session) {
        await apiRequest<Record<string, never>>("/api/auth", {
          method: "POST",
          token: session.token,
          body: {
            action: "logout"
          }
        });
      }
    } finally {
      await clearMobileSession();
      setSession(null);
      setUser(null);
      setActiveSection(null);
      setInitialSearchQuery("");
      setHighlightedRecordId(null);
    }
  }

  function openSearch(query: string) {
    setInitialSearchQuery(query);
    setHighlightedRecordId(null);
    setActiveSection("search");
  }

  function openSection(section: AppSection) {
    setInitialSearchQuery("");
    setHighlightedRecordId(null);
    setActiveSection(section);
  }

  function openSavedRecord(recordId: string) {
    setInitialSearchQuery("");
    setHighlightedRecordId(recordId);
    setActiveSection("records");
  }

  if (booting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      {user && session ? (
        <View style={styles.loggedInShell}>
          <View style={styles.contentArea}>
            {activeSection ? (
              <SectionScreen
                highlightedRecordId={activeSection === "records" ? highlightedRecordId : null}
                onBack={() => setActiveSection(null)}
                onLogout={logout}
                onRecordSaved={openSavedRecord}
                onUserChange={setUser}
                section={activeSection}
                token={session.token}
                user={user}
                initialSearchQuery={activeSection === "search" ? initialSearchQuery : ""}
              />
            ) : (
              <HomeScreen user={user} onOpenSection={openSection} onSearch={openSearch} token={session.token} />
            )}
          </View>
          <BottomNavigation activeSection={activeSection} onSelect={openSection} />
        </View>
      ) : (
        <AuthScreen
          onAuthenticated={(nextUser, nextSession) => {
            setUser(nextUser);
            setSession(nextSession);
            setActiveSection(null);
            setHighlightedRecordId(null);
            setBootError(null);
          }}
        />
      )}
      {bootError ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{bootError}</Text>
        </View>
      ) : null}
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  },
  loggedInShell: {
    flex: 1,
    backgroundColor: colors.background
  },
  contentArea: {
    flex: 1
  },
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: colors.text,
    justifyContent: "center",
    paddingHorizontal: 14
  },
  toastText: {
    color: colors.surface,
    fontSize: 14
  }
});

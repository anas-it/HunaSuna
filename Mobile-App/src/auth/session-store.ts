import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { MobileSession } from "../types/api";

const SESSION_KEY = "hunasuna.mobileSession";

function canUseWebSessionStorage() {
  return Platform.OS === "web" && typeof window !== "undefined" && Boolean(window.sessionStorage);
}

export async function saveMobileSession(session: MobileSession) {
  if (canUseWebSessionStorage()) {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return;
  }

  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function loadMobileSession() {
  const value = canUseWebSessionStorage()
    ? window.sessionStorage.getItem(SESSION_KEY)
    : await SecureStore.getItemAsync(SESSION_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as MobileSession;
  } catch {
    await clearMobileSession();
    return null;
  }
}

export async function clearMobileSession() {
  if (canUseWebSessionStorage()) {
    window.sessionStorage.removeItem(SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(SESSION_KEY);
}

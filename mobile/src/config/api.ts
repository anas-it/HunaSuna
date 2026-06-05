import { Platform } from "react-native";

const nativeApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
const webApiBaseUrl = process.env.EXPO_PUBLIC_WEB_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const API_BASE_URL = Platform.OS === "web" ? webApiBaseUrl : nativeApiBaseUrl;

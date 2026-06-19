# Mobile HunaSuna

`Mobile-App/` содержит Expo React Native приложение HunaSuna. Приложение использует общий backend из `../Web-Project/` и не имеет отдельного сервера.

## Главные файлы

| Файл | Назначение |
| --- | --- |
| `App.tsx` | Точка входа и текущая простая навигация приложения. |
| `app.json` | Expo config, bundle id, iPhone-only настройка и assets. |
| `eas.json` | EAS Build/Submit profiles. |
| `store-listing.md` | Черновик страницы App Store и App Review notes. |
| `.env.example` | Пример локальных API URL. |

## src

| Папка | Назначение |
| --- | --- |
| `src/api/` | API client и функции работы с HunaSuna API. |
| `src/auth/` | Хранение мобильной сессии. Native использует SecureStore. |
| `src/components/` | Мобильные UI-компоненты. |
| `src/config/` | Настройки API URL. |
| `src/screens/` | Экраны приложения. |
| `src/styles/` | Цвета и тема. |
| `src/types/` | Общие TypeScript-типы. |
| `src/utils/` | Локальные helpers приложения. |

## App Store

- Первый релиз настроен только для iPhone: `ios.supportsTablet` отключен.
- Bundle ID: `pro.hunasuna.mobile`.
- Production API URL задается в EAS environment: `https://hunasuna.pro`.
- План публикации: `../plans/active-plans/01-app-store-публикация.md`.

## Команды

```powershell
npx tsc --noEmit
npx expo-doctor
npx expo start
npx eas-cli@latest build --platform ios --profile production
```

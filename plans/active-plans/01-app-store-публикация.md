# План публикации HunaSuna в App Store

## Статус

План активный.

Цель: подготовить и отправить мобильное приложение HunaSuna в App Store через Expo EAS Build, EAS Submit, TestFlight и App Store Connect.

## Важные решения

- Первый релиз публикуем как приложение учета информации о переводах.
- В описании и App Review Notes явно указываем, что HunaSuna не переводит деньги, не хранит деньги и не является банком, обменником, платежной системой или финансовым посредником.
- Для production web-сайта используется httpOnly cookie, для native mobile app - bearer session token в SecureStore.
- Политика конфиденциальности: `https://hunasuna.pro/privacy`.
- Production API URL для App Store build: `https://hunasuna.pro`.
- Bundle ID: `pro.hunasuna.mobile`.
- Первый релиз публикуем только для iPhone; `ios.supportsTablet` отключен.
- Expo project owner: `hunasuna-smr`.
- Expo app slug: `hunasuna-mobile`.
- App version первого релиза: `1.0.0`.
- Сборка для App Store должна использовать iOS 26 SDK или новее, потому что с 28 апреля 2026 Apple требует iOS/iPadOS apps, собранные с iOS 26 SDK или позже.

## Шаг 1: Проверить локальную готовность проекта

- Проверить `mobile/app.json`:
  - `name`: `HunaSuna`;
  - `ios.bundleIdentifier`: `pro.hunasuna.mobile`;
  - `ios.infoPlist.ITSAppUsesNonExemptEncryption`: `false`;
  - `extra.eas.projectId` заполнен.
- Проверить `mobile/eas.json`:
  - есть `build.production`;
  - есть `submit.production`.
- Выполнить:

```powershell
cd mobile
npx expo-doctor
npx tsc --noEmit
npx expo config --json
```

## Шаг 2: Проверить аккаунты

- Expo account должен быть залогинен:

```powershell
cd mobile
npx eas-cli@latest whoami
```

- Нужен активный Apple Developer Program account.
- В App Store Connect нужна роль, которая может создавать приложение, загружать builds и отправлять на review.

Как оформить Apple Developer Program:

- Включить двухфакторную аутентификацию для Apple Account.
- Выбрать тип регистрации:
  - individual, если приложение публикуется от имени физического лица;
  - organization, если приложение публикуется от компании.
- Для individual подготовить юридическое имя, телефон, адрес и документ, если Apple запросит проверку личности.
- Для organization подготовить юридическое название компании, D-U-N-S Number, рабочий email на домене компании, публичный сайт и подтверждение права подписывать соглашения.
- Пройти регистрацию на `https://developer.apple.com/programs/enroll/` или через Apple Developer app.
- После проверки принять Apple Developer Program License Agreement и оплатить годовую подписку.
- После активации проверить доступ в App Store Connect и Apple Developer Certificates, Identifiers & Profiles.

## Шаг 3: Создать приложение в App Store Connect

В App Store Connect создать новое iOS app:

- Platform: `iOS`;
- Name: `HunaSuna`;
- Primary language: выбрать основной язык релиза;
- Bundle ID: `pro.hunasuna.mobile`;
- SKU: например `hunasuna-mobile-ios`;
- User Access: полный доступ или нужная команда.

## Шаг 4: Подготовить App Store metadata

Использовать `mobile/store-listing.md` как основу.

Минимально заполнить:

- subtitle;
- description;
- keywords;
- support URL;
- privacy policy URL;
- category;
- age rating;
- app privacy answers;
- screenshots;
- review contact;
- App Review Notes.

Рекомендуемые App Review Notes:

```text
HunaSuna is an information accounting tool for transfer records. The app does not move money, store money, provide balances, cards, wallets, exchange, payment processing, fees, or financial mediation. Test account credentials are provided only for review of the record/accounting workflow.
```

## Шаг 5: Подготовить тестовый аккаунт для Apple Review

Создать отдельный тестовый аккаунт без реальных персональных данных.

В App Review Information указать:

- login;
- password;
- короткую инструкцию: открыть записи, создать запись, открыть контакты, удалить запись и восстановить ее.

Не использовать реальные данные клиентов.

## Шаг 6: Собрать production iOS build

```powershell
cd mobile
npx eas-cli@latest build --platform ios --profile production
```

Во время первой сборки EAS может попросить войти в Apple account и настроить signing credentials.

## Шаг 7: Проверить build в TestFlight

После загрузки build:

- открыть App Store Connect;
- дождаться обработки build;
- добавить build в TestFlight;
- протестировать вход, регистрацию, контакты, записи, поиск, удаленные записи, настройки и выход.

## Шаг 8: Отправить build в App Store

Можно отправить через EAS:

```powershell
cd mobile
npx eas-cli@latest submit --platform ios --profile production
```

Или вручную выбрать build в App Store Connect и отправить на review.

## Шаг 9: Следить за review

- Если Apple задаст вопрос, отвечать через App Review в App Store Connect.
- Если ревьюер не понял назначение продукта, повторить, что приложение только учитывает информацию и не выполняет финансовые операции.
- При отклонении исправить причину, собрать новый build и отправить повторно.

## Шаг 10: Релиз

После approval выбрать:

- manual release, если нужно сначала проверить страницу;
- automatic release, если можно выпускать сразу.

После публикации проверить страницу App Store, вход в production API и политику конфиденциальности.

## Что я уже проверил

- `npx eas-cli@latest whoami` показывает Expo account `hunasuna` и owner-доступ к `hunasuna-smr`.
- `npx expo-doctor` прошел без ошибок.
- `npx tsc --noEmit` в `mobile/` прошел без ошибок.
- `npx expo config --json` показывает SDK `54.0.0`, Bundle ID `pro.hunasuna.mobile` и EAS project id.
- `https://hunasuna.pro/privacy` и `https://hunasuna.pro/api/auth` отвечают `200 OK`.
- В `mobile/eas.json` production build привязан к EAS environment `production`.
- В EAS production environment созданы `EXPO_PUBLIC_API_BASE_URL=https://hunasuna.pro` и `EXPO_PUBLIC_WEB_API_BASE_URL=https://hunasuna.pro`.
- В `mobile/app.json` отключен `ios.supportsTablet`, чтобы первый App Store release был только для iPhone.

## Открытые вопросы перед сборкой

- Есть ли активный Apple Developer Program account.
- Под каким Apple team публикуем приложение.

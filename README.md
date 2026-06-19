# HunaSuna

HunaSuna - инструмент учета информации о переводах. Проект помогает хранить контакты, записи, суммы, валюты, курс, дату, поиск и историю.

HunaSuna не переводит деньги, не хранит деньги и не является банком, обменником, кошельком, платежной системой или финансовым посредником.

## С чего начинать

1. Общая карта проекта: `specification/global-specs/00-project-overview.md`.
2. Карта всех спецификаций: `specification/README.md`.
3. Текущая работа: `plans/active-plans/README.md`.
4. История завершенных этапов: `plans/completed-plans/README.md`.
5. Заметные изменения: `CHANGELOG.md`.

## Главные папки

| Папка | Что внутри |
| --- | --- |
| `.agents/` | Быстрый вход в правила для AI-агентов. Главный файл остается `AGENTS.md`. |
| `.skills/` | Быстрый вход в рабочие скилы. Главные файлы остаются в `skills/`. |
| `.vscode/` | Настройки VS Code, которые скрывают служебный мусор из Explorer. |
| `Web-Project/` | Next.js web-сайт, общий backend API, Prisma, web-компоненты, web-скрипты и web-конфиги. |
| `Mobile-App/` | Expo React Native мобильное приложение. |
| `specification/` | Постоянные спеки проекта. |
| `skills/` | Рабочие инструкции по направлениям разработки. |
| `plans/` | Рабочие планы: текущие в `plans/active-plans/`, выполненные в `plans/completed-plans/`. |

## Команды

Web:

```powershell
cd Web-Project
npm run dev
npm run lint
npm run build
npm run test:api
```

Prisma:

```powershell
cd Web-Project
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

Mobile:

```powershell
cd Mobile-App
npx tsc --noEmit
npx expo-doctor
npx expo start
```

App Store:

```powershell
cd Mobile-App
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --profile production
```

## Деплой

Для Vercel нужно указать Root Directory: `Web-Project`.

Иначе Vercel будет искать `package.json`, `next.config.ts` и `vercel.json` в корне `SAID`, хотя web-проект теперь находится внутри `Web-Project/`.

## Важные правила

- На сайте использовать слово "запись", не "тикет".
- Не добавлять реальные платежи, балансы, карты, кошельки, комиссии и обмен денег.
- Каждый пользователь видит только свои данные.
- API должен отдавать только нужные поля.
- Бизнес-логика живет в `Web-Project/server/services`, а route handlers в `Web-Project/app/api` остаются тонкими.
- Мобильное приложение использует общий API и не имеет отдельного backend.
- Удаленная запись 7 дней видна в разделе `Удаленные`, затем исчезает из web/mobile интерфейса и остается только в техническом архиве базы данных.

## Служебные папки

`node_modules/`, `.next/`, `.pglite/`, `.codex-logs/`, `.expo/`, `*.log`, `*.tsbuildinfo` и локальные `.env` файлы являются служебными или локальными. Они не являются частью ручной структуры проекта и игнорируются Git.

В VS Code эти файлы скрываются через `.vscode/settings.json`, чтобы Explorer показывал в основном рабочие папки проекта.

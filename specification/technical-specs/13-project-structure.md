# Структура проекта HunaSuna

## Назначение документа

Этот документ описывает, как организована структура кода HunaSuna после разделения web-сайта и мобильного приложения.

Цель - держать два приложения отдельно, но оставить общие спеки, планы, скилы и правила в корне проекта.

## Главный принцип

Код должен быть разделен по ответственности:

- `Web-Project/` отвечает за web-сайт, общий backend API, Prisma и web-деплой;
- `Mobile-App/` отвечает за Expo React Native приложение;
- `specification/`, `plans/`, `skills/`, `.agents/`, `.skills/`, `AGENTS.md`, `CHANGELOG.md` и корневой `README.md` остаются в корне `SAID`.

Важную бизнес-логику нельзя держать только в UI-компонентах или прямо внутри route-файлов.

## Корень проекта

В корне `SAID` должны быть:

- `.agents/`;
- `.skills/`;
- `.vscode/`;
- `Web-Project/`;
- `Mobile-App/`;
- `specification/`;
- `skills/`;
- `plans/`;
- `AGENTS.md`;
- `CHANGELOG.md`;
- `README.md`;
- `.gitignore`.

В корне не должны лежать рабочие папки web-кода вроде `app/`, `components/`, `server/`, `lib/`, `prisma/`, `public/`, `scripts/` и web `package.json`. Они должны находиться внутри `Web-Project/`.

Папки `.agents` и `.skills` являются навигационными входами для удобства в редакторе. Главный файл правил агента остается `AGENTS.md`, а рабочие скилы остаются в `skills/`.

## Web-Project

`Web-Project/` содержит Next.js web-сайт и общий backend, который используют web и mobile.

Рекомендуемая структура:

- `Web-Project/app` - страницы Next.js, route handlers и server actions;
- `Web-Project/app/api` - API endpoints для web и mobile;
- `Web-Project/components` - web UI-компоненты;
- `Web-Project/server/services` - бизнес-логика;
- `Web-Project/server/db` - работа с базой данных;
- `Web-Project/server/auth` - авторизация и проверка доступа;
- `Web-Project/server/validators` - проверка входящих данных;
- `Web-Project/server/jobs` - фоновые задачи;
- `Web-Project/server/logs` - технические логи безопасности;
- `Web-Project/lib` - общие web/backend helpers без бизнес-логики;
- `Web-Project/prisma` - Prisma schema и миграции;
- `Web-Project/public` - статичные файлы web-приложения;
- `Web-Project/scripts` - ручные технические скрипты;
- `Web-Project/package.json` - команды web-проекта;
- `Web-Project/vercel.json` - настройки Vercel Cron Jobs.

Команды web-проекта нужно запускать из `Web-Project/`:

```powershell
cd Web-Project
npm run dev
npm run lint
npm run build
```

Для деплоя на Vercel корневую папку проекта в настройках Vercel нужно указать как `Web-Project`.

## Web: app

`Web-Project/app` отвечает за страницы Next.js и маршруты приложения.

Рекомендуемая структура:

- `Web-Project/app/page.tsx` - приветствие или входная страница;
- `Web-Project/app/register/page.tsx` - регистрация;
- `Web-Project/app/login/page.tsx` - вход;
- `Web-Project/app/forgot-password/page.tsx` - восстановление пароля;
- `Web-Project/app/dashboard/page.tsx` - главная после входа;
- `Web-Project/app/contacts/page.tsx` - список контактов;
- `Web-Project/app/contacts/[id]/page.tsx` - просмотр контакта;
- `Web-Project/app/records/page.tsx` - история записей;
- `Web-Project/app/records/new/page.tsx` - создание записи;
- `Web-Project/app/records/[id]/page.tsx` - просмотр записи;
- `Web-Project/app/deleted/page.tsx` - удаленные записи;
- `Web-Project/app/settings/page.tsx` - личный кабинет и настройки.

## Web: app/api

`Web-Project/app/api` отвечает за API endpoints.

Рекомендуемая структура:

- `Web-Project/app/api/auth/route.ts` - регистрация, вход, выход и восстановление;
- `Web-Project/app/api/users/me/route.ts` - данные текущего пользователя и удаление собственного аккаунта;
- `Web-Project/app/api/settings/route.ts` - изменение пароля, имени, фамилии, email и мобильного номера;
- `Web-Project/app/api/contacts/route.ts` - список и создание контактов;
- `Web-Project/app/api/contacts/[id]/route.ts` - просмотр, редактирование и удаление контакта;
- `Web-Project/app/api/records/route.ts` - список и создание записей;
- `Web-Project/app/api/records/[id]/route.ts` - просмотр, редактирование и удаление записи;
- `Web-Project/app/api/deleted-records/route.ts` - список удаленных записей;
- `Web-Project/app/api/deleted-records/[id]/restore/route.ts` - восстановление удаленной записи;
- `Web-Project/app/api/search/route.ts` - поиск по контакту и номеру телефона;
- `Web-Project/app/api/cron/deleted-records/route.ts` - фоновое архивирование удаленных записей после срока восстановления.

Route-файлы должны быть тонкими: принять запрос, проверить пользователя, вызвать service и вернуть ответ.

## Web: server

`Web-Project/server` отвечает за серверную часть проекта.

Рекомендуемая структура:

- `Web-Project/server/services`;
- `Web-Project/server/db`;
- `Web-Project/server/auth`;
- `Web-Project/server/validators`;
- `Web-Project/server/jobs`;
- `Web-Project/server/logs`.

Services должны проверять правила проекта:

- пользователь видит только свои данные;
- удаленную запись нельзя редактировать;
- запись можно восстановить только 7 дней;
- архивные записи не доступны обычному пользователю;
- старые записи не меняются после изменения или удаления контакта;
- пользователь может удалить только свой текущий аккаунт после ответа на секретный вопрос.

## Mobile-App

`Mobile-App/` содержит мобильное приложение HunaSuna.

Рекомендуемая структура:

- `Mobile-App/App.tsx` - точка входа приложения;
- `Mobile-App/src/api` - клиент API;
- `Mobile-App/src/auth` - хранение и проверка мобильной сессии;
- `Mobile-App/src/screens` - экраны приложения;
- `Mobile-App/src/components` - мобильные UI-компоненты;
- `Mobile-App/src/config` - настройки API URL и окружения;
- `Mobile-App/app.json` - Expo config;
- `Mobile-App/eas.json` - EAS Build/Submit profiles.

Мобильное приложение не должно иметь отдельный backend и не должно хранить серверные секреты.

Команды мобильного приложения нужно запускать из `Mobile-App/`:

```powershell
cd Mobile-App
npx tsc --noEmit
npx expo start
```

## Папки планов

Папка `plans/active-plans` хранит все планы проекта в работе.

Папка `plans/completed-plans` хранит планы, которые уже выполнены.

Спеки проекта остаются в `specification`, даже если в названии спека есть слово “план”. Например, `specification/planning-specs/11-development-plan.md` остается спеком первой версии, а не активным рабочим планом.

Один рабочий план не должен одновременно лежать в обеих папках. Когда план завершен, его нужно перенести из `plans/active-plans` в `plans/completed-plans` и при необходимости обновить `CHANGELOG.md`.

## Папка specification

Папка `specification` хранит постоянные спецификации проекта и карту `specification/README.md`.

Рекомендуемая структура:

- `specification/global-specs` - общие правила, обзор и границы проекта;
- `specification/functional-specs` - продукт, функции, сценарии и интерфейс;
- `specification/data-security-specs` - данные, безопасность, роли, доступ и юридические ограничения;
- `specification/technical-specs` - архитектура, стек, структура проекта, оптимизация и API-контракт;
- `specification/mobile-specs` - мобильное приложение и мобильная безопасность;
- `specification/planning-specs` - постоянные планы, которые являются частью спецификаций.

## Переменные окружения

Web-переменные окружения лежат в `Web-Project/.env` и пример - в `Web-Project/.env.example`.

Мобильные публичные переменные окружения лежат в `Mobile-App/.env.local`, а пример - в `Mobile-App/.env.example`.

Настоящие секреты нельзя хранить в GitHub.

## Что нельзя делать в структуре

Нельзя:

- возвращать web-папки `app/`, `components/`, `server/`, `lib/`, `prisma/`, `public/` и `scripts/` в корень `SAID`;
- хранить бизнес-логику только в UI;
- писать всю логику прямо в API route;
- смешивать работу с базой, интерфейс и проверки доступа в одном файле;
- отдавать клиенту лишние поля;
- делать отдельный backend только для мобильного приложения;
- добавлять удаление чужих аккаунтов или удаление аккаунта без проверки текущей сессии и секретного ответа.


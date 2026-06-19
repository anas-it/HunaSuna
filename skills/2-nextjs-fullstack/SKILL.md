---
name: nextjs-fullstack
description: Build and review the HunaSuna Next.js fullstack application. Use when working on Next.js pages, Route Handlers, API structure, server/service layers, deployment, shared web/mobile backend logic, or technical implementation decisions for HunaSuna.
---

# Next.js Fullstack HunaSuna

## Цель

Помогать строить web-проект HunaSuna в `Web-Project/`, где web-сайт и мобильное приложение используют один backend, одну базу данных и одни правила безопасности.

## Основные правила

- Использовать Next.js как основу web-проекта.
- Делать backend первой версии через Route Handlers в `Web-Project/app/api`.
- Выносить основную бизнес-логику в `Web-Project/server/services`.
- Держать работу с базой в `Web-Project/server/db` и Prisma.
- Держать авторизацию и проверку доступа в `Web-Project/server/auth`.
- Держать validators в `Web-Project/server/validators`.
- Для web использовать httpOnly cookie, для mobile - `Authorization: Bearer <session token>` поверх `UserSession`.
- Не добавлять отдельный backend для мобильного приложения.
- Не отдавать клиенту лишние поля.

## Рекомендуемая структура

- `Web-Project/app` - страницы и маршруты Next.js.
- `Web-Project/app/api` - API endpoints.
- `Web-Project/server/services` - бизнес-логика.
- `Web-Project/server/db` - работа с базой данных.
- `Web-Project/server/auth` - авторизация и проверка доступа.
- `Web-Project/server/validators` - проверка входящих данных.
- `Web-Project/server/jobs` - фоновые задачи.
- `Web-Project/server/logs` - технические логи безопасности.
- `Web-Project/components` - web UI-компоненты.
- `Web-Project/lib` - общие помощники без бизнес-логики.

## Backend должен уметь

- регистрировать пользователя;
- выполнять вход и выход;
- восстанавливать пароль через секретный вопрос и ответ;
- работать с личным кабинетом;
- хранить контакты и записи;
- искать по контакту и номеру телефона;
- перемещать записи в раздел “Удаленные”;
- восстанавливать удаленные записи в течение 7 дней;
- скрывать архивные записи от обычного пользователя;
- удалять только текущий аккаунт пользователя после ответа на секретный вопрос;
- проверять, что пользователь видит только свои данные.

## Проверка качества

Перед завершением fullstack-задачи проверять:

- route handlers остаются тонкими;
- API можно использовать из `Mobile-App/`;
- пользователь не может получить чужие данные;
- API не раскрывает внутренние поля и stack trace;
- бизнес-правила не спрятаны только в web-интерфейсе;
- нет функций платежей, балансов, карт, кошельков, комиссий или реальных денежных переводов.


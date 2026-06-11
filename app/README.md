# Папка app

`app/` содержит web-страницы Next.js, API route handlers и server actions.

## Web-страницы

| Путь | Назначение |
| --- | --- |
| `page.tsx` | Входная страница. |
| `register/page.tsx` | Регистрация. |
| `login/page.tsx` | Вход. |
| `forgot-password/page.tsx` | Восстановление доступа через секретный вопрос. |
| `dashboard/page.tsx` | Главная после входа. |
| `contacts/page.tsx` | Контакты. |
| `contacts/[id]/page.tsx` | История и данные контакта. |
| `records/page.tsx` | Записи. |
| `records/new/page.tsx` | Создание записи. |
| `records/[id]/page.tsx` | Просмотр и редактирование записи. |
| `deleted/page.tsx` | Удаленные записи. |
| `settings/page.tsx` | Личный кабинет. |
| `privacy/page.tsx` | Политика конфиденциальности. |

## API

| Путь | Назначение |
| --- | --- |
| `api/auth/route.ts` | Регистрация, вход, выход и восстановление доступа. |
| `api/auth/[...all]/route.ts` | Совместимый ответ для старых auth-путей. |
| `api/users/me/route.ts` | Текущий пользователь. |
| `api/settings/route.ts` | Настройки аккаунта. |
| `api/contacts/route.ts` | Список и создание контактов. |
| `api/contacts/[id]/route.ts` | Просмотр, изменение и удаление контакта. |
| `api/records/route.ts` | Список и создание записей. |
| `api/records/[id]/route.ts` | Просмотр, изменение и удаление записи. |
| `api/records/[id]/favorite/route.ts` | Избранное для записи. |
| `api/deleted-records/route.ts` | Список удаленных записей. |
| `api/deleted-records/[id]/restore/route.ts` | Восстановление удаленной записи. |
| `api/search/route.ts` | Поиск. |
| `api/cron/deleted-records/route.ts` | Cron для архивирования истекших удаленных записей. |

## Правила

- Не держать бизнес-логику в страницах и route handlers.
- Для логики использовать `server/services`.
- Для проверки входных данных использовать `server/validators`.
- Для доступа к текущему пользователю использовать `server/auth`.
- Не возвращать клиенту внутренние поля, stack trace и Prisma-детали.
- SMS/email-коды восстановления и SMS-подтверждение в первой версии не добавлять.

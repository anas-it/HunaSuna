# Завершенный план: разделение web и mobile проектов

## Статус

План завершен.

Цель: разделить код web-сайта и мобильного приложения HunaSuna на две отдельные папки в корне проекта без поломки запуска, ссылок и правил проекта.

## Итоговая структура

- `Web-Project/` - Next.js web-сайт, общий backend API, Prisma, web-компоненты, web-скрипты и web-конфиги.
- `Mobile-App/` - Expo React Native мобильное приложение.
- `specification/`, `plans/`, `skills/`, `.agents/`, `.skills/`, `AGENTS.md`, `CHANGELOG.md` и корневой `README.md` остаются в корне `SAID`.

## Что нужно сделать

1. Проверить текущую структуру проекта, спеки, планы, скилы и правила агентов.
2. Создать папки `Web-Project/` и `Mobile-App/`.
3. Перенести web-файлы из корня в `Web-Project/`.
4. Перенести мобильный проект из `mobile/` в `Mobile-App/`.
5. Обновить пути в документации, спеках, планах, скилах, AGENTS и настройках VS Code.
6. Проверить, что web-команды запускаются из `Web-Project/`, а mobile-команды - из `Mobile-App/`.
7. Зафиксировать найденные серые зоны, риски медленной загрузки и возможные баги.

## Проверка

- `npm run lint` в `Web-Project/`.
- `npm run build` в `Web-Project/`.
- `npx tsc --noEmit` в `Mobile-App/`.

## Что сделано

- Созданы отдельные папки `Web-Project/` и `Mobile-App/`.
- Web-код, Prisma, API, web-конфиги, web-скрипты и web `package.json` перенесены в `Web-Project/`.
- Мобильное приложение перенесено из `mobile/` в `Mobile-App/`.
- Спеки, планы, скилы, `AGENTS.md`, `CHANGELOG.md`, `.agents/`, `.skills/` и корневой `README.md` оставлены в корне `SAID`.
- Обновлены пути в `AGENTS.md`, `README.md`, технических спеках, мобильном спеке, планах, скилах, `.vscode/settings.json` и мобильном `AGENTS.md`.
- Поврежденные кодировкой скилы `2-nextjs-fullstack`, `3-database`, `4-security-and-auth`, `5-interface` и `skills/README.md` переписаны в читаемом виде.
- Главная web-страница перестала читать session cookie и стала статической, чтобы уменьшить время первой загрузки.

## Проверено

- `npm run lint` в `Web-Project/` прошел без ошибок.
- `npm run build` в `Web-Project/` прошел без ошибок; маршрут `/` стал статическим.
- `npx tsc --noEmit` в `Mobile-App/` прошел без ошибок.
- `npm run test:api` в `Web-Project/` прошел на `http://localhost:3000`.
- Локальная главная страница ответила `200 OK` примерно за 105 мс после оптимизации.

## Серые зоны

- В Vercel нужно указать Root Directory: `Web-Project`, иначе деплой будет искать `package.json` в корне `SAID`.
- Если production сайт все еще долго открывается после переноса, вероятная причина - холодный старт serverless-функций или база данных в регионе далеко от Vercel `fra1`.
- Исторические записи в `CHANGELOG.md` могут упоминать старую папку `mobile/`, потому что на тот момент структура действительно была такой.

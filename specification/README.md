# Карта спецификаций HunaSuna

Эта папка хранит постоянные спецификации проекта. Рабочие планы остаются отдельно в `plans/active-plans/` и `plans/completed-plans/`.

## Как читать

1. Начать с `global-specs/00-project-overview.md`.
2. Затем открыть нужную группу ниже.
3. Если между спеками есть противоречие, сначала показать конфликт пользователю и только потом исправлять.

## Группы

| Папка | Что внутри |
| --- | --- |
| `global-specs/` | Общая идея, границы проекта и главный обзор. |
| `functional-specs/` | Продукт, функции, пользовательские сценарии и интерфейс. |
| `data-security-specs/` | Данные, безопасность, роли, доступ и юридические ограничения. |
| `technical-specs/` | Архитектура, стек, структура проекта, оптимизация и API-контракт. |
| `mobile-specs/` | Мобильное приложение и мобильная безопасность. |
| `planning-specs/` | Постоянный план разработки первой версии как часть спецификаций. |

## Реестр спецификаций

| Файл | Тип | Область | Роль |
| --- | --- | --- | --- |
| `global-specs/00-project-overview.md` | `global` | весь проект | Краткая карта проекта и первый файл для чтения. |
| `global-specs/01-project-and-prompt.md` | `global` | весь проект | Идея, границы и исходная логика проекта. |
| `functional-specs/02-product.md` | `product` | web + mobile | Продуктовая суть, ценность, ограничения первой версии. |
| `functional-specs/03-features.md` | `feature` | web + mobile | Список функций первой версии и то, что не входит в MVP. |
| `functional-specs/04-user-scenarios.md` | `product` / `feature` | web + mobile | Пользовательские сценарии и ожидаемое поведение. |
| `functional-specs/06-interface.md` | `ui` | web + mobile | Общие правила интерфейса и удобства. |
| `data-security-specs/05-data.md` | `data` | backend + DB + UI | Сущности, данные пользователя, записи, контакты, жизненный цикл. |
| `data-security-specs/07-security.md` | `security` | web + backend + DB | Глобальная безопасность, пароли, доступ, ограничения. |
| `data-security-specs/08-roles-and-access.md` | `security` / `product` | web + backend | Роли, права доступа, что видит пользователь. |
| `data-security-specs/10-legal.md` | `security` / `legal` | product + release | Юридические ограничения и риск выглядеть как финансовый сервис. |
| `technical-specs/09-technical.md` | `technical` | architecture | Общая техническая архитектура и слои проекта. |
| `technical-specs/12-technical-decisions.md` | `technical` | stack + implementation | Принятые технические решения и выбранные технологии. |
| `technical-specs/13-project-structure.md` | `technical` | repository + code layout | Структура проекта, папки, где должен жить код. |
| `technical-specs/14-optimization.md` | `technical` | performance + maintenance | Оптимизация, поддерживаемость, производительность. |
| `technical-specs/16-api-contract.md` | `api-contract` | web + mobile API | Единый API-контракт для сайта и мобильного приложения. |
| `mobile-specs/15-mobile-app.md` | `mobile-only` | mobile app | Спецификация мобильного приложения как клиента общего backend. |
| `mobile-specs/17-mobile-security.md` | `mobile-only` / `security` | mobile app | Безопасность мобильного приложения, token, SecureStore, сетевые риски. |
| `planning-specs/11-development-plan.md` | `spec-plan` | первая версия | Постоянный план разработки первой версии. Это спецификация, не рабочий план. |

## Главные источники правды

| Вопрос | Главный файл | Дополнительные файлы |
| --- | --- | --- |
| Что такое HunaSuna и чем проект не является | `global-specs/00-project-overview.md` | `global-specs/01-project-and-prompt.md`, `functional-specs/02-product.md`, `data-security-specs/10-legal.md` |
| Какие функции входят в первую версию | `functional-specs/03-features.md` | `functional-specs/04-user-scenarios.md`, `planning-specs/11-development-plan.md` |
| Как устроены данные | `data-security-specs/05-data.md` | `technical-specs/13-project-structure.md`, `technical-specs/16-api-contract.md` |
| Как должен выглядеть интерфейс | `functional-specs/06-interface.md` | `mobile-specs/15-mobile-app.md`, `skills/5-interface/SKILL.md` |
| Безопасность web/backend | `data-security-specs/07-security.md` | `data-security-specs/08-roles-and-access.md`, `technical-specs/12-technical-decisions.md` |
| Безопасность mobile | `mobile-specs/17-mobile-security.md` | `mobile-specs/15-mobile-app.md`, `technical-specs/16-api-contract.md` |
| Архитектура и стек | `technical-specs/12-technical-decisions.md` | `technical-specs/09-technical.md`, `technical-specs/13-project-structure.md` |
| API для сайта и приложения | `technical-specs/16-api-contract.md` | `technical-specs/12-technical-decisions.md`, `mobile-specs/15-mobile-app.md` |
| Мобильное приложение | `mobile-specs/15-mobile-app.md` | `mobile-specs/17-mobile-security.md`, `technical-specs/16-api-contract.md` |
| Текущая разработка | `plans/active-plans/` | `CHANGELOG.md`, `plans/completed-plans/` |

## Рабочие планы вне specification

| Файл | Тип | Статус | Роль |
| --- | --- | --- | --- |
| `plans/active-plans/README.md` | `working-plan-index` | plans/active-plans | Навигация по текущим рабочим планам. |
| `plans/active-plans/01-app-store-публикация.md` | `working-plan` | активен | Пошаговый план публикации мобильного приложения HunaSuna в App Store. |
| `plans/completed-plans/04-мобильная-разработка.md` | `working-plan` | завершен | История разработки мобильного приложения. |
| `plans/completed-plans/01-подготовка-спецификаций.md` | `working-plan` | завершен | История подготовки базовых спецификаций. |
| `plans/completed-plans/02-базовая-web-разработка.md` | `working-plan` | завершен | История базовой web-разработки. |
| `plans/completed-plans/03-организация-планов.md` | `working-plan` | завершен | История разделения активных и завершенных планов. |
| `plans/completed-plans/README.md` | `working-plan-index` | plans/completed-plans | Навигация по выполненным планам. |

## Правила структуры

- Постоянные спеки хранятся только в `specification/` и ее подпапках.
- Рабочие планы не хранить в `specification/`.
- При переносе спека обновлять ссылки в `AGENTS.md`, `README.md`, `skills/`, планах и связанных спеках.
- Переименовывать и переносить спеки через `git mv`, чтобы Git видел историю файла.

# Карта спецификаций HunaSuna

Эта папка хранит постоянные спецификации проекта. Рабочие планы остаются отдельно в `active-plans/` и `completed-plans/`.

## Как читать

1. Начать с `global-specs/00-обзор-проекта.md`.
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
| `global-specs/00-обзор-проекта.md` | `global` | весь проект | Краткая карта проекта и первый файл для чтения. |
| `global-specs/01-проект-и-промт.md` | `global` | весь проект | Идея, границы и исходная логика проекта. |
| `functional-specs/02-продукт.md` | `product` | web + mobile | Продуктовая суть, ценность, ограничения первой версии. |
| `functional-specs/03-функции.md` | `feature` | web + mobile | Список функций первой версии и то, что не входит в MVP. |
| `functional-specs/04-сценарии-пользователя.md` | `product` / `feature` | web + mobile | Пользовательские сценарии и ожидаемое поведение. |
| `functional-specs/06-интерфейс.md` | `ui` | web + mobile | Общие правила интерфейса и удобства. |
| `data-security-specs/05-данные.md` | `data` | backend + DB + UI | Сущности, данные пользователя, записи, контакты, жизненный цикл. |
| `data-security-specs/07-безопасность.md` | `security` | web + backend + DB | Глобальная безопасность, пароли, доступ, ограничения. |
| `data-security-specs/08-роли-и-доступ.md` | `security` / `product` | web + backend | Роли, права доступа, что видит пользователь. |
| `data-security-specs/10-юридический.md` | `security` / `legal` | product + release | Юридические ограничения и риск выглядеть как финансовый сервис. |
| `technical-specs/09-технический.md` | `technical` | architecture | Общая техническая архитектура и слои проекта. |
| `technical-specs/12-технические-решения.md` | `technical` | stack + implementation | Принятые технические решения и выбранные технологии. |
| `technical-specs/13-структура-проекта.md` | `technical` | repository + code layout | Структура проекта, папки, где должен жить код. |
| `technical-specs/14-оптимизация.md` | `technical` | performance + maintenance | Оптимизация, поддерживаемость, производительность. |
| `technical-specs/16-api-contract.md` | `api-contract` | web + mobile API | Единый API-контракт для сайта и мобильного приложения. |
| `mobile-specs/15-мобильное-приложение.md` | `mobile-only` | mobile app | Спецификация мобильного приложения как клиента общего backend. |
| `mobile-specs/17-мобильная-безопасность.md` | `mobile-only` / `security` | mobile app | Безопасность мобильного приложения, token, SecureStore, сетевые риски. |
| `planning-specs/11-план-разработки.md` | `spec-plan` | первая версия | Постоянный план разработки первой версии. Это спецификация, не рабочий план. |

## Главные источники правды

| Вопрос | Главный файл | Дополнительные файлы |
| --- | --- | --- |
| Что такое HunaSuna и чем проект не является | `global-specs/00-обзор-проекта.md` | `global-specs/01-проект-и-промт.md`, `functional-specs/02-продукт.md`, `data-security-specs/10-юридический.md` |
| Какие функции входят в первую версию | `functional-specs/03-функции.md` | `functional-specs/04-сценарии-пользователя.md`, `planning-specs/11-план-разработки.md` |
| Как устроены данные | `data-security-specs/05-данные.md` | `technical-specs/13-структура-проекта.md`, `technical-specs/16-api-contract.md` |
| Как должен выглядеть интерфейс | `functional-specs/06-интерфейс.md` | `mobile-specs/15-мобильное-приложение.md`, `skills/5-интерфейс/SKILL.md` |
| Безопасность web/backend | `data-security-specs/07-безопасность.md` | `data-security-specs/08-роли-и-доступ.md`, `technical-specs/12-технические-решения.md` |
| Безопасность mobile | `mobile-specs/17-мобильная-безопасность.md` | `mobile-specs/15-мобильное-приложение.md`, `technical-specs/16-api-contract.md` |
| Архитектура и стек | `technical-specs/12-технические-решения.md` | `technical-specs/09-технический.md`, `technical-specs/13-структура-проекта.md` |
| API для сайта и приложения | `technical-specs/16-api-contract.md` | `technical-specs/12-технические-решения.md`, `mobile-specs/15-мобильное-приложение.md` |
| Мобильное приложение | `mobile-specs/15-мобильное-приложение.md` | `mobile-specs/17-мобильная-безопасность.md`, `technical-specs/16-api-contract.md` |
| Текущая разработка | `active-plans/` | `CHANGELOG.md`, `completed-plans/` |

## Рабочие планы вне specification

| Файл | Тип | Статус | Роль |
| --- | --- | --- | --- |
| `active-plans/README.md` | `working-plan-index` | active-plans | Навигация по текущим рабочим планам. |
| `active-plans/01-app-store-публикация.md` | `working-plan` | активен | Пошаговый план публикации мобильного приложения HunaSuna в App Store. |
| `completed-plans/04-мобильная-разработка.md` | `working-plan` | завершен | История разработки мобильного приложения. |
| `completed-plans/01-подготовка-спецификаций.md` | `working-plan` | завершен | История подготовки базовых спецификаций. |
| `completed-plans/02-базовая-web-разработка.md` | `working-plan` | завершен | История базовой web-разработки. |
| `completed-plans/03-организация-планов.md` | `working-plan` | завершен | История разделения активных и завершенных планов. |
| `completed-plans/README.md` | `working-plan-index` | completed-plans | Навигация по выполненным планам. |

## Правила структуры

- Постоянные спеки хранятся только в `specification/` и ее подпапках.
- Рабочие планы не хранить в `specification/`.
- При переносе спека обновлять ссылки в `AGENTS.md`, `README.md`, `skills/`, планах и связанных спеках.
- Переименовывать и переносить спеки через `git mv`, чтобы Git видел историю файла.

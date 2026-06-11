# AGENTS HunaSuna Mobile

Перед изменением мобильного приложения читать:

- `../specification/mobile-specs/15-мобильное-приложение.md`;
- `../specification/technical-specs/16-api-contract.md`;
- `../specification/mobile-specs/17-мобильная-безопасность.md`;
- `../skills/6-mobile-app/SKILL.md`;
- Expo SDK 54 docs: https://docs.expo.dev/versions/v54.0.0/.

Правила:

- писать мобильное приложение на React Native, Expo и TypeScript;
- для запуска через текущий Expo Go на физическом телефоне держать проект на Expo SDK 54;
- не создавать отдельный backend;
- использовать общий API из `app/api`;
- хранить session token только через защищенное хранилище;
- в native-приложении хранить token через Expo SecureStore, а в Expo Web/dev preview использовать только `sessionStorage`;
- передавать token через `Authorization: Bearer <token>`;
- использовать слово “запись”, а не “тикет”;
- не добавлять платежи, кошельки, балансы, карты, комиссии или банковские функции;
- не делать поиск по дате в первой версии;
- восстановление пароля делать только через секретный вопрос и ответ.

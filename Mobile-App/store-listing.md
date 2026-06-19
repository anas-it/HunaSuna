# HunaSuna App Store Listing

Этот файл нужен как готовая основа для App Store Connect. Поля можно копировать в карточку приложения HunaSuna.

Источники Apple:

- App Privacy: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- Screenshots: https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots/
- New App record: https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/

## Важная проверка перед отправкой

В мобильном приложении есть регистрация аккаунта. Перед отправкой на App Review нужно реализовать и проверить удаление аккаунта внутри приложения: если приложение позволяет создать аккаунт, пользователь должен иметь возможность начать удаление аккаунта из приложения.

Для первого релиза нужен раздел "Удаление аккаунта" в настройках. Пользователь должен удалять только свой текущий аккаунт после ответа на секретный вопрос и ввода секретного ответа. Если это не сделать, есть высокий риск отказа на review.

## App Record

Заполняется при создании приложения в App Store Connect.

| Поле | Значение |
| --- | --- |
| Platform | `iOS` |
| Name | `HunaSuna` |
| Primary Language | `Russian` |
| Bundle ID | `pro.hunasuna.mobile` |
| SKU | `hunasuna-mobile-ios` |
| User Access | `Full Access` или нужная команда |

## App Information

| Поле | Значение |
| --- | --- |
| Category | `Productivity` |
| Secondary Category | `Business` |
| Content Rights | Приложение не содержит сторонний медиаконтент, требующий отдельных прав |
| Age Rating | Заполнить анкету честно; ожидаемо низкий рейтинг, так как нет насилия, азартных игр, публичного пользовательского контента и покупок |

Не выбирать категорию `Finance`, чтобы HunaSuna не выглядел как банк, кошелек, обменник или сервис денежных переводов.

## Pricing And Availability

| Поле | Значение |
| --- | --- |
| Price | `Free` |
| In-App Purchases | `No` |
| Subscriptions | `No` |
| Availability | Выбрать нужные страны вручную или оставить доступность по умолчанию |

## Version Information

### Version

```text
1.0
```

### Promotional Text

```text
Учет записей, контактов, сумм, валют и курса в одном спокойном рабочем инструменте.
```

### Description

```text
HunaSuna - удобное приложение для учета информации о переводах, контактах и записях.

Приложение помогает сохранять контакты, создавать записи, быстро находить нужную историю и держать важные данные под рукой. Пользователь сам добавляет информацию: участников записи, сумму, валюту, курс, дату и время.

Что можно делать в HunaSuna:

- создавать записи с данными отправителя и получателя;
- сохранять сумму, валюту, курс, дату и время записи;
- добавлять и редактировать контакты;
- быстро выбирать контакт при создании записи;
- искать записи по имени, фамилии или номеру телефона;
- искать контакты по имени, фамилии или номеру;
- добавлять важные записи в избранное;
- переносить записи в удаленные и восстанавливать их в течение срока хранения;
- работать с теми же данными, что и на сайте HunaSuna.

HunaSuna не переводит деньги, не хранит деньги пользователей и не является банком, обменником, платежной системой или финансовым посредником. Это рабочий журнал для аккуратного учета информации, которую пользователь добавляет самостоятельно.

Данные пользователя доступны только после входа в аккаунт. Мобильное приложение обращается к защищенному API HunaSuna и использует ту же базу данных, что и web-версия. Пароли не хранятся в открытом виде.
```

### Keywords

```text
учет,записи,контакты,история,поиск,журнал,курс,валюта,HunaSuna
```

### Support URL

```text
https://hunasuna.pro/privacy
```

Лучше после добавления отдельной страницы поддержки заменить на:

```text
https://hunasuna.pro/support
```

### Marketing URL

```text
https://hunasuna.pro
```

### Privacy Policy URL

```text
https://hunasuna.pro/privacy
```

### Copyright

```text
HunaSuna
```

Если приложение публикуется от имени физического лица или компании, указать юридическое имя или юридическое название так, как оно заведено в Apple Developer account.

### What's New

Для первого релиза поле может быть не нужно. Если App Store Connect попросит текст:

```text
Первый релиз HunaSuna для iPhone: учет записей, контактов, поиск, удаленные записи и настройки аккаунта.
```

## App Review Information

### Sign-In Information

Создать отдельный тестовый аккаунт без реальных клиентских данных.

```text
Login: [test login]
Password: [test password]
```

В тестовом аккаунте заранее создать несколько вымышленных контактов и записей, чтобы ревьюер сразу увидел рабочий сценарий.

### Review Notes

```text
HunaSuna is an information accounting tool for transfer records.

The app does not move money, store money, provide balances, cards, wallets, exchange, payment processing, fees, or financial mediation. Users manually create records with contacts, amounts, currencies, rates, dates, and history for personal accounting purposes.

Please use the provided test account to review login, records, contacts, search, deleted records, restore, account settings, and logout workflows.
```

### Review Contact

```text
First Name: [your first name]
Last Name: [your last name]
Phone Number: [review contact phone]
Email: privacy@hunasuna.pro
```

Если есть отдельный support email, лучше использовать его.

## App Privacy Answers

В App Store Connect открыть `App Privacy` и выбрать, что приложение собирает данные.

### Tracking

| Вопрос | Ответ |
| --- | --- |
| Data used to track users | `No` |
| Third-party advertising | `No` |
| Data broker sharing | `No` |
| Cross-app or cross-site tracking | `No` |

### Data Linked To The User

Большинство данных связано с аккаунтом пользователя, поэтому отмечать как linked to user.

| Data Type | Что выбрать | Использование |
| --- | --- | --- |
| Contact Info | `Name`, `Email Address`, `Phone Number` | `App Functionality`, `Account Management` |
| User Content | `Other User Content` | `App Functionality` |
| Contacts | `Contacts` или ближайший доступный пункт, если Apple отдельно спрашивает контакты | `App Functionality` |
| Financial Info | `Other Financial Info` | `App Functionality` |
| Identifiers | `User ID` | `App Functionality`, `Account Management` |
| Location | `Coarse Location` | `App Functionality` |
| Usage Data | `Product Interaction` или ближайший доступный пункт для технических действий безопасности | `App Functionality`, `Fraud Prevention`, `Security` |
| Diagnostics | Не выбирать, если в приложении нет crash reporting или performance diagnostics SDK | Только если позже добавится диагностика |
| Other Data | IP address, user agent, session/security log metadata, если App Store Connect предлагает такой пункт | `Security`, `Fraud Prevention`, `App Functionality` |

Пояснение для себя:

- `Financial Info / Other Financial Info` нужен только для пользовательских учетных данных вроде суммы, валюты и курса. Это не платежные данные, не банковские карты и не балансы.
- `Location / Coarse Location` нужен потому, что backend может определять дату и время по IP/infrastructure headers.
- Если App Store Connect не дает точного пункта для IP/user agent/security logs, выбрать ближайший доступный вариант и не отмечать то, чего приложение реально не собирает.

### Data Not Linked To The User

Для текущей версии не указывать отдельные данные как not linked, если они хранятся вместе с аккаунтом или сессией.

### Data Not Collected

Не выбирать `Data Not Collected`, потому что приложение хранит аккаунт, контакты, записи и технические данные безопасности.

## Age Rating Checklist

Ожидаемые ответы для анкеты возрастного рейтинга:

- Violence: `None`
- Sexual Content or Nudity: `None`
- Profanity or Crude Humor: `None`
- Alcohol, Tobacco, or Drug Use: `None`
- Gambling: `None`
- Contests: `No`
- Medical or Treatment Information: `No`
- User Generated Content visible to public: `No`
- Unrestricted Web Access: `No`
- In-App Purchases: `No`

Финальный рейтинг выставит Apple после заполнения анкеты.

## Screenshots Checklist

Apple принимает 1-10 скриншотов в `.png`, `.jpg` или `.jpeg`. Для первого релиза HunaSuna лучше подготовить 5-6 скриншотов iPhone.

Использовать только вымышленные данные. Не показывать реальные имена, телефоны, суммы клиентов или реальные переписки.

Рекомендуемые экраны:

- Вход в аккаунт с брендом HunaSuna.
- Главная после входа.
- Список записей с вымышленными данными.
- Создание или редактирование записи.
- Контакты или история контакта.
- Удаленные записи или настройки аккаунта.

Требования к содержанию:

- На скриншотах должно быть видно реальное приложение, а не только логотип или заставка.
- Не использовать банковские карты, кошельки, платежные кнопки, балансы, комиссии или слова вроде "оплатить".
- Использовать слово "запись", а не "тикет".
- Данные должны подтверждать, что приложение ведет учет информации, а не выполняет денежные переводы.

Размеры:

- Основной набор для iPhone 6.9 inch display: `1290 x 2796` или `1320 x 2868` px portrait.
- Если 6.9 inch скриншотов нет, можно использовать допустимый 6.5 inch portrait: `1242 x 2688` или `1284 x 2778` px.

## Export Compliance

В `Mobile-App/app.json` уже указано:

```json
{
  "ios": {
    "infoPlist": {
      "ITSAppUsesNonExemptEncryption": false
    }
  }
}
```

Если App Store Connect задаст вопрос про encryption, отвечать в соответствии с текущей реализацией: приложение использует стандартное HTTPS-соединение и не использует non-exempt encryption.

## Moderation Safe Phrases

Можно использовать в ответах Apple, если возникнут вопросы:

```text
HunaSuna is not a money transfer service.
HunaSuna does not move or store user money.
HunaSuna does not provide balances, bank cards, wallets, exchange, payment processing, fees, or financial mediation.
HunaSuna only stores user-entered accounting records and contacts.
```

## Final Pre-Submit Checklist

- App record создан в App Store Connect.
- Bundle ID совпадает с `pro.hunasuna.mobile`.
- Privacy Policy URL открывается: `https://hunasuna.pro/privacy`.
- Support URL открывается.
- App Privacy заполнен честно и без tracking.
- Скриншоты загружены и не содержат реальных данных.
- Тестовый аккаунт создан и работает.
- App Review Notes вставлены.
- Удаление аккаунта внутри приложения реализовано и проверено.
- Production API `https://hunasuna.pro` доступен.
- Production iOS build собран через EAS и выбран в App Store Connect.

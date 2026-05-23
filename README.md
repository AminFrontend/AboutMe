# Обо мне лендинг - презентация

Небольшой лендинг-презентация junior frontend разработчика. В проекте есть адаптивный frontend, минимальный Express API, форма обратной связи с отправкой двух писем и демонстрационный AI helper.

## Стек

- HTML5
- CSS3
- JavaScript
- Vite
- Gulp
- Node.js, Express
- Nodemailer
- Git

## Запуск

Рекомендуется Node.js LTS: 20.x или 22.x. На Node 21 некоторые версии Vite могут показывать `engine` warning, хотя сборка проекта проходит.

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend откроется на `http://localhost:5173`, API работает на `http://localhost:3001`. Vite проксирует запросы `/api` на Express.

## Деплой на Vercel

Проект подготовлен для Vercel: frontend собирается в `dist`, а backend-часть формы лежит в папке `api` как Vercel Functions.

Для первого теста на Vercel можно добавить переменные окружения:

```text
MAIL_MODE=json
OWNER_EMAIL=your-email@example.com
```

В таком режиме форма будет возвращать успешный ответ, а письма будут видны в логах Functions на Vercel. Для реальной отправки писем нужно поставить:

```text
MAIL_MODE=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=login@example.com
SMTP_PASS=app-password
FROM_EMAIL="Amin Portfolio <login@example.com>"
OWNER_EMAIL=your-email@example.com
```

После изменения переменных окружения на Vercel нужно сделать redeploy.

## Сборка

```bash
npm run build
npm start
```

В production Express раздает собранную папку `dist` и обрабатывает API-запросы.

## Как реализована форма

Форма находится в секции контактов. На клиенте есть базовая проверка полей, loading-состояние кнопки, success-сообщение и вывод ошибок. После отправки frontend делает `POST /api/contact`.

На backend данные повторно валидируются. Сервер отправляет два письма через Nodemailer:

- владельцу сайта на `OWNER_EMAIL`;
- пользователю на email из формы.

Для локальной разработки в `.env.example` стоит `MAIL_MODE=json`: письма не уходят наружу, а формируются и выводятся в логи сервера. Для реальной отправки нужно поставить `MAIL_MODE=smtp` и заполнить `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`, `OWNER_EMAIL`.

## AI helper

На странице есть небольшой блок `AI helper`, который отправляет текст на `POST /api/ai-summary`. Если задан `OPENAI_API_KEY`, сервер обращается к OpenAI Responses API и возвращает краткое описание. По умолчанию используется модель `gpt-5-mini`, ее можно поменять через `OPENAI_MODEL`. Если ключ не задан или API временно недоступен, возвращается локальный fallback, чтобы интерфейс продолжал работать.

## Как использовались AI-инструменты

Backend/API часть была для меня новой зоной. Я реализовал минимальный Express API для обработки формы, изучил принцип работы POST-запросов, переменных окружения и отправки email через Nodemailer. AI-инструменты использовались для объяснения незнакомых частей и проверки ошибок, но финальная структура и тестирование выполнялись вручную.

## Что исправлялось вручную

- настроена валидация формы на frontend и backend;
- добавлены состояния loading, success и error;
- добавлен fallback для AI helper без API-ключа;
- подготовлен `.env.example`, чтобы проект можно было запустить локально;
- структура проекта разделена на `src`, `server` и `scripts`.

## Структура

```text
.
├── index.html
├── src
│   ├── assets
│   │   └── hero-developer.png
│   ├── main.js
│   └── styles.css
├── server
│   └── index.js
├── scripts
│   └── dev.js
├── gulpfile.js
├── vite.config.js
├── .env.example
└── package.json
```

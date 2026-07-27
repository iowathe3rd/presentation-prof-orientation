# AI_BANK_OS Presentation

Интерактивная презентация «AI в банке» на Next.js.

## Требования

- Node.js 22
- npm

## Локальный запуск

```bash
npm install
npm run dev
```

Приложение откроется на [http://localhost:3000](http://localhost:3000).

## Проверка production-сборки

```bash
npm run build
npm run start
```

## Деплой на Vercel

1. Отправьте репозиторий в GitHub, GitLab или Bitbucket.
2. В Vercel выберите **Add New → Project** и импортируйте репозиторий.
3. Vercel автоматически определит **Next.js**.
4. Оставьте стандартные настройки:
   - Build Command: `next build`;
   - Install Command: `npm install`;
   - Output Directory: стандартная для Next.js;
   - Node.js: `22.x`.
5. Переменные окружения проекту не требуются.
6. Нажмите **Deploy**.

Также можно использовать Vercel CLI:

```bash
npx vercel
```

Production-деплой через CLI:

```bash
npx vercel --prod
```

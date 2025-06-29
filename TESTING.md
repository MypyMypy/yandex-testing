# 🧪 Тестирование Сервиса межгалактической аналитики

## 🚀 Как запустить тестирование

### Unit и интеграционные тесты

```bash
# Запуск всех тестов
npm run test

# Одноразовый запуск всех тестов
npm run test:run
```

### E2E тесты

```bash
# Запуск всех E2E тестов
npx playwright test

# Запуск в конкретном браузере
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Запуск в видимом браузере (для отладки)
npx playwright test --headed

# Запуск конкретного теста
npx playwright test --grep "название теста"

# Показать отчет после выполнения
npx playwright show-report
```
## 🔧 Конфигурация

### Vitest (`vitest.config.ts`)
- Окружение: jsdom для симуляции браузера
- Алиасы: настроены импорты (@components, @utils, и т.д.)
- Setupfiles: подключение матчеров и моков

### Playwright (`playwright.config.ts`)
- Браузеры: Chromium, Firefox, WebKit
- Базовый URL: автоматический запуск dev сервера
- Retry: автоматические повторы для нестабильных тестов
- Отчеты: HTML отчеты с детальной информацией

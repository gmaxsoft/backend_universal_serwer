# Backend Universal Server

Uniwersalny serwer API oparty na Node.js, Express i Prisma z dynamicznym routingiem.

## Technologie

Projekt wykorzystuje następujące technologie i narzędzia:

- **Node.js** - środowisko uruchomieniowe JavaScript
- **Express** - framework webowy dla Node.js
- **Prisma** - nowoczesny ORM do zarządzania bazą danych
- **PostgreSQL** - relacyjna baza danych
- **JWT (jsonwebtoken)** - autentyfikacja oparta na tokenach
- **bcryptjs** - hashowanie haseł
- **dotenv** - zarządzanie zmiennymi środowiskowymi
- **Docker** - konteneryzacja aplikacji
- **Jest** - framework do testowania
- **Babel** - transpilacja kodu JavaScript
- **nodemon** - narzędzie do automatycznego restartu serwera podczas rozwoju

## Instalacja

1. Sklonuj repozytorium.
2. Zainstaluj zależności: `npm install`

## Konfiguracja

### JWT_SECRET

Wygeneruj bezpieczny sekret JWT używając jednego z poniższych poleceń:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

lub

```bash
openssl rand -hex 64
```

Dodaj wygenerowany sekret do pliku `.env` jako `JWT_SECRET=...`

### Baza danych

1. Skonfiguruj `DATABASE_URL` w pliku `.env` (domyślnie PostgreSQL).
2. Uruchom bazę danych: `docker-compose up -d db`
3. Zastosuj migracje: `npx prisma migrate deploy`
4. Wygeneruj klienta Prisma: `npx prisma generate`

### Seed danych

Uruchom seed, aby utworzyć testowego użytkownika i przykładowe route'y:

```bash
node prisma/seed.js
```

Tworzy użytkownika: `test@example.com` z hasłem `password123`

## Uruchomienie

```bash
npm run dev
```

Serwer uruchomi się na porcie 3000 (lub zgodnie z `PORT` w `.env`).

## Testy jednostkowe

Projekt wykorzystuje framework **Jest** do testowania jednostkowego. Testy znajdują się w katalogu `tests/`.

### Uruchomienie testów

Aby uruchomić wszystkie testy:

```bash
npm test
```

### Struktura testów

Testy są zorganizowane w katalogu `tests/` i używają konwencji nazewnictwa `*.test.js`.

Obecnie zaimplementowane testy:
- **generateToken.test.js** - testy funkcji generowania tokenów JWT, w tym:
  - Generowanie tokenu i ustawianie ciasteczka
  - Obsługa domyślnych wartości wygaśnięcia tokenu

### Konfiguracja testów

Konfiguracja Jest znajduje się w pliku `jest.config.js`. Projekt używa:
- Środowiska Node.js do testów
- Mapowania modułów ES6
- Eksperymentalnych modułów VM dla Node.js

### Dodawanie nowych testów

Aby dodać nowy test:
1. Utwórz plik `*.test.js` w katalogu `tests/`
2. Użyj funkcji `describe`, `it`, `expect` z Jest
3. Uruchom testy za pomocą `npm test`

## API

### Autentyfikacja

#### POST /auth/register

Rejestracja nowego użytkownika.

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "password": "password123"
}
```

#### POST /auth/login

Logowanie. Użyj testowego użytkownika: email `test@example.com`, password `password123`

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Zwraca token JWT:

```json
{
  "token": "jwt_token_here"
}
```

Użyj tego tokena w nagłówku `Authorization: Bearer <token>` dla chronionych endpointów.

### Statyczne endpointy

- GET / - Informacje o API
- GET /users - Lista użytkowników
- GET /users/:id - Szczegóły użytkownika
- POST /users - Utwórz użytkownika
- PUT /users/:id - Aktualizuj użytkownika
- DELETE /users/:id - Usuń użytkownika
- GET /routes - Lista route'ów
- GET /routes/:id - Szczegóły route'a
- POST /routes - Utwórz route
- PUT /routes/:id - Aktualizuj route
- DELETE /routes/:id - Usuń route

### Dynamiczne route'y

Aplikacja automatycznie rejestruje endpointy na podstawie wpisów w tabeli `MainRoutes` z wypełnionymi polami `modelName` i `action`.

Przykładowe akcje:
- `findMany` - GET, lista
- `findUnique` - GET /:id, pojedynczy
- `create` - POST, utwórz
- `update` - PUT /:id, aktualizuj
- `delete` - DELETE /:id, usuń

Aby dodać dynamiczny endpoint:
1. POST /routes z `modelName` i `action` (np. `{"method":"GET", "url":"/custom-users", "modelName":"user", "action":"findMany"}`)
2. Restart aplikacji - endpoint zostanie zarejestrowany.

Wszystkie dynamiczne endpointy wymagają autentyfikacji.
---
name: manage-voice-notes
description: "Inteligentna transkrypcja i kategoryzacja notatek g�osowych z WhatsApp."
category: "Media"
author: community
version: "2.0.1"
icon: image
---

# Voice Notes Pro

Inteligentna transkrypcja i kategoryzacja notatek g�osowych z WhatsApp.

## Opis

Voice Notes Pro automatycznie transkrybuje notatki g�osowe wys�ane przez WhatsApp i kategoryzuje je do odpowiednich plik�w Markdown. Obs�uguje 6 kategorii: teksty piosenek, zadania, zakupy, pomys�y, baz� ludzi i watchlist� film�w/seriali.

## Funkcje

- ?? Transkrypcja przez Whisper API (OpenAI)
- ??? Automatyczna kategoryzacja po s�owach-kluczach
- ?? Zapis w Markdown z timestampami
- ?? Baza ludzi (dodawanie/sprawdzanie os�b)
- ?? Watchlist (filmy/seriale do obejrzenia)
- ? Zadania z priorytetem i deadline
- ?? Lista zakup�w z licznikiem produkt�w
- ?? Pomys�y z tagowaniem projekt�w

## Triggery

U�ywaj tego skill'a gdy u�ytkownik:
- Wysy�a notatk� g�osow� przez WhatsApp
- Prosi o transkrypcj� audio
- Dyktuje tekst piosenki
- Dodaje zadanie g�osem
- Dyktuje list� zakup�w
- Zapisuje pomys� g�osowo
- Dodaje osob� do bazy kontakt�w
- Zapisuje film/serial do watchlisty

## Kategorie

### 1. ?? Piosenki
**S�owa-klucze:** "dyktuj", "tekst utworu", "piosenka", "rap", "zwrotka", "refren"
**Lokalizacja:** `~/notes/songs/brudnopis.md`

### 2. ? Zadania
**S�owa-klucze:** "zadanie", "todo", "zr�b", "zadzwo�", "napisz", "wy�lij"
**Lokalizacja:** `~/notes/tasks/inbox.md`

### 3. ?? Zakupy
**S�owa-klucze:** "zakupy", "kup", "kupi�", "do sklepu", "lista zakup�w"
**Lokalizacja:** `~/notes/lists/shopping.md`

### 4. ?? Pomys�y
**S�owa-klucze:** "pomys�", "idea", "projekt", "fajnie by by�o", "mo�e warto"
**Lokalizacja:** `~/notes/ideas/[data]-[projekt]/README.md`

### 5. ?? Baza Ludzi
**S�owa-klucze:** "dodaj osob�", "osoba", "kontakt", "sprawd� osob�"
**Lokalizacja:** `~/notes/people/database.md`

### 6. ?? Watchlist
**S�owa-klucze:** "zapisz film", "serial", "obejrze�", "watchlist", "do obejrzenia"
**Lokalizacja:** `~/notes/watchlist/watchlist.md`

## Przyk�ady u�ycia

### Piosenka
```
?? U�ytkownik (voice): "Dyktuje tekst utworu: jestem te o eN aka �cinacz G��w..."
? Bot: "?? Zapisano tekst w ~/notes/songs/brudnopis.md"
```

### Zadanie
```
?? U�ytkownik (voice): "Zadanie: zadzwoni� do klienta jutro o 10"
? Bot: "? Dodano zadanie: zadzwoni� do klienta jutro o 10"
```

### Zakupy
```
?? U�ytkownik (voice): "Zakupy: mleko, chleb, jajka, mas�o"
? Bot: "?? Dodano 4 produkty do ~/notes/lists/shopping.md"
```

### Baza Ludzi
```
?? U�ytkownik (voice): "Dodaj osob�: Michael Jackson, urodzony 1958, zmar� 2009"
? Bot: "? Dodano: Michael Jackson
?? 1958 - 2009
?? 2026-02-07 18:30
?? ~/notes/people/database.md"
```

### Watchlist
```
?? U�ytkownik (voice): "Zapisz film: Oppenheimer Christopher Nolan"
? Bot: "?? Dodano: Oppenheimer
?? ~/notes/watchlist/watchlist.md"
```

## Wymagania

- OpenAI API key (dla Whisper)
- WhatsApp po��czony z OpenClaw
- Node.js z npm
- Uprawnienia do zapisu w `~/notes/`

## Konfiguracja
```json
{
  "voice-notes-pro": {
    "enabled": true,
    "whatsapp": {
      "enabled": true,
      "phoneNumber": "+48534722885"
    },
    "whisper": {
      "model": "whisper-1",
      "language": "pl"
    },
    "directories": {
      "songs": "/root/notes/songs",
      "tasks": "/root/notes/tasks",
      "shopping": "/root/notes/lists",
      "ideas": "/root/notes/ideas",
      "people": "/root/notes/people",
      "watchlist": "/root/notes/watchlist"
    }
  }
}
```

## Instalacja
```bash
cd ~/.openclaw/skills/voice-notes-pro
npm install
openclaw gateway restart
```

## Status

? **Production Ready**
- Testowany z WhatsApp
- Obs�uguje polskie i angielskie notatki
- Automatyczne backupy plik�w
- Error handling dla b��dnych transkrypcji

## Author

Created for Toniacz - AI automation specialist ??

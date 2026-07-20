# ClosePilot — Supabase einrichten (ca. 5 Minuten)

1. **Projekt anlegen:** Auf https://supabase.com einloggen → "New project" →
   Name z. B. `closepilot`, Region `eu-central-1 (Frankfurt)`, Datenbank-Passwort
   irgendwo sicher notieren.

2. **Datenbank aufsetzen:** Im Projekt links **SQL Editor** öffnen → den kompletten
   Inhalt von `supabase-setup.sql` einfügen → **Run**. Vorher in der Datei die
   Closer-E-Mails eintragen (die auskommentierten Zeilen bei `allowed_users`),
   oder die E-Mails einfach an Claude geben.

3. **E-Mail-Bestätigung ausschalten** (damit sich das Team sofort registrieren kann):
   **Authentication → Sign In / Providers → Email** → "Confirm email" **deaktivieren** → Save.

4. **Zugangsdaten kopieren:** **Project Settings → API** →
   - `Project URL` (sieht aus wie `https://xxxx.supabase.co`)
   - `anon public` Key
   Beide an Claude geben → werden in `index.html` bei `SUPABASE_URL` und
   `SUPABASE_ANON_KEY` eingetragen. (Der anon-Key ist öffentlich gedacht;
   die Sicherheit kommt aus den Row-Level-Security-Regeln.)

5. **Fertig.** Jeder Closer öffnet die App-URL, klickt "Registrieren" und legt mit
   seiner freigeschalteten E-Mail ein Passwort an. Nicht freigeschaltete E-Mails
   werden abgewiesen. Svenja (hello@svenjaokan.de) ist Admin und darf als Einzige
   Leads löschen.

**Neuen Closer später freischalten:** SQL Editor →
`insert into allowed_users (email) values ('neu@mail.de');`

# Handoff: StudyScheduler — Telegram Mini App for private tutors

## Prompt to paste into Claude Code

> Implement the StudyScheduler Telegram Mini App described in this README. The bundled
> `*.dc.html` files are **design references** (HTML prototypes showing intended look and
> behavior) — **do not ship them**. Recreate the screens in a real Telegram Mini App using
> **React + `@telegram-apps/telegram-ui`** and `@telegram-apps/sdk` (or the stack already in
> the repo). All colors, type and spacing must come from Telegram theme parameters / the kit's
> tokens — never hardcode hex. UI copy is **Ukrainian** (kept verbatim below). Start with the
> Students loop (list + search + archive filter + add + detail), then Profile. Match the
> layouts, component choices, states and copy in this document exactly.

---

## Overview
A pocket CRM for private tutors living inside Telegram. A tutor manages **students, their
schedule and their finances** in one place. Usage is short and frequent (5–15 opens/day,
30–90s each), so every core action must be reachable in **1–3 taps** and the UI must be
fast and glanceable.

This handoff covers the first-pass scope: **Students** (list + search + archive filter +
add), **Student detail**, and **Profile**. Schedule and Reports are stubbed placeholders in
the prototype and out of scope here.

## About the design files
`TutorApp.dc.html` and `StudyScheduler.dc.html` are HTML prototypes (a "Design Component"
runtime) created to demonstrate the intended visuals and interactions. They are **references,
not production code**. Recreate them in the target environment using its established patterns.
If no app exists yet, scaffold a Telegram Mini App with **React + `@telegram-apps/telegram-ui`**.

- `TutorApp.dc.html` — the single interactive phone (all screens + navigation + state).
- `StudyScheduler.dc.html` — a board that mounts the phone in light + dark + empty state; for
  reference only, not a screen to build.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, component structure, copy and interactions.
Recreate pixel-faithfully using the Telegram UI kit's components and theme tokens.

---

## Platform & non-negotiables
- **Telegram Mini App**, rendered in Telegram's in-app browser. **Mobile-first, 360–430px wide**,
  single vertical column. Respect safe-area / viewport insets.
- **Native Telegram look** via `@telegram-apps/telegram-ui` (grouped Sections, Cells, inset
  dividers, large rounded corners).
- **Light + dark simultaneously**, driven by Telegram theme CSS variables — **never hardcode
  colors**. Map `themeParams` onto the kit; toggling is automatic from the client.
- **Primary action = Telegram `MainButton`** (bottom of viewport), not a custom in-screen button.
  **Back = Telegram `BackButton`** in the header. **Haptics** on create / mark-done / delete.
- Tap targets **≥ 44px**.

## Telegram SDK wiring
Use `@telegram-apps/sdk`:
- `mainButton` — set text + `onClick` per screen (see per-screen MainButton below); show/hide as
  you navigate. On the prototype the button label changes by screen.
- `backButton` — `show()` on Student detail and Add/Edit; `hide()` on tab roots; `onClick` = go back.
- `hapticFeedback.impactOccurred('light')` on mark-done / save / archive.
- `initData` / `GET /me` for the Profile screen (tutor avatar, name, `@username`).
- A student's **contact** is intended to bind automatically from the linked Telegram account in a
  later iteration — leave the field out of the create form for now (see Add form).

---

## Navigation
Bottom **Tabbar** (`@telegram-apps/telegram-ui`), 4 tabs, icon + Ukrainian label. Outline
line-icons, 24px grid, ~1.9px stroke, round caps (Lucide is a good match: `Calendar`, `Users`,
`BarChart2`/`ChartColumn`, `User`). Active tab uses the accent color; inactive uses hint color.

1. **Розклад** (Schedule) — placeholder (out of scope)
2. **Студенти** (Students) — the built loop
3. **Звіти** (Reports) — placeholder (out of scope)
4. **Профіль** (Profile) — built

Nav stack within the Students tab: **List → Detail → Add/Edit**. Tapping a student Cell opens
Detail; MainButton on List/empty opens Add; MainButton on Detail opens Edit (form prefilled).

---

## Screens / Views

### 1. Студенти — list (home of the loop)
**Purpose:** find a student fast, see who owes money, add a new one.

**Layout (top → bottom, inside the scroll area):**
1. **Nav header** — 52px tall, `--tg-header-bg`, 0.5px bottom separator, centered 17px/600 title
   `Студенти`. No back button here.
2. **Search field** — full width minus 16px gutters, 12px top padding. A rounded (10px) bar on
   `--tg-secondary-fill`, 9×12px padding, containing a 18px magnifier glyph (`--tg-hint`) + text
   input. Placeholder `Пошук`. Filters the list by name (case-insensitive substring), live.
3. **Segmented filter** — `SegmentedControl`, full width, 16px gutters, 14px bottom margin.
   Two segments: `Активні · {activeCount}` and `Архів · {archCount}`. Default = Активні. iOS-style:
   track on `--tg-secondary-fill`, radius 9px, selected pill on `--tg-section-bg` with
   `0 1px 3px rgba(0,0,0,.12)` shadow, sliding transition `left .22s cubic-bezier(.4,0,.2,1)`.
   Active label 600, inactive 400.
4. **Section header** (13px, uppercase, `--tg-subtitle`, 32px left pad): on Активні →
   `{activeCount} студентів · {debtorCount} з боргом`; on Архів → `{archCount} в архіві`; while
   searching → `Результати`.
5. **Grouped list** — a Section card (`--tg-section-bg`, radius 12px, overflow hidden, 16px
   gutters). Each row = a **student Cell** (see component below).
6. **Empty/no-results line** (centered, `--tg-hint`, 15px) when the filtered list is empty:
   search → `Нікого не знайдено`; archive with none → `Архів порожній`; otherwise → `Ще немає студентів`.
7. **Footer note** (13px, `--tg-hint`, 32px pad): Активні → `Торкніться картки, щоб відкрити
   профіль і фінанси.`; Архів → `Заархівовані студенти приховані зі списку та звітів.`

**Archive treatment:** archived rows render at **opacity 0.5**; everything else identical.
Archived students are excluded from the default (Активні) list and from Reports.

**MainButton:** `Додати студента` → opens Add form.

**Student Cell (the workhorse row):**
- Min-height 60px, padding `9px 14px 9px 16px`, flex row, 12px gap, `cursor: pointer`.
- **Leading:** 42px circular avatar — solid Telegram peer-color gradient with the name's
  initials (1–2 letters, white, 16px/600). Gradient chosen deterministically from the name
  (see Avatar spec). If image later available, use it instead.
- **Title:** name, 17px/400, `--tg-text`, ellipsis on overflow.
- **Subtitle:** 14px/1.2. If subject set → `{subject} · {rate} ₴/год` in `--tg-subtitle`.
  If no subject → `Предмет не вказано` in `--tg-hint` (muted).
- **Trailing:** balance value, 16px/600, then an 8×13 chevron (`--tg-hint`). Balance color:
  `> 0` → `--tg-success` with `+` prefix; `< 0` → `--tg-destructive` with `−` prefix; `= 0` →
  `--tg-hint`, shown as `0 ₴`. Format: thin-space thousands, trailing ` ₴` (e.g. `+1 050 ₴`).
- **Divider:** inset 0.5px hairline (`scaleY(.5)`, `--tg-section-separator`), starting 70px from
  the left (after the avatar), on every row except the last.

### 2. Студент — detail
**Purpose:** see one student's subject, rate, contact, and current balance; edit / add payment / archive.

**Layout:**
1. **Nav header** with **BackButton** (`‹ Назад`, accent) on the left; centered title = student's
   first name.
2. **Header block** (centered, 24px top pad): 88px avatar (initials gradient, 34px/600 text),
   name 24px/700 (letter-spacing −0.02em), then a **status Badge** `Активний` (success mode:
   green tint pill).
3. **Section `ПРОФІЛЬ`** — grouped card, rows (left label 17px, right value 17px):
   - `Предмет` → subject, `--tg-subtitle`. If empty → `Не вказано` in `--tg-hint`.
   - `Ставка` → `{rate} ₴/заняття`, `--tg-subtitle`. If 0 → `Не вказано` in `--tg-hint`.
   - `Контакт` → contact, colored `--tg-link`.
   - `Додано` → date, `--tg-subtitle`.
4. **Section `ФІНАНСИ`** — grouped card:
   - Prominent balance row (56px): left label `Баланс` (or `Борг` when negative), right value
     22px/700 colored green/red per sign.
   - `Оплачено загалом` → total paid, `--tg-subtitle`.
   - `Проведено занять` → lesson count, `--tg-subtitle`.
   - Footer note (13px `--tg-hint`): `Баланс = сума оплат − проведені заняття × ставка`.
5. **Actions** grouped card:
   - `Додати оплату` — accent-colored label (`--tg-accent`).
   - `Архівувати студента` — destructive label (`--tg-destructive`).
6. **MainButton:** `Редагувати` → opens the Add/Edit form prefilled.

### 3. Новий студент — add / edit form
**Purpose:** create (or edit) a student with minimal friction.

**Layout:** Nav header with BackButton + title (`Новий студент` on create, `Редагувати` on edit).
A single group of inputs (kit `Input`, header label above field), 16px gutters, 16px gaps:
- `Ім'я` — placeholder `Напр., Марія Коваленко`.
- `Ставка за заняття, ₴` — placeholder `300`, **helper text**:
  `Ціна за замовчуванням — підставлятиметься в нові заняття цього студента.`

> Only these two fields. **Contact and subject are intentionally NOT in the form** — contact will
> auto-bind from the linked Telegram account later, and subject/lessons are added afterward in the
> student card. The rate here is the tutor's **default price per lesson**.

**MainButton:** `Зберегти` (create) / `Зберегти зміни` (edit) → save, haptic, return to list.

### 4. Профіль
**Purpose:** the tutor's own account + app settings. Minimal, mostly informational.
**Layout:**
1. Nav header, centered title `Профіль`. No back button (tab root).
2. Header block: 88px avatar (from the tutor's name/`GET /me`), name 22px/700, `@username` 15px
   `--tg-subtitle`. (Prototype uses `Олена Гриценко` / `@olena_tutor`.)
3. **Section `НАЛАШТУВАННЯ`** — Cells with a 29px rounded leading tile (colored square, white
   glyph), title, right value + `›`:
   - `Тема` → `Авто` (tile `#8e8e93`). Theme follows Telegram.
   - `Мова` → `Українська` (tile `#34c759`).
   - `Політика скасування` → `›` (tile `#ff9500`).
4. **Section `ПРО ЗАСТОСУНОК`** — `Версія` → `1.0.0`.
5. Footer (13px `--tg-hint`): `Тема й мова визначаються Telegram. StudyScheduler · Mini App у Telegram`.
6. **No MainButton** on this screen.

### 5. Empty state (first run, Students)
Full-height centered placeholder: 72px `🧑‍🏫` glyph, header `Ще немає студентів` (20px/600),
description (15px `--tg-subtitle`, max 250px): `Додайте першого студента, щоб вести розклад,
оплати та баланс в одному місці.` MainButton `Додати студента` present.

---

## Interactions & behavior
- **Search:** live filter of the current segment (Активні/Архів) by name, case-insensitive substring.
- **Segmented filter:** switches list between active and archived; pill slides `.22s
  cubic-bezier(.4,0,.2,1)`; counts in labels update from data.
- **Row tap → Detail;** BackButton → back to list. MainButton behavior is per-screen (above).
- **Cell press state:** flood to `--tg-tertiary-fill` on press (kit default).
- **Optimistic + snappy:** mark-done / create / archive give immediate feedback + haptic.
- **Every list has loading / empty / error states** (empty implemented; add skeleton cells for
  loading and a factual error line for error — see brief §5.2: `Не вдалося завантажити` /
  `Сесія застаріла — відкрийте застосунок знову`).
- Motion: standard ease `cubic-bezier(.4,0,.2,1)` ~120–220ms; no bounce/parallax.

## State management
- `students: Student[]` — `{ id, name, subject, rate, paid, lessons, contact, added, archived }`.
  Derived per student: `balance = paid − lessons × rate`.
- `filter: 'active' | 'archived'` (default `active`) — drives the segmented control + list.
- `query: string` — search text.
- Navigation: `view: 'students' | 'detail' | 'add' | 'profile' | 'empty' | …` + `selectedId` +
  `editing: boolean`. In a real app use the router / nav stack rather than a single `view`.
- Data fetching: students list, single student, create/update/archive, add payment; tutor via
  `GET /me`. Show loading skeletons and error rows around each.

## Design tokens (Telegram theme parameters)
Map these to `themeParams`; **do not hardcode**. Values below are the kit's light / dark defaults.

**Semantic — light → dark**
- page bg `--tg-bg`: `#EFEFF4` → `#0E1621`
- section/card `--tg-section-bg`: `#FFFFFF` → `#17212B`
- header `--tg-header-bg`: `#F7F7F8` → `#17212B`
- secondary fill (segmented track, search, chips) `--tg-secondary-fill`: `#E9E9EC` → `#232E3C`
- tertiary fill (pressed cell) `--tg-tertiary-fill`: `#F2F2F6` → `#1D2733`
- text `--tg-text`: `#000000` → `#FFFFFF`
- subtitle `--tg-subtitle`: `#707579` → `#708499`
- hint `--tg-hint`: `#8A8A8E` → `#6D7E8F`
- accent `--tg-accent`: `#007AFF` → `#2EA6FF` (press `#006FE6` → `#2B97E8`)
- link `--tg-link`: `#007AFF` → `#6AB2F2`
- success `--tg-success`: `#34C759` → `#32D74B`
- destructive `--tg-destructive`: `#FF3B30` → `#FF5C52`
- separator `--tg-separator`: `rgba(60,60,67,.29)` → `rgba(255,255,255,.12)`
- inset cell separator `--tg-section-separator`: `rgba(60,60,67,.20)` → `rgba(255,255,255,.10)`

**Avatar gradient ramp** (7 Telegram peer colors; pick deterministically by name):
1 `#FF885E→#FF516A` · 2 `#FFCD6A→#FFA85C` · 3 `#82B1FF→#665FFF` · 4 `#A0DE7E→#54CB68` ·
5 `#53EDD6→#28C9B7` · 6 `#72D5FD→#2A9EF1` · 7 `#E0A2F3→#D669ED` (all `linear-gradient(180deg, …)`).
Pick index: `h=0; for each char c of name: h=(h*31 + c.charCodeAt) % 7`.

**Typography:** system stack — SF Pro (iOS) / Roboto (Android) / system-ui (web).
Sizes used: Large title 24/700, section/detail name 22/700, nav title 17/600, body/title 17/400,
balance 22/700, subtitle 14–15, section header 13 uppercase, footnote 13. Titles get slight
negative tracking (−0.01 to −0.02em). Weight carries emphasis (600 active/titles, 400 body).

**Spacing:** 4px base. Page gutter **16px**. Cell padding ~`11px 16px`, min hit target 44px.
Sections separated by ~20px of page bg. Section header left pad 32px (16 gutter + 16 inner).

**Radius:** sections/cards **12px** (kit grouped 10px is also fine), search & segmented track 9–10px,
avatars/badges/pills fully round. **Elevation:** grouped sections cast no shadow (read by bg
contrast); only the segmented pill / floating chrome get a faint shadow. Tabbar has a 0.5px top
separator + `saturate(180%) blur(20px)` translucent backdrop.

## Copy (Ukrainian, verbatim)
Titles: `Студенти`, `Профіль`, `Новий студент`, `Редагувати`, `Розклад`, `Звіти`.
Buttons: `Додати студента`, `Редагувати`, `Зберегти`, `Зберегти зміни`, `Назад`, `Додати`.
Filters: `Активні · {n}`, `Архів · {n}`. Search: `Пошук`.
Labels: `Предмет`, `Ставка`, `Контакт`, `Додано`, `Баланс`, `Борг`, `Оплачено загалом`,
`Проведено занять`, `Тема` (`Авто`), `Мова` (`Українська`), `Політика скасування`, `Версія`.
States: `Предмет не вказано`, `Не вказано`, `Нікого не знайдено`, `Архів порожній`,
`Ще немає студентів`. Actions: `Додати оплату`, `Архівувати студента`.
Status badge: `Активний`. Currency symbol: `₴`, thin-space thousands (`1 050 ₴`).

## Assets
No raster assets. Avatars are generated (initials on gradient). Icons are outline line-icons
(24px, ~1.9px stroke) — use **Lucide** or the kit's icon set; keep the stroke weight. Emoji
(`🧑‍🏫`, `🗓️`, `📊`) are used only for big empty-state glyphs, never as UI affordances.

## Files in this bundle
- `TutorApp.dc.html` — full interactive prototype (all built screens, nav, state, data).
- `StudyScheduler.dc.html` — light/dark/empty reference board (mounts the phone; not a screen).
- Reference component contracts (Cell, Section, Tabbar, Avatar, Badge, SegmentedControl, Input,
  Button, Placeholder) mirror `@telegram-apps/telegram-ui`; the prototype's design-system tokens
  live under `_ds/…/tokens/*.css` in the source project.

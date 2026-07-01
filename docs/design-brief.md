# StudyScheduler — design brief

A brief for generating the UI of the StudyScheduler Telegram Mini App. Paste it into a design tool
(Claude, Figma Make, etc.). UI copy is **Ukrainian**; the brief is in English for clarity.

---

## 1. Product

A pocket CRM for private tutors, living inside Telegram. A tutor opens it to manage **students,
their schedule, and their finances** — replacing Excel + notes + memory with one tool.

**Usage pattern:** 5–15 opens per day, 30–90 seconds each. Check the schedule, mark a lesson done,
add a payment. So: fast, glanceable, one-to-three taps per action.

## 2. Platform & constraints

- **Telegram Mini App**, rendered in Telegram's in-app browser. **Mobile-first, 360–430px wide.**
- **Native Telegram look & feel** — like the `@telegram-apps/telegram-ui` kit (grouped sections,
  cells, inset dividers, large rounded corners).
- **Light + dark theme simultaneously**, driven by Telegram theme CSS variables (never hardcode
  colors):
  `--tg-theme-bg-color`, `--tg-theme-secondary-bg-color`, `--tg-theme-section-bg-color`,
  `--tg-theme-text-color`, `--tg-theme-hint-color`, `--tg-theme-subtitle-text-color`,
  `--tg-theme-link-color`, `--tg-theme-button-color`, `--tg-theme-button-text-color`,
  `--tg-theme-destructive-text-color`, `--tg-theme-section-header-text-color`.
- **Primary actions use Telegram's `MainButton`** (bottom of screen), not custom buttons. Navigation
  back uses the `BackButton`. Haptic feedback on key actions.
- Respect safe areas / viewport insets.

## 3. Visual language

- **Surfaces:** screen background = `secondary-bg-color`; content grouped into **Sections** on
  `section-bg-color` with ~12–16px corner radius and inset dividers between rows.
- **Rows = Cells:** leading (avatar/icon) · title (+ optional subtitle/hint) · trailing (value / badge
  / chevron). This is the workhorse component for every list.
- **Typography:** system font (SF Pro / Roboto). Title ~17px, subtitle/hint ~14–15px, section headers
  ~13px uppercase-ish in `section-header-text-color`.
- **Accent** = `button-color` (money earned, primary actions, links). **Destructive/debt** =
  `destructive-text-color` (negative balance, archive, cancel). **Muted** = `hint-color`.
- **Avatars:** colored circle with the student's initial (deterministic color per name).
- **Status badges:** small pill — Active (accent/green tint) · Archived (muted/gray).
- Generous tap targets (≥44px), comfortable spacing, minimal chrome.

## 4. Navigation

Bottom **TabBar** with 4 tabs (icon + Ukrainian label):

1. **Розклад** (Schedule) — home / index
2. **Студенти** (Students)
3. **Звіти** (Reports)
4. **Профіль** (Profile)

## 5. Screens

### 5.1 Розклад (Schedule) — home
The daily driver. Shows **today** by default with a way to see the week.

- Header: current day / date; a segmented control or chips to switch **Сьогодні / Тиждень**.
- A time-ordered list of **lesson cards** (Cells): time (e.g. `15:00`), student name + subject,
  and a status/affordance on the right.
- **One-tap "mark done"** on a lesson (checkmark) → lesson becomes *Проведено*; haptic + subtle
  state change.
- Secondary actions per lesson (swipe or tap-through): **Скасувати / Перенести**.
- **Empty state:** friendly illustration + "На сьогодні занять немає".
- Lesson statuses: *Заплановано* · *Проведено* · *Скасовано* — differentiate with color/opacity.

### 5.2 Студенти (Students) — list
- **Search** field at top (filter by name).
- **Add** a student — via `MainButton` "Додати студента" (opens a form) or an inline add row.
- List of **student Cells**: avatar · name (title) · subject (subtitle) · trailing = rate
  (`250 ₴/год`) or a **balance** (green if paid up, red if in debt) + chevron.
- Archived students visually de-emphasized (or filtered out by default).
- Tap a Cell → **Student detail**.
- States: loading (skeleton cells), empty ("Ще немає студентів"), error ("Не вдалося завантажити"
  / "Сесія застаріла — відкрийте застосунок знову").

### 5.3 Студент — detail
- Header: large avatar, name, status badge.
- **Profile section (Cells):** Предмет · Ставка (`₴/заняття`) · Контакт · Додано (date).
- **Finances section:** current **баланс/борг** prominently (green/red), short ledger hint
  (Σ оплат − Σ проведених × ставка).
- Actions: **Редагувати** (edit form), **Архівувати** (destructive), maybe **Додати оплату**.
- Edit = same form as create, prefilled; save via `MainButton`.

### 5.4 Звіти (Reports)
- **Monthly dashboard** at top: two big tiles — **Зароблено** (accent) and **Боргують** (red).
- **Список боржників** (Cells): student · amount owed (red).
- **Chart** — earnings by month (bar/line), theme-aware colors.
- **AI:** button **"Згенерувати звіт для батьків"** → preview of a generated summary (formal /
  friendly tone).

### 5.5 Профіль (Profile)
- Current tutor from `GET /me`: avatar, name, `@username`.
- Settings section (Cells): тема (auto from Telegram), мова, згодом — політика скасування занять.
- Minimal; mostly informational.

## 6. Patterns & states (apply everywhere)

- **Every list has loading / empty / error states** — never a blank screen.
- **1–3 taps** to any core action. Primary action = `MainButton`.
- **Card/section layout** for all lists (students, lessons, payments).
- Optimistic, snappy feedback; haptics on create/complete/delete.
- Copy is short, warm, Ukrainian. Currency: `₴`.

## 7. Priority for a first pass

Students (list + add + detail) and Schedule (today + mark-done) are the core loop — design those
first and most carefully. Reports and Profile can be lighter.

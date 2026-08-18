# חוזה קפוא — שלב ב' שליחה חכמה (§4.2)

> נכתב 2026-07-23 אחרי recon (4 צוותים) + הכרעות עידן. **קפוא לפני פיזור בנאים.** כל שינוי כאן = STOP + דיווח, לא תיקון חד-צדדי.
> עותק עבודה יחיד: `C:\Subversions\NewBitBucket\PulseemReact` (ענף `NewClalDesign`). **מירror `...\ClalNewDesign\ReactCode\` מיושן — לא לגעת.**

---

## 1. מפת בעלות — קובץ = בנאי אחד

| בנאי | קבצים | פריטים |
|---|---|---|
| **A — אני (אורchestrator)** | `src/screens/SmartSend/SmartSendScreen.tsx` · `components/TestSendDialog.tsx` · `components/SendSummaryDialog.tsx` · **כל 3 קבצי i18n** (`en/DataSources.json`, `he/DataSources.he.json`, `pl/DataSources.json`) | 1, 2, 3, 4 |
| **B — סוכן build** | `src/screens/SmartSend/components/CampaignPicker.tsx` **בלבד** | 5 |

**‏🔴 קבצי i18n בבעלות A בלבד.** סוכן B מפנה לשמות המפתחות הקפואים למטה, **לא נוגע ב-JSON.** כך אין שני כותבים ל-JSON.
כל שאר הקבצים שהפריטים נוגעים בהם דיסjointים — אין קובץ עם שני בעלים.

---

## 2. i18n קפוא — A מוסיף לשלושה הקבצים, זהה במבנה

מבנה קיים: `DataSources.send.{actions,summary,testSend,picker,...}`. להוסיף **אובייקטים חדשים תחת `send`** + rewords. ספירת עלים זהה בשלוש השפות.

### 2א. מפתחות חדשים (פריט 3 — יציאה/סרגל)

| key (תחת `DataSources.`) | en | he | pl |
|---|---|---|---|
| `send.saveBar.unsaved` | You have unsaved field-mapping changes. | יש לך שינויים לא שמורים במיפוי השדות. | Masz niezapisane zmiany w mapowaniu pól. |
| `send.exit.title` | Save your changes before leaving? | לשמור את השינויים לפני היציאה? | Zapisać zmiany przed wyjściem? |
| `send.exit.body` | Your field-mapping changes are not saved yet. | מיפוי השדות שלך עדיין לא נשמר. | Twoje mapowanie pól nie zostało jeszcze zapisane. |
| `send.exit.saveAndExit` | Save and exit | שמור וצא | Zapisz i wyjdź |
| `send.exit.exitWithoutSaving` | Exit without saving | צא בלי לשמור | Wyjdź bez zapisywania |
| `send.exit.saveFailed` | Saving failed — you are still on the page. | השמירה נכשלה — נשארת במסך. | Zapis nie powiódł się — pozostajesz na stronie. |

*(כפתור "ביטול" בדיאלוג היציאה → `send.cancel` קיים. `beforeunload` הנייטיב — הדפדפן מתעלם מטקסט מותאם, אין key.)*

### 2ב. מפתחות חדשים (פריט 4 — הצעת שמירה בבדיקה)

| key | en | he | pl |
|---|---|---|---|
| `send.testSavePrompt.title` | Unsaved mapping changes | שינויים לא שמורים במיפוי | Niezapisane zmiany mapowania |
| `send.testSavePrompt.body` | You can save the mapping now, or run the test without saving — the test email shows raw field tags either way. | אפשר לשמור את המיפוי עכשיו, או להריץ בדיקה בלי לשמור — מייל הבדיקה מציג תגיות שדה גולמיות בכל מקרה. | Możesz teraz zapisać mapowanie lub uruchomić test bez zapisywania — testowy e-mail i tak pokazuje surowe znaczniki pól. |

*(כפתור השמירה בבאנר → `send.actions.saveMapping` קיים.)*

### 2ג. פריט 5 (CampaignPicker) — מפתח חדש + reword

| key | en | he | pl | פעולה |
|---|---|---|---|---|
| `send.picker.showMore` | Show {{count}} more | הצג עוד {{count}} | Pokaż więcej: {{count}} | **חדש** — מרחיב הקיצוץ (12→) |
| `send.picker.showAll` | Show unavailable campaigns too | הצג גם קמפיינים שאינם זמינים | Pokaż też niedostępne kampanie | **reword** (היה "Show all campaigns") — זה מתג הסינון `onlySendable`, לא "הצג עוד" |

---

## 3. עיצוב אשכול A (פריטים 1-4) — התכנית המדויקת שלי

**פריט 1** — `SmartSendScreen.tsx:343`: להוסיף `setDirty(true)` ל-`onChange` של `BusinessColumnsPicker` (כמו `:335`). נתיב הנתונים כבר עובד (`:135-137`).

**פריט 2** — לפצל `doSave` (הסכנה = חיבור GroupIds `:210-212`):
- `saveMapping(silent?): Promise<{ok, gid}>` = החלק של `setMapping` (`:148-156`). מצליח → `setDirty(false)`, toast אם `!silent`. **בלי חיבור GroupIds.**
- `attachGroup(gid): Promise<boolean>` = ה-RMW של send-settings (`:157-222`). מצליח → true; נכשל → `showToast` + false.
- `openSummary` → `saveMapping(true)` + `fillAndSummarize` + `getSendSummaryWrapped` + `getEmailSendSettingsWrapped` + `setSummaryOpen(true)`. **בלי attach.** לשמור `gid` ב-state (`pendingGid`).
- כפתור "Save mapping" הראשי → עובר לסרגל (פריט 3), קורא `saveMapping()`. **מוסר משורת `:352`** (dedup).
- `SendSummaryDialog` מקבל prop חדש `beforeSend: () => Promise<boolean>` (מהאב: `() => attachGroup(pendingGid)`). `doSend`: `setPhase('sending')` → אם `beforeSend` מחזיר false → `setPhase('summary')` (ה-toast של האב מסביר) → אחרת `sendSmart`. **החיבור קורה רק בלחיצת Send.** עובר AC#2 (ביטול → GroupIds לא נגע).

**פריט 3** — יציאה + סרגל דביק + beforeunload (react-router 6.4.2, **אין useBlocker**):
- להסיר את כיתוב ה-dirty מהכותרת (`:405-409`) + לעדכן הערת `:402-404` (כבר לא "no beforeunload").
- **סרגל דביק** (מוצג כש-`dirty`): `Box` `position:'sticky', bottom:0`, צבעי warning של InlineBanner (`#fff8e1`/`#ffe082`/`#b7791f`), מכיל: הודעה `send.saveBar.unsaved` + כפתור `[send.actions.saveMapping]`→`saveMapping()`. להוסיף `paddingBottom` ל-body כדי שלא יכסה את `Send`.
- **יירוט יציאה**: כפתור back-to-picker (`:420`) → אם `dirty`: `setExitOpen(true)`; אחרת: הניווט הקיים. (404-branch `:255` ו-summary-close `:446` — לא נוגעים; שם אין dirty.)
- **דיאלוג יציאה תלת-כיווני** (שלד `{head,body,foot}` מ-TestSendDialog): `[שמור וצא]`(primary, פוקוס ראשוני)→`saveMapping()`→אם ok: ניווט; אם לא: להשאיר פתוח + באנר `send.exit.saveFailed` · `[צא בלי לשמור]`(muted)→ניווט מיידי · `[ביטול]`(`send.cancel`)→סגור. Esc=ביטול. סדר RTL: שמור-וצא ‖ צא-בלי-לשמור, ביטול.
- **beforeunload**: `useEffect([dirty])` — כשה-dirty מוסיף listener (`e.preventDefault(); e.returnValue=''`), ב-cleanup מסיר. דפוס `LegacyPageFrame.tsx:17-27`.
- **מגבלה מתועדת**: ניווט תפריט-צד ב-SPA לא נחסם (אין useBlocker); הסרגל הוא המיתון.

**פריט 4** — `TestSendDialog.tsx`: props חדשים `dirty: boolean` + `onSaveMapping: () => Promise<{ok:boolean}>`. כש-`dirty` — InlineBanner נוסף (severity `info`) title `send.testSavePrompt.title` body `send.testSavePrompt.body` + `action` = כפתור `[send.actions.saveMapping]` שקורא `onSaveMapping` (spinner מקומי). הבדיקה עצמה ממשיכה תמיד. `SmartSendScreen` מעביר `dirty={dirty} onSaveMapping={saveMapping}`.

---

## 4. ספרינט B — פריט 5 (CampaignPicker.tsx) — ספק לסוכן

**להעתיק את הסעיף הזה לפרומפט הסוכן.** קובץ יחיד: `CampaignPicker.tsx`. אסור לגעת ב-JSON (המפתחות מוקפאים ב-§2ג ו-A מוסיף אותם).

1. **רשת עוטפת** במקום `flexDirection:'column'` (`:81`): להעתיק `SourcePicker.tsx:29-31` (`display:flex; flexWrap:wrap; gap; width:264` לכרטיס). **לא** `ChannelSelector` (`minWidth:150` נמתח).
2. **להסיר `maxHeight:420`** (`:84`).
3. **תוכן כרטיס** = מה שכבר מרונדר `:280-299` (שם / צ'יפ סטטוס / `#מספר` / תאריך עדכון). **בלי מספר נמענים.** שם: להוסיף `-webkit-line-clamp:2` + `min-height` (כרגע `:100` יש overflowWrap בלי clamp → הרשת מתקלקלת).
4. **קיצוץ ל-12 כרטיסים + "הצג עוד N"**: פקד **חדש ונפרד** — כפתור `t('DataSources.send.picker.showMore',{count:N})`. הקיצוץ על הרשימה **שאחרי** סינון `onlySendable`.
5. **`onlySendable` נשאר מתג (Switch)** נפרד; הכפתור שמכבה אותו (`setOnlySendable(false)`, `:354/:378`) — הטקסט שלו `send.picker.showAll` **נוסח מחדש** ל"הצג גם קמפיינים שאינם זמינים" (A כבר עדכן את ה-JSON). זה **לא** "הצג עוד".
6. **סמנטיקת חצים לרשת**: להחזיר ל-`SourcePicker.tsx:180-181` (Down/Left=הבא ב-RTL) ולהסיר `aria-orientation="vertical"` (`:368`). לעדכן הערות שמסבירות את הסמנטיקה הישנה.
7. **7 סטטוסים**: `STATUS_KEY` (`:40-48`) — להשאיר את כל 7, לא לצמצם.
8. **לשמר**: `role="radiogroup"`, roving tabindex, Enter/רווח, כרטיסים מושבתים עם סיבה ב-`aria-describedby`, אי-גניבת פוקוס.
9. **STOP**: פער בין הספק לקוד → לדווח, לא לתקן חד-צדדית.

---

## 5. אימות (§4.3/§5)
`npm run build-ssl` = **exit 0**, אפס שגיאות TS חדשות בקבצים שנגעת (מלבד 448×TS2786 + TS17001 הקיימות מראש ב-`ResponseModal.js`). מלכודות: 201 (לא 200) ב-GetSendSettings; `sitePrefix` תמיד `?? ''`; `Redirect` דורש `openNewTab`.

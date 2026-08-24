# REACT-TEST-PLAN — SendSearch V1 · בדיקות Jest

**בעלים:** TEST-REACT · **נכתב:** 2026-07-30 · **חוזה:** CONTRACT §5 (שורת TEST-REACT), §4.2, §4.3, D8, D10 · **תיקונים:** RESUME.md §3 A1, A3, A8

---

## 0. ⚠️ הבדיקות האלה **מעולם לא רצו**

**אין `npm` בעץ המראה הזה.** `ReactCode\` הוא מירור של `src` בלבד — **אין בו `package.json`, אין `node_modules`, ואין דרך להריץ `jest`** (CONTRACT §4: "ReactCode is a src-only mirror with no package.json"). כלל אי-ההרצה של המשלוח אוסר גם `npm install` וגם כל build.

לכן:

- **אף אחת מהבדיקות בקבצים האלה לא הורצה, ולו פעם אחת.** אין ריצה ירוקה, אין פלט jest, אין צילום מסך.
- הן נכתבו **מול קוד שנקרא**, לא מול קוד שרץ. הנכונות שלהן היא ברמת החוזה, בדיוק כמו שאר המשלוח.
- **הריצה הראשונה שלהן — בריפו הבונה `C:\Subversions\NewBitBucket\PulseemReact`, ענף `NewClalDesign` — היא חלק מהחלת המשלוח, לא אימות שלו.** צפו לתיקוני תחביר/נתיבים בריצה הראשונה. פרק 6 מפרט בדיוק איפה זה הכי סביר.
- מי שיקרא "כתובות 5 חבילות בדיקה" ויסיק "הפיצ׳ר נבדק" — טועה. מה שקיים הוא **רשת בדיקה כתובה**, לא **תוצאת בדיקה**.

---

## 1. לאן הקבצים נכנסים בריפו האמיתי

כל הקבצים נכנסים ל-**`src/screens/SendSearch/`**, לצד `SendSearchScreen.tsx` ו-`components/`.

| קובץ במשלוח (`_delivery\SendSearch-V1\tests\react\`) | יעד בריפו האמיתי |
|---|---|
| `sendSearchTestI18n.ts` | `src/screens/SendSearch/sendSearchTestI18n.ts` |
| `versionBadge.matrix.test.tsx` | `src/screens/SendSearch/versionBadge.matrix.test.tsx` |
| `sendStatusCell.unknown.test.tsx` | `src/screens/SendSearch/sendStatusCell.unknown.test.tsx` |
| `drawerStack.test.tsx` | `src/screens/SendSearch/drawerStack.test.tsx` |
| `sendSearchSlice.test.ts` | `src/screens/SendSearch/sendSearchSlice.test.ts` |
| `sendSearchTypes.conformance.test.ts` | `src/screens/SendSearch/sendSearchTypes.conformance.test.ts` |

**למה בתיקיית המסך ולא ב-`__tests__/` ולא בתיקיית `tests/` נפרדת** — שלוש סיבות, לפי הסדר:

1. **זה התקדים היחיד בריפו.** `tierGraphCore.selftest.test.js` יושב בתוך `src/screens/HtmlCampaign/components/TierGraph/`, לצד הקוד שהוא בודק. אין בריפו הזה תיקיית בדיקות מרכזית.
2. **`testMatch` של CRA הוא `src/**/__tests__/**/*.{js,mjs,jsx,ts,tsx}` **או** `src/**/*.{spec,test}.{js,mjs,jsx,ts,tsx}`.** הרגל הראשונה תופסת **כל** קובץ בתוך `__tests__/`, כולל קובץ עזר — ואז jest נופל על `Your test suite must contain at least one test`. `sendSearchTestI18n.ts` הוא קובץ עזר; מחוץ ל-`__tests__/` ובלי `.test.` בשם הוא לא נתפס בשום רגל. זה בדיוק השיקול שהחזיק את `tierGraphCore.selftest.js` **ליד** ולא **בתוך**.
3. **נתיבים יחסיים קצרים ויציבים:** `./components/VersionBadge`, `../../Models/DataSources/SendSearch`, `../../redux/reducers/sendSearchSlice`, `../../assets/translations/he/SendSearch.he.json`.

> **הערה למחיל:** אלה קבצים **חדשים** בלבד — אין כאן שום patch לקובץ קיים, ולכן אין התנגשות עם עריכות מקבילות. אין צורך לרשום אותם בשום מקום (אין `<Compile Include>` בעולם הריאקט, ו-CRA מגלה בדיקות לבד).

---

## 2. איזה npm script מריץ אותן

```bash
# מתוך C:\Subversions\NewBitBucket\PulseemReact  (ענף NewClalDesign)
npm test -- --watchAll=false --testPathPattern "screens/SendSearch"
```

- `npm test` בפרויקט CRA = `react-scripts test`, שמריץ jest עם ה-`testMatch` שבפרק 1. **אין צורך בקונפיגורציית jest חדשה, אין צורך בחבילה חדשה.**
- `--watchAll=false` הכרחי: בלעדיו CRA נכנס ל-watch mode אינטראקטיבי ולא מסיים.
- `--testPathPattern` מצמצם לבדיקות של הפיצ׳ר הזה. **בריצה ראשונה מומלץ להריץ בלעדיו** פעם אחת, כדי לראות שהרצת הבדיקות של הריפו כולו לא נשברה בגלל התוספת.
- **אין תלות חדשה.** הבדיקות משתמשות ב-`react-dom` + `react-dom/test-utils` בלבד — לא ב-`@testing-library/react` ולא ב-`react-test-renderer`, כי אי-אפשר לאמת מהמירור שהן מותקנות, ו-`react-dom` מותקן בהכרח.

---

## 3. טבלת מקרה → ציפייה

### 3.1 `versionBadge.matrix.test.tsx` — **תשע המשבצות** (CONTRACT D8, §4.2)

| # | מקרה | ציפייה |
|---|---|---|
| V0 | הדומיינים עדיין 3×3 | `PROVENANCE_SOURCES` = Recorded/Inferred/Unverifiable, `VERSION_STATES` = Available/Purged/Scrubbed, מכפלה = 9 |
| V1–V9 | כל צירוף `ProvenanceSource × VersionState`, `VersionNumber=7` | טקסט **גלוי ולא ריק**; מכיל `V7`; ב-Purged/Scrubbed מכיל גם את מילת המצב מה-JSON העברי המשולח |
| V10–V18 | אותם 9 צירופים, `VersionNumber=null` | טקסט גלוי ולא ריק; **בלי `V` יתומה** |
| V19 | `ProvenanceSource='RecordedIsh'` (מחוץ לדומיין) | מציג "לא ניתן לאימות"; **לא** "מתועד" ו**לא** "משוחזר" |
| V20 | `VersionState='Archived'` (מחוץ לדומיין) | מציג `V7`; **אף אחת** ממילות המצב לא מוחלפת פנימה |
| V21 | הכל לא ידוע בבת אחת (`''`, `''`, `null`) | עדיין טקסט גלוי |
| V22 | `IsOutdated` + `LatestVersionNumber=9` | `V7` + "מיושנת" |
| V23 | **A1:** `IsOutdated` + `LatestVersionNumber=null` | טקסט גלוי, **בלי `NaN`**, `V7` נשמר |

בכל אחד מ-V1–V23 נבדקות ארבע דרכי-כישלון בנפרד: מחרוזת ריקה/רווחים בלבד · `undefined` · `null` · `{{` שנשאר מ-i18next.

**למה זה הלב של החבילה:** תא גרסה ריק **נקרא כ"לא נשלח כלום"** (CONTRACT D8, מילה במילה). גרסה שטוהרה, גרסה שנגרדה ומקור לא-ניתן-לאימות הם **כולם** מצבים שבהם משהו כן נשלח ורק שורת הגרסה כבר לא שלמה. רינדור ריק שם הוא בדיוק סוג הכשל הבלתי-נראה שהפיצ׳ר קיים כדי למנוע.

**A3:** `Scrubbed` **אינו נפלט בשום SP ב-V1** (RESUME.md §3 A3) והוא נשאר במטריצה בכוונה — ביום שה-scrub SP יקבל עמודת דגל, הרנדרר חייב להיות נכון כבר; מטריצה שמכסה רק את מה שהשרת שולח היום הייתה מחייבת גילוי מחדש אז.

### 3.2 `sendStatusCell.unknown.test.tsx` — הכלל של D10

| # | מקרה | ציפייה |
|---|---|---|
| S0 | `delivery.unknown` / `engagement.unknown` ב-JSON המשולח | קיימים ולא ריקים (**בדיקת הנחת-היסוד** — בלעדיה כל השאר בודק היעדר מול היעדר) |
| S1–S5 | `DeliveryState` חדש לגמרי: `BouncedSoft` · `QUEUED_FOR_RETRY` · `נכשל חלקית` · `42` · `''` | מציג את "סטטוס לא מזוהה"; **ולא** אף אחת משאר מילות ה-delivery ב-JSON; לא `undefined`; **לא מהדהד את הקוד הגולמי** |
| S6 | `Delivered` על ערוץ **אימייל** | הופך ל-unknown; **לא** "נמסר" — לאימייל אין אישור מסירה |
| S7 | `Delivered` על ערוץ **SMS** | מציג "נמסר" (ההיפוך של S6 — בלעדיו רכיב שמציג unknown לכל דבר היה עובר את כל החבילה) |
| S8 | כל מצב חוקי בכל שלושת הערוצים | לכל אחד יש מילה עברית משלו; אין `undefined`; אף קוד PascalCase לא מודלף |
| S9 | `EngagementState='Forwarded'` | "נשלח" + "לא מזוהה"; המחרוזת `Forwarded` לא מופיעה |
| S10 | `attempts=[]` | בדיוק "לא נשלח בשום ערוץ" — משפט, לא תא ריק |

**החצי שבאמת חשוב הוא (b) — ש*שום מילת סטטוס אחרת* לא הופיעה.** הבאג החי שהמשלוח הזה מתקן אינו "סטטוס שהוצג כ-`undefined`" — כזה היה נתפס לפני שנים. הוא **סטטוס שהוצג כמילה שגויה אך סבירה לחלוטין**: קוד וואטסאפ פר-הודעה מגיע בשדה `SmsStatus` ומפוענח ב-`renderSMSStatus` (`RecipientReport.tsx:510-522`), תעתיק 1:1 של enum מחזור-החיים הגלובלי `eCampaignStatus`, ולכן הייצוא לאקסל מדפיס הודעות **שנכשלו** כ"נשלח". אף אחד לא ראה את זה, כי "נשלח" היא מילת סטטוס אמיתית בעמודת סטטוס אמיתית. טענה (a) לבדה לא הייתה תופסת את זה. טענה (b) כן.

### 3.3 `drawerStack.test.tsx` — מחסנית 3 רמות

| # | מקרה | ציפייה |
|---|---|---|
| D1 | שלוש דחיפות: rollup → agent → message | `['rollup','agent','message']`, אורך 3 |
| D2 | **`Esc` (pop) מוריד רמה אחת בדיוק** | אורך 2, הרמה העליונה = `agent` — **לא סגירה מלאה** |
| D3 | pop חוזר | 3→2→1→0, ו-pop על מחסנית ריקה אינרטי |
| D4 | **קליק על ה-scrim** | המחסנית מתרוקנת בבת אחת |
| D5 | דחיפת רמה רביעית | **נדחית**; האורך נשאר 3 והרמה השלישית המקורית שורדת |
| D6 | breadcrumb ל-3 רמות | שלושת ה-crumbs, **בסדר הנכון**, עם בדיוק שני `›` |
| D7 | כפתור חזרה | "חזרה לריכוז" — **מנקב בשם** את הרמה שחוזרים אליה; בלי `{{` |
| D8 | רמה 1 | אין כפתור חזרה כלל |
| D9 | `onClose(_, 'escapeKeyDown')` | קורא ל-`onPop` **פעם אחת**, ל-`onClose` אפס |
| D10 | `onClose(_, 'backdropClick')` | קורא ל-`onClose` פעם אחת, ו-`onPop` נשאר על 1 (ה-scrim לא גם pop) |
| D11 | מחסנית ריקה | לא מרונדר כלום, `open === false` |
| D12 | RTL | `anchor === 'right'` |

D2 הוא המקרה הכי נוטה לרגרסיה בכל המסך: המימוש הטבעי (מאזין `keydown` על `document` **בנוסף** לזה של ה-Modal) עושה pop כפול בכל הקשה, והקיצור הטבעי (`Esc → closeDrawer`) זורק את כל המחסנית ומחזיר את המשתמש לגריד מרמה 3. שניהם נתפסים כאן.

### 3.4 `sendSearchSlice.test.ts` — reducer טהור

| # | מקרה | ציפייה |
|---|---|---|
| R1 | שינוי מסנן אחרי `PageIndex=4` | `PageIndex → 0` |
| R2 | **כל** שדה מסנן בנפרד (7 שדות) | כולם מאפסים את העמוד |
| R3 | `setPageIndex(2)` | המסננים **נשמרים** — משתנה רק האינדקס |
| R4 | `setPageIndex(-3)` | clamp ל-0 |
| R5 | `setPageSize(100)` | גודל מתעדכן, **עמוד מתאפס** |
| R6 | "נקה הכל" | מסננים מתאפסים, **Channel ו-PageSize שורדים** |
| R7 | `toSendSearchRequest` על ברירת מחדל | `Channel === 1` **מפורש** (RESUME §4.2), טקסט ריק → `null` |
| R8 | `PageSize` 5000 / 0 / רווחים | 200 / 1 / `SearchText=null` |
| R9 | `pending` | `loading === true` |
| R10 | `fulfilled` | `loading === false` — **loading אמת רק בזמן טיסה** |
| R11 | `rejected` | `error` נקבע **וגם** `loading` מתאפס, items מתרוקן |
| R12 | `pending` חדש אחרי שגיאה | `error === null` |
| R13 | 200 עם `Data: null` | נחשב שגיאה, לא "אפס תוצאות" |
| R14 | תשובה מיושנת (`requestId` ישן) | לא דורסת את הנוכחית |
| R15 | **50 items, `TotalCount=1240`** | `totalCount === 1240` ו-**`!== items.length`** |
| R16 | `TotalCount` חסר בתשובה | קורא 0, לא יורש את הערך הקודם |
| R17 | provenance: מערך ריק | **לא שגיאה** — זו התשובה הנורמלית לשליחה שקדמה ל-provenance (D7) |
| R18 | provenance: `rejected` | `provenanceError` נקבע — **נבדל** מהיסטוריה ריקה |

R15/R16 הם A8 משני הכיוונים: אם ה-pager היה קורא `items.length`, עמוד של 50 מתוך 1,240 היה מרנדר pager של עמוד אחד, והמפעילה הייתה מסיקה שיתר 1,190 השליחות לא קיימות — **תשובה שגויה בשקט, בלי שום שגיאה בשום מקום.**

### 3.5 `sendSearchTypes.conformance.test.ts` — התאמת טיפוסים

| # | מקרה | ציפייה |
|---|---|---|
| T1 | **סט** המפתחות של `SendSearchRow` | זהה ל-20 המאפיינים של ה-C# |
| T2 | **סדר** המפתחות | זהה לסדר עמודות result set 1 |
| T3 | ארבעת השדות ה-nullable (`DataSourceVersionID`, `VersionNumber`, `SentAt`, `EngagementAt`) | מחזיקים `null` בפועל — לא נמחקים, לא מומרים ל-0/`''` |
| T4 | `DeliveryState`/`EngagementState` | `string` על החוט, **לא** union — אחרת ערך לא מוכר היה בלתי-אפשרי בקומפילציה במקום גלוי בזמן ריצה |
| T5 | `SendSearchResponse` | `Items` + `TotalCount` בלבד |
| T6 | `SendSearchRequest` | עשרת הפרמטרים, **ואין `SubAccountID`** (הוא תמיד מה-JWT) |
| T7 | `sendSearchRowKey` | שתי שליחות של אותו `RowID` בזמנים שונים → מפתחות שונים; `SentAt=null` לא מייצר `undefined` בזנב |
| T8 | **A1:** `LatestVersionNumber: null` | ניתן להשמה, נשאר `null`, **לא** 0, **לא** `undefined`, **לא** שווה ל-`VersionNumber` |
| T9 | חמשת מוני ה-Fill | כולם nullable |
| T10 | סט המפתחות של `SendProvenanceRow` | זהה ל-17 של CONTRACT §3.1 |

---

## 4. מה **לא** מכוסה, ולמה

| מה | למה לא |
|---|---|
| **`SendSearchScreen.tsx` בשלמותו** | הוא `useSelector`/`useDispatch` מול ה-store האמיתי. CONTRACT §5 אוסר במפורש בדיקה שדורשת live store, והעטיפה ב-`<Provider>` עם store אמיתי היא בדיוק זה. אריגת store מזויף הייתה בודקת את ה-store המזויף. **המסך נבדק בעקיפין:** ה-reducer (3.4), הרכיבים (3.1–3.3) והטיפוסים (3.5) הם כל הלוגיקה שבו; מה שנשאר הוא חיווט, ואת החיווט בודקים בגל R4 (תפר C#↔React) ובריצה ידנית. |
| **`SendSearchFilters.tsx` / `SendSearchTable.tsx` / `AgentDrawer.tsx` / `RollupDrawer.tsx`** | אותו נימוק — הם צרכני `useSelector`. `SendSearchTable` נבדק היכן שהוא נשבר בשקט (קריאת `TotalCount`) דרך ה-reducer ב-R15/R16, וזה החלק שיש לו תוצאה שגויה ולא תקלה גלויה. |
| **קריאות רשת (`searchSends` / `getSendProvenance` thunk bodies)** | דורש רשת או mock של axios. הן מעטפת דקה סביב `PulseemReactInstance.post/get`; מה שיש בהן מלוגיקה הוא ה-reducers, שנבדקים. |
| **שהמפתחות קיימים גם ב-`en` וב-`pl`** | הבדיקות פותרות מול ה-JSON העברי בלבד — עברית היא כיוון הרינדור הראשי (CONTRACT §4). בדיקת שוויון סטי-מפתחות בין שלוש השפות שייכת ל-REACT-PATCH, שמחזיק את שלושת הקבצים. **פער ידוע ומכוון.** |
| **ש-MUI v4 באמת מדווח `'escapeKeyDown'` / `'backdropClick'`** | עובדת ספרייה, לא הלוגיקה שלנו. D9/D10 בודקים את ההסתעפות **שלנו** על ה-reason; שה-Modal אכן שולח את ה-reason האלה נלקח מהחוזה המתועד של MUI. אם MUI ישודרג — זה מה שיישבר, וזו הנקודה לבדוק. |
| **ה-tooltip של `VersionBadge`** | MUI מרנדר title רק ב-hover/portal. הטקסט הקריטי — מילת המצב עבור Purged/Scrubbed — **נבדק בתא עצמו**, וזה מכוון: tooltip לא נראה בהדפסה, בייצוא לאקסל ובמגע, ולכן הוא לא יכול להיות המקום היחיד שבו הידיעה קיימת. |
| **נעילת גלילת ה-body בזמן drawer פתוח** | מסופק ע"י ה-Modal של MUI (`disableScrollLock=false`) ולא ממומש אצלנו. אין מה לבדוק שהוא שלנו. |
| **RTL ויזואלי, פריסה, צבעים, נגישות** | אין רנדרר ויזואלי ואין baseline. `anchor === 'right'` (D12) הוא הפריט היחיד מהמשפחה הזו שיש לו תשובה בינארית. |
| **התאמה ל-`SendSearchModels.cs` בקריאת הקובץ עצמו** | הקובץ ב-**ריפו אחר** (`ApiForReactCode`) ואינו נגיש מ-build של הריאקט. הרשימה ב-`sendSearchTypes.conformance.test.ts` היא **תעתיק** מתוייג בהפניות שורה. התאום שלה בצד ה-C# הוא ה-harness של TEST-CS. **זה הפער האמיתי הכי גדול בחבילה** — הוא נסגר בגל R4 (תפר C#↔React), לא כאן. |

---

## 5. מה מדומה (mock) ומה לא — במפורש

| מדומה | למה, ולמה זה לא "לדמות חצי אפליקציה" |
|---|---|
| `react-i18next` → `useTranslation` | מוחלף ב-resolver מול **ה-JSON העברי המשולח עצמו**. `t` שמחזיר את המפתח שקיבל היה הופך כל בדיקה כאן לריקה: `expect(text).not.toBe('')` היה מסתפק ב-`"SendSearch.version.state.purged"` — תא לא-ריק שלא אומר למפעילה כלום, ובעיקר **לא היה תופס מפתח שהרכיב בונה וה-JSON לא מגדיר**. כאן מפתח חסר מחזיר `undefined`, התא יוצא ריק, והבדיקה נופלת. זה מה שהיא אמורה לעשות. |
| `helpers/Api/PulseemReactAPI` | ה-slice מייבא את מופע ה-axios ב-module scope, וזה מושך בזמן `require` את bootstrap של i18n, cookies ו-`window.location`. גבול מודול **אחד**, שאף פעם לא נקרא בבדיקות האלה. |
| `@material-ui/core/Drawer` (רק ב-`drawerStack.test.tsx`) | ה-Drawer של MUI v4 עושה portal ל-`document.body` ומחזיק את טיפול ה-Escape בעצמו. הנעת זה דרך `KeyboardEvent` מסונתז ב-jsdom בודקת את delegation של React 16 ואת החיווט הפנימי של Modal — **לא את החוזה שלנו** — ונופלת או עוברת מסיבות שאין להן קשר לפיצ׳ר. ה-stub הוא חמש שורות שמרנדרות children ומחזירות את ה-props, וזה הופך את הדבר היחיד שבאמת שלנו — ההסתעפות reason→callback — לישיר וודאי. שום דבר אחר ב-MUI לא מוחלף. |

**לא מדומה:** ה-reducer, ה-slice, כל שאר רכיבי MUI, `moment`, `getChannelDescriptor`, ו-`Models/DataSources/SendSearch.ts` על כל הפונקציות הטהורות שבו.

---

## 6. איפה הריצה הראשונה סבירה להיכשל — וזה תיקון, לא פגם

לפי סדר הסתברות. שלושת הראשונים הם **נתיבים/סביבה**, לא לוגיקה:

1. **ייבוא JSON.** `import heNamespace from '../../assets/translations/he/SendSearch.he.json'` דורש `resolveJsonModule` ב-`tsconfig.json`. CRA מגדיר את זה כברירת מחדל, אבל אם ה-`tsconfig` בריפו הבונה ידני — יש להוסיף `"resolveJsonModule": true`. תסמין: `Cannot find module … .json`.
2. **`jest.mock('@material-ui/core/Drawer')`.** מסתמך על כך שה-barrel של MUI v4 עושה `export { default as Drawer } from './Drawer'` — ולכן mock על נתיב תת-המודול נתפס. אם לא: להחליף ב-mock חלקי של `@material-ui/core` עם `jest.requireActual`. תסמין: D9/D10 נכשלים כי `mockDrawerProps.current` הוא `null`.
3. **`getChannelDescriptor(...).labelKey`.** `sendStatusCell.unknown.test.tsx` מסתמך על כך שהוא קיים ב-`Models/DataSources/SmartSend.ts` — נקרא מתוך `SendStatusCell.tsx` עצמו, אבל לא אומת מהמירור. תסמין: `TypeError: getChannelDescriptor is not a function`.
4. **`DateFormats.DATE_TIME_24`.** `SendStatusCell` מייבא אותו מ-`helpers/Constants`. הבדיקות מעבירות `EvidenceAt: null` כדי שהוא לא יגיע לרינדור, אבל הייבוא עצמו קורה. תסמין: כשל ב-import time.
5. **אזהרות `act()`** מ-React 18 אם הריפו שודרג. פתרון: `globalThis.IS_REACT_ACT_ENVIRONMENT = true` ב-`setupTests`, או מעבר ל-`createRoot`.

**אם משהו כאן נכשל — התיקון הוא בקובץ הבדיקה, לא בקוד המוצר**, אלא אם הכשל הוא באחת מהטענות שבטבלאות פרק 3. **טענה מפרק 3 שנכשלת = פגם אמיתי במוצר**, וזו הנקודה שבה יש לעצור ולדווח ולא "להרגיע" את הבדיקה.

---

## 7. הקשר — למה דווקא שלוש הטענות האלה

הדרישה הזו היא **הבטחה #1 מתוך 4 שנמכרה ללקוח** ("הגרף משתנה למפרע"), וההוכחה האמפירית שלה היא **תקלת מילנה 11.6**. שלוש הטענות שהחבילה הזו מגנה עליהן הן בדיוק שלוש הדרכים שבהן הפיצ׳ר יכול להישלח ולהיכשל **בלי שאף אחד יבחין**:

1. **תא גרסה ריק** נקרא כ"לא נשלח כלום" (D8) — 18 מקרים ב-3.1.
2. **סטטוס שהופך למילה סבירה אך שגויה** — הבאג החי, מילה במילה, ב-`renderSMSStatus` — S1–S8 ב-3.2.
3. **pager שסופר `items.length`** ומכריז שאין עוד תוצאות — R15/R16 ב-3.4.

אף אחת מהשלוש לא זורקת חריגה, אף אחת לא צובעת שום דבר באדום, ואף אחת לא מופיעה בלוג. זו הסיבה שהן קיבלו בדיקות ולא הערות.

**ולמרות כל זה — ראו פרק 0. הבדיקות האלה לא רצו.**

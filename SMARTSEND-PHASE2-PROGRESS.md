# יומן התקדמות — שלב ב' של השליחה החכמה

> **‏🔴 אם אתה צ'אט חדש: קרא את הקובץ הזה ראשון, לפני `SMARTSEND-PHASE2-BUILD-PROMPT.md`.**
> הוא אומר לך איפה בדיוק עצרו. המסמך השני אומר לך מה המשימה.
>
> **‏🔴 אם אתה הצ'אט העובד: עדכן את הקובץ הזה אחרי כל צעד שהושלם, לפני שאתה מתחיל את הבא.**
> לא בסוף. לא "כשיהיה זמן". אחרי כל צעד. הקונטקסט שלך ייגמר בלי התראה.

---

## מצב נוכחי

**סטטוס:** ✅ **הושלם ואומת.** סבב ביקורת 3 (impact ייעודי, לבקשת עידן) — **3/3 סוכנים: מבודד · לא משפיע על מסכים אחרים · תואם בנייה קיימת · נכון (GO פה אחד)**. נִיט קוסמטי יחיד (הערת קוד) תוקן. **לא נפרס, `USE_SEND_MOCK`=`true`.**
**עודכן לאחרונה:** 2026-07-23
**עותק עבודה:** `C:\Subversions\NewBitBucket\PulseemReact` · ענף `NewClalDesign`
**‏HEAD בתחילת העבודה:** `4807e1d3c`
**‏HEAD עכשיו:** `de0ffc010` (2 קומיטים: `be2f548a8` 5 הפריטים + `de0ffc010` תיקון הערה; pushed, tree נקי)
**הבנייה האחרונה:** `npm run build-ssl` = **exit 0** ("ready to be deployed") — אומת על HEAD הסופי `de0ffc010`

---

## הושלם

| # | מה | קבצים | איך מאמתים |
|---|---|---|---|
| 0a | נשאלו 3 שאלות §9 — כל התשובות התקבלו | — | "הכרעות" + "שאלות פתוחות" |
| 0b | אומת עותק העבודה: `NewClalDesign`, HEAD `4807e1d3c`, tree נקי | — | `git -C ...\PulseemReact log/status` |
| 0c | אותרו נתיבי הקבצים המדויקים | "מה כבר נבדק" | glob |
| 0d | פוזרו 4 צוותי recon (§4.1) | — | — |
| 0e | אומת: `react-router(-dom)` = **6.4.2**, אין `useBlocker` | — | `package.json:60`, `node_modules/.../package.json:2` |
| 0f | ✅ recon **מבנה** — כל עוגני §3 מדויקים | "מה כבר נבדק"+"ממצאים" | — |
| 0g | ✅ recon **תפרים** — הכל בטוח פרט ל-beforeunload | "מה כבר נבדק" | — |
| 0h | ✅ recon **מצאי לשימוש חוזר** — מפה + חוזה i18n | "מה כבר נבדק" | — |
| 0i | ✅ recon **UX** — 2 סטיות-תכנית + מלכודת ניתוב | "ממצאים" | — |
| 0j | נקרא קוד פריט 2 (doSave/openSummary/SSD) — המנגנון מובן | `SSS:148-236`, `slice:100-121`, `SSD:47-118` | "מה כבר נבדק" |
| 0k | §4.2 חוזה קפוא נכתב (בעלות + i18n en/he/pl + עיצוב אשכול 1-4 + ספק פריט5) | `SMARTSEND-PHASE2-CONTRACT.md` | — |
| 0l | פוזר סוכן build לפריט 5 (`CampaignPicker.tsx`), רץ ברקע | — | ✅ הושלם |
| 0m | i18n: 9 מפתחות חדשים + reword showAll ב-en/he/pl; **ספירת עלים `send`=138 בשלושתם** | 3× DataSources JSON | `node JSON.parse` ✓ |
| 0n | אשכול נבנה: פריט1 `SSS:~356` · פריט2 פיצול `saveMapping`/`attachGroup` + `beforeSend` ב-SSD · פריט3 סרגל דביק+יציאה תלת-כיוונית+beforeunload · פריט4 באנר inline ב-TSD | SSS/TSD/SSD | grep ✓ (אין doSave שריד) |
| 0o | פריט 5 (CampaignPicker) הושלם ע"י הסוכן: רשת 264, cap 12+showMore, חצים→רשת, aria-orientation הוסר, 7 סטטוסים, a11y נשמר | `CampaignPicker.tsx` | דו"ח סוכן; לאמת בביקורת |
| 0p | ✅ `build-ssl` exit 0 ("ready to be deployed"); `tsc --noEmit`: 449 שגיאות = בסיס §8 בלבד, **0 בקבצים שנגעתי** | build log + `scratchpad/tsc.txt` | **AC#11 ✓** |
| 0q | סבב ביקורת 1 (צוות טרי, 3 זוויות) — ראה "סבבי ביקורת" | — | ✅ נסגר, תוקן |
| 0r | סוכן פריט5 החיל 2 תיקוני סבב1 (הבדלת כפתורי חשיפה + auto-reveal ל-a11y); אומת inline `capped:214-219` | `CampaignPicker.tsx` | ✅ |
| 0s | סבב 2 התכנס inline (0 חוסמים); `build-ssl` BUILD_EXIT:0; `tsc` 449 בסיס; ניגודיות 5.58:1 | `scratchpad/build3,tsc2.txt` | ✅ |
| 0t | **commit `be2f548a8` + push** ל-`origin/NewClalDesign` — 7 קבצים (+274/-63); **לא נפרס** | `git log/push` | ✅ סיום §4.5 |

---

## תנאי קבלה (§5) — סטטוס סופי

| # | תנאי | סטטוס |
|---|---|---|
| 1 | `dirty` בעריכת עמודות עסקיות | ✅ `SSS` onChange של BusinessColumnsPicker |
| 2 | doSave+fill **אחרי** אישור; ביטול → GroupIds לא השתנה | ✅ אופציה 1 (attach ב-`beforeSend`). *edge: קמפיין כבר-מחובר — לעידן* |
| 3 | סרגל שמירה דביק במקום כיתוב הכותרת | ✅ + `paddingBottom` + ניגודיות AA |
| 4 | דיאלוג יציאה תלת-כיווני, לא מנווט על כישלון | ✅ |
| 5 | `beforeunload` פעיל כשיש שינויים | ✅ (add/remove ב-unmount) |
| 6 | שליחת בדיקה לא שומרת; מציעה כשיש שינויים | ✅ באנר inline |
| 7 | קמפיינים ברשת, כרטיס 264 | ✅ (סוכן) |
| 8 | `maxHeight:420` הוסר · קיצוץ 12 + "הצג עוד" בנפרד מהמתג | ✅ |
| 9 | חצים בסמנטיקת רשת · `aria-orientation` הוסר | ✅ |
| 10 | i18n en/he/pl זהים, JSON תקין, ספירת עלים זהה | ✅ 137 עלים בשלושתם |
| 11 | `build-ssl` exit 0, אפס TS חדשות בקבצים שנגעתי | ✅ 449 בסיס בלבד |
| 12 | הכל committed+pushed, כלום לא פרוס, `USE_SEND_MOCK`=`true` | ✅ |

---

## בעבודה כרגע

- **אין. סשן א' הושלם ונדחף.** אין משימה פתוחה בסשן זה.
- פריט יחיד פתוח לעידן (**לא חוסם**): הקשחת edge פריט 2 (קמפיין כבר-מחובר) — דורש detach-endpoint בצד ה-API (סשן ב'/API). ראה "סבבי ביקורת" סבב 1.

---

## הצעד הבא

**סשן א' סגור.** ההמשך הוא **סשן ב'** (§7 בפרומפט הבנייה): טאב "שליחה חכמה" במסך המקורות. ההכרעות שלו כבר בידינו:
- §7.2 מבחין ערוץ = **(א) `Channel` ל-PK עכשיו** (עידן).
- §7.3.3 שני הטאבים = **אותו פריט תפריט, מקובל** (עידן).
- דורש SP חדש + endpoint + ALTER (חוץ לסקופ סשן א'; לא להריץ על DB — להכין לעידן).
- אופציונלי: הקשחת edge פריט 2 + חסימת `SMARTSEND_SP_NOT_DEPLOYED` (§6) — שתיהן בצד ה-API, להכרעת עידן.

---

## הכרעות שהתקבלו

| הכרעה | מי | נימוק |
|---|---|---|
| הטאב ייבנה במסך המקורות | בעל המוצר | ‏SMS/וואטסאפ בהמשך; קמפיינים אימייל-בלבד |
| שליחת בדיקה **לא** תשמור לבד | ביקורת, אושר | כפתור "בדיקה" היה משנה `GroupIds` |
| `USE_SEND_MOCK` לא נוגעים | ביקורת, אושר | סותר `GO-LIVE §6` + `KICKOFF §3.2` |
| 5 הפריטים הם הרשימה המלאה | עידן · 23/07 | סקופ סשן א' סגור |
| §7.2: `Channel` ל-PK עכשיו (א) | עידן · 23/07 | **סשן ב'** |
| §7.3.3: שני טאבים = אותו פריט תפריט | עידן · 23/07 | **סשן ב'** |
| **ניתוב מחדש: `SmartSendScreen.tsx` בעלים יחיד ל-1+2+3+4; `CampaignPicker.tsx` בעלים נפרד ל-5** | צ'אט · recon-UX | פריטים 1-4 **כולם** כותבים `SmartSendScreen.tsx` (item3 מחליף `:402-409`, מוסיף סרגל/יירוט/דיאלוג). ניתוב §4א שם item3 כסוכן נפרד = שני בעלים לקובץ = דריסה |
| **פריט 3: לעדכן הערת `SSS:402`** ("no beforeunload") | build §3.3 | בעל המוצר הפך במכוון; ההערה מיושנת |
| **פריט 2 = אופציה 1** — לפצל `doSave`→`saveMapping`(`setMapping`, בטוח) + `attachGroup`(settings RMW `:171-212`). `openSummary`=saveMapping+fill+summary+open; החיבור עובר ל-onSend בדיאלוג (לפני `sendSmart`) | עידן · 23/07 | הסיכום שומר מונים; ביטול=GroupIds לא נגע; עובר AC#2 |
| **פריט 4 = באנר inline + שמירה בטוחה** — InlineBanner בתוך `TestSendDialog` (כבר מיובא `TSD:8`) עם `[שמור מיפוי]`→`saveMapping` (בלי attach); הבדיקה ממשיכה מיד | עידן האציל → צ'אט הכריע | הכי פשוט+הכי טוב UX; ה-save בטוח בזכות פיצול פריט 2 → אין אזהרה מפחידה; מונע עייפות-אישורים מול פריט 3 |

---

## שאלות פתוחות לעידן

| # | שאלה | חוסם את | נענה? |
|---|---|---|---|
| 1 | 5 הפריטים = הרשימה המלאה? | סשן א' | ✅ כן |
| 2 | מבחין ערוץ — א/ב/ג? | סשן ב' | ✅ (א) |
| 3 | שני טאבים אותו פריט תפריט? | סשן ב' | ✅ כן |
| **4** | **פריט 2 — מנגנון** | בנייה פריט 2 | ✅ **אופציה 1** — דחיית חיבור-GroupIds בלבד; הסיכום שומר מונים |
| **5** | **פריט 4 — מנגנון** | בנייה פריט 4 | ✅ עידן האציל → **באנר inline** בתוך TestSendDialog + `saveMapping` בטוח |

---

## ממצאים

*(כל ממצא עם `file:line`)*

| חומרה | ממצא | עוגן | סטטוס |
|---|---|---|---|
| גבוהה | **פריט 2** — `doSave` פוצל: `saveMapping`(`setMapping`, בטוח) + `attachGroup`(RMW `:171-212`). `openSummary`=saveMapping+fill+summary (בלי attach); החיבור ב-`SendSummaryDialog.beforeSend` לפני `sendSmart` | `SSS`, `slice`, `SSD` | ✅ נבנה (אופציה 1) — לאמת ב-build+ביקורת |
| גבוהה | **פריט 4** — באנר inline בתוך TestSendDialog + `[שמור מיפוי]`→`saveMapping` בטוח (בלי attach); הבדיקה ממשיכה מיד; אין אזהרה מפחידה | `TSD` | ✅ נבנה |
| גבוהה | **מלכודת ניתוב §4א** — פריטים 1-4 כולם ב-`SmartSendScreen.tsx` | recon-UX | ✅ הוכרע (ניתוב מחדש) |
| בינונית | פריט 3 — שני כפתורי Save: Save הועבר לסרגל, הוסר משורת `:352` | recon-UX | ✅ נבנה |
| בינונית | פריט 3 — פוקוס/Esc/RTL: Save&Exit primary+autoFocus; Discard עמום ומופרד ב-`flex:1`; Esc=ביטול (onClose) | recon-UX | ✅ נבנה |
| בינונית | פריט 3 — ניווט תפריט-צד ב-SPA לא ניתן לחסימה (אין useBlocker); הסרגל הדביק הוא המיתון | recon-UX | ✅ מתועד בהערה בקוד |
| בינונית | פריט 5 — שם: `-webkit-line-clamp:2` + min-height | recon-UX | ✅ נבנה (סוכן) |
| בינונית | פריט 5 — Switch `onlySendable` + כפתור `showMore` נפרד; `showAll` נוסח מחדש; cap אחרי הסינון | recon-UX | ✅ נבנה (סוכן) |
| נמוכה | פריט 1 = `setDirty(true)` ב-`SSS:~356` (onChange של BusinessColumnsPicker) | recon-מבנה/UX | ✅ נבנה |
| נמוכה | תפר `dataSources.list` מהזיכרון **לא חל** על 1-5 (רק SourcePicker/DataSources כותבים `state.list`; SmartSend כותב `state.current`) | recon-seams, `dataSourcesSlice:213/:225` | סגור |
| נמוכה | פריט 5 — 2 בחירות פשטות של הסוכן: (א) `expanded` חד-כיווני למאונט; (ב) בחירה שנדחפת מעבר ל-cap במצב מכווץ לא מודגשת. **לאמת בביקורת UX** | דו"ח סוכן פריט 5 | לביקורת |
| מידע | `send.unsavedWarning` כבר לא בשימוש אחרי הסרת כיתוב הכותרת — עלה i18n מת (לא באג). לשקול בביקורת | `send.unsavedWarning` | לביקורת |

---

## מה כבר נבדק — אל תחקור מחדש

| עובדה | עוגן |
|---|---|
| עותק העבודה `NewClalDesign`, HEAD `4807e1d3c`, tree נקי | git · 2026-07-23 |
| **בסיס TS של הריפו = 449 שגיאות קיימות מראש** (448×TS2786 מ-react-icons + 1×TS17001 ב-`ResponseModal.js`). `build-ssl` = exit 0 בכל זאת (CRA מתייחס אליהן כאזהרות). כל מספר מעל 449 = חדש | `scratchpad/tsc.txt` · 2026-07-23 |
| **רק `PulseemReact` נערך.** מירror ישן `...\ClalNewDesign\ReactCode\src\...` עם `DataSources.json` משלו — **להתעלם** | recon-reuse |
| נתיבי SmartSend: `src\screens\SmartSend\{SmartSendScreen,SmartSendPicker}.tsx` + `components\{CampaignPicker,TestSendDialog,SendSummaryDialog,SourcePicker,ChannelSelector,InlineBanner,SmartSendPreview}.tsx` · slices `src\redux\reducers\{smartSendSlice,dataSourcesSlice}.ts` · `src\Models\Enums\Campaign.ts` · `src\screens\DataSources\DataSources.tsx` | glob |
| **כל עוגני §3 מדויקים ב-4807e1d3c**: פריט1 `SSS:335`(setDirty)+`:343`(BusinessColumnsPicker, בלי dirty) · פריט2 `SSS:229-236` · פריט3 `:353`(save)/`:402-409`(caption+comment)/`:420`(יציאה אמיתית יחידה)/`:446`(רק אם sent)/`:152,178,218`(save נכשל=return false) · פריט4 `SSS:193,210`+`TSD:51` | recon-מבנה |
| `dirty`: מוגדר `SSS:86`, TRUE רק `:335`, FALSE `:117`+`:224`, נקרא רק `:405`. לא ב-canSend(`:241`), לא ביציאה `:420`, לא ב-test `:359` | recon-מבנה |
| **מנגנון doSave** (`SSS:148-227`): `setMapping`(`:150`)→SyntheticGroupID (get-or-create, לא מחבר). ואז read-modify-write של send-settings (`:171-212`) שדוחף gid ל-`GroupIds` — **החיבור=הסכנה** ב-`:210-212`. MERGE בלבד, אף פעם לא מסיר (`:190-193`). save נכשל→`return false` בלי לנקות dirty | recon-מבנה + קריאה ישירה |
| `fillAndSummarize` (`slice:100-109`) POST, דורש מיפוי שמור; מזין `newsletterSendSummary` שה-SSD קורא (`SSD:47,110-118`). `sendSmart` (`slice:111-121`) PUT בלי GroupIds. `getSendSummaryWrapped`/`getEmailSendSettingsWrapped` מהדרים state (`slice:146-166`) | קריאה ישירה |
| פריט4: `TestSendDialog` **כבר לא** שומר ולא נוגע ב-GroupIds (`TSD:36` GroupIds:''); התיקון רק מוסיף הצעת-שמירה כשיש dirty | recon-מבנה |
| **תפרים בטוחים**: `CampaignPicker` רק ב-`SmartSendPicker:13/:102` (לא ב-SSS) → פריט5 מבודד · thunks של 2/4 ללא צרכן חיצוני (`doSave` מקומי `SSS:148`) · items1-5 לא כותבים `dataSources.list` · `getNewslatterParentChildData` משותף עם NewsletterManagment אבל item5 render-only | recon-seams |
| **beforeunload קיים**: `LegacyPageFrame.tsx:17-27` (דפוס אמיתי, `returnValue=''` — להעתיק) · `ClientSearchResult.js:211` (no-op). פריט3: add/remove ב-unmount, לא לערום | recon-seams |
| **i18n**: `he` = `src/assets/translations/he/DataSources.he.json` (סיומת `.he.json`!); `en/pl` = `{en,pl}/DataSources.json`. עצי `send.*` **זהים key-for-key** בשלושתם | recon-reuse |
| **שימוש-חוזר**: דיאלוג=להעתיק שלד `{head,body,foot}` (`TestSendDialog:16-18`, אין `@material-ui/lab`) · רשת=`SourcePicker:29-31` (`flexWrap`+`width:264`, **לא** ChannelSelector `minWidth:150`) · a11y radiogroup+roving קיים ב-3 (SourcePicker/CampaignPicker/ChannelSelector — לא לכתוב רביעי) · חצי-רשת=`SourcePicker:180-181`, למחוק `aria-orientation` `CampaignPicker:368` · סטטוסים=`STATUS_KEY` `CampaignPicker:40-48` (7, enum `Campaign.ts:11-20`) · שמירה=`setMapping` (thunk TS `slice:78`, **בלי** jsThunk) · `jsThunk` (`slice:144`) רק ל-thunks של JS-slice | recon-reuse |
| **סרגל דביק**: אין קיים (`position:sticky/fixed`=0 ב-SmartSend). InlineBanner=flow (marginBottom). חדש מוצדק — `Box position:sticky bottom:0` בצבעי InlineBanner (`InlineBanner:10-14`) | recon-reuse |
| עוגני פריט5: `flexDirection:'column'` `CampaignPicker:81`, `maxHeight:420` `:84`, `onlySendable` default true `:127`, card content `:280-299`, filter button `:375-380` | recon-reuse |

### הצעת מפתחות i18n מ-recon (טיוטה ל-§4.2 — לגמור אחרי תשובות עידן)

**קיימים לשימוש חוזר:** `send.close`, `send.cancel`, `send.actions.saveMapping`, `send.actions.testSend`, `send.unsavedWarning`, `send.testSendWarn`, `send.errors.retryAction`, `DataSources.retry`.
**חדשים לפריט 3 (en|he|pl):** `send.saveBar.unsaved` · `send.exit.title` · `send.exit.body` · `send.exit.saveAndExit`="שמור וצא" · `send.exit.exitWithoutSaving`="צא בלי לשמור" · `send.exit.saveFailed`="השמירה נכשלה — נשארת במסך.". (Cancel→`send.cancel`; beforeunload native — אין key.)
**חדשים לפריט 4 (אם באנר inline):** `send.testSavePrompt.body` + `send.actions.saveMapping` קיים; (אם דיאלוג) גם `.title/.saveAndTest/.testWithoutSaving`. נוסח סופי ב-§4.2 לפי תשובה #5.

---

## סבבי ביקורת

| סבב | מבקרים | ממצאים | סטטוס |
|---|---|---|---|
| 1 | אדוורסרי · רדיוס-פגיעה · UX (צוות טרי, כל 3 חזרו) | 2 MED שלי (תוקנו) · 1 MED/opinion+1 LOW לסוכן פריט5 (תוקנו) · 1 MED-עיצוב לעידן (מתועד) | ✅ נסגר |
| 2 | inline (סוכנים נכשלו על session limit; 2 מתוכם הספיקו לאשש חלקית) | 0 חוסמים: `build-ssl` exit 0 · tsc 449 בסיס · capped rework אומת שורה-שורה · ניגודיות 5.58:1 · `unsavedWarning` 0 refs · אין אזהרת ESLint חדשה בקבצים שלי (Redirect dep=קיים מראש) | ✅ **התכנס** |
| 3 | **ייעודי לבקשת עידן** (3 סוכנים, על הדיף של `be2f548a8`): (1) impact/בידוד · (2) משטחים משותפים+i18n · (3) התאמה+נכונות | (1)✅ **מבודד** — בדיוק 7 קבצים, אפס נגיעה ב-redux/route/משותף; props אופציונליים; `unsavedWarning` 0 refs. (2)✅ **לא משפיע על מסכים אחרים** — i18n parity 137×3, `smartSendSlice` לא בדיף, `NewsletterManagment` לא מושפע, אין leak CSS. (3)✅ **תואם+נכון** — MUI v4/דפוסים/a11y=MATCH; 5 הפריטים נכונים; אפס רגרסיה מסבב 1 | ✅ **GO פה אחד** |
| 3+ | תיקון נִיט קוסמטי מסבב 3 (הערת הסרגל) | הבהרה שהטקסט `#8a5a00` הוכהה בכוונה ל-AA (לא צבע InlineBanner) | ✅ `commit de0ffc010` + push |

### סבב 1 — ממצאים ותיקונים
**רדיוס-פגיעה: הכל SAFE**, אפס רגרסיות. props אופציונליים, רק צרכני-פיצ'ר, i18n parity אומת שורה-שורה. יתום יחיד `unsavedWarning` (הוסר).
**אדוורסרי: אין BLOCKER/HIGH, אין פגם type/build.** כל התיקונים אומתו נכונים שורה-שורה (פריט1 `SSS:384`, 2b-f, 3a-d, 4a-d, 5, types).
**UX: פונקציונלי ונוח ברובו.** תיקונים:
- ✅ **MED paddingBottom** (`SSS`): נוסף `paddingBottom:88` ל-Box התוכן (חוזה §3).
- ✅ **MED ניגודיות**: טקסט הסרגל `#b7791f`→`#8a5a00` (≥ AA).
- ✅ **LOW** באנר פריט4: `testSavePrompt.body` קוצר (i18n ×3, parity=137).
- ✅ **cleanup**: `unsavedWarning` הוסר מ-en/he/pl (עלה מת מהסרת הכיתוב).
- ✅ **תועד** — פריט2 edge בהערת קוד ב-`openSummary` (KNOWN EDGE).
- ⏳ **סוכן פריט5** (נשלח): MED/opinion להבדיל 2 כפתורי החשיפה; LOW a11y auto-expand כשאין בָּחיר בתוך ה-cap.
- 🔺 **לעידן (לא חוסם)**: פריט2 — קמפיין שכבר-מחובר (משליחה שה-pipeline שלה נכשל; **אין detach**, §6) → פתיחת הסיכום ממלאת מחדש קבוצה דרוכה. בדיוק ההתלבטות של שאלה #4 (עידן בחר אופציה 1; הסיכום צריך fill למונים). **לא גרוע מהקוד הישן.** הקשחה אמיתית דורשת detach-endpoint. LOWs שהושארו: סדר כפתורי דיאלוג; `saveFailed` טקסט אדום; toast חופף. 2 בחירות הפשטות של סוכן פריט5 = **מקובלות** (אושר UX).

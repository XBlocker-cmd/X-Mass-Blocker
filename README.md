# X Mass Blocker

A Chrome extension for bulk-blocking (and bulk-unblocking) accounts on X / Twitter, with a searchable dashboard, safety checks, and bilingual (English/Persian) support.

**Choose your language / زبان خود را انتخاب کنید:**
[**English**](#english) | [**فارسی**](#فارسی)

---

<a name="english"></a>
## English

### What is this?

X Mass Blocker lets you block (or unblock) many X/Twitter accounts at once, instead of doing it one by one from each profile page. You paste a list of usernames or numeric X IDs, and the extension works through the list in the background while you keep browsing.

It has two ways to open it, and a full dashboard with several tabs.

### Two ways to open the extension

**1. Toolbar icon → quick popup**
Click the extension's icon in the browser toolbar (top-right of Chrome). A small popup box opens right there — a fast way to paste a list and hit start without leaving your page.

**2. Icon on the X page → full dashboard tab**
While browsing x.com or twitter.com, a small round icon appears floating on the right edge of the page. Clicking it opens the full dashboard in a **new tab**, with every feature (Preview, Bulk Unblock, ID Finder, Blocked Accounts list, Settings).

Use the popup for quick, simple jobs. Use the full dashboard tab when you want the extra tools below.

### Dashboard tabs

- **Mass Block** — paste a list (one username or X ID per line), choose whether the list is usernames or numeric X IDs, set a delay between each block, and hit start. A **Preview** button lets you see counts (already blocked / known contacts / will actually be blocked) before anything happens.
- **Bulk Unblock** — the same idea in reverse: paste a list and unblock everyone on it in one go, without needing to fetch your whole blocked list first.
- **ID Finder** — type a username, get back its numeric X ID (with a one-click copy button).
- **Blocked Accounts** — fetches your full list of currently blocked accounts (name, username, numeric ID, bio), with live search, sortable columns, checkbox selection, bulk unblock straight from the table, and CSV export.
- **Settings** — light/dark theme, what to do if a job is interrupted by a page refresh (ask / resume automatically / never resume), a warning before blocking someone you follow or who follows you, desktop notification when a job finishes, and a whitelist of accounts that should never be blocked.

### Safety features

- **Preview before starting** — see how many entries are valid, already blocked, or known contacts, with nothing actually blocked yet.
- **Follow-relationship warning** — before blocking, the extension checks if any account on your list follows you or is followed by you, and asks you to confirm (per-account) before blocking them.
- **Whitelist** — accounts you add here are silently skipped, no matter what list you paste.
- **Resume after refresh** — if you refresh the X tab mid-operation, the extension picks up where it left off (or asks you first, depending on your Settings).
- **Final report** — a summary panel on the X page shows totals: blocked, skipped, whitelisted, failed.

### Installation (unpacked / developer mode)

1. Download and unzip this extension.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the unzipped folder.
5. Pin the extension icon to your toolbar for quick access.

### Permissions used

- `storage` — to save your lists, settings, and language/theme choice locally.
- `scripting` / `activeTab` / `tabs` — to run the block/unblock/search logic on the active X tab.
- `notifications` — to show a desktop notification when a job finishes (optional, toggle in Settings).
- Host permissions for `x.com` and `twitter.com` only — the extension does not run on any other site.

### Important notes

- This extension calls X's own internal web APIs (the same ones your browser uses when you use X normally) using your existing logged-in session. It does not use any official, documented X API and does not require an API key.
- These internal endpoints are undocumented and can change or be rate-limited by X at any time without notice. If something stops working, it's usually because X changed something on their end.
- Use reasonable delays between actions and reasonable list sizes to avoid tripping X's own rate limits.
- This is provided as-is, for personal use. You are responsible for complying with X's Terms of Service.

### License

MIT — do whatever you want with it, no warranty.

---

<a name="فارسی"></a>
## فارسی

### این افزونه چیه؟

X Mass Blocker یه افزونه‌ی مرورگره که به‌جای اینکه بری تک‌تک پروفایل هرکسی و بلاکش کنی، می‌تونی یه لیست از یوزرنیم‌ها یا آیدی‌های عددی (X ID) رو یه‌جا بهش بدی و افزونه خودش تو پس‌زمینه، یکی‌یکی همه رو بلاک (یا آنبلاک) می‌کنه، درحالی‌که خودت داری عادی از توییتر استفاده می‌کنی.

دو تا راه برای باز کردنش هست، و یه داشبورد کامل با چندتا تب مختلف.

### دو راه برای باز کردن افزونه

**۱. آیکون نوار ابزار مرورگر ← باکس کوچیک (پاپ‌آپ)**
روی آیکون افزونه در نوار ابزار بالای مرورگر کلیک کن. یه باکس کوچیک همون‌جا باز میشه - برای کارهای سریع و ساده که فقط می‌خوای یه لیست بدی و بزنی شروع، بدون اینکه از صفحه‌ای که توشی خارج بشی.

**۲. آیکون داخل صفحه توییتر ← تب کامل داشبورد**
وقتی تو x.com یا twitter.com هستی، یه آیکون گرد کوچیک شناور سمت راست صفحه می‌بینی. با کلیک روش، داشبورد کامل تو یه **تب جدید** باز میشه، با همه‌ی امکانات (پیش‌نمایش، آنبلاک دسته‌جمعی، دریافت آیدی، لیست بلاک‌شده‌ها، تنظیمات).

برای کارهای سریع و ساده از پاپ‌آپ استفاده کن؛ وقتی به ابزارهای بیشتر نیاز داری، از تب کامل داشبورد استفاده کن.

### تب‌های داشبورد

- **بلاک دسته‌جمعی** — یه لیست بده (هر یوزرنیم یا X ID تو یه خط جدا)، مشخص کن لیست بر اساس یوزرنیمه یا آیدی عددی، تاخیر بین هر بلاک رو تنظیم کن، و بزن شروع. دکمه‌ی **پیش‌نمایش** بهت نشون میده قبل از هر کاری، چندتا از قبل بلاک هستن، چندتا آشنا هستن، و چندتا واقعاً بلاک خواهند شد.
- **آنبلاک دسته‌جمعی** — همون منطق برعکس: یه لیست بده و همه رو یه‌جا آنبلاک کن، بدون اینکه لازم باشه اول کل لیست بلاک‌هات رو بگیری.
- **دریافت آیدی از یوزرنیم** — یه یوزرنیم بده، آیدی عددی X ID اون رو بگیر (با دکمه‌ی کپی سریع).
- **لیست بلاک‌شده‌ها** — کل لیست اکانت‌هایی که الان بلاک کردی رو می‌گیره (نام، یوزرنیم، آیدی عددی، بیو)، با جستجوی زنده، مرتب‌سازی ستون‌ها، انتخاب با چک‌باکس، آنبلاک گروهی مستقیم از همون جدول، و خروجی CSV.
- **تنظیمات** — تم روشن/تیره، رفتار عملیات وقتی صفحه رفرش میشه (بپرس / خودکار ادامه بده / هیچ‌وقت ادامه نده)، هشدار قبل از بلاک کسی که دنبالش می‌کنی یا دنبالت می‌کنه، اعلان دسکتاپ بعد از پایان کار، و لیست استثنا (اکانت‌هایی که هیچ‌وقت نباید بلاک بشن).

### ویژگی‌های ایمنی

- **پیش‌نمایش قبل از شروع** — ببین چندتا از ورودی‌ها معتبرن، چندتا از قبل بلاک هستن، چندتا آشنا هستن - بدون اینکه واقعاً چیزی بلاک بشه.
- **هشدار آشنایان** — قبل از بلاک کردن، افزونه چک می‌کنه آیا کسی از لیستت دنبال‌کننده یا دنبال‌شونده‌ی خودته، و قبل از بلاک هرکدوم، ازت تایید می‌گیره.
- **لیست استثنا** — هر اکانتی که اینجا اضافه کنی، بی‌صدا از هر لیستی که بدی رد میشه و بلاک نمیشه.
- **ازسرگیری بعد از رفرش** — اگه وسط عملیات، تب توییتر رو رفرش کنی، افزونه از همون‌جا که مونده بود ادامه میده (یا بسته به تنظیماتت، اول ازت می‌پرسه).
- **گزارش نهایی** — یه پنل خلاصه رو صفحه توییتر نشونت میده: چندتا بلاک شد، چندتا رد شد، چندتا تو لیست استثنا بود، چندتا ناموفق بود.

### نصب (حالت unpacked / توسعه‌دهنده)

۱. این افزونه رو دانلود و از حالت zip خارج کن.
۲. تو کروم برو به آدرس `chrome://extensions`.
۳. گزینه‌ی **Developer mode** رو (بالا سمت راست) روشن کن.
۴. روی **Load unpacked** بزن و پوشه‌ی از حالت zip خارج‌شده رو انتخاب کن.
۵. آیکون افزونه رو به نوار ابزار پین کن تا دسترسی سریع‌تری داشته باشی.

### دسترسی‌هایی که استفاده میشه

- `storage` — برای ذخیره‌ی لیست‌ها، تنظیمات، و انتخاب زبان/تم به‌صورت محلی.
- `scripting` / `activeTab` / `tabs` — برای اجرای منطق بلاک/آنبلاک/جستجو روی تب فعال توییتر.
- `notifications` — برای نمایش اعلان دسکتاپ بعد از پایان عملیات (اختیاریه، از تنظیمات قابل خاموش کردنه).
- دسترسی فقط به `x.com` و `twitter.com` - افزونه روی هیچ سایت دیگه‌ای اجرا نمیشه.

### نکات مهم

- این افزونه از همون API های داخلی خود توییتر استفاده می‌کنه (دقیقاً همونایی که مرورگرت موقع استفاده‌ی عادی از توییتر استفاده می‌کنه)، با همون نشست لاگین‌شده‌ی فعلیت. از هیچ API رسمی و مستندی استفاده نمی‌کنه و نیازی به کلید API نداره.
- این endpoint های داخلی مستند نیستن و ممکنه هر لحظه بدون اطلاع قبلی توسط توییتر تغییر کنن یا محدود (rate limit) بشن. اگه یهو چیزی کار نکرد، معمولاً به این خاطره که توییتر یه چیزی رو تغییر داده.
- برای جلوگیری از برخورد به محدودیت‌های خود توییتر، از تاخیر و سایز لیست معقول استفاده کن.
- این افزونه همین‌طوری که هست ارائه میشه، برای استفاده‌ی شخصی. مسئولیت رعایت قوانین و مقررات (Terms of Service) توییتر با خودته.

### مجوز (License)

MIT — هر کاری باهاش می‌خوای بکن، بدون هیچ ضمانتی.

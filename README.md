🛠️ Twitter/X Mass Blocker — Advanced Browser Extension
An open-source, modern, and powerful browser extension designed for Chromium-based browsers (Chrome, Edge, Brave, Mises, etc.). It allows users to fully automate and locally manage privacy workflows, including mass blocking and User ID extraction on the Twitter (X.com) platform.
By utilizing direct script injection into your active browser session, this tool securely interfaces with X's internal APIs using your existing authentication tokens (`X-Csrf-Token`). It operates entirely without the need for an official, expensive Twitter Developer API, and includes smart rate-limit handling mechanisms.
---
✨ Key Features
Smart Mass Blocking: Effortlessly block thousands of accounts using a custom list of either User IDs or Usernames.
Targeted ID Finder: Extract the complete User IDs and profile data of followers, followings, likers, or retweeters of any specific user or tweet with a single click.
Blocked List Manager: Fetch your entire live blocklist directly from X's servers. View profiles (Name, Username, Bio, ID) and selectively mass-unblock accounts.
BOM-Optimized CSV Export: Download data in an Excel-friendly `CSV` format embedded with a Byte Order Mark (BOM), ensuring Persian, Arabic, and special characters render flawlessly.
Intelligent Delay Adjustments (Anti-Spam): Implements dynamic and randomized safety delays between requests to mimic human behavior and mitigate the risk of account suspensions.
Full Bi-lingual Support: Natively supports English (LTR) and Persian (RTL) layouts with seamless real-time language switching inside the dashboard.
---
📂 Project File Structure
The project conforms to the modern Manifest V3 standard and consists of 5 core files:
`manifest.json`: The extension's registry, declaring essential security permissions (`scripting`, `tabs`, `storage`) and configurations.
`background.js`: Acts as the Service Worker, handling messaging bridges between UI components and securely executing injected scripts into active X tabs.
`popup.html` & `popup.js`: The mini extension launcher widget providing quick access to open the main Advanced Dashboard.
`dashboard.html`: The structural markup defining the advanced multi-tab desktop UI workspace.
`dashboard.js`: The core engine of the extension controlling Pagination, dynamic Fetch requests, localization translations, and DOM manipulation.
---
🚀 Installation & Setup Guide (Developer Mode)
Since this is a custom internal privacy utility, it can be loaded manually into your browser:
1. Prepare Folder
Save all 5 extension files into a dedicated local directory on your machine (e.g., name it `Twitter-Mass-Blocker`).
2. Enable Developer Mode
Open your Chromium browser (Chrome / Edge / Brave / Mises).
Navigate to `chrome://extensions`.
Toggle on the Developer mode switch in the top-right corner.
3. Load the Extension
Click the Load unpacked button.
Select the local folder containing your project files.
The extension is now installed and will appear in your extension toolbar!
---
🛠️ Module Walkthrough
1. Mass Block Tab
Data Entry: Input a clean list of User IDs or Usernames (one per line).
Delay Parameters: Adjust execution intervals (recommended: 1–3 seconds minimum) to guarantee account compliance.
Operation: Hit start. The extension automatically syncs with your active session's security tokens and updates execution state row-by-row in a live tabular view.
2. ID Finder Tab
Action Type: Choose the data target (Followers, Following, Likers, or Retweeters).
Target Handle/URL: Provide the target screen name (without @) or the exact Tweet link.
Extraction: The engine fetches users recursively page-by-page. The resulting block text can be instantly copied over into the Mass Block panel.
3. Blocked List Tab
Click load to fetch all accounts currently restricted by your profile.
Easily review usernames and bios. Selectively check users to execute batch unblocks or download the data via Export to CSV.
---
🔒 Security & Privacy Notice
100% Client-Side: The extension runs entirely inside your local sandbox. Absolutely zero credentials, session cookies, tokens, or analytical data leave your machine or upload to third-party endpoints.
Session Reliability: The tool never asks for your password. It relies completely on your active authenticated browser tab at `x.com`. Consequently, you must remain logged into X in an open browser tab for operations to process.
⚖️ Disclaimer
This utility is developed purely for educational and private data management purposes. Excessively aggressive actions within concise intervals may trigger automated rate limits or protective locks on your X account. The end-user assumes full responsibility for configuring appropriate safety delays.

=========================================================================
🛠️ توییتر ماس بلاکر (Twitter/X Mass Blocker) — افزونه پیشرفته مرورگر
یک افزونه (Extension) منبع‌باز، مدرن و قدرتمند برای مرورگرهای مبتنی بر کرومیوم (Chrome, Edge, Brave, Mises و غیره) که به کاربران اجازه می‌دهد فرآیند مدیریت حریم خصوصی، بلاک کردن دسته‌جمعی (Mass Blocking) و استخراج شناسه کاربری (User ID) را در پلتفرم توییتر (X.com) به صورت کاملاً خودکار و بومی مدیریت کنند.
این ابزار با بهره‌گیری از تزریق مستقیم اسکریپت (Script Injection) به کوکی‌ها و توکن‌های نشست امنیتی مرورگر شما بدون نیاز به API رسمی و پولی توییتر متصل می‌شود و عملیات‌های انبوه را با سرعت بالا و نرخ دور زدن محدودیت (Rate-Limit Handling) انجام می‌دهد.
---
✨ ویژگی‌های کلیدی افزونه
بلاک دسته‌جمعی هوشمند (Mass Blocking): امکان بلاک کردن هزاران اکانت با استفاده از لیست شناسه‌های کاربری (User IDs) یا نام‌های کاربری (Usernames).
استخراج‌کننده شناسه‌ها (ID Finder): استخراج آیدی و اطلاعات کامل فالوورها، فالوینگ‌ها، لایک‌کنندگان یا ریتوییت‌کنندگان یک توییت خاص تنها با یک کلیک.
مدیریت و خروجی گرفتن از بلاک‌لیست (Blocked List Manager): دریافت کامل لیست افرادی که بلاک کرده‌اید و خروجی گرفتن از آن‌ها در قالب فایل استاندارد `CSV` به همراه ویژگی BOM جهت خوانایی کامل متون فارسی و عربی در نرم‌افزار اکسل.
آنبلاک دسته‌جمعی (Mass Unblocking): قابلیت انتخاب چندگانه یا کلی کاربران از روی جدول و آنبلاک کردن همزمان آن‌ها.
سیستم تعلیق خودکار و هوشمند (Smart Delays): اعمال تاخیرهای پویا و تصادفی برای شبیه‌سازی رفتار انسان و جلوگیری از مسدودیت اکانت توسط الگوریتم‌های ضد اسپم توییتر.
پشتیبانی کامل از دو زبان (Full Bi-lingual Support): پشتیبانی کامل و بومی از زبان‌های فارسی (RTL) و انگلیسی (LTR) با قابلیت سوییچ آنی در داشبورد.
---
📂 ساختار فایل‌های پروژه
پروژه از ۵ فایل اصلی تشکیل شده است که هماهنگی کاملی با استانداردهای Manifest V3 مرورگرها دارند:
`manifest.json`: شناسنامه افزونه، تعریف دسترسی‌های امنیتی لازم (`scripting`, `tabs`, `storage`) و مانیفست نسخه ۳.
`background.js`: به عنوان Service Worker عمل کرده و پیام‌ها را بین منو و تب‌های فعال توییتر هماهنگ و اسکریپت‌ها را در سطح صفحه تزریق می‌کند.
`popup.html` & `popup.js`: منوی کوچک و پاپ‌آپ افزونه که به عنوان لانچر عمل کرده و دکمه باز کردن «داشبورد پیشرفته» را در خود جای داده است.
`dashboard.html`: ساختار رابط کاربری اصلی داشبورد شامل تب‌های تفکیک‌شده (بلاک دسته‌جمعی، استخراج آیدی، مدیریت لیست بلاک، تنظیمات).
`dashboard.js`: مغز متفکر افزونه؛ شامل تمام رفتارهای منطقی، فرآیندهای بازگشتی (Pagination)، درخواست‌های Fetch بومی به API توییتر، ساختار ترجمه و کنترل المان‌های DOM.
---
🚀 راهنمای نصب و راه‌اندازی (Developer Mode)
از آنجا که این افزونه به صورت اختصاصی و برای کنترل کامل کاربر توسعه یافته است، می‌توانید آن را به صورت دستی روی مرورگر خود بارگذاری کنید:
۱. دانلود و آماده‌سازی فایل‌ها
تمام ۵ فایل ذکر شده را در یک پوشه مشخص (به عنوان مثال نام پوشه را `Twitter-Mass-Blocker` بگذارید) در کامپیوتر یا موبایل خود (مرورگرهایی مثل Mises یا Kiwi) ذخیره کنید.
۲. فعال‌سازی حالت توسعه‌دهنده در مرورگر
مرورگر خود (Chrome / Edge / Brave) را باز کنید.
به آدرس `chrome://extensions` بروید.
در بال سمت راست صفحه، گزینه Developer mode را فعال کنید.
۳. بارگذاری افزونه
روی دکمه Load unpacked کلیک کنید.
پوشه‌ای که فایل‌ها را در آن ذخیره کرده‌اید انتخاب کنید.
افزونه با موفقیت بارگذاری شده و آیکون آن در منوی افزونه‌های شما ظاهر می‌شود.
---
🛠️ راهنمای جامع استفاده از بخش‌های مختلف
۱. تب بلاک دسته‌جمعی (Mass Block)
ورودی داده‌ها: در این بخش می‌توانید جفت آیدی‌ها یا نام‌های کاربری را (هر کدام در یک خط) وارد کنید.
تنظیم تاخیر (Delay): برای امنیت اکانت خود، مقدار تاخیر بین هر بلاک را مشخص کنید (توصیه می‌شود حداقل ۱ الی ۳ ثانیه باشد).
شروع عملیات: با کلیک روی دکمه شروع، افزونه به صورت خودکار توکن `X-Csrf-Token` را از تب فعال توییتر شما برداشته و فرآیند بلاک را در پس‌زمینه آغاز می‌کند. وضعیت هر اکانت (موفق/ناموفق) در جدول زیرین به صورت زنده نمایش داده می‌شود.
۲. تب آیدی یاب (ID Finder)
نوع اکشن: مشخص کنید که تمایل دارید چه لیستی را استخراج کنید (فالوورها، فالوینگ‌ها، لایک‌ها یا ریتوییت‌ها).
شناسه/لینک: نام کاربری هدف (بدون @) یا لینک مستقیم توییت مورد نظر را وارد کنید.
استخراج: سیستم به صورت فرآیند صفحه‌به‌صفحه (Cursor-based) تمام آیدی‌ها را استخراج کرده و در قالب متن به شما تحویل می‌دهد تا بتوانید مستقیماً آن‌ها را در تب بلاک دسته‌جمعی کپی کنید.
۳. تب مدیریت لیست بلاک‌شده‌ها (Blocked List)
با کلیک بر روی دکمه بارگذاری، افزونه کل لیست افرادی که تا به حال بلاک کرده‌اید را از سرور توییتر فراخوانی می‌کند.
شما می‌توانید کاربران را بر اساس نام، آیدی و بیوگرافی مشاهده کنید.
امکان انتخاب چند کاربر و آنبلاک کردن دسته‌جمعی آن‌ها وجود دارد.
با دکمه خروجی CSV، یک فایل گزارش کامل از تمام مسدودشدگان دریافت خواهید کرد.
---
🔒 امنیت و حریم خصوصی
بدون سرور واسط: این افزونه به صورت ۱۰۰٪ محلی (Local) روی مرورگر شما اجرا می‌شود. هیچ داده, توکن، کوکی یا اطلاعات شخصی به هیچ سرور خارجی ارسال نمی‌شود.
استفاده از نشست‌های معتبر: افزونه نیازی به رمز عبور شما ندارد؛ بلکه از نشست فعال شما در تب باز `x.com` استفاده می‌کند. بنابراین، برای کارکرد درست افزونه، حتماً باید یک لبه (Tab) باز و لاگین‌شده از توییتر در مرورگرتان موجود باشد.
⚖️ سلب مسئولیت
این ابزار صرفاً برای اهداف آموزشی و تسهیل حریم خصوصی کاربران توسعه یافته است. استفاده نامتعارف و بلاک کردن تعداد بسیار زیادی کاربر در بازه زمانی کوتاه ممکن است باعث حساسیت الگوریتم‌های توییتر روی اکانت شما شود. مسئولیت مدیریت زمان‌بندی‌ها و حجم استفاده بر عهده کاربر است.

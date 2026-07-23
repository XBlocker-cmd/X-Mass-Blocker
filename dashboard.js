let searchTimeout = null;
let searchRequestId = 0; // برای جلوگیری از بازنویسی نتایج توسط پاسخ‌های قدیمی
let lastIdFinderResult = null; // آخرین نتیجه‌ی «دریافت آیدی» - برای رندر مجدد هنگام تغییر زبان
let lastBlockedListData = null; // آخرین لیست دریافت‌شده‌ی اکانت‌های بلاک‌شده - برای رندر مجدد هنگام تغییر زبان و خروجی CSV

const translations = {
  fa: {
    pageTitle: "داشبورد پیشرفته بلاکر توییتر",
    dashboardTitle: "داشبورد بلاک دسته‌جمعی توییتر",
    searchLabel: "جستجو و تیک زدن اکانت‌ها (نمایش تا ۲۰ نتیجه همزمان)",
    searchPlaceholder: "نام یا یوزرنیم مورد نظر را برای جستجو تایپ کنید...",
    listLabel: "لیست نهایی یوزرنیم‌ها برای بلاک",
    listPlaceholder: "هر آیدی یا یوزرنیم در یک خط جدید...",
    importLabel: "ایمپورت فایل آیدی‌ها (TXT)",
    chooseFile: "انتخاب فایل متنی لیست...",
    delayLabel: "میزان تاخیر بین هر بلاک (ثانیه)",
    startBtn: "شروع عملیات بلاک دسته‌جمعی",
    searching: "در حال جستجوی زنده در توییتر...",
    errNoTab: "❌ خطا: تب باز توییتر (X) یافت نشد! لطفاً یک تب مرورگر را روی توییتر باز نگه دارید.",
    errNoCsrf: "❌ خطا: توکن امنیتی (CSRF) یافت نشد. مطمئن شوید در حساب توییتر خود لاگین هستید.",
    errFetchFailed: (status) => `❌ خطا در برقراری ارتباط (کد: ${status}). لطفاً تب توییتر را رفرش کنید.`,
    errFetchError: "⚠️ مشکلی در دریافت اطلاعات پیش آمد. لطفاً تب توییتر را یک‌بار F5 کنید.",
    noUsersFound: "کاربری با این مشخصات یافت نشد.",
    addSelectedBtn: "افزودن تیک‌خورده‌ها به لیست اصلی بلاک",
    alertNoCheckbox: "لطفاً ابتدا حداقل یک کاربر را تیک بزنید.",
    alertEmptyList: "لطفاً ابتدا لیست خود را وارد یا ایمپورت کنید.",
    alertNoTabOnStart: "خطا: تب باز توییتر (X) یافت نشد.",
    tabBlock: "بلاک دسته‌جمعی",
    tabIdFinder: "دریافت آیدی از یوزرنیم",
    idFinderLabel: "یوزرنیم را وارد کنید تا آیدی عددی (X ID) آن را دریافت کنید",
    idFinderPlaceholder: "مثال: elonmusk",
    idFinderBtn: "دریافت آیدی",
    idFinderSearching: "در حال دریافت اطلاعات...",
    idFinderEmpty: "لطفاً یک یوزرنیم وارد کنید.",
    idFinderNotFound: "❌ کاربری با این یوزرنیم یافت نشد.",
    idFinderName: "نام",
    idFinderUsername: "یوزرنیم",
    idFinderId: "آیدی عددی (X ID)",
    copyBtn: "کپی",
    copiedBtn: "کپی شد ✓",
    idFinderAlreadyBlocked: "⚠️ توجه: این اکانت هم‌اکنون توسط شما بلاک شده است.",
    blockModeLabel: "نوع داده ورودی",
    blockModeUsername: "بر اساس یوزرنیم",
    blockModeXid: "بر اساس X ID (آیدی عددی)",
    listPlaceholderUsername: "هر یوزرنیم در یک خط جدید (بدون @)...",
    listPlaceholderXid: "هر X ID عددی در یک خط جدید...",
    clearDataBtn: "پاک کردن داده‌ها",
    confirmClearList: "آیا مطمئن هستید؟ لیست و تنظیمات وارد شده پاک خواهد شد.",
    confirmClearIdFinder: "آیا مطمئن هستید؟ نتیجه جستجوی آیدی پاک خواهد شد.",
    alertInvalidXidLines: "⚠️ در حالت «X ID»، فقط خطوطی که آیدی عددی معتبر هستند در نظر گرفته می‌شوند. خطوط نامعتبر نادیده گرفته شدند.",
    tabBlockedList: "لیست بلاک‌شده‌ها",
    blockedListLabel: "لیست کامل اکانت‌هایی که تا الان بلاک کرده‌اید",
    fetchBlockedListBtn: "دریافت لیست بلاک‌شده‌ها",
    exportCsvBtn: "دانلود به‌صورت CSV",
    blockedListBio: "بیو",
    blockedListNoBio: "—",
    blockedListFetching: (n) => `در حال دریافت... تا الان ${n} اکانت پیدا شد`,
    blockedListDone: (n) => `دریافت کامل شد. مجموع اکانت‌های بلاک‌شده: ${n}`,
    blockedListEmpty: "شما تاکنون هیچ اکانتی را بلاک نکرده‌اید.",
    confirmClearBlockedList: "آیا مطمئن هستید؟ لیست دریافت‌شده پاک خواهد شد.",
    tabSettings: "تنظیمات",
    settingsAppearance: "ظاهر",
    settingsTheme: "تم برنامه",
    settingsThemeLight: "روشن",
    settingsThemeDark: "تیره",
    settingsResumeHeading: "ازسرگیری بعد از رفرش صفحه",
    settingsResumeLabel: "وقتی عملیات نیمه‌تمام پیدا شود",
    settingsResumeAsk: "هر بار بپرس",
    settingsResumeAuto: "خودکار ادامه بده",
    settingsResumeNever: "هیچ‌وقت ادامه نده",
    settingsSafetyHeading: "ایمنی عملیات بلاک",
    settingsNotifyFollowLabel: "قبل از بلاک دنبال‌کننده‌ها/دنبال‌شونده‌ها هشدار بده",
    settingsNotifyCompleteLabel: "اعلان دسکتاپ بعد از پایان عملیات",
    settingsWhitelistHeading: "لیست استثنا (هیچ‌وقت بلاک نشوند)",
    settingsWhitelistLabel: "هر یوزرنیم یا X ID در یک خط جدید",
    settingsSaveBtn: "ذخیره تنظیمات",
    settingsSavedNote: "✓ تنظیمات ذخیره شد.",
    previewBtn: "پیش‌نمایش قبل از شروع",
    previewTotal: (n) => `تعداد کل ورودی: ${n}`,
    previewWhitelisted: (n) => `به دلیل لیست استثنا رد می‌شوند: ${n}`,
    previewAlreadyBlocked: (n) => `از قبل بلاک هستند: ${n}`,
    previewFollowFlagged: (n) => `آشنا هستند (دنبال‌کننده/دنبال‌شونده): ${n}`,
    previewWillBlock: (n) => `در مجموع بلاک خواهند شد: ${n}`,
    unblockSelectedBtn: "آنبلاک انتخاب‌شده‌ها",
    blockedListSearchPlaceholder: "جستجو بر اساس نام، یوزرنیم یا بیو...",
    confirmUnblockSelected: (n) => `آیا مطمئن هستید؟ ${n} اکانت آنبلاک خواهد شد.`,
    unblockingStatus: (done, total) => `در حال آنبلاک کردن... ${done}/${total}`,
    unblockDoneStatus: (n) => `${n} اکانت با موفقیت آنبلاک شد.`,
    blockedListNoResults: "نتیجه‌ای یافت نشد.",
    tabUnblock: "آنبلاک دسته‌جمعی",
    unblockModeLabel: "نوع داده ورودی",
    unblockListLabel: "لیست یوزرنیم‌ها/آیدی‌ها برای آنبلاک",
    unblockStartBtn: "شروع عملیات آنبلاک دسته‌جمعی",
    unblockListPlaceholderUsername: "هر یوزرنیم در یک خط جدید (بدون @)...",
    unblockListPlaceholderXid: "هر X ID عددی در یک خط جدید...",
    confirmClearUnblockList: "آیا مطمئن هستید؟ لیست و تنظیمات این تب پاک خواهد شد.",
    previewNotBlocked: (n) => `از قبل بلاک نبودند: ${n}`,
    previewWillUnblock: (n) => `در مجموع آنبلاک خواهند شد: ${n}`
  },
  en: {
    pageTitle: "Advanced Twitter Blocker Dashboard",
    dashboardTitle: "Twitter Mass Block Dashboard",
    searchLabel: "Search and select accounts (up to 20 results shown)",
    searchPlaceholder: "Type a name or username to search...",
    listLabel: "Final list of usernames to block",
    listPlaceholder: "One ID or username per line...",
    importLabel: "Import ID file (TXT)",
    chooseFile: "Choose list text file...",
    delayLabel: "Delay between each block (seconds)",
    startBtn: "Start Mass Block Operation",
    searching: "Searching live on Twitter...",
    errNoTab: "❌ Error: No open Twitter (X) tab found! Please keep a browser tab open on Twitter.",
    errNoCsrf: "❌ Error: CSRF security token not found. Make sure you're logged into your Twitter account.",
    errFetchFailed: (status) => `❌ Connection error (code: ${status}). Please refresh the Twitter tab.`,
    errFetchError: "⚠️ There was a problem fetching data. Please refresh (F5) the Twitter tab.",
    noUsersFound: "No user found matching this search.",
    addSelectedBtn: "Add selected to block list",
    alertNoCheckbox: "Please select at least one user first.",
    alertEmptyList: "Please enter or import your list first.",
    alertNoTabOnStart: "Error: No open Twitter (X) tab found.",
    tabBlock: "Mass Block",
    tabIdFinder: "Get ID from Username",
    idFinderLabel: "Enter a username to get its numeric X ID",
    idFinderPlaceholder: "e.g. elonmusk",
    idFinderBtn: "Get ID",
    idFinderSearching: "Fetching info...",
    idFinderEmpty: "Please enter a username.",
    idFinderNotFound: "❌ No user found with this username.",
    idFinderName: "Name",
    idFinderUsername: "Username",
    idFinderId: "Numeric ID (X ID)",
    copyBtn: "Copy",
    copiedBtn: "Copied ✓",
    idFinderAlreadyBlocked: "⚠️ Note: you have already blocked this account.",
    blockModeLabel: "Input data type",
    blockModeUsername: "By username",
    blockModeXid: "By X ID (numeric)",
    listPlaceholderUsername: "One username per line (without @)...",
    listPlaceholderXid: "One numeric X ID per line...",
    clearDataBtn: "Clear data",
    confirmClearList: "Are you sure? The entered list and settings will be cleared.",
    confirmClearIdFinder: "Are you sure? The ID lookup result will be cleared.",
    alertInvalidXidLines: "⚠️ In \"X ID\" mode, only lines that are valid numeric IDs are used. Invalid lines were ignored.",
    tabBlockedList: "Blocked accounts",
    blockedListLabel: "Full list of accounts you have blocked so far",
    fetchBlockedListBtn: "Fetch blocked accounts",
    exportCsvBtn: "Download as CSV",
    blockedListBio: "Bio",
    blockedListNoBio: "—",
    blockedListFetching: (n) => `Fetching... ${n} accounts found so far`,
    blockedListDone: (n) => `Done. Total blocked accounts: ${n}`,
    blockedListEmpty: "You haven't blocked any accounts yet.",
    confirmClearBlockedList: "Are you sure? The fetched list will be cleared.",
    tabSettings: "Settings",
    settingsAppearance: "Appearance",
    settingsTheme: "App theme",
    settingsThemeLight: "Light",
    settingsThemeDark: "Dark",
    settingsResumeHeading: "Resume after a page refresh",
    settingsResumeLabel: "When an unfinished job is found",
    settingsResumeAsk: "Ask every time",
    settingsResumeAuto: "Resume automatically",
    settingsResumeNever: "Never resume",
    settingsSafetyHeading: "Block operation safety",
    settingsNotifyFollowLabel: "Warn before blocking people I follow / who follow me",
    settingsNotifyCompleteLabel: "Desktop notification when operation finishes",
    settingsWhitelistHeading: "Whitelist (never block these)",
    settingsWhitelistLabel: "One username or X ID per line",
    settingsSaveBtn: "Save settings",
    settingsSavedNote: "✓ Settings saved.",
    previewBtn: "Preview before starting",
    previewTotal: (n) => `Total submitted: ${n}`,
    previewWhitelisted: (n) => `Will be skipped (whitelist): ${n}`,
    previewAlreadyBlocked: (n) => `Already blocked: ${n}`,
    previewFollowFlagged: (n) => `Known contacts (following/follower): ${n}`,
    previewWillBlock: (n) => `Total that will be blocked: ${n}`,
    unblockSelectedBtn: "Unblock selected",
    blockedListSearchPlaceholder: "Search by name, username or bio...",
    confirmUnblockSelected: (n) => `Are you sure? ${n} accounts will be unblocked.`,
    unblockingStatus: (done, total) => `Unblocking... ${done}/${total}`,
    unblockDoneStatus: (n) => `${n} accounts successfully unblocked.`,
    blockedListNoResults: "No results found.",
    tabUnblock: "Bulk unblock",
    unblockModeLabel: "Input data type",
    unblockListLabel: "List of usernames/IDs to unblock",
    unblockStartBtn: "Start bulk unblock operation",
    unblockListPlaceholderUsername: "One username per line (without @)...",
    unblockListPlaceholderXid: "One numeric X ID per line...",
    confirmClearUnblockList: "Are you sure? This tab's list and settings will be cleared.",
    previewNotBlocked: (n) => `Weren't already blocked: ${n}`,
    previewWillUnblock: (n) => `Total that will be unblocked: ${n}`
  }
};

let currentLang = 'fa';

function applyLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  document.documentElement.lang = lang === 'fa' ? 'fa' : 'en';
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.title = t.pageTitle;

  document.querySelector('[data-i18n="dashboardTitle"]').textContent = t.dashboardTitle;
  document.querySelector('[data-i18n="searchLabel"]').textContent = t.searchLabel;
  document.getElementById('searchInput').placeholder = t.searchPlaceholder;
  document.querySelector('[data-i18n="listLabel"]').textContent = t.listLabel;
  document.querySelectorAll('[data-i18n="importLabel"]').forEach(el => el.textContent = t.importLabel);
  document.querySelectorAll('[data-i18n="chooseFile"]').forEach(el => el.textContent = t.chooseFile);
  document.querySelectorAll('[data-i18n="delayLabel"]').forEach(el => el.textContent = t.delayLabel);
  document.getElementById('startBtn').textContent = t.startBtn;
  document.getElementById('langToggle').textContent = lang === 'fa' ? 'EN' : 'FA';
  document.getElementById('tabBtnBlock').textContent = t.tabBlock;
  document.getElementById('tabBtnIdFinder').textContent = t.tabIdFinder;
  document.querySelector('[data-i18n="idFinderLabel"]').textContent = t.idFinderLabel;
  document.getElementById('idFinderInput').placeholder = t.idFinderPlaceholder;
  document.getElementById('idFinderBtn').textContent = t.idFinderBtn;
  document.querySelector('[data-i18n="blockModeLabel"]').textContent = t.blockModeLabel;
  document.querySelectorAll('[data-i18n="blockModeUsername"]').forEach(el => el.textContent = t.blockModeUsername);
  document.querySelectorAll('[data-i18n="blockModeXid"]').forEach(el => el.textContent = t.blockModeXid);
  document.querySelectorAll('[data-i18n="clearDataBtn"]').forEach(el => el.textContent = t.clearDataBtn);
  document.getElementById('tabBtnUnblock').textContent = t.tabUnblock;
  document.querySelector('[data-i18n="unblockModeLabel"]').textContent = t.unblockModeLabel;
  document.querySelector('[data-i18n="unblockListLabel"]').textContent = t.unblockListLabel;
  document.getElementById('unblockStartBtn').textContent = t.unblockStartBtn;
  const unblockModeSelect = document.getElementById('unblockModeSelect');
  document.getElementById('unblockListInput').placeholder = unblockModeSelect.value === 'xid' ? t.unblockListPlaceholderXid : t.unblockListPlaceholderUsername;
  document.getElementById('tabBtnBlockedList').textContent = t.tabBlockedList;
  document.querySelector('[data-i18n="blockedListLabel"]').textContent = t.blockedListLabel;
  document.getElementById('fetchBlockedListBtn').textContent = t.fetchBlockedListBtn;
  document.getElementById('exportBlockedListBtn').textContent = t.exportCsvBtn;
  document.querySelectorAll('[data-i18n="idFinderName"]').forEach(el => el.textContent = t.idFinderName);
  document.querySelectorAll('[data-i18n="idFinderUsername"]').forEach(el => el.textContent = t.idFinderUsername);
  document.querySelectorAll('[data-i18n="idFinderId"]').forEach(el => el.textContent = t.idFinderId);
  document.querySelector('[data-i18n="blockedListBio"]').textContent = t.blockedListBio;
  // اگر جدول لیست بلاک‌شده‌ها از قبل رندر شده، آن را با زبان جدید دوباره رندر کن
  if (lastBlockedListData) {
    renderBlockedListTable(lastBlockedListData);
  }

  document.querySelectorAll('[data-i18n="previewBtn"]').forEach(el => el.textContent = t.previewBtn);
  document.getElementById('unblockSelectedBtn').textContent = t.unblockSelectedBtn;
  document.getElementById('blockedListSearchInput').placeholder = t.blockedListSearchPlaceholder;

  document.getElementById('tabBtnSettings').textContent = t.tabSettings;
  document.querySelector('[data-i18n="settingsAppearance"]').textContent = t.settingsAppearance;
  document.querySelector('[data-i18n="settingsTheme"]').textContent = t.settingsTheme;
  document.querySelector('[data-i18n="settingsThemeLight"]').textContent = t.settingsThemeLight;
  document.querySelector('[data-i18n="settingsThemeDark"]').textContent = t.settingsThemeDark;
  document.querySelector('[data-i18n="settingsResumeHeading"]').textContent = t.settingsResumeHeading;
  document.querySelector('[data-i18n="settingsResumeLabel"]').textContent = t.settingsResumeLabel;
  document.querySelector('[data-i18n="settingsResumeAsk"]').textContent = t.settingsResumeAsk;
  document.querySelector('[data-i18n="settingsResumeAuto"]').textContent = t.settingsResumeAuto;
  document.querySelector('[data-i18n="settingsResumeNever"]').textContent = t.settingsResumeNever;
  document.querySelector('[data-i18n="settingsSafetyHeading"]').textContent = t.settingsSafetyHeading;
  document.querySelector('[data-i18n="settingsNotifyFollowLabel"]').textContent = t.settingsNotifyFollowLabel;
  document.querySelector('[data-i18n="settingsNotifyCompleteLabel"]').textContent = t.settingsNotifyCompleteLabel;
  document.querySelector('[data-i18n="settingsWhitelistHeading"]').textContent = t.settingsWhitelistHeading;
  document.querySelector('[data-i18n="settingsWhitelistLabel"]').textContent = t.settingsWhitelistLabel;
  document.getElementById('settingsSaveBtn').textContent = t.settingsSaveBtn;

  // پلیس‌هولدر لیست بر اساس حالت انتخاب‌شده (یوزرنیم / X ID) به‌روزرسانی می‌شود
  const modeSelect = document.getElementById('blockModeSelect');
  document.getElementById('listInput').placeholder = modeSelect.value === 'xid' ? t.listPlaceholderXid : t.listPlaceholderUsername;

  chrome.storage.local.set({ uiLang: lang });

  // اگر نتیجه‌ی «دریافت آیدی» از قبل روی صفحه نمایش داده شده، آن را با زبان جدید دوباره رندر کن
  if (lastIdFinderResult) {
    renderIdFinderBox(lastIdFinderResult);
  }
}

const DEFAULT_SETTINGS = {
  theme: 'light',
  resumeBehavior: 'ask',
  whitelist: [],
  notifyOnComplete: true,
  notifyFollowRelation: true
};

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeToggleBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
}

function loadSettingsIntoForm(settings) {
  document.getElementById('settingsThemeSelect').value = settings.theme;
  document.getElementById('settingsResumeSelect').value = settings.resumeBehavior;
  document.getElementById('settingsNotifyFollow').checked = !!settings.notifyFollowRelation;
  document.getElementById('settingsNotifyComplete').checked = !!settings.notifyOnComplete;
  document.getElementById('settingsWhitelistInput').value = (settings.whitelist || []).join('\n');
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['savedList', 'savedDelay', 'uiLang', 'savedBlockMode', 'extensionSettings', 'savedUnblockList', 'savedUnblockDelay', 'savedUnblockMode'], (result) => {
    if (result.savedList) document.getElementById('listInput').value = result.savedList;
    if (result.savedDelay) document.getElementById('delayInput').value = result.savedDelay;
    if (result.savedBlockMode) document.getElementById('blockModeSelect').value = result.savedBlockMode;
    if (result.savedUnblockList) document.getElementById('unblockListInput').value = result.savedUnblockList;
    if (result.savedUnblockDelay) document.getElementById('unblockDelayInput').value = result.savedUnblockDelay;
    if (result.savedUnblockMode) document.getElementById('unblockModeSelect').value = result.savedUnblockMode;

    const settings = Object.assign({}, DEFAULT_SETTINGS, result.extensionSettings || {});
    applyTheme(settings.theme);
    loadSettingsIntoForm(settings);

    applyLanguage(result.uiLang === 'en' ? 'en' : 'fa');
  });

  document.getElementById('langToggle').addEventListener('click', () => {
    applyLanguage(currentLang === 'fa' ? 'en' : 'fa');
  });

  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    chrome.storage.local.get(['extensionSettings'], (result) => {
      const settings = Object.assign({}, DEFAULT_SETTINGS, result.extensionSettings || {});
      settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
      applyTheme(settings.theme);
      document.getElementById('settingsThemeSelect').value = settings.theme;
      chrome.storage.local.set({ extensionSettings: settings });
    });
  });

  document.getElementById('settingsSaveBtn').addEventListener('click', () => {
    const settings = {
      theme: document.getElementById('settingsThemeSelect').value,
      resumeBehavior: document.getElementById('settingsResumeSelect').value,
      notifyFollowRelation: document.getElementById('settingsNotifyFollow').checked,
      notifyOnComplete: document.getElementById('settingsNotifyComplete').checked,
      whitelist: document.getElementById('settingsWhitelistInput').value.split('\n').map(s => s.trim().replace(/^@/, '')).filter(Boolean)
    };
    chrome.storage.local.set({ extensionSettings: settings }, () => {
      applyTheme(settings.theme);
      const note = document.getElementById('settingsSavedNote');
      note.textContent = translations[currentLang].settingsSavedNote;
      setTimeout(() => { note.textContent = ''; }, 2500);
    });
  });

  document.getElementById('blockModeSelect').addEventListener('change', (e) => {
    const t = translations[currentLang];
    document.getElementById('listInput').placeholder = e.target.value === 'xid' ? t.listPlaceholderXid : t.listPlaceholderUsername;
    chrome.storage.local.set({ savedBlockMode: e.target.value });
  });

  document.getElementById('unblockModeSelect').addEventListener('change', (e) => {
    const t = translations[currentLang];
    document.getElementById('unblockListInput').placeholder = e.target.value === 'xid' ? t.unblockListPlaceholderXid : t.unblockListPlaceholderUsername;
    chrome.storage.local.set({ savedUnblockMode: e.target.value });
  });
});

// تابع پیدا کردن مستقیم تب توییتر از داخل خود داشبورد
async function getTwitterTab() {
  const urlFilter = ["*://x.com/*", "*://*.x.com/*", "*://twitter.com/*", "*://*.twitter.com/*"];
  // ابتدا تلاش برای پیدا کردن تب فعال توییتر (وقتی چند تب باز باشد، این دقیق‌ترین انتخاب است)
  const activeTabs = await chrome.tabs.query({ active: true, url: urlFilter });
  if (activeTabs.length > 0) return activeTabs[0];

  const tabs = await chrome.tabs.query({ url: urlFilter });
  return tabs.length > 0 ? tabs[0] : null;
}

// ارتباط مستقیم و بومی با تب توییتر برای جستجو
async function searchUsersDirectly(query) {
  const tab = await getTwitterTab();
  if (!tab) return { error: "NO_TAB" };

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (q) => {
        // ۱. استخراج توکن امنیتی (CSRF) با دقت بالا از کوکی‌ها
        const cookies = document.cookie.split('; ');
        const csrfCookie = cookies.find(row => row.startsWith('ct0='));
        const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : null;
        if (!csrfToken) return { error: "NO_CSRF" };

        const headers = {
          "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
          "X-Csrf-Token": csrfToken,
          "X-Twitter-Active-User": "yes",
          "X-Twitter-Auth-Type": "OAuth2Session",
          "X-Twitter-Client-Language": "en"
        };

        // یک تابع کمکی که هر endpoint را امتحان می‌کند و همیشه جزئیات کامل پاسخ را برمی‌گرداند
        async function tryEndpoint(url) {
          try {
            const res = await fetch(url, { method: "GET", headers });
            let bodyText = '';
            let json = null;
            try {
              bodyText = await res.text();
              json = JSON.parse(bodyText);
            } catch (_) { /* پاسخ JSON معتبر نبود */ }
            return { httpOk: res.ok, status: res.status, json, bodyText: (bodyText || '').slice(0, 200) };
          } catch (err) {
            return { httpOk: false, status: 0, networkError: true };
          }
        }

        // این پارامترها دقیقاً همان‌هایی هستند که خود صفحه توییتر هنگام تایپ در کادر جستجو استفاده می‌کند
        // (تفاوت کلیدی نسبت به قبل: پارامتر درست `result_type` است، نه `types`)
        const searchUrl = `https://x.com/i/api/1.1/search/typeahead.json?include_ext_is_blue_verified=1&include_ext_verified_type=1&include_ext_profile_image_shape=1&q=${encodeURIComponent(q)}&src=search_box&result_type=cashtags%2Cevents%2Cusers%2Ctopics%2Clists`;

        const attempt = await tryEndpoint(searchUrl);
        let users = (attempt.json && attempt.json.users) || [];

        if (users.length === 0) {
          const describeAttempt = (label, a) => a
            ? `${label}: status=${a.status}${a.networkError ? ' (network error)' : ''}${a.bodyText ? ' body=' + a.bodyText : ''}`
            : `${label}: not tried`;
          return {
            users: [],
            debugRaw: describeAttempt('typeahead', attempt)
          };
        }

        return { users };
      },
      args: [query]
    });

    return result ? result.result : { users: [] };
  } catch (e) {
    console.error("خطای تزریق اسکریپت:", e);
    return { error: "INJECTION_FAILED" };
  }
}

// مدیریت تایپ کاربر و نمایش نتایج
document.getElementById('searchInput').addEventListener('input', async function(e) {
  const query = e.target.value.trim();
  const dropdown = document.getElementById('searchDropdown');

  if (searchTimeout) clearTimeout(searchTimeout);

  if (query.length < 2) {
    dropdown.style.display = 'none';
    return;
  }

  // شناسه‌ی یکتا برای این درخواست؛ اگر تا برگشتن پاسخ کوئری جدیدتری زده شود، این پاسخ نادیده گرفته می‌شود
  const thisRequestId = ++searchRequestId;

  searchTimeout = setTimeout(async () => {
    const t = translations[currentLang];
    dropdown.innerHTML = `<div style="padding: 15px; font-size: 13px; color: #6b7280; text-align: center;">${t.searching}</div>`;
    dropdown.style.display = 'block';

    const results = await searchUsersDirectly(query);

    // اگر در فاصله‌ی این تاخیر، کاربر کوئری جدیدتری تایپ کرده، این پاسخ قدیمی را دور می‌ریزیم
    if (thisRequestId !== searchRequestId) return;

    if (results.error === "NO_TAB") {
      dropdown.innerHTML = `<div style="padding: 15px; font-size: 13px; color: red; text-align: center;">${t.errNoTab}</div>`;
      return;
    }
    if (results.error === "NO_CSRF") {
      dropdown.innerHTML = `<div style="padding: 15px; font-size: 13px; color: red; text-align: center;">${t.errNoCsrf}</div>`;
      return;
    }
    if (results.error === "FETCH_FAILED") {
      dropdown.innerHTML = `<div style="padding: 15px; font-size: 13px; color: red; text-align: center;">${t.errFetchFailed(results.status)}</div>`;
      return;
    }
    if (results.error === "FETCH_ERROR" || results.error === "INJECTION_FAILED") {
      dropdown.innerHTML = `<div style="padding: 15px; font-size: 13px; color: red; text-align: center;">${t.errFetchError}</div>`;
      return;
    }

    renderSearchResults(results);
  }, 400); // تاخیر ۴۰۰ میلی‌ثانیه‌ای برای بهینه‌تر شدن درخواست‌ها
});

function renderSearchResults(results) {
  const dropdown = document.getElementById('searchDropdown');
  const t = translations[currentLang];
  const users = results.users || [];
  dropdown.innerHTML = '';

  if (!users || users.length === 0) {
    let debugHtml = '';
    if (results.debugRaw) {
      debugHtml = `<div style="margin-top:6px; font-size:10px; color:#9ca3af; direction:ltr; text-align:left; word-break:break-all;">debug: ${results.debugRaw}</div>`;
    }
    dropdown.innerHTML = `<div style="padding: 15px; font-size: 13px; color: #6b7280; text-align: center;">${t.noUsersFound}${debugHtml}</div>`;
    dropdown.style.display = 'block';
    return;
  }

  users.forEach(user => {
    const item = document.createElement('div');
    item.className = 'search-item';
    item.innerHTML = `
      <input type="checkbox" data-username="${user.screen_name}" class="user-select-checkbox" />
      <img src="${user.profile_image_url_https}" alt="${user.screen_name}" />
      <div class="user-info">
        <span class="name">${user.name}</span>
        <span class="handle">@${user.screen_name}</span>
      </div>
    `;

    item.addEventListener('click', (e) => {
      const checkbox = item.querySelector('.user-select-checkbox');
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
    });

    dropdown.appendChild(item);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'add-selected-btn';
  addBtn.innerText = t.addSelectedBtn;
  
  addBtn.addEventListener('click', () => {
    const checkedBoxes = dropdown.querySelectorAll('.user-select-checkbox:checked');
    if (checkedBoxes.length === 0) {
      alert(translations[currentLang].alertNoCheckbox);
      return;
    }

    const listInput = document.getElementById('listInput');
    let currentText = listInput.value.trim();
    let selectedUsers = [];

    checkedBoxes.forEach(cb => {
      selectedUsers.push(cb.getAttribute('data-username'));
    });

    if (currentText === '') {
      listInput.value = selectedUsers.join('\n');
    } else {
      listInput.value = currentText + '\n' + selectedUsers.join('\n');
    }

    chrome.storage.local.set({ savedList: listInput.value });
    document.getElementById('searchInput').value = '';
    dropdown.style.display = 'none';
  });

  dropdown.appendChild(addBtn);
  dropdown.style.display = 'block';
}

document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('searchDropdown');
  const searchInput = document.getElementById('searchInput');
  if (dropdown && e.target !== dropdown && !dropdown.contains(e.target) && e.target !== searchInput) {
    dropdown.style.display = 'none';
  }
});

// ایمپورت فایل متنی
document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const contents = e.target.result;
    document.getElementById('listInput').value = contents;
    chrome.storage.local.set({ savedList: contents });
  };
  reader.readAsText(file);
});

document.getElementById('unblockFileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const contents = e.target.result;
    document.getElementById('unblockListInput').value = contents;
    chrome.storage.local.set({ savedUnblockList: contents });
  };
  reader.readAsText(file);
});

// پاکسازی و اعتبارسنجی خطوط لیست بر اساس حالت انتخاب‌شده (یوزرنیم / X ID)
function getValidatedEntries(showInvalidAlert) {
  const text = document.getElementById('listInput').value;
  const blockMode = document.getElementById('blockModeSelect').value;
  let entries = text.split('\n').map(i => i.trim().replace(/^@/, '')).filter(i => i !== '');

  if (blockMode === 'xid') {
    const validCount = entries.length;
    entries = entries.filter(i => /^\d+$/.test(i));
    if (showInvalidAlert && entries.length < validCount) {
      alert(translations[currentLang].alertInvalidXidLines);
    }
  }
  return entries;
}

// ارسال داده به تب فعال توییتر (از طریق پیام به content_trigger.js که همیشه روی صفحه حاضر است)
document.getElementById('startBtn').addEventListener('click', async () => {
  const text = document.getElementById('listInput').value;
  const delayVal = document.getElementById('delayInput').value || "7";
  const blockMode = document.getElementById('blockModeSelect').value;

  if (!text.trim()) {
    alert(translations[currentLang].alertEmptyList);
    return;
  }

  chrome.storage.local.set({ savedList: text, savedDelay: delayVal, savedBlockMode: blockMode });

  const tab = await getTwitterTab();
  if (!tab) {
    alert(translations[currentLang].alertNoTabOnStart);
    return;
  }

  const delayMs = parseInt(delayVal) * 1000;
  const entries = getValidatedEntries(true);

  if (entries.length === 0) {
    alert(translations[currentLang].alertEmptyList);
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: "START_BLOCK_JOB", list: entries, delayMs });
  chrome.tabs.update(tab.id, { active: true });
});

// پیش‌نمایش قبل از شروع: فقط شمارش (بدون بلاک واقعی)، از طریق content_trigger.js روی تب توییتر
document.getElementById('previewBtn').addEventListener('click', async () => {
  const t = translations[currentLang];
  const previewBox = document.getElementById('previewBox');
  const entries = getValidatedEntries(true);

  if (entries.length === 0) {
    alert(t.alertEmptyList);
    return;
  }

  const tab = await getTwitterTab();
  if (!tab) {
    alert(t.alertNoTabOnStart);
    return;
  }

  previewBox.style.display = 'block';
  previewBox.textContent = t.searching;

  chrome.tabs.sendMessage(tab.id, { action: "PREVIEW_BLOCK_LIST", list: entries }, (result) => {
    if (!result || result.error) {
      previewBox.textContent = result && result.error === 'NO_CSRF' ? t.errNoCsrf : t.errFetchError;
      return;
    }
    previewBox.innerHTML = `
      <div>${t.previewTotal(result.total)}</div>
      ${result.whitelisted ? `<div>${t.previewWhitelisted(result.whitelisted)}</div>` : ''}
      <div>${t.previewAlreadyBlocked(result.alreadyBlocked)}</div>
      ${result.followFlagged ? `<div>${t.previewFollowFlagged(result.followFlagged)}</div>` : ''}
      <div><b>${t.previewWillBlock(result.willBlock)}</b></div>
    `;
  });
});

// پاک کردن داده‌های تب بلاک دسته‌جمعی
document.getElementById('clearBlockDataBtn').addEventListener('click', () => {
  const t = translations[currentLang];
  if (!confirm(t.confirmClearList)) return;

  document.getElementById('listInput').value = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('searchDropdown').style.display = 'none';
  document.getElementById('fileInput').value = '';
  document.getElementById('previewBox').style.display = 'none';
  document.getElementById('previewBox').innerHTML = '';
  chrome.storage.local.remove(['savedList']);
});

// پاکسازی و اعتبارسنجی خطوط لیست آنبلاک بر اساس حالت انتخاب‌شده (یوزرنیم / X ID)
function getValidatedUnblockEntries(showInvalidAlert) {
  const text = document.getElementById('unblockListInput').value;
  const mode = document.getElementById('unblockModeSelect').value;
  let entries = text.split('\n').map(i => i.trim().replace(/^@/, '')).filter(i => i !== '');

  if (mode === 'xid') {
    const validCount = entries.length;
    entries = entries.filter(i => /^\d+$/.test(i));
    if (showInvalidAlert && entries.length < validCount) {
      alert(translations[currentLang].alertInvalidXidLines);
    }
  }
  return entries;
}

// ارسال داده به تب فعال توییتر برای شروع عملیات آنبلاک
document.getElementById('unblockStartBtn').addEventListener('click', async () => {
  const text = document.getElementById('unblockListInput').value;
  const delayVal = document.getElementById('unblockDelayInput').value || "7";
  const mode = document.getElementById('unblockModeSelect').value;

  if (!text.trim()) {
    alert(translations[currentLang].alertEmptyList);
    return;
  }

  chrome.storage.local.set({ savedUnblockList: text, savedUnblockDelay: delayVal, savedUnblockMode: mode });

  const tab = await getTwitterTab();
  if (!tab) {
    alert(translations[currentLang].alertNoTabOnStart);
    return;
  }

  const delayMs = parseInt(delayVal) * 1000;
  const entries = getValidatedUnblockEntries(true);

  if (entries.length === 0) {
    alert(translations[currentLang].alertEmptyList);
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: "START_UNBLOCK_JOB", list: entries, delayMs });
  chrome.tabs.update(tab.id, { active: true });
});

// پیش‌نمایش قبل از شروع آنبلاک: فقط شمارش، بدون آنبلاک واقعی
document.getElementById('unblockPreviewBtn').addEventListener('click', async () => {
  const t = translations[currentLang];
  const previewBox = document.getElementById('unblockPreviewBox');
  const entries = getValidatedUnblockEntries(true);

  if (entries.length === 0) {
    alert(t.alertEmptyList);
    return;
  }

  const tab = await getTwitterTab();
  if (!tab) {
    alert(t.alertNoTabOnStart);
    return;
  }

  previewBox.style.display = 'block';
  previewBox.textContent = t.searching;

  chrome.tabs.sendMessage(tab.id, { action: "PREVIEW_UNBLOCK_LIST", list: entries }, (result) => {
    if (!result || result.error) {
      previewBox.textContent = result && result.error === 'NO_CSRF' ? t.errNoCsrf : t.errFetchError;
      return;
    }
    previewBox.innerHTML = `
      <div>${t.previewTotal(result.total)}</div>
      <div>${t.previewNotBlocked(result.notBlocked)}</div>
      <div><b>${t.previewWillUnblock(result.willUnblock)}</b></div>
    `;
  });
});

// پاک کردن داده‌های تب آنبلاک دسته‌جمعی
document.getElementById('clearUnblockDataBtn').addEventListener('click', () => {
  const t = translations[currentLang];
  if (!confirm(t.confirmClearUnblockList)) return;

  document.getElementById('unblockListInput').value = '';
  document.getElementById('unblockFileInput').value = '';
  document.getElementById('unblockPreviewBox').style.display = 'none';
  document.getElementById('unblockPreviewBox').innerHTML = '';
  chrome.storage.local.remove(['savedUnblockList']);
});

// پاک کردن داده‌های تب دریافت آیدی
document.getElementById('clearIdFinderDataBtn').addEventListener('click', () => {
  const t = translations[currentLang];
  if (!confirm(t.confirmClearIdFinder)) return;

  document.getElementById('idFinderInput').value = '';
  const box = document.getElementById('idFinderResult');
  box.innerHTML = '';
  box.style.display = 'none';
  lastIdFinderResult = null;
});

// ===== سوییچ بین تب‌های داشبورد (بلاک دسته‌جمعی / دریافت آیدی / لیست بلاک‌شده‌ها) =====
function switchTab(activeBtnId, activePanelId) {
  const btnIds = ['tabBtnBlock', 'tabBtnUnblock', 'tabBtnIdFinder', 'tabBtnBlockedList', 'tabBtnSettings'];
  const panelIds = ['tabBlockPanel', 'tabUnblockPanel', 'tabIdFinderPanel', 'tabBlockedListPanel', 'tabSettingsPanel'];
  btnIds.forEach(id => document.getElementById(id).classList.toggle('active', id === activeBtnId));
  panelIds.forEach(id => document.getElementById(id).style.display = (id === activePanelId ? 'block' : 'none'));
}

document.getElementById('tabBtnBlock').addEventListener('click', () => switchTab('tabBtnBlock', 'tabBlockPanel'));
document.getElementById('tabBtnUnblock').addEventListener('click', () => switchTab('tabBtnUnblock', 'tabUnblockPanel'));
document.getElementById('tabBtnIdFinder').addEventListener('click', () => switchTab('tabBtnIdFinder', 'tabIdFinderPanel'));
document.getElementById('tabBtnBlockedList').addEventListener('click', () => switchTab('tabBtnBlockedList', 'tabBlockedListPanel'));
document.getElementById('tabBtnSettings').addEventListener('click', () => switchTab('tabBtnSettings', 'tabSettingsPanel'));

// ===== دریافت آیدی عددی (X ID) از روی یوزرنیم =====
// نکته مهم: search/typeahead یک اندپوینت «جستجوی فازی و شخصی‌سازی‌شده» است، نه دیکشنری کامل کاربران.
// این یعنی برای اکانت‌هایی که قبلاً بلاک/میوت کرده‌ای، اکانت‌های پروتکت‌شده (خصوصی)،
// یا اکانت‌هایی که تعامل/فالوی مشترکی با آن‌ها نداری، ممکن است نتیجه‌ای برنگرداند - حتی اگر اکانت واقعاً وجود داشته باشد.
// به همین دلیل، برای این تب از یک اندپوینت «جستجوی دقیق» (نه فازی) استفاده می‌کنیم که مستقیماً
// وضعیت رابطه (فالو/بلاک/میوت) با یک یوزرنیم مشخص را برمی‌گرداند و بسیار قابل‌اعتمادتر است.
async function fetchUserIdByUsername(screenName) {
  const tab = await getTwitterTab();
  if (!tab) return { error: "NO_TAB" };

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (username) => {
        const cookies = document.cookie.split('; ');
        const csrfCookie = cookies.find(row => row.startsWith('ct0='));
        const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : null;
        if (!csrfToken) return { error: "NO_CSRF" };

        const headers = {
          "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
          "X-Csrf-Token": csrfToken,
          "X-Twitter-Active-User": "yes",
          "X-Twitter-Auth-Type": "OAuth2Session",
          "X-Twitter-Client-Language": "en"
        };

        try {
          // روش اول: جستجوی دقیق (نه فازی) - همون چیزی که برای نمایش وضعیت بلاک/فالو استفاده میشه
          const res = await fetch(`https://x.com/i/api/1.1/friendships/lookup.json?screen_name=${encodeURIComponent(username)}`, {
            method: "GET",
            headers
          });

          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0 && data[0].id_str) {
              const u = data[0];
              return {
                name: u.name,
                screen_name: u.screen_name,
                id: u.id_str,
                alreadyBlocked: Array.isArray(u.connections) && u.connections.includes('blocking')
              };
            }
          }

          // روش دوم (پشتیبان): اگر روش اول جواب نداد، سراغ جستجوی فازی می‌رویم
          const res2 = await fetch(`https://x.com/i/api/1.1/search/typeahead.json?include_ext_is_blue_verified=1&include_ext_verified_type=1&include_ext_profile_image_shape=1&q=${encodeURIComponent(username)}&src=search_box&result_type=cashtags%2Cevents%2Cusers%2Ctopics%2Clists`, {
            method: "GET",
            headers
          });
          if (res2.ok) {
            const data2 = await res2.json();
            const users = data2.users || [];
            const match = users.find(u => (u.screen_name || '').toLowerCase() === username.toLowerCase());
            if (match) {
              return { name: match.name, screen_name: match.screen_name, id: String(match.id_str || match.id) };
            }
            return { error: "NOT_FOUND", debugRaw: JSON.stringify(data2).slice(0, 300) };
          }

          let bodyText = '';
          try { bodyText = (await res.text()).slice(0, 300); } catch (_) {}
          return { error: "FETCH_FAILED", status: res.status, debugRaw: bodyText };
        } catch (err) {
          return { error: "FETCH_ERROR" };
        }
      },
      args: [screenName]
    });
    return result ? result.result : { error: "FETCH_ERROR" };
  } catch (e) {
    return { error: "INJECTION_FAILED" };
  }
}

function renderIdFinderMessage(html) {
  const box = document.getElementById('idFinderResult');
  box.style.display = 'block';
  box.innerHTML = `<div style="text-align:center; font-size:13px; color:#4b5563;">${html}</div>`;
}

function renderIdFinderBox(result) {
  const t = translations[currentLang];
  const box = document.getElementById('idFinderResult');
  const blockedNote = result.alreadyBlocked
    ? `<div style="margin-top:10px; font-size:12px; color:#be123c;">${t.idFinderAlreadyBlocked}</div>`
    : '';
  box.innerHTML = `
    <div class="row-line"><span>${t.idFinderName}:</span><b>${result.name}</b></div>
    <div class="row-line"><span>${t.idFinderUsername}:</span><b>@${result.screen_name}</b></div>
    <div class="row-line">
      <span>${t.idFinderId}:</span>
      <span style="display:flex; align-items:center; gap:8px;">
        <b id="idFinderIdValue">${result.id}</b>
        <button class="copy-btn" id="idFinderCopyBtn" type="button">${t.copyBtn}</button>
      </span>
    </div>
    ${blockedNote}
  `;
  box.style.display = 'block';

  document.getElementById('idFinderCopyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(result.id).then(() => {
      const btn = document.getElementById('idFinderCopyBtn');
      const original = translations[currentLang].copyBtn;
      btn.textContent = translations[currentLang].copiedBtn;
      setTimeout(() => { btn.textContent = original; }, 1500);
    });
  });
}

document.getElementById('idFinderBtn').addEventListener('click', async () => {
  const t = translations[currentLang];
  const raw = document.getElementById('idFinderInput').value.trim().replace(/^@/, '');

  if (!raw) {
    renderIdFinderMessage(t.idFinderEmpty);
    return;
  }

  renderIdFinderMessage(t.idFinderSearching);
  lastIdFinderResult = null;

  const result = await fetchUserIdByUsername(raw);

  if (result.error === "NO_TAB") { renderIdFinderMessage(t.errNoTab); return; }
  if (result.error === "NO_CSRF") { renderIdFinderMessage(t.errNoCsrf); return; }
  if (result.error === "NOT_FOUND") {
    const debugHtml = result.debugRaw
      ? `<div style="margin-top:8px; font-size:10px; color:#9ca3af; direction:ltr; text-align:left; word-break:break-all;">debug: ${result.debugRaw}</div>`
      : '';
    renderIdFinderMessage(t.idFinderNotFound + debugHtml);
    return;
  }
  if (result.error === "FETCH_FAILED") { renderIdFinderMessage(t.errFetchFailed(result.status)); return; }
  if (result.error) { renderIdFinderMessage(t.errFetchError); return; }

  lastIdFinderResult = result;
  renderIdFinderBox(result);
});

document.getElementById('idFinderInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('idFinderBtn').click();
});
// ===== لیست بلاک‌شده‌ها: دریافت کامل لیست اکانت‌هایی که کاربر بلاک کرده =====

// دریافت یک صفحه از لیست بلاک‌شده‌ها از توییتر (blocks/list.json) - صفحه‌بندی با cursor
async function fetchBlockedListPage(tabId, cursor) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async (cursorArg) => {
        const cookies = document.cookie.split('; ');
        const csrfCookie = cookies.find(row => row.startsWith('ct0='));
        const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : null;
        if (!csrfToken) return { error: "NO_CSRF" };

        const url = `https://x.com/i/api/1.1/blocks/list.json?skip_status=true&include_entities=false&count=200${cursorArg ? `&cursor=${encodeURIComponent(cursorArg)}` : ''}`;

        try {
          const res = await fetch(url, {
            method: "GET",
            headers: {
              "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
              "X-Csrf-Token": csrfToken,
              "X-Twitter-Active-User": "yes",
              "X-Twitter-Auth-Type": "OAuth2Session",
              "X-Twitter-Client-Language": "en"
            }
          });
          if (res.ok) {
            const data = await res.json();
            return { users: data.users || [], nextCursor: data.next_cursor_str || "0" };
          }
          let bodyText = '';
          try { bodyText = (await res.text()).slice(0, 300); } catch (_) {}
          return { error: "FETCH_FAILED", status: res.status, debugRaw: bodyText };
        } catch (err) {
          return { error: "FETCH_ERROR" };
        }
      },
      args: [cursor]
    });
    return result ? result.result : { error: "INJECTION_FAILED" };
  } catch (e) {
    return { error: "INJECTION_FAILED" };
  }
}

let blockedListSearchTerm = '';
let blockedListSortKey = null;
let blockedListSortAsc = true;

function getFilteredSortedBlockedList() {
  let list = lastBlockedListData || [];
  if (blockedListSearchTerm) {
    const term = blockedListSearchTerm.toLowerCase();
    list = list.filter(u =>
      (u.name || '').toLowerCase().includes(term) ||
      (u.screen_name || '').toLowerCase().includes(term) ||
      (u.description || '').toLowerCase().includes(term)
    );
  }
  if (blockedListSortKey) {
    list = list.slice().sort((a, b) => {
      const av = (a[blockedListSortKey] || '').toString().toLowerCase();
      const bv = (b[blockedListSortKey] || '').toString().toLowerCase();
      if (av < bv) return blockedListSortAsc ? -1 : 1;
      if (av > bv) return blockedListSortAsc ? 1 : -1;
      return 0;
    });
  }
  return list;
}

function renderBlockedListRows() {
  const t = translations[currentLang];
  const tbody = document.querySelector('#blockedListTable tbody');
  tbody.innerHTML = '';

  const visibleList = getFilteredSortedBlockedList();

  if (visibleList.length === 0 && (lastBlockedListData || []).length > 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">${t.blockedListNoResults}</td></tr>`;
    return;
  }

  visibleList.forEach(u => {
    const tr = document.createElement('tr');
    const bio = (u.description && u.description.trim()) ? u.description : t.blockedListNoBio;
    tr.innerHTML = `
      <td><input type="checkbox" class="blocked-row-checkbox" data-id="${escapeHtml(u.id_str)}" data-username="${escapeHtml(u.screen_name)}" /></td>
      <td>${escapeHtml(u.name)}</td>
      <td>@${escapeHtml(u.screen_name)}</td>
      <td>${escapeHtml(u.id_str)}</td>
      <td>${escapeHtml(bio)}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('blockedListSelectAll').checked = false;
}

function renderBlockedListTable(data) {
  const t = translations[currentLang];
  lastBlockedListData = data;
  blockedListSearchTerm = '';
  blockedListSortKey = null;
  document.getElementById('blockedListSearchInput').value = '';

  renderBlockedListRows();

  document.getElementById('blockedListTableWrapper').style.display = data.length > 0 ? 'block' : 'none';
  document.getElementById('blockedListToolbar').style.display = data.length > 0 ? 'flex' : 'none';
  document.getElementById('unblockSelectedBtn').style.display = data.length > 0 ? 'block' : 'none';
  document.getElementById('blockedListStatus').textContent = data.length > 0 ? t.blockedListDone(data.length) : t.blockedListEmpty;
  document.getElementById('exportBlockedListBtn').style.display = data.length > 0 ? 'block' : 'none';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

// جستجوی زنده در جدول لیست بلاک‌شده‌ها
document.getElementById('blockedListSearchInput').addEventListener('input', (e) => {
  blockedListSearchTerm = e.target.value.trim();
  renderBlockedListRows();
});

// مرتب‌سازی با کلیک روی هدر ستون
document.querySelectorAll('#blockedListTable thead th[data-sort-key]').forEach(th => {
  th.addEventListener('click', () => {
    const key = th.getAttribute('data-sort-key');
    if (blockedListSortKey === key) {
      blockedListSortAsc = !blockedListSortAsc;
    } else {
      blockedListSortKey = key;
      blockedListSortAsc = true;
    }
    renderBlockedListRows();
  });
});

// تیک زدن همه/هیچ‌کدام
document.getElementById('blockedListSelectAll').addEventListener('change', (e) => {
  document.querySelectorAll('.blocked-row-checkbox').forEach(cb => { cb.checked = e.target.checked; });
});

document.getElementById('fetchBlockedListBtn').addEventListener('click', async () => {
  const t = translations[currentLang];
  const statusEl = document.getElementById('blockedListStatus');
  const tab = await getTwitterTab();

  if (!tab) {
    statusEl.textContent = t.errNoTab;
    return;
  }

  document.getElementById('fetchBlockedListBtn').disabled = true;
  document.getElementById('exportBlockedListBtn').style.display = 'none';
  document.getElementById('blockedListTableWrapper').style.display = 'none';
  document.getElementById('blockedListToolbar').style.display = 'none';
  document.getElementById('unblockSelectedBtn').style.display = 'none';

  let allUsers = [];
  let cursor = null;
  statusEl.textContent = t.blockedListFetching(0);

  while (true) {
    const page = await fetchBlockedListPage(tab.id, cursor);

    if (page.error === "NO_CSRF") { statusEl.textContent = t.errNoCsrf; break; }
    if (page.error === "FETCH_FAILED") { statusEl.textContent = t.errFetchFailed(page.status); break; }
    if (page.error) { statusEl.textContent = t.errFetchError; break; }

    allUsers = allUsers.concat(page.users || []);
    statusEl.textContent = t.blockedListFetching(allUsers.length);

    if (!page.nextCursor || page.nextCursor === "0" || (page.users || []).length === 0) {
      break;
    }
    cursor = page.nextCursor;
    // فاصله‌ی کوچک بین صفحات برای احتیاط در برابر لیمیت
    await new Promise(r => setTimeout(r, 300));
  }

  document.getElementById('fetchBlockedListBtn').disabled = false;
  renderBlockedListTable(allUsers);
});

document.getElementById('exportBlockedListBtn').addEventListener('click', () => {
  if (!lastBlockedListData || lastBlockedListData.length === 0) return;

  const t = translations[currentLang];
  const headers = [t.idFinderName, t.idFinderUsername, t.idFinderId, t.blockedListBio];
  const csvEscape = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;

  const rows = lastBlockedListData.map(u => [
    csvEscape(u.name),
    csvEscape('@' + u.screen_name),
    csvEscape(u.id_str),
    csvEscape(u.description || '')
  ].join(','));

  const csvContent = '\uFEFF' + [headers.map(csvEscape).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'blocked_accounts.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// آنبلاک گروهی اکانت‌های انتخاب‌شده از داخل جدول
async function unblockUserOnTab(tabId, idStr) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async (userId) => {
        const cookies = document.cookie.split('; ');
        const csrfCookie = cookies.find(row => row.startsWith('ct0='));
        const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : null;
        if (!csrfToken) return { error: "NO_CSRF" };
        try {
          const res = await fetch("https://x.com/i/api/1.1/blocks/destroy.json", {
            method: "POST",
            headers: {
              "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
              "X-Csrf-Token": csrfToken,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `user_id=${userId}`
          });
          return { ok: res.ok, status: res.status };
        } catch (e) {
          return { error: "FETCH_ERROR" };
        }
      },
      args: [idStr]
    });
    return result ? result.result : { error: "INJECTION_FAILED" };
  } catch (e) {
    return { error: "INJECTION_FAILED" };
  }
}

document.getElementById('unblockSelectedBtn').addEventListener('click', async () => {
  const t = translations[currentLang];
  const checkboxes = Array.from(document.querySelectorAll('.blocked-row-checkbox:checked'));
  if (checkboxes.length === 0) return;

  if (!confirm(t.confirmUnblockSelected(checkboxes.length))) return;

  const tab = await getTwitterTab();
  if (!tab) {
    alert(t.errNoTab);
    return;
  }

  const statusEl = document.getElementById('blockedListStatus');
  const idsToUnblock = checkboxes.map(cb => cb.getAttribute('data-id'));
  let doneCount = 0;

  for (const idStr of idsToUnblock) {
    statusEl.textContent = t.unblockingStatus(doneCount, idsToUnblock.length);
    await unblockUserOnTab(tab.id, idStr);
    doneCount++;
    if (doneCount < idsToUnblock.length) await new Promise(r => setTimeout(r, 500));
  }

  lastBlockedListData = (lastBlockedListData || []).filter(u => !idsToUnblock.includes(u.id_str));
  renderBlockedListRows();
  statusEl.textContent = t.unblockDoneStatus(idsToUnblock.length);

  if (lastBlockedListData.length === 0) {
    document.getElementById('blockedListTableWrapper').style.display = 'none';
    document.getElementById('blockedListToolbar').style.display = 'none';
    document.getElementById('unblockSelectedBtn').style.display = 'none';
    document.getElementById('exportBlockedListBtn').style.display = 'none';
  }
});

document.getElementById('clearBlockedListDataBtn').addEventListener('click', () => {
  const t = translations[currentLang];
  if (!confirm(t.confirmClearBlockedList)) return;

  lastBlockedListData = null;
  blockedListSearchTerm = '';
  blockedListSortKey = null;
  document.getElementById('blockedListSearchInput').value = '';
  document.querySelector('#blockedListTable tbody').innerHTML = '';
  document.getElementById('blockedListTableWrapper').style.display = 'none';
  document.getElementById('blockedListToolbar').style.display = 'none';
  document.getElementById('unblockSelectedBtn').style.display = 'none';
  document.getElementById('exportBlockedListBtn').style.display = 'none';
  document.getElementById('blockedListStatus').textContent = '';
});

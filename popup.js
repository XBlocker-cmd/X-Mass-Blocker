let searchTimeout = null;
let searchRequestId = 0; // برای جلوگیری از بازنویسی نتایج توسط پاسخ‌های قدیمی

const translations = {
  fa: {
    popupTitle: "تنظیمات بلاک دسته‌جمعی",
    searchPlaceholder: "جستجوی سریع اکانت در توییتر...",
    listLabel: "لیست نهایی کاربران برای بلاک",
    listPlaceholder: "یوزرنیم‌ها یا آیدی‌ها در هر خط...",
    importLabel: "ایمپورت فایل (TXT)",
    chooseFile: "انتخاب فایل...",
    delayLabel: "تاخیر (ثانیه)",
    startBtn: "ارسال لیست به توییتر",
    noUsersFound: "کاربری یافت نشد یا در توییتر لاگین نیستید.",
    addSelectedBtn: "افزودن انتخاب‌شده‌ها به لیست",
    alertNoCheckbox: "لطفاً ابتدا حداقل یک کاربر را تیک بزنید.",
    alertEmptyList: "لطفاً ابتدا لیست خود را وارد یا ایمپورت کنید.",
    alertWrongTab: "لطفاً ابتدا روی تب فعال توییتر (X) کلیک کنید و سپس این دکمه را بزنید.",
    popupFooterNote: "برای گزینه‌های بیشتر (پیش‌نمایش، تنظیمات، لیست بلاک‌شده‌ها) از آیکون داخل صفحه X استفاده کنید."
  },
  en: {
    popupTitle: "Mass Block Settings",
    searchPlaceholder: "Quick search for an account on Twitter...",
    listLabel: "Final list of users to block",
    listPlaceholder: "Usernames or IDs, one per line...",
    importLabel: "Import file (TXT)",
    chooseFile: "Choose file...",
    delayLabel: "Delay (seconds)",
    startBtn: "Send list to Twitter",
    noUsersFound: "No user found, or you're not logged into Twitter.",
    addSelectedBtn: "Add selected to list",
    alertNoCheckbox: "Please select at least one user first.",
    alertEmptyList: "Please enter or import your list first.",
    alertWrongTab: "Please click on an active Twitter (X) tab first, then click this button.",
    popupFooterNote: "For more options (preview, settings, blocked list) use the icon inside the X page."
  }
};

let currentLang = 'fa';

function applyLanguage(lang) {
  currentLang = lang;
  const t = translations[lang];
  document.documentElement.lang = lang === 'fa' ? 'fa' : 'en';
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';

  document.querySelector('[data-i18n="popupTitle"]').textContent = t.popupTitle;
  document.getElementById('searchInput').placeholder = t.searchPlaceholder;
  document.querySelector('[data-i18n="listLabel"]').textContent = t.listLabel;
  document.getElementById('listInput').placeholder = t.listPlaceholder;
  document.querySelector('[data-i18n="importLabel"]').textContent = t.importLabel;
  document.querySelector('[data-i18n="chooseFile"]').textContent = t.chooseFile;
  document.querySelector('[data-i18n="delayLabel"]').textContent = t.delayLabel;
  document.getElementById('startBtn').textContent = t.startBtn;
  document.getElementById('langToggle').textContent = lang === 'fa' ? 'EN' : 'FA';
  document.querySelector('[data-i18n="popupFooterNote"]').textContent = t.popupFooterNote;

  chrome.storage.local.set({ uiLang: lang });
}

function applyPopupTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('popupThemeToggleBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['savedList', 'savedDelay', 'uiLang', 'extensionSettings'], (result) => {
    if (result.savedList) document.getElementById('listInput').value = result.savedList;
    if (result.savedDelay) document.getElementById('delayInput').value = result.savedDelay;
    applyPopupTheme((result.extensionSettings && result.extensionSettings.theme) || 'light');
    applyLanguage(result.uiLang === 'en' ? 'en' : 'fa');
  });

  document.getElementById('langToggle').addEventListener('click', () => {
    applyLanguage(currentLang === 'fa' ? 'en' : 'fa');
  });

  document.getElementById('popupThemeToggleBtn').addEventListener('click', () => {
    chrome.storage.local.get(['extensionSettings'], (result) => {
      const settings = Object.assign({ theme: 'light', resumeBehavior: 'ask', whitelist: [], notifyOnComplete: true, notifyFollowRelation: true }, result.extensionSettings || {});
      settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
      applyPopupTheme(settings.theme);
      chrome.storage.local.set({ extensionSettings: settings });
    });
  });
});

async function getActiveTabCsrf() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return null;
  
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const cookies = document.cookie.split('; ');
        const csrfToken = cookies.find(row => row.startsWith('ct0='));
        return csrfToken ? csrfToken.split('=')[1] : null;
      }
    });
    return result ? result.result : null;
  } catch (e) {
    return null;
  }
}

async function searchUsersOnTwitter(query) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return { users: [], error: "NO_TAB" };

  const csrfToken = await getActiveTabCsrf();
  if (!csrfToken) return { users: [], error: "NO_CSRF" };

  try {
    const [response] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (q, token) => {
        const headers = {
          "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
          "X-Csrf-Token": token,
          "X-Twitter-Active-User": "yes",
          "X-Twitter-Auth-Type": "OAuth2Session",
          "X-Twitter-Client-Language": "en"
        };

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
      args: [query, csrfToken]
    });
    return response ? response.result : { users: [] };
  } catch (e) {
    return { users: [], error: "INJECTION_FAILED" };
  }
}

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
    const results = await searchUsersOnTwitter(query);

    // اگر در فاصله‌ی این تاخیر، کاربر کوئری جدیدتری تایپ کرده، این پاسخ قدیمی را دور می‌ریزیم
    if (thisRequestId !== searchRequestId) return;

    renderSearchResults(results);
  }, 300);
});

function renderSearchResults(results) {
  const dropdown = document.getElementById('searchDropdown');
  const t = translations[currentLang];
  const users = results.users || [];
  dropdown.innerHTML = '';

  if (!users || users.length === 0) {
    let debugHtml = '';
    if (results.debugRaw) {
      debugHtml = `<div style="margin-top:6px; font-size:9px; color:#9ca3af; direction:ltr; text-align:left; word-break:break-all;">debug: ${results.debugRaw}</div>`;
    }
    dropdown.innerHTML = `<div style="padding: 10px; font-size: 12px; color: #6b7280; text-align: center;">${t.noUsersFound}${debugHtml}</div>`;
    dropdown.style.display = 'block';
    return;
  }

  // ایجاد آیتم‌های لیست کاربران با چک‌باکس
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

    // کلیک روی هر جای آیتم، چک‌باکس را تیک می‌زند یا برمی‌دارد
    item.addEventListener('click', (e) => {
      const checkbox = item.querySelector('.user-select-checkbox');
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
      }
    });

    dropdown.appendChild(item);
  });

  // افزودن دکمه «تایید و افزودن تیک‌خورده‌ها» به انتهای دراپ‌دان
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

    // اضافه کردن کاربران جدید به سطر جدید
    if (currentText === '') {
      listInput.value = selectedUsers.join('\n');
    } else {
      listInput.value = currentText + '\n' + selectedUsers.join('\n');
    }

    // ذخیره خودکار تغییرات در استورج
    chrome.storage.local.set({ savedList: listInput.value });

    // ریست فیلد جستجو و بستن دراپ‌دان
    document.getElementById('searchInput').value = '';
    dropdown.style.display = 'none';
  });

  dropdown.appendChild(addBtn);
  dropdown.style.display = 'block';
}

// بستن کشو در صورت کلیک به بیرون
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

// ارسال دیتای نهایی به توییتر جهت شروع عملیات بلاک
document.getElementById('startBtn').addEventListener('click', async () => {
  const text = document.getElementById('listInput').value;
  const delayVal = document.getElementById('delayInput').value || "7";

  if (!text.trim()) {
    alert(translations[currentLang].alertEmptyList);
    return;
  }

  chrome.storage.local.set({ savedList: text, savedDelay: delayVal });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || (!tab.url.includes("x.com") && !tab.url.includes("twitter.com"))) {
    alert(translations[currentLang].alertWrongTab);
    return;
  }

  const delayMs = parseInt(delayVal) * 1000;
  const entries = text.split('\n').map(i => i.trim().replace(/^@/, '')).filter(i => i !== '');

  if (entries.length === 0) {
    alert(translations[currentLang].alertEmptyList);
    return;
  }

  chrome.tabs.sendMessage(tab.id, { action: "START_BLOCK_JOB", list: entries, delayMs });
  window.close();
});
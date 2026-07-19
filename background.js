// وظیفه این فایل، باز کردن (یا فوکوس روی) تب داشبورد کامل است -
// این فقط زمانی اتفاق می‌افتد که از دکمه شناور داخل صفحه توییتر کلیک شود.
// نکته: کلیک روی آیکون خود افزونه در نوار ابزار مرورگر دیگر اینجا مدیریت نمی‌شود،
// چون در manifest.json یک default_popup تعریف شده و مرورگر به‌جای رویداد onClicked
// همان باکس کوچک (popup.html) را نمایش می‌دهد - یعنی دو رفتار کاملاً جدا از هم:
//   ۱) کلیک روی آیکون افزونه در نوار ابزار → باکس کوچک (popup.html) در همان لحظه
//   ۲) کلیک روی آیکون شناور داخل توییتر → تب کامل داشبورد (dashboard.html)
async function openOrFocusDashboard() {
    const dashboardUrl = chrome.runtime.getURL("dashboard.html");
    const existingTabs = await chrome.tabs.query({ url: dashboardUrl });

    if (existingTabs.length > 0) {
        // اگر داشبورد از قبل باز است، فقط روی همان تب فوکوس کن به‌جای باز کردن تب تکراری
        const tab = existingTabs[0];
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
    } else {
        await chrome.tabs.create({ url: dashboardUrl });
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "OPEN_DASHBOARD") {
        openOrFocusDashboard();
    }
    // اسکریپت‌های content نمی‌توانند مستقیماً chrome.notifications را صدا بزنند،
    // پس این پیام را از content_core.js می‌گیریم و اعلان دسکتاپ را از اینجا نمایش می‌دهیم
    if (request.action === "SHOW_NOTIFICATION") {
        chrome.notifications.create({
            type: "basic",
            iconUrl: chrome.runtime.getURL("icons/icon128.png"),
            title: request.title || "X Mass Blocker",
            message: request.message || ""
        });
    }
});
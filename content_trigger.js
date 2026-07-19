(function() {
    'use strict';

    // بررسی برای جلوگیری از تکرار دکمه
    if (document.getElementById('x-blocker-floating-trigger')) return;

    const btn = document.createElement('div');
    btn.id = 'x-blocker-floating-trigger';
    // آیکون شیک: دایره + قطر اریب (نشانه بلاک) + لوگوی X در وسط - هم‌ست با آیکون افزونه
    btn.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" style="transition: transform 0.2s ease-in-out;">
            <circle cx="256" cy="256" r="235" fill="#111827"/>
            <circle cx="256" cy="256" r="235" fill="none" stroke="#e11d48" stroke-width="22"/>
            <line x1="164" y1="164" x2="348" y2="348" stroke="#ffffff" stroke-width="40" stroke-linecap="round"/>
            <line x1="348" y1="164" x2="164" y2="348" stroke="#ffffff" stroke-width="40" stroke-linecap="round"/>
            <line x1="41" y1="41" x2="471" y2="471" stroke="#ffffff" stroke-width="50" stroke-linecap="round"/>
            <line x1="41" y1="41" x2="471" y2="471" stroke="#e11d48" stroke-width="34" stroke-linecap="round"/>
        </svg>
    `;
    btn.title = 'باز کردن داشبورد بلاک دسته‌جمعی';
    
    // استایل دکمه شناور در سمت راست وسط صفحه (پس‌زمینه شفاف؛ خود آیکون کل ظاهر را تعریف می‌کند)
    btn.style = `
        position: fixed;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        z-index: 999999;
        background-color: transparent;
        width: 45px;
        height: 45px;
        border-radius: 8px 0 0 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(-2px 2px 6px rgba(0,0,0,0.35));
        transition: all 0.2s ease-in-out;
    `;

    // هاور افکت شیک
    btn.addEventListener('mouseenter', () => {
        btn.style.width = '55px';
        btn.querySelector('svg').style.transform = 'scale(1.15)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.width = '45px';
        btn.querySelector('svg').style.transform = 'scale(1)';
    });

    // با کلیک، به بک‌گراند پیام می‌دهد که داشبورد را در تب جدید باز کند
    btn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "OPEN_DASHBOARD" });
    });

    document.body.appendChild(btn);

    // پیام «شروع عملیات بلاک» از داشبورد یا پاپ‌آپ کوچک - منطق واقعی در content_core.js است
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "START_BLOCK_JOB" && window.XBlockerCore) {
            window.XBlockerCore.startJob({ list: request.list, delayMs: request.delayMs });
        }
        if (request.action === "PREVIEW_BLOCK_LIST" && window.XBlockerCore) {
            window.XBlockerCore.previewList(request.list).then(sendResponse);
            return true; // پاسخ به‌صورت async ارسال می‌شود
        }
    });

    // در هر بار لود شدن صفحه (مثلاً بعد از رفرش)، بررسی کن که آیا عملیات نیمه‌تمامی وجود دارد یا نه
    if (window.XBlockerCore) {
        window.XBlockerCore.checkForResumableJob();
    }
})();
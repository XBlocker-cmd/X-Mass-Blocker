// ===================================================================
// content_core.js
// این فایل همراه content_trigger.js روی هر صفحه‌ی X/توییتر تزریق می‌شود
// و تمام منطق مشترکِ «عملیات بلاک دسته‌جمعی» را نگه می‌دارد: تحلیل لیست
// (حذف افراد قبلاً بلاک‌شده و تشخیص آشناها)، اعمال لیست استثنا، اجرای
// خود عملیات بلاک، پنل/گزارش روی صفحه، و منطق ازسرگیری بعد از رفرش.
// چون در همان content_scripts entry کنار content_trigger.js لود می‌شود،
// هر دو یک scope مشترک دارند و از طریق window.XBlockerCore به هم وصل‌اند.
// ===================================================================
(function () {
    'use strict';

    if (window.XBlockerCore) return; // جلوگیری از تزریق دوباره

    const BEARER = "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
    const JOB_STORAGE_KEY = 'activeBlockJob';
    const SETTINGS_KEY = 'extensionSettings';

    const DEFAULT_SETTINGS = {
        theme: 'light',
        resumeBehavior: 'ask', // 'ask' | 'auto' | 'never'
        whitelist: [],
        notifyOnComplete: true,
        notifyFollowRelation: true
    };

    const T = {
        fa: {
            panelTitle: "عملیات بلاک دسته‌جمعی",
            checkingStatus: "در حال بررسی وضعیت اکانت‌ها (جلوگیری از بلاک تکراری)...",
            blockingStatus: (u, i, n) => `در حال بلاک کردن: ${u} (${i}/${n})`,
            successToast: (u) => `کاربر <b>${u}</b> با موفقیت بلاک شد.`,
            rateLimitStatus: "⚠️ لیمیت شدید! عملیات متوقف شد.",
            noCsrfStatus: "خطا: توکن امنیتی یافت نشد! لطفاً لاگین کنید.",
            doneTitle: "✓ عملیات پایان یافت",
            reportHeading: "گزارش نهایی عملیات",
            reportTotal: (n) => `تعداد کل ورودی: ${n}`,
            reportWhitelisted: (n) => `به دلیل لیست استثنا رد شدند: ${n}`,
            reportFollowExcluded: (n) => `آشنا بودند و بلاک نشدند: ${n}`,
            reportSkipped: (n) => `از قبل بلاک بودند (رد شدند): ${n}`,
            reportBlocked: (n) => `با موفقیت بلاک شدند: ${n}`,
            reportFailed: (n) => `ناموفق: ${n}`,
            notifTitle: "عملیات بلاک دسته‌جمعی تمام شد",
            notifBody: (blocked, total) => `${blocked} از ${total} اکانت با موفقیت بلاک شد.`,
            followModalTitle: "⚠️ برخی از این افراد را دنبال می‌کنید یا دنبالتان می‌کنند",
            followModalDesc: "این‌ها را با احتیاط انتخاب کنید؛ فقط تیک‌خورده‌ها بلاک خواهند شد.",
            followModalConfirm: "تایید و ادامه عملیات",
            followModalCancelAll: "هیچ‌کدام بلاک نشود",
            followRelBoth: "دنبال می‌کنید و دنبالتان می‌کند",
            followRelFollowing: "شما دنبالش می‌کنید",
            followRelFollower: "دنبالتان می‌کند",
            resumeModalTitle: "یک عملیات بلاک نیمه‌تمام پیدا شد",
            resumeModalDesc: (done, total) => `${done} از ${total} مورد قبلاً پردازش شده. می‌خواهید ادامه دهید؟`,
            resumeModalYes: "بله، ادامه بده",
            resumeModalNo: "نه، رها کن",
            cancelBtn: "لغو"
        },
        en: {
            panelTitle: "Mass Block Operation",
            checkingStatus: "Checking account status (avoiding duplicate blocks)...",
            blockingStatus: (u, i, n) => `Blocking: ${u} (${i}/${n})`,
            successToast: (u) => `User <b>${u}</b> was successfully blocked.`,
            rateLimitStatus: "⚠️ Rate limited! Operation stopped.",
            noCsrfStatus: "Error: Security token not found! Please log in.",
            doneTitle: "✓ Operation finished",
            reportHeading: "Final report",
            reportTotal: (n) => `Total submitted: ${n}`,
            reportWhitelisted: (n) => `Skipped (in whitelist): ${n}`,
            reportFollowExcluded: (n) => `Known contacts, not blocked: ${n}`,
            reportSkipped: (n) => `Already blocked (skipped): ${n}`,
            reportBlocked: (n) => `Successfully blocked: ${n}`,
            reportFailed: (n) => `Failed: ${n}`,
            notifTitle: "Mass block operation finished",
            notifBody: (blocked, total) => `${blocked} of ${total} accounts were successfully blocked.`,
            followModalTitle: "⚠️ Some of these people follow you or you follow them",
            followModalDesc: "Choose carefully; only checked accounts will be blocked.",
            followModalConfirm: "Confirm and continue",
            followModalCancelAll: "Don't block any of them",
            followRelBoth: "You follow each other",
            followRelFollowing: "You follow them",
            followRelFollower: "They follow you",
            resumeModalTitle: "An unfinished block operation was found",
            resumeModalDesc: (done, total) => `${done} of ${total} items already processed. Do you want to continue?`,
            resumeModalYes: "Yes, continue",
            resumeModalNo: "No, discard",
            cancelBtn: "Cancel"
        }
    };

    // ---------- تنظیمات و زبان ----------
    function getSettings() {
        return new Promise((resolve) => {
            chrome.storage.local.get([SETTINGS_KEY], (res) => {
                resolve(Object.assign({}, DEFAULT_SETTINGS, res[SETTINGS_KEY] || {}));
            });
        });
    }

    function getUiLang() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['uiLang'], (res) => resolve(res.uiLang === 'en' ? 'en' : 'fa'));
        });
    }

    function getCsrfToken() {
        const cookies = document.cookie.split('; ');
        const csrfToken = cookies.find(row => row.startsWith('ct0='));
        return csrfToken ? csrfToken.split('=')[1] : null;
    }

    // ---------- استایل و ظاهر (روشن/تیره) ----------
    function ensureStyles(theme) {
        const styleId = 'x-blocker-styles';
        let style = document.getElementById(styleId);
        if (style) style.remove();

        const isDark = theme === 'dark';
        const bg = isDark ? '#1f2937' : '#ffffff';
        const text = isDark ? '#f3f4f6' : '#111827';
        const subText = isDark ? '#d1d5db' : '#4b5563';
        const border = isDark ? '#374151' : '#e5e7eb';
        const overlayBg = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(17,24,39,0.5)';

        style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @font-face {
                font-family: 'B Koodak';
                src: local('B Koodak'), local('BKoodak');
            }
            #x-blocker-panel {
                position: fixed;
                bottom: 20px;
                left: 20px;
                z-index: 9999999;
                background: ${bg};
                border: 2px solid #e11d48;
                border-radius: 12px;
                padding: 15px;
                width: 280px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.25);
                font-family: 'B Koodak', 'Tahoma', sans-serif;
                color: ${text};
            }
            #x-blocker-panel h4 {
                margin: 0 0 10px 0;
                color: ${text};
                font-size: 16px;
                border-bottom: 1px solid ${border};
                padding-bottom: 5px;
            }
            #x-blocker-panel .status-text {
                font-size: 14px;
                color: ${subText};
                margin-bottom: 10px;
            }
            #x-blocker-panel .progress-bar {
                height: 6px;
                background: ${border};
                border-radius: 3px;
                overflow: hidden;
            }
            #x-blocker-panel .progress-fill {
                height: 100%;
                background: #e11d48;
                width: 0%;
                transition: width 0.3s;
            }
            #x-blocker-panel .report-box {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid ${border};
                font-size: 12px;
                color: ${subText};
            }
            #x-blocker-panel .report-box div { margin-bottom: 4px; }

            .block-toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .block-toast {
                background-color: #10b981;
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-family: 'B Koodak', 'Tahoma', sans-serif;
                font-size: 15px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                transform: translateX(120%);
                transition: transform 0.3s ease-in-out;
            }
            .block-toast.show { transform: translateX(0); }

            .x-blocker-modal-overlay {
                position: fixed;
                inset: 0;
                background: ${overlayBg};
                z-index: 99999999;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .x-blocker-modal {
                background: ${bg};
                color: ${text};
                border-radius: 12px;
                padding: 20px;
                width: 420px;
                max-width: 90vw;
                max-height: 80vh;
                overflow-y: auto;
                font-family: 'B Koodak', 'Tahoma', sans-serif;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            .x-blocker-modal h4 {
                margin: 0 0 8px 0;
                font-size: 16px;
            }
            .x-blocker-modal .modal-desc {
                font-size: 13px;
                color: ${subText};
                margin-bottom: 14px;
            }
            .x-blocker-modal .modal-user-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                padding: 8px 0;
                border-bottom: 1px solid ${border};
                font-size: 13px;
            }
            .x-blocker-modal .modal-user-row .u-name { font-weight: bold; }
            .x-blocker-modal .modal-user-row .u-relation { font-size: 11px; color: ${subText}; }
            .x-blocker-modal .modal-btn-row {
                display: flex;
                gap: 10px;
                margin-top: 16px;
            }
            .x-blocker-modal .modal-btn {
                flex: 1;
                padding: 10px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-weight: bold;
                font-size: 13px;
                font-family: inherit;
            }
            .x-blocker-modal .modal-btn.primary { background: #e11d48; color: white; }
            .x-blocker-modal .modal-btn.secondary { background: ${isDark ? '#374151' : '#f3f4f6'}; color: ${text}; }
        `;
        document.head.appendChild(style);
    }

    // ---------- پنل وضعیت روی صفحه ----------
    function ensurePanel(dir) {
        let panel = document.getElementById('x-blocker-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'x-blocker-panel';
            document.body.appendChild(panel);
        }
        panel.style.direction = dir;
        panel.style.textAlign = dir === 'rtl' ? 'right' : 'left';
        return panel;
    }

    function updatePanelUI(t, dir, status, progressPercent) {
        const panel = ensurePanel(dir);
        if (!panel.querySelector('.status-text')) {
            panel.innerHTML = `
                <h4>${t.panelTitle}</h4>
                <div class="status-text"></div>
                <div class="progress-bar"><div class="progress-fill"></div></div>
            `;
        }
        panel.querySelector('.status-text').innerHTML = status;
        panel.querySelector('.progress-fill').style.width = `${progressPercent}%`;
    }

    function showSuccessToast(t, dir, username) {
        let toastContainer = document.querySelector('.block-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'block-toast-container';
            document.body.appendChild(toastContainer);
        }
        const toast = document.createElement('div');
        toast.className = 'block-toast';
        toast.style.direction = dir;
        toast.style.textAlign = dir === 'rtl' ? 'right' : 'left';
        toast.innerHTML = t.successToast(username);
        toastContainer.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function renderFinalReport(t, dir, report) {
        const panel = ensurePanel(dir);
        panel.innerHTML = `<h4 style="color:#10b981;">${t.doneTitle}</h4>
            <div class="status-text">${t.doneTitle}</div>
            <div class="progress-bar"><div class="progress-fill" style="width:100%;"></div></div>`;

        const reportBox = document.createElement('div');
        reportBox.className = 'report-box';
        reportBox.innerHTML = `
            <div><b>${t.reportHeading}</b></div>
            <div>${t.reportTotal(report.total)}</div>
            ${report.whitelisted ? `<div>${t.reportWhitelisted(report.whitelisted)}</div>` : ''}
            ${report.followExcluded ? `<div>${t.reportFollowExcluded(report.followExcluded)}</div>` : ''}
            <div>${t.reportSkipped(report.skipped)}</div>
            <div>${t.reportBlocked(report.blocked)}</div>
            <div>${t.reportFailed(report.failed)}</div>
        `;
        panel.appendChild(reportBox);

        // اعلان دسکتاپ از طریق background (چون content script نمی‌تواند مستقیم آن را نمایش دهد)
        getSettings().then(settings => {
            if (settings.notifyOnComplete) {
                chrome.runtime.sendMessage({
                    action: "SHOW_NOTIFICATION",
                    title: t.notifTitle,
                    message: t.notifBody(report.blocked, report.total)
                });
            }
        });
    }

    // ---------- مودال عمومی ----------
    function showModal(innerHtml) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'x-blocker-modal-overlay';
            overlay.innerHTML = `<div class="x-blocker-modal">${innerHtml}</div>`;
            document.body.appendChild(overlay);
            resolve({
                overlay,
                modal: overlay.querySelector('.x-blocker-modal'),
                close: () => overlay.remove()
            });
        });
    }

    // ---------- لیست استثنا (Whitelist) ----------
    function applyWhitelist(list, whitelist) {
        const whitelistSet = new Set((whitelist || []).map(w => w.trim().toLowerCase()).filter(Boolean));
        if (whitelistSet.size === 0) return { filtered: list, whitelistedCount: 0 };

        const filtered = [];
        let whitelistedCount = 0;
        list.forEach(entry => {
            const key = entry.toLowerCase();
            if (whitelistSet.has(key)) {
                whitelistedCount++;
            } else {
                filtered.push(entry);
            }
        });
        return { filtered, whitelistedCount };
    }

    // ---------- تحلیل لیست: قبلاً بلاک‌شده + آشنایان (دنبال‌کننده/دنبال‌شونده) ----------
    async function analyzeList(list, csrfToken, onProgress) {
        const headers = {
            "Authorization": BEARER,
            "X-Csrf-Token": csrfToken,
            "X-Twitter-Active-User": "yes",
            "X-Twitter-Auth-Type": "OAuth2Session",
            "X-Twitter-Client-Language": "en"
        };

        const infoByKey = new Map(); // key -> { alreadyBlocked, following, followedBy, name, screen_name, id_str }
        const chunkSize = 100;

        for (let i = 0; i < list.length; i += chunkSize) {
            const chunk = list.slice(i, i + chunkSize);
            const numericIds = chunk.filter(x => /^\d+$/.test(x));
            const usernames = chunk.filter(x => !/^\d+$/.test(x));

            const params = new URLSearchParams();
            if (usernames.length) params.set('screen_name', usernames.join(','));
            if (numericIds.length) params.set('user_id', numericIds.join(','));

            try {
                const res = await fetch(`https://x.com/i/api/1.1/friendships/lookup.json?${params.toString()}`, { method: "GET", headers });
                if (res.ok) {
                    const data = await res.json();
                    (Array.isArray(data) ? data : []).forEach(u => {
                        const connections = Array.isArray(u.connections) ? u.connections : [];
                        const entry = {
                            alreadyBlocked: connections.includes('blocking'),
                            following: connections.includes('following'),
                            followedBy: connections.includes('followed_by'),
                            name: u.name,
                            screen_name: u.screen_name,
                            id_str: u.id_str
                        };
                        if (u.screen_name) infoByKey.set(u.screen_name.toLowerCase(), entry);
                        if (u.id_str) infoByKey.set(u.id_str, entry);
                    });
                }
            } catch (err) {
                console.warn('[Mass Blocker] analyze chunk failed:', err);
            }

            if (onProgress) onProgress(Math.min(i + chunkSize, list.length), list.length);
            if (i + chunkSize < list.length) await new Promise(r => setTimeout(r, 300));
        }

        const toBlock = [];
        const followFlagged = [];
        let skippedCount = 0;

        list.forEach(entry => {
            const key = /^\d+$/.test(entry) ? entry : entry.toLowerCase();
            const info = infoByKey.get(key);
            if (info && info.alreadyBlocked) {
                skippedCount++;
                return;
            }
            if (info && (info.following || info.followedBy)) {
                followFlagged.push({
                    identifier: entry,
                    name: info.name || entry,
                    screen_name: info.screen_name || entry,
                    relation: info.following && info.followedBy ? 'both' : (info.following ? 'following' : 'follower')
                });
                return;
            }
            toBlock.push(entry);
        });

        return { toBlock, followFlagged, skippedCount };
    }

    // ---------- مودال هشدار آشنایان ----------
    async function confirmFollowRelationModal(t, followFlagged) {
        const relationLabel = (rel) => rel === 'both' ? t.followRelBoth : (rel === 'following' ? t.followRelFollowing : t.followRelFollower);

        const rowsHtml = followFlagged.map((u, idx) => `
            <div class="modal-user-row">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" class="x-blocker-follow-checkbox" data-idx="${idx}" />
                    <span class="u-name">${u.name} <span style="font-weight:normal;">(@${u.screen_name})</span></span>
                </label>
                <span class="u-relation">${relationLabel(u.relation)}</span>
            </div>
        `).join('');

        const { overlay, modal, close } = await showModal(`
            <h4>${t.followModalTitle}</h4>
            <div class="modal-desc">${t.followModalDesc}</div>
            <div class="modal-user-list">${rowsHtml}</div>
            <div class="modal-btn-row">
                <button class="modal-btn secondary" id="x-blocker-modal-cancel-all">${t.followModalCancelAll}</button>
                <button class="modal-btn primary" id="x-blocker-modal-confirm">${t.followModalConfirm}</button>
            </div>
        `);

        return new Promise((resolve) => {
            modal.querySelector('#x-blocker-modal-confirm').addEventListener('click', () => {
                const checked = Array.from(modal.querySelectorAll('.x-blocker-follow-checkbox:checked')).map(cb => parseInt(cb.getAttribute('data-idx'), 10));
                const confirmed = checked.map(idx => followFlagged[idx].identifier);
                close();
                resolve(confirmed);
            });
            modal.querySelector('#x-blocker-modal-cancel-all').addEventListener('click', () => {
                close();
                resolve([]);
            });
        });
    }

    // ---------- مودال ازسرگیری ----------
    async function confirmResumeModal(t, done, total) {
        const { modal, close } = await showModal(`
            <h4>${t.resumeModalTitle}</h4>
            <div class="modal-desc">${t.resumeModalDesc(done, total)}</div>
            <div class="modal-btn-row">
                <button class="modal-btn secondary" id="x-blocker-resume-no">${t.resumeModalNo}</button>
                <button class="modal-btn primary" id="x-blocker-resume-yes">${t.resumeModalYes}</button>
            </div>
        `);
        return new Promise((resolve) => {
            modal.querySelector('#x-blocker-resume-yes').addEventListener('click', () => { close(); resolve(true); });
            modal.querySelector('#x-blocker-resume-no').addEventListener('click', () => { close(); resolve(false); });
        });
    }

    // ---------- ذخیره/بارگذاری وضعیت جاب (برای ازسرگیری بعد از رفرش) ----------
    function persistJob(job) {
        chrome.storage.local.set({ [JOB_STORAGE_KEY]: job });
    }
    function clearJob() {
        chrome.storage.local.remove([JOB_STORAGE_KEY]);
    }
    function loadJob() {
        return new Promise((resolve) => {
            chrome.storage.local.get([JOB_STORAGE_KEY], (res) => resolve(res[JOB_STORAGE_KEY] || null));
        });
    }

    // ---------- حلقه‌ی اصلی بلاک ----------
    function executeBlockLoop(t, dir, workingList, delayMs, report, startIndex) {
        let currentIndex = startIndex || 0;

        function step() {
            if (currentIndex >= workingList.length) {
                clearJob();
                renderFinalReport(t, dir, report);
                return;
            }

            const username = workingList[currentIndex];
            const progressPercent = (currentIndex / workingList.length) * 100;
            updatePanelUI(t, dir, t.blockingStatus(username, currentIndex + 1, workingList.length), progressPercent);

            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                updatePanelUI(t, dir, t.noCsrfStatus, progressPercent);
                return;
            }

            const isNumeric = /^\d+$/.test(username);
            const postData = isNumeric ? `user_id=${username}` : `screen_name=${encodeURIComponent(username)}`;

            fetch("https://x.com/i/api/1.1/blocks/create.json", {
                method: "POST",
                headers: {
                    "Authorization": BEARER,
                    "X-Csrf-Token": csrfToken,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: postData
            })
            .then(res => {
                if (res.status === 200) {
                    report.blocked++;
                    showSuccessToast(t, dir, username);
                } else if (res.status === 429) {
                    updatePanelUI(t, dir, t.rateLimitStatus, progressPercent);
                    persistJob({ workingList, delayMs, report, index: currentIndex, status: 'running', lang: t === T.fa ? 'fa' : 'en' });
                    return;
                } else {
                    report.failed++;
                }

                currentIndex++;
                persistJob({ workingList, delayMs, report, index: currentIndex, status: 'running', lang: t === T.fa ? 'fa' : 'en' });
                setTimeout(step, delayMs);
            })
            .catch(() => {
                report.failed++;
                currentIndex++;
                persistJob({ workingList, delayMs, report, index: currentIndex, status: 'running', lang: t === T.fa ? 'fa' : 'en' });
                setTimeout(step, delayMs);
            });
        }

        step();
    }

    // ---------- شروع یک عملیات کاملاً جدید ----------
    async function startJob({ list, delayMs }) {
        const settings = await getSettings();
        const lang = await getUiLang();
        const t = T[lang];
        const dir = lang === 'fa' ? 'rtl' : 'ltr';

        ensureStyles(settings.theme);
        updatePanelUI(t, dir, t.checkingStatus, 0);

        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            updatePanelUI(t, dir, t.noCsrfStatus, 0);
            return;
        }

        const { filtered, whitelistedCount } = applyWhitelist(list, settings.whitelist);

        const report = { total: list.length, whitelisted: whitelistedCount, followExcluded: 0, skipped: 0, blocked: 0, failed: 0 };

        if (filtered.length === 0) {
            renderFinalReport(t, dir, report);
            return;
        }

        const { toBlock, followFlagged, skippedCount } = await analyzeList(filtered, csrfToken, (done, tot) => {
            updatePanelUI(t, dir, t.checkingStatus, (done / tot) * 20);
        });
        report.skipped = skippedCount;

        let finalList = toBlock;

        if (followFlagged.length > 0 && settings.notifyFollowRelation) {
            const confirmedIdentifiers = await confirmFollowRelationModal(t, followFlagged);
            report.followExcluded = followFlagged.length - confirmedIdentifiers.length;
            finalList = toBlock.concat(confirmedIdentifiers);
        } else if (followFlagged.length > 0) {
            // اگر هشدار آشنایان در تنظیمات خاموش باشد، همه‌ی آن‌ها هم مثل بقیه بلاک می‌شوند
            finalList = toBlock.concat(followFlagged.map(u => u.identifier));
        }

        if (finalList.length === 0) {
            renderFinalReport(t, dir, report);
            return;
        }

        persistJob({ workingList: finalList, delayMs, report, index: 0, status: 'running', lang });
        executeBlockLoop(t, dir, finalList, delayMs, report, 0);
    }

    // ---------- بررسی وجود یک عملیات نیمه‌تمام (هنگام هر بار لود شدن صفحه) ----------
    async function checkForResumableJob() {
        const job = await loadJob();
        if (!job || job.status !== 'running') return;
        if (job.index >= job.workingList.length) { clearJob(); return; }

        const settings = await getSettings();
        const lang = job.lang === 'en' ? 'en' : 'fa';
        const t = T[lang];
        const dir = lang === 'fa' ? 'rtl' : 'ltr';

        if (settings.resumeBehavior === 'never') {
            clearJob();
            return;
        }

        ensureStyles(settings.theme);

        if (settings.resumeBehavior === 'auto') {
            executeBlockLoop(t, dir, job.workingList, job.delayMs, job.report, job.index);
            return;
        }

        // پیش‌فرض: 'ask'
        const wantsToResume = await confirmResumeModal(t, job.index, job.workingList.length);
        if (wantsToResume) {
            executeBlockLoop(t, dir, job.workingList, job.delayMs, job.report, job.index);
        } else {
            clearJob();
        }
    }

    // ---------- پیش‌نمایش (dry-run): فقط شمارش، بدون بلاک واقعی ----------
    async function previewList(list) {
        const settings = await getSettings();
        const csrfToken = getCsrfToken();
        if (!csrfToken) return { error: "NO_CSRF" };

        const { filtered, whitelistedCount } = applyWhitelist(list, settings.whitelist);
        if (filtered.length === 0) {
            return { total: list.length, whitelisted: whitelistedCount, alreadyBlocked: 0, followFlagged: 0, willBlock: 0 };
        }

        const { toBlock, followFlagged, skippedCount } = await analyzeList(filtered, csrfToken);
        return {
            total: list.length,
            whitelisted: whitelistedCount,
            alreadyBlocked: skippedCount,
            followFlagged: followFlagged.length,
            willBlock: toBlock.length + followFlagged.length
        };
    }

    window.XBlockerCore = {
        startJob,
        checkForResumableJob,
        previewList
    };
})();

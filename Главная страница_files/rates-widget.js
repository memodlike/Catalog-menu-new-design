const isStaticMode = window.location.protocol === 'file:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

(() => {
    async function renderRates() {
        //const header = document.querySelector('.app-header');
        //if (header && header.offsetWidth <= 500) return;

        const el = document.getElementById('ratesWidget');
        if (!el) return;

        const ratesWidgetMobile = document.getElementById('ratesWidgetMobile');
        

        const endpoint = el.dataset.endpoint || '/home/rateswidget';
        if (isStaticMode) {
            return;
        }

        try {
            const res = await fetch(endpoint, { cache: 'no-store' });
            const data = await res.json();

            const line = data.map(r => {
                const amount = Number(r.today ?? r.amount ?? 0);
                const diff = Number(r.diff ?? 0);

                const color = diff > 0 ? 'var(--layout-font-color-3)' : diff < 0 ? 'var(--layout-font-color-4)' : 'var(--layout-font-color-1)';

                return `<div><span style="white-space:nowrap;color:var(--layout-font-color-2);font-weight: 500;font-size: 0.875rem;">${r.code}</span><span style="font-size: 0.875rem;white-space:nowrap;color:${color};">&nbsp;${amount.toFixed(2)}</span></div>`;
            }).join('');

            el.innerHTML = `<div style="display:flex; justify-content: center; gap:10px; font-size: small; padding: 0 3rem 0 0;">${line}</div>`;
            if (ratesWidgetMobile) {
                ratesWidgetMobile.innerHTML = `<div style="display:flex; justify-content: space-evenly; font-size: small;margin-top: 8px;">${line}</div>`;
            }
        } catch (e) {
            
        }
    }

    document.addEventListener('DOMContentLoaded', renderRates);
})();
(function () {
    const style = document.createElement("style");
    style.textContent = `
  .confirm-overlay[hidden] { display: none; }
  .confirm-overlay { position: fixed; inset: 0; z-index: 9999; }
  .confirm-overlay__backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.35); }
  .confirm-overlay__dialog {
    position: relative; margin: 10vh auto 0; max-width: 420px; width: calc(100% - 32px);
    background: #fff; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,.2);
    overflow: hidden; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  }
  .confirm-overlay__header, .confirm-overlay__footer { padding: 12px 16px; display: flex; align-items: center; justify-content:flex-end; gap:8px; }
  .confirm-overlay__header { border-bottom: 1px solid #eee; justify-content: space-between; }
  .confirm-overlay__body { padding: 16px; }
  .confirm-overlay__close { border: 0; background: transparent; font-size: 22px; line-height: 1; cursor: pointer; }
  .confirm-overlay__btn { border: 1px solid #d0d0d0; background: #f8f8f8; padding: 8px 14px; border-radius: 6px; cursor: pointer; }
  .confirm-overlay__btn + .confirm-overlay__btn { margin-left: 8px; }
  .confirm-overlay__btn--primary { background: #0d6efd; border-color: #0d6efd; color: #fff; }
  `;
    document.head.appendChild(style)

    const overlay = document.createElement("div");
    overlay.id = "confirmOverlay";
    overlay.className = "confirm-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
    <div class="confirm-overlay__backdrop"></div>
    <div class="confirm-overlay__dialog" role="dialog" aria-modal="true">
      <div class="confirm-overlay__header">
        <h5 class="confirm-overlay__title">Подтверждение действия</h5>
        <button type="button" class="confirm-overlay__close" aria-label="Закрыть">×</button>
      </div>
      <div class="confirm-overlay__body">
        <p id="confirmMessage">Вы уверены?</p>
      </div>
      <div class="confirm-overlay__footer">
        <button type="button" class="confirm-overlay__btn" data-action="cancel">Отмена</button>
        <button type="button" class="confirm-overlay__btn confirm-overlay__btn--primary" data-action="ok">Подтвердить</button>
      </div>
    </div>
  `;
    document.body.appendChild(overlay);

    const msgEl = document.getElementById("confirmMessage");
    const btnOk = overlay.querySelector('[data-action="ok"]');
    const btnCancel = overlay.querySelector('[data-action="cancel"]');
    const btnClose = overlay.querySelector('.confirm-overlay__close');

    let pendingBtn = null;

    function openModal(message) {
        msgEl.textContent = message || "Подтвердите действие";
        overlay.hidden = false;
        setTimeout(() => btnOk.focus(), 0);
    }
    function closeModal() {
        overlay.hidden = true;
    }
    function finalize() {
        if (!pendingBtn) return;
        const btn = pendingBtn;
        pendingBtn = null;

        btn.dataset.confirmed = "1";

        const form = btn.closest('form');
        const isSubmitBtn =
            btn.tagName === 'BUTTON' &&
            (btn.type || btn.getAttribute('type') || '').toLowerCase() === 'submit';

        if (form && isSubmitBtn) {
            if (form.requestSubmit) {
                form.requestSubmit(btn);
            } else {
                form.submit();
            }
        } else {
            setTimeout(() => 
                btn.click()
            , 0);
        }

        setTimeout(() => {
            try { if ('disabled' in btn) btn.disabled = true; } catch (_) { }
            btn.setAttribute('aria-busy', 'true');
        }, 0);
    }


    document.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-confirm]");
        if (!btn) return;
        if (btn.dataset.confirmed === "1") return;

        e.preventDefault();
        e.stopPropagation();

        pendingBtn = btn;
        openModal(btn.dataset.confirm);
    }, true);

    btnOk.addEventListener("click", () => { closeModal(); finalize(); });
    btnCancel.addEventListener("click", () => { closeModal(); pendingBtn = null; });
    btnClose.addEventListener("click", () => { closeModal(); pendingBtn = null; });

    overlay.addEventListener("click", e => {
        if (e.target === overlay.querySelector(".confirm-overlay__backdrop")) {
            closeModal(); pendingBtn = null;
        }
    });
    document.addEventListener("keydown", e => {
        if (!overlay.hidden && e.key === "Escape") {
            closeModal(); pendingBtn = null;
        }
    });
})();
document.addEventListener('DOMContentLoaded', function () {

    const bellBtn = document.getElementById('bellBtn');
    const panel = document.getElementById('notificationPanel');
    const list = document.getElementById('notificationList');
    const counter = document.getElementById('bellCounter');
    const MAX_VISIBLE = 3;
    let isExpanded = false;


    if (!bellBtn || !panel || !list || !counter) {
        console.warn('Notification elements not found');
        return;
    }
    loadNotifications();
    bellBtn.addEventListener('click', function (e) {
        e.stopPropagation();

        const isClosing = !panel.classList.contains('hidden');

        panel.classList.toggle('hidden');

        if (isClosing) {
            collapseAllNotifications(); // 👈 УБРАТЬ expanded
        } else {
            loadNotifications();
            collectUnviewedFromHtml();
        }
    });

    panel.addEventListener('click', function (e) {
        e.stopPropagation();
    });

    document.addEventListener('click', function () {
        if (!panel.classList.contains('hidden')) {
            panel.classList.add('hidden');
            collapseAllNotifications();
        }
    });
    function collapseAllNotifications() {
        document.querySelectorAll('.notification-item').forEach(item => {
            const text = item.querySelector('.notification-text');
            const btn = item.querySelector('.more');

            if (text) text.classList.remove('expanded');
            if (btn) btn.textContent = 'Подробнее';
        });
    }
    function loadNotifications() {
        if (isStaticMode) {
            renderNotifications([]);
            return;
        }

        fetch('/Home/GetNotifications')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка загрузки уведомлений');
                }
                return response.json();
            })
            .then(data => renderNotifications(data))
            .catch(err => {
                console.error(err);
            });
    }

    function renderNotifications(data) {
        list.innerHTML = "";
        counter.innerText = data.length - data.filter(n => n.isViewed === true).length;
        const hasCritical = data.some(n => n.isCritical === true);

        if (hasCritical) {
            bellBtn.classList.add('bell-critical');
        } else {
            bellBtn.classList.remove('bell-critical');
        }
        list.innerHTML = "";
        counter.innerText = data.length - data.filter(n => n.isViewed === true).length;
        if ((data.length - data.filter(n => n.isViewed === true).length) == 0) {
            counter.style.display = 'none';
        }
        if (data.length == 0) {
            counter.style.display = 'none';
            panel.style.display = 'none';
        }
        let visibleData = (isExpanded ? data : data.slice(0, MAX_VISIBLE))
            .slice()
            .sort((a, b) => a.rowNum - b.rowNum);
        visibleData.forEach(n => {
            const item = document.createElement('div');
            item.className = "notification-item";
            item.dataset.id = n.id;
            item.dataset.isViewed = n.isViewed;

            if (n.isCritical) {
                item.classList.add('critical');
            }

            item.innerHTML = `
<div class="notification-row">
    <div class="notification-mark ${n.isCritical ? 'critical' : 'normal'}">!</div>

    <div class="notification-content">
        <div class="notification-header">
            <div class="notification-title">${n.title}</div>
            <div class="notification-date">
                <div class="date">${formatDate(n.createdAt)}</div>
                <div class="time">${formatTime(n.createdAt)}</div>
            </div>
        </div>

        <div class="notification-text">${n.text}</div>

        <div class="notification-actions">
            <a href="#" class="more">Подробнее</a>
        </div>
    </div>
</div>
`;

            const textDiv = item.querySelector('.notification-text');
            const moreBtn = item.querySelector('.more');

            item.addEventListener('click', () => {
                if (!n.url) return;

                let url = n.url;

                if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                }

                window.open(url, '_blank');
            });

            moreBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                textDiv.classList.toggle('expanded');
                updateMoreButtonText(moreBtn, textDiv);
            });

            list.appendChild(item);
        });
        if (data.length > MAX_VISIBLE) {
            const toggleBtn = document.createElement('div');
            toggleBtn.className = 'notification-toggle';
            toggleBtn.innerText = isExpanded ? 'Скрыть' : 'Показать все';

            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                isExpanded = !isExpanded;
                renderNotifications(data);
            });

            list.appendChild(toggleBtn);
        }
    }
    function updateMoreButtonText(btn, textDiv) {
        btn.textContent = textDiv.classList.contains('expanded')
            ? 'Скрыть'
            : 'Подробнее';
    }
    function collectUnviewedFromHtml() {
        const items = document.querySelectorAll('.notification-item');
        const unviewedIds = [];

        items.forEach(item => {
            if (item.dataset.isViewed === 'false') {
                unviewedIds.push(parseInt(item.dataset.id));
            }
        });

        if (unviewedIds.length === 0 || isStaticMode) return;

        fetch('/Home/MarkNotificationsAsViewed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(unviewedIds)
        });
    }

});
const bellBtn = document.getElementById('bellBtn');
const bellIcon = bellBtn.querySelector('.bell-icon');

bellBtn.addEventListener('click', () => {
    bellIcon.classList.remove('bell-bounce');

    void bellIcon.offsetWidth;

    bellIcon.classList.add('bell-bounce');
});
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
}
//const STORAGE_KEY = 'app-component-color';

//function setAppComponentColorById(id) {
//    const el = document.getElementById(id);
//    if (!el) return;

//    const color = getComputedStyle(el).backgroundColor;

//    document.documentElement.style.setProperty('--app-component-color', color);
//    document.documentElement.style.setProperty('--bs-body-color', color);
//    document.documentElement.style.setProperty('--app-sidebar-menu-link-color', color);
//    document.documentElement.style.setProperty('--app-header-color', color);
//    localStorage.setItem(STORAGE_KEY, color);
//}

//document.addEventListener('DOMContentLoaded', () => {
//    const savedColor = localStorage.getItem(STORAGE_KEY);
//    if (savedColor) {
//        document.documentElement.style.setProperty('--app-component-color', savedColor);
//        document.documentElement.style.setProperty('--bs-body-color', savedColor);
//        document.documentElement.style.setProperty('--app-sidebar-menu-link-color', savedColor);
//        document.documentElement.style.setProperty('--app-header-color', savedColor);
//    }
//});
//document.querySelectorAll('.colors-menu-item').forEach(item => {
//    item.addEventListener('click', () => {
//        setAppComponentColorById(item.id);
//    });
//});
const colorClasses = [
    'color-blue',
    'color-green',
    'color-orange',
    'color-red',
    'color-purple',
    'color-pink',
    'color-teal',
    'color-indigo',
    'color-amber'
];
const savedColor = localStorage.getItem('fontColor');
if (savedColor) {
    document.body.classList.add(savedColor);
}
document.querySelectorAll('.colors-menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const color = item.dataset.color;

        document.body.classList.remove(...colorClasses);

        if (color !== 'default') {
            document.body.classList.add(`color-${color}`);
            localStorage.setItem('fontColor', `color-${color}`);
        }
        else {
            localStorage.removeItem('fontColor');
        }
    });
});
    const modal = document.getElementById('photoModal');
    const openBtn = document.getElementById('openModal');
    const uploadBtn = document.getElementById('uploadPhoto');
    const fileInput = document.getElementById('photoInput');

openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
});


modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

uploadBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) {
        getNewTost('Выберите файл','warning');
    return;
    }

    if (isStaticMode) {
        getNewTost('Загрузка фото недоступна в статическом режиме', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    fetch('/Home/UploadPhoto', {
        method: 'POST',
    body: formData
    })
    .then(res => res.json())
        .then(data => {
            getNewTost(data.message,'success');
    modal.style.display = 'none';
    })
        .catch(err => getNewTost(err,'error'));
});

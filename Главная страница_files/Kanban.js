
let selectedTaskType = null;
let selectedPriorities = [];
let selectedUsers = new Set();
let selectedDepts = new Set();
const TASKTYPE_ORDER_STORAGE_KEY = 'kanban.tasktype.order.v1';
let draggingTaskTypeButton = null;
const DEFAULT_TASKTYPE_COUNTS = {
    '114': 5,   // ТЗ на разработку
    '411': 2,   // Задачи
    '456': 20,  // Служебная записка
    '460': 6    // Задачи по протоколу
};
const ALERT_TASKTYPE_TYPES = new Set(['114', '460']); // Требует действия

function getKanbanNavbarRoot() {
    return document.getElementById('kanban-navbar');
}

function ensureKanbanNavbarGroups() {
    const navbar = getKanbanNavbarRoot();
    if (!navbar) return null;

    let taskGroup = navbar.querySelector(':scope > .kanban-tasktypes-group');
    if (!taskGroup) {
        taskGroup = document.createElement('div');
        taskGroup.className = 'kanban-tasktypes-group';
        navbar.prepend(taskGroup);
    }

    let filtersGroup = navbar.querySelector(':scope > .kanban-filters-group');
    if (!filtersGroup) {
        filtersGroup = document.createElement('div');
        filtersGroup.className = 'kanban-filters-group';
        navbar.appendChild(filtersGroup);
    }

    // Move direct children into their correct group
    Array.from(navbar.children).forEach(child => {
        if (child === taskGroup || child === filtersGroup) return;
        if (child.matches('.filterbtn[name="tasktype"]')) {
            taskGroup.appendChild(child);
        } else {
            filtersGroup.appendChild(child);
        }
    });

    // Fix misplaced elements inside groups
    Array.from(filtersGroup.querySelectorAll('.filterbtn[name="tasktype"]')).forEach(button => {
        taskGroup.appendChild(button);
    });
    Array.from(taskGroup.children).forEach(child => {
        if (!child.matches('.filterbtn[name="tasktype"]')) {
            filtersGroup.appendChild(child);
        }
    });

    // Remove old inline auto-push from original markup
    filtersGroup.querySelectorAll('.menu-item.dropdown').forEach(item => {
        if (item.style && item.style.marginLeft === 'auto') {
            item.style.marginLeft = '';
        }
    });

    return { navbar, taskGroup, filtersGroup };
}

function getTaskTypeNavbar() {
    const groups = ensureKanbanNavbarGroups();
    return groups ? groups.taskGroup : null;
}

function getTaskTypeButtons() {
    const taskGroup = getTaskTypeNavbar();
    if (!taskGroup) return [];
    return Array.from(taskGroup.querySelectorAll('.filterbtn[name="tasktype"]'));
}

function getTaskTypeCounts() {
    if (window && window.KANBAN_TASKTYPE_COUNTS && typeof window.KANBAN_TASKTYPE_COUNTS === 'object') {
        return Object.assign({}, DEFAULT_TASKTYPE_COUNTS, window.KANBAN_TASKTYPE_COUNTS);
    }
    return DEFAULT_TASKTYPE_COUNTS;
}

function applyTaskTypeCounters() {
    const counts = getTaskTypeCounts();
    getTaskTypeButtons().forEach(button => {
        const taskType = String(button.dataset.val || '');
        const count = Number(counts[taskType] ?? 0);
        const isAlertType = ALERT_TASKTYPE_TYPES.has(taskType);
        button.classList.toggle('tasktype-counter-alert', isAlertType);
        if (count > 0) {
            button.dataset.taskCount = String(count);
            button.classList.add('tasktype-with-counter');
            button.classList.remove('tasktype-counter-empty');
            button.setAttribute('aria-label', `${button.textContent.trim()}: ${count}`);
        } else {
            button.removeAttribute('data-task-count');
            button.classList.remove('tasktype-with-counter');
            button.classList.add('tasktype-counter-empty');
        }
    });
}

function parseKanbanDate(value) {
    if (!value) return null;
    const dateText = String(value).trim();
    const match = dateText.match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = 2000 + Number(match[3]);
    const date = new Date(year, month, day);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
}

function buildOverdueLabel(daysOverdue) {
    const days = Math.max(1, Number(daysOverdue) || 1);
    return `Просрочено: ${days} дн.`;
}

function decorateKanbanTaskCard(task) {
    if (!task) return { isOverdue: false, columnId: null };

    const column = task.closest('.column');
    const columnId = column ? column.id : null;
    const isCompletedColumn = columnId === 'completed';
    const dateNodes = task.querySelectorAll('.task-dates span:not(.date-line)');
    const startDate = dateNodes[0] ? parseKanbanDate(dateNodes[0].textContent) : null;
    const planDate = dateNodes[1] ? parseKanbanDate(dateNodes[1].textContent) : null;

    task.classList.remove('prolonged', 'action-required');

    if (startDate && planDate) {
        const timelineDays = Math.floor((planDate - startDate) / 86400000);
        if (timelineDays >= 28) {
            task.classList.add('prolonged');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueDays = Math.floor((today - planDate) / 86400000);

        if (!isCompletedColumn && overdueDays > 0) {
            task.classList.add('overdue');
            task.setAttribute('data-overdue-label', buildOverdueLabel(overdueDays));
            return { isOverdue: true, columnId };
        }
    }

    if (task.classList.contains('overdue') && !task.hasAttribute('data-overdue-label')) {
        task.setAttribute('data-overdue-label', 'Просрочено');
        return { isOverdue: !isCompletedColumn, columnId };
    }

    return { isOverdue: false, columnId };
}

function enhanceKanbanBoard() {
    const tasks = document.querySelectorAll('#kanbanContainer .task');
    const actionAssignedColumns = new Set();

    tasks.forEach(task => {
        const { isOverdue, columnId } = decorateKanbanTaskCard(task);
        if (!isOverdue || !columnId || actionAssignedColumns.has(columnId)) return;
        task.classList.add('action-required');
        actionAssignedColumns.add(columnId);
    });
}

function readTaskTypeOrder() {
    try {
        const raw = localStorage.getItem(TASKTYPE_ORDER_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(Boolean).map(String);
    } catch (error) {
        return [];
    }
}

function saveTaskTypeOrder() {
    const buttons = getTaskTypeButtons();
    if (!buttons.length) return;
    const ordered = buttons
        .map(button => String(button.dataset.val || ''))
        .filter(Boolean);
    localStorage.setItem(TASKTYPE_ORDER_STORAGE_KEY, JSON.stringify(ordered));
}

function applySavedTaskTypeOrder() {
    const navbar = getTaskTypeNavbar();
    if (!navbar) return;
    const buttons = getTaskTypeButtons();
    if (!buttons.length) return;

    const savedOrder = readTaskTypeOrder();
    if (!savedOrder.length) return;

    const byVal = new Map();
    buttons.forEach(button => {
        byVal.set(String(button.dataset.val || ''), button);
    });

    savedOrder.forEach(value => {
        const button = byVal.get(value);
        if (!button) return;
        navbar.appendChild(button);
        byVal.delete(value);
    });
}

function captureTaskTypePositions() {
    const positions = new Map();
    getTaskTypeButtons().forEach(button => {
        positions.set(button, button.getBoundingClientRect());
    });
    return positions;
}

function animateTaskTypeButtonsFrom(previousPositions) {
    getTaskTypeButtons().forEach(button => {
        if (button === draggingTaskTypeButton) return;
        const previousRect = previousPositions.get(button);
        if (!previousRect) return;
        const currentRect = button.getBoundingClientRect();
        const deltaX = previousRect.left - currentRect.left;
        const deltaY = previousRect.top - currentRect.top;
        if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return;

        button.style.transition = 'none';
        button.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        button.getBoundingClientRect();
        button.style.transition = 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)';
        button.style.transform = '';

        window.setTimeout(() => {
            if (!button.classList.contains('tasktype-dragging')) {
                button.style.transition = '';
            }
        }, 320);
    });
}

function clearTaskTypeDropMarkers() {
    getTaskTypeButtons().forEach(button => {
        button.classList.remove('tasktype-drop-before', 'tasktype-drop-after', 'tasktype-drop-target');
    });
}

function markTaskTypeDropPosition(targetButton, insertBefore) {
    clearTaskTypeDropMarkers();
    if (!targetButton || !targetButton.classList) return;
    targetButton.classList.add('tasktype-drop-target');
    targetButton.classList.add(insertBefore ? 'tasktype-drop-before' : 'tasktype-drop-after');
}

function moveDraggingTaskTypeButton(targetButton, insertBefore) {
    if (!draggingTaskTypeButton || !targetButton || draggingTaskTypeButton === targetButton) return;
    const parent = targetButton.parentNode;
    if (!parent) return;

    if (insertBefore && targetButton.previousElementSibling === draggingTaskTypeButton) return;
    if (!insertBefore && targetButton.nextElementSibling === draggingTaskTypeButton) return;

    const previousPositions = captureTaskTypePositions();
    if (insertBefore) {
        parent.insertBefore(draggingTaskTypeButton, targetButton);
    } else {
        parent.insertBefore(draggingTaskTypeButton, targetButton.nextSibling);
    }
    animateTaskTypeButtonsFrom(previousPositions);
}

function onTaskTypeDragStart(event) {
    draggingTaskTypeButton = this;
    clearTaskTypeDropMarkers();
    const navbar = getKanbanNavbarRoot();
    const taskGroup = getTaskTypeNavbar();
    if (navbar) navbar.classList.add('tasktype-drag-active');
    if (taskGroup) taskGroup.classList.add('tasktype-drag-zone-active');
    this.classList.add('tasktype-dragging');
    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(this.dataset.val || this.id || ''));
        event.dataTransfer.setDragImage(this, this.offsetWidth / 2, this.offsetHeight / 2);
    }
}

function onTaskTypeDragOver(event) {
    event.preventDefault();
    if (!draggingTaskTypeButton || draggingTaskTypeButton === this) return;
    const rect = this.getBoundingClientRect();
    const insertBefore = event.clientX < (rect.left + rect.width / 2);
    markTaskTypeDropPosition(this, insertBefore);
    moveDraggingTaskTypeButton(this, insertBefore);
}

function onTaskTypeNavbarDragOver(event) {
    event.preventDefault();
    if (!draggingTaskTypeButton) return;
    const taskGroup = getTaskTypeNavbar();
    if (!taskGroup) return;

    const buttons = getTaskTypeButtons().filter(button => button !== draggingTaskTypeButton);
    if (!buttons.length) return;

    const firstButton = buttons[0];
    const lastButton = buttons[buttons.length - 1];
    const x = event.clientX;

    if (x <= firstButton.getBoundingClientRect().left + 10) {
        markTaskTypeDropPosition(firstButton, true);
        moveDraggingTaskTypeButton(firstButton, true);
        return;
    }

    if (x >= lastButton.getBoundingClientRect().right - 10) {
        markTaskTypeDropPosition(lastButton, false);
        moveDraggingTaskTypeButton(lastButton, false);
    }
}

function onTaskTypeDrop(event) {
    event.preventDefault();
    clearTaskTypeDropMarkers();
    saveTaskTypeOrder();
}

function onTaskTypeDragEnd() {
    this.classList.remove('tasktype-dragging');
    clearTaskTypeDropMarkers();
    const navbar = getKanbanNavbarRoot();
    const taskGroup = getTaskTypeNavbar();
    if (navbar) navbar.classList.remove('tasktype-drag-active');
    if (taskGroup) taskGroup.classList.remove('tasktype-drag-zone-active');
    draggingTaskTypeButton = null;
    saveTaskTypeOrder();
}

function initTaskTypeDragAndDrop() {
    const groups = ensureKanbanNavbarGroups();
    applySavedTaskTypeOrder();
    applyTaskTypeCounters();
    const taskGroup = groups ? groups.taskGroup : null;
    if (taskGroup && taskGroup.dataset.dragReady !== '1') {
        taskGroup.dataset.dragReady = '1';
        taskGroup.addEventListener('dragover', onTaskTypeNavbarDragOver);
        taskGroup.addEventListener('dragleave', function (event) {
            if (!event.currentTarget.contains(event.relatedTarget)) {
                clearTaskTypeDropMarkers();
            }
        });
        taskGroup.addEventListener('drop', function () {
            clearTaskTypeDropMarkers();
            saveTaskTypeOrder();
        });
    }

    getTaskTypeButtons().forEach(button => {
        if (button.dataset.dragReady === '1') return;
        button.dataset.dragReady = '1';
        button.setAttribute('draggable', 'true');
        button.classList.add('tasktype-draggable');
        button.addEventListener('dragstart', onTaskTypeDragStart);
        button.addEventListener('dragover', onTaskTypeDragOver);
        button.addEventListener('drop', onTaskTypeDrop);
        button.addEventListener('dragend', onTaskTypeDragEnd);
    });
}

function getInitialTaskTypeButton() {
    const buttons = getTaskTypeButtons();
    if (!buttons.length) return null;

    const savedOrder = readTaskTypeOrder();
    if (savedOrder.length) {
        const firstSavedButton = buttons.find(button => String(button.dataset.val || '') === savedOrder[0]);
        if (firstSavedButton) {
            return firstSavedButton;
        }
    }

    return document.querySelector('[data-val="114"]') || buttons[0];
}

document.addEventListener("DOMContentLoaded", function () {
    initTaskTypeDragAndDrop();
    enhanceKanbanBoard();

    const defaultBtn = getInitialTaskTypeButton();
    if (defaultBtn) {
        selectedTaskType = defaultBtn.dataset.val || "114";
        toggleButton(defaultBtn);
        //updateKanban();
    } else {
        selectedTaskType = "114";
    }
    let searchInput = document.getElementById('searchUser');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            let searchText = this.value.trim().toLowerCase();
            document.querySelectorAll('#userList .list-group-item').forEach(user => {
                user.style.display = user.innerText.toLowerCase().includes(searchText) ? 'flex' : 'none';
            });
        });
    }

    document.querySelectorAll('.filterbtn[name="tasktype"]').forEach(button => {
        button.addEventListener('click', function () {
            selectedTaskType = this.dataset.val;
            updateKanban();
        });
    });

    document.querySelectorAll('.priority-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function (event) {
            event.stopPropagation(); //
            event.preventDefault();
            let priorityValue = this.value;
            if (this.checked) {
                selectedPriorities.push(priorityValue);
            } else {
                selectedPriorities = selectedPriorities.filter(id => id !== priorityValue);
            }
            updateKanban();
            updateSelectedPriorityText();
        });
    });
    function updateSelectedPriorityText() {
        let userButton = document.getElementById('priorityDropdown');
        let count = selectedPriorities.length;

        if (count > 0) {
            userButton.innerHTML = `<i class='fas fa-sort-amount-down' style='color: blue;'></i> 
                                <span style='color: blue;'>Приоритет</span>`;
            userButton.classList.add('selected');
        } else {
            userButton.innerHTML = `<i class='fas fa-sort-amount-down'></i> 
                                <span>Приоритет</span>`;
            userButton.classList.remove('selected');
        }
    }


    //document.querySelectorAll('.user-item').forEach(item => {
    //    item.addEventListener('click', function () {
    //        let userId = this.dataset.userId;
    //        let userList = document.querySelector('.user-list');

    //        if (selectedUsers.has(userId)) {
    //            selectedUsers.delete(userId);
    //        } else {
    //            selectedUsers.add(userId);
    //        }

    //        updateKanban();
    //        updateSelectedUsersText();
    //        highlightSelectedUsers();

    //        let selectedItems = [];
    //        let nonSelectedItems = [];

    //        document.querySelectorAll('.user-item').forEach(item => {
    //            if (selectedUsers.has(item.dataset.userId)) {
    //                selectedItems.push(item);
    //            } else {
    //                nonSelectedItems.push(item);
    //            }
    //        });

    //        userList.innerHTML = '';

    //        selectedItems.forEach(item => userList.appendChild(item));
    //        nonSelectedItems.forEach(item => userList.appendChild(item));
    //    });
    //});
    function initUserListCliks() {
        const userList = document.getElementById('userList');
        if (!userList) return;
        userList.addEventListener('click', (e) => {
            const item = e.target.closest('.user-item')
            if (!item) return;
            const userId = item.dataset.userId;

            if (selectedUsers.has(userId)) {
                selectedUsers.delete(userId);
            } else {
                selectedUsers.add(userId);
            }

            updateKanban();
            updateSelectedUsersText();
            highlightSelectedUsers();

            let selectedItems = [];
            let nonSelectedItems = [];

            document.querySelectorAll('.user-item').forEach(item => {
                if (selectedUsers.has(item.dataset.userId)) {
                    selectedItems.push(item);
                } else {
                    nonSelectedItems.push(item);
                }
            });

            userList.innerHTML = '';

            selectedItems.forEach(item => userList.appendChild(item));
            nonSelectedItems.forEach(item => userList.appendChild(item));

        });
    }
    if (document.readyState == 'loading') {
        document.addEventListener('DOMContentLoaded', initUserListCliks);
    } else {
        initUserListCliks();
    }

    function updateKanban() {
        let userString = Array.from(selectedUsers).join(',');
        let deptString = Array.from(selectedDepts).join(',');
        let priorityString = selectedPriorities.join(',');
        

        let url = `/Home/GetKanban?priority=${encodeURIComponent(priorityString)}&taskType=${selectedTaskType || ''}&users=${encodeURIComponent(userString)}&depts=${encodeURIComponent(deptString)}&_=${new Date().getTime()}`;

        fetch(url)
            .then(response => response.text())
            .then(html => {
                let kanbanContainer = document.getElementById('kanbanContainer');
                if (kanbanContainer) {
                    kanbanContainer.innerHTML = html;
                    executeScripts(kanbanContainer);
                    window.requestAnimationFrame(enhanceKanbanBoard);
                }
            })
    }

    //function handleUserItemClick() {
    //    const userId = this.dataset.userId;
    //    if (selectedUsers.has(userId)) selectedUsers.delete(userId);
    //    else selectedUsers.add(userId);
    //    updateKanban();
    //    updateSelectedUsersText();
    //    highlightSelectedUsers();
    //};

    //function attachUserItemHandlers() {
    //    document.querySelectorAll('#userList .user-item').forEach(li => {
    //        li.onclick = null;
    //        li.addEventListener('click', handleUserItemClick);
    //    });
    //};

    document.querySelectorAll('.filterbtn[name="tasktype"]').forEach(button => {
        button.addEventListener('click', function () {
            selectedTaskType = this.dataset.val;
            updateKanbanUsers();
        });
    });

    function updateKanbanUsers() {
        let DeptString = Array.from(selectedDepts).join(',');

        let url = `/Home/GetKanbanUsers?depts=${encodeURIComponent(DeptString)}&_=${new Date().getTime()}`;
        fetch(url)
            .then(response => response.text())
            .then(html => {
                let userList = document.getElementById('userList');
                if (userList) {
                    userList.innerHTML = html;
                    executeScripts(userList);
                }
            })

    }

    function highlightSelectedDepts() {
        document.querySelectorAll('.dept-item').forEach(item => {
            let deptId = item.dataset.deptId;
            if (selectedDepts.has(deptId)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }



    document.querySelectorAll('.dept-item').forEach(item => {
        item.addEventListener('click', function () {

            const deptId = this.dataset.deptId;
            const deptList = document.querySelector('.dept-list');
            deptList.addEventListener('click', (e) => {
                const item = e.target.closest('.dept-item');

            })
            if (!item || !deptList.contains(item)) return;
            if (selectedDepts.has(deptId)) {
                selectedDepts.delete(deptId);
            } else {
                selectedDepts.add(deptId);
            }
            selectedUsers.clear();
            updateSelectedUsersText();
            updateKanbanUsers();
            updateKanban();
            updateSelectedDeptsText();
            highlightSelectedDepts();

            let selectedItems = [];
            let nonSelectedItems = [];

            document.querySelectorAll('.dept-item').forEach(item => {
                if (selectedDepts.has(item.dataset.deptId)) {
                    selectedItems.push(item);
                } else {
                    nonSelectedItems.push(item);
                }
            });

            deptList.innerHTML = '';

            selectedItems.forEach(item => deptList.appendChild(item));
            nonSelectedItems.forEach(item => deptList.appendChild(item));
        });
    });

    function filterDepts(query) {
        const depts = document.querySelectorAll('#DepartamentList .dropdown-item');
        depts.forEach(dept => {
            const name = dept.innerText.toLowerCase();
            dept.style.display = name.includes(query.toLowerCase()) ? 'block' : 'none';
        });
    }

    function updateSelectedDeptsText() {
        let deptButton = document.getElementById('deptDropdown');
        let count = selectedDepts.size;
        if (count > 0) {
            deptButton.innerHTML = `<i class='fas fa-dept' style='color: blue;'></i> 
                                    <span style='color: blue;'>Выбрано (${count})</span> 
                                    <i class='fas fa-bars' style='color: blue;'></i>`;
            deptButton.classList.add('selected');
        } else {
            deptButton.innerHTML = `<i class='fas fa-dept'></i> 
                                    <span>Выбрать подразделение</span> 
                                    <i class='fas fa-bars'></i>`;
            deptButton.classList.remove('selected');
        }
    }



    let searchDept = document.getElementById('searchDept');
    if (searchDept) {
        searchDept.addEventListener('input', function () {
            let searchText = this.value.trim().toLowerCase();
            document.querySelectorAll('#deptList .list-group-item').forEach(dept => {
                dept.style.display = dept.innerText.toLowerCase().includes(searchText) ? 'flex' : 'none';
            });
        });
    }

    function updateSelectedUsersText() {
        let userButton = document.getElementById('userDropdown');
        let count = selectedUsers.size;
        if (count > 0) {
            userButton.innerHTML = `<i class='fas fa-user' style='color: blue;'></i> 
                                    <span style='color: blue;'>Выбрано (${count})</span> 
                                    <i class='fas fa-bars' style='color: blue;'></i>`;
            userButton.classList.add('selected');
        } else {
            userButton.innerHTML = `<i class='fas fa-user'></i> 
                                    <span>Выбрать пользователя</span> 
                                    <i class='fas fa-bars'></i>`;
            userButton.classList.remove('selected');
        }
    }

    function highlightSelectedUsers() {
        document.querySelectorAll('.user-item').forEach(item => {
            let userId = item.dataset.userId;
            if (selectedUsers.has(userId)) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    function executeScripts(element) {
        element.querySelectorAll("script").forEach(script => {
            let newScript = document.createElement("script");
            if (script.src) {
                newScript.src = script.src;
                document.body.appendChild(newScript);
            } else {
                newScript.textContent = script.textContent;
                document.body.appendChild(newScript);
                document.body.removeChild(newScript);
            }
        });
    }

    // Выделяем уже выбранных пользователей при загрузке
    highlightSelectedUsers();
    highlightSelectedDepts();

    // Убираем линии между пользователями
    document.querySelectorAll('.user-item, .dept-item').forEach(item => {
        item.style.borderBottom = 'none';
    });
});

function toggleButton(button) {
    document.querySelectorAll('.task-button').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });
    button.classList.remove('btn-secondary');
    button.classList.add('btn-primary');
}

document.addEventListener("DOMContentLoaded", function () {
    const tabs = document.querySelectorAll(".nav-tabs .nav-link");

    tabs.forEach(tab => {
        tab.addEventListener("click", function () {
            tabs.forEach(t => t.classList.remove("active")); // Убираем активный класс со всех
            this.classList.add("active"); // Добавляем активный класс нажатой вкладке
        });
    });
});




function filterUsers(query) {
    const users = document.querySelectorAll('#userList .dropdown-item');
    users.forEach(user => {
        const name = user.innerText.toLowerCase();
        user.style.display = name.includes(query.toLowerCase()) ? 'block' : 'none';
    });
}

function CompleteUpdateLocalTable(message, tableid, parentfieldid, pvisfldvalue, dimid, parentlinkid, auxsrc, templatetype) {

    $('.close').click();
    $('.btn-close').click();
    if (message != null && message != "") {
        getNewTost(message);
    }

    if (tableid == 212) {
        InitRequestsTable(212, 10, true);
    }
}

function GoGetLastSearch(tableid) {
    var model = {};
    model.tableid = tableid;
    model.dimid = "0";
    $.ajax({
        url: "/Forms/GetSearchConditions_",
        type: "post",
        data: model,
        timeout: 50000,
        dataType: "text",
        success: function (d, t, x) {

            if (Core_HandleStringExceptionError(d)) {
                var values = d.split(';');
                if (values[0].split('=')[0] == "dimid" && values[0].split('=')[1] > 0) {
                    if ($('[data-name="dimid"]').length > 0) {
                        $('[data-name="dimid"]').val(values[0].split('=')[1]);
                        Scripts_ReloadSearchForm(values[0].split('=')[1]);
                    }
                }
                for (var i = 0; i < values.length; i++) {
                    if ($('#' + values[i].split('=')[0]).length > 0) {
                        if ($('#' + values[i].split('=')[0]).attr('class').indexOf('auxsrc form-control selectP') >= 0) {
                            if (values[i].split('=')[1] != "") {
                                $('#' + values[i].split('=')[0]).val(values[i].split('=')[1]).trigger("change");
                                $('#' + values[i].split('=')[0]).data('val', values[i].split('=')[1]);
                            }
                        }
                        if ($('#' + values[i].split('=')[0]).attr('class').indexOf('lookup_value inp auxsrc') >= 0 && values[i].split('=')[1] != '') {
                            $('#' + values[i].split('=')[0] + '_LOOKUP').val(values[i].split('=')[1]);
                            $('#' + values[i].split('=')[0]).val(values[i].split('=')[1]);
                            $('#' + values[i].split('=')[0]).parent().parent().find(".i-checks[data-name='id']").find("input").trigger('click');
                            var el = $('.f_lookup_' + values[i].split('=')[0].split('_')[1] + '_search');
                            $('#div_' + values[i].split('=')[0]).find('.btn-complete-search').trigger('click');
                            try { $('#' + values[i].split('=')[0]).parent().parent().find('.search_li').trigger('click'); } catch (e) { };

                        } else {
                            $('#' + values[i].split('=')[0]).val(values[i].split('=')[1]);
                        }
                    }
                }

            }
        },
        error: function (a, b, c) {
        }
    });
}

function InitRequestsTable(tableid, searchformid, isvidget) {
    $('.ladda-button-search').ladda('start');
    $('.Records_' + searchformid).load(
        '/Forms/FormSearch_',
        {
            auxsrc: getAuxsrcArraySF(searchformid),
            tableid: tableid,
            dimid: 0,
            searchformid: searchformid,
            mnu: getURLParameter("mnu"),
            last10records: false,
            showAll: true,
            last10added: false,
            ischart: $('.Records_' + searchformid).hasClass('ChartHere'),
            isVidget: isvidget
        },
        function (response, status) {
            CheckResponse(status);
            if (status == 'error') { $('.Records_' + searchformid).replaceWith('<div class="Records_' + searchformid + '">' + response + '</div>'); }
            if ($('.bottomratings').length > 0) {

                $('.bottomratingsUsers').appendTo($('.Records_1').parent());
                $('.bottomratings').appendTo($('.Records_1').parent());
            }

            //Инициализация таблицы без возможностей печати результатов
            InitModals(Core_AfterModalRender);
            InitMyTbl('_dataTable', 2, null, 50);

            //Событие на прокрутку _dataTable, запоминаем позицию в scroll_position
            $('.dvtabcontent').on('scroll', function () {
                $('#scroll_position').val($('.dvtabcontent').scrollLeft());
            });

            $('.dvtabcontent').scrollLeft($('#scroll_position').val());

            // InitDel заменил на InitLocalDel, т.к. это одно и то же, но у InitDel есть параметр, с которым она нигде не вызывается
            //InitDel();
            InitLocalDel("InitPage");
            InitDelAttachment();

            $('.ladda-button-search').ladda('stop');
            $('.ladda-button-search-block').ladda().ladda('stop');

            CORE_InitAddHintArea();
        }

    );

}
function downloadKanbanReport() {
    const userString = Array.from(selectedUsers).join(',');
    let deptString = Array.from(selectedDepts).join(',');
    const priorityString = selectedPriorities.join(',');
    const taskType = selectedTaskType || 0;

    const url = `/Home/GetKanbanTaskReport?priority=${encodeURIComponent(priorityString)}&users=${encodeURIComponent(userString)}&taskType=${taskType}&depts=${encodeURIComponent(deptString)}&_=${Date.now()}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Ошибка при скачивании отчета");
            const disposition = response.headers.get("Content-Disposition");
            const match = disposition && disposition.match(/filename="?([^"]+)"?/);
            const filename = match ? decodeURIComponent(match[1]) : "kanban_report.xlsx";
            return response.blob().then(blob => ({ blob, filename }));
        })
        .then(({ blob, filename }) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            alert("Ошибка при скачивании отчета.");
        });
}

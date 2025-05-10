document.addEventListener('DOMContentLoaded', function() {
    const ADMIN_PASSWORD = "1230";
    const loginScreen = document.getElementById('login-screen');
    const adminPanel = document.getElementById('admin-panel');
    const passwordInput = document.getElementById('admin-password');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Проверка авторизации
    if (localStorage.getItem('admin-authenticated')) {
        showAdminPanel();
    }
    
    // Обработчик входа
    loginBtn.addEventListener('click', function() {
        if (passwordInput.value === ADMIN_PASSWORD) {
            localStorage.setItem('admin-authenticated', 'true');
            showAdminPanel();
        } else {
            loginError.textContent = "Неверный пароль!";
            passwordInput.focus();
        }
    });
    
    passwordInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
    
    // Выход из админки
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('admin-authenticated');
        location.reload();
    });
    
    function showAdminPanel() {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'block';
        loadCitizens();
        loadGoals();
        loadAnnouncements();
        loadBuilds();
        loadSettings();
        initModal();
        initNavigation();
        initSearch();
    }
    
    // Загрузка жителей
    function loadCitizens() {
        const citizens = CityData.getCitizens();
        const tableBody = document.getElementById('citizens-table-body');
        tableBody.innerHTML = '';
        
        citizens.forEach(citizen => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${citizen.username}</td>
                <td>${citizen.role}</td>
                <td>${citizen.job || '—'}</td>
                <td class="status-${citizen.status}">${getStatusText(citizen.status)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${citizen.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${citizen.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editCitizen(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteCitizen(btn.getAttribute('data-id')));
        });
        
        // Обновляем счетчик жителей
        document.getElementById('citizen-count').textContent = citizens.length;
    }
    
    // Загрузка целей
    function loadGoals() {
        const goals = CityData.getGoals();
        const tableBody = document.getElementById('goals-table-body');
        tableBody.innerHTML = '';
        
        // Заполняем select ответственных в форме
        const responsibleSelect = document.getElementById('goal-responsible');
        responsibleSelect.innerHTML = '<option value="">Не назначен</option>';
        
        CityData.getCitizens().forEach(citizen => {
            responsibleSelect.innerHTML += `<option value="${citizen.username}">${citizen.username}</option>`;
        });
        
        goals.forEach(goal => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${goal.title}</td>
                <td>${goal.description || '—'}</td>
                <td>${goal.responsible || '—'}</td>
                <td class="status-${goal.status}">${getStatusText(goal.status)}</td>
                <td>
                    ${goal.status !== 'completed' ? `<button class="action-btn complete-btn" data-id="${goal.id}"><i class="fas fa-check"></i></button>` : ''}
                    <button class="action-btn edit-btn" data-id="${goal.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${goal.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', () => completeGoal(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editGoal(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteGoal(btn.getAttribute('data-id')));
        });
        
        // Обновляем счетчик целей
        const totalGoals = goals.length;
        const completedGoals = goals.filter(g => g.status === 'completed').length;
        document.getElementById('goals-count').textContent = totalGoals;
        document.getElementById('completed-count').textContent = completedGoals;
    }
    
    // Загрузка построек
    function loadBuilds() {
        const builds = CityData.getBuilds();
        const tableBody = document.getElementById('builds-table-body');
        tableBody.innerHTML = '';
        
        builds.forEach(build => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${build.name}</td>
                <td>${getBuildTypeName(build.type)}</td>
                <td>X: ${build.coords.x}, Y: ${build.coords.y}, Z: ${build.coords.z}</td>
                <td>${formatDate(build.completed)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${build.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${build.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editBuild(btn.getAttribute('data-id')));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteBuild(btn.getAttribute('data-id')));
        });
    }
    
    function getBuildTypeName(type) {
        const types = {
            'administrative': 'Административное',
            'commercial': 'Коммерческое',
            'residential': 'Жилое',
            'industrial': 'Промышленное',
            'decorative': 'Декоративное'
        };
        return types[type] || type;
    }
    
    function editBuild(id) {
        const build = CityData.getBuild(id);
        if (!build) return;
        
        const modal = document.getElementById('build-modal');
        document.getElementById('build-modal-title').textContent = 'Редактировать постройку';
        
        document.getElementById('build-id').value = build.id;
        document.getElementById('build-name').value = build.name;
        document.getElementById('build-type').value = build.type;
        document.getElementById('build-x').value = build.coords.x;
        document.getElementById('build-y').value = build.coords.y;
        document.getElementById('build-z').value = build.coords.z;
        document.getElementById('build-date').value = new Date(build.completed).toISOString().split('T')[0];
        
        modal.style.display = 'block';
    }
    
    function deleteBuild(id) {
        if (confirm('Вы уверены, что хотите удалить эту постройку?')) {
            CityData.deleteBuild(id);
            loadBuilds();
        }
    }
    
    // Загрузка объявлений
    function loadAnnouncements() {
        const announcements = CityData.getAnnouncements();
        const tableBody = document.getElementById('announcements-table-body');
        tableBody.innerHTML = '';
        
        announcements.forEach(announcement => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${announcement.title}</td>
                <td>${announcement.text}</td>
                <td>${formatDate(announcement.date)}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${announcement.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${announcement.id}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Загрузка настроек
    function loadSettings() {
        const settings = CityData.getSettings();
        
        document.getElementById('city-name').value = settings.name || '';
        document.getElementById('city-discord').value = settings.discord || '';
        document.getElementById('city-server-ip').value = settings.serverIp || '';
        document.getElementById('city-rules').value = settings.rules || '';
    }
    
    function getStatusText(status) {
        const statuses = {
            'active': 'Активен',
            'inactive': 'Неактивен',
            'banned': 'Забанен',
            'new': 'Не начата',
            'in-progress': 'В процессе',
            'completed': 'Завершена'
        };
        return statuses[status] || status;
    }
    
    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('ru-RU');
    }
    
    // Редактирование жителя
    function editCitizen(id) {
        const citizen = CityData.getCitizen(id);
        if (!citizen) return;
        
        const modal = document.getElementById('citizen-modal');
        document.getElementById('modal-title').textContent = 'Редактировать жителя';
        
        document.getElementById('citizen-id').value = citizen.id;
        document.getElementById('citizen-username').value = citizen.username;
        document.getElementById('citizen-role').value = citizen.role;
        document.getElementById('citizen-job').value = citizen.job || '';
        document.getElementById('citizen-status').value = citizen.status;
        document.getElementById('citizen-notes').value = citizen.notes || '';
        
        modal.style.display = 'block';
    }
    
    // Удаление жителя
    function deleteCitizen(id) {
        if (confirm('Вы уверены, что хотите удалить этого жителя?')) {
            CityData.deleteCitizen(id);
            loadCitizens();
        }
    }
    
    // Завершение цели
    function completeGoal(id) {
        CityData.updateGoalStatus(id, 'completed');
        loadGoals();
    }
    
    // Редактирование цели
    function editGoal(id) {
        const goal = CityData.getGoal(id);
        if (!goal) return;
        
        const modal = document.getElementById('goal-modal');
        document.getElementById('goal-modal-title').textContent = 'Редактировать цель';
        
        document.getElementById('goal-id').value = goal.id;
        document.getElementById('goal-title').value = goal.title;
        document.getElementById('goal-desc').value = goal.description || '';
        document.getElementById('goal-responsible').value = goal.responsible || '';
        document.getElementById('goal-status').value = goal.status;
        
        modal.style.display = 'block';
    }
    
    // Удаление цели
    function deleteGoal(id) {
        if (confirm('Вы уверены, что хотите удалить эту цель?')) {
            CityData.deleteGoal(id);
            loadGoals();
        }
    }
    
    function initModal() {
        // Модалка для жителей
        const citizenModal = document.getElementById('citizen-modal');
        const closeCitizenBtn = document.querySelector('.close-citizen-modal');
        const cancelCitizenBtn = document.getElementById('cancel-citizen-btn');
        const addCitizenBtn = document.getElementById('add-citizen-btn');
        const citizenForm = document.getElementById('citizen-form');
        
        addCitizenBtn.addEventListener('click', () => {
            document.getElementById('modal-title').textContent = 'Добавить нового жителя';
            document.getElementById('citizen-id').value = '';
            citizenForm.reset();
            citizenModal.style.display = 'block';
        });
        
        closeCitizenBtn.addEventListener('click', () => {
            citizenModal.style.display = 'none';
        });
        
        cancelCitizenBtn.addEventListener('click', () => {
            citizenModal.style.display = 'none';
        });
        
        citizenForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const citizenData = {
                id: document.getElementById('citizen-id').value || generateId(),
                username: document.getElementById('citizen-username').value,
                role: document.getElementById('citizen-role').value,
                job: document.getElementById('citizen-job').value || null,
                status: document.getElementById('citizen-status').value,
                notes: document.getElementById('citizen-notes').value
            };
            
            CityData.saveCitizen(citizenData);
            loadCitizens();
            citizenModal.style.display = 'none';
        });
        
        // Модалка для целей
        const goalModal = document.getElementById('goal-modal');
        const closeGoalBtn = document.querySelector('.close-goal-modal');
        const cancelGoalBtn = document.getElementById('cancel-goal-btn');
        const addGoalBtn = document.getElementById('add-goal-btn');
        const goalForm = document.getElementById('goal-form');
        
        addGoalBtn.addEventListener('click', () => {
            document.getElementById('goal-modal-title').textContent = 'Добавить новую цель';
            document.getElementById('goal-id').value = '';
            goalForm.reset();
            goalModal.style.display = 'block';
        });
        
        closeGoalBtn.addEventListener('click', () => {
            goalModal.style.display = 'none';
        });
        
        cancelGoalBtn.addEventListener('click', () => {
            goalModal.style.display = 'none';
        });
        
        goalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const goalData = {
                id: document.getElementById('goal-id').value || generateId(),
                title: document.getElementById('goal-title').value,
                description: document.getElementById('goal-desc').value,
                responsible: document.getElementById('goal-responsible').value || null,
                status: document.getElementById('goal-status').value,
                created: new Date()
            };
            
            CityData.saveGoal(goalData);
            loadGoals();
            goalModal.style.display = 'none';
        });
        
        // Модалка для объявлений
        const announcementModal = document.getElementById('announcement-modal');
        const closeAnnouncementBtn = document.querySelector('.close-announcement-modal');
        const cancelAnnouncementBtn = document.getElementById('cancel-announcement-btn');
        const addAnnouncementBtn = document.getElementById('add-announcement-btn');
        const announcementForm = document.getElementById('announcement-form');
        
        addAnnouncementBtn.addEventListener('click', () => {
            document.getElementById('announcement-modal-title').textContent = 'Добавить новое объявление';
            document.getElementById('announcement-id').value = '';
            announcementForm.reset();
            announcementModal.style.display = 'block';
        });
        
        closeAnnouncementBtn.addEventListener('click', () => {
            announcementModal.style.display = 'none';
        });
        
        cancelAnnouncementBtn.addEventListener('click', () => {
            announcementModal.style.display = 'none';
        });
        
        announcementForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const announcementData = {
                id: document.getElementById('announcement-id').value || generateId(),
                title: document.getElementById('announcement-title').value,
                text: document.getElementById('announcement-text').value,
                date: new Date()
            };
            
            CityData.saveAnnouncement(announcementData);
            loadAnnouncements();
            announcementModal.style.display = 'none';
        });
        
        // Модалка для построек
        const buildModal = document.getElementById('build-modal');
        const closeBuildBtn = document.querySelector('.close-build-modal');
        const cancelBuildBtn = document.getElementById('cancel-build-btn');
        const addBuildBtn = document.getElementById('add-build-btn');
        const buildForm = document.getElementById('build-form');
        
        addBuildBtn.addEventListener('click', () => {
            document.getElementById('build-modal-title').textContent = 'Добавить новую постройку';
            document.getElementById('build-id').value = '';
            buildForm.reset();
            buildModal.style.display = 'block';
        });
        
        closeBuildBtn.addEventListener('click', () => {
            buildModal.style.display = 'none';
        });
        
        cancelBuildBtn.addEventListener('click', () => {
            buildModal.style.display = 'none';
        });
        
        buildForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const buildData = {
                id: document.getElementById('build-id').value || generateId(),
                name: document.getElementById('build-name').value,
                type: document.getElementById('build-type').value,
                coords: {
                    x: parseInt(document.getElementById('build-x').value),
                    y: parseInt(document.getElementById('build-y').value),
                    z: parseInt(document.getElementById('build-z').value)
                },
                completed: new Date(document.getElementById('build-date').value)
            };
            
            CityData.saveBuild(buildData);
            loadBuilds();
            buildModal.style.display = 'none';
        });
        
        // Форма настроек
        document.getElementById('city-settings-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const settings = {
                name: document.getElementById('city-name').value,
                discord: document.getElementById('city-discord').value,
                serverIp: document.getElementById('city-server-ip').value,
                rules: document.getElementById('city-rules').value
            };
            
            CityData.saveSettings(settings);
            alert('Настройки успешно сохранены!');
        });
    }
    
    function initNavigation() {
        const navLinks = document.querySelectorAll('#admin-panel nav ul li a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href');
                
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelectorAll('#admin-panel main section').forEach(s => {
                    s.classList.remove('active-section');
                });
                
                link.classList.add('active');
                document.querySelector(sectionId).classList.add('active-section');
            });
        });
    }
    
    function initSearch() {
        // Поиск по жителям
        document.getElementById('citizen-search').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#citizens-table-body tr');
            
            rows.forEach(row => {
                const username = row.cells[0].textContent.toLowerCase();
                const role = row.cells[1].textContent.toLowerCase();
                const job = row.cells[2].textContent.toLowerCase();
                
                if (username.includes(searchTerm) || role.includes(searchTerm) || job.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
        
        // Поиск по целям
        document.getElementById('goal-search').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#goals-table-body tr');
            
            rows.forEach(row => {
                const title = row.cells[0].textContent.toLowerCase();
                const desc = row.cells[1].textContent.toLowerCase();
                const responsible = row.cells[2].textContent.toLowerCase();
                
                if (title.includes(searchTerm) || desc.includes(searchTerm) || responsible.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
        
        // Поиск по постройкам
        document.getElementById('build-search').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#builds-table-body tr');
            
            rows.forEach(row => {
                const name = row.cells[0].textContent.toLowerCase();
                const type = row.cells[1].textContent.toLowerCase();
                
                if (name.includes(searchTerm) || type.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    function generateId() {
        return 'id-' + Math.random().toString(36).substr(2, 9);
    }
});
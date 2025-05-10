document.addEventListener('DOMContentLoaded', function() {
    // Инициализация темы
    initTheme();
    
    // Инициализация навигации
    initNavigation();
    
    // Загрузка данных
    loadData();
    
    // Обработка формы добавления цели (для пользователей)
    const goalForm = document.getElementById('new-goal-form');
    if (goalForm) {
        goalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const goalData = {
                id: 'goal-' + Date.now(),
                title: document.getElementById('goal-title').value,
                description: document.getElementById('goal-desc').value,
                status: 'new',
                created: new Date()
            };
            
            CityData.saveGoal(goalData);
            renderGoals();
            goalForm.reset();
            alert('Новая цель добавлена! Она появится после проверки администратором.');
        });
    }
});

function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.querySelector('.theme-toggle i');
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

function initNavigation() {
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href');
            
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('main section').forEach(s => {
                s.classList.remove('active-section');
            });
            
            link.classList.add('active');
            document.querySelector(sectionId).classList.add('active-section');
            
            // Прокрутка к секции с учетом фиксированного хедера
            const headerHeight = document.querySelector('header').offsetHeight;
            const navHeight = document.querySelector('nav').offsetHeight;
            const offset = headerHeight + navHeight;
            const element = document.querySelector(sectionId);
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
}

function loadData() {
    renderCitizens();
    renderGoals();
    renderAnnouncements();
    renderStats();
    loadSettings();
}

function renderCitizens() {
    const citizens = CityData.getCitizens();
    const container = document.querySelector('.citizens-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    citizens.forEach(citizen => {
        const card = document.createElement('div');
        card.className = 'citizen-card';
        card.innerHTML = `
            <img src="images/citizens/${citizen.username.toLowerCase()}.png" alt="${citizen.username}" 
                 onerror="this.src='images/citizens/default.png'">
            <h3>${citizen.username}</h3>
            <p class="role">${citizen.role}</p>
            <p class="job">${citizen.job || 'Безработный'}</p>
        `;
        container.appendChild(card);
    });
}

function renderGoals() {
    const goals = CityData.getGoals();
    const container = document.querySelector('.goals-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    goals.forEach(goal => {
        const goalEl = document.createElement('div');
        goalEl.className = `goal ${goal.status}`;
        
        let progressHtml = '';
        if (goal.status === 'in-progress') {
            progressHtml = '<div class="progress">В процессе</div>';
        } else if (goal.status === 'completed') {
            progressHtml = `<div class="completed">Завершено: ${formatDate(goal.completed)}</div>`;
        }
        
        let responsibleHtml = '';
        if (goal.responsible) {
            responsibleHtml = `<div class="responsible">Ответственный: ${goal.responsible}</div>`;
        }
        
        goalEl.innerHTML = `
            <h3>${goal.title}</h3>
            <p>${goal.description || 'Нет описания'}</p>
            ${responsibleHtml}
            ${progressHtml}
        `;
        
        container.appendChild(goalEl);
    });
}

function renderAnnouncements() {
    const announcements = CityData.getAnnouncements().slice(0, 3); // Последние 3 объявления
    const container = document.querySelector('#home');
    if (!container) return;
    
    const newsContainer = container.querySelector('.news-container');
    if (!newsContainer) {
        const newsContainer = document.createElement('div');
        newsContainer.className = 'news-container';
        container.appendChild(newsContainer);
    }
    
    newsContainer.innerHTML = '<h3>Последние новости</h3>';
    
    announcements.forEach(announcement => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item';
        newsItem.innerHTML = `
            <h4>${announcement.title}</h4>
            <p class="date">${formatDate(announcement.date)}</p>
            <p>${announcement.text}</p>
        `;
        newsContainer.appendChild(newsItem);
    });
}

function renderStats() {
    const citizens = CityData.getCitizens();
    const goals = CityData.getGoals();
    const builds = CityData.getBuilds();
    
    document.getElementById('citizen-count').textContent = citizens.length;
    document.getElementById('builds-count').textContent = builds.length;
    document.getElementById('goals-count').textContent = goals.length;
    document.getElementById('completed-count').textContent = 
        goals.filter(g => g.status === 'completed').length;
}

function loadSettings() {
    const settings = CityData.getSettings();
    
    // Обновляем название города в заголовке
    const cityNameElements = document.querySelectorAll('.city-name');
    cityNameElements.forEach(el => {
        el.textContent = settings.name;
    });
    
    // Обновляем правила
    const rulesList = document.querySelector('.rules ol');
    if (rulesList && settings.rules) {
        rulesList.innerHTML = '';
        settings.rules.split('\n').forEach(rule => {
            if (rule.trim()) {
                const li = document.createElement('li');
                li.textContent = rule;
                rulesList.appendChild(li);
            }
        });
    }
    
    // Обновляем Discord ссылку
    const discordLink = document.querySelector('.discord-link');
    if (discordLink && settings.discord) {
        discordLink.href = settings.discord;
        discordLink.textContent = settings.discord.replace('https://', '');
    }
    
    // Обновляем IP сервера
    const serverIpElements = document.querySelectorAll('.server-ip');
    if (serverIpElements.length && settings.serverIp) {
        serverIpElements.forEach(el => {
            el.textContent = settings.serverIp;
        });
    }
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU');
}
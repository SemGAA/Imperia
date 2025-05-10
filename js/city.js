// Основной модуль для работы с городом
const CityApp = (function() {
    // Данные города
    let cityData = {
        name: "Крафтбург",
        citizens: [],
        goals: [],
        announcements: [],
        quests: [],
        events: [],
        resources: {},
        mapPoints: []
    };

    // Инициализация данных
    function init() {
        loadFromLocalStorage();
        renderAll();
        setupEventListeners();
    }

    // Загрузка данных из localStorage
    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('city-data');
        if (savedData) {
            cityData = JSON.parse(savedData);
        } else {
            // Загрузка начальных данных
            loadInitialData();
        }
    }

    // Сохранение данных в localStorage
    function saveToLocalStorage() {
        localStorage.setItem('city-data', JSON.stringify(cityData));
    }

    // Загрузка начальных данных
    function loadInitialData() {
        cityData.goals = [
            {
                id: 'goal-1',
                title: 'Построить ферму пшеницы',
                description: 'Автоматическая ферма для снабжения города едой',
                category: 'building',
                status: 'completed',
                priority: 'high',
                created: new Date(),
                completed: new Date('2023-10-10'),
                participants: ['HelpHelsing', 'Steve']
            },
            {
                id: 'goal-2',
                title: 'Расширить городскую стену',
                description: 'Защита от мобов и нежелательных гостей',
                category: 'building',
                status: 'in-progress',
                progress: 45,
                priority: 'medium',
                created: new Date('2023-09-15'),
                deadline: new Date('2023-12-01'),
                participants: ['Steve', 'Alex']
            }
        ];

        cityData.announcements = [
            {
                id: 'ann-1',
                title: 'Открытие новой фермы',
                text: 'Все жители могут пользоваться новой автоматической фермой пшеницы',
                author: 'HelpHelsing',
                date: new Date('2023-10-15')
            }
        ];

        cityData.quests = [
            {
                id: 'quest-1',
                title: 'Сбор ресурсов для строительства',
                description: 'Собрать 64 блока камня и 32 блока древесины',
                reward: 'Доступ к новому участку',
                status: 'active',
                created: new Date(),
                deadline: new Date('2023-11-15')
            }
        ];

        cityData.mapPoints = [
            {
                id: 'point-1',
                title: 'Главная площадь',
                coords: { x: 35, y: 25 },
                type: 'main',
                description: 'Центральная площадь города'
            }
        ];

        saveToLocalStorage();
    }

    // Рендер всех компонентов
    function renderAll() {
        renderGoals();
        renderAnnouncements();
        renderQuests();
        renderMap();
        initCalendar();
    }

    // Рендер целей
    function renderGoals() {
        const goalsList = document.getElementById('goals-list');
        goalsList.innerHTML = '';

        const filter = document.getElementById('goal-filter').value;
        let goalsToShow = cityData.goals;

        if (filter !== 'all') {
            goalsToShow = cityData.goals.filter(goal => goal.status === filter);
        }

        goalsToShow.forEach(goal => {
            const goalEl = document.createElement('div');
            goalEl.className = `goal ${goal.status}`;
            goalEl.dataset.id = goal.id;
            
            let progressHtml = '';
            if (goal.status === 'in-progress' && goal.progress) {
                progressHtml = `<div class="progress-bar"><div style="width: ${goal.progress}%"></div></div>`;
            }

            let participantsHtml = '';
            if (goal.participants && goal.participants.length > 0) {
                participantsHtml = `<div class="goal-participants"><i class="fas fa-users"></i> ${goal.participants.join(', ')}</div>`;
            }

            goalEl.innerHTML = `
                <div class="goal-header">
                    <h3>${goal.title}</h3>
                    <div class="goal-actions">
                        ${goal.status !== 'completed' ? `<button class="complete-goal-btn" data-id="${goal.id}"><i class="fas fa-check"></i></button>` : ''}
                        <button class="edit-goal-btn" data-id="${goal.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-goal-btn" data-id="${goal.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <p>${goal.description || 'Нет описания'}</p>
                ${progressHtml}
                <div class="goal-footer">
                    <span class="goal-category ${goal.category}">${getCategoryName(goal.category)}</span>
                    <span class="goal-priority ${goal.priority}">${getPriorityName(goal.priority)}</span>
                    ${participantsHtml}
                    ${goal.deadline ? `<span class="goal-deadline"><i class="fas fa-clock"></i> ${formatDate(goal.deadline)}</span>` : ''}
                    ${goal.completed ? `<span class="goal-completed"><i class="fas fa-check-circle"></i> Выполнено: ${formatDate(goal.completed)}</span>` : ''}
                </div>
            `;
            
            goalsList.appendChild(goalEl);
        });

        updateGoalsCount();
    }

    // Рендер объявлений
    function renderAnnouncements() {
        const announcementsList = document.getElementById('announcements-list');
        announcementsList.innerHTML = '';

        cityData.announcements.slice(0, 5).forEach(announcement => {
            const annEl = document.createElement('div');
            annEl.className = 'announcement';
            annEl.innerHTML = `
                <h4>${announcement.title}</h4>
                <p class="announcement-date">${formatDate(announcement.date)} • ${announcement.author}</p>
                <p>${announcement.text}</p>
            `;
            announcementsList.appendChild(annEl);
        });
    }

    // Рендер квестов
    function renderQuests() {
        const questsGrid = document.getElementById('quests-grid');
        questsGrid.innerHTML = '';

        cityData.quests.forEach(quest => {
            const questEl = document.createElement('div');
            questEl.className = `quest-card ${quest.status}`;
            questEl.innerHTML = `
                <div class="quest-header">
                    <h3>${quest.title}</h3>
                    <span class="quest-status">${getQuestStatusName(quest.status)}</span>
                </div>
                <p>${quest.description}</p>
                <div class="quest-reward">
                    <i class="fas fa-award"></i> Награда: ${quest.reward}
                </div>
                <div class="quest-footer">
                    ${quest.deadline ? `<span class="quest-deadline"><i class="fas fa-clock"></i> До ${formatDate(quest.deadline)}</span>` : ''}
                    <button class="take-quest-btn" data-id="${quest.id}">Взять квест</button>
                </div>
            `;
            questsGrid.appendChild(questEl);
        });
    }

    // Инициализация календаря
    function initCalendar() {
        const calendarEl = document.getElementById('city-calendar');
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: cityData.events.map(event => ({
                title: event.title,
                start: event.date,
                description: event.description,
                color: event.color || '#4CAF50'
            })),
            eventClick: function(info) {
                alert(`Событие: ${info.event.title}\n\n${info.event.extendedProps.description || 'Нет описания'}`);
            }
        });
        calendar.render();
    }

    // Рендер карты
    function renderMap() {
        const mapMarkers = document.getElementById('map-markers');
        mapMarkers.innerHTML = '';

        const legendList = document.getElementById('map-legend-list');
        legendList.innerHTML = '';

        const legendItems = {};

        cityData.mapPoints.forEach(point => {
            // Добавляем маркер на карту
            const marker = document.createElement('div');
            marker.className = `map-marker ${point.type}`;
            marker.style.left = `${point.coords.x}%`;
            marker.style.top = `${point.coords.y}%`;
            marker.dataset.id = point.id;
            marker.title = point.title;
            
            const markerInner = document.createElement('div');
            markerInner.className = 'marker-inner';
            markerInner.innerHTML = `<i class="fas ${getPointIcon(point.type)}"></i>`;
            marker.appendChild(markerInner);
            
            mapMarkers.appendChild(marker);

            // Добавляем элемент в легенду, если его еще нет
            if (!legendItems[point.type]) {
                legendItems[point.type] = {
                    icon: getPointIcon(point.type),
                    name: getPointTypeName(point.type)
                };
            }
        });

        // Заполняем легенду
        for (const type in legendItems) {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas ${legendItems[type].icon}"></i> ${legendItems[type].name}`;
            legendList.appendChild(li);
        }
    }

    // Обновление счетчиков целей
    function updateGoalsCount() {
        const total = cityData.goals.length;
        const completed = cityData.goals.filter(g => g.status === 'completed').length;
        
        document.getElementById('goals-count').textContent = total;
        document.getElementById('completed-count').textContent = completed;
    }

    // Установка обработчиков событий
    function setupEventListeners() {
        // Добавление новой цели
        document.getElementById('add-goal-btn').addEventListener('click', () => {
            document.getElementById('goal-modal').classList.remove('hidden');
            document.getElementById('goal-modal-title').textContent = 'Добавить новую цель';
            document.getElementById('goal-form').reset();
            document.getElementById('goal-id').value = '';
        });

        // Фильтрация целей
        document.getElementById('goal-filter').addEventListener('change', renderGoals);

        // Сохранение цели
        document.getElementById('goal-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const goalData = {
                id: document.getElementById('goal-id').value || `goal-${Date.now()}`,
                title: document.getElementById('goal-title-input').value,
                description: document.getElementById('goal-desc-input').value,
                category: document.getElementById('goal-category').value,
                priority: document.getElementById('goal-priority').value,
                status: 'new',
                created: new Date()
            };
            
            const deadline = document.getElementById('goal-deadline').value;
            if (deadline) {
                goalData.deadline = new Date(deadline);
            }
            
            // Обновление или добавление цели
            const existingIndex = cityData.goals.findIndex(g => g.id === goalData.id);
            if (existingIndex >= 0) {
                // Сохраняем статус и участников при редактировании
                goalData.status = cityData.goals[existingIndex].status;
                goalData.participants = cityData.goals[existingIndex].participants;
                cityData.goals[existingIndex] = goalData;
            } else {
                cityData.goals.push(goalData);
            }
            
            saveToLocalStorage();
            renderGoals();
            document.getElementById('goal-modal').classList.add('hidden');
        });

        // Закрытие модального окна
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('goal-modal').classList.add('hidden');
        });

        // Обработка кликов по целям (делегирование событий)
        document.getElementById('goals-list').addEventListener('click', function(e) {
            const target = e.target.closest('.complete-goal-btn');
            if (target) {
                const goalId = target.dataset.id;
                completeGoal(goalId);
                return;
            }
            
            const editBtn = e.target.closest('.edit-goal-btn');
            if (editBtn) {
                const goalId = editBtn.dataset.id;
                editGoal(goalId);
                return;
            }
            
            const deleteBtn = e.target.closest('.delete-goal-btn');
            if (deleteBtn) {
                const goalId = deleteBtn.dataset.id;
                deleteGoal(goalId);
                return;
            }
        });

        // Добавление нового объявления
        document.getElementById('new-announcement-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const announcement = {
                id: `ann-${Date.now()}`,
                title: document.getElementById('announcement-title').value,
                text: document.getElementById('announcement-text').value,
                author: 'HelpHelsing', // В реальном приложении - текущий пользователь
                date: new Date()
            };
            
            cityData.announcements.unshift(announcement);
            saveToLocalStorage();
            renderAnnouncements();
            this.reset();
        });

        // Взятие квеста
        document.getElementById('quests-grid').addEventListener('click', function(e) {
            const target = e.target.closest('.take-quest-btn');
            if (target) {
                const questId = target.dataset.id;
                takeQuest(questId);
            }
        });
    }

    // Вспомогательные функции
    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('ru-RU');
    }

    function getCategoryName(category) {
        const categories = {
            'building': 'Строительство',
            'resource': 'Ресурсы',
            'event': 'Мероприятие',
            'other': 'Другое'
        };
        return categories[category] || category;
    }

    function getPriorityName(priority) {
        const priorities = {
            'low': 'Низкий',
            'medium': 'Средний',
            'high': 'Высокий'
        };
        return priorities[priority] || priority;
    }

    function getQuestStatusName(status) {
        const statuses = {
            'active': 'Активен',
            'completed': 'Завершен',
            'expired': 'Просрочен'
        };
        return statuses[status] || status;
    }

    function getPointIcon(type) {
        const icons = {
            'main': 'fa-flag',
            'building': 'fa-home',
            'farm': 'fa-wheat-alt',
            'mine': 'fa-mountain',
            'shop': 'fa-shopping-cart'
        };
        return icons[type] || 'fa-map-marker-alt';
    }

    function getPointTypeName(type) {
        const types = {
            'main': 'Основные',
            'building': 'Постройки',
            'farm': 'Фермы',
            'mine': 'Шахты',
            'shop': 'Магазины'
        };
        return types[type] || type;
    }

    // Основные функции работы с данными
    function completeGoal(goalId) {
        const goal = cityData.goals.find(g => g.id === goalId);
        if (goal) {
            goal.status = 'completed';
            goal.completed = new Date();
            saveToLocalStorage();
            renderGoals();
        }
    }

    function editGoal(goalId) {
        const goal = cityData.goals.find(g => g.id === goalId);
        if (!goal) return;
        
        document.getElementById('goal-modal').classList.remove('hidden');
        document.getElementById('goal-modal-title').textContent = 'Редактировать цель';
        
        document.getElementById('goal-id').value = goal.id;
        document.getElementById('goal-title-input').value = goal.title;
        document.getElementById('goal-desc-input').value = goal.description || '';
        document.getElementById('goal-category').value = goal.category;
        document.getElementById('goal-priority').value = goal.priority;
        
        if (goal.deadline) {
            const deadlineDate = new Date(goal.deadline);
            document.getElementById('goal-deadline').value = deadlineDate.toISOString().split('T')[0];
        }
    }

    function deleteGoal(goalId) {
        if (confirm('Вы уверены, что хотите удалить эту цель?')) {
            cityData.goals = cityData.goals.filter(g => g.id !== goalId);
            saveToLocalStorage();
            renderGoals();
        }
    }

    function takeQuest(questId) {
        const quest = cityData.quests.find(q => q.id === questId);
        if (quest) {
            alert(`Вы взяли квест "${quest.title}". Удачи в выполнении!`);
            // В реальном приложении здесь можно добавить логику назначения квеста пользователю
        }
    }

    // Публичные методы
    return {
        init,
        getCityData: () => cityData,
        addGoal: function(goal) {
            cityData.goals.push(goal);
            saveToLocalStorage();
            renderGoals();
        },
        addAnnouncement: function(announcement) {
            cityData.announcements.unshift(announcement);
            saveToLocalStorage();
            renderAnnouncements();
        }
    };
})();

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', CityApp.init);
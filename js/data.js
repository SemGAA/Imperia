const CityData = (function() {
    let citizens = [
        {
            id: 'id-1',
            username: 'Alex',
            role: 'Мэр',
            job: 'Строитель',
            status: 'active',
            notes: 'Основатель города'
        },
        {
            id: 'id-2',
            username: 'Steve',
            role: 'Зам. мэра',
            job: 'Шахтер',
            status: 'active',
            notes: 'Помогает с ресурсами'
        }
    ];
    
    let goals = [
        {
            id: 'goal-1',
            title: 'Построить ферму пшеницы',
            description: 'Автоматическая ферма для снабжения города едой',
            responsible: 'Steve',
            status: 'completed',
            created: new Date('2023-10-01'),
            completed: new Date('2023-10-10')
        },
        {
            id: 'goal-2',
            title: 'Расширить городскую стену',
            description: 'Защита от мобов и нежелательных гостей',
            responsible: 'Alex',
            status: 'in-progress',
            created: new Date('2023-09-15')
        }
    ];
    
    let announcements = [
        {
            id: 'ann-1',
            title: 'Открытие новой фермы',
            text: 'Все жители могут пользоваться новой автоматической фермой пшеницы',
            date: new Date('2023-10-15')
        }
    ];
    
    let settings = {
        name: 'Имперский город',
        discord: 'https://discord.gg/Империя',
        serverIp: 'play.lotuscraft.fan',
        rules: '1. Уважайте постройки других игроков\n2. Не гриферите и не воруйте\n3. Соблюдайте общий стиль города\n4. Помогайте новичкам'
    };
        let builds = [
        {
            id: 'build-1',
            name: 'Городская ратуша',
            type: 'administrative',
            coords: { x: 120, y: 64, z: -340 },
            completed: new Date('2023-09-01')
        },
        {
            id: 'build-2',
            name: 'Центральный рынок',
            type: 'commercial',
            coords: { x: 135, y: 64, z: -320 },
            completed: new Date('2023-09-15')
        }
    ];

        function getBuilds() {
        return builds;
    }
    
    function getBuild(id) {
        return builds.find(b => b.id === id);
    }
    
    function saveBuild(build) {
        const index = builds.findIndex(b => b.id === build.id);
        if (index >= 0) {
            builds[index] = build;
        } else {
            builds.push(build);
        }
        saveToLocalStorage();
    }
    
    function deleteBuild(id) {
        builds = builds.filter(b => b.id !== id);
        saveToLocalStorage();
    }
    
    // Обновленный метод saveToLocalStorage
    function saveToLocalStorage() {
        localStorage.setItem('city-citizens', JSON.stringify(citizens));
        localStorage.setItem('city-goals', JSON.stringify(goals));
        localStorage.setItem('city-announcements', JSON.stringify(announcements));
        localStorage.setItem('city-builds', JSON.stringify(builds));
        localStorage.setItem('city-settings', JSON.stringify(settings));
    }
    
    // Обновленный метод loadFromLocalStorage
    function loadFromLocalStorage() {
        const savedCitizens = localStorage.getItem('city-citizens');
        if (savedCitizens) citizens = JSON.parse(savedCitizens);
        
        const savedGoals = localStorage.getItem('city-goals');
        if (savedGoals) goals = JSON.parse(savedGoals);
        
        const savedAnnouncements = localStorage.getItem('city-announcements');
        if (savedAnnouncements) announcements = JSON.parse(savedAnnouncements);
        
        const savedBuilds = localStorage.getItem('city-builds');
        if (savedBuilds) builds = JSON.parse(savedBuilds);
        
        const savedSettings = localStorage.getItem('city-settings');
        if (savedSettings) settings = JSON.parse(savedSettings);
    }
    

    
    // Методы для жителей
    function getCitizens() {
        return citizens;
    }
    
    function getCitizen(id) {
        return citizens.find(c => c.id === id);
    }
    
    function saveCitizen(citizen) {
        const index = citizens.findIndex(c => c.id === citizen.id);
        if (index >= 0) {
            citizens[index] = citizen;
        } else {
            citizens.push(citizen);
        }
        saveToLocalStorage();
    }
    
    function deleteCitizen(id) {
        citizens = citizens.filter(c => c.id !== id);
        saveToLocalStorage();
    }
    
    // Методы для целей
    function getGoals() {
        return goals;
    }
    
    function getGoal(id) {
        return goals.find(g => g.id === id);
    }
    
    function saveGoal(goal) {
        const index = goals.findIndex(g => g.id === goal.id);
        if (index >= 0) {
            goals[index] = goal;
        } else {
            goals.push(goal);
        }
        saveToLocalStorage();
    }
    
    function updateGoalStatus(id, status) {
        const goal = goals.find(g => g.id === id);
        if (goal) {
            goal.status = status;
            if (status === 'completed') {
                goal.completed = new Date();
            }
            saveToLocalStorage();
        }
    }
    
    function deleteGoal(id) {
        goals = goals.filter(g => g.id !== id);
        saveToLocalStorage();
    }
    
    // Методы для объявлений
    function getAnnouncements() {
        return announcements;
    }
    
    function getAnnouncement(id) {
        return announcements.find(a => a.id === id);
    }
    
    function saveAnnouncement(announcement) {
        const index = announcements.findIndex(a => a.id === announcement.id);
        if (index >= 0) {
            announcements[index] = announcement;
        } else {
            announcements.unshift(announcement);
        }
        saveToLocalStorage();
    }
    
    function deleteAnnouncement(id) {
        announcements = announcements.filter(a => a.id !== id);
        saveToLocalStorage();
    }
    
    // Методы для настроек
    function getSettings() {
        return settings;
    }
    
    function saveSettings(newSettings) {
        settings = {...settings, ...newSettings};
        saveToLocalStorage();
    }
    
    // Сохранение в localStorage
    function saveToLocalStorage() {
        localStorage.setItem('city-citizens', JSON.stringify(citizens));
        localStorage.setItem('city-goals', JSON.stringify(goals));
        localStorage.setItem('city-announcements', JSON.stringify(announcements));
        localStorage.setItem('city-settings', JSON.stringify(settings));
    }
    
    // Загрузка из localStorage
    function loadFromLocalStorage() {
        const savedCitizens = localStorage.getItem('city-citizens');
        if (savedCitizens) citizens = JSON.parse(savedCitizens);
        
        const savedGoals = localStorage.getItem('city-goals');
        if (savedGoals) goals = JSON.parse(savedGoals);
        
        const savedAnnouncements = localStorage.getItem('city-announcements');
        if (savedAnnouncements) announcements = JSON.parse(savedAnnouncements);
        
        const savedSettings = localStorage.getItem('city-settings');
        if (savedSettings) settings = JSON.parse(savedSettings);
    }
    
    // Инициализация
    loadFromLocalStorage();
    
    return {
        getCitizens,
        getCitizen,
        saveCitizen,
        deleteCitizen,
        getGoals,
        getGoal,
        saveGoal,
        updateGoalStatus,
        deleteGoal,
        getAnnouncements,
        getAnnouncement,
        saveAnnouncement,
        deleteAnnouncement,
        getSettings,
        saveSettings,
        getBuilds,
        getBuild,
        saveBuild,
        deleteBuild
    };
})();


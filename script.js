// Uygulama verileri
let homeworks = JSON.parse(localStorage.getItem('arenaHomeworks')) || [];
let currentDate = new Date();
let selectedDate = new Date();
let darkMode = localStorage.getItem('arenaDarkMode') === 'true';
let currentPage = 'page-home';

// Ders bilgileri
const subjects = {
    math: { name: "Matematik", class: "math", icon: "calculator" },
    science: { name: "Fen Bilimleri", class: "science", icon: "flask" },
    turkish: { name: "Türkçe", class: "turkish", icon: "book" },
    history: { name: "Tarih", class: "history", icon: "monument" },
    english: { name: "İngilizce", class: "english", icon: "language" },
    physics: { name: "Fizik", class: "physics", icon: "atom" },
    chemistry: { name: "Kimya", class: "chemistry", icon: "vial" },
    biology: { name: "Biyoloji", class: "biology", icon: "dna" }
};

const daysOfWeek = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    initializeDays();
    initializeCalendar();
    initializeSubjects();
    updateStats();
    setupEventListeners();
    updateChart();
    
    // Sayfa yüklendiğinde aktif sayfayı göster
    showPage(currentPage);
});

// Tema ayarlarını yükle
function initTheme() {
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        document.getElementById('dark-mode-toggle').checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
        document.getElementById('dark-mode-toggle').checked = false;
    }
}

// Günleri oluştur
function initializeDays() {
    const daysContainer = document.getElementById('days-container');
    daysContainer.innerHTML = '';
    
    const startOfWeek = getStartOfWeek(selectedDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // Hafta bilgisini güncelle
    document.getElementById('current-week').textContent = 
        `${formatDate(startOfWeek, true)} - ${formatDate(endOfWeek, true)} ${endOfWeek.getFullYear()}`;
    
    // Gün kartlarını oluştur
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        // Bugünü işaretle
        if (isToday(dayDate)) {
            dayCard.classList.add('today');
        }
        
        // Varsayılan olarak bugünü seç
        if (i === 0 && !isToday(selectedDate)) {
            dayCard.classList.add('active');
        } else if (isSameDay(dayDate, selectedDate)) {
            dayCard.classList.add('active');
        }
        
        dayCard.setAttribute('data-date', formatDate(dayDate));
        
        const dayName = document.createElement('div');
        dayName.className = 'day-name';
        dayName.textContent = daysOfWeek[dayDate.getDay()];
        
        const date = document.createElement('div');
        date.className = 'date';
        date.textContent = formatDate(dayDate, true);
        
        const homeworkCount = document.createElement('div');
        homeworkCount.className = 'homework-count';
        
        // Gün için ödev sayısını hesapla
        const count = homeworks.filter(hw => hw.dueDate === formatDate(dayDate)).length;
        homeworkCount.textContent = `${count} ödev`;
        
        dayCard.appendChild(dayName);
        dayCard.appendChild(date);
        dayCard.appendChild(homeworkCount);
        
        dayCard.addEventListener('click', function() {
            document.querySelectorAll('.day-card').forEach(card => card.classList.remove('active'));
            this.classList.add('active');
            const selectedDateStr = this.getAttribute('data-date');
            selectedDate = parseDate(selectedDateStr);
            renderHomeworks(selectedDateStr);
        });
        
        daysContainer.appendChild(dayCard);
    }
    
    // İlk günün ödevlerini göster
    if (!isToday(selectedDate)) {
        renderHomeworks(formatDate(startOfWeek));
    } else {
        renderHomeworks(formatDate(selectedDate));
    }
}

// Takvimi oluştur
function initializeCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    calendarGrid.innerHTML = '';
    
    // Gün başlıklarını ekle
    ['Pz', 'Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct'].forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Ayın günlerini ekle
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // İlk günden önceki boşlukları ekle
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Ayın günlerini ekle
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayDate = new Date(year, month, i);
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isToday(dayDate)) {
            dayElement.classList.add('today');
        }
        
        if (isSameDay(dayDate, selectedDate)) {
            dayElement.classList.add('active');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = i;
        
        dayElement.appendChild(dayNumber);
        
        // Ödev var mı kontrol et
        const homeworkCount = homeworks.filter(hw => hw.dueDate === formatDate(dayDate)).length;
        if (homeworkCount > 0) {
            const homeworkDot = document.createElement('div');
            homeworkDot.className = 'homework-dot';
            dayElement.appendChild(homeworkDot);
        }
        
        dayElement.setAttribute('data-date', formatDate(dayDate));
        dayElement.addEventListener('click', function() {
            const dateStr = this.getAttribute('data-date');
            selectedDate = parseDate(dateStr);
            renderCalendarHomeworks(dateStr);
            
            // Aktif günü güncelle
            document.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('active'));
            this.classList.add('active');
        });
        
        calendarGrid.appendChild(dayElement);
    }
    
    // İlk günü göster
    renderCalendarHomeworks(formatDate(selectedDate));
}

// Dersleri oluştur
function initializeSubjects() {
    const subjectsContainer = document.getElementById('subjects-container');
    subjectsContainer.innerHTML = '';
    
    Object.entries(subjects).forEach(([key, subject]) => {
        const subjectCard = document.createElement('div');
        subjectCard.className = 'subject-card';
        subjectCard.setAttribute('data-subject', key);
        
        const subjectIcon = document.createElement('div');
        subjectIcon.className = `subject-icon ${subject.class}-bg`;
        subjectIcon.innerHTML = `<i class="fas fa-${subject.icon}"></i>`;
        
        const subjectName = document.createElement('div');
        subjectName.className = 'subject-name';
        subjectName.textContent = subject.name;
        
        const subjectCount = document.createElement('div');
        subjectCount.className = 'subject-count';
        
        // Derse ait ödev sayısını hesapla
        const count = homeworks.filter(hw => hw.subject === key).length;
        subjectCount.textContent = `${count} ödev`;
        
        subjectCard.appendChild(subjectIcon);
        subjectCard.appendChild(subjectName);
        subjectCard.appendChild(subjectCount);
        
        subjectCard.addEventListener('click', function() {
            const subjectKey = this.getAttribute('data-subject');
            renderSubjectHomeworks(subjectKey);
        });
        
        subjectsContainer.appendChild(subjectCard);
    });
    
    // İlk dersi göster
    renderSubjectHomeworks('math');
}

// Ödevleri listele
function renderHomeworks(date) {
    const homeworksList = document.getElementById('homeworks-list');
    const selectedDayTitle = document.getElementById('selected-day-title');
    
    // Başlığı güncelle
    const dayName = daysOfWeek[parseDate(date).getDay()];
    selectedDayTitle.textContent = `${dayName} Ödevleri`;
    
    // Tarihe göre ödevleri filtrele
    const dayHomeworks = homeworks.filter(hw => hw.dueDate === date);
    
    if (dayHomeworks.length === 0) {
        homeworksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Bu gün için ödev bulunmamaktadır</p>
                <button class="add-first-btn" id="add-first-btn">İlk Ödevi Ekle</button>
            </div>
        `;
        
        document.getElementById('add-first-btn').addEventListener('click', function() {
            document.getElementById('homework-date').value = date;
            openAddModal();
        });
        
        return;
    }
    
    // Ödev listesini oluştur
    homeworksList.innerHTML = '';
    dayHomeworks.forEach(hw => {
        const homeworkItem = document.createElement('div');
        homeworkItem.className = 'homework-item';
        if (hw.completed) homeworkItem.classList.add('completed');
        if (hw.priority === 'high') homeworkItem.classList.add('priority-high');
        
        homeworkItem.innerHTML = `
            <input type="checkbox" class="homework-checkbox" ${hw.completed ? 'checked' : ''}>
            <div class="homework-info">
                <div class="homework-title">${hw.title}</div>
                <div class="homework-details">
                    <span class="homework-subject ${subjects[hw.subject].class}">${subjects[hw.subject].name}</span>
                    <span class="homework-time"><i class="far fa-clock"></i> ${hw.dueTime}</span>
                </div>
            </div>
            <div class="homework-actions">
                <button class="edit-btn"><i class="far fa-edit"></i></button>
                <button class="delete-btn"><i class="far fa-trash-alt"></i></button>
            </div>
        `;
        
        // Etkinlik dinleyicileri ekle
        const checkbox = homeworkItem.querySelector('.homework-checkbox');
        checkbox.addEventListener('change', function() {
            toggleHomeworkComplete(hw.id, this.checked);
        });
        
        const editBtn = homeworkItem.querySelector('.edit-btn');
        editBtn.addEventListener('click', function() {
            openEditModal(hw.id);
        });
        
        const deleteBtn = homeworkItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            deleteHomework(hw.id);
        });
        
        homeworksList.appendChild(homeworkItem);
    });
}

// Takvim için ödevleri listele
function renderCalendarHomeworks(date) {
    const calendarHomeworks = document.getElementById('calendar-homeworks');
    
    // Tarihe göre ödevleri filtrele
    const dayHomeworks = homeworks.filter(hw => hw.dueDate === date);
    
    if (dayHomeworks.length === 0) {
        calendarHomeworks.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Bu gün için ödev bulunmamaktadır</p>
            </div>
        `;
        return;
    }
    
    // Ödev listesini oluştur
    calendarHomeworks.innerHTML = '';
    dayHomeworks.forEach(hw => {
        const homeworkItem = document.createElement('div');
        homeworkItem.className = 'homework-item';
        if (hw.completed) homeworkItem.classList.add('completed');
        if (hw.priority === 'high') homeworkItem.classList.add('priority-high');
        
        homeworkItem.innerHTML = `
            <input type="checkbox" class="homework-checkbox" ${hw.completed ? 'checked' : ''}>
            <div class="homework-info">
                <div class="homework-title">${hw.title}</div>
                <div class="homework-details">
                    <span class="homework-subject ${subjects[hw.subject].class}">${subjects[hw.subject].name}</span>
                    <span class="homework-time"><i class="far fa-clock"></i> ${hw.dueTime}</span>
                </div>
            </div>
        `;
        
        // Etkinlik dinleyicileri ekle
        const checkbox = homeworkItem.querySelector('.homework-checkbox');
        checkbox.addEventListener('change', function() {
            toggleHomeworkComplete(hw.id, this.checked);
        });
        
        calendarHomeworks.appendChild(homeworkItem);
    });
}

// Ders için ödevleri listele
function renderSubjectHomeworks(subjectKey) {
    const subjectHomeworks = document.getElementById('subject-homeworks');
    const selectedSubjectTitle = document.getElementById('selected-subject-title');
    
    // Başlığı güncelle
    selectedSubjectTitle.textContent = `${subjects[subjectKey].name} Ödevleri`;
    
    // Derse göre ödevleri filtrele
    const subjectHw = homeworks.filter(hw => hw.subject === subjectKey);
    
    if (subjectHw.length === 0) {
        subjectHomeworks.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Bu ders için ödev bulunmamaktadır</p>
            </div>
        `;
        return;
    }
    
    // Ödev listesini oluştur
    subjectHomeworks.innerHTML = '';
    subjectHw.forEach(hw => {
        const homeworkItem = document.createElement('div');
        homeworkItem.className = 'homework-item';
        if (hw.completed) homeworkItem.classList.add('completed');
        if (hw.priority === 'high') homeworkItem.classList.add('priority-high');
        
        homeworkItem.innerHTML = `
            <input type="checkbox" class="homework-checkbox" ${hw.completed ? 'checked' : ''}>
            <div class="homework-info">
                <div class="homework-title">${hw.title}</div>
                <div class="homework-details">
                    <span class="homework-time"><i class="far fa-calendar"></i> ${formatDate(parseDate(hw.dueDate), true)}</span>
                    <span class="homework-time"><i class="far fa-clock"></i> ${hw.dueTime}</span>
                </div>
            </div>
            <div class="homework-actions">
                <button class="edit-btn"><i class="far fa-edit"></i></button>
                <button class="delete-btn"><i class="far fa-trash-alt"></i></button>
            </div>
        `;
        
        // Etkinlik dinleyicileri ekle
        const checkbox = homeworkItem.querySelector('.homework-checkbox');
        checkbox.addEventListener('change', function() {
            toggleHomeworkComplete(hw.id, this.checked);
        });
        
        const editBtn = homeworkItem.querySelector('.edit-btn');
        editBtn.addEventListener('click', function() {
            openEditModal(hw.id);
        });
        
        const deleteBtn = homeworkItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            deleteHomework(hw.id);
        });
        
        subjectHomeworks.appendChild(homeworkItem);
    });
}

// Grafiği güncelle
function updateChart() {
    const chart = document.getElementById('homework-chart');
    chart.innerHTML = '';
    
    // Haftalık ödev sayılarını hesapla
    const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const homeworkCounts = [0, 0, 0, 0, 0, 0, 0];
    
    homeworks.forEach(hw => {
        const day = new Date(hw.dueDate).getDay();
        // Pazar 0, Pazartesi 1, ... Cumartesi 6
        // Haftanın günlerini Pazartesi'den başlatmak için indeksi ayarla
        const index = day === 0 ? 6 : day - 1;
        homeworkCounts[index]++;
    });
    
    // Maksimum değeri bul
    const max = Math.max(...homeworkCounts, 1);
    
    // Çubukları oluştur
    weekDays.forEach((day, i) => {
        const height = (homeworkCounts[i] / max) * 150; // 150px maksimum yükseklik
        
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${height}px`;
        
        const label = document.createElement('div');
        label.className = 'chart-label';
        label.textContent = day;
        
        const value = document.createElement('div');
        value.className = 'chart-value';
        value.textContent = homeworkCounts[i];
        value.style.position = 'absolute';
        value.style.top = '-25px';
        value.style.left = '0';
        value.style.right = '0';
        value.style.textAlign = 'center';
        value.style.fontSize = '0.8rem';
        value.style.fontWeight = 'bold';
        value.style.color = 'var(--primary)';
        
        bar.appendChild(value);
        bar.appendChild(label);
        chart.appendChild(bar);
    });
}

// Olay dinleyicilerini kur
function setupEventListeners() {
    // Modal işlemleri
    document.getElementById('add-button').addEventListener('click', openAddModal);
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Ödev ekleme/güncelleme
    document.getElementById('save-homework').addEventListener('click', saveHomework);
    document.getElementById('update-homework').addEventListener('click', updateHomework);
    
    // Hafta navigasyonu
    document.getElementById('prev-week').addEventListener('click', function() {
        changeWeek(-1);
    });
    
    document.getElementById('next-week').addEventListener('click', function() {
        changeWeek(1);
    });
    
    // Tema değiştirme
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('dark-mode-toggle').addEventListener('change', toggleTheme);
    
    // Navigasyon butonları
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // Dışarı tıklayınca modal'ı kapat
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Bugünün tarihini varsayılan olarak ayarla
    const today = new Date();
    document.getElementById('homework-date').value = formatDate(today);
    document.getElementById('homework-time').value = '23:59';
}

// Sayfa değiştirme
function showPage(pageId) {
    // Tüm sayfaları gizle
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // İstenen sayfayı göster
    document.getElementById(pageId).classList.add('active');
    
    // Navigasyonu güncelle
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`.nav-item[data-page="${pageId}"]`).classList.add('active');
    
    // Mevcut sayfayı kaydet
    currentPage = pageId;
    
    // Sayfaya özel güncellemeler
    if (pageId === 'page-calendar') {
        initializeCalendar();
    } else if (pageId === 'page-subjects') {
        initializeSubjects();
    } else if (pageId === 'page-statistics') {
        updateChart();
    }
}

// Modal açma/kapama
function openAddModal() {
    document.getElementById('add-modal').style.display = 'flex';
}

function openEditModal(id) {
    const homework = homeworks.find(hw => hw.id === id);
    if (homework) {
        document.getElementById('edit-id').value = homework.id;
        document.getElementById('edit-title').value = homework.title;
        document.getElementById('edit-subject').value = homework.subject;
        document.getElementById('edit-date').value = homework.dueDate;
        document.getElementById('edit-time').value = homework.dueTime;
        document.getElementById('edit-priority').value = homework.priority || 'normal';
        document.getElementById('edit-desc').value = homework.description || '';
        
        document.getElementById('edit-modal').style.display = 'flex';
    }
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Yeni ödev ekle
function saveHomework() {
    const title = document.getElementById('homework-title').value;
    const subject = document.getElementById('homework-subject').value;
    const date = document.getElementById('homework-date').value;
    const time = document.getElementById('homework-time').value;
    const priority = document.getElementById('homework-priority').value;
    const description = document.getElementById('homework-desc').value;
    
    if (!title || !date || !time) {
        alert('Lütfen zorunlu alanları doldurunuz!');
        return;
    }
    
    // Yeni ödev oluştur
    const newHomework = {
        id: Date.now(),
        title,
        subject,
        dueDate: date,
        dueTime: time,
        priority,
        description,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    homeworks.push(newHomework);
    saveToLocalStorage();
    
    // UI'ı güncelle
    initializeDays();
    initializeCalendar();
    initializeSubjects();
    renderHomeworks(date);
    updateStats();
    updateChart();
    
    // Modal'ı kapat ve formu temizle
    closeModals();
    document.getElementById('homework-title').value = '';
    document.getElementById('homework-desc').value = '';
    
    // Başarı mesajı
    showNotification('Ödev başarıyla eklendi!');
}

// Ödev güncelle
function updateHomework() {
    const id = parseInt(document.getElementById('edit-id').value);
    const title = document.getElementById('edit-title').value;
    const subject = document.getElementById('edit-subject').value;
    const date = document.getElementById('edit-date').value;
    const time = document.getElementById('edit-time').value;
    const priority = document.getElementById('edit-priority').value;
    const description = document.getElementById('edit-desc').value;
    
    if (!title || !date || !time) {
        alert('Lütfen zorunlu alanları doldurunuz!');
        return;
    }
    
    // Ödevi güncelle
    const index = homeworks.findIndex(hw => hw.id === id);
    if (index !== -1) {
        homeworks[index] = {
            ...homeworks[index],
            title,
            subject,
            dueDate: date,
            dueTime: time,
            priority,
            description
        };
        
        saveToLocalStorage();
        
        // UI'ı güncelle
        initializeDays();
        initializeCalendar();
        initializeSubjects();
        renderHomeworks(date);
        updateStats();
        updateChart();
        
        // Modal'ı kapat
        closeModals();
        
        // Başarı mesajı
        showNotification('Ödev başarıyla güncellendi!');
    }
}

// Ödev sil
function deleteHomework(id) {
    if (confirm('Bu ödevi silmek istediğinize emin misiniz?')) {
        homeworks = homeworks.filter(hw => hw.id !== id);
        saveToLocalStorage();
        
        // UI'ı güncelle
        initializeDays();
        initializeCalendar();
        initializeSubjects();
        renderHomeworks(formatDate(selectedDate));
        updateStats();
        updateChart();
        
        // Bilgi mesajı
        showNotification('Ödev silindi.');
    }
}

// Ödev tamamlama durumunu değiştir
function toggleHomeworkComplete(id, completed) {
    const homework = homeworks.find(hw => hw.id === id);
    if (homework) {
        homework.completed = completed;
        saveToLocalStorage();
        updateStats();
        
        if (completed) {
            showNotification('Ödev tamamlandı olarak işaretlendi!');
        }
    }
}

// Hafta değiştirme
function changeWeek(direction) {
    selectedDate.setDate(selectedDate.getDate() + (direction * 7));
    initializeDays();
}

// Tema değiştirme
function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('arenaDarkMode', darkMode);
    
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
        document.getElementById('dark-mode-toggle').checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-moon"></i>';
        document.getElementById('dark-mode-toggle').checked = false;
    }
}

// İstatistikleri güncelle
function updateStats() {
    const total = homeworks.length;
    const completed = homeworks.filter(hw => hw.completed).length;
    
    document.getElementById('total-homework').textContent = total;
    document.getElementById('completed-homework').textContent = completed;
}

// LocalStorage'a kaydet
function saveToLocalStorage() {
    localStorage.setItem('arenaHomeworks', JSON.stringify(homeworks));
}

// Bildirim göster
function showNotification(message) {
    // Basit bir bildirim oluştur
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'var(--primary)';
    notification.style.color = 'white';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '30px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Görünür yap
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 10);
    
    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Yardımcı fonksiyonlar
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Pazartesi başlangıcı
    return new Date(d.setDate(diff));
}

function formatDate(date, short = false) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    if (short) {
        return `${day}.${month}`;
    }
    
    return `${year}-${month}-${day}`;
}

function parseDate(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}
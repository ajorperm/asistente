// ===== APP STATE & STORAGE =====

class AsistenteDB {
    constructor() {
        this.dbName = 'AsistenteDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('items')) {
                    const store = db.createObjectStore('items', { keyPath: 'id' });
                    store.createIndex('created', 'created', { unique: false });
                }
            };
        });
    }

    async addItem(item) {
        item.id = Date.now().toString();
        item.created = new Date().toISOString();
        item.completed = false;
        return this._operate('readwrite', store => store.add(item));
    }

    async getItems() {
        return this._operate('readonly', store => store.getAll());
    }

    async updateItem(id, updates) {
        const items = await this.getItems();
        const item = items.find(i => i.id === id);
        if (item) {
            Object.assign(item, updates);
            return this._operate('readwrite', store => store.put(item));
        }
    }

    async deleteItem(id) {
        return this._operate('readwrite', store => store.delete(id));
    }

    _operate(mode, operation) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction('items', mode);
            const store = transaction.objectStore('items');
            const request = operation(store);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }
}

// ===== DATE PARSER =====

function parseWhen(text) {
    const lower = text.toLowerCase();

    // HOY
    if (/\bhoy\b/.test(lower)) {
        return { when: 'hoy', date: new Date() };
    }

    // MAÑANA
    if (/\bmañana\b/.test(lower)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { when: 'manana', date: tomorrow };
    }

    // ESTA SEMANA
    if (/\best(a|á) semana\b/.test(lower)) {
        return { when: 'esta-semana' };
    }

    // PRÓXIMA SEMANA
    if (/\bpr(ó|o)xima semana\b/.test(lower)) {
        return { when: 'proxima-semana' };
    }

    // DÍA DE LA SEMANA + NÚMERO (ej: "lunes 24", "martes 25")
    const dayMatch = text.match(/(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\s+(\d{1,2})/i);
    if (dayMatch) {
        return { when: 'fecha-especifica', dayName: dayMatch[1], dayNum: parseInt(dayMatch[2]) };
    }

    // NÚMERO SOLO (ej: "día 15")
    const numMatch = text.match(/día\s+(\d{1,2})/i);
    if (numMatch) {
        return { when: 'fecha-especifica', dayNum: parseInt(numMatch[1]) };
    }

    return { when: null, date: null };
}

function getPeriodStartEnd(when) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (when === 'hoy') {
        return { start: today, end: today };
    }

    if (when === 'manana') {
        return { start: tomorrow, end: tomorrow };
    }

    if (when === 'esta-semana') {
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return { start: monday, end: sunday };
    }

    if (when === 'proxima-semana') {
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 8);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        return { start: monday, end: sunday };
    }

    return { start: null, end: null };
}

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (d.toDateString() === today.toDateString()) {
        return 'Hoy';
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) {
        return 'Mañana';
    }

    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[d.getDay()] + ' ' + d.getDate();
}

function isToday(item) {
    if (!item.date) return false;
    const d = new Date(item.date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
}

function isTomorrow(item) {
    if (!item.date) return false;
    const d = new Date(item.date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return d.toDateString() === tomorrow.toDateString();
}

function isThisWeek(item) {
    if (!item.date) return false;
    const d = new Date(item.date);
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return d >= monday && d <= sunday;
}

function isNextWeek(item) {
    if (!item.date) return false;
    const d = new Date(item.date);
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 8);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return d >= monday && d <= sunday;
}

// ===== VOICE RECOGNITION =====

class VoiceCapture {
    constructor() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-ES';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.isListening = false;
        this.transcript = '';
    }

    listen(onResult, onError, onEnd) {
        this.isListening = true;
        this.transcript = '';

        this.recognition.onstart = () => {
            console.log('Voice listening...');
        };

        this.recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const trans = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    this.transcript += trans + ' ';
                } else {
                    interim += trans;
                }
            }
            onResult(this.transcript + interim);
        };

        this.recognition.onerror = (event) => {
            if (event.error === 'no-speech') {
                onError('No se detectó voz. Intenta de nuevo.');
            } else if (event.error === 'network') {
                onError('Error de red. Comprueba tu conexión.');
            } else {
                onError('Error: ' + event.error);
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            onEnd(this.transcript);
        };

        this.recognition.start();
    }

    stop() {
        this.recognition.stop();
        this.isListening = false;
    }
}

// ===== UI CONTROLLER =====

class App {
    constructor() {
        this.db = new AsistenteDB();
        this.voice = new VoiceCapture();
        this.items = [];
        this.currentEditId = null;
        this.currentView = 'hoy';
    }

    async init() {
        await this.db.init();
        this.setupListeners();
        await this.render();

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js').catch(e => console.log('SW error:', e));
        }
    }

    setupListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Capture
        document.getElementById('mic-btn').addEventListener('click', () => this.startVoice());
        document.getElementById('send-btn').addEventListener('click', () => this.captureText());
        document.getElementById('capture-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.captureText();
        });

        // Modal
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEdit();
        });
        document.getElementById('delete-btn').addEventListener('click', () => this.deleteItem());
    }

    switchView(view) {
        this.currentView = view;
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        event.target.classList.add('active');

        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(view).classList.add('active');
    }

    startVoice() {
        const btn = document.getElementById('mic-btn');
        const input = document.getElementById('capture-input');

        btn.classList.add('recording');
        btn.textContent = '⏹';
        input.placeholder = 'Escuchando...';

        this.voice.listen(
            (transcript) => {
                input.value = transcript;
            },
            (error) => {
                this.showStatus(error);
                btn.classList.remove('recording');
                btn.textContent = '🎤';
                input.placeholder = 'Di o escribe cualquier cosa...';
            },
            (finalTranscript) => {
                btn.classList.remove('recording');
                btn.textContent = '🎤';
                input.placeholder = 'Di o escribe cualquier cosa...';
                input.value = finalTranscript.trim();
                if (finalTranscript.trim()) {
                    this.captureText();
                }
            }
        );
    }

    async captureText() {
        const input = document.getElementById('capture-input');
        const text = input.value.trim();

        if (!text) return;

        const parsed = parseWhen(text);

        const item = {
            title: text,
            when: parsed.when,
            date: parsed.date,
            project: this.extractProject(text) || null,
            completed: false
        };

        await this.db.addItem(item);
        input.value = '';
        this.showStatus('✓ Guardado');
        await this.render();
    }

    extractProject(text) {
        const projects = ['Costa Rica', 'EMCA', 'Residencia', 'Blog', 'CAPE', 'Salud Pública', 'Casa', 'Personal'];
        for (const proj of projects) {
            if (text.toLowerCase().includes(proj.toLowerCase())) {
                return proj;
            }
        }
        return null;
    }

    async render() {
        this.items = (await this.db.getItems()).sort((a, b) => new Date(b.created) - new Date(a.created));

        this.renderView('hoy', i => !i.completed && (isToday(i) || (isThisWeek(i) && i.date)));
        this.renderView('proximos', i => !i.completed && (isTomorrow(i) || isNextWeek(i)));
        this.renderView('inbox', i => !i.completed && !i.date);
        this.renderView('proyectos', i => !i.completed && i.project);
        this.renderView('completados', i => i.completed);
    }

    renderView(viewId, filter) {
        const container = document.getElementById(viewId + '-items');
        const filtered = this.items.filter(filter);

        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>Nada aquí todavía</p></div>';
            return;
        }

        container.innerHTML = filtered.map(item => `
            <div class="item ${item.completed ? 'completed' : ''}">
                <div class="item-checkbox" data-id="${item.id}"></div>
                <div class="item-content" data-id="${item.id}">
                    <div class="item-title">${this.escape(item.title)}</div>
                    <div class="item-meta">
                        ${item.date ? `<span class="item-date">${formatDate(item.date)}</span>` : ''}
                        ${item.project ? `<span class="item-project">${this.escape(item.project)}</span>` : ''}
                    </div>
                </div>
                <div class="item-actions">
                    <button class="item-btn edit-btn" data-id="${item.id}">✏️</button>
                </div>
            </div>
        `).join('');

        // Event listeners
        container.querySelectorAll('.item-checkbox').forEach(cb => {
            cb.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const item = this.items.find(i => i.id === id);
                this.db.updateItem(id, { completed: !item.completed });
                this.render();
            });
        });

        container.querySelectorAll('.item-content').forEach(el => {
            el.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.openEdit(id);
            });
        });

        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openEdit(btn.dataset.id);
            });
        });
    }

    openEdit(id) {
        this.currentEditId = id;
        const item = this.items.find(i => i.id === id);

        document.getElementById('edit-title').value = item.title;
        document.getElementById('edit-when').value = item.when || '';
        document.getElementById('edit-project').value = item.project || '';

        document.getElementById('edit-modal').classList.add('active');
    }

    closeModal() {
        document.getElementById('edit-modal').classList.remove('active');
        this.currentEditId = null;
    }

    async saveEdit() {
        const title = document.getElementById('edit-title').value.trim();
        const when = document.getElementById('edit-when').value;
        const project = document.getElementById('edit-project').value.trim();

        if (!title) return;

        const updates = { title, when: when || null };
        if (project) updates.project = project;

        // Calculate date from when
        if (when) {
            const period = getPeriodStartEnd(when);
            if (period.start) updates.date = period.start.toISOString();
        } else {
            updates.date = null;
        }

        await this.db.updateItem(this.currentEditId, updates);
        this.closeModal();
        await this.render();
    }

    async deleteItem() {
        if (!this.currentEditId) return;
        if (confirm('¿Eliminar?')) {
            await this.db.deleteItem(this.currentEditId);
            this.closeModal();
            await this.render();
        }
    }

    showStatus(message) {
        const status = document.createElement('div');
        status.className = 'status';
        status.textContent = message;
        document.body.appendChild(status);
        setTimeout(() => status.remove(), 2500);
    }

    escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===== INIT =====

const app = new App();
document.addEventListener('DOMContentLoaded', () => app.init());

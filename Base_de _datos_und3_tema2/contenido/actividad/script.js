// ================================================================
// TEMA 2: API CRUD Endpoints — Script principal
// ================================================================

document.addEventListener('DOMContentLoaded', function () {
    initWordSearch();
    initDragDrop();
    initMatching();
});

// ----------------------------------------------------------------
// UTILIDADES
// ----------------------------------------------------------------
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ================================================================
// ACTIVIDAD 1: SOPA DE LETRAS
// ================================================================
const WS_WORDS = ['GET', 'POST', 'PUT', 'DELETE', 'ENDPOINT', 'ROUTE', 'REQUEST', 'RESPONSE', 'STATUS', 'HEADER', 'BODY', 'JSON', 'REST', 'API', 'CRUD', 'METHOD'];
const WS_SIZE = 18;
const DIRECTIONS = [
    [0, 1],   // horizontal →
    [1, 0],   // vertical ↓
    [1, 1],   // diagonal ↘
    [1, -1],  // diagonal ↙
    [0, -1],  // horizontal ←
    [-1, 0],  // vertical ↑
    [-1, -1], // diagonal ↖
    [-1, 1],  // diagonal ↗
];

let wsGrid = [];
let wsPlaced = [];

function initWordSearch() {
    wsGrid = Array.from({ length: WS_SIZE }, () => Array(WS_SIZE).fill(''));
    wsPlaced = [];

    const sorted = [...WS_WORDS].sort((a, b) => b.length - a.length);
    sorted.forEach(word => {
        let placed = false;
        const dirs = shuffle(DIRECTIONS);
        for (let attempt = 0; attempt < 200 && !placed; attempt++) {
            const [dr, dc] = dirs[attempt % dirs.length];
            const row = Math.floor(Math.random() * WS_SIZE);
            const col = Math.floor(Math.random() * WS_SIZE);
            if (canPlace(word, row, col, dr, dc)) {
                placeWord(word, row, col, dr, dc);
                wsPlaced.push({ word, row, col, dr, dc });
                placed = true;
            }
        }
    });

    fillRandom();
    renderGrid();
    renderWordList();
    setupSelection();
    updateFoundCount();
}

function canPlace(word, row, col, dr, dc) {
    for (let i = 0; i < word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (r < 0 || r >= WS_SIZE || c < 0 || c >= WS_SIZE) return false;
        if (wsGrid[r][c] && wsGrid[r][c] !== word[i]) return false;
    }
    return true;
}

function placeWord(word, row, col, dr, dc) {
    for (let i = 0; i < word.length; i++) {
        wsGrid[row + dr * i][col + dc * i] = word[i];
    }
}

function fillRandom() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < WS_SIZE; r++)
        for (let c = 0; c < WS_SIZE; c++)
            if (!wsGrid[r][c]) wsGrid[r][c] = letters[Math.floor(Math.random() * 26)];
}

function renderGrid() {
    const container = document.getElementById('wordsearch-container');
    container.innerHTML = '';
    const gridEl = document.createElement('div');
    gridEl.className = 'wordsearch-grid';
    gridEl.style.gridTemplateColumns = `repeat(${WS_SIZE}, 34px)`;

    for (let r = 0; r < WS_SIZE; r++) {
        for (let c = 0; c < WS_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = wsGrid[r][c];
            cell.dataset.row = r;
            cell.dataset.col = c;
            gridEl.appendChild(cell);
        }
    }
    container.appendChild(gridEl);
}

function renderWordList() {
    const ul = document.getElementById('words-to-find');
    ul.innerHTML = '';
    WS_WORDS.forEach(w => {
        const li = document.createElement('li');
        li.dataset.word = w;
        li.textContent = w;
        ul.appendChild(li);
    });
    document.getElementById('total-words').textContent = WS_WORDS.length;
}

function setupSelection() {
    const container = document.querySelector('.wordsearch-grid');
    let selecting = false;
    let startCell = null;
    let currentCells = [];

    container.addEventListener('mousedown', e => {
        const cell = e.target.closest('.grid-cell');
        if (!cell) return;
        selecting = true;
        startCell = cell;
        currentCells = [cell];
        highlightCells(currentCells);
        e.preventDefault();
    });

    container.addEventListener('mouseover', e => {
        if (!selecting) return;
        const cell = e.target.closest('.grid-cell');
        if (!cell || cell === startCell) return;

        const r1 = +startCell.dataset.row, c1 = +startCell.dataset.col;
        const r2 = +cell.dataset.row, c2 = +cell.dataset.col;
        currentCells = getCellsInLine(r1, c1, r2, c2);
        highlightCells(currentCells);
    });

    document.addEventListener('mouseup', () => {
        if (!selecting) return;
        selecting = false;
        if (currentCells.length >= 2) checkSelection(currentCells);
        clearHighlight();
        currentCells = [];
        startCell = null;
    });

    // Touch support
    container.addEventListener('touchstart', e => {
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.grid-cell');
        if (!cell) return;
        selecting = true;
        startCell = cell;
        currentCells = [cell];
        highlightCells(currentCells);
        e.preventDefault();
    }, { passive: false });

    container.addEventListener('touchmove', e => {
        if (!selecting) return;
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.grid-cell');
        if (!cell || cell === startCell) return;
        const r1 = +startCell.dataset.row, c1 = +startCell.dataset.col;
        const r2 = +cell.dataset.row, c2 = +cell.dataset.col;
        currentCells = getCellsInLine(r1, c1, r2, c2);
        highlightCells(currentCells);
        e.preventDefault();
    }, { passive: false });

    container.addEventListener('touchend', () => {
        if (!selecting) return;
        selecting = false;
        if (currentCells.length >= 2) checkSelection(currentCells);
        clearHighlight();
        currentCells = [];
        startCell = null;
    });
}

function getCellsInLine(r1, c1, r2, c2) {
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    const cells = [];
    const gridEl = document.querySelector('.wordsearch-grid');
    const all = gridEl.querySelectorAll('.grid-cell');
    const map = {};
    all.forEach(c => { map[`${c.dataset.row},${c.dataset.col}`] = c; });

    let r = r1, c = c1;
    while (true) {
        const key = `${r},${c}`;
        if (map[key]) cells.push(map[key]);
        if (r === r2 && c === c2) break;
        r += dr;
        c += dc;
        if (Math.abs(r - r1) > WS_SIZE || Math.abs(c - c1) > WS_SIZE) break;
    }
    return cells;
}

function highlightCells(cells) {
    document.querySelectorAll('.grid-cell.selecting').forEach(c => c.classList.remove('selecting'));
    cells.forEach(c => { if (!c.classList.contains('found')) c.classList.add('selecting'); });
}

function clearHighlight() {
    document.querySelectorAll('.grid-cell.selecting').forEach(c => c.classList.remove('selecting'));
}

function checkSelection(cells) {
    const word = cells.map(c => c.textContent).join('');
    const rev = word.split('').reverse().join('');
    const match = WS_WORDS.find(w => w === word || w === rev);
    if (!match) return;
    const alreadyFound = cells.every(c => c.classList.contains('found'));
    if (alreadyFound) return;

    cells.forEach(c => c.classList.add('found'));
    const li = document.querySelector(`#words-to-find [data-word="${match}"]`);
    if (li && !li.classList.contains('found')) li.classList.add('found');

    updateFoundCount();
}

function updateFoundCount() {
    const found = document.querySelectorAll('#words-to-find li.found').length;
    document.getElementById('found-count').textContent = found;
    const fb = document.getElementById('wordsearch-feedback');
    if (found === WS_WORDS.length) {
        fb.className = 'feedback-msg success';
        fb.innerHTML = '🎉 ¡Felicitaciones! Encontraste todas las palabras. Recuerda: GET recupera datos, POST crea recursos, PUT actualiza y DELETE elimina.';
    } else if (found >= 10) {
        fb.className = 'feedback-msg info';
        fb.innerHTML = `👏 ¡Muy bien! Ya encontraste ${found} palabras. Sigue buscando los términos restantes.`;
    } else {
        fb.className = '';
        fb.innerHTML = '';
    }
}

function resetWordSearch() {
    initWordSearch();
}

// ================================================================
// ACTIVIDAD 2: ARRASTRAR Y SOLTAR
// ================================================================
const DRAG_DATA = [
    { text: 'Obtener todos los usuarios de la base de datos', correct: 'GET', hint: 'GET se usa para recuperar/leer información.' },
    { text: 'Obtener un usuario específico por su ID', correct: 'GET', hint: 'GET también recupera un único recurso pasando su identificador.' },
    { text: 'Crear un nuevo usuario en la base de datos', correct: 'POST', hint: 'POST envía datos al servidor para crear un recurso nuevo.' },
    { text: 'Actualizar completamente la información de un usuario', correct: 'PUT', hint: 'PUT reemplaza el recurso completo con los nuevos datos.' },
    { text: 'Eliminar un usuario de la base de datos', correct: 'DELETE', hint: 'DELETE borra el recurso indicado en la URL.' },
    { text: 'Actualizar parcialmente algunos campos de un usuario', correct: 'PATCH', hint: 'PATCH modifica solo los campos enviados, no el recurso completo.' },
    { text: 'Verificar si un endpoint está funcionando (health check)', correct: 'GET', hint: 'Una petición GET simple comprueba la disponibilidad del servidor.' },
    { text: 'Enviar datos de login para autenticación', correct: 'POST', hint: 'Las credenciales se envían en el cuerpo de una petición POST.' },
];

const DROP_ZONES_DEF = [
    { id: 'GET', label: '📖 GET', desc: 'Leer / Recuperar datos' },
    { id: 'POST', label: '📝 POST', desc: 'Crear nuevo recurso' },
    { id: 'PUT', label: '🔄 PUT', desc: 'Actualizar completamente' },
    { id: 'PATCH', label: '✏️ PATCH', desc: 'Actualizar parcialmente' },
    { id: 'DELETE', label: '🗑️ DELETE', desc: 'Eliminar recurso' },
];

let draggedEl = null;
let dragData2 = [];

function initDragDrop() {
    dragData2 = shuffle(DRAG_DATA);
    const itemsContainer = document.getElementById('drag-items-2');
    const zonesContainer = document.getElementById('drop-zones-2');
    itemsContainer.innerHTML = '';
    zonesContainer.innerHTML = '';

    dragData2.forEach((d, i) => {
        const el = document.createElement('div');
        el.className = 'drag-item';
        el.draggable = true;
        el.dataset.correct = d.correct;
        el.dataset.hint = d.hint;
        el.dataset.id = i;
        el.textContent = d.text;
        el.addEventListener('dragstart', onDragStart);
        el.addEventListener('dragend', onDragEnd);
        itemsContainer.appendChild(el);
    });

    DROP_ZONES_DEF.forEach(z => {
        const zone = document.createElement('div');
        zone.className = 'drop-zone';
        zone.dataset.expected = z.id;
        zone.innerHTML = `<h3>${z.label}</h3><p class="zone-desc">${z.desc}</p><div class="drop-area"></div>`;
        const area = zone.querySelector('.drop-area');
        area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
        area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
        area.addEventListener('drop', e => onDrop(e, zone, area));
        zonesContainer.appendChild(zone);
    });

    updateDragCount();
}

function onDragStart(e) {
    draggedEl = e.currentTarget;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}
function onDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
}

function onDrop(e, zone, area) {
    e.preventDefault();
    area.classList.remove('drag-over');
    if (!draggedEl || area.querySelector('.drag-item')) return;

    const expected = zone.dataset.expected;
    const correct = draggedEl.dataset.correct;
    const hint = draggedEl.dataset.hint;

    const clone = draggedEl.cloneNode(true);
    clone.removeEventListener('dragstart', onDragStart);
    clone.draggable = false;
    clone.style.cursor = 'default';
    area.appendChild(clone);

    if (expected === correct) {
        zone.classList.add('correct');
        clone.classList.add('correct');
        showDragFeedback(`✅ ¡Correcto! "${draggedEl.textContent}" pertenece a <strong>${correct}</strong>. ${hint}`, 'success');
    } else {
        zone.classList.add('incorrect');
        clone.classList.add('incorrect');
        showDragFeedback(`❌ Incorrecto. "${draggedEl.textContent}" pertenece a <strong>${correct}</strong>, no a ${expected}. ${hint}`, 'error');
    }

    draggedEl.style.display = 'none';
    draggedEl = null;
    updateDragCount();
}

function showDragFeedback(msg, type) {
    const fb = document.getElementById('drag-feedback');
    fb.className = `feedback-msg ${type}`;
    fb.innerHTML = msg;
}

function updateDragCount() {
    const correct = document.querySelectorAll('#drop-zones-2 .drop-zone.correct').length;
    document.getElementById('drag-correct-count').textContent = correct;
    document.getElementById('drag-total-count').textContent = DRAG_DATA.length;

    if (correct === DRAG_DATA.length) {
        showDragFeedback('🎉 ¡Excelente! Clasificaste todos los métodos HTTP correctamente. GET=leer, POST=crear, PUT=actualizar completo, PATCH=actualizar parcial, DELETE=eliminar.', 'success');
    }
}

function resetDragDrop() {
    initDragDrop();
}

// ================================================================
// ACTIVIDAD 3: UNIR PALABRAS
// ================================================================
const MATCH_PAIRS = [
    { term: 'GET', def: '200 OK — Recupera el recurso solicitado', hint: 'GET devuelve datos existentes con código 200.' },
    { term: 'POST', def: '201 Created — Crea un recurso nuevo', hint: 'POST crea un recurso y responde con 201.' },
    { term: 'PUT', def: '200 OK — Actualiza el recurso completo', hint: 'PUT reemplaza el recurso y devuelve 200.' },
    { term: 'DELETE', def: '204 No Content — Elimina el recurso', hint: 'DELETE borra el recurso y responde 204 (sin cuerpo).' },
    { term: 'Error 400', def: '400 Bad Request — Solicitud mal formada', hint: 'El cliente envió datos incorrectos o incompletos.' },
    { term: 'Error 401', def: '401 Unauthorized — Sin autenticación', hint: 'El usuario no está autenticado (falta token/sesión).' },
    { term: 'Error 404', def: '404 Not Found — Recurso no encontrado', hint: 'La URL o el ID solicitado no existe en el servidor.' },
    { term: 'Error 500', def: '500 Internal Server Error — Fallo del servidor', hint: 'Error inesperado en el servidor, no del cliente.' },
];

let matchSelected = null;
let matchPairs = [];

function initMatching() {
    matchPairs = [...MATCH_PAIRS];
    matchSelected = null;

    const termsShuffled = shuffle(matchPairs.map(p => p.term));
    const defsShuffled = shuffle(matchPairs.map(p => p.def));

    const termsCol = document.getElementById('terms-column');
    const defsCol = document.getElementById('definitions-column');
    termsCol.innerHTML = '';
    defsCol.innerHTML = '';

    termsShuffled.forEach(term => {
        const el = document.createElement('div');
        el.className = 'matching-item';
        el.dataset.term = term;
        el.textContent = term;
        el.addEventListener('click', () => onMatchClick(el));
        termsCol.appendChild(el);
    });

    defsShuffled.forEach(def => {
        const pair = matchPairs.find(p => p.def === def);
        const el = document.createElement('div');
        el.className = 'matching-item';
        el.dataset.def = def;
        el.dataset.term = pair.term;
        el.textContent = def;
        el.addEventListener('click', () => onMatchClick(el));
        defsCol.appendChild(el);
    });

    document.getElementById('matching-total-count').textContent = MATCH_PAIRS.length;
    updateMatchingCount();
}

function onMatchClick(el) {
    if (el.classList.contains('correct')) return;

    if (!matchSelected) {
        matchSelected = el;
        el.classList.add('selected');
        return;
    }

    if (matchSelected === el) {
        el.classList.remove('selected');
        matchSelected = null;
        return;
    }

    // Ambos seleccionados: verificar
    const second = el;
    second.classList.add('selected');

    const term1 = matchSelected.dataset.term || null;
    const def1 = matchSelected.dataset.def || null;
    const term2 = second.dataset.term || null;
    const def2 = second.dataset.def || null;

    // Uno debe ser término y otro definición
    let termEl, defEl;
    if (matchSelected.dataset.term && matchSelected.dataset.def === undefined) {
        // selected is term
        termEl = matchSelected; defEl = second;
    } else if (second.dataset.term && second.dataset.def === undefined) {
        termEl = second; defEl = matchSelected;
    } else {
        // Both same type or mixed: use dataset.term on both
        // defEl has data-def, termEl has data-term only
        if (matchSelected.hasAttribute('data-def')) {
            defEl = matchSelected; termEl = second;
        } else {
            termEl = matchSelected; defEl = second;
        }
    }

    // Normalize: term side items have only data-term, def side have data-def AND data-term (set during init)
    const termKey = termEl.dataset.term;
    const defKey = defEl.dataset.term; // we store the matching term on def items too

    const isCorrect = termKey === defKey;
    const pair = MATCH_PAIRS.find(p => p.term === termKey);

    if (isCorrect) {
        termEl.classList.add('correct');
        defEl.classList.add('correct');
        termEl.classList.remove('selected');
        defEl.classList.remove('selected');
        showMatchFeedback(`✅ ¡Correcto! <strong>${pair.term}</strong>: ${pair.hint}`, 'success');
        updateMatchingCount();
    } else {
        termEl.classList.add('incorrect');
        defEl.classList.add('incorrect');
        showMatchFeedback(`❌ Combinación incorrecta. ${pair ? pair.hint : 'Intenta relacionar cada método con su código de respuesta.'}`, 'error');
        setTimeout(() => {
            termEl.classList.remove('selected', 'incorrect');
            defEl.classList.remove('selected', 'incorrect');
        }, 1200);
    }

    matchSelected = null;
}

function showMatchFeedback(msg, type) {
    const fb = document.getElementById('matching-feedback');
    fb.className = `feedback-msg ${type}`;
    fb.innerHTML = msg;
}

function updateMatchingCount() {
    const correct = document.querySelectorAll('#terms-column .matching-item.correct').length;
    document.getElementById('matching-correct-count').textContent = correct;
    if (correct === MATCH_PAIRS.length) {
        showMatchFeedback('🎉 ¡Perfecto! Emparejaste todos los métodos HTTP con sus códigos de estado. ¡Dominas los fundamentos de REST!', 'success');
    }
}

function resetMatching() {
    initMatching();
    document.getElementById('matching-feedback').className = '';
    document.getElementById('matching-feedback').innerHTML = '';
}

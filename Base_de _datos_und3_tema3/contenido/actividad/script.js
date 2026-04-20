// ================================================================
// TEMA 3: Validaciones e Inyección SQL — Script principal
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
const WS_WORDS = [
    'INJECTION', 'SANITIZE', 'PREPARED', 'STATEMENT',
    'PARAMETER', 'VALIDATE', 'REGEX', 'HASHING',
    'FIREWALL', 'ENCRYPT', 'TOKEN', 'SESSION',
    'PAYLOAD', 'QUERY', 'ESCAPE', 'ATTACK'
];
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
        for (let attempt = 0; attempt < 300 && !placed; attempt++) {
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
        selecting = true; startCell = cell; currentCells = [cell];
        highlightCells(currentCells); e.preventDefault();
    }, { passive: false });

    container.addEventListener('touchmove', e => {
        if (!selecting) return;
        const touch = e.touches[0];
        const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.grid-cell');
        if (!cell || cell === startCell) return;
        const r1 = +startCell.dataset.row, c1 = +startCell.dataset.col;
        const r2 = +cell.dataset.row, c2 = +cell.dataset.col;
        currentCells = getCellsInLine(r1, c1, r2, c2);
        highlightCells(currentCells); e.preventDefault();
    }, { passive: false });

    container.addEventListener('touchend', () => {
        if (!selecting) return;
        selecting = false;
        if (currentCells.length >= 2) checkSelection(currentCells);
        clearHighlight(); currentCells = []; startCell = null;
    });
}

function getCellsInLine(r1, c1, r2, c2) {
    const dr = Math.sign(r2 - r1);
    const dc = Math.sign(c2 - c1);
    const cells = [];
    const map = {};
    document.querySelectorAll('.grid-cell').forEach(c => {
        map[`${c.dataset.row},${c.dataset.col}`] = c;
    });
    let r = r1, c = c1;
    while (true) {
        const key = `${r},${c}`;
        if (map[key]) cells.push(map[key]);
        if (r === r2 && c === c2) break;
        r += dr; c += dc;
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
    if (cells.every(c => c.classList.contains('found'))) return;
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
        fb.innerHTML = '🎉 ¡Excelente! Encontraste todos los términos de seguridad SQL. Recuerda: la inyección SQL se previene con consultas preparadas (PREPARED STATEMENTS) y validación de datos.';
    } else if (found >= 8) {
        fb.className = 'feedback-msg info';
        fb.innerHTML = `👏 ¡Muy bien! Ya encontraste ${found} palabras. Sigue buscando los términos de seguridad restantes.`;
    } else {
        fb.className = '';
        fb.innerHTML = '';
    }
}

function resetWordSearch() { initWordSearch(); }

// ================================================================
// ACTIVIDAD 2: ARRASTRAR Y SOLTAR
// ================================================================
const DRAG_DATA = [
    {
        text: 'Enviar el dato separado de la consulta usando marcadores (?)',
        correct: 'PREPARED',
        hint: 'Las consultas preparadas (Prepared Statements) separan el código SQL de los datos, impidiendo que el dato se interprete como instrucción.'
    },
    {
        text: 'El atacante escribe \' OR \'1\'=\'1 en el campo usuario',
        correct: 'INJECTION',
        hint: 'Esto es un ataque de inyección SQL clásico. El código malicioso altera la lógica de la consulta para acceder sin credenciales.'
    },
    {
        text: 'Verificar que un campo de precio sea un número Float',
        correct: 'VALIDATION',
        hint: 'Validar el tipo de dato es el primer filtro de calidad. Si esperamos número, rechazamos cualquier texto.'
    },
    {
        text: 'Responder con "error interno" en lugar de mostrar el nombre de la tabla',
        correct: 'ERRORS',
        hint: 'Ocultar los mensajes reales de error impide que el atacante conozca la estructura de la base de datos.'
    },
    {
        text: 'Usar db.execute("SELECT * FROM productos WHERE id = ?", [id])',
        correct: 'PREPARED',
        hint: 'Este es el patrón correcto de consulta preparada. El motor BD nunca tratará el valor de "id" como código SQL.'
    },
    {
        text: 'Validar que un correo cumpla el formato usuario@dominio.ext con Regex',
        correct: 'VALIDATION',
        hint: 'Las expresiones regulares (Regex) validan el formato exacto de campos como correos, teléfonos o fechas.'
    },
    {
        text: 'Concatenar directamente variables del usuario en la consulta SQL',
        correct: 'INJECTION',
        hint: 'Concatenar variables del formulario en la consulta es el error que abre la puerta a la inyección SQL. ¡Nunca hacerlo!'
    },
    {
        text: 'Capturar excepciones de BD en el servidor y registrarlas en un log privado',
        correct: 'ERRORS',
        hint: 'Los errores deben capturarse en el servidor (try/catch), registrarse internamente en logs y devolver un mensaje genérico al cliente.'
    },
];

const DROP_ZONES_DEF = [
    { id: 'INJECTION', label: '💉 Inyección SQL',         desc: 'Ataques y vulnerabilidades de inyección' },
    { id: 'PREPARED',  label: '🔒 Consultas Preparadas',  desc: 'Técnicas con Prepared Statements' },
    { id: 'VALIDATION',label: '✅ Validación de Datos',   desc: 'Filtros de tipo, longitud y formato' },
    { id: 'ERRORS',    label: '⚠️ Manejo de Errores',     desc: 'Respuestas seguras y códigos HTTP' },
];

let draggedEl = null;

function initDragDrop() {
    const shuffled = shuffle(DRAG_DATA);
    const itemsContainer = document.getElementById('drag-items-2');
    const zonesContainer = document.getElementById('drop-zones-2');
    itemsContainer.innerHTML = '';
    zonesContainer.innerHTML = '';
    draggedEl = null;

    shuffled.forEach((d, i) => {
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
function onDragEnd(e) { e.currentTarget.classList.remove('dragging'); }

function onDrop(e, zone, area) {
    e.preventDefault();
    area.classList.remove('drag-over');
    if (!draggedEl || area.querySelector('.drag-item')) return;

    const expected = zone.dataset.expected;
    const correct  = draggedEl.dataset.correct;
    const hint     = draggedEl.dataset.hint;

    const clone = draggedEl.cloneNode(true);
    clone.draggable = false;
    clone.style.cursor = 'default';
    area.appendChild(clone);

    if (expected === correct) {
        zone.classList.add('correct');
        clone.classList.add('correct');
        showDragFeedback(`✅ ¡Correcto! ${hint}`, 'success');
    } else {
        zone.classList.add('incorrect');
        clone.classList.add('incorrect');
        const zoneName = DROP_ZONES_DEF.find(z => z.id === correct)?.label || correct;
        showDragFeedback(`❌ Incorrecto. Este enunciado pertenece a <strong>${zoneName}</strong>. ${hint}`, 'error');
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
        showDragFeedback('🎉 ¡Perfecto! Clasificaste correctamente todas las prácticas. Recuerda: la seguridad SQL requiere Prepared Statements + Validación + Manejo de errores.', 'success');
    }
}

function resetDragDrop() { initDragDrop(); }

// ================================================================
// ACTIVIDAD 3: UNIR PALABRAS
// ================================================================
const MATCH_PAIRS = [
    {
        term: 'SQL Injection',
        def:  'Ataque que inserta código malicioso en una consulta SQL',
        hint: 'Ocurre al concatenar datos del usuario directamente en la consulta sin sanitizar.'
    },
    {
        term: 'Prepared Statement',
        def:  'Consulta con marcadores (?) que separa código SQL de los datos',
        hint: 'El motor de BD trata el dato siempre como valor, nunca como instrucción ejecutable.'
    },
    {
        term: 'Sanitización',
        def:  'Proceso de limpiar o escapar caracteres peligrosos de una entrada',
        hint: 'Escapar comillas simples y caracteres especiales impide que rompan la estructura de la consulta.'
    },
    {
        term: 'Validación',
        def:  'Verificar tipo, longitud y formato de un dato antes de usarlo',
        hint: 'No se debe confiar en el Front-end; siempre validar en el servidor.'
    },
    {
        term: 'OR 1=1',
        def:  'Condición siempre verdadera usada para bypassear autenticación',
        hint: 'Al inyectar esta condición, la cláusula WHERE siempre es verdadera y devuelve todos los registros.'
    },
    {
        term: 'Regex',
        def:  'Expresión regular usada para validar formatos como correos o teléfonos',
        hint: 'Permite definir un patrón exacto que el dato debe cumplir, rechazando entradas malformadas.'
    },
    {
        term: 'Error genérico',
        def:  'Mensaje vago al usuario que oculta la causa real del fallo',
        hint: 'Mostrar "ocurrió un problema interno" en lugar del mensaje real impide que el atacante obtenga información de la BD.'
    },
    {
        term: 'Código HTTP 500',
        def:  'Respuesta del servidor que indica un error interno no controlado',
        hint: 'Un 500 sin manejo puede exponer el stack trace y revelar la estructura de la base de datos al atacante.'
    },
];

let matchSelected = null;

function initMatching() {
    matchSelected = null;

    const termsShuffled = shuffle(MATCH_PAIRS.map(p => p.term));
    const defsShuffled  = shuffle(MATCH_PAIRS.map(p => ({ def: p.def, term: p.term })));

    const termsCol = document.getElementById('terms-column');
    const defsCol  = document.getElementById('definitions-column');
    termsCol.innerHTML = '';
    defsCol.innerHTML  = '';

    termsShuffled.forEach(term => {
        const el = document.createElement('div');
        el.className = 'matching-item';
        el.dataset.term = term;
        el.textContent = term;
        el.addEventListener('click', () => onMatchClick(el));
        termsCol.appendChild(el);
    });

    defsShuffled.forEach(({ def, term }) => {
        const el = document.createElement('div');
        el.className = 'matching-item';
        el.dataset.def  = def;
        el.dataset.term = term;
        el.textContent  = def;
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

    const second = el;
    second.classList.add('selected');

    // Determinar cuál es término (solo data-term) y cuál definición (data-def + data-term)
    let termEl, defEl;
    if (matchSelected.hasAttribute('data-def')) {
        defEl = matchSelected; termEl = second;
    } else {
        termEl = matchSelected; defEl = second;
    }

    // Si ambos son del mismo tipo (ambos terms o ambas defs), deseleccionar el anterior y seleccionar el nuevo
    const bothSameType = (termEl.hasAttribute('data-def') && defEl.hasAttribute('data-def')) ||
                         (!termEl.hasAttribute('data-def') && !defEl.hasAttribute('data-def'));
    if (bothSameType) {
        matchSelected.classList.remove('selected');
        second.classList.remove('selected');
        matchSelected = second;
        second.classList.add('selected');
        return;
    }

    const termKey = termEl.dataset.term;
    const defKey  = defEl.dataset.term;
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
        showMatchFeedback(`❌ Combinación incorrecta. ${pair ? pair.hint : 'Revisa la definición y vuelve a intentarlo.'}`, 'error');
        setTimeout(() => {
            termEl.classList.remove('selected', 'incorrect');
            defEl.classList.remove('selected', 'incorrect');
        }, 1300);
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
        showMatchFeedback('🎉 ¡Excelente! Dominaste todos los conceptos de seguridad SQL. Recuerda: nunca concatenes datos del usuario directamente en una consulta SQL.', 'success');
    }
}

function resetMatching() {
    initMatching();
    document.getElementById('matching-feedback').className = '';
    document.getElementById('matching-feedback').innerHTML = '';
}

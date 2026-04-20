// Tema 3: Seguridad API - Validaciones e Inyección SQL
// Actividades interactivas con tema verde

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas las actividades
    initWordSearch();
    initDragDrop();
    initMatching();
});

// ==================== ACTIVIDAD 1: SOPA DE LETRAS ====================
function initWordSearch() {
    const words = [
        'SQLINJECTION', 'VALIDATION', 'SANITIZE', 'ESCAPE', 'PREPARED',
        'STATEMENT', 'OWASP', 'AUTHENTICATION', 'AUTHORIZATION', 'ENCRYPTION',
        'HASHING', 'SALT', 'TOKEN', 'JWT', 'XSS', 'CSRF'
    ];

    const gridSize = 16;
    const grid = createEmptyGrid(gridSize);
    const placedWords = [];

    // Colocar palabras en la cuadrícula
    words.forEach(word => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
            const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const startRow = Math.floor(Math.random() * gridSize);
            const startCol = Math.floor(Math.random() * gridSize);

            if (canPlaceWord(grid, word, startRow, startCol, direction)) {
                placeWord(grid, word, startRow, startCol, direction);
                placedWords.push({
                    word: word,
                    startRow: startRow,
                    startCol: startCol,
                    direction: direction,
                    length: word.length
                });
                placed = true;
            }
            attempts++;
        }
    });

    // Llenar espacios vacíos con letras aleatorias
    fillEmptySpaces(grid);

    // Renderizar la cuadrícula
    renderWordSearchGrid(grid);

    // Configurar funcionalidad de selección
    setupWordSelection(placedWords);
}

function createEmptyGrid(size) {
    return Array(size).fill().map(() => Array(size).fill(''));
}

function canPlaceWord(grid, word, startRow, startCol, direction) {
    const wordLength = word.length;

    if (direction === 'horizontal') {
        if (startCol + wordLength > grid.length) return false;
        for (let i = 0; i < wordLength; i++) {
            if (grid[startRow][startCol + i] !== '' && grid[startRow][startCol + i] !== word[i]) {
                return false;
            }
        }
    } else { // vertical
        if (startRow + wordLength > grid.length) return false;
        for (let i = 0; i < wordLength; i++) {
            if (grid[startRow + i][startCol] !== '' && grid[startRow + i][startCol] !== word[i]) {
                return false;
            }
        }
    }

    return true;
}

function placeWord(grid, word, startRow, startCol, direction) {
    if (direction === 'horizontal') {
        for (let i = 0; i < word.length; i++) {
            grid[startRow][startCol + i] = word[i];
        }
    } else {
        for (let i = 0; i < word.length; i++) {
            grid[startRow + i][startCol] = word[i];
        }
    }
}

function fillEmptySpaces(grid) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            if (grid[row][col] === '') {
                grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

function renderWordSearchGrid(grid) {
    const container = document.getElementById('wordsearch-container');
    container.innerHTML = '';

    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'wordsearch-cell';
            cellElement.textContent = cell;
            cellElement.dataset.row = rowIndex;
            cellElement.dataset.col = colIndex;
            container.appendChild(cellElement);
        });
    });
}

function setupWordSelection(placedWords) {
    const cells = document.querySelectorAll('.wordsearch-cell');
    let selectedCells = [];
    let isSelecting = false;

    cells.forEach(cell => {
        cell.addEventListener('mousedown', startSelection);
        cell.addEventListener('mouseenter', continueSelection);
        cell.addEventListener('mouseup', endSelection);
    });

    document.addEventListener('mouseup', endSelection);

    function startSelection(e) {
        isSelecting = true;
        selectedCells = [e.target];
        updateSelectedCells();
        e.preventDefault();
    }

    function continueSelection(e) {
        if (isSelecting && !selectedCells.includes(e.target)) {
            selectedCells.push(e.target);
            updateSelectedCells();
        }
    }

    function endSelection() {
        if (isSelecting) {
            checkWord(selectedCells);
            selectedCells = [];
            updateSelectedCells();
            isSelecting = false;
        }
    }

    function updateSelectedCells() {
        cells.forEach(cell => cell.classList.remove('selected'));
        selectedCells.forEach(cell => cell.classList.add('selected'));
    }

    function checkWord(selectedCells) {
        if (selectedCells.length < 3) return;

        const word = selectedCells.map(cell => cell.textContent).join('');
        const reverseWord = word.split('').reverse().join('');

        const foundWord = placedWords.find(pw => pw.word === word || pw.word === reverseWord);

        if (foundWord) {
            selectedCells.forEach(cell => {
                cell.classList.add('found');
                cell.classList.remove('selected');
            });

            // Actualizar lista de palabras
            const wordItem = document.querySelector(`[data-word="${foundWord.word}"]`);
            if (wordItem) {
                wordItem.classList.add('found');
            }

            updateFoundCount();
        }
    }
}

function updateFoundCount() {
    const totalWords = 16;
    const foundWords = document.querySelectorAll('#words-to-find li.found').length;
    document.getElementById('found-count').textContent = foundWords;
    document.getElementById('total-words').textContent = totalWords;
}

function resetWordSearch() {
    document.querySelectorAll('.wordsearch-cell').forEach(cell => {
        cell.classList.remove('selected', 'found');
    });
    document.querySelectorAll('#words-to-find li').forEach(item => {
        item.classList.remove('found');
    });
    updateFoundCount();
}

// ==================== ACTIVIDAD 2: ARRASTRAR Y SOLTAR ====================
function initDragDrop() {
    const dragItems = document.querySelectorAll('.drag-item');
    const dropAreas = document.querySelectorAll('.drop-area');
    let draggedItem = null;

    // Configurar elementos arrastrables
    dragItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    // Configurar áreas de soltar
    dropAreas.forEach(area => {
        area.addEventListener('dragover', handleDragOver);
        area.addEventListener('drop', handleDrop);
        area.addEventListener('dragleave', handleDragLeave);
    });

    function handleDragStart(e) {
        draggedItem = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        draggedItem = null;
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.target.closest('.drop-area').classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.target.closest('.drop-area').classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        const dropArea = e.target.closest('.drop-area');
        dropArea.classList.remove('drag-over');

        if (draggedItem && dropArea.children.length === 0) {
            const dropZone = dropArea.closest('.drop-zone');
            const expectedAnswer = dropZone.dataset.expected;
            const draggedAnswer = draggedItem.dataset.correct;

            // Clonar el elemento arrastrado
            const clonedItem = draggedItem.cloneNode(true);
            clonedItem.style.position = 'static';
            clonedItem.style.transform = 'none';
            clonedItem.style.cursor = 'default';

            dropArea.appendChild(clonedItem);

            // Verificar si es correcto
            if (expectedAnswer === draggedAnswer) {
                dropZone.classList.add('correct');
                dropZone.classList.remove('incorrect');
                clonedItem.classList.add('correct');
            } else {
                dropZone.classList.add('incorrect');
                dropZone.classList.remove('correct');
                clonedItem.classList.add('incorrect');
            }

            // Ocultar el elemento original
            draggedItem.style.display = 'none';

            updateDragDropCount();
        }
    }
}

function updateDragDropCount() {
    const totalItems = 8;
    const correctItems = document.querySelectorAll('.drop-zone.correct').length;
    document.getElementById('drag-correct-count').textContent = correctItems;
    document.getElementById('drag-total-count').textContent = totalItems;
}

function resetDragDrop() {
    // Restaurar elementos arrastrables
    document.querySelectorAll('.drag-item').forEach(item => {
        item.style.display = 'block';
        item.classList.remove('dragging');
    });

    // Limpiar áreas de soltar
    document.querySelectorAll('.drop-area').forEach(area => {
        area.innerHTML = '';
    });

    // Resetear clases de zonas
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('correct', 'incorrect');
    });

    updateDragDropCount();
}

// ==================== ACTIVIDAD 3: UNIR PALABRAS ====================
function initMatching() {
    const matchingItems = document.querySelectorAll('.matching-item');
    let selectedItems = [];
    let firstSelected = null;

    // Mapeo de vulnerabilidades a soluciones
    const correctMatches = {
        'SQL Injection': 'Usar prepared statements y parámetros preparados',
        'XSS': 'Escapar caracteres especiales y validar entrada',
        'CSRF': 'Implementar tokens CSRF y validar origen de requests',
        'Weak Passwords': 'Enforzar políticas de contraseñas seguras',
        'No Input Validation': 'Validar y sanitizar todos los datos de entrada',
        'Plain Text Passwords': 'Usar hashing con salt (bcrypt, Argon2)',
        'Session Hijacking': 'Usar HTTPS y regenerar session IDs',
        'Man-in-the-Middle': 'Implementar HTTPS y certificados SSL/TLS'
    };

    matchingItems.forEach(item => {
        item.addEventListener('click', handleMatchingClick);
    });

    function handleMatchingClick(e) {
        const item = e.target.closest('.matching-item');

        if (item.classList.contains('correct')) return;

        if (selectedItems.length === 0) {
            // Primera selección
            firstSelected = item;
            item.classList.add('selected');
            selectedItems.push(item);
        } else if (selectedItems.length === 1) {
            // Segunda selección
            const secondSelected = item;

            if (secondSelected === firstSelected) {
                // Deseleccionar si hace clic en el mismo
                firstSelected.classList.remove('selected');
                selectedItems = [];
                firstSelected = null;
                return;
            }

            item.classList.add('selected');
            selectedItems.push(item);

            // Verificar match
            const term1 = firstSelected.dataset.term || firstSelected.dataset.def;
            const term2 = secondSelected.dataset.term || secondSelected.dataset.def;

            const isCorrectMatch =
                (correctMatches[term1] === term2) ||
                (correctMatches[term2] === term1);

            if (isCorrectMatch) {
                firstSelected.classList.add('correct');
                secondSelected.classList.add('correct');
                firstSelected.classList.remove('selected');
                secondSelected.classList.remove('selected');
                updateMatchingCount();
            } else {
                firstSelected.classList.add('incorrect');
                secondSelected.classList.add('incorrect');

                setTimeout(() => {
                    firstSelected.classList.remove('selected', 'incorrect');
                    secondSelected.classList.remove('selected', 'incorrect');
                }, 1000);
            }

            selectedItems = [];
            firstSelected = null;
        }
    }
}

function updateMatchingCount() {
    const totalPairs = 8;
    const correctPairs = document.querySelectorAll('.matching-item.correct').length / 2;
    document.getElementById('matching-correct-count').textContent = correctPairs;
    document.getElementById('matching-total-count').textContent = totalPairs;
}

function resetMatching() {
    document.querySelectorAll('.matching-item').forEach(item => {
        item.classList.remove('selected', 'correct', 'incorrect');
    });
    updateMatchingCount();
}

function markWordAsFound(cells) {
    for(let cell of cells) {
        const cellDiv = document.querySelector(`.grid-cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
        cellDiv.classList.add('found');
        cellDiv.classList.remove('selected');
    }
    selectedCells = [];
    updateWordListUI();
}

function clearSelection() {
    selectedCells.forEach(cell => {
        const cellDiv = document.querySelector(`.grid-cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
        cellDiv.classList.remove('selected');
    });
    selectedCells = [];
}

function updateWordListUI() {
    const items = document.querySelectorAll('#words-to-find li');
    items.forEach(item => {
        const word = item.getAttribute('data-word');
        if(foundWords.has(word)) {
            item.classList.add('found-word');
        } else {
            item.classList.remove('found-word');
        }
    });
}

function updateCounters() {
    const found = foundWords.size;
    const total = wordsToFind.length;
    document.getElementById('found-count').textContent = found;
    document.getElementById('total-words').textContent = total;
    
    const errorsDiv = document.getElementById('wordsearch-errors');
    const missing = wordsToFind.filter(w => !foundWords.has(w));
    if(missing.length > 0) {
        errorsDiv.innerHTML = `<div class="error-item">⚠️ Palabras por encontrar: ${missing.join(', ')}</div>`;
    } else {
        errorsDiv.innerHTML = '<div class="error-item">🎉 ¡Felicidades! Encontraste todas las palabras.</div>';
    }
}

function resetWordSearch() {
    foundWords.clear();
    selectedCells = [];
    generateWordSearch();
    updateCounters();
}

// ==================== ARRASTRAR Y SOLTAR ====================
let currentDragItem = null;

function initDragDrop() {
    const draggables = document.querySelectorAll('.drag-item');
    const dropZones = document.querySelectorAll('.drop-zone .drop-area');
    
    draggables.forEach(drag => {
        drag.setAttribute('draggable', 'true');
        drag.addEventListener('dragstart', handleDragStart);
        drag.addEventListener('dragend', handleDragEnd);
    });
    
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
    });
    
    updateDragCounters();
}

function handleDragStart(e) {
    currentDragItem = this;
    this.classList.add('dragging');
    e.dataTransfer.setData('text/plain', this.textContent);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    if(currentDragItem) {
        currentDragItem.classList.remove('dragging');
        currentDragItem = null;
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    if(!currentDragItem) return;
    
    const dropZone = this;
    const parentZone = dropZone.closest('.drop-zone');
    const expectedType = parentZone.getAttribute('data-expected');
    const correctType = currentDragItem.getAttribute('data-correct');
    
    if(currentDragItem.classList.contains('dropped')) {
        return;
    }
    
    if(expectedType === correctType) {
        const clonedItem = currentDragItem.cloneNode(true);
        clonedItem.classList.add('dropped');
        clonedItem.setAttribute('draggable', 'false');
        clonedItem.style.opacity = '0.7';
        clonedItem.style.cursor = 'default';
        dropZone.appendChild(clonedItem);
        currentDragItem.style.display = 'none';
        currentDragItem.classList.add('dropped');
    } else {
        showDragError(currentDragItem.textContent, expectedType);
    }
    
    updateDragCounters();
}

function showDragError(itemText, expected) {
    const correctType = currentDragItem.getAttribute('data-correct');
    const errorsDiv = document.getElementById('drag-errors');
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-item';
    errorMsg.textContent = `❌ "${itemText}" pertenece a ${correctType}, no a ${expected}`;
    errorsDiv.appendChild(errorMsg);
    setTimeout(() => {
        errorMsg.remove();
    }, 3000);
}

function updateDragCounters() {
    const allItems = document.querySelectorAll('#drag-items .drag-item');
    const droppedItems = document.querySelectorAll('#drag-items .drag-item[style*="display: none"]');
    const correctCount = droppedItems.length;
    const total = allItems.length;
    
    document.getElementById('drag-correct-count').textContent = correctCount;
    document.getElementById('drag-total-count').textContent = total;
    
    const errorsDiv = document.getElementById('drag-errors');
    if(correctCount === total && total > 0) {
        errorsDiv.innerHTML = '<div class="error-item">🎉 ¡Excelente! Todas las sentencias están correctamente clasificadas.</div>';
    } else {
        const pending = total - correctCount;
        if(pending > 0 && pending !== total) {
            errorsDiv.innerHTML = `<div class="error-item">📌 Faltan colocar ${pending} elemento(s) correctamente.</div>`;
        }
    }
}

function resetDragDrop() {
    location.reload();
}

// ==================== UNIR PALABRAS (MATCHING) ====================
let selectedTerm = null;
let matchedPairs = new Set();

function initMatching() {
    // Barajar las definiciones para orden aleatorio
    const defColumn = document.getElementById('definitions-column');
    const definitions = Array.from(defColumn.querySelectorAll('.matching-item'));
    const shuffledDefs = definitions.sort(() => Math.random() - 0.5);
    defColumn.innerHTML = '<h3>📝 Definiciones</h3>';
    shuffledDefs.forEach(def => defColumn.appendChild(def));
    
    const terms = document.querySelectorAll('#terms-column .matching-item');
    const defs = document.querySelectorAll('#definitions-column .matching-item');
    
    terms.forEach(term => {
        term.addEventListener('click', () => handleTermClick(term));
    });
    
    defs.forEach(def => {
        def.addEventListener('click', () => handleDefClick(def));
    });
    
    updateMatchingCounters();
}

function handleTermClick(term) {
    if(term.classList.contains('matched')) return;
    
    document.querySelectorAll('.matching-item.selected').forEach(item => {
        item.classList.remove('selected');
    });
    
    term.classList.add('selected');
    selectedTerm = term;
}

function handleDefClick(def) {
    if(def.classList.contains('matched')) return;
    
    if(selectedTerm && !selectedTerm.classList.contains('matched')) {
        const termWord = selectedTerm.getAttribute('data-term');
        const defText = def.getAttribute('data-def');
        
        if(termWord === defText) {
            selectedTerm.classList.add('matched');
            def.classList.add('matched');
            selectedTerm.classList.remove('selected');
            matchedPairs.add(termWord);
            updateMatchingCounters();
        } else {
            showMatchingError(termWord, defText);
        }
        selectedTerm = null;
    } else if(selectedTerm && selectedTerm.classList.contains('matched')) {
        selectedTerm = null;
    } else {
        document.querySelectorAll('.matching-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        def.classList.add('selected');
        selectedTerm = def;
    }
}

function showMatchingError(term, definition) {
    const errorsDiv = document.getElementById('matching-errors');
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-item';
    errorMsg.textContent = `❌ "${term}" no coincide con "${definition}"`;
    errorsDiv.appendChild(errorMsg);
    setTimeout(() => {
        errorMsg.remove();
    }, 3000);
}

function updateMatchingCounters() {
    const total = 8;
    const correct = matchedPairs.size;
    document.getElementById('matching-correct-count').textContent = correct;
    document.getElementById('matching-total-count').textContent = total;
    
    const errorsDiv = document.getElementById('matching-errors');
    if(correct === total) {
        errorsDiv.innerHTML = '<div class="error-item">🎉 ¡Perfecto! Todos los conceptos están correctamente emparejados.</div>';
    } else {
        const pending = total - correct;
        errorsDiv.innerHTML = `<div class="error-item">📌 Faltan emparejar ${pending} concepto(s).</div>`;
    }
}

function resetMatching() {
    matchedPairs.clear();
    selectedTerm = null;
    document.querySelectorAll('.matching-item').forEach(item => {
        item.classList.remove('matched', 'selected');
    });
    updateMatchingCounters();
    document.getElementById('matching-errors').innerHTML = '';
}

// ==================== INICIALIZACIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    generateWordSearch();
    initDragDrop();
    initMatching();
    document.getElementById('total-words').textContent = wordsToFind.length;
    document.getElementById('drag-total-count').textContent = document.querySelectorAll('#drag-items .drag-item').length;
    document.getElementById('matching-total-count').textContent = '8';
});
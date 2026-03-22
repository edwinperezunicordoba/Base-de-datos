// ==================== SOPA DE LETRAS ====================
let wordSearchGrid = [];
let selectedCells = [];
let foundWords = new Set();

const wordsToFind = ['INSERT', 'SELECT', 'UPDATE', 'DELETE', 'CRUD', 'WHERE', 'DATOS', 'REGISTROS', 'TABLA', 'DML'];

// Generar sopa de letras
function generateWordSearch() {
    const size = 12;
    const grid = Array(size).fill().map(() => Array(size).fill(''));
    
    // Colocar palabras automáticamente desde wordsToFind con direcciones aleatorias
    const words = wordsToFind;
    const directions = [
        { name: 'horizontal', dr: 0, dc: 1 },
        { name: 'vertical', dr: 1, dc: 0 }
    ];
    
    for(let word of words) {
        let placed = false;
        let attempts = 0;
        while(!placed && attempts < 100) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const maxRow = dir.name === 'horizontal' ? size - 1 : size - word.length;
            const maxCol = dir.name === 'vertical' ? size - 1 : size - word.length;
            const startRow = Math.floor(Math.random() * (maxRow + 1));
            const startCol = Math.floor(Math.random() * (maxCol + 1));
            
            // Verificar si se puede colocar
            let canPlace = true;
            for(let i = 0; i < word.length; i++) {
                const r = startRow + i * dir.dr;
                const c = startCol + i * dir.dc;
                const currentLetter = grid[r][c];
                if(currentLetter !== '' && currentLetter !== word[i]) {
                    canPlace = false;
                    break;
                }
            }
            
            if(canPlace) {
                // Colocar la palabra
                for(let i = 0; i < word.length; i++) {
                    const r = startRow + i * dir.dr;
                    const c = startCol + i * dir.dc;
                    grid[r][c] = word[i];
                }
                placed = true;
            }
            attempts++;
        }
        // Si no se pudo colocar después de intentos, intentar forzar en una posición fija (último recurso)
        if(!placed) {
            // Colocar horizontal en la primera fila disponible
            let startRow = 0;
            while(startRow < size && grid[startRow][0] !== '') startRow++;
            if(startRow < size) {
                for(let i = 0; i < Math.min(word.length, size); i++) {
                    grid[startRow][i] = word[i];
                }
            }
        }
    }
    
    // Rellenar con letras aleatorias
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for(let i = 0; i < size; i++) {
        for(let j = 0; j < size; j++) {
            if(!grid[i][j]) {
                grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
    
    wordSearchGrid = grid;
    renderWordSearch();
}

function renderWordSearch() {
    const container = document.getElementById('wordsearch-container');
    const gridSize = wordSearchGrid.length;
    
    let html = '<div class="wordsearch-grid">';
    for(let i = 0; i < gridSize; i++) {
        for(let j = 0; j < gridSize; j++) {
            const isFound = isCellInFoundWords(i, j);
            html += `<div class="grid-cell ${isFound ? 'found' : ''}" data-row="${i}" data-col="${j}" onclick="selectCell(${i}, ${j})">${wordSearchGrid[i][j]}</div>`;
        }
    }
    html += '</div>';
    container.innerHTML = html;
    updateWordListUI();
}

function isCellInFoundWords(row, col) {
    for(let word of foundWords) {
        const pos = getWordPositions(word);
        if(pos) {
            for(let p of pos) {
                if(p.row === row && p.col === col) return true;
            }
        }
    }
    return false;
}

function getWordPositions(word) {
    const positions = [];
    const grid = wordSearchGrid;
    
    // Buscar horizontal
    for(let i = 0; i < grid.length; i++) {
        for(let j = 0; j <= grid.length - word.length; j++) {
            let match = true;
            for(let k = 0; k < word.length; k++) {
                if(grid[i][j+k] !== word[k]) {
                    match = false;
                    break;
                }
            }
            if(match) {
                for(let k = 0; k < word.length; k++) {
                    positions.push({row: i, col: j+k});
                }
                return positions;
            }
        }
    }
    
    // Buscar vertical
    for(let i = 0; i <= grid.length - word.length; i++) {
        for(let j = 0; j < grid.length; j++) {
            let match = true;
            for(let k = 0; k < word.length; k++) {
                if(grid[i+k][j] !== word[k]) {
                    match = false;
                    break;
                }
            }
            if(match) {
                for(let k = 0; k < word.length; k++) {
                    positions.push({row: i+k, col: j});
                }
                return positions;
            }
        }
    }
    
    return null;
}

function selectCell(row, col) {
    const cell = document.querySelector(`.grid-cell[data-row="${row}"][data-col="${col}"]`);
    if(cell.classList.contains('found')) return;
    
    if(cell.classList.contains('selected')) {
        cell.classList.remove('selected');
        selectedCells = selectedCells.filter(c => !(c.row === row && c.col === col));
    } else {
        cell.classList.add('selected');
        selectedCells.push({row, col});
    }
    
    checkSelectedWord();
}

function checkSelectedWord() {
    if(selectedCells.length < 3) return;
    
    // Ordenar celdas por fila y columna
    const sorted = [...selectedCells].sort((a,b) => {
        if(a.row === b.row) return a.col - b.col;
        if(a.col === b.col) return a.row - b.row;
        return 0;
    });
    
    // Verificar si están en la misma fila o columna
    const sameRow = sorted.every(cell => cell.row === sorted[0].row);
    const sameCol = sorted.every(cell => cell.col === sorted[0].col);
    
    if(!sameRow && !sameCol) {
        // No limpiar selección, permitir al usuario corregir
        return;
    }
    
    let word = '';
    for(let cell of sorted) {
        word += wordSearchGrid[cell.row][cell.col];
    }
    
    // Buscar la palabra
    const foundWord = wordsToFind.find(w => w === word);
    if(foundWord && !foundWords.has(foundWord)) {
        foundWords.add(foundWord);
        markWordAsFound(sorted);
        updateCounters();
    }
    // Remover el else que limpiaba la selección
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
const quizData = [
    { q: "¿Qué es un Endpoint en una API?", a: ["Una base de datos", "Una URL específica que representa un recurso", "Un lenguaje de programación", "Un servidor físico"], c: 1 },
    { q: "¿Qué significan las siglas REST?", a: ["Remote State Transfer", "Representational State Transfer", "Reset Entity Standard Text", "Relational System Transfer"], c: 1 },
    { q: "¿Cuál es la convención correcta para nombrar una URL en REST?", a: ["/get_productos", "/productos", "/crearProducto", "/Producto"], c: 1 },
    { q: "Si quieres crear un nuevo recurso, ¿qué método HTTP debes usar?", a: ["GET", "PUT", "DELETE", "POST"], c: 3 },
    { q: "¿Qué código de estado HTTP indica que un recurso fue creado exitosamente?", a: ["200 OK", "404 Not Found", "201 Created", "500 Error"], c: 2 },
    { q: "El método DELETE se utiliza para eliminar un recurso. ¿Cuál es la URL recomendada según REST?", a: ["/borrar-producto/5", "/productos/:id", "/productos/eliminar", "/delete_producto"], c: 1 },
    { q: "¿Qué código de estado usarías si un usuario intenta registrar un email que ya existe (conflicto)?", a: ["200", "409 Conflict", "400 Bad Request", "204"], c: 1 },
    { q: "¿Qué método HTTP y URL usarías para obtener la lista de todos los usuarios?", a: ["POST /usuarios", "GET /usuario", "GET /usuarios", "PUT /usuarios"], c: 2 },
    { q: "¿Qué código de estado indica que la operación fue exitosa pero no hay nada que devolver (común en DELETE)?", a: ["200", "204 No Content", "404", "201"], c: 1 },
    { q: "¿A qué categoría de error pertenece el código 500?", a: ["Error del cliente", "Éxito", "Redirección", "Internal Server Error (Error inesperado en el servidor)"], c: 3 }
];

const quizContainer = document.getElementById('quiz');
const submitBtn = document.getElementById('submit-btn');
const errorBox = document.getElementById('error-message');
const resultsDiv = document.getElementById('results');

function initQuiz() {
    quizContainer.innerHTML = quizData.map((data, i) => `
        <div class="question-block" id="block-${i}">
            <p class="question-text">${i + 1}. ${data.q}</p>
            <div class="options">
                ${data.a.map((opt, j) => `
                    <label id="label-${i}-${j}">
                        <input type="radio" name="q${i}" value="${j}"> ${opt}
                    </label>
                `).join('')}
            </div>
            <div id="feedback-${i}" class="feedback hidden"></div>
        </div>
    `).join('');
}

submitBtn.addEventListener('click', () => {
    let answeredCount = 0;
    const userAnswers = [];

    quizData.forEach((_, i) => {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        if (selected) {
            answeredCount++;
            userAnswers.push(parseInt(selected.value));
        }
    });

    if (answeredCount < quizData.length) {
        errorBox.classList.remove('hidden');
        window.scrollTo(0, errorBox.offsetTop - 50);
        return;
    }

    errorBox.classList.add('hidden');
    submitBtn.classList.add('hidden');
    document.getElementById('retry-btn').classList.remove('hidden');
    
    let score = 0;
    quizData.forEach((data, i) => {
        const isCorrect = userAnswers[i] === data.c;
        const feedbackEl = document.getElementById(`feedback-${i}`);
        const selectedLabel = document.getElementById(`label-${i}-${userAnswers[i]}`);
        
        feedbackEl.classList.remove('hidden');
        if (isCorrect) {
            score++;
            selectedLabel.classList.add('correct-row');
            feedbackEl.innerHTML = `<span class="correct-text">✓ ¡Correcto!</span>`;
        } else {
            selectedLabel.classList.add('incorrect-row');
            feedbackEl.innerHTML = `<span class="incorrect-text">✗ Incorrecto. La respuesta correcta era: ${data.a[data.c]}</span>`;
        }
    });

    const percentage = (score / quizData.length) * 100;
    const passed = percentage >= 70;

    resultsDiv.classList.remove('hidden');
    resultsDiv.style.backgroundColor = passed ? "#d4edda" : "#f8d7da";
    
    document.getElementById('score-title').innerText = `Resultado: ${percentage}% (${score} / ${quizData.length})`;
    document.getElementById('score-text').innerHTML = passed 
        ? `<strong>¡Excelente!</strong> Dominas los conceptos de APIs RESTful.` 
        : `<strong>No has aprobado (mínimo 70%).</strong> Revisa la tabla de verbos HTTP y los códigos de estado antes de intentar nuevamente.`;

    window.scrollTo(0, 0);
});

initQuiz();
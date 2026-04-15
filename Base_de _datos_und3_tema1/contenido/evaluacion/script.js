const quizData = [
    { q: "¿Cuál es el puerto por defecto para PostgreSQL?", a: ["3306", "5432", "80", "1521"], c: 1 },
    { q: "¿Qué componente traduce órdenes de Node.js al lenguaje de la BD?", a: ["El Pool", "La Cadena", "El Driver", "El Host"], c: 2 },
    { q: "En producción, ¿dónde se deben guardar las contraseñas?", a: ["En el código", "En archivos .env", "En la base de datos", "En el README"], c: 1 },
    { q: "¿Qué ventaja principal ofrece el 'Pool de conexiones'?", a: ["Seguridad extra", "Ahorro de RAM", "Reutilización de conexiones", "Cifra los datos"], c: 2 },
    { q: "Si usas PostgreSQL en Node.js, ¿qué librería es el estándar?", a: ["mysql2", "psycopg2", "pg (node-postgres)", "mysqli"], c: 2 },
    { q: "La estructura 'protocolo://usuario:contraseña@host' es:", a: ["Un Driver", "Un Pool", "Una Cadena de Conexión", "Un Query Builder"], c: 2 },
    { q: "¿Qué característica de mysql2 facilita el código asíncrono?", a: ["Soporte para Promesas", "Uso de Callbacks", "Uso de XML", "Velocidad"], c: 0 },
    { q: "¿Qué enfoque trata las tablas como objetos de programación?", a: ["SQL Directo", "ORM", "Driver Nativo", "JSON Builder"], c: 1 },
    { q: "¿Por qué se recomienda SQL directo en nivel técnico?", a: ["Es más lento", "Permite entender qué pasa con los datos", "No requiere instalar nada", "Es más moderno"], c: 1 },
    { q: "¿Qué sucede si no cierras una conexión básica (Client/Connection)?", a: ["Se cierra sola", "Se desperdician recursos", "La BD explota", "Se acelera el PC"], c: 1 }
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

    // Restricción: Validar que todas estén respondidas
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

    // Lógica de Aprobación
    const percentage = (score / quizData.length) * 100;
    const passed = percentage >= 70; // 70% para aprobar

    resultsDiv.classList.remove('hidden');
    resultsDiv.style.backgroundColor = passed ? "#d4edda" : "#f8d7da";
    
    document.getElementById('score-title').innerText = `Resultado: ${percentage}% (${score} / ${quizData.length})`;
    document.getElementById('score-text').innerHTML = passed 
        ? `<strong>¡Felicidades!</strong> Has aprobado la evaluación técnica.` 
        : `<strong>No alcanzaste el puntaje mínimo (70%).</strong> Te recomendamos repasar el material sobre Pools de conexiones y Drivers.`;

    window.scrollTo(0, 0);
});

initQuiz();
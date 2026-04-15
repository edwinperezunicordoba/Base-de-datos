javascript
const quizData = [
    { q: "¿Qué ocurre en un ataque de Inyección SQL?", a: ["Se borra el disco duro del servidor", "Se envía código malicioso que la aplicación ejecuta como instrucción legítima", "Se satura la red con peticiones falsas", "Se cambia el CSS de la página"], c: 1 },
    { q: "¿Cuál es la causa técnica principal de la Inyección SQL?", a: ["Usar contraseñas cortas", "Cerrar mal la conexión", "Concatenar variables directamente en la consulta SQL", "No usar HTTPS"], c: 2 },
    { q: "Si un atacante escribe ' OR '1'='1 en un login mal programado, ¿qué busca?", a: ["Cambiar su nombre de usuario", "Bypass de autenticación (entrar sin contraseña)", "Borrar todas las tablas", "Cifrar la base de datos"], c: 1 },
    { q: "¿Cuál es la técnica robusta para evitar la inyección SQL?", a: ["Usar mayúsculas en SQL", "Consultas Preparadas (Prepared Statements)", "Validar solo en el Front-end", "Ocultar el puerto de la base de datos"], c: 1 },
    { q: "¿Qué función cumplen los 'marcadores' (?) en una consulta preparada?", a: ["Son comentarios para el programador", "Representan donde irán los datos de forma segura sin ser ejecutados como código", "Sirven para hacer preguntas a la base de datos", "Indican un error en la sintaxis"], c: 1 },
    { q: "¿Por qué NO debemos confiar únicamente en las validaciones del Front-end (HTML/JS)?", a: ["Porque son muy lentas", "Porque pueden ser saltadas o manipuladas fácilmente", "Porque el navegador no las entiende", "Porque ocupan mucho espacio"], c: 1 },
    { q: "¿Qué herramienta se usa comúnmente para validar el formato de un correo electrónico?", a: ["Consultas SQL", "Expresiones Regulares (Regex)", "Un Pool de conexiones", "Un archivo .env"], c: 1 },
    { q: "¿Cómo debe responder el servidor ante un error interno de base de datos?", a: ["Mostrando el error completo (ej: Table not found)", "Reiniciando el servidor", "Con un mensaje genérico (ej: Ocurrió un problema interno)", "Enviando el código SQL al cliente"], c: 2 },
    { q: "¿Qué tipo de validación asegura que un campo 'precio' no reciba letras?", a: ["Validación de longitud", "Validación de tipo de dato", "Validación de formato Regex", "Consulta preparada"], c: 1 },
    { q: "En el ejemplo 'db.execute(query, [id])', ¿qué representa el array [id]?", a: ["Los nombres de las tablas", "La contraseña de la base de datos", "Los datos enviados por separado de la estructura de la consulta", "El puerto de conexión"], c: 2 }
];

const quizContainer = document.getElementById('quiz');
const submitBtn = document.getElementById('submit-btn');
const errorBox = document.getElementById('error-message');
const resultsDiv = document.getElementById('results');

function initQuiz() {
    quizContainer.innerHTML = quizData.map((data, i) => `
        <div class="question-block">
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
    
    document.getElementById('score-title').innerText = `Puntaje: ${percentage}% (${score} / ${quizData.length})`;
    document.getElementById('score-text').innerHTML = passed 
        ? `<strong>¡Excelente!</strong> Has demostrado conocimientos sólidos en seguridad de bases de datos.` 
        : `<strong>Aún no superas el mínimo (70%).</strong> Repasa los conceptos de Inyección SQL y Consultas Preparadas antes de volver a intentarlo.`;

    window.scrollTo(0, 0);
});

initQuiz();
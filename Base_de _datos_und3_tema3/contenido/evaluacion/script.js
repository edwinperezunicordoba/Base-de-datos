// ==================== EVALUACIÓN ====================

// Respuestas correctas
const examAnswers = {
    q1: 'b',
    q2: 'b',
    q3: 'c',
    q4: 'b',
    q5: 'c',
    q6: 'b',
    q7: 'b',
    q8: 'c',
    q9: 'd',
    q10: 'c'
};

// Calificar evaluación
function gradeExam() {
    let score = 0;
    const errors = [];
    const userAnswers = {};
    
    // Limpiar estilos de preguntas incorrectas anteriores
    document.querySelectorAll('.question').forEach(q => {
        q.classList.remove('incorrect');
    });
    
    // Evaluar cada pregunta
    for(let i = 1; i <= 10; i++) {
        const selected = document.querySelector(`input[name="q${i}"]:checked`);
        const questionDiv = document.querySelector(`.question:nth-child(${i})`);
        
        if(selected && selected.value === examAnswers[`q${i}`]) {
            score++;
            userAnswers[`q${i}`] = true;
        } else {
            const questionText = questionDiv.querySelector('p').innerText;
            const correctAnswer = getCorrectAnswerText(i);
            const userAnswerText = selected ? getAnswerLetterText(i, selected.value) : 'No respondida';
            
            errors.push({
                number: i,
                question: questionText.substring(0, 100),
                correct: correctAnswer,
                user: userAnswerText
            });
            
            userAnswers[`q${i}`] = false;
            questionDiv.classList.add('incorrect');
        }
    }
    
    // Mostrar resultados
    document.getElementById('exam-score').textContent = score;
    const examResults = document.getElementById('exam-results');
    examResults.style.display = 'block';
    
    const errorsListDiv = document.getElementById('exam-errors-list');
    
    if(errors.length > 0) {
        let errorsHtml = '<h4>❌ Preguntas incorrectas:</h4>';
        errors.forEach(err => {
            errorsHtml += `
                <div class="error-item" style="margin-bottom: 12px;">
                    <strong>Pregunta ${err.number}:</strong><br>
                    <span style="color: #dc3545;">Tu respuesta: ${err.user}</span><br>
                    <span style="color: #28a745;">Respuesta correcta: ${err.correct}</span>
                </div>
            `;
        });
        errorsListDiv.innerHTML = errorsHtml;
    } else {
        errorsListDiv.innerHTML = '<div class="error-item" style="background: #d4edda; color: #155724; border-left-color: #28a745;">🎉 ¡Excelente! Obtuviste calificación perfecta. ¡Dominas el tema de DDL!</div>';
    }
    
    // Scroll a resultados
    examResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Obtener texto de respuesta correcta
function getCorrectAnswerText(questionNumber) {
    const correctAnswers = {
        1: 'b) Definir, gestionar y modificar la estructura de los objetos de una BD',
        2: 'b) CREATE, ALTER, DROP',
        3: 'c) NOT NULL',
        4: 'b) Elimina la tabla y su estructura permanentemente',
        5: 'c) ALTER TABLE clientes ADD ciudad VARCHAR(100);',
        6: 'b) DROP elimina tabla y estructura; TRUNCATE vacía datos pero mantiene estructura',
        7: 'b) El valor se genera automáticamente y es clave primaria',
        8: 'c) DECIMAL(10,2)',
        9: 'd) UNIQUE',
        10: 'c) Son irreversibles sin un respaldo (backup)'
    };
    return correctAnswers[questionNumber] || 'No especificada';
}

// Obtener texto de respuesta del usuario
function getAnswerLetterText(questionNumber, letter) {
    const answerTexts = {
        1: {'a': 'a) Manipular los datos almacenados en las tablas', 'b': 'b) Definir, gestionar y modificar la estructura de los objetos de una BD', 'c': 'c) Controlar los permisos de los usuarios', 'd': 'd) Optimizar consultas SQL'},
        2: {'a': 'a) INSERT, SELECT, DELETE', 'b': 'b) CREATE, ALTER, DROP', 'c': 'c) ADD, MODIFY, REMOVE', 'd': 'd) OPEN, CLOSE, FETCH'},
        3: {'a': 'a) UNIQUE', 'b': 'b) PRIMARY KEY', 'c': 'c) NOT NULL', 'd': 'd) DEFAULT'},
        4: {'a': 'a) Elimina solo los datos de la tabla, manteniendo su estructura', 'b': 'b) Elimina la tabla y su estructura permanentemente', 'c': 'c) Elimina una columna específica', 'd': 'd) Vacía los datos pero conserva la tabla'},
        5: {'a': 'a) CREATE COLUMN ciudad IN clientes;', 'b': 'b) ADD COLUMN ciudad TO clientes;', 'c': 'c) ALTER TABLE clientes ADD ciudad VARCHAR(100);', 'd': 'd) MODIFY TABLE clientes ADD ciudad;'},
        6: {'a': 'a) DROP elimina solo datos; TRUNCATE elimina estructura', 'b': 'b) DROP elimina tabla y estructura; TRUNCATE vacía datos pero mantiene estructura', 'c': 'c) Son sinónimos', 'd': 'd) TRUNCATE no se puede deshacer, DROP sí'},
        7: {'a': 'a) La columna acepta valores nulos', 'b': 'b) El valor se genera automáticamente y es clave primaria', 'c': 'c) Solo permite números negativos', 'd': 'd) Es una clave foránea'},
        8: {'a': 'a) INT', 'b': 'b) VARCHAR', 'c': 'c) DECIMAL(10,2)', 'd': 'd) DATE'},
        9: {'a': 'a) NOT NULL', 'b': 'b) PRIMARY KEY', 'c': 'c) FOREIGN KEY', 'd': 'd) UNIQUE'},
        10: {'a': 'a) Son lentas y afectan el rendimiento', 'b': 'b) Requieren permisos especiales', 'c': 'c) Son irreversibles sin un respaldo (backup)', 'd': 'd) Solo pueden ejecutarse en horario nocturno'}
    };
    return answerTexts[questionNumber]?.[letter] || `Opción ${letter.toUpperCase()}`;
}

// Reiniciar evaluación
function resetExam() {
    // Limpiar todos los radios seleccionados
    const radioButtons = document.querySelectorAll('#exam-form input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.checked = false;
    });
    
    // Limpiar estilos de preguntas incorrectas
    document.querySelectorAll('.question').forEach(q => {
        q.classList.remove('incorrect');
    });
    
    // Ocultar resultados
    const examResults = document.getElementById('exam-results');
    examResults.style.display = 'none';
    
    // Limpiar lista de errores
    document.getElementById('exam-errors-list').innerHTML = '';
    
    // Scroll al inicio de la evaluación
    document.getElementById('exam').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
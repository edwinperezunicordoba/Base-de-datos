// --- Evaluación Quiz ---
const quizData = [
    {
        question: "La escucha activa no es solo captar sonidos, sino que requiere atención consciente y completa. Los tres pasos o dimensiones fundamentales de este proceso para lograr una comprensión adecuada del mensaje son:",
        options: [
            "a. Distraer, interrumpir y juzgar.",
            "b. Percibir, procesar y responder.",
            "c. Contactar, hablar y solucionar.",
            "d. Escucha pasiva, selectiva y activa."
        ],
        answer: "b. Percibir, procesar y responder."
    },
    {
        question: "Uno de los elementos clave de la escucha activa requiere que la persona oyente suspenda el juicio sobre las palabras o acciones del interlocutor. Al hacerlo, se crea un espacio seguro para la expresión libre. ¿A qué elemento se refiere esta descripción?",
        options: [
            "a. Clarificar lo que se escuchó.",
            "b. Retroalimentación.",
            "c. Empatía.",
            "d. No juzgar."
        ],
        answer: "d. No juzgar."
    },
    {
        question: "Cuando una persona está enojada, ansiosa o triste mientras intenta escuchar a otra, puede que no logre entender bien el mensaje porque su atención está enfocada en sus sentimientos internos. Este obstáculo que impide la buena escucha activa es una barrera causada por:",
        options: [
            "a. Prejuicios.",
            "b. Distracciones.",
            "c. Emociones.",
            "d. Querer hablar siempre."
        ],
        answer: "c. Emociones."
    },
    {
        question: "La técnica de paráfrasis (o reformulación) se considera esencial en la escucha activa. Cuando utilizas esta técnica repitiendo el mensaje del emisor con tus propias palabras, ¿cuál es el objetivo principal que buscas?",
        options: [
            "a. Dar una solución inmediata al problema de la otra persona.",
            "b. Demostrar que has escuchado y comprendido el mensaje.",
            "c. Evaluar si la preocupación del compañero tiene lógica o evidencia.",
            "d. Intentar cambiar el tema de la conversación para evitar un conflicto."
        ],
        answer: "b. Demostrar que has escuchado y comprendido el mensaje."
    },
    {
        question: "Estás en una situación donde tu actitud es de distanciamiento analítico y escepticismo razonable (por ejemplo, al revisar un informe o una propuesta). Esta actitud es propia de la escucha crítica porque tu propósito principal es:",
        options: [
            "a. Comprender la experiencia emocional y la perspectiva personal del orador.",
            "b. Acompañar al emisor con validación y no juicio para fortalecer la relación.",
            "c. Buscar apoyo socioemocional ante un conflicto o problema personal.",
            "d. Evaluar la calidad de la información y la solidez de los argumentos."
        ],
        answer: "d. Evaluar la calidad de la información y la solidez de los argumentos."
    }
];

const quizContainer = document.getElementById('quiz-container');
if(quizContainer) {
    quizData.forEach((q, index) => {
        const questionEl = document.createElement('div');
        questionEl.className = 'mb-6';
        questionEl.innerHTML = `<p class="font-semibold mb-2">${index + 1}. ${q.question}</p>`;
        
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'space-y-2';
        
        q.options.forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'quiz-option p-3 border-2 border-slate-200 rounded-lg cursor-pointer';
            optionEl.textContent = option;
            optionEl.addEventListener('click', () => {
                questionEl.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('selected'));
                optionEl.classList.add('selected');
            });
            optionsContainer.appendChild(optionEl);
        });
        
        questionEl.appendChild(optionsContainer);
        quizContainer.appendChild(questionEl);
    });
}

const submitQuizBtn = document.getElementById('submit-quiz-btn');
if(submitQuizBtn){
    submitQuizBtn.addEventListener('click', () => {
        let score = 0;
        const questions = quizContainer.querySelectorAll('.mb-6');
        const feedbacks = [
            'Correcto: Los tres pasos fundamentales de la escucha activa son percibir, procesar y responder.',
            'Correcto: "No juzgar" es el elemento que crea un espacio seguro para la expresión libre.',
            'Correcto: Las emociones intensas pueden impedir una buena escucha activa al desviar la atención.',
            'Correcto: La paráfrasis demuestra que has escuchado y comprendido el mensaje del emisor.',
            'Correcto: La escucha crítica busca evaluar la calidad de la información y la solidez de los argumentos.'
        ];
        const wrongFeedbacks = [
            'Incorrecto. Los tres pasos fundamentales de la escucha activa son: percibir, procesar y responder.',
            'Incorrecto. El elemento que crea un espacio seguro para la expresión libre es "No juzgar".',
            'Incorrecto. Las emociones intensas (enojo, ansiedad, tristeza) son barreras que impiden la buena escucha activa.',
            'Incorrecto. El objetivo principal de la paráfrasis es demostrar que has escuchado y comprendido el mensaje.',
            'Incorrecto. La escucha crítica tiene como propósito evaluar la calidad de la información y la solidez de los argumentos.'
        ];
        questions.forEach((q, index) => {
            const selectedOption = q.querySelector('.quiz-option.selected');
            let feedbackDiv = q.querySelector('.quiz-feedback');
            if (!feedbackDiv) {
                feedbackDiv = document.createElement('div');
                feedbackDiv.className = 'quiz-feedback mt-2 text-sm';
                q.appendChild(feedbackDiv);
            }
            if (selectedOption && selectedOption.textContent === quizData[index].answer) {
                score++;
                feedbackDiv.innerHTML = `<span class='text-green-700 font-semibold'>✔️ ${feedbacks[index]}</span>`;
            } else {
                feedbackDiv.innerHTML = `<span class='text-red-700 font-semibold'>❌ ${wrongFeedbacks[index]}</span>`;
            }
        });
        const resultEl = document.getElementById('quiz-result');
        resultEl.textContent = `Tu puntuación es: ${score} de ${quizData.length}.`;
        if (score / quizData.length >= 0.7) {
            resultEl.className = 'mt-4 text-lg font-bold text-green-700';
        } else {
            resultEl.className = 'mt-4 text-lg font-bold text-red-700';
        }
    });
}
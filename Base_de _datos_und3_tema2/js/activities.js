// JS para verificación de actividades
document.addEventListener('DOMContentLoaded', function() {
    // Actividad 1: Quiz de seguimiento
    const activity1Questions = document.querySelectorAll('[data-activity="1"]');
    
    // Respuestas correctas para la Actividad 1
    const correctAnswers = ['B', 'A']; // Pregunta 1: B, Pregunta 2: A
    
    // Agregar event listeners a las opciones
    activity1Questions.forEach((question, questionIndex) => {
        const options = question.querySelectorAll('.activity-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                // Remover selección previa
                options.forEach(opt => {
                    opt.classList.remove('selected', 'bg-green-50', 'border-green-500');
                });
                // Marcar como seleccionada
                this.classList.add('selected', 'bg-green-50', 'border-green-500');
            });
        });
    });
    
    // Botón de verificación para Actividad 1
    const checkActivity1Btn = document.getElementById('check-activity-1-btn');
    if (checkActivity1Btn) {
        checkActivity1Btn.addEventListener('click', function() {
            let correctCount = 0;
            const totalQuestions = activity1Questions.length;
            
            activity1Questions.forEach((question, index) => {
                const selectedOption = question.querySelector('.activity-option.selected');
                const feedbackDiv = question.querySelector('.activity-feedback');
                
                if (selectedOption) {
                    const selectedValue = selectedOption.dataset.value;
                    const isCorrect = selectedValue === correctAnswers[index];
                    
                    if (isCorrect) {
                        correctCount++;
                        selectedOption.classList.remove('border-red-500', 'bg-red-50');
                        selectedOption.classList.add('border-green-500', 'bg-green-50');
                        
                        if (index === 0) {
                            feedbackDiv.innerHTML = '<span class="text-green-700">✔️ Correcto. La paráfrasis ayuda a confirmar que has entendido el mensaje.</span>';
                        } else if (index === 1) {
                            feedbackDiv.innerHTML = '<span class="text-green-700">✔️ Correcto. Preguntar "¿Cómo te sentiste?" demuestra empatía y conexión emocional.</span>';
                        }
                    } else {
                        selectedOption.classList.remove('border-green-500', 'bg-green-50');
                        selectedOption.classList.add('border-red-500', 'bg-red-50');
                        
                        if (index === 0) {
                            feedbackDiv.innerHTML = '<span class="text-red-700">❌ Incorrecto. La paráfrasis sirve para confirmar que has entendido el mensaje, no para dar soluciones rápidas ni evaluar evidencia.</span>';
                        } else if (index === 1) {
                            feedbackDiv.innerHTML = '<span class="text-red-700">❌ Incorrecto. La escucha empática implica conectar con las emociones del otro, preguntando cómo se siente.</span>';
                        }
                    }
                } else {
                    feedbackDiv.innerHTML = '<span class="text-orange-600">⚠️ Por favor, selecciona una respuesta.</span>';
                }
            });
            
            // Mostrar resultado general
            const resultDiv = document.getElementById('activity-1-result');
            if (resultDiv) {
                resultDiv.textContent = `Obtuviste ${correctCount} de ${totalQuestions} respuestas correctas.`;
                resultDiv.className = correctCount === totalQuestions 
                    ? 'mt-4 font-medium text-green-700' 
                    : 'mt-4 font-medium text-orange-600';
            }
        });
    }

    // Actividad 2: Video de YouTube y pregunta
    const activity2Question = document.querySelector('[data-activity="2"]');
    
    if (activity2Question) {
        const options = activity2Question.querySelectorAll('.activity-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                // Remover selección previa
                options.forEach(opt => {
                    opt.classList.remove('selected', 'bg-green-50', 'border-green-500');
                });
                // Marcar como seleccionada
                this.classList.add('selected', 'bg-green-50', 'border-green-500');
            });
        });
    }
    
    // Botón de verificación para Actividad 2
    const checkActivity2Btn = document.getElementById('check-activity-2-btn');
    if (checkActivity2Btn) {
        checkActivity2Btn.addEventListener('click', function() {
            const selectedOption = activity2Question.querySelector('.activity-option.selected');
            const feedbackDiv = activity2Question.querySelector('.activity-feedback');
            const resultDiv = document.getElementById('activity-2-result');
            
            if (selectedOption) {
                const selectedValue = selectedOption.dataset.value;
                const isCorrect = selectedValue === 'A'; // La respuesta correcta es A
                
                if (isCorrect) {
                    selectedOption.classList.remove('border-red-500', 'bg-red-50');
                    selectedOption.classList.add('border-green-500', 'bg-green-50');
                    feedbackDiv.innerHTML = '<span class="text-green-700">✔️ Correcto. Homero muestra una ausencia de atención plena, ya que está distraído y sus respuestas son genéricas y vacías, lo cual es un claro ejemplo de falta de escucha activa.</span>';
                    resultDiv.textContent = '¡Excelente! Has identificado correctamente el problema de escucha activa.';
                    resultDiv.className = 'mt-4 font-medium text-green-700';
                } else {
                    selectedOption.classList.remove('border-green-500', 'bg-green-50');
                    selectedOption.classList.add('border-red-500', 'bg-red-50');
                    feedbackDiv.innerHTML = '<span class="text-red-700">❌ Incorrecto. La principal razón es que Homero muestra una ausencia de atención plena, ya que está distraído y sus respuestas son genéricas y vacías.</span>';
                    resultDiv.textContent = 'Intenta nuevamente. Observa cómo Homero no presta atención real a lo que Marge le dice.';
                    resultDiv.className = 'mt-4 font-medium text-orange-600';
                }
            } else {
                feedbackDiv.innerHTML = '<span class="text-orange-600">⚠️ Por favor, selecciona una respuesta.</span>';
                resultDiv.textContent = '';
            }
        });
    }
});
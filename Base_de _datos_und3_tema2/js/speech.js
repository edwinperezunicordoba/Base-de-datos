 // Script para SpeechSynthesis - Versión reutilizable
 document.addEventListener('DOMContentLoaded', function() {
    // Variables para SpeechSynthesis
    const synth = window.speechSynthesis;
    let voices = [];
    let activeReaders = {}; // Almacena los lectores activos por sección
    let paulinaVoice = null; // Variable para almacenar la voz de Paulina
    
    // Función para cargar las voces disponibles
    function loadVoices() {
        voices = synth.getVoices();
        
        
        // Buscar la voz de Paulina (es-MX)
        paulinaVoice = voices.find(voice => voice.name.includes('Paulina'));
        
        // Si no se encuentra Paulina, buscar cualquier voz en español
        if (!paulinaVoice) {
            paulinaVoice = voices.find(voice => voice.lang.startsWith('es'));
            if (paulinaVoice) {
            } else {
                if (voices.length > 0) {
                    paulinaVoice = voices[0];
                }
            }
        } else {
        }
    }
    
    // Cargar voces cuando estén disponibles
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
    }
    
    // Intentar cargar voces inmediatamente (para navegadores que ya las tienen cargadas)
    loadVoices();
    
    // Función para filtrar emojis del texto
    function removeEmojis(text) {
        // Rango de emojis Unicode
        return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    }
    
    // Función para obtener el texto de una sección
    function getSectionText(sectionId) {
        // Si el sectionId comienza con '#', eliminarlo
        if (sectionId.startsWith('#')) {
            sectionId = sectionId.substring(1);
        }
        
        const section = document.getElementById(sectionId);
        if (!section) {
            return "";
        }
        
        // Clonar la sección para no modificar el DOM original
        const sectionClone = section.cloneNode(true);
        
        // Eliminar los controles de voz del clon para evitar leer los botones
        const speechControls = sectionClone.querySelectorAll('.speech-controls');
        speechControls.forEach(control => {
            control.parentNode.removeChild(control);
        });
        
        // Procesar todos los encabezados (h1-h6) para añadir pausas
        const headings = sectionClone.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            // Añadir un punto y un espacio extra después del encabezado para forzar una pausa
            const originalText = heading.textContent;
            if (!originalText.endsWith('.') && !originalText.endsWith(':') && !originalText.endsWith('?')) {
                heading.textContent = originalText + '.      ';
            } else {
                heading.textContent = originalText + '      ';
            }
            
            // Añadir más espacios para encabezados principales (h1, h2) para pausas más largas
            if (heading.tagName.toLowerCase() === 'h1' || heading.tagName.toLowerCase() === 'h2') {
                heading.textContent += '            ';
            }
        });
        
        // Obtener el texto limpio
        return removeEmojis(sectionClone.textContent.trim());
    }
    
    // Función para actualizar el estado de los botones
    function updateButtonStates(controlsElement, isPlaying) {
        const playBtn = controlsElement.querySelector('.play-btn');
        const pauseBtn = controlsElement.querySelector('.pause-btn');
        const stopBtn = controlsElement.querySelector('.stop-btn');
        
        if (playBtn) playBtn.disabled = isPlaying;
        if (pauseBtn) pauseBtn.disabled = !isPlaying;
        if (stopBtn) stopBtn.disabled = !isPlaying;
    }
    
    
    // Configurar cada conjunto de controles de voz
    document.querySelectorAll('.speech-controls').forEach(controls => {
        const sectionId = controls.getAttribute('data-target');
        const playBtn = controls.querySelector('.play-btn');
        const pauseBtn = controls.querySelector('.pause-btn');
        const stopBtn = controls.querySelector('.stop-btn');
        const rateControl = controls.querySelector('.speech-rate');
        
        if (!sectionId || !playBtn || !pauseBtn || !stopBtn || !rateControl) {
            return;
        }
        
        
        // Función para procesar el texto a leer
        function processNextSegment(reader, controls, sectionId) {
            // Configurar el utterance para el texto
            const utterance = new SpeechSynthesisUtterance(reader.text);
            utterance.lang = 'es-ES';
            utterance.rate = parseFloat(reader.rateValue);
            
            // Establecer la voz de Paulina
            if (paulinaVoice) {
                utterance.voice = paulinaVoice;
            }
            
            // Evento cuando termina la lectura
            utterance.onend = function() {
                updateButtonStates(controls, false);
                delete activeReaders[sectionId];
            };
            
            // Evento de error
            utterance.onerror = function(event) {
                updateButtonStates(controls, false);
                delete activeReaders[sectionId];
            };
            
            // Iniciar la lectura del segmento
            synth.speak(utterance);
            updateButtonStates(controls, true);
        }
        
        // Iniciar la lectura
        playBtn.addEventListener('click', function() {
            const reader = activeReaders[sectionId];
            
            // Si hay un lector activo y está pausado por el usuario, reanudarlo
            if (reader && reader.isPaused) {
                synth.resume();
                reader.isPaused = false;
                updateButtonStates(controls, true);
                return;
            }
            
            // Detener cualquier lectura anterior
            synth.cancel();
            
            // Limpiar lectores activos
            Object.keys(activeReaders).forEach(key => {
                const readerControls = document.querySelector(`.speech-controls[data-target="${key}"]`);
                if (readerControls) {
                    updateButtonStates(readerControls, false);
                }
            });
            activeReaders = {};
            
            // Obtener el texto a leer
            const sectionContent = getSectionText(sectionId);
            if (!sectionContent) {
                return;
            }
            
            
            // Crear el lector activo
            const newReader = {
                text: sectionContent,
                isPaused: false,
                rateValue: rateControl.value
            };
            
            activeReaders[sectionId] = newReader;
            updateButtonStates(controls, true);
            
            // Iniciar la lectura del primer segmento
            processNextSegment(newReader, controls, sectionId);
        });
        
        // Pausar la lectura
        pauseBtn.addEventListener('click', function() {
            const reader = activeReaders[sectionId];
            if (reader && !reader.isPaused && synth.speaking) {
                synth.pause();
                reader.isPaused = true;
                updateButtonStates(controls, true);
                playBtn.disabled = false; // Habilitar el botón de reproducir para reanudar
            }
        });
        
        // Detener la lectura
        stopBtn.addEventListener('click', function() {
            if (activeReaders[sectionId]) {
                synth.cancel();
                delete activeReaders[sectionId];
                updateButtonStates(controls, false);
            }
        });
        
        // Cambiar la velocidad de lectura
        rateControl.addEventListener('change', function() {
            const reader = activeReaders[sectionId];
            if (reader) {
                // Actualizar la velocidad para futuros segmentos
                reader.rateValue = this.value;
                
                // Si está hablando actualmente, reiniciar el segmento actual con la nueva velocidad
                if (synth.speaking) {
                    // Cancelar la síntesis actual
                    synth.cancel();
                    
                    // Reiniciar desde el segmento actual con la nueva velocidad
                    processNextSegment(reader, controls, sectionId);
                }
            }
        });
    });
});
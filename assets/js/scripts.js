// Lógica de scroll suave para los enlaces de anclaje
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 64, // Ajuste por la altura del menú fijo
                behavior: 'smooth'
            });
        }
    });
});





const $form = document.querySelector('#contact-form');
const $button = document.querySelector('#submit-btn');
const $status = document.querySelector('#form-status');

$form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // --- LÓGICA DE CONTROL DE FLUJO (RATE LIMITING) ---
    const AHORA = Date.now();
    const UNA_HORA = 3600000; // milisegundos
    const MAX_INTENTOS = 3;

    // Obtener historial de envíos previos (o un array vacío si no hay)
    let envios = JSON.parse(localStorage.getItem('historial_envios') || '[]');

    // Filtrar: quedarnos solo con los envíos que ocurrieron hace MENOS de una hora
    envios = envios.filter(timestamp => (AHORA - timestamp) < UNA_HORA);

    if (envios.length >= MAX_INTENTOS) {
        // Calcular cuánto falta para que expire el envío más antiguo del historial
        const tiempoRestanteMs = UNA_HORA - (AHORA - envios[0]);
        const minutosRestantes = Math.ceil(tiempoRestanteMs / 60000);

        $status.innerText = `Límite alcanzado. Intenta de nuevo en ${minutosRestantes} minutos.`;
        $status.className = "text-center font-medium mt-4 text-yellow-500";
        $status.classList.remove('hidden');
        return; // Bloquea el envío
    }

    // --- LÓGICA DE ENVÍO ---
    $button.disabled = true;
    $button.innerText = 'Enviando...';

    const formData = new FormData($form);
    
    try {
        const response = await fetch("https://formsubmit.co/ajax/juan.tapia.informatica@gmail.com", {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            // REGISTRO EXITOSO: Guardar el nuevo timestamp
            envios.push(AHORA);
            localStorage.setItem('historial_envios', JSON.stringify(envios));

            $form.reset();
            $status.innerText = "¡Mensaje enviado! Gracias por contactarme.";
            $status.className = "text-center font-medium mt-4 text-terminalGreen";
        } else {
            throw new Error('Error en el servidor');
        }
    } catch (error) {
        $status.innerText = "Error al enviar. Intenta más tarde.";
        $status.className = "text-center font-medium mt-4 text-red-500";
    } finally {
        $status.classList.remove('hidden');
        $button.disabled = false;
        $button.innerText = 'Enviar Mensaje';
    }
});
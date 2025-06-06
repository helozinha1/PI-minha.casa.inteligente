document.addEventListener('DOMContentLoaded', () => {
    // --- Funções de Data e Hora ---
    function updateDateTime() {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-time').textContent = now.toLocaleTimeString('pt-BR', timeOptions);
        document.getElementById('current-date').textContent = now.toLocaleDateString('pt-BR', dateOptions);
    }
    updateDateTime();
    setInterval(updateDateTime, 1000); // Atualiza a cada segundo

    // --- Função Genérica para Ligar/Desligar ---
    function setupOnOffControl(cardElement) {
        if (!cardElement) return;

        const statusText = cardElement.querySelector('.status-text');
        const onButton = cardElement.querySelector('.button-on');
        const offButton = cardElement.querySelector('.button-off');
        
        const titleRaw = cardElement.querySelector('h3').textContent;
        const title = titleRaw.replace('Iluminação ', '').replace('TV ', '').replace('Ar Cond. ', ''); 

        if (onButton) {
            onButton.addEventListener('click', () => {
                statusText.textContent = `${title} Ligada`;
                statusText.style.color = '#4CAF50';
                const statusIcon = cardElement.querySelector('.status-icon');
                if (statusIcon) {
                    statusIcon.classList.remove('off');
                    statusIcon.classList.add('on');
                }
            });
        }
        if (offButton) {
            offButton.addEventListener('click', () => {
                statusText.textContent = `${title} Desligada`;
                statusText.style.color = '#F44336';
                const statusIcon = cardElement.querySelector('.status-icon');
                if (statusIcon) {
                    statusIcon.classList.remove('on');
                    statusIcon.classList.add('off');
                }
            });
        }
    }

    // --- Função Genérica para Controle de Temperatura ---
    function setupTemperatureControl(cardSelector, initialTemp, minTemp, maxTemp) {
        const card = document.querySelector(cardSelector);
        if (!card) return;

        const currentTempElement = card.querySelector('.current-temp');
        const tempDownButton = card.querySelectorAll('.button-temp')[0];
        const tempUpButton = card.querySelectorAll('.button-temp')[1];
        const statusText = card.querySelector('.status-text');

        let currentTemp = initialTemp;
        currentTempElement.textContent = `${currentTemp}°C`;

        if (tempDownButton) {
            tempDownButton.addEventListener('click', () => {
                if (currentTemp > minTemp) {
                    currentTemp--;
                    currentTempElement.textContent = `${currentTemp}°C`;
                    if (statusText && statusText.textContent.includes('Ligado')) {
                        statusText.textContent = `Ligado (${currentTemp}°C)`;
                    }
                }
            });
        }
        if (tempUpButton) {
            tempUpButton.addEventListener('click', () => {
                if (currentTemp < maxTemp) {
                    currentTemp++;
                    currentTempElement.textContent = `${currentTemp}°C`;
                    if (statusText && statusText.textContent.includes('Ligado')) {
                        statusText.textContent = `Ligado (${currentTemp}°C)`;
                    }
                }
            });
        }

        const onButton = card.querySelector('.button-on');
        const offButton = card.querySelector('.button-off');
        if (onButton && statusText) {
            onButton.addEventListener('click', () => {
                statusText.textContent = `Ligado (${currentTemp}°C)`;
                statusText.style.color = '#4CAF50';
                currentTempElement.style.color = '#a0d0ff';
            });
        }
        if (offButton && statusText) {
            offButton.addEventListener('click', () => {
                statusText.textContent = 'Desligado';
                statusText.style.color = '#F44336';
                currentTempElement.style.color = '#c0c0c0';
            });
        }
    }

    // --- Gerenciamento de Telas (Dashboard vs. Câmeras) ---
    const mainDashboard = document.querySelector('.main-dashboard');
    const camerasScreen = document.querySelector('.cameras-screen');
    const viewCamerasButton = document.getElementById('view-cameras-button');
    const backToDashboardButton = document.getElementById('back-to-dashboard-button');

    if (viewCamerasButton) {
        viewCamerasButton.addEventListener('click', () => {
            mainDashboard.style.display = 'none';
            camerasScreen.style.display = 'flex';
        });
    }

    if (backToDashboardButton) {
        backToDashboardButton.addEventListener('click', () => {
            camerasScreen.style.display = 'none';
            mainDashboard.style.display = 'flex';
        });
    }

    // --- Implementando os Controles ---

    document.querySelectorAll('.light-control').forEach(card => {
        setupOnOffControl(card);
    });

    setupTemperatureControl('.house-temp-control', 24, 18, 30);

    setupTemperatureControl('.pool-temp-control', 28, 18, 35);
    const poolTempCard = document.querySelector('.pool-temp-control');
    const poolHeaterButton = poolTempCard ? poolTempCard.querySelector('.button-heater') : null;
    const poolOffButton = poolTempCard ? poolTempCard.querySelector('.button-off') : null;
    const poolCurrentTempElement = poolTempCard ? poolTempCard.querySelector('.current-temp') : null;

    if (poolHeaterButton && poolCurrentTempElement) {
        poolHeaterButton.addEventListener('click', () => {
            poolCurrentTempElement.textContent = `Aquecendo...`;
            poolCurrentTempElement.style.color = '#FFC107';
        });
    }
    if (poolOffButton && poolCurrentTempElement) {
        poolOffButton.addEventListener('click', () => {
            const currentVal = poolCurrentTempElement.textContent.match(/\d+°C/);
            poolCurrentTempElement.textContent = `Desligado ${currentVal ? `(${currentVal[0]})` : ''}`;
            poolCurrentTempElement.style.color = '#c0c0c0';
        });
    }

    document.querySelectorAll('.media-control[data-device^="tv-"]').forEach(card => {
        setupOnOffControl(card);
    });

    const notebookCard = document.querySelector('.media-control:not([data-device])');
    if (notebookCard) {
        setupOnOffControl(notebookCard);
    }

    document.querySelectorAll('.ac-control[data-device^="ac-"]').forEach(card => {
        const deviceName = card.dataset.device;
        setupTemperatureControl(`[data-device="${deviceName}"]`, 22, 16, 28);
    });

    const securityCard = document.querySelector('.security-control');
    if (securityCard) {
        const lockButton = securityCard.querySelector('.button-lock');
        const unlockButton = securityCard.querySelector('.button-unlock');
        const securityStatus = securityCard.querySelector('.status-text');

        if (lockButton && unlockButton && securityStatus) {
            lockButton.addEventListener('click', () => {
                securityStatus.textContent = 'Trancado';
                securityStatus.style.color = '#F44336';
            });
            unlockButton.addEventListener('click', () => {
                securityStatus.textContent = 'Destrancado';
                securityStatus.style.color = '#4CAF50';
            });
        }
    }

    const blindCard = document.querySelector('.blind-control');
    if (blindCard) {
        const blindUpButton = blindCard.querySelector('.button-up');
        const blindDownButton = blindCard.querySelector('.button-down');
        const blindStatus = blindCard.querySelector('.status-text');

        if (blindUpButton && blindDownButton && blindStatus) {
            blindUpButton.addEventListener('click', () => {
                blindStatus.textContent = 'Abrindo...';
                setTimeout(() => blindStatus.textContent = 'Abertas', 1000);
            });
            blindDownButton.addEventListener('click', () => {
                blindStatus.textContent = 'Fechando...';
                setTimeout(() => blindStatus.textContent = 'Fechadas', 1000);
            });
        }
    }

    // --- Controle de Câmeras na Tela de Câmeras ---
    // Mapeamento de câmeras para URLs de imagem falsas
    const cameraImages = {
        'camera-1': 'https://img.freepik.com/fotos-premium/entrada-do-edificio_1048944-27831373.jpg?ga=GA1.1.608496382.1749216763&w=740', 
        'camera-2': 'https://img.freepik.com/fotos-premium/um-edificio-com-uma-porta-que-diz-quota-de-saida-no-lado_1412727-4382.jpg?ga=GA1.1.608496382.1749216763&w=740', 
        'camera-3': 'https://img.freepik.com/fotos-premium/jardim-ao-lado-da-casa-contra-o-ceu-limpo_1048944-18369903.jpg?ga=GA1.1.608496382.1749216763&semt=ais_items_boosted&w=740', 
        'camera-4': 'https://img.freepik.com/fotos-premium/hotel-de-luxo-privado-na-ilha-grecia-de-santorini-vista-superior-de-camas-de-praia-a-beira-da-piscina-viagens-ensolaradas_663265-1858.jpg?ga=GA1.1.608496382.1749216763&semt=ais_hybrid&w=740',
        'camera-5': 'https://img.freepik.com/fotos-premium/sala-de-estar-em-estilo-contemporaneo-com-cozinha-de-acrilico-elegante-e-moderna_295714-1585.jpg?ga=GA1.1.608496382.1749216763&semt=ais_hybrid&w=740', 
        'camera-6': 'https://img.freepik.com/fotos-premium/design-de-cozinha-minimalista-moderno_1310085-91084.jpg?ga=GA1.1.608496382.1749216763&semt=ais_hybrid&w=740', 
        'camera-7': 'https://img.freepik.com/fotos-gratis/quarto-de-bebe-com-moveis-e-paredes-de-cores-claras_181624-19003.jpg?ga=GA1.1.608496382.1749216763&semt=ais_items_boosted&w=740', 
       
    };

    document.querySelectorAll('.camera-feed-card').forEach(cameraCard => {
        const cameraDisplay = cameraCard.querySelector('.camera-display');
        const cameraStatusIcon = cameraCard.querySelector('.material-icons.camera-status-icon');
        const cameraStatusText = cameraCard.querySelector('.camera-status-text');
        const onButton = cameraCard.querySelector('.button-on');
        const offButton = cameraCard.querySelector('.button-off');
        const cameraId = cameraCard.dataset.camera; // Obtém o ID da câmera do atributo data-camera

        if (onButton && offButton) {
            onButton.addEventListener('click', () => {
                const imageUrl = cameraImages[cameraId];
                if (imageUrl) {
                    cameraDisplay.style.backgroundImage = `url("${imageUrl}")`;
                    cameraDisplay.style.backgroundSize = 'cover';
                    cameraDisplay.style.backgroundPosition = 'center';
                    cameraDisplay.style.backgroundColor = 'transparent'; // Remove o fundo preto
                    cameraStatusIcon.style.display = 'none';
                    cameraStatusText.style.display = 'none';
                }
            });

            offButton.addEventListener('click', () => {
                cameraDisplay.style.backgroundImage = 'none';
                cameraDisplay.style.backgroundColor = '#000'; // Volta ao fundo preto
                cameraStatusIcon.style.display = 'block';
                cameraStatusText.style.display = 'block';
            });
        }
    });
});
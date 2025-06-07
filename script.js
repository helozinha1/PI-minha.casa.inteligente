document.addEventListener('DOMContentLoaded', async () => {
    let deviceStates = {}; // Variável para armazenar os estados dos dispositivos

    // --- Carregar dados do JSON ---
    try {
        const response = await fetch('data.json'); // Faz a requisição ao arquivo JSON
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        deviceStates = data.devices; // Armazena os dados dos dispositivos
        console.log('Dados dos dispositivos carregados:', deviceStates);
    } catch (error) {
        console.error('Erro ao carregar dados do JSON:', error);
        // Fallback: Se o JSON não carregar, inicializa com valores padrão (ou mantém vazio)
        deviceStates = {
            "pool-temp": { "status": "Desligado", "currentTemp": 28, "minTemp": 18, "maxTemp": 35 },
            "house-temp": { "status": "Desligado", "currentTemp": 24, "minTemp": 18, "maxTemp": 30 },
            "light-sala": { "status": "Desligado" },
            "light-cozinha": { "status": "Desligado" },
            "light-quarto": { "status": "Desligado" },
            "tv-sala": { "status": "Desligado" },
            "tv-quarto": { "status": "Desligado" },
            "notebook": { "status": "Desligado" },
            "ac-sala": { "status": "Desligado", "currentTemp": 22, "minTemp": 16, "maxTemp": 28 },
            "ac-quarto": { "status": "Desligado", "currentTemp": 22, "minTemp": 16, "maxTemp": 28 },
            "garagem": { "status": "Trancado" },
            "porta-entrada": { "status": "Trancado" },
            "persiana-sala": { "status": "Fechadas" },
            "persiana-quarto": { "status": "Fechadas" },
            "persiana-filhos": { "status": "Fechadas" },
            "camera-1": { "status": "Desligado" },
            "camera-2": { "status": "Desligado" },
            "camera-3": { "status": "Desligado" },
            "camera-4": { "status": "Desligado" },
            "camera-5": { "status": "Desligado" },
            "camera-6": { "status": "Desligado" },
            "camera-7": { "status": "Desligado" }
        };
    }

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

    // --- Função Genérica para Ligar/Desligar (Luzes, TVs, Notebook) ---
    function setupOnOffControl(cardElement) {
        if (!cardElement) return;

        const deviceId = cardElement.dataset.device;
        if (!deviceId || !deviceStates[deviceId]) return;

        const statusText = cardElement.querySelector('.status-text');
        const onButton = cardElement.querySelector('.button-on');
        const offButton = cardElement.querySelector('.button-off');
        const statusIcon = cardElement.querySelector('.status-icon') || cardElement.querySelector('.icon');
        
        const titleRaw = cardElement.querySelector('h3').textContent;
        let title = titleRaw.replace('Iluminação ', '').replace('TV ', '').replace('Ar Cond. ', ''); 
        if (cardElement.dataset.device === 'notebook') {
            title = 'Notebook';
        }

        // Inicializa o estado visual com base no JSON
        if (statusText) {
            statusText.textContent = `${title} ${deviceStates[deviceId].status}`;
            statusText.style.color = (deviceStates[deviceId].status === 'Ligado') ? '#4CAF50' : '#F44336';
        }
        if (statusIcon) {
            if (cardElement.classList.contains('light-control')) {
                statusIcon.textContent = (deviceStates[deviceId].status === 'Ligado') ? 'lightbulb' : 'lightbulb_outline';
            }
            statusIcon.classList.remove('on', 'off');
            statusIcon.classList.add((deviceStates[deviceId].status === 'Ligado') ? 'on' : 'off');
        }

        if (onButton) {
            onButton.addEventListener('click', () => {
                deviceStates[deviceId].status = 'Ligado'; // Atualiza o estado no JSON
                if (statusText) {
                    statusText.textContent = `${title} Ligado`;
                    statusText.style.color = '#4CAF50';
                }
                if (statusIcon) {
                    if (cardElement.classList.contains('light-control')) {
                        statusIcon.textContent = 'lightbulb';
                    }
                    statusIcon.classList.remove('off');
                    statusIcon.classList.add('on');
                }
            });
        }
        if (offButton) {
            offButton.addEventListener('click', () => {
                deviceStates[deviceId].status = 'Desligado'; // Atualiza o estado no JSON
                if (statusText) {
                    statusText.textContent = `${title} Desligado`;
                    statusText.style.color = '#F44336';
                }
                if (statusIcon) {
                    if (cardElement.classList.contains('light-control')) {
                        statusIcon.textContent = 'lightbulb_outline';
                    }
                    statusIcon.classList.remove('on');
                    statusIcon.classList.add('off');
                }
            });
        }
    }

    // --- Função Genérica para Controle de Temperatura (AC, Casa) ---
    function setupTemperatureControl(cardElement) {
        if (!cardElement) return;

        const deviceId = cardElement.dataset.device;
        if (!deviceId || !deviceStates[deviceId]) return;

        let currentTemp = deviceStates[deviceId].currentTemp; // Pega do JSON
        const minTemp = deviceStates[deviceId].minTemp;     // Pega do JSON
        const maxTemp = deviceStates[deviceId].maxTemp;     // Pega do JSON

        const currentTempElement = cardElement.querySelector('.current-temp');
        const tempDownButton = cardElement.querySelector('.button-temp:first-of-type');
        const tempUpButton = cardElement.querySelector('.button-temp:last-of-type');
        const statusText = cardElement.querySelector('.status-text');
        const onButton = cardElement.querySelector('.button-on');
        const offButton = cardElement.querySelector('.button-off');

        // Inicializa o estado visual com base no JSON
        if (currentTempElement) {
            currentTempElement.textContent = `${currentTemp}°C`;
        }
        if (statusText) {
            statusText.textContent = `${deviceStates[deviceId].status}`; // Set initial status from JSON
            statusText.style.color = (deviceStates[deviceId].status === 'Ligado') ? '#4CAF50' : '#F44336';
             if (deviceStates[deviceId].status === 'Ligado' && currentTempElement) {
                 currentTempElement.style.color = '#a0d0ff';
             } else if (currentTempElement) {
                 currentTempElement.style.color = '#c0c0c0';
             }
        }
        
        if (tempDownButton) {
            tempDownButton.addEventListener('click', () => {
                if (currentTemp > minTemp) {
                    currentTemp--;
                    deviceStates[deviceId].currentTemp = currentTemp; // Atualiza no JSON
                    if (currentTempElement) currentTempElement.textContent = `${currentTemp}°C`;
                    if (statusText && (statusText.textContent.includes('Ligado') || statusText.textContent.includes('Aquecendo'))) {
                        statusText.textContent = `Ligado (${currentTemp}°C)`;
                        statusText.style.color = '#4CAF50';
                        if (currentTempElement) currentTempElement.style.color = '#a0d0ff';
                    }
                }
            });
        }
        if (tempUpButton) {
            tempUpButton.addEventListener('click', () => {
                if (currentTemp < maxTemp) {
                    currentTemp++;
                    deviceStates[deviceId].currentTemp = currentTemp; // Atualiza no JSON
                    if (currentTempElement) currentTempElement.textContent = `${currentTemp}°C`;
                    if (statusText && (statusText.textContent.includes('Ligado') || statusText.textContent.includes('Aquecendo'))) {
                        statusText.textContent = `Ligado (${currentTemp}°C)`;
                        statusText.style.color = '#4CAF50';
                        if (currentTempElement) currentTempElement.style.color = '#a0d0ff';
                    }
                }
            });
        }

        if (onButton) {
            onButton.addEventListener('click', () => {
                deviceStates[deviceId].status = 'Ligado'; // Atualiza no JSON
                if (statusText) {
                    statusText.textContent = `Ligado (${currentTemp}°C)`;
                    statusText.style.color = '#4CAF50';
                }
                if (currentTempElement) currentTempElement.style.color = '#a0d0ff';
            });
        }
        if (offButton) {
            offButton.addEventListener('click', () => {
                deviceStates[deviceId].status = 'Desligado'; // Atualiza no JSON
                if (statusText) {
                    statusText.textContent = 'Desligado';
                    statusText.style.color = '#F44336';
                }
                if (currentTempElement) currentTempElement.style.color = '#c0c0c0';
            });
        }
    }

    // --- Gerenciamento de Telas (Dashboard vs. Câmeras vs. Equipe) ---
    const mainDashboard = document.querySelector('.main-dashboard');
    const camerasScreen = document.querySelector('.cameras-screen');
    const teamScreen = document.querySelector('.team-screen'); // NOVO: Tela da equipe

    const viewCamerasButton = document.getElementById('view-cameras-button');
    const backToDashboardButton = document.getElementById('back-to-dashboard-button');
    const viewTeamButton = document.getElementById('view-team-button'); // NOVO: Botão para ver a equipe
    const backToDashboardFromTeam = document.getElementById('back-to-dashboard-from-team'); // NOVO: Botão voltar da tela da equipe

    if (viewCamerasButton) {
        viewCamerasButton.addEventListener('click', () => {
            mainDashboard.style.display = 'none';
            teamScreen.style.display = 'none'; // Garante que a tela da equipe esteja escondida
            camerasScreen.style.display = 'flex';
        });
    }

    if (backToDashboardButton) {
        backToDashboardButton.addEventListener('click', () => {
            camerasScreen.style.display = 'none';
            mainDashboard.style.display = 'flex';
        });
    }

    // NOVO: Lógica para o botão "Ver Equipe"
    if (viewTeamButton) {
        viewTeamButton.addEventListener('click', () => {
            mainDashboard.style.display = 'none';
            camerasScreen.style.display = 'none'; // Garante que a tela de câmeras esteja escondida
            teamScreen.style.display = 'flex';
        });
    }

    // NOVO: Lógica para o botão "Voltar" da tela da equipe
    if (backToDashboardFromTeam) {
        backToDashboardFromTeam.addEventListener('click', () => {
            teamScreen.style.display = 'none';
            mainDashboard.style.display = 'flex';
        });
    }

    // --- Implementando os Controles ---

    // É crucial que todos os cards que usam `deviceStates` tenham `data-device="ID_DO_DISPOSITIVO"`
    // Isso é como o JS sabe qual estado procurar no `deviceStates` (JSON)

    // Iluminação
    document.querySelectorAll('.light-control').forEach(card => {
        setupOnOffControl(card);
    });

    // Temperatura da Casa
    const houseTempCard = document.querySelector('.house-temp-control');
    if (houseTempCard) {
        setupTemperatureControl(houseTempCard);
    }
    
    // Piscina (Tratamento específico para os botões "Aquecer" e "Desligar")
    const poolTempCard = document.querySelector('.pool-temp-control');
    if (poolTempCard) {
        const deviceId = poolTempCard.dataset.device;
        if (!deviceId || !deviceStates[deviceId]) return;

        let poolCurrentTemp = deviceStates[deviceId].currentTemp;
        const poolMinTemp = deviceStates[deviceId].minTemp;
        const poolMaxTemp = deviceStates[deviceId].maxTemp;

        const poolCurrentTempElement = poolTempCard.querySelector('.current-temp');
        const poolStatusText = poolTempCard.querySelector('.status-text');
        const poolHeaterButton = poolTempCard.querySelector('.button-heater');
        const poolOffButton = poolTempCard.querySelector('.button-off');
        const poolTempDownButton = poolTempCard.querySelector('.button-temp:first-of-type');
        const poolTempUpButton = poolTempCard.querySelector('.button-temp:last-of-type');

        // Renderiza o estado inicial com base no JSON
        if (poolCurrentTempElement) poolCurrentTempElement.textContent = `${poolCurrentTemp}°C`;
        if (poolStatusText) { 
            poolStatusText.textContent = deviceStates[deviceId].status; // Pega o status inicial do JSON
            poolStatusText.style.color = (deviceStates[deviceId].status === 'Desligado') ? '#F44336' : (deviceStates[deviceId].status === 'Aquecida' ? '#4CAF50' : '#FFC107');
        }
        if (poolCurrentTempElement) {
             poolCurrentTempElement.style.color = (deviceStates[deviceId].status === 'Desligado') ? '#c0c0c0' : '#a0d0ff';
        }


        // Lógica do botão Aquecer (button-heater)
        if (poolHeaterButton) {
            poolHeaterButton.addEventListener('click', () => {
                if (poolStatusText) {
                    poolStatusText.textContent = 'Aquecendo...';
                    poolStatusText.style.color = '#FFC107';
                }
                if (poolCurrentTempElement) poolCurrentTempElement.style.color = '#a0d0ff';

                deviceStates[deviceId].status = 'Aquecendo...'; // Atualiza o estado no JSON

                setTimeout(() => {
                    if (poolStatusText) {
                        poolStatusText.textContent = 'Aquecida';
                        poolStatusText.style.color = '#4CAF50';
                    }
                    deviceStates[deviceId].status = 'Aquecida'; // Atualiza o estado final no JSON
                }, 1500);
            });
        }

        // Lógica do botão Desligar (button-off)
        if (poolOffButton) {
            poolOffButton.addEventListener('click', () => {
                if (poolStatusText) {
                    poolStatusText.textContent = 'Desligado';
                    poolStatusText.style.color = '#F44336';
                }
                if (poolCurrentTempElement) poolCurrentTempElement.style.color = '#c0c0c0';
                deviceStates[deviceId].status = 'Desligado'; // Atualiza o estado no JSON
            });
        }

        // Lógica dos botões de temperatura +/- (button-temp)
        if (poolTempDownButton) {
            poolTempDownButton.addEventListener('click', () => {
                if (poolCurrentTemp > poolMinTemp) {
                    poolCurrentTemp--;
                    deviceStates[deviceId].currentTemp = poolCurrentTemp; // Atualiza no JSON
                    if (poolCurrentTempElement) poolCurrentTempElement.textContent = `${poolCurrentTemp}°C`;
                    if (poolStatusText && (deviceStates[deviceId].status === 'Aquecida' || deviceStates[deviceId].status.startsWith('Aquecendo'))) {
                        poolStatusText.textContent = `Aquecendo (${poolCurrentTemp}°C)`; 
                        poolStatusText.style.color = '#FFC107';
                        if (poolCurrentTempElement) poolCurrentTempElement.style.color = '#a0d0ff';
                        deviceStates[deviceId].status = 'Aquecendo'; // Atualiza o estado no JSON
                    }
                }
            });
        }
        if (poolTempUpButton) {
            poolTempUpButton.addEventListener('click', () => {
                if (poolCurrentTemp < poolMaxTemp) {
                    poolCurrentTemp++;
                    deviceStates[deviceId].currentTemp = poolCurrentTemp; // Atualiza no JSON
                    if (poolCurrentTempElement) poolCurrentTempElement.textContent = `${poolCurrentTemp}°C`;
                    if (poolStatusText && (deviceStates[deviceId].status === 'Aquecida' || deviceStates[deviceId].status.startsWith('Aquecendo'))) {
                        poolStatusText.textContent = `Aquecendo (${poolCurrentTemp}°C)`;
                        poolStatusText.style.color = '#FFC107';
                        if (poolCurrentTempElement) poolCurrentTempElement.style.color = '#a0d0ff';
                        deviceStates[deviceId].status = 'Aquecendo'; // Atualiza o estado no JSON
                    }
                }
            });
        }
    }


    // TVs e Notebook
    document.querySelectorAll('.media-control').forEach(card => {
        setupOnOffControl(card);
    });

    // Ar Condicionado
    document.querySelectorAll('.ac-control').forEach(card => {
        setupTemperatureControl(card);
    });

    // Segurança (Garagem e Portas)
    document.querySelectorAll('.security-control').forEach(card => {
        const deviceId = card.dataset.device;
        if (!deviceId || !deviceStates[deviceId]) return;

        const lockButton = card.querySelector('.button-lock');
        const unlockButton = card.querySelector('.button-unlock');
        const securityStatus = card.querySelector('.status-text');
        const securityIcon = card.querySelector('.icon');

        // Inicializa o estado visual com base no JSON
        if (securityStatus) {
            securityStatus.textContent = deviceStates[deviceId].status;
            securityStatus.style.color = (deviceStates[deviceId].status === 'Trancado') ? '#F44336' : '#4CAF50';
        }
        if (securityIcon) {
            securityIcon.textContent = (deviceStates[deviceId].status === 'Trancado') ? 'lock' : 'lock_open';
            securityIcon.classList.remove('open', 'locked');
            securityIcon.classList.add((deviceStates[deviceId].status === 'Trancado') ? 'locked' : 'open');
        }


        if (lockButton && unlockButton && securityStatus && securityIcon) {
            lockButton.addEventListener('click', () => {
                deviceStates[deviceId].status = 'Trancado'; // Atualiza no JSON
                securityStatus.textContent = 'Trancado';
                securityStatus.style.color = '#F44336';
                securityIcon.textContent = 'lock';
                securityIcon.classList.remove('open');
                securityIcon.classList.add('locked');
            });
            unlockButton.addEventListener('click', () => {
                deviceStates[deviceId].status = 'Destrancado'; // Atualiza no JSON
                securityStatus.textContent = 'Destrancado';
                securityStatus.style.color = '#4CAF50';
                securityIcon.textContent = 'lock_open';
                securityIcon.classList.remove('locked');
                securityIcon.classList.add('open');
            });
        }
    });

    // Persianas (Sala, Quarto, Filhos)
    document.querySelectorAll('.blind-control').forEach(card => {
        const deviceId = card.dataset.device;
        if (!deviceId || !deviceStates[deviceId]) return;

        const blindUpButton = card.querySelector('.button-up');
        const blindDownButton = card.querySelector('.button-down');
        const blindStatus = card.querySelector('.status-text');
        const blindIcon = card.querySelector('.icon');

        // Inicializa o estado visual com base no JSON
        if (blindStatus) {
            blindStatus.textContent = deviceStates[deviceId].status;
            blindStatus.style.color = (deviceStates[deviceId].status === 'Fechadas') ? '#F44336' : ((deviceStates[deviceId].status === 'Abertas') ? '#4CAF50' : '#FFC107');
        }
        if (blindIcon) {
            blindIcon.textContent = (deviceStates[deviceId].status === 'Fechadas') ? 'vertical_align_center' : 'vertical_align_top';
            blindIcon.classList.remove('open', 'closed');
            blindIcon.classList.add((deviceStates[deviceId].status === 'Fechadas') ? 'closed' : 'open');
        }


        if (blindUpButton && blindDownButton && blindStatus && blindIcon) {
            blindUpButton.addEventListener('click', () => {
                blindStatus.textContent = 'Abrindo...';
                blindStatus.style.color = '#FFC107';
                deviceStates[deviceId].status = 'Abrindo...'; // Atualiza no JSON
                setTimeout(() => {
                    blindStatus.textContent = 'Abertas';
                    blindStatus.style.color = '#4CAF50';
                    blindIcon.textContent = 'vertical_align_top';
                    blindIcon.classList.remove('closed');
                    blindIcon.classList.add('open');
                    deviceStates[deviceId].status = 'Abertas'; // Atualiza no JSON
                }, 700);
            });
            blindDownButton.addEventListener('click', () => {
                blindStatus.textContent = 'Fechando...';
                blindStatus.style.color = '#FFC107';
                deviceStates[deviceId].status = 'Fechando...'; // Atualiza no JSON
                setTimeout(() => {
                    blindStatus.textContent = 'Fechadas';
                    blindStatus.style.color = '#F44336';
                    blindIcon.textContent = 'vertical_align_center';
                    blindIcon.classList.remove('open');
                    blindIcon.classList.add('closed');
                    deviceStates[deviceId].status = 'Fechadas'; // Atualiza no JSON
                }, 700);
            });
        }
    });

    // --- Controle de Câmeras na Tela de Câmeras ---
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
        const deviceId = cameraCard.dataset.camera; // Assuming data-camera is used for camera IDs
        if (!deviceId || !deviceStates[deviceId]) return;

        const cameraDisplay = cameraCard.querySelector('.camera-display');
        const cameraStatusIcon = cameraCard.querySelector('.material-icons.camera-status-icon');
        const cameraStatusText = cameraCard.querySelector('.camera-status-text');
        const onButton = cameraCard.querySelector('.button-on');
        const offButton = cameraCard.querySelector('.button-off');
        const cameraId = cameraCard.dataset.camera; // Obtém o ID da câmera do atributo data-camera

        // Initialize camera display based on JSON status
        if (deviceStates[deviceId].status === 'Ligado') {
            const imageUrl = cameraImages[cameraId];
            if (imageUrl) {
                cameraDisplay.style.backgroundImage = `url("${imageUrl}")`;
                cameraDisplay.style.backgroundSize = 'cover';
                cameraDisplay.style.backgroundPosition = 'center';
                cameraDisplay.style.backgroundColor = 'transparent';
                if (cameraStatusIcon) cameraStatusIcon.style.display = 'none';
                if (cameraStatusText) cameraStatusText.style.display = 'none';
            }
        } else {
            cameraDisplay.style.backgroundImage = 'none';
            cameraDisplay.style.backgroundColor = '#000';
            if (cameraStatusIcon) cameraStatusIcon.style.display = 'block';
            if (cameraStatusText) cameraStatusText.style.display = 'block';
        }

        if (onButton && offButton) {
            onButton.addEventListener('click', () => {
                deviceStates[deviceId].status = 'Ligado'; // Update JSON
                const imageUrl = cameraImages[cameraId];
                if (imageUrl) {
                    cameraDisplay.style.backgroundImage = `url("${imageUrl}")`;
                    cameraDisplay.style.backgroundSize = 'cover';
                    cameraDisplay.style.backgroundPosition = 'center';
                    cameraDisplay.style.backgroundColor = 'transparent';
                    if (cameraStatusIcon) cameraStatusIcon.style.display = 'none';
                    if (cameraStatusText) cameraStatusText.style.display = 'none';
                }
            });

            offButton.addEventListener('click', () => {
                deviceStates[deviceId].status = 'Desligado'; // Update JSON
                cameraDisplay.style.backgroundImage = 'none';
                cameraDisplay.style.backgroundColor = '#000';
                if (cameraStatusIcon) cameraStatusIcon.style.display = 'block';
                if (cameraStatusText) cameraStatusText.style.display = 'block';
            });
        }
    });

    // --- Inicializa todos os controles após carregar os dados ---
    // Isso garante que os estados visuais reflitam o JSON ao carregar a página
    document.querySelectorAll('.card').forEach(card => {
        const deviceId = card.dataset.device;
        if (!deviceId || !deviceStates[deviceId]) return; // Pula se não tiver deviceId ou dados correspondentes

        if (card.classList.contains('light-control') || card.classList.contains('media-control')) {
            setupOnOffControl(card);
        } else if (card.classList.contains('house-temp-control') || card.classList.contains('ac-control')) {
            setupTemperatureControl(card);
        } else if (card.classList.contains('security-control')) {
            // A função setupSecurityControl já inicializa com base no JSON
            // Mas precisamos chamar para configurar os listeners
            const lockButton = card.querySelector('.button-lock');
            const unlockButton = card.querySelector('.button-unlock');
            if (lockButton && unlockButton) {
                // Chama novamente para garantir que os listeners sejam adicionados
                // e o estado visual seja o do JSON
                document.querySelectorAll('.security-control').forEach(sCard => {
                    const sDeviceId = sCard.dataset.device;
                    if (!sDeviceId || !deviceStates[sDeviceId]) return;
                    const statusText = sCard.querySelector('.status-text');
                    const statusIcon = sCard.querySelector('.icon');
                    if (statusText) {
                        statusText.textContent = deviceStates[sDeviceId].status;
                        statusText.style.color = (deviceStates[sDeviceId].status === 'Trancado') ? '#F44336' : '#4CAF50';
                    }
                    if (statusIcon) {
                        statusIcon.textContent = (deviceStates[sDeviceId].status === 'Trancado') ? 'lock' : 'lock_open';
                        statusIcon.classList.remove('open', 'locked');
                        statusIcon.classList.add((deviceStates[sDeviceId].status === 'Trancado') ? 'locked' : 'open');
                    }
                });
            }
        } else if (card.classList.contains('blind-control')) {
             // A função setupBlindControl já inicializa com base no JSON
             document.querySelectorAll('.blind-control').forEach(bCard => {
                const bDeviceId = bCard.dataset.device;
                if (!bDeviceId || !deviceStates[bDeviceId]) return;
                const statusText = bCard.querySelector('.status-text');
                const statusIcon = bCard.querySelector('.icon');
                 if (statusText) {
                    statusText.textContent = deviceStates[bDeviceId].status;
                    statusText.style.color = (deviceStates[bDeviceId].status === 'Fechadas') ? '#F44336' : ((deviceStates[bDeviceId].status === 'Abertas') ? '#4CAF50' : '#FFC107');
                }
                if (statusIcon) {
                    statusIcon.textContent = (deviceStates[bDeviceId].status === 'Fechadas') ? 'vertical_align_center' : 'vertical_align_top';
                    statusIcon.classList.remove('open', 'closed');
                    statusIcon.classList.add((deviceStates[bDeviceId].status === 'Fechadas') ? 'closed' : 'open');
                }
             });
        }
    }); 
});
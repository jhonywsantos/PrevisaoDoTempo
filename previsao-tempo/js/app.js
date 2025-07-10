import { weatherCodes, getWeatherIcon } from './weatherCodes.js';

// Elementos DOM
const elements = {
    cityInput: document.getElementById('cityInput'),
    searchButton: document.getElementById('searchButton'),
    locationButton: document.getElementById('locationButton'),
    errorMessage: document.getElementById('errorMessage'),
    currentWeather: document.getElementById('currentWeather'),
    locationName: document.getElementById('locationName'),
    currentDate: document.getElementById('currentDate'),
    currentTemp: document.getElementById('currentTemp'),
    weatherDescription: document.getElementById('weatherDescription'),
    windSpeed: document.getElementById('windSpeed'),
    minMaxTemp: document.getElementById('minMaxTemp'),
    weatherIcon: document.getElementById('weatherIcon'),
    forecastContainer: document.getElementById('forecastContainer'),
    noForecastMessage: document.getElementById('noForecastMessage')
};

// Event Listeners
elements.searchButton.addEventListener('click', searchWeather);
elements.locationButton.addEventListener('click', getLocationWeather);
elements.cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});

// Função principal para buscar clima
async function searchWeather() {
    const city = elements.cityInput.value.trim();
    if (!city) {
        showError('Por favor, digite o nome de uma cidade');
        return;
    }
    
    try {
        // 1. Primeiro obtemos as coordenadas da cidade
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=pt`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Cidade não encontrada. Verifique o nome e tente novamente.');
        }
        
        // Se houver várias cidades com o mesmo nome, peça para selecionar
        if (geoData.results.length > 1) {
            const selectedLocation = await selectLocation(geoData.results);
            if (!selectedLocation) return;
            
            const locationData = {
                name: selectedLocation.name,
                state: selectedLocation.admin1,
                country: selectedLocation.country
            };
            
            localStorage.setItem('lastCity', `${selectedLocation.name}, ${selectedLocation.admin1 || selectedLocation.country}`);
            await fetchWeatherData(selectedLocation.latitude, selectedLocation.longitude, locationData);
        } else {
            const location = geoData.results[0];
            const locationData = {
                name: location.name,
                state: location.admin1,
                country: location.country
            };
            
            localStorage.setItem('lastCity', `${location.name}, ${location.admin1 || location.country}`);
            await fetchWeatherData(location.latitude, location.longitude, locationData);
        }
    } catch (error) {
        showError(error.message);
        console.error('Erro ao buscar dados:', error);
    }
}

// Função para selecionar entre cidades com mesmo nome
async function selectLocation(locations) {
    // Criar modal de seleção
    const modal = document.createElement('div');
    modal.className = 'location-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Várias localizações encontradas</h3>
            <p>Selecione a cidade correta:</p>
            <ul class="location-list">
                ${locations.map(loc => `
                    <li data-lat="${loc.latitude}" data-lon="${loc.longitude}" 
                        data-name="${loc.name}" data-state="${loc.admin1}" data-country="${loc.country}">
                        <strong>${loc.name}</strong>, ${loc.admin1 || loc.country}
                        <div class="location-details">
                            <small>${loc.country} • Lat: ${loc.latitude.toFixed(2)}, Lon: ${loc.longitude.toFixed(2)}</small>
                        </div>
                    </li>
                `).join('')}
            </ul>
            <button class="cancel-button">Cancelar</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Esperar pela seleção do usuário
    return new Promise((resolve) => {
        modal.querySelector('.cancel-button').addEventListener('click', () => {
            modal.remove();
            resolve(null);
        });
        
        modal.querySelectorAll('.location-list li').forEach(item => {
            item.addEventListener('click', () => {
                modal.remove();
                resolve({
                    latitude: parseFloat(item.dataset.lat),
                    longitude: parseFloat(item.dataset.lon),
                    name: item.dataset.name,
                    admin1: item.dataset.state,
                    country: item.dataset.country
                });
            });
        });
    });
}

// Função para obter clima por geolocalização
async function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocalização não é suportada pelo seu navegador');
        return;
    }
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // Tentar obter o nome da localização
        try {
            const reverseGeoUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=pt`;
            const reverseResponse = await fetch(reverseGeoUrl);
            const reverseData = await reverseResponse.json();
            
            const locationName = reverseData.results?.[0]?.name || 'Sua Localização';
            const locationState = reverseData.results?.[0]?.admin1 || '';
            const locationCountry = reverseData.results?.[0]?.country || '';
            
            elements.cityInput.value = `${locationName}${locationState ? ', ' + locationState : ''}`;
            
            const locationData = {
                name: locationName,
                state: locationState,
                country: locationCountry
            };
            
            await fetchWeatherData(lat, lon, locationData);
        } catch {
            // Se falhar, usar apenas as coordenadas
            await fetchWeatherData(lat, lon, {
                name: 'Sua Localização',
                state: '',
                country: ''
            });
        }
    } catch (error) {
        showError('Não foi possível obter sua localização. Por favor, permita o acesso ou pesquise por uma cidade.');
        console.error('Erro de geolocalização:', error);
    }
}

// Função para buscar dados meteorológicos
async function fetchWeatherData(latitude, longitude, locationData) {
    try {
        showLoading();
        
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max&timezone=auto`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        
        if (!weatherData.current_weather || !weatherData.daily) {
            throw new Error('Dados meteorológicos não disponíveis para esta localização.');
        }
        
        displayWeatherData(locationData, weatherData);
    } catch (error) {
        showError('Erro ao obter dados do tempo. Por favor, tente novamente.');
        console.error('Erro ao buscar dados meteorológicos:', error);
    }
}

// Função para exibir dados na interface
function displayWeatherData(locationData, weatherData) {
    // Dados atuais
    const current = weatherData.current_weather;
    const daily = weatherData.daily;
    
    // Formatar nome da localização (cidade, estado ou país)
    const locationName = `${locationData.name}${locationData.state ? ', ' + locationData.state : locationData.country ? ', ' + locationData.country : ''}`;
    elements.locationName.textContent = locationName;
    elements.currentDate.textContent = formatDate(current.time);
    elements.currentTemp.textContent = `${Math.round(current.temperature)}°C`;
    
    const weatherInfo = getWeatherIcon(current.weathercode);
    
    elements.weatherDescription.textContent = weatherInfo.description;
    elements.windSpeed.textContent = `Vento: ${Math.round(current.windspeed)} km/h`;
    
    // Atualizar ícone do clima
    elements.weatherIcon.className = weatherInfo.icon;
    elements.weatherIcon.style.color = weatherInfo.color;
    
    // Temperaturas mínima e máxima do dia
    if (daily.temperature_2m_min && daily.temperature_2m_max) {
        elements.minMaxTemp.textContent = `Min: ${Math.round(daily.temperature_2m_min[0])}°C / Máx: ${Math.round(daily.temperature_2m_max[0])}°C`;
    }
    
    // Previsão para os próximos dias
    elements.forecastContainer.innerHTML = '';
    
    if (daily.time && daily.time.length > 1) {
        for (let i = 1; i < Math.min(daily.time.length, 8); i++) {
            const dayInfo = getWeatherIcon(daily.weathercode[i]);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'forecast-day';
            dayElement.innerHTML = `
                <div class="day-info">
                    <span class="day-name">${getDayName(daily.time[i])}</span>
                    <span class="day-date">${formatDateShort(daily.time[i])}</span>
                </div>
                <i class="${dayInfo.icon} day-icon" style="color: ${dayInfo.color}"></i>
                <span class="day-temp">${Math.round(daily.temperature_2m_min[i])}° / ${Math.round(daily.temperature_2m_max[i])}°</span>
            `;
            
            elements.forecastContainer.appendChild(dayElement);
        }
    } else {
        elements.noForecastMessage.textContent = 'Previsão não disponível';
        elements.noForecastMessage.classList.remove('hidden');
    }
    
    // Mostrar seção de clima atual
    elements.currentWeather.classList.remove('hidden');
    elements.errorMessage.classList.add('hidden');
    elements.noForecastMessage.classList.add('hidden');
}

// Funções auxiliares
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('pt-BR', options);
}

function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function getDayName(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    elements.currentWeather.classList.add('hidden');
    elements.noForecastMessage.textContent = 'Erro ao carregar dados';
    elements.noForecastMessage.classList.remove('hidden');
}

function showLoading() {
    elements.noForecastMessage.textContent = 'Carregando dados...';
    elements.noForecastMessage.classList.remove('hidden');
    elements.forecastContainer.innerHTML = '';
    elements.currentWeather.classList.add('hidden');
    elements.errorMessage.classList.add('hidden');
}

// Inicialização - tentar carregar última cidade pesquisada
window.addEventListener('load', () => {
    if (localStorage.getItem('lastCity')) {
        elements.cityInput.value = localStorage.getItem('lastCity');
    }
});
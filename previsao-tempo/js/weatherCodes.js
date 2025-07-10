// Códigos meteorológicos e classes de ícones correspondentes (Weather Icons)
export const weatherCodes = {
    0: { 
        description: 'Céu limpo',
        icon: 'wi wi-day-sunny',
        color: '#f39c12'
    },
    1: { 
        description: 'Principalmente limpo',
        icon: 'wi wi-day-cloudy-high',
        color: '#f39c12'
    },
    2: { 
        description: 'Parcialmente nublado',
        icon: 'wi wi-day-cloudy',
        color: '#95a5a6'
    },
    3: { 
        description: 'Nublado',
        icon: 'wi wi-cloudy',
        color: '#7f8c8d'
    },
    45: { 
        description: 'Nevoeiro',
        icon: 'wi wi-fog',
        color: '#bdc3c7'
    },
    48: { 
        description: 'Nevoeiro de gelo',
        icon: 'wi wi-snowflake-cold',
        color: '#3498db'
    },
    51: { 
        description: 'Chuvisco leve',
        icon: 'wi wi-sprinkle',
        color: '#3498db'
    },
    53: { 
        description: 'Chuvisco moderado',
        icon: 'wi wi-rain-mix',
        color: '#3498db'
    },
    55: { 
        description: 'Chuvisco denso',
        icon: 'wi wi-showers',
        color: '#2980b9'
    },
    56: { 
        description: 'Chuvisco gélido',
        icon: 'wi wi-sleet',
        color: '#3498db'
    },
    57: { 
        description: 'Chuvisco gélido denso',
        icon: 'wi wi-sleet',
        color: '#3498db'
    },
    61: { 
        description: 'Chuva leve',
        icon: 'wi wi-rain',
        color: '#2980b9'
    },
    63: { 
        description: 'Chuva moderada',
        icon: 'wi wi-rain',
        color: '#2980b9'
    },
    65: { 
        description: 'Chuva forte',
        icon: 'wi wi-rain-wind',
        color: '#1a5276'
    },
    66: { 
        description: 'Chuva gélida',
        icon: 'wi wi-sleet',
        color: '#3498db'
    },
    67: { 
        description: 'Chuva gélida forte',
        icon: 'wi wi-sleet',
        color: '#3498db'
    },
    71: { 
        description: 'Neve leve',
        icon: 'wi wi-snow',
        color: '#ecf0f1'
    },
    73: { 
        description: 'Neve moderada',
        icon: 'wi wi-snow',
        color: '#ecf0f1'
    },
    75: { 
        description: 'Neve forte',
        icon: 'wi wi-snow-wind',
        color: '#ecf0f1'
    },
    77: { 
        description: 'Grãos de neve',
        icon: 'wi wi-snowflake-cold',
        color: '#ecf0f1'
    },
    80: { 
        description: 'Pancadas de chuva',
        icon: 'wi wi-showers',
        color: '#2980b9'
    },
    81: { 
        description: 'Pancadas fortes',
        icon: 'wi wi-storm-showers',
        color: '#1a5276'
    },
    82: { 
        description: 'Pancadas violentas',
        icon: 'wi wi-thunderstorm',
        color: '#1a5276'
    },
    85: { 
        description: 'Pancadas de neve',
        icon: 'wi wi-snow-wind',
        color: '#ecf0f1'
    },
    86: { 
        description: 'Pancadas de neve fortes',
        icon: 'wi wi-snow-wind',
        color: '#ecf0f1'
    },
    95: { 
        description: 'Trovoada',
        icon: 'wi wi-thunderstorm',
        color: '#8e44ad'
    },
    96: { 
        description: 'Trovoada com granizo',
        icon: 'wi wi-hail',
        color: '#8e44ad'
    },
    99: { 
        description: 'Trovoada com granizo forte',
        icon: 'wi wi-hail',
        color: '#8e44ad'
    }
};

// Função para obter ícone do clima
export function getWeatherIcon(code) {
    return weatherCodes[code] || { 
        icon: 'wi wi-na', 
        description: 'Condição desconhecida',
        color: '#95a5a6'
    };
}
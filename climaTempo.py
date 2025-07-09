from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime, timedelta
import pytz

app = Flask(__name__)

# Dicionário de códigos meteorológicos
weather_codes = {
    0: 'Céu limpo',
    1: 'Principalmente limpo',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Nevoeiro',
    48: 'Nevoeiro de deposição de gelo',
    51: 'Chuvisco leve',
    53: 'Chuvisco moderado',
    55: 'Chuvisco denso',
    56: 'Chuvisco gélido leve',
    57: 'Chuvisco gélido denso',
    61: 'Chuva leve',
    63: 'Chuva moderada',
    65: 'Chuva forte',
    66: 'Chuva gélida leve',
    67: 'Chuva gélida forte',
    71: 'Queda de neve leve',
    73: 'Queda de neve moderada',
    75: 'Queda de neve forte',
    77: 'Grãos de neve',
    80: 'Pancadas de chuva leves',
    81: 'Pancadas de chuva moderadas',
    82: 'Pancadas de chuva violentas',
    85: 'Pancadas de neve leves',
    86: 'Pancadas de neve fortes',
    95: 'Trovoada leve ou moderada',
    96: 'Trovoada com granizo leve',
    99: 'Trovoada com granizo forte',
}

def get_weather_description(code):
    return weather_codes.get(code, 'Condição desconhecida')

def get_day_name(date_str):
    tz = pytz.timezone('America/Sao_Paulo')
    date = datetime.strptime(date_str, '%Y-%m-%d').date()
    today = datetime.now(tz).date()
    tomorrow = today + timedelta(days=1)
    
    if date == today:
        return 'Hoje'
    elif date == tomorrow:
        return 'Amanhã'
    else:
        return date.strftime('%A').capitalize()

def format_date(date_str):
    date = datetime.strptime(date_str, '%Y-%m-%d')
    return date.strftime('%d/%m')

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        city = request.form.get('city')
        if not city:
            return render_template('index.html', error="Por favor, insira o nome de uma cidade para pesquisar.")
        
        # Buscar coordenadas da cidade
        geocoding_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=pt&format=json"
        try:
            geo_response = requests.get(geocoding_url)
            geo_response.raise_for_status()
            geo_data = geo_response.json()
            
            if not geo_data.get('results'):
                return render_template('index.html', error="Cidade não encontrada. Por favor, tente um nome diferente.")
            
            location = geo_data['results'][0]
            latitude = location['latitude']
            longitude = location['longitude']
            location_name = location.get('name', city)
            
            # Buscar dados meteorológicos
            weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=America%2FSao_Paulo&forecast_days=7"
            weather_response = requests.get(weather_url)
            weather_response.raise_for_status()
            weather_data = weather_response.json()
            
            # Processar dados para o template
            current_weather = weather_data.get('current_weather', {})
            daily_data = weather_data.get('daily', {})
            
            # Preparar previsão diária
            daily_forecast = []
            if daily_data.get('time'):
                for i in range(len(daily_data['time'])):
                    if i == 0:
                        continue  # Pular o dia atual (já mostrado na seção principal)
                    
                    daily_forecast.append({
                        'date': daily_data['time'][i],
                        'day_name': get_day_name(daily_data['time'][i]),
                        'formatted_date': format_date(daily_data['time'][i]),
                        'max_temp': round(daily_data['temperature_2m_max'][i]),
                        'min_temp': round(daily_data['temperature_2m_min'][i]),
                        'weather_code': daily_data['weathercode'][i],
                        'description': get_weather_description(daily_data['weathercode'][i])
                    })
            
            # Formatar data atual
            tz = pytz.timezone('America/Sao_Paulo')
            current_date = datetime.now(tz).strftime('%A, %d de %B de %Y').capitalize()
            
            return render_template('index.html', 
                                location_name=location_name,
                                current_date=current_date,
                                current_temp=round(current_weather.get('temperature', 0)),
                                current_weather_code=current_weather.get('weathercode', 0),
                                current_wind=round(current_weather.get('windspeed', 0)),
                                min_temp=round(daily_data.get('temperature_2m_min', [0])[0]),
                                max_temp=round(daily_data.get('temperature_2m_max', [0])[0]),
                                daily_forecast=daily_forecast)
            
        except requests.exceptions.RequestException as e:
            return render_template('index.html', error=f"Erro ao buscar dados: {str(e)}")
    
    # Se for GET, mostrar página inicial sem dados
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
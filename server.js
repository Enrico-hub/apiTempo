const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Coordenadas do evento (São Paulo como exemplo)
const LATITUDE = -23.55;
const LONGITUDE = -46.63;
const TIMEZONE = 'America/Sao_Paulo';

// Datas do evento
const EVENT_DATES = ['2025-11-15', '2025-11-16', '2025-11-17'];

// Dicionário de códigos climáticos
const WEATHER_CODE_MAP = {
  0: 'Céu limpo',
  1: 'Predominantemente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Nevoeiro',
  48: 'Nevoeiro com geada',
  51: 'Garoa fraca',
  53: 'Garoa moderada',
  55: 'Garoa intensa',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  66: 'Chuva congelante fraca',
  67: 'Chuva congelante forte',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve forte',
  80: 'Pancadas de chuva fracas',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva fortes',
  95: 'Tempestade',
  96: 'Tempestade com granizo leve',
  99: 'Tempestade com granizo forte'
};

async function getWeatherForecast() {
  const url = 'https://api.open-meteo.com/v1/forecast';
  const params = {
    latitude: LATITUDE,
    longitude: LONGITUDE,
    daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: TIMEZONE
  };

  try {
    const { data } = await axios.get(url, { params });

    const previsoes = EVENT_DATES.map((dataEvento) => {
      const datas = data.daily.time;
      let index = datas.indexOf(dataEvento);

      // se não achar data exata, usa o mais próximo
      if (index === -1) index = 0;

      const weatherCode = data.daily.weathercode[index];
      const condicao =
        WEATHER_CODE_MAP[weatherCode] ||
        `Condição climática código ${weatherCode}`;

      return {
        dia: dataEvento,
        condicao,
        tempMin: data.daily.temperature_2m_min[index],
        tempMax: data.daily.temperature_2m_max[index],
        chanceChuva:
          data.daily.precipitation_probability_max[index] ?? 0
      };
    });

    return previsoes;
  } catch (error) {
    console.error('Erro ao chamar Open-Meteo:', error.message);
    return EVENT_DATES.map((d) => ({
      dia: d,
      condicao: 'Não foi possível obter a previsão',
      tempMin: null,
      tempMax: null,
      chanceChuva: null
    }));
  }
}

// Endpoint principal
app.get('/previsao', async (req, res) => {
  const previsoes = await getWeatherForecast();
  res.json({ status: 'ok', previsoes });
});

// Healthcheck
app.get('/', (req, res) => {
  res.send('API Lumina Fest (Open-Meteo) rodando ✅');
});

app.listen(PORT, () => {
  console.log(`API Lumina Fest rodando na porta ${PORT}`);
});

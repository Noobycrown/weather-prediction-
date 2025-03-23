import axios from 'axios';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const WEATHERSTACK_API_KEY = process.env.REACT_APP_WEATHERSTACK_API_KEY;
const WEATHERSTACK_BASE_URL = 'http://api.weatherstack.com';

/**
 * Fetch past weather data for analysis.
 * @param {string} location - The location name.
 * @param {number} days - Number of days to go back.
 * @returns {Array} Historical weather records.
 */
const fetchHistoricalWeather = async (location, days = 7) => {
  try {
    let historicalData = [];

    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];

      const response = await axios.get(`${WEATHERSTACK_BASE_URL}/historical`, {
        params: {
          access_key: WEATHERSTACK_API_KEY,
          query: location,
          historical_date: formattedDate,
        },
      });

      if (response.data?.historical?.[formattedDate]) {
        historicalData.push(response.data.historical[formattedDate]);
      }
    }

    return historicalData.length ? historicalData : null;
  } catch (error) {
    console.error('Error fetching historical weather data:', error);
    return null;
  }
};

/**
 * Predict disaster probabilities using Gemini AI.
 * @param {string} location - The location name.
 * @param {Object} weatherData - Current weather data.
 * @returns {string} Disaster probability response.
 */
export const fetchDisasterProbability = async (location, weatherData) => {
  try {
    // Fetch historical weather data for the past 14 days
    const historicalWeather = await fetchHistoricalWeather(location, 14);

    // Prepare historical weather text for the Gemini API
    let historyText = 'No historical data available.';
    if (historicalWeather) {
      historyText = historicalWeather
        .map(
          (day, index) =>
            `Day ${index + 1}: Temp: ${day.temperature}°C, Rainfall: ${day.precip}mm, Wind: ${day.wind_speed} km/h, Humidity: ${day.humidity}%`
        )
        .join('\n');
    }

    // Prepare the prompt for Gemini API
    const prompt = `Based on the current and historical weather conditions in ${location}, analyze the probability of different natural disasters.

- **Current Weather**: Temperature: ${weatherData.current.temp_c}°C, Rainfall: ${weatherData.current.precip_mm}mm, Wind Speed: ${weatherData.current.wind_kph} km/h, Humidity: ${weatherData.current.humidity}%.
- **Historical Weather Data**:
${historyText}

Predict the probability of:
- **Flood** (caused by heavy rain)
- **Drought** (low rainfall & high temperature)
- **Cyclone** (high wind speed & humidity)
- **Heatwave** (extreme temperature)

Return the probabilities in percentage format like this:
Flood: 60%
Drought: 20%
Cyclone: 15%
Heatwave: 5%

Also, provide a short reason for each probability.`;

    // Make the request to Gemini API
    const response = await axios.post(
      `${GEMINI_BASE_URL}/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    );

    // Check if the response is valid
    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0] &&
      response.data.candidates[0].content.parts[0].text
    ) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response structure from Gemini API');
    }
  } catch (error) {
    console.error('Error fetching disaster probability:', error);

    // Fallback response in case of API failure
    return `Flood: 30%
Drought: 10%
Cyclone: 5%
Heatwave: 20%

Reason: Unable to fetch real-time data. Using fallback probabilities.`;
  }
};
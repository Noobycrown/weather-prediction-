import axios from 'axios';

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

export const fetchWeatherData = async (city) => {
  try {
    const response = await axios.get(`${BASE_URL}/current.json`, {
      params: {
        key: API_KEY,
        q: city,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

export const fetchIndianCitiesWeather = async () => {
  const indianCities = [
    'Mumbai', 'New Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
    'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam', 'Indore', 'Thane', 'Bhopal', 'Patna', 'Vadodara', 'Ghaziabad',
    'Ludhiana', 'Agra', 'Nashik', 'Ranchi', 'Meerut', 'Guwahati', 'Chandigarh', 'Coimbatore', 'Mysore', 'Jodhpur',
    'Raipur', 'Bareilly', 'Madurai', 'Varanasi', 'Prayagraj', 'Amritsar', 'Gwalior', 'Vijayawada', 'Bhubaneswar',
    'Dehradun', 'Tiruchirappalli', 'Jamshedpur', 'Mangalore', 'Udaipur', 'Thiruvananthapuram', 'Gandhinagar', 'Aurangabad',
    'Port Blair', 'Chandigarh', 'Daman', 'Diu', 'Silvassa', 'Kavaratti', 'Puducherry', 'Leh', 'Kargil', 'Srinagar', 'Jammu',
    'Faridabad', 'Noida', 'Greater Noida', 'Ghaziabad', 'Panaji', 'Belagavi', 'Hubli', 'Dharwad', 'Kozhikode', 'Malappuram',
    'Thrissur', 'Palakkad', 'Asansol', 'Durgapur', 'Siliguri', 'Bokaro', 'Dhanbad', 'Rourkela', 'Bhagalpur', 'Muzaffarpur',
    'Gaya', 'Rohtak', 'Hisar', 'Sonipat', 'Ambala', 'Panipat', 'Shimla', 'Solan', 'Hamirpur', 'Bilaspur', 'Kangra',
    'Itanagar', 'Imphal', 'Aizawl', 'Shillong', 'Kohima', 'Gangtok', 'Agartala', 'Dimapur', 'Tezpur', 'Dibrugarh', 'Jorhat',
    'Sambalpur', 'Balasore', 'Cuttack', 'Berhampur', 'Guntur', 'Nellore', 'Tirupati', 'Warangal', 'Karimnagar', 'Nizamabad',
    'Rajahmundry', 'Eluru', 'Kurnool', 'Anantapur', 'Chittoor', 'Erode', 'Salem', 'Vellore', 'Thoothukudi', 'Tirunelveli',
    'Bhavnagar', 'Jamnagar', 'Rajkot', 'Morbi', 'Junagadh', 'Gandhidham', 'Anand', 'Navsari', 'Mehsana', 'Surendranagar',
    'Aligarh', 'Moradabad', 'Saharanpur', 'Muzaffarnagar', 'Gorakhpur', 'Faizabad', 'Firozabad', 'Jhansi', 'Shahjahanpur',
    'Etawah', 'Sitapur', 'Mirzapur', 'Mathura', 'Rampur', 'Fatehpur', 'Barabanki', 'Jaunpur', 'Lakhimpur', 'Banda',' jabalpur','Amrabati','Udaipur','Bankura','Bikaner',
  ];

  const weatherData = await Promise.all(
    indianCities.map(async (city) => {
      const weather = await fetchWeatherData(city);
      return weather
        ? {
            city,
            temperature: weather.current.temp_c,
            humidity: weather.current.humidity,
            windSpeed: weather.current.wind_kph,
            coordinates: [weather.location.lat, weather.location.lon],
          }
        : null;
    })
  );

  return weatherData.filter((data) => data !== null);
};
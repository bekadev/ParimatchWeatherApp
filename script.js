// Получаем элементы HTML, с которыми будем взаимодействовать
const cityInput = document.querySelector(".city-input"); // Поле ввода названия города
const searchButton = document.querySelector(".search-btn"); // Кнопка для поиска по введенному городу
const locationButton = document.querySelector(".location-btn"); // Кнопка для определения местоположения пользователя
const currentWeatherDiv = document.querySelector(".current-weather"); // Контейнер для текущей погоды
const weatherCardsDiv = document.querySelector(".weather-cards"); // Контейнер для погоды на несколько дней

const API_KEY = "b4258edb25b4ef849381c041137e71ee"; // Ключ API для OpenWeatherMap API

// Функция для создания HTML-карточки погоды
const createWeatherCard = (cityName, weatherItem, index) => {
  if(index === 0) { // HTML для основной карточки погоды
    return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Температура: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Ветер: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Влажность: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
  } else { // HTML для карточки погоды на другие дни
    return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                    <h6>Температура: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Ветер: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Влажность: ${weatherItem.main.humidity}%</h6>
                </li>`;
  }
}

// Функция для получения данных о погоде
const getWeatherDetails = (cityName, latitude, longitude) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

  // Получаем данные о погоде с использованием API OpenWeatherMap
  fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
    // Фильтруем прогнозы, чтобы получить только один прогноз на каждый день
    const uniqueForecastDays = [];
    const fiveDaysForecast = data.list.filter(forecast => {
      const forecastDate = new Date(forecast.dt_txt).getDate();
      if (!uniqueForecastDays.includes(forecastDate)) {
        return uniqueForecastDays.push(forecastDate);
      }
    });

    // Очищаем предыдущие данные о погоде
    cityInput.value = "";
    currentWeatherDiv.innerHTML = "";
    weatherCardsDiv.innerHTML = "";

    // Создаем карточки погоды и добавляем их в DOM
    fiveDaysForecast.forEach((weatherItem, index) => {
      const html = createWeatherCard(cityName, weatherItem, index);
      if (index === 0) {
        currentWeatherDiv.insertAdjacentHTML("beforeend", html);
      } else {
        weatherCardsDiv.insertAdjacentHTML("beforeend", html);
      }
    });
  }).catch(() => {
    alert("Произошла ошибка при получении прогноза погоды!!");
  });
}

// Функция для получения координат города по его названию
const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (cityName === "") return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  // Получаем координаты введенного города из API-ответа

  fetch(API_URL).then(response => response.json()).then(data => {
    if (!data.length) return alert(`Координаты для города ${cityName} не найдены`);
    const { lat, lon, name } = data[0];
    getWeatherDetails(name, lat, lon);
  }).catch(() => {
    alert("Произошла ошибка при получении координат!");
  });
}

// Функция для получения координат текущего местоположения пользователя
const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords; // Get coordinates of user location
      // Получаем название города по его координатам с помощью обратного геокодирования
      const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
      fetch(API_URL).then(response => response.json()).then(data => {
        const { name } = data[0];
        getWeatherDetails(name, latitude, longitude);
      }).catch(() => {
        alert("Произошла ошибка при получении названия города!");
      });
    },
    error => { // Показываем сообщение об ошибке, если пользователь отказался от запроса на определение местоположения
      if (error.code === error.PERMISSION_DENIED) {
        alert("Запрос на геолокацию отклонен. Пожалуйста, сбросьте разрешение на геолокацию, чтобы предоставить доступ снова.");
      } else {
        alert("Ошибка запроса на геолокацию. Пожалуйста, сбросьте разрешение на геолокацию.");
      }
    });
}

// Назначаем обработчики событий для кнопок и поля ввода
locationButton.addEventListener("click", getUserCoordinates); // Получить местоположение пользователя
searchButton.addEventListener("click", getCityCoordinates); // Получить погоду для введенного города
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates()); // Получить погоду при нажатии Enter в поле ввода

import React, { useState, useEffect, useRef } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import './rfu.css';

function RFU() {
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [dateTime, setDateTime] = useState(new Date());


  // Function to get user's current location
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Call the reverse geocoding function with latitude and longitude
          reverseGeocode(latitude, longitude)
            .then((address) => {
              resolve({ latitude, longitude, address });
            })
            .catch((error) => {
              reject(error);
            });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  // Function to perform reverse geocoding
  const reverseGeocode = (latitude, longitude) => {
    // Use Google Maps Geocoding API to perform reverse geocoding
    const apiKey = ''; // Replace with your Google Maps API key
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    return fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          return data.results[0].formatted_address;
        } else {
          throw new Error('No address found for the given coordinates');
        }
      });
  };

  const fetchWeatherData = (latitude, longitude) => {
    const apiKeyW = '';
    const apiUrlW = `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&appid=${apiKeyW}&units=metric`;
  
    fetch(apiUrlW)
      .then((response) => response.json())
      .then((data) => {
        setWeatherData(data);
      })
      .catch((error) => {
        console.error('Error fetching weather data:', error);
      });
  };
  
  

  const fetchRecommendations = async (userLocationAddress, dateTime) => {
    try {
      const apiKeyOAI = '';
      const apiUrlOAI = 'https://api.openai.com/v1/chat/completions';
  
      const response = await fetch(apiUrlOAI, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeyOAI}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant designed to output JSON.'
            },
            {
              role: 'user',
              content: `I would like 3 restaurant recommendations, 3 sports events recommendations, 3 musical events recommendations based on my location: ${userLocationAddress}, present date and time : ${dateTime.toLocaleString()} .
               I want the name, dates, time, address, exact latitude and longitude of the address. I also want the all hours of operations for restaurants. I will give you the naming conventions for the output. Use those naming conventions to give the response.
               Naming Conventions:
               currentLocation, currentDateAndTime, restaurants, musicalEvents, sportsEvents
               for restaurants: name, address, latitude, longitude, hoursOfOperation{}
               for musicalEvents: name, address, latitude, longitude, date, time
               for sportsEvents: name, address, latitude, longitude, date, time`
            }
          ]
        })
      });
  
      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          const assistantMessage = data.choices[0].message.content;
          const parsedRecommendations = JSON.parse(assistantMessage);
          console.log(parsedRecommendations);
          setRecommendations(parsedRecommendations);
        }
      } else {
        throw new Error('Failed to fetch recommendations');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };


  const mapRef = useRef(null); // Reference to the map

const initMap = (lat, lng) => {
  const map = new window.google.maps.Map(mapRef.current, {
    center: { lat, lng },
    zoom: 12,
  });

  // Place markers for restaurants
  if (recommendations.restaurants) {
    recommendations.restaurants.forEach((restaurant, index) => {
      new window.google.maps.Marker({
        position: { lat: restaurant.latitude, lng: restaurant.longitude },
        map,
        title: `Restaurant ${index + 1}`,
        icon: {
          url: 'http://maps.gstatic.com/mapfiles/ms2/micons/coffeehouse.png', // Google's restaurant icon
          scaledSize: new window.google.maps.Size(30, 30),
        },
      });
    });
  }

  // Place markers for musical events
  if (recommendations.musicalEvents) {
    recommendations.musicalEvents.forEach((event, index) => {
      new window.google.maps.Marker({
        position: { lat: event.latitude, lng: event.longitude },
        map,
        title: `Musical Event ${index + 1}`,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/picnic.png', // Google's music icon
          scaledSize: new window.google.maps.Size(30, 30),
        },
      });
    });
  }

  // Place markers for sports events
  if (recommendations.sportsEvents) {
    recommendations.sportsEvents.forEach((event, index) => {
      new window.google.maps.Marker({
        position: { lat: event.latitude, lng: event.longitude },
        map,
        title: `Sports Event ${index + 1}`,
        icon: {
          url: 'http://maps.gstatic.com/mapfiles/ms2/micons/motorcycling.png', // Google's sports icon
          scaledSize: new window.google.maps.Size(30, 30),
        },
      });
    });
  }

  // Place marker for current user location
  new window.google.maps.Marker({
    position: { lat, lng },
    map,
    title: 'Your Location',
    icon: {
      url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', // Google's green dot icon
      scaledSize: new window.google.maps.Size(30, 30),
    },
  });
};

useEffect(() => {
  const loader = new Loader({
    apiKey: '', // Replace with your Google Maps API key
    version: 'weekly',
  });

  loader.load().then(() => {
    if (userLocation && recommendations) {
      const { latitude, longitude } = userLocation;
      initMap(latitude, longitude);
    }
  });
}, [userLocation, recommendations]);




  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000); // Update every second

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    getUserLocation()
      .then((location) => {
        setUserLocation(location);
        fetchWeatherData(location.latitude, location.longitude);
        fetchRecommendations(location.address,dateTime);
      })
      .catch((error) => {
        console.error('Error getting user location:', error);
      });
  }, []);

  

  return (
    <div>
      <p className='rfub'>User Location: </p>
      <p>{userLocation ? userLocation.address : 'Loading...'}</p>
      <p className='rfub'>Current Date and Time: </p>
      <p>{recommendations.currentDateAndTime}</p>

      {weatherData && weatherData.current && (
        <div>
          <h3 className='rfub'>Current Weather :-</h3>
          <p className='rfub'>Temperature: </p>
          <p>{weatherData.current.temp}°C</p>
          <p className='rfub'>Description: </p>
          <p>{weatherData.current.weather[0].description}</p>
        </div>
      )}

      <h3>Recommendations</h3>
      <ul>
        {/* Restaurants */}
        <p className='rfub'>Restaurants:</p>
        {recommendations.restaurants && recommendations.restaurants.map((restaurant, index) => (
          <li key={`restaurant-${index}`}>
            <strong>Restaurant:</strong> {restaurant.name}<br/>
            <strong>Hours of Operation:</strong> {Object.entries(restaurant.hoursOfOperation).map(([day, hours]) => `${day}: ${hours}`).join(', ')}<br/>
            <strong>Address:</strong> {restaurant.address}
          </li>
        ))}

        {/* Sports Events */}
        <br/>
        <p className='rfub'>Sport Events:</p>
        {recommendations.sportsEvents && recommendations.sportsEvents.map((event, index) => (
          <li key={`sports-${index}`}>
            <strong>Sports Event:</strong> {event.name}<br/>
            <strong>Date:</strong> {event.date}<br/>
            <strong>Time:</strong> {event.time}<br/>
            <strong>Address:</strong> {event.address}
          </li>
        ))}

        {/* Musical Events */}
        <br/>
        <p className='rfub'>Music Events:</p>
        {recommendations.musicalEvents && recommendations.musicalEvents.map((event, index) => (
          <li key={`musical-${index}`}>
            <strong>Musical Event:</strong> {event.name}<br/>
            <strong>Date:</strong> {event.date}<br/>
            <strong>Time:</strong> {event.time}<br/>
            <strong>Address:</strong> {event.address}
          </li>
        ))}
      </ul>

      {!weatherData && <p>Loading weather data...</p>}
      {!recommendations.restaurants && !recommendations.sportsEvents && !recommendations.musicalEvents && <p>Loading recommendations...</p>}

    <h3>Map:</h3>
    <div
      ref={mapRef}
      style={{ height: '400px', width: '100%', marginBottom: '20px' }}
    ></div>

    </div>
  );
}

export default RFU;
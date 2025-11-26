import { Router } from "express";
import axios from "axios";

const router = Router();
const OPEN_WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

type AxiosLikeError = {
  isAxiosError?: boolean;
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
};

const isAxiosError = (error: unknown): error is AxiosLikeError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    Boolean((error as { isAxiosError?: boolean }).isAxiosError)
  );
};

type SupportedUnits = "standard" | "metric" | "imperial";

interface WeatherQuery {
  city?: string;
  lat?: string;
  lon?: string;
  units?: SupportedUnits;
  lang?: string;
}

interface OpenWeatherResponse {
  name: string;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  dt: number;
  timezone: number;
  coord: {
    lon: number;
    lat: number;
  };
}

router.get("/", async (req, res) => {
  const {
    city,
    lat,
    lon,
    units = "metric",
    lang = "en",
  } = req.query as WeatherQuery;
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    return res
      .status(500)
      .json({ message: "OpenWeather API key is not configured." });
  }

  if (!city && !(lat && lon)) {
    return res.status(400).json({
      message: "Provide either ?city=CityName or both ?lat=...&lon=....",
    });
  }

  const params: Record<string, string> = {
    appid: apiKey,
    units,
    lang,
  };

  if (city) {
    params.q = city;
  } else if (lat && lon) {
    params.lat = lat;
    params.lon = lon;
  }

  try {
    const { data } = await axios.get<OpenWeatherResponse>(
      OPEN_WEATHER_BASE_URL,
      { params }
    );

    const response = {
      location: {
        name: data.name,
        country: data.sys.country,
        coordinates: data.coord,
        timezoneOffset: data.timezone,
      },
      weather: data.weather,
      temperature: data.main,
      wind: data.wind,
      timestamp: data.dt,
      units,
      lang,
    };

    return res.json(response);
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const message =
        error.response?.data?.message ??
        error.response?.data?.error ??
        "Failed to fetch weather data from OpenWeather.";
      return res.status(status).json({ message });
    }

    console.error("Unexpected error while fetching weather data", error);
    return res
      .status(500)
      .json({ message: "Unexpected error while fetching weather data." });
  }
});

export default router;

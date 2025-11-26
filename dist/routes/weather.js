"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
const OPEN_WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const isAxiosError = (error) => {
    return (typeof error === "object" &&
        error !== null &&
        "isAxiosError" in error &&
        Boolean(error.isAxiosError));
};
router.get("/", async (req, res) => {
    const { city, lat, lon, units = "metric", lang = "en", } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY ?? "b14d97fef21832411597a8b566d936be";
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
    const params = {
        appid: apiKey,
        units,
        lang,
    };
    if (city) {
        params.q = city;
    }
    else if (lat && lon) {
        params.lat = lat;
        params.lon = lon;
    }
    try {
        const { data } = await axios_1.default.get(OPEN_WEATHER_BASE_URL, { params });
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
    }
    catch (error) {
        if (isAxiosError(error)) {
            const status = error.response?.status ?? 500;
            const message = error.response?.data?.message ??
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
exports.default = router;

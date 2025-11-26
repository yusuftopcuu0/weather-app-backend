"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const weather_1 = __importDefault(require("./routes/weather"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use("/api/weather", weather_1.default);
app.use((err, _req, res, _next) => {
    console.error("Unexpected error:", err);
    res.status(500).json({ message: "Internal server error" });
});
app.listen(PORT, () => {
    console.log(`Weather proxy listening on port ${PORT}`);
});

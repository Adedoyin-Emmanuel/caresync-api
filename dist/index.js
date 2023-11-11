"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const morgan_1 = __importDefault(require("morgan"));
const middlewares_1 = require("./middlewares/");
const routes_1 = require("./routes");
const utils_1 = require("./utils");
const http_1 = __importDefault(require("http"));
const socket_server_1 = require("./sockets/socket.server");
dotenv_1.default.config();
const PORT = process.env.PORT || 2800;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
(0, socket_server_1.initSocket)(server);
//middlewares
const allowedOriginPatterns = [
    /https:\/\/getcaresync\.vercel\.app$/,
    /https:\/\/caresync\.brimble\.app$/,
    /http:\/\/localhost:3000$/,
];
const corsOptions = {
    origin: (origin, callback) => {
        // Check if the origin matches any of the patterns
        if (!origin ||
            allowedOriginPatterns.some((pattern) => pattern.test(origin))) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json({ limit: "100mb" }));
app.use((0, morgan_1.default)("dev"));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(middlewares_1.useRateLimiter);
//endpoints
app.use("/api/auth", routes_1.authRouter);
app.use("/api/user", routes_1.userRouter);
app.use("/api/hospital", routes_1.hospitalRouter);
app.use("/api/appointment", routes_1.appointmentRouter);
app.use("/api/review", routes_1.reviewRouter);
app.use("/api/room", routes_1.roomRouter);
app.use(middlewares_1.useNotFound);
app.use(middlewares_1.useErrorHandler);
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    (0, utils_1.connectToDb)();
});

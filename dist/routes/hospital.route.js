"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const middlewares_1 = require("../middlewares");
const hospitalRouter = express_1.default.Router();
hospitalRouter.post("/", [middlewares_1.useCreateUserLimiter], controllers_1.HospitalController.createHospital);
hospitalRouter.get("/me", [middlewares_1.useAuth], controllers_1.HospitalController.getMe);
hospitalRouter.get("/search", controllers_1.HospitalController.searchHospital);
hospitalRouter.get("/online", controllers_1.HospitalController.getOnlineHospitals);
hospitalRouter.get("/", [middlewares_1.useAuth], controllers_1.HospitalController.getAllHospitals);
hospitalRouter.get("/:id", [middlewares_1.useAuth], controllers_1.HospitalController.getHospitalById);
hospitalRouter.get("/rating/:id", controllers_1.HospitalController.getHospitalAverageRating);
hospitalRouter.put("/:id", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("hospital")], controllers_1.HospitalController.updateHospital);
hospitalRouter.delete("/:id", [middlewares_1.useAuth, (0, middlewares_1.useCheckRole)("hospital")], controllers_1.HospitalController.deleteHospital);
exports.default = hospitalRouter;

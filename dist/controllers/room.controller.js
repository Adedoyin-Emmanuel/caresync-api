"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const utils_1 = require("./../utils");
class RoomController {
    static getRoomToken(req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const requestSchema = joi_1.default.object({
                userId: joi_1.default.string().required(),
                hospitalId: joi_1.default.string().required(),
            });
            const { error, value } = requestSchema.validate(req.query);
            if (error)
                return (0, utils_1.response)(res, 400, error.details[0].message);
            const { userId, hospitalId } = value;
            const roomId = `${userId}_${hospitalId}`;
            //check if user or hospital is authorized
            if (userId === ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id.toString()) ||
                hospitalId === ((_b = req === null || req === void 0 ? void 0 : req.hospital) === null || _b === void 0 ? void 0 : _b._id.toString())) {
                return (0, utils_1.response)(res, 200, "Room token generated successfully", {
                    roomId,
                });
            }
            else {
            }
            return (0, utils_1.response)(res, 401, "You're not authorized!");
        });
    }
}
exports.default = RoomController;

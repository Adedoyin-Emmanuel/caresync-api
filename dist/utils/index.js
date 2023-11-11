"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJavaScriptDate = exports.sendEmail = exports.response = exports.parseUserEmailData = exports.parseHospitalEmailData = exports.generateLongToken = exports.formatDateTime = exports.connectToDb = void 0;
const connectToDb_1 = __importDefault(require("./connectToDb"));
exports.connectToDb = connectToDb_1.default;
const date_1 = require("./date");
Object.defineProperty(exports, "formatDateTime", { enumerable: true, get: function () { return date_1.formatDateTime; } });
Object.defineProperty(exports, "toJavaScriptDate", { enumerable: true, get: function () { return date_1.toJavaScriptDate; } });
const response_1 = __importDefault(require("./response"));
exports.response = response_1.default;
const sendEmail_1 = __importStar(require("./sendEmail"));
exports.sendEmail = sendEmail_1.default;
Object.defineProperty(exports, "parseHospitalEmailData", { enumerable: true, get: function () { return sendEmail_1.parseHospitalEmailData; } });
Object.defineProperty(exports, "parseUserEmailData", { enumerable: true, get: function () { return sendEmail_1.parseUserEmailData; } });
const utils_1 = require("./utils");
Object.defineProperty(exports, "generateLongToken", { enumerable: true, get: function () { return utils_1.generateLongToken; } });

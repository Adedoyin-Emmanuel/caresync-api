"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLongToken = void 0;
const uuid_1 = require("uuid");
const generateLongToken = () => {
    const uuid = (0, uuid_1.v4)();
    // more randomness to make the token longer
    const extraRandomData = Math.random().toString(36).substring(2);
    const longToken = uuid + extraRandomData;
    return longToken;
};
exports.generateLongToken = generateLongToken;

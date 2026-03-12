"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var AuthController_js_1 = require("../controllers/AuthController.js"); // Adicione .js aqui
var router = (0, express_1.Router)();
router.post('/login', AuthController_js_1.login);
exports.default = router;

'use strict';

var express = require('express');
var controller = require('./contact.controller');
var auth = require('../../auth/auth.service');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();
var path = require('path');

var router = express.Router();
router.use(multiparty({ uploadDir: path.dirname('./uploads') + '/uploads' }));

router.get('/:sortby', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.get('/search/:searchValue', auth.isAuthenticated(), controller.search);

router.post('/sms', auth.isAuthenticated(), controller.sendSMS);
router.get('/', auth.isAuthenticated(), multipartyMiddleware, controller.excelDownload);
router.post('/upload/contact', auth.isAuthenticated(), multipartyMiddleware, controller.excelupload);
router.get('/get/customize/header', auth.isAuthenticated(), controller.customizeHeader);

module.exports = router;
var express = require('express');
var router = express.Router();


var logService = require('../services/log.service');

router.post('/', logService.createLog)
router.get('/', logService.list)

module.exports = router;
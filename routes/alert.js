var express = require('express');
var router = express.Router();

var alertService = require('../services/alert.service');

router.post('/', alertService.createAlert);
router.put('/', alertService.modifyAlert);
router.delete('/:id', alertService.deleteAlert);
router.get('/', alertService.listAlerts);

module.exports = router;
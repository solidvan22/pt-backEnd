var express = require('express');
var router = express.Router();


var eventService = require('../services/event.service');

router.post('/', eventService.createEvent);
router.get('/', eventService.listEvents);
router.get('/search', eventService.searchEvents);

module.exports = router;
var express = require('express');
var router = express.Router();

var plantService = require('../services/plant.service');

router.get('/', plantService.listPlants);
router.post('/', plantService.createPlant);
router.put('/', plantService.modifyPlant);
router.delete('/:id', plantService.deletePlant);


module.exports = router;
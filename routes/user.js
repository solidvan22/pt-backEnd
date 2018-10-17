var express = require('express');
var router = express.Router();

var userService = require('../services/user.service');

router.post('/', userService.createUser);
router.delete('/:id', userService.deleteUser);
router.put('/', userService.modifyUser);
router.post('/session', userService.authenticateUser);
router.get('/', userService.listUsers);

module.exports = router;
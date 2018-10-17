var SqlString = require('sqlstring');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var db = require('../db/dbT');

const saltRounds = 10;

exports.createUser = function (req, res) {
	let password = req.body.password;
	bcrypt.hash(password, saltRounds, function(err, hash) {
		if(err){
			res.send({
				'code': 500,
				'failed':'Error hashing password'
			});
		}
		let plantID = req.body.plant;
		let queryPlantID = SqlString.format('SELECT PlantID FROM Plants WHERE PlantID = ?', plantID);
		db.executeQuery(queryPlantID).then(resPlant => {
			if(resPlant.length > 0){
				let user = [
					req.body.name,
					req.body.lastname,
					req.body.role,
					req.body.username,
					hash,
					plantID
				];
				let queryInsertUser = SqlString.format('INSERT Users (Name, LastName, Role, Username, Password, PlantID) VALUES (?, ?, ?, ?, ?, ?)', user);
				db.executeQuery(queryInsertUser).then(resUser => {
					res.send({
						'code':200,
						'success':'User saved sucessfully'
					});
				});
			} else {
				res.send({
					'code': 500,
					'failed':'Plant not found'
				});
			}
		});
	});
};

exports.authenticateUser = function (req, res) {
	let app = req.app;
	let username = req.body.username;
	let password = req.body.password;
	let getUserQuery = SqlString.format('SELECT * FROM Users WHERE Username = ?', username);
	db.executeQuery(getUserQuery).then(resUsername => {
		if(resUsername.length > 0){
			let hash = resUsername[0].Password;
			bcrypt.compare(password, hash, function(err, correctPass) {
				if(correctPass){
					const payload = {
						username: username
					};
					var token = jwt.sign(payload, app.get('secretToken'), {
						expiresIn: '24h' // expires in 24 hours
					});
					res.send({
						'code': 200,
						'success': 'Login successful',
						'token': token
					});
				} else {
					res.send({
						'code': 204,
						'success':'Email and password does not match'
					});
				}
			});
		} else {
			res.send({
				'code': 204,
				'success':'Email and password does not match'
			});
		}
	});
}

exports.modifyUser = function (req, res){
	let modifiedFields = req.body.modified;
	let userID = req.body.userID;
	let checkUserQuery = SqlString.format('SELECT * FROM Users WHERE UserID = ? AND Deleted = 0', userID);
	db.executeQuery(checkUserQuery).then(result => {
		if(result.length > 0){
			let modifyUserQuery = SqlString.format('UPDATE Users SET ? WHERE UserID = ?', [modifiedFields, userID]);
			let strQuery = modifyUserQuery.toString();
			strQuery = strQuery.split('`').join('');
			db.executeQuery(strQuery).then(result => {
				res.send({
					'code':200,
					'success':'User modified sucessfully'
				});
			});
		} else {
			res.send({
				'code': 404,
				'failed':'User not found'
			});
		}
	});
}

exports.deleteUser = function (req, res) {
	let userID = req.params.id;
	let deleteUserQuery = SqlString.format('UPDATE Users SET Deleted = 1 WHERE UserID = ?', userID);
	db.executeQuery(deleteUserQuery).then(result => {
		res.send({
			'code':200,
			'success':'User deleted sucessfully'
		});
	});
}

exports.listUsers = function (req, res) {
	let query =  SqlString.format('SELECT * FROM Users WHERE Deleted = 0');
	db.executeQuery(query).then(result => {
		res.send(result);
	});
}

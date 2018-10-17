var SqlString = require('sqlstring');
var db = require('../db/dbT');

exports.createPlant = function (req, res) {
	let plant = [req.body.name, req.body.description];
	let createPlantQuery = SqlString.format('INSERT Plants (Name, Description) VALUES(?, ?)', plant);
	console.log(createPlantQuery)
	db.executeQuery(createPlantQuery).then(result => {
		res.send({
			'code':200,
			'success':'Plant saved sucessfully'
		});
	});
}

exports.modifyPlant = function (req, res) {
	let modifiedFields = req.body.modified;
	let plantID = req.body.plantID;
	let checkPlantQuery = SqlString.format('SELECT * FROM Plants WHERE PlantID = ? AND Deleted = 0', plantID);
	db.executeQuery(checkPlantQuery).then(result => {
		if(result.length > 0){
			let modifyPlantQuery = SqlString.format('UPDATE Plants SET ? WHERE PlantID = ?', [modifiedFields, plantID]);
			let strQuery = modifyPlantQuery.toString();
			strQuery = strQuery.split('`').join('');
			db.executeQuery(strQuery).then(result => {
				res.send({
					'code':200,
					'success':'Plant modified sucessfully'
				});
			});
		} else {
			res.send({
				'code': 404,
				'failed':'Plant not found'
			});
		}
	});
}

exports.deletePlant = function (req, res) {
	let plantID = req.params.id;
	let deletePlantQuery = SqlString.format('UPDATE Plants SET Deleted = 1 WHERE PlantID = ?', plantID);
	db.executeQuery(deletePlantQuery).then(result => {
		res.send({
			'code':200,
			'success':'Plant deleted sucessfully'
		});
	});
}

exports.listPlants = function (req, res) {
	let query =  SqlString.format('SELECT * FROM Plants WHERE Deleted = 0');
	db.executeQuery(query).then(result => {
		res.send(result);
	});
}

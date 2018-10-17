var SqlString = require('sqlstring');
const uuidv1 = require('uuid/v1');
var db = require('../db/db');

exports.createAlert = function (req, res) {
    let alertUuid = uuidv1().toUpperCase();
    let alert = [alertUuid, req.body.alertName, req.body.channel, req.body.plant];
    let users = req.body.users;
    let conditions = req.body.conditions;
    for(let condition of conditions){
        condition.splice(0, 0, alertUuid);
    }
    for(let user of users){
        user.splice(0, 0, alertUuid);
    }
    let createAlertQuery = SqlString.format('INSERT Alerts (AlertID, AlertName, NotificationChannel, PlantID) VALUES(?, ?, ?, ?)', alert);
    let createConditionsQuery = 'INSERT INTO Conditions (AlertID, Field, Operator, Value) VALUES ' + SqlString.escape(conditions);
    let createAlertUserQuery = 'INSERT INTO AlertsUsers (AlertID, UserID) VALUES ' + SqlString.escape(users);
	db.executeQuery(createAlertQuery).then(result => {
        db.executeQuery(createConditionsQuery).then(result => {
            db.executeQuery(createAlertUserQuery).then(result => {
                res.send({
                    'code':200,
                    'success':'Alert saved sucessfully'
                });
            });
        })
    });
}

exports.modifyAlert = function (req, res) {
    let modifiedFields = req.body.modified;
    let modified = {'AlertName': modifiedFields.alertName, 'NotificationChannel': modifiedFields.channel, 'PlantID': modifiedFields.plant};
    let modifiedConditions = modifiedFields.conditions;
    let modifiedUsers = modifiedFields.users;
    let alertID = req.body.alertID;
    for(let condition of modifiedConditions){
        condition.splice(0, 0, alertID);
    }
    for(let user of modifiedUsers){
        user.splice(0, 0, alertID);
    }
    let checkAlertQuery = SqlString.format('SELECT * FROM Alerts WHERE AlertID = ? AND Deleted = 0', alertID);
    let modifyAlertQuery = SqlString.format('UPDATE Alerts SET ? WHERE AlertID = ?', [modified, alertID]);
    let strQuery = modifyAlertQuery.toString();
	strQuery = strQuery.split('`').join('');
    let deleteAlertsUsersQuery = SqlString.format('DELETE FROM AlertsUsers WHERE AlertID = ?', alertID);
    let createAlertUserQuery = 'INSERT INTO AlertsUsers (AlertID, UserID) VALUES ' + SqlString.escape(modifiedUsers);
    let deleteConditionsQuery = SqlString.format('DELETE FROM Conditions WHERE AlertID = ?', alertID);
    let createConditionsQuery = 'INSERT INTO Conditions (AlertID, Field, Operator, Value) VALUES ' + SqlString.escape(modifiedConditions);
	db.executeQuery(checkAlertQuery).then(result => {
		if(result.length > 0){
            db.executeQuery(strQuery).then(result => {
                db.executeQuery(deleteAlertsUsersQuery).then(resUsers => {
                    db.executeQuery(createAlertUserQuery).then(result => {
                        db.executeQuery(deleteConditionsQuery).then(result => {
                            db.executeQuery(createConditionsQuery).then(result => {
                                res.send({
                                    'code':200,
                                    'success':'Alert updated sucessfully'
                                });
                            });
                        });
                    });
                });
            });
		} else {
			res.send({
				'code': 404,
				'failed':'Alert not found'
			});
		}
	});
}

exports.deleteAlert = function (req, res) {
	let alertID = req.params.id;
	let deleteAlertQuery = SqlString.format('UPDATE Alerts SET Deleted = 1 WHERE AlertID = ?', alertID);
	db.executeQuery(deleteAlertQuery).then(result => {
		res.send({
			'code':200,
			'success':'Alert deleted sucessfully'
		});
	});
}

exports.listAlerts = function (req, res) {
    let query = SqlString.format(`select a.AlertID, a.AlertName, a.NotificationChannel, a.PlantID, stuff((
        select ',{ "Username": "' + u.username + '", "Name": "' + u.Name + '", "Lastname": "'+ u.lastname +'", "Role": "'+ u.role +'", "Password": "'+ u.password +'", "Deleted": "'+ convert(varchar(255), u.Deleted) +'", "PlantID": "'+ convert(varchar(255), u.PlantID) +'" , "UserID": "'+ convert(varchar(255), u.UserID) + '"}'
        from AlertsUsers au
        join users u on u.userID = au.userID
        where au.AlertID = a.AlertID
        for XML Path ('')
        ), 1,1,'') as alertUser, 
        stuff((
        select ',{ "conditionID": "' + convert(varchar(255),c.ConditionID) + '", "field": "' + c.Field + '", "operator": "' + c.Operator + '", "value": "' + c.Value + '"}'
        from Conditions c
        where c.AlertID = a.AlertID
        for XML Path ('')
        ), 1,1,'') as alertCondition
        from alerts a where a.deleted = 0`);
    db.executeQuery(query).then(result => {
        for(let alert of result){
            if(alert.alertUser){
                alert.alertUser = JSON.parse('[' + alert.alertUser + ']');
            }
            if(alert.alertCondition){
                alert.alertCondition = JSON.parse('[' + alert.alertCondition + ']');
            }
        }
        res.send(result);
    });
}

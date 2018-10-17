// var db = require('../db/db');
var db = require('../db/dbT');
var SqlString = require('sqlstring');
var url = require('url');

exports.createLog = function(req,res) {
   
    console.log(req.body) 
    var aITime = new Date(req.body.aITime)
    aITime     = aITime.toJSON()

    var caudalTime = new Date(req.body.caudalTime)
    caudalTime     = caudalTime.toJSON()

    console.log(caudalTime)

    newLog = {
        aITime      :aITime,
        cameraId    :req.body.cameraId,
        data        :req.body.data
    }

    console.log("NEW LOG")
    console.log(newLog)
    
    let queryInsert= `insert into PT_Log (AITime,CameraID,Data)
    VALUES('${newLog.aITime}','${newLog.cameraId}','${newLog.data}')
    `
    db.executeQuery(queryInsert).then(result => {
        res.send({
            success:true
        })        
        io.of('/').emit('message', newLog);
        
    }).catch(errorObject => {
        
        console.log(errorObject)
        res.send({
            success:false,
            data:errorObject
        })
    });  
}
exports.list = function(req,res) {

    let getEventsQuery = `SELECT TOP 100 * from PT_Log`
    queryString = req.query
    console.log("query string: ")
    console.log(queryString)

    db.executeQuery(getEventsQuery).then(rows => {
       res.send(rows);
    }).catch(errorObject => {
        
        res.send({
            success:false,
            data:errorObject
        })
    });
   
}
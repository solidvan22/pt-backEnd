// var db = require('../db/db');
var db = require('../db/dbT');
var SqlString = require('sqlstring');
var url = require('url');

exports.createEvent = function(req,res) {
   
    console.log(req.body) 
    var aITime = new Date(req.body.aITime)
    aITime     = aITime.toJSON()

    var caudalTime = new Date(req.body.caudalTime)
    caudalTime     = caudalTime.toJSON()

    console.log(caudalTime)

    newEvent = {
        aITime      :aITime,
        caudalTime  :caudalTime,
        sapFolio    :req.body.sapOrder,
        eventName   :req.body.eventName,
        plate       :req.body.plate,
        cameraId    :req.body.cameraId,
        uuid        :req.body.uuid,
    }

    console.log("NEW EVENT")
    console.log(newEvent)
    
    let queryInsertEvent= `INSERT into Events
    (
        TrackVisitID,
        creationDate,
        AITime,
        CaudalTime,
        SapFolio,
        EventName,
        Plate,
        IsBox,
        CameraFile,
        Pallets,
        CameraID,
        UUID,
        Shift
    )
    VALUES
    (
        'C4399178-8323-4DA4-9D63-9DCC69EA1BF7',
        getDate(),
        '${newEvent.aITime}',
        '${newEvent.caudalTime}',
        '${newEvent.sapFolio}',
        '${newEvent.eventName}',
        '${newEvent.plate}',
        1,
        '0000:0000',
         0,
        '${newEvent.cameraId}',
        '${newEvent.uuid}',
        1
    )
    `
 
    db.executeQuery(queryInsertEvent).then(result => {

        res.send({
            success:true
        })        
        io.of('/').emit('message', newEvent);
        
    }).catch(errorObject => {
        
        console.log(errorObject)
        res.send({
            success:false,
            data:errorObject
        })
    });  
}
exports.listEvents = function(req,res) {

    let getEventsQuery = `SELECT TOP 100 Events.*, Places.PlaceName FROM Events LEFT JOIN Cameras ON Events.CameraID = Cameras.CameraID LEFT JOIN Places ON Cameras.PlaceID = Places.PlaceID ORDER BY CreationDate DESC `
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
exports.searchEvents = function(req,res) {
    var parts = url.parse(req.url, true);
    var query = parts.query;
    let fields = '';
    if(query.name){
        fields += SqlString.format('Events.EventName LIKE ? AND ', '%' + query.name + '%');
    }
    if(query.sapFolio){
        fields += SqlString.format('Events.SapFolio LIKE ? AND ', '%' + query.sapFolio + '%');
    }
    if(query.plate){
        fields += SqlString.format('Events.Plate LIKE ? AND ', '%' + query.plate + '%');
    }
    if(query.shift){
        fields += SqlString.format('Events.Shift LIKE ? AND ', '%' + query.shift + '%');
    }
    if(query.startDate && query.endDate){
        fields += SqlString.format('(Events.AITime BETWEEN ? AND ? ) AND', [query.startDate, query.endDate]);
    } else if(query.startDate){
        fields += SqlString.format('Events.AITime > ? AND', query.startDate);
    } else if(query.endDate){
        fields += fields += SqlString.format('Events.AITime < ? AND', query.endDate);
    }
    if(fields.length > 0){
        fields = fields.substring(0, fields.length - 4);
    }
    let searchQuery = `SELECT Events.*, Places.PlaceName FROM Events 
    LEFT JOIN Cameras ON Events.CameraID = Cameras.CameraID
    LEFT JOIN Places ON Cameras.PlaceID = Places.PlaceID
    WHERE ` + fields;

    db.executeQuery(searchQuery).then(rows => {
        res.send(rows);
    }).catch(errorObject => {
        res.send({
            success:false,
            data:errorObject
        })
    });
}

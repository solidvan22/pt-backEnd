var Connection = require('tedious').Connection,
	Request = require('tedious').Request,
	TYPES = require('tedious').TYPES;


executeQuery = function(qs,callback){

    return new Promise(function(resolve,reject){

        // connecting ..
        var connection = new Connection({
            userName: 'sa',
            password: 'Qu@ntum1',
            server: '70.37.62.139', 
            options:{
                database: 'PT'
            },
            rowCollectionOnDone: true,

        });
        connection.on('databaseChange',function(databaseName){
            console.log("database name : " + databaseName)
        });
        connection.on('connect', function(err){
        
            if (err){
                console.log(err)
            }
            else{
                console.log("CONNECTION SUCCESSFULLssss")
                var request = new Request(qs, function(err, rowCount,rows) {
                    if (err) {
                        console.log("OCURRIO ERROR NO SUCCESS ")
                        console.log(err);
                        reject(err)
                    } else {
                        console.log(" ++ END SUCCESS WITH " + rowCount + ' rows returned');
                        resolve(rowsResult)

                    }
                    connection.close();
                    
                });
                var i =0    
                var rowsResult=[]
                request.on('row', function(columns) {
                
                    var row={}
                    columns.forEach(function(column) {
                    if (column.value === null) {
                            //nothing
                    } else {
            
                        row[column.metadata.colName]= column.value
                    }
                    });
                    rowsResult.push(row)
                    i++
                });
                connection.execSql(request);
            }
                
        });

    })

  
}

module.exports.executeQuery = executeQuery; 

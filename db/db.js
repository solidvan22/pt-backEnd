var sql = require('mssql');

// config for your database
var dbConfig = {
  user: 'sa',
  password: 'Qu@ntum1',
  server: '70.37.62.139', 
  database: 'master',
  options: {
    encrypt: true
  }
};

// connect to your database
var executeQuery = function(query, parameters){
  sql.close();
  return new Promise((resolve, reject) => {
    sql.connect(dbConfig, function (err) {
      if (err) {
        console.log('Error while connecting database :- ' + err);
        sql.close();
        reject(err);
      }
      else {
        // create Request object
        var request = new sql.Request();
        // query to the database
        request.query(query, function (err, result) {
          if (err) {
            console.log('Error while querying database :- ' + err);
            sql.close();
            reject(err);
          }
          else {
            
            sql.close();
            resolve(result.recordset);
            console.log('Succesfull');
          }
        });
      }
    });
  });
}

module.exports.executeQuery = executeQuery;
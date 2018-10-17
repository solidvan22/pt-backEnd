
insertEvent= function(data){
	$.ajax({
        type: "POST",
        url: "http://localhost:8080/events",
        // The key needs to match your method's input parameter (case-sensitive).
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data){console.log(data);},
        failure: function(errMsg) {
            alert(errMsg);
        }
	});
}

testInsertsDb=function(numRowsToInsert,callBack ){
    for(i = 1; i<=numRowsToInsert;i++){

        var data = {
            "aITime":1535682897583,
            "caudalTime": 1535682897586,
            "eventName" :"OnBoxExit",
            "plate" : "TEST-" +i  ,
            "cameraId" :"F0531F7F-019C-4C80-A1C5-423318093F78"
        }
        console.log(data)
        insertEvent(data)
    
    }
    callBack(a="mazapan")
} 


// example of usage:
testInsertsDb(100)



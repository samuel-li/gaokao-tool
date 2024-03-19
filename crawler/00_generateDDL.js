const fs = require('fs');

let schemaFiles = ['enrollPlan', 'majorScoreOfSchool','minScoreOfSchool','schoolData','majorInfo'];

function nullvalue(value) {
    return (value === '' ? "''" : value); 
}

try {
    schemaFiles.forEach((fname, idx) => {
        fs.readFile("schemas/"+fname+".json", (err, data)=>{
            if (err) throw err;
            let hasPriKey = false;
            let dataSchemaObj = JSON.parse(data);
            let priKey = dataSchemaObj.pk;
            console.log("CREATE TABLE " + fname + "(");
            if (priKey == "auto_increment") {
                console.log("    id int(11) NOT NULL AUTO_INCREMENT,")
                priKey = "id";
            }
            Object.keys(dataSchemaObj.schema).forEach((field, idx)=>{
                console.log("   `" + field + "` " + dataSchemaObj.schema[field]['type'] + " DEFAULT " + nullvalue(dataSchemaObj.schema[field]['default']) + " comment '" + dataSchemaObj.schema[field]['comment'] + "',");
            });
            console.log("   PRIMARY KEY `pkid` (`"+priKey+"`)");
            console.log(");\n")
        });
    });
} catch (err) {
    console.log(err);
}

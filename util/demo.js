
// Person Route
app.get('/person/:id', function(req, res){
    var id = req.params.id;
    
    session
        .run("MATCH(a:Person) WHERE id(a)=toInt({idParam}) RETURN a.name as name", {idParam:id})
        .then(function(result){
            var name = result.records[0].get("name");
            
            session
                .run("OPTIONAL MATCH (a:Person)-[r:BORN_IN]-(b:Location) WHERE id(a)=toInt({idParam}) RETURN b.city as city, b.state as state", {idParam:id})
                .then(function(result2){
                    var city = result2.records[0].get("city");
                    var state = result2.records[0].get("state");
                    
                    session
                        .run("OPTIONAL MATCH (a:Person)-[r:FRIENDS]-(b:Person) WHERE id(a)=toInt({idParam}) RETURN b", {idParam:id})
                        .then(function(result3){
                            var friendsArr = [];
                            
                            result3.records.forEach(function(record){
                                if(record._fields[0] != null){
                                    friendsArr.push({
                                        id: record._fields[0].identity.low,
                                        name: record._fields[0].properties.name
                                    });
                                }
                            });
                            
                            res.render('person',{
                                id:id,
                                name:name,
                                city:city,
                                state: state,
                                friends:friendsArr
                            });
                            
                            session.close();
                        })
                        .catch(function(error){
                            console.log(error);
                        });
                });
        });
});

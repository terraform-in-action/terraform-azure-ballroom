var azure = require('azure-storage');
var entGen = azure.TableUtilities.entityGenerator;
var tableService = azure.createTableService(process.env.TABLES_CONNECTION_STRING);
const tableName = "tweets"
const uuidv4 = require('uuid/v4')

// using table storage as a kind of "serverless" NoSQL database
module.exports = function (context, req) {
    if (req.params.action === "tweet") {
        handleTweet(context)
    } else {
        context.res = {
            status: 404
        }
    }
};

async function handleTweet(context) {
    tableService.createTableIfNotExists(tableName, function (error, result, response) {
        if (!error) {
            switch (context.req.method) {
                case "POST":
                    createTweet(context)
                    break
                case "GET":
                    readTweet(context)
                    break
                case "PATCH":
                    updateTweet(context)
                    break
                case "DELETE":
                    deleteTweet(context)
                    break
            }
        }
    });
}

function createTweet(context) {
    let message = context.req.body.message
    let name = context.req.body.name
    let entity = {
        PartitionKey: entGen.String(name),
        RowKey: entGen.String(uuidv4()),
        message: entGen.String(message),
    };
    tableService.insertEntity(tableName, entity, function (error, result, response) {
        if (!error) {
            context.res = {
                status: 201
            }
        } else {
            context.log(error)
            context.res = {
                status: 400
            }
        }
        context.done()
    });
}

function transformTweet(record) {
    return {
        uuid: record.RowKey._,
        name: record.PartitionKey._,
        message: record.message._,
        timestamp: record.Timestamp._
    }
}

function readTweet(context) {
    let uuid = context.req.params.id
    let list = uuid === undefined
    if (list) {
        tableService.queryEntities(tableName, null, null, function (error, result) {
            if (!error) {
                let tweets = result.entries.map(function(e){return transformTweet(e)})
                context.res = {
                    headers: {"Content-Type":"text/json"},
                    status: 200,
                    body: JSON.stringify(tweets)
                }
            } else {
                context.res = {
                    status: 500
                }
            }
            context.done()
            return
        })
    } else{
        let name = context.req.query.name
        tableService.retrieveEntity(tableName, name, uuid, function (error, result, response) {
            if (!error) {
                let tweet = transformTweet(result)
                context.res = {
                    headers: {"Content-Type":"text/json"},
                    status: 200,
                    body: JSON.stringify(tweet)
                }
            } else {
                context.res = {
                    status: 404
                }
            }
            context.done()
        });
    }

}

function updateTweet(context) {
    let uuid = context.req.params.id
    let entity = {
        PartitionKey: entGen.String(context.req.body.name),
        RowKey: entGen.String(context.req.body.uuid),
        message: entGen.String(context.req.body.message)
    };
    tableService.insertOrReplaceEntity(tableName, entity, function (error, result, response) {
        if (!error) {
            context.res = {
                status: 202
            }
        } else {
            context.res = {
                status: 400
            }
        }
        context.done()
    });
}

function deleteTweet(context) {
    let uuid = context.req.params.id
    let name = context.req.query.name
    var entity = {
        PartitionKey: entGen.String(name),
        RowKey: entGen.String(uuid),
    };
    tableService.deleteEntity(tableName, entity, function (error, result, response) {
        if (!error) {
            context.res = {
                status: 202
            }
        } else {
            context.res = {
                status: 404
            }
        }
        context.done()
    });
}
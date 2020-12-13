var fs = require('fs');
var path = require('path')

//A simple "serverless" function for serving static content
module.exports = async function (context, req) {
    let file = context.req.params.file ? context.req.params.file : "index.html"
    let ext = file.split(".").pop()
    if(["html","css","js"].includes(ext)){
        contentType = `text/${ext}`
        body = fs.readFileSync(path.resolve(__dirname,`./public/${file}`),{encoding:'utf-8'})
        context.res = {
            headers: {"Content-Type":contentType},
            body: body
        };
    } else {
        let bitmap = fs.readFileSync(path.resolve(__dirname,`./public/${file}`))
        let data = new Buffer(bitmap)
        contentType = `image/${ext}`
        context.res = {
            headers: {"Content-Type": contentType},
            body: new Uint8Array(data),
            isRaw: true
        }
    }
};
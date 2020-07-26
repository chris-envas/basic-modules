/*
 * @Author: your name
 * @Date: 2020-07-26 15:23:52
 * @LastEditTime: 2020-07-26 21:36:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \basic-modules\index.js
 */ 
const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')
const mime = require('mime')

http.createServer(function(request,response) {
    const urlObj = url.parse(request.url)
    const urlPathname  = urlObj.pathname
    const filename = path.join(__dirname, urlPathname)
    const ext = path.parse(urlPathname).ext
    const mimeType = mime.getType(ext) || ""
    
    if(mimeType) {
        fs.readFile(filename, (err, data) => {
            console.log("mimeType:"+mimeType)
            if(err) {
                response.writeHead(404, { "Content-Type": "text/plain" });
                response.write("404 - File is not found!")
                response.end()
            }else{
                response.writeHead(200, { "Content-Type": mimeType});
                response.end(data)
            }
        })
    }else{
        const html = fs.readFileSync("./index.html",'utf-8')
        response.end(html)
    }
    
}).listen(8080,() => {
    console.log('server id dev')
})
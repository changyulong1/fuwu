var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
    console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
    process.exit(1)
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /******** 从这里开始看，上面不要看 ************/

    console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)
    if (path === "/sign" && method === "POST") {
        const userArray = JSON.parse(fs.readFileSync("./db/user.json").toString())
        //获取请求数据
        const array = []
        request.on("data", (chunk) => {
            array.push(chunk)
        })

        request.on("end", () => {
            const string = Buffer.concat(array).toString()
            const obj = JSON.parse(string)
            const user = userArray.find(user => user.name === obj.name && user.password === obj.password)
            console.log(user)
            console.log(66)
            if (user === undefined) {
                response.statusCode = 404
                response.setHeader("Content-Type", "text/json;charset=UTF-8")
                response.end(`{"errorCode":531}`)
            } else {
                response.statusCode = 200
                //匹配账户正觉设置cookie
                response.setHeader("Set-Cookie", `userId=${user.id}`)
                response.end()
            }
        })
    } else if (path === "/home.html") {
        //获取cookie
        const cookie = request.headers['cookie']
        let userId
        try {
            //获取cookie中的userId
            userId = text = cookie.split("=")[1]
        } catch (error) { }
        const string = fs.readFileSync('./public/home.html').toString()
        const userArray = JSON.parse(fs.readFileSync("./db/user.json"))
        //判断userId是否存在
        if (userId) {
            //匹配数据中的userId，返回user账户
            const user = userArray.find(user => user.id, toString() === userId)
            //判断user
            if (user) {
                //页面中显示userName
                const string1 = string.replace("{{deng}}", "已登录").replace("{{user.name}}", user.name)
                response.write(string1)
            }
        } else {
            const string1 = string.replace("{{deng}}", "未登录").replace("{{user.name}}", "")
            response.write(string1)
        }
        response.end()

    } else if (path === "/register" && method === "POST") {
        response.setHeader("Content-Type", "text/html;charset=UTF-8")
        //获取数据库
        const userArray = JSON.parse(fs.readFileSync("./db/user.json").toString())
        //获取请求参数
        const array = []
        request.on("data", (chunk) => {
            array.push(chunk)
        })
        request.on("end", () => {
            //Buffer.concat(array)拼接数组。转换成字符串
            const string = Buffer.concat(array).toString()
            //字符串转换成对象
            const obj = JSON.parse(string)
            const name = obj.name
            const password = obj.password
            console.log(name)
            console.log(password)
            const listUser = userArray[userArray.length - 1]
            const userObj = {
                id: listUser ? listUser.id + 1 : 1,
                name: obj.name,
                password: obj.password
            }
            console.log(typeof userArray)
            userArray.push(userObj)
            //数据库添加数据
            fs.writeFileSync("./db/user.json", JSON.stringify(userArray))
            response.end("很好")
        })


    } else {
        response.statusCode = 200
        const filePath = path === "/" ? "/index.html" : path
        const index = filePath.lastIndexOf('.')
        //suffix后缀
        const suffix = filePath.substring(index)
        const fileType = {
            ".html": "text/html",
            ".css": "text/css",
            ".js": "text/javascript",
            ".png": "image/pang",
            ".jpg": "image/jpg"
        }
        response.setHeader('Content-Type', `${fileType[suffix] || "text / html"} ;charset=utf-8`)
        let content
        try {
            content = fs.readFileSync(`./public${filePath}`)

        } catch (error) {
            content = "文件不存在"
            response.statusCode = 404
        }
        response.write(content)
        response.end()

    }


    /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)
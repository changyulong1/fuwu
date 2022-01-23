//引入fs模块
const fs = require("fs")
//读取数据库
const user1 = fs.readFileSync("./db/user.json").toString()
const userArray = JSON.parse(user1)
console.log(typeof userArray)
console.log(userArray)

//改写数据库
const user = {
    id: 5,
    name: "孙悟空",
    age: 123
}
userArray.push(user)
const string = JSON.stringify(userArray)
console.log(string)
fs.writeFileSync("./db/user.json", string)

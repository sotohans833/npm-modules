const axios = require("axios")
const greet = name => "Hola " + name;
const PI = 3.1416;
const users = async () => {
    const res = await axios.get("https://jsonplaceholder.typicode.com/users?_limit=2")
    console.log(res.data);
}

module.exports = {users, greet, PI}
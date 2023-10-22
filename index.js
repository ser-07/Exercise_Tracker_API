const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))

//Adding body parser config:
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


//Data area
const userMap = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users',(req, res) => {
  //Check if the user already exists, if exists, return the same ID, else create new user and send the id
  const userName = req.body.username;
  if(userMap.has(userName)===false){
   userMap.set(userName, new Date().valueOf()); //Deriving unique ID from date
  }
  // console.log(userMap, userName, userMap.has(userName), userMap.has(userName)==undefined);
  res.json({"userName":userName,"_id":userMap.get(userName)});
})

app.get('/api/users', (req,res)=>{

  let resArr = [];
  userMap.forEach((value, key, userMap)=>{
    resArr.push({username: key, id: value })
  })

  res.json(resArr);
})

const listener = app.listen(process.env.PORT || 5000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

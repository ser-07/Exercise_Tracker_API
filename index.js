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
const exerciseMap = new Map();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  //Check if the user already exists, if exists, return the same ID, else create new user and send the id
  const userName = req.body.username;
  if (userMap.has(userName) === false) {
    userMap.set(userName, new Date().valueOf()); //Deriving unique ID from date
  }
  // console.log(userMap, userName, userMap.has(userName), userMap.has(userName)==undefined);
  res.json({ userName: userName, _id: userMap.get(userName) });
});

app.get("/api/users", (req, res) => {
  let resArr = [];
  userMap.forEach((value, key, userMap) => {
    resArr.push({ username: key, id: value });
  });

  res.json(resArr);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  //Fetch all the details from request body
  // console.log(req.params._id, req.body);
  const id = req.params._id;
  const desc = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date;
  // const [description, duration, date] = req.body;
  // console.log(desc, duration, date);

  //Get username and return usernot found if ID is not present.
  let userName = "";
  // console.log(userMap);
  userMap.forEach((value, key, userMap) => {
    if (value == id) userName = key;
  });
  // console.log("username", userName);

  if (userName === "")
    return res.json({ error: `No user exists with ID ${id}` });
  //Add the details in exerciseMap, Id will be the key of the map

  if (exerciseMap.has(id) === false) {
    exerciseMap.set(id, [
      {
        date:
          date ||
          `${new Date().getFullYear()}-${
            new Date().getMonth() + 1
          }-${new Date().getDate()}`,
        duration: duration,
        description: desc,
      },
    ]);
  } else
    exerciseMap.set(id, [
      ...exerciseMap.get(id),
      {
        date:
          date ||
          `${new Date().getFullYear()}-${
            new Date().getMonth() + 1
          }-${new Date().getDate()}`,
        duration: duration,
        description: desc,
      },
    ]);

  console.log("Exercise Map", exerciseMap);

  //Send response in the desired format
  res.json({
    _id: id,
    username: userName,
    date:
      date ||
      `${new Date().getFullYear()}-${
        new Date().getMonth() + 1
      }-${new Date().getDate()}`,
    duration: duration,
    description: desc,
  });
});


//Sample output for the below route - {"_id":"6534fe884c3ec20832ca0b45","username":"Sreejith","count":2,
//"log":[{"description":"test 2","duration":2,"date":"Sun Oct 22 2023"},{"description":"test1","duration":1,"date":"Sun Oct 22 2023"}]}

app.get('/api/users/:_id/logs', (req,res)=>{
  const id = req.params._id;

  //Fetch query params from req object
  // console.log("query", req.query); //GET /api/users/:_id/logs?[from][&to][&limit]
  const fromInput = req.query.from;
  const toInput = req.query.to;
  const limitInput = req.query.limit;
  console.log(fromInput, toInput, limitInput);

  //Get username and return usernot found if ID is not present.
  let userName = "";
  userMap.forEach((value, key, userMap) => {
    if (value == id) userName = key;
  });

  if (userName === "")
    return res.json({ error: `No user exists with ID ${id}` });

  let exerciseArr = [];
  //Getting the logs based on the query params
  if (exerciseMap.has(id) != false) {
    exerciseArr = exerciseMap.get(id);

    if (fromInput != undefined) {
      exerciseArr = exerciseArr.filter((item) => item.date >= fromInput);
    }

    if (toInput != undefined) {
      exerciseArr = exerciseArr.filter((item) => item.date <= fromInput);
    }

    if (limitInput != undefined) {
      exerciseArr = exerciseArr.slice(0, limitInput);
    }
    // .filter(
    //   (item) =>
    //     item.date >=
    //       (fromInput == undefined ? new Date("01-01-1997") : fromInput) &&
    //     item.date <= (toInput == undefined ? new Date() : toInput)
    // );
    // .slice(
    //   0,
    //   limitInput == undefined ? exerciseMap.get(id).length + 1 : limitInput
    // );
    console.log(exerciseArr);
    // exerciseArr.filter(item => item.date >= fromInput)
  }

  //  console.log(exerciseMap.has(id));
  res.json({
    _id: id,
    username: userName,
    count: exerciseMap.has(id) === false ? 0 : exerciseMap.get(id).length,
    log: exerciseArr, //exerciseMap.get(id),
  });
})

const listener = app.listen(process.env.PORT || 5000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

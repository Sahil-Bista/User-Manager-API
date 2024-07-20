const mysql = require('mysql2');
const { faker } = require('@faker-js/faker');
const express = require('express');
const app = express();
const port = 3000;
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require('uuid');


app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views", path.join(__dirname, "/views"));

// create the connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'mysql@123'
});

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};


//inserting new data
let q = "INSERT INTO user (id, username, email, password) VALUES ?";
let data=[]
for(let i=1; i <=100 ;i++){
  data.push(getRandomUser()); 
}
try{
  connection.query(q,[data],(err,result)=>{
    if(err) throw err;
    console.log(result);
  });
}catch(err){
  console.log(err);
}


app.get("/", (req,res)=>{
  let q = `SELECT count(*) from user`;
  try{
  connection.query(q,(err,result)=>{
    if(err) throw err;
    let count = result[0]["count(*)"];
    res.render("home.ejs", {count})
  });
}catch(err){
  console.log(err);
  res.send("some error in db");
};
});

app.get("/user",(req,res)=>{
  let q = `SELECT *FROM user`;
  try{
    connection.query(q,(err,users)=>{
      if(err) throw err;
      res.render("show.ejs",{users})
    });
  }
    catch{
      console.log(err);
      res.send("some error in DB");
    }
});

// Edit route
app.get("/user/:id/edit", (req,res)=>{
  let {id} = req.params;
  let q = `SELECT *FROM user WHERE id='${id}'`;
  
  try{
    connection.query(q, (err,result)=>{
      if(err) throw err;
      let user = result[0];
      res.render("edit.ejs", {user});
    });
  }catch{
    console.log(err);
    res.send("Some error in DB");
  }
})

//uPDATE route
app.patch("/user/:id",(req,res)=>{
  let {id} = req.params;
  let{password : formPass , username: newUsername} = req.body;
  let q = `SELECT *FROM user WHERE id='${id}'`;
  
  try{
    connection.query(q, (err,result)=>{
      if(err) throw err;
      let user = result[0];
      if(formPass != user.password){
        res.send("Wrong password");
      }else{
        let q2 =  `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;

        connection.query(q2,(err,result)=>{
          if(err) throw err;
          res.redirect("/user")
        })
      }
    });
  }catch{
    console.log(err);
    res.send("Some error in DB");
  }
});

app.get("/user/add",(req,res)=>{
  res.render("add.ejs");
})

app.post("/user/add", (req,res)=>{
  let {username , email, password} = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user(id, username, email, password) VALUES ('${id}','${username}','${email}','${password}')`;

  try{
  connection.query(q,(err,result)=>{
    if(err) throw err;
    console.log("new user added");
    res.redirect("/user");
  });
  }catch{
    console.log(err);
    res.send("Some error in DB");
  }
});

app.get("/user/:id/delete",(req,res)=>{
  let{ id } = req.params;
  let q = `SELECT *FROM user WHERE id='${id}'`;

  try{
    connection.query(q, (err,result) => {
      if(err) throw err;
      let user = result[0];
      res.render("delete.ejs",{user});
      });
    }catch(err){
        res.send("some error with DB");
      }
});

app.delete("/user/:id",(req,res)=>{
  let {id} = req.params;
  let { password } = req.body;
  let q = `SELECT *FROM user WHERE id='${id}'`;

  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let user = result[0];

      if(user.password != password){
        res.send("wrong password entered!");
      }else{
        let q2=`DELETE FROM user WHERE id='${id}'`;
        connection.query(q2,(err,result)=>{
          if(err) throw err;
          else{
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  }catch(err){
    res.send("some error with DB");
  }

})


app.listen(port,()=>{
  console.log(`Server is listening in port`,port);
});





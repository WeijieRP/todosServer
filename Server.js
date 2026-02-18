const express = require("express");
const mysql2 = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();


const PORT = process.env.DB_PORT || 3000;
const app = express();


const dbConfig = mysql2.createPool({
    DB_HOST : process.env.DB_HOST, 
    DB_PORT :process.env.DB_PORT , 
    DB_NAME :process.env.DB_NAME , 
    DB_USER : process.env.DB_USER , 
    DB_PASSWORD : process.env.DB_PASSWORD
})
app.use(express.json);


//get all todos list 

app.get("/todos" , async(req , res)=>{
    const connections = await mysql2.createConnection(dbConfig);
    const [rows] = await connections.execute("SELECT * FROM todos");
    if(rows.length===0) return res.status(500).json({message : "Server fetch error operation failed"});
    return res.json(rows);// return the reponse json 
})

app.post("/todos" , async(req , res)=>{
    const {name , task , description , created_at , priority} = req.body;
    const connections = await mysql2.createConnection(dbConfig);
    const [rows] = await connections.execute("INSERT INTO todos (name , task , description , created_at , priority) VALUES(? , ? , ? , ? , ?)" , [name , task , description , created_at , priority]);
    if(rows.affectedRows===0) return res.status(500).json({message : "Insertion operation failed"});
    return res.json(rows);
})

app.put("/todos/:id" , async(req , res)=>{
    const {name , task , description , created_at , priority} = req.body;
    const id = Number(req.params.id);
    const connections = await mysql2.createConnection(dbConfig);
    const [rows] = await connections.execute("UPDATE FROM todos name=? , task=? , description=? , created_at , priority=? WHERE id=?", [name , task , description , created_at , priority , id]);
    if(rows.affectedRows===0) return res.status(500).json({message : "Update operation failed"});
    return res.json(rows);// return reponse
})
app.delete("/todos/:id" , async(req , res)=>{
    const id = parseInt(req.params.id);
    const connections = await mysql2.createConnection(dbConfig);
    const [rows] = await connections.execute("DELETE FROM todos WHERE id=?" , [id]);
    if(rows.affectedRows===0) return res.status(500).json({message : "Delete operation failed"});
    return res.json(rows)
})
// -------------------- CORS --------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.REACT_APP_API_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, true);
    },
  })
);


app.use((req ,res , next)=>{
    res.status(404).json({messageError:"404 route cannot be found "});
})


app.listen(PORT , ()=>{
    console.log(`Server runnning at PORT  ${PORT}`);
})
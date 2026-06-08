const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));


// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: ""
});


// Connect MySQL
db.connect((err) => {

    if (err) {
        console.log("Database Error:", err);
        return;
    }

    console.log("MySQL Connected");

    createDatabase();
});


// Create Database
function createDatabase() {

    db.query(
        "CREATE DATABASE IF NOT EXISTS blog_db",
        (err) => {

            if (err) {
                console.log(err);
                return;
            }

            console.log("Database Created");

            useDatabase();
        }
    );
}


// Use Database
function useDatabase() {

    db.query(
        "USE blog_db",
        (err) => {

            if (err) {
                console.log(err);
                return;
            }

            console.log("Using blog_db");

            createTables();
        }
    );
}


// Create Tables
function createTables() {

    const usersTable = `
    CREATE TABLE IF NOT EXISTS users(
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100),
        email VARCHAR(100),
        password VARCHAR(100)
    )
    `;

    const notesTable = `
    CREATE TABLE IF NOT EXISTS notes(
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200),
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;

    db.query(usersTable);
    db.query(notesTable);

    console.log("Tables Created");
}


// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});


// Register API
app.post("/register", (req, res) => {

    const { username, email, password } = req.body;

    const sql =
        "INSERT INTO users(username,email,password) VALUES(?,?,?)";

    db.query(
        sql,
        [username, email, password],
        (err) => {

            if (err) {
                console.log(err);
                return res.send(`
                    <h2>Registration Failed</h2>
                    <a href="/register.html">Try Again</a>
                `);
            }

           res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Success</title>

<style>

body{
    margin:0;
    font-family:Arial,sans-serif;
    height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    background:linear-gradient(135deg,#74ebd5,#9face6);
}

.card{
    background:white;
    padding:40px;
    border-radius:20px;
    text-align:center;
    box-shadow:0 10px 25px rgba(0,0,0,0.2);
    width:400px;
}

.success{
    font-size:70px;
    color:#4CAF50;
}

h2{
    color:#2c3e50;
}

a{
    display:inline-block;
    margin-top:20px;
    padding:12px 25px;
    background:#6c63ff;
    color:white;
    text-decoration:none;
    border-radius:10px;
}

a:hover{
    background:#574fd6;
}

</style>

</head>
<body>

<div class="card">

<div class="success">✓</div>

<h2>Registration Successful</h2>

<p>
Your account has been created successfully.
</p>

<a href="/login.html">
Go To Login
</a>

</div>

</body>
</html>
`);
        }
    );
});


// Login API
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql =
        "SELECT * FROM users WHERE email=? AND password=?";

    db.query(
        sql,
        [email, password],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.send("Database Error");
            }

            if (result.length > 0) {

                res.redirect("/dashboard.html");

            } else {

                res.send(`
                    <h2>Invalid Email Or Password</h2>
                    <a href="/login.html">Try Again</a>
                `);
            }
        }
    );
});


// Add Note
app.post("/addNote", (req, res) => {

    const { title, content } = req.body;

    const sql =
        "INSERT INTO notes(title,content) VALUES(?,?)";

    db.query(
        sql,
        [title, content],
        (err) => {

            if (err) {
                console.log(err);

                return res.send(`
                    <h2>Failed To Add Note</h2>
                    <a href="/dashboard.html">
                        Back
                    </a>
                `);
            }

          res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Note Added</title>

<style>

body{
    margin:0;
    font-family:Arial;
    height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    background:linear-gradient(135deg,#6c63ff,#9face6);
}

.card{
    background:white;
    width:450px;
    padding:40px;
    border-radius:20px;
    text-align:center;
    box-shadow:0 10px 25px rgba(0,0,0,0.2);
}

.icon{
    font-size:70px;
    color:#4CAF50;
}

h2{
    color:#333;
}

a{
    display:inline-block;
    margin-top:20px;
    background:#6c63ff;
    color:white;
    text-decoration:none;
    padding:12px 25px;
    border-radius:10px;
}

a:hover{
    background:#574fd6;
}

</style>

</head>
<body>

<div class="card">

<div class="icon">📝</div>

<h2>Note Added Successfully</h2>

<p>
Your note has been saved to the database.
</p>

<a href="/dashboard.html">
Back To Dashboard
</a>

</div>

</body>
</html>
`);
        }
    );
});


// Get All Notes API
app.get("/notes", (req, res) => {

    db.query(
        "SELECT * FROM notes ORDER BY id DESC",
        (err, result) => {

            if (err) {
                console.log(err);
                return res.json([]);
            }

            res.json(result);
        }
    );
});


// Delete Note
app.delete("/deleteNote/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM notes WHERE id=?",
        [id],
        (err) => {

            if (err) {
                console.log(err);

                return res.json({
                    success: false
                });
            }

            res.json({
                success: true,
                message: "Note Deleted Successfully"
            });
        }
    );
});


// Start Server
app.listen(3000, () => {

    console.log(
        "Server Running At http://localhost:3000"
    );
});

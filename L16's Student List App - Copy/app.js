// Import required modules
const express = require('express');

// Create an Express application
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.static('css'));
const mysql = require('mysql2'); 
app.use(express.static('public'));
const multer = require('multer');

const connection = mysql.createConnection({
  user: "", //user
  password: "", //password to access server
  database: "", // schema
  host: "" // server where port 3306 open, in this case locally
});

const storage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null, 'public/images');
  },
  filename: (req,file,cb) => {
    cb(null, file.originalname)
  }
});
const upload = multer({storage: storage});

connection.connect((err) => {
  if (err){
    console.log("Error with accessing your mySQL")
  }
  console.log("Successfully connected to mySQL server")
});

app.get("/", (req,res) => {
  const sql = 'SELECT * FROM student';
  connection.query(sql, (err, results) => {
    if (err) {
      console.log("Error in trying to query, maybe skill issue? Msg:", err.message);
      return res.send("Error in the query retreiving the student details");
    }
    res.render('index', {students:results})
  });
});

app.get("/addStudent", (req,res) => {
  res.render('addStudent')
});

app.post("/addStudent", upload.single('image'),(req,res) => {
  const {name, contact, DOB} = req.body;
  let image;
  if (req.file){
    image = req.file.filename
  }else{
    image = null
  }
  const sql = 'INSERT INTO student (name, dob, contact, image) VALUES (?,?,?,?)';
  connection.query(sql, [name, DOB, contact, image], (err,results) => {
    if (err) {
      console.log("Error in trying to insert, maybe skill issue? Msg:", err.message);
      return res.send("Error in the addition of the student details");
    } else {
      res.redirect("/")
    }
  });
});

app.post("/student/delete/:id", (req,res) => {
  const studentId = parseInt(req.params.id);
  const sql = 'DELETE FROM student WHERE studentId like ?';
  connection.query(sql, [studentId], (err,results) => {
    if (err) {
      console.log("Error in trying to delete, maybe skill issue? Msg:", err.message);
      return res.send("Error in the deletion of the student details");
    }else{
      res.redirect("/")
    }
  })
})

app.get("/student/:id", (req,res) => {
  const studentId = req.params.id;
  const sql = 'SELECT * FROM student WHERE studentID like ?';
  connection.query(sql, [studentId], (err, results) => {
    if (err) {
      console.log("Error in trying to query, maybe skill issue? Msg:", err.message);
      return res.send("Error in the query retreiving the student details");
    }
    const result = results[0]
    res.render('student', {student:result})
  });
});

app.get("/student/edit/:id", (req,res) => {
  const studentId = req.params.id;
  const sql = 'SELECT * FROM student WHERE studentID like ?';
  connection.query(sql, [studentId], (err, results) => {
    if (err) {
      console.log("Error in trying to query, maybe skill issue? Msg:", err.message);
      return res.send("Error in the query retreiving the student details");
    }
    const result = results[0]
    res.render('editStudent', {student:result})
  });
});

app.post("/student/edit/:id", upload.single('image'), (req,res) => {
  const studentId = req.params.id;
  const {name, DOB, contact} = req.body;
  let image;
  if (req.file){
    image = req.file.filename
  }else{
    image = null
  }
  const sql2 = 'UPDATE student SET name = ?, dob = ?, contact = ?, image = ? WHERE studentID like ?'; // used to hv 2 commands, too lazy to change it back
  connection.query(sql2, [name, DOB, contact, image, studentId], (err, results) => {
    if (err) {
      console.log("Error in trying to update, maybe skill issue? Msg:", err.message);
      return res.send("Error in the updating of the student details");
    }else{
      res.redirect("/");
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
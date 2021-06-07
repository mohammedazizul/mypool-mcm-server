const express = require('express')
const cors = require('cors')
var mysql = require('mysql')
const fileUpload = require('express-fileupload');   // adding express-fileupload to read/upload files
const md5 = require('md5')  // adding hashing with md5 package npm md5

// to connect with mysql
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mcm_test_db'
});

// initializing the app
const app = express();

// middle wire
app.use(cors());
app.use(fileUpload());
app.use(express.json());

// to upload image in a folder
app.use(express.static('job-image'));

const port = 3002;

// INSERT INTO USER_AUTH TABLES
// to register a new user
app.post('/registerNewUser', (req, res) => {
    const userId = req.body.staff_id;
    const username = req.body.username;
    const password = req.body.password;
    // const role = 'admin';
    // const role = 'part-time-staff';
    const role = 'full-time-staff';

    const sqlInsertUser = 
        "INSERT INTO USER_AUTH (userId, username, password, role) VALUES (?,?,?,?)";
    
        pool.query(sqlInsertUser, [userId, username, password, role], (err, result) => {
        if(err){ console.log("INSERT into USERS error: ", err) }
        else {
            console.log("Result: ", result);
            res.send(result);
        }
    })
})


// SELECT specific username and password from USERS table
// to validate the login process
app.post('/validateUserLogin', (req, res) => {
    const userId = req.body.staff_id;
    const username = req.body.username;
    const password = req.body.password;
    // console.log(username, password);

    const sqlFindUser = 
        "SELECT * FROM USER_AUTH WHERE userId = ? AND username = ? AND password = ?";

    pool.query(sqlFindUser, [userId, username, password], (err, result) => {
        console.log(result)
        if (err) {
            console.log("Error: ", err);
            res.send(err);
        }
        if (result.length > 0) {
            res.send(result);
        }
        else {
            res.send(result);
            console.log(result);
        }
    })
})


// INSERT INTO SECURITY_QUESTIONS TABLES
// to save security questions answers
app.post('/setSecurityQuestions', (req, res) => {
    const staff_id = req.body.id;
    const ansOne = req.body.town;
    const ansTwo = req.body.color;

    const sqlInsetAnswer = 
        "INSERT INTO SECURITY_QUESTIONS (staff_id, ansOne, ansTwo) VALUES (?,?,?)";
    
        pool.query(sqlInsetAnswer, [staff_id, ansOne, ansTwo], (err, result) => {
        if (err) { 
            console.log("INSERT answer error: ", err) 
            res.send(err);
        }
        else {
            console.log("Result: ", result);
            res.send(result);
        }
    })
})


// CHECK SECURITY_QUESTIONS TABLES
// to check security questions answers
app.post('/checkSecurityQuestions', (req, res) => {
    const staff_id = req.body.id;
    const ansOne = req.body.town;
    const ansTwo = req.body.color;

    const sqlInsetAnswer = 
        "SELECT * FROM SECURITY_QUESTIONS WHERE staff_id = ? AND ansOne = ? AND ansTwo = ?";
    
        pool.query(sqlInsetAnswer, [staff_id, ansOne, ansTwo], (err, result) => {
        if (err) { 
            console.log("SECURITY_QUESTIONS answer error: ", err) 
            res.send(err);
        }
        else {
            console.log("Result: ", result);
            res.send(result);
        }
    })
})


// UPDATE INTO SECURITY_QUESTIONS TABLES
// to update security questions answers
app.patch('/updateSecurityQuestions', (req, res) => {
    const staff_id = req.body.id;
    const ansOne = req.body.town;
    const ansTwo = req.body.color;

    console.log("staff_id, ansOne, ansTwo : ", staff_id, ansOne, ansTwo);

    const sqlUpdateAnswer = 
        "UPDATE SECURITY_QUESTIONS SET ansOne = ? , ansTwo = ? WHERE staff_id = ?";

        pool.query(sqlUpdateAnswer, [ansOne, ansTwo, staff_id], (err, result) => {
        if (err) { 
            console.log("UPDATE answer error: ", err) 
            res.send(err);
        }
        else {
            console.log("Result: ", result);
            res.send(result);
        }
    })
})


// SELECT all PENDING job details from the JOB table
app.get('/getPendingJob',(req, res) => {
    
    const sqlGetPendingJobQuery = "SELECT * FROM JOB WHERE jobStatus = 'PENDING'";

    pool.query(sqlGetPendingJobQuery, (err, result) => {
        if (err) { 
            console.log("get job Error : ",err);
            res.send(err);
        }
        else {
            res.send(result);
            // console.log(result);
        }
    })
})


// SELECT all COMPLETED job details from the JOB table
app.get('/getCompletedJob',(req, res) => {
    
    const sqlGetCompletedJobQuery = "SELECT * FROM JOB WHERE jobStatus = 'COMPLETED'";

    pool.query(sqlGetCompletedJobQuery, (err, result) => {
        if (err) { 
            console.log("get job Error : ",err);
            res.send(err);
        }
        else {
            res.send(result);
            // console.log(result);
        }
    })
})


// UPDATE a PASSWORD from USER_AUTH table
app.patch('/resetPassword',(req, res) => {

    console.log("req.body : ", req.body);

    const userId = req.body.id;
    const username = req.body.username;
    const password = req.body.newPassword;
    const newUser = req.body.newUser;

    console.log("staff id, username, password, newUser : ", userId, username, password, newUser);

    const sqlResetPassQuery = "UPDATE USER_AUTH SET password = ?, newUser = ? WHERE userId = ? AND username = ?";

    pool.query(sqlResetPassQuery, [password, newUser, userId, username], (err, result) => {
        if (err) {
            console.log("password update Error : ", err);
            res.send(err);
        }
        else {
            console.log("password updated : ", result);
            res.send(result);
        }
    })
})


// UPDATE a userStatus from USER_AUTH table
app.patch('/increaseUserStatus',(req, res) => {

    console.log("req.body : ", req.body);

    const userId = req.body.staff_id;
    const username = req.body.username;

    console.log("staff id, username : ", userId, username);

    const sqlUpdateUserStatusQuery = "UPDATE USER_AUTH SET userStatus = userStatus + 1 WHERE userId = ? AND username = ?";

    pool.query(sqlUpdateUserStatusQuery, [userId, username], (err, result) => {
        if (err) {
            console.log("userStatus update Error : ", err);
            res.send(err);
        }
        else {
            console.log("userStatus updated : ", result);
            res.send(result);
        }
    })
})


// reference to upload in BLOB type column
// https://www.mysqltutorial.org/php-mysql-blob/


// UPDATE a jobStatus in from JOB table
app.patch('/updateJobStatus/:jobId',(req, res) => {
    // console.log("req.files : ", req.files);
    // console.log("req.body : ", req.body);

    // need to use params 
    // const id = req.params.jobId;

    const id = req.body.jobId;
    const remarks = req.body.jobRemarks;
    const status = req.body.jobStatus;

    // getting the file from the front-end
    const imgFile = req.files.jobImage;
    console.log("imgFile",imgFile);
    // storing the file data into a variable
    const newImg = imgFile.data;
    // console.log("newImg",newImg);

    // if required then converting to base64
    // const encImg = newImg.toString('base64');
    // console.log("base64-imgFile : ", encImg);

    console.log("job id , remarks, status, image data : ",id, remarks, status, newImg);

    const sqlUpdateJobQuery = "UPDATE JOB SET jobStatus = ?, remarks = ?, completionImage = ? WHERE id = ?";

    pool.query(sqlUpdateJobQuery, [status, remarks, newImg, id], (err, result) => {
        if (err) {
            console.log("job update Error : ", err);
            res.send(err);
        }
        else {
            console.log("job updated : ", result);
            res.send(result);
        }
    })
})

//-------------------------------------- TEST QUERY --------------------------------------//

// TEST QUERY to DELETE from USERS
// const userId = 100101;
// const sqlDELETE = 
//     "DELETE FROM USER_AUTH WHERE userId = ?";
// pool.query(sqlDELETE, userId, (err, result) => {
//     if (err) { console.log('error: ', err); }
//     else { console.log('result: ', result) }
// })

// TEST QUERY to DELETE from SECURITY_QUESTIONS
// const staff_id = 100101;
// const sqlDELETE = 
//     "DELETE FROM SECURITY_QUESTIONS WHERE staff_id = ?";
// pool.query(sqlDELETE, staff_id, (err, result) => {
//     if (err) { console.log('error: ', err); }
//     else { console.log('result: ', result) }
// })

// TEST QUERY to UPDATE from USERS
// const userId = 100101;
// const sqlUPDATE = 
//     "UPDATE USER_AUTH SET userStatus = 1 WHERE userId = ?";
// pool.query(sqlUPDATE, userId, (err, result) => {
//     if (err) { console.log('error: ', err); }
//     else { console.log('result: ', result) }
// })

// TEST QUERY to INSERT into JOB
// const sqlINSERT = 
//     `INSERT INTO JOB (id, jobStatus, clientId, date, PS_ID, TS_ID, ptStaffName, ftStaffName, clientName, clientAddress, clientContact, completionImage) 
//     VALUES (550092, 'PENDING', 'HT103', '01.08.2021', 100111, 100222, 'Part Time John', 'Full Time Ron', 'Mr. Apartment Client', '11, No Man Street', '011-420420', '')`;
// pool.query(sqlINSERT, (err, result) => {
//     console.log('error: ', err);
//     console.log('result: ', result);
// })

// TEST QUERY to READ all JOB
// const sqlGetJobQuery = "SELECT * FROM JOB";
// pool.query(sqlGetJobQuery, (err, result) => {
//     if (err) { 
//         console.log("get job Error : ",err); 
//     }
//     else {
//         console.log(result);
//     }
// })

// TESTING hashing with md5 - package npm md5
const pass = '12345';
console.log("password: ",pass);
const hashedPass = md5(pass);
console.log("hashed: ",hashedPass);

const pass1 = "abc123";
const pass2 = "e99a18c428cb38d5f260853678922e03"

if( md5(pass1) === pass2){
    console.log("Matched !");
}else{
    console.log("No Matched !");
}





app.get('/', (req, res) => {
    res.send('Hello World!, MCM DB Working Fine with MySQL')
})
app.listen(port, () => {
    console.log(`Connected with MySQL and app listening at http://localhost:${port}`)
})
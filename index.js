const express = require('express')
const cors = require('cors')
var mysql = require('mysql')
const fileUpload = require('express-fileupload');   // adding express-fileupload to read/upload files
const md5 = require('md5')  // adding hashing with md5 package npm md5

// to connect with mysql
// phpMyAdmin settings
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mypool-mcm-db'
});

// initializing the app
const app = express();

// middle wires
app.use(cors());
app.use(fileUpload());
app.use(express.json());

const port = 3002;  // local host post number



// to register a new staff 
// INSERT data into STAFF_AUTH table
app.post('/registerNewUser', (req, res) => {
    const id = req.body.staff_id;
    // to set up the role of the new user 
    // const role = 'admin';
    // const role = 'part-time-staff';
    const role = 'full-time-staff';
    const username = req.body.username;
    const password = req.body.password;
    const hashedPassword = md5(password);   // converting password into hash md5
    const status = 0;
    const newAccount = 1;

    const sqlQueryToInsert = 
        "INSERT INTO STAFF_AUTH (staff_id, role, username, password, account_status, new_account) VALUES (?,?,?,?,?,?)";
    
        pool.query(sqlQueryToInsert, [ id, role, username, hashedPassword, status, newAccount], (err, result) => {
        if(err){ 
            console.log("INSERT into staff_auth error: ", err) 
        }
        else {
            console.log("Result: ", result);
            res.send(result);
        }
    })
})



// to validate staff login
// SELECT all id, username and password from STAFF_AUTH table and match with the staff given data
app.post('/validateUserLogin', (req, res) => {
    const id = req.body.staff_id;
    const username = req.body.username;
    const password = req.body.password;
    const hashedPassword = md5(password);   // converting password into hash md5
    // console.log(username, password);

    const sqlValidateUser = 
        "SELECT * FROM STAFF_AUTH WHERE staff_id = ? AND username = ? AND password = ?";

    pool.query(sqlValidateUser, [id, username, hashedPassword], (err, result) => {
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



// to increase the value of account_status
// increment staff account status from STAFF_AUTH table
app.patch('/increaseUserStatus',(req, res) => {

    console.log("req.body : ", req.body);

    const id = req.body.staff_id;
    const username = req.body.username;

    console.log("staff id, username : ", id, username);

    const sqlQueryIncreaseAccountStatus =
     "UPDATE STAFF_AUTH SET account_status = account_status + 1 WHERE staff_id = ? AND username = ?";

    pool.query(sqlQueryIncreaseAccountStatus, [id, username], (err, result) => {
        if (err) {
            console.log("account status update Error : ", err);
            res.send(err);
        }
        else {
            console.log("account status updated : ", result);
            res.send(result);
        }
    })
})



// to save security questions answers
// INSERT INTO STAFF_VERIFICATION TABLES
app.post('/setSecurityQuestions', (req, res) => {
    const staff_id = req.body.id;
    const ansOne = req.body.town;
    const ansTwo = req.body.color;

    const sqlQueryInsetAnswer = 
        "INSERT INTO STAFF_VERIFICATION (staff_id, ans_one, ans_two) VALUES (?,?,?)";
    
        pool.query(sqlQueryInsetAnswer, [staff_id, ansOne, ansTwo], (err, result) => {
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
        "SELECT * FROM STAFF_VERIFICATION WHERE staff_id = ? AND ans_one = ? AND ans_two = ?";
    
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
        "UPDATE STAFF_VERIFICATION SET ans_one = ? , ans_two = ? WHERE staff_id = ?";

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



// UPDATE a PASSWORD from USER_AUTH table
app.patch('/resetPassword',(req, res) => {

    console.log("req.body : ", req.body);

    const staff_id = req.body.id;
    const username = req.body.username;
    const password = req.body.newPassword;
    const hashedPassword = md5(password);   // converting password into hash md5
    const new_staff = req.body.newUser;

    console.log("staff id, username, password, newUser : ", staff_id, username, hashedPassword, new_staff);

    const sqlResetPassQuery = "UPDATE STAFF_AUTH SET password = ?, new_account = ? WHERE staff_id = ? AND username = ?";

    pool.query(sqlResetPassQuery, [hashedPassword, new_staff, staff_id, username], (err, result) => {
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


// SELECT all PENDING job details from the JOB table
app.get('/getPendingJob',(req, res) => {
    
    const sqlGetPendingJobQuery = "SELECT * FROM JOB WHERE status = 'PENDING' OR status = 'NEW'";

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
    
    const sqlGetCompletedJobQuery = "SELECT * FROM JOB WHERE status = 'COMPLETED'";

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

    const sqlUpdateJobQuery = "UPDATE JOB SET status = ?, remarks = ?, picture = ? WHERE job_id = ?";

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

// to register a new user
// INSERT INTO USER_AUTH TABLES
// const id = 100100;
// const role = 'admin';
// const username = 'admin';
// const password = '123456';
// const hashedPassword = md5(password);   // converting password into hash md5
// const status = 0;
// const newAccount = 1;

// const sqlInsertUser = 
//     "INSERT INTO STAFF_AUTH (staff_id, role, username, password, account_status, new_account) VALUES (?,?,?,?,?,?)";

//     pool.query(sqlInsertUser, [ id, role, username, hashedPassword, status, newAccount], (err, result) => {
//     if(err){ 
//         console.log("INSERT into staff_auth error: ", err) 
//     }
//     else {
//         console.log("Result: ", result);
//         res.send(result);
//     }
// })

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
// const pass = '123456';
// console.log("password: ",pass);
// const hashedPass = md5(pass);
// console.log("hashed: ",hashedPass);

// const pass1 = "abc123";
// const pass2 = "e99a18c428cb38d5f260853678922e03"

// if( md5(pass1) === pass2){
//     console.log("Matched !");
// }else{
//     console.log("No Matched !");
// }





app.get('/', (req, res) => {
    res.send('Hello World!, MCM DB Working Fine with MySQL')
})
app.listen(port, () => {
    console.log(`Connected with MySQL and app listening at http://localhost:${port}`)
})

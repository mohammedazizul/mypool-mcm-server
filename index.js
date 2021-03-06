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



// SELECT all PENDING and NEW job details from the JOB table
app.post('/getNewAndPendingJob',(req, res) => {

    // console.log(req.body);
    const id = req.body.staffID;

    const queryToGetJob = `SELECT DISTINCT j.job_id, j.status, j.date, sd.full_name, cd.client_name, cd.address, cd.phone
                                FROM job j 
                            JOIN pool_details pd
                                ON pd.pool_id = j.pool_id
                            JOIN client_details cd
                                ON cd.client_id = pd.client_id
                            JOIN staff_job sj
                                ON sj.job_id = j.job_id
                            JOIN staff_details sd
                                ON sj.staff_id = sd.staff_id
                            WHERE
                                sj.staff_id = ?
                                AND
                                j.status = 'new' OR j.status = 'pending'
                            `;

    pool.query(queryToGetJob, [id], (err, result) => {
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
app.post('/getCompletedJob',(req, res) => {

    const id = req.body.staffID
    console.log(id);

    const queryToGetCompletedJob = `SELECT DISTINCT j.job_id, j.status, j.date
                                        FROM job j 
                                    JOIN staff_job sj
                                        ON sj.job_id = j.job_id
                                    WHERE
                                        sj.staff_id = ?
                                    AND
                                        j.status = 'completed'
                                    `;

    pool.query(queryToGetCompletedJob, [id], (err, result) => {
        if (err) { 
            console.log("get job Error : ",err);
            res.send(err);
        }
        else {
            res.send(result);
            console.log(result);
        }
    })
})


// UPDATE a jobStatus in from JOB table
app.patch('/updateJobStatus/:jobId',(req, res) => {

    const id = req.body.jobId;
    const remarks = req.body.jobRemarks;
    const status = req.body.jobStatus;

    // getting the file from the front-end
    const imgFile = req.files.jobImage;
    // console.log("imgFile",imgFile);
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

// const query = `SELECT *
//                         FROM job j 
//                     JOIN pool_details pd
//                         ON pd.pool_id = j.pool_id
//                     JOIN client_details cd
//                         ON cd.client_id = pd.client_id
//                     JOIN staff_job sj
//                         ON sj.job_id = j.job_id
//                     WHERE
//                         sj.staff_id = 100115
//                         AND
//                         j.status = 'new'
//                     `;
// pool.query(query, (err, result) => {
//     if (err) { 
//         console.log("get job Error : ",err);
//     }
//     else {
//         console.log(result);
//     }
// })

// reference sql query
// https://stackoverflow.com/questions/12475850/sql-query-return-data-from-multiple-tables

// reference to upload in BLOB type column
// https://www.mysqltutorial.org/php-mysql-blob/

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

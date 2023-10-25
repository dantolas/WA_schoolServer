//Base config and declarations
//=================================
const express = require('express');
const server = express();
const fs = require('fs').promises;
const http = require("http");

const host = 'localhost';
const port = 8000;
const path = require('path');

server.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

server.use(express.json());
server.use(express.urlencoded({extended : true}));

//==================================================

//Functions
//==================================================
/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number}    A 32bit integer
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

// Routing
// =================================================
server.use('/web/',express.static(path.join(__dirname,'/public')));

server.use('/web/',express.static(path.join(__dirname,'/public/scripts')),
(req,res) => {
    res.set('content-type', 'application/javascript;charset=utf-8');
});

server.get('/favicon.ico',function(req,res){
    //Do something
})

server.post('/validateLogin', function (req, res) {  
   console.log("Login attempt");

   let requestUsername = req.body.username;
   let requestPassword = req.body.password;

   console.log(requestUsername+" "+requestPassword)

   const mysql = require('mysql')
   const connection = mysql.createConnection({
     host: 'localhost',
     user: 'kuta',
     password: 'kuta',
     database: 'webServer'
   });

    connection.connect();

    connection.query('SELECT passHash from Login where Login.username =\''+requestUsername+'\' Or  Login.email=\''+requestUsername+'\';', (err, rows, fields) => {
        if (err) throw err

        console.log(requestUsername + " " + requestPassword + " " + rows[0].passHash);
        if(rows[0] == undefined){
            res.status(401);
            res.set('Content-Type', 'application/json');
            let data = {login:'false', error:'username',explanation:'I was working on AJAX with jquery, that\'s the reason for this JSON response, however I couldn\'t get it to work in time so just accept this as a failed login attempt'};
            connection.end();
            return res.send(JSON.stringify(data));

        }

        if (rows[0].passHash == hashCode(requestPassword)){
            connection.end();
            return res.redirect(200,'web/views/posts.html');

        }
        else{
            res.status(401);
            res.set('Content-Type', 'application/json');
            let data = {login:'false', error:'password',explanation:'I was working on AJAX with jquery, that\'s the reason for this JSON response, however I couldn\'t get it to work in time so just accept this as a failed login attempt'};
            connection.end();
            return res.send(JSON.stringify(data));

        }
    })

});  

server.post('/validateSignup', (req, res) => {
    console.log('Signup atempt');
    let requestUsername = req.body.username;
    let requestPassword = req.body.password;
    let requestEmail = req.body.email;
    let passHash = hashCode(requestPassword);

    console.log(requestUsername+" "+requestPassword+ " "+requestEmail);

    const mysql = require('mysql');
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'kuta',
        password: 'kuta',
        database: 'webServer'
    });

    connection.connect();



    connection.query('Insert  into Login(username,email,passHash) values(\''+requestUsername+'\',\''+requestEmail+'\','+passHash+');', (err, rows, fields) => {
        if (err) {
            console.log('Error thrown during sql query');
            res.status(200);
            res.set('Content-Type', 'application/json');
            let data = {signup:'false', error:'Account already registered. Duplicate email.',explanation:'I was working on AJAX with jquery, that\'s the reason for this JSON response, however I couldn\'t get it to work in time so just accept this as a failed signup attempt'};
            connection.end();
            next(err);
            return res.send(JSON.stringify(data));

        }

        console.log('Executed query');
        res.status(200);
        res.set('Content-Type','text/html');
        return res.send('Succesfully Signed-up. <a href=\'/web/\'>Back to Login.</a>');

    });


})

//Respond with 404 if no route is found
server.use('/',(req,res) => {
    res.status(404);
    res.set('Content-Type','text/html');
    res.sendFile(path.join(__dirname,'/404_schoolServer.html'));
});
server.use((req,res) => {
    res.status(404);
    res.set('Content-Type','text/html');
    res.sendFile(path.join(__dirname,'/404_schoolServer.html'));
});
//============================================================================


// Server starts listenning
// ==================================
server.listen(port, () => {
  console.log(`Server is running on http://${host}:${port}. Awaiting connections.`);
});

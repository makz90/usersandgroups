// Imports ===========================================================
var express = require("express");
var mysql = require('mysql');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');


// Configuration ====================================================

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(methodOverride());

// Set port number
var port = process.env.PORT || 3000;

// MySQL Connection --------------------------------------------------
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'testuser',
    password: 'testpassword'
});

var createDatabaseSql = "CREATE DATABASE IF NOT EXISTS testdb;";
var createUsersTableSql = "CREATE TABLE IF NOT EXISTS `testdb`.`users` (" +
    "`id` INT NOT NULL AUTO_INCREMENT," +
    "`login` VARCHAR(45) NOT NULL," +
    "`password` VARCHAR(45) NOT NULL," +
    "`first_name` VARCHAR(45) NULL," +
    "`last_name` VARCHAR(45) NULL," +
    "`birth_date` DATE NULL," +
    "PRIMARY KEY (`id`)," +
    "UNIQUE INDEX `id_UNIQUE` (`id` ASC)," +
    "UNIQUE INDEX `login_UNIQUE` (`login` ASC));";
var createGroupsTableSql = "CREATE TABLE IF NOT EXISTS `testdb`.`groups` (" +
    "`id` INT NOT NULL AUTO_INCREMENT," +
    "`name` VARCHAR(45) NOT NULL," +
    "PRIMARY KEY (`id`)," +
    "UNIQUE INDEX `name_UNIQUE` (`name` ASC)," +
    "UNIQUE INDEX `id_UNIQUE` (`id` ASC));";
var createUserGroupsTableSql = "CREATE TABLE IF NOT EXISTS `testdb`.`usergroups` (" +
    "`group_id` INT NOT NULL," +
    "`user_id` INT NOT NULL," +
    "PRIMARY KEY (`group_id`, `user_id`));";

connection.connect(function (err) {
    if (err) throw err;
    console.log("MySQL connected.");
    connection.query(createDatabaseSql, function (err, result) {
        if (err) throw err;
    });
    connection.query(createUsersTableSql, function (err, result) {
        if (err) throw err;
    });
    connection.query(createGroupsTableSql, function (err, result) {
        if (err) throw err;
    });
    connection.query(createUserGroupsTableSql, function (err, result) {
        if (err) throw err;
    });
    connection.query("USE testdb", function (err, result) {
        if (err) throw err;
    });
    console.log("Database connected.");
});

// Routes -----------------------------------------------------------
app.get("/", function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static(__dirname + '/public'));



// API ===============================================================

// GET ---------------------------------------------------------------
app.get("/api/users", function (req, res) {
    executeQuery(req, res, 'SELECT * FROM users');
});

app.get("/api/users/:id", function (req, res) {
    executeQuery(req, res,
        'SELECT * FROM users WHERE id=' + req.params.id);
});

app.get("/api/groups", function (req, res) {
    executeQuery(req, res, 'SELECT * FROM groups');
});

app.get("/api/groups/:id", function (req, res) {
    executeQuery(req, res, 'SELECT * FROM groups WHERE id=' + req.params.id);
});

app.get("/api/usergroups", function (req, res) {
    executeQuery(req, res, 'SELECT * FROM usergroups');
});

app.get("/api/groups/user/:id", function (req, res) {
    executeQuery(req, res, 'SELECT groups.* FROM groups ' +
    'INNER JOIN usergroups ON groups.id=usergroups.group_id ' +
    'WHERE usergroups.user_id=' + req.params.id);
});

app.get("/api/users/group/:id", function (req, res) {
    executeQuery(req, res, 'SELECT users.* FROM users ' +
    'INNER JOIN usergroups ON users.id=usergroups.user_id ' +
    'WHERE usergroups.group_id=' + req.params.id);
});

// POST --------------------------------------------------------------
app.post("/api/users", function (req, res) {
    var birthDate = new Date(req.body.birth_date);
    var birthDateString = birthDate.getFullYear() + '-' + (birthDate.getMonth() + 1) + '-' +  birthDate.getDate();

    executeQuery(req, res,
        'INSERT INTO users (login, password, first_name, last_name, birth_date) ' +
        'VALUES ("' +
        req.body.login + '","' +
        req.body.password + '","' +
        req.body.first_name + '","' +
        req.body.last_name + '","' +
        birthDateString + '")'
    );
});

app.post("/api/groups", function (req, res) {
    //if (req.body.name) {
        executeQuery(req, res,
            'INSERT INTO groups (name) ' +
            'VALUES ("' + req.body.name + '")'
        );
    //}
});

app.post("/api/usergroups/:group_id/:user_id", function (req, res) {
    executeQuery(req, res,
        'INSERT INTO usergroups (group_id, user_id) ' +
        'VALUES ("' +
        req.params.group_id + '","' +
        req.params.user_id + '")'
    );
});

// PUT ---------------------------------------------------------------
app.put("/api/users/:id/:key/:value", function (req, res) {
    executeQuery(req, res,
        'UPDATE users ' +
        'SET ' + req.params.key + '="' + req.params.value + '" ' +
        'WHERE id=' + req.params.id
    );
});

app.put("/api/groups/:id/:key/:value", function (req, res) {
    executeQuery(req, res,
        'UPDATE groups ' +
        'SET ' + req.params.key + '="' + req.params.value + '" ' +
        'WHERE id=' + req.params.id
    );
});

// DELETE ---------------------------------------------------------------
app.delete("/api/users/:id", function (req, res) {
    executeQuery(req, res,
        'DELETE FROM users ' +
        'WHERE id = ' + req.params.id
    );
});

app.delete("/api/groups/:id", function (req, res) {
    executeQuery(req, res,
        'DELETE FROM groups ' +
        'WHERE id =' + req.params.id
    );
});

app.delete("/api/usergroups/user/:user_id", function (req, res) {
    executeQuery(req, res,
        'DELETE FROM usergroups ' +
        'WHERE user_id =' + req.params.user_id
    );
});

app.delete("/api/usergroups/group/:group_id", function (req, res) {
    executeQuery(req, res,
        'DELETE FROM usergroups ' +
        'WHERE group_id =' + req.params.group_id
    );
});

app.delete("/api/usergroups/:group_id/:user_id", function (req, res) {
    executeQuery(req, res,
        'DELETE FROM usergroups ' +
        'WHERE group_id =' + req.params.group_id + ' AND user_id = ' + req.params.user_id
    );
});

// Run server ==========================================================

app.listen(port);
console.log("NodeServer is listening on port: " + port);


// Auxiliary functions =================================================

function executeQuery(req, res, sql) {
    connection.query(sql, function (err, result) {
        if (err) {
            console.log(err.message);
            res.json(err.message);
        } else {
            console.log("Executing SQL:", sql);
            res.json(result);
        }
    });
}
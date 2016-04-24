var express = require('express');
var exphbs = require('express-handlebars');
var mysql = require('mysql');
var bodyParser = require('body-parser');

var config = require('./config');

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'runciman',
    database: 'spaceapps'
});
setTimeout(function () {
    con.connect();
}, 1000);

var app = express();

app.engine('handlebars', exphbs({
    defaultLayout: __dirname + '/views/layouts/main'
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.use(bodyParser.json());

app.use('/css', express.static('css'));
app.use('/images', express.static('images'));
app.use('/scripts', express.static('scripts'));

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/login', function (req, res) {
    res.render('login');
});

app.get('/signup', function (req, res) {
    res.render('signup');
});

app.get('/alerts', function (req, res) {
    res.render('alerts');
});

app.get('/symptoms', function (req, res) {
    res.render('symptoms');
});

app.get('/journeyplanner', function (req, res) {
    res.render('heatmap');
});

app.get('/map/:type', function (req, res) {
    var sql = mysql.format("SELECT latitude, longitude, value FROM measurements m LEFT JOIN measurement_types mt ON m.type=mt.id WHERE name=? AND latitude != 0 AND longitude != 0", [req.params.type.toUpperCase()]);
    con.query(sql, function (error, results, fields) {
        console.log(JSON.stringify(results));
        res.render('map', {data: JSON.stringify(results).replace(/&quot;/g, '\\"')});
    });
});

app.post('/api/measurements', function (req, res) {
    var data = req.body;
    for (var i = 0; i < data.measurements.length; i++) {
        var sql = mysql.format("INSERT INTO measurements(timestamp, longitude, latitude, type, value) VALUES(?, ?, ?, (SELECT id FROM measurement_types WHERE name=?), ?);", [data.timestamp, data.longitude, data.latitude, data.measurements[i].type, data.measurements[i].value]);
        con.query(sql, function (error, results, fields) {
            console.log(error);
        });
    }
    res.end();
});

app.get('/api/measurements/:type', function (req, res) {
    if (req.query.centre && req.query.radius) {
        var centre = JSON.parse(req.query.centre);

        var sql = "SELECT * FROM measurements m LEFT JOIN measurement_types mt ON m.type=mt.id WHERE mt.name=? AND (3959 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin( radians(?)) * sin(radians(latitude)))) < ?;";
        sql = mysql.format(sql, [req.params.type.toUpperCase(), centre.latitude, centre.longitude, centre.latitude, req.query.radius]);
        console.log("Querying:");
        console.log(sql);
        con.query(sql, function (error, results, fields) {
            console.log("Results: " + JSON.stringify(results));
        });
    }
});

app.listen(config.port, function () {
});
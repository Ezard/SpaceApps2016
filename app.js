var express = require('express');
var exphbs = require('express-handlebars');
var mysql = require('mysql');

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

app.use('/css', express.static('css'));
app.use('/scripts', express.static('scripts'));

app.get('/', function (req, res) {
    res.render('index');
});

app.post('/api/measurements', function (req, res) {
    console.log(req.query.data);
    var data = JSON.parse(req.query.data);
    for (var i = 0; i < data.measurements.length; i++) {
        var sql = mysql.format("INSERT INTO measurements(timestamp, longitude, latitude, type, value) VALUES(?, ?, ?, (SELECT id FROM measurement_types WHERE name=?), ?);", [data.timestamp, data.longitude, data.latitude, data.measurements[i].type, data.measurements[i].value]);
        con.query(sql, function (error, results, fields) {
            console.log(error);
        });
    }
    res.end();
});

app.listen(config.port, function () {
});
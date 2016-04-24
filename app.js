var DATABASE_ENABLE = true;

var express = require('express');
var exphbs = require('express-handlebars');
var mysql;
if (DATABASE_ENABLE) {
    mysql = require('mysql');
}

var bodyParser = require('body-parser');

var config = require('./config');
var con;

if (DATABASE_ENABLE) {
    con = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'runciman',
        database: 'spaceapps'
    });


    setTimeout(function () {
        con.connect();
    }, 1000);
}

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
    con.query("SELECT value as methane FROM measurements WHERE type=1 ORDER BY timestamp DESC LIMIT 1", function (error, results, fields) {
        con.query("SELECT value as carbon_monoxide FROM measurements WHERE type=2 ORDER BY timestamp DESC LIMIT 1", function (error2, results2, fields2) {
            con.query("SELECT value as air_quality FROM measurements WHERE type=3 ORDER BY timestamp DESC LIMIT 1", function (error3, results3, fields3) {
                con.query("SELECT value as temperature FROM measurements WHERE type=4 ORDER BY timestamp DESC LIMIT 1", function (error4, results4, fields4) {
                    con.query("SELECT value as humidity FROM measurements WHERE type=5 ORDER BY timestamp DESC LIMIT 1", function (error5, results5, fields5) {
                        var obj = {
                            methane: results.methane,
                            carbon_monoxide: results2.carbon_monoxide,
                            air_quality: results3.air_quality,
                            temperature: results4.temperature,
                            humidity: results5.humidity
                        };
                        console.log(obj);
                        res.render('index', obj);
                    });
                });
            });
        });
    });
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
    if (DATABASE_ENABLE) {
        var sql = mysql.format("SELECT timestamp, latitude, longitude, value FROM measurements m LEFT JOIN measurement_types mt ON m.type=mt.id WHERE name=? AND latitude != 0 AND longitude != 0", [req.params.type.toUpperCase()]);
        con.query(sql, function (error, results, fields) {
            res.render('map', {type: req.params.type, data: JSON.stringify(results)});
        });
    } else {
        res.render("map")
    }
});

app.post('/api/measurements', function (req, res) {
    var data = req.body;
    for (var i = 0; i < data.measurements.length; i++) {
        var sql = mysql.format("INSERT INTO measurements(timestamp, longitude, latitude, type, value) VALUES(?, ?, ?, (SELECT id FROM measurement_types WHERE name=?), ?);", [data.timestamp, data.longitude, data.latitude, data.measurements[i].type, data.measurements[i].value]);
        con.query(sql, function (error, results, fields) {
            // console.log(error);
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
var express = require('express');
var exphbs = require('express-handlebars');

var app = express();

app.engine('handlebars', exphbs({
    defaultLayout: __dirname + '/views/layouts/main'
}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(2048, function () {
});
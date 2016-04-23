/**
 * Created by John on 23/04/2016.
 */

var yorkx = 53.946815;
var yorky = -1.030851; //not for girls

var map, heatmap;

function initheatMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: yorkx, lng: yorky},
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: getPoints(),
        map: map
    });
}

function changeGradient() {
    var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ]
    heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}

function getPoints() {
    getSensorData();
    return drawCircle();
}

function getSensorData() {
    $.ajax({
            method: "GET",
            url: "/testjohnsjson"
        })
        .success(function( msg ) {
            alert("swag");
            alert( "Data Saved: " + msg );
        }).fail(function() {
        alert("yolo");
    });
}

function drawCircle() {
    var points = [];
    var steps = 1000;
    var radius = 0.01;

    var x, y;
    for (var i = 0; i < steps; i++) {
        x = (yorkx + radius * (i / 100) * Math.cos(2 * Math.PI * 3 *i / steps));
        y = (yorky + (radius * 2 * (i / 100)) * Math.sin(2 * Math.PI * 3 * i / steps));
        points.push({location: new google.maps.LatLng(x, y), weight: i*i*i})
    }
    return points;
}
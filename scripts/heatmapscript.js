/**
 * Created by John on 23/04/2016.
 */

var yorkx = 53.946815;
var yorky = -1.030851; //not for girls

//blackfriars bridge
var bbx = 51.509759;
var bby = -0.104490;
var map, heatmap;
var toDeleteMarker = null;
var startMarker = null;
var endMarker = null;
var pointsGlobal = [];

function initheatMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {lat: yorkx, lng: yorky},
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });
    directionsDisplay.setMap(map);

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: getPoints(),
        map: map
    });

    startMarker = new google.maps.Marker({
        position: new google.maps.LatLng(yorkx, yorky),
        map: map,
        draggable: true
    });

    google.maps.event.addListener(map, "click", function (e) {
        toDeleteMarker = endMarker;
        endMarker = startMarker;
        startMarker = new google.maps.Marker({
            position: e.latLng,
            map: map,
            draggable: true
        });
        if (toDeleteMarker) {
            toDeleteMarker.setMap(null);
        }
        calculateAndDisplayRoute(directionsService, directionsDisplay);
        google.maps.event.addListener(startMarker, 'dragend', function()
            {
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            }
        );
        google.maps.event.addListener(endMarker, 'dragend', function()
            {
                calculateAndDisplayRoute(directionsService, directionsDisplay);
            }
        );
    });

}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: startMarker.getPosition(),
        destination: endMarker.getPosition(),
        waypoints: calculateWaypoints(startMarker.getPosition(), endMarker.getPosition()),
        travelMode: google.maps.TravelMode.WALKING
    }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function calculateWaypoints(start, end){
    var lngDistance = start.lng() - end.lng();
    var latDistance = start.lat() - end.lat();
    var distance = Math.sqrt((latDistance*latDistance) + (lngDistance*lngDistance));
    alert(distance);
    var steps = Math.min(8, Math.floor(5/distance));
    var waypointsAbove = [];
    var waypointsBelow = [];
    var waypointsAboveDistance = 0;
    var waypointsBelowDistance = 0;
    var threshold = 0.01;
    for (var i = 0; i < steps; i++){

        var newLngAbove = start.lng() - (lngDistance * 1.5 * i/steps);
        var newLatAbove = start.lat() - (latDistance * 1.5 * i/steps);
        var newLngBelow = newLngAbove;
        var newLatBelow = newLatBelow;


        for (var j = 0; j < pointsGlobal.length; j++){
            var h = pointsGlobal[j].location;
            var hLngDistance = h.lng() - newLngAbove;
            var hLatDistance = h.lat() - newLatAbove;
            var hDistance = Math.sqrt((hLatDistance*hLatDistance) + (hLngDistance*hLngDistance));
            if (hDistance < threshold){
                // newLng += Math.random() - 0.0005;
                if (lngDistance < latDistance) {
                    newLatAbove += distance / 100;
                }
                else {
                    newLngAbove += distance / 100;
                }
                j = 0;
            }
        }

        for (j = 0; j < pointsGlobal.length; j++){
            h = pointsGlobal[j].location;
            hLngDistance = h.lng() - newLngBelow;
            hLatDistance = h.lat() - newLatBelow;
            hDistance = Math.sqrt((hLatDistance*hLatDistance) + (hLngDistance*hLngDistance));
            if (hDistance < threshold){
                // newLng += Math.random() - 0.0005;
                if (lngDistance < latDistance) {
                    newLatBelow -= distance / 100;
                }
                else {
                    newLngBelow -= distance / 100;
                }
                j = 0;
            }
        }

        waypointsAbove.push({location: new google.maps.LatLng(newLatAbove, newLngAbove),stopover: false});
        waypointsBelow.push({location: new google.maps.LatLng(newLatBelow, newLngBelow),stopover: false})
    }

    var snapRequest = "https://roads.googleapis.com/v1/snapToRoads?path=";

    for (i = 0; i < waypointsAbove.length; i++){
        snapRequest += waypointsAbove[i].location.lat().toString() + ",";
        snapRequest += waypointsAbove[i].location.lng().toString();
        if (i != waypointsAbove.length - 1){
            snapRequest += "|";
        }
    }
    snapRequest += "&interpolate=true&key=AIzaSyAwveoqN8yTd5-6N1XfgcSZ8R1g_P8YOdw";
    alert(snapRequest);

    $.ajax({
            method: "GET",
            url: snapRequest
        })
        .success(function( msg ) {
            alert(JSON.stringify(msg));
            for (var i = 0; i < msg.snappedPoints.length; i++){
                waypointsAbove[i] = msg.snappedPoints.location;
            }
        }).fail(function() {
        alert("error");
    });

    alert(waypointsAbove.length);
    alert(waypointsBelow.length);
    return waypointsAbove;
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
    var points = drawCircle();
    points.push.apply(points, addCluster(51.510051, -0.134488));
    pointsGlobal = points;
    return points;
}

function getSensorData() {
    $.ajax({
            method: "GET",
            url: "/testjohnsjson"
        })
        .success(function( msg ) {
            // alert("swag");
            // alert( "Data Saved: " + msg );
        }).fail(function() {
        alert("yolo");
    });
}

function addCluster(lat, lng){
    var points = [];
    var radius = 0.01;
    var x, y;

    for (var i = 0; i < 100; i++){
        points.push({location: new google.maps.LatLng(lat + (Math.random() * radius) - (radius/2),
            lng + (Math.random() * radius * 2) - (radius/2)), weight: (Math.random() * 1000000000)})
        x = (yorkx + radius * (Math.random() * 100) * Math.cos(2 * Math.PI * 3 *i / Math.random()));
        y = (yorky + (radius * 2 * (Math.random() * 100)) * Math.sin(2 * Math.PI * 3 * i / Math.random()));
        points.push({location: new google.maps.LatLng(x, y), weight: i*i*i})
    }
    pointsGlobal = points;
    return points;
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
    pointsGlobal = points;
    return points;
}

$("#coButton").click(function () {
    map.setCenter(new google.maps.LatLng(yorkx, yorky), 5);
    heatmap.setMap(null);
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: drawCircle(),
        map: map
    });
});

$("#methaneButton").click(function () {
    map.setCenter(new google.maps.LatLng(bbx, bby), 5);
    heatmap.setMap(null);
    heatmap = new google.maps.visualization.HeatmapLayer({
        data: addCluster(bbx, bby),
        map: map
    });
});
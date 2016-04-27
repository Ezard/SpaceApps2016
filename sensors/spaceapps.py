from sensors import *
import spidev
from Adafruit_DHT import *
import time
import os
import requests
import serial
import pynmea2

import sys
import traceback
#sys.stdout = open("log.txt", "w")

dataServerUrl = "http://46.101.83.202/api/measurements"

spi = spidev.SpiDev()
spi.open(0,0)

gps = serial.Serial("/dev/ttyACM0", 115200)

methane = MethaneSensor(0, 10, 5)
carbonMonoxide = CarbonMonoxideSensor(1, 10, 5)
airQuality = AirQualitySensor(2)

def getJsonToSend(latVal, longVal, methaneVal, carbonMonoxideVal, airQualityVal, tempVal, humidityVal):
    return {
    "timestamp": int(time.time()),
    "longitude": longVal,
    "latitude": latVal,
    "measurements": [
        {
            "type": "METHANE",
            "value": methaneVal
        },
        {
            "type": "CARBON_MONOXIDE",
            "value": carbonMonoxideVal
        },
        {
            "type": "AIR_QUALITY",
            "value": airQualityVal
        },
        {
            "type": "TEMPERATURE",
            "value": round(tempVal, 2)
        },
        {
            "type": "HUMIDITY",
            "value": round(humidityVal, 2)
        }
    ]
}

while True:
    methaneVal = methane.read(spi)
    carbonMonoxideVal = carbonMonoxide.read(spi)
    airQualityVal = airQuality.read(spi)
    humidityVal, tempVal = read_retry(DHT22, 26)

    gpsString = ""
    while True:
        gps.flush()
        gpsString = gps.readline()
        if "GPGGA" in gpsString:
            print "GPS:", gpsString[:-1]
            break

    print "Methane: %s" % methaneVal
    print "Carbon Monoxide: %s" % carbonMonoxideVal
    print "Air Quality: %s" % airQualityVal
    if tempVal is not None:
        print "Temperature: {0:0.1f}*C".format(tempVal)
    if humidityVal is not None:
        print "Humidity: {0:0.1f}%".format(humidityVal)

    #gpsData = pynmea2.parse("$GPGGA,184353.07,1929.045,S,02410.506,E,1,04,2.6,100.00,M,-33.9,M,,0000*6D")
    gpsData = None
    try:
        gpsData = pynmea2.parse(gpsString)
    except Exception, e:
        print "error1:",e
        traceback.print_exc()

    try:
        r = requests.post(dataServerUrl, json=getJsonToSend(gpsData.latitude if gpsData is not None else 0.0, gpsData.longitude if gpsData is not None else 0.0, methaneVal, carbonMonoxideVal, airQualityVal, tempVal, humidityVal))
        if r.status_code != 200:
            print r.status_code, ": send error my have occurred"
        else:
            print "send success!"

    except Exception, e:
        print "error2:",e
        traceback.print_exc()

    time.sleep(0.5)
    #os.system("clear")
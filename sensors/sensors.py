def scaleValue(x, in_min, in_max, out_min, out_max):
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

class Sensor(object):
    """docstring for Sensor"""
    def __init__(self, channel):
        super(Sensor, self).__init__()
        if channel > 7 or channel < 0:
            raise Exception("Channel out of range, must be between 0 and 7")
        self.channel = channel
        self.calibration = 0

    def readADC(self, spi):
        readIn = spi.xfer2([1, 8 + self.channel << 4, 0])
        return ((readIn[1] & 3) << 8) + readIn[2]

class MethaneSensor(Sensor):
    """docstring for MethaneSensor MQ-4"""
    def __init__(self, channel, loadResistor, inputVoltage):
        super(MethaneSensor, self).__init__(channel)
        self.loadResistor = loadResistor
        self.inputVoltage = inputVoltage

    def calculateSensorResistance(self, vrl):
        return (inputVoltage/vrl-1.0)*self.loadResistor

    def calculatePowerOfSensitivity(self, vrl):
        return (self.inputVoltage**2)*calculateSensorResistance()/(calculateSensorResistance()+self.loadResistor)**2

    def read(self, spi):
        rawReading = super(MethaneSensor, self).readADC(spi)
        #voltage = scaleValue(float(rawReading), 0.0, 1023.0, 0.0, 5.0) #Vrl
        return rawReading

class CarbonMonoxideSensor(Sensor):
    """docstring for CarbonMonoxideSensor MQ-7"""
    def __init__(self, channel, loadResistor, inputVoltage):
        super(CarbonMonoxideSensor, self).__init__(channel)
        self.loadResistor = loadResistor
        self.inputVoltage = inputVoltage

    def read(self, spi):
        rawReading = super(CarbonMonoxideSensor, self).readADC(spi)
        #voltage = scaleValue(float(rawReading), 0.0, 1023.0, 0.0, 5.0) #Vrl
        return rawReading
        
class AirQualitySensor(Sensor):
    """docstring for AirQualitySensor MQ-2"""
    def __init__(self, channel):
        super(AirQualitySensor, self).__init__(channel)

    def read(self, spi):
        rawReading = super(AirQualitySensor, self).readADC(spi)
        return rawReading
        



        
        


        
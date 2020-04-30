import time
# for pump
from gpiozero import LED
# for soil
import busio
from board import SCL, SDA
from adafruit_seesaw.seesaw import Seesaw
import zmq

# zeromq publisher/subscriber pattern
context = zmq.Context()
socket = context.socket(zmq.PUB)
socket.bind("tcp://*:5555")


# i2c for soil sensor
i2c_bus = busio.I2C(SCL, SDA)
ss = Seesaw(i2c_bus, addr=0x36)

# pump
pump = LED(14)

while True:
    # read moisture level through capacitive touch pad
    touch = ss.moisture_read()
    # read temperature from the temperature sensor
    temp = ss.get_temp()
    # turn on/off pump
    if touch < 500:
        pump.on()
    else:
        pump.off()
    print("Temperature C: {} Moisture: {}".format(temp, touch))
    # send data with publisher/subscriber pattern with zeromq
    socket.send_json({'temperature': temp, 'moisture': touch})
    time.sleep(1)
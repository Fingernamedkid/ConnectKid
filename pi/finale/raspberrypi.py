import threading
import time
import math
import requests
import json
from gpiozero import Button, Buzzer
from smbus2 import SMBus

# Local server URLs
LOCAL_SERVER_URL = "https://connectkid-8798464258f9.herokuapp.com/location"
ALERT_SERVER_URL = "https://connectkid-8798464258f9.herokuapp.com/alert"

# Accelerometer settings (MMA8452Q)
MMA8452Q_ADDR = 0x1D
CTRL_REG1 = 0x2A
OUT_X_MSB = 0x01
SCALE_FACTOR = 1024
GRAVITY = 9.81
NOISE_THRESHOLD = 0.05

# GPIO setup for the button and interrupts
INT1_PIN = 17  # INT1 connected to GPIO17
INT2_PIN = 27  # INT2 connected to GPIO27
BUTTON_PIN = 20
BUZZER_PIN = 21

# Initialize GPIO components
button = Button(BUTTON_PIN)  # Button on GPIO 21
int1_button = Button(INT1_PIN)  # INT1 on GPIO 17
int2_button = Button(INT2_PIN)  # INT2 on GPIO 27
buzzer = Buzzer(BUZZER_PIN)

# I2C bus setup
bus = SMBus(1)
bus.write_byte_data(MMA8452Q_ADDR, CTRL_REG1, 0x01)

# Initialize variables
velocity = 0
last_time = time.time()

# Interrupt callback functions
def int1_callback():
    print("INT1 (Motion Detected) Interrupt Triggered!")
    # Handle motion event
    global velocity
    velocity += 1  # Example: increase velocity on motion

def int2_callback():
    print("INT2 (Freefall or other event) Interrupt Triggered!")
    # Handle INT2 event (e.g., freefall)
    global velocity
    velocity = 0  # Reset velocity if freefall detected

# Attach event detection for INT1 and INT2
int1_button.when_pressed = int1_callback
int2_button.when_pressed = int2_callback

def get_location():
    """Get current location using Google Geolocation API."""
    try:
        api_key = "AIzaSyDwg7hEovjGzP_-SHvmr3I7S_5silt-sck"
        url = f"https://www.googleapis.com/geolocation/v1/geolocate?key={api_key}"
        headers = {"Content-Type": "application/json"}
        data = {
            "homeMobileCountryCode": 310,
            "homeMobileNetworkCode": 410,
            "radioType": "gsm",
            "carrier": "Vodafone",
            "considerIp": True
        }

        response = requests.post(url, headers=headers, json=data, timeout=5)

        if response.status_code == 200:
            location_data = response.json()
            lat = location_data['location']['lat']
            lon = location_data['location']['lng']
            return lat, lon
        else:
            print(f"Error: {response.status_code}, {response.text}")
            return None, None
    except Exception as e:
        print(f"Error getting location: {e}")
        return None, None


# Load user ID

def send_to_localhost(user_id, lat, lon, velocity):
    """Send user ID, location, and velocity to the local server."""
    payload = {
        "user_id": user_id,
        "lat": lat,
        "lon": lon,
        "velocity": velocity,
        "device_id": "RaspberryPi"
    }
    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(LOCAL_SERVER_URL, json=payload, headers=headers, timeout=5)
        if response.status_code == 200:
            print("Location data sent successfully!")
        else:
            print(f"Failed to send location data: {response.status_code}")
    except Exception as e:
        print(f"Error sending location data: {e}")

def convert(raw):
    """Convert raw acceleration data to m/s²."""
    value = (raw[0] << 8 | raw[1]) >> 4
    if value & (1 << 11):
        value -= (1 << 12)
    result = value / SCALE_FACTOR * GRAVITY
    return result
    

def button_pressed(user_id):
    """Handle button press event."""
    print("Button pressed! Sounding buzzer and sending alert.")
    buzzer.beep(on_time=0.5, off_time=0.5)  # Beep on for 0.5 seconds, off for 0.5 seconds  
    time.sleep(1)
    buzzer.off()

    # Send alert to the alert server
    payload = {
        "user_id": user_id,
        "device_id": "RaspberryPi",
        "alert": "Button pressed"
    }
    headers = {'Content-Type': 'application/json'}

    try:
        response = requests.post(ALERT_SERVER_URL, json=payload, headers=headers, timeout=5)
        if response.status_code == 200:
            print("Alert sent successfully!")
        else:
            print(f"Failed to send alert: {response.status_code}")
            print(response)
    except Exception as e:
        print(f"Error sending alert: {e}")

# Attach event detection for the button

def read_acceleration():
    """Read and filter acceleration data."""
    try:
        data = bus.read_i2c_block_data(MMA8452Q_ADDR, OUT_X_MSB, 6)
        ax = convert(data[:2]) + 7.55
        ay = convert(data[2:4]) + 5.7
        az = convert(data[4:6]) - GRAVITY + 6.4
        return ax, ay, az
    except Exception as e:
        print(f"Error reading acceleration: {e}")
        return 0, 0, 0

def monitor_location_and_speed():
    """Monitor location and speed, and send data to the server."""
    global velocity, last_time
    last_ax, last_ay, last_az = 0, 0, 0  

    try:
        while True:
            velocity = 0
            ax, ay, az = read_acceleration()

            delta_ax = ax - last_ax
            delta_ay = ay - last_ay
            delta_az = az - last_az

            delta_acceleration = math.sqrt(delta_ax**2 + delta_ay**2 + delta_az**2)

            print(f"Delta Acceleration: {delta_acceleration:.2f} m/s²")

            # Check if the change in acceleration exceeds a threshold for more accurate data
            if delta_acceleration > NOISE_THRESHOLD:
                acceleration = math.sqrt(ax**2 + ay**2 + az**2)
            else:
                acceleration = 0  # Ignore small movements as noise

            current_time = time.time()
            dt = current_time - last_time
            last_time = current_time

            if acceleration > 0:
                velocity += delta_acceleration * dt * 3.6 /10 # Speed in km/h

            if velocity < 0.01:
                velocity = 0

            # Save the current values for the next iteration
            last_ax, last_ay, last_az = ax, ay, az

            # Get current location and send the data
            lat, lon = get_location()
            if lat and lon:
                print(f"User {user_id} | Lat: {lat}, Lon: {lon} | Acceleration: {delta_acceleration/10:.2f} m/s² | Speed: {velocity:.2f} km/h")
                send_to_localhost(user_id, lat, lon, velocity)
                
            time.sleep(4)

    except KeyboardInterrupt:
        print("\nProgram interrupted. Stopping...")


def load_user_id():
    """Load user ID from the configuration file."""
    try:
        with open('/home/projet/Desktop/user_config.json', 'r') as f:
            config = json.load(f)
            user_id = config.get('user_id')
            if not user_id:
                pair_id = input("Enter your user ID pair code: ")
                response = requests.post("http://192.168.0.12:8080/pairDevice", timeout=5, json={"pair_id": pair_id, "device_id": "RaspberryPi"})
                if response.status_code == 200:
                    user_id = response.json().get('user_id')
                    config['user_id'] = user_id
                    with open('/home/projet/Desktop/user_config.json', 'w') as f:
                        json.dump(config, f)
                else:
                    print("Failed to pair device. Using default user ID.")
            return user_id
    except Exception as e:
        print(f"Error loading user configuration: {e}")
        return 'default_user_id'
user_id = load_user_id()

button.when_pressed = lambda: button_pressed(user_id)

# Create and start the location monitoring thread
location_thread = threading.Thread(target=monitor_location_and_speed)
location_thread.start()

# Wait for threads to complete
location_thread.join()

# Cleanup resources
bus.close()
print("Cleaned up resources. Exiting.")

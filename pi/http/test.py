from flask import Flask, request, jsonify
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)
GPIO.setup(20, GPIO.OUT)  # Red LED

app = Flask(__name__)

@app.route('/led', methods=['POST'])
def control_led():
    state = request.json.get('state', '').lower()
    
    if state == "red":
        GPIO.output(20, GPIO.HIGH)
        return jsonify({"message": "Red light ON"}), 200
    elif state == "off":
        GPIO.output(20, GPIO.LOW)
        return jsonify({"message": "Lights OFF"}), 200
    else:
        return jsonify({"message": "Unknown state"}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

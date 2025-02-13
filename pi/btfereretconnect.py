import bluetooth
import asyncio
import websockets

DEVICE_ADDRESS = "E4:5F:01:D6:2B:BF"
PORT = 1  # RFCOMM default port

server_sock = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
server_sock.connect((DEVICE_ADDRESS, PORT))
print(f"Connected to {DEVICE_ADDRESS}")

async def websocket_handler(websocket, path):
    async for message in websocket:
        print(f"Received from Web: {message}")
        server_sock.send(message)
        data = server_sock.recv(1024)
        await websocket.send(f"From btferret: {data.decode()}")

async def main():
    server = await websockets.serve(websocket_handler, "0.0.0.0", 8765)
    await server.wait_closed()

asyncio.run(main())

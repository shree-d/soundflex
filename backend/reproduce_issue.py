import urllib.request
import json
import time

url = "http://127.0.0.1:5000/api/register"
payload = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
}
data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

# Wait a bit for server to settle if needed
time.sleep(2)

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(f"Body: {response.read().decode()}")
except Exception as e:
    print(f"Error: {e}")

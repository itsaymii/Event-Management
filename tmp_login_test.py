import json
import urllib.request
import urllib.error

url = "http://127.0.0.1:8002/api/auth/login/"
payload = {"email": "testuser", "username": "testuser", "password": "test"}
data = json.dumps(payload).encode("utf-8")

req = urllib.request.Request(
    url,
    data=data,
    headers={"Content-Type": "application/json"},
    method="POST",
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode("utf-8", errors="replace")
        print("STATUS", resp.status)
        print(body)
except urllib.error.HTTPError as e:
    body = e.read().decode("utf-8", errors="replace")
    print("STATUS", e.code)
    print(body)
except Exception as e:
    print("ERROR", type(e).__name__, str(e))

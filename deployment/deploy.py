#!/usr/bin/env python3
"""Build the static frontend and deploy it to Vercel (production).

Serves the UI from Vercel; backend calls (/_serverFn, /api, /__l5e) are
proxied to the Lovable Cloud deployment via vercel.json rewrites, so the
Lovable "Edit with Lovable" badge never appears.

Usage: VERCEL_DEPLOY_TOKEN must be set. Run from the project root.
"""
import base64, json, os, shutil, subprocess, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STAGE = "/tmp/vstatic"
PROJECT = "orange-telegram"
DOMAIN = "orange-telegram.vercel.app"
UPSTREAM = "https://botkey-telegram-bridge.lovable.app"
API = "https://api.vercel.com"

def sh(cmd):
    print("+", cmd, flush=True)
    subprocess.run(cmd, shell=True, check=True, cwd=ROOT)

def req(path, method="GET", body=None, params=""):
    url = f"{API}{path}?{params}" if params else f"{API}{path}"
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("Authorization", f"Bearer {os.environ['VERCEL_DEPLOY_TOKEN']}")
    r.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            return json.loads(resp.read() or b"{}")
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:500]); sys.exit(1)

# 1. build
sh("bun run build")
# 2. serve the cloudflare-worker build locally and extract the clean SPA shell
sh("rm -rf /tmp/wdist && mkdir -p /tmp/wdist && cp -r dist/server /tmp/wdist/server && cp -r dist/client /tmp/wdist/client")
subprocess.Popen("cd /tmp/wdist/server && npx wrangler dev --port 4200",
                 shell=True, stdout=open("/tmp/wrangler-deploy.log", "w"), stderr=subprocess.STDOUT)
ok = False
for _ in range(60):
    time.sleep(1)
    try:
        with urllib.request.urlopen("http://localhost:4200/", timeout=5) as r:
            shell = r.read(); ok = True; break
    except Exception:
        pass
if not ok:
    print("wrangler dev failed; see /tmp/wrangler-deploy.log"); sys.exit(1)
open(f"{ROOT}/dist/client/index.html", "wb").write(shell)
subprocess.run("pkill -f 'wrangler dev --port 4200'", shell=True)

# 3. stage
sh(f"rm -rf {STAGE} && mkdir -p {STAGE} && cp -r {ROOT}/dist/client/. {STAGE}/ && rm -f {STAGE}/_headers")
json.dump({"rewrites": [
    {"source": "/__l5e/:path*", "destination": f"{UPSTREAM}/__l5e/:path*"},
    {"source": "/_serverFn/:path*", "destination": f"{UPSTREAM}/_serverFn/:path*"},
    {"source": "/api/:path*", "destination": f"{UPSTREAM}/api/:path*"},
    {"source": "/:path*", "destination": "/index.html"},
]}, open(f"{STAGE}/vercel.json", "w"))

# 4. deploy
user = req("/v2/user"); uid = user["user"]["id"]
teams = req("/v2/teams")["teams"]
tid = next((t["id"] for t in teams if t.get("createdBy") == uid), "")
params = f"teamId={tid}&" if tid else ""
files = []
for dirpath, _, names in os.walk(STAGE):
    for n in names:
        full = os.path.join(dirpath, n)
        data = open(full, "rb").read()
        files.append({"file": os.path.relpath(full, STAGE), "data": base64.b64encode(data).decode(), "encoding": "base64"})
dep = req("/v13/deployments", "POST", {"name": PROJECT, "files": files, "target": "production", "projectSettings": {"framework": None}}, params.rstrip("&"))
did = dep["id"]; print("deployment:", dep.get("url"), did, flush=True)
for _ in range(120):
    time.sleep(3)
    d = req(f"/v13/deployments/{did}", params=params.rstrip("&"))
    st = d.get("readyState")
    if st != "BUILDING" and st != "INITIALIZING":
        print("state:", st)
        if st != "READY": sys.exit(1)
        break
    print("state:", st, flush=True)
try:
    req(f"/v2/deployments/{did}/alias", "POST", {"target": DOMAIN}, params.rstrip("&"))
    print("aliased:", DOMAIN)
except SystemExit:
    print("auto-alias assumed (production target)")

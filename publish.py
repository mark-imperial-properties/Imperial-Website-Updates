"""Create or update a website article through the RealtyWare Websites API.

    RW_SESSION=<session id> python3 publish.py create <key>
    RW_SESSION=<session id> python3 publish.py update <key> [field ...]

The session id is private: pass it in RW_SESSION, never commit it.
The API token is added by the cloud environment's network secret for nova.realtyware.net.
Before an update, the live article is compared with the copy from the last pull or publish
(.last/<key>), so a change someone made on the website is never overwritten unseen.
"""
import json, os, sys, urllib.request


def call(api, method, path, body=None):
    base = f"https://nova.realtyware.net/api/v1/{os.environ['RW_SESSION']}/{api['origin']}/websites/{api['website']}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{base}/{path}", data=data, method=method,
                                 headers={"Content-Type": "application/json", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as res:
        return json.loads(res.read() or "null")


def main(action, key, *fields_named):
    manifest = json.load(open("articles.json", encoding="utf-8"))
    api, entry = manifest["_api"], manifest[key]
    fields = {k: v for k, v in entry["fields"].items() if v not in (None, "")}
    body = open(entry["file"], encoding="utf-8", newline="").read()
    last = os.path.join(".last", key)
    if action == "create":
        entry["id"] = call(api, "POST", "articles", {**fields, "body": body})["data"]
        json.dump(manifest, open("articles.json", "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    elif action == "update":
        live = call(api, "GET", f"articles/{entry['id']}")["data"]["body"]
        if os.path.exists(last) and live.rstrip() != open(last, encoding="utf-8", newline="").read().rstrip():
            sys.exit(f"{key}: the live article changed since the last publish; pull and compare first")
        changed = {"body": body, **{k: fields[k] for k in fields_named if k in fields}}
        call(api, "PUT", f"articles/{entry['id']}", changed)
    elif action == "pull":
        open(entry["file"], "w", encoding="utf-8", newline="").write(call(api, "GET", f"articles/{entry['id']}")["data"]["body"])
        body = open(entry["file"], encoding="utf-8", newline="").read()
    else:
        sys.exit("action must be create, update or pull")
    os.makedirs(".last", exist_ok=True)
    open(last, "w", encoding="utf-8", newline="").write(body)
    print(action, key, "done")


main(*sys.argv[1:])

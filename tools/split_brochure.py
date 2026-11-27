"""Split a self-contained brochure (flipbook) into a small page plus files for the CDN.

    python3 tools/split_brochure.py brochures/ip2-10886.html ip2-10886 <cdn base url>

A website article body is limited to about 256,000 characters, so the embedded photos and
fonts move out of the page:
  - each embedded photo becomes its own .webp/.jpg/.png file;
  - the @font-face rules become one .js file that adds them to the page, since the CDN
    takes .js but not font files.
Writes build/<ref>/page.html (the article body) and build/<ref>/files/ (what to upload);
the page refers to the files at <cdn base url>/<file name>.
"""
import base64, hashlib, json, os, re, sys

EXT = {"image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif"}


def main(src, ref, cdn):
    page = open(src, encoding="utf-8").read()
    out = os.path.join("build", ref)
    files = os.path.join(out, "files")
    os.makedirs(files, exist_ok=True)
    names = {}

    def save(data_uri):
        if data_uri in names:
            return names[data_uri]
        mime, b64 = re.match(r"data:([^;]+);base64,(.*)", data_uri, re.S).groups()
        raw = base64.b64decode(b64)
        name = f"brochure-{ref}-{hashlib.sha1(raw).hexdigest()[:10]}.{EXT[mime]}"
        open(os.path.join(files, name), "wb").write(raw)
        names[data_uri] = name
        return name

    # Fonts: move every @font-face rule into one script
    faces = re.findall(r"@font-face\{[^}]*\}", page)
    if faces:
        js = "(function(){var s=document.createElement('style');s.textContent=" + json.dumps("".join(faces)) + ";document.head.appendChild(s)})();\n"
        font_name = f"brochure-{ref}-fonts-{hashlib.sha1(js.encode()).hexdigest()[:10]}.js"
        open(os.path.join(files, font_name), "w", encoding="utf-8").write(js)
        for face in faces:
            page = page.replace(face, "", 1)
        page = page.replace("<style>", f'<script src="{cdn}/{font_name}"></script>\n<style>', 1)

    # Photos: every embedded image, wherever it is (attributes, CSS, the lazy-loading JSON)
    page = re.sub(r"data:image/(?:webp|jpeg|png|gif);base64,[A-Za-z0-9+/=]+",
                  lambda m: f"{cdn}/{save(m.group(0))}", page)

    # The lazy loader decodes data URIs into blobs; let it use plain addresses as they are
    old = "const d=DATA[k]; if(!d) return '';"
    if old in page:
        page = page.replace(old, old + " if(!d.startsWith('data:')) return blobs[k]=d;", 1)

    if re.search(r"data:[a-z]+/[a-z0-9.+-]+;base64,", page):
        sys.exit("an embedded data address is left in the page")
    open(os.path.join(out, "page.html"), "w", encoding="utf-8", newline="").write(page)
    print(json.dumps({"page_chars": len(page), "files": sorted(os.listdir(files))}))


main(*sys.argv[1:])

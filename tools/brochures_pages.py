"""Write the brochures section page in every language from one card list.

    python3 tools/brochures_pages.py

Writes articles/brochures.<lang>.html. To add a brochure, add it to BROCHURES and its
wording to each language in TEXT, then publish the five pages.
"""
import re

CDN = "https://media.realtyware.net/origins/44840e1891b9509a52c739e68c104369/documents"

# Newest first. "property" is the listing's address in each language (the hreflang links on its page).
BROCHURES = [
    {"ref": "ip2-10337", "property": {
        "en": "/en/IP2-10337-villa-port-d-andratx-andratx-006AF2",
        "es": "/es/IP2-10337-villa-puerto-de-andrach-andratx-006AF2",
        "de": "/de/IP2-10337-villa-port-d-andratx-andratx-006AF2",
        "fr": "/fr/IP2-10337-villa-port-d-andratx-andratx-006AF2",
        "ru": "/ru/IP2-10337-port-d-andratx-andratx-mallorca-006AF2"}},
    {"ref": "ip2-10322", "property": {
        "en": "/en/IP2-10322-villa-sol-de-mallorca-calvia-006449",
        "es": "/es/IP2-10322-villa-sol-de-mallorca-calvia-006449",
        "de": "/de/IP2-10322-villa-sol-de-mallorca-calvia-006449",
        "fr": "/fr/IP2-10322-villa-sol-de-mallorca-calvia-006449",
        "ru": "/ru/IP2-10322-sol-de-mallorca-calvia-mallorca-006449"}},
    {"ref": "ip2-10886", "property": {
        "en": "/en/IP2-10886-apartment-nova-santa-ponsa-santa-ponsa-018C41",
        "es": "/es/IP2-10886-apartamento-nova-santa-ponsa-santa-ponsa-018C41",
        "de": "/de/IP2-10886-appartement-nova-santa-ponsa-santa-ponsa-018C41",
        "fr": "/fr/IP2-10886-appartement-nova-santa-ponsa-santa-ponsa-018C41",
        "ru": "/ru/IP2-10886-nova-santa-ponsa-santa-ponsa-calvia-018C41"}},
]

TEXT = {
    "en": {
        "crumbLabel": "Breadcrumb", "home": "Home", "buy": "Buy", "buyPath": "/en/buy", "current": "Brochures",
        "eyebrow": "Exclusive homes · South West Mallorca", "h1": "Property Brochures",
        "lede": "Turn the pages of our brochures for selected homes, with photographs, floor areas, the location and a 3D tour where we have one. Each opens full screen and works on a phone, tablet or computer, and you can print it or save it as a PDF.",
        "open": "Open brochure", "view": "View the property", "alt": "Brochure cover: {}",
        "cards": {
            "ip2-10337": ("Port d'Andratx", "Three Villas Above Port Andratx", "IP2-10337 · Twelve bedrooms · 3,899 m²"),
            "ip2-10322": ("Sol de Mallorca · Calvià", "Frontline Villa", "IP2-10322 · Five bedrooms · Direct sea access"),
            "ip2-10886": ("Nova Santa Ponsa", "Garden Apartment", "IP2-10886 · Two bedrooms · Private garden")}},
    "es": {
        "crumbLabel": "Ruta de navegación", "home": "Inicio", "buy": "Comprar", "buyPath": "/es/comprar", "current": "Folletos",
        "eyebrow": "Propiedades exclusivas · Suroeste de Mallorca", "h1": "Folletos de propiedades",
        "lede": "Hojee nuestros folletos de propiedades seleccionadas, con fotografías, superficies, la ubicación y un recorrido 3D cuando lo hay. Cada folleto se abre a pantalla completa, funciona en el móvil, la tableta o el ordenador, y puede imprimirlo o guardarlo como PDF. Los folletos están en inglés.",
        "open": "Abrir folleto", "view": "Ver la propiedad", "alt": "Portada del folleto: {}",
        "cards": {
            "ip2-10337": ("Port d'Andratx", "Tres villas sobre Port d'Andratx", "IP2-10337 · Doce dormitorios · 3.899 m²"),
            "ip2-10322": ("Sol de Mallorca · Calvià", "Villa en primera línea de mar", "IP2-10322 · Cinco dormitorios · Acceso directo al mar"),
            "ip2-10886": ("Nova Santa Ponsa", "Apartamento con jardín", "IP2-10886 · Dos dormitorios · Jardín privado")}},
    "de": {
        "crumbLabel": "Brotkrümelnavigation", "home": "Startseite", "buy": "Kaufen", "buyPath": "/de/kaufen", "current": "Broschüren",
        "eyebrow": "Exklusive Immobilien · Südwesten Mallorcas", "h1": "Immobilien-Broschüren",
        "lede": "Blättern Sie durch unsere Broschüren zu ausgewählten Immobilien, mit Fotos, Flächenangaben, der Lage und einem 3D-Rundgang, wo es einen gibt. Jede Broschüre öffnet sich im Vollbild, funktioniert auf Smartphone, Tablet und Computer und lässt sich drucken oder als PDF speichern. Die Broschüren sind auf Englisch.",
        "open": "Broschüre öffnen", "view": "Zur Immobilie", "alt": "Titelseite der Broschüre: {}",
        "cards": {
            "ip2-10337": ("Port d'Andratx", "Drei Villen über Port d'Andratx", "IP2-10337 · Zwölf Schlafzimmer · 3.899 m²"),
            "ip2-10322": ("Sol de Mallorca · Calvià", "Villa in erster Meereslinie", "IP2-10322 · Fünf Schlafzimmer · Direkter Zugang zum Meer"),
            "ip2-10886": ("Nova Santa Ponsa", "Gartenwohnung", "IP2-10886 · Zwei Schlafzimmer · Privater Garten")}},
    "fr": {
        "crumbLabel": "Fil d'Ariane", "home": "Accueil", "buy": "Acheter", "buyPath": "/fr/acheter", "current": "Brochures",
        "eyebrow": "Biens d'exception · Sud-ouest de Majorque", "h1": "Brochures immobilières",
        "lede": "Feuilletez nos brochures consacrées à une sélection de biens, avec photos, surfaces, emplacement et visite virtuelle en 3D lorsqu'elle existe. Chaque brochure s'ouvre en plein écran, fonctionne sur téléphone, tablette ou ordinateur, et peut être imprimée ou enregistrée en PDF. Les brochures sont en anglais.",
        "open": "Ouvrir la brochure", "view": "Voir le bien", "alt": "Couverture de la brochure : {}",
        "cards": {
            "ip2-10337": ("Port d'Andratx", "Trois villas au-dessus de Port d'Andratx", "IP2-10337 · Douze chambres · 3 899 m²"),
            "ip2-10322": ("Sol de Mallorca · Calvià", "Villa en front de mer", "IP2-10322 · Cinq chambres · Accès direct à la mer"),
            "ip2-10886": ("Nova Santa Ponsa", "Appartement avec jardin", "IP2-10886 · Deux chambres · Jardin privatif")}},
    "ru": {
        "crumbLabel": "Навигационная цепочка", "home": "Главная", "buy": "Купить", "buyPath": "/ru/kupit", "current": "Брошюры",
        "eyebrow": "Эксклюзивная недвижимость · Юго-запад Майорки", "h1": "Брошюры объектов",
        "lede": "Листайте наши брошюры избранных объектов: фотографии, площади, расположение и 3D-тур, если он есть. Каждая брошюра открывается на весь экран, работает на телефоне, планшете и компьютере, её можно распечатать или сохранить в PDF. Брошюры на английском языке.",
        "open": "Открыть брошюру", "view": "Смотреть объект", "alt": "Обложка брошюры: {}",
        "cards": {
            "ip2-10337": ("Порт-д'Андрач", "Три виллы над Порт-д'Андрачем", "IP2-10337 · Двенадцать спален · 3 899 м²"),
            "ip2-10322": ("Соль-де-Майорка · Кальвия", "Вилла на первой линии моря", "IP2-10322 · Пять спален · Прямой выход к морю"),
            "ip2-10886": ("Нова Санта-Понса", "Апартаменты с садом", "IP2-10886 · Две спальни · Собственный сад")}},
}


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def page(lang):
    t = TEXT[lang]
    cards = []
    for b in BROCHURES:
        where, title, facts = t["cards"][b["ref"]]
        place = where.split(" · ")[0]
        letters = lambda s: re.sub(r"\W", "", s).lower()
        described = title if letters(place)[-6:] in letters(title) else f"{title}, {place}"
        href = f"/brochures/{b['ref']}.html"
        cards.append(f"""      <article class="wsBrochureCard">
        <a class="wsBrochureCover" href="{href}" target="_blank" rel="noopener">
          <img src="{CDN}/brochure-{b['ref']}-cover.jpg" alt="{esc(t['alt'].format(described))}" width="811" height="1147" loading="lazy">
        </a>
        <span class="wsBrochureWhere">{esc(where)}</span>
        <h2><a href="{href}" target="_blank" rel="noopener">{esc(title)}</a></h2>
        <p class="wsBrochureFacts">{esc(facts)}</p>
        <p class="wsBrochureLinks">
          <a class="wsBtnIp wsBtnIpGold" href="{href}" target="_blank" rel="noopener">{esc(t['open'])}</a>
          <a class="wsBrochureProperty" href="{b['property'][lang]}">{esc(t['view'])}</a>
        </p>
      </article>
""")
    return f"""<nav class="wsBreadcrumbRow" aria-label="{esc(t['crumbLabel'])}">
  <div class="wsContainer">
    <ol>
      <li><a href="/{lang}">{esc(t['home'])}</a></li>
      <li><a href="{t['buyPath']}">{esc(t['buy'])}</a></li>
      <li aria-current="page">{esc(t['current'])}</li>
    </ol>
  </div>
</nav>
<header class="wsPageHeader">
  <div class="wsContainer">
    <span class="wsEyebrow">{esc(t['eyebrow'])}</span>
    <h1>{esc(t['h1'])}</h1>
    <div class="wsIpLede">
      <p>{esc(t['lede'])}</p>
    </div>
  </div>
</header>

<section class="wsIpSection wsIpSectionTight">
  <div class="wsContainer">
    <div class="wsBrochureGrid">

{chr(10).join(cards)}
    </div>
  </div>
</section>
"""


for lang in TEXT:
    open(f"articles/brochures.{lang}.html", "w", encoding="utf-8", newline="").write(page(lang))
print("written:", ", ".join(f"articles/brochures.{lang}.html" for lang in TEXT))

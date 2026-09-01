#!/usr/bin/env python3
"""
Stamp every page in src/pages/ into a standalone static HTML file at the repo
root, using the shared chrome in src/_layout.html.

Why this exists: the site is deliberately plain HTML/CSS/JS with no runtime
dependency and no deploy-time build. But a real multi-page site still needs
one header, one footer and one set of meta-tag rules — copy-pasting those
across a dozen files is how nav links rot. So the shared chrome lives in the
layout, each page carries only its own content, and this script joins them.

The output is committed, so deploying is still "point a static host at this
folder". Run this after editing src/, never edit the root .html files by hand.

    python3 tools/build.py
"""

import datetime
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
PAGES = SRC / "pages"
SITE = "https://edincardvending.com"

FRONT_MATTER = re.compile(r"^\s*<!--META\s*(\{.*?\})\s*-->\s*", re.DOTALL)


def read_page(path):
    """Split a page fragment into its JSON front matter and its body."""
    raw = path.read_text(encoding="utf-8")
    match = FRONT_MATTER.match(raw)
    if not match:
        sys.exit("%s: missing <!--META {...}--> front matter block" % path.name)
    try:
        meta = json.loads(match.group(1))
    except json.JSONDecodeError as err:
        sys.exit("%s: front matter is not valid JSON (%s)" % (path.name, err))
    for key in ("title", "description"):
        if not meta.get(key):
            sys.exit("%s: front matter needs a %r" % (path.name, key))
    return meta, raw[match.end():].rstrip() + "\n"


def canonical_for(slug):
    return SITE + "/" if slug == "index" else "%s/%s.html" % (SITE, slug)


def mark_active_nav(html, slug):
    """Flag the nav item for the page being rendered, in both navs."""
    return html.replace(
        'data-nav="%s"' % slug,
        'data-nav="%s" class="is-active" aria-current="page"' % slug,
    )


def build():
    layout = (SRC / "_layout.html").read_text(encoding="utf-8")
    year = str(datetime.date.today().year)
    written = []

    for path in sorted(PAGES.glob("*.html")):
        slug = path.stem
        meta, body = read_page(path)

        jsonld = ""
        for name in meta.get("schema", []):
            schema_file = SRC / "schema" / (name + ".json")
            if not schema_file.exists():
                sys.exit("%s: no schema file src/schema/%s.json" % (path.name, name))
            jsonld += '<script type="application/ld+json">\n%s\n</script>\n' % (
                schema_file.read_text(encoding="utf-8").strip()
            )

        html = layout
        html = html.replace("{{TITLE}}", meta["title"])
        html = html.replace("{{DESCRIPTION}}", meta["description"])
        html = html.replace("{{CANONICAL}}", canonical_for(slug))
        html = html.replace(
            "{{ROBOTS}}",
            '<meta name="robots" content="noindex">' if meta.get("noindex") else "",
        )
        html = html.replace("{{JSONLD}}", jsonld.rstrip())
        html = html.replace(
            "{{BODYCLASS}}",
            ' class="%s"' % meta["body_class"] if meta.get("body_class") else "",
        )
        html = html.replace("{{YEAR}}", year)
        html = html.replace("{{BODY}}", body)
        html = mark_active_nav(html, meta.get("nav", slug))

        leftover = re.search(r"\{\{[A-Z_]+\}\}", html)
        if leftover:
            sys.exit("%s: unreplaced placeholder %s" % (path.name, leftover.group(0)))

        (ROOT / (slug + ".html")).write_text(html, encoding="utf-8")
        written.append((slug, meta))

    write_sitemap(written)
    print("Built %d pages + sitemap.xml" % len(written))


def write_sitemap(pages):
    today = datetime.date.today().isoformat()
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for slug, meta in sorted(pages, key=lambda p: -p[1].get("priority", 0.5)):
        if meta.get("noindex"):
            continue
        lines += [
            "  <url>",
            "    <loc>%s</loc>" % canonical_for(slug),
            "    <lastmod>%s</lastmod>" % today,
            "    <changefreq>%s</changefreq>" % meta.get("changefreq", "monthly"),
            "    <priority>%.1f</priority>" % meta.get("priority", 0.5),
            "  </url>",
        ]
    lines.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    build()

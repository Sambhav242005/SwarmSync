"""Validate the buildless GitHub Pages artifact without third-party dependencies."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1] / 'docs' / 'site'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.references = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate id: {attrs['id']}"
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if key in attrs:
                self.references.append(attrs[key])

for source in ROOT.rglob('*.html'):
    page = Page()
    page.feed(source.read_text(encoding='utf-8-sig'))
    for reference in page.references:
        url = urlsplit(reference)
        if url.scheme or url.netloc:
            continue
        assert not url.path.startswith('/'), f'Root-relative URL breaks project Pages: {reference}'
        if not url.path:
            assert not url.fragment or unquote(url.fragment) in page.ids, f'Missing anchor: {reference}'
            continue
        target = (source.parent / unquote(url.path)).resolve()
        assert target.is_relative_to(ROOT.resolve()), f'Outside artifact: {reference}'
        assert target.exists(), f'Missing local asset: {reference}'
assert (ROOT / 'index.html').stat().st_size > 0
assert (ROOT / 'styles.css').stat().st_size > 0
assert (ROOT / '.nojekyll').exists()
print('Project page: local assets, anchors, duplicate IDs and project-relative paths passed')

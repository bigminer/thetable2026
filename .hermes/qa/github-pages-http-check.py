#!/usr/bin/env python3
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from concurrent.futures import ThreadPoolExecutor, as_completed
import json, ssl, time

BASE='https://bigminer.github.io/thetable2026/'
OUT='/home/gary/dev/github/thetable2026/.hermes/qa/github-pages-http-results.json'
PATHS=['','leadership/','ask/','series/','series/the-good-book/','podcast/scripture-more-than-a-book-luke-2425-27/','new-here/','our-story/','our-vision/','plan-your-visit/','what-sundays-are-like/','contact-us/','meetups/','kids-youth/','service-times-locations/']
ctx=ssl.create_default_context()

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.assets=[]; self.h1=[]; self.title=''; self._in_title=False; self._in_h1=False
    def handle_starttag(self, tag, attrs):
        d=dict(attrs)
        if tag=='title': self._in_title=True
        if tag=='h1': self._in_h1=True
        if tag=='a' and d.get('href'): self.links.append(d['href'])
        if tag in ('img','script','source','video','audio') and d.get('src'): self.assets.append((tag,d['src']))
        if tag=='link' and d.get('href') and d.get('rel') and any(r in ('stylesheet','icon','preload','modulepreload') for r in d.get('rel').split()): self.assets.append((tag,d['href']))
    def handle_endtag(self, tag):
        if tag=='title': self._in_title=False
        if tag=='h1': self._in_h1=False
    def handle_data(self, data):
        if self._in_title: self.title += data
        if self._in_h1: self.h1.append(data.strip())

def fetch(url, method='GET'):
    try:
        req=Request(url, method=method, headers={'User-Agent':'Hermes QA crawler'})
        with urlopen(req, context=ctx, timeout=20) as r:
            body=r.read(500000) if method!='HEAD' else b''
            return {'url':url,'status':r.status,'content_type':r.headers.get('content-type',''),'location':r.headers.get('location'),'bytes':len(body),'body':body.decode('utf-8','replace') if body else ''}
    except HTTPError as e:
        return {'url':url,'status':e.code,'content_type':e.headers.get('content-type',''),'location':e.headers.get('location'),'bytes':0,'body':''}
    except Exception as e:
        return {'url':url,'status':None,'error':repr(e),'bytes':0,'body':''}

pages=[]; resources=set(); internal_links=set(); external_links=set(); unbased=[]
for path in PATHS:
    url=urljoin(BASE,path)
    res=fetch(url)
    p=Parser();
    if res.get('body'): p.feed(res['body'])
    page={'path':path or '/', 'url':url, 'status':res.get('status'), 'content_type':res.get('content_type'), 'title':p.title.strip(), 'h1':' '.join(x for x in p.h1 if x).strip(), 'links':p.links, 'assets':p.assets}
    pages.append(page)
    for tag, src in p.assets:
        absu=urljoin(url, src); resources.add(absu)
        if src.startswith('/') and not src.startswith('/thetable2026/'):
            unbased.append({'page':url,'tag':tag,'src':src,'absolute':absu})
    for href in p.links:
        absu=urljoin(url, href)
        pr=urlparse(absu)
        if pr.scheme in ('http','https'):
            if pr.netloc=='bigminer.github.io': internal_links.add(absu.split('#')[0])
            else: external_links.add(absu.split('#')[0])

# Check internal links only within GitHub Pages origin; cap external to key CTAs separately.
check_urls=sorted(resources | internal_links)
checked=[]
with ThreadPoolExecutor(max_workers=16) as ex:
    futs={ex.submit(fetch,u,'HEAD'):u for u in check_urls}
    for fut in as_completed(futs):
        r=fut.result(); checked.append({k:v for k,v in r.items() if k!='body'})

# Probe likely unbased equivalent routes/assets that often break GitHub Pages deployments.
probes=['https://bigminer.github.io/leadership/','https://bigminer.github.io/ask/','https://bigminer.github.io/series/','https://bigminer.github.io/assets/index.css','https://bigminer.github.io/favicon.svg']
probe_results=[{k:v for k,v in fetch(u,'HEAD').items() if k!='body'} for u in probes]

out={'base':BASE,'pages':pages,'checked':checked,'unbased_assets':unbased,'external_links_sample':sorted(external_links)[:200],'probe_results':probe_results,'generated_at':time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
with open(OUT,'w') as f: json.dump(out,f,indent=2)
print(json.dumps({
 'pages':[{k:p[k] for k in ('path','status','title','h1')} for p in pages],
 'broken_checked':[r for r in checked if not (200 <= (r.get('status') or 0) < 400)][:80],
 'unbased_assets':unbased[:20],
 'probe_results':probe_results,
 'external_count':len(external_links), 'resource_count':len(resources), 'internal_count':len(internal_links)
}, indent=2))

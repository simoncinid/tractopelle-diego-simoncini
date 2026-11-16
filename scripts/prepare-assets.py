import json,urllib.request,urllib.parse,pathlib,concurrent.futures
r=json.load(open('research/reference.json')); jobs=[]
for i in r[1]['images']:
 path=urllib.parse.parse_qs(urllib.parse.urlparse(i['src']).query)['url'][0]
 jobs.append(('https://tractopellemusic.com'+path,'public/assets/'+path.split('/')[-1]))
for i in r[0]['images']:
 if i['alt'].startswith('Pochette'):
  u=urllib.parse.parse_qs(urllib.parse.urlparse(i['src']).query)['url'][0]
  jobs.append((u,'public/assets/'+u.split('/')[-1]+'.jpg'))
for name,file in [('archivo','c214ffb7f5362987-s.p.woff2'),('plex','d3ebbfd689654d3a-s.p.woff2')]:jobs.append(('https://tractopellemusic.com/_next/static/media/'+file,'public/assets/'+name+'.woff2'))
def download(x):
 try:urllib.request.urlretrieve(*x)
 except Exception as e:print(x[1],str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(download,jobs))

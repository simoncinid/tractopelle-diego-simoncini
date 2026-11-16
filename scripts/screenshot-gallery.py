from pathlib import Path
from html import escape
root=Path('screenshots')
sections=[]
for folder,title in [('original','Sito originale · riferimento verificato'),('demo','Demo iniziale · homepage, sezioni e interazioni'),('futuristic','Evoluzione 3D · italiano e francese'),('entrances','Animazioni · caricamento e scroll'),('assistant','Tracto AI · conversazione e contatto simulato')]:
 cards=[]
 for p in sorted((root/folder).glob('*.png')):
  rel=p.relative_to(root).as_posix();name=p.stem.replace('-',' ')
  cards.append(f'<a class="card" href="{escape(rel)}" target="_blank"><div class="preview"><img src="{escape(rel)}" alt="{escape(name)}" loading="lazy"></div><span>{escape(name)} ↗</span></a>')
 sections.append(f'<section id="{folder}"><h2>{title}</h2><div class="grid">'+''.join(cards)+'</div></section>')
html='''<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tractopelle · screenshot completi</title><style>*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#050507;color:#fff;font:15px/1.6 system-ui,sans-serif;padding:36px clamp(18px,4vw,60px)}h1{font-size:clamp(28px,5vw,60px);line-height:1.05;letter-spacing:-.05em;margin:20px 0}h2{font-size:24px;margin:45px 0 24px}p{color:#aaa;max-width:75ch}nav{display:flex;gap:20px;margin-top:25px}a{color:#ccff00;text-decoration:none}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:20px}.card{border:1px solid #303035;border-radius:14px;overflow:hidden;display:block;color:#fff}.card:hover{border-color:#ccff00}.preview{height:330px;overflow:hidden;background:#14141c}.preview img{width:100%;height:auto;display:block}.card span{display:block;padding:14px;font-size:12px}small{color:#ccff00;font-size:11px;letter-spacing:.12em}</style><small>TRACTOPELLE MUSIK · ARCHIVIO VISIVO</small><h1>Il riferimento.<br>La proposta.</h1><p>Screenshot integrali acquisiti con Chrome e Playwright il 16 novembre 2026. Le anteprime mostrano l’inizio di ogni pagina: clicca per aprire il PNG completo. Concept indipendente, dimostrazione non ufficiale.</p><nav><a href="#original">Sito originale ↓</a><a href="#demo">Demo iniziale ↓</a><a href="#futuristic">Evoluzione 3D ↓</a><a href="demo/verification.json">Risultati verifica ↗</a></nav>'''+''.join(sections)+'</html>'
(root/'index.html').write_text(html)

import re,json,csv,unicodedata,math,collections
OLD='old/'  # wp_lca.txt: the wikitext of Wikipedia's "List of dialling codes in New Zealand"
t=open(OLD+'wp_lca.txt').read()
reg=json.load(open('nad_geo.json'))
REG={}
for ac,code,car,st,lica in reg:
    if st=='assigned' and lica and lica!='Not In Use': REG[(ac,code)]=lica
def lica_of(ac,p):
    s=collections.Counter()
    for (a,c),l in REG.items():
        if a==ac and (c.startswith(p) or p.startswith(c)): s[l]+= (10 if len(c)==3 else 1)
    return s
norm=lambda s: re.sub(r'[^a-z ]','',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode()).strip()
rows=[]
sec=re.split(r'\n==\s*Area code[^\n]*?(\d)\s*==',t)
for i in range(1,len(sec),2):
    ac='0'+sec[i]
    cur=None
    for r in sec[i+1].split('|-')[1:]:
        cells=[c.strip() for c in re.split(r'\n\||\|\|', r) if c.strip()]
        cells=[re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', c) for c in cells]
        cells=[re.sub(r'^\|?\s*rowspan="\d+"\s*\|\s*','',c).strip() for c in cells]
        cells=[c for c in cells if c and c!='}' and not c.startswith('!') and c not in('yoza','AK')]
        cells=[c.split('\n')[0].strip() for c in cells]
        if len(cells)<2: continue
        nums=cells[-1]
        if not re.match(r'^[\d, (except)and]+$',nums.replace('}','').strip()):
            continue
        if len(cells)>=3: cur=cells[0]; towns=cells[1]
        else: towns=cells[0]
        if len(cells)==2 and not re.search(r'\d',cells[0]) and cur is None: cur=cells[0]
        rows.append((ac,cur,towns,re.findall(r'\d+',nums.split('(')[0])))
# geonames
G=collections.defaultdict(list)
for l in open('NZ.txt'):
    f=l.rstrip('\n').split('\t')
    if f[6] not in('P','L','S','T','H','A'): continue
    names={f[1],f[2]}|set(f[3].split(','))
    for n in names:
        n=norm(n)
        if n: G[n].append((float(f[4]),float(f[5]),f[6],f[7],int(f[14] or 0),f[1]))
lca=json.load(open('onenz_lca.json'))
out=[]
for ac,cur,towns,nums in rows:
    if 'general' in towns.lower(): continue
    L=collections.Counter()
    for p in nums: L+=lica_of(ac,p)
    if not L: continue
    lica,share=L.most_common(1)[0][0], L.most_common(1)[0][1]/sum(L.values())
    for tn in re.split(r',|&| and ',re.sub(r'\(.*?\)','',towns)):
        tn=tn.strip()
        if not tn: continue
        out.append(dict(ac=ac,wp=cur,town=tn,nums=nums,lica=lica,share=round(share,2),cands=[c for c in G.get(norm(tn),[])]))
json.dump(out,open('towns.json','w'))
print(len(rows),len(out), sum(1 for o in out if not o['cands']))
print([o['town'] for o in out if not o['cands']])
print([(o['town'],o['wp'],o['lica'],o['share']) for o in out if o['share']<0.99][:60])

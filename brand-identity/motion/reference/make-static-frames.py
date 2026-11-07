import math, random
W,H,R=1280,640,38
dx,dy=R*math.sqrt(3),R*1.5
def V(cx,cy): return [(cx+R*math.cos(math.radians(60*i-30)),cy+R*math.sin(math.radians(60*i-30))) for i in range(6)]
cells=[];edges={}
for j in range(-1,int(H/dy)+2):
    for i in range(-1,int(W/dx)+2):
        cx=i*dx+(dx/2 if j%2 else 0);cy=j*dy
        vs=V(cx,cy);cells.append((i,j,cx,cy,vs))
        for k in range(6):
            a=tuple(round(c,1) for c in vs[k]);b=tuple(round(c,1) for c in vs[(k+1)%6])
            edges[frozenset((a,b))]=(a,b)
adj={}
for a,b in edges.values():
    adj.setdefault(a,[]).append(b);adj.setdefault(b,[]).append(a)
BG='<defs><radialGradient id="bg" cx="50%%" cy="35%%" r="80%%"><stop offset="0" stop-color="#0A1C4A"/><stop offset="1" stop-color="#030A1F"/></radialGradient>%s</defs><rect width="100%%" height="100%%" fill="url(#bg)"/>'
def grid(op=.10,fill=None):
    s=''
    for i,j,cx,cy,vs in cells:
        p=" ".join(f"{x:.1f},{y:.1f}" for x,y in vs)
        s+=f'<polygon points="{p}" fill="{fill or "none"}" stroke="rgba(238,241,248,{op})" stroke-width="1"/>'
    return s
def flash():
    random.seed(4);s=grid()
    pick=[(8,4,.17),(15,2,.10),(4,6,.06),(11,7,.03),(19,5,.12)]
    for i,j,a in pick:
        for ci,cj,cx,cy,vs in cells:
            if (ci,cj)==(i,j):
                p=" ".join(f"{x:.1f},{y:.1f}" for x,y in vs)
                s+=f'<polygon points="{p}" fill="rgba(240,179,94,{a})" stroke="rgba(240,179,94,{min(1,a*3)})" stroke-width="1.2"/>'
    return BG%'' + s
def walk(start,n,seed,bias=1):
    random.seed(seed);path=[start];prev=None
    for _ in range(n):
        c=path[-1];opts=[v for v in adj[c] if v!=prev] or adj[c]
        # prefer continuing direction slightly rightwards for a readable shape
        nxt=random.choice(sorted(opts,key=lambda v:-(v[0]-c[0])*bias+random.random()*30)[:2]);prev=c;path.append(nxt)
    return path
def beam(path,tail,blur=7,base=1.0):
    s='';n=len(path)-1
    seg=''
    for k in range(n):
        t=(k+1)/n; a=(.08+.92*t**1.3)*base
        (x1,y1),(x2,y2)=path[k],path[k+1]
        seg+=f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#F0B35E" stroke-opacity="{a:.2f}" stroke-width="{2+4*t:.1f}" stroke-linecap="round"/>'
    core=''
    for k in range(n):
        t=(k+1)/n;a=(.05+.95*t**1.4)
        (x1,y1),(x2,y2)=path[k],path[k+1]
        core+=f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#FFE9C4" stroke-opacity="{a:.2f}" stroke-width="{1+1.2*t:.1f}" stroke-linecap="round"/>'
    hx,hy=path[-1]
    return f'<g filter="url(#bl{blur})">{seg}</g>{core}<circle cx="{hx}" cy="{hy}" r="3.2" fill="#FFF3DC"/><circle cx="{hx}" cy="{hy}" r="14" fill="#F0B35E" opacity=".35" filter="url(#bl6)"/>'
FIL='<filter id="bl7" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter><filter id="bl6"><feGaussianBlur stdDeviation="6"/></filter><filter id="bl3"><feGaussianBlur stdDeviation="3"/></filter>'
def edge():
    # find start vertex near left-middle
    st=min(adj,key=lambda v:(v[0]-60)**2+(v[1]-250)**2)
    p=walk(st,38,11)
    p2=walk(min(adj,key=lambda v:(v[0]-650)**2+(v[1]-120)**2),30,5)
    return BG%FIL+grid(.09)+beam(p,0)+f'<g opacity=".55">{beam(p2,0,base=.7)}</g>'
def pulse():
    srcs=[(500,300,230,.8),(960,420,150,.4)]
    defs=''
    for k,(x,y,r,a) in enumerate(srcs):
        defs+=f'<radialGradient id="pl{k}" gradientUnits="userSpaceOnUse" cx="{x}" cy="{y}" r="{r*1.5}"><stop offset="0" stop-color="#FFD9A0" stop-opacity="{a}"/><stop offset=".25" stop-color="#F0B35E" stop-opacity="{a*.6}"/><stop offset=".6" stop-color="#F0B35E" stop-opacity="{a*.12}"/><stop offset="1" stop-color="#F0B35E" stop-opacity="0"/></radialGradient>'
    # edges only
    es=''.join(f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}"/>' for a,b in edges.values())
    # tiles dark, covering light source: draw glow (blurred edges) then dark faces slightly inset
    tiles=''
    for i,j,cx,cy,vs in cells:
        c=[(cx+(x-cx)*.93,cy+(y-cy)*.93) for x,y in vs]
        tiles+='<polygon points="'+" ".join(f"{x:.1f},{y:.1f}" for x,y in c)+'" />'
    halo=''.join(f'<circle cx="{x}" cy="{y}" r="{r*1.1}" fill="#F0B35E" opacity="{.10*a}" filter="url(#bigb)"/>' for x,y,r,a in srcs)
    s=BG%(FIL+'<filter id="bigb" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>'+defs)
    s+=halo
    for k in range(len(srcs)):
        s+=f'<g stroke="url(#pl{k})" stroke-width="6" stroke-linecap="round" filter="url(#bl6)" opacity=".7" fill="none">{es}</g>'
        s+=f'<g stroke="url(#pl{k})" stroke-width="1.4" stroke-linecap="round" fill="none">{es}</g>'
    s+=f'<g fill="#050E2B" fill-opacity=".92" stroke="none">{tiles}</g>'
    return s
def wrap(inner,label,sub):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H+90}" width="{W}" height="{H+90}"><rect width="100%" height="100%" fill="#030A1F"/>'
      f'<svg y="0" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{inner}</svg>'
      f'<text x="40" y="{H+42}" font-family="Satoshi,Inter,sans-serif" font-weight="700" font-size="30" fill="#EEF1F8">{label}</text>'
      f'<text x="40" y="{H+72}" font-family="Inter,sans-serif" font-size="17" fill="#9AA6C6">{sub}</text></svg>')
for n,f,l,sbt in [("1_flash",flash,"1 · Tile flash","Random tiles softly light up and fade"),
  ("2_beam",edge,"2 · Edge beam","A soft comet follows the connected hexagon edges, slow and unhurried"),
  ("3_pulse",pulse,"3 · Pulsating edge light","A light source behind the grid; only the edges glow, brightest near the source")]:
    open(f"{n}.svg","w").write(wrap(f(),l,sbt))

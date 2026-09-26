from pathlib import Path
import json, re
from urllib.parse import urlparse

ROOT = Path('/home/ubuntu/omniv-cso')
REPORTS = ROOT / '.research'
OUT = ROOT / 'supabase/migrations/20260926_editorial_seed.sql'

ENTITY_META = {
    'omniv': ('company', 'Omniv', 'A discovery and publishing network for people, entities, and ideas', 'Global', 'Omniv connects publications, identities, and the systems behind them so people can discover what matters next.'),
    'united-states': ('project', 'United States', 'The United States in the world system', 'Washington, D.C.', 'A political and economic power whose alliances, technology policy, finance, and military reach shape the international system.'),
    'china': ('project', 'China', 'China’s state, market, and technology system', 'Beijing, China', 'A major economic and technological power whose industrial policy and global relationships shape trade, security, and supply chains.'),
    'taiwan': ('project', 'Taiwan', 'The island at the center of advanced semiconductor manufacturing', 'Taiwan', 'A self-governing democracy and critical technology hub whose position makes it central to the U.S.–China relationship.'),
    'japan': ('project', 'Japan', 'A technology, finance, and security power in Asia', 'Tokyo, Japan', 'An advanced economy whose industrial capacity, alliance choices, and geography matter far beyond its size.'),
    'north-korea': ('project', 'North Korea', 'A nuclear-armed state with a changing external network', 'Pyongyang, North Korea', 'A highly isolated state whose military, diplomatic, and economic relationships affect security in Northeast Asia.'),
    'russia': ('project', 'Russia', 'A nuclear power reshaping its external relationships', 'Moscow, Russia', 'A major military and energy power whose war, diplomacy, and partnerships are changing the strategic map.'),
    'tsmc': ('company', 'TSMC', 'The world’s leading dedicated semiconductor foundry', 'Hsinchu, Taiwan', 'A semiconductor manufacturer whose specialized capacity is central to the global technology supply chain.'),
    'nvidia': ('company', 'Nvidia', 'Computing platforms for accelerated and artificial intelligence workloads', 'Santa Clara, USA', 'A leading designer of accelerated computing hardware and software used across data centers and AI systems.'),
    'huawei': ('company', 'Huawei', 'Telecommunications and technology infrastructure', 'Shenzhen, China', 'A major technology company operating across telecommunications, devices, cloud, and digital infrastructure.'),
    'semiconductors': ('project', 'Semiconductors', 'The components beneath modern computing', 'Global', 'A globally distributed industry spanning design, equipment, materials, fabrication, packaging, and testing.'),
    'artificial-intelligence': ('project', 'Artificial Intelligence', 'Systems that turn data and computation into prediction and generation', 'Global', 'A field whose infrastructure, models, rules, and uses are becoming central to economic and geopolitical competition.'),
    'rare-earths': ('project', 'Rare Earths', 'Critical minerals and the processing capacity behind modern technology', 'Global', 'A group of elements whose extraction and processing support industrial, energy, defense, and technology supply chains.'),
    'global-supply-chains': ('project', 'Global Supply Chains', 'The networks that move inputs, components, and products across borders', 'Global', 'The distributed systems of suppliers, logistics, standards, capital, and skills that make modern production possible.'),
}

ARTICLE_META = {
 '01-us-china': ('WORLD', '2026-09-26T09:00:00Z'), '02-japan': ('POWER', '2026-09-26T08:00:00Z'), '03-russia-north-korea': ('POWER', '2026-09-25T09:00:00Z'),
 '04-epstein-files': ('PEOPLE', '2026-09-25T08:00:00Z'), '05-putin-north-korea': ('POWER', '2026-09-24T09:00:00Z'), '06-taiwan': ('TECHNOLOGY', '2026-09-24T08:00:00Z'),
 '07-chip-war': ('TECHNOLOGY', '2026-09-23T09:00:00Z'), '08-china-supply-chain': ('MONEY', '2026-09-23T08:00:00Z'), '09-two-tech-systems': ('EXPLAINED', '2026-09-22T09:00:00Z'),
}

LABELS = {k:v[1] for k,v in ENTITY_META.items()}

def sql(s):
    return "'" + str(s).replace("'", "''") + "'"

def parse_report(path):
    text = path.read_text()
    fm, rest = text.split('---', 2)[1:]
    meta = {}
    current = None
    for line in fm.strip().splitlines():
        if line.startswith('  - '):
            meta.setdefault(current, []).append(line[4:].strip())
        elif ':' in line:
            k,v = line.split(':',1); current=k.strip(); v=v.strip()
            if v.startswith('['): meta[current] = [x.strip() for x in v.strip('[]').split(',') if x.strip()]
            elif v: meta[current] = v
            else: meta[current] = []
    lines = rest.strip().splitlines()
    title = next(x[2:].strip() for x in lines if x.startswith('# '))
    title_i = lines.index('# ' + title)
    subtitle = ''
    subtitle_i = title_i + 1
    while subtitle_i < len(lines) and not lines[subtitle_i].strip():
        subtitle_i += 1
    if subtitle_i < len(lines) and lines[subtitle_i].strip().startswith('*'):
        subtitle = lines[subtitle_i].strip().strip('*').strip()
        body_lines = lines[subtitle_i + 1:]
    else:
        body_lines = lines[title_i + 1:]
    def section(name):
        marker = '## ' + name
        try: start = body_lines.index(marker)+1
        except ValueError: return []
        end = len(body_lines)
        for i in range(start, len(body_lines)):
            if body_lines[i].startswith('## '): end=i; break
        return body_lines[start:end]
    def clean_paras(ls):
        blocks=[]; buf=[]
        for line in ls:
            if not line.strip():
                if buf: blocks.append(' '.join(x.strip() for x in buf)); buf=[]
            elif line.startswith('- '):
                if buf: blocks.append(' '.join(x.strip() for x in buf)); buf=[]
                blocks.append(line[2:].strip())
            else: buf.append(line)
        if buf: blocks.append(' '.join(x.strip() for x in buf))
        return [x for x in blocks if x]
    content=[]
    end_marker = next((i for i,x in enumerate(body_lines) if x in ('## What this means','## The question nobody asks','## Keep exploring','## Sources')), len(body_lines))
    pre = body_lines[:end_marker]
    buf=[]
    for line in pre:
        if line.startswith('## '):
            if buf:
                content.append({'type':'paragraph','text':' '.join(x.strip() for x in buf)}); buf=[]
            content.append({'type':'heading','text':line[3:].strip(),'level':2})
        elif not line.strip():
            if buf:
                content.append({'type':'paragraph','text':' '.join(x.strip() for x in buf)}); buf=[]
        elif line.startswith('- '):
            if buf:
                content.append({'type':'paragraph','text':' '.join(x.strip() for x in buf)}); buf=[]
            content.append({'type':'list','items':[line[2:].strip()]})
        else: buf.append(line)
    if buf: content.append({'type':'paragraph','text':' '.join(x.strip() for x in buf)})
    # merge adjacent list blocks
    merged=[]
    for b in content:
        if b['type']=='list' and merged and merged[-1]['type']=='list': merged[-1]['items'] += b['items']
        else: merged.append(b)
    sources=[]
    for line in section('Sources'):
        m=re.match(r'\[(\d+)\]:\s+(\S+)\s+"(.*)"', line)
        if m:
            sources.append({'name': urlparse(m.group(2)).netloc.replace('www.', ''), 'title':m.group(3),'url':m.group(2)})
    what=' '.join(clean_paras(section('What this means')))
    question=' '.join(clean_paras(section('The question nobody asks')))
    first_para=next((b['text'] for b in merged if b['type']=='paragraph'), subtitle)
    words=sum(len(re.findall(r"\b[\w’'-]+\b", x)) for x in body_lines if not x.startswith('## '))
    return {'meta':meta,'title':title,'subtitle':subtitle,'content':merged,'sources':sources,'what':what,'question':question,'summary':first_para[:240].rstrip()+('…' if len(first_para)>240 else ''),'reading':max(1,round(words/220))}

out=['-- Omniv initial editorial library: nine source-checked, public articles and graph entities.','-- Generated from .research/*.md; re-runnable because every entity and publication is keyed by slug.','begin;']
for slug,(typ,name,tagline,location,about) in ENTITY_META.items():
    out.append(f"insert into public.discovery_entities (type, slug, name, tagline, location, about, tags, heat, published_at) values ({sql(typ)}, {sql(slug)}, {sql(name)}, {sql(tagline)}, {sql(location)}, {sql(about)}, ARRAY['editorial','omniv'], 90, '2026-09-20T00:00:00Z') on conflict (type, slug) do update set name=excluded.name, tagline=excluded.tagline, location=excluded.location, about=excluded.about, tags=excluded.tags, updated_at=now();")
for slug,(category,published) in ARTICLE_META.items():
    r=parse_report(REPORTS/(slug+'.md')); m=r['meta']; entities=m.get('entity_slugs',[]); related=m.get('related_slugs',[])
    refs=[{'type':ENTITY_META[e][0],'slug':e,'label':LABELS[e]} for e in entities if e in ENTITY_META]
    tags=[category.lower()]+[e.replace('-',' ') for e in entities[:5]]
    content=json.dumps(r['content'], ensure_ascii=False, separators=(',',':'))
    sources=json.dumps(r['sources'], ensure_ascii=False, separators=(',',':'))
    refs_json=json.dumps(refs, ensure_ascii=False, separators=(',',':'))
    related_sql="'{}'::text[]"
    pub_ent=entities[0] if entities else 'united-states'
    out.append("insert into public.discovery_publications (publisher_id, publisher_name, type, slug, title, summary, body, subtitle, excerpt, content, category_id, reading_time, status, seo_title, seo_description, canonical_url, sources, what_this_means, question_nobody_asks, entity_refs, related_publication_ids, tags, meta, heat, published_at) values ("+
      f"(select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv', 'article', {sql(slug)}, {sql(r['title'])}, {sql(r['summary'])}, {sql('')}, {sql(r['subtitle'])}, {sql(r['summary'])}, {sql(content)}::jsonb, {sql(category)}, {r['reading']}, 'published', {sql(r['title']+' | Omniv')}, {sql(r['summary'])}, {sql('https://omniv.media/p/'+slug)}, {sql(sources)}::jsonb, {sql(r['what'])}, {sql(r['question'])}, {sql(refs_json)}::jsonb, {related_sql}, ARRAY[{', '.join(sql(x) for x in tags)}], {sql(str(r['reading'])+' min read')}, 90, {sql(published)}) on conflict (slug) do update set publisher_id=excluded.publisher_id, publisher_name=excluded.publisher_name, title=excluded.title, summary=excluded.summary, subtitle=excluded.subtitle, excerpt=excluded.excerpt, content=excluded.content, category_id=excluded.category_id, reading_time=excluded.reading_time, status='published', seo_title=excluded.seo_title, seo_description=excluded.seo_description, canonical_url=excluded.canonical_url, sources=excluded.sources, what_this_means=excluded.what_this_means, question_nobody_asks=excluded.question_nobody_asks, entity_refs=excluded.entity_refs, related_publication_ids=excluded.related_publication_ids, tags=excluded.tags, meta=excluded.meta, heat=excluded.heat, published_at=excluded.published_at, updated_at=now();")
for slug,(category,published) in ARTICLE_META.items():
    related = parse_report(REPORTS/(slug+'.md'))['meta'].get('related_slugs', [])
    related_sql="array["+', '.join(f"(select id::text from public.discovery_publications where slug={sql(x)})" for x in related)+"]::text[]" if related else "'{}'::text[]"
    out.append(f"update public.discovery_publications set related_publication_ids={related_sql}, updated_at=now() where slug={sql(slug)};")
out.append('commit;')
OUT.write_text('\n'.join(out)+'\n')
print(f'generated {OUT} with {len(ARTICLE_META)} articles and {len(ENTITY_META)} entities')

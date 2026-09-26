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
    'south-korea': ('project', 'South Korea', 'A semiconductor and manufacturing power in Northeast Asia', 'Seoul, South Korea', 'A major technology, manufacturing, and security power whose industries and alliance choices shape the region.'),
    'robotics': ('project', 'Robotics', 'Machines that sense, decide, and act in the physical world', 'Global', 'A field connecting software, sensors, components, manufacturing, and applied artificial intelligence.'),
    'manufacturing': ('project', 'Manufacturing', 'The industrial systems that turn inputs into products', 'Global', 'The network of factories, workers, tools, materials, and processes behind modern production.'),
    'ukraine': ('project', 'Ukraine', 'A country at the center of Europe’s security crisis', 'Kyiv, Ukraine', 'A sovereign state whose war with Russia has reshaped European security, military supply, and diplomacy.'),
    'military': ('project', 'Military', 'The institutions and capabilities that organize armed force', 'Global', 'The doctrines, personnel, technology, logistics, and political decisions that shape conflict and deterrence.'),
    'trade': ('project', 'Trade', 'The movement of goods, services, capital, and rules across borders', 'Global', 'The commercial relationships and policy choices that connect economies and create leverage.'),
    'infrastructure': ('project', 'Infrastructure', 'The physical and digital systems economies depend on', 'Global', 'The networks of transport, energy, communications, water, and logistics that make production and society possible.'),
    'jeffrey-epstein': ('person', 'Jeffrey Epstein', 'A convicted sex offender at the center of a large public records archive', 'United States', 'A person whose criminal cases, death in custody, and associated records are documented in official and court materials.'),
    'us-justice-department': ('project', 'U.S. Justice Department', 'The federal department responsible for enforcing U.S. law', 'Washington, D.C.', 'The U.S. federal department whose prosecutions, investigations, and records are central to the article’s documented institutional history.'),
    'congress': ('project', 'Congress', 'The legislative branch of the United States', 'Washington, D.C.', 'The U.S. legislature responsible for the transparency law discussed in the article.'),
    'ghislaine-maxwell': ('person', 'Ghislaine Maxwell', 'A person convicted in federal court for sex-trafficking-related crimes', 'United States', 'A person whose conviction is a distinct judicial finding and should not be generalized to every person named in related records.'),
    'iran': ('project', 'Iran', 'A regional power connected to changing security and energy networks', 'Tehran, Iran', 'A state whose security, energy, and diplomatic relationships shape the broader network around Russia and North Korea.'),
    'energy': ('project', 'Energy', 'The fuels, electricity, and systems that power economies', 'Global', 'The production, transport, and security of energy resources and infrastructure.'),
    'sanctions': ('project', 'Sanctions', 'Economic and diplomatic restrictions used as statecraft', 'Global', 'The legal restrictions, monitoring systems, and evasion networks used to change state behavior.'),
    'cxmt': ('company', 'CXMT', 'A Chinese memory semiconductor manufacturer', 'Hefei, China', 'A Chinese semiconductor company associated with the development of domestic memory-chip capability.'),
    'data-centres': ('project', 'Data Centres', 'The facilities that turn electricity and hardware into computing capacity', 'Global', 'The buildings, networks, power systems, and cooling infrastructure behind cloud computing and AI.'),
    'india': ('project', 'India', 'A major economy and technology power in South Asia', 'New Delhi, India', 'A large and growing economy whose technology, manufacturing, and strategic choices shape the future global system.'),
    'critical-minerals': ('project', 'Critical Minerals', 'Materials essential to technology, energy, and industry', 'Global', 'Minerals whose supply, processing, and substitution timelines can shape industrial resilience and strategic competition.'),
}

ARTICLE_META = {
 '01-us-china': ('WORLD', '2026-09-26T09:00:00Z'), '02-japan': ('POWER', '2026-09-26T08:00:00Z'), '03-russia-north-korea': ('POWER', '2026-09-25T09:00:00Z'),
 '04-epstein-files': ('PEOPLE', '2026-09-25T08:00:00Z'), '05-putin-north-korea': ('POWER', '2026-09-24T09:00:00Z'), '06-taiwan': ('TECHNOLOGY', '2026-09-24T08:00:00Z'),
 '07-chip-war': ('TECHNOLOGY', '2026-09-23T09:00:00Z'), '08-china-supply-chain': ('MONEY', '2026-09-23T08:00:00Z'), '09-two-tech-systems': ('EXPLAINED', '2026-09-22T09:00:00Z'),
}

ARTICLE_GRAPH = {
    '01-us-china': (['united-states','china','japan','taiwan','artificial-intelligence','semiconductors','global-supply-chains'], ['06-taiwan','07-chip-war','09-two-tech-systems','02-japan','08-china-supply-chain']),
    '02-japan': (['japan','united-states','china','north-korea','south-korea','semiconductors','robotics','manufacturing'], ['01-us-china','06-taiwan','07-chip-war','09-two-tech-systems','03-russia-north-korea']),
    '03-russia-north-korea': (['russia','north-korea','china','ukraine','military','trade','infrastructure'], ['05-putin-north-korea','01-us-china','02-japan','09-two-tech-systems','06-taiwan']),
    '04-epstein-files': (['jeffrey-epstein','united-states','us-justice-department','congress','ghislaine-maxwell'], []),
    '05-putin-north-korea': (['russia','north-korea','china','iran','energy','sanctions','trade'], ['03-russia-north-korea','01-us-china','02-japan','06-taiwan','09-two-tech-systems']),
    '06-taiwan': (['taiwan','china','united-states','tsmc','semiconductors','artificial-intelligence','japan'], ['01-us-china','02-japan','07-chip-war','08-china-supply-chain','09-two-tech-systems']),
    '07-chip-war': (['semiconductors','artificial-intelligence','nvidia','huawei','china','united-states','rare-earths','data-centres'], ['01-us-china','06-taiwan','08-china-supply-chain','09-two-tech-systems','02-japan']),
    '08-china-supply-chain': (['china','huawei','cxmt','rare-earths','semiconductors','manufacturing','artificial-intelligence','united-states'], ['01-us-china','06-taiwan','07-chip-war','09-two-tech-systems','02-japan']),
    '09-two-tech-systems': (['united-states','china','taiwan','japan','india','artificial-intelligence','semiconductors','critical-minerals','global-supply-chains'], ['01-us-china','06-taiwan','07-chip-war','08-china-supply-chain','02-japan']),
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
    r=parse_report(REPORTS/(slug+'.md')); m=r['meta']; entities, related = ARTICLE_GRAPH.get(slug, (m.get('entity_slugs',[]), m.get('related_slugs',[])))
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
    related = ARTICLE_GRAPH.get(slug, ([], parse_report(REPORTS/(slug+'.md'))['meta'].get('related_slugs', [])))[1]
    related_sql="array["+', '.join(f"(select id::text from public.discovery_publications where slug={sql(x)})" for x in related)+"]::text[]" if related else "'{}'::text[]"
    out.append(f"update public.discovery_publications set related_publication_ids={related_sql}, updated_at=now() where slug={sql(slug)};")
out.append('commit;')
OUT.write_text('\n'.join(out)+'\n')
print(f'generated {OUT} with {len(ARTICLE_META)} articles and {len(ENTITY_META)} entities')

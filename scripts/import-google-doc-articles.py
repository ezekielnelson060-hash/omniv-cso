#!/usr/bin/env python3
"""Generate an Omniv article migration from /tmp/omniv-source-doc.json.

The source document is user-supplied. This importer preserves its wording and
labels the result as Omniv Editorial analysis; it does not invent outside
citations or imply independent reporting.
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from datetime import datetime, timezone

SOURCE = Path("/tmp/omniv-source-doc.json")
OUT = Path("supabase/migrations/20260929_google_doc_editorial_library.sql")

ARTICLE_TITLES = [
    "1. Why Putin Still Has Leverage After Four Years of War",
    "2. How Russia's Economy Has Adapted to Sanctions",
    "3. The Russia–China Relationship Is Bigger Than Ukraine",
    "4. Why Russia Wants a Stronger Relationship With North Korea",
    "5. What Putin Actually Wants From Negotiations",
    "6. Russia's Shadow Fleet: How Oil Keeps Moving Around Sanctions",
    "7. How Drones Changed Modern Warfare",
    "06 — WHY TAIWAN SITS AT THE CENTER OF THE U.S.–CHINA RELATIONSHIP",
    "07 — THE CHIP WAR ISN'T REALLY ABOUT CHIPS",
    "08 — WHY CHINA WANTS CONTROL OF MORE OF THE TECHNOLOGY SUPPLY CHAIN",
    "09 — WHAT HAPPENS IF THE WORLD SPLITS INTO TWO TECHNOLOGY SYSTEMS?",
    "The Physical Internet: What Exists Behind the Cloud",
    "3. The New Geography of Computing",
    "4. What Happens When Countries Start Treating Data Like Oil?",
    "5. The Infrastructure Wars Nobody Is Talking About",
    "6. AI Is Not Just a Software Revolution",
    "7. The Race to Control the AI Infrastructure Layer",
    "8. Why AI Needs More Than Better Models",
    "9. Who Actually Makes Money When AI Becomes Cheaper?",
    "10. The Coming Battle Over AI Compute",
    "11. Why Data Centers May Matter More Than AI Startups",
    "12. What Happens When Intelligence Becomes Cheap?",
    "13. The AI Companies Building the Models vs. the Companies Building Everything Around Them",
    "14. Why Every Country Wants Its Own AI Stack",
    "15. The Geopolitics of Artificial Intelligence",
    "What Actually Makes an Asset Valuable?",
    "Why Infrastructure Attracts Long-Term Capital",
    "The Difference Between Price and Value",
    "Why Investors Care About Cash Flow",
    "What Makes a Market Attractive?",
    "1. Stop Looking for Ideas. Look for Problems.",
    "2. The Best Businesses Often Begin With Something Broken",
    "Why Entrepreneurs Should Study Infrastructure",
    "1. What We Still Don't Understand About the Brain",
    "2. The Race to Understand Aging",
    "3. Why Quantum Computing Is So Difficult",
    "4. What Happens When Biology Becomes Programmable?",
    "5. The New Race for Space",
    "1. The New Solo-Founder Economy",
    "2. What AI Changed About Starting a Company",
    "3. Why Africa Could Produce a Different Kind of Startup",
    "4. The Startup Ideas Hiding Inside Broken Infrastructure",
    "5. What Investors Actually Mean When They Say \"Moat\"",
    "6. Why Timing Matters More Than Most Founders Admit",
]

# These already exist as independently sourced editorial seed articles. The
# migration leaves their stronger source lists and canonical content intact.
EXISTING_SOURCED = {
    "06 — WHY TAIWAN SITS AT THE CENTER OF THE U.S.–CHINA RELATIONSHIP",
    "07 — THE CHIP WAR ISN'T REALLY ABOUT CHIPS",
    "08 — WHY CHINA WANTS CONTROL OF MORE OF THE TECHNOLOGY SUPPLY CHAIN",
    "09 — WHAT HAPPENS IF THE WORLD SPLITS INTO TWO TECHNOLOGY SYSTEMS?",
}

ENTITY_DEFS = [
    ("project", "russia", "Russia", "Russia's state, economy, military and foreign-policy system.", ["geopolitics", "energy", "security"]),
    ("project", "ukraine", "Ukraine", "Ukraine's state, society and security context in the Omniv editorial library.", ["geopolitics", "security"]),
    ("project", "north-korea", "North Korea", "North Korea's political, military and economic system.", ["geopolitics", "security"]),
    ("project", "global-supply-chains", "Global Supply Chains", "The networks that move energy, components, capital and industrial capacity across borders.", ["trade", "infrastructure"]),
    ("project", "artificial-intelligence", "Artificial Intelligence", "The systems, models and infrastructure behind machine intelligence.", ["technology", "AI"]),
    ("project", "data-centres", "Data Centres", "The physical facilities that turn computing demand into usable capacity.", ["technology", "infrastructure"]),
    ("project", "infrastructure", "Infrastructure", "The physical and digital systems that make economies and products possible.", ["infrastructure", "investment"]),
    ("project", "startups", "Startups", "New companies, markets and operating models examined through an editorial lens.", ["entrepreneurship", "business"]),
    ("project", "investing", "Investing", "The discipline of understanding assets, cash flow, risk and long-term value.", ["money", "capital"]),
    ("project", "quantum-computing", "Quantum Computing", "A developing computing paradigm with demanding hardware and error-correction constraints.", ["technology", "science"]),
    ("project", "biology", "Biology", "The science and engineering of living systems.", ["science", "health"]),
    ("project", "space", "Space", "The orbital, launch, sensing and data infrastructure beyond Earth.", ["science", "technology"]),
    ("project", "africa", "Africa", "A continent-wide context for markets, infrastructure, demographics and company building.", ["Africa", "markets"]),
    ("project", "brain-science", "Brain Science", "Research questions around cognition, consciousness, memory and aging.", ["science", "health"]),
]


def normalize(s: str) -> str:
    return re.sub(r"\s+", " ", s.replace("\u2013", "–").strip()).casefold()


def slugify(s: str) -> str:
    s = s.lower().replace("–", "-").replace("—", "-").replace("’", "'")
    s = re.sub(r"^\d+[.]?\s*", "", s)
    s = s.replace("'", "")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:78]


def sql_text(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def sql_json(value) -> str:
    raw = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return sql_text(raw) + "::jsonb"


def article_category(title: str) -> str:
    t = title.casefold()
    if any(x in t for x in ["putin", "russia", "ukraine", "north korea", "drones"]):
        return "WORLD"
    if any(x in t for x in ["ai", "computing", "quantum", "biology", "space", "cloud", "data center", "intelligence"]):
        return "TECHNOLOGY"
    if any(x in t for x in ["asset", "infrastructure", "price", "investor", "cash flow", "market attractive"]):
        return "MONEY"
    if any(x in t for x in ["founder", "startup", "business", "moat", "timing", "problem"]):
        return "PEOPLE"
    return "EXPLAINED"


def entity_refs(title: str, text: str):
    hay = (title + " " + text).casefold()
    candidates = [
        ("russia", "Russia", "project", ["russia", "putin", "moscow"]),
        ("ukraine", "Ukraine", "project", ["ukraine", "kyiv"]),
        ("north-korea", "North Korea", "project", ["north korea", "pyongyang"]),
        ("global-supply-chains", "Global Supply Chains", "project", ["supply chain", "sanction", "trade"]),
        ("artificial-intelligence", "Artificial Intelligence", "project", ["ai", "artificial intelligence", "model"]),
        ("data-centres", "Data Centres", "project", ["data center", "data-centre", "compute", "cloud"]),
        ("infrastructure", "Infrastructure", "project", ["infrastructure", "electricity", "cable"]),
        ("startups", "Startups", "project", ["startup", "founder", "entrepreneur", "business"]),
        ("investing", "Investing", "project", ["investor", "asset", "cash flow", "valuation", "capital"]),
        ("quantum-computing", "Quantum Computing", "project", ["quantum"]),
        ("biology", "Biology", "project", ["biology", "cell", "aging"]),
        ("space", "Space", "project", ["space", "orbit", "satellite"]),
        ("africa", "Africa", "project", ["africa", "african"]),
        ("brain-science", "Brain Science", "project", ["brain", "consciousness", "memory"]),
    ]
    out = []
    for slug, label, typ, needles in candidates:
        if any(n in hay for n in needles):
            out.append({"type": typ, "slug": slug, "label": label})
    return out[:8]


def main():
    doc = json.loads(SOURCE.read_text())
    items = []
    for item in doc.get("body", {}).get("content", []):
        p = item.get("paragraph")
        if not p:
            continue
        text = "".join(e.get("textRun", {}).get("content", "") for e in p.get("elements", []))
        text = text.replace("\n", "").strip()
        if not text:
            continue
        style = p.get("paragraphStyle", {}).get("namedStyleType", "NORMAL_TEXT")
        items.append((style, text))
    lookup = {normalize(t): i for i, (_, t) in enumerate(items)}
    starts = []
    for title in ARTICLE_TITLES:
        idx = lookup.get(normalize(title))
        if idx is None:
            raise SystemExit(f"Missing article heading: {title}")
        starts.append((idx, title))
    starts.sort()
    rows = []
    for pos, (start, title) in enumerate(starts):
        if title in EXISTING_SOURCED:
            continue
        end = starts[pos + 1][0] if pos + 1 < len(starts) else len(items)
        body_items = items[start + 1:end]
        content = []
        plain = []
        for style, text in body_items:
            if style == "HEADING_2":
                content.append({"type": "heading", "text": text, "level": 2})
            elif style == "HEADING_3":
                content.append({"type": "heading", "text": text, "level": 3})
            elif style == "HEADING_1":
                content.append({"type": "heading", "text": text, "level": 2})
            else:
                content.append({"type": "paragraph", "text": text})
                plain.append(text)
        if not plain:
            continue
        slug = slugify(title)
        summary = " ".join(plain[:3]).strip()
        if len(summary) > 360:
            summary = summary[:357].rsplit(" ", 1)[0] + "…"
        body_text = "\n\n".join(plain)
        refs = entity_refs(title, body_text)
        # A transparent disclosure is part of the article, not an invented source.
        content.insert(0, {"type": "callout", "title": "Editorial note", "text": "This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."})
        rows.append({
            "slug": slug,
            "title": re.sub(r"^\d+[.]\s*", "", title).title() if title.isupper() else re.sub(r"^\d+[.]\s*", "", title),
            "summary": summary,
            "body": body_text,
            "content": content,
            "category": article_category(title),
            "refs": refs,
            "tags": [article_category(title).lower()] + [r["slug"] for r in refs[:5]],
            "reading": max(1, round(len(body_text.split()) / 200)),
        })
    now = "2026-09-29T09:00:00Z"
    lines = [
        "-- Omniv Editorial library imported from the user-supplied Google Doc.",
        "-- This migration preserves the manuscript and adds an explicit disclosure; it does not invent external citations.",
        "begin;",
        "insert into public.discovery_entities (type, slug, name, tagline, about, tags, links, heat, published_at) values",
    ]
    lines.insert(3, "insert into public.discovery_entities (type, slug, name, tagline, location, about, tags, links, heat, published_at) values ('company', 'omniv-editorial', 'Omniv Editorial', 'Independent analysis on systems, power, technology and opportunity', 'Global', 'Omniv Editorial publishes clearly labelled analysis and explainers. It separates documented fact, attributed claims, analysis and uncertainty, and does not present supplied manuscripts as independent reporting.', '{editorial,analysis,research}', '[{\"label\":\"Website\",\"href\":\"https://omniv.media\"}]'::jsonb, 85, '2026-09-29T09:00:00Z') on conflict (type, slug) do update set name=excluded.name, tagline=excluded.tagline, location=excluded.location, about=excluded.about, tags=excluded.tags, links=excluded.links, heat=excluded.heat, updated_at=now();")
    entity_values = []
    for typ, slug, name, about, tags in ENTITY_DEFS:
        entity_values.append(f"({sql_text(typ)}, {sql_text(slug)}, {sql_text(name)}, {sql_text('Omniv Editorial knowledge graph')}, {sql_text(about)}, {sql_text('{' + ','.join(tags) + '}')}, '[]'::jsonb, 40, {sql_text(now)})")
    lines.append(",\n".join(entity_values) + "\non conflict (type, slug) do update set name=excluded.name, tagline=excluded.tagline, about=excluded.about, tags=excluded.tags, updated_at=now();")
    lines.append("")
    lines.append("insert into public.discovery_publications (publisher_id, publisher_name, type, slug, title, summary, body, subtitle, excerpt, content, category_id, reading_time, status, seo_title, seo_description, canonical_url, sources, what_this_means, question_nobody_asks, entity_refs, related_publication_ids, tags, meta, heat, published_at) values")
    pub_values = []
    for r in rows:
        source_note = [{"name": "Omniv Editorial", "title": "Editorial disclosure and source policy", "url": "https://omniv.media"}]
        pub_values.append("(" + ", ".join([
            "(select id from public.discovery_entities where type='company' and slug='omniv-editorial')",
            sql_text("Omniv Editorial"), sql_text("article"), sql_text(r["slug"]), sql_text(r["title"]), sql_text(r["summary"]), sql_text(r["body"]),
            sql_text("Analysis from the Omniv Editorial desk."), sql_text(r["summary"]), sql_json(r["content"]), sql_text(r["category"]), str(r["reading"]), sql_text("published"),
            sql_text(r["title"] + " | Omniv Editorial"), sql_text(r["summary"]), sql_text("https://omniv.media/p/" + r["slug"]), sql_json(source_note),
            sql_text("This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact."),
            sql_text("Which parts of this argument are documented fact, and which are analysis or uncertainty?"), sql_json(r["refs"]), "'{}'::text[]", sql_text("{" + ",".join(r["tags"]) + "}"), sql_text("Omniv Editorial · analysis"), "50", sql_text(now)
        ]) + ")")
    lines.append(",\n".join(pub_values) + "\non conflict (slug) do update set publisher_id=excluded.publisher_id, publisher_name=excluded.publisher_name, title=excluded.title, summary=excluded.summary, body=excluded.body, subtitle=excluded.subtitle, excerpt=excluded.excerpt, content=excluded.content, category_id=excluded.category_id, reading_time=excluded.reading_time, status='published', seo_title=excluded.seo_title, seo_description=excluded.seo_description, canonical_url=excluded.canonical_url, sources=excluded.sources, what_this_means=excluded.what_this_means, question_nobody_asks=excluded.question_nobody_asks, entity_refs=excluded.entity_refs, tags=excluded.tags, meta=excluded.meta, heat=excluded.heat, published_at=excluded.published_at, updated_at=now();")
    lines.append("commit;")
    OUT.write_text("\n".join(lines) + "\n")
    print(f"Generated {OUT} with {len(rows)} new articles; existing sourced articles preserved: {len(EXISTING_SOURCED)}")

if __name__ == "__main__":
    main()

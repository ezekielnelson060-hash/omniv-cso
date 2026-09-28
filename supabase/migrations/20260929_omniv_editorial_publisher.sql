-- Public publisher identity for the imported Google Doc editorial library.
begin;
insert into public.discovery_entities (type, slug, name, tagline, location, about, tags, links, heat, published_at)
values (
  'company',
  'omniv-editorial',
  'Omniv Editorial',
  'Independent analysis on systems, power, technology and opportunity',
  'Global',
  'Omniv Editorial publishes clearly labelled analysis and explainers. It separates documented fact, attributed claims, analysis and uncertainty, and does not present supplied manuscripts as independent reporting.',
  '{editorial,analysis,research}',
  '[{"label":"Website","href":"https://omniv.media"}]'::jsonb,
  85,
  '2026-09-29T09:00:00Z'
)
on conflict (type, slug) do update set
  name = excluded.name,
  tagline = excluded.tagline,
  location = excluded.location,
  about = excluded.about,
  tags = excluded.tags,
  links = excluded.links,
  heat = excluded.heat,
  updated_at = now();

update public.discovery_publications
set publisher_id = (select id from public.discovery_entities where type = 'company' and slug = 'omniv-editorial'),
    publisher_name = 'Omniv Editorial',
    sources = jsonb_build_array(jsonb_build_object(
      'name', 'Omniv Editorial',
      'title', 'Editorial disclosure and source policy',
      'url', 'https://omniv.media/e/company/omniv-editorial'
    )),
    updated_at = now()
where publisher_name = 'Omniv Editorial'
  and status = 'published'
  and canonical_url like 'https://omniv.media/p/%';
commit;

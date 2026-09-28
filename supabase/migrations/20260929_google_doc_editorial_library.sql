-- Omniv Editorial library imported from the user-supplied Google Doc.
-- This migration preserves the manuscript and adds an explicit disclosure; it does not invent external citations.
begin;
insert into public.discovery_entities (type, slug, name, tagline, about, tags, links, heat, published_at) values
('project', 'russia', 'Russia', 'Omniv Editorial knowledge graph', 'Russia''s state, economy, military and foreign-policy system.', '{geopolitics,energy,security}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'ukraine', 'Ukraine', 'Omniv Editorial knowledge graph', 'Ukraine''s state, society and security context in the Omniv editorial library.', '{geopolitics,security}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'north-korea', 'North Korea', 'Omniv Editorial knowledge graph', 'North Korea''s political, military and economic system.', '{geopolitics,security}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'global-supply-chains', 'Global Supply Chains', 'Omniv Editorial knowledge graph', 'The networks that move energy, components, capital and industrial capacity across borders.', '{trade,infrastructure}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'artificial-intelligence', 'Artificial Intelligence', 'Omniv Editorial knowledge graph', 'The systems, models and infrastructure behind machine intelligence.', '{technology,AI}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'data-centres', 'Data Centres', 'Omniv Editorial knowledge graph', 'The physical facilities that turn computing demand into usable capacity.', '{technology,infrastructure}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'infrastructure', 'Infrastructure', 'Omniv Editorial knowledge graph', 'The physical and digital systems that make economies and products possible.', '{infrastructure,investment}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'startups', 'Startups', 'Omniv Editorial knowledge graph', 'New companies, markets and operating models examined through an editorial lens.', '{entrepreneurship,business}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'investing', 'Investing', 'Omniv Editorial knowledge graph', 'The discipline of understanding assets, cash flow, risk and long-term value.', '{money,capital}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'quantum-computing', 'Quantum Computing', 'Omniv Editorial knowledge graph', 'A developing computing paradigm with demanding hardware and error-correction constraints.', '{technology,science}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'biology', 'Biology', 'Omniv Editorial knowledge graph', 'The science and engineering of living systems.', '{science,health}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'space', 'Space', 'Omniv Editorial knowledge graph', 'The orbital, launch, sensing and data infrastructure beyond Earth.', '{science,technology}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'africa', 'Africa', 'Omniv Editorial knowledge graph', 'A continent-wide context for markets, infrastructure, demographics and company building.', '{Africa,markets}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z'),
('project', 'brain-science', 'Brain Science', 'Omniv Editorial knowledge graph', 'Research questions around cognition, consciousness, memory and aging.', '{science,health}', '[]'::jsonb, 40, '2026-09-29T09:00:00Z')
on conflict (type, slug) do update set name=excluded.name, tagline=excluded.tagline, about=excluded.about, tags=excluded.tags, updated_at=now();

insert into public.discovery_publications (publisher_id, publisher_name, type, slug, title, summary, body, subtitle, excerpt, content, category_id, reading_time, status, seo_title, seo_description, canonical_url, sources, what_this_means, question_nobody_asks, entity_refs, related_publication_ids, tags, meta, heat, published_at) values
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'why-putin-still-has-leverage-after-four-years-of-war', 'Why Putin Still Has Leverage After Four Years of War', 'The battlefield is only one source of power. Four years into Russia’s full-scale invasion of Ukraine, one of the easiest mistakes to make is to measure Vladimir Putin’s leverage by territory alone. How many kilometers has Russia captured?', 'The battlefield is only one source of power.

Four years into Russia’s full-scale invasion of Ukraine, one of the easiest mistakes to make is to measure Vladimir Putin’s leverage by territory alone.

How many kilometers has Russia captured?

How many cities has Ukraine held?

How many tanks have been destroyed?

Those numbers matter.

But they don''t tell the whole story.

Because Putin''s leverage does not come from one thing.

It comes from the combination of military capacity, nuclear deterrence, energy, industrial production, political endurance, relationships with other states and the ability to keep imposing costs on Ukraine and its supporters.

That is why a war can look increasingly expensive for Russia without necessarily eliminating Russia''s ability to continue fighting.

This may be the most important distinction.

Ukraine needs a sustainable path toward security and sovereignty.

Russia can pursue a strategy based on endurance.

That creates a fundamentally different calculation.

Moscow can continue asking:

Can we make the war sufficiently expensive that the other side eventually accepts terms closer to ours?

That does not mean Russia is guaranteed to achieve its objectives.

It means the Kremlin''s negotiating position isn''t determined simply by whether Russia has achieved a decisive breakthrough.

As of September 2026, Russia continues offensive operations while also absorbing Ukrainian attacks deep inside Russian territory. Putin has publicly continued to claim battlefield momentum while simultaneously leaving open the possibility of negotiations under conditions favorable to Moscow.

That combination matters.

Military pressure and diplomatic pressure are not separate strategies.

They can reinforce one another.

Russia also possesses something Ukraine does not:

the world''s largest nuclear arsenal.

Nuclear weapons do not automatically give Russia the ability to achieve conventional military objectives.

But they dramatically change the risk calculation for everyone supporting Ukraine.

The United States and NATO can provide Ukraine with weapons, intelligence and economic assistance.

But NATO countries must continually consider how far they can go without creating a direct Russia-NATO war.

That creates a ceiling around escalation.

And Putin knows it.

The leverage isn''t necessarily:

“Russia will use nuclear weapons.”

It is:

“Everyone has to consider what happens if the conflict crosses certain boundaries.”

That uncertainty itself has strategic value.

The other major source of leverage is endurance.

Western sanctions were designed partly around the assumption that restricting Russia''s access to technology, finance and markets would progressively weaken its ability to wage war.

They have imposed substantial costs.

But Russia has also adapted.

Trade has been redirected.

Supply chains have changed.

Energy exports have found alternative buyers.

Domestic production has expanded in strategically important sectors.

The result isn''t a normal peacetime economy.

It is an economy increasingly structured around war.

And that creates a strange paradox.

An economy can become less efficient while simultaneously becoming more capable of sustaining a war.

Putin''s domestic position also matters.

Russia''s 2026 parliamentary elections reinforced the Kremlin''s political dominance, with United Russia securing a large majority and dozens of war veterans entering the Duma.

That does not mean every Russian supports the war.

It means the Kremlin has retained the political machinery necessary to continue its strategy.

For Ukraine and its allies, this creates a difficult problem.

You cannot simply wait for political collapse in Moscow.

You have to plan around the possibility that the Russian state remains functional.

Russia is also no longer operating in the economic environment it had before 2022.

China has become an increasingly important economic partner.

India has remained a major buyer of Russian energy.

Middle Eastern and Asian networks have become more important to Russian trade.

None of this means Russia has replaced the European market perfectly.

It hasn''t.

But sanctions do not have to fail completely for Russia to survive them.

They only have to fail to produce the desired political outcome.

That distinction is critical.

Not one dramatic event.

It would require changing the underlying calculation.

Russia would need to conclude that continuing the war produces fewer strategic benefits than accepting a settlement.

That can happen through:

military setbacks

economic pressure

declining access to critical technology

rising costs of mobilization

stronger Ukrainian defensive capabilities

changing relationships with Russia''s partners

credible diplomatic alternatives

or some combination of all of them.

The central question is therefore not:

“Is Russia winning?”

It is:

“Can Russia continue imposing enough costs for long enough to make its preferred political outcome more achievable?”

That is a much harder question.

And it explains why the war has lasted this long.

The battlefield determines what is possible.

Endurance determines what is negotiable.

And diplomacy ultimately happens somewhere between the two.', 'Analysis from the Omniv Editorial desk.', 'The battlefield is only one source of power. Four years into Russia’s full-scale invasion of Ukraine, one of the easiest mistakes to make is to measure Vladimir Putin’s leverage by territory alone. How many kilometers has Russia captured?', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"The battlefield is only one source of power."},{"type":"paragraph","text":"Four years into Russia’s full-scale invasion of Ukraine, one of the easiest mistakes to make is to measure Vladimir Putin’s leverage by territory alone."},{"type":"paragraph","text":"How many kilometers has Russia captured?"},{"type":"paragraph","text":"How many cities has Ukraine held?"},{"type":"paragraph","text":"How many tanks have been destroyed?"},{"type":"paragraph","text":"Those numbers matter."},{"type":"paragraph","text":"But they don''t tell the whole story."},{"type":"paragraph","text":"Because Putin''s leverage does not come from one thing."},{"type":"paragraph","text":"It comes from the combination of military capacity, nuclear deterrence, energy, industrial production, political endurance, relationships with other states and the ability to keep imposing costs on Ukraine and its supporters."},{"type":"paragraph","text":"That is why a war can look increasingly expensive for Russia without necessarily eliminating Russia''s ability to continue fighting."},{"type":"heading","text":"Russia does not need to win quickly","level":2},{"type":"paragraph","text":"This may be the most important distinction."},{"type":"paragraph","text":"Ukraine needs a sustainable path toward security and sovereignty."},{"type":"paragraph","text":"Russia can pursue a strategy based on endurance."},{"type":"paragraph","text":"That creates a fundamentally different calculation."},{"type":"paragraph","text":"Moscow can continue asking:"},{"type":"paragraph","text":"Can we make the war sufficiently expensive that the other side eventually accepts terms closer to ours?"},{"type":"paragraph","text":"That does not mean Russia is guaranteed to achieve its objectives."},{"type":"paragraph","text":"It means the Kremlin''s negotiating position isn''t determined simply by whether Russia has achieved a decisive breakthrough."},{"type":"paragraph","text":"As of September 2026, Russia continues offensive operations while also absorbing Ukrainian attacks deep inside Russian territory. Putin has publicly continued to claim battlefield momentum while simultaneously leaving open the possibility of negotiations under conditions favorable to Moscow."},{"type":"paragraph","text":"That combination matters."},{"type":"paragraph","text":"Military pressure and diplomatic pressure are not separate strategies."},{"type":"paragraph","text":"They can reinforce one another."},{"type":"heading","text":"The nuclear shadow","level":2},{"type":"paragraph","text":"Russia also possesses something Ukraine does not:"},{"type":"paragraph","text":"the world''s largest nuclear arsenal."},{"type":"paragraph","text":"Nuclear weapons do not automatically give Russia the ability to achieve conventional military objectives."},{"type":"paragraph","text":"But they dramatically change the risk calculation for everyone supporting Ukraine."},{"type":"paragraph","text":"The United States and NATO can provide Ukraine with weapons, intelligence and economic assistance."},{"type":"paragraph","text":"But NATO countries must continually consider how far they can go without creating a direct Russia-NATO war."},{"type":"paragraph","text":"That creates a ceiling around escalation."},{"type":"paragraph","text":"And Putin knows it."},{"type":"paragraph","text":"The leverage isn''t necessarily:"},{"type":"paragraph","text":"“Russia will use nuclear weapons.”"},{"type":"paragraph","text":"It is:"},{"type":"paragraph","text":"“Everyone has to consider what happens if the conflict crosses certain boundaries.”"},{"type":"paragraph","text":"That uncertainty itself has strategic value."},{"type":"heading","text":"Russia has also adapted","level":2},{"type":"paragraph","text":"The other major source of leverage is endurance."},{"type":"paragraph","text":"Western sanctions were designed partly around the assumption that restricting Russia''s access to technology, finance and markets would progressively weaken its ability to wage war."},{"type":"paragraph","text":"They have imposed substantial costs."},{"type":"paragraph","text":"But Russia has also adapted."},{"type":"paragraph","text":"Trade has been redirected."},{"type":"paragraph","text":"Supply chains have changed."},{"type":"paragraph","text":"Energy exports have found alternative buyers."},{"type":"paragraph","text":"Domestic production has expanded in strategically important sectors."},{"type":"paragraph","text":"The result isn''t a normal peacetime economy."},{"type":"paragraph","text":"It is an economy increasingly structured around war."},{"type":"paragraph","text":"And that creates a strange paradox."},{"type":"paragraph","text":"An economy can become less efficient while simultaneously becoming more capable of sustaining a war."},{"type":"heading","text":"The political calculation","level":2},{"type":"paragraph","text":"Putin''s domestic position also matters."},{"type":"paragraph","text":"Russia''s 2026 parliamentary elections reinforced the Kremlin''s political dominance, with United Russia securing a large majority and dozens of war veterans entering the Duma."},{"type":"paragraph","text":"That does not mean every Russian supports the war."},{"type":"paragraph","text":"It means the Kremlin has retained the political machinery necessary to continue its strategy."},{"type":"paragraph","text":"For Ukraine and its allies, this creates a difficult problem."},{"type":"paragraph","text":"You cannot simply wait for political collapse in Moscow."},{"type":"paragraph","text":"You have to plan around the possibility that the Russian state remains functional."},{"type":"heading","text":"The China factor","level":2},{"type":"paragraph","text":"Russia is also no longer operating in the economic environment it had before 2022."},{"type":"paragraph","text":"China has become an increasingly important economic partner."},{"type":"paragraph","text":"India has remained a major buyer of Russian energy."},{"type":"paragraph","text":"Middle Eastern and Asian networks have become more important to Russian trade."},{"type":"paragraph","text":"None of this means Russia has replaced the European market perfectly."},{"type":"paragraph","text":"It hasn''t."},{"type":"paragraph","text":"But sanctions do not have to fail completely for Russia to survive them."},{"type":"paragraph","text":"They only have to fail to produce the desired political outcome."},{"type":"paragraph","text":"That distinction is critical."},{"type":"heading","text":"So what actually reduces Putin''s leverage?","level":2},{"type":"paragraph","text":"Not one dramatic event."},{"type":"paragraph","text":"It would require changing the underlying calculation."},{"type":"paragraph","text":"Russia would need to conclude that continuing the war produces fewer strategic benefits than accepting a settlement."},{"type":"paragraph","text":"That can happen through:"},{"type":"paragraph","text":"military setbacks"},{"type":"paragraph","text":"economic pressure"},{"type":"paragraph","text":"declining access to critical technology"},{"type":"paragraph","text":"rising costs of mobilization"},{"type":"paragraph","text":"stronger Ukrainian defensive capabilities"},{"type":"paragraph","text":"changing relationships with Russia''s partners"},{"type":"paragraph","text":"credible diplomatic alternatives"},{"type":"paragraph","text":"or some combination of all of them."},{"type":"paragraph","text":"The central question is therefore not:"},{"type":"paragraph","text":"“Is Russia winning?”"},{"type":"paragraph","text":"It is:"},{"type":"paragraph","text":"“Can Russia continue imposing enough costs for long enough to make its preferred political outcome more achievable?”"},{"type":"paragraph","text":"That is a much harder question."},{"type":"paragraph","text":"And it explains why the war has lasted this long."},{"type":"paragraph","text":"The battlefield determines what is possible."},{"type":"paragraph","text":"Endurance determines what is negotiable."},{"type":"paragraph","text":"And diplomacy ultimately happens somewhere between the two."}]'::jsonb, 'WORLD', 4, 'published', 'Why Putin Still Has Leverage After Four Years of War | Omniv Editorial', 'The battlefield is only one source of power. Four years into Russia’s full-scale invasion of Ukraine, one of the easiest mistakes to make is to measure Vladimir Putin’s leverage by territory alone. How many kilometers has Russia captured?', 'https://omniv.media/p/why-putin-still-has-leverage-after-four-years-of-war', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"ukraine","label":"Ukraine"},{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"}]'::jsonb, '{}'::text[], '{world,russia,ukraine,global-supply-chains,artificial-intelligence}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'how-russias-economy-has-adapted-to-sanctions', 'How Russia''s Economy Has Adapted to Sanctions', 'When the first major sanctions arrived after Russia''s full-scale invasion of Ukraine, the expectation in many Western capitals was straightforward: Cut Russia off from capital. Restrict technology.', 'When the first major sanctions arrived after Russia''s full-scale invasion of Ukraine, the expectation in many Western capitals was straightforward:

Cut Russia off from capital.

Restrict technology.

Reduce energy revenue.

Damage industrial capacity.

And eventually make the war harder to sustain.

Something much more complicated happened.

Russia was damaged.

But Russia adapted.

And understanding that adaptation explains why sanctions have not produced the simple economic collapse some expected.

The initial sanctions shock was enormous.

Foreign companies left.

Western financial institutions restricted Russian access.

Central-bank reserves were frozen.

Export controls were introduced.

Technology imports became significantly harder.

Russia faced a serious risk of financial instability.

The Kremlin responded aggressively.

Capital controls were introduced.

Interest rates were raised.

The government supported strategic companies.

And Russia redirected trade toward countries willing to continue doing business with it.

The system stabilized.

That was the beginning of the adaptation.

Russia''s greatest economic advantage remained something the world still needed:

energy.

Europe had been heavily dependent on Russian energy before the invasion.

Replacing those supplies took time.

And even after European restrictions increased, Russian oil did not simply disappear.

It moved.

Some went to India.

Some went to China.

Some moved through complex trading networks.

Some was transferred between vessels.

And some entered markets after being processed elsewhere.

This is where the so-called shadow fleet became important.

Russia didn''t need every Western country to buy Russian oil directly.

It needed enough of the global system to keep the barrels moving.

This is one of the biggest lessons from the sanctions era.

Modern supply chains are interconnected.

A country can stop importing a product directly from Russia while still indirectly interacting with Russian commodities through other markets.

Oil is fungible.

Money is mobile.

Ships change flags.

Companies change ownership structures.

Cargo changes destinations.

That does not make sanctions useless.

It makes enforcement much harder.

China has been central to Russia''s post-2022 economic adjustment.

Trade between the two countries expanded dramatically, while Chinese manufactured goods became increasingly important to Russia.

Cars.

Machinery.

Electronics.

Industrial equipment.

Consumer products.

The relationship isn''t equivalent to Russia becoming economically dependent on China in every respect.

But the direction is unmistakable:

Russia''s economic geography shifted east.

India''s purchases of discounted Russian crude became one of the most visible examples.

The basic logic was simple.

Russia needed buyers.

India wanted affordable energy.

Both sides benefited.

But the arrangement also demonstrated something larger:

sanctions imposed by one group of countries don''t automatically become global sanctions.

The global economy contains alternative markets.

Russia also transformed domestic production around the war.

Factories expanded.

Defense spending increased.

Workers moved into defense-related industries.

Government contracts became a major source of demand.

That can produce strong headline economic numbers while hiding serious structural weaknesses.

A country can experience rising industrial output because it is manufacturing enormous quantities of weapons.

That doesn''t necessarily mean household prosperity is rising at the same rate.

In fact, wartime economies can create exactly the opposite effect.

Russia''s adaptation has not been free.

There are costs.

Imported components can become more expensive.

Alternative suppliers may provide inferior products.

Shipping can cost more.

Insurance becomes harder.

Technology access becomes more complicated.

Labor shortages can increase.

Inflationary pressure can emerge.

And the government may have to spend increasingly large amounts simply to maintain the system.

So the right question isn''t:

“Did sanctions destroy Russia?”

They didn''t.

The better question is:

“How much less efficient has Russia become—and how much longer can it operate that way?”

That is the economic war underneath the military war.

And it may take years to fully measure.', 'Analysis from the Omniv Editorial desk.', 'When the first major sanctions arrived after Russia''s full-scale invasion of Ukraine, the expectation in many Western capitals was straightforward: Cut Russia off from capital. Restrict technology.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"When the first major sanctions arrived after Russia''s full-scale invasion of Ukraine, the expectation in many Western capitals was straightforward:"},{"type":"paragraph","text":"Cut Russia off from capital."},{"type":"paragraph","text":"Restrict technology."},{"type":"paragraph","text":"Reduce energy revenue."},{"type":"paragraph","text":"Damage industrial capacity."},{"type":"paragraph","text":"And eventually make the war harder to sustain."},{"type":"paragraph","text":"Something much more complicated happened."},{"type":"paragraph","text":"Russia was damaged."},{"type":"paragraph","text":"But Russia adapted."},{"type":"paragraph","text":"And understanding that adaptation explains why sanctions have not produced the simple economic collapse some expected."},{"type":"heading","text":"The first shock","level":2},{"type":"paragraph","text":"The initial sanctions shock was enormous."},{"type":"paragraph","text":"Foreign companies left."},{"type":"paragraph","text":"Western financial institutions restricted Russian access."},{"type":"paragraph","text":"Central-bank reserves were frozen."},{"type":"paragraph","text":"Export controls were introduced."},{"type":"paragraph","text":"Technology imports became significantly harder."},{"type":"paragraph","text":"Russia faced a serious risk of financial instability."},{"type":"paragraph","text":"The Kremlin responded aggressively."},{"type":"paragraph","text":"Capital controls were introduced."},{"type":"paragraph","text":"Interest rates were raised."},{"type":"paragraph","text":"The government supported strategic companies."},{"type":"paragraph","text":"And Russia redirected trade toward countries willing to continue doing business with it."},{"type":"paragraph","text":"The system stabilized."},{"type":"paragraph","text":"That was the beginning of the adaptation."},{"type":"heading","text":"Oil was the central problem","level":2},{"type":"paragraph","text":"Russia''s greatest economic advantage remained something the world still needed:"},{"type":"paragraph","text":"energy."},{"type":"paragraph","text":"Europe had been heavily dependent on Russian energy before the invasion."},{"type":"paragraph","text":"Replacing those supplies took time."},{"type":"paragraph","text":"And even after European restrictions increased, Russian oil did not simply disappear."},{"type":"paragraph","text":"It moved."},{"type":"paragraph","text":"Some went to India."},{"type":"paragraph","text":"Some went to China."},{"type":"paragraph","text":"Some moved through complex trading networks."},{"type":"paragraph","text":"Some was transferred between vessels."},{"type":"paragraph","text":"And some entered markets after being processed elsewhere."},{"type":"paragraph","text":"This is where the so-called shadow fleet became important."},{"type":"paragraph","text":"Russia didn''t need every Western country to buy Russian oil directly."},{"type":"paragraph","text":"It needed enough of the global system to keep the barrels moving."},{"type":"heading","text":"The world economy is difficult to divide cleanly","level":2},{"type":"paragraph","text":"This is one of the biggest lessons from the sanctions era."},{"type":"paragraph","text":"Modern supply chains are interconnected."},{"type":"paragraph","text":"A country can stop importing a product directly from Russia while still indirectly interacting with Russian commodities through other markets."},{"type":"paragraph","text":"Oil is fungible."},{"type":"paragraph","text":"Money is mobile."},{"type":"paragraph","text":"Ships change flags."},{"type":"paragraph","text":"Companies change ownership structures."},{"type":"paragraph","text":"Cargo changes destinations."},{"type":"paragraph","text":"That does not make sanctions useless."},{"type":"paragraph","text":"It makes enforcement much harder."},{"type":"heading","text":"China became more important","level":2},{"type":"paragraph","text":"China has been central to Russia''s post-2022 economic adjustment."},{"type":"paragraph","text":"Trade between the two countries expanded dramatically, while Chinese manufactured goods became increasingly important to Russia."},{"type":"paragraph","text":"Cars."},{"type":"paragraph","text":"Machinery."},{"type":"paragraph","text":"Electronics."},{"type":"paragraph","text":"Industrial equipment."},{"type":"paragraph","text":"Consumer products."},{"type":"paragraph","text":"The relationship isn''t equivalent to Russia becoming economically dependent on China in every respect."},{"type":"paragraph","text":"But the direction is unmistakable:"},{"type":"paragraph","text":"Russia''s economic geography shifted east."},{"type":"heading","text":"India became another major outlet","level":2},{"type":"paragraph","text":"India''s purchases of discounted Russian crude became one of the most visible examples."},{"type":"paragraph","text":"The basic logic was simple."},{"type":"paragraph","text":"Russia needed buyers."},{"type":"paragraph","text":"India wanted affordable energy."},{"type":"paragraph","text":"Both sides benefited."},{"type":"paragraph","text":"But the arrangement also demonstrated something larger:"},{"type":"paragraph","text":"sanctions imposed by one group of countries don''t automatically become global sanctions."},{"type":"paragraph","text":"The global economy contains alternative markets."},{"type":"heading","text":"The military economy","level":2},{"type":"paragraph","text":"Russia also transformed domestic production around the war."},{"type":"paragraph","text":"Factories expanded."},{"type":"paragraph","text":"Defense spending increased."},{"type":"paragraph","text":"Workers moved into defense-related industries."},{"type":"paragraph","text":"Government contracts became a major source of demand."},{"type":"paragraph","text":"That can produce strong headline economic numbers while hiding serious structural weaknesses."},{"type":"paragraph","text":"A country can experience rising industrial output because it is manufacturing enormous quantities of weapons."},{"type":"paragraph","text":"That doesn''t necessarily mean household prosperity is rising at the same rate."},{"type":"paragraph","text":"In fact, wartime economies can create exactly the opposite effect."},{"type":"heading","text":"The hidden cost","level":2},{"type":"paragraph","text":"Russia''s adaptation has not been free."},{"type":"paragraph","text":"There are costs."},{"type":"paragraph","text":"Imported components can become more expensive."},{"type":"paragraph","text":"Alternative suppliers may provide inferior products."},{"type":"paragraph","text":"Shipping can cost more."},{"type":"paragraph","text":"Insurance becomes harder."},{"type":"paragraph","text":"Technology access becomes more complicated."},{"type":"paragraph","text":"Labor shortages can increase."},{"type":"paragraph","text":"Inflationary pressure can emerge."},{"type":"paragraph","text":"And the government may have to spend increasingly large amounts simply to maintain the system."},{"type":"paragraph","text":"So the right question isn''t:"},{"type":"paragraph","text":"“Did sanctions destroy Russia?”"},{"type":"paragraph","text":"They didn''t."},{"type":"paragraph","text":"The better question is:"},{"type":"paragraph","text":"“How much less efficient has Russia become—and how much longer can it operate that way?”"},{"type":"paragraph","text":"That is the economic war underneath the military war."},{"type":"paragraph","text":"And it may take years to fully measure."}]'::jsonb, 'WORLD', 3, 'published', 'How Russia''s Economy Has Adapted to Sanctions | Omniv Editorial', 'When the first major sanctions arrived after Russia''s full-scale invasion of Ukraine, the expectation in many Western capitals was straightforward: Cut Russia off from capital. Restrict technology.', 'https://omniv.media/p/how-russias-economy-has-adapted-to-sanctions', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"ukraine","label":"Ukraine"},{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"}]'::jsonb, '{}'::text[], '{world,russia,ukraine,global-supply-chains,artificial-intelligence,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-russia-china-relationship-is-bigger-than-ukraine', 'The Russia–China Relationship Is Bigger Than Ukraine', 'The easiest way to understand Russia and China is to look at Ukraine. It is also one of the easiest ways to misunderstand them. Because the relationship between Moscow and Beijing did not begin with the 2022 invasion.', 'The easiest way to understand Russia and China is to look at Ukraine.

It is also one of the easiest ways to misunderstand them.

Because the relationship between Moscow and Beijing did not begin with the 2022 invasion.

And it probably won''t end when the war eventually does.

Ukraine accelerated something that was already happening:

the strategic separation between Russia and the West.

China and Russia are not natural twins.

China is an industrial superpower with enormous manufacturing capacity and global trade relationships.

Russia is an energy, military and resource power with a much smaller economy.

China wants stability because stability supports trade.

Russia has increasingly demonstrated willingness to accept disruption when it believes strategic interests justify it.

So why cooperate?

Because their interests overlap in several critical areas.

China needs energy.

Russia has enormous energy reserves.

That creates an obvious relationship.

Russian oil and gas have become increasingly important to China''s energy diversification.

For Russia, China provides a massive market at a time when access to European markets has become much more constrained.

That is mutually useful.

The relationship goes beyond oil.

Russia needs industrial goods and technology.

China has enormous manufacturing capacity.

That creates another bridge.

Vehicles.

Electronics.

Machinery.

Consumer goods.

Industrial components.

Even when Western technology becomes harder for Russia to access, alternative supply chains can emerge.

There is another layer.

Both governments oppose what they see as a U.S.-dominated international system.

That doesn''t mean they want exactly the same world.

But they share an interest in increasing strategic autonomy from Washington.

Russia wants a security environment in which NATO has less influence near Russia.

China wants a regional and global environment in which the United States has less ability to constrain Chinese power.

Those goals overlap.

This distinction matters.

Beijing does not simply follow Moscow.

China has its own interests.

It wants Russian energy.

It wants access to Russian resources.

It wants Russia as a strategic partner.

But it also wants to avoid uncontrolled escalation that could damage China''s economy.

That means Beijing can simultaneously deepen relations with Moscow while avoiding unlimited support for every Russian objective.

The relationship is therefore best understood as strategic alignment without complete strategic identity.

The war made the relationship more important.

Western sanctions pushed Russia east.

The war also made China one of the most important external economic relationships available to Moscow.

That creates leverage for Beijing.

But it also creates leverage for Moscow.

China gets a major energy supplier that is increasingly oriented toward Asian markets.

Russia gets a giant economic partner.

Neither side gets everything it wants.

But both have reasons to keep the relationship growing.

Imagine the Ukraine war ended tomorrow.

Would Russia suddenly return to its pre-2022 economic relationship with Europe?

Probably not.

Too much has changed.

Infrastructure has shifted.

Trade relationships have changed.

Political trust has collapsed.

Defense relationships have hardened.

Russia has invested heavily in alternative economic routes.

China has become more important.

That means the Russia-China relationship is not simply a wartime marriage of convenience.

The war accelerated a structural realignment.

And that may prove more consequential than any individual battlefield.', 'Analysis from the Omniv Editorial desk.', 'The easiest way to understand Russia and China is to look at Ukraine. It is also one of the easiest ways to misunderstand them. Because the relationship between Moscow and Beijing did not begin with the 2022 invasion.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"The easiest way to understand Russia and China is to look at Ukraine."},{"type":"paragraph","text":"It is also one of the easiest ways to misunderstand them."},{"type":"paragraph","text":"Because the relationship between Moscow and Beijing did not begin with the 2022 invasion."},{"type":"paragraph","text":"And it probably won''t end when the war eventually does."},{"type":"paragraph","text":"Ukraine accelerated something that was already happening:"},{"type":"paragraph","text":"the strategic separation between Russia and the West."},{"type":"heading","text":"Two countries with different problems","level":2},{"type":"paragraph","text":"China and Russia are not natural twins."},{"type":"paragraph","text":"China is an industrial superpower with enormous manufacturing capacity and global trade relationships."},{"type":"paragraph","text":"Russia is an energy, military and resource power with a much smaller economy."},{"type":"paragraph","text":"China wants stability because stability supports trade."},{"type":"paragraph","text":"Russia has increasingly demonstrated willingness to accept disruption when it believes strategic interests justify it."},{"type":"paragraph","text":"So why cooperate?"},{"type":"paragraph","text":"Because their interests overlap in several critical areas."},{"type":"heading","text":"Energy","level":2},{"type":"paragraph","text":"China needs energy."},{"type":"paragraph","text":"Russia has enormous energy reserves."},{"type":"paragraph","text":"That creates an obvious relationship."},{"type":"paragraph","text":"Russian oil and gas have become increasingly important to China''s energy diversification."},{"type":"paragraph","text":"For Russia, China provides a massive market at a time when access to European markets has become much more constrained."},{"type":"paragraph","text":"That is mutually useful."},{"type":"heading","text":"Technology and manufacturing","level":2},{"type":"paragraph","text":"The relationship goes beyond oil."},{"type":"paragraph","text":"Russia needs industrial goods and technology."},{"type":"paragraph","text":"China has enormous manufacturing capacity."},{"type":"paragraph","text":"That creates another bridge."},{"type":"paragraph","text":"Vehicles."},{"type":"paragraph","text":"Electronics."},{"type":"paragraph","text":"Machinery."},{"type":"paragraph","text":"Consumer goods."},{"type":"paragraph","text":"Industrial components."},{"type":"paragraph","text":"Even when Western technology becomes harder for Russia to access, alternative supply chains can emerge."},{"type":"heading","text":"The geopolitical calculation","level":2},{"type":"paragraph","text":"There is another layer."},{"type":"paragraph","text":"Both governments oppose what they see as a U.S.-dominated international system."},{"type":"paragraph","text":"That doesn''t mean they want exactly the same world."},{"type":"paragraph","text":"But they share an interest in increasing strategic autonomy from Washington."},{"type":"paragraph","text":"Russia wants a security environment in which NATO has less influence near Russia."},{"type":"paragraph","text":"China wants a regional and global environment in which the United States has less ability to constrain Chinese power."},{"type":"paragraph","text":"Those goals overlap."},{"type":"heading","text":"But China isn''t Russia''s ally in the traditional sense","level":2},{"type":"paragraph","text":"This distinction matters."},{"type":"paragraph","text":"Beijing does not simply follow Moscow."},{"type":"paragraph","text":"China has its own interests."},{"type":"paragraph","text":"It wants Russian energy."},{"type":"paragraph","text":"It wants access to Russian resources."},{"type":"paragraph","text":"It wants Russia as a strategic partner."},{"type":"paragraph","text":"But it also wants to avoid uncontrolled escalation that could damage China''s economy."},{"type":"paragraph","text":"That means Beijing can simultaneously deepen relations with Moscow while avoiding unlimited support for every Russian objective."},{"type":"paragraph","text":"The relationship is therefore best understood as strategic alignment without complete strategic identity."},{"type":"heading","text":"Ukraine accelerated the relationship","level":2},{"type":"paragraph","text":"The war made the relationship more important."},{"type":"paragraph","text":"Western sanctions pushed Russia east."},{"type":"paragraph","text":"The war also made China one of the most important external economic relationships available to Moscow."},{"type":"paragraph","text":"That creates leverage for Beijing."},{"type":"paragraph","text":"But it also creates leverage for Moscow."},{"type":"paragraph","text":"China gets a major energy supplier that is increasingly oriented toward Asian markets."},{"type":"paragraph","text":"Russia gets a giant economic partner."},{"type":"paragraph","text":"Neither side gets everything it wants."},{"type":"paragraph","text":"But both have reasons to keep the relationship growing."},{"type":"heading","text":"The bigger question","level":2},{"type":"paragraph","text":"Imagine the Ukraine war ended tomorrow."},{"type":"paragraph","text":"Would Russia suddenly return to its pre-2022 economic relationship with Europe?"},{"type":"paragraph","text":"Probably not."},{"type":"paragraph","text":"Too much has changed."},{"type":"paragraph","text":"Infrastructure has shifted."},{"type":"paragraph","text":"Trade relationships have changed."},{"type":"paragraph","text":"Political trust has collapsed."},{"type":"paragraph","text":"Defense relationships have hardened."},{"type":"paragraph","text":"Russia has invested heavily in alternative economic routes."},{"type":"paragraph","text":"China has become more important."},{"type":"paragraph","text":"That means the Russia-China relationship is not simply a wartime marriage of convenience."},{"type":"paragraph","text":"The war accelerated a structural realignment."},{"type":"paragraph","text":"And that may prove more consequential than any individual battlefield."}]'::jsonb, 'WORLD', 3, 'published', 'The Russia–China Relationship Is Bigger Than Ukraine | Omniv Editorial', 'The easiest way to understand Russia and China is to look at Ukraine. It is also one of the easiest ways to misunderstand them. Because the relationship between Moscow and Beijing did not begin with the 2022 invasion.', 'https://omniv.media/p/the-russia-china-relationship-is-bigger-than-ukraine', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"ukraine","label":"Ukraine"},{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"infrastructure","label":"Infrastructure"}]'::jsonb, '{}'::text[], '{world,russia,ukraine,global-supply-chains,artificial-intelligence,infrastructure}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'why-russia-wants-a-stronger-relationship-with-north-korea', 'Why Russia Wants a Stronger Relationship With North Korea', 'At first glance, the relationship seems strange. Russia is one of the world''s largest countries. North Korea is isolated, heavily sanctioned and economically much smaller.', 'At first glance, the relationship seems strange.

Russia is one of the world''s largest countries.

North Korea is isolated, heavily sanctioned and economically much smaller.

So why would Moscow need Pyongyang?

Because wars create unusual markets.

And North Korea possesses something Russia increasingly values:

industrial capacity dedicated to weapons production, large stocks of ammunition and a government willing to take political risks that many other states will not.

Russia and North Korea had maintained relations for decades.

But the invasion of Ukraine dramatically increased their strategic value to one another.

North Korea could provide ammunition and missiles.

Russia could provide economic, political and potentially military benefits in return.

The relationship deepened rapidly.

In June 2024, Putin visited Pyongyang and signed a Comprehensive Strategic Partnership Treaty with Kim Jong Un.

The treaty includes provisions for military assistance if either country is subjected to armed attack. It entered into force later that year.

That is considerably more serious than ordinary diplomatic cooperation.

The obvious benefit is ammunition.

War consumes ammunition at extraordinary speed.

Artillery shells.

Rockets.

Missiles.

Other military supplies.

North Korea possesses large-scale weapons manufacturing capacity built around exactly this kind of production.

North Korea has also supplied ballistic missiles, according to assessments from governments and researchers. Japan''s 2026 defense assessment says North Korea supplied Russia with weapons and ammunition and dispatched thousands of soldiers.

Then came something even more significant:

North Korean troops.

More than 10,000 North Korean soldiers were sent to Russia, with their involvement in fighting in the Kursk region later acknowledged by both governments.

That changes the relationship.

This is no longer simply:

weapons for money.

It becomes:

military cooperation, battlefield experience and strategic exchange.

This side may ultimately be more consequential.

North Korea wants technology.

It wants economic support.

It wants diplomatic protection.

And it wants military capabilities that can improve the survivability and effectiveness of its armed forces.

The danger for Western and Asian governments is that Russia could provide expertise or technology that helps North Korea improve missile, satellite, drone or other military capabilities.

Japan''s 2026 defense assessment explicitly warns about the possibility of Russian nuclear- and missile-related technology transferring to North Korea.

That would create a feedback loop.

North Korea helps Russia sustain its war.

Russia helps North Korea improve its military.

Both become more capable.

There is another fascinating dimension.

North Korean soldiers who fought alongside Russian forces were exposed to modern battlefield conditions.

Drones.

Electronic warfare.

Artillery coordination.

Surveillance.

Mass drone attacks.

This matters because North Korea has spent decades preparing for a potential conflict on the Korean Peninsula.

Real battlefield experience is something military planners cannot easily manufacture in a training exercise.

Japan''s defense ministry has warned that lessons learned by North Korean forces in Ukraine could eventually spread through the wider North Korean military.

The biggest mistake would be treating Russia-North Korea cooperation as something that disappears when the Ukraine war ends.

The relationship now has its own momentum.

The two countries have established a formal strategic partnership.

North Korea has become increasingly integrated into Russia''s wartime supply system.

And Russia has incentives to maintain access to North Korean military production.

Recent analysis describes the relationship as moving beyond a transactional arms arrangement toward a more institutionalized partnership.

That''s why the relationship matters to Japan, South Korea, China and the United States.

The consequences extend far beyond Europe.', 'Analysis from the Omniv Editorial desk.', 'At first glance, the relationship seems strange. Russia is one of the world''s largest countries. North Korea is isolated, heavily sanctioned and economically much smaller.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"At first glance, the relationship seems strange."},{"type":"paragraph","text":"Russia is one of the world''s largest countries."},{"type":"paragraph","text":"North Korea is isolated, heavily sanctioned and economically much smaller."},{"type":"paragraph","text":"So why would Moscow need Pyongyang?"},{"type":"paragraph","text":"Because wars create unusual markets."},{"type":"paragraph","text":"And North Korea possesses something Russia increasingly values:"},{"type":"paragraph","text":"industrial capacity dedicated to weapons production, large stocks of ammunition and a government willing to take political risks that many other states will not."},{"type":"heading","text":"The relationship changed after 2022","level":2},{"type":"paragraph","text":"Russia and North Korea had maintained relations for decades."},{"type":"paragraph","text":"But the invasion of Ukraine dramatically increased their strategic value to one another."},{"type":"paragraph","text":"North Korea could provide ammunition and missiles."},{"type":"paragraph","text":"Russia could provide economic, political and potentially military benefits in return."},{"type":"paragraph","text":"The relationship deepened rapidly."},{"type":"paragraph","text":"In June 2024, Putin visited Pyongyang and signed a Comprehensive Strategic Partnership Treaty with Kim Jong Un."},{"type":"paragraph","text":"The treaty includes provisions for military assistance if either country is subjected to armed attack. It entered into force later that year."},{"type":"paragraph","text":"That is considerably more serious than ordinary diplomatic cooperation."},{"type":"heading","text":"What Russia gets","level":2},{"type":"paragraph","text":"The obvious benefit is ammunition."},{"type":"paragraph","text":"War consumes ammunition at extraordinary speed."},{"type":"paragraph","text":"Artillery shells."},{"type":"paragraph","text":"Rockets."},{"type":"paragraph","text":"Missiles."},{"type":"paragraph","text":"Other military supplies."},{"type":"paragraph","text":"North Korea possesses large-scale weapons manufacturing capacity built around exactly this kind of production."},{"type":"paragraph","text":"North Korea has also supplied ballistic missiles, according to assessments from governments and researchers. Japan''s 2026 defense assessment says North Korea supplied Russia with weapons and ammunition and dispatched thousands of soldiers."},{"type":"paragraph","text":"Then came something even more significant:"},{"type":"paragraph","text":"North Korean troops."},{"type":"paragraph","text":"More than 10,000 North Korean soldiers were sent to Russia, with their involvement in fighting in the Kursk region later acknowledged by both governments."},{"type":"paragraph","text":"That changes the relationship."},{"type":"paragraph","text":"This is no longer simply:"},{"type":"paragraph","text":"weapons for money."},{"type":"paragraph","text":"It becomes:"},{"type":"paragraph","text":"military cooperation, battlefield experience and strategic exchange."},{"type":"heading","text":"What North Korea gets","level":2},{"type":"paragraph","text":"This side may ultimately be more consequential."},{"type":"paragraph","text":"North Korea wants technology."},{"type":"paragraph","text":"It wants economic support."},{"type":"paragraph","text":"It wants diplomatic protection."},{"type":"paragraph","text":"And it wants military capabilities that can improve the survivability and effectiveness of its armed forces."},{"type":"paragraph","text":"The danger for Western and Asian governments is that Russia could provide expertise or technology that helps North Korea improve missile, satellite, drone or other military capabilities."},{"type":"paragraph","text":"Japan''s 2026 defense assessment explicitly warns about the possibility of Russian nuclear- and missile-related technology transferring to North Korea."},{"type":"paragraph","text":"That would create a feedback loop."},{"type":"paragraph","text":"North Korea helps Russia sustain its war."},{"type":"paragraph","text":"Russia helps North Korea improve its military."},{"type":"paragraph","text":"Both become more capable."},{"type":"heading","text":"The battlefield became a classroom","level":2},{"type":"paragraph","text":"There is another fascinating dimension."},{"type":"paragraph","text":"North Korean soldiers who fought alongside Russian forces were exposed to modern battlefield conditions."},{"type":"paragraph","text":"Drones."},{"type":"paragraph","text":"Electronic warfare."},{"type":"paragraph","text":"Artillery coordination."},{"type":"paragraph","text":"Surveillance."},{"type":"paragraph","text":"Mass drone attacks."},{"type":"paragraph","text":"This matters because North Korea has spent decades preparing for a potential conflict on the Korean Peninsula."},{"type":"paragraph","text":"Real battlefield experience is something military planners cannot easily manufacture in a training exercise."},{"type":"paragraph","text":"Japan''s defense ministry has warned that lessons learned by North Korean forces in Ukraine could eventually spread through the wider North Korean military."},{"type":"heading","text":"This isn''t only about Ukraine","level":2},{"type":"paragraph","text":"The biggest mistake would be treating Russia-North Korea cooperation as something that disappears when the Ukraine war ends."},{"type":"paragraph","text":"The relationship now has its own momentum."},{"type":"paragraph","text":"The two countries have established a formal strategic partnership."},{"type":"paragraph","text":"North Korea has become increasingly integrated into Russia''s wartime supply system."},{"type":"paragraph","text":"And Russia has incentives to maintain access to North Korean military production."},{"type":"paragraph","text":"Recent analysis describes the relationship as moving beyond a transactional arms arrangement toward a more institutionalized partnership."},{"type":"paragraph","text":"That''s why the relationship matters to Japan, South Korea, China and the United States."},{"type":"paragraph","text":"The consequences extend far beyond Europe."}]'::jsonb, 'WORLD', 3, 'published', 'Why Russia Wants a Stronger Relationship With North Korea | Omniv Editorial', 'At first glance, the relationship seems strange. Russia is one of the world''s largest countries. North Korea is isolated, heavily sanctioned and economically much smaller.', 'https://omniv.media/p/why-russia-wants-a-stronger-relationship-with-north-korea', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"ukraine","label":"Ukraine"},{"type":"project","slug":"north-korea","label":"North Korea"},{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"space","label":"Space"}]'::jsonb, '{}'::text[], '{world,russia,ukraine,north-korea,global-supply-chains,artificial-intelligence}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'what-putin-actually-wants-from-negotiations', 'What Putin Actually Wants From Negotiations', 'Every time peace talks appear on the horizon, the same question returns: What does Putin actually want? The answer is more complicated than “Ukraine.”', 'Every time peace talks appear on the horizon, the same question returns:

What does Putin actually want?

The answer is more complicated than “Ukraine.”

Because Russia''s objectives have evolved.

And there is an enormous difference between what a government says it wants publicly, what it needs militarily, and what it might ultimately accept in a settlement.

Russia wants territory.

The Kremlin wants recognition of its control over territory it claims to have annexed.

It wants security guarantees that reduce the possibility of Ukraine becoming deeply integrated into Western military structures.

And it wants a political settlement that prevents Ukraine from becoming an enduring military threat on Russia''s border.

But those are only pieces of the picture.

At the strategic level, Moscow has repeatedly sought a different European security order.

One where Russia has greater influence over its immediate neighborhood.

One where NATO expansion is constrained.

One where Moscow has greater freedom to determine what happens in states it considers part of its strategic sphere.

This is why the conflict is bigger than individual cities.

The fundamental dispute is about who gets to determine Ukraine''s strategic orientation.

Kyiv says Ukrainians should determine that.

Moscow has consistently challenged that premise.

This is another important distinction.

Countries negotiate when they believe negotiations can produce something better than continuing the war.

That doesn''t mean they have abandoned their objectives.

Sometimes negotiations are another form of competition.

Military pressure changes the bargaining position.

Economic pressure changes it.

Alliances change it.

Time changes it.

And then diplomats sit down and negotiate around the resulting balance.

That is why battlefield developments and negotiations often happen simultaneously.

In September 2026, Putin continued to portray Russia as having the upper hand militarily while criticizing Ukraine''s leadership as an acceptable negotiating counterpart. At the same time, he indicated openness to substantive negotiations under conditions he considers meaningful.

That tells us something important.

The Kremlin does not appear to view negotiations simply as an exit from the war.

It views negotiations as another arena in which Russia can pursue its strategic objectives.

There is also a difference between a negotiating position and a final settlement.

A government can begin negotiations with maximal demands precisely because it expects those demands to be negotiated down.

That creates a difficult analytical problem.

If Moscow says:

“We require X, Y and Z.”

We cannot automatically conclude:

“Russia will refuse peace without X, Y and Z.”

Perhaps.

But perhaps those are opening positions.

The only reliable way to know is to observe what happens when actual trade-offs are placed on the table.

This is probably the most important question.

If Russia believes time is on its side, it has less reason to compromise.

If Russia believes its military position is improving, it has less reason to compromise.

If Russia believes Western support for Ukraine is weakening, it has less reason to compromise.

If Russia believes the economic costs of war are becoming unbearable, the calculation changes.

If Russia believes Ukraine is becoming militarily stronger, the calculation changes.

If Russia''s relationship with China or other partners changes, the calculation changes.

In other words:

Putin''s negotiating position is not fixed.

It is a function of the expected future.

And that may be the most important thing to understand about the diplomacy surrounding the war.

The real negotiation isn''t only happening across a table.

It is happening on the battlefield, inside economies, between alliances and inside the calculations of every government involved.

The question isn''t simply what Putin wants today.

It''s:

What does Putin believe he can still get tomorrow?

That is where leverage comes from.', 'Analysis from the Omniv Editorial desk.', 'Every time peace talks appear on the horizon, the same question returns: What does Putin actually want? The answer is more complicated than “Ukraine.”', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"Every time peace talks appear on the horizon, the same question returns:"},{"type":"paragraph","text":"What does Putin actually want?"},{"type":"paragraph","text":"The answer is more complicated than “Ukraine.”"},{"type":"paragraph","text":"Because Russia''s objectives have evolved."},{"type":"paragraph","text":"And there is an enormous difference between what a government says it wants publicly, what it needs militarily, and what it might ultimately accept in a settlement."},{"type":"heading","text":"Start with the obvious","level":2},{"type":"paragraph","text":"Russia wants territory."},{"type":"paragraph","text":"The Kremlin wants recognition of its control over territory it claims to have annexed."},{"type":"paragraph","text":"It wants security guarantees that reduce the possibility of Ukraine becoming deeply integrated into Western military structures."},{"type":"paragraph","text":"And it wants a political settlement that prevents Ukraine from becoming an enduring military threat on Russia''s border."},{"type":"paragraph","text":"But those are only pieces of the picture."},{"type":"heading","text":"Russia''s deeper objective","level":2},{"type":"paragraph","text":"At the strategic level, Moscow has repeatedly sought a different European security order."},{"type":"paragraph","text":"One where Russia has greater influence over its immediate neighborhood."},{"type":"paragraph","text":"One where NATO expansion is constrained."},{"type":"paragraph","text":"One where Moscow has greater freedom to determine what happens in states it considers part of its strategic sphere."},{"type":"paragraph","text":"This is why the conflict is bigger than individual cities."},{"type":"paragraph","text":"The fundamental dispute is about who gets to determine Ukraine''s strategic orientation."},{"type":"paragraph","text":"Kyiv says Ukrainians should determine that."},{"type":"paragraph","text":"Moscow has consistently challenged that premise."},{"type":"heading","text":"Negotiations are not necessarily surrender","level":2},{"type":"paragraph","text":"This is another important distinction."},{"type":"paragraph","text":"Countries negotiate when they believe negotiations can produce something better than continuing the war."},{"type":"paragraph","text":"That doesn''t mean they have abandoned their objectives."},{"type":"paragraph","text":"Sometimes negotiations are another form of competition."},{"type":"paragraph","text":"Military pressure changes the bargaining position."},{"type":"paragraph","text":"Economic pressure changes it."},{"type":"paragraph","text":"Alliances change it."},{"type":"paragraph","text":"Time changes it."},{"type":"paragraph","text":"And then diplomats sit down and negotiate around the resulting balance."},{"type":"paragraph","text":"That is why battlefield developments and negotiations often happen simultaneously."},{"type":"heading","text":"Putin''s current position","level":2},{"type":"paragraph","text":"In September 2026, Putin continued to portray Russia as having the upper hand militarily while criticizing Ukraine''s leadership as an acceptable negotiating counterpart. At the same time, he indicated openness to substantive negotiations under conditions he considers meaningful."},{"type":"paragraph","text":"That tells us something important."},{"type":"paragraph","text":"The Kremlin does not appear to view negotiations simply as an exit from the war."},{"type":"paragraph","text":"It views negotiations as another arena in which Russia can pursue its strategic objectives."},{"type":"heading","text":"The problem of maximum demands","level":2},{"type":"paragraph","text":"There is also a difference between a negotiating position and a final settlement."},{"type":"paragraph","text":"A government can begin negotiations with maximal demands precisely because it expects those demands to be negotiated down."},{"type":"paragraph","text":"That creates a difficult analytical problem."},{"type":"paragraph","text":"If Moscow says:"},{"type":"paragraph","text":"“We require X, Y and Z.”"},{"type":"paragraph","text":"We cannot automatically conclude:"},{"type":"paragraph","text":"“Russia will refuse peace without X, Y and Z.”"},{"type":"paragraph","text":"Perhaps."},{"type":"paragraph","text":"But perhaps those are opening positions."},{"type":"paragraph","text":"The only reliable way to know is to observe what happens when actual trade-offs are placed on the table."},{"type":"heading","text":"What would make Putin compromise?","level":2},{"type":"paragraph","text":"This is probably the most important question."},{"type":"paragraph","text":"If Russia believes time is on its side, it has less reason to compromise."},{"type":"paragraph","text":"If Russia believes its military position is improving, it has less reason to compromise."},{"type":"paragraph","text":"If Russia believes Western support for Ukraine is weakening, it has less reason to compromise."},{"type":"paragraph","text":"If Russia believes the economic costs of war are becoming unbearable, the calculation changes."},{"type":"paragraph","text":"If Russia believes Ukraine is becoming militarily stronger, the calculation changes."},{"type":"paragraph","text":"If Russia''s relationship with China or other partners changes, the calculation changes."},{"type":"paragraph","text":"In other words:"},{"type":"paragraph","text":"Putin''s negotiating position is not fixed."},{"type":"paragraph","text":"It is a function of the expected future."},{"type":"paragraph","text":"And that may be the most important thing to understand about the diplomacy surrounding the war."},{"type":"paragraph","text":"The real negotiation isn''t only happening across a table."},{"type":"paragraph","text":"It is happening on the battlefield, inside economies, between alliances and inside the calculations of every government involved."},{"type":"paragraph","text":"The question isn''t simply what Putin wants today."},{"type":"paragraph","text":"It''s:"},{"type":"paragraph","text":"What does Putin believe he can still get tomorrow?"},{"type":"paragraph","text":"That is where leverage comes from."}]'::jsonb, 'WORLD', 3, 'published', 'What Putin Actually Wants From Negotiations | Omniv Editorial', 'Every time peace talks appear on the horizon, the same question returns: What does Putin actually want? The answer is more complicated than “Ukraine.”', 'https://omniv.media/p/what-putin-actually-wants-from-negotiations', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"ukraine","label":"Ukraine"},{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"}]'::jsonb, '{}'::text[], '{world,russia,ukraine,global-supply-chains,artificial-intelligence}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'russias-shadow-fleet-how-oil-keeps-moving-around-sanctions', 'Russia''s Shadow Fleet: How Oil Keeps Moving Around Sanctions', 'The tanker doesn''t look Russian. That''s the point. It may fly the flag of one country.', 'The tanker doesn''t look Russian.

That''s the point.

It may fly the flag of one country.

Be owned by a company registered somewhere else.

Managed by another company.

Insured through a different network.

And spend months moving Russian crude through international waters.

By the time the oil reaches its final buyer, figuring out who actually moved it can become surprisingly difficult.

This is the world of Russia''s shadow fleet.

And it explains one of the biggest problems with trying to economically isolate a country that exports millions of barrels of oil every day.

A barrel of oil doesn''t carry a passport.

Once crude enters the global market, it can be bought, sold, blended, refined and resold.

The physical oil may travel through several jurisdictions before becoming a completely different commercial product.

That makes energy sanctions fundamentally different from freezing someone''s bank account.

You aren''t simply trying to stop a person from moving money.

You''re trying to control an enormous international transportation system.

Tankers.

Ports.

Insurance.

Brokers.

Refineries.

Banks.

Shipping companies.

Flag registries.

And thousands of contracts connecting them.

Russia learned how to exploit that complexity.

The term sounds like something from an intelligence thriller.

The reality is more mundane—and arguably more interesting.

The shadow fleet refers broadly to ships and associated companies used to transport sanctioned or price-restricted oil while relying on opaque ownership structures, alternative insurance arrangements and high-risk shipping practices.

The U.S. Treasury has described Russia as increasingly reliant on vessels using high-risk practices to move oil and has specifically targeted tankers, traders, insurers and other participants in the network.

These aren''t necessarily all secretly owned by the Russian government.

That''s important.

Some are simply part of a commercial ecosystem that developed because conventional Western shipping services became more difficult or expensive for Russian oil.

Here''s the clever part of the original sanctions architecture.

The West didn''t necessarily need to physically stop every Russian barrel.

Instead, the G7 and its partners created a price-cap system.

The basic idea:

Russia could continue selling oil.

But access to important Western maritime services would be conditional on the oil being sold below a specified price.

Shipping.

Insurance.

Financial services.

These are extremely important because international oil transportation relies heavily on them.

The system attempted to reduce Russian revenue without causing a global oil shock.

That created a difficult balancing act:

hurt Russia''s revenue without removing Russian oil from the world market entirely.

This is where the shadow fleet became strategically important.

If Western insurers won''t insure your tanker, find another insurer.

If Western shipping companies won''t carry your oil, acquire or charter other ships.

If traditional financial channels become difficult, develop alternative payment arrangements.

If a ship''s ownership creates sanctions exposure, make the ownership structure harder to trace.

The U.S. Treasury itself noted that Russia began building infrastructure involving ships, insurers and maritime-service providers with opaque ownership structures after enforcement of the price cap tightened.

The response to sanctions therefore became an arms race.

Not necessarily missiles.

Infrastructure.

The scale became significant enough that governments began sanctioning individual vessels in large numbers.

In January 2025, the U.S. Treasury sanctioned more than 180 vessels, many of them identified as part of Russia''s shadow fleet.

The European Union has continued expanding its own list.

Its July 2026 sanctions package added another 41 vessels, bringing the number of Russian shadow-fleet vessels listed by the EU to hundreds.

And that''s the fascinating part.

Every time another tanker is sanctioned, the question becomes:

What happens to the oil that tanker was carrying?

Does the cargo stop?

Or does another ship take its place?

There is another reason the shadow fleet worries maritime authorities.

Some of these vessels are old.

Very old.

The Price Cap Coalition has warned that shadow-fleet vessels can involve older ships operating beyond their traditional lifespans, opaque registration and inadequate or questionable inspections and certificates.

That''s not merely a sanctions problem.

It''s a safety problem.

Imagine an aging tanker carrying hundreds of thousands of barrels of crude through a major shipping route.

If something goes wrong, the consequences don''t stop at the ship.

Oil spills don''t respect sanctions.

Neither do maritime disasters.

Insurance is one of the least visible pieces of the oil industry.

It is also one of the most important.

A tanker carrying enormous quantities of crude needs financial protection against collisions, pollution, environmental damage and other liabilities.

Western maritime insurance historically played a huge role in global shipping.

So when sanctions restrict access to those services, the shipping network has to find alternatives.

That''s one reason Russia''s alternative maritime ecosystem became so important.

The sanctions war effectively created a parallel infrastructure.

This is the part that makes the story particularly difficult.

Sanctions can make Russian oil more expensive to transport.

They can force Russia to sell at discounts.

They can increase transaction costs.

They can make shipping riskier.

But if there are still buyers willing to purchase the oil, the trade doesn''t necessarily disappear.

India has been one of the most important buyers.

China is another.

And their decisions matter enormously because together they represent enormous energy demand.

As of August 2026, Russia remained India''s largest oil supplier even though India''s imports of Russian crude had fallen from earlier levels. Reuters reported that Indian purchases from Russia were about 2.1 million barrels per day in August, with preliminary September data showing a further decline.

That illustrates the larger point:

sanctions can change the economics of the trade without necessarily eliminating the trade.

Before the invasion, Russia''s energy system was deeply integrated with Europe.

Afterward, the map changed.

More Russian crude moved toward Asia.

New shipping routes became important.

New intermediaries appeared.

New ports became strategically significant.

New refineries became more important.

And countries that previously had little involvement in Russian energy logistics suddenly became part of the system.

That''s why sanctions against Russia aren''t simply a confrontation between Russia and the West.

They affect shipping companies in Asia.

Refineries in India.

Trading companies in the Middle East.

Insurance providers.

Flag states.

Ports.

Financial institutions.

The entire network becomes part of the story.

This is where the story gets more interesting.

It would be wrong to conclude:

“Russia figured out how to defeat sanctions.”

The reality is more complicated.

The shadow fleet has costs.

Older ships are riskier.

Alternative insurance can be expensive.

Longer routes increase transportation costs.

Opaque ownership creates legal and financial risk.

Sanctions can target individual ships and companies.

And governments can pressure the jurisdictions where these networks operate.

The EU''s 2026 sanctions packages specifically targeted not only vessels but also companies and service providers supporting the shadow-fleet ecosystem.

So the contest continues.

The shadow fleet reveals something much larger about modern economic warfare.

Globalization makes sanctions powerful—and difficult to enforce.

The same interconnected system that allows a product to move effortlessly across borders also creates opportunities for sanctioned states to reroute trade.

You can close one route.

Another opens.

You sanction one tanker.

Another appears.

You restrict one financial institution.

A different intermediary emerges.

The system adapts.

And Russia''s oil trade is a particularly dramatic example because the underlying commodity remains enormously valuable to the world.

It is:

How expensive can the world make it to move?

That''s the real battle.

If Russia can continue moving oil cheaply, its revenues remain stronger.

If every additional barrel becomes harder, riskier and more expensive to transport, the economic pressure increases.

And that''s why the tanker you never hear about may matter almost as much as the battlefield you see every night on television.

Because wars aren''t financed only by weapons.

They''re financed by systems that keep money moving.

And somewhere on the ocean, another tanker is moving right now.

The question is:

who owns it, who insured it, who loaded it, who is buying the oil—and how much of that chain can actually be traced?

That''s where the next story begins.', 'Analysis from the Omniv Editorial desk.', 'The tanker doesn''t look Russian. That''s the point. It may fly the flag of one country.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"The tanker doesn''t look Russian."},{"type":"paragraph","text":"That''s the point."},{"type":"paragraph","text":"It may fly the flag of one country."},{"type":"paragraph","text":"Be owned by a company registered somewhere else."},{"type":"paragraph","text":"Managed by another company."},{"type":"paragraph","text":"Insured through a different network."},{"type":"paragraph","text":"And spend months moving Russian crude through international waters."},{"type":"paragraph","text":"By the time the oil reaches its final buyer, figuring out who actually moved it can become surprisingly difficult."},{"type":"paragraph","text":"This is the world of Russia''s shadow fleet."},{"type":"paragraph","text":"And it explains one of the biggest problems with trying to economically isolate a country that exports millions of barrels of oil every day."},{"type":"heading","text":"The problem with sanctioning an oil barrel","level":2},{"type":"paragraph","text":"A barrel of oil doesn''t carry a passport."},{"type":"paragraph","text":"Once crude enters the global market, it can be bought, sold, blended, refined and resold."},{"type":"paragraph","text":"The physical oil may travel through several jurisdictions before becoming a completely different commercial product."},{"type":"paragraph","text":"That makes energy sanctions fundamentally different from freezing someone''s bank account."},{"type":"paragraph","text":"You aren''t simply trying to stop a person from moving money."},{"type":"paragraph","text":"You''re trying to control an enormous international transportation system."},{"type":"paragraph","text":"Tankers."},{"type":"paragraph","text":"Ports."},{"type":"paragraph","text":"Insurance."},{"type":"paragraph","text":"Brokers."},{"type":"paragraph","text":"Refineries."},{"type":"paragraph","text":"Banks."},{"type":"paragraph","text":"Shipping companies."},{"type":"paragraph","text":"Flag registries."},{"type":"paragraph","text":"And thousands of contracts connecting them."},{"type":"paragraph","text":"Russia learned how to exploit that complexity."},{"type":"heading","text":"What exactly is the \"shadow fleet\"?","level":2},{"type":"paragraph","text":"The term sounds like something from an intelligence thriller."},{"type":"paragraph","text":"The reality is more mundane—and arguably more interesting."},{"type":"paragraph","text":"The shadow fleet refers broadly to ships and associated companies used to transport sanctioned or price-restricted oil while relying on opaque ownership structures, alternative insurance arrangements and high-risk shipping practices."},{"type":"paragraph","text":"The U.S. Treasury has described Russia as increasingly reliant on vessels using high-risk practices to move oil and has specifically targeted tankers, traders, insurers and other participants in the network."},{"type":"paragraph","text":"These aren''t necessarily all secretly owned by the Russian government."},{"type":"paragraph","text":"That''s important."},{"type":"paragraph","text":"Some are simply part of a commercial ecosystem that developed because conventional Western shipping services became more difficult or expensive for Russian oil."},{"type":"heading","text":"Why the West cared about shipping","level":2},{"type":"paragraph","text":"Here''s the clever part of the original sanctions architecture."},{"type":"paragraph","text":"The West didn''t necessarily need to physically stop every Russian barrel."},{"type":"paragraph","text":"Instead, the G7 and its partners created a price-cap system."},{"type":"paragraph","text":"The basic idea:"},{"type":"paragraph","text":"Russia could continue selling oil."},{"type":"paragraph","text":"But access to important Western maritime services would be conditional on the oil being sold below a specified price."},{"type":"paragraph","text":"Shipping."},{"type":"paragraph","text":"Insurance."},{"type":"paragraph","text":"Financial services."},{"type":"paragraph","text":"These are extremely important because international oil transportation relies heavily on them."},{"type":"paragraph","text":"The system attempted to reduce Russian revenue without causing a global oil shock."},{"type":"paragraph","text":"That created a difficult balancing act:"},{"type":"paragraph","text":"hurt Russia''s revenue without removing Russian oil from the world market entirely."},{"type":"heading","text":"Then Russia started building alternatives","level":2},{"type":"paragraph","text":"This is where the shadow fleet became strategically important."},{"type":"paragraph","text":"If Western insurers won''t insure your tanker, find another insurer."},{"type":"paragraph","text":"If Western shipping companies won''t carry your oil, acquire or charter other ships."},{"type":"paragraph","text":"If traditional financial channels become difficult, develop alternative payment arrangements."},{"type":"paragraph","text":"If a ship''s ownership creates sanctions exposure, make the ownership structure harder to trace."},{"type":"paragraph","text":"The U.S. Treasury itself noted that Russia began building infrastructure involving ships, insurers and maritime-service providers with opaque ownership structures after enforcement of the price cap tightened."},{"type":"paragraph","text":"The response to sanctions therefore became an arms race."},{"type":"paragraph","text":"Not necessarily missiles."},{"type":"paragraph","text":"Infrastructure."},{"type":"heading","text":"The fleet grew","level":2},{"type":"paragraph","text":"The scale became significant enough that governments began sanctioning individual vessels in large numbers."},{"type":"paragraph","text":"In January 2025, the U.S. Treasury sanctioned more than 180 vessels, many of them identified as part of Russia''s shadow fleet."},{"type":"paragraph","text":"The European Union has continued expanding its own list."},{"type":"paragraph","text":"Its July 2026 sanctions package added another 41 vessels, bringing the number of Russian shadow-fleet vessels listed by the EU to hundreds."},{"type":"paragraph","text":"And that''s the fascinating part."},{"type":"paragraph","text":"Every time another tanker is sanctioned, the question becomes:"},{"type":"paragraph","text":"What happens to the oil that tanker was carrying?"},{"type":"paragraph","text":"Does the cargo stop?"},{"type":"paragraph","text":"Or does another ship take its place?"},{"type":"heading","text":"The ships themselves can be old","level":2},{"type":"paragraph","text":"There is another reason the shadow fleet worries maritime authorities."},{"type":"paragraph","text":"Some of these vessels are old."},{"type":"paragraph","text":"Very old."},{"type":"paragraph","text":"The Price Cap Coalition has warned that shadow-fleet vessels can involve older ships operating beyond their traditional lifespans, opaque registration and inadequate or questionable inspections and certificates."},{"type":"paragraph","text":"That''s not merely a sanctions problem."},{"type":"paragraph","text":"It''s a safety problem."},{"type":"paragraph","text":"Imagine an aging tanker carrying hundreds of thousands of barrels of crude through a major shipping route."},{"type":"paragraph","text":"If something goes wrong, the consequences don''t stop at the ship."},{"type":"paragraph","text":"Oil spills don''t respect sanctions."},{"type":"paragraph","text":"Neither do maritime disasters."},{"type":"heading","text":"And then there is the insurance problem","level":2},{"type":"paragraph","text":"Insurance is one of the least visible pieces of the oil industry."},{"type":"paragraph","text":"It is also one of the most important."},{"type":"paragraph","text":"A tanker carrying enormous quantities of crude needs financial protection against collisions, pollution, environmental damage and other liabilities."},{"type":"paragraph","text":"Western maritime insurance historically played a huge role in global shipping."},{"type":"paragraph","text":"So when sanctions restrict access to those services, the shipping network has to find alternatives."},{"type":"paragraph","text":"That''s one reason Russia''s alternative maritime ecosystem became so important."},{"type":"paragraph","text":"The sanctions war effectively created a parallel infrastructure."},{"type":"heading","text":"The oil still has buyers","level":2},{"type":"paragraph","text":"This is the part that makes the story particularly difficult."},{"type":"paragraph","text":"Sanctions can make Russian oil more expensive to transport."},{"type":"paragraph","text":"They can force Russia to sell at discounts."},{"type":"paragraph","text":"They can increase transaction costs."},{"type":"paragraph","text":"They can make shipping riskier."},{"type":"paragraph","text":"But if there are still buyers willing to purchase the oil, the trade doesn''t necessarily disappear."},{"type":"paragraph","text":"India has been one of the most important buyers."},{"type":"paragraph","text":"China is another."},{"type":"paragraph","text":"And their decisions matter enormously because together they represent enormous energy demand."},{"type":"paragraph","text":"As of August 2026, Russia remained India''s largest oil supplier even though India''s imports of Russian crude had fallen from earlier levels. Reuters reported that Indian purchases from Russia were about 2.1 million barrels per day in August, with preliminary September data showing a further decline."},{"type":"paragraph","text":"That illustrates the larger point:"},{"type":"paragraph","text":"sanctions can change the economics of the trade without necessarily eliminating the trade."},{"type":"heading","text":"The geography of oil changed","level":2},{"type":"paragraph","text":"Before the invasion, Russia''s energy system was deeply integrated with Europe."},{"type":"paragraph","text":"Afterward, the map changed."},{"type":"paragraph","text":"More Russian crude moved toward Asia."},{"type":"paragraph","text":"New shipping routes became important."},{"type":"paragraph","text":"New intermediaries appeared."},{"type":"paragraph","text":"New ports became strategically significant."},{"type":"paragraph","text":"New refineries became more important."},{"type":"paragraph","text":"And countries that previously had little involvement in Russian energy logistics suddenly became part of the system."},{"type":"paragraph","text":"That''s why sanctions against Russia aren''t simply a confrontation between Russia and the West."},{"type":"paragraph","text":"They affect shipping companies in Asia."},{"type":"paragraph","text":"Refineries in India."},{"type":"paragraph","text":"Trading companies in the Middle East."},{"type":"paragraph","text":"Insurance providers."},{"type":"paragraph","text":"Flag states."},{"type":"paragraph","text":"Ports."},{"type":"paragraph","text":"Financial institutions."},{"type":"paragraph","text":"The entire network becomes part of the story."},{"type":"heading","text":"But the shadow fleet isn''t invincible","level":2},{"type":"paragraph","text":"This is where the story gets more interesting."},{"type":"paragraph","text":"It would be wrong to conclude:"},{"type":"paragraph","text":"“Russia figured out how to defeat sanctions.”"},{"type":"paragraph","text":"The reality is more complicated."},{"type":"paragraph","text":"The shadow fleet has costs."},{"type":"paragraph","text":"Older ships are riskier."},{"type":"paragraph","text":"Alternative insurance can be expensive."},{"type":"paragraph","text":"Longer routes increase transportation costs."},{"type":"paragraph","text":"Opaque ownership creates legal and financial risk."},{"type":"paragraph","text":"Sanctions can target individual ships and companies."},{"type":"paragraph","text":"And governments can pressure the jurisdictions where these networks operate."},{"type":"paragraph","text":"The EU''s 2026 sanctions packages specifically targeted not only vessels but also companies and service providers supporting the shadow-fleet ecosystem."},{"type":"paragraph","text":"So the contest continues."},{"type":"heading","text":"The bigger lesson","level":2},{"type":"paragraph","text":"The shadow fleet reveals something much larger about modern economic warfare."},{"type":"paragraph","text":"Globalization makes sanctions powerful—and difficult to enforce."},{"type":"paragraph","text":"The same interconnected system that allows a product to move effortlessly across borders also creates opportunities for sanctioned states to reroute trade."},{"type":"paragraph","text":"You can close one route."},{"type":"paragraph","text":"Another opens."},{"type":"paragraph","text":"You sanction one tanker."},{"type":"paragraph","text":"Another appears."},{"type":"paragraph","text":"You restrict one financial institution."},{"type":"paragraph","text":"A different intermediary emerges."},{"type":"paragraph","text":"The system adapts."},{"type":"paragraph","text":"And Russia''s oil trade is a particularly dramatic example because the underlying commodity remains enormously valuable to the world."},{"type":"heading","text":"The question isn''t whether Russian oil moves","level":2},{"type":"paragraph","text":"It is:"},{"type":"paragraph","text":"How expensive can the world make it to move?"},{"type":"paragraph","text":"That''s the real battle."},{"type":"paragraph","text":"If Russia can continue moving oil cheaply, its revenues remain stronger."},{"type":"paragraph","text":"If every additional barrel becomes harder, riskier and more expensive to transport, the economic pressure increases."},{"type":"paragraph","text":"And that''s why the tanker you never hear about may matter almost as much as the battlefield you see every night on television."},{"type":"paragraph","text":"Because wars aren''t financed only by weapons."},{"type":"paragraph","text":"They''re financed by systems that keep money moving."},{"type":"paragraph","text":"And somewhere on the ocean, another tanker is moving right now."},{"type":"paragraph","text":"The question is:"},{"type":"paragraph","text":"who owns it, who insured it, who loaded it, who is buying the oil—and how much of that chain can actually be traced?"},{"type":"paragraph","text":"That''s where the next story begins."}]'::jsonb, 'WORLD', 7, 'published', 'Russia''s Shadow Fleet: How Oil Keeps Moving Around Sanctions | Omniv Editorial', 'The tanker doesn''t look Russian. That''s the point. It may fly the flag of one country.', 'https://omniv.media/p/russias-shadow-fleet-how-oil-keeps-moving-around-sanctions', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"biology","label":"Biology"}]'::jsonb, '{}'::text[], '{world,russia,global-supply-chains,artificial-intelligence,infrastructure,biology}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'how-drones-changed-modern-warfare', 'How Drones Changed Modern Warfare', 'For most of military history, hiding meant something. You could put soldiers underground. Move equipment at night.', 'For most of military history, hiding meant something.

You could put soldiers underground.

Move equipment at night.

Camouflage a vehicle.

Spread forces across a forest.

Build a decoy.

Then drones changed the equation.

Now a battlefield can be watched from above by machines that cost a fraction of the equipment they are hunting.

And suddenly one of the most important questions in modern warfare isn''t:

How much does the weapon cost?

It''s:

How much does it cost to find something before you destroy it?

The first revolution wasn''t the explosive.

It was the camera.

A relatively inexpensive drone can fly above a position and provide an operator with a view that would previously have required an aircraft, helicopter or forward observer.

That changes everything.

A hidden artillery position becomes detectable.

A vehicle moving down a road can be tracked.

A trench can be monitored.

A supply route can be observed.

And once something is visible, another system can be directed toward it.

The drone doesn''t necessarily have to destroy the target.

It can simply find it.

That makes the drone part of a larger chain:

detect → identify → track → strike → assess.

The distance between those steps keeps shrinking.

The war in Ukraine has become one of the world''s most important real-world laboratories for drone warfare.

Both sides use drones for reconnaissance, artillery correction, electronic warfare and direct attacks.

The scale is enormous.

Ukraine alone has dramatically expanded domestic drone production since the beginning of the full-scale invasion, with the government repeatedly setting increasingly ambitious production targets. In 2025, Ukrainian officials said the country had the capacity to produce millions of drones.

Russia has also massively expanded drone production.

The result is a battlefield saturated with unmanned systems.

And saturation changes behavior.

Imagine being a soldier.

You move a vehicle.

There may be a drone above you.

You stop.

Another drone might detect you.

You hide under trees.

Thermal imaging or another sensor may find you.

You relocate at night.

Someone may still be watching the road.

This creates something strategically important:

persistent uncertainty.

You don''t need to know that you are definitely being watched.

You only need to believe that you might be.

That changes how armies move.

This is where drones become especially disruptive.

A sophisticated military platform can cost millions of dollars.

A small drone can cost orders of magnitude less.

That doesn''t mean the cheap drone can replace an advanced aircraft.

It can''t.

But it creates a new economic problem.

Imagine spending an enormous amount of money on a sophisticated system—and having it threatened by a much cheaper unmanned platform.

Now the defender has to spend money to protect the expensive asset.

The attacker is trying to create an unfavorable exchange ratio.

That is the game.

And it is becoming increasingly important.

This is another misconception.

People often see footage of a drone carrying an explosive and assume:

drone = bomb.

The bigger transformation is the network around it.

One drone finds a target.

Another provides a different view.

An artillery unit receives coordinates.

Electronic-warfare equipment tries to disrupt the opposing drone.

A second system attempts to jam the signal.

Another drone observes the result.

The battlefield becomes a network of machines.

The drone is one node.

There''s a problem with relying on drones.

They need communication.

Many need navigation.

Some require a control link.

Those signals can be disrupted.

That created another rapidly evolving battlefield:

electronic warfare.

Armies attempt to interfere with the signals that connect drones to their operators.

Then drone designers respond.

They improve autonomy.

Change frequencies.

Use different navigation methods.

Develop alternative communications.

The countermeasure creates another countermeasure.

And then another.

It resembles cybersecurity more than traditional warfare.

Every advantage creates a vulnerability.

Every vulnerability creates a market for another technology.

This is where the story gets much more interesting.

Today''s drones can already perform increasingly sophisticated tasks.

But the strategic question is what happens when drones require less human control.

Imagine a system that can:

identify an object,

track it,

navigate toward it,

avoid obstacles,

and make increasingly complex decisions

with limited human intervention.

That raises an entirely different set of questions.

Who makes the final decision?

How reliable is the identification?

What happens when the system is deceived?

What happens when two autonomous systems interact?

And how much human oversight remains?

The technology isn''t simply changing weapons.

It''s changing the relationship between humans and decisions on the battlefield.

There is an interesting paradox here.

Drones can make certain military capabilities dramatically cheaper.

But they don''t necessarily make war cheaper.

Instead, they can increase the number of things armies have to defend against.

A military now needs:

air defense,

counter-drone systems,

electronic warfare,

drone operators,

drone production,

anti-jamming technology,

new sensors,

new communications systems,

and new tactics.

So the drone creates a new layer of military expenditure.

This is perhaps the biggest lesson.

When drones are inexpensive enough to manufacture at scale, the war becomes partly an industrial competition.

Who can produce more?

Who can replace losses faster?

Who can improve designs faster?

Who can train operators faster?

Who can secure components?

Who can create better software?

Who can manufacture at sufficient volume?

That changes military strategy.

A drone that takes six months to produce isn''t necessarily useful if it is destroyed tomorrow.

A slightly less capable drone that can be manufactured by the thousands may be far more valuable.

For decades, military power was strongly associated with expensive platforms.

Aircraft carriers.

Fighter jets.

Main battle tanks.

Long-range missiles.

Advanced aircraft.

Those systems still matter enormously.

But now another question sits beside them:

How quickly can you produce intelligent, connected and expendable machines?

That is a different kind of military power.

It belongs partly to engineers.

Software developers.

Electronics manufacturers.

Chip suppliers.

Battery producers.

Factories.

And data scientists.

The battlefield is increasingly connected to the industrial base.

This is the part policymakers are watching.

Every military is learning from what happens in Ukraine.

Every defense company is studying the battlefield.

Every major power is thinking about how drones would affect its own military.

And every country is asking the same uncomfortable question:

What happens when the other side has ten thousand drones?

Or one hundred thousand?

Or millions?

At that point, the drone isn''t a special weapon.

It becomes infrastructure.

The same way artillery eventually became an expected component of modern warfare, unmanned systems are moving toward becoming a normal layer of military operations.

The drone didn''t simply give soldiers a new weapon.

It changed the economics of seeing, finding and attacking.

It compressed the battlefield.

It connected sensors to weapons.

It made concealment harder.

It created a new electronic battlefield.

It pushed militaries toward mass production.

And it introduced a future where software may matter almost as much as steel.

The most important drone may therefore not be the one carrying the largest explosive.

It may be the one carrying a camera.

Because once everything can be seen,

everything has to rethink how it survives.

And that leads to the next question:

If Russia can no longer depend on Europe as its primary energy market, where does its energy actually go?

That is the story behind the new geography of Russian energy.

Absolutely. The next sequence should go deeper into the Taiwan → chips → AI → supply chains rabbit hole.

I’d publish these next four in this order because each naturally creates a reason to open the next one.', 'Analysis from the Omniv Editorial desk.', 'For most of military history, hiding meant something. You could put soldiers underground. Move equipment at night.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"For most of military history, hiding meant something."},{"type":"paragraph","text":"You could put soldiers underground."},{"type":"paragraph","text":"Move equipment at night."},{"type":"paragraph","text":"Camouflage a vehicle."},{"type":"paragraph","text":"Spread forces across a forest."},{"type":"paragraph","text":"Build a decoy."},{"type":"paragraph","text":"Then drones changed the equation."},{"type":"paragraph","text":"Now a battlefield can be watched from above by machines that cost a fraction of the equipment they are hunting."},{"type":"paragraph","text":"And suddenly one of the most important questions in modern warfare isn''t:"},{"type":"paragraph","text":"How much does the weapon cost?"},{"type":"paragraph","text":"It''s:"},{"type":"paragraph","text":"How much does it cost to find something before you destroy it?"},{"type":"heading","text":"The drone made the battlefield visible","level":2},{"type":"paragraph","text":"The first revolution wasn''t the explosive."},{"type":"paragraph","text":"It was the camera."},{"type":"paragraph","text":"A relatively inexpensive drone can fly above a position and provide an operator with a view that would previously have required an aircraft, helicopter or forward observer."},{"type":"paragraph","text":"That changes everything."},{"type":"paragraph","text":"A hidden artillery position becomes detectable."},{"type":"paragraph","text":"A vehicle moving down a road can be tracked."},{"type":"paragraph","text":"A trench can be monitored."},{"type":"paragraph","text":"A supply route can be observed."},{"type":"paragraph","text":"And once something is visible, another system can be directed toward it."},{"type":"paragraph","text":"The drone doesn''t necessarily have to destroy the target."},{"type":"paragraph","text":"It can simply find it."},{"type":"paragraph","text":"That makes the drone part of a larger chain:"},{"type":"paragraph","text":"detect → identify → track → strike → assess."},{"type":"paragraph","text":"The distance between those steps keeps shrinking."},{"type":"heading","text":"Ukraine became a laboratory","level":2},{"type":"paragraph","text":"The war in Ukraine has become one of the world''s most important real-world laboratories for drone warfare."},{"type":"paragraph","text":"Both sides use drones for reconnaissance, artillery correction, electronic warfare and direct attacks."},{"type":"paragraph","text":"The scale is enormous."},{"type":"paragraph","text":"Ukraine alone has dramatically expanded domestic drone production since the beginning of the full-scale invasion, with the government repeatedly setting increasingly ambitious production targets. In 2025, Ukrainian officials said the country had the capacity to produce millions of drones."},{"type":"paragraph","text":"Russia has also massively expanded drone production."},{"type":"paragraph","text":"The result is a battlefield saturated with unmanned systems."},{"type":"paragraph","text":"And saturation changes behavior."},{"type":"heading","text":"Suddenly everything can be watched","level":2},{"type":"paragraph","text":"Imagine being a soldier."},{"type":"paragraph","text":"You move a vehicle."},{"type":"paragraph","text":"There may be a drone above you."},{"type":"paragraph","text":"You stop."},{"type":"paragraph","text":"Another drone might detect you."},{"type":"paragraph","text":"You hide under trees."},{"type":"paragraph","text":"Thermal imaging or another sensor may find you."},{"type":"paragraph","text":"You relocate at night."},{"type":"paragraph","text":"Someone may still be watching the road."},{"type":"paragraph","text":"This creates something strategically important:"},{"type":"paragraph","text":"persistent uncertainty."},{"type":"paragraph","text":"You don''t need to know that you are definitely being watched."},{"type":"paragraph","text":"You only need to believe that you might be."},{"type":"paragraph","text":"That changes how armies move."},{"type":"heading","text":"The economics are brutal","level":2},{"type":"paragraph","text":"This is where drones become especially disruptive."},{"type":"paragraph","text":"A sophisticated military platform can cost millions of dollars."},{"type":"paragraph","text":"A small drone can cost orders of magnitude less."},{"type":"paragraph","text":"That doesn''t mean the cheap drone can replace an advanced aircraft."},{"type":"paragraph","text":"It can''t."},{"type":"paragraph","text":"But it creates a new economic problem."},{"type":"paragraph","text":"Imagine spending an enormous amount of money on a sophisticated system—and having it threatened by a much cheaper unmanned platform."},{"type":"paragraph","text":"Now the defender has to spend money to protect the expensive asset."},{"type":"paragraph","text":"The attacker is trying to create an unfavorable exchange ratio."},{"type":"paragraph","text":"That is the game."},{"type":"paragraph","text":"And it is becoming increasingly important."},{"type":"heading","text":"The cheap drone isn''t always the weapon","level":2},{"type":"paragraph","text":"This is another misconception."},{"type":"paragraph","text":"People often see footage of a drone carrying an explosive and assume:"},{"type":"paragraph","text":"drone = bomb."},{"type":"paragraph","text":"The bigger transformation is the network around it."},{"type":"paragraph","text":"One drone finds a target."},{"type":"paragraph","text":"Another provides a different view."},{"type":"paragraph","text":"An artillery unit receives coordinates."},{"type":"paragraph","text":"Electronic-warfare equipment tries to disrupt the opposing drone."},{"type":"paragraph","text":"A second system attempts to jam the signal."},{"type":"paragraph","text":"Another drone observes the result."},{"type":"paragraph","text":"The battlefield becomes a network of machines."},{"type":"paragraph","text":"The drone is one node."},{"type":"heading","text":"Electronic warfare became inseparable from drones","level":2},{"type":"paragraph","text":"There''s a problem with relying on drones."},{"type":"paragraph","text":"They need communication."},{"type":"paragraph","text":"Many need navigation."},{"type":"paragraph","text":"Some require a control link."},{"type":"paragraph","text":"Those signals can be disrupted."},{"type":"paragraph","text":"That created another rapidly evolving battlefield:"},{"type":"paragraph","text":"electronic warfare."},{"type":"paragraph","text":"Armies attempt to interfere with the signals that connect drones to their operators."},{"type":"paragraph","text":"Then drone designers respond."},{"type":"paragraph","text":"They improve autonomy."},{"type":"paragraph","text":"Change frequencies."},{"type":"paragraph","text":"Use different navigation methods."},{"type":"paragraph","text":"Develop alternative communications."},{"type":"paragraph","text":"The countermeasure creates another countermeasure."},{"type":"paragraph","text":"And then another."},{"type":"paragraph","text":"It resembles cybersecurity more than traditional warfare."},{"type":"paragraph","text":"Every advantage creates a vulnerability."},{"type":"paragraph","text":"Every vulnerability creates a market for another technology."},{"type":"heading","text":"Autonomy is the next step","level":2},{"type":"paragraph","text":"This is where the story gets much more interesting."},{"type":"paragraph","text":"Today''s drones can already perform increasingly sophisticated tasks."},{"type":"paragraph","text":"But the strategic question is what happens when drones require less human control."},{"type":"paragraph","text":"Imagine a system that can:"},{"type":"paragraph","text":"identify an object,"},{"type":"paragraph","text":"track it,"},{"type":"paragraph","text":"navigate toward it,"},{"type":"paragraph","text":"avoid obstacles,"},{"type":"paragraph","text":"and make increasingly complex decisions"},{"type":"paragraph","text":"with limited human intervention."},{"type":"paragraph","text":"That raises an entirely different set of questions."},{"type":"paragraph","text":"Who makes the final decision?"},{"type":"paragraph","text":"How reliable is the identification?"},{"type":"paragraph","text":"What happens when the system is deceived?"},{"type":"paragraph","text":"What happens when two autonomous systems interact?"},{"type":"paragraph","text":"And how much human oversight remains?"},{"type":"paragraph","text":"The technology isn''t simply changing weapons."},{"type":"paragraph","text":"It''s changing the relationship between humans and decisions on the battlefield."},{"type":"heading","text":"The battlefield is becoming cheaper—and more complicated","level":2},{"type":"paragraph","text":"There is an interesting paradox here."},{"type":"paragraph","text":"Drones can make certain military capabilities dramatically cheaper."},{"type":"paragraph","text":"But they don''t necessarily make war cheaper."},{"type":"paragraph","text":"Instead, they can increase the number of things armies have to defend against."},{"type":"paragraph","text":"A military now needs:"},{"type":"paragraph","text":"air defense,"},{"type":"paragraph","text":"counter-drone systems,"},{"type":"paragraph","text":"electronic warfare,"},{"type":"paragraph","text":"drone operators,"},{"type":"paragraph","text":"drone production,"},{"type":"paragraph","text":"anti-jamming technology,"},{"type":"paragraph","text":"new sensors,"},{"type":"paragraph","text":"new communications systems,"},{"type":"paragraph","text":"and new tactics."},{"type":"paragraph","text":"So the drone creates a new layer of military expenditure."},{"type":"heading","text":"The factory matters almost as much as the battlefield","level":2},{"type":"paragraph","text":"This is perhaps the biggest lesson."},{"type":"paragraph","text":"When drones are inexpensive enough to manufacture at scale, the war becomes partly an industrial competition."},{"type":"paragraph","text":"Who can produce more?"},{"type":"paragraph","text":"Who can replace losses faster?"},{"type":"paragraph","text":"Who can improve designs faster?"},{"type":"paragraph","text":"Who can train operators faster?"},{"type":"paragraph","text":"Who can secure components?"},{"type":"paragraph","text":"Who can create better software?"},{"type":"paragraph","text":"Who can manufacture at sufficient volume?"},{"type":"paragraph","text":"That changes military strategy."},{"type":"paragraph","text":"A drone that takes six months to produce isn''t necessarily useful if it is destroyed tomorrow."},{"type":"paragraph","text":"A slightly less capable drone that can be manufactured by the thousands may be far more valuable."},{"type":"heading","text":"This changes what \"military superiority\" means","level":2},{"type":"paragraph","text":"For decades, military power was strongly associated with expensive platforms."},{"type":"paragraph","text":"Aircraft carriers."},{"type":"paragraph","text":"Fighter jets."},{"type":"paragraph","text":"Main battle tanks."},{"type":"paragraph","text":"Long-range missiles."},{"type":"paragraph","text":"Advanced aircraft."},{"type":"paragraph","text":"Those systems still matter enormously."},{"type":"paragraph","text":"But now another question sits beside them:"},{"type":"paragraph","text":"How quickly can you produce intelligent, connected and expendable machines?"},{"type":"paragraph","text":"That is a different kind of military power."},{"type":"paragraph","text":"It belongs partly to engineers."},{"type":"paragraph","text":"Software developers."},{"type":"paragraph","text":"Electronics manufacturers."},{"type":"paragraph","text":"Chip suppliers."},{"type":"paragraph","text":"Battery producers."},{"type":"paragraph","text":"Factories."},{"type":"paragraph","text":"And data scientists."},{"type":"paragraph","text":"The battlefield is increasingly connected to the industrial base."},{"type":"heading","text":"The drone war won''t stay in Ukraine","level":2},{"type":"paragraph","text":"This is the part policymakers are watching."},{"type":"paragraph","text":"Every military is learning from what happens in Ukraine."},{"type":"paragraph","text":"Every defense company is studying the battlefield."},{"type":"paragraph","text":"Every major power is thinking about how drones would affect its own military."},{"type":"paragraph","text":"And every country is asking the same uncomfortable question:"},{"type":"paragraph","text":"What happens when the other side has ten thousand drones?"},{"type":"paragraph","text":"Or one hundred thousand?"},{"type":"paragraph","text":"Or millions?"},{"type":"paragraph","text":"At that point, the drone isn''t a special weapon."},{"type":"paragraph","text":"It becomes infrastructure."},{"type":"paragraph","text":"The same way artillery eventually became an expected component of modern warfare, unmanned systems are moving toward becoming a normal layer of military operations."},{"type":"heading","text":"The real revolution","level":2},{"type":"paragraph","text":"The drone didn''t simply give soldiers a new weapon."},{"type":"paragraph","text":"It changed the economics of seeing, finding and attacking."},{"type":"paragraph","text":"It compressed the battlefield."},{"type":"paragraph","text":"It connected sensors to weapons."},{"type":"paragraph","text":"It made concealment harder."},{"type":"paragraph","text":"It created a new electronic battlefield."},{"type":"paragraph","text":"It pushed militaries toward mass production."},{"type":"paragraph","text":"And it introduced a future where software may matter almost as much as steel."},{"type":"paragraph","text":"The most important drone may therefore not be the one carrying the largest explosive."},{"type":"paragraph","text":"It may be the one carrying a camera."},{"type":"paragraph","text":"Because once everything can be seen,"},{"type":"paragraph","text":"everything has to rethink how it survives."},{"type":"paragraph","text":"And that leads to the next question:"},{"type":"paragraph","text":"If Russia can no longer depend on Europe as its primary energy market, where does its energy actually go?"},{"type":"paragraph","text":"That is the story behind the new geography of Russian energy."},{"type":"paragraph","text":"Absolutely. The next sequence should go deeper into the Taiwan → chips → AI → supply chains rabbit hole."},{"type":"paragraph","text":"I’d publish these next four in this order because each naturally creates a reason to open the next one."}]'::jsonb, 'WORLD', 6, 'published', 'How Drones Changed Modern Warfare | Omniv Editorial', 'For most of military history, hiding meant something. You could put soldiers underground. Move equipment at night.', 'https://omniv.media/p/how-drones-changed-modern-warfare', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"ukraine","label":"Ukraine"},{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"biology","label":"Biology"}]'::jsonb, '{}'::text[], '{world,russia,ukraine,global-supply-chains,artificial-intelligence,infrastructure}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-physical-internet-what-exists-behind-the-cloud', 'The Physical Internet: What Exists Behind the Cloud', 'The internet feels weightless. You open an app. A page loads.', 'The internet feels weightless.

You open an app.

A page loads.

A video starts playing.

An AI answers your question.

A file appears on your screen.

From your perspective, almost nothing happened.

But underneath that moment is an enormous physical machine.

Buildings.

Power stations.

Servers.

Fiber.

Submarine cables.

Routers.

Cooling systems.

Data centers.

Land.

Satellites.

Ports.

Factories.

And thousands of people maintaining infrastructure that most users will never see.

We call it the cloud because the physical reality is inconveniently complicated.

The cloud is not in the sky.

It is somewhere.

And increasingly, where it is becoming one of the most important questions in technology.

Take something as ordinary as sending a message across the world.

You type.

You press send.

The message appears almost instantly.

But if the person receiving it is on another continent, your data may travel through an extraordinary physical network before reaching them.

Fiber-optic cables carry enormous amounts of internet traffic across oceans.

According to TeleGeography''s 2025 submarine cable map, there were 597 active or under-construction submarine cable systems and 1,712 cable landings represented on the map.

These aren''t abstract connections.

They are physical cables sitting on the seabed.

They connect countries.

They connect continents.

And they connect the data centers where much of the world''s digital activity actually happens.

This means something important:

The global internet is partly an infrastructure network built on the ocean floor.

Your request eventually needs to reach a computer capable of processing it.

That computer may sit inside a data center.

A data center is essentially a highly engineered building designed to house enormous quantities of computing equipment.

Inside are racks of servers.

Storage systems.

Networking equipment.

Power systems.

Cooling systems.

Backup generators.

Uninterruptible power supplies.

And connections to external networks.

The International Energy Agency describes data centers as facilities housing servers, storage, networking equipment and the supporting infrastructure required to keep them operating.

The important word here is supporting.

The computers aren''t the whole system.

A server without electricity isn''t useful.

A server that overheats isn''t useful.

A server without network connectivity isn''t useful.

A data center without sufficient grid capacity may simply be an expensive building full of equipment that cannot operate at its intended scale.

That is why the physical infrastructure around computing matters almost as much as computing itself.

This is where the story becomes much bigger.

Technology companies often talk about computing as if the primary scarce resource is intelligence.

More GPUs.

Better models.

More parameters.

More inference.

More users.

But every computation ultimately requires energy.

And AI is increasing the importance of that relationship.

The IEA estimates that global data-center electricity consumption reached about 415 TWh in 2024, around 1.5% of global electricity consumption at the time. Its base case projected consumption to roughly double to about 945 TWh by 2030.

More recent IEA analysis says data-center electricity consumption increased 17% in 2025, while electricity consumption from AI-focused data centers grew even faster.

The interesting part isn''t simply the size of the number.

It is the geography.

Electricity cannot be moved around the world as effortlessly as information.

A developer can deploy software globally in minutes.

You cannot deploy a 500-megawatt power connection globally in minutes.

You need land.

Transmission.

Transformers.

Generation.

Permits.

Construction.

Cooling.

Equipment.

Time.

This creates a strange asymmetry at the heart of modern technology:

Information moves incredibly quickly. Physical infrastructure does not.

Consider what happens when you use an AI service.

You don''t see its location.

You see an interface.

But somewhere, physical machines are processing your request.

And the location of those machines matters.

Power prices matter.

Grid reliability matters.

Network latency matters.

Climate matters.

Land availability matters.

Tax policy matters.

Regulation matters.

Access to fiber matters.

Access to chips matters.

Political stability matters.

Water availability can matter for cooling.

And increasingly, access to electricity itself can become a constraint.

The IEA notes that data centers are geographically concentrated, meaning their effects on electricity systems can be much larger locally than their global percentage might suggest.

This changes how we should think about technology companies.

A technology company isn''t necessarily just a software company anymore.

It may depend on an enormous physical supply chain.

Think about the modern internet as layers.

At the top:

You

The person using an application.

Below you:

Applications

Chatbots.

Social networks.

Search engines.

Streaming platforms.

Banks.

Marketplaces.

Then:

Software infrastructure

Cloud platforms.

Databases.

APIs.

Authentication.

Developer tools.

Then:

Computing

CPUs.

GPUs.

Memory.

Storage.

Servers.

Then:

Data centers

Buildings.

Cooling.

Power distribution.

Backup systems.

Network equipment.

Then:

Networks

Fiber.

Internet exchanges.

Routers.

Content-delivery networks.

Submarine cables.

Then:

Energy

Generation.

Transmission.

Distribution.

Fuel.

Storage.

And beneath some of that:

Physical industry

Semiconductors.

Steel.

Copper.

Aluminium.

Construction.

Transformers.

Industrial machinery.

Logistics.

Real estate.

The further down you go, the less visible the system becomes.

Yet the lower layers determine what is possible at the top.

The first phase of the AI boom was largely about models.

Who has the best model?

Who has the best benchmark?

Who has the best reasoning?

Who has the best product?

Those questions still matter.

But another competition is developing underneath them.

Who has enough compute?

Who can secure chips?

Who can build data centers?

Who can obtain electricity?

Who controls the network?

Who can finance the infrastructure?

Who can build it quickly enough?

The IEA reported in 2026 that capital expenditure by five large technology companies exceeded $400 billion in 2025 and was expected to increase further in 2026, while also highlighting bottlenecks involving transformers, gas turbines, chips, grid connections and approvals.

That tells us something important.

The AI race isn''t occurring entirely inside laboratories.

It is also occurring in:

power plants, factories, warehouses, construction sites and transmission networks.

This may become one of the defining questions of the next decade.

Where does computing happen?

Historically, the internet made geography feel less important.

A company could be based in one country and serve customers everywhere.

But AI may bring geography back into technology in a different way.

Because large-scale computing requires physical infrastructure.

And physical infrastructure requires resources.

That means countries have incentives to develop their own computing capacity.

Not necessarily because they want to disconnect from the global internet.

But because computing capacity increasingly has strategic value.

A country that controls energy, data centers, networks, chips and technical talent has a different position from one that simply consumes services built somewhere else.

This is why the infrastructure layer deserves much more attention.

The internet has spent decades making the world feel increasingly digital.

But the next phase of the internet may make the physical world matter more than ever.

AI requires chips.

Chips require factories.

Factories require energy.

Data centers require electricity.

Electricity requires generation and grids.

Networks require fiber and cables.

And all of it requires land, capital and physical construction.

The more digital the economy becomes, the more important certain physical systems can become.

That is the paradox.

The digital economy is becoming increasingly dependent on physical infrastructure.

This isn''t only a story about Silicon Valley.

Africa''s position in the physical internet matters.

The continent is connected to an expanding network of submarine cable systems, while new data-center, cloud, fiber and connectivity investments are changing where digital infrastructure can be located.

But the opportunity isn''t simply:

"Africa needs more internet."

The larger question is:

Where will Africa''s computing infrastructure be built?

Where will the power come from?

Where will the data centers sit?

Which cities become connectivity hubs?

Which countries develop meaningful local compute?

Which companies build the infrastructure?

Which industries become dependent on it?

And perhaps most importantly:

Who owns the physical layer?

That question will matter far beyond technology.

We tend to imagine technology as a collection of products.

Apps.

Models.

Platforms.

Websites.

But underneath them is a map.

A map of:

power plants

data centers

fiber routes

submarine cables

internet exchanges

chip factories

industrial supply chains

ports

land

capital

And the companies and countries positioned around those physical systems may have enormous influence over what can be built above them.

The next time an AI model answers your question in two seconds, remember:

There is no cloud.

There is a building.

Inside that building are machines.

Those machines require electricity.

That electricity comes through infrastructure.

The data arrives through networks.

Those networks eventually connect to physical cables and facilities around the planet.

And behind all of it is an industrial system that is becoming one of the most important parts of the digital economy.

The internet may look weightless.

Its foundations are not.

Category: Technology / Infrastructure / AI Format: Analysis Reading time: ~8–10 minutes Tags: AI, infrastructure, cloud computing, data centers, energy, submarine cables, internet, Africa, technology

Related Omniv articles to publish next:

Why Energy Could Become the Bottleneck for Technology

The New Geography of Computing

What Happens When Countries Start Treating Data Like Oil?

The Infrastructure Wars Nobody Is Talking About

AI Is Not Just a Software Revolution

That sequence is deliberate: physical internet → energy → geography → national strategy → AI infrastructure. It gives Omniv a coherent editorial universe rather than a collection of disconnected tech articles.

Absolutely. I''ll continue the entire AI / computing / infrastructure universe in the same Omniv editorial style. These should read as connected investigations rather than generic SEO posts.', 'Analysis from the Omniv Editorial desk.', 'The internet feels weightless. You open an app. A page loads.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"The internet feels weightless."},{"type":"paragraph","text":"You open an app."},{"type":"paragraph","text":"A page loads."},{"type":"paragraph","text":"A video starts playing."},{"type":"paragraph","text":"An AI answers your question."},{"type":"paragraph","text":"A file appears on your screen."},{"type":"paragraph","text":"From your perspective, almost nothing happened."},{"type":"paragraph","text":"But underneath that moment is an enormous physical machine."},{"type":"paragraph","text":"Buildings."},{"type":"paragraph","text":"Power stations."},{"type":"paragraph","text":"Servers."},{"type":"paragraph","text":"Fiber."},{"type":"paragraph","text":"Submarine cables."},{"type":"paragraph","text":"Routers."},{"type":"paragraph","text":"Cooling systems."},{"type":"paragraph","text":"Data centers."},{"type":"paragraph","text":"Land."},{"type":"paragraph","text":"Satellites."},{"type":"paragraph","text":"Ports."},{"type":"paragraph","text":"Factories."},{"type":"paragraph","text":"And thousands of people maintaining infrastructure that most users will never see."},{"type":"paragraph","text":"We call it the cloud because the physical reality is inconveniently complicated."},{"type":"paragraph","text":"The cloud is not in the sky."},{"type":"paragraph","text":"It is somewhere."},{"type":"paragraph","text":"And increasingly, where it is becoming one of the most important questions in technology."},{"type":"heading","text":"Start with the cables","level":2},{"type":"paragraph","text":"Take something as ordinary as sending a message across the world."},{"type":"paragraph","text":"You type."},{"type":"paragraph","text":"You press send."},{"type":"paragraph","text":"The message appears almost instantly."},{"type":"paragraph","text":"But if the person receiving it is on another continent, your data may travel through an extraordinary physical network before reaching them."},{"type":"paragraph","text":"Fiber-optic cables carry enormous amounts of internet traffic across oceans."},{"type":"paragraph","text":"According to TeleGeography''s 2025 submarine cable map, there were 597 active or under-construction submarine cable systems and 1,712 cable landings represented on the map."},{"type":"paragraph","text":"These aren''t abstract connections."},{"type":"paragraph","text":"They are physical cables sitting on the seabed."},{"type":"paragraph","text":"They connect countries."},{"type":"paragraph","text":"They connect continents."},{"type":"paragraph","text":"And they connect the data centers where much of the world''s digital activity actually happens."},{"type":"paragraph","text":"This means something important:"},{"type":"paragraph","text":"The global internet is partly an infrastructure network built on the ocean floor."},{"type":"heading","text":"Then there are the buildings","level":2},{"type":"paragraph","text":"Your request eventually needs to reach a computer capable of processing it."},{"type":"paragraph","text":"That computer may sit inside a data center."},{"type":"paragraph","text":"A data center is essentially a highly engineered building designed to house enormous quantities of computing equipment."},{"type":"paragraph","text":"Inside are racks of servers."},{"type":"paragraph","text":"Storage systems."},{"type":"paragraph","text":"Networking equipment."},{"type":"paragraph","text":"Power systems."},{"type":"paragraph","text":"Cooling systems."},{"type":"paragraph","text":"Backup generators."},{"type":"paragraph","text":"Uninterruptible power supplies."},{"type":"paragraph","text":"And connections to external networks."},{"type":"paragraph","text":"The International Energy Agency describes data centers as facilities housing servers, storage, networking equipment and the supporting infrastructure required to keep them operating."},{"type":"paragraph","text":"The important word here is supporting."},{"type":"paragraph","text":"The computers aren''t the whole system."},{"type":"paragraph","text":"A server without electricity isn''t useful."},{"type":"paragraph","text":"A server that overheats isn''t useful."},{"type":"paragraph","text":"A server without network connectivity isn''t useful."},{"type":"paragraph","text":"A data center without sufficient grid capacity may simply be an expensive building full of equipment that cannot operate at its intended scale."},{"type":"paragraph","text":"That is why the physical infrastructure around computing matters almost as much as computing itself."},{"type":"heading","text":"The hidden dependency: electricity","level":2},{"type":"paragraph","text":"This is where the story becomes much bigger."},{"type":"paragraph","text":"Technology companies often talk about computing as if the primary scarce resource is intelligence."},{"type":"paragraph","text":"More GPUs."},{"type":"paragraph","text":"Better models."},{"type":"paragraph","text":"More parameters."},{"type":"paragraph","text":"More inference."},{"type":"paragraph","text":"More users."},{"type":"paragraph","text":"But every computation ultimately requires energy."},{"type":"paragraph","text":"And AI is increasing the importance of that relationship."},{"type":"paragraph","text":"The IEA estimates that global data-center electricity consumption reached about 415 TWh in 2024, around 1.5% of global electricity consumption at the time. Its base case projected consumption to roughly double to about 945 TWh by 2030."},{"type":"paragraph","text":"More recent IEA analysis says data-center electricity consumption increased 17% in 2025, while electricity consumption from AI-focused data centers grew even faster."},{"type":"paragraph","text":"The interesting part isn''t simply the size of the number."},{"type":"paragraph","text":"It is the geography."},{"type":"paragraph","text":"Electricity cannot be moved around the world as effortlessly as information."},{"type":"paragraph","text":"A developer can deploy software globally in minutes."},{"type":"paragraph","text":"You cannot deploy a 500-megawatt power connection globally in minutes."},{"type":"paragraph","text":"You need land."},{"type":"paragraph","text":"Transmission."},{"type":"paragraph","text":"Transformers."},{"type":"paragraph","text":"Generation."},{"type":"paragraph","text":"Permits."},{"type":"paragraph","text":"Construction."},{"type":"paragraph","text":"Cooling."},{"type":"paragraph","text":"Equipment."},{"type":"paragraph","text":"Time."},{"type":"paragraph","text":"This creates a strange asymmetry at the heart of modern technology:"},{"type":"paragraph","text":"Information moves incredibly quickly. Physical infrastructure does not."},{"type":"heading","text":"The cloud has a location","level":2},{"type":"paragraph","text":"Consider what happens when you use an AI service."},{"type":"paragraph","text":"You don''t see its location."},{"type":"paragraph","text":"You see an interface."},{"type":"paragraph","text":"But somewhere, physical machines are processing your request."},{"type":"paragraph","text":"And the location of those machines matters."},{"type":"paragraph","text":"Power prices matter."},{"type":"paragraph","text":"Grid reliability matters."},{"type":"paragraph","text":"Network latency matters."},{"type":"paragraph","text":"Climate matters."},{"type":"paragraph","text":"Land availability matters."},{"type":"paragraph","text":"Tax policy matters."},{"type":"paragraph","text":"Regulation matters."},{"type":"paragraph","text":"Access to fiber matters."},{"type":"paragraph","text":"Access to chips matters."},{"type":"paragraph","text":"Political stability matters."},{"type":"paragraph","text":"Water availability can matter for cooling."},{"type":"paragraph","text":"And increasingly, access to electricity itself can become a constraint."},{"type":"paragraph","text":"The IEA notes that data centers are geographically concentrated, meaning their effects on electricity systems can be much larger locally than their global percentage might suggest."},{"type":"paragraph","text":"This changes how we should think about technology companies."},{"type":"paragraph","text":"A technology company isn''t necessarily just a software company anymore."},{"type":"paragraph","text":"It may depend on an enormous physical supply chain."},{"type":"heading","text":"The invisible stack","level":2},{"type":"paragraph","text":"Think about the modern internet as layers."},{"type":"paragraph","text":"At the top:"},{"type":"paragraph","text":"You"},{"type":"paragraph","text":"The person using an application."},{"type":"paragraph","text":"Below you:"},{"type":"paragraph","text":"Applications"},{"type":"paragraph","text":"Chatbots."},{"type":"paragraph","text":"Social networks."},{"type":"paragraph","text":"Search engines."},{"type":"paragraph","text":"Streaming platforms."},{"type":"paragraph","text":"Banks."},{"type":"paragraph","text":"Marketplaces."},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"Software infrastructure"},{"type":"paragraph","text":"Cloud platforms."},{"type":"paragraph","text":"Databases."},{"type":"paragraph","text":"APIs."},{"type":"paragraph","text":"Authentication."},{"type":"paragraph","text":"Developer tools."},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"Computing"},{"type":"paragraph","text":"CPUs."},{"type":"paragraph","text":"GPUs."},{"type":"paragraph","text":"Memory."},{"type":"paragraph","text":"Storage."},{"type":"paragraph","text":"Servers."},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"Data centers"},{"type":"paragraph","text":"Buildings."},{"type":"paragraph","text":"Cooling."},{"type":"paragraph","text":"Power distribution."},{"type":"paragraph","text":"Backup systems."},{"type":"paragraph","text":"Network equipment."},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"Networks"},{"type":"paragraph","text":"Fiber."},{"type":"paragraph","text":"Internet exchanges."},{"type":"paragraph","text":"Routers."},{"type":"paragraph","text":"Content-delivery networks."},{"type":"paragraph","text":"Submarine cables."},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"Energy"},{"type":"paragraph","text":"Generation."},{"type":"paragraph","text":"Transmission."},{"type":"paragraph","text":"Distribution."},{"type":"paragraph","text":"Fuel."},{"type":"paragraph","text":"Storage."},{"type":"paragraph","text":"And beneath some of that:"},{"type":"paragraph","text":"Physical industry"},{"type":"paragraph","text":"Semiconductors."},{"type":"paragraph","text":"Steel."},{"type":"paragraph","text":"Copper."},{"type":"paragraph","text":"Aluminium."},{"type":"paragraph","text":"Construction."},{"type":"paragraph","text":"Transformers."},{"type":"paragraph","text":"Industrial machinery."},{"type":"paragraph","text":"Logistics."},{"type":"paragraph","text":"Real estate."},{"type":"paragraph","text":"The further down you go, the less visible the system becomes."},{"type":"paragraph","text":"Yet the lower layers determine what is possible at the top."},{"type":"heading","text":"This is why AI is becoming an infrastructure story","level":2},{"type":"paragraph","text":"The first phase of the AI boom was largely about models."},{"type":"paragraph","text":"Who has the best model?"},{"type":"paragraph","text":"Who has the best benchmark?"},{"type":"paragraph","text":"Who has the best reasoning?"},{"type":"paragraph","text":"Who has the best product?"},{"type":"paragraph","text":"Those questions still matter."},{"type":"paragraph","text":"But another competition is developing underneath them."},{"type":"paragraph","text":"Who has enough compute?"},{"type":"paragraph","text":"Who can secure chips?"},{"type":"paragraph","text":"Who can build data centers?"},{"type":"paragraph","text":"Who can obtain electricity?"},{"type":"paragraph","text":"Who controls the network?"},{"type":"paragraph","text":"Who can finance the infrastructure?"},{"type":"paragraph","text":"Who can build it quickly enough?"},{"type":"paragraph","text":"The IEA reported in 2026 that capital expenditure by five large technology companies exceeded $400 billion in 2025 and was expected to increase further in 2026, while also highlighting bottlenecks involving transformers, gas turbines, chips, grid connections and approvals."},{"type":"paragraph","text":"That tells us something important."},{"type":"paragraph","text":"The AI race isn''t occurring entirely inside laboratories."},{"type":"paragraph","text":"It is also occurring in:"},{"type":"paragraph","text":"power plants, factories, warehouses, construction sites and transmission networks."},{"type":"heading","text":"The geography of intelligence","level":2},{"type":"paragraph","text":"This may become one of the defining questions of the next decade."},{"type":"paragraph","text":"Where does computing happen?"},{"type":"paragraph","text":"Historically, the internet made geography feel less important."},{"type":"paragraph","text":"A company could be based in one country and serve customers everywhere."},{"type":"paragraph","text":"But AI may bring geography back into technology in a different way."},{"type":"paragraph","text":"Because large-scale computing requires physical infrastructure."},{"type":"paragraph","text":"And physical infrastructure requires resources."},{"type":"paragraph","text":"That means countries have incentives to develop their own computing capacity."},{"type":"paragraph","text":"Not necessarily because they want to disconnect from the global internet."},{"type":"paragraph","text":"But because computing capacity increasingly has strategic value."},{"type":"paragraph","text":"A country that controls energy, data centers, networks, chips and technical talent has a different position from one that simply consumes services built somewhere else."},{"type":"paragraph","text":"This is why the infrastructure layer deserves much more attention."},{"type":"heading","text":"The paradox","level":2},{"type":"paragraph","text":"The internet has spent decades making the world feel increasingly digital."},{"type":"paragraph","text":"But the next phase of the internet may make the physical world matter more than ever."},{"type":"paragraph","text":"AI requires chips."},{"type":"paragraph","text":"Chips require factories."},{"type":"paragraph","text":"Factories require energy."},{"type":"paragraph","text":"Data centers require electricity."},{"type":"paragraph","text":"Electricity requires generation and grids."},{"type":"paragraph","text":"Networks require fiber and cables."},{"type":"paragraph","text":"And all of it requires land, capital and physical construction."},{"type":"paragraph","text":"The more digital the economy becomes, the more important certain physical systems can become."},{"type":"paragraph","text":"That is the paradox."},{"type":"paragraph","text":"The digital economy is becoming increasingly dependent on physical infrastructure."},{"type":"heading","text":"And Africa is part of this story","level":2},{"type":"paragraph","text":"This isn''t only a story about Silicon Valley."},{"type":"paragraph","text":"Africa''s position in the physical internet matters."},{"type":"paragraph","text":"The continent is connected to an expanding network of submarine cable systems, while new data-center, cloud, fiber and connectivity investments are changing where digital infrastructure can be located."},{"type":"paragraph","text":"But the opportunity isn''t simply:"},{"type":"paragraph","text":"\"Africa needs more internet.\""},{"type":"paragraph","text":"The larger question is:"},{"type":"paragraph","text":"Where will Africa''s computing infrastructure be built?"},{"type":"paragraph","text":"Where will the power come from?"},{"type":"paragraph","text":"Where will the data centers sit?"},{"type":"paragraph","text":"Which cities become connectivity hubs?"},{"type":"paragraph","text":"Which countries develop meaningful local compute?"},{"type":"paragraph","text":"Which companies build the infrastructure?"},{"type":"paragraph","text":"Which industries become dependent on it?"},{"type":"paragraph","text":"And perhaps most importantly:"},{"type":"paragraph","text":"Who owns the physical layer?"},{"type":"paragraph","text":"That question will matter far beyond technology."},{"type":"heading","text":"The cloud is becoming a map","level":2},{"type":"paragraph","text":"We tend to imagine technology as a collection of products."},{"type":"paragraph","text":"Apps."},{"type":"paragraph","text":"Models."},{"type":"paragraph","text":"Platforms."},{"type":"paragraph","text":"Websites."},{"type":"paragraph","text":"But underneath them is a map."},{"type":"paragraph","text":"A map of:"},{"type":"paragraph","text":"power plants"},{"type":"paragraph","text":"data centers"},{"type":"paragraph","text":"fiber routes"},{"type":"paragraph","text":"submarine cables"},{"type":"paragraph","text":"internet exchanges"},{"type":"paragraph","text":"chip factories"},{"type":"paragraph","text":"industrial supply chains"},{"type":"paragraph","text":"ports"},{"type":"paragraph","text":"land"},{"type":"paragraph","text":"capital"},{"type":"paragraph","text":"And the companies and countries positioned around those physical systems may have enormous influence over what can be built above them."},{"type":"paragraph","text":"The next time an AI model answers your question in two seconds, remember:"},{"type":"paragraph","text":"There is no cloud."},{"type":"paragraph","text":"There is a building."},{"type":"paragraph","text":"Inside that building are machines."},{"type":"paragraph","text":"Those machines require electricity."},{"type":"paragraph","text":"That electricity comes through infrastructure."},{"type":"paragraph","text":"The data arrives through networks."},{"type":"paragraph","text":"Those networks eventually connect to physical cables and facilities around the planet."},{"type":"paragraph","text":"And behind all of it is an industrial system that is becoming one of the most important parts of the digital economy."},{"type":"paragraph","text":"The internet may look weightless."},{"type":"paragraph","text":"Its foundations are not."},{"type":"heading","text":"Omniv editorial metadata","level":3},{"type":"paragraph","text":"Category: Technology / Infrastructure / AI\u000b Format: Analysis\u000b Reading time: ~8–10 minutes\u000b Tags: AI, infrastructure, cloud computing, data centers, energy, submarine cables, internet, Africa, technology"},{"type":"paragraph","text":"Related Omniv articles to publish next:"},{"type":"paragraph","text":"Why Energy Could Become the Bottleneck for Technology"},{"type":"paragraph","text":"The New Geography of Computing"},{"type":"paragraph","text":"What Happens When Countries Start Treating Data Like Oil?"},{"type":"paragraph","text":"The Infrastructure Wars Nobody Is Talking About"},{"type":"paragraph","text":"AI Is Not Just a Software Revolution"},{"type":"paragraph","text":"That sequence is deliberate: physical internet → energy → geography → national strategy → AI infrastructure. It gives Omniv a coherent editorial universe rather than a collection of disconnected tech articles."},{"type":"paragraph","text":"Absolutely. I''ll continue the entire AI / computing / infrastructure universe in the same Omniv editorial style. These should read as connected investigations rather than generic SEO posts."}]'::jsonb, 'TECHNOLOGY', 8, 'published', 'The Physical Internet: What Exists Behind the Cloud | Omniv Editorial', 'The internet feels weightless. You open an app. A page loads.', 'https://omniv.media/p/the-physical-internet-what-exists-behind-the-cloud', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"space","label":"Space"},{"type":"project","slug":"africa","label":"Africa"}]'::jsonb, '{}'::text[], '{technology,russia,global-supply-chains,artificial-intelligence,data-centres,infrastructure}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-new-geography-of-computing', 'The New Geography of Computing', 'For most of the internet era, computing felt almost locationless. You could build a company in Lagos, host its application in Virginia, serve customers in London and have engineers working from Nairobi. The software did not care about borders.', 'For most of the internet era, computing felt almost locationless.

You could build a company in Lagos, host its application in Virginia, serve customers in London and have engineers working from Nairobi.

The software did not care about borders.

But the machines running that software do.

And as computing becomes more demanding, location is becoming important again.

A data center needs electricity.

It needs land.

It needs fiber.

It needs cooling.

It needs reliable infrastructure.

It needs access to hardware.

And it needs a political environment where billions of dollars can be invested over decades.

That means the next technology map may look very different from the map of the smartphone era.

When someone says:

"It''s in the cloud."

They are really saying:

"It''s in a data center somewhere."

That "somewhere" matters.

A data center in a region with cheap, abundant electricity has a different economics from one sitting on an expensive or constrained grid.

A facility close to major fiber routes has different latency from one far away.

A facility located near customers can respond faster.

A facility in a politically stable jurisdiction may be easier to finance.

Suddenly geography enters the technology equation.

Traditional web applications can often distribute workloads relatively efficiently.

AI can require enormous concentrations of computing power.

Training a frontier model can involve huge clusters of accelerators operating together.

Inference creates another challenge.

If millions of people use AI continuously, computation happens over and over again.

That creates demand for physical capacity.

The result is a new question:

Where should the world''s intelligence infrastructure live?

Computing will likely become geographically distributed.

Some regions will specialize in enormous training facilities.

Others will become inference hubs.

Others will become semiconductor centers.

Others will provide energy.

Others will become connectivity hubs.

The result could be a global computing network that resembles an industrial supply chain.

Not one cloud.

A geography of clouds.

Countries increasingly have reasons to care about where computing capacity is located.

AI can affect:

defense

research

finance

healthcare

communications

industrial production

government services

A country that relies entirely on foreign infrastructure may have less control over critical computational capacity.

That doesn''t necessarily mean every country needs its own frontier model.

But it does mean countries are beginning to ask a different question:

How much of the computing layer should we control ourselves?

That question will shape technology investment for years.', 'Analysis from the Omniv Editorial desk.', 'For most of the internet era, computing felt almost locationless. You could build a company in Lagos, host its application in Virginia, serve customers in London and have engineers working from Nairobi. The software did not care about borders.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"For most of the internet era, computing felt almost locationless."},{"type":"paragraph","text":"You could build a company in Lagos, host its application in Virginia, serve customers in London and have engineers working from Nairobi."},{"type":"paragraph","text":"The software did not care about borders."},{"type":"paragraph","text":"But the machines running that software do."},{"type":"paragraph","text":"And as computing becomes more demanding, location is becoming important again."},{"type":"paragraph","text":"A data center needs electricity."},{"type":"paragraph","text":"It needs land."},{"type":"paragraph","text":"It needs fiber."},{"type":"paragraph","text":"It needs cooling."},{"type":"paragraph","text":"It needs reliable infrastructure."},{"type":"paragraph","text":"It needs access to hardware."},{"type":"paragraph","text":"And it needs a political environment where billions of dollars can be invested over decades."},{"type":"paragraph","text":"That means the next technology map may look very different from the map of the smartphone era."},{"type":"heading","text":"The cloud has a geography","level":2},{"type":"paragraph","text":"When someone says:"},{"type":"paragraph","text":"\"It''s in the cloud.\""},{"type":"paragraph","text":"They are really saying:"},{"type":"paragraph","text":"\"It''s in a data center somewhere.\""},{"type":"paragraph","text":"That \"somewhere\" matters."},{"type":"paragraph","text":"A data center in a region with cheap, abundant electricity has a different economics from one sitting on an expensive or constrained grid."},{"type":"paragraph","text":"A facility close to major fiber routes has different latency from one far away."},{"type":"paragraph","text":"A facility located near customers can respond faster."},{"type":"paragraph","text":"A facility in a politically stable jurisdiction may be easier to finance."},{"type":"paragraph","text":"Suddenly geography enters the technology equation."},{"type":"heading","text":"AI makes the problem bigger","level":2},{"type":"paragraph","text":"Traditional web applications can often distribute workloads relatively efficiently."},{"type":"paragraph","text":"AI can require enormous concentrations of computing power."},{"type":"paragraph","text":"Training a frontier model can involve huge clusters of accelerators operating together."},{"type":"paragraph","text":"Inference creates another challenge."},{"type":"paragraph","text":"If millions of people use AI continuously, computation happens over and over again."},{"type":"paragraph","text":"That creates demand for physical capacity."},{"type":"paragraph","text":"The result is a new question:"},{"type":"paragraph","text":"Where should the world''s intelligence infrastructure live?"},{"type":"heading","text":"The answer will not be one country","level":2},{"type":"paragraph","text":"Computing will likely become geographically distributed."},{"type":"paragraph","text":"Some regions will specialize in enormous training facilities."},{"type":"paragraph","text":"Others will become inference hubs."},{"type":"paragraph","text":"Others will become semiconductor centers."},{"type":"paragraph","text":"Others will provide energy."},{"type":"paragraph","text":"Others will become connectivity hubs."},{"type":"paragraph","text":"The result could be a global computing network that resembles an industrial supply chain."},{"type":"paragraph","text":"Not one cloud."},{"type":"paragraph","text":"A geography of clouds."},{"type":"heading","text":"And this changes national strategy","level":2},{"type":"paragraph","text":"Countries increasingly have reasons to care about where computing capacity is located."},{"type":"paragraph","text":"AI can affect:"},{"type":"paragraph","text":"defense"},{"type":"paragraph","text":"research"},{"type":"paragraph","text":"finance"},{"type":"paragraph","text":"healthcare"},{"type":"paragraph","text":"communications"},{"type":"paragraph","text":"industrial production"},{"type":"paragraph","text":"government services"},{"type":"paragraph","text":"A country that relies entirely on foreign infrastructure may have less control over critical computational capacity."},{"type":"paragraph","text":"That doesn''t necessarily mean every country needs its own frontier model."},{"type":"paragraph","text":"But it does mean countries are beginning to ask a different question:"},{"type":"paragraph","text":"How much of the computing layer should we control ourselves?"},{"type":"paragraph","text":"That question will shape technology investment for years."}]'::jsonb, 'WORLD', 2, 'published', 'The New Geography of Computing | Omniv Editorial', 'For most of the internet era, computing felt almost locationless. You could build a company in Lagos, host its application in Virginia, serve customers in London and have engineers working from Nairobi. The software did not care about borders.', 'https://omniv.media/p/the-new-geography-of-computing', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"}]'::jsonb, '{}'::text[], '{world,russia,global-supply-chains,artificial-intelligence,data-centres,infrastructure}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'what-happens-when-countries-start-treating-data-like-oil', 'What Happens When Countries Start Treating Data Like Oil?', 'Oil changed geopolitics because controlling a physical resource could create enormous economic and strategic power. Data is different. You can copy it.', 'Oil changed geopolitics because controlling a physical resource could create enormous economic and strategic power.

Data is different.

You can copy it.

Move it.

Process it.

Combine it.

And use it repeatedly.

But as AI makes data more valuable, governments are increasingly treating information as something that deserves strategic control.

That doesn''t mean data literally becomes oil.

It means data becomes an object of national strategy.

Who owns the data?

A citizen?

A company?

A government?

A platform?

A hospital?

A bank?

A country?

Those questions become more complicated when information is stored across borders and processed by companies headquartered somewhere else.

Imagine a country''s:

financial records

health information

government documents

industrial data

communications

scientific research

being processed entirely outside its borders.

The country may still legally own the information.

But it may have less control over the infrastructure surrounding it.

This is why data localization, cloud sovereignty and national computing capacity have become increasingly important policy questions.

Raw data is useful.

But AI can transform data into something more powerful.

A large collection of records can become:

patterns

predictions

models

intelligence

And once information becomes part of an AI system, the economic value may extend far beyond the original dataset.

That makes the question increasingly important:

Who gets to turn a country''s information into intelligence?

Countries may compete not simply to possess data, but to build the infrastructure around it:

data centers,

cloud platforms,

AI models,

research institutions,

security systems,

and companies capable of turning information into products.

The strategic resource may therefore not be data alone.

It may be:

data + compute + talent + infrastructure.

That combination is far more powerful.', 'Analysis from the Omniv Editorial desk.', 'Oil changed geopolitics because controlling a physical resource could create enormous economic and strategic power. Data is different. You can copy it.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"Oil changed geopolitics because controlling a physical resource could create enormous economic and strategic power."},{"type":"paragraph","text":"Data is different."},{"type":"paragraph","text":"You can copy it."},{"type":"paragraph","text":"Move it."},{"type":"paragraph","text":"Process it."},{"type":"paragraph","text":"Combine it."},{"type":"paragraph","text":"And use it repeatedly."},{"type":"paragraph","text":"But as AI makes data more valuable, governments are increasingly treating information as something that deserves strategic control."},{"type":"paragraph","text":"That doesn''t mean data literally becomes oil."},{"type":"paragraph","text":"It means data becomes an object of national strategy."},{"type":"heading","text":"The first question is ownership","level":2},{"type":"paragraph","text":"Who owns the data?"},{"type":"paragraph","text":"A citizen?"},{"type":"paragraph","text":"A company?"},{"type":"paragraph","text":"A government?"},{"type":"paragraph","text":"A platform?"},{"type":"paragraph","text":"A hospital?"},{"type":"paragraph","text":"A bank?"},{"type":"paragraph","text":"A country?"},{"type":"paragraph","text":"Those questions become more complicated when information is stored across borders and processed by companies headquartered somewhere else."},{"type":"heading","text":"Then comes sovereignty","level":2},{"type":"paragraph","text":"Imagine a country''s:"},{"type":"paragraph","text":"financial records"},{"type":"paragraph","text":"health information"},{"type":"paragraph","text":"government documents"},{"type":"paragraph","text":"industrial data"},{"type":"paragraph","text":"communications"},{"type":"paragraph","text":"scientific research"},{"type":"paragraph","text":"being processed entirely outside its borders."},{"type":"paragraph","text":"The country may still legally own the information."},{"type":"paragraph","text":"But it may have less control over the infrastructure surrounding it."},{"type":"paragraph","text":"This is why data localization, cloud sovereignty and national computing capacity have become increasingly important policy questions."},{"type":"heading","text":"AI raises the stakes","level":2},{"type":"paragraph","text":"Raw data is useful."},{"type":"paragraph","text":"But AI can transform data into something more powerful."},{"type":"paragraph","text":"A large collection of records can become:"},{"type":"paragraph","text":"patterns"},{"type":"paragraph","text":"predictions"},{"type":"paragraph","text":"models"},{"type":"paragraph","text":"intelligence"},{"type":"paragraph","text":"And once information becomes part of an AI system, the economic value may extend far beyond the original dataset."},{"type":"paragraph","text":"That makes the question increasingly important:"},{"type":"paragraph","text":"Who gets to turn a country''s information into intelligence?"},{"type":"heading","text":"The future may be about data ecosystems","level":2},{"type":"paragraph","text":"Countries may compete not simply to possess data, but to build the infrastructure around it:"},{"type":"paragraph","text":"data centers,"},{"type":"paragraph","text":"cloud platforms,"},{"type":"paragraph","text":"AI models,"},{"type":"paragraph","text":"research institutions,"},{"type":"paragraph","text":"security systems,"},{"type":"paragraph","text":"and companies capable of turning information into products."},{"type":"paragraph","text":"The strategic resource may therefore not be data alone."},{"type":"paragraph","text":"It may be:"},{"type":"paragraph","text":"data + compute + talent + infrastructure."},{"type":"paragraph","text":"That combination is far more powerful."}]'::jsonb, 'EXPLAINED', 1, 'published', 'What Happens When Countries Start Treating Data Like Oil? | Omniv Editorial', 'Oil changed geopolitics because controlling a physical resource could create enormous economic and strategic power. Data is different. You can copy it.', 'https://omniv.media/p/what-happens-when-countries-start-treating-data-like-oil', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"}]'::jsonb, '{}'::text[], '{explained,russia,artificial-intelligence,data-centres,infrastructure}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-infrastructure-wars-nobody-is-talking-about', 'The Infrastructure Wars Nobody Is Talking About', 'There is a visible technology war. AI companies compete. Cloud providers compete.', 'There is a visible technology war.

AI companies compete.

Cloud providers compete.

Chip companies compete.

But underneath them is another competition that receives far less attention.

The race to build the physical infrastructure required to support all of it.

AI needs:

chips

which need:

semiconductor factories

which need:

specialized machinery

which needs:

materials and energy

Then the resulting chips need:

data centers

which need:

power

cooling

fiber

land

construction

Suddenly an AI race looks suspiciously like an industrial race.

Technology history is full of bottlenecks that weren''t glamorous.

A shortage of a component.

A factory that couldn''t expand.

A shipping problem.

A lack of electricity.

A shortage of skilled workers.

A missing supplier.

The company with the best technology can still lose time if the physical system underneath it cannot scale.

That''s why infrastructure can quietly become strategic.

Countries that can combine:

energy

capital

manufacturing

technology

transport

connectivity

and talent

may have an enormous advantage.

The next generation of technology companies will therefore depend on industrial ecosystems much more than many software companies did in the previous era.

The question is no longer simply:

Who has the best technology?

It is:

Who can build enough of the physical world to deploy it?', 'Analysis from the Omniv Editorial desk.', 'There is a visible technology war. AI companies compete. Cloud providers compete.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"There is a visible technology war."},{"type":"paragraph","text":"AI companies compete."},{"type":"paragraph","text":"Cloud providers compete."},{"type":"paragraph","text":"Chip companies compete."},{"type":"paragraph","text":"But underneath them is another competition that receives far less attention."},{"type":"paragraph","text":"The race to build the physical infrastructure required to support all of it."},{"type":"heading","text":"Look at what AI actually needs","level":2},{"type":"paragraph","text":"AI needs:"},{"type":"paragraph","text":"chips"},{"type":"paragraph","text":"which need:"},{"type":"paragraph","text":"semiconductor factories"},{"type":"paragraph","text":"which need:"},{"type":"paragraph","text":"specialized machinery"},{"type":"paragraph","text":"which needs:"},{"type":"paragraph","text":"materials and energy"},{"type":"paragraph","text":"Then the resulting chips need:"},{"type":"paragraph","text":"data centers"},{"type":"paragraph","text":"which need:"},{"type":"paragraph","text":"power"},{"type":"paragraph","text":"cooling"},{"type":"paragraph","text":"fiber"},{"type":"paragraph","text":"land"},{"type":"paragraph","text":"construction"},{"type":"paragraph","text":"Suddenly an AI race looks suspiciously like an industrial race."},{"type":"heading","text":"The bottleneck is often boring","level":2},{"type":"paragraph","text":"Technology history is full of bottlenecks that weren''t glamorous."},{"type":"paragraph","text":"A shortage of a component."},{"type":"paragraph","text":"A factory that couldn''t expand."},{"type":"paragraph","text":"A shipping problem."},{"type":"paragraph","text":"A lack of electricity."},{"type":"paragraph","text":"A shortage of skilled workers."},{"type":"paragraph","text":"A missing supplier."},{"type":"paragraph","text":"The company with the best technology can still lose time if the physical system underneath it cannot scale."},{"type":"paragraph","text":"That''s why infrastructure can quietly become strategic."},{"type":"heading","text":"The new industrial advantage","level":2},{"type":"paragraph","text":"Countries that can combine:"},{"type":"paragraph","text":"energy"},{"type":"paragraph","text":"capital"},{"type":"paragraph","text":"manufacturing"},{"type":"paragraph","text":"technology"},{"type":"paragraph","text":"transport"},{"type":"paragraph","text":"connectivity"},{"type":"paragraph","text":"and talent"},{"type":"paragraph","text":"may have an enormous advantage."},{"type":"paragraph","text":"The next generation of technology companies will therefore depend on industrial ecosystems much more than many software companies did in the previous era."},{"type":"paragraph","text":"The question is no longer simply:"},{"type":"paragraph","text":"Who has the best technology?"},{"type":"paragraph","text":"It is:"},{"type":"paragraph","text":"Who can build enough of the physical world to deploy it?"}]'::jsonb, 'MONEY', 1, 'published', 'The Infrastructure Wars Nobody Is Talking About | Omniv Editorial', 'There is a visible technology war. AI companies compete. Cloud providers compete.', 'https://omniv.media/p/the-infrastructure-wars-nobody-is-talking-about', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"investing","label":"Investing"}]'::jsonb, '{}'::text[], '{money,artificial-intelligence,data-centres,infrastructure,investing}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'ai-is-not-just-a-software-revolution', 'AI Is Not Just a Software Revolution', 'AI began as a software story. Algorithms. Neural networks.', 'AI began as a software story.

Algorithms.

Neural networks.

Models.

Applications.

But that description is becoming incomplete.

AI is increasingly an industrial technology.

The model is what users see.

You type a question.

You receive an answer.

You ask for an image.

It appears.

You give an AI an instruction.

It performs a task.

But underneath the interface are physical systems.

Servers.

Accelerators.

Memory.

Networking.

Cooling.

Data centers.

Electricity.

The distinction becomes even clearer with robotics.

An AI generating text is software.

An AI controlling a warehouse robot is software operating through hardware.

An AI managing a factory is software interacting with machinery.

An autonomous vehicle is software controlling a physical object.

Now errors have physical consequences.

Latency matters.

Sensors matter.

Power matters.

Reliability matters.

The AI economy starts touching manufacturing directly.

The opportunity includes:

chips

robotics

energy

cloud

networking

industrial automation

data centers

cybersecurity

software

logistics

manufacturing

AI isn''t simply creating another software category.

It may become a general-purpose technology layer underneath many industries.

And when that happens, the companies benefiting from it won''t all call themselves AI companies.', 'Analysis from the Omniv Editorial desk.', 'AI began as a software story. Algorithms. Neural networks.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"AI began as a software story."},{"type":"paragraph","text":"Algorithms."},{"type":"paragraph","text":"Neural networks."},{"type":"paragraph","text":"Models."},{"type":"paragraph","text":"Applications."},{"type":"paragraph","text":"But that description is becoming incomplete."},{"type":"paragraph","text":"AI is increasingly an industrial technology."},{"type":"heading","text":"Software sits at the top","level":2},{"type":"paragraph","text":"The model is what users see."},{"type":"paragraph","text":"You type a question."},{"type":"paragraph","text":"You receive an answer."},{"type":"paragraph","text":"You ask for an image."},{"type":"paragraph","text":"It appears."},{"type":"paragraph","text":"You give an AI an instruction."},{"type":"paragraph","text":"It performs a task."},{"type":"paragraph","text":"But underneath the interface are physical systems."},{"type":"paragraph","text":"Servers."},{"type":"paragraph","text":"Accelerators."},{"type":"paragraph","text":"Memory."},{"type":"paragraph","text":"Networking."},{"type":"paragraph","text":"Cooling."},{"type":"paragraph","text":"Data centers."},{"type":"paragraph","text":"Electricity."},{"type":"heading","text":"Then AI enters the physical world","level":2},{"type":"paragraph","text":"The distinction becomes even clearer with robotics."},{"type":"paragraph","text":"An AI generating text is software."},{"type":"paragraph","text":"An AI controlling a warehouse robot is software operating through hardware."},{"type":"paragraph","text":"An AI managing a factory is software interacting with machinery."},{"type":"paragraph","text":"An autonomous vehicle is software controlling a physical object."},{"type":"paragraph","text":"Now errors have physical consequences."},{"type":"paragraph","text":"Latency matters."},{"type":"paragraph","text":"Sensors matter."},{"type":"paragraph","text":"Power matters."},{"type":"paragraph","text":"Reliability matters."},{"type":"paragraph","text":"The AI economy starts touching manufacturing directly."},{"type":"heading","text":"That''s why the AI market is bigger than AI companies","level":2},{"type":"paragraph","text":"The opportunity includes:"},{"type":"paragraph","text":"chips"},{"type":"paragraph","text":"robotics"},{"type":"paragraph","text":"energy"},{"type":"paragraph","text":"cloud"},{"type":"paragraph","text":"networking"},{"type":"paragraph","text":"industrial automation"},{"type":"paragraph","text":"data centers"},{"type":"paragraph","text":"cybersecurity"},{"type":"paragraph","text":"software"},{"type":"paragraph","text":"logistics"},{"type":"paragraph","text":"manufacturing"},{"type":"paragraph","text":"AI isn''t simply creating another software category."},{"type":"paragraph","text":"It may become a general-purpose technology layer underneath many industries."},{"type":"paragraph","text":"And when that happens, the companies benefiting from it won''t all call themselves AI companies."}]'::jsonb, 'TECHNOLOGY', 1, 'published', 'AI Is Not Just a Software Revolution | Omniv Editorial', 'AI began as a software story. Algorithms. Neural networks.', 'https://omniv.media/p/ai-is-not-just-a-software-revolution', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"biology","label":"Biology"},{"type":"project","slug":"brain-science","label":"Brain Science"}]'::jsonb, '{}'::text[], '{technology,artificial-intelligence,data-centres,infrastructure,biology,brain-science}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-race-to-control-the-ai-infrastructure-layer', 'The Race to Control the AI Infrastructure Layer', 'The public sees AI through applications. Chatbots. Image generators.', 'The public sees AI through applications.

Chatbots.

Image generators.

Coding assistants.

Search.

But the deeper competition is happening underneath.

Who controls the infrastructure?

Advanced accelerators are essential to modern AI.

Whoever has access to large quantities of high-performance compute has an enormous advantage.

But compute isn''t simply about owning chips.

You need somewhere to put them.

A chip sitting in a warehouse produces nothing.

It needs a data center.

That means construction capacity becomes part of AI strategy.

Then the data center needs power.

Large AI facilities can create significant local electricity demand, making grid availability increasingly important.

The machines must communicate.

That requires high-speed networking inside facilities and connectivity between facilities.

Only then do you get the software infrastructure that turns all this hardware into usable AI capacity.

The result is a stack:

Energy → Data centers → Compute → Networks → Models → Applications

The companies that control different layers may have very different economics.

And the biggest AI businesses of the future may not all sit at the application layer.', 'Analysis from the Omniv Editorial desk.', 'The public sees AI through applications. Chatbots. Image generators.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"The public sees AI through applications."},{"type":"paragraph","text":"Chatbots."},{"type":"paragraph","text":"Image generators."},{"type":"paragraph","text":"Coding assistants."},{"type":"paragraph","text":"Search."},{"type":"paragraph","text":"But the deeper competition is happening underneath."},{"type":"paragraph","text":"Who controls the infrastructure?"},{"type":"heading","text":"Layer one: compute","level":2},{"type":"paragraph","text":"Advanced accelerators are essential to modern AI."},{"type":"paragraph","text":"Whoever has access to large quantities of high-performance compute has an enormous advantage."},{"type":"paragraph","text":"But compute isn''t simply about owning chips."},{"type":"paragraph","text":"You need somewhere to put them."},{"type":"heading","text":"Layer two: data centers","level":2},{"type":"paragraph","text":"A chip sitting in a warehouse produces nothing."},{"type":"paragraph","text":"It needs a data center."},{"type":"paragraph","text":"That means construction capacity becomes part of AI strategy."},{"type":"heading","text":"Layer three: electricity","level":2},{"type":"paragraph","text":"Then the data center needs power."},{"type":"paragraph","text":"Large AI facilities can create significant local electricity demand, making grid availability increasingly important."},{"type":"heading","text":"Layer four: networks","level":2},{"type":"paragraph","text":"The machines must communicate."},{"type":"paragraph","text":"That requires high-speed networking inside facilities and connectivity between facilities."},{"type":"heading","text":"Layer five: software","level":2},{"type":"paragraph","text":"Only then do you get the software infrastructure that turns all this hardware into usable AI capacity."},{"type":"paragraph","text":"The result is a stack:"},{"type":"paragraph","text":"Energy → Data centers → Compute → Networks → Models → Applications"},{"type":"paragraph","text":"The companies that control different layers may have very different economics."},{"type":"paragraph","text":"And the biggest AI businesses of the future may not all sit at the application layer."}]'::jsonb, 'TECHNOLOGY', 1, 'published', 'The Race to Control the AI Infrastructure Layer | Omniv Editorial', 'The public sees AI through applications. Chatbots. Image generators.', 'https://omniv.media/p/the-race-to-control-the-ai-infrastructure-layer', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"}]'::jsonb, '{}'::text[], '{technology,artificial-intelligence,data-centres,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'why-ai-needs-more-than-better-models', 'Why AI Needs More Than Better Models', 'There is a seductive idea in AI: Build a smarter model and everything follows. But intelligence doesn''t exist in isolation.', 'There is a seductive idea in AI:

Build a smarter model and everything follows.

But intelligence doesn''t exist in isolation.

A model needs:

compute

data

energy

memory

networking

software

distribution

and increasingly, tools that allow it to act.

Suppose a new model is twice as useful.

People use it more.

Companies integrate it into more workflows.

Agents run it continuously.

Robots use it.

Businesses automate additional processes.

The result?

More computation.

Better AI can therefore increase infrastructure demand.

Consider a company building an AI coding system.

It needs:

models

inference infrastructure

databases

identity

security

developer tools

APIs

distribution

monitoring

The model may be the most visible component.

It isn''t necessarily the whole product.

The biggest AI businesses may emerge around the model layer.

Companies that provide:

compute

data

security

orchestration

agents

specialized software

industry-specific infrastructure

could become extremely important.

The question isn''t:

Who has the smartest model?

It''s:

Who turns intelligence into something the economy can actually use?', 'Analysis from the Omniv Editorial desk.', 'There is a seductive idea in AI: Build a smarter model and everything follows. But intelligence doesn''t exist in isolation.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"There is a seductive idea in AI:"},{"type":"paragraph","text":"Build a smarter model and everything follows."},{"type":"paragraph","text":"But intelligence doesn''t exist in isolation."},{"type":"paragraph","text":"A model needs:"},{"type":"paragraph","text":"compute"},{"type":"paragraph","text":"data"},{"type":"paragraph","text":"energy"},{"type":"paragraph","text":"memory"},{"type":"paragraph","text":"networking"},{"type":"paragraph","text":"software"},{"type":"paragraph","text":"distribution"},{"type":"paragraph","text":"and increasingly, tools that allow it to act."},{"type":"heading","text":"A smarter model can create more demand","level":2},{"type":"paragraph","text":"Suppose a new model is twice as useful."},{"type":"paragraph","text":"People use it more."},{"type":"paragraph","text":"Companies integrate it into more workflows."},{"type":"paragraph","text":"Agents run it continuously."},{"type":"paragraph","text":"Robots use it."},{"type":"paragraph","text":"Businesses automate additional processes."},{"type":"paragraph","text":"The result?"},{"type":"paragraph","text":"More computation."},{"type":"paragraph","text":"Better AI can therefore increase infrastructure demand."},{"type":"heading","text":"The model is only one component","level":2},{"type":"paragraph","text":"Consider a company building an AI coding system."},{"type":"paragraph","text":"It needs:"},{"type":"paragraph","text":"models"},{"type":"paragraph","text":"inference infrastructure"},{"type":"paragraph","text":"databases"},{"type":"paragraph","text":"identity"},{"type":"paragraph","text":"security"},{"type":"paragraph","text":"developer tools"},{"type":"paragraph","text":"APIs"},{"type":"paragraph","text":"distribution"},{"type":"paragraph","text":"monitoring"},{"type":"paragraph","text":"The model may be the most visible component."},{"type":"paragraph","text":"It isn''t necessarily the whole product."},{"type":"heading","text":"That''s the opportunity","level":2},{"type":"paragraph","text":"The biggest AI businesses may emerge around the model layer."},{"type":"paragraph","text":"Companies that provide:"},{"type":"paragraph","text":"compute"},{"type":"paragraph","text":"data"},{"type":"paragraph","text":"security"},{"type":"paragraph","text":"orchestration"},{"type":"paragraph","text":"agents"},{"type":"paragraph","text":"specialized software"},{"type":"paragraph","text":"industry-specific infrastructure"},{"type":"paragraph","text":"could become extremely important."},{"type":"paragraph","text":"The question isn''t:"},{"type":"paragraph","text":"Who has the smartest model?"},{"type":"paragraph","text":"It''s:"},{"type":"paragraph","text":"Who turns intelligence into something the economy can actually use?"}]'::jsonb, 'TECHNOLOGY', 1, 'published', 'Why AI Needs More Than Better Models | Omniv Editorial', 'There is a seductive idea in AI: Build a smarter model and everything follows. But intelligence doesn''t exist in isolation.', 'https://omniv.media/p/why-ai-needs-more-than-better-models', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"brain-science","label":"Brain Science"}]'::jsonb, '{}'::text[], '{technology,artificial-intelligence,data-centres,infrastructure,startups,brain-science}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'who-actually-makes-money-when-ai-becomes-cheaper', 'Who Actually Makes Money When AI Becomes Cheaper?', 'This is one of the most important questions in the AI economy. Suppose AI inference becomes dramatically cheaper. Who wins?', 'This is one of the most important questions in the AI economy.

Suppose AI inference becomes dramatically cheaper.

Who wins?

The obvious answer is:

Everyone using AI.

But markets rarely work that simply.

Imagine AI computation becomes 90% cheaper.

An application company can now serve customers for much less.

That sounds fantastic.

But its competitors can also do the same.

So the cost advantage may eventually disappear.

Prices can fall.

Margins can compress.

The consumer captures some of the benefit.

It may move toward businesses that control scarce resources.

For example:

distribution

proprietary data

customer relationships

specialized infrastructure

brand

workflow integration

physical assets

If intelligence becomes abundant, scarcity moves elsewhere.

Computing became cheaper.

Storage became cheaper.

Bandwidth became cheaper.

But companies didn''t stop making money.

The economic value shifted.

New businesses appeared around the cheaper resource.

AI may follow the same pattern.

The biggest question isn''t:

How cheap will intelligence become?

It''s:

What becomes scarce after intelligence becomes cheap?

That may be where the next fortunes are built.', 'Analysis from the Omniv Editorial desk.', 'This is one of the most important questions in the AI economy. Suppose AI inference becomes dramatically cheaper. Who wins?', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"This is one of the most important questions in the AI economy."},{"type":"paragraph","text":"Suppose AI inference becomes dramatically cheaper."},{"type":"paragraph","text":"Who wins?"},{"type":"paragraph","text":"The obvious answer is:"},{"type":"paragraph","text":"Everyone using AI."},{"type":"paragraph","text":"But markets rarely work that simply."},{"type":"heading","text":"Cheaper inputs can destroy old economics","level":2},{"type":"paragraph","text":"Imagine AI computation becomes 90% cheaper."},{"type":"paragraph","text":"An application company can now serve customers for much less."},{"type":"paragraph","text":"That sounds fantastic."},{"type":"paragraph","text":"But its competitors can also do the same."},{"type":"paragraph","text":"So the cost advantage may eventually disappear."},{"type":"paragraph","text":"Prices can fall."},{"type":"paragraph","text":"Margins can compress."},{"type":"paragraph","text":"The consumer captures some of the benefit."},{"type":"heading","text":"Where does the value move?","level":2},{"type":"paragraph","text":"It may move toward businesses that control scarce resources."},{"type":"paragraph","text":"For example:"},{"type":"paragraph","text":"distribution"},{"type":"paragraph","text":"proprietary data"},{"type":"paragraph","text":"customer relationships"},{"type":"paragraph","text":"specialized infrastructure"},{"type":"paragraph","text":"brand"},{"type":"paragraph","text":"workflow integration"},{"type":"paragraph","text":"physical assets"},{"type":"paragraph","text":"If intelligence becomes abundant, scarcity moves elsewhere."},{"type":"heading","text":"This has happened before","level":2},{"type":"paragraph","text":"Computing became cheaper."},{"type":"paragraph","text":"Storage became cheaper."},{"type":"paragraph","text":"Bandwidth became cheaper."},{"type":"paragraph","text":"But companies didn''t stop making money."},{"type":"paragraph","text":"The economic value shifted."},{"type":"paragraph","text":"New businesses appeared around the cheaper resource."},{"type":"paragraph","text":"AI may follow the same pattern."},{"type":"paragraph","text":"The biggest question isn''t:"},{"type":"paragraph","text":"How cheap will intelligence become?"},{"type":"paragraph","text":"It''s:"},{"type":"paragraph","text":"What becomes scarce after intelligence becomes cheap?"},{"type":"paragraph","text":"That may be where the next fortunes are built."}]'::jsonb, 'TECHNOLOGY', 1, 'published', 'Who Actually Makes Money When AI Becomes Cheaper? | Omniv Editorial', 'This is one of the most important questions in the AI economy. Suppose AI inference becomes dramatically cheaper. Who wins?', 'https://omniv.media/p/who-actually-makes-money-when-ai-becomes-cheaper', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"}]'::jsonb, '{}'::text[], '{technology,russia,artificial-intelligence,infrastructure,startups,investing}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-coming-battle-over-ai-compute', 'The Coming Battle Over AI Compute', 'There is a simple reason compute matters: You cannot run AI without it. And the more capable AI becomes, the more important the underlying computational system becomes.', 'There is a simple reason compute matters:

You cannot run AI without it.

And the more capable AI becomes, the more important the underlying computational system becomes.

There is training compute.

Inference compute.

Specialized accelerators.

General-purpose processors.

Edge compute.

Cloud compute.

Private compute.

Different workloads need different systems.

That creates an enormous market underneath AI applications.

If compute is limited, companies need to secure it.

That can mean:

long-term contracts

dedicated infrastructure

cloud partnerships

data-center construction

custom chips

optimization

alternative architectures

The AI race therefore includes a supply-chain race.

Compute is becoming strategically important enough that governments are paying increasing attention to semiconductor supply chains, AI infrastructure and access to advanced technology.

That means compute isn''t simply a commercial resource.

It is increasingly connected to national competitiveness.

If intelligence becomes a fundamental input into the economy, then access to computation becomes analogous to access to other strategic infrastructure.

The important question becomes:

Who gets enough compute to build at scale?', 'Analysis from the Omniv Editorial desk.', 'There is a simple reason compute matters: You cannot run AI without it. And the more capable AI becomes, the more important the underlying computational system becomes.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"There is a simple reason compute matters:"},{"type":"paragraph","text":"You cannot run AI without it."},{"type":"paragraph","text":"And the more capable AI becomes, the more important the underlying computational system becomes."},{"type":"heading","text":"Compute is not one thing","level":2},{"type":"paragraph","text":"There is training compute."},{"type":"paragraph","text":"Inference compute."},{"type":"paragraph","text":"Specialized accelerators."},{"type":"paragraph","text":"General-purpose processors."},{"type":"paragraph","text":"Edge compute."},{"type":"paragraph","text":"Cloud compute."},{"type":"paragraph","text":"Private compute."},{"type":"paragraph","text":"Different workloads need different systems."},{"type":"paragraph","text":"That creates an enormous market underneath AI applications."},{"type":"heading","text":"Scarcity creates strategy","level":2},{"type":"paragraph","text":"If compute is limited, companies need to secure it."},{"type":"paragraph","text":"That can mean:"},{"type":"paragraph","text":"long-term contracts"},{"type":"paragraph","text":"dedicated infrastructure"},{"type":"paragraph","text":"cloud partnerships"},{"type":"paragraph","text":"data-center construction"},{"type":"paragraph","text":"custom chips"},{"type":"paragraph","text":"optimization"},{"type":"paragraph","text":"alternative architectures"},{"type":"paragraph","text":"The AI race therefore includes a supply-chain race."},{"type":"heading","text":"And governments care","level":2},{"type":"paragraph","text":"Compute is becoming strategically important enough that governments are paying increasing attention to semiconductor supply chains, AI infrastructure and access to advanced technology."},{"type":"paragraph","text":"That means compute isn''t simply a commercial resource."},{"type":"paragraph","text":"It is increasingly connected to national competitiveness."},{"type":"heading","text":"The next question","level":2},{"type":"paragraph","text":"If intelligence becomes a fundamental input into the economy, then access to computation becomes analogous to access to other strategic infrastructure."},{"type":"paragraph","text":"The important question becomes:"},{"type":"paragraph","text":"Who gets enough compute to build at scale?"}]'::jsonb, 'TECHNOLOGY', 1, 'published', 'The Coming Battle Over AI Compute | Omniv Editorial', 'There is a simple reason compute matters: You cannot run AI without it. And the more capable AI becomes, the more important the underlying computational system becomes.', 'https://omniv.media/p/the-coming-battle-over-ai-compute', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"}]'::jsonb, '{}'::text[], '{technology,global-supply-chains,artificial-intelligence,data-centres,infrastructure}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'why-data-centers-may-matter-more-than-ai-startups', 'Why Data Centers May Matter More Than AI Startups', 'Every AI startup needs somewhere to run. That creates an interesting inversion. The startup may receive the attention.', 'Every AI startup needs somewhere to run.

That creates an interesting inversion.

The startup may receive the attention.

The infrastructure provider may quietly collect the economics.

Imagine hundreds of AI companies operating from the same region.

They all need:

cloud capacity,

servers,

networking,

electricity,

cooling,

storage.

Many companies compete above the infrastructure.

But the infrastructure itself serves all of them.

That''s why infrastructure businesses can become powerful.

The internet created enormous businesses around infrastructure.

Cloud computing became one of the defining layers of modern software.

AI could create an even larger infrastructure demand.

Data centers become physical platforms.

They provide the environment where computational businesses operate.

Data centers are capital intensive.

They require:

land,

construction,

power,

cooling,

hardware,

financing,

maintenance.

That makes them harder to build than ordinary software.

Which is precisely why barriers to entry can be higher.

If AI demand continues growing, the valuable question may not always be:

Which AI startup wins?

It could be:

Who owns the infrastructure that every AI startup needs?', 'Analysis from the Omniv Editorial desk.', 'Every AI startup needs somewhere to run. That creates an interesting inversion. The startup may receive the attention.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"Every AI startup needs somewhere to run."},{"type":"paragraph","text":"That creates an interesting inversion."},{"type":"paragraph","text":"The startup may receive the attention."},{"type":"paragraph","text":"The infrastructure provider may quietly collect the economics."},{"type":"heading","text":"Think about a city","level":2},{"type":"paragraph","text":"Imagine hundreds of AI companies operating from the same region."},{"type":"paragraph","text":"They all need:"},{"type":"paragraph","text":"cloud capacity,"},{"type":"paragraph","text":"servers,"},{"type":"paragraph","text":"networking,"},{"type":"paragraph","text":"electricity,"},{"type":"paragraph","text":"cooling,"},{"type":"paragraph","text":"storage."},{"type":"paragraph","text":"Many companies compete above the infrastructure."},{"type":"paragraph","text":"But the infrastructure itself serves all of them."},{"type":"paragraph","text":"That''s why infrastructure businesses can become powerful."},{"type":"heading","text":"The platform underneath the platforms","level":2},{"type":"paragraph","text":"The internet created enormous businesses around infrastructure."},{"type":"paragraph","text":"Cloud computing became one of the defining layers of modern software."},{"type":"paragraph","text":"AI could create an even larger infrastructure demand."},{"type":"paragraph","text":"Data centers become physical platforms."},{"type":"paragraph","text":"They provide the environment where computational businesses operate."},{"type":"heading","text":"But there is a catch","level":2},{"type":"paragraph","text":"Data centers are capital intensive."},{"type":"paragraph","text":"They require:"},{"type":"paragraph","text":"land,"},{"type":"paragraph","text":"construction,"},{"type":"paragraph","text":"power,"},{"type":"paragraph","text":"cooling,"},{"type":"paragraph","text":"hardware,"},{"type":"paragraph","text":"financing,"},{"type":"paragraph","text":"maintenance."},{"type":"paragraph","text":"That makes them harder to build than ordinary software."},{"type":"paragraph","text":"Which is precisely why barriers to entry can be higher."},{"type":"heading","text":"The long-term question","level":2},{"type":"paragraph","text":"If AI demand continues growing, the valuable question may not always be:"},{"type":"paragraph","text":"Which AI startup wins?"},{"type":"paragraph","text":"It could be:"},{"type":"paragraph","text":"Who owns the infrastructure that every AI startup needs?"}]'::jsonb, 'TECHNOLOGY', 1, 'published', 'Why Data Centers May Matter More Than AI Startups | Omniv Editorial', 'Every AI startup needs somewhere to run. That creates an interesting inversion. The startup may receive the attention.', 'https://omniv.media/p/why-data-centers-may-matter-more-than-ai-startups', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"}]'::jsonb, '{}'::text[], '{technology,russia,artificial-intelligence,data-centres,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'what-happens-when-intelligence-becomes-cheap', 'What Happens When Intelligence Becomes Cheap?', 'Imagine a world where intelligence is no longer expensive. You can have an AI researcher. An AI lawyer.', 'Imagine a world where intelligence is no longer expensive.

You can have an AI researcher.

An AI lawyer.

An AI programmer.

An AI analyst.

An AI teacher.

An AI designer.

An AI customer-service agent.

An AI financial assistant.

All available almost instantly.

What happens?

If everyone has access to capable AI, simply having AI becomes meaningless.

It becomes like having internet access.

Useful.

Necessary.

But not unique.

What becomes valuable?

Trust.

Distribution.

Relationships.

Data.

Capital.

Physical infrastructure.

Brand.

Execution.

Access to customers.

This is why AI may ultimately make some human and organizational advantages more valuable rather than less.

When intelligence becomes abundant, knowing what to do may become more important.

Everyone can generate:

100 ideas.

50 strategies.

20 business plans.

1,000 marketing posts.

The scarce resource becomes:

judgment.

Which one matters?

Which one is worth doing?

Which one creates leverage?

Which one should be ignored?

The future may not be:

Humans disappear because AI is intelligent.

It may be:

Humans become responsible for directing increasingly abundant intelligence.

The economic advantage goes to people and organizations that can turn that intelligence into outcomes.', 'Analysis from the Omniv Editorial desk.', 'Imagine a world where intelligence is no longer expensive. You can have an AI researcher. An AI lawyer.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"Imagine a world where intelligence is no longer expensive."},{"type":"paragraph","text":"You can have an AI researcher."},{"type":"paragraph","text":"An AI lawyer."},{"type":"paragraph","text":"An AI programmer."},{"type":"paragraph","text":"An AI analyst."},{"type":"paragraph","text":"An AI teacher."},{"type":"paragraph","text":"An AI designer."},{"type":"paragraph","text":"An AI customer-service agent."},{"type":"paragraph","text":"An AI financial assistant."},{"type":"paragraph","text":"All available almost instantly."},{"type":"paragraph","text":"What happens?"},{"type":"heading","text":"The first consequence: intelligence stops being the differentiator","level":2},{"type":"paragraph","text":"If everyone has access to capable AI, simply having AI becomes meaningless."},{"type":"paragraph","text":"It becomes like having internet access."},{"type":"paragraph","text":"Useful."},{"type":"paragraph","text":"Necessary."},{"type":"paragraph","text":"But not unique."},{"type":"heading","text":"Then scarcity moves","level":2},{"type":"paragraph","text":"What becomes valuable?"},{"type":"paragraph","text":"Trust."},{"type":"paragraph","text":"Distribution."},{"type":"paragraph","text":"Relationships."},{"type":"paragraph","text":"Data."},{"type":"paragraph","text":"Capital."},{"type":"paragraph","text":"Physical infrastructure."},{"type":"paragraph","text":"Brand."},{"type":"paragraph","text":"Execution."},{"type":"paragraph","text":"Access to customers."},{"type":"paragraph","text":"This is why AI may ultimately make some human and organizational advantages more valuable rather than less."},{"type":"heading","text":"The paradox of abundance","level":2},{"type":"paragraph","text":"When intelligence becomes abundant, knowing what to do may become more important."},{"type":"paragraph","text":"Everyone can generate:"},{"type":"paragraph","text":"100 ideas."},{"type":"paragraph","text":"50 strategies."},{"type":"paragraph","text":"20 business plans."},{"type":"paragraph","text":"1,000 marketing posts."},{"type":"paragraph","text":"The scarce resource becomes:"},{"type":"paragraph","text":"judgment."},{"type":"paragraph","text":"Which one matters?"},{"type":"paragraph","text":"Which one is worth doing?"},{"type":"paragraph","text":"Which one creates leverage?"},{"type":"paragraph","text":"Which one should be ignored?"},{"type":"heading","text":"That changes the nature of work","level":2},{"type":"paragraph","text":"The future may not be:"},{"type":"paragraph","text":"Humans disappear because AI is intelligent."},{"type":"paragraph","text":"It may be:"},{"type":"paragraph","text":"Humans become responsible for directing increasingly abundant intelligence."},{"type":"paragraph","text":"The economic advantage goes to people and organizations that can turn that intelligence into outcomes."}]'::jsonb, 'TECHNOLOGY', 1, 'published', 'What Happens When Intelligence Becomes Cheap? | Omniv Editorial', 'Imagine a world where intelligence is no longer expensive. You can have an AI researcher. An AI lawyer.', 'https://omniv.media/p/what-happens-when-intelligence-becomes-cheap', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"}]'::jsonb, '{}'::text[], '{technology,artificial-intelligence,infrastructure,startups,investing}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-ai-companies-building-the-models-vs-the-companies-building-everything-arou', 'The AI Companies Building the Models vs. the Companies Building Everything Around Them', 'The AI market is often presented as a battle between model companies. But there are actually several businesses hiding inside the AI economy. They build foundation models.', 'The AI market is often presented as a battle between model companies.

But there are actually several businesses hiding inside the AI economy.

They build foundation models.

Their advantage may come from:

research,

data,

compute,

talent,

capital,

and scale.

They provide:

compute,

cloud,

data centers,

networking,

storage,

security.

They don''t necessarily need to win the model race.

They can benefit from multiple model companies growing simultaneously.

These take AI and embed it into a workflow.

A legal system.

A hospital.

A factory.

A bank.

A design platform.

A logistics company.

The customer may not care which model powers it.

They care whether the product works.

Then there are organizations whose advantage comes from proprietary information.

If the model becomes commoditized, proprietary data may become more important.

And finally:

companies that already own customer relationships.

They can integrate AI into existing products and immediately distribute it to millions of users.

This creates a fascinating possibility:

The companies best positioned to capture AI value may not be the companies that invent the smartest AI.

They may be the companies that control the path between intelligence and customers.', 'Analysis from the Omniv Editorial desk.', 'The AI market is often presented as a battle between model companies. But there are actually several businesses hiding inside the AI economy. They build foundation models.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"The AI market is often presented as a battle between model companies."},{"type":"paragraph","text":"But there are actually several businesses hiding inside the AI economy."},{"type":"heading","text":"Model companies","level":2},{"type":"paragraph","text":"They build foundation models."},{"type":"paragraph","text":"Their advantage may come from:"},{"type":"paragraph","text":"research,"},{"type":"paragraph","text":"data,"},{"type":"paragraph","text":"compute,"},{"type":"paragraph","text":"talent,"},{"type":"paragraph","text":"capital,"},{"type":"paragraph","text":"and scale."},{"type":"heading","text":"Infrastructure companies","level":2},{"type":"paragraph","text":"They provide:"},{"type":"paragraph","text":"compute,"},{"type":"paragraph","text":"cloud,"},{"type":"paragraph","text":"data centers,"},{"type":"paragraph","text":"networking,"},{"type":"paragraph","text":"storage,"},{"type":"paragraph","text":"security."},{"type":"paragraph","text":"They don''t necessarily need to win the model race."},{"type":"paragraph","text":"They can benefit from multiple model companies growing simultaneously."},{"type":"heading","text":"Application companies","level":2},{"type":"paragraph","text":"These take AI and embed it into a workflow."},{"type":"paragraph","text":"A legal system."},{"type":"paragraph","text":"A hospital."},{"type":"paragraph","text":"A factory."},{"type":"paragraph","text":"A bank."},{"type":"paragraph","text":"A design platform."},{"type":"paragraph","text":"A logistics company."},{"type":"paragraph","text":"The customer may not care which model powers it."},{"type":"paragraph","text":"They care whether the product works."},{"type":"heading","text":"Data companies","level":2},{"type":"paragraph","text":"Then there are organizations whose advantage comes from proprietary information."},{"type":"paragraph","text":"If the model becomes commoditized, proprietary data may become more important."},{"type":"heading","text":"Distribution companies","level":2},{"type":"paragraph","text":"And finally:"},{"type":"paragraph","text":"companies that already own customer relationships."},{"type":"paragraph","text":"They can integrate AI into existing products and immediately distribute it to millions of users."},{"type":"paragraph","text":"This creates a fascinating possibility:"},{"type":"paragraph","text":"The companies best positioned to capture AI value may not be the companies that invent the smartest AI."},{"type":"paragraph","text":"They may be the companies that control the path between intelligence and customers."}]'::jsonb, 'TECHNOLOGY', 1, 'published', 'The AI Companies Building the Models vs. the Companies Building Everything Around Them | Omniv Editorial', 'The AI market is often presented as a battle between model companies. But there are actually several businesses hiding inside the AI economy. They build foundation models.', 'https://omniv.media/p/the-ai-companies-building-the-models-vs-the-companies-building-everything-arou', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"}]'::jsonb, '{}'::text[], '{technology,artificial-intelligence,data-centres,startups,investing}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'why-every-country-wants-its-own-ai-stack', 'Why Every Country Wants Its Own AI Stack', 'There was a time when governments could treat software as something largely supplied by the private sector. AI is making that increasingly difficult. Because AI is becoming relevant to:', 'There was a time when governments could treat software as something largely supplied by the private sector.

AI is making that increasingly difficult.

Because AI is becoming relevant to:

defense,

education,

healthcare,

research,

industry,

government,

finance,

communications.

That creates a strategic question.

How dependent should a country be on AI infrastructure controlled elsewhere?

A country doesn''t necessarily need to build everything itself.

But it may want capabilities across several layers:

Data

↓

Compute

↓

Models

↓

Applications

↓

Talent

↓

Infrastructure

This is what people increasingly mean when they discuss AI sovereignty.

A country can still use foreign technology.

The question is whether it has alternatives when necessary.

Can it run critical workloads?

Can it protect sensitive data?

Can it train or fine-tune important models?

Can it access enough compute?

Can it develop domestic expertise?

Can its companies participate in the infrastructure economy?

These questions become increasingly important as AI becomes embedded in national systems.

African countries could simply become consumers of foreign AI systems.

Or they could build meaningful pieces of the stack.

That could mean:

local data infrastructure,

regional cloud,

African language models,

specialized AI applications,

energy systems,

data centers,

research institutions,

and companies serving African industries.

The opportunity isn''t necessarily to build an African version of everything.

It is to determine which layers Africa cannot afford to outsource completely.', 'Analysis from the Omniv Editorial desk.', 'There was a time when governments could treat software as something largely supplied by the private sector. AI is making that increasingly difficult. Because AI is becoming relevant to:', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"There was a time when governments could treat software as something largely supplied by the private sector."},{"type":"paragraph","text":"AI is making that increasingly difficult."},{"type":"paragraph","text":"Because AI is becoming relevant to:"},{"type":"paragraph","text":"defense,"},{"type":"paragraph","text":"education,"},{"type":"paragraph","text":"healthcare,"},{"type":"paragraph","text":"research,"},{"type":"paragraph","text":"industry,"},{"type":"paragraph","text":"government,"},{"type":"paragraph","text":"finance,"},{"type":"paragraph","text":"communications."},{"type":"paragraph","text":"That creates a strategic question."},{"type":"paragraph","text":"How dependent should a country be on AI infrastructure controlled elsewhere?"},{"type":"heading","text":"The national AI stack","level":2},{"type":"paragraph","text":"A country doesn''t necessarily need to build everything itself."},{"type":"paragraph","text":"But it may want capabilities across several layers:"},{"type":"paragraph","text":"Data"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Compute"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Models"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Applications"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Talent"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Infrastructure"},{"type":"paragraph","text":"This is what people increasingly mean when they discuss AI sovereignty."},{"type":"heading","text":"Sovereignty doesn''t mean isolation","level":2},{"type":"paragraph","text":"A country can still use foreign technology."},{"type":"paragraph","text":"The question is whether it has alternatives when necessary."},{"type":"paragraph","text":"Can it run critical workloads?"},{"type":"paragraph","text":"Can it protect sensitive data?"},{"type":"paragraph","text":"Can it train or fine-tune important models?"},{"type":"paragraph","text":"Can it access enough compute?"},{"type":"paragraph","text":"Can it develop domestic expertise?"},{"type":"paragraph","text":"Can its companies participate in the infrastructure economy?"},{"type":"paragraph","text":"These questions become increasingly important as AI becomes embedded in national systems."},{"type":"heading","text":"Africa has a particularly interesting decision","level":2},{"type":"paragraph","text":"African countries could simply become consumers of foreign AI systems."},{"type":"paragraph","text":"Or they could build meaningful pieces of the stack."},{"type":"paragraph","text":"That could mean:"},{"type":"paragraph","text":"local data infrastructure,"},{"type":"paragraph","text":"regional cloud,"},{"type":"paragraph","text":"African language models,"},{"type":"paragraph","text":"specialized AI applications,"},{"type":"paragraph","text":"energy systems,"},{"type":"paragraph","text":"data centers,"},{"type":"paragraph","text":"research institutions,"},{"type":"paragraph","text":"and companies serving African industries."},{"type":"paragraph","text":"The opportunity isn''t necessarily to build an African version of everything."},{"type":"paragraph","text":"It is to determine which layers Africa cannot afford to outsource completely."}]'::jsonb, 'TECHNOLOGY', 1, 'published', 'Why Every Country Wants Its Own AI Stack | Omniv Editorial', 'There was a time when governments could treat software as something largely supplied by the private sector. AI is making that increasingly difficult. Because AI is becoming relevant to:', 'https://omniv.media/p/why-every-country-wants-its-own-ai-stack', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"africa","label":"Africa"}]'::jsonb, '{}'::text[], '{technology,artificial-intelligence,data-centres,infrastructure,africa}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-geopolitics-of-artificial-intelligence', 'The Geopolitics of Artificial Intelligence', 'AI is often described as the next technology revolution. But it is also becoming a geopolitical one. Because advanced AI depends on things that governments already care deeply about:', 'AI is often described as the next technology revolution.

But it is also becoming a geopolitical one.

Because advanced AI depends on things that governments already care deeply about:

chips

energy

data

talent

capital

manufacturing

infrastructure

and national security.

A country can have brilliant researchers and still struggle to compete if it cannot access the necessary hardware.

A country can have chips but lack electricity.

A country can have electricity but lack advanced semiconductor manufacturing.

A country can have all of those and still lack enough talent.

The advantage comes from combining the stack.

Technology supply chains increasingly cross borders.

A semiconductor may involve:

design in one country,

equipment from another,

manufacturing somewhere else,

packaging elsewhere,

and final deployment in another region.

AI therefore connects countries through complex dependencies.

And those dependencies can become geopolitical leverage.

Oil once shaped industrial power.

Semiconductors became central to modern electronics.

Now compute is becoming increasingly important to AI.

But compute itself depends on the physical world.

Which brings us back to:

energy

factories

data centers

networks

capital

The geopolitical AI map is therefore also an industrial map.

These fifteen articles shouldn''t live as isolated pieces on Omniv.

Together, they form a single Technology → Infrastructure → AI universe:

The Physical Internet ↓ Energy ↓ Computing Geography ↓ Data Sovereignty ↓ Infrastructure Competition ↓ AI Infrastructure ↓ Compute ↓ Data Centers ↓ Cheap Intelligence ↓ AI Value Capture ↓ National AI Stacks ↓ AI Geopolitics

And that is exactly the type of interconnected publishing experience I want Omniv to surface.

A reader finishes:

Why Energy Could Become the Bottleneck for Technology

and Omniv shouldn''t simply say "Thanks for reading."

It should immediately offer:

The New Geography of Computing Why the location of computing is becoming strategically important.

The Coming Battle Over AI Compute Why access to computation may determine who can build at scale.

Why Data Centers May Matter More Than AI Startups The infrastructure underneath the AI boom.

The Geopolitics of Artificial Intelligence Why AI is becoming a competition between states as well as companies.

That is where the Omniv discovery engine starts becoming part of the content itself: every publication is a doorway into a larger knowledge graph rather than a dead-end blog post.

Absolutely. I’d make these a connected Omniv Investing universe, not ten generic finance articles. The reader should move from “What is value?” → “How do investors evaluate assets?” → “Why infrastructure/energy/Africa?” → “How do entire industries get repriced?”

I’ll start with Article 1 at full long-form depth, then we can move through 2–10 in order.', 'Analysis from the Omniv Editorial desk.', 'AI is often described as the next technology revolution. But it is also becoming a geopolitical one. Because advanced AI depends on things that governments already care deeply about:', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"AI is often described as the next technology revolution."},{"type":"paragraph","text":"But it is also becoming a geopolitical one."},{"type":"paragraph","text":"Because advanced AI depends on things that governments already care deeply about:"},{"type":"paragraph","text":"chips"},{"type":"paragraph","text":"energy"},{"type":"paragraph","text":"data"},{"type":"paragraph","text":"talent"},{"type":"paragraph","text":"capital"},{"type":"paragraph","text":"manufacturing"},{"type":"paragraph","text":"infrastructure"},{"type":"paragraph","text":"and national security."},{"type":"heading","text":"The AI race is therefore not just about models","level":2},{"type":"paragraph","text":"A country can have brilliant researchers and still struggle to compete if it cannot access the necessary hardware."},{"type":"paragraph","text":"A country can have chips but lack electricity."},{"type":"paragraph","text":"A country can have electricity but lack advanced semiconductor manufacturing."},{"type":"paragraph","text":"A country can have all of those and still lack enough talent."},{"type":"paragraph","text":"The advantage comes from combining the stack."},{"type":"heading","text":"That creates alliances","level":2},{"type":"paragraph","text":"Technology supply chains increasingly cross borders."},{"type":"paragraph","text":"A semiconductor may involve:"},{"type":"paragraph","text":"design in one country,"},{"type":"paragraph","text":"equipment from another,"},{"type":"paragraph","text":"manufacturing somewhere else,"},{"type":"paragraph","text":"packaging elsewhere,"},{"type":"paragraph","text":"and final deployment in another region."},{"type":"paragraph","text":"AI therefore connects countries through complex dependencies."},{"type":"paragraph","text":"And those dependencies can become geopolitical leverage."},{"type":"heading","text":"The strategic resource is becoming compute","level":2},{"type":"paragraph","text":"Oil once shaped industrial power."},{"type":"paragraph","text":"Semiconductors became central to modern electronics."},{"type":"paragraph","text":"Now compute is becoming increasingly important to AI."},{"type":"paragraph","text":"But compute itself depends on the physical world."},{"type":"paragraph","text":"Which brings us back to:"},{"type":"paragraph","text":"energy"},{"type":"paragraph","text":"factories"},{"type":"paragraph","text":"data centers"},{"type":"paragraph","text":"networks"},{"type":"paragraph","text":"capital"},{"type":"paragraph","text":"The geopolitical AI map is therefore also an industrial map."},{"type":"heading","text":"The bigger story","level":2},{"type":"paragraph","text":"These fifteen articles shouldn''t live as isolated pieces on Omniv."},{"type":"paragraph","text":"Together, they form a single Technology → Infrastructure → AI universe:"},{"type":"paragraph","text":"The Physical Internet\u000b ↓\u000b Energy\u000b ↓\u000b Computing Geography\u000b ↓\u000b Data Sovereignty\u000b ↓\u000b Infrastructure Competition\u000b ↓\u000b AI Infrastructure\u000b ↓\u000b Compute\u000b ↓\u000b Data Centers\u000b ↓\u000b Cheap Intelligence\u000b ↓\u000b AI Value Capture\u000b ↓\u000b National AI Stacks\u000b ↓\u000b AI Geopolitics"},{"type":"paragraph","text":"And that is exactly the type of interconnected publishing experience I want Omniv to surface."},{"type":"paragraph","text":"A reader finishes:"},{"type":"paragraph","text":"Why Energy Could Become the Bottleneck for Technology"},{"type":"paragraph","text":"and Omniv shouldn''t simply say \"Thanks for reading.\""},{"type":"paragraph","text":"It should immediately offer:"},{"type":"heading","text":"Continue exploring","level":3},{"type":"paragraph","text":"The New Geography of Computing\u000b Why the location of computing is becoming strategically important."},{"type":"paragraph","text":"The Coming Battle Over AI Compute\u000b Why access to computation may determine who can build at scale."},{"type":"paragraph","text":"Why Data Centers May Matter More Than AI Startups\u000b The infrastructure underneath the AI boom."},{"type":"paragraph","text":"The Geopolitics of Artificial Intelligence\u000b Why AI is becoming a competition between states as well as companies."},{"type":"paragraph","text":"That is where the Omniv discovery engine starts becoming part of the content itself: every publication is a doorway into a larger knowledge graph rather than a dead-end blog post."},{"type":"paragraph","text":"Absolutely. I’d make these a connected Omniv Investing universe, not ten generic finance articles. The reader should move from “What is value?” → “How do investors evaluate assets?” → “Why infrastructure/energy/Africa?” → “How do entire industries get repriced?”"},{"type":"paragraph","text":"I’ll start with Article 1 at full long-form depth, then we can move through 2–10 in order."}]'::jsonb, 'TECHNOLOGY', 2, 'published', 'The Geopolitics of Artificial Intelligence | Omniv Editorial', 'AI is often described as the next technology revolution. But it is also becoming a geopolitical one. Because advanced AI depends on things that governments already care deeply about:', 'https://omniv.media/p/the-geopolitics-of-artificial-intelligence', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"biology","label":"Biology"}]'::jsonb, '{}'::text[], '{technology,russia,global-supply-chains,artificial-intelligence,data-centres,infrastructure}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'what-actually-makes-an-asset-valuable', 'What Actually Makes an Asset Valuable?', 'A building can be worth millions. A piece of land next to it can be worth even more. A company with no profits can be worth billions.', 'A building can be worth millions.

A piece of land next to it can be worth even more.

A company with no profits can be worth billions.

A profitable company can lose half its value in a year.

A pipeline nobody thinks about can generate cash for decades.

A piece of art can sell for more than a house.

And a technology company can be worth almost nothing one year and hundreds of millions the next.

So what actually makes something valuable?

The obvious answer is:

What someone is willing to pay for it.

But that only describes the price.

It doesn''t explain the value.

And understanding the difference is one of the foundations of investing.

At the simplest level, something becomes valuable because somebody wants it.

But "wanting" isn''t enough.

There needs to be some reason the thing matters.

A piece of land may be valuable because it sits beside a major road.

A warehouse may be valuable because thousands of businesses need storage.

A power plant may be valuable because factories need reliable electricity.

A software company may be valuable because millions of customers depend on its product.

An apartment may be valuable because people want to live in that particular location.

The underlying asset is not necessarily valuable because it exists.

It is valuable because it performs a function.

That leads to the first principle:

Value comes from the ability of an asset to satisfy a durable need.

Consider two pieces of land.

Both are 10 hectares.

Both are beautiful.

Both are located in the same country.

But one sits beside a major highway and has electricity, water and road access.

The other is hundreds of kilometers from major population centers with poor infrastructure.

They are physically similar.

Their economic value may be radically different.

Why?

Because context changes usefulness.

This is one of the most important concepts in investing.

An asset doesn''t exist in isolation.

Its value depends on the system around it.

Now imagine something everyone wants.

If there are unlimited quantities available, it becomes difficult to maintain a high price.

But if supply is limited, the economics change.

This is why scarce assets can command significant value.

Prime urban land.

Unique intellectual property.

Certain natural resources.

Rare infrastructure locations.

Highly desirable brands.

Specialized businesses.

But scarcity by itself still isn''t enough.

A useless thing can be extremely rare.

Imagine owning the world''s only example of an object nobody wants.

It''s unique.

It''s scarce.

It may still be worthless.

So the real combination is:

usefulness + scarcity.

An asset becomes much more interesting when demand for what it provides is durable.

Consider electricity.

People don''t wake up one morning and decide:

"Maybe we don''t need electricity anymore."

Modern economies are deeply dependent on it.

That makes electricity infrastructure interesting from an investment perspective.

Not because electricity infrastructure is glamorous.

Because it serves a persistent need.

The same principle applies to:

housing,

transportation,

communications,

food,

logistics,

financial services,

data infrastructure,

and many other essential systems.

Investors often become interested in assets connected to needs that are difficult to eliminate.

Imagine owning a small piece of infrastructure that a large number of businesses depend upon.

The infrastructure itself might not be exciting.

But its position within the system can make it valuable.

A port.

A transmission line.

A fiber route.

A logistics terminal.

A data center.

A warehouse.

A payment network.

A pipeline.

A telecom tower.

These assets can become valuable because replacing them may be expensive or difficult.

This creates another concept:

Strategic position.

An asset doesn''t necessarily need to be the biggest.

It may simply occupy an important position.

Real estate makes this obvious.

A square meter of land in one location can be worth thousands of times more than a square meter somewhere else.

The dirt isn''t necessarily different.

The surrounding system is.

One location might have:

population

roads

electricity

businesses

schools

transportation

customers

tourism

political importance

The other may have none of them.

The asset''s location changes what can be done with it.

That creates economic value.

Now we get to one of the most important concepts in investing.

An asset can generate money.

A rental property can produce rent.

A business can generate profits.

A toll road can collect fees.

A data center can charge customers.

A power plant can sell electricity.

A farm can produce crops.

A mine can sell minerals.

This recurring economic output gives investors something concrete to evaluate.

Instead of asking:

"How much could someone theoretically pay for this?"

they can ask:

"How much cash can this asset generate?"

That is a much more powerful question.

An asset isn''t only valuable because of what it produces today.

Investors care about what it could produce tomorrow.

Consider a piece of land.

Today it may generate almost nothing.

But if a new highway is planned nearby, a city is expanding toward it and infrastructure is being installed, its future economic potential may change dramatically.

The same thing happens with companies.

A business generating $1 million today might be more valuable than another generating $5 million if the first business has a credible path to $50 million.

This is why investors are constantly thinking about:

growth.

But growth needs to be distinguished from hope.

A company can grow rapidly and still destroy value.

Suppose a company spends $10 to acquire a customer who generates $5 in revenue.

Growing faster makes the problem worse.

The company isn''t creating value.

It''s scaling losses.

Now imagine another company spends $10 acquiring a customer who generates $100 over several years.

Growth may be extremely valuable.

The difference isn''t simply growth.

It''s the economics behind the growth.

This is why sophisticated investors look beneath headline numbers.

Imagine two businesses.

Business A has a great product today.

But competitors can copy it in three months.

Business B has a product protected by:

network effects

proprietary technology

regulatory barriers

distribution

brand

switching costs

scarce infrastructure

Which is more valuable?

Not necessarily Business B today.

But potentially Business B over a much longer period.

Investors care about the durability of economic advantages because durable advantages can protect future cash flows.

Warren Buffett popularized the idea of an economic "moat."

The metaphor is useful.

A castle is easier to defend when it has a moat.

A business can have economic defenses too.

A company might have:

Brand

Customers trust it.

Network effects

The product becomes more valuable as more people use it.

Switching costs

Customers don''t want to leave.

Cost advantage

It can operate more cheaply than competitors.

Intellectual property

Competitors cannot easily reproduce what it has.

Distribution

It can reach customers others cannot.

Regulatory barriers

New competitors face significant restrictions.

Scale

Its size creates efficiencies smaller competitors cannot match.

The stronger the moat, the harder it can be for competitors to destroy the economics.

This is where investing becomes difficult.

A company can have a dominant position for years.

Then technology changes.

Consumer behavior changes.

Regulation changes.

A competitor discovers a better business model.

The moat becomes a ditch.

This is why investors don''t simply ask:

"Is this company strong?"

They ask:

"What could make this company weak?"

Another overlooked concept is opportunity cost.

Suppose you have $10 million.

You could buy:

government bonds

a warehouse

a technology company

farmland

an energy project

public equities

another business

Each option competes for your capital.

An asset isn''t evaluated only against itself.

It is evaluated against alternatives.

This is why interest rates matter so much to asset valuations.

When safe returns rise, risky assets often need to offer more attractive potential returns to justify the additional risk.

Two assets can generate the same amount of cash.

But they may not be equally valuable.

Imagine:

Expected annual cash flow: $1 million

Very stable.

Long contracts.

Reliable customers.

Strong infrastructure.

Expected annual cash flow: $1 million

Highly volatile.

One customer.

Weak contracts.

Heavy competition.

Political uncertainty.

They produce the same expected amount of money.

But an investor may value them very differently.

Why?

Because certainty has value.

Receiving $1 million today isn''t the same as receiving $1 million ten years from now.

Money today can be invested.

It can earn returns.

It can be deployed elsewhere.

So investors discount future cash flows.

This is the foundation of many valuation models.

The farther into the future the money is expected to arrive, the more uncertainty is introduced.

That is one reason assets whose value depends heavily on distant future growth can be particularly sensitive to changes in interest rates and expectations.

This explains something that confuses many people.

How can a company with relatively little revenue be worth billions?

Because investors aren''t necessarily buying its current business.

They are buying a claim on its potential future economics.

The market is effectively saying:

"We believe this company could become much larger."

Sometimes that belief is correct.

Sometimes it is spectacularly wrong.

This is why valuation isn''t simply accounting.

It is also a contest between expectations.

Every asset price contains an implicit forecast.

A stock price reflects expectations about:

future earnings,

growth,

risk,

interest rates,

competition,

capital requirements,

and eventually the cash investors expect to receive.

A property price reflects expectations about:

rents,

location,

population,

financing,

development,

and future demand.

A commodity price reflects expectations about:

supply,

demand,

inventories,

production,

and geopolitical conditions.

The price is therefore not simply telling you what something is worth.

It is telling you what the market currently believes about its future.

If everyone already agrees about an asset''s future, there may be little opportunity.

But if your assessment differs from the market''s assessment, something interesting happens.

You may believe:

The market is underestimating future cash flow.

Or:

The market is overestimating future growth.

Or:

The market is ignoring a structural change.

Or:

The market is misunderstanding the risk.

That difference between your analysis and the market''s expectations is where an investment thesis begins.

Saying:

"Africa will grow."

isn''t an investment thesis.

Saying:

"AI will be huge."

isn''t an investment thesis.

Saying:

"Energy demand will increase."

isn''t enough either.

An investment thesis needs a chain of reasoning.

For example:

Population growth

↓

Urbanization

↓

Higher electricity demand

↓

Insufficient existing generation

↓

Investment in new generation and transmission

↓

Higher demand for infrastructure

↓

Potential opportunity for companies providing that infrastructure

Now you have something that can actually be tested.

Consider a data center.

Its value could be influenced by:

AI adoption

cloud computing

internet traffic

enterprise digitization

electricity availability

fiber connectivity

land

customer contracts

regional demand.

That''s more interesting than simply saying:

"Data centers are growing."

You''re identifying the system around the asset.

And that is how investors often find opportunities.

One of the most powerful characteristics of certain assets is compounding.

A good business generates cash.

That cash can be reinvested.

The reinvestment generates more cash.

The larger business generates even more cash.

This creates a feedback loop.

The same idea can apply to infrastructure.

A road attracts businesses.

Businesses attract workers.

Workers increase population.

Population increases demand.

Demand supports more investment.

More investment improves the infrastructure.

The system becomes more valuable.

This is why investors sometimes care deeply about economic ecosystems, not just individual assets.

Think about an asset connected to a major structural trend.

Electrification.

Urbanization.

Digitization.

AI.

Aging populations.

African consumer growth.

Energy transition.

Industrialization.

The internet.

The asset isn''t valuable simply because the trend exists.

The important question is:

Does the asset sit in a position where it can capture economic value created by the trend?

That''s the difference between identifying a trend and identifying an investment opportunity.

There isn''t one answer.

But the strongest assets tend to combine several characteristics:

People genuinely need or want what it provides.

Supply is limited or difficult to reproduce.

There is a sufficiently large market.

The asset can generate economic output.

That output can potentially increase.

The economics can survive competition and changing conditions.

The asset occupies an important place in a larger system.

Competitors cannot easily replicate its advantages.

There may be additional ways to create value in the future.

The potential reward justifies the uncertainty.

Put all of those together and you begin to understand why investors can look at two assets with similar prices and reach completely different conclusions.

Perhaps the most important lesson is this:

An asset isn''t valuable because it is expensive.

It becomes expensive when enough people believe its future economic benefits justify paying more for it.

Sometimes they are right.

Sometimes they aren''t.

That''s why investing isn''t fundamentally about finding things that are already valuable.

It''s about understanding why something should be valuable, how durable that reason is, and what the market may be getting wrong.

And that leads directly to the next question:

If certain assets create durable economic value, why do long-term investors keep coming back to infrastructure?

Next on Omniv: Why Infrastructure Attracts Long-Term Capital', 'Analysis from the Omniv Editorial desk.', 'A building can be worth millions. A piece of land next to it can be worth even more. A company with no profits can be worth billions.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"A building can be worth millions."},{"type":"paragraph","text":"A piece of land next to it can be worth even more."},{"type":"paragraph","text":"A company with no profits can be worth billions."},{"type":"paragraph","text":"A profitable company can lose half its value in a year."},{"type":"paragraph","text":"A pipeline nobody thinks about can generate cash for decades."},{"type":"paragraph","text":"A piece of art can sell for more than a house."},{"type":"paragraph","text":"And a technology company can be worth almost nothing one year and hundreds of millions the next."},{"type":"paragraph","text":"So what actually makes something valuable?"},{"type":"paragraph","text":"The obvious answer is:"},{"type":"paragraph","text":"What someone is willing to pay for it."},{"type":"paragraph","text":"But that only describes the price."},{"type":"paragraph","text":"It doesn''t explain the value."},{"type":"paragraph","text":"And understanding the difference is one of the foundations of investing."},{"type":"heading","text":"Value starts with usefulness","level":2},{"type":"paragraph","text":"At the simplest level, something becomes valuable because somebody wants it."},{"type":"paragraph","text":"But \"wanting\" isn''t enough."},{"type":"paragraph","text":"There needs to be some reason the thing matters."},{"type":"paragraph","text":"A piece of land may be valuable because it sits beside a major road."},{"type":"paragraph","text":"A warehouse may be valuable because thousands of businesses need storage."},{"type":"paragraph","text":"A power plant may be valuable because factories need reliable electricity."},{"type":"paragraph","text":"A software company may be valuable because millions of customers depend on its product."},{"type":"paragraph","text":"An apartment may be valuable because people want to live in that particular location."},{"type":"paragraph","text":"The underlying asset is not necessarily valuable because it exists."},{"type":"paragraph","text":"It is valuable because it performs a function."},{"type":"paragraph","text":"That leads to the first principle:"},{"type":"paragraph","text":"Value comes from the ability of an asset to satisfy a durable need."},{"type":"heading","text":"But usefulness isn''t enough","level":2},{"type":"paragraph","text":"Consider two pieces of land."},{"type":"paragraph","text":"Both are 10 hectares."},{"type":"paragraph","text":"Both are beautiful."},{"type":"paragraph","text":"Both are located in the same country."},{"type":"paragraph","text":"But one sits beside a major highway and has electricity, water and road access."},{"type":"paragraph","text":"The other is hundreds of kilometers from major population centers with poor infrastructure."},{"type":"paragraph","text":"They are physically similar."},{"type":"paragraph","text":"Their economic value may be radically different."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"Because context changes usefulness."},{"type":"paragraph","text":"This is one of the most important concepts in investing."},{"type":"paragraph","text":"An asset doesn''t exist in isolation."},{"type":"paragraph","text":"Its value depends on the system around it."},{"type":"heading","text":"Scarcity matters","level":2},{"type":"paragraph","text":"Now imagine something everyone wants."},{"type":"paragraph","text":"If there are unlimited quantities available, it becomes difficult to maintain a high price."},{"type":"paragraph","text":"But if supply is limited, the economics change."},{"type":"paragraph","text":"This is why scarce assets can command significant value."},{"type":"paragraph","text":"Prime urban land."},{"type":"paragraph","text":"Unique intellectual property."},{"type":"paragraph","text":"Certain natural resources."},{"type":"paragraph","text":"Rare infrastructure locations."},{"type":"paragraph","text":"Highly desirable brands."},{"type":"paragraph","text":"Specialized businesses."},{"type":"paragraph","text":"But scarcity by itself still isn''t enough."},{"type":"paragraph","text":"A useless thing can be extremely rare."},{"type":"paragraph","text":"Imagine owning the world''s only example of an object nobody wants."},{"type":"paragraph","text":"It''s unique."},{"type":"paragraph","text":"It''s scarce."},{"type":"paragraph","text":"It may still be worthless."},{"type":"paragraph","text":"So the real combination is:"},{"type":"paragraph","text":"usefulness + scarcity."},{"type":"heading","text":"Then comes demand","level":2},{"type":"paragraph","text":"An asset becomes much more interesting when demand for what it provides is durable."},{"type":"paragraph","text":"Consider electricity."},{"type":"paragraph","text":"People don''t wake up one morning and decide:"},{"type":"paragraph","text":"\"Maybe we don''t need electricity anymore.\""},{"type":"paragraph","text":"Modern economies are deeply dependent on it."},{"type":"paragraph","text":"That makes electricity infrastructure interesting from an investment perspective."},{"type":"paragraph","text":"Not because electricity infrastructure is glamorous."},{"type":"paragraph","text":"Because it serves a persistent need."},{"type":"paragraph","text":"The same principle applies to:"},{"type":"paragraph","text":"housing,"},{"type":"paragraph","text":"transportation,"},{"type":"paragraph","text":"communications,"},{"type":"paragraph","text":"food,"},{"type":"paragraph","text":"logistics,"},{"type":"paragraph","text":"financial services,"},{"type":"paragraph","text":"data infrastructure,"},{"type":"paragraph","text":"and many other essential systems."},{"type":"paragraph","text":"Investors often become interested in assets connected to needs that are difficult to eliminate."},{"type":"heading","text":"The strongest assets can sit inside important systems","level":2},{"type":"paragraph","text":"Imagine owning a small piece of infrastructure that a large number of businesses depend upon."},{"type":"paragraph","text":"The infrastructure itself might not be exciting."},{"type":"paragraph","text":"But its position within the system can make it valuable."},{"type":"paragraph","text":"A port."},{"type":"paragraph","text":"A transmission line."},{"type":"paragraph","text":"A fiber route."},{"type":"paragraph","text":"A logistics terminal."},{"type":"paragraph","text":"A data center."},{"type":"paragraph","text":"A warehouse."},{"type":"paragraph","text":"A payment network."},{"type":"paragraph","text":"A pipeline."},{"type":"paragraph","text":"A telecom tower."},{"type":"paragraph","text":"These assets can become valuable because replacing them may be expensive or difficult."},{"type":"paragraph","text":"This creates another concept:"},{"type":"paragraph","text":"Strategic position."},{"type":"paragraph","text":"An asset doesn''t necessarily need to be the biggest."},{"type":"paragraph","text":"It may simply occupy an important position."},{"type":"heading","text":"Location can create value","level":2},{"type":"paragraph","text":"Real estate makes this obvious."},{"type":"paragraph","text":"A square meter of land in one location can be worth thousands of times more than a square meter somewhere else."},{"type":"paragraph","text":"The dirt isn''t necessarily different."},{"type":"paragraph","text":"The surrounding system is."},{"type":"paragraph","text":"One location might have:"},{"type":"paragraph","text":"population"},{"type":"paragraph","text":"roads"},{"type":"paragraph","text":"electricity"},{"type":"paragraph","text":"businesses"},{"type":"paragraph","text":"schools"},{"type":"paragraph","text":"transportation"},{"type":"paragraph","text":"customers"},{"type":"paragraph","text":"tourism"},{"type":"paragraph","text":"political importance"},{"type":"paragraph","text":"The other may have none of them."},{"type":"paragraph","text":"The asset''s location changes what can be done with it."},{"type":"paragraph","text":"That creates economic value."},{"type":"heading","text":"Cash flow changes everything","level":2},{"type":"paragraph","text":"Now we get to one of the most important concepts in investing."},{"type":"paragraph","text":"An asset can generate money."},{"type":"paragraph","text":"A rental property can produce rent."},{"type":"paragraph","text":"A business can generate profits."},{"type":"paragraph","text":"A toll road can collect fees."},{"type":"paragraph","text":"A data center can charge customers."},{"type":"paragraph","text":"A power plant can sell electricity."},{"type":"paragraph","text":"A farm can produce crops."},{"type":"paragraph","text":"A mine can sell minerals."},{"type":"paragraph","text":"This recurring economic output gives investors something concrete to evaluate."},{"type":"paragraph","text":"Instead of asking:"},{"type":"paragraph","text":"\"How much could someone theoretically pay for this?\""},{"type":"paragraph","text":"they can ask:"},{"type":"paragraph","text":"\"How much cash can this asset generate?\""},{"type":"paragraph","text":"That is a much more powerful question."},{"type":"heading","text":"The future matters more than the present","level":2},{"type":"paragraph","text":"An asset isn''t only valuable because of what it produces today."},{"type":"paragraph","text":"Investors care about what it could produce tomorrow."},{"type":"paragraph","text":"Consider a piece of land."},{"type":"paragraph","text":"Today it may generate almost nothing."},{"type":"paragraph","text":"But if a new highway is planned nearby, a city is expanding toward it and infrastructure is being installed, its future economic potential may change dramatically."},{"type":"paragraph","text":"The same thing happens with companies."},{"type":"paragraph","text":"A business generating $1 million today might be more valuable than another generating $5 million if the first business has a credible path to $50 million."},{"type":"paragraph","text":"This is why investors are constantly thinking about:"},{"type":"paragraph","text":"growth."},{"type":"paragraph","text":"But growth needs to be distinguished from hope."},{"type":"heading","text":"Growth is valuable when it is economically defensible","level":2},{"type":"paragraph","text":"A company can grow rapidly and still destroy value."},{"type":"paragraph","text":"Suppose a company spends $10 to acquire a customer who generates $5 in revenue."},{"type":"paragraph","text":"Growing faster makes the problem worse."},{"type":"paragraph","text":"The company isn''t creating value."},{"type":"paragraph","text":"It''s scaling losses."},{"type":"paragraph","text":"Now imagine another company spends $10 acquiring a customer who generates $100 over several years."},{"type":"paragraph","text":"Growth may be extremely valuable."},{"type":"paragraph","text":"The difference isn''t simply growth."},{"type":"paragraph","text":"It''s the economics behind the growth."},{"type":"paragraph","text":"This is why sophisticated investors look beneath headline numbers."},{"type":"heading","text":"The durability of an advantage matters","level":2},{"type":"paragraph","text":"Imagine two businesses."},{"type":"paragraph","text":"Business A has a great product today."},{"type":"paragraph","text":"But competitors can copy it in three months."},{"type":"paragraph","text":"Business B has a product protected by:"},{"type":"paragraph","text":"network effects"},{"type":"paragraph","text":"proprietary technology"},{"type":"paragraph","text":"regulatory barriers"},{"type":"paragraph","text":"distribution"},{"type":"paragraph","text":"brand"},{"type":"paragraph","text":"switching costs"},{"type":"paragraph","text":"scarce infrastructure"},{"type":"paragraph","text":"Which is more valuable?"},{"type":"paragraph","text":"Not necessarily Business B today."},{"type":"paragraph","text":"But potentially Business B over a much longer period."},{"type":"paragraph","text":"Investors care about the durability of economic advantages because durable advantages can protect future cash flows."},{"type":"heading","text":"The moat","level":2},{"type":"paragraph","text":"Warren Buffett popularized the idea of an economic \"moat.\""},{"type":"paragraph","text":"The metaphor is useful."},{"type":"paragraph","text":"A castle is easier to defend when it has a moat."},{"type":"paragraph","text":"A business can have economic defenses too."},{"type":"paragraph","text":"A company might have:"},{"type":"paragraph","text":"Brand"},{"type":"paragraph","text":"Customers trust it."},{"type":"paragraph","text":"Network effects"},{"type":"paragraph","text":"The product becomes more valuable as more people use it."},{"type":"paragraph","text":"Switching costs"},{"type":"paragraph","text":"Customers don''t want to leave."},{"type":"paragraph","text":"Cost advantage"},{"type":"paragraph","text":"It can operate more cheaply than competitors."},{"type":"paragraph","text":"Intellectual property"},{"type":"paragraph","text":"Competitors cannot easily reproduce what it has."},{"type":"paragraph","text":"Distribution"},{"type":"paragraph","text":"It can reach customers others cannot."},{"type":"paragraph","text":"Regulatory barriers"},{"type":"paragraph","text":"New competitors face significant restrictions."},{"type":"paragraph","text":"Scale"},{"type":"paragraph","text":"Its size creates efficiencies smaller competitors cannot match."},{"type":"paragraph","text":"The stronger the moat, the harder it can be for competitors to destroy the economics."},{"type":"heading","text":"But moats can disappear","level":2},{"type":"paragraph","text":"This is where investing becomes difficult."},{"type":"paragraph","text":"A company can have a dominant position for years."},{"type":"paragraph","text":"Then technology changes."},{"type":"paragraph","text":"Consumer behavior changes."},{"type":"paragraph","text":"Regulation changes."},{"type":"paragraph","text":"A competitor discovers a better business model."},{"type":"paragraph","text":"The moat becomes a ditch."},{"type":"paragraph","text":"This is why investors don''t simply ask:"},{"type":"paragraph","text":"\"Is this company strong?\""},{"type":"paragraph","text":"They ask:"},{"type":"paragraph","text":"\"What could make this company weak?\""},{"type":"heading","text":"The asset''s alternatives matter","level":2},{"type":"paragraph","text":"Another overlooked concept is opportunity cost."},{"type":"paragraph","text":"Suppose you have $10 million."},{"type":"paragraph","text":"You could buy:"},{"type":"paragraph","text":"government bonds"},{"type":"paragraph","text":"a warehouse"},{"type":"paragraph","text":"a technology company"},{"type":"paragraph","text":"farmland"},{"type":"paragraph","text":"an energy project"},{"type":"paragraph","text":"public equities"},{"type":"paragraph","text":"another business"},{"type":"paragraph","text":"Each option competes for your capital."},{"type":"paragraph","text":"An asset isn''t evaluated only against itself."},{"type":"paragraph","text":"It is evaluated against alternatives."},{"type":"paragraph","text":"This is why interest rates matter so much to asset valuations."},{"type":"paragraph","text":"When safe returns rise, risky assets often need to offer more attractive potential returns to justify the additional risk."},{"type":"heading","text":"Risk changes value","level":2},{"type":"paragraph","text":"Two assets can generate the same amount of cash."},{"type":"paragraph","text":"But they may not be equally valuable."},{"type":"paragraph","text":"Imagine:"},{"type":"heading","text":"Asset A","level":3},{"type":"paragraph","text":"Expected annual cash flow: $1 million"},{"type":"paragraph","text":"Very stable."},{"type":"paragraph","text":"Long contracts."},{"type":"paragraph","text":"Reliable customers."},{"type":"paragraph","text":"Strong infrastructure."},{"type":"heading","text":"Asset B","level":3},{"type":"paragraph","text":"Expected annual cash flow: $1 million"},{"type":"paragraph","text":"Highly volatile."},{"type":"paragraph","text":"One customer."},{"type":"paragraph","text":"Weak contracts."},{"type":"paragraph","text":"Heavy competition."},{"type":"paragraph","text":"Political uncertainty."},{"type":"paragraph","text":"They produce the same expected amount of money."},{"type":"paragraph","text":"But an investor may value them very differently."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"Because certainty has value."},{"type":"heading","text":"Time matters","level":2},{"type":"paragraph","text":"Receiving $1 million today isn''t the same as receiving $1 million ten years from now."},{"type":"paragraph","text":"Money today can be invested."},{"type":"paragraph","text":"It can earn returns."},{"type":"paragraph","text":"It can be deployed elsewhere."},{"type":"paragraph","text":"So investors discount future cash flows."},{"type":"paragraph","text":"This is the foundation of many valuation models."},{"type":"paragraph","text":"The farther into the future the money is expected to arrive, the more uncertainty is introduced."},{"type":"paragraph","text":"That is one reason assets whose value depends heavily on distant future growth can be particularly sensitive to changes in interest rates and expectations."},{"type":"heading","text":"Expectations can create enormous valuations","level":2},{"type":"paragraph","text":"This explains something that confuses many people."},{"type":"paragraph","text":"How can a company with relatively little revenue be worth billions?"},{"type":"paragraph","text":"Because investors aren''t necessarily buying its current business."},{"type":"paragraph","text":"They are buying a claim on its potential future economics."},{"type":"paragraph","text":"The market is effectively saying:"},{"type":"paragraph","text":"\"We believe this company could become much larger.\""},{"type":"paragraph","text":"Sometimes that belief is correct."},{"type":"paragraph","text":"Sometimes it is spectacularly wrong."},{"type":"paragraph","text":"This is why valuation isn''t simply accounting."},{"type":"paragraph","text":"It is also a contest between expectations."},{"type":"heading","text":"The market is constantly making a prediction","level":2},{"type":"paragraph","text":"Every asset price contains an implicit forecast."},{"type":"paragraph","text":"A stock price reflects expectations about:"},{"type":"paragraph","text":"future earnings,"},{"type":"paragraph","text":"growth,"},{"type":"paragraph","text":"risk,"},{"type":"paragraph","text":"interest rates,"},{"type":"paragraph","text":"competition,"},{"type":"paragraph","text":"capital requirements,"},{"type":"paragraph","text":"and eventually the cash investors expect to receive."},{"type":"paragraph","text":"A property price reflects expectations about:"},{"type":"paragraph","text":"rents,"},{"type":"paragraph","text":"location,"},{"type":"paragraph","text":"population,"},{"type":"paragraph","text":"financing,"},{"type":"paragraph","text":"development,"},{"type":"paragraph","text":"and future demand."},{"type":"paragraph","text":"A commodity price reflects expectations about:"},{"type":"paragraph","text":"supply,"},{"type":"paragraph","text":"demand,"},{"type":"paragraph","text":"inventories,"},{"type":"paragraph","text":"production,"},{"type":"paragraph","text":"and geopolitical conditions."},{"type":"paragraph","text":"The price is therefore not simply telling you what something is worth."},{"type":"paragraph","text":"It is telling you what the market currently believes about its future."},{"type":"heading","text":"That''s where mispricing becomes possible","level":2},{"type":"paragraph","text":"If everyone already agrees about an asset''s future, there may be little opportunity."},{"type":"paragraph","text":"But if your assessment differs from the market''s assessment, something interesting happens."},{"type":"paragraph","text":"You may believe:"},{"type":"paragraph","text":"The market is underestimating future cash flow."},{"type":"paragraph","text":"Or:"},{"type":"paragraph","text":"The market is overestimating future growth."},{"type":"paragraph","text":"Or:"},{"type":"paragraph","text":"The market is ignoring a structural change."},{"type":"paragraph","text":"Or:"},{"type":"paragraph","text":"The market is misunderstanding the risk."},{"type":"paragraph","text":"That difference between your analysis and the market''s expectations is where an investment thesis begins."},{"type":"heading","text":"But a thesis needs a mechanism","level":2},{"type":"paragraph","text":"Saying:"},{"type":"paragraph","text":"\"Africa will grow.\""},{"type":"paragraph","text":"isn''t an investment thesis."},{"type":"paragraph","text":"Saying:"},{"type":"paragraph","text":"\"AI will be huge.\""},{"type":"paragraph","text":"isn''t an investment thesis."},{"type":"paragraph","text":"Saying:"},{"type":"paragraph","text":"\"Energy demand will increase.\""},{"type":"paragraph","text":"isn''t enough either."},{"type":"paragraph","text":"An investment thesis needs a chain of reasoning."},{"type":"paragraph","text":"For example:"},{"type":"paragraph","text":"Population growth"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Urbanization"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Higher electricity demand"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Insufficient existing generation"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Investment in new generation and transmission"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Higher demand for infrastructure"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Potential opportunity for companies providing that infrastructure"},{"type":"paragraph","text":"Now you have something that can actually be tested."},{"type":"heading","text":"The best assets often benefit from multiple forces","level":2},{"type":"paragraph","text":"Consider a data center."},{"type":"paragraph","text":"Its value could be influenced by:"},{"type":"paragraph","text":"AI adoption"},{"type":"paragraph","text":"cloud computing"},{"type":"paragraph","text":"internet traffic"},{"type":"paragraph","text":"enterprise digitization"},{"type":"paragraph","text":"electricity availability"},{"type":"paragraph","text":"fiber connectivity"},{"type":"paragraph","text":"land"},{"type":"paragraph","text":"customer contracts"},{"type":"paragraph","text":"regional demand."},{"type":"paragraph","text":"That''s more interesting than simply saying:"},{"type":"paragraph","text":"\"Data centers are growing.\""},{"type":"paragraph","text":"You''re identifying the system around the asset."},{"type":"paragraph","text":"And that is how investors often find opportunities."},{"type":"heading","text":"Value can compound","level":2},{"type":"paragraph","text":"One of the most powerful characteristics of certain assets is compounding."},{"type":"paragraph","text":"A good business generates cash."},{"type":"paragraph","text":"That cash can be reinvested."},{"type":"paragraph","text":"The reinvestment generates more cash."},{"type":"paragraph","text":"The larger business generates even more cash."},{"type":"paragraph","text":"This creates a feedback loop."},{"type":"paragraph","text":"The same idea can apply to infrastructure."},{"type":"paragraph","text":"A road attracts businesses."},{"type":"paragraph","text":"Businesses attract workers."},{"type":"paragraph","text":"Workers increase population."},{"type":"paragraph","text":"Population increases demand."},{"type":"paragraph","text":"Demand supports more investment."},{"type":"paragraph","text":"More investment improves the infrastructure."},{"type":"paragraph","text":"The system becomes more valuable."},{"type":"paragraph","text":"This is why investors sometimes care deeply about economic ecosystems, not just individual assets."},{"type":"heading","text":"The strongest assets can become more valuable as the world changes","level":2},{"type":"paragraph","text":"Think about an asset connected to a major structural trend."},{"type":"paragraph","text":"Electrification."},{"type":"paragraph","text":"Urbanization."},{"type":"paragraph","text":"Digitization."},{"type":"paragraph","text":"AI."},{"type":"paragraph","text":"Aging populations."},{"type":"paragraph","text":"African consumer growth."},{"type":"paragraph","text":"Energy transition."},{"type":"paragraph","text":"Industrialization."},{"type":"paragraph","text":"The internet."},{"type":"paragraph","text":"The asset isn''t valuable simply because the trend exists."},{"type":"paragraph","text":"The important question is:"},{"type":"paragraph","text":"Does the asset sit in a position where it can capture economic value created by the trend?"},{"type":"paragraph","text":"That''s the difference between identifying a trend and identifying an investment opportunity."},{"type":"heading","text":"So what actually makes an asset valuable?","level":2},{"type":"paragraph","text":"There isn''t one answer."},{"type":"paragraph","text":"But the strongest assets tend to combine several characteristics:"},{"type":"heading","text":"1. Utility","level":3},{"type":"paragraph","text":"People genuinely need or want what it provides."},{"type":"heading","text":"2. Scarcity","level":3},{"type":"paragraph","text":"Supply is limited or difficult to reproduce."},{"type":"heading","text":"3. Demand","level":3},{"type":"paragraph","text":"There is a sufficiently large market."},{"type":"heading","text":"4. Cash flow","level":3},{"type":"paragraph","text":"The asset can generate economic output."},{"type":"heading","text":"5. Growth","level":3},{"type":"paragraph","text":"That output can potentially increase."},{"type":"heading","text":"6. Durability","level":3},{"type":"paragraph","text":"The economics can survive competition and changing conditions."},{"type":"heading","text":"7. Strategic position","level":3},{"type":"paragraph","text":"The asset occupies an important place in a larger system."},{"type":"heading","text":"8. Defensibility","level":3},{"type":"paragraph","text":"Competitors cannot easily replicate its advantages."},{"type":"heading","text":"9. Optionality","level":3},{"type":"paragraph","text":"There may be additional ways to create value in the future."},{"type":"heading","text":"10. Risk-adjusted returns","level":3},{"type":"paragraph","text":"The potential reward justifies the uncertainty."},{"type":"paragraph","text":"Put all of those together and you begin to understand why investors can look at two assets with similar prices and reach completely different conclusions."},{"type":"heading","text":"The final distinction","level":2},{"type":"paragraph","text":"Perhaps the most important lesson is this:"},{"type":"paragraph","text":"An asset isn''t valuable because it is expensive."},{"type":"paragraph","text":"It becomes expensive when enough people believe its future economic benefits justify paying more for it."},{"type":"paragraph","text":"Sometimes they are right."},{"type":"paragraph","text":"Sometimes they aren''t."},{"type":"paragraph","text":"That''s why investing isn''t fundamentally about finding things that are already valuable."},{"type":"paragraph","text":"It''s about understanding why something should be valuable, how durable that reason is, and what the market may be getting wrong."},{"type":"paragraph","text":"And that leads directly to the next question:"},{"type":"paragraph","text":"If certain assets create durable economic value, why do long-term investors keep coming back to infrastructure?"},{"type":"paragraph","text":"Next on Omniv: Why Infrastructure Attracts Long-Term Capital"}]'::jsonb, 'MONEY', 11, 'published', 'What Actually Makes an Asset Valuable? | Omniv Editorial', 'A building can be worth millions. A piece of land next to it can be worth even more. A company with no profits can be worth billions.', 'https://omniv.media/p/what-actually-makes-an-asset-valuable', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"biology","label":"Biology"},{"type":"project","slug":"africa","label":"Africa"}]'::jsonb, '{}'::text[], '{money,russia,artificial-intelligence,data-centres,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'why-infrastructure-attracts-long-term-capital', 'Why Infrastructure Attracts Long-Term Capital', 'There is a reason pension funds, sovereign wealth funds, insurance companies and other long-term investors keep looking at infrastructure. It isn''t because infrastructure is exciting. Most infrastructure is the opposite of exciting.', 'There is a reason pension funds, sovereign wealth funds, insurance companies and other long-term investors keep looking at infrastructure.

It isn''t because infrastructure is exciting.

Most infrastructure is the opposite of exciting.

A road.

A power plant.

A transmission network.

A port.

A water system.

A telecom tower.

A data center.

A pipeline.

A railway.

Nobody wakes up wanting to buy a beautiful new piece of infrastructure.

But investors aren''t necessarily looking for beautiful.

They are looking for durable economics.

And infrastructure can offer something increasingly valuable in investing:

long-lived assets connected to persistent demand.

Consider a software startup.

Its product might become obsolete in three years.

Its customers can leave.

A competitor can appear.

Its technology can change.

Its revenue might grow 100% one year and collapse the next.

Now consider a bridge.

If people need to cross the river, the bridge continues to perform the same basic function.

A power transmission line doesn''t need a new version every six months.

A port doesn''t need a redesigned user interface.

A water network doesn''t need to become "viral."

Infrastructure is built around a different economic logic.

It exists to perform a necessary function over a long period of time.

Infrastructure can have extremely long useful lives.

A properly maintained piece of infrastructure can operate for decades.

That creates an unusual investment characteristic.

An investor isn''t necessarily betting on what happens next quarter.

They may be evaluating the economics of an asset over:

10 years,

20 years,

30 years,

or longer.

That long duration fits naturally with institutions whose liabilities also extend far into the future.

Think about a pension fund.

It doesn''t necessarily need all its money back next year.

It has obligations to people who may retire decades from now.

An asset capable of producing relatively durable cash flows over decades can therefore fit the institution''s needs.

This is the second attraction.

People don''t necessarily choose whether they need infrastructure.

A factory needs electricity.

A city needs water.

Businesses need telecommunications.

Importers need ports.

People need transportation.

Data centers need power and connectivity.

Factories need logistics.

These needs create economic demand.

The infrastructure provider sits between the need and the customer.

That position can be extraordinarily valuable.

One of the easiest ways to understand infrastructure economics is to imagine a toll road.

You build the road.

People use it.

They pay.

The road may continue generating revenue for many years.

Of course, the real world is much more complicated.

Traffic can disappoint.

Maintenance costs can rise.

Governments can change regulations.

Debt can become expensive.

Construction can go over budget.

But the fundamental model is simple:

capital goes in → infrastructure is built → users pay → cash flows come out.

That''s attractive to investors when the economics are predictable enough.

Imagine two investments.

Potential return: 40%

But there is a significant chance the business fails.

Potential return: 10%

But the cash flow is relatively predictable for 20 years.

Which one is better?

There isn''t a universal answer.

It depends on the investor.

A venture capital fund may prefer A.

A pension fund may find B extremely attractive.

This is one reason infrastructure attracts institutional capital.

Predictability can itself be an investment feature.

Some infrastructure assets operate under long-term contracts.

A power project, for example, may have agreements governing who buys its electricity and under what terms.

A data center may sign long-term agreements with customers.

A logistics facility may have contracted tenants.

A telecom infrastructure company may receive recurring payments from operators.

The precise structure varies enormously.

But the principle is important:

Long-term contracts can make future revenue easier to model.

And investors love things they can model.

Not because models are always correct.

Because predictable economics reduce uncertainty.

Infrastructure can sometimes have revenue structures linked to inflation or other economic variables.

For example, certain contracts, regulated tariffs or concession arrangements may include mechanisms that allow revenues to adjust over time.

This can make infrastructure attractive in inflationary environments.

But it is not automatic.

A poorly structured infrastructure investment can still be badly damaged by inflation.

The point is simply that some infrastructure assets can have characteristics that help investors manage long-term changes in purchasing power.

Now consider something interesting.

Imagine a city already has:

a functioning airport,

a port,

a transmission network,

a fiber route,

a water system.

Could someone build a competing system?

Maybe.

But it might require enormous amounts of:

land,

capital,

permits,

time,

political negotiation,

construction,

and engineering.

This creates what economists sometimes describe as barriers to entry.

And barriers to entry can protect the economics of existing infrastructure.

Suppose a company owns a critical piece of infrastructure in an important location.

A competitor wants to build an identical asset.

The competitor might need to:

find suitable land,

obtain permits,

secure financing,

connect to utilities,

build the facility,

negotiate rights of way,

attract customers,

and wait years before the project becomes operational.

The existing infrastructure has something the new competitor cannot immediately buy:

time.

That can be an enormous advantage.

Infrastructure is often geographically fixed.

A port cannot move.

A railway cannot move.

A transmission line cannot simply relocate.

A data center may be technically replaceable, but its connectivity and access to power can make its location economically important.

A logistics warehouse beside a major transportation corridor may be worth substantially more than an identical building somewhere else.

This makes infrastructure deeply connected to geography.

Some infrastructure becomes more valuable because it connects to other infrastructure.

Consider electricity.

A power plant is useful.

But it becomes much more useful when connected to:

transmission,

distribution,

industrial customers,

storage,

and other generation.

The same is true for telecommunications.

A fiber cable is valuable.

A network of connected fiber routes is more valuable.

A port becomes more useful when connected to roads and railways.

Infrastructure therefore often creates network effects at the physical level.

Walk through a major city.

Most of what you see depends on infrastructure.

Buildings need electricity.

Businesses need internet.

Restaurants need logistics.

Factories need transport.

Homes need water.

Banks need communications.

Hospitals need power.

Warehouses need roads.

Data centers need energy and fiber.

The city is effectively an enormous economic machine built on infrastructure.

That creates an important investment insight:

Economic activity cannot scale indefinitely without the infrastructure supporting it.

Suppose a city''s population increases.

More people need:

housing,

electricity,

transport,

internet,

water,

food distribution,

healthcare.

Businesses grow.

Factories open.

Warehouses expand.

Data consumption increases.

Suddenly infrastructure demand rises.

This is why investors sometimes look at infrastructure as a way to gain exposure to broader economic development.

Rather than betting on which individual company will win, they invest in the systems that many companies depend upon.

In a mature economy, much of the basic infrastructure may already exist.

The investment opportunity can therefore involve:

maintenance,

upgrades,

replacement,

efficiency,

modernization.

But in a rapidly growing economy, there can be a different opportunity.

New infrastructure may need to be built simply to accommodate growth.

More:

roads.

Power.

Ports.

Fiber.

Housing.

Industrial parks.

Warehouses.

Data centers.

Rail.

Water.

This creates a much larger potential capital requirement.

Africa is not one infrastructure market.

It is 50+ very different national markets with different:

political systems,

resources,

populations,

industrial bases,

energy systems,

regulatory environments,

and levels of development.

But across the continent there are enormous infrastructure gaps and equally enormous infrastructure opportunities.

The interesting question for investors isn''t simply:

"Is Africa growing?"

It is:

Which infrastructure bottlenecks are preventing that growth from happening faster?

That question produces much better investment analysis.

Imagine a city with:

1 million people,

excellent roads,

strong internet,

but unreliable electricity.

Electricity becomes the bottleneck.

Now imagine another city with:

excellent electricity,

but terrible logistics.

Logistics becomes the bottleneck.

Another city may have:

power + roads + ports,

but insufficient digital infrastructure.

Connectivity becomes the bottleneck.

The opportunity can exist precisely where the economy is constrained.

A bottleneck is essentially a point where demand exceeds available capacity.

That doesn''t automatically make it a good investment.

But it creates something investors should investigate.

Suppose companies are ready to expand but cannot get reliable electricity.

Who can solve that?

Suppose exporters want to ship more goods but port capacity is constrained.

Who can expand capacity?

Suppose businesses need high-quality cloud infrastructure but local capacity is limited.

Who can build it?

These questions turn macroeconomic problems into potential investment theses.

This is important.

Infrastructure can look wonderfully stable from a distance.

Up close, it can be extremely complicated.

There can be:

political risk,

currency risk,

construction risk,

financing risk,

regulatory risk,

demand risk,

operational risk,

environmental risk,

security risk.

A power plant can be technically excellent and still struggle if the buyer cannot pay.

A toll road can be well built and still fail if traffic is lower than expected.

A port can be strategically located and still suffer from political instability.

Infrastructure requires serious due diligence.

Infrastructure projects can require enormous amounts of upfront capital.

You spend money today.

The asset may not generate meaningful cash for years.

This is another reason infrastructure is naturally connected to long-term capital.

A short-term investor may find the construction period frustrating.

A long-term investor may see it differently.

The investor is essentially saying:

"I am willing to wait because the asset could produce economic output for a very long time."

That is a fundamentally different investment horizon.

Because infrastructure projects can be capital intensive, financing structures often combine equity and debt.

Suppose a project costs $100 million.

The owners might contribute part of the capital.

Lenders provide the rest.

The project''s future cash flow is then used to service the debt.

This can magnify returns when everything works.

It can also magnify losses when assumptions fail.

That''s why infrastructure investing isn''t simply about identifying a useful asset.

The capital structure matters.

This is one of the most important lessons.

Two investors can own economically similar infrastructure but have completely different outcomes.

Why?

They may have:

different purchase prices,

different debt levels,

different financing costs,

different contracts,

different operating costs,

different tax structures,

different exit assumptions.

The underlying asset matters.

But the price and structure at which you acquire it matter enormously.

The best infrastructure businesses aren''t necessarily trying to become famous.

They don''t need millions of followers.

They don''t need viral marketing.

They don''t need to release a new version every month.

Their customers may simply need them to work.

Every day.

For years.

That kind of business can be incredibly valuable.

Because reliability itself becomes part of the product.

A successful infrastructure asset can create a powerful cycle.

Capital

↓

Build infrastructure

↓

Infrastructure provides service

↓

Customers pay

↓

Cash flow is generated

↓

Debt is serviced

↓

Remaining cash can be distributed or reinvested

↓

Asset improves or expands

↓

Capacity increases

↓

More customers

↓

More cash flow

This isn''t guaranteed.

But when the economics work, it can produce exactly the kind of long-duration returns institutional investors seek.

There is an interesting contradiction happening.

The economy is becoming more digital.

But the digital economy requires more physical infrastructure.

AI requires data centers.

Data centers require electricity.

Electric vehicles require charging infrastructure.

Cloud computing requires physical servers.

E-commerce requires warehouses.

Digital finance requires connectivity and reliable power.

Streaming requires networks.

Modern manufacturing increasingly requires sophisticated industrial systems.

The more digital the economy becomes, the more infrastructure it may require underneath.

The most interesting infrastructure opportunities may not be obvious.

They may sit underneath major trends.

Instead of asking:

"What''s the next big technology?"

An investor might ask:

"What physical infrastructure must exist if this technology succeeds?"

Instead of:

"Will AI grow?"

Ask:

"What must be built if AI demand grows 10x?"

Instead of:

"Will African cities grow?"

Ask:

"What infrastructure must those cities build to support that growth?"

Instead of:

"Will energy demand increase?"

Ask:

"Where are the bottlenecks between generation and the customers who need the electricity?"

Those questions move you from trend watching to investment thinking.

Ultimately, infrastructure has a particular combination that long-term investors find attractive:

Long asset lives.

Essential services.

Potentially recurring cash flow.

Barriers to entry.

Strategic locations.

High replacement costs.

Long-term demand.

Potential inflation protection in some structures.

And, in certain markets, enormous room for expansion.

None of these guarantees a successful investment.

But together, they explain why infrastructure continues to attract capital.

The asset doesn''t need to be exciting.

It needs to keep working.

For a long time.

For people who cannot easily stop using it.

And that may be one of the most powerful characteristics an investment can have.

If infrastructure can be valuable because it produces durable economic output, another distinction becomes critical:

What is the difference between what something costs and what it is actually worth?

A $100 million asset can be worth $50 million.

A $50 million asset can eventually become worth $200 million.

And sometimes the market price can be dramatically disconnected from the underlying economics.

Next on Omniv: The Difference Between Price and Value.', 'Analysis from the Omniv Editorial desk.', 'There is a reason pension funds, sovereign wealth funds, insurance companies and other long-term investors keep looking at infrastructure. It isn''t because infrastructure is exciting. Most infrastructure is the opposite of exciting.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"There is a reason pension funds, sovereign wealth funds, insurance companies and other long-term investors keep looking at infrastructure."},{"type":"paragraph","text":"It isn''t because infrastructure is exciting."},{"type":"paragraph","text":"Most infrastructure is the opposite of exciting."},{"type":"paragraph","text":"A road."},{"type":"paragraph","text":"A power plant."},{"type":"paragraph","text":"A transmission network."},{"type":"paragraph","text":"A port."},{"type":"paragraph","text":"A water system."},{"type":"paragraph","text":"A telecom tower."},{"type":"paragraph","text":"A data center."},{"type":"paragraph","text":"A pipeline."},{"type":"paragraph","text":"A railway."},{"type":"paragraph","text":"Nobody wakes up wanting to buy a beautiful new piece of infrastructure."},{"type":"paragraph","text":"But investors aren''t necessarily looking for beautiful."},{"type":"paragraph","text":"They are looking for durable economics."},{"type":"paragraph","text":"And infrastructure can offer something increasingly valuable in investing:"},{"type":"paragraph","text":"long-lived assets connected to persistent demand."},{"type":"heading","text":"Infrastructure is different from most businesses","level":2},{"type":"paragraph","text":"Consider a software startup."},{"type":"paragraph","text":"Its product might become obsolete in three years."},{"type":"paragraph","text":"Its customers can leave."},{"type":"paragraph","text":"A competitor can appear."},{"type":"paragraph","text":"Its technology can change."},{"type":"paragraph","text":"Its revenue might grow 100% one year and collapse the next."},{"type":"paragraph","text":"Now consider a bridge."},{"type":"paragraph","text":"If people need to cross the river, the bridge continues to perform the same basic function."},{"type":"paragraph","text":"A power transmission line doesn''t need a new version every six months."},{"type":"paragraph","text":"A port doesn''t need a redesigned user interface."},{"type":"paragraph","text":"A water network doesn''t need to become \"viral.\""},{"type":"paragraph","text":"Infrastructure is built around a different economic logic."},{"type":"paragraph","text":"It exists to perform a necessary function over a long period of time."},{"type":"heading","text":"The first attraction: long asset lives","level":2},{"type":"paragraph","text":"Infrastructure can have extremely long useful lives."},{"type":"paragraph","text":"A properly maintained piece of infrastructure can operate for decades."},{"type":"paragraph","text":"That creates an unusual investment characteristic."},{"type":"paragraph","text":"An investor isn''t necessarily betting on what happens next quarter."},{"type":"paragraph","text":"They may be evaluating the economics of an asset over:"},{"type":"paragraph","text":"10 years,"},{"type":"paragraph","text":"20 years,"},{"type":"paragraph","text":"30 years,"},{"type":"paragraph","text":"or longer."},{"type":"paragraph","text":"That long duration fits naturally with institutions whose liabilities also extend far into the future."},{"type":"paragraph","text":"Think about a pension fund."},{"type":"paragraph","text":"It doesn''t necessarily need all its money back next year."},{"type":"paragraph","text":"It has obligations to people who may retire decades from now."},{"type":"paragraph","text":"An asset capable of producing relatively durable cash flows over decades can therefore fit the institution''s needs."},{"type":"heading","text":"Infrastructure can turn necessity into revenue","level":2},{"type":"paragraph","text":"This is the second attraction."},{"type":"paragraph","text":"People don''t necessarily choose whether they need infrastructure."},{"type":"paragraph","text":"A factory needs electricity."},{"type":"paragraph","text":"A city needs water."},{"type":"paragraph","text":"Businesses need telecommunications."},{"type":"paragraph","text":"Importers need ports."},{"type":"paragraph","text":"People need transportation."},{"type":"paragraph","text":"Data centers need power and connectivity."},{"type":"paragraph","text":"Factories need logistics."},{"type":"paragraph","text":"These needs create economic demand."},{"type":"paragraph","text":"The infrastructure provider sits between the need and the customer."},{"type":"paragraph","text":"That position can be extraordinarily valuable."},{"type":"heading","text":"The toll-road idea","level":2},{"type":"paragraph","text":"One of the easiest ways to understand infrastructure economics is to imagine a toll road."},{"type":"paragraph","text":"You build the road."},{"type":"paragraph","text":"People use it."},{"type":"paragraph","text":"They pay."},{"type":"paragraph","text":"The road may continue generating revenue for many years."},{"type":"paragraph","text":"Of course, the real world is much more complicated."},{"type":"paragraph","text":"Traffic can disappoint."},{"type":"paragraph","text":"Maintenance costs can rise."},{"type":"paragraph","text":"Governments can change regulations."},{"type":"paragraph","text":"Debt can become expensive."},{"type":"paragraph","text":"Construction can go over budget."},{"type":"paragraph","text":"But the fundamental model is simple:"},{"type":"paragraph","text":"capital goes in → infrastructure is built → users pay → cash flows come out."},{"type":"paragraph","text":"That''s attractive to investors when the economics are predictable enough."},{"type":"heading","text":"Predictability is often more valuable than excitement","level":2},{"type":"paragraph","text":"Imagine two investments."},{"type":"heading","text":"Investment A","level":3},{"type":"paragraph","text":"Potential return: 40%"},{"type":"paragraph","text":"But there is a significant chance the business fails."},{"type":"heading","text":"Investment B","level":3},{"type":"paragraph","text":"Potential return: 10%"},{"type":"paragraph","text":"But the cash flow is relatively predictable for 20 years."},{"type":"paragraph","text":"Which one is better?"},{"type":"paragraph","text":"There isn''t a universal answer."},{"type":"paragraph","text":"It depends on the investor."},{"type":"paragraph","text":"A venture capital fund may prefer A."},{"type":"paragraph","text":"A pension fund may find B extremely attractive."},{"type":"paragraph","text":"This is one reason infrastructure attracts institutional capital."},{"type":"paragraph","text":"Predictability can itself be an investment feature."},{"type":"heading","text":"Infrastructure can have contracted revenue","level":2},{"type":"paragraph","text":"Some infrastructure assets operate under long-term contracts."},{"type":"paragraph","text":"A power project, for example, may have agreements governing who buys its electricity and under what terms."},{"type":"paragraph","text":"A data center may sign long-term agreements with customers."},{"type":"paragraph","text":"A logistics facility may have contracted tenants."},{"type":"paragraph","text":"A telecom infrastructure company may receive recurring payments from operators."},{"type":"paragraph","text":"The precise structure varies enormously."},{"type":"paragraph","text":"But the principle is important:"},{"type":"paragraph","text":"Long-term contracts can make future revenue easier to model."},{"type":"paragraph","text":"And investors love things they can model."},{"type":"paragraph","text":"Not because models are always correct."},{"type":"paragraph","text":"Because predictable economics reduce uncertainty."},{"type":"heading","text":"Inflation can matter too","level":2},{"type":"paragraph","text":"Infrastructure can sometimes have revenue structures linked to inflation or other economic variables."},{"type":"paragraph","text":"For example, certain contracts, regulated tariffs or concession arrangements may include mechanisms that allow revenues to adjust over time."},{"type":"paragraph","text":"This can make infrastructure attractive in inflationary environments."},{"type":"paragraph","text":"But it is not automatic."},{"type":"paragraph","text":"A poorly structured infrastructure investment can still be badly damaged by inflation."},{"type":"paragraph","text":"The point is simply that some infrastructure assets can have characteristics that help investors manage long-term changes in purchasing power."},{"type":"heading","text":"The replacement problem","level":2},{"type":"paragraph","text":"Now consider something interesting."},{"type":"paragraph","text":"Imagine a city already has:"},{"type":"paragraph","text":"a functioning airport,"},{"type":"paragraph","text":"a port,"},{"type":"paragraph","text":"a transmission network,"},{"type":"paragraph","text":"a fiber route,"},{"type":"paragraph","text":"a water system."},{"type":"paragraph","text":"Could someone build a competing system?"},{"type":"paragraph","text":"Maybe."},{"type":"paragraph","text":"But it might require enormous amounts of:"},{"type":"paragraph","text":"land,"},{"type":"paragraph","text":"capital,"},{"type":"paragraph","text":"permits,"},{"type":"paragraph","text":"time,"},{"type":"paragraph","text":"political negotiation,"},{"type":"paragraph","text":"construction,"},{"type":"paragraph","text":"and engineering."},{"type":"paragraph","text":"This creates what economists sometimes describe as barriers to entry."},{"type":"paragraph","text":"And barriers to entry can protect the economics of existing infrastructure."},{"type":"heading","text":"Infrastructure can be difficult to duplicate","level":2},{"type":"paragraph","text":"Suppose a company owns a critical piece of infrastructure in an important location."},{"type":"paragraph","text":"A competitor wants to build an identical asset."},{"type":"paragraph","text":"The competitor might need to:"},{"type":"paragraph","text":"find suitable land,"},{"type":"paragraph","text":"obtain permits,"},{"type":"paragraph","text":"secure financing,"},{"type":"paragraph","text":"connect to utilities,"},{"type":"paragraph","text":"build the facility,"},{"type":"paragraph","text":"negotiate rights of way,"},{"type":"paragraph","text":"attract customers,"},{"type":"paragraph","text":"and wait years before the project becomes operational."},{"type":"paragraph","text":"The existing infrastructure has something the new competitor cannot immediately buy:"},{"type":"paragraph","text":"time."},{"type":"paragraph","text":"That can be an enormous advantage."},{"type":"heading","text":"Location creates another moat","level":2},{"type":"paragraph","text":"Infrastructure is often geographically fixed."},{"type":"paragraph","text":"A port cannot move."},{"type":"paragraph","text":"A railway cannot move."},{"type":"paragraph","text":"A transmission line cannot simply relocate."},{"type":"paragraph","text":"A data center may be technically replaceable, but its connectivity and access to power can make its location economically important."},{"type":"paragraph","text":"A logistics warehouse beside a major transportation corridor may be worth substantially more than an identical building somewhere else."},{"type":"paragraph","text":"This makes infrastructure deeply connected to geography."},{"type":"heading","text":"Infrastructure creates networks","level":2},{"type":"paragraph","text":"Some infrastructure becomes more valuable because it connects to other infrastructure."},{"type":"paragraph","text":"Consider electricity."},{"type":"paragraph","text":"A power plant is useful."},{"type":"paragraph","text":"But it becomes much more useful when connected to:"},{"type":"paragraph","text":"transmission,"},{"type":"paragraph","text":"distribution,"},{"type":"paragraph","text":"industrial customers,"},{"type":"paragraph","text":"storage,"},{"type":"paragraph","text":"and other generation."},{"type":"paragraph","text":"The same is true for telecommunications."},{"type":"paragraph","text":"A fiber cable is valuable."},{"type":"paragraph","text":"A network of connected fiber routes is more valuable."},{"type":"paragraph","text":"A port becomes more useful when connected to roads and railways."},{"type":"paragraph","text":"Infrastructure therefore often creates network effects at the physical level."},{"type":"heading","text":"The invisible economy underneath cities","level":2},{"type":"paragraph","text":"Walk through a major city."},{"type":"paragraph","text":"Most of what you see depends on infrastructure."},{"type":"paragraph","text":"Buildings need electricity."},{"type":"paragraph","text":"Businesses need internet."},{"type":"paragraph","text":"Restaurants need logistics."},{"type":"paragraph","text":"Factories need transport."},{"type":"paragraph","text":"Homes need water."},{"type":"paragraph","text":"Banks need communications."},{"type":"paragraph","text":"Hospitals need power."},{"type":"paragraph","text":"Warehouses need roads."},{"type":"paragraph","text":"Data centers need energy and fiber."},{"type":"paragraph","text":"The city is effectively an enormous economic machine built on infrastructure."},{"type":"paragraph","text":"That creates an important investment insight:"},{"type":"paragraph","text":"Economic activity cannot scale indefinitely without the infrastructure supporting it."},{"type":"heading","text":"Infrastructure can benefit from economic growth","level":2},{"type":"paragraph","text":"Suppose a city''s population increases."},{"type":"paragraph","text":"More people need:"},{"type":"paragraph","text":"housing,"},{"type":"paragraph","text":"electricity,"},{"type":"paragraph","text":"transport,"},{"type":"paragraph","text":"internet,"},{"type":"paragraph","text":"water,"},{"type":"paragraph","text":"food distribution,"},{"type":"paragraph","text":"healthcare."},{"type":"paragraph","text":"Businesses grow."},{"type":"paragraph","text":"Factories open."},{"type":"paragraph","text":"Warehouses expand."},{"type":"paragraph","text":"Data consumption increases."},{"type":"paragraph","text":"Suddenly infrastructure demand rises."},{"type":"paragraph","text":"This is why investors sometimes look at infrastructure as a way to gain exposure to broader economic development."},{"type":"paragraph","text":"Rather than betting on which individual company will win, they invest in the systems that many companies depend upon."},{"type":"heading","text":"This is particularly interesting in emerging markets","level":2},{"type":"paragraph","text":"In a mature economy, much of the basic infrastructure may already exist."},{"type":"paragraph","text":"The investment opportunity can therefore involve:"},{"type":"paragraph","text":"maintenance,"},{"type":"paragraph","text":"upgrades,"},{"type":"paragraph","text":"replacement,"},{"type":"paragraph","text":"efficiency,"},{"type":"paragraph","text":"modernization."},{"type":"paragraph","text":"But in a rapidly growing economy, there can be a different opportunity."},{"type":"paragraph","text":"New infrastructure may need to be built simply to accommodate growth."},{"type":"paragraph","text":"More:"},{"type":"paragraph","text":"roads."},{"type":"paragraph","text":"Power."},{"type":"paragraph","text":"Ports."},{"type":"paragraph","text":"Fiber."},{"type":"paragraph","text":"Housing."},{"type":"paragraph","text":"Industrial parks."},{"type":"paragraph","text":"Warehouses."},{"type":"paragraph","text":"Data centers."},{"type":"paragraph","text":"Rail."},{"type":"paragraph","text":"Water."},{"type":"paragraph","text":"This creates a much larger potential capital requirement."},{"type":"heading","text":"Africa presents a particularly interesting case","level":2},{"type":"paragraph","text":"Africa is not one infrastructure market."},{"type":"paragraph","text":"It is 50+ very different national markets with different:"},{"type":"paragraph","text":"political systems,"},{"type":"paragraph","text":"resources,"},{"type":"paragraph","text":"populations,"},{"type":"paragraph","text":"industrial bases,"},{"type":"paragraph","text":"energy systems,"},{"type":"paragraph","text":"regulatory environments,"},{"type":"paragraph","text":"and levels of development."},{"type":"paragraph","text":"But across the continent there are enormous infrastructure gaps and equally enormous infrastructure opportunities."},{"type":"paragraph","text":"The interesting question for investors isn''t simply:"},{"type":"paragraph","text":"\"Is Africa growing?\""},{"type":"paragraph","text":"It is:"},{"type":"paragraph","text":"Which infrastructure bottlenecks are preventing that growth from happening faster?"},{"type":"paragraph","text":"That question produces much better investment analysis."},{"type":"heading","text":"Find the bottleneck","level":2},{"type":"paragraph","text":"Imagine a city with:"},{"type":"paragraph","text":"1 million people,"},{"type":"paragraph","text":"excellent roads,"},{"type":"paragraph","text":"strong internet,"},{"type":"paragraph","text":"but unreliable electricity."},{"type":"paragraph","text":"Electricity becomes the bottleneck."},{"type":"paragraph","text":"Now imagine another city with:"},{"type":"paragraph","text":"excellent electricity,"},{"type":"paragraph","text":"but terrible logistics."},{"type":"paragraph","text":"Logistics becomes the bottleneck."},{"type":"paragraph","text":"Another city may have:"},{"type":"paragraph","text":"power + roads + ports,"},{"type":"paragraph","text":"but insufficient digital infrastructure."},{"type":"paragraph","text":"Connectivity becomes the bottleneck."},{"type":"paragraph","text":"The opportunity can exist precisely where the economy is constrained."},{"type":"heading","text":"Bottlenecks can become valuable","level":2},{"type":"paragraph","text":"A bottleneck is essentially a point where demand exceeds available capacity."},{"type":"paragraph","text":"That doesn''t automatically make it a good investment."},{"type":"paragraph","text":"But it creates something investors should investigate."},{"type":"paragraph","text":"Suppose companies are ready to expand but cannot get reliable electricity."},{"type":"paragraph","text":"Who can solve that?"},{"type":"paragraph","text":"Suppose exporters want to ship more goods but port capacity is constrained."},{"type":"paragraph","text":"Who can expand capacity?"},{"type":"paragraph","text":"Suppose businesses need high-quality cloud infrastructure but local capacity is limited."},{"type":"paragraph","text":"Who can build it?"},{"type":"paragraph","text":"These questions turn macroeconomic problems into potential investment theses."},{"type":"heading","text":"But infrastructure isn''t risk-free","level":2},{"type":"paragraph","text":"This is important."},{"type":"paragraph","text":"Infrastructure can look wonderfully stable from a distance."},{"type":"paragraph","text":"Up close, it can be extremely complicated."},{"type":"paragraph","text":"There can be:"},{"type":"paragraph","text":"political risk,"},{"type":"paragraph","text":"currency risk,"},{"type":"paragraph","text":"construction risk,"},{"type":"paragraph","text":"financing risk,"},{"type":"paragraph","text":"regulatory risk,"},{"type":"paragraph","text":"demand risk,"},{"type":"paragraph","text":"operational risk,"},{"type":"paragraph","text":"environmental risk,"},{"type":"paragraph","text":"security risk."},{"type":"paragraph","text":"A power plant can be technically excellent and still struggle if the buyer cannot pay."},{"type":"paragraph","text":"A toll road can be well built and still fail if traffic is lower than expected."},{"type":"paragraph","text":"A port can be strategically located and still suffer from political instability."},{"type":"paragraph","text":"Infrastructure requires serious due diligence."},{"type":"heading","text":"The financing problem","level":2},{"type":"paragraph","text":"Infrastructure projects can require enormous amounts of upfront capital."},{"type":"paragraph","text":"You spend money today."},{"type":"paragraph","text":"The asset may not generate meaningful cash for years."},{"type":"paragraph","text":"This is another reason infrastructure is naturally connected to long-term capital."},{"type":"paragraph","text":"A short-term investor may find the construction period frustrating."},{"type":"paragraph","text":"A long-term investor may see it differently."},{"type":"paragraph","text":"The investor is essentially saying:"},{"type":"paragraph","text":"\"I am willing to wait because the asset could produce economic output for a very long time.\""},{"type":"paragraph","text":"That is a fundamentally different investment horizon."},{"type":"heading","text":"Debt becomes important","level":2},{"type":"paragraph","text":"Because infrastructure projects can be capital intensive, financing structures often combine equity and debt."},{"type":"paragraph","text":"Suppose a project costs $100 million."},{"type":"paragraph","text":"The owners might contribute part of the capital."},{"type":"paragraph","text":"Lenders provide the rest."},{"type":"paragraph","text":"The project''s future cash flow is then used to service the debt."},{"type":"paragraph","text":"This can magnify returns when everything works."},{"type":"paragraph","text":"It can also magnify losses when assumptions fail."},{"type":"paragraph","text":"That''s why infrastructure investing isn''t simply about identifying a useful asset."},{"type":"paragraph","text":"The capital structure matters."},{"type":"heading","text":"The asset isn''t the whole investment","level":2},{"type":"paragraph","text":"This is one of the most important lessons."},{"type":"paragraph","text":"Two investors can own economically similar infrastructure but have completely different outcomes."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"They may have:"},{"type":"paragraph","text":"different purchase prices,"},{"type":"paragraph","text":"different debt levels,"},{"type":"paragraph","text":"different financing costs,"},{"type":"paragraph","text":"different contracts,"},{"type":"paragraph","text":"different operating costs,"},{"type":"paragraph","text":"different tax structures,"},{"type":"paragraph","text":"different exit assumptions."},{"type":"paragraph","text":"The underlying asset matters."},{"type":"paragraph","text":"But the price and structure at which you acquire it matter enormously."},{"type":"heading","text":"Infrastructure can be boring — and that is part of the attraction","level":2},{"type":"paragraph","text":"The best infrastructure businesses aren''t necessarily trying to become famous."},{"type":"paragraph","text":"They don''t need millions of followers."},{"type":"paragraph","text":"They don''t need viral marketing."},{"type":"paragraph","text":"They don''t need to release a new version every month."},{"type":"paragraph","text":"Their customers may simply need them to work."},{"type":"paragraph","text":"Every day."},{"type":"paragraph","text":"For years."},{"type":"paragraph","text":"That kind of business can be incredibly valuable."},{"type":"paragraph","text":"Because reliability itself becomes part of the product."},{"type":"heading","text":"The long-term capital flywheel","level":2},{"type":"paragraph","text":"A successful infrastructure asset can create a powerful cycle."},{"type":"paragraph","text":"Capital"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Build infrastructure"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Infrastructure provides service"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Customers pay"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Cash flow is generated"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Debt is serviced"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Remaining cash can be distributed or reinvested"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Asset improves or expands"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Capacity increases"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"More customers"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"More cash flow"},{"type":"paragraph","text":"This isn''t guaranteed."},{"type":"paragraph","text":"But when the economics work, it can produce exactly the kind of long-duration returns institutional investors seek."},{"type":"heading","text":"Why infrastructure matters more in an increasingly digital world","level":2},{"type":"paragraph","text":"There is an interesting contradiction happening."},{"type":"paragraph","text":"The economy is becoming more digital."},{"type":"paragraph","text":"But the digital economy requires more physical infrastructure."},{"type":"paragraph","text":"AI requires data centers."},{"type":"paragraph","text":"Data centers require electricity."},{"type":"paragraph","text":"Electric vehicles require charging infrastructure."},{"type":"paragraph","text":"Cloud computing requires physical servers."},{"type":"paragraph","text":"E-commerce requires warehouses."},{"type":"paragraph","text":"Digital finance requires connectivity and reliable power."},{"type":"paragraph","text":"Streaming requires networks."},{"type":"paragraph","text":"Modern manufacturing increasingly requires sophisticated industrial systems."},{"type":"paragraph","text":"The more digital the economy becomes, the more infrastructure it may require underneath."},{"type":"heading","text":"The investment question","level":2},{"type":"paragraph","text":"The most interesting infrastructure opportunities may not be obvious."},{"type":"paragraph","text":"They may sit underneath major trends."},{"type":"paragraph","text":"Instead of asking:"},{"type":"paragraph","text":"\"What''s the next big technology?\""},{"type":"paragraph","text":"An investor might ask:"},{"type":"paragraph","text":"\"What physical infrastructure must exist if this technology succeeds?\""},{"type":"paragraph","text":"Instead of:"},{"type":"paragraph","text":"\"Will AI grow?\""},{"type":"paragraph","text":"Ask:"},{"type":"paragraph","text":"\"What must be built if AI demand grows 10x?\""},{"type":"paragraph","text":"Instead of:"},{"type":"paragraph","text":"\"Will African cities grow?\""},{"type":"paragraph","text":"Ask:"},{"type":"paragraph","text":"\"What infrastructure must those cities build to support that growth?\""},{"type":"paragraph","text":"Instead of:"},{"type":"paragraph","text":"\"Will energy demand increase?\""},{"type":"paragraph","text":"Ask:"},{"type":"paragraph","text":"\"Where are the bottlenecks between generation and the customers who need the electricity?\""},{"type":"paragraph","text":"Those questions move you from trend watching to investment thinking."},{"type":"heading","text":"The deeper reason infrastructure attracts capital","level":2},{"type":"paragraph","text":"Ultimately, infrastructure has a particular combination that long-term investors find attractive:"},{"type":"paragraph","text":"Long asset lives."},{"type":"paragraph","text":"Essential services."},{"type":"paragraph","text":"Potentially recurring cash flow."},{"type":"paragraph","text":"Barriers to entry."},{"type":"paragraph","text":"Strategic locations."},{"type":"paragraph","text":"High replacement costs."},{"type":"paragraph","text":"Long-term demand."},{"type":"paragraph","text":"Potential inflation protection in some structures."},{"type":"paragraph","text":"And, in certain markets, enormous room for expansion."},{"type":"paragraph","text":"None of these guarantees a successful investment."},{"type":"paragraph","text":"But together, they explain why infrastructure continues to attract capital."},{"type":"paragraph","text":"The asset doesn''t need to be exciting."},{"type":"paragraph","text":"It needs to keep working."},{"type":"paragraph","text":"For a long time."},{"type":"paragraph","text":"For people who cannot easily stop using it."},{"type":"paragraph","text":"And that may be one of the most powerful characteristics an investment can have."},{"type":"heading","text":"The question this leaves us with","level":2},{"type":"paragraph","text":"If infrastructure can be valuable because it produces durable economic output, another distinction becomes critical:"},{"type":"paragraph","text":"What is the difference between what something costs and what it is actually worth?"},{"type":"paragraph","text":"A $100 million asset can be worth $50 million."},{"type":"paragraph","text":"A $50 million asset can eventually become worth $200 million."},{"type":"paragraph","text":"And sometimes the market price can be dramatically disconnected from the underlying economics."},{"type":"paragraph","text":"Next on Omniv: The Difference Between Price and Value."}]'::jsonb, 'MONEY', 11, 'published', 'Why Infrastructure Attracts Long-Term Capital | Omniv Editorial', 'There is a reason pension funds, sovereign wealth funds, insurance companies and other long-term investors keep looking at infrastructure. It isn''t because infrastructure is exciting. Most infrastructure is the opposite of exciting.', 'https://omniv.media/p/why-infrastructure-attracts-long-term-capital', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"biology","label":"Biology"},{"type":"project","slug":"africa","label":"Africa"}]'::jsonb, '{}'::text[], '{money,russia,artificial-intelligence,data-centres,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-difference-between-price-and-value', 'The Difference Between Price and Value', 'A house is listed for $500,000. Someone offers $450,000. Another person offers $520,000.', 'A house is listed for $500,000.

Someone offers $450,000.

Another person offers $520,000.

The house hasn''t changed.

The walls haven''t moved.

The land hasn''t become larger.

The roof didn''t suddenly become better.

Yet three different numbers have appeared.

So which number represents what the house is actually worth?

This is one of the simplest questions in investing.

It is also one of the easiest to get wrong.

Because price and value are not the same thing.

Price is observable.

You can open a stock exchange and see it.

You can look at a property listing.

You can ask someone what they paid.

You can check the price of a commodity.

Price is the number attached to an asset at a particular moment.

But price doesn''t necessarily tell you what the asset is fundamentally worth.

It tells you what someone is willing to exchange for it right now.

That distinction becomes extremely important.

Value is more complicated.

It asks:

What economic benefit can this asset reasonably produce?

For a company, that might mean future cash flows.

For a rental property, it might mean future rental income.

For farmland, it might mean agricultural output.

For infrastructure, it might mean decades of operating revenue.

For a piece of land, it might involve what can eventually be developed there.

For a technology company, it could involve the future economics of a product that hasn''t reached its potential yet.

Value therefore requires assumptions.

Price requires a transaction.

Company A and Company B are almost identical.

Both generate:

$10 million in annual free cash flow.

Both have similar growth.

Both operate in the same industry.

Both have similar risks.

But Company A is valued by the market at:

$50 million.

Company B is valued at:

$150 million.

The underlying economics are similar.

The prices aren''t.

Which one is more attractive?

If everything else really is equal, the cheaper company deserves investigation.

That doesn''t automatically mean it''s a bargain.

Perhaps the market knows something you don''t.

But you''ve identified the beginning of an investment question.

This is one of the most important concepts in markets.

When you buy an asset, you aren''t only buying what exists today.

You''re buying the market''s expectations about the future.

Consider a company trading at an extremely high valuation.

The market may be assuming:

rapid growth,

high future margins,

large market expansion,

strong competitive advantages,

and years of successful execution.

The company doesn''t have to become bad for the investment to lose money.

It only needs to disappoint those expectations.

This sounds contradictory.

It isn''t.

Imagine an exceptional company.

Its revenue is growing rapidly.

Customers love its product.

Its margins are excellent.

Its competitive position is strong.

Everyone agrees it is a great business.

Then investors bid its valuation to an extraordinary level.

At that price, the company may need to achieve near-perfect outcomes to justify the valuation.

If growth slows from 40% to 25%, the company may still be excellent.

But the stock can fall dramatically.

Why?

Because the business remained good while the expectations became too high.

The opposite can also happen.

Imagine a struggling company.

Growth is weak.

Sentiment is terrible.

Investors don''t like the industry.

The stock price has collapsed.

But the company still owns valuable assets, generates cash and has a realistic path to recovery.

It may be worth investigating.

The company doesn''t need to become extraordinary.

It may only need to become less bad than the market expects.

That is a very different investment thesis.

Every market price contains a prediction.

If a company trades at a very high valuation, the market is effectively saying:

"We expect significant future economic success."

If an asset trades at a very low valuation, the market may be saying:

"We expect poor future economics."

Your job as an investor isn''t simply to ask:

"Is this company good?"

It is to ask:

"What does the current price assume?"

Then:

"Are those assumptions reasonable?"

And finally:

"What happens if they''re wrong?"

Consider two companies.

Expected growth: 5%

Valuation: $100 million

Expected growth: 30%

Valuation: $1 billion

Company B is growing much faster.

But that doesn''t automatically make it the better investment.

Why?

Because the price already reflects its growth.

The important question is the relationship between:

future economics

and

current price.

Imagine you find an apartment that can generate $20,000 of annual rental income.

You pay:

$100,000.

That looks interesting.

Now imagine someone else buys the same apartment for:

$500,000.

The property hasn''t changed.

The economics are the same.

But the investment has.

At $100,000, the income represents a much higher return on the purchase price.

At $500,000, the return is much lower.

This is why:

A good asset can become a bad investment at the wrong price.

A struggling asset can become attractive at a sufficiently low price.

But there is a catch.

Cheap doesn''t automatically mean undervalued.

A company can trade cheaply because its future really is terrible.

A property can be cheap because nobody wants to live there.

A factory can be cheap because its machinery is obsolete.

A stock can fall 80% and still be expensive relative to what the business will eventually be worth.

This is why the phrase:

"It has already fallen a lot."

is not an investment thesis.

Imagine an asset worth $10.

Its price falls to $8.

Then $6.

Then $4.

At first glance, it looks increasingly attractive.

But imagine the underlying value is actually falling too.

Maybe the business is losing customers.

Maybe its costs are rising.

Maybe its product is becoming obsolete.

Maybe its debt is becoming unmanageable.

The price can fall because the value is falling.

That''s why investors need to distinguish between:

price decline

and

mispricing.

Markets are remarkably good at processing information.

But they''re not perfect.

Mispricing can occur because of:

fear

greed

forced selling

liquidity constraints

short-term thinking

information gaps

complexity

regulatory changes

temporary problems

investor crowding

behavioral biases

Sometimes the market simply doesn''t have enough information.

Sometimes everyone has the information but interprets it differently.

And sometimes investors are focused on a completely different time horizon.

Imagine a company experiencing a temporary earnings decline.

A trader thinking about the next three months may see a serious problem.

A long-term investor thinking about the next decade may see an opportunity.

Neither person is necessarily irrational.

They''re answering different questions.

The trader asks:

"What happens next?"

The investor asks:

"What will this business look like after the temporary problem is gone?"

This difference in time horizon creates enormous variation in market opinions.

There''s another important point.

Just because you believe an asset is undervalued doesn''t mean the price will immediately rise.

Markets can remain pessimistic for years.

A thesis can be correct about fundamentals and still produce poor returns if:

the timing is wrong,

the financing changes,

the business deteriorates,

or the market never recognizes the expected value.

This is why investing isn''t simply about being right.

It''s about being right enough, at the right price, with enough time and capital to survive being early.

Value isn''t permanently fixed.

A business can become more valuable.

Or less valuable.

Consider an energy company.

A new discovery could increase its reserves.

A new regulation could reduce demand.

A major infrastructure project could improve its economics.

A competitor could make its technology obsolete.

A currency collapse could change its cost structure.

Value changes as the underlying economics change.

So investors aren''t trying to calculate one eternal number.

They''re continually updating their view.

Sometimes an asset has possibilities that aren''t captured by current cash flow.

Imagine owning land near a rapidly expanding city.

Today it''s farmland.

Tomorrow it could potentially become:

housing,

industrial property,

a logistics center,

a data center,

or commercial development.

Those possibilities create optionality.

The land''s current use doesn''t necessarily represent its maximum economic potential.

But optionality should be treated carefully.

A possibility isn''t the same thing as a probability.

A field isn''t worth billions simply because someone could theoretically build a city there.

The path to realization matters.

Imagine a power project.

Its current revenue is modest.

But a new industrial zone is being built nearby.

If the industrial zone succeeds, electricity demand could rise significantly.

The project''s future economics might therefore change.

An investor who understands the development before it becomes obvious may see value that isn''t yet reflected in the price.

But again, the thesis needs evidence.

The industrial zone needs financing.

Construction needs to happen.

Customers need to arrive.

The grid needs to support them.

This is why good investment analysis is about connecting events.

Markets constantly update.

New information arrives.

Investors revise expectations.

Prices move.

A company announces earnings.

A government changes policy.

Interest rates change.

A new competitor enters.

A technology breakthrough occurs.

A war disrupts supply.

A new infrastructure project is approved.

Each event changes the information available to investors.

The price is the market''s constantly changing estimate.

Imagine the market expects:

10% growth.

The company delivers:

15%.

The company didn''t suddenly become amazing.

The market simply underestimated it.

Now imagine the market expects:

40% growth.

The company delivers:

30%.

Thirty percent growth sounds fantastic.

But the market may still punish the company.

Because it wasn''t buying the company based on what happened.

It was buying based on what it expected to happen.

That''s the heart of market repricing.

It seems irrational.

A company reports record revenue.

The stock drops.

Why?

Because investors expected even more.

Markets trade on surprises relative to expectations, not simply absolute outcomes.

This is why professional investors spend so much time thinking about consensus.

What does everyone already believe?

What is already priced in?

What would have to happen for the market to change its mind?

This is where the difference between price and value becomes actionable.

Suppose you believe:

Market expectation: Growth will slow to 5%.

Your thesis: A new product could sustain 15% growth.

That''s interesting.

But you need evidence.

What product?

Why will customers buy it?

How large is the market?

What are competitors doing?

How quickly can revenue appear?

What happens to margins?

What would prove you wrong?

Now you have an investment thesis rather than a feeling.

This may be the simplest way to understand the distinction.

Price is easy to find.

Open the market.

Look at the listing.

Check the transaction.

Value is harder.

You have to understand:

the asset,

the economics,

the market,

the competition,

the future,

the risks,

the alternatives,

and the price you''re paying.

That''s why investing requires analysis.

If value were simply equal to price, there would be nothing to analyze.

Whenever an investment becomes extremely popular, ask:

How much of the good news is already reflected in the price?

A great company can be widely known.

A great industry can be widely understood.

A major trend can be obvious.

The opportunity doesn''t necessarily disappear.

But the expected return may shrink because everyone has already bid up the asset.

Markets don''t reward investors simply for discovering that something is good.

They reward investors when their assessment of future economics differs meaningfully from the price.

Investing isn''t a beauty contest.

It isn''t:

"Which company do I like?"

It isn''t:

"Which industry sounds exciting?"

It isn''t even:

"Which asset is objectively the best?"

The more useful question is:

What am I paying, what am I getting, and what does the price assume about the future?

Sometimes the best business in the world is a terrible investment at an absurd valuation.

Sometimes an unpopular asset becomes extremely attractive because the market has priced in a disaster that never arrives.

Sometimes the market is simply right.

The job is to figure out which situation you''re looking at.

Value asks where the economics are going.

The gap between those two is where investing gets interesting.

And once you understand that distinction, another question naturally follows:

If an investor can estimate an asset''s value, what actually makes them willing to put capital behind it?

Because eventually every investment thesis has to answer one brutally simple question:

Where does the money come from?

Next on Omniv: Why Investors Care About Cash Flow.', 'Analysis from the Omniv Editorial desk.', 'A house is listed for $500,000. Someone offers $450,000. Another person offers $520,000.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"A house is listed for $500,000."},{"type":"paragraph","text":"Someone offers $450,000."},{"type":"paragraph","text":"Another person offers $520,000."},{"type":"paragraph","text":"The house hasn''t changed."},{"type":"paragraph","text":"The walls haven''t moved."},{"type":"paragraph","text":"The land hasn''t become larger."},{"type":"paragraph","text":"The roof didn''t suddenly become better."},{"type":"paragraph","text":"Yet three different numbers have appeared."},{"type":"paragraph","text":"So which number represents what the house is actually worth?"},{"type":"paragraph","text":"This is one of the simplest questions in investing."},{"type":"paragraph","text":"It is also one of the easiest to get wrong."},{"type":"paragraph","text":"Because price and value are not the same thing."},{"type":"heading","text":"Price is what the market says today","level":2},{"type":"paragraph","text":"Price is observable."},{"type":"paragraph","text":"You can open a stock exchange and see it."},{"type":"paragraph","text":"You can look at a property listing."},{"type":"paragraph","text":"You can ask someone what they paid."},{"type":"paragraph","text":"You can check the price of a commodity."},{"type":"paragraph","text":"Price is the number attached to an asset at a particular moment."},{"type":"paragraph","text":"But price doesn''t necessarily tell you what the asset is fundamentally worth."},{"type":"paragraph","text":"It tells you what someone is willing to exchange for it right now."},{"type":"paragraph","text":"That distinction becomes extremely important."},{"type":"heading","text":"Value is an economic judgment","level":2},{"type":"paragraph","text":"Value is more complicated."},{"type":"paragraph","text":"It asks:"},{"type":"paragraph","text":"What economic benefit can this asset reasonably produce?"},{"type":"paragraph","text":"For a company, that might mean future cash flows."},{"type":"paragraph","text":"For a rental property, it might mean future rental income."},{"type":"paragraph","text":"For farmland, it might mean agricultural output."},{"type":"paragraph","text":"For infrastructure, it might mean decades of operating revenue."},{"type":"paragraph","text":"For a piece of land, it might involve what can eventually be developed there."},{"type":"paragraph","text":"For a technology company, it could involve the future economics of a product that hasn''t reached its potential yet."},{"type":"paragraph","text":"Value therefore requires assumptions."},{"type":"paragraph","text":"Price requires a transaction."},{"type":"heading","text":"Imagine two identical businesses","level":2},{"type":"paragraph","text":"Company A and Company B are almost identical."},{"type":"paragraph","text":"Both generate:"},{"type":"paragraph","text":"$10 million in annual free cash flow."},{"type":"paragraph","text":"Both have similar growth."},{"type":"paragraph","text":"Both operate in the same industry."},{"type":"paragraph","text":"Both have similar risks."},{"type":"paragraph","text":"But Company A is valued by the market at:"},{"type":"paragraph","text":"$50 million."},{"type":"paragraph","text":"Company B is valued at:"},{"type":"paragraph","text":"$150 million."},{"type":"paragraph","text":"The underlying economics are similar."},{"type":"paragraph","text":"The prices aren''t."},{"type":"paragraph","text":"Which one is more attractive?"},{"type":"paragraph","text":"If everything else really is equal, the cheaper company deserves investigation."},{"type":"paragraph","text":"That doesn''t automatically mean it''s a bargain."},{"type":"paragraph","text":"Perhaps the market knows something you don''t."},{"type":"paragraph","text":"But you''ve identified the beginning of an investment question."},{"type":"heading","text":"Price contains expectations","level":2},{"type":"paragraph","text":"This is one of the most important concepts in markets."},{"type":"paragraph","text":"When you buy an asset, you aren''t only buying what exists today."},{"type":"paragraph","text":"You''re buying the market''s expectations about the future."},{"type":"paragraph","text":"Consider a company trading at an extremely high valuation."},{"type":"paragraph","text":"The market may be assuming:"},{"type":"paragraph","text":"rapid growth,"},{"type":"paragraph","text":"high future margins,"},{"type":"paragraph","text":"large market expansion,"},{"type":"paragraph","text":"strong competitive advantages,"},{"type":"paragraph","text":"and years of successful execution."},{"type":"paragraph","text":"The company doesn''t have to become bad for the investment to lose money."},{"type":"paragraph","text":"It only needs to disappoint those expectations."},{"type":"heading","text":"A great company can be a bad investment","level":2},{"type":"paragraph","text":"This sounds contradictory."},{"type":"paragraph","text":"It isn''t."},{"type":"paragraph","text":"Imagine an exceptional company."},{"type":"paragraph","text":"Its revenue is growing rapidly."},{"type":"paragraph","text":"Customers love its product."},{"type":"paragraph","text":"Its margins are excellent."},{"type":"paragraph","text":"Its competitive position is strong."},{"type":"paragraph","text":"Everyone agrees it is a great business."},{"type":"paragraph","text":"Then investors bid its valuation to an extraordinary level."},{"type":"paragraph","text":"At that price, the company may need to achieve near-perfect outcomes to justify the valuation."},{"type":"paragraph","text":"If growth slows from 40% to 25%, the company may still be excellent."},{"type":"paragraph","text":"But the stock can fall dramatically."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"Because the business remained good while the expectations became too high."},{"type":"heading","text":"A mediocre company can sometimes be an attractive investment","level":2},{"type":"paragraph","text":"The opposite can also happen."},{"type":"paragraph","text":"Imagine a struggling company."},{"type":"paragraph","text":"Growth is weak."},{"type":"paragraph","text":"Sentiment is terrible."},{"type":"paragraph","text":"Investors don''t like the industry."},{"type":"paragraph","text":"The stock price has collapsed."},{"type":"paragraph","text":"But the company still owns valuable assets, generates cash and has a realistic path to recovery."},{"type":"paragraph","text":"It may be worth investigating."},{"type":"paragraph","text":"The company doesn''t need to become extraordinary."},{"type":"paragraph","text":"It may only need to become less bad than the market expects."},{"type":"paragraph","text":"That is a very different investment thesis."},{"type":"heading","text":"The market is a prediction machine","level":2},{"type":"paragraph","text":"Every market price contains a prediction."},{"type":"paragraph","text":"If a company trades at a very high valuation, the market is effectively saying:"},{"type":"paragraph","text":"\"We expect significant future economic success.\""},{"type":"paragraph","text":"If an asset trades at a very low valuation, the market may be saying:"},{"type":"paragraph","text":"\"We expect poor future economics.\""},{"type":"paragraph","text":"Your job as an investor isn''t simply to ask:"},{"type":"paragraph","text":"\"Is this company good?\""},{"type":"paragraph","text":"It is to ask:"},{"type":"paragraph","text":"\"What does the current price assume?\""},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"\"Are those assumptions reasonable?\""},{"type":"paragraph","text":"And finally:"},{"type":"paragraph","text":"\"What happens if they''re wrong?\""},{"type":"heading","text":"This is why valuation is really about expectations","level":2},{"type":"paragraph","text":"Consider two companies."},{"type":"heading","text":"Company A","level":3},{"type":"paragraph","text":"Expected growth: 5%"},{"type":"paragraph","text":"Valuation: $100 million"},{"type":"heading","text":"Company B","level":3},{"type":"paragraph","text":"Expected growth: 30%"},{"type":"paragraph","text":"Valuation: $1 billion"},{"type":"paragraph","text":"Company B is growing much faster."},{"type":"paragraph","text":"But that doesn''t automatically make it the better investment."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"Because the price already reflects its growth."},{"type":"paragraph","text":"The important question is the relationship between:"},{"type":"paragraph","text":"future economics"},{"type":"paragraph","text":"and"},{"type":"paragraph","text":"current price."},{"type":"heading","text":"The price you pay matters","level":2},{"type":"paragraph","text":"Imagine you find an apartment that can generate $20,000 of annual rental income."},{"type":"paragraph","text":"You pay:"},{"type":"paragraph","text":"$100,000."},{"type":"paragraph","text":"That looks interesting."},{"type":"paragraph","text":"Now imagine someone else buys the same apartment for:"},{"type":"paragraph","text":"$500,000."},{"type":"paragraph","text":"The property hasn''t changed."},{"type":"paragraph","text":"The economics are the same."},{"type":"paragraph","text":"But the investment has."},{"type":"paragraph","text":"At $100,000, the income represents a much higher return on the purchase price."},{"type":"paragraph","text":"At $500,000, the return is much lower."},{"type":"paragraph","text":"This is why:"},{"type":"paragraph","text":"A good asset can become a bad investment at the wrong price."},{"type":"heading","text":"The reverse is also true","level":2},{"type":"paragraph","text":"A struggling asset can become attractive at a sufficiently low price."},{"type":"paragraph","text":"But there is a catch."},{"type":"paragraph","text":"Cheap doesn''t automatically mean undervalued."},{"type":"paragraph","text":"A company can trade cheaply because its future really is terrible."},{"type":"paragraph","text":"A property can be cheap because nobody wants to live there."},{"type":"paragraph","text":"A factory can be cheap because its machinery is obsolete."},{"type":"paragraph","text":"A stock can fall 80% and still be expensive relative to what the business will eventually be worth."},{"type":"paragraph","text":"This is why the phrase:"},{"type":"paragraph","text":"\"It has already fallen a lot.\""},{"type":"paragraph","text":"is not an investment thesis."},{"type":"heading","text":"Falling prices don''t create value by themselves","level":2},{"type":"paragraph","text":"Imagine an asset worth $10."},{"type":"paragraph","text":"Its price falls to $8."},{"type":"paragraph","text":"Then $6."},{"type":"paragraph","text":"Then $4."},{"type":"paragraph","text":"At first glance, it looks increasingly attractive."},{"type":"paragraph","text":"But imagine the underlying value is actually falling too."},{"type":"paragraph","text":"Maybe the business is losing customers."},{"type":"paragraph","text":"Maybe its costs are rising."},{"type":"paragraph","text":"Maybe its product is becoming obsolete."},{"type":"paragraph","text":"Maybe its debt is becoming unmanageable."},{"type":"paragraph","text":"The price can fall because the value is falling."},{"type":"paragraph","text":"That''s why investors need to distinguish between:"},{"type":"paragraph","text":"price decline"},{"type":"paragraph","text":"and"},{"type":"paragraph","text":"mispricing."},{"type":"heading","text":"What creates mispricing?","level":2},{"type":"paragraph","text":"Markets are remarkably good at processing information."},{"type":"paragraph","text":"But they''re not perfect."},{"type":"paragraph","text":"Mispricing can occur because of:"},{"type":"paragraph","text":"fear"},{"type":"paragraph","text":"greed"},{"type":"paragraph","text":"forced selling"},{"type":"paragraph","text":"liquidity constraints"},{"type":"paragraph","text":"short-term thinking"},{"type":"paragraph","text":"information gaps"},{"type":"paragraph","text":"complexity"},{"type":"paragraph","text":"regulatory changes"},{"type":"paragraph","text":"temporary problems"},{"type":"paragraph","text":"investor crowding"},{"type":"paragraph","text":"behavioral biases"},{"type":"paragraph","text":"Sometimes the market simply doesn''t have enough information."},{"type":"paragraph","text":"Sometimes everyone has the information but interprets it differently."},{"type":"paragraph","text":"And sometimes investors are focused on a completely different time horizon."},{"type":"heading","text":"Time horizon changes everything","level":2},{"type":"paragraph","text":"Imagine a company experiencing a temporary earnings decline."},{"type":"paragraph","text":"A trader thinking about the next three months may see a serious problem."},{"type":"paragraph","text":"A long-term investor thinking about the next decade may see an opportunity."},{"type":"paragraph","text":"Neither person is necessarily irrational."},{"type":"paragraph","text":"They''re answering different questions."},{"type":"paragraph","text":"The trader asks:"},{"type":"paragraph","text":"\"What happens next?\""},{"type":"paragraph","text":"The investor asks:"},{"type":"paragraph","text":"\"What will this business look like after the temporary problem is gone?\""},{"type":"paragraph","text":"This difference in time horizon creates enormous variation in market opinions."},{"type":"heading","text":"The market can be right in the short term","level":2},{"type":"paragraph","text":"There''s another important point."},{"type":"paragraph","text":"Just because you believe an asset is undervalued doesn''t mean the price will immediately rise."},{"type":"paragraph","text":"Markets can remain pessimistic for years."},{"type":"paragraph","text":"A thesis can be correct about fundamentals and still produce poor returns if:"},{"type":"paragraph","text":"the timing is wrong,"},{"type":"paragraph","text":"the financing changes,"},{"type":"paragraph","text":"the business deteriorates,"},{"type":"paragraph","text":"or the market never recognizes the expected value."},{"type":"paragraph","text":"This is why investing isn''t simply about being right."},{"type":"paragraph","text":"It''s about being right enough, at the right price, with enough time and capital to survive being early."},{"type":"heading","text":"Value can change","level":2},{"type":"paragraph","text":"Value isn''t permanently fixed."},{"type":"paragraph","text":"A business can become more valuable."},{"type":"paragraph","text":"Or less valuable."},{"type":"paragraph","text":"Consider an energy company."},{"type":"paragraph","text":"A new discovery could increase its reserves."},{"type":"paragraph","text":"A new regulation could reduce demand."},{"type":"paragraph","text":"A major infrastructure project could improve its economics."},{"type":"paragraph","text":"A competitor could make its technology obsolete."},{"type":"paragraph","text":"A currency collapse could change its cost structure."},{"type":"paragraph","text":"Value changes as the underlying economics change."},{"type":"paragraph","text":"So investors aren''t trying to calculate one eternal number."},{"type":"paragraph","text":"They''re continually updating their view."},{"type":"heading","text":"Optionality complicates valuation","level":2},{"type":"paragraph","text":"Sometimes an asset has possibilities that aren''t captured by current cash flow."},{"type":"paragraph","text":"Imagine owning land near a rapidly expanding city."},{"type":"paragraph","text":"Today it''s farmland."},{"type":"paragraph","text":"Tomorrow it could potentially become:"},{"type":"paragraph","text":"housing,"},{"type":"paragraph","text":"industrial property,"},{"type":"paragraph","text":"a logistics center,"},{"type":"paragraph","text":"a data center,"},{"type":"paragraph","text":"or commercial development."},{"type":"paragraph","text":"Those possibilities create optionality."},{"type":"paragraph","text":"The land''s current use doesn''t necessarily represent its maximum economic potential."},{"type":"paragraph","text":"But optionality should be treated carefully."},{"type":"paragraph","text":"A possibility isn''t the same thing as a probability."},{"type":"paragraph","text":"A field isn''t worth billions simply because someone could theoretically build a city there."},{"type":"paragraph","text":"The path to realization matters."},{"type":"heading","text":"Infrastructure makes this distinction particularly interesting","level":2},{"type":"paragraph","text":"Imagine a power project."},{"type":"paragraph","text":"Its current revenue is modest."},{"type":"paragraph","text":"But a new industrial zone is being built nearby."},{"type":"paragraph","text":"If the industrial zone succeeds, electricity demand could rise significantly."},{"type":"paragraph","text":"The project''s future economics might therefore change."},{"type":"paragraph","text":"An investor who understands the development before it becomes obvious may see value that isn''t yet reflected in the price."},{"type":"paragraph","text":"But again, the thesis needs evidence."},{"type":"paragraph","text":"The industrial zone needs financing."},{"type":"paragraph","text":"Construction needs to happen."},{"type":"paragraph","text":"Customers need to arrive."},{"type":"paragraph","text":"The grid needs to support them."},{"type":"paragraph","text":"This is why good investment analysis is about connecting events."},{"type":"heading","text":"Price discovery is a continuous process","level":2},{"type":"paragraph","text":"Markets constantly update."},{"type":"paragraph","text":"New information arrives."},{"type":"paragraph","text":"Investors revise expectations."},{"type":"paragraph","text":"Prices move."},{"type":"paragraph","text":"A company announces earnings."},{"type":"paragraph","text":"A government changes policy."},{"type":"paragraph","text":"Interest rates change."},{"type":"paragraph","text":"A new competitor enters."},{"type":"paragraph","text":"A technology breakthrough occurs."},{"type":"paragraph","text":"A war disrupts supply."},{"type":"paragraph","text":"A new infrastructure project is approved."},{"type":"paragraph","text":"Each event changes the information available to investors."},{"type":"paragraph","text":"The price is the market''s constantly changing estimate."},{"type":"heading","text":"The most interesting moments occur when reality and expectations diverge","level":2},{"type":"paragraph","text":"Imagine the market expects:"},{"type":"paragraph","text":"10% growth."},{"type":"paragraph","text":"The company delivers:"},{"type":"paragraph","text":"15%."},{"type":"paragraph","text":"The company didn''t suddenly become amazing."},{"type":"paragraph","text":"The market simply underestimated it."},{"type":"paragraph","text":"Now imagine the market expects:"},{"type":"paragraph","text":"40% growth."},{"type":"paragraph","text":"The company delivers:"},{"type":"paragraph","text":"30%."},{"type":"paragraph","text":"Thirty percent growth sounds fantastic."},{"type":"paragraph","text":"But the market may still punish the company."},{"type":"paragraph","text":"Because it wasn''t buying the company based on what happened."},{"type":"paragraph","text":"It was buying based on what it expected to happen."},{"type":"paragraph","text":"That''s the heart of market repricing."},{"type":"heading","text":"This is why \"good news\" can cause prices to fall","level":2},{"type":"paragraph","text":"It seems irrational."},{"type":"paragraph","text":"A company reports record revenue."},{"type":"paragraph","text":"The stock drops."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"Because investors expected even more."},{"type":"paragraph","text":"Markets trade on surprises relative to expectations, not simply absolute outcomes."},{"type":"paragraph","text":"This is why professional investors spend so much time thinking about consensus."},{"type":"paragraph","text":"What does everyone already believe?"},{"type":"paragraph","text":"What is already priced in?"},{"type":"paragraph","text":"What would have to happen for the market to change its mind?"},{"type":"heading","text":"The investment thesis lives in the gap","level":2},{"type":"paragraph","text":"This is where the difference between price and value becomes actionable."},{"type":"paragraph","text":"Suppose you believe:"},{"type":"paragraph","text":"Market expectation:\u000b Growth will slow to 5%."},{"type":"paragraph","text":"Your thesis:\u000b A new product could sustain 15% growth."},{"type":"paragraph","text":"That''s interesting."},{"type":"paragraph","text":"But you need evidence."},{"type":"paragraph","text":"What product?"},{"type":"paragraph","text":"Why will customers buy it?"},{"type":"paragraph","text":"How large is the market?"},{"type":"paragraph","text":"What are competitors doing?"},{"type":"paragraph","text":"How quickly can revenue appear?"},{"type":"paragraph","text":"What happens to margins?"},{"type":"paragraph","text":"What would prove you wrong?"},{"type":"paragraph","text":"Now you have an investment thesis rather than a feeling."},{"type":"heading","text":"Price is visible. Value requires work.","level":2},{"type":"paragraph","text":"This may be the simplest way to understand the distinction."},{"type":"paragraph","text":"Price is easy to find."},{"type":"paragraph","text":"Open the market."},{"type":"paragraph","text":"Look at the listing."},{"type":"paragraph","text":"Check the transaction."},{"type":"paragraph","text":"Value is harder."},{"type":"paragraph","text":"You have to understand:"},{"type":"paragraph","text":"the asset,"},{"type":"paragraph","text":"the economics,"},{"type":"paragraph","text":"the market,"},{"type":"paragraph","text":"the competition,"},{"type":"paragraph","text":"the future,"},{"type":"paragraph","text":"the risks,"},{"type":"paragraph","text":"the alternatives,"},{"type":"paragraph","text":"and the price you''re paying."},{"type":"paragraph","text":"That''s why investing requires analysis."},{"type":"paragraph","text":"If value were simply equal to price, there would be nothing to analyze."},{"type":"heading","text":"The dangerous phrase: \"Everyone knows\"","level":2},{"type":"paragraph","text":"Whenever an investment becomes extremely popular, ask:"},{"type":"paragraph","text":"How much of the good news is already reflected in the price?"},{"type":"paragraph","text":"A great company can be widely known."},{"type":"paragraph","text":"A great industry can be widely understood."},{"type":"paragraph","text":"A major trend can be obvious."},{"type":"paragraph","text":"The opportunity doesn''t necessarily disappear."},{"type":"paragraph","text":"But the expected return may shrink because everyone has already bid up the asset."},{"type":"paragraph","text":"Markets don''t reward investors simply for discovering that something is good."},{"type":"paragraph","text":"They reward investors when their assessment of future economics differs meaningfully from the price."},{"type":"heading","text":"The deeper lesson","level":2},{"type":"paragraph","text":"Investing isn''t a beauty contest."},{"type":"paragraph","text":"It isn''t:"},{"type":"paragraph","text":"\"Which company do I like?\""},{"type":"paragraph","text":"It isn''t:"},{"type":"paragraph","text":"\"Which industry sounds exciting?\""},{"type":"paragraph","text":"It isn''t even:"},{"type":"paragraph","text":"\"Which asset is objectively the best?\""},{"type":"paragraph","text":"The more useful question is:"},{"type":"paragraph","text":"What am I paying, what am I getting, and what does the price assume about the future?"},{"type":"paragraph","text":"Sometimes the best business in the world is a terrible investment at an absurd valuation."},{"type":"paragraph","text":"Sometimes an unpopular asset becomes extremely attractive because the market has priced in a disaster that never arrives."},{"type":"paragraph","text":"Sometimes the market is simply right."},{"type":"paragraph","text":"The job is to figure out which situation you''re looking at."},{"type":"heading","text":"Price tells you where the market is.","level":2},{"type":"paragraph","text":"Value asks where the economics are going."},{"type":"paragraph","text":"The gap between those two is where investing gets interesting."},{"type":"paragraph","text":"And once you understand that distinction, another question naturally follows:"},{"type":"paragraph","text":"If an investor can estimate an asset''s value, what actually makes them willing to put capital behind it?"},{"type":"paragraph","text":"Because eventually every investment thesis has to answer one brutally simple question:"},{"type":"paragraph","text":"Where does the money come from?"},{"type":"paragraph","text":"Next on Omniv: Why Investors Care About Cash Flow."}]'::jsonb, 'MONEY', 10, 'published', 'The Difference Between Price and Value | Omniv Editorial', 'A house is listed for $500,000. Someone offers $450,000. Another person offers $520,000.', 'https://omniv.media/p/the-difference-between-price-and-value', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"biology","label":"Biology"}]'::jsonb, '{}'::text[], '{money,global-supply-chains,artificial-intelligence,data-centres,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'why-investors-care-about-cash-flow', 'Why Investors Care About Cash Flow', 'A company can report a profit and still run out of money. A business can grow rapidly and become less valuable. A company can have billions in revenue and still struggle to pay its bills.', 'A company can report a profit and still run out of money.

A business can grow rapidly and become less valuable.

A company can have billions in revenue and still struggle to pay its bills.

And a company with relatively modest revenue can sometimes become extraordinarily valuable if it consistently converts that revenue into cash.

This is why investors care so much about cash flow.

Because eventually, every business has to answer the same question:

How much actual cash does this economic machine produce, and what can that cash become?

Start with a simple distinction.

Imagine a company sells $10 million worth of products this year.

You might immediately think:

"It made $10 million."

Not necessarily.

Perhaps customers haven''t paid yet.

Perhaps the company had to spend $7 million manufacturing the products.

Perhaps it spent $2 million acquiring customers.

Perhaps it bought new equipment.

Perhaps it has employees to pay.

Perhaps inventory increased dramatically.

Perhaps customers returned some of the products.

The $10 million figure tells you something.

But it doesn''t tell you how much money actually ended up available to the business.

That''s why sophisticated investors look deeper.

Accounting profit is extremely useful.

But accounting rules allow businesses to recognize economic activity that doesn''t necessarily correspond to immediate cash movement.

For example, a company might recognize revenue when a product is delivered even though the customer hasn''t paid yet.

It may record depreciation on equipment even though depreciation isn''t a current cash expense.

It may capitalize certain costs.

It may have working-capital movements that significantly change the amount of cash available.

So investors often ask:

"Show me the cash."

A business needs cash to:

pay employees,

buy inventory,

pay suppliers,

service debt,

build factories,

maintain equipment,

develop products,

acquire customers,

pay taxes,

and invest in growth.

Without sufficient cash, even a theoretically profitable business can become vulnerable.

This is why cash flow isn''t simply an accounting concept.

It''s a survival concept.

Both generate:

$20 million in annual revenue.

Company A produces:

$6 million in operating cash flow.

Company B produces:

-$2 million in operating cash flow.

They have the same revenue.

But economically, they are very different businesses.

Company A is generating cash internally.

Company B may need outside financing to continue operating.

That difference becomes especially important when capital becomes expensive.

Imagine borrowing money at 2%.

A company that needs external financing may find it relatively manageable.

Now imagine borrowing costs rise significantly.

Suddenly, companies that constantly need new capital face a much harder environment.

The businesses that generate their own cash have an advantage.

They don''t need to ask investors or banks for money every time they want to survive another year.

They can fund themselves.

That''s powerful.

Imagine a company generating:

$50 million of free cash flow annually.

Management can potentially use that cash to:

expand,

buy competitors,

repay debt,

develop new products,

buy back shares,

pay dividends,

or build reserves.

The company has choices.

And choice is valuable.

A company constantly burning cash has fewer choices.

It needs financing.

A financing environment can change.

Investors can become nervous.

Banks can tighten lending.

Interest rates can rise.

A company that once looked unstoppable can suddenly find itself vulnerable.

One of the most useful concepts in investing is free cash flow.

The basic idea is:

Cash generated by the business after the spending required to maintain and operate the asset base.

It isn''t a perfect measure of economic reality.

But it helps investors think about something important:

How much cash can the business generate that isn''t immediately required just to keep the existing machine functioning?

That cash is what creates flexibility.

Suppose a factory generates:

$10 million

in operating cash flow.

But the factory requires:

$7 million

every year just to maintain its equipment.

The remaining economics are very different from a business generating $10 million that only needs $1 million of ongoing capital expenditure.

The first business is capital intensive.

The second has much more cash available.

This is why investors need to distinguish between:

cash generation

and

cash generation after necessary reinvestment.

This is where things get interesting.

People often assume:

"If a company is growing quickly, it must be creating value."

Not necessarily.

Imagine a company grows revenue from:

$10 million → $20 million → $40 million.

Sounds incredible.

But to achieve that growth, perhaps it needs:

huge marketing spending,

new factories,

more inventory,

larger warehouses,

more employees,

long customer payment periods.

The company might be growing while consuming enormous amounts of cash.

Growth isn''t automatically bad.

But investors need to know:

How much capital does growth require?

Now imagine another company.

It grows from:

$10 million → $15 million → $22 million.

Slower growth.

But it generates substantial cash while doing it.

Customers pay quickly.

The company doesn''t need much inventory.

It doesn''t require huge factories.

It has strong margins.

Its existing infrastructure can support more customers.

That company may be economically superior even though its growth rate is lower.

This is why investors look beyond headline growth.

One of the most important questions in investing is:

What does it cost to grow?

Imagine two companies each add $10 million of annual revenue.

Company A requires $2 million of additional capital.

Company B requires $30 million.

Both grew by $10 million.

But their economics are radically different.

Company A can potentially compound rapidly without constantly raising external capital.

Company B may need financing every time it expands.

The difference is enormous.

Some industries naturally require large amounts of capital.

Infrastructure.

Mining.

Energy.

Manufacturing.

Telecommunications.

Airlines.

Shipping.

Others can scale with relatively little incremental capital.

Certain software businesses.

Digital media.

Some marketplaces.

Some financial businesses.

Neither category is automatically superior.

But the capital requirements fundamentally change how investors evaluate them.

Consider an electricity project.

You might need to spend hundreds of millions before the first meaningful revenue arrives.

That''s a huge disadvantage if you''re evaluating the project on short-term cash flow.

But if the project can operate for decades and generate relatively predictable cash flows, the initial investment may make sense.

This is why investors need to think about cash flow across time, not simply cash flow this year.

Receiving $10 million today is different from receiving $10 million ten years from now.

Capital available today can be reinvested.

It can earn returns.

It can fund another project.

It can reduce debt.

It can survive a downturn.

Future cash is therefore worth less than immediate cash, all else equal.

This concept is fundamental to valuation.

Imagine a company as a machine.

You put capital into it.

Customers put money into the business.

The business pays its expenses.

What remains can be reinvested or distributed.

The quality of the investment depends partly on how efficiently the machine converts:

capital → revenue → profit → cash.

The stronger that conversion, the more attractive the economics can become.

Imagine two companies.

Company A makes $20 million once.

Company B makes $10 million every year for ten years.

The second company may be far more valuable.

Why?

Because recurring cash flow creates visibility.

Investors can begin forecasting.

Management can plan.

Debt can be serviced.

Reinvestment becomes possible.

Shareholders can potentially receive distributions.

This is why subscription businesses, utilities, infrastructure operators and other businesses with recurring revenue models can be attractive.

But again, recurring revenue is not automatically high quality.

The customer must actually remain.

A company can advertise:

"90% recurring revenue."

Sounds impressive.

But ask:

How long do customers stay?

How much does it cost to retain them?

Can they cancel easily?

Are prices increasing?

Are customers actually using the product?

Is the product becoming less important?

A recurring revenue stream is only valuable if it is durable and economically attractive.

Suppose a company produces $100 million of free cash flow.

Management has choices.

It can:

build another facility,

enter a new market,

acquire a competitor,

reduce debt,

buy back shares,

pay dividends,

or simply hold cash.

That optionality can become extremely valuable during periods of uncertainty.

Imagine a recession arrives.

A cash-rich company can potentially acquire weaker competitors.

A heavily indebted company may be forced to cut back.

Cash can turn a crisis into an opportunity.

This is something investors sometimes underestimate.

A company with strong cash generation can survive situations that destroy competitors.

Suppose three competitors operate in the same industry.

Then demand collapses.

Company A has:

high debt.

Company B has:

little cash.

Company C has:

strong recurring free cash flow and a healthy balance sheet.

Company C can continue investing while the others retreat.

It may emerge from the downturn with:

more market share,

cheaper acquisitions,

better talent,

and stronger competitive positioning.

Cash isn''t just safety.

It can create strategic power.

Here''s another subtle point.

A company can hold billions in cash and still be a poor investment.

Why?

Because you need to ask:

Where did the cash come from?

How much debt does the company have?

Can the cash actually be accessed?

Will management waste it?

Is the business losing money faster than the cash accumulates?

Is the cash needed for future obligations?

A large cash balance is useful.

But context matters.

Suppose a company has:

$500 million in cash.

Sounds fantastic.

But it also has:

$2 billion in debt.

The net financial position looks very different.

Now consider a company with:

$100 million in cash.

and:

$20 million in debt.

The second company may actually be financially stronger.

This is why investors don''t look at individual numbers in isolation.

They examine the whole balance sheet.

Debt can accelerate growth.

But debt also creates fixed obligations.

Imagine a company generates $100 million in annual cash flow.

Its debt payments are:

$20 million.

That may be manageable.

Now imagine the business deteriorates and cash flow falls to:

$30 million.

The debt payment hasn''t necessarily fallen with it.

Suddenly, financial pressure increases.

A business with strong cash flow but excessive leverage can still become fragile.

Not all cash is equal.

Imagine a company generates cash because it:

collects receivables faster,

reduces inventory,

delays payments to suppliers,

or sells assets.

That can temporarily improve cash flow.

But it may not represent sustainable operating economics.

Investors therefore ask:

Where did the cash come from?

Was it generated by the core business?

Or was it created by temporary balance-sheet movements?

One useful concept is cash conversion.

Imagine a company reports:

$100 million of accounting profit.

But only produces:

$40 million of free cash flow.

Another company reports:

$80 million of profit.

But produces:

$75 million of free cash flow.

The second company may have better cash economics despite lower reported profit.

Over time, strong cash conversion can become a major competitive advantage.

Imagine you own an asset that produces:

$10 million

$11 million

$10.5 million

$11.5 million

$12 million

over five years.

Now compare that with:

$3 million

$18 million

-$5 million

$25 million

$1 million.

The second could theoretically produce more.

But the first is much easier to plan around.

Predictability reduces uncertainty.

And lower uncertainty can make financing easier.

It can also support higher valuations, depending on the circumstances.

During good times, almost everyone can raise money.

Investors are optimistic.

Banks lend.

Valuations rise.

Capital is abundant.

Then the environment changes.

Funding dries up.

Investors become selective.

Banks tighten standards.

Companies that depend on external capital suddenly discover that their business model was partly dependent on the willingness of strangers to keep funding them.

Cash-generative companies have a different advantage:

they can keep moving without asking permission.

A strong economy can hide weak economics.

When money is cheap, companies can survive despite:

poor margins,

high spending,

weak cash conversion,

and excessive borrowing.

A downturn removes that cushion.

Suddenly the market asks:

"Can this company actually fund itself?"

That question can reveal which businesses are genuinely strong.

Now consider a company that consistently generates free cash flow.

Suppose it produces:

$10 million

Then $12 million.

Then $15 million.

Then $19 million.

Then $24 million.

If management can reinvest that cash at attractive returns, the business can compound.

The company doesn''t need to repeatedly raise external capital.

Its own economics fund its expansion.

This creates one of the most powerful mechanisms in business:

Cash flow funding future cash flow.

Imagine a company earns a high return on capital.

It generates cash.

It reinvests that cash.

The reinvestment produces additional earnings.

Those earnings generate additional cash.

That cash gets reinvested again.

Over many years, the numbers can become enormous.

This is why long-term investors often search for businesses with:

high returns on capital,

strong cash generation,

reinvestment opportunities,

and durable competitive advantages.

This is another important distinction.

Suppose a mature company generates huge amounts of cash.

But there are no attractive expansion opportunities.

What should it do?

It might:

pay dividends,

repurchase shares,

reduce debt,

or acquire other businesses.

The point is that cash gives management choices.

But the quality of those choices determines whether shareholders benefit.

A company can destroy billions of dollars by making bad acquisitions.

Once a company generates cash, another question appears:

What should management do with it?

This is called capital allocation.

Should the company:

reinvest?

acquire?

pay shareholders?

reduce debt?

build reserves?

The answer depends on expected returns.

If the company can reinvest $1 and eventually create $3 of economic value, reinvesting may make sense.

If it can only turn $1 into $1.05, distributing the money may be better.

This is why capital allocation can be as important as the underlying business.

Revenue tells you how much economic activity is passing through a business.

Profit tells you something about accounting economics.

But cash flow tells you something much more fundamental:

How much financial fuel is the business actually producing?

And once you understand that, you can ask better questions.

How durable is the cash flow?

How much capital is required to maintain it?

How much does growth consume?

How predictable is it?

Who controls the cash?

How is it being reinvested?

What return is being earned on that reinvestment?

How much debt sits against it?

What happens if the economy weakens?

These questions turn financial statements into an economic story.

Think about an asset this way:

Customers create revenue.

↓

The business pays its costs.

↓

Cash remains.

↓

That cash can be reinvested.

↓

Reinvestment can create more productive assets.

↓

Those assets generate more cash.

↓

The cycle compounds.

That is the machine investors are ultimately trying to understand.

Not the logo.

Not the hype.

Not the headline revenue.

The machine.

And once you start looking at investments through cash flow, another question becomes unavoidable:

If investors have capital to deploy, what makes them choose one market over another?

Why Nigeria instead of Kenya?

Why energy instead of software?

Why infrastructure instead of consumer businesses?

Why one industry today and another five years from now?

That takes us to the next layer:', 'Analysis from the Omniv Editorial desk.', 'A company can report a profit and still run out of money. A business can grow rapidly and become less valuable. A company can have billions in revenue and still struggle to pay its bills.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"A company can report a profit and still run out of money."},{"type":"paragraph","text":"A business can grow rapidly and become less valuable."},{"type":"paragraph","text":"A company can have billions in revenue and still struggle to pay its bills."},{"type":"paragraph","text":"And a company with relatively modest revenue can sometimes become extraordinarily valuable if it consistently converts that revenue into cash."},{"type":"paragraph","text":"This is why investors care so much about cash flow."},{"type":"paragraph","text":"Because eventually, every business has to answer the same question:"},{"type":"paragraph","text":"How much actual cash does this economic machine produce, and what can that cash become?"},{"type":"heading","text":"Revenue is not cash","level":2},{"type":"paragraph","text":"Start with a simple distinction."},{"type":"paragraph","text":"Imagine a company sells $10 million worth of products this year."},{"type":"paragraph","text":"You might immediately think:"},{"type":"paragraph","text":"\"It made $10 million.\""},{"type":"paragraph","text":"Not necessarily."},{"type":"paragraph","text":"Perhaps customers haven''t paid yet."},{"type":"paragraph","text":"Perhaps the company had to spend $7 million manufacturing the products."},{"type":"paragraph","text":"Perhaps it spent $2 million acquiring customers."},{"type":"paragraph","text":"Perhaps it bought new equipment."},{"type":"paragraph","text":"Perhaps it has employees to pay."},{"type":"paragraph","text":"Perhaps inventory increased dramatically."},{"type":"paragraph","text":"Perhaps customers returned some of the products."},{"type":"paragraph","text":"The $10 million figure tells you something."},{"type":"paragraph","text":"But it doesn''t tell you how much money actually ended up available to the business."},{"type":"paragraph","text":"That''s why sophisticated investors look deeper."},{"type":"heading","text":"Profit isn''t the same thing either","level":2},{"type":"paragraph","text":"Accounting profit is extremely useful."},{"type":"paragraph","text":"But accounting rules allow businesses to recognize economic activity that doesn''t necessarily correspond to immediate cash movement."},{"type":"paragraph","text":"For example, a company might recognize revenue when a product is delivered even though the customer hasn''t paid yet."},{"type":"paragraph","text":"It may record depreciation on equipment even though depreciation isn''t a current cash expense."},{"type":"paragraph","text":"It may capitalize certain costs."},{"type":"paragraph","text":"It may have working-capital movements that significantly change the amount of cash available."},{"type":"paragraph","text":"So investors often ask:"},{"type":"paragraph","text":"\"Show me the cash.\""},{"type":"heading","text":"Cash is what keeps the machine alive","level":2},{"type":"paragraph","text":"A business needs cash to:"},{"type":"paragraph","text":"pay employees,"},{"type":"paragraph","text":"buy inventory,"},{"type":"paragraph","text":"pay suppliers,"},{"type":"paragraph","text":"service debt,"},{"type":"paragraph","text":"build factories,"},{"type":"paragraph","text":"maintain equipment,"},{"type":"paragraph","text":"develop products,"},{"type":"paragraph","text":"acquire customers,"},{"type":"paragraph","text":"pay taxes,"},{"type":"paragraph","text":"and invest in growth."},{"type":"paragraph","text":"Without sufficient cash, even a theoretically profitable business can become vulnerable."},{"type":"paragraph","text":"This is why cash flow isn''t simply an accounting concept."},{"type":"paragraph","text":"It''s a survival concept."},{"type":"heading","text":"Imagine two companies","level":2},{"type":"paragraph","text":"Both generate:"},{"type":"paragraph","text":"$20 million in annual revenue."},{"type":"paragraph","text":"Company A produces:"},{"type":"paragraph","text":"$6 million in operating cash flow."},{"type":"paragraph","text":"Company B produces:"},{"type":"paragraph","text":"-$2 million in operating cash flow."},{"type":"paragraph","text":"They have the same revenue."},{"type":"paragraph","text":"But economically, they are very different businesses."},{"type":"paragraph","text":"Company A is generating cash internally."},{"type":"paragraph","text":"Company B may need outside financing to continue operating."},{"type":"paragraph","text":"That difference becomes especially important when capital becomes expensive."},{"type":"heading","text":"Cash flow becomes more valuable when money gets expensive","level":2},{"type":"paragraph","text":"Imagine borrowing money at 2%."},{"type":"paragraph","text":"A company that needs external financing may find it relatively manageable."},{"type":"paragraph","text":"Now imagine borrowing costs rise significantly."},{"type":"paragraph","text":"Suddenly, companies that constantly need new capital face a much harder environment."},{"type":"paragraph","text":"The businesses that generate their own cash have an advantage."},{"type":"paragraph","text":"They don''t need to ask investors or banks for money every time they want to survive another year."},{"type":"paragraph","text":"They can fund themselves."},{"type":"paragraph","text":"That''s powerful."},{"type":"heading","text":"Self-funding changes the game","level":2},{"type":"paragraph","text":"Imagine a company generating:"},{"type":"paragraph","text":"$50 million of free cash flow annually."},{"type":"paragraph","text":"Management can potentially use that cash to:"},{"type":"paragraph","text":"expand,"},{"type":"paragraph","text":"buy competitors,"},{"type":"paragraph","text":"repay debt,"},{"type":"paragraph","text":"develop new products,"},{"type":"paragraph","text":"buy back shares,"},{"type":"paragraph","text":"pay dividends,"},{"type":"paragraph","text":"or build reserves."},{"type":"paragraph","text":"The company has choices."},{"type":"paragraph","text":"And choice is valuable."},{"type":"paragraph","text":"A company constantly burning cash has fewer choices."},{"type":"paragraph","text":"It needs financing."},{"type":"paragraph","text":"A financing environment can change."},{"type":"paragraph","text":"Investors can become nervous."},{"type":"paragraph","text":"Banks can tighten lending."},{"type":"paragraph","text":"Interest rates can rise."},{"type":"paragraph","text":"A company that once looked unstoppable can suddenly find itself vulnerable."},{"type":"heading","text":"This is why free cash flow matters","level":2},{"type":"paragraph","text":"One of the most useful concepts in investing is free cash flow."},{"type":"paragraph","text":"The basic idea is:"},{"type":"paragraph","text":"Cash generated by the business after the spending required to maintain and operate the asset base."},{"type":"paragraph","text":"It isn''t a perfect measure of economic reality."},{"type":"paragraph","text":"But it helps investors think about something important:"},{"type":"paragraph","text":"How much cash can the business generate that isn''t immediately required just to keep the existing machine functioning?"},{"type":"paragraph","text":"That cash is what creates flexibility."},{"type":"heading","text":"Consider a factory","level":2},{"type":"paragraph","text":"Suppose a factory generates:"},{"type":"paragraph","text":"$10 million"},{"type":"paragraph","text":"in operating cash flow."},{"type":"paragraph","text":"But the factory requires:"},{"type":"paragraph","text":"$7 million"},{"type":"paragraph","text":"every year just to maintain its equipment."},{"type":"paragraph","text":"The remaining economics are very different from a business generating $10 million that only needs $1 million of ongoing capital expenditure."},{"type":"paragraph","text":"The first business is capital intensive."},{"type":"paragraph","text":"The second has much more cash available."},{"type":"paragraph","text":"This is why investors need to distinguish between:"},{"type":"paragraph","text":"cash generation"},{"type":"paragraph","text":"and"},{"type":"paragraph","text":"cash generation after necessary reinvestment."},{"type":"heading","text":"Growth can consume cash","level":2},{"type":"paragraph","text":"This is where things get interesting."},{"type":"paragraph","text":"People often assume:"},{"type":"paragraph","text":"\"If a company is growing quickly, it must be creating value.\""},{"type":"paragraph","text":"Not necessarily."},{"type":"paragraph","text":"Imagine a company grows revenue from:"},{"type":"paragraph","text":"$10 million → $20 million → $40 million."},{"type":"paragraph","text":"Sounds incredible."},{"type":"paragraph","text":"But to achieve that growth, perhaps it needs:"},{"type":"paragraph","text":"huge marketing spending,"},{"type":"paragraph","text":"new factories,"},{"type":"paragraph","text":"more inventory,"},{"type":"paragraph","text":"larger warehouses,"},{"type":"paragraph","text":"more employees,"},{"type":"paragraph","text":"long customer payment periods."},{"type":"paragraph","text":"The company might be growing while consuming enormous amounts of cash."},{"type":"paragraph","text":"Growth isn''t automatically bad."},{"type":"paragraph","text":"But investors need to know:"},{"type":"paragraph","text":"How much capital does growth require?"},{"type":"heading","text":"Some businesses have extraordinary economics","level":2},{"type":"paragraph","text":"Now imagine another company."},{"type":"paragraph","text":"It grows from:"},{"type":"paragraph","text":"$10 million → $15 million → $22 million."},{"type":"paragraph","text":"Slower growth."},{"type":"paragraph","text":"But it generates substantial cash while doing it."},{"type":"paragraph","text":"Customers pay quickly."},{"type":"paragraph","text":"The company doesn''t need much inventory."},{"type":"paragraph","text":"It doesn''t require huge factories."},{"type":"paragraph","text":"It has strong margins."},{"type":"paragraph","text":"Its existing infrastructure can support more customers."},{"type":"paragraph","text":"That company may be economically superior even though its growth rate is lower."},{"type":"paragraph","text":"This is why investors look beyond headline growth."},{"type":"heading","text":"Growth has a price","level":2},{"type":"paragraph","text":"One of the most important questions in investing is:"},{"type":"paragraph","text":"What does it cost to grow?"},{"type":"paragraph","text":"Imagine two companies each add $10 million of annual revenue."},{"type":"paragraph","text":"Company A requires $2 million of additional capital."},{"type":"paragraph","text":"Company B requires $30 million."},{"type":"paragraph","text":"Both grew by $10 million."},{"type":"paragraph","text":"But their economics are radically different."},{"type":"paragraph","text":"Company A can potentially compound rapidly without constantly raising external capital."},{"type":"paragraph","text":"Company B may need financing every time it expands."},{"type":"paragraph","text":"The difference is enormous."},{"type":"heading","text":"Capital intensity matters","level":2},{"type":"paragraph","text":"Some industries naturally require large amounts of capital."},{"type":"paragraph","text":"Infrastructure."},{"type":"paragraph","text":"Mining."},{"type":"paragraph","text":"Energy."},{"type":"paragraph","text":"Manufacturing."},{"type":"paragraph","text":"Telecommunications."},{"type":"paragraph","text":"Airlines."},{"type":"paragraph","text":"Shipping."},{"type":"paragraph","text":"Others can scale with relatively little incremental capital."},{"type":"paragraph","text":"Certain software businesses."},{"type":"paragraph","text":"Digital media."},{"type":"paragraph","text":"Some marketplaces."},{"type":"paragraph","text":"Some financial businesses."},{"type":"paragraph","text":"Neither category is automatically superior."},{"type":"paragraph","text":"But the capital requirements fundamentally change how investors evaluate them."},{"type":"heading","text":"Infrastructure is a great example","level":2},{"type":"paragraph","text":"Consider an electricity project."},{"type":"paragraph","text":"You might need to spend hundreds of millions before the first meaningful revenue arrives."},{"type":"paragraph","text":"That''s a huge disadvantage if you''re evaluating the project on short-term cash flow."},{"type":"paragraph","text":"But if the project can operate for decades and generate relatively predictable cash flows, the initial investment may make sense."},{"type":"paragraph","text":"This is why investors need to think about cash flow across time, not simply cash flow this year."},{"type":"heading","text":"Timing matters","level":2},{"type":"paragraph","text":"Receiving $10 million today is different from receiving $10 million ten years from now."},{"type":"paragraph","text":"Capital available today can be reinvested."},{"type":"paragraph","text":"It can earn returns."},{"type":"paragraph","text":"It can fund another project."},{"type":"paragraph","text":"It can reduce debt."},{"type":"paragraph","text":"It can survive a downturn."},{"type":"paragraph","text":"Future cash is therefore worth less than immediate cash, all else equal."},{"type":"paragraph","text":"This concept is fundamental to valuation."},{"type":"heading","text":"The cash-flow machine","level":2},{"type":"paragraph","text":"Imagine a company as a machine."},{"type":"paragraph","text":"You put capital into it."},{"type":"paragraph","text":"Customers put money into the business."},{"type":"paragraph","text":"The business pays its expenses."},{"type":"paragraph","text":"What remains can be reinvested or distributed."},{"type":"paragraph","text":"The quality of the investment depends partly on how efficiently the machine converts:"},{"type":"paragraph","text":"capital → revenue → profit → cash."},{"type":"paragraph","text":"The stronger that conversion, the more attractive the economics can become."},{"type":"heading","text":"Recurring cash flow is particularly valuable","level":2},{"type":"paragraph","text":"Imagine two companies."},{"type":"paragraph","text":"Company A makes $20 million once."},{"type":"paragraph","text":"Company B makes $10 million every year for ten years."},{"type":"paragraph","text":"The second company may be far more valuable."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"Because recurring cash flow creates visibility."},{"type":"paragraph","text":"Investors can begin forecasting."},{"type":"paragraph","text":"Management can plan."},{"type":"paragraph","text":"Debt can be serviced."},{"type":"paragraph","text":"Reinvestment becomes possible."},{"type":"paragraph","text":"Shareholders can potentially receive distributions."},{"type":"paragraph","text":"This is why subscription businesses, utilities, infrastructure operators and other businesses with recurring revenue models can be attractive."},{"type":"paragraph","text":"But again, recurring revenue is not automatically high quality."},{"type":"paragraph","text":"The customer must actually remain."},{"type":"heading","text":"Recurring revenue can disappear","level":2},{"type":"paragraph","text":"A company can advertise:"},{"type":"paragraph","text":"\"90% recurring revenue.\""},{"type":"paragraph","text":"Sounds impressive."},{"type":"paragraph","text":"But ask:"},{"type":"paragraph","text":"How long do customers stay?"},{"type":"paragraph","text":"How much does it cost to retain them?"},{"type":"paragraph","text":"Can they cancel easily?"},{"type":"paragraph","text":"Are prices increasing?"},{"type":"paragraph","text":"Are customers actually using the product?"},{"type":"paragraph","text":"Is the product becoming less important?"},{"type":"paragraph","text":"A recurring revenue stream is only valuable if it is durable and economically attractive."},{"type":"heading","text":"Cash flow gives investors optionality","level":2},{"type":"paragraph","text":"Suppose a company produces $100 million of free cash flow."},{"type":"paragraph","text":"Management has choices."},{"type":"paragraph","text":"It can:"},{"type":"paragraph","text":"build another facility,"},{"type":"paragraph","text":"enter a new market,"},{"type":"paragraph","text":"acquire a competitor,"},{"type":"paragraph","text":"reduce debt,"},{"type":"paragraph","text":"buy back shares,"},{"type":"paragraph","text":"pay dividends,"},{"type":"paragraph","text":"or simply hold cash."},{"type":"paragraph","text":"That optionality can become extremely valuable during periods of uncertainty."},{"type":"paragraph","text":"Imagine a recession arrives."},{"type":"paragraph","text":"A cash-rich company can potentially acquire weaker competitors."},{"type":"paragraph","text":"A heavily indebted company may be forced to cut back."},{"type":"paragraph","text":"Cash can turn a crisis into an opportunity."},{"type":"heading","text":"Cash can become a competitive weapon","level":2},{"type":"paragraph","text":"This is something investors sometimes underestimate."},{"type":"paragraph","text":"A company with strong cash generation can survive situations that destroy competitors."},{"type":"paragraph","text":"Suppose three competitors operate in the same industry."},{"type":"paragraph","text":"Then demand collapses."},{"type":"paragraph","text":"Company A has:"},{"type":"paragraph","text":"high debt."},{"type":"paragraph","text":"Company B has:"},{"type":"paragraph","text":"little cash."},{"type":"paragraph","text":"Company C has:"},{"type":"paragraph","text":"strong recurring free cash flow and a healthy balance sheet."},{"type":"paragraph","text":"Company C can continue investing while the others retreat."},{"type":"paragraph","text":"It may emerge from the downturn with:"},{"type":"paragraph","text":"more market share,"},{"type":"paragraph","text":"cheaper acquisitions,"},{"type":"paragraph","text":"better talent,"},{"type":"paragraph","text":"and stronger competitive positioning."},{"type":"paragraph","text":"Cash isn''t just safety."},{"type":"paragraph","text":"It can create strategic power."},{"type":"heading","text":"But cash on the balance sheet isn''t automatically valuable","level":2},{"type":"paragraph","text":"Here''s another subtle point."},{"type":"paragraph","text":"A company can hold billions in cash and still be a poor investment."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"Because you need to ask:"},{"type":"paragraph","text":"Where did the cash come from?"},{"type":"paragraph","text":"How much debt does the company have?"},{"type":"paragraph","text":"Can the cash actually be accessed?"},{"type":"paragraph","text":"Will management waste it?"},{"type":"paragraph","text":"Is the business losing money faster than the cash accumulates?"},{"type":"paragraph","text":"Is the cash needed for future obligations?"},{"type":"paragraph","text":"A large cash balance is useful."},{"type":"paragraph","text":"But context matters."},{"type":"heading","text":"Debt changes the picture","level":2},{"type":"paragraph","text":"Suppose a company has:"},{"type":"paragraph","text":"$500 million in cash."},{"type":"paragraph","text":"Sounds fantastic."},{"type":"paragraph","text":"But it also has:"},{"type":"paragraph","text":"$2 billion in debt."},{"type":"paragraph","text":"The net financial position looks very different."},{"type":"paragraph","text":"Now consider a company with:"},{"type":"paragraph","text":"$100 million in cash."},{"type":"paragraph","text":"and:"},{"type":"paragraph","text":"$20 million in debt."},{"type":"paragraph","text":"The second company may actually be financially stronger."},{"type":"paragraph","text":"This is why investors don''t look at individual numbers in isolation."},{"type":"paragraph","text":"They examine the whole balance sheet."},{"type":"heading","text":"Cash flow and debt interact","level":2},{"type":"paragraph","text":"Debt can accelerate growth."},{"type":"paragraph","text":"But debt also creates fixed obligations."},{"type":"paragraph","text":"Imagine a company generates $100 million in annual cash flow."},{"type":"paragraph","text":"Its debt payments are:"},{"type":"paragraph","text":"$20 million."},{"type":"paragraph","text":"That may be manageable."},{"type":"paragraph","text":"Now imagine the business deteriorates and cash flow falls to:"},{"type":"paragraph","text":"$30 million."},{"type":"paragraph","text":"The debt payment hasn''t necessarily fallen with it."},{"type":"paragraph","text":"Suddenly, financial pressure increases."},{"type":"paragraph","text":"A business with strong cash flow but excessive leverage can still become fragile."},{"type":"heading","text":"The quality of cash flow matters","level":2},{"type":"paragraph","text":"Not all cash is equal."},{"type":"paragraph","text":"Imagine a company generates cash because it:"},{"type":"paragraph","text":"collects receivables faster,"},{"type":"paragraph","text":"reduces inventory,"},{"type":"paragraph","text":"delays payments to suppliers,"},{"type":"paragraph","text":"or sells assets."},{"type":"paragraph","text":"That can temporarily improve cash flow."},{"type":"paragraph","text":"But it may not represent sustainable operating economics."},{"type":"paragraph","text":"Investors therefore ask:"},{"type":"paragraph","text":"Where did the cash come from?"},{"type":"paragraph","text":"Was it generated by the core business?"},{"type":"paragraph","text":"Or was it created by temporary balance-sheet movements?"},{"type":"heading","text":"Cash conversion","level":2},{"type":"paragraph","text":"One useful concept is cash conversion."},{"type":"paragraph","text":"Imagine a company reports:"},{"type":"paragraph","text":"$100 million of accounting profit."},{"type":"paragraph","text":"But only produces:"},{"type":"paragraph","text":"$40 million of free cash flow."},{"type":"paragraph","text":"Another company reports:"},{"type":"paragraph","text":"$80 million of profit."},{"type":"paragraph","text":"But produces:"},{"type":"paragraph","text":"$75 million of free cash flow."},{"type":"paragraph","text":"The second company may have better cash economics despite lower reported profit."},{"type":"paragraph","text":"Over time, strong cash conversion can become a major competitive advantage."},{"type":"heading","text":"Why investors love predictable cash flows","level":2},{"type":"paragraph","text":"Imagine you own an asset that produces:"},{"type":"paragraph","text":"$10 million"},{"type":"paragraph","text":"$11 million"},{"type":"paragraph","text":"$10.5 million"},{"type":"paragraph","text":"$11.5 million"},{"type":"paragraph","text":"$12 million"},{"type":"paragraph","text":"over five years."},{"type":"paragraph","text":"Now compare that with:"},{"type":"paragraph","text":"$3 million"},{"type":"paragraph","text":"$18 million"},{"type":"paragraph","text":"-$5 million"},{"type":"paragraph","text":"$25 million"},{"type":"paragraph","text":"$1 million."},{"type":"paragraph","text":"The second could theoretically produce more."},{"type":"paragraph","text":"But the first is much easier to plan around."},{"type":"paragraph","text":"Predictability reduces uncertainty."},{"type":"paragraph","text":"And lower uncertainty can make financing easier."},{"type":"paragraph","text":"It can also support higher valuations, depending on the circumstances."},{"type":"heading","text":"Cash flow is especially important when the future becomes uncertain","level":2},{"type":"paragraph","text":"During good times, almost everyone can raise money."},{"type":"paragraph","text":"Investors are optimistic."},{"type":"paragraph","text":"Banks lend."},{"type":"paragraph","text":"Valuations rise."},{"type":"paragraph","text":"Capital is abundant."},{"type":"paragraph","text":"Then the environment changes."},{"type":"paragraph","text":"Funding dries up."},{"type":"paragraph","text":"Investors become selective."},{"type":"paragraph","text":"Banks tighten standards."},{"type":"paragraph","text":"Companies that depend on external capital suddenly discover that their business model was partly dependent on the willingness of strangers to keep funding them."},{"type":"paragraph","text":"Cash-generative companies have a different advantage:"},{"type":"paragraph","text":"they can keep moving without asking permission."},{"type":"heading","text":"This is why downturns reveal business quality","level":2},{"type":"paragraph","text":"A strong economy can hide weak economics."},{"type":"paragraph","text":"When money is cheap, companies can survive despite:"},{"type":"paragraph","text":"poor margins,"},{"type":"paragraph","text":"high spending,"},{"type":"paragraph","text":"weak cash conversion,"},{"type":"paragraph","text":"and excessive borrowing."},{"type":"paragraph","text":"A downturn removes that cushion."},{"type":"paragraph","text":"Suddenly the market asks:"},{"type":"paragraph","text":"\"Can this company actually fund itself?\""},{"type":"paragraph","text":"That question can reveal which businesses are genuinely strong."},{"type":"heading","text":"The compounding effect","level":2},{"type":"paragraph","text":"Now consider a company that consistently generates free cash flow."},{"type":"paragraph","text":"Suppose it produces:"},{"type":"paragraph","text":"$10 million"},{"type":"paragraph","text":"Then $12 million."},{"type":"paragraph","text":"Then $15 million."},{"type":"paragraph","text":"Then $19 million."},{"type":"paragraph","text":"Then $24 million."},{"type":"paragraph","text":"If management can reinvest that cash at attractive returns, the business can compound."},{"type":"paragraph","text":"The company doesn''t need to repeatedly raise external capital."},{"type":"paragraph","text":"Its own economics fund its expansion."},{"type":"paragraph","text":"This creates one of the most powerful mechanisms in business:"},{"type":"paragraph","text":"Cash flow funding future cash flow."},{"type":"heading","text":"That''s the engine behind compounding","level":2},{"type":"paragraph","text":"Imagine a company earns a high return on capital."},{"type":"paragraph","text":"It generates cash."},{"type":"paragraph","text":"It reinvests that cash."},{"type":"paragraph","text":"The reinvestment produces additional earnings."},{"type":"paragraph","text":"Those earnings generate additional cash."},{"type":"paragraph","text":"That cash gets reinvested again."},{"type":"paragraph","text":"Over many years, the numbers can become enormous."},{"type":"paragraph","text":"This is why long-term investors often search for businesses with:"},{"type":"paragraph","text":"high returns on capital,"},{"type":"paragraph","text":"strong cash generation,"},{"type":"paragraph","text":"reinvestment opportunities,"},{"type":"paragraph","text":"and durable competitive advantages."},{"type":"heading","text":"But what if there is nowhere to reinvest?","level":2},{"type":"paragraph","text":"This is another important distinction."},{"type":"paragraph","text":"Suppose a mature company generates huge amounts of cash."},{"type":"paragraph","text":"But there are no attractive expansion opportunities."},{"type":"paragraph","text":"What should it do?"},{"type":"paragraph","text":"It might:"},{"type":"paragraph","text":"pay dividends,"},{"type":"paragraph","text":"repurchase shares,"},{"type":"paragraph","text":"reduce debt,"},{"type":"paragraph","text":"or acquire other businesses."},{"type":"paragraph","text":"The point is that cash gives management choices."},{"type":"paragraph","text":"But the quality of those choices determines whether shareholders benefit."},{"type":"paragraph","text":"A company can destroy billions of dollars by making bad acquisitions."},{"type":"heading","text":"The best management teams understand capital allocation","level":2},{"type":"paragraph","text":"Once a company generates cash, another question appears:"},{"type":"paragraph","text":"What should management do with it?"},{"type":"paragraph","text":"This is called capital allocation."},{"type":"paragraph","text":"Should the company:"},{"type":"paragraph","text":"reinvest?"},{"type":"paragraph","text":"acquire?"},{"type":"paragraph","text":"pay shareholders?"},{"type":"paragraph","text":"reduce debt?"},{"type":"paragraph","text":"build reserves?"},{"type":"paragraph","text":"The answer depends on expected returns."},{"type":"paragraph","text":"If the company can reinvest $1 and eventually create $3 of economic value, reinvesting may make sense."},{"type":"paragraph","text":"If it can only turn $1 into $1.05, distributing the money may be better."},{"type":"paragraph","text":"This is why capital allocation can be as important as the underlying business."},{"type":"heading","text":"The deeper lesson","level":2},{"type":"paragraph","text":"Revenue tells you how much economic activity is passing through a business."},{"type":"paragraph","text":"Profit tells you something about accounting economics."},{"type":"paragraph","text":"But cash flow tells you something much more fundamental:"},{"type":"paragraph","text":"How much financial fuel is the business actually producing?"},{"type":"paragraph","text":"And once you understand that, you can ask better questions."},{"type":"paragraph","text":"How durable is the cash flow?"},{"type":"paragraph","text":"How much capital is required to maintain it?"},{"type":"paragraph","text":"How much does growth consume?"},{"type":"paragraph","text":"How predictable is it?"},{"type":"paragraph","text":"Who controls the cash?"},{"type":"paragraph","text":"How is it being reinvested?"},{"type":"paragraph","text":"What return is being earned on that reinvestment?"},{"type":"paragraph","text":"How much debt sits against it?"},{"type":"paragraph","text":"What happens if the economy weakens?"},{"type":"paragraph","text":"These questions turn financial statements into an economic story."},{"type":"heading","text":"The investor''s mental model","level":2},{"type":"paragraph","text":"Think about an asset this way:"},{"type":"paragraph","text":"Customers create revenue."},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"The business pays its costs."},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Cash remains."},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"That cash can be reinvested."},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Reinvestment can create more productive assets."},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Those assets generate more cash."},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"The cycle compounds."},{"type":"paragraph","text":"That is the machine investors are ultimately trying to understand."},{"type":"paragraph","text":"Not the logo."},{"type":"paragraph","text":"Not the hype."},{"type":"paragraph","text":"Not the headline revenue."},{"type":"paragraph","text":"The machine."},{"type":"paragraph","text":"And once you start looking at investments through cash flow, another question becomes unavoidable:"},{"type":"paragraph","text":"If investors have capital to deploy, what makes them choose one market over another?"},{"type":"paragraph","text":"Why Nigeria instead of Kenya?"},{"type":"paragraph","text":"Why energy instead of software?"},{"type":"paragraph","text":"Why infrastructure instead of consumer businesses?"},{"type":"paragraph","text":"Why one industry today and another five years from now?"},{"type":"paragraph","text":"That takes us to the next layer:"}]'::jsonb, 'MONEY', 12, 'published', 'Why Investors Care About Cash Flow | Omniv Editorial', 'A company can report a profit and still run out of money. A business can grow rapidly and become less valuable. A company can have billions in revenue and still struggle to pay its bills.', 'https://omniv.media/p/why-investors-care-about-cash-flow', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"}]'::jsonb, '{}'::text[], '{money,artificial-intelligence,infrastructure,startups,investing}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'what-makes-a-market-attractive', 'What Makes a Market Attractive?', 'Yes. This is a strong Entrepreneurship pillar for Omniv because it can teach people to think in terms of problems, systems, distribution, infrastructure, and ownership—not just “startup ideas.” I’d write them as a connected series, with each article naturally leading into the next.', 'Yes. This is a strong Entrepreneurship pillar for Omniv because it can teach people to think in terms of problems, systems, distribution, infrastructure, and ownership—not just “startup ideas.”

I’d write them as a connected series, with each article naturally leading into the next.', 'Analysis from the Omniv Editorial desk.', 'Yes. This is a strong Entrepreneurship pillar for Omniv because it can teach people to think in terms of problems, systems, distribution, infrastructure, and ownership—not just “startup ideas.” I’d write them as a connected series, with each article naturally leading into the next.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"Yes. This is a strong Entrepreneurship pillar for Omniv because it can teach people to think in terms of problems, systems, distribution, infrastructure, and ownership—not just “startup ideas.”"},{"type":"paragraph","text":"I’d write them as a connected series, with each article naturally leading into the next."}]'::jsonb, 'MONEY', 1, 'published', 'What Makes a Market Attractive? | Omniv Editorial', 'Yes. This is a strong Entrepreneurship pillar for Omniv because it can teach people to think in terms of problems, systems, distribution, infrastructure, and ownership—not just “startup ideas.” I’d write them as a connected series, with each article naturally leading into the next.', 'https://omniv.media/p/what-makes-a-market-attractive', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"}]'::jsonb, '{}'::text[], '{money,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'stop-looking-for-ideas-look-for-problems', 'Stop Looking for Ideas. Look for Problems.', 'Entrepreneurship has developed an obsession with ideas. People ask: “What business should I start?”', 'Entrepreneurship has developed an obsession with ideas.

People ask:

“What business should I start?”

“What app should I build?”

“What AI startup can I launch?”

“What is the next big opportunity?”

It sounds productive.

But it can actually be one of the least productive places to begin.

Because businesses aren''t ultimately built around ideas.

They''re built around problems that somebody cares enough to solve.

And the difference is enormous.

Anyone can generate an idea.

In fact, you can generate hundreds in an afternoon.

AI can generate thousands.

Build an app for restaurants.

Build an AI assistant for lawyers.

Build a marketplace for freelancers.

Build software for musicians.

Build a platform for African businesses.

Build an app for personal finance.

None of these statements tells you whether a business should exist.

They''re concepts.

The harder question is:

What painful problem exists underneath the concept?

Imagine someone says:

"I want to build software for logistics companies."

That''s an idea.

Now imagine they discover that medium-sized logistics companies constantly lose money because they cannot accurately track vehicle maintenance.

That''s a problem.

The difference is that the second statement gives you something to investigate.

How often does it happen?

How much does it cost?

Who experiences it?

How are they solving it today?

What happens when they don''t solve it?

Would they pay to fix it?

Now you''re getting somewhere.

Look around you.

People are already:

using spreadsheets,

sending WhatsApp messages,

making phone calls,

copying information between systems,

driving across cities,

waiting in queues,

paying intermediaries,

keeping manual records,

hiring people to perform repetitive tasks,

building workarounds,

and tolerating terrible experiences.

Those behaviors are clues.

A workaround is often evidence of a problem.

If someone has created a complicated system just to accomplish something simple, pay attention.

There may be a business hiding inside the inconvenience.

Entrepreneurs often spend enormous amounts of time asking:

"What do customers want?"

Sometimes a better question is:

"What do customers complain about repeatedly?"

Complaints reveal friction.

Friction reveals cost.

Cost creates motivation.

And motivation creates potential demand.

A customer who says:

"This would be nice to have"

is interesting.

A customer who says:

"I''m losing money because this doesn''t work"

is much more interesting.

Not every problem deserves a company.

Some problems are annoying.

Others are expensive.

Some are inconvenient.

Others can destroy a business.

The severity of the problem matters.

Imagine two products.

Product A saves someone five minutes per week.

Product B prevents a company from losing $50,000 per month.

Both solve problems.

But their commercial potential is very different.

This is why entrepreneurs should learn to distinguish:

interesting problems

from

expensive problems.

Consider electricity.

A business might complain:

"Our electricity keeps going off."

That''s a problem.

But underneath it are potentially much larger problems:

generation,

transmission,

distribution,

storage,

backup systems,

maintenance,

financing,

fuel,

grid stability.

One complaint can expose an entire ecosystem.

This is why studying systems can be more valuable than brainstorming startups.

A powerful entrepreneurial habit is to keep asking:

"What happens because of this problem?"

Suppose a restaurant can''t reliably predict demand.

What happens?

It over-orders food.

Food gets wasted.

Margins decline.

Staffing becomes inefficient.

Cash gets tied up in inventory.

The owner becomes more conservative.

Expansion becomes harder.

Now the original problem is no longer simply:

"restaurant forecasting is difficult."

It becomes a chain of economic consequences.

And somewhere in that chain may be a valuable business.

One person''s problem might be an isolated inconvenience.

A thousand people''s identical problem is different.

If the same problem appears across:

companies,

industries,

cities,

or countries,

you may be looking at something structural.

Structural problems are particularly interesting because solving them can create large businesses.

Some of the biggest businesses are built around things nobody posts about.

Waste management.

Payroll.

Insurance.

Industrial maintenance.

Accounting.

Warehousing.

Power distribution.

Water treatment.

Procurement.

Compliance.

Equipment leasing.

Logistics.

Nobody needs to call these businesses "disruptive."

They simply solve problems people cannot ignore.

If a problem is:

frequent,

expensive,

mandatory,

and difficult to solve,

it can create an extremely attractive business.

You don''t need customers to be excited.

You need them to care.

That''s a very different business model.

Ask better questions.

Would they pay?

Would they pay now?

Would they pay again?

Would they switch from what they''re currently using?

Would they recommend it?

Would they be angry if it disappeared?

That last question is particularly powerful.

Because dependence is stronger evidence than curiosity.

Someone clicking your website is not necessarily a customer.

Someone downloading your app isn''t necessarily a customer.

Someone saying:

"That''s cool."

isn''t necessarily a customer.

Entrepreneurs can become addicted to signals that feel positive but don''t represent economic demand.

The real test is behavior.

Do they:

pay,

use,

return,

refer,

integrate,

depend?

Suppose you show someone your product.

They say:

"This is amazing."

You feel validated.

Then they never use it.

Now imagine someone says:

"Can I pay you today?"

That is validation.

The second person may not even compliment your product.

They don''t need to.

Their behavior tells you what you need to know.

Entrepreneurs often become emotionally attached to their first solution.

That''s dangerous.

You might begin thinking:

"I need to build X."

Then discover that customers don''t actually care about X.

But they desperately need Y.

The entrepreneur who follows the problem rather than defending the original idea has an advantage.

The product can change.

The technology can change.

The business model can change.

The problem is the anchor.

Imagine a city has terrible traffic.

The obvious idea might be:

build more roads.

But perhaps the deeper problem is:

poor public transportation,

bad logistics,

inefficient routing,

poor urban planning,

or lack of distributed services.

Solving the visible symptom isn''t always the best opportunity.

Entrepreneurs need to understand the system beneath the problem.

There is the surface problem.

Then the operational problem.

Then the economic problem.

Then sometimes the infrastructure problem.

For example:

Surface:

Customers are waiting too long.

Operational:

Orders aren''t being processed efficiently.

Economic:

The business is losing customers.

Infrastructure:

The underlying logistics system cannot support the volume.

Each layer reveals a different possible business.

Great entrepreneurs aren''t necessarily the people with the most imagination.

They''re often the people who notice things others have accepted as normal.

They ask:

Why does this work this way?

Why does everyone tolerate this?

Why does this still require a human?

Why does this take three days?

Why does this cost so much?

Why does this industry still use spreadsheets?

Why does nobody own this customer relationship?

Those questions are incredibly valuable.

Here''s one of the strongest signals.

If a company spends significant money solving a problem badly, the problem is probably real.

Maybe it hires five employees to perform a repetitive process.

Maybe it pays three different software companies because no single system works.

Maybe managers spend hours every week manually reconciling information.

Maybe customers call because the online system doesn''t work.

These aren''t merely inefficiencies.

They''re revealed willingness to pay.

Someone is already spending money.

Your opportunity may be to help them spend it better.

You don''t always need to create something new.

Sometimes you remove:

a step,

a middleman,

a delay,

a fee,

a spreadsheet,

a phone call,

a manual process,

a source of uncertainty.

A business can become enormously valuable simply by making something unnecessarily difficult become simple.

Instead of saying:

"I want to start a technology company."

Imagine saying:

"I want to understand how electricity reaches small manufacturers."

That''s much more powerful.

Now you''re studying:

generation,

distribution,

pricing,

reliability,

financing,

maintenance,

demand,

storage,

regulation.

You may eventually discover ten businesses.

You''re no longer hunting for ideas.

You''re becoming an expert in a problem.

First:

Problem

Then:

Understanding

Then:

Potential solution

Then:

Experiment

Then:

Customer behavior

Then:

Business model

Then:

Scale

Most people try to jump straight to step three.

That''s why so many businesses begin with solutions looking for problems.

The easiest customer to sell to isn''t necessarily someone you need to convince that a problem exists.

It''s someone who already knows.

They''ve already:

tried something,

spent money,

complained,

hired someone,

built a workaround,

or accepted an expensive inefficiency.

Your job isn''t to manufacture urgency.

It''s to discover existing urgency.

So instead of asking:

"What business should I start?"

Try asking:

"What is broken that people have become so accustomed to that they no longer question it?"

Then investigate.

How many people experience it?

How often?

What does it cost?

Who pays?

Who benefits?

Who loses?

What workaround exists?

Why hasn''t it been solved?

What would make the solution difficult?

What would make it scalable?

And most importantly:

What would happen if someone actually solved it?

That final question is where businesses begin to become interesting.

Because the best opportunities aren''t always hiding inside new ideas.

Sometimes they''re sitting in plain sight inside things everyone has simply learned to tolerate.

Don''t start with:

"What can I build?"

Start with:

"What is broken?"

Then:

"Who is paying for the broken version?"

Then:

"Why hasn''t someone fixed it?"

Then:

"What would a dramatically better version look like?"

That''s a much stronger starting point than brainstorming another app.

And it leads to an even more interesting idea:

Some of the best businesses aren''t created by inventing something new.

They''re created by noticing that something important has been broken for a very long time.

The Best Businesses Often Begin With Something Broken', 'Analysis from the Omniv Editorial desk.', 'Entrepreneurship has developed an obsession with ideas. People ask: “What business should I start?”', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"Entrepreneurship has developed an obsession with ideas."},{"type":"paragraph","text":"People ask:"},{"type":"paragraph","text":"“What business should I start?”"},{"type":"paragraph","text":"“What app should I build?”"},{"type":"paragraph","text":"“What AI startup can I launch?”"},{"type":"paragraph","text":"“What is the next big opportunity?”"},{"type":"paragraph","text":"It sounds productive."},{"type":"paragraph","text":"But it can actually be one of the least productive places to begin."},{"type":"paragraph","text":"Because businesses aren''t ultimately built around ideas."},{"type":"paragraph","text":"They''re built around problems that somebody cares enough to solve."},{"type":"paragraph","text":"And the difference is enormous."},{"type":"heading","text":"An idea is cheap","level":2},{"type":"paragraph","text":"Anyone can generate an idea."},{"type":"paragraph","text":"In fact, you can generate hundreds in an afternoon."},{"type":"paragraph","text":"AI can generate thousands."},{"type":"paragraph","text":"Build an app for restaurants."},{"type":"paragraph","text":"Build an AI assistant for lawyers."},{"type":"paragraph","text":"Build a marketplace for freelancers."},{"type":"paragraph","text":"Build software for musicians."},{"type":"paragraph","text":"Build a platform for African businesses."},{"type":"paragraph","text":"Build an app for personal finance."},{"type":"paragraph","text":"None of these statements tells you whether a business should exist."},{"type":"paragraph","text":"They''re concepts."},{"type":"paragraph","text":"The harder question is:"},{"type":"paragraph","text":"What painful problem exists underneath the concept?"},{"type":"heading","text":"Problems already have customers attached to them","level":2},{"type":"paragraph","text":"Imagine someone says:"},{"type":"paragraph","text":"\"I want to build software for logistics companies.\""},{"type":"paragraph","text":"That''s an idea."},{"type":"paragraph","text":"Now imagine they discover that medium-sized logistics companies constantly lose money because they cannot accurately track vehicle maintenance."},{"type":"paragraph","text":"That''s a problem."},{"type":"paragraph","text":"The difference is that the second statement gives you something to investigate."},{"type":"paragraph","text":"How often does it happen?"},{"type":"paragraph","text":"How much does it cost?"},{"type":"paragraph","text":"Who experiences it?"},{"type":"paragraph","text":"How are they solving it today?"},{"type":"paragraph","text":"What happens when they don''t solve it?"},{"type":"paragraph","text":"Would they pay to fix it?"},{"type":"paragraph","text":"Now you''re getting somewhere."},{"type":"heading","text":"The strongest problems don''t need to be invented","level":2},{"type":"paragraph","text":"Look around you."},{"type":"paragraph","text":"People are already:"},{"type":"paragraph","text":"using spreadsheets,"},{"type":"paragraph","text":"sending WhatsApp messages,"},{"type":"paragraph","text":"making phone calls,"},{"type":"paragraph","text":"copying information between systems,"},{"type":"paragraph","text":"driving across cities,"},{"type":"paragraph","text":"waiting in queues,"},{"type":"paragraph","text":"paying intermediaries,"},{"type":"paragraph","text":"keeping manual records,"},{"type":"paragraph","text":"hiring people to perform repetitive tasks,"},{"type":"paragraph","text":"building workarounds,"},{"type":"paragraph","text":"and tolerating terrible experiences."},{"type":"paragraph","text":"Those behaviors are clues."},{"type":"paragraph","text":"A workaround is often evidence of a problem."},{"type":"paragraph","text":"If someone has created a complicated system just to accomplish something simple, pay attention."},{"type":"paragraph","text":"There may be a business hiding inside the inconvenience."},{"type":"heading","text":"Complaints are market research","level":2},{"type":"paragraph","text":"Entrepreneurs often spend enormous amounts of time asking:"},{"type":"paragraph","text":"\"What do customers want?\""},{"type":"paragraph","text":"Sometimes a better question is:"},{"type":"paragraph","text":"\"What do customers complain about repeatedly?\""},{"type":"paragraph","text":"Complaints reveal friction."},{"type":"paragraph","text":"Friction reveals cost."},{"type":"paragraph","text":"Cost creates motivation."},{"type":"paragraph","text":"And motivation creates potential demand."},{"type":"paragraph","text":"A customer who says:"},{"type":"paragraph","text":"\"This would be nice to have\""},{"type":"paragraph","text":"is interesting."},{"type":"paragraph","text":"A customer who says:"},{"type":"paragraph","text":"\"I''m losing money because this doesn''t work\""},{"type":"paragraph","text":"is much more interesting."},{"type":"heading","text":"Pain creates urgency","level":2},{"type":"paragraph","text":"Not every problem deserves a company."},{"type":"paragraph","text":"Some problems are annoying."},{"type":"paragraph","text":"Others are expensive."},{"type":"paragraph","text":"Some are inconvenient."},{"type":"paragraph","text":"Others can destroy a business."},{"type":"paragraph","text":"The severity of the problem matters."},{"type":"paragraph","text":"Imagine two products."},{"type":"paragraph","text":"Product A saves someone five minutes per week."},{"type":"paragraph","text":"Product B prevents a company from losing $50,000 per month."},{"type":"paragraph","text":"Both solve problems."},{"type":"paragraph","text":"But their commercial potential is very different."},{"type":"paragraph","text":"This is why entrepreneurs should learn to distinguish:"},{"type":"paragraph","text":"interesting problems"},{"type":"paragraph","text":"from"},{"type":"paragraph","text":"expensive problems."},{"type":"heading","text":"The best problems often hide inside important systems","level":2},{"type":"paragraph","text":"Consider electricity."},{"type":"paragraph","text":"A business might complain:"},{"type":"paragraph","text":"\"Our electricity keeps going off.\""},{"type":"paragraph","text":"That''s a problem."},{"type":"paragraph","text":"But underneath it are potentially much larger problems:"},{"type":"paragraph","text":"generation,"},{"type":"paragraph","text":"transmission,"},{"type":"paragraph","text":"distribution,"},{"type":"paragraph","text":"storage,"},{"type":"paragraph","text":"backup systems,"},{"type":"paragraph","text":"maintenance,"},{"type":"paragraph","text":"financing,"},{"type":"paragraph","text":"fuel,"},{"type":"paragraph","text":"grid stability."},{"type":"paragraph","text":"One complaint can expose an entire ecosystem."},{"type":"paragraph","text":"This is why studying systems can be more valuable than brainstorming startups."},{"type":"heading","text":"Follow the consequences","level":2},{"type":"paragraph","text":"A powerful entrepreneurial habit is to keep asking:"},{"type":"paragraph","text":"\"What happens because of this problem?\""},{"type":"paragraph","text":"Suppose a restaurant can''t reliably predict demand."},{"type":"paragraph","text":"What happens?"},{"type":"paragraph","text":"It over-orders food."},{"type":"paragraph","text":"Food gets wasted."},{"type":"paragraph","text":"Margins decline."},{"type":"paragraph","text":"Staffing becomes inefficient."},{"type":"paragraph","text":"Cash gets tied up in inventory."},{"type":"paragraph","text":"The owner becomes more conservative."},{"type":"paragraph","text":"Expansion becomes harder."},{"type":"paragraph","text":"Now the original problem is no longer simply:"},{"type":"paragraph","text":"\"restaurant forecasting is difficult.\""},{"type":"paragraph","text":"It becomes a chain of economic consequences."},{"type":"paragraph","text":"And somewhere in that chain may be a valuable business."},{"type":"heading","text":"Look for repeated pain","level":2},{"type":"paragraph","text":"One person''s problem might be an isolated inconvenience."},{"type":"paragraph","text":"A thousand people''s identical problem is different."},{"type":"paragraph","text":"If the same problem appears across:"},{"type":"paragraph","text":"companies,"},{"type":"paragraph","text":"industries,"},{"type":"paragraph","text":"cities,"},{"type":"paragraph","text":"or countries,"},{"type":"paragraph","text":"you may be looking at something structural."},{"type":"paragraph","text":"Structural problems are particularly interesting because solving them can create large businesses."},{"type":"heading","text":"The problem doesn''t have to be glamorous","level":2},{"type":"paragraph","text":"Some of the biggest businesses are built around things nobody posts about."},{"type":"paragraph","text":"Waste management."},{"type":"paragraph","text":"Payroll."},{"type":"paragraph","text":"Insurance."},{"type":"paragraph","text":"Industrial maintenance."},{"type":"paragraph","text":"Accounting."},{"type":"paragraph","text":"Warehousing."},{"type":"paragraph","text":"Power distribution."},{"type":"paragraph","text":"Water treatment."},{"type":"paragraph","text":"Procurement."},{"type":"paragraph","text":"Compliance."},{"type":"paragraph","text":"Equipment leasing."},{"type":"paragraph","text":"Logistics."},{"type":"paragraph","text":"Nobody needs to call these businesses \"disruptive.\""},{"type":"paragraph","text":"They simply solve problems people cannot ignore."},{"type":"heading","text":"This is why boring can be powerful","level":2},{"type":"paragraph","text":"If a problem is:"},{"type":"paragraph","text":"frequent,"},{"type":"paragraph","text":"expensive,"},{"type":"paragraph","text":"mandatory,"},{"type":"paragraph","text":"and difficult to solve,"},{"type":"paragraph","text":"it can create an extremely attractive business."},{"type":"paragraph","text":"You don''t need customers to be excited."},{"type":"paragraph","text":"You need them to care."},{"type":"paragraph","text":"That''s a very different business model."},{"type":"heading","text":"Don''t ask \"Would people use this?\"","level":2},{"type":"paragraph","text":"Ask better questions."},{"type":"paragraph","text":"Would they pay?"},{"type":"paragraph","text":"Would they pay now?"},{"type":"paragraph","text":"Would they pay again?"},{"type":"paragraph","text":"Would they switch from what they''re currently using?"},{"type":"paragraph","text":"Would they recommend it?"},{"type":"paragraph","text":"Would they be angry if it disappeared?"},{"type":"paragraph","text":"That last question is particularly powerful."},{"type":"paragraph","text":"Because dependence is stronger evidence than curiosity."},{"type":"heading","text":"Curiosity is not demand","level":2},{"type":"paragraph","text":"Someone clicking your website is not necessarily a customer."},{"type":"paragraph","text":"Someone downloading your app isn''t necessarily a customer."},{"type":"paragraph","text":"Someone saying:"},{"type":"paragraph","text":"\"That''s cool.\""},{"type":"paragraph","text":"isn''t necessarily a customer."},{"type":"paragraph","text":"Entrepreneurs can become addicted to signals that feel positive but don''t represent economic demand."},{"type":"paragraph","text":"The real test is behavior."},{"type":"paragraph","text":"Do they:"},{"type":"paragraph","text":"pay,"},{"type":"paragraph","text":"use,"},{"type":"paragraph","text":"return,"},{"type":"paragraph","text":"refer,"},{"type":"paragraph","text":"integrate,"},{"type":"paragraph","text":"depend?"},{"type":"heading","text":"Build around behavior, not compliments","level":2},{"type":"paragraph","text":"Suppose you show someone your product."},{"type":"paragraph","text":"They say:"},{"type":"paragraph","text":"\"This is amazing.\""},{"type":"paragraph","text":"You feel validated."},{"type":"paragraph","text":"Then they never use it."},{"type":"paragraph","text":"Now imagine someone says:"},{"type":"paragraph","text":"\"Can I pay you today?\""},{"type":"paragraph","text":"That is validation."},{"type":"paragraph","text":"The second person may not even compliment your product."},{"type":"paragraph","text":"They don''t need to."},{"type":"paragraph","text":"Their behavior tells you what you need to know."},{"type":"heading","text":"The problem can change as you learn","level":2},{"type":"paragraph","text":"Entrepreneurs often become emotionally attached to their first solution."},{"type":"paragraph","text":"That''s dangerous."},{"type":"paragraph","text":"You might begin thinking:"},{"type":"paragraph","text":"\"I need to build X.\""},{"type":"paragraph","text":"Then discover that customers don''t actually care about X."},{"type":"paragraph","text":"But they desperately need Y."},{"type":"paragraph","text":"The entrepreneur who follows the problem rather than defending the original idea has an advantage."},{"type":"paragraph","text":"The product can change."},{"type":"paragraph","text":"The technology can change."},{"type":"paragraph","text":"The business model can change."},{"type":"paragraph","text":"The problem is the anchor."},{"type":"heading","text":"Sometimes the best business isn''t the obvious solution","level":2},{"type":"paragraph","text":"Imagine a city has terrible traffic."},{"type":"paragraph","text":"The obvious idea might be:"},{"type":"paragraph","text":"build more roads."},{"type":"paragraph","text":"But perhaps the deeper problem is:"},{"type":"paragraph","text":"poor public transportation,"},{"type":"paragraph","text":"bad logistics,"},{"type":"paragraph","text":"inefficient routing,"},{"type":"paragraph","text":"poor urban planning,"},{"type":"paragraph","text":"or lack of distributed services."},{"type":"paragraph","text":"Solving the visible symptom isn''t always the best opportunity."},{"type":"paragraph","text":"Entrepreneurs need to understand the system beneath the problem."},{"type":"heading","text":"Problems exist at different levels","level":2},{"type":"paragraph","text":"There is the surface problem."},{"type":"paragraph","text":"Then the operational problem."},{"type":"paragraph","text":"Then the economic problem."},{"type":"paragraph","text":"Then sometimes the infrastructure problem."},{"type":"paragraph","text":"For example:"},{"type":"paragraph","text":"Surface:"},{"type":"paragraph","text":"Customers are waiting too long."},{"type":"paragraph","text":"Operational:"},{"type":"paragraph","text":"Orders aren''t being processed efficiently."},{"type":"paragraph","text":"Economic:"},{"type":"paragraph","text":"The business is losing customers."},{"type":"paragraph","text":"Infrastructure:"},{"type":"paragraph","text":"The underlying logistics system cannot support the volume."},{"type":"paragraph","text":"Each layer reveals a different possible business."},{"type":"heading","text":"This is where entrepreneurship becomes observation","level":2},{"type":"paragraph","text":"Great entrepreneurs aren''t necessarily the people with the most imagination."},{"type":"paragraph","text":"They''re often the people who notice things others have accepted as normal."},{"type":"paragraph","text":"They ask:"},{"type":"paragraph","text":"Why does this work this way?"},{"type":"paragraph","text":"Why does everyone tolerate this?"},{"type":"paragraph","text":"Why does this still require a human?"},{"type":"paragraph","text":"Why does this take three days?"},{"type":"paragraph","text":"Why does this cost so much?"},{"type":"paragraph","text":"Why does this industry still use spreadsheets?"},{"type":"paragraph","text":"Why does nobody own this customer relationship?"},{"type":"paragraph","text":"Those questions are incredibly valuable."},{"type":"heading","text":"Look for expensive workarounds","level":2},{"type":"paragraph","text":"Here''s one of the strongest signals."},{"type":"paragraph","text":"If a company spends significant money solving a problem badly, the problem is probably real."},{"type":"paragraph","text":"Maybe it hires five employees to perform a repetitive process."},{"type":"paragraph","text":"Maybe it pays three different software companies because no single system works."},{"type":"paragraph","text":"Maybe managers spend hours every week manually reconciling information."},{"type":"paragraph","text":"Maybe customers call because the online system doesn''t work."},{"type":"paragraph","text":"These aren''t merely inefficiencies."},{"type":"paragraph","text":"They''re revealed willingness to pay."},{"type":"paragraph","text":"Someone is already spending money."},{"type":"paragraph","text":"Your opportunity may be to help them spend it better."},{"type":"heading","text":"Entrepreneurship is often subtraction","level":2},{"type":"paragraph","text":"You don''t always need to create something new."},{"type":"paragraph","text":"Sometimes you remove:"},{"type":"paragraph","text":"a step,"},{"type":"paragraph","text":"a middleman,"},{"type":"paragraph","text":"a delay,"},{"type":"paragraph","text":"a fee,"},{"type":"paragraph","text":"a spreadsheet,"},{"type":"paragraph","text":"a phone call,"},{"type":"paragraph","text":"a manual process,"},{"type":"paragraph","text":"a source of uncertainty."},{"type":"paragraph","text":"A business can become enormously valuable simply by making something unnecessarily difficult become simple."},{"type":"heading","text":"The best entrepreneurs become problem specialists","level":2},{"type":"paragraph","text":"Instead of saying:"},{"type":"paragraph","text":"\"I want to start a technology company.\""},{"type":"paragraph","text":"Imagine saying:"},{"type":"paragraph","text":"\"I want to understand how electricity reaches small manufacturers.\""},{"type":"paragraph","text":"That''s much more powerful."},{"type":"paragraph","text":"Now you''re studying:"},{"type":"paragraph","text":"generation,"},{"type":"paragraph","text":"distribution,"},{"type":"paragraph","text":"pricing,"},{"type":"paragraph","text":"reliability,"},{"type":"paragraph","text":"financing,"},{"type":"paragraph","text":"maintenance,"},{"type":"paragraph","text":"demand,"},{"type":"paragraph","text":"storage,"},{"type":"paragraph","text":"regulation."},{"type":"paragraph","text":"You may eventually discover ten businesses."},{"type":"paragraph","text":"You''re no longer hunting for ideas."},{"type":"paragraph","text":"You''re becoming an expert in a problem."},{"type":"heading","text":"The opportunity often appears after the observation","level":2},{"type":"paragraph","text":"First:"},{"type":"paragraph","text":"Problem"},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"Understanding"},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"Potential solution"},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"Experiment"},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"Customer behavior"},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"Business model"},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"Scale"},{"type":"paragraph","text":"Most people try to jump straight to step three."},{"type":"paragraph","text":"That''s why so many businesses begin with solutions looking for problems."},{"type":"heading","text":"Start where the pain already exists","level":2},{"type":"paragraph","text":"The easiest customer to sell to isn''t necessarily someone you need to convince that a problem exists."},{"type":"paragraph","text":"It''s someone who already knows."},{"type":"paragraph","text":"They''ve already:"},{"type":"paragraph","text":"tried something,"},{"type":"paragraph","text":"spent money,"},{"type":"paragraph","text":"complained,"},{"type":"paragraph","text":"hired someone,"},{"type":"paragraph","text":"built a workaround,"},{"type":"paragraph","text":"or accepted an expensive inefficiency."},{"type":"paragraph","text":"Your job isn''t to manufacture urgency."},{"type":"paragraph","text":"It''s to discover existing urgency."},{"type":"heading","text":"The ultimate question","level":2},{"type":"paragraph","text":"So instead of asking:"},{"type":"paragraph","text":"\"What business should I start?\""},{"type":"paragraph","text":"Try asking:"},{"type":"paragraph","text":"\"What is broken that people have become so accustomed to that they no longer question it?\""},{"type":"paragraph","text":"Then investigate."},{"type":"paragraph","text":"How many people experience it?"},{"type":"paragraph","text":"How often?"},{"type":"paragraph","text":"What does it cost?"},{"type":"paragraph","text":"Who pays?"},{"type":"paragraph","text":"Who benefits?"},{"type":"paragraph","text":"Who loses?"},{"type":"paragraph","text":"What workaround exists?"},{"type":"paragraph","text":"Why hasn''t it been solved?"},{"type":"paragraph","text":"What would make the solution difficult?"},{"type":"paragraph","text":"What would make it scalable?"},{"type":"paragraph","text":"And most importantly:"},{"type":"paragraph","text":"What would happen if someone actually solved it?"},{"type":"paragraph","text":"That final question is where businesses begin to become interesting."},{"type":"paragraph","text":"Because the best opportunities aren''t always hiding inside new ideas."},{"type":"paragraph","text":"Sometimes they''re sitting in plain sight inside things everyone has simply learned to tolerate."},{"type":"heading","text":"The entrepreneurial shift","level":2},{"type":"paragraph","text":"Don''t start with:"},{"type":"paragraph","text":"\"What can I build?\""},{"type":"paragraph","text":"Start with:"},{"type":"paragraph","text":"\"What is broken?\""},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"\"Who is paying for the broken version?\""},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"\"Why hasn''t someone fixed it?\""},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"\"What would a dramatically better version look like?\""},{"type":"paragraph","text":"That''s a much stronger starting point than brainstorming another app."},{"type":"paragraph","text":"And it leads to an even more interesting idea:"},{"type":"paragraph","text":"Some of the best businesses aren''t created by inventing something new."},{"type":"paragraph","text":"They''re created by noticing that something important has been broken for a very long time."},{"type":"heading","text":"Next on Omniv:","level":3},{"type":"paragraph","text":"The Best Businesses Often Begin With Something Broken"}]'::jsonb, 'PEOPLE', 8, 'published', 'Stop Looking for Ideas. Look for Problems. | Omniv Editorial', 'Entrepreneurship has developed an obsession with ideas. People ask: “What business should I start?”', 'https://omniv.media/p/stop-looking-for-ideas-look-for-problems', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"africa","label":"Africa"},{"type":"project","slug":"brain-science","label":"Brain Science"}]'::jsonb, '{}'::text[], '{people,artificial-intelligence,infrastructure,startups,africa,brain-science}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-best-businesses-often-begin-with-something-broken', 'The Best Businesses Often Begin With Something Broken', 'The next billion-dollar company may not begin with a brilliant idea. It may begin with someone asking: “Why the hell does this still work like this?”', 'The next billion-dollar company may not begin with a brilliant idea.

It may begin with someone asking:

“Why the hell does this still work like this?”

That question is more powerful than it sounds.

Because some of the biggest opportunities in business don''t come from creating entirely new behavior.

They come from finding an existing system that people already depend on—and discovering that the system is inefficient, expensive, fragmented, slow, unreliable, or simply outdated.

Then fixing it.

This is where entrepreneurship gets interesting.

If something completely stops working, everyone notices.

A bank''s systems go down.

A power plant fails.

A payment network crashes.

A factory stops producing.

A website disappears.

Those are obvious failures.

But some of the most valuable opportunities exist in systems that technically work.

They just work badly.

A company can still process orders through spreadsheets.

A customer can still make a payment by visiting a branch.

A manager can still coordinate twenty employees through WhatsApp.

A manufacturer can still use phone calls to track suppliers.

An artist can still guess which city to tour.

Everything functions.

Just inefficiently.

And because it has functioned that way for years, everyone has stopped questioning it.

One of the biggest obstacles to innovation is the word:

normal.

People say:

"That''s just how the industry works."

That sentence should make an entrepreneur curious.

Because "normal" often means:

nobody has successfully changed it yet.

It doesn''t mean the system is optimal.

Consider how many industries once considered these things normal:

waiting several days for a bank transfer,

calling a taxi company,

booking travel through an agent,

buying music physically,

renting movies from a store,

printing boarding passes,

visiting a branch to perform basic banking.

Then someone changed the system.

What looked like a normal process suddenly looked ridiculous.

A useful way to identify opportunity is to ask:

Where is money leaking out of the system?

Imagine a company makes $10 million in sales.

But because of poor logistics, it loses:

$300,000 to damaged inventory,

$200,000 to unnecessary storage,

$150,000 to inefficient routing,

$100,000 to administrative errors.

The business isn''t necessarily failing.

But hundreds of thousands of dollars are disappearing through friction.

A company that can remove that friction may create significant value.

The cost doesn''t always appear as a direct invoice.

It can appear as:

time,

wasted labor,

lost customers,

excess inventory,

delays,

mistakes,

missed opportunities,

unused capacity,

stress,

or uncertainty.

This is why entrepreneurs should learn to think in terms of economic consequences.

If a process wastes 20 hours every week, what is that time worth?

If a system causes 5% of customers to abandon a purchase, what is that revenue worth?

If unreliable electricity forces a factory to use generators, what does that additional energy actually cost?

The problem becomes much more interesting when you put a number beside it.

Imagine a company has a problem.

Instead of buying software, it creates a spreadsheet.

Then another spreadsheet.

Then a WhatsApp group.

Then a shared Google Drive.

Then an employee whose entire job is to reconcile everything.

Now you have something fascinating.

The company has effectively built its own software system.

It just doesn''t call it software.

This is one of the strongest signals an entrepreneur can find.

When customers build complicated workarounds, they may be telling you exactly what product they need.

There''s another version of this.

Sometimes an industry has no proper system, so humans become the infrastructure.

Someone manually checks documents.

Someone calls customers.

Someone copies data.

Someone confirms payments.

Someone matches buyers and sellers.

Someone follows up with suppliers.

Someone translates information between systems.

Someone maintains a spreadsheet.

Someone sends reminders.

Someone resolves errors.

These people may be performing essential work.

But the underlying process may be badly designed.

That creates an opportunity for better systems.

This is important.

Entrepreneurs sometimes see every problem and immediately think:

"I''ll build an app."

But software is only one possible solution.

Sometimes the answer is:

better infrastructure,

better financing,

better logistics,

better training,

better distribution,

better manufacturing,

better physical facilities,

or simply a better operating model.

A broken system doesn''t necessarily need another dashboard.

Sometimes it needs a road.

Imagine farmers produce enough food.

Customers want the food.

But there isn''t sufficient:

storage,

cold-chain infrastructure,

transportation,

processing capacity,

or reliable electricity.

The problem isn''t demand.

The problem is infrastructure.

Now imagine someone builds the missing infrastructure.

They aren''t necessarily creating demand.

They''re unlocking demand that already exists.

That can be an extremely powerful business model.

Every system has constraints.

A factory may have enough orders but insufficient power.

A hospital may have doctors but insufficient equipment.

A city may have housing demand but insufficient land development.

A company may have customers but insufficient logistics.

An artist may have followers but insufficient knowledge of where real demand exists.

A country may have natural resources but insufficient processing capacity.

The constraint is often where the opportunity lives.

Imagine a pipeline transporting something extremely valuable.

The commodity gets all the attention.

But the pipeline may quietly collect fees from the movement of that commodity.

Or consider a data center.

Everyone talks about AI models.

But the infrastructure providing the:

compute,

power,

cooling,

storage,

and connectivity

may become strategically important.

The lesson is:

Don''t only study what everyone is excited about. Study what the exciting thing depends on.

Suppose everyone believes AI is going to grow rapidly.

Most people ask:

Which AI company will win?

A more interesting entrepreneur asks:

What does AI depend on?

Compute.

Chips.

Data centers.

Electricity.

Cooling.

Fiber.

Networking.

Cloud infrastructure.

Specialized talent.

Financing.

Now the opportunity map becomes much larger.

The visible product is only one layer.

Underneath it is an entire economic system.

A small bottleneck might not matter when demand is low.

But when demand increases rapidly, the bottleneck becomes expensive.

Imagine a road handling 10,000 vehicles a day.

Fine.

Now imagine the surrounding population doubles.

Traffic explodes.

The road becomes a constraint.

The underlying infrastructure didn''t suddenly become worse.

Demand changed the economics of the bottleneck.

This happens constantly across industries.

A problem can exist for decades without producing a massive business opportunity.

Then something changes.

Technology gets cheaper.

Consumer behavior shifts.

Regulation changes.

Population increases.

Income rises.

A new industry appears.

Infrastructure improves.

Capital becomes available.

Suddenly the old problem becomes commercially solvable.

The problem wasn''t necessarily new.

The conditions around it changed.

People already needed taxis.

The problem was the experience:

finding a vehicle,

knowing when it would arrive,

knowing what it would cost,

paying,

and coordinating the trip.

The underlying demand already existed.

Technology changed the economics of serving it.

That distinction matters.

Some of the biggest companies don''t create entirely new needs.

They reorganize existing needs around a better system.

People already needed somewhere to stay.

Hotels already existed.

The opportunity came from organizing previously underutilized accommodation into a new marketplace.

Again:

existing need + broken/inefficient system + new mechanism.

That pattern appears repeatedly in entrepreneurship.

Businesses already needed to accept payments.

But integrating payments into software was historically complicated.

The opportunity wasn''t:

"People need to pay."

Everyone knew that.

The opportunity was:

"The infrastructure for accepting payments online is unnecessarily difficult."

Solve the infrastructure.

Capture the value.

This is particularly interesting.

Markets often become inefficient because people don''t have the right information at the right time.

A buyer doesn''t know where supply exists.

A seller doesn''t know where demand exists.

An investor doesn''t know which companies are emerging.

A company doesn''t know which customers are serious.

A manufacturer doesn''t know which supplier can actually deliver.

An artist doesn''t know which city contains concentrated demand.

The underlying market exists.

The missing layer is information.

Once enough economic activity depends on information, the information layer itself can become valuable.

Search engines did this.

Marketplaces do it.

Financial information platforms do it.

Credit systems do it.

Professional networks do it.

Discovery platforms do it.

The business isn''t necessarily producing the underlying asset.

It is making the asset legible.

That can be incredibly powerful.

Think about what businesses are really buying.

Sometimes they''re buying software.

But underneath the software, they''re buying:

certainty,

speed,

visibility,

control,

coordination,

prediction,

or access.

A logistics platform doesn''t merely provide maps.

It provides better control over movement.

An accounting system doesn''t merely store numbers.

It provides financial visibility.

A marketplace doesn''t merely display products.

It reduces the uncertainty of finding a buyer or seller.

The product is often the mechanism.

The economic value is the uncertainty removed.

This is a better entrepreneurial exercise than brainstorming startup ideas.

Look at your city.

Your industry.

Your workplace.

Your neighborhood.

Your government.

Your supply chain.

Your daily routines.

Then write down everything that requires:

three phone calls,

a spreadsheet,

a middleman,

a physical trip,

a WhatsApp group,

a long waiting period,

manual verification,

repeated data entry,

or someone "who knows someone."

Those are clues.

Not every clue becomes a business.

But every successful business begins with some form of economic friction.

Two people can experience the same broken system.

One says:

"This is annoying."

The other says:

"Why does this have to be this way?"

That second question is entrepreneurial.

Then comes the harder question:

"How much does this problem cost?"

Then:

"Who is willing to pay to remove it?"

Then:

"Can the solution work without me personally doing the work?"

Now you''re moving from observation toward a business.

A weak entrepreneur sees a problem and creates a patch.

A stronger entrepreneur asks:

Why does this problem exist in the first place?

Suppose deliveries are late.

You could hire more drivers.

Or perhaps the routing system is broken.

Suppose employees keep making mistakes.

You could hire more managers.

Or perhaps the workflow is poorly designed.

Suppose customers keep asking the same questions.

You could hire more support agents.

Or perhaps the product isn''t communicating clearly.

The best solution often removes the cause rather than managing the symptom.

This is the distinction between a service and a scalable business.

A service might solve the problem manually.

A system makes the solution repeatable.

One customer.

Then ten.

Then one hundred.

Then one thousand.

The entrepreneur gradually moves from:

doing the work

to

building the machine that does the work.

That''s where leverage begins.

The opportunity gets particularly interesting when the broken system has:

many users

high frequency

high economic cost

poor existing alternatives

strong willingness to pay

room for a dramatically better solution.

Now you aren''t just fixing something annoying.

You''re potentially rebuilding a piece of an industry.

Here''s the question I would ask before building almost anything:

If this problem disappeared tomorrow, would people notice?

If the answer is no, the problem may not matter enough.

But if removing the problem would cause customers to:

save money,

make money,

move faster,

reduce risk,

serve more customers,

or operate more reliably,

then you may have something.

And if they would be genuinely angry if your solution disappeared?

That''s even more interesting.

Because you''ve moved beyond convenience.

You''ve created dependence.

The pattern often looks like this:

Something is broken

↓

People create workarounds

↓

The workarounds become expensive

↓

Someone notices the pattern

↓

They understand the underlying problem

↓

They build a better mechanism

↓

Customers adopt it

↓

The mechanism becomes part of the workflow

↓

Customers begin depending on it

↓

The solution becomes infrastructure

That''s the trajectory entrepreneurs should be looking for.

The most interesting business opportunities aren''t always hiding in futuristic technology.

Sometimes they''re sitting inside:

the spreadsheet,

the queue,

the WhatsApp group,

the manual approval,

the unreliable generator,

the expensive middleman,

the disconnected database,

the outdated workflow,

the unused capacity,

or the information nobody has organized properly.

Everyone else sees inconvenience.

The entrepreneur sees unpriced economic friction.

And once you learn to see broken systems that way, you stop asking:

"What startup should I build?"

You start asking:

"What important system is inefficient enough that someone could build a much better one?"

That is a much more interesting question.', 'Analysis from the Omniv Editorial desk.', 'The next billion-dollar company may not begin with a brilliant idea. It may begin with someone asking: “Why the hell does this still work like this?”', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"The next billion-dollar company may not begin with a brilliant idea."},{"type":"paragraph","text":"It may begin with someone asking:"},{"type":"paragraph","text":"“Why the hell does this still work like this?”"},{"type":"paragraph","text":"That question is more powerful than it sounds."},{"type":"paragraph","text":"Because some of the biggest opportunities in business don''t come from creating entirely new behavior."},{"type":"paragraph","text":"They come from finding an existing system that people already depend on—and discovering that the system is inefficient, expensive, fragmented, slow, unreliable, or simply outdated."},{"type":"paragraph","text":"Then fixing it."},{"type":"heading","text":"Broken doesn''t always look broken","level":2},{"type":"paragraph","text":"This is where entrepreneurship gets interesting."},{"type":"paragraph","text":"If something completely stops working, everyone notices."},{"type":"paragraph","text":"A bank''s systems go down."},{"type":"paragraph","text":"A power plant fails."},{"type":"paragraph","text":"A payment network crashes."},{"type":"paragraph","text":"A factory stops producing."},{"type":"paragraph","text":"A website disappears."},{"type":"paragraph","text":"Those are obvious failures."},{"type":"paragraph","text":"But some of the most valuable opportunities exist in systems that technically work."},{"type":"paragraph","text":"They just work badly."},{"type":"paragraph","text":"A company can still process orders through spreadsheets."},{"type":"paragraph","text":"A customer can still make a payment by visiting a branch."},{"type":"paragraph","text":"A manager can still coordinate twenty employees through WhatsApp."},{"type":"paragraph","text":"A manufacturer can still use phone calls to track suppliers."},{"type":"paragraph","text":"An artist can still guess which city to tour."},{"type":"paragraph","text":"Everything functions."},{"type":"paragraph","text":"Just inefficiently."},{"type":"paragraph","text":"And because it has functioned that way for years, everyone has stopped questioning it."},{"type":"heading","text":"The \"normal\" trap","level":2},{"type":"paragraph","text":"One of the biggest obstacles to innovation is the word:"},{"type":"paragraph","text":"normal."},{"type":"paragraph","text":"People say:"},{"type":"paragraph","text":"\"That''s just how the industry works.\""},{"type":"paragraph","text":"That sentence should make an entrepreneur curious."},{"type":"paragraph","text":"Because \"normal\" often means:"},{"type":"paragraph","text":"nobody has successfully changed it yet."},{"type":"paragraph","text":"It doesn''t mean the system is optimal."},{"type":"paragraph","text":"Consider how many industries once considered these things normal:"},{"type":"paragraph","text":"waiting several days for a bank transfer,"},{"type":"paragraph","text":"calling a taxi company,"},{"type":"paragraph","text":"booking travel through an agent,"},{"type":"paragraph","text":"buying music physically,"},{"type":"paragraph","text":"renting movies from a store,"},{"type":"paragraph","text":"printing boarding passes,"},{"type":"paragraph","text":"visiting a branch to perform basic banking."},{"type":"paragraph","text":"Then someone changed the system."},{"type":"paragraph","text":"What looked like a normal process suddenly looked ridiculous."},{"type":"heading","text":"Broken systems create economic leakage","level":2},{"type":"paragraph","text":"A useful way to identify opportunity is to ask:"},{"type":"paragraph","text":"Where is money leaking out of the system?"},{"type":"paragraph","text":"Imagine a company makes $10 million in sales."},{"type":"paragraph","text":"But because of poor logistics, it loses:"},{"type":"paragraph","text":"$300,000 to damaged inventory,"},{"type":"paragraph","text":"$200,000 to unnecessary storage,"},{"type":"paragraph","text":"$150,000 to inefficient routing,"},{"type":"paragraph","text":"$100,000 to administrative errors."},{"type":"paragraph","text":"The business isn''t necessarily failing."},{"type":"paragraph","text":"But hundreds of thousands of dollars are disappearing through friction."},{"type":"paragraph","text":"A company that can remove that friction may create significant value."},{"type":"heading","text":"Every inefficient system has a cost","level":2},{"type":"paragraph","text":"The cost doesn''t always appear as a direct invoice."},{"type":"paragraph","text":"It can appear as:"},{"type":"paragraph","text":"time,"},{"type":"paragraph","text":"wasted labor,"},{"type":"paragraph","text":"lost customers,"},{"type":"paragraph","text":"excess inventory,"},{"type":"paragraph","text":"delays,"},{"type":"paragraph","text":"mistakes,"},{"type":"paragraph","text":"missed opportunities,"},{"type":"paragraph","text":"unused capacity,"},{"type":"paragraph","text":"stress,"},{"type":"paragraph","text":"or uncertainty."},{"type":"paragraph","text":"This is why entrepreneurs should learn to think in terms of economic consequences."},{"type":"paragraph","text":"If a process wastes 20 hours every week, what is that time worth?"},{"type":"paragraph","text":"If a system causes 5% of customers to abandon a purchase, what is that revenue worth?"},{"type":"paragraph","text":"If unreliable electricity forces a factory to use generators, what does that additional energy actually cost?"},{"type":"paragraph","text":"The problem becomes much more interesting when you put a number beside it."},{"type":"heading","text":"Sometimes the workaround is the real business opportunity","level":2},{"type":"paragraph","text":"Imagine a company has a problem."},{"type":"paragraph","text":"Instead of buying software, it creates a spreadsheet."},{"type":"paragraph","text":"Then another spreadsheet."},{"type":"paragraph","text":"Then a WhatsApp group."},{"type":"paragraph","text":"Then a shared Google Drive."},{"type":"paragraph","text":"Then an employee whose entire job is to reconcile everything."},{"type":"paragraph","text":"Now you have something fascinating."},{"type":"paragraph","text":"The company has effectively built its own software system."},{"type":"paragraph","text":"It just doesn''t call it software."},{"type":"paragraph","text":"This is one of the strongest signals an entrepreneur can find."},{"type":"paragraph","text":"When customers build complicated workarounds, they may be telling you exactly what product they need."},{"type":"heading","text":"Look for \"human middleware\"","level":2},{"type":"paragraph","text":"There''s another version of this."},{"type":"paragraph","text":"Sometimes an industry has no proper system, so humans become the infrastructure."},{"type":"paragraph","text":"Someone manually checks documents."},{"type":"paragraph","text":"Someone calls customers."},{"type":"paragraph","text":"Someone copies data."},{"type":"paragraph","text":"Someone confirms payments."},{"type":"paragraph","text":"Someone matches buyers and sellers."},{"type":"paragraph","text":"Someone follows up with suppliers."},{"type":"paragraph","text":"Someone translates information between systems."},{"type":"paragraph","text":"Someone maintains a spreadsheet."},{"type":"paragraph","text":"Someone sends reminders."},{"type":"paragraph","text":"Someone resolves errors."},{"type":"paragraph","text":"These people may be performing essential work."},{"type":"paragraph","text":"But the underlying process may be badly designed."},{"type":"paragraph","text":"That creates an opportunity for better systems."},{"type":"heading","text":"The opportunity isn''t always software","level":2},{"type":"paragraph","text":"This is important."},{"type":"paragraph","text":"Entrepreneurs sometimes see every problem and immediately think:"},{"type":"paragraph","text":"\"I''ll build an app.\""},{"type":"paragraph","text":"But software is only one possible solution."},{"type":"paragraph","text":"Sometimes the answer is:"},{"type":"paragraph","text":"better infrastructure,"},{"type":"paragraph","text":"better financing,"},{"type":"paragraph","text":"better logistics,"},{"type":"paragraph","text":"better training,"},{"type":"paragraph","text":"better distribution,"},{"type":"paragraph","text":"better manufacturing,"},{"type":"paragraph","text":"better physical facilities,"},{"type":"paragraph","text":"or simply a better operating model."},{"type":"paragraph","text":"A broken system doesn''t necessarily need another dashboard."},{"type":"paragraph","text":"Sometimes it needs a road."},{"type":"heading","text":"Infrastructure is often the hidden problem","level":2},{"type":"paragraph","text":"Imagine farmers produce enough food."},{"type":"paragraph","text":"Customers want the food."},{"type":"paragraph","text":"But there isn''t sufficient:"},{"type":"paragraph","text":"storage,"},{"type":"paragraph","text":"cold-chain infrastructure,"},{"type":"paragraph","text":"transportation,"},{"type":"paragraph","text":"processing capacity,"},{"type":"paragraph","text":"or reliable electricity."},{"type":"paragraph","text":"The problem isn''t demand."},{"type":"paragraph","text":"The problem is infrastructure."},{"type":"paragraph","text":"Now imagine someone builds the missing infrastructure."},{"type":"paragraph","text":"They aren''t necessarily creating demand."},{"type":"paragraph","text":"They''re unlocking demand that already exists."},{"type":"paragraph","text":"That can be an extremely powerful business model."},{"type":"heading","text":"Find the constraint","level":2},{"type":"paragraph","text":"Every system has constraints."},{"type":"paragraph","text":"A factory may have enough orders but insufficient power."},{"type":"paragraph","text":"A hospital may have doctors but insufficient equipment."},{"type":"paragraph","text":"A city may have housing demand but insufficient land development."},{"type":"paragraph","text":"A company may have customers but insufficient logistics."},{"type":"paragraph","text":"An artist may have followers but insufficient knowledge of where real demand exists."},{"type":"paragraph","text":"A country may have natural resources but insufficient processing capacity."},{"type":"paragraph","text":"The constraint is often where the opportunity lives."},{"type":"heading","text":"The bottleneck can be worth more than the product","level":2},{"type":"paragraph","text":"Imagine a pipeline transporting something extremely valuable."},{"type":"paragraph","text":"The commodity gets all the attention."},{"type":"paragraph","text":"But the pipeline may quietly collect fees from the movement of that commodity."},{"type":"paragraph","text":"Or consider a data center."},{"type":"paragraph","text":"Everyone talks about AI models."},{"type":"paragraph","text":"But the infrastructure providing the:"},{"type":"paragraph","text":"compute,"},{"type":"paragraph","text":"power,"},{"type":"paragraph","text":"cooling,"},{"type":"paragraph","text":"storage,"},{"type":"paragraph","text":"and connectivity"},{"type":"paragraph","text":"may become strategically important."},{"type":"paragraph","text":"The lesson is:"},{"type":"paragraph","text":"Don''t only study what everyone is excited about. Study what the exciting thing depends on."},{"type":"heading","text":"Follow the dependency chain","level":2},{"type":"paragraph","text":"Suppose everyone believes AI is going to grow rapidly."},{"type":"paragraph","text":"Most people ask:"},{"type":"paragraph","text":"Which AI company will win?"},{"type":"paragraph","text":"A more interesting entrepreneur asks:"},{"type":"paragraph","text":"What does AI depend on?"},{"type":"paragraph","text":"Compute."},{"type":"paragraph","text":"Chips."},{"type":"paragraph","text":"Data centers."},{"type":"paragraph","text":"Electricity."},{"type":"paragraph","text":"Cooling."},{"type":"paragraph","text":"Fiber."},{"type":"paragraph","text":"Networking."},{"type":"paragraph","text":"Cloud infrastructure."},{"type":"paragraph","text":"Specialized talent."},{"type":"paragraph","text":"Financing."},{"type":"paragraph","text":"Now the opportunity map becomes much larger."},{"type":"paragraph","text":"The visible product is only one layer."},{"type":"paragraph","text":"Underneath it is an entire economic system."},{"type":"heading","text":"Broken systems become more valuable when demand accelerates","level":2},{"type":"paragraph","text":"A small bottleneck might not matter when demand is low."},{"type":"paragraph","text":"But when demand increases rapidly, the bottleneck becomes expensive."},{"type":"paragraph","text":"Imagine a road handling 10,000 vehicles a day."},{"type":"paragraph","text":"Fine."},{"type":"paragraph","text":"Now imagine the surrounding population doubles."},{"type":"paragraph","text":"Traffic explodes."},{"type":"paragraph","text":"The road becomes a constraint."},{"type":"paragraph","text":"The underlying infrastructure didn''t suddenly become worse."},{"type":"paragraph","text":"Demand changed the economics of the bottleneck."},{"type":"paragraph","text":"This happens constantly across industries."},{"type":"heading","text":"This is why timing matters","level":2},{"type":"paragraph","text":"A problem can exist for decades without producing a massive business opportunity."},{"type":"paragraph","text":"Then something changes."},{"type":"paragraph","text":"Technology gets cheaper."},{"type":"paragraph","text":"Consumer behavior shifts."},{"type":"paragraph","text":"Regulation changes."},{"type":"paragraph","text":"Population increases."},{"type":"paragraph","text":"Income rises."},{"type":"paragraph","text":"A new industry appears."},{"type":"paragraph","text":"Infrastructure improves."},{"type":"paragraph","text":"Capital becomes available."},{"type":"paragraph","text":"Suddenly the old problem becomes commercially solvable."},{"type":"paragraph","text":"The problem wasn''t necessarily new."},{"type":"paragraph","text":"The conditions around it changed."},{"type":"heading","text":"Uber didn''t invent transportation","level":2},{"type":"paragraph","text":"People already needed taxis."},{"type":"paragraph","text":"The problem was the experience:"},{"type":"paragraph","text":"finding a vehicle,"},{"type":"paragraph","text":"knowing when it would arrive,"},{"type":"paragraph","text":"knowing what it would cost,"},{"type":"paragraph","text":"paying,"},{"type":"paragraph","text":"and coordinating the trip."},{"type":"paragraph","text":"The underlying demand already existed."},{"type":"paragraph","text":"Technology changed the economics of serving it."},{"type":"paragraph","text":"That distinction matters."},{"type":"paragraph","text":"Some of the biggest companies don''t create entirely new needs."},{"type":"paragraph","text":"They reorganize existing needs around a better system."},{"type":"heading","text":"Airbnb didn''t invent accommodation","level":2},{"type":"paragraph","text":"People already needed somewhere to stay."},{"type":"paragraph","text":"Hotels already existed."},{"type":"paragraph","text":"The opportunity came from organizing previously underutilized accommodation into a new marketplace."},{"type":"paragraph","text":"Again:"},{"type":"paragraph","text":"existing need + broken/inefficient system + new mechanism."},{"type":"paragraph","text":"That pattern appears repeatedly in entrepreneurship."},{"type":"heading","text":"Stripe didn''t invent payments","level":2},{"type":"paragraph","text":"Businesses already needed to accept payments."},{"type":"paragraph","text":"But integrating payments into software was historically complicated."},{"type":"paragraph","text":"The opportunity wasn''t:"},{"type":"paragraph","text":"\"People need to pay.\""},{"type":"paragraph","text":"Everyone knew that."},{"type":"paragraph","text":"The opportunity was:"},{"type":"paragraph","text":"\"The infrastructure for accepting payments online is unnecessarily difficult.\""},{"type":"paragraph","text":"Solve the infrastructure."},{"type":"paragraph","text":"Capture the value."},{"type":"heading","text":"Sometimes the broken thing is information","level":2},{"type":"paragraph","text":"This is particularly interesting."},{"type":"paragraph","text":"Markets often become inefficient because people don''t have the right information at the right time."},{"type":"paragraph","text":"A buyer doesn''t know where supply exists."},{"type":"paragraph","text":"A seller doesn''t know where demand exists."},{"type":"paragraph","text":"An investor doesn''t know which companies are emerging."},{"type":"paragraph","text":"A company doesn''t know which customers are serious."},{"type":"paragraph","text":"A manufacturer doesn''t know which supplier can actually deliver."},{"type":"paragraph","text":"An artist doesn''t know which city contains concentrated demand."},{"type":"paragraph","text":"The underlying market exists."},{"type":"paragraph","text":"The missing layer is information."},{"type":"heading","text":"Information can become infrastructure","level":2},{"type":"paragraph","text":"Once enough economic activity depends on information, the information layer itself can become valuable."},{"type":"paragraph","text":"Search engines did this."},{"type":"paragraph","text":"Marketplaces do it."},{"type":"paragraph","text":"Financial information platforms do it."},{"type":"paragraph","text":"Credit systems do it."},{"type":"paragraph","text":"Professional networks do it."},{"type":"paragraph","text":"Discovery platforms do it."},{"type":"paragraph","text":"The business isn''t necessarily producing the underlying asset."},{"type":"paragraph","text":"It is making the asset legible."},{"type":"paragraph","text":"That can be incredibly powerful."},{"type":"heading","text":"The best systems reduce uncertainty","level":2},{"type":"paragraph","text":"Think about what businesses are really buying."},{"type":"paragraph","text":"Sometimes they''re buying software."},{"type":"paragraph","text":"But underneath the software, they''re buying:"},{"type":"paragraph","text":"certainty,"},{"type":"paragraph","text":"speed,"},{"type":"paragraph","text":"visibility,"},{"type":"paragraph","text":"control,"},{"type":"paragraph","text":"coordination,"},{"type":"paragraph","text":"prediction,"},{"type":"paragraph","text":"or access."},{"type":"paragraph","text":"A logistics platform doesn''t merely provide maps."},{"type":"paragraph","text":"It provides better control over movement."},{"type":"paragraph","text":"An accounting system doesn''t merely store numbers."},{"type":"paragraph","text":"It provides financial visibility."},{"type":"paragraph","text":"A marketplace doesn''t merely display products."},{"type":"paragraph","text":"It reduces the uncertainty of finding a buyer or seller."},{"type":"paragraph","text":"The product is often the mechanism."},{"type":"paragraph","text":"The economic value is the uncertainty removed."},{"type":"heading","text":"What is broken around you?","level":2},{"type":"paragraph","text":"This is a better entrepreneurial exercise than brainstorming startup ideas."},{"type":"paragraph","text":"Look at your city."},{"type":"paragraph","text":"Your industry."},{"type":"paragraph","text":"Your workplace."},{"type":"paragraph","text":"Your neighborhood."},{"type":"paragraph","text":"Your government."},{"type":"paragraph","text":"Your supply chain."},{"type":"paragraph","text":"Your daily routines."},{"type":"paragraph","text":"Then write down everything that requires:"},{"type":"paragraph","text":"three phone calls,"},{"type":"paragraph","text":"a spreadsheet,"},{"type":"paragraph","text":"a middleman,"},{"type":"paragraph","text":"a physical trip,"},{"type":"paragraph","text":"a WhatsApp group,"},{"type":"paragraph","text":"a long waiting period,"},{"type":"paragraph","text":"manual verification,"},{"type":"paragraph","text":"repeated data entry,"},{"type":"paragraph","text":"or someone \"who knows someone.\""},{"type":"paragraph","text":"Those are clues."},{"type":"paragraph","text":"Not every clue becomes a business."},{"type":"paragraph","text":"But every successful business begins with some form of economic friction."},{"type":"heading","text":"The founder''s advantage is seeing friction before everyone else","level":2},{"type":"paragraph","text":"Two people can experience the same broken system."},{"type":"paragraph","text":"One says:"},{"type":"paragraph","text":"\"This is annoying.\""},{"type":"paragraph","text":"The other says:"},{"type":"paragraph","text":"\"Why does this have to be this way?\""},{"type":"paragraph","text":"That second question is entrepreneurial."},{"type":"paragraph","text":"Then comes the harder question:"},{"type":"paragraph","text":"\"How much does this problem cost?\""},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"\"Who is willing to pay to remove it?\""},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"\"Can the solution work without me personally doing the work?\""},{"type":"paragraph","text":"Now you''re moving from observation toward a business."},{"type":"heading","text":"Don''t just fix the symptom","level":2},{"type":"paragraph","text":"A weak entrepreneur sees a problem and creates a patch."},{"type":"paragraph","text":"A stronger entrepreneur asks:"},{"type":"paragraph","text":"Why does this problem exist in the first place?"},{"type":"paragraph","text":"Suppose deliveries are late."},{"type":"paragraph","text":"You could hire more drivers."},{"type":"paragraph","text":"Or perhaps the routing system is broken."},{"type":"paragraph","text":"Suppose employees keep making mistakes."},{"type":"paragraph","text":"You could hire more managers."},{"type":"paragraph","text":"Or perhaps the workflow is poorly designed."},{"type":"paragraph","text":"Suppose customers keep asking the same questions."},{"type":"paragraph","text":"You could hire more support agents."},{"type":"paragraph","text":"Or perhaps the product isn''t communicating clearly."},{"type":"paragraph","text":"The best solution often removes the cause rather than managing the symptom."},{"type":"heading","text":"Build the system, not the workaround","level":2},{"type":"paragraph","text":"This is the distinction between a service and a scalable business."},{"type":"paragraph","text":"A service might solve the problem manually."},{"type":"paragraph","text":"A system makes the solution repeatable."},{"type":"paragraph","text":"One customer."},{"type":"paragraph","text":"Then ten."},{"type":"paragraph","text":"Then one hundred."},{"type":"paragraph","text":"Then one thousand."},{"type":"paragraph","text":"The entrepreneur gradually moves from:"},{"type":"paragraph","text":"doing the work"},{"type":"paragraph","text":"to"},{"type":"paragraph","text":"building the machine that does the work."},{"type":"paragraph","text":"That''s where leverage begins."},{"type":"heading","text":"Broken systems can become enormous businesses","level":2},{"type":"paragraph","text":"The opportunity gets particularly interesting when the broken system has:"},{"type":"paragraph","text":"many users"},{"type":"paragraph","text":"high frequency"},{"type":"paragraph","text":"high economic cost"},{"type":"paragraph","text":"poor existing alternatives"},{"type":"paragraph","text":"strong willingness to pay"},{"type":"paragraph","text":"room for a dramatically better solution."},{"type":"paragraph","text":"Now you aren''t just fixing something annoying."},{"type":"paragraph","text":"You''re potentially rebuilding a piece of an industry."},{"type":"heading","text":"The biggest clue may be dependence","level":2},{"type":"paragraph","text":"Here''s the question I would ask before building almost anything:"},{"type":"paragraph","text":"If this problem disappeared tomorrow, would people notice?"},{"type":"paragraph","text":"If the answer is no, the problem may not matter enough."},{"type":"paragraph","text":"But if removing the problem would cause customers to:"},{"type":"paragraph","text":"save money,"},{"type":"paragraph","text":"make money,"},{"type":"paragraph","text":"move faster,"},{"type":"paragraph","text":"reduce risk,"},{"type":"paragraph","text":"serve more customers,"},{"type":"paragraph","text":"or operate more reliably,"},{"type":"paragraph","text":"then you may have something."},{"type":"paragraph","text":"And if they would be genuinely angry if your solution disappeared?"},{"type":"paragraph","text":"That''s even more interesting."},{"type":"paragraph","text":"Because you''ve moved beyond convenience."},{"type":"paragraph","text":"You''ve created dependence."},{"type":"heading","text":"From broken system to business","level":2},{"type":"paragraph","text":"The pattern often looks like this:"},{"type":"paragraph","text":"Something is broken"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"People create workarounds"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"The workarounds become expensive"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Someone notices the pattern"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"They understand the underlying problem"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"They build a better mechanism"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Customers adopt it"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"The mechanism becomes part of the workflow"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Customers begin depending on it"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"The solution becomes infrastructure"},{"type":"paragraph","text":"That''s the trajectory entrepreneurs should be looking for."},{"type":"heading","text":"The real opportunity","level":2},{"type":"paragraph","text":"The most interesting business opportunities aren''t always hiding in futuristic technology."},{"type":"paragraph","text":"Sometimes they''re sitting inside:"},{"type":"paragraph","text":"the spreadsheet,"},{"type":"paragraph","text":"the queue,"},{"type":"paragraph","text":"the WhatsApp group,"},{"type":"paragraph","text":"the manual approval,"},{"type":"paragraph","text":"the unreliable generator,"},{"type":"paragraph","text":"the expensive middleman,"},{"type":"paragraph","text":"the disconnected database,"},{"type":"paragraph","text":"the outdated workflow,"},{"type":"paragraph","text":"the unused capacity,"},{"type":"paragraph","text":"or the information nobody has organized properly."},{"type":"paragraph","text":"Everyone else sees inconvenience."},{"type":"paragraph","text":"The entrepreneur sees unpriced economic friction."},{"type":"paragraph","text":"And once you learn to see broken systems that way, you stop asking:"},{"type":"paragraph","text":"\"What startup should I build?\""},{"type":"paragraph","text":"You start asking:"},{"type":"paragraph","text":"\"What important system is inefficient enough that someone could build a much better one?\""},{"type":"paragraph","text":"That is a much more interesting question."},{"type":"heading","text":"Next on Omniv:","level":3}]'::jsonb, 'PEOPLE', 10, 'published', 'The Best Businesses Often Begin With Something Broken | Omniv Editorial', 'The next billion-dollar company may not begin with a brilliant idea. It may begin with someone asking: “Why the hell does this still work like this?”', 'https://omniv.media/p/the-best-businesses-often-begin-with-something-broken', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"biology","label":"Biology"},{"type":"project","slug":"brain-science","label":"Brain Science"}]'::jsonb, '{}'::text[], '{people,global-supply-chains,artificial-intelligence,data-centres,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'why-entrepreneurs-should-study-infrastructure', 'Why Entrepreneurs Should Study Infrastructure', 'Because once you understand broken systems, you start noticing something else: The biggest opportunities often sit underneath everything else. Not in the app everyone uses.', 'Because once you understand broken systems, you start noticing something else:

The biggest opportunities often sit underneath everything else.

Not in the app everyone uses.

Not in the brand everyone sees.

But in the physical, digital and financial infrastructure that makes the entire market possible.

Absolutely. These five fit the Science / Frontier Technology side of Omniv very well. I’d make them read less like textbook explainers and more like “something enormous is happening underneath the surface” pieces—the kind that make an Explorer click into another article.', 'Analysis from the Omniv Editorial desk.', 'Because once you understand broken systems, you start noticing something else: The biggest opportunities often sit underneath everything else. Not in the app everyone uses.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"Because once you understand broken systems, you start noticing something else:"},{"type":"paragraph","text":"The biggest opportunities often sit underneath everything else."},{"type":"paragraph","text":"Not in the app everyone uses."},{"type":"paragraph","text":"Not in the brand everyone sees."},{"type":"paragraph","text":"But in the physical, digital and financial infrastructure that makes the entire market possible."},{"type":"paragraph","text":"Absolutely. These five fit the Science / Frontier Technology side of Omniv very well. I’d make them read less like textbook explainers and more like “something enormous is happening underneath the surface” pieces—the kind that make an Explorer click into another article."}]'::jsonb, 'MONEY', 1, 'published', 'Why Entrepreneurs Should Study Infrastructure | Omniv Editorial', 'Because once you understand broken systems, you start noticing something else: The biggest opportunities often sit underneath everything else. Not in the app everyone uses.', 'https://omniv.media/p/why-entrepreneurs-should-study-infrastructure', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"}]'::jsonb, '{}'::text[], '{money,artificial-intelligence,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'what-we-still-dont-understand-about-the-brain', 'What We Still Don''t Understand About the Brain', 'We have mapped neurons. We can record electrical activity. We can watch parts of the brain activate while people see, speak, remember, decide and sleep.', 'We have mapped neurons.

We can record electrical activity.

We can watch parts of the brain activate while people see, speak, remember, decide and sleep.

We can manipulate individual circuits in animals.

We can build increasingly sophisticated computational models.

And yet, one of the most important objects in the known universe remains profoundly mysterious:

the human brain.

We know an enormous amount about its parts.

We still don''t fully understand how those parts produce you.

That distinction is where the mystery begins.

The human brain contains roughly 86 billion neurons, alongside enormous networks of supporting cells and an extraordinary web of connections.

We know about:

neurons,

synapses,

neurotransmitters,

brain regions,

electrical signaling,

blood flow,

hormones,

sensory pathways,

and genetic regulation.

We can observe many of these processes directly or indirectly.

But knowing the components of something isn''t the same as understanding the thing itself.

Knowing every transistor in a computer doesn''t automatically explain why a particular program produces a particular result.

The brain is vastly more complicated.

You can measure electrical activity in a brain.

You can identify patterns associated with attention.

You can observe networks involved in memory.

You can correlate brain activity with perception.

But then comes the difficult question:

Why does any of this feel like something?

Why does red look red?

Why does pain hurt?

Why does music produce emotion?

Why does remembering childhood involve an experience rather than simply information retrieval?

Why is there a subjective point of view at all?

Neuroscience has developed several competing theories of consciousness, including Global Neuronal Workspace, Integrated Information Theory, Recurrent Processing Theory and others. But there is still no universally accepted explanation of how neural activity gives rise to conscious experience.

That is an extraordinary gap.

We can increasingly describe what the brain is doing.

We still struggle to explain why there is an experience of doing it.

We tend to imagine memory as a recording.

Something happens.

The brain stores it.

Later, we retrieve it.

But human memory doesn''t behave like a video archive.

Memories can change.

They can become less precise.

They can become associated with other experiences.

People can confidently remember things that didn''t happen exactly as remembered.

And recalling a memory may itself alter the memory.

This creates a fascinating question:

If remembering something changes it, what exactly is the thing being remembered?

The brain isn''t simply storing the past.

It is continually reconstructing it.

We can test intelligence.

We can measure specific cognitive abilities.

We can study learning.

We can observe decision-making.

We can build artificial systems that perform tasks previously considered signs of intelligence.

But we still don''t have a complete theory of how biological intelligence emerges from neural systems.

We don''t fully understand:

how abstract concepts form,

how generalization works,

how intuition emerges,

why creativity happens,

why humans sometimes make brilliant leaps without consciously knowing how,

or how enormous amounts of sensory information become a coherent model of the world.

The brain doesn''t merely process information.

It appears to build a continuously updated model of reality.

One increasingly influential way of thinking about the brain is that it doesn''t simply wait for information to arrive.

It predicts.

Your brain receives incomplete sensory information and constantly tries to determine:

What am I seeing?

What am I hearing?

What is happening?

What is likely to happen next?

What should I do?

You don''t consciously experience raw sensory data.

You experience the brain''s interpretation of that data.

Which raises another strange possibility:

Your conscious experience may be less like looking at the world and more like the brain constructing a model of the world.

We know sleep is essential.

We know that sleep affects:

memory,

learning,

metabolism,

immune function,

emotional regulation,

and brain health.

But the full purpose and architecture of sleep remains an active area of research.

Why does consciousness have to disappear so dramatically?

Why does the brain remain highly active?

Why do dreams occur?

Why are some dreams vivid and others forgotten almost immediately?

And why does the brain seem to perform important maintenance while the organism is apparently doing nothing?

The brain never really stops.

It changes modes.

Dreaming may be one of the clearest demonstrations of how little we understand subjective experience.

During sleep, the brain can generate:

people,

places,

conversations,

emotions,

memories,

threats,

strange physical laws,

and entire narratives.

Sometimes the dream feels completely real.

Then consciousness returns and the entire world disappears.

What exactly is the brain doing during this process?

There are theories.

There is evidence.

But no simple answer.

Another mistake is to think of the brain as an isolated computer.

It isn''t.

The brain communicates constantly with:

the immune system,

the endocrine system,

the cardiovascular system,

the digestive system,

and the nervous system throughout the body.

Hormones affect cognition.

Inflammation can affect the brain.

Gut signals influence brain function.

Stress changes physiology.

The brain isn''t simply controlling the body.

The two systems continuously influence each other.

Neuroscience has made this question even more complicated.

If decisions arise from physical processes inside the brain, what exactly does it mean to say:

"I chose this"?

Does conscious intention cause action?

Does the brain begin preparing an action before conscious awareness?

Is consciousness making decisions, observing decisions, or participating in a more complicated process?

There are experiments and theories on all sides.

But there is no universally accepted answer.

Think about what we''re asking it to explain.

It must somehow account for:

language,

vision,

emotion,

memory,

identity,

planning,

imagination,

movement,

self-awareness,

social behavior,

creativity,

and subjective experience.

And it does all of this while consuming roughly the energy of a small light bulb.

We can build machines that perform extraordinary calculations.

We still cannot build a machine that reproduces the full flexibility of a human brain.

If we eventually understand how the brain works at a deeper level, the consequences could extend far beyond neuroscience.

Medicine could change.

Mental health treatment could change.

Brain-computer interfaces could change.

Education could change.

Artificial intelligence could change.

Robotics could change.

Our understanding of consciousness itself could change.

And perhaps the biggest question would finally become experimentally approachable:

What exactly is the thing we call "self"?

We''re not there yet.

But the fact that we can even begin asking the question scientifically is remarkable.

The brain isn''t merely another organ.

It is the system through which we experience every other thing we know.

And we still don''t completely understand it.

The next frontier may not be discovering another planet.

It may be understanding the one inside our skull.', 'Analysis from the Omniv Editorial desk.', 'We have mapped neurons. We can record electrical activity. We can watch parts of the brain activate while people see, speak, remember, decide and sleep.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"We have mapped neurons."},{"type":"paragraph","text":"We can record electrical activity."},{"type":"paragraph","text":"We can watch parts of the brain activate while people see, speak, remember, decide and sleep."},{"type":"paragraph","text":"We can manipulate individual circuits in animals."},{"type":"paragraph","text":"We can build increasingly sophisticated computational models."},{"type":"paragraph","text":"And yet, one of the most important objects in the known universe remains profoundly mysterious:"},{"type":"paragraph","text":"the human brain."},{"type":"paragraph","text":"We know an enormous amount about its parts."},{"type":"paragraph","text":"We still don''t fully understand how those parts produce you."},{"type":"paragraph","text":"That distinction is where the mystery begins."},{"type":"heading","text":"We know what the brain is made of","level":2},{"type":"paragraph","text":"The human brain contains roughly 86 billion neurons, alongside enormous networks of supporting cells and an extraordinary web of connections."},{"type":"paragraph","text":"We know about:"},{"type":"paragraph","text":"neurons,"},{"type":"paragraph","text":"synapses,"},{"type":"paragraph","text":"neurotransmitters,"},{"type":"paragraph","text":"brain regions,"},{"type":"paragraph","text":"electrical signaling,"},{"type":"paragraph","text":"blood flow,"},{"type":"paragraph","text":"hormones,"},{"type":"paragraph","text":"sensory pathways,"},{"type":"paragraph","text":"and genetic regulation."},{"type":"paragraph","text":"We can observe many of these processes directly or indirectly."},{"type":"paragraph","text":"But knowing the components of something isn''t the same as understanding the thing itself."},{"type":"paragraph","text":"Knowing every transistor in a computer doesn''t automatically explain why a particular program produces a particular result."},{"type":"paragraph","text":"The brain is vastly more complicated."},{"type":"heading","text":"The biggest mystery may be consciousness","level":2},{"type":"paragraph","text":"You can measure electrical activity in a brain."},{"type":"paragraph","text":"You can identify patterns associated with attention."},{"type":"paragraph","text":"You can observe networks involved in memory."},{"type":"paragraph","text":"You can correlate brain activity with perception."},{"type":"paragraph","text":"But then comes the difficult question:"},{"type":"paragraph","text":"Why does any of this feel like something?"},{"type":"paragraph","text":"Why does red look red?"},{"type":"paragraph","text":"Why does pain hurt?"},{"type":"paragraph","text":"Why does music produce emotion?"},{"type":"paragraph","text":"Why does remembering childhood involve an experience rather than simply information retrieval?"},{"type":"paragraph","text":"Why is there a subjective point of view at all?"},{"type":"paragraph","text":"Neuroscience has developed several competing theories of consciousness, including Global Neuronal Workspace, Integrated Information Theory, Recurrent Processing Theory and others. But there is still no universally accepted explanation of how neural activity gives rise to conscious experience."},{"type":"paragraph","text":"That is an extraordinary gap."},{"type":"paragraph","text":"We can increasingly describe what the brain is doing."},{"type":"paragraph","text":"We still struggle to explain why there is an experience of doing it."},{"type":"heading","text":"Memory is stranger than it looks","level":2},{"type":"paragraph","text":"We tend to imagine memory as a recording."},{"type":"paragraph","text":"Something happens."},{"type":"paragraph","text":"The brain stores it."},{"type":"paragraph","text":"Later, we retrieve it."},{"type":"paragraph","text":"But human memory doesn''t behave like a video archive."},{"type":"paragraph","text":"Memories can change."},{"type":"paragraph","text":"They can become less precise."},{"type":"paragraph","text":"They can become associated with other experiences."},{"type":"paragraph","text":"People can confidently remember things that didn''t happen exactly as remembered."},{"type":"paragraph","text":"And recalling a memory may itself alter the memory."},{"type":"paragraph","text":"This creates a fascinating question:"},{"type":"paragraph","text":"If remembering something changes it, what exactly is the thing being remembered?"},{"type":"paragraph","text":"The brain isn''t simply storing the past."},{"type":"paragraph","text":"It is continually reconstructing it."},{"type":"heading","text":"Then there''s intelligence","level":2},{"type":"paragraph","text":"We can test intelligence."},{"type":"paragraph","text":"We can measure specific cognitive abilities."},{"type":"paragraph","text":"We can study learning."},{"type":"paragraph","text":"We can observe decision-making."},{"type":"paragraph","text":"We can build artificial systems that perform tasks previously considered signs of intelligence."},{"type":"paragraph","text":"But we still don''t have a complete theory of how biological intelligence emerges from neural systems."},{"type":"paragraph","text":"We don''t fully understand:"},{"type":"paragraph","text":"how abstract concepts form,"},{"type":"paragraph","text":"how generalization works,"},{"type":"paragraph","text":"how intuition emerges,"},{"type":"paragraph","text":"why creativity happens,"},{"type":"paragraph","text":"why humans sometimes make brilliant leaps without consciously knowing how,"},{"type":"paragraph","text":"or how enormous amounts of sensory information become a coherent model of the world."},{"type":"paragraph","text":"The brain doesn''t merely process information."},{"type":"paragraph","text":"It appears to build a continuously updated model of reality."},{"type":"heading","text":"Your brain is predicting reality","level":2},{"type":"paragraph","text":"One increasingly influential way of thinking about the brain is that it doesn''t simply wait for information to arrive."},{"type":"paragraph","text":"It predicts."},{"type":"paragraph","text":"Your brain receives incomplete sensory information and constantly tries to determine:"},{"type":"paragraph","text":"What am I seeing?"},{"type":"paragraph","text":"What am I hearing?"},{"type":"paragraph","text":"What is happening?"},{"type":"paragraph","text":"What is likely to happen next?"},{"type":"paragraph","text":"What should I do?"},{"type":"paragraph","text":"You don''t consciously experience raw sensory data."},{"type":"paragraph","text":"You experience the brain''s interpretation of that data."},{"type":"paragraph","text":"Which raises another strange possibility:"},{"type":"paragraph","text":"Your conscious experience may be less like looking at the world and more like the brain constructing a model of the world."},{"type":"heading","text":"Why do we sleep?","level":2},{"type":"paragraph","text":"We know sleep is essential."},{"type":"paragraph","text":"We know that sleep affects:"},{"type":"paragraph","text":"memory,"},{"type":"paragraph","text":"learning,"},{"type":"paragraph","text":"metabolism,"},{"type":"paragraph","text":"immune function,"},{"type":"paragraph","text":"emotional regulation,"},{"type":"paragraph","text":"and brain health."},{"type":"paragraph","text":"But the full purpose and architecture of sleep remains an active area of research."},{"type":"paragraph","text":"Why does consciousness have to disappear so dramatically?"},{"type":"paragraph","text":"Why does the brain remain highly active?"},{"type":"paragraph","text":"Why do dreams occur?"},{"type":"paragraph","text":"Why are some dreams vivid and others forgotten almost immediately?"},{"type":"paragraph","text":"And why does the brain seem to perform important maintenance while the organism is apparently doing nothing?"},{"type":"paragraph","text":"The brain never really stops."},{"type":"paragraph","text":"It changes modes."},{"type":"heading","text":"We don''t fully understand dreams","level":2},{"type":"paragraph","text":"Dreaming may be one of the clearest demonstrations of how little we understand subjective experience."},{"type":"paragraph","text":"During sleep, the brain can generate:"},{"type":"paragraph","text":"people,"},{"type":"paragraph","text":"places,"},{"type":"paragraph","text":"conversations,"},{"type":"paragraph","text":"emotions,"},{"type":"paragraph","text":"memories,"},{"type":"paragraph","text":"threats,"},{"type":"paragraph","text":"strange physical laws,"},{"type":"paragraph","text":"and entire narratives."},{"type":"paragraph","text":"Sometimes the dream feels completely real."},{"type":"paragraph","text":"Then consciousness returns and the entire world disappears."},{"type":"paragraph","text":"What exactly is the brain doing during this process?"},{"type":"paragraph","text":"There are theories."},{"type":"paragraph","text":"There is evidence."},{"type":"paragraph","text":"But no simple answer."},{"type":"heading","text":"The brain is also deeply connected to the body","level":2},{"type":"paragraph","text":"Another mistake is to think of the brain as an isolated computer."},{"type":"paragraph","text":"It isn''t."},{"type":"paragraph","text":"The brain communicates constantly with:"},{"type":"paragraph","text":"the immune system,"},{"type":"paragraph","text":"the endocrine system,"},{"type":"paragraph","text":"the cardiovascular system,"},{"type":"paragraph","text":"the digestive system,"},{"type":"paragraph","text":"and the nervous system throughout the body."},{"type":"paragraph","text":"Hormones affect cognition."},{"type":"paragraph","text":"Inflammation can affect the brain."},{"type":"paragraph","text":"Gut signals influence brain function."},{"type":"paragraph","text":"Stress changes physiology."},{"type":"paragraph","text":"The brain isn''t simply controlling the body."},{"type":"paragraph","text":"The two systems continuously influence each other."},{"type":"heading","text":"And then there is free will","level":2},{"type":"paragraph","text":"Neuroscience has made this question even more complicated."},{"type":"paragraph","text":"If decisions arise from physical processes inside the brain, what exactly does it mean to say:"},{"type":"paragraph","text":"\"I chose this\"?"},{"type":"paragraph","text":"Does conscious intention cause action?"},{"type":"paragraph","text":"Does the brain begin preparing an action before conscious awareness?"},{"type":"paragraph","text":"Is consciousness making decisions, observing decisions, or participating in a more complicated process?"},{"type":"paragraph","text":"There are experiments and theories on all sides."},{"type":"paragraph","text":"But there is no universally accepted answer."},{"type":"heading","text":"The brain may be the hardest engineering problem we''ve ever encountered","level":2},{"type":"paragraph","text":"Think about what we''re asking it to explain."},{"type":"paragraph","text":"It must somehow account for:"},{"type":"paragraph","text":"language,"},{"type":"paragraph","text":"vision,"},{"type":"paragraph","text":"emotion,"},{"type":"paragraph","text":"memory,"},{"type":"paragraph","text":"identity,"},{"type":"paragraph","text":"planning,"},{"type":"paragraph","text":"imagination,"},{"type":"paragraph","text":"movement,"},{"type":"paragraph","text":"self-awareness,"},{"type":"paragraph","text":"social behavior,"},{"type":"paragraph","text":"creativity,"},{"type":"paragraph","text":"and subjective experience."},{"type":"paragraph","text":"And it does all of this while consuming roughly the energy of a small light bulb."},{"type":"paragraph","text":"We can build machines that perform extraordinary calculations."},{"type":"paragraph","text":"We still cannot build a machine that reproduces the full flexibility of a human brain."},{"type":"heading","text":"Understanding the brain could change everything","level":2},{"type":"paragraph","text":"If we eventually understand how the brain works at a deeper level, the consequences could extend far beyond neuroscience."},{"type":"paragraph","text":"Medicine could change."},{"type":"paragraph","text":"Mental health treatment could change."},{"type":"paragraph","text":"Brain-computer interfaces could change."},{"type":"paragraph","text":"Education could change."},{"type":"paragraph","text":"Artificial intelligence could change."},{"type":"paragraph","text":"Robotics could change."},{"type":"paragraph","text":"Our understanding of consciousness itself could change."},{"type":"paragraph","text":"And perhaps the biggest question would finally become experimentally approachable:"},{"type":"paragraph","text":"What exactly is the thing we call \"self\"?"},{"type":"paragraph","text":"We''re not there yet."},{"type":"paragraph","text":"But the fact that we can even begin asking the question scientifically is remarkable."},{"type":"paragraph","text":"The brain isn''t merely another organ."},{"type":"paragraph","text":"It is the system through which we experience every other thing we know."},{"type":"paragraph","text":"And we still don''t completely understand it."},{"type":"paragraph","text":"The next frontier may not be discovering another planet."},{"type":"paragraph","text":"It may be understanding the one inside our skull."}]'::jsonb, 'TECHNOLOGY', 5, 'published', 'What We Still Don''t Understand About the Brain | Omniv Editorial', 'We have mapped neurons. We can record electrical activity. We can watch parts of the brain activate while people see, speak, remember, decide and sleep.', 'https://omniv.media/p/what-we-still-dont-understand-about-the-brain', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"biology","label":"Biology"},{"type":"project","slug":"space","label":"Space"},{"type":"project","slug":"brain-science","label":"Brain Science"}]'::jsonb, '{}'::text[], '{technology,artificial-intelligence,data-centres,biology,space,brain-science}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-race-to-understand-aging', 'The Race to Understand Aging', 'For most of human history, aging was treated as something that simply happened. You were born. You grew.', 'For most of human history, aging was treated as something that simply happened.

You were born.

You grew.

You became an adult.

Your body gradually deteriorated.

Eventually, it failed.

There was little reason to think of aging itself as a biological process that could be studied, measured and potentially modified.

That is changing.

Scientists increasingly study aging not simply as the passage of time, but as a complex collection of biological processes.

And that creates a radically different question:

What if aging isn''t one thing?

There isn''t one "aging gene."

There isn''t one molecule responsible for getting old.

Aging involves interconnected changes across cells, tissues and organs.

Researchers study processes involving:

genomic instability,

epigenetic changes,

mitochondrial dysfunction,

cellular senescence,

loss of proteostasis,

stem-cell exhaustion,

chronic inflammation,

and changes in intercellular communication.

The "hallmarks of aging" framework has become one of the major ways researchers organize these mechanisms, although scientists continue to debate how these processes should be grouped and how causally fundamental each one is.

The important insight is that aging appears to be biologically structured.

And what is structured can potentially be manipulated.

This distinction matters.

Longevity science isn''t simply about making people live forever.

A much more immediate objective is:

extend the years people remain healthy and functional.

Imagine two lives.

Person A lives to 90 but experiences decades of severe disease and disability.

Person B lives to 90 while maintaining good physical and cognitive function much longer.

The second outcome is dramatically different.

This is why researchers increasingly focus on healthspan, not simply lifespan.

People don''t age at identical rates.

Some develop age-related diseases relatively early.

Others remain remarkably healthy into old age.

There are people who reach their 90s or 100s while retaining unusual levels of function.

Scientists are studying what makes these trajectories different.

Genetics matters.

Environment matters.

Lifestyle matters.

Cellular biology matters.

And the interactions between them may matter even more.

Recent research continues to investigate genetic and molecular signatures associated with unusually healthy or accelerated aging, while emphasizing that translating these findings into effective human interventions remains difficult.

Imagine meeting someone who is 105 years old.

You might assume they simply won the genetic lottery.

But researchers want to know:

What exactly is different?

Do their cells repair damage more effectively?

Do they maintain better immune function?

Are their inflammatory responses different?

Do they have unusual genetic variants?

Do their organs deteriorate more slowly?

Could some of these mechanisms be reproduced in other people?

That''s where longevity research becomes fascinating.

The goal isn''t merely to understand extraordinary people.

It''s to understand why extraordinary longevity happens at all.

Chronological age is easy.

You were born on a certain date.

But your cells don''t know what date is written on your birth certificate.

Two 50-year-olds can have very different biological states.

Researchers therefore investigate biomarkers and molecular signatures that might provide estimates of biological aging.

These include patterns involving:

DNA methylation,

gene expression,

proteins,

metabolism,

inflammation,

and other physiological measures.

But the field is still working out what these measurements truly mean and how reliably they predict meaningful outcomes for individuals.

A number saying you''re "biologically 43" is interesting.

The harder question is:

What should you do with that information?

Understanding aging is one thing.

Changing it safely is another.

Scientists can manipulate biological pathways in cells and laboratory animals.

But humans are complicated.

A pathway that looks beneficial in one context may have unexpected consequences elsewhere.

An intervention that extends lifespan could potentially increase other risks.

And a treatment that changes one aging mechanism may not address the others.

This is why longevity science remains much more difficult than social media often makes it appear.

Imagine trying to repair an old city.

You replace the roads.

But the electrical system is deteriorating.

You repair the electricity.

But the water system is failing.

You fix the water.

But the buildings are structurally compromised.

The human body is similar.

Changing one component of aging doesn''t necessarily restore the entire system.

Aging is interconnected.

That''s the challenge.

We now have tools previous generations didn''t possess.

We can:

sequence genomes,

edit genes,

measure gene expression,

engineer cells,

analyze enormous biological datasets,

model molecular interactions,

and increasingly use AI to identify patterns that humans struggle to see.

That doesn''t mean we have solved aging.

It means we can investigate it at a level of detail that was previously impossible.

It''s to understand why biological systems lose resilience.

Why does repair become less effective?

Why do cells become dysfunctional?

Why does inflammation increase?

Why do tissues lose regenerative capacity?

Why does the immune system change?

Why does the same damage that a young body can tolerate become catastrophic later?

Answer those questions and longevity becomes less mysterious.

Imagine if medicine could increasingly shift from:

treating diseases one by one

toward:

maintaining the biological systems that resist disease in the first place.

That would be a major conceptual shift.

Instead of asking:

"How do we treat Alzheimer''s?"

or

"How do we treat cardiovascular disease?"

we could increasingly ask:

"Why does the body''s resilience against these failures decline with age?"

That is a much deeper question.

Despite enormous progress, much of longevity science remains preclinical or early-stage.

Researchers are still trying to determine which interventions genuinely translate into meaningful benefits for humans.

The gap between:

interesting biological mechanism

and

safe, effective human therapy

can be enormous.

That''s why extraordinary claims about reversing aging should be treated carefully.

The science is exciting precisely because there is so much left to discover.

For centuries, humans mostly asked:

"How long can humans live?"

The emerging scientific question is different:

"Why does the body deteriorate in the first place?"

If we can answer that, we may not need to "defeat aging" in the dramatic sense.

We may simply become much better at maintaining biological function.

And if that happens, one of medicine''s biggest achievements may not be adding decades to the end of life.

It may be moving health, strength and independence further toward the end of it.', 'Analysis from the Omniv Editorial desk.', 'For most of human history, aging was treated as something that simply happened. You were born. You grew.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"For most of human history, aging was treated as something that simply happened."},{"type":"paragraph","text":"You were born."},{"type":"paragraph","text":"You grew."},{"type":"paragraph","text":"You became an adult."},{"type":"paragraph","text":"Your body gradually deteriorated."},{"type":"paragraph","text":"Eventually, it failed."},{"type":"paragraph","text":"There was little reason to think of aging itself as a biological process that could be studied, measured and potentially modified."},{"type":"paragraph","text":"That is changing."},{"type":"paragraph","text":"Scientists increasingly study aging not simply as the passage of time, but as a complex collection of biological processes."},{"type":"paragraph","text":"And that creates a radically different question:"},{"type":"paragraph","text":"What if aging isn''t one thing?"},{"type":"heading","text":"Aging isn''t a single switch","level":2},{"type":"paragraph","text":"There isn''t one \"aging gene.\""},{"type":"paragraph","text":"There isn''t one molecule responsible for getting old."},{"type":"paragraph","text":"Aging involves interconnected changes across cells, tissues and organs."},{"type":"paragraph","text":"Researchers study processes involving:"},{"type":"paragraph","text":"genomic instability,"},{"type":"paragraph","text":"epigenetic changes,"},{"type":"paragraph","text":"mitochondrial dysfunction,"},{"type":"paragraph","text":"cellular senescence,"},{"type":"paragraph","text":"loss of proteostasis,"},{"type":"paragraph","text":"stem-cell exhaustion,"},{"type":"paragraph","text":"chronic inflammation,"},{"type":"paragraph","text":"and changes in intercellular communication."},{"type":"paragraph","text":"The \"hallmarks of aging\" framework has become one of the major ways researchers organize these mechanisms, although scientists continue to debate how these processes should be grouped and how causally fundamental each one is."},{"type":"paragraph","text":"The important insight is that aging appears to be biologically structured."},{"type":"paragraph","text":"And what is structured can potentially be manipulated."},{"type":"heading","text":"But slowing aging is not the same as immortality","level":2},{"type":"paragraph","text":"This distinction matters."},{"type":"paragraph","text":"Longevity science isn''t simply about making people live forever."},{"type":"paragraph","text":"A much more immediate objective is:"},{"type":"paragraph","text":"extend the years people remain healthy and functional."},{"type":"paragraph","text":"Imagine two lives."},{"type":"paragraph","text":"Person A lives to 90 but experiences decades of severe disease and disability."},{"type":"paragraph","text":"Person B lives to 90 while maintaining good physical and cognitive function much longer."},{"type":"paragraph","text":"The second outcome is dramatically different."},{"type":"paragraph","text":"This is why researchers increasingly focus on healthspan, not simply lifespan."},{"type":"heading","text":"Why do some people age differently?","level":2},{"type":"paragraph","text":"People don''t age at identical rates."},{"type":"paragraph","text":"Some develop age-related diseases relatively early."},{"type":"paragraph","text":"Others remain remarkably healthy into old age."},{"type":"paragraph","text":"There are people who reach their 90s or 100s while retaining unusual levels of function."},{"type":"paragraph","text":"Scientists are studying what makes these trajectories different."},{"type":"paragraph","text":"Genetics matters."},{"type":"paragraph","text":"Environment matters."},{"type":"paragraph","text":"Lifestyle matters."},{"type":"paragraph","text":"Cellular biology matters."},{"type":"paragraph","text":"And the interactions between them may matter even more."},{"type":"paragraph","text":"Recent research continues to investigate genetic and molecular signatures associated with unusually healthy or accelerated aging, while emphasizing that translating these findings into effective human interventions remains difficult."},{"type":"heading","text":"The centenarian mystery","level":2},{"type":"paragraph","text":"Imagine meeting someone who is 105 years old."},{"type":"paragraph","text":"You might assume they simply won the genetic lottery."},{"type":"paragraph","text":"But researchers want to know:"},{"type":"paragraph","text":"What exactly is different?"},{"type":"paragraph","text":"Do their cells repair damage more effectively?"},{"type":"paragraph","text":"Do they maintain better immune function?"},{"type":"paragraph","text":"Are their inflammatory responses different?"},{"type":"paragraph","text":"Do they have unusual genetic variants?"},{"type":"paragraph","text":"Do their organs deteriorate more slowly?"},{"type":"paragraph","text":"Could some of these mechanisms be reproduced in other people?"},{"type":"paragraph","text":"That''s where longevity research becomes fascinating."},{"type":"paragraph","text":"The goal isn''t merely to understand extraordinary people."},{"type":"paragraph","text":"It''s to understand why extraordinary longevity happens at all."},{"type":"heading","text":"The problem with biological age","level":2},{"type":"paragraph","text":"Chronological age is easy."},{"type":"paragraph","text":"You were born on a certain date."},{"type":"paragraph","text":"But your cells don''t know what date is written on your birth certificate."},{"type":"paragraph","text":"Two 50-year-olds can have very different biological states."},{"type":"paragraph","text":"Researchers therefore investigate biomarkers and molecular signatures that might provide estimates of biological aging."},{"type":"paragraph","text":"These include patterns involving:"},{"type":"paragraph","text":"DNA methylation,"},{"type":"paragraph","text":"gene expression,"},{"type":"paragraph","text":"proteins,"},{"type":"paragraph","text":"metabolism,"},{"type":"paragraph","text":"inflammation,"},{"type":"paragraph","text":"and other physiological measures."},{"type":"paragraph","text":"But the field is still working out what these measurements truly mean and how reliably they predict meaningful outcomes for individuals."},{"type":"paragraph","text":"A number saying you''re \"biologically 43\" is interesting."},{"type":"paragraph","text":"The harder question is:"},{"type":"paragraph","text":"What should you do with that information?"},{"type":"heading","text":"The intervention problem","level":2},{"type":"paragraph","text":"Understanding aging is one thing."},{"type":"paragraph","text":"Changing it safely is another."},{"type":"paragraph","text":"Scientists can manipulate biological pathways in cells and laboratory animals."},{"type":"paragraph","text":"But humans are complicated."},{"type":"paragraph","text":"A pathway that looks beneficial in one context may have unexpected consequences elsewhere."},{"type":"paragraph","text":"An intervention that extends lifespan could potentially increase other risks."},{"type":"paragraph","text":"And a treatment that changes one aging mechanism may not address the others."},{"type":"paragraph","text":"This is why longevity science remains much more difficult than social media often makes it appear."},{"type":"heading","text":"The ultimate challenge: the whole system","level":2},{"type":"paragraph","text":"Imagine trying to repair an old city."},{"type":"paragraph","text":"You replace the roads."},{"type":"paragraph","text":"But the electrical system is deteriorating."},{"type":"paragraph","text":"You repair the electricity."},{"type":"paragraph","text":"But the water system is failing."},{"type":"paragraph","text":"You fix the water."},{"type":"paragraph","text":"But the buildings are structurally compromised."},{"type":"paragraph","text":"The human body is similar."},{"type":"paragraph","text":"Changing one component of aging doesn''t necessarily restore the entire system."},{"type":"paragraph","text":"Aging is interconnected."},{"type":"paragraph","text":"That''s the challenge."},{"type":"heading","text":"But something profound has changed","level":2},{"type":"paragraph","text":"We now have tools previous generations didn''t possess."},{"type":"paragraph","text":"We can:"},{"type":"paragraph","text":"sequence genomes,"},{"type":"paragraph","text":"edit genes,"},{"type":"paragraph","text":"measure gene expression,"},{"type":"paragraph","text":"engineer cells,"},{"type":"paragraph","text":"analyze enormous biological datasets,"},{"type":"paragraph","text":"model molecular interactions,"},{"type":"paragraph","text":"and increasingly use AI to identify patterns that humans struggle to see."},{"type":"paragraph","text":"That doesn''t mean we have solved aging."},{"type":"paragraph","text":"It means we can investigate it at a level of detail that was previously impossible."},{"type":"heading","text":"The real race isn''t simply to live longer","level":2},{"type":"paragraph","text":"It''s to understand why biological systems lose resilience."},{"type":"paragraph","text":"Why does repair become less effective?"},{"type":"paragraph","text":"Why do cells become dysfunctional?"},{"type":"paragraph","text":"Why does inflammation increase?"},{"type":"paragraph","text":"Why do tissues lose regenerative capacity?"},{"type":"paragraph","text":"Why does the immune system change?"},{"type":"paragraph","text":"Why does the same damage that a young body can tolerate become catastrophic later?"},{"type":"paragraph","text":"Answer those questions and longevity becomes less mysterious."},{"type":"heading","text":"The biggest prize may be resilience","level":2},{"type":"paragraph","text":"Imagine if medicine could increasingly shift from:"},{"type":"paragraph","text":"treating diseases one by one"},{"type":"paragraph","text":"toward:"},{"type":"paragraph","text":"maintaining the biological systems that resist disease in the first place."},{"type":"paragraph","text":"That would be a major conceptual shift."},{"type":"paragraph","text":"Instead of asking:"},{"type":"paragraph","text":"\"How do we treat Alzheimer''s?\""},{"type":"paragraph","text":"or"},{"type":"paragraph","text":"\"How do we treat cardiovascular disease?\""},{"type":"paragraph","text":"we could increasingly ask:"},{"type":"paragraph","text":"\"Why does the body''s resilience against these failures decline with age?\""},{"type":"paragraph","text":"That is a much deeper question."},{"type":"heading","text":"We''re still early","level":2},{"type":"paragraph","text":"Despite enormous progress, much of longevity science remains preclinical or early-stage."},{"type":"paragraph","text":"Researchers are still trying to determine which interventions genuinely translate into meaningful benefits for humans."},{"type":"paragraph","text":"The gap between:"},{"type":"paragraph","text":"interesting biological mechanism"},{"type":"paragraph","text":"and"},{"type":"paragraph","text":"safe, effective human therapy"},{"type":"paragraph","text":"can be enormous."},{"type":"paragraph","text":"That''s why extraordinary claims about reversing aging should be treated carefully."},{"type":"paragraph","text":"The science is exciting precisely because there is so much left to discover."},{"type":"heading","text":"The question that changes everything","level":2},{"type":"paragraph","text":"For centuries, humans mostly asked:"},{"type":"paragraph","text":"\"How long can humans live?\""},{"type":"paragraph","text":"The emerging scientific question is different:"},{"type":"paragraph","text":"\"Why does the body deteriorate in the first place?\""},{"type":"paragraph","text":"If we can answer that, we may not need to \"defeat aging\" in the dramatic sense."},{"type":"paragraph","text":"We may simply become much better at maintaining biological function."},{"type":"paragraph","text":"And if that happens, one of medicine''s biggest achievements may not be adding decades to the end of life."},{"type":"paragraph","text":"It may be moving health, strength and independence further toward the end of it."}]'::jsonb, 'EXPLAINED', 5, 'published', 'The Race to Understand Aging | Omniv Editorial', 'For most of human history, aging was treated as something that simply happened. You were born. You grew.', 'https://omniv.media/p/the-race-to-understand-aging', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"biology","label":"Biology"}]'::jsonb, '{}'::text[], '{explained,artificial-intelligence,infrastructure,biology}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'why-quantum-computing-is-so-difficult', 'Why Quantum Computing Is So Difficult', 'Quantum computing is often described as if someone simply discovered a faster kind of computer. That''s not really what happened. A quantum computer isn''t a normal computer with better processors.', 'Quantum computing is often described as if someone simply discovered a faster kind of computer.

That''s not really what happened.

A quantum computer isn''t a normal computer with better processors.

It operates according to a fundamentally different physical framework.

And that difference is exactly what makes it so difficult to build.

A classical computer uses bits.

A bit can represent:

0

or

1.

Quantum computers use qubits.

A qubit can exist in a quantum state that combines possible outcomes through superposition.

Quantum systems can also become entangled, creating correlations that have no straightforward classical equivalent.

This creates computational possibilities that are fundamentally different from ordinary digital logic.

But there is a catch.

Quantum information is extraordinarily fragile.

A quantum computer needs to manipulate delicate physical states.

Those states can be disturbed by:

heat,

electromagnetic noise,

vibrations,

material imperfections,

control errors,

and interactions with the environment.

This loss of quantum coherence is one of the central challenges.

A classical bit can tolerate a certain amount of physical imperfection.

A quantum state can be much more fragile.

Here''s the problem.

Adding more qubits sounds like progress.

But adding qubits also creates more opportunities for errors.

You don''t just need:

more qubits.

You need:

more reliable qubits,

more precise control,

better connections,

better measurement,

better error correction,

and a system capable of coordinating all of it.

Researchers therefore aren''t simply trying to build the biggest quantum computer.

They''re trying to build one that can actually perform useful computation reliably.

Classical computers can use redundancy to protect information.

Quantum error correction is much harder.

The quantum information you''re trying to protect cannot simply be copied in the ordinary classical sense.

Instead, researchers encode logical information across multiple physical qubits.

The idea is to make a collection of imperfect physical qubits behave like a much more reliable logical qubit.

But this requires significant overhead.

You may need many physical qubits to create one high-quality logical qubit.

That makes the engineering challenge enormous.

Current research continues to focus heavily on scaling, qubit control and readout, entanglement and fault-tolerant error correction.

This is one of the biggest misunderstandings.

Imagine someone announces:

"We built a machine with 10,000 qubits."

That sounds impressive.

But the important questions are:

How noisy are they?

How long do they maintain coherence?

How accurately can they be controlled?

How many logical qubits can be produced?

What useful algorithms can run?

How much error correction is required?

How much classical infrastructure is needed?

A smaller machine with higher-quality logical qubits could ultimately be more useful than a much larger noisy system.

Another misconception.

Quantum computing isn''t expected to make your laptop obsolete.

For most everyday tasks, classical computers are extraordinarily effective.

Quantum computers are interesting because certain classes of problems may benefit from quantum algorithms.

Potential areas include:

cryptography,

chemistry,

materials science,

optimization,

simulation,

and some machine-learning applications.

But even in those areas, useful quantum advantage requires the right combination of hardware, algorithms and error correction.

One of the most compelling applications is simulating quantum systems.

Nature itself is quantum.

Molecules are quantum.

Chemical reactions are quantum.

Materials behave according to quantum mechanics.

Classical computers can simulate these systems, but the computational cost can become extremely difficult as complexity increases.

A quantum computer could potentially represent certain quantum systems more naturally.

That could matter enormously for:

drug discovery,

materials,

energy,

catalysts,

and chemistry.

This is where quantum computing headlines can become misleading.

Potential doesn''t equal commercial reality.

Researchers still need to demonstrate:

useful problems,

reliable algorithms,

sufficient scale,

economic advantage,

and practical integration.

That is why the field can simultaneously be:

scientifically extraordinary

and

commercially immature.

There isn''t one obvious path to quantum computing.

Researchers are exploring different physical approaches, including:

superconducting qubits,

trapped ions,

neutral atoms,

photonic systems,

and other architectures.

Each has different advantages and engineering problems.

The industry hasn''t settled the question:

Which architecture ultimately wins?

That uncertainty is part of what makes the field fascinating.

The popular image is:

quantum computer = chip.

The actual system can be much larger.

You need:

control electronics,

cooling or specialized environments,

lasers or microwave systems depending on architecture,

measurement infrastructure,

software,

classical computation,

error-correction systems,

and increasingly sophisticated fabrication.

So the quantum industry may eventually resemble other advanced computing industries.

The processor is only one layer.

A classical computer can hide a tremendous amount of physical complexity behind a simple abstraction.

Quantum computing is still struggling to create that abstraction.

The dream is:

logical qubits that behave reliably regardless of the messy physical system underneath.

Once that happens, developers shouldn''t need to think constantly about microscopic noise.

But getting there is the challenge.

If useful fault-tolerant quantum computing arrives, the consequences could extend far beyond the quantum-computing industry.

It could affect:

pharmaceuticals,

materials,

defense,

finance,

energy,

cybersecurity,

chemistry,

and national security.

That explains why governments and major technology companies continue investing despite the technical uncertainty.

The prize isn''t simply a faster computer.

It is potentially a new computational capability.

Quantum computing isn''t a normal startup cycle.

It requires:

fundamental physics,

advanced engineering,

specialized manufacturing,

new algorithms,

software ecosystems,

and enormous amounts of experimentation.

The industry is trying to cross multiple technological barriers simultaneously.

That''s why progress can appear slow.

Then suddenly, a breakthrough in one layer can change what is possible in another.

A better question is:

Who can build reliable logical quantum computing at useful scale?

That is a much harder race.

And the winner may not be the company with the largest headline number.

It may be the company that solves the least glamorous problem:

error.', 'Analysis from the Omniv Editorial desk.', 'Quantum computing is often described as if someone simply discovered a faster kind of computer. That''s not really what happened. A quantum computer isn''t a normal computer with better processors.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"Quantum computing is often described as if someone simply discovered a faster kind of computer."},{"type":"paragraph","text":"That''s not really what happened."},{"type":"paragraph","text":"A quantum computer isn''t a normal computer with better processors."},{"type":"paragraph","text":"It operates according to a fundamentally different physical framework."},{"type":"paragraph","text":"And that difference is exactly what makes it so difficult to build."},{"type":"heading","text":"The basic idea sounds deceptively simple","level":2},{"type":"paragraph","text":"A classical computer uses bits."},{"type":"paragraph","text":"A bit can represent:"},{"type":"paragraph","text":"0"},{"type":"paragraph","text":"or"},{"type":"paragraph","text":"1."},{"type":"paragraph","text":"Quantum computers use qubits."},{"type":"paragraph","text":"A qubit can exist in a quantum state that combines possible outcomes through superposition."},{"type":"paragraph","text":"Quantum systems can also become entangled, creating correlations that have no straightforward classical equivalent."},{"type":"paragraph","text":"This creates computational possibilities that are fundamentally different from ordinary digital logic."},{"type":"paragraph","text":"But there is a catch."},{"type":"paragraph","text":"Quantum information is extraordinarily fragile."},{"type":"heading","text":"The environment is the enemy","level":2},{"type":"paragraph","text":"A quantum computer needs to manipulate delicate physical states."},{"type":"paragraph","text":"Those states can be disturbed by:"},{"type":"paragraph","text":"heat,"},{"type":"paragraph","text":"electromagnetic noise,"},{"type":"paragraph","text":"vibrations,"},{"type":"paragraph","text":"material imperfections,"},{"type":"paragraph","text":"control errors,"},{"type":"paragraph","text":"and interactions with the environment."},{"type":"paragraph","text":"This loss of quantum coherence is one of the central challenges."},{"type":"paragraph","text":"A classical bit can tolerate a certain amount of physical imperfection."},{"type":"paragraph","text":"A quantum state can be much more fragile."},{"type":"heading","text":"The paradox of scaling","level":2},{"type":"paragraph","text":"Here''s the problem."},{"type":"paragraph","text":"Adding more qubits sounds like progress."},{"type":"paragraph","text":"But adding qubits also creates more opportunities for errors."},{"type":"paragraph","text":"You don''t just need:"},{"type":"paragraph","text":"more qubits."},{"type":"paragraph","text":"You need:"},{"type":"paragraph","text":"more reliable qubits,"},{"type":"paragraph","text":"more precise control,"},{"type":"paragraph","text":"better connections,"},{"type":"paragraph","text":"better measurement,"},{"type":"paragraph","text":"better error correction,"},{"type":"paragraph","text":"and a system capable of coordinating all of it."},{"type":"paragraph","text":"Researchers therefore aren''t simply trying to build the biggest quantum computer."},{"type":"paragraph","text":"They''re trying to build one that can actually perform useful computation reliably."},{"type":"heading","text":"Error correction is the monster","level":2},{"type":"paragraph","text":"Classical computers can use redundancy to protect information."},{"type":"paragraph","text":"Quantum error correction is much harder."},{"type":"paragraph","text":"The quantum information you''re trying to protect cannot simply be copied in the ordinary classical sense."},{"type":"paragraph","text":"Instead, researchers encode logical information across multiple physical qubits."},{"type":"paragraph","text":"The idea is to make a collection of imperfect physical qubits behave like a much more reliable logical qubit."},{"type":"paragraph","text":"But this requires significant overhead."},{"type":"paragraph","text":"You may need many physical qubits to create one high-quality logical qubit."},{"type":"paragraph","text":"That makes the engineering challenge enormous."},{"type":"paragraph","text":"Current research continues to focus heavily on scaling, qubit control and readout, entanglement and fault-tolerant error correction."},{"type":"heading","text":"More qubits doesn''t automatically mean a better computer","level":2},{"type":"paragraph","text":"This is one of the biggest misunderstandings."},{"type":"paragraph","text":"Imagine someone announces:"},{"type":"paragraph","text":"\"We built a machine with 10,000 qubits.\""},{"type":"paragraph","text":"That sounds impressive."},{"type":"paragraph","text":"But the important questions are:"},{"type":"paragraph","text":"How noisy are they?"},{"type":"paragraph","text":"How long do they maintain coherence?"},{"type":"paragraph","text":"How accurately can they be controlled?"},{"type":"paragraph","text":"How many logical qubits can be produced?"},{"type":"paragraph","text":"What useful algorithms can run?"},{"type":"paragraph","text":"How much error correction is required?"},{"type":"paragraph","text":"How much classical infrastructure is needed?"},{"type":"paragraph","text":"A smaller machine with higher-quality logical qubits could ultimately be more useful than a much larger noisy system."},{"type":"heading","text":"Quantum computers won''t replace ordinary computers","level":2},{"type":"paragraph","text":"Another misconception."},{"type":"paragraph","text":"Quantum computing isn''t expected to make your laptop obsolete."},{"type":"paragraph","text":"For most everyday tasks, classical computers are extraordinarily effective."},{"type":"paragraph","text":"Quantum computers are interesting because certain classes of problems may benefit from quantum algorithms."},{"type":"paragraph","text":"Potential areas include:"},{"type":"paragraph","text":"cryptography,"},{"type":"paragraph","text":"chemistry,"},{"type":"paragraph","text":"materials science,"},{"type":"paragraph","text":"optimization,"},{"type":"paragraph","text":"simulation,"},{"type":"paragraph","text":"and some machine-learning applications."},{"type":"paragraph","text":"But even in those areas, useful quantum advantage requires the right combination of hardware, algorithms and error correction."},{"type":"heading","text":"The real prize is simulation","level":2},{"type":"paragraph","text":"One of the most compelling applications is simulating quantum systems."},{"type":"paragraph","text":"Nature itself is quantum."},{"type":"paragraph","text":"Molecules are quantum."},{"type":"paragraph","text":"Chemical reactions are quantum."},{"type":"paragraph","text":"Materials behave according to quantum mechanics."},{"type":"paragraph","text":"Classical computers can simulate these systems, but the computational cost can become extremely difficult as complexity increases."},{"type":"paragraph","text":"A quantum computer could potentially represent certain quantum systems more naturally."},{"type":"paragraph","text":"That could matter enormously for:"},{"type":"paragraph","text":"drug discovery,"},{"type":"paragraph","text":"materials,"},{"type":"paragraph","text":"energy,"},{"type":"paragraph","text":"catalysts,"},{"type":"paragraph","text":"and chemistry."},{"type":"heading","text":"But \"could\" is doing a lot of work","level":2},{"type":"paragraph","text":"This is where quantum computing headlines can become misleading."},{"type":"paragraph","text":"Potential doesn''t equal commercial reality."},{"type":"paragraph","text":"Researchers still need to demonstrate:"},{"type":"paragraph","text":"useful problems,"},{"type":"paragraph","text":"reliable algorithms,"},{"type":"paragraph","text":"sufficient scale,"},{"type":"paragraph","text":"economic advantage,"},{"type":"paragraph","text":"and practical integration."},{"type":"paragraph","text":"That is why the field can simultaneously be:"},{"type":"paragraph","text":"scientifically extraordinary"},{"type":"paragraph","text":"and"},{"type":"paragraph","text":"commercially immature."},{"type":"heading","text":"The hardware race is fragmented","level":2},{"type":"paragraph","text":"There isn''t one obvious path to quantum computing."},{"type":"paragraph","text":"Researchers are exploring different physical approaches, including:"},{"type":"paragraph","text":"superconducting qubits,"},{"type":"paragraph","text":"trapped ions,"},{"type":"paragraph","text":"neutral atoms,"},{"type":"paragraph","text":"photonic systems,"},{"type":"paragraph","text":"and other architectures."},{"type":"paragraph","text":"Each has different advantages and engineering problems."},{"type":"paragraph","text":"The industry hasn''t settled the question:"},{"type":"paragraph","text":"Which architecture ultimately wins?"},{"type":"paragraph","text":"That uncertainty is part of what makes the field fascinating."},{"type":"heading","text":"Quantum computing is an infrastructure problem","level":2},{"type":"paragraph","text":"The popular image is:"},{"type":"paragraph","text":"quantum computer = chip."},{"type":"paragraph","text":"The actual system can be much larger."},{"type":"paragraph","text":"You need:"},{"type":"paragraph","text":"control electronics,"},{"type":"paragraph","text":"cooling or specialized environments,"},{"type":"paragraph","text":"lasers or microwave systems depending on architecture,"},{"type":"paragraph","text":"measurement infrastructure,"},{"type":"paragraph","text":"software,"},{"type":"paragraph","text":"classical computation,"},{"type":"paragraph","text":"error-correction systems,"},{"type":"paragraph","text":"and increasingly sophisticated fabrication."},{"type":"paragraph","text":"So the quantum industry may eventually resemble other advanced computing industries."},{"type":"paragraph","text":"The processor is only one layer."},{"type":"heading","text":"The deeper problem","level":2},{"type":"paragraph","text":"A classical computer can hide a tremendous amount of physical complexity behind a simple abstraction."},{"type":"paragraph","text":"Quantum computing is still struggling to create that abstraction."},{"type":"paragraph","text":"The dream is:"},{"type":"paragraph","text":"logical qubits that behave reliably regardless of the messy physical system underneath."},{"type":"paragraph","text":"Once that happens, developers shouldn''t need to think constantly about microscopic noise."},{"type":"paragraph","text":"But getting there is the challenge."},{"type":"heading","text":"Why investors should care","level":2},{"type":"paragraph","text":"If useful fault-tolerant quantum computing arrives, the consequences could extend far beyond the quantum-computing industry."},{"type":"paragraph","text":"It could affect:"},{"type":"paragraph","text":"pharmaceuticals,"},{"type":"paragraph","text":"materials,"},{"type":"paragraph","text":"defense,"},{"type":"paragraph","text":"finance,"},{"type":"paragraph","text":"energy,"},{"type":"paragraph","text":"cybersecurity,"},{"type":"paragraph","text":"chemistry,"},{"type":"paragraph","text":"and national security."},{"type":"paragraph","text":"That explains why governments and major technology companies continue investing despite the technical uncertainty."},{"type":"paragraph","text":"The prize isn''t simply a faster computer."},{"type":"paragraph","text":"It is potentially a new computational capability."},{"type":"heading","text":"But the race is long","level":2},{"type":"paragraph","text":"Quantum computing isn''t a normal startup cycle."},{"type":"paragraph","text":"It requires:"},{"type":"paragraph","text":"fundamental physics,"},{"type":"paragraph","text":"advanced engineering,"},{"type":"paragraph","text":"specialized manufacturing,"},{"type":"paragraph","text":"new algorithms,"},{"type":"paragraph","text":"software ecosystems,"},{"type":"paragraph","text":"and enormous amounts of experimentation."},{"type":"paragraph","text":"The industry is trying to cross multiple technological barriers simultaneously."},{"type":"paragraph","text":"That''s why progress can appear slow."},{"type":"paragraph","text":"Then suddenly, a breakthrough in one layer can change what is possible in another."},{"type":"heading","text":"The question isn''t \"Who has the most qubits?\"","level":2},{"type":"paragraph","text":"A better question is:"},{"type":"paragraph","text":"Who can build reliable logical quantum computing at useful scale?"},{"type":"paragraph","text":"That is a much harder race."},{"type":"paragraph","text":"And the winner may not be the company with the largest headline number."},{"type":"paragraph","text":"It may be the company that solves the least glamorous problem:"},{"type":"paragraph","text":"error."}]'::jsonb, 'WORLD', 5, 'published', 'Why Quantum Computing Is So Difficult | Omniv Editorial', 'Quantum computing is often described as if someone simply discovered a faster kind of computer. That''s not really what happened. A quantum computer isn''t a normal computer with better processors.', 'https://omniv.media/p/why-quantum-computing-is-so-difficult', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"quantum-computing","label":"Quantum Computing"}]'::jsonb, '{}'::text[], '{world,russia,artificial-intelligence,data-centres,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'what-happens-when-biology-becomes-programmable', 'What Happens When Biology Becomes Programmable?', 'For most of human history, biology was something we could observe. We could breed plants. We could selectively breed animals.', 'For most of human history, biology was something we could observe.

We could breed plants.

We could selectively breed animals.

We could treat diseases.

We could manipulate organisms indirectly.

But we couldn''t reliably write biological instructions and expect living systems to execute them.

That is changing.

Synthetic biology is pushing toward a world in which biological systems can increasingly be designed, engineered and programmed.

And that could be one of the most consequential technological shifts of the century.

Computer engineering works because engineers can define instructions.

Build a circuit.

Write code.

Run the system.

Biology is far messier.

A cell isn''t a computer assembled from perfectly understood components.

It''s an evolved system containing enormous interactions.

Yet scientists are increasingly learning how to manipulate:

DNA,

RNA,

proteins,

gene regulation,

cell signaling,

and cellular behavior.

Synthetic biology now includes efforts to design biological parts, circuits and even genomes.

The goal is not merely to understand life.

It''s to make life do things we specify.

A cell already performs extraordinary computation.

It receives signals.

It detects environmental conditions.

It changes gene expression.

It produces molecules.

It responds to threats.

It divides.

It communicates with neighboring cells.

It makes decisions.

Scientists are increasingly trying to introduce additional instructions into these systems.

For example:

If this disease marker appears → activate this response.

If this chemical is present → produce this molecule.

If this cell becomes cancerous → trigger a therapeutic mechanism.

That is programming.

Just not in Python.

One of the most exciting areas is engineered cell therapy.

Instead of delivering a conventional drug that affects the body broadly, researchers can potentially engineer cells to respond to specific biological conditions.

Recent research describes programmable cell therapies designed to sense disease-associated signals and respond by releasing therapeutic molecules or attacking specific targets.

Imagine a living therapeutic system that can:

sense,

decide,

respond,

and adapt.

That''s very different from a traditional pill.

This is where synthetic biology becomes particularly powerful.

Suppose a therapeutic cell is designed with logic-like rules:

IF

cancer marker A is present

AND

marker B is present

AND NOT

healthy-cell marker C

THEN

activate therapeutic response.

Biologists are developing molecular circuits that increasingly resemble computational logic.

Research into synthetic DNA circuits is explicitly exploring logic gates, amplifiers and other molecular control systems for programming cellular functions.

We''re beginning to build biological systems that don''t simply react.

They can be designed to compute conditions.

Software developers work with:

functions,

variables,

conditions,

loops,

data structures.

Synthetic biologists work with:

DNA sequences,

promoters,

regulatory elements,

proteins,

RNA,

gene circuits,

cellular pathways.

The abstraction layer is still developing.

But the direction is fascinating.

The ambition is essentially:

Make biology sufficiently predictable that engineers can specify desired behavior.

We''re nowhere near complete predictability.

But the field is moving.

This is where two major technologies collide.

AI can search enormous biological design spaces.

Instead of manually testing thousands of possibilities, computational systems can help predict:

protein structures,

genetic sequences,

molecular interactions,

regulatory elements,

and potential biological designs.

Recent reviews describe generative AI as increasingly important for designing biological parts, circuits and genomes.

That creates a potentially powerful loop:

AI proposes designs

↓

biology tests them

↓

experiments generate data

↓

AI learns

↓

better designs

↓

better biological systems

This is an entirely different development cycle from traditional drug discovery.

Imagine needing to manufacture a molecule.

Traditional manufacturing might require:

factories,

chemical processes,

specialized equipment,

raw materials,

energy,

and complex supply chains.

Now imagine engineering microorganisms that produce the molecule themselves.

The organism becomes part of the manufacturing system.

This is already a major idea in biotechnology.

Cells can be engineered to produce:

chemicals,

materials,

enzymes,

foods,

pharmaceutical compounds,

and other useful products.

Biology becomes manufacturing infrastructure.

If engineered organisms can efficiently produce valuable materials, industries could change.

Instead of:

extract → refine → synthesize,

some processes could become:

design → program → grow.

That doesn''t mean biology replaces conventional industry.

But it creates a new manufacturing layer.

One where the "factory" is partly alive.

Researchers aren''t only modifying existing organisms.

Synthetic biology also explores the construction of biological systems from the bottom up.

Scientists are investigating synthetic genomes and artificial-cell systems, attempting to understand what biological functionality can be designed rather than inherited from natural evolution.

That raises a profound question:

If we can eventually design biological systems from principles rather than merely modify existing life, what counts as engineering?

Programmability creates power.

Power creates risk.

If biological systems become easier to design, the ability to create useful biological systems could expand.

So could the ability to create harmful ones.

That means synthetic biology isn''t only a scientific and commercial challenge.

It''s also a:

security,

governance,

biosafety,

and infrastructure

challenge.

Researchers are increasingly examining how emerging synthetic-cell technologies challenge existing assumptions about biological oversight and biosecurity.

The more programmable biology becomes, the more important the control layer becomes.

The most interesting systems may combine:

AI

software

robotics

biology

Imagine an automated laboratory where AI designs a biological experiment, robotic systems perform it, sensors collect the results, and the AI uses those results to design the next experiment.

That becomes a closed-loop discovery system.

Instead of humans manually conducting every experiment, machines increasingly operate the experimental cycle.

Traditional science can be slow because:

hypothesis,

experiment,

analysis,

new hypothesis

requires human time.

Automation can compress that cycle.

If machines can run thousands of experiments continuously, scientific discovery begins to look more like an optimization process.

The limiting factor becomes less:

"Can humans perform the experiment?"

and more:

"Can we design experiments that teach us something useful?"

The computer revolution gave humans programmable information.

Synthetic biology may give humans increasingly programmable matter.

That''s a much bigger idea.

Software can change what a computer does without rebuilding the computer.

Eventually, biological engineering could allow organisms or cells to perform new functions without waiting for natural evolution to create them.

We''re moving from:

reading biology

to

writing biology.

And that may be one of the defining technological transitions of this century.

Living systems remain complex.

Genes interact.

Cells evolve.

Environments change.

Biological systems can behave unpredictably.

A design that works in one context may fail in another.

So the future isn''t likely to be:

"Biology becomes code."

It''s more subtle.

It may be:

Biology becomes increasingly engineerable.

And that distinction matters.

We don''t need perfect control for the economic consequences to be enormous.

If software lets us program machines,

and AI helps us design those programs,

what happens when we can increasingly program living systems?

Medicine changes.

Manufacturing changes.

Agriculture changes.

Materials change.

Food changes.

Environmental engineering changes.

And potentially, the boundary between:

biology

and

technology

becomes much harder to define.

The next great industrial revolution may not happen on a factory floor.

It may happen inside a cell.', 'Analysis from the Omniv Editorial desk.', 'For most of human history, biology was something we could observe. We could breed plants. We could selectively breed animals.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"For most of human history, biology was something we could observe."},{"type":"paragraph","text":"We could breed plants."},{"type":"paragraph","text":"We could selectively breed animals."},{"type":"paragraph","text":"We could treat diseases."},{"type":"paragraph","text":"We could manipulate organisms indirectly."},{"type":"paragraph","text":"But we couldn''t reliably write biological instructions and expect living systems to execute them."},{"type":"paragraph","text":"That is changing."},{"type":"paragraph","text":"Synthetic biology is pushing toward a world in which biological systems can increasingly be designed, engineered and programmed."},{"type":"paragraph","text":"And that could be one of the most consequential technological shifts of the century."},{"type":"heading","text":"Biology is becoming an engineering discipline","level":2},{"type":"paragraph","text":"Computer engineering works because engineers can define instructions."},{"type":"paragraph","text":"Build a circuit."},{"type":"paragraph","text":"Write code."},{"type":"paragraph","text":"Run the system."},{"type":"paragraph","text":"Biology is far messier."},{"type":"paragraph","text":"A cell isn''t a computer assembled from perfectly understood components."},{"type":"paragraph","text":"It''s an evolved system containing enormous interactions."},{"type":"paragraph","text":"Yet scientists are increasingly learning how to manipulate:"},{"type":"paragraph","text":"DNA,"},{"type":"paragraph","text":"RNA,"},{"type":"paragraph","text":"proteins,"},{"type":"paragraph","text":"gene regulation,"},{"type":"paragraph","text":"cell signaling,"},{"type":"paragraph","text":"and cellular behavior."},{"type":"paragraph","text":"Synthetic biology now includes efforts to design biological parts, circuits and even genomes."},{"type":"paragraph","text":"The goal is not merely to understand life."},{"type":"paragraph","text":"It''s to make life do things we specify."},{"type":"heading","text":"Think of a cell as a biological machine","level":2},{"type":"paragraph","text":"A cell already performs extraordinary computation."},{"type":"paragraph","text":"It receives signals."},{"type":"paragraph","text":"It detects environmental conditions."},{"type":"paragraph","text":"It changes gene expression."},{"type":"paragraph","text":"It produces molecules."},{"type":"paragraph","text":"It responds to threats."},{"type":"paragraph","text":"It divides."},{"type":"paragraph","text":"It communicates with neighboring cells."},{"type":"paragraph","text":"It makes decisions."},{"type":"paragraph","text":"Scientists are increasingly trying to introduce additional instructions into these systems."},{"type":"paragraph","text":"For example:"},{"type":"paragraph","text":"If this disease marker appears → activate this response."},{"type":"paragraph","text":"If this chemical is present → produce this molecule."},{"type":"paragraph","text":"If this cell becomes cancerous → trigger a therapeutic mechanism."},{"type":"paragraph","text":"That is programming."},{"type":"paragraph","text":"Just not in Python."},{"type":"heading","text":"Cells can become therapeutic machines","level":2},{"type":"paragraph","text":"One of the most exciting areas is engineered cell therapy."},{"type":"paragraph","text":"Instead of delivering a conventional drug that affects the body broadly, researchers can potentially engineer cells to respond to specific biological conditions."},{"type":"paragraph","text":"Recent research describes programmable cell therapies designed to sense disease-associated signals and respond by releasing therapeutic molecules or attacking specific targets."},{"type":"paragraph","text":"Imagine a living therapeutic system that can:"},{"type":"paragraph","text":"sense,"},{"type":"paragraph","text":"decide,"},{"type":"paragraph","text":"respond,"},{"type":"paragraph","text":"and adapt."},{"type":"paragraph","text":"That''s very different from a traditional pill."},{"type":"heading","text":"Biology can become conditional","level":2},{"type":"paragraph","text":"This is where synthetic biology becomes particularly powerful."},{"type":"paragraph","text":"Suppose a therapeutic cell is designed with logic-like rules:"},{"type":"paragraph","text":"IF"},{"type":"paragraph","text":"cancer marker A is present"},{"type":"paragraph","text":"AND"},{"type":"paragraph","text":"marker B is present"},{"type":"paragraph","text":"AND NOT"},{"type":"paragraph","text":"healthy-cell marker C"},{"type":"paragraph","text":"THEN"},{"type":"paragraph","text":"activate therapeutic response."},{"type":"paragraph","text":"Biologists are developing molecular circuits that increasingly resemble computational logic."},{"type":"paragraph","text":"Research into synthetic DNA circuits is explicitly exploring logic gates, amplifiers and other molecular control systems for programming cellular functions."},{"type":"paragraph","text":"We''re beginning to build biological systems that don''t simply react."},{"type":"paragraph","text":"They can be designed to compute conditions."},{"type":"heading","text":"The programming language is different","level":2},{"type":"paragraph","text":"Software developers work with:"},{"type":"paragraph","text":"functions,"},{"type":"paragraph","text":"variables,"},{"type":"paragraph","text":"conditions,"},{"type":"paragraph","text":"loops,"},{"type":"paragraph","text":"data structures."},{"type":"paragraph","text":"Synthetic biologists work with:"},{"type":"paragraph","text":"DNA sequences,"},{"type":"paragraph","text":"promoters,"},{"type":"paragraph","text":"regulatory elements,"},{"type":"paragraph","text":"proteins,"},{"type":"paragraph","text":"RNA,"},{"type":"paragraph","text":"gene circuits,"},{"type":"paragraph","text":"cellular pathways."},{"type":"paragraph","text":"The abstraction layer is still developing."},{"type":"paragraph","text":"But the direction is fascinating."},{"type":"paragraph","text":"The ambition is essentially:"},{"type":"paragraph","text":"Make biology sufficiently predictable that engineers can specify desired behavior."},{"type":"paragraph","text":"We''re nowhere near complete predictability."},{"type":"paragraph","text":"But the field is moving."},{"type":"heading","text":"AI changes the equation","level":2},{"type":"paragraph","text":"This is where two major technologies collide."},{"type":"paragraph","text":"AI can search enormous biological design spaces."},{"type":"paragraph","text":"Instead of manually testing thousands of possibilities, computational systems can help predict:"},{"type":"paragraph","text":"protein structures,"},{"type":"paragraph","text":"genetic sequences,"},{"type":"paragraph","text":"molecular interactions,"},{"type":"paragraph","text":"regulatory elements,"},{"type":"paragraph","text":"and potential biological designs."},{"type":"paragraph","text":"Recent reviews describe generative AI as increasingly important for designing biological parts, circuits and genomes."},{"type":"paragraph","text":"That creates a potentially powerful loop:"},{"type":"paragraph","text":"AI proposes designs"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"biology tests them"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"experiments generate data"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"AI learns"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"better designs"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"better biological systems"},{"type":"paragraph","text":"This is an entirely different development cycle from traditional drug discovery."},{"type":"heading","text":"The factory could become the organism","level":2},{"type":"paragraph","text":"Imagine needing to manufacture a molecule."},{"type":"paragraph","text":"Traditional manufacturing might require:"},{"type":"paragraph","text":"factories,"},{"type":"paragraph","text":"chemical processes,"},{"type":"paragraph","text":"specialized equipment,"},{"type":"paragraph","text":"raw materials,"},{"type":"paragraph","text":"energy,"},{"type":"paragraph","text":"and complex supply chains."},{"type":"paragraph","text":"Now imagine engineering microorganisms that produce the molecule themselves."},{"type":"paragraph","text":"The organism becomes part of the manufacturing system."},{"type":"paragraph","text":"This is already a major idea in biotechnology."},{"type":"paragraph","text":"Cells can be engineered to produce:"},{"type":"paragraph","text":"chemicals,"},{"type":"paragraph","text":"materials,"},{"type":"paragraph","text":"enzymes,"},{"type":"paragraph","text":"foods,"},{"type":"paragraph","text":"pharmaceutical compounds,"},{"type":"paragraph","text":"and other useful products."},{"type":"paragraph","text":"Biology becomes manufacturing infrastructure."},{"type":"heading","text":"That could change industrial economics","level":2},{"type":"paragraph","text":"If engineered organisms can efficiently produce valuable materials, industries could change."},{"type":"paragraph","text":"Instead of:"},{"type":"paragraph","text":"extract → refine → synthesize,"},{"type":"paragraph","text":"some processes could become:"},{"type":"paragraph","text":"design → program → grow."},{"type":"paragraph","text":"That doesn''t mean biology replaces conventional industry."},{"type":"paragraph","text":"But it creates a new manufacturing layer."},{"type":"paragraph","text":"One where the \"factory\" is partly alive."},{"type":"heading","text":"Then things become stranger","level":2},{"type":"paragraph","text":"Researchers aren''t only modifying existing organisms."},{"type":"paragraph","text":"Synthetic biology also explores the construction of biological systems from the bottom up."},{"type":"paragraph","text":"Scientists are investigating synthetic genomes and artificial-cell systems, attempting to understand what biological functionality can be designed rather than inherited from natural evolution."},{"type":"paragraph","text":"That raises a profound question:"},{"type":"paragraph","text":"If we can eventually design biological systems from principles rather than merely modify existing life, what counts as engineering?"},{"type":"heading","text":"Biology has a security problem","level":2},{"type":"paragraph","text":"Programmability creates power."},{"type":"paragraph","text":"Power creates risk."},{"type":"paragraph","text":"If biological systems become easier to design, the ability to create useful biological systems could expand."},{"type":"paragraph","text":"So could the ability to create harmful ones."},{"type":"paragraph","text":"That means synthetic biology isn''t only a scientific and commercial challenge."},{"type":"paragraph","text":"It''s also a:"},{"type":"paragraph","text":"security,"},{"type":"paragraph","text":"governance,"},{"type":"paragraph","text":"biosafety,"},{"type":"paragraph","text":"and infrastructure"},{"type":"paragraph","text":"challenge."},{"type":"paragraph","text":"Researchers are increasingly examining how emerging synthetic-cell technologies challenge existing assumptions about biological oversight and biosecurity."},{"type":"paragraph","text":"The more programmable biology becomes, the more important the control layer becomes."},{"type":"heading","text":"The future may be hybrid","level":2},{"type":"paragraph","text":"The most interesting systems may combine:"},{"type":"paragraph","text":"AI"},{"type":"paragraph","text":"software"},{"type":"paragraph","text":"robotics"},{"type":"paragraph","text":"biology"},{"type":"paragraph","text":"Imagine an automated laboratory where AI designs a biological experiment, robotic systems perform it, sensors collect the results, and the AI uses those results to design the next experiment."},{"type":"paragraph","text":"That becomes a closed-loop discovery system."},{"type":"paragraph","text":"Instead of humans manually conducting every experiment, machines increasingly operate the experimental cycle."},{"type":"heading","text":"That changes the speed of science","level":2},{"type":"paragraph","text":"Traditional science can be slow because:"},{"type":"paragraph","text":"hypothesis,"},{"type":"paragraph","text":"experiment,"},{"type":"paragraph","text":"analysis,"},{"type":"paragraph","text":"new hypothesis"},{"type":"paragraph","text":"requires human time."},{"type":"paragraph","text":"Automation can compress that cycle."},{"type":"paragraph","text":"If machines can run thousands of experiments continuously, scientific discovery begins to look more like an optimization process."},{"type":"paragraph","text":"The limiting factor becomes less:"},{"type":"paragraph","text":"\"Can humans perform the experiment?\""},{"type":"paragraph","text":"and more:"},{"type":"paragraph","text":"\"Can we design experiments that teach us something useful?\""},{"type":"heading","text":"The deepest shift","level":2},{"type":"paragraph","text":"The computer revolution gave humans programmable information."},{"type":"paragraph","text":"Synthetic biology may give humans increasingly programmable matter."},{"type":"paragraph","text":"That''s a much bigger idea."},{"type":"paragraph","text":"Software can change what a computer does without rebuilding the computer."},{"type":"paragraph","text":"Eventually, biological engineering could allow organisms or cells to perform new functions without waiting for natural evolution to create them."},{"type":"paragraph","text":"We''re moving from:"},{"type":"paragraph","text":"reading biology"},{"type":"paragraph","text":"to"},{"type":"paragraph","text":"writing biology."},{"type":"paragraph","text":"And that may be one of the defining technological transitions of this century."},{"type":"heading","text":"But biology will not become perfectly programmable","level":2},{"type":"paragraph","text":"Living systems remain complex."},{"type":"paragraph","text":"Genes interact."},{"type":"paragraph","text":"Cells evolve."},{"type":"paragraph","text":"Environments change."},{"type":"paragraph","text":"Biological systems can behave unpredictably."},{"type":"paragraph","text":"A design that works in one context may fail in another."},{"type":"paragraph","text":"So the future isn''t likely to be:"},{"type":"paragraph","text":"\"Biology becomes code.\""},{"type":"paragraph","text":"It''s more subtle."},{"type":"paragraph","text":"It may be:"},{"type":"paragraph","text":"Biology becomes increasingly engineerable."},{"type":"paragraph","text":"And that distinction matters."},{"type":"paragraph","text":"We don''t need perfect control for the economic consequences to be enormous."},{"type":"heading","text":"The question ahead","level":2},{"type":"paragraph","text":"If software lets us program machines,"},{"type":"paragraph","text":"and AI helps us design those programs,"},{"type":"paragraph","text":"what happens when we can increasingly program living systems?"},{"type":"paragraph","text":"Medicine changes."},{"type":"paragraph","text":"Manufacturing changes."},{"type":"paragraph","text":"Agriculture changes."},{"type":"paragraph","text":"Materials change."},{"type":"paragraph","text":"Food changes."},{"type":"paragraph","text":"Environmental engineering changes."},{"type":"paragraph","text":"And potentially, the boundary between:"},{"type":"paragraph","text":"biology"},{"type":"paragraph","text":"and"},{"type":"paragraph","text":"technology"},{"type":"paragraph","text":"becomes much harder to define."},{"type":"paragraph","text":"The next great industrial revolution may not happen on a factory floor."},{"type":"paragraph","text":"It may happen inside a cell."}]'::jsonb, 'TECHNOLOGY', 6, 'published', 'What Happens When Biology Becomes Programmable? | Omniv Editorial', 'For most of human history, biology was something we could observe. We could breed plants. We could selectively breed animals.', 'https://omniv.media/p/what-happens-when-biology-becomes-programmable', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"biology","label":"Biology"},{"type":"project","slug":"space","label":"Space"}]'::jsonb, '{}'::text[], '{technology,global-supply-chains,artificial-intelligence,data-centres,infrastructure,biology}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-new-race-for-space', 'The New Race for Space', 'For decades, space looked like the domain of governments. The United States. Russia.', 'For decades, space looked like the domain of governments.

The United States.

Russia.

China.

Europe.

A handful of national space agencies.

Getting something into orbit required enormous budgets, specialized infrastructure and capabilities available to very few organizations.

That world is changing.

Space is becoming increasingly commercial.

And increasingly crowded.

The original space race was fundamentally geopolitical.

Who could:

launch first,

reach orbit,

reach the Moon,

demonstrate technological superiority?

Space was a proxy for industrial capability.

Rocket technology demonstrated military and scientific power.

The Moon became a symbol.

But the new space race has a different objective.

It is increasingly about infrastructure and economics.

Reusable rockets have changed the economics of launch.

Instead of treating a rocket as something used once and discarded, reusable systems aim to recover and fly expensive components again.

That changes the cost structure.

Lower launch costs make more missions economically viable.

And once launch becomes more accessible, an entire ecosystem can grow around it.

Satellites.

Communications.

Earth observation.

Weather.

Navigation.

Defense.

Scientific research.

Remote sensing.

The economics of space begin changing.

This may be the most important shift.

We already depend on satellites without thinking about them.

They support:

communications,

navigation,

weather forecasting,

mapping,

agriculture,

financial timing,

disaster monitoring,

military operations,

and environmental observation.

Space isn''t simply a destination anymore.

It''s becoming another infrastructure layer.

Historically, satellites were enormous engineering projects.

But advances in electronics and miniaturization have enabled much smaller spacecraft.

That changes who can participate.

A university can potentially launch a satellite.

A startup can build an Earth-observation constellation.

A country can develop specialized satellite capabilities.

Companies can build networks designed around specific commercial applications.

The barrier is still high.

But it is no longer exclusively reserved for superpowers.

Recent investment trends show just how quickly commercial space is developing. Financial activity across the global space sector has accelerated, with launch, satellite communications, Earth observation and defense attracting increasing capital.

And that''s important because it means space is increasingly being evaluated as an economic sector rather than simply a government program.

Investors are asking:

What can generate revenue?

What infrastructure will be necessary?

Who controls the network?

Who owns the data?

Who provides launch capacity?

Who supplies communications?

This is another important shift.

A satellite might collect data.

But the valuable product could be:

the weather forecast,

the agricultural intelligence,

the maritime monitoring,

the mapping platform,

the defense system,

or the communication service built on top of it.

This is similar to cloud computing.

Customers don''t necessarily care about the physical server.

They care about the capability the infrastructure provides.

Space is developing its own stack.

Satellite communications have already changed what connectivity can look like.

But imagine what happens when satellite networks become increasingly integrated with:

mobile networks,

fiber,

cloud computing,

AI,

navigation,

and edge computing.

The distinction between terrestrial infrastructure and space infrastructure becomes less obvious.

The network becomes planetary.

Think about how much economic information exists above the planet.

Every day:

farms change,

ships move,

construction happens,

forests disappear,

roads become congested,

oil infrastructure changes,

weather systems develop,

cities expand.

Satellites can observe many of these changes at enormous scale.

AI can then analyze the resulting data.

That combination is powerful:

space-based sensors + AI

can turn physical activity on Earth into continuously updated information.

Imagine knowing:

where crops are stressed,

where ships are moving,

where construction is occurring,

where infrastructure is changing,

where natural disasters are developing,

where environmental conditions are shifting.

That information can have commercial value.

It can affect:

insurance,

agriculture,

logistics,

finance,

defense,

energy,

and government policy.

The satellite may be only the sensor.

The data is the product.

The Moon is increasingly becoming more than a destination for scientific missions.

Countries and companies are interested in:

lunar science,

communications,

navigation,

resource utilization,

and eventually sustained infrastructure.

The strategic question is not simply:

"Who gets to the Moon?"

It''s:

"Who builds the infrastructure that makes activity on the Moon possible?"

That distinction could define the next phase.

Imagine the first companies capable of providing reliable:

communications,

navigation,

power,

landing systems,

transport,

and data services

around the Moon.

Those capabilities could become foundational.

Just as ports matter to maritime trade,

and data centers matter to digital infrastructure,

space infrastructure could become the foundation for future activity beyond Earth.

Mars is much farther away.

There is no easy rescue.

Communication delays are significant.

The environment is hostile.

Radiation is a major concern.

Life-support systems must be extraordinarily reliable.

Supply chains become dramatically more difficult.

So Mars isn''t simply another destination.

It''s a systems-engineering challenge.

To sustain humans there, you would need to solve:

energy,

water,

food,

habitats,

manufacturing,

communications,

transportation,

medicine,

and redundancy.

Getting humans somewhere is one achievement.

Keeping them there is another.

A sustainable off-world settlement would need to produce more locally.

Water.

Fuel.

Building materials.

Food.

Spare parts.

Energy.

That means the long-term space economy could become less about transportation and more about industrial capability.

Commercial space doesn''t mean governments disappear.

Quite the opposite.

Governments remain major:

customers,

funders,

regulators,

launch partners,

military users,

and strategic actors.

And space infrastructure has obvious national-security implications.

A country that depends entirely on another country''s satellite systems can become strategically vulnerable.

So governments increasingly have incentives to maintain independent capabilities.

This creates an emerging concept:

space sovereignty.

A country may want control over:

communications,

Earth observation,

navigation,

launch access,

satellite manufacturing,

and data.

The issue isn''t merely economic.

It''s strategic independence.

Europe, for example, is increasingly concerned with maintaining its own space capabilities as commercial and geopolitical competition intensifies.

Think of it as a stack.

Rockets and launch infrastructure.

Satellites and spacecraft.

Communications and navigation.

Earth observation and scientific instruments.

Processing and analysis.

Agriculture, defense, finance, logistics, climate, insurance and more.

Moon, Mars and eventually beyond.

The most valuable companies won''t necessarily operate at the same layer.

Some may dominate infrastructure.

Others may build applications on top.

The old space race asked:

Can we do it?

The new space economy increasingly asks:

Can we do it repeatedly?

Can launches become routine?

Can satellites be manufactured at scale?

Can constellations be maintained?

Can data generate recurring revenue?

Can infrastructure support customers?

Can missions become economically sustainable?

That is a fundamentally different question.

The first internet companies needed:

servers,

fiber,

data centers,

power,

and telecommunications infrastructure.

The space economy has similar characteristics.

The visible companies may get the attention.

But underneath them will be an enormous infrastructure ecosystem.

Launch systems.

Manufacturing.

Ground stations.

Energy.

Communications.

Sensors.

Data processing.

Robotics.

Materials.

Insurance.

Finance.

And eventually:

off-world industry.

It may not have one winner.

The first space race had a finish line:

reach the Moon.

The new race doesn''t.

There are thousands of possible markets.

Thousands of infrastructure layers.

Multiple countries.

Multiple companies.

Multiple orbital environments.

And potentially an entirely new economy.

The competition isn''t simply:

Who gets there first?

It''s:

Who builds the systems that everyone else eventually needs?

That''s a much bigger race.

And if space becomes infrastructure rather than spectacle, the companies that matter most may not be the ones selling the dream of living among the stars.

They may be the ones quietly building the roads, networks, power systems, sensors and logistics that make the dream economically possible.

The next frontier may not simply be explored.

It may be industrialized.

Absolutely. These six fit the Startups / Entrepreneurship side of Omniv extremely well. I’d keep the same long-form editorial style: strong opening, real economic reasoning, examples, and a final idea that makes the reader want to open the next article.', 'Analysis from the Omniv Editorial desk.', 'For decades, space looked like the domain of governments. The United States. Russia.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"For decades, space looked like the domain of governments."},{"type":"paragraph","text":"The United States."},{"type":"paragraph","text":"Russia."},{"type":"paragraph","text":"China."},{"type":"paragraph","text":"Europe."},{"type":"paragraph","text":"A handful of national space agencies."},{"type":"paragraph","text":"Getting something into orbit required enormous budgets, specialized infrastructure and capabilities available to very few organizations."},{"type":"paragraph","text":"That world is changing."},{"type":"paragraph","text":"Space is becoming increasingly commercial."},{"type":"paragraph","text":"And increasingly crowded."},{"type":"heading","text":"The first space race was about national prestige","level":2},{"type":"paragraph","text":"The original space race was fundamentally geopolitical."},{"type":"paragraph","text":"Who could:"},{"type":"paragraph","text":"launch first,"},{"type":"paragraph","text":"reach orbit,"},{"type":"paragraph","text":"reach the Moon,"},{"type":"paragraph","text":"demonstrate technological superiority?"},{"type":"paragraph","text":"Space was a proxy for industrial capability."},{"type":"paragraph","text":"Rocket technology demonstrated military and scientific power."},{"type":"paragraph","text":"The Moon became a symbol."},{"type":"paragraph","text":"But the new space race has a different objective."},{"type":"paragraph","text":"It is increasingly about infrastructure and economics."},{"type":"heading","text":"Getting into orbit is becoming cheaper","level":2},{"type":"paragraph","text":"Reusable rockets have changed the economics of launch."},{"type":"paragraph","text":"Instead of treating a rocket as something used once and discarded, reusable systems aim to recover and fly expensive components again."},{"type":"paragraph","text":"That changes the cost structure."},{"type":"paragraph","text":"Lower launch costs make more missions economically viable."},{"type":"paragraph","text":"And once launch becomes more accessible, an entire ecosystem can grow around it."},{"type":"paragraph","text":"Satellites."},{"type":"paragraph","text":"Communications."},{"type":"paragraph","text":"Earth observation."},{"type":"paragraph","text":"Weather."},{"type":"paragraph","text":"Navigation."},{"type":"paragraph","text":"Defense."},{"type":"paragraph","text":"Scientific research."},{"type":"paragraph","text":"Remote sensing."},{"type":"paragraph","text":"The economics of space begin changing."},{"type":"heading","text":"Space is becoming infrastructure","level":2},{"type":"paragraph","text":"This may be the most important shift."},{"type":"paragraph","text":"We already depend on satellites without thinking about them."},{"type":"paragraph","text":"They support:"},{"type":"paragraph","text":"communications,"},{"type":"paragraph","text":"navigation,"},{"type":"paragraph","text":"weather forecasting,"},{"type":"paragraph","text":"mapping,"},{"type":"paragraph","text":"agriculture,"},{"type":"paragraph","text":"financial timing,"},{"type":"paragraph","text":"disaster monitoring,"},{"type":"paragraph","text":"military operations,"},{"type":"paragraph","text":"and environmental observation."},{"type":"paragraph","text":"Space isn''t simply a destination anymore."},{"type":"paragraph","text":"It''s becoming another infrastructure layer."},{"type":"heading","text":"Satellites are becoming smaller","level":2},{"type":"paragraph","text":"Historically, satellites were enormous engineering projects."},{"type":"paragraph","text":"But advances in electronics and miniaturization have enabled much smaller spacecraft."},{"type":"paragraph","text":"That changes who can participate."},{"type":"paragraph","text":"A university can potentially launch a satellite."},{"type":"paragraph","text":"A startup can build an Earth-observation constellation."},{"type":"paragraph","text":"A country can develop specialized satellite capabilities."},{"type":"paragraph","text":"Companies can build networks designed around specific commercial applications."},{"type":"paragraph","text":"The barrier is still high."},{"type":"paragraph","text":"But it is no longer exclusively reserved for superpowers."},{"type":"heading","text":"The orbital economy is expanding","level":2},{"type":"paragraph","text":"Recent investment trends show just how quickly commercial space is developing. Financial activity across the global space sector has accelerated, with launch, satellite communications, Earth observation and defense attracting increasing capital."},{"type":"paragraph","text":"And that''s important because it means space is increasingly being evaluated as an economic sector rather than simply a government program."},{"type":"paragraph","text":"Investors are asking:"},{"type":"paragraph","text":"What can generate revenue?"},{"type":"paragraph","text":"What infrastructure will be necessary?"},{"type":"paragraph","text":"Who controls the network?"},{"type":"paragraph","text":"Who owns the data?"},{"type":"paragraph","text":"Who provides launch capacity?"},{"type":"paragraph","text":"Who supplies communications?"},{"type":"heading","text":"The satellite isn''t always the product","level":2},{"type":"paragraph","text":"This is another important shift."},{"type":"paragraph","text":"A satellite might collect data."},{"type":"paragraph","text":"But the valuable product could be:"},{"type":"paragraph","text":"the weather forecast,"},{"type":"paragraph","text":"the agricultural intelligence,"},{"type":"paragraph","text":"the maritime monitoring,"},{"type":"paragraph","text":"the mapping platform,"},{"type":"paragraph","text":"the defense system,"},{"type":"paragraph","text":"or the communication service built on top of it."},{"type":"paragraph","text":"This is similar to cloud computing."},{"type":"paragraph","text":"Customers don''t necessarily care about the physical server."},{"type":"paragraph","text":"They care about the capability the infrastructure provides."},{"type":"paragraph","text":"Space is developing its own stack."},{"type":"heading","text":"Communications are only the beginning","level":2},{"type":"paragraph","text":"Satellite communications have already changed what connectivity can look like."},{"type":"paragraph","text":"But imagine what happens when satellite networks become increasingly integrated with:"},{"type":"paragraph","text":"mobile networks,"},{"type":"paragraph","text":"fiber,"},{"type":"paragraph","text":"cloud computing,"},{"type":"paragraph","text":"AI,"},{"type":"paragraph","text":"navigation,"},{"type":"paragraph","text":"and edge computing."},{"type":"paragraph","text":"The distinction between terrestrial infrastructure and space infrastructure becomes less obvious."},{"type":"paragraph","text":"The network becomes planetary."},{"type":"heading","text":"Earth observation may become one of the biggest markets","level":2},{"type":"paragraph","text":"Think about how much economic information exists above the planet."},{"type":"paragraph","text":"Every day:"},{"type":"paragraph","text":"farms change,"},{"type":"paragraph","text":"ships move,"},{"type":"paragraph","text":"construction happens,"},{"type":"paragraph","text":"forests disappear,"},{"type":"paragraph","text":"roads become congested,"},{"type":"paragraph","text":"oil infrastructure changes,"},{"type":"paragraph","text":"weather systems develop,"},{"type":"paragraph","text":"cities expand."},{"type":"paragraph","text":"Satellites can observe many of these changes at enormous scale."},{"type":"paragraph","text":"AI can then analyze the resulting data."},{"type":"paragraph","text":"That combination is powerful:"},{"type":"paragraph","text":"space-based sensors + AI"},{"type":"paragraph","text":"can turn physical activity on Earth into continuously updated information."},{"type":"heading","text":"Space becomes a data layer","level":2},{"type":"paragraph","text":"Imagine knowing:"},{"type":"paragraph","text":"where crops are stressed,"},{"type":"paragraph","text":"where ships are moving,"},{"type":"paragraph","text":"where construction is occurring,"},{"type":"paragraph","text":"where infrastructure is changing,"},{"type":"paragraph","text":"where natural disasters are developing,"},{"type":"paragraph","text":"where environmental conditions are shifting."},{"type":"paragraph","text":"That information can have commercial value."},{"type":"paragraph","text":"It can affect:"},{"type":"paragraph","text":"insurance,"},{"type":"paragraph","text":"agriculture,"},{"type":"paragraph","text":"logistics,"},{"type":"paragraph","text":"finance,"},{"type":"paragraph","text":"defense,"},{"type":"paragraph","text":"energy,"},{"type":"paragraph","text":"and government policy."},{"type":"paragraph","text":"The satellite may be only the sensor."},{"type":"paragraph","text":"The data is the product."},{"type":"heading","text":"Then comes the Moon","level":2},{"type":"paragraph","text":"The Moon is increasingly becoming more than a destination for scientific missions."},{"type":"paragraph","text":"Countries and companies are interested in:"},{"type":"paragraph","text":"lunar science,"},{"type":"paragraph","text":"communications,"},{"type":"paragraph","text":"navigation,"},{"type":"paragraph","text":"resource utilization,"},{"type":"paragraph","text":"and eventually sustained infrastructure."},{"type":"paragraph","text":"The strategic question is not simply:"},{"type":"paragraph","text":"\"Who gets to the Moon?\""},{"type":"paragraph","text":"It''s:"},{"type":"paragraph","text":"\"Who builds the infrastructure that makes activity on the Moon possible?\""},{"type":"paragraph","text":"That distinction could define the next phase."},{"type":"heading","text":"Infrastructure creates leverage","level":2},{"type":"paragraph","text":"Imagine the first companies capable of providing reliable:"},{"type":"paragraph","text":"communications,"},{"type":"paragraph","text":"navigation,"},{"type":"paragraph","text":"power,"},{"type":"paragraph","text":"landing systems,"},{"type":"paragraph","text":"transport,"},{"type":"paragraph","text":"and data services"},{"type":"paragraph","text":"around the Moon."},{"type":"paragraph","text":"Those capabilities could become foundational."},{"type":"paragraph","text":"Just as ports matter to maritime trade,"},{"type":"paragraph","text":"and data centers matter to digital infrastructure,"},{"type":"paragraph","text":"space infrastructure could become the foundation for future activity beyond Earth."},{"type":"heading","text":"Mars is a different problem","level":2},{"type":"paragraph","text":"Mars is much farther away."},{"type":"paragraph","text":"There is no easy rescue."},{"type":"paragraph","text":"Communication delays are significant."},{"type":"paragraph","text":"The environment is hostile."},{"type":"paragraph","text":"Radiation is a major concern."},{"type":"paragraph","text":"Life-support systems must be extraordinarily reliable."},{"type":"paragraph","text":"Supply chains become dramatically more difficult."},{"type":"paragraph","text":"So Mars isn''t simply another destination."},{"type":"paragraph","text":"It''s a systems-engineering challenge."},{"type":"paragraph","text":"To sustain humans there, you would need to solve:"},{"type":"paragraph","text":"energy,"},{"type":"paragraph","text":"water,"},{"type":"paragraph","text":"food,"},{"type":"paragraph","text":"habitats,"},{"type":"paragraph","text":"manufacturing,"},{"type":"paragraph","text":"communications,"},{"type":"paragraph","text":"transportation,"},{"type":"paragraph","text":"medicine,"},{"type":"paragraph","text":"and redundancy."},{"type":"heading","text":"The real race may be for self-sufficiency","level":2},{"type":"paragraph","text":"Getting humans somewhere is one achievement."},{"type":"paragraph","text":"Keeping them there is another."},{"type":"paragraph","text":"A sustainable off-world settlement would need to produce more locally."},{"type":"paragraph","text":"Water."},{"type":"paragraph","text":"Fuel."},{"type":"paragraph","text":"Building materials."},{"type":"paragraph","text":"Food."},{"type":"paragraph","text":"Spare parts."},{"type":"paragraph","text":"Energy."},{"type":"paragraph","text":"That means the long-term space economy could become less about transportation and more about industrial capability."},{"type":"heading","text":"Governments are still central","level":2},{"type":"paragraph","text":"Commercial space doesn''t mean governments disappear."},{"type":"paragraph","text":"Quite the opposite."},{"type":"paragraph","text":"Governments remain major:"},{"type":"paragraph","text":"customers,"},{"type":"paragraph","text":"funders,"},{"type":"paragraph","text":"regulators,"},{"type":"paragraph","text":"launch partners,"},{"type":"paragraph","text":"military users,"},{"type":"paragraph","text":"and strategic actors."},{"type":"paragraph","text":"And space infrastructure has obvious national-security implications."},{"type":"paragraph","text":"A country that depends entirely on another country''s satellite systems can become strategically vulnerable."},{"type":"paragraph","text":"So governments increasingly have incentives to maintain independent capabilities."},{"type":"heading","text":"Space sovereignty","level":2},{"type":"paragraph","text":"This creates an emerging concept:"},{"type":"paragraph","text":"space sovereignty."},{"type":"paragraph","text":"A country may want control over:"},{"type":"paragraph","text":"communications,"},{"type":"paragraph","text":"Earth observation,"},{"type":"paragraph","text":"navigation,"},{"type":"paragraph","text":"launch access,"},{"type":"paragraph","text":"satellite manufacturing,"},{"type":"paragraph","text":"and data."},{"type":"paragraph","text":"The issue isn''t merely economic."},{"type":"paragraph","text":"It''s strategic independence."},{"type":"paragraph","text":"Europe, for example, is increasingly concerned with maintaining its own space capabilities as commercial and geopolitical competition intensifies."},{"type":"heading","text":"The space economy may become layered","level":2},{"type":"paragraph","text":"Think of it as a stack."},{"type":"heading","text":"Layer 1 — Launch","level":3},{"type":"paragraph","text":"Rockets and launch infrastructure."},{"type":"heading","text":"Layer 2 — Orbit","level":3},{"type":"paragraph","text":"Satellites and spacecraft."},{"type":"heading","text":"Layer 3 — Connectivity","level":3},{"type":"paragraph","text":"Communications and navigation."},{"type":"heading","text":"Layer 4 — Sensing","level":3},{"type":"paragraph","text":"Earth observation and scientific instruments."},{"type":"heading","text":"Layer 5 — Data","level":3},{"type":"paragraph","text":"Processing and analysis."},{"type":"heading","text":"Layer 6 — Applications","level":3},{"type":"paragraph","text":"Agriculture, defense, finance, logistics, climate, insurance and more."},{"type":"heading","text":"Layer 7 — Off-world infrastructure","level":3},{"type":"paragraph","text":"Moon, Mars and eventually beyond."},{"type":"paragraph","text":"The most valuable companies won''t necessarily operate at the same layer."},{"type":"paragraph","text":"Some may dominate infrastructure."},{"type":"paragraph","text":"Others may build applications on top."},{"type":"heading","text":"The economics are becoming the interesting part","level":2},{"type":"paragraph","text":"The old space race asked:"},{"type":"paragraph","text":"Can we do it?"},{"type":"paragraph","text":"The new space economy increasingly asks:"},{"type":"paragraph","text":"Can we do it repeatedly?"},{"type":"paragraph","text":"Can launches become routine?"},{"type":"paragraph","text":"Can satellites be manufactured at scale?"},{"type":"paragraph","text":"Can constellations be maintained?"},{"type":"paragraph","text":"Can data generate recurring revenue?"},{"type":"paragraph","text":"Can infrastructure support customers?"},{"type":"paragraph","text":"Can missions become economically sustainable?"},{"type":"paragraph","text":"That is a fundamentally different question."},{"type":"heading","text":"Space is becoming another frontier for industrial capital","level":2},{"type":"paragraph","text":"The first internet companies needed:"},{"type":"paragraph","text":"servers,"},{"type":"paragraph","text":"fiber,"},{"type":"paragraph","text":"data centers,"},{"type":"paragraph","text":"power,"},{"type":"paragraph","text":"and telecommunications infrastructure."},{"type":"paragraph","text":"The space economy has similar characteristics."},{"type":"paragraph","text":"The visible companies may get the attention."},{"type":"paragraph","text":"But underneath them will be an enormous infrastructure ecosystem."},{"type":"paragraph","text":"Launch systems."},{"type":"paragraph","text":"Manufacturing."},{"type":"paragraph","text":"Ground stations."},{"type":"paragraph","text":"Energy."},{"type":"paragraph","text":"Communications."},{"type":"paragraph","text":"Sensors."},{"type":"paragraph","text":"Data processing."},{"type":"paragraph","text":"Robotics."},{"type":"paragraph","text":"Materials."},{"type":"paragraph","text":"Insurance."},{"type":"paragraph","text":"Finance."},{"type":"paragraph","text":"And eventually:"},{"type":"paragraph","text":"off-world industry."},{"type":"heading","text":"The strange thing about the new space race","level":2},{"type":"paragraph","text":"It may not have one winner."},{"type":"paragraph","text":"The first space race had a finish line:"},{"type":"paragraph","text":"reach the Moon."},{"type":"paragraph","text":"The new race doesn''t."},{"type":"paragraph","text":"There are thousands of possible markets."},{"type":"paragraph","text":"Thousands of infrastructure layers."},{"type":"paragraph","text":"Multiple countries."},{"type":"paragraph","text":"Multiple companies."},{"type":"paragraph","text":"Multiple orbital environments."},{"type":"paragraph","text":"And potentially an entirely new economy."},{"type":"paragraph","text":"The competition isn''t simply:"},{"type":"paragraph","text":"Who gets there first?"},{"type":"paragraph","text":"It''s:"},{"type":"paragraph","text":"Who builds the systems that everyone else eventually needs?"},{"type":"paragraph","text":"That''s a much bigger race."},{"type":"paragraph","text":"And if space becomes infrastructure rather than spectacle, the companies that matter most may not be the ones selling the dream of living among the stars."},{"type":"paragraph","text":"They may be the ones quietly building the roads, networks, power systems, sensors and logistics that make the dream economically possible."},{"type":"paragraph","text":"The next frontier may not simply be explored."},{"type":"paragraph","text":"It may be industrialized."},{"type":"paragraph","text":"Absolutely. These six fit the Startups / Entrepreneurship side of Omniv extremely well. I’d keep the same long-form editorial style: strong opening, real economic reasoning, examples, and a final idea that makes the reader want to open the next article."}]'::jsonb, 'TECHNOLOGY', 6, 'published', 'The New Race for Space | Omniv Editorial', 'For decades, space looked like the domain of governments. The United States. Russia.', 'https://omniv.media/p/the-new-race-for-space', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"global-supply-chains","label":"Global Supply Chains"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"space","label":"Space"}]'::jsonb, '{}'::text[], '{technology,russia,global-supply-chains,artificial-intelligence,data-centres,infrastructure}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-new-solo-founder-economy', 'The New Solo-Founder Economy', 'There was a time when starting a serious company required a team. A designer. A developer.', 'There was a time when starting a serious company required a team.

A designer.

A developer.

A salesperson.

A marketer.

An accountant.

An operations person.

Maybe an office.

Maybe investors.

Maybe months of preparation before the first customer ever saw the product.

That world is changing.

Not because companies no longer need people.

But because one person can now command an extraordinary amount of leverage.

A founder with the right tools can research a market in an afternoon, build a prototype in days, create a brand without hiring an agency, automate administrative work, reach customers globally and operate software infrastructure that would once have required an entire technical department.

This doesn''t mean every company will become a one-person company.

It means the minimum size required to start one is collapsing.

Historically, entrepreneurship often followed a particular sequence:

Raise money.

Hire people.

Build the product.

Launch.

Find customers.

Today, the sequence can be almost inverted.

Find a problem.

Talk to customers.

Build a tiny solution.

Get someone to pay.

Automate what you can.

Then hire when the economics justify it.

That difference matters enormously.

The founder no longer needs to build the entire organization before discovering whether the business deserves to exist.

Consider what a modern founder can access.

AI can assist with:

research,

writing,

coding,

analysis,

customer support,

documentation,

design,

translation,

data processing,

marketing,

and repetitive operations.

Software-as-a-service products can handle:

payments,

email,

analytics,

CRM,

hosting,

authentication,

storage,

scheduling,

and accounting.

Cloud infrastructure means you don''t need to own servers.

Global payment systems mean you can sell internationally without building a financial network yourself.

Distribution platforms give individuals access to audiences that once belonged exclusively to large companies.

The founder''s job increasingly becomes orchestration.

This distinction is important.

AI doesn''t automatically create good businesses.

It makes certain activities cheaper.

That''s different.

If you don''t understand your customer, AI can help you build the wrong thing faster.

If your positioning is weak, AI can produce more marketing nobody cares about.

If your business model is broken, automation can make the broken process more efficient.

The scarce resource therefore shifts.

Less scarcity in:

execution capacity.

More scarcity in:

judgment.

When execution becomes cheap, decisions become expensive.

Which market?

Which customer?

Which problem?

Which feature?

Which distribution channel?

Which pricing model?

Which opportunity should be ignored?

What should happen next?

These decisions determine whether all the new leverage actually matters.

A founder who can build ten products but doesn''t know which one deserves to exist is not necessarily advantaged.

A founder who can identify one valuable problem and execute relentlessly may be.

This is perhaps the most interesting way to think about it.

A solo founder might technically be one person.

But around them is an invisible organization:

AI systems.

Cloud infrastructure.

Freelancers.

APIs.

Payment providers.

Distribution platforms.

Automation tools.

Contractors.

Specialized software.

Communities.

The founder is effectively assembling a virtual company.

The organization still exists.

Its boundaries have simply changed.

Imagine a founder builds a software business that reaches:

$10,000/month.

They may not need ten employees.

Perhaps they use:

AI for support and research,

automated billing,

cloud infrastructure,

a contractor for design,

a part-time accountant,

and the founder handles product and sales.

At $10,000/month, the company might still be fragile.

At $100,000/month, hiring becomes easier.

At $1 million/month, a larger organization may make sense.

The important point is that revenue can arrive before organizational complexity.

That changes the risk profile of entrepreneurship.

This doesn''t mean large companies disappear.

Quite the opposite.

Large organizations retain advantages in:

capital,

distribution,

regulatory access,

relationships,

manufacturing,

brand,

and institutional knowledge.

But the gap between:

"I have an idea"

and

"I have a functioning company"

is shrinking.

That''s historically significant.

Imagine two businesses.

Business A requires:

$5 million

before it can test whether customers care.

Business B requires:

$5,000

to build the first working version.

The second founder can run more experiments.

They can fail cheaply.

They can change direction.

They can learn.

This creates a powerful entrepreneurial advantage:

cheap experimentation.

Here''s the other side.

If it becomes easier for you to build something, it becomes easier for everyone else too.

That means software alone becomes less defensible.

A competitor can copy your interface.

Another company can use the same AI model.

Another founder can reproduce similar features.

So the question becomes:

What remains difficult to copy?

Customers.

Distribution.

Data.

Relationships.

Brand.

Network effects.

Operational expertise.

Physical infrastructure.

Regulatory position.

And trust.

That brings us to the concept of the moat.

This is where the idea is often misunderstood.

The goal isn''t:

"Never hire anyone."

The goal is:

Don''t hire before the economics justify the organization.

A founder should be able to ask:

Does this task create enough value to justify a full-time employee?

Can software handle it?

Can AI handle part of it?

Can a contractor handle it?

Can I eliminate it entirely?

This is essentially capital allocation at the organizational level.

They may start:

alone.

Then become:

one founder + software.

Then:

one founder + contractors.

Then:

a small core team.

Then:

a larger organization only when necessary.

The company grows because the business requires additional capacity—not because "real companies need employees."

That''s a meaningful cultural shift.

There''s another consequence.

When tools become abundant, founders can easily become overwhelmed.

Twenty ideas.

Thirty AI tools.

Fifty possible marketing channels.

Hundreds of possible features.

The founder can spend all day doing things.

And accomplish very little.

This creates a new entrepreneurial discipline:

focus.

The advantage isn''t having more tools.

It''s knowing which tool to use, for what, and when.

A company can die from too much activity.

More features.

More content.

More markets.

More partnerships.

More meetings.

More tools.

More complexity.

The best founders often simplify.

One customer.

One painful problem.

One strong distribution channel.

One compelling product.

One measurable outcome.

Then expand.

The most interesting founders of the next decade may not be the people with the largest teams.

They may be the people who can combine:

judgment + technology + distribution + capital discipline.

A founder who can do that has enormous leverage.

Not because they work alone.

Because they can make a small amount of human effort produce a disproportionately large amount of economic output.

And that''s the real promise of the solo-founder economy.', 'Analysis from the Omniv Editorial desk.', 'There was a time when starting a serious company required a team. A designer. A developer.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"There was a time when starting a serious company required a team."},{"type":"paragraph","text":"A designer."},{"type":"paragraph","text":"A developer."},{"type":"paragraph","text":"A salesperson."},{"type":"paragraph","text":"A marketer."},{"type":"paragraph","text":"An accountant."},{"type":"paragraph","text":"An operations person."},{"type":"paragraph","text":"Maybe an office."},{"type":"paragraph","text":"Maybe investors."},{"type":"paragraph","text":"Maybe months of preparation before the first customer ever saw the product."},{"type":"paragraph","text":"That world is changing."},{"type":"paragraph","text":"Not because companies no longer need people."},{"type":"paragraph","text":"But because one person can now command an extraordinary amount of leverage."},{"type":"paragraph","text":"A founder with the right tools can research a market in an afternoon, build a prototype in days, create a brand without hiring an agency, automate administrative work, reach customers globally and operate software infrastructure that would once have required an entire technical department."},{"type":"paragraph","text":"This doesn''t mean every company will become a one-person company."},{"type":"paragraph","text":"It means the minimum size required to start one is collapsing."},{"type":"heading","text":"The company used to come first","level":2},{"type":"paragraph","text":"Historically, entrepreneurship often followed a particular sequence:"},{"type":"paragraph","text":"Raise money."},{"type":"paragraph","text":"Hire people."},{"type":"paragraph","text":"Build the product."},{"type":"paragraph","text":"Launch."},{"type":"paragraph","text":"Find customers."},{"type":"paragraph","text":"Today, the sequence can be almost inverted."},{"type":"paragraph","text":"Find a problem."},{"type":"paragraph","text":"Talk to customers."},{"type":"paragraph","text":"Build a tiny solution."},{"type":"paragraph","text":"Get someone to pay."},{"type":"paragraph","text":"Automate what you can."},{"type":"paragraph","text":"Then hire when the economics justify it."},{"type":"paragraph","text":"That difference matters enormously."},{"type":"paragraph","text":"The founder no longer needs to build the entire organization before discovering whether the business deserves to exist."},{"type":"heading","text":"AI changed the economics of labor","level":2},{"type":"paragraph","text":"Consider what a modern founder can access."},{"type":"paragraph","text":"AI can assist with:"},{"type":"paragraph","text":"research,"},{"type":"paragraph","text":"writing,"},{"type":"paragraph","text":"coding,"},{"type":"paragraph","text":"analysis,"},{"type":"paragraph","text":"customer support,"},{"type":"paragraph","text":"documentation,"},{"type":"paragraph","text":"design,"},{"type":"paragraph","text":"translation,"},{"type":"paragraph","text":"data processing,"},{"type":"paragraph","text":"marketing,"},{"type":"paragraph","text":"and repetitive operations."},{"type":"paragraph","text":"Software-as-a-service products can handle:"},{"type":"paragraph","text":"payments,"},{"type":"paragraph","text":"email,"},{"type":"paragraph","text":"analytics,"},{"type":"paragraph","text":"CRM,"},{"type":"paragraph","text":"hosting,"},{"type":"paragraph","text":"authentication,"},{"type":"paragraph","text":"storage,"},{"type":"paragraph","text":"scheduling,"},{"type":"paragraph","text":"and accounting."},{"type":"paragraph","text":"Cloud infrastructure means you don''t need to own servers."},{"type":"paragraph","text":"Global payment systems mean you can sell internationally without building a financial network yourself."},{"type":"paragraph","text":"Distribution platforms give individuals access to audiences that once belonged exclusively to large companies."},{"type":"paragraph","text":"The founder''s job increasingly becomes orchestration."},{"type":"heading","text":"But leverage isn''t the same as competence","level":2},{"type":"paragraph","text":"This distinction is important."},{"type":"paragraph","text":"AI doesn''t automatically create good businesses."},{"type":"paragraph","text":"It makes certain activities cheaper."},{"type":"paragraph","text":"That''s different."},{"type":"paragraph","text":"If you don''t understand your customer, AI can help you build the wrong thing faster."},{"type":"paragraph","text":"If your positioning is weak, AI can produce more marketing nobody cares about."},{"type":"paragraph","text":"If your business model is broken, automation can make the broken process more efficient."},{"type":"paragraph","text":"The scarce resource therefore shifts."},{"type":"paragraph","text":"Less scarcity in:"},{"type":"paragraph","text":"execution capacity."},{"type":"paragraph","text":"More scarcity in:"},{"type":"paragraph","text":"judgment."},{"type":"heading","text":"The founder becomes the bottleneck","level":2},{"type":"paragraph","text":"When execution becomes cheap, decisions become expensive."},{"type":"paragraph","text":"Which market?"},{"type":"paragraph","text":"Which customer?"},{"type":"paragraph","text":"Which problem?"},{"type":"paragraph","text":"Which feature?"},{"type":"paragraph","text":"Which distribution channel?"},{"type":"paragraph","text":"Which pricing model?"},{"type":"paragraph","text":"Which opportunity should be ignored?"},{"type":"paragraph","text":"What should happen next?"},{"type":"paragraph","text":"These decisions determine whether all the new leverage actually matters."},{"type":"paragraph","text":"A founder who can build ten products but doesn''t know which one deserves to exist is not necessarily advantaged."},{"type":"paragraph","text":"A founder who can identify one valuable problem and execute relentlessly may be."},{"type":"heading","text":"The new solo founder isn''t really alone","level":2},{"type":"paragraph","text":"This is perhaps the most interesting way to think about it."},{"type":"paragraph","text":"A solo founder might technically be one person."},{"type":"paragraph","text":"But around them is an invisible organization:"},{"type":"paragraph","text":"AI systems."},{"type":"paragraph","text":"Cloud infrastructure."},{"type":"paragraph","text":"Freelancers."},{"type":"paragraph","text":"APIs."},{"type":"paragraph","text":"Payment providers."},{"type":"paragraph","text":"Distribution platforms."},{"type":"paragraph","text":"Automation tools."},{"type":"paragraph","text":"Contractors."},{"type":"paragraph","text":"Specialized software."},{"type":"paragraph","text":"Communities."},{"type":"paragraph","text":"The founder is effectively assembling a virtual company."},{"type":"paragraph","text":"The organization still exists."},{"type":"paragraph","text":"Its boundaries have simply changed."},{"type":"heading","text":"The first employee may arrive much later","level":2},{"type":"paragraph","text":"Imagine a founder builds a software business that reaches:"},{"type":"paragraph","text":"$10,000/month."},{"type":"paragraph","text":"They may not need ten employees."},{"type":"paragraph","text":"Perhaps they use:"},{"type":"paragraph","text":"AI for support and research,"},{"type":"paragraph","text":"automated billing,"},{"type":"paragraph","text":"cloud infrastructure,"},{"type":"paragraph","text":"a contractor for design,"},{"type":"paragraph","text":"a part-time accountant,"},{"type":"paragraph","text":"and the founder handles product and sales."},{"type":"paragraph","text":"At $10,000/month, the company might still be fragile."},{"type":"paragraph","text":"At $100,000/month, hiring becomes easier."},{"type":"paragraph","text":"At $1 million/month, a larger organization may make sense."},{"type":"paragraph","text":"The important point is that revenue can arrive before organizational complexity."},{"type":"paragraph","text":"That changes the risk profile of entrepreneurship."},{"type":"heading","text":"Small teams can now attempt enormous markets","level":2},{"type":"paragraph","text":"This doesn''t mean large companies disappear."},{"type":"paragraph","text":"Quite the opposite."},{"type":"paragraph","text":"Large organizations retain advantages in:"},{"type":"paragraph","text":"capital,"},{"type":"paragraph","text":"distribution,"},{"type":"paragraph","text":"regulatory access,"},{"type":"paragraph","text":"relationships,"},{"type":"paragraph","text":"manufacturing,"},{"type":"paragraph","text":"brand,"},{"type":"paragraph","text":"and institutional knowledge."},{"type":"paragraph","text":"But the gap between:"},{"type":"paragraph","text":"\"I have an idea\""},{"type":"paragraph","text":"and"},{"type":"paragraph","text":"\"I have a functioning company\""},{"type":"paragraph","text":"is shrinking."},{"type":"paragraph","text":"That''s historically significant."},{"type":"heading","text":"The capital requirement can fall","level":2},{"type":"paragraph","text":"Imagine two businesses."},{"type":"paragraph","text":"Business A requires:"},{"type":"paragraph","text":"$5 million"},{"type":"paragraph","text":"before it can test whether customers care."},{"type":"paragraph","text":"Business B requires:"},{"type":"paragraph","text":"$5,000"},{"type":"paragraph","text":"to build the first working version."},{"type":"paragraph","text":"The second founder can run more experiments."},{"type":"paragraph","text":"They can fail cheaply."},{"type":"paragraph","text":"They can change direction."},{"type":"paragraph","text":"They can learn."},{"type":"paragraph","text":"This creates a powerful entrepreneurial advantage:"},{"type":"paragraph","text":"cheap experimentation."},{"type":"heading","text":"But cheap experimentation creates more competition","level":2},{"type":"paragraph","text":"Here''s the other side."},{"type":"paragraph","text":"If it becomes easier for you to build something, it becomes easier for everyone else too."},{"type":"paragraph","text":"That means software alone becomes less defensible."},{"type":"paragraph","text":"A competitor can copy your interface."},{"type":"paragraph","text":"Another company can use the same AI model."},{"type":"paragraph","text":"Another founder can reproduce similar features."},{"type":"paragraph","text":"So the question becomes:"},{"type":"paragraph","text":"What remains difficult to copy?"},{"type":"paragraph","text":"Customers."},{"type":"paragraph","text":"Distribution."},{"type":"paragraph","text":"Data."},{"type":"paragraph","text":"Relationships."},{"type":"paragraph","text":"Brand."},{"type":"paragraph","text":"Network effects."},{"type":"paragraph","text":"Operational expertise."},{"type":"paragraph","text":"Physical infrastructure."},{"type":"paragraph","text":"Regulatory position."},{"type":"paragraph","text":"And trust."},{"type":"paragraph","text":"That brings us to the concept of the moat."},{"type":"heading","text":"The solo-founder economy isn''t about staying solo","level":2},{"type":"paragraph","text":"This is where the idea is often misunderstood."},{"type":"paragraph","text":"The goal isn''t:"},{"type":"paragraph","text":"\"Never hire anyone.\""},{"type":"paragraph","text":"The goal is:"},{"type":"paragraph","text":"Don''t hire before the economics justify the organization."},{"type":"paragraph","text":"A founder should be able to ask:"},{"type":"paragraph","text":"Does this task create enough value to justify a full-time employee?"},{"type":"paragraph","text":"Can software handle it?"},{"type":"paragraph","text":"Can AI handle part of it?"},{"type":"paragraph","text":"Can a contractor handle it?"},{"type":"paragraph","text":"Can I eliminate it entirely?"},{"type":"paragraph","text":"This is essentially capital allocation at the organizational level."},{"type":"heading","text":"The best founders will build companies differently","level":2},{"type":"paragraph","text":"They may start:"},{"type":"paragraph","text":"alone."},{"type":"paragraph","text":"Then become:"},{"type":"paragraph","text":"one founder + software."},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"one founder + contractors."},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"a small core team."},{"type":"paragraph","text":"Then:"},{"type":"paragraph","text":"a larger organization only when necessary."},{"type":"paragraph","text":"The company grows because the business requires additional capacity—not because \"real companies need employees.\""},{"type":"paragraph","text":"That''s a meaningful cultural shift."},{"type":"heading","text":"The scarce resource becomes attention","level":2},{"type":"paragraph","text":"There''s another consequence."},{"type":"paragraph","text":"When tools become abundant, founders can easily become overwhelmed."},{"type":"paragraph","text":"Twenty ideas."},{"type":"paragraph","text":"Thirty AI tools."},{"type":"paragraph","text":"Fifty possible marketing channels."},{"type":"paragraph","text":"Hundreds of possible features."},{"type":"paragraph","text":"The founder can spend all day doing things."},{"type":"paragraph","text":"And accomplish very little."},{"type":"paragraph","text":"This creates a new entrepreneurial discipline:"},{"type":"paragraph","text":"focus."},{"type":"paragraph","text":"The advantage isn''t having more tools."},{"type":"paragraph","text":"It''s knowing which tool to use, for what, and when."},{"type":"heading","text":"The founder''s job is increasingly deciding what NOT to do","level":2},{"type":"paragraph","text":"A company can die from too much activity."},{"type":"paragraph","text":"More features."},{"type":"paragraph","text":"More content."},{"type":"paragraph","text":"More markets."},{"type":"paragraph","text":"More partnerships."},{"type":"paragraph","text":"More meetings."},{"type":"paragraph","text":"More tools."},{"type":"paragraph","text":"More complexity."},{"type":"paragraph","text":"The best founders often simplify."},{"type":"paragraph","text":"One customer."},{"type":"paragraph","text":"One painful problem."},{"type":"paragraph","text":"One strong distribution channel."},{"type":"paragraph","text":"One compelling product."},{"type":"paragraph","text":"One measurable outcome."},{"type":"paragraph","text":"Then expand."},{"type":"heading","text":"The new entrepreneurial advantage","level":2},{"type":"paragraph","text":"The most interesting founders of the next decade may not be the people with the largest teams."},{"type":"paragraph","text":"They may be the people who can combine:"},{"type":"paragraph","text":"judgment + technology + distribution + capital discipline."},{"type":"paragraph","text":"A founder who can do that has enormous leverage."},{"type":"paragraph","text":"Not because they work alone."},{"type":"paragraph","text":"Because they can make a small amount of human effort produce a disproportionately large amount of economic output."},{"type":"paragraph","text":"And that''s the real promise of the solo-founder economy."}]'::jsonb, 'PEOPLE', 5, 'published', 'The New Solo-Founder Economy | Omniv Editorial', 'There was a time when starting a serious company required a team. A designer. A developer.', 'https://omniv.media/p/the-new-solo-founder-economy', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"}]'::jsonb, '{}'::text[], '{people,artificial-intelligence,data-centres,infrastructure,startups,investing}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'what-ai-changed-about-starting-a-company', 'What AI Changed About Starting a Company', 'AI didn''t make entrepreneurship easy. It changed where the difficulty lives. That distinction is important.', 'AI didn''t make entrepreneurship easy.

It changed where the difficulty lives.

That distinction is important.

For decades, starting a company required access to scarce capabilities.

Technical talent was expensive.

Research was slow.

Design required specialists.

Marketing required agencies.

Customer support required employees.

Data analysis required analysts.

Now many of those capabilities can be accessed through software.

The result isn''t that companies no longer need people.

It''s that the minimum viable organization is becoming smaller.

Imagine you have an idea for a software product.

Previously, you might need:

a developer,

designer,

copywriter,

researcher,

and product manager.

Today, one founder can use AI and existing infrastructure to perform significant portions of those jobs.

That changes the first question.

It used to be:

"Can I afford to build this?"

Increasingly it becomes:

"Should I build this at all?"

That''s a much more interesting problem.

The old process could look like:

Idea → business plan → funding → hiring → development → launch.

The new process can look like:

Problem → prototype → customer → payment → iteration.

That is a dramatic reduction in time.

And speed matters because entrepreneurship is fundamentally a learning process.

The faster you can test assumptions, the faster you discover which assumptions are wrong.

Imagine two founders.

Founder A asks AI:

"Give me 20 startup ideas."

Founder B asks:

"I spoke to 30 logistics operators. They all spend hours reconciling delivery information. Help me identify the economics of this problem."

Both use AI.

But the second founder has an enormous advantage.

Why?

Because the bottleneck isn''t generating possibilities.

It''s identifying valuable reality.

This may be one of its biggest economic effects.

Before AI, producing:

articles,

software,

images,

research,

marketing material,

translations,

presentations,

and analysis

required significant human labor.

Now supply can increase dramatically.

When supply increases, the scarce resource moves somewhere else.

And in many markets, that scarce resource is becoming:

attention.

If everyone can produce ten times as much content, the internet doesn''t become ten times more valuable.

It becomes noisier.

This creates a major opportunity for:

curation,

discovery,

reputation,

trust,

ranking,

and filtering.

When creation becomes cheap, knowing what deserves attention becomes expensive.

That is a profound shift.

This is uncomfortable.

A lot of businesses historically survived because execution itself was difficult.

Building the website took time.

Writing the copy took time.

Producing the report took time.

Creating the design took time.

Now those barriers are falling.

That means mediocre execution becomes easier to reproduce.

So differentiation has to move upward.

If everyone can build a similar interface, the interface isn''t enough.

What matters more could be:

proprietary data,

distribution,

customer relationships,

workflow integration,

network effects,

brand,

community,

trust,

regulatory positioning,

or physical infrastructure.

AI can accelerate product development.

It doesn''t automatically give you those things.

Once customers know software can respond instantly, expectations change.

They expect:

faster answers,

better personalization,

automation,

search,

recommendations,

and intelligent assistance.

A product that once seemed sophisticated can suddenly feel outdated.

This creates opportunity for entrepreneurs willing to redesign old workflows.

The strongest AI companies may not simply be:

"ChatGPT for industry X."

They may redesign the entire workflow.

Instead of helping a lawyer write faster, perhaps the system changes how legal work is researched, reviewed, documented and delivered.

Instead of helping a doctor write notes, perhaps it changes how clinical information moves through the organization.

Instead of helping a manufacturer analyze data, perhaps it changes how production decisions are made.

The deeper opportunity is not:

AI feature.

It is:

AI-native workflow.

This may be the biggest entrepreneurial advantage.

You can test:

pricing,

messaging,

interfaces,

market segments,

content,

automation,

and product concepts

at dramatically lower cost.

That means the entrepreneur who runs more intelligent experiments can potentially learn faster than competitors.

But experiments still need to be grounded in reality.

A beautiful prototype isn''t evidence.

A paying customer is evidence.

The old question:

"Can we build it?"

The new question:

"Can we build it, distribute it, and create something competitors cannot easily reproduce?"

The first question is becoming easier.

The second is becoming harder.

And that''s where the next generation of companies will be won.', 'Analysis from the Omniv Editorial desk.', 'AI didn''t make entrepreneurship easy. It changed where the difficulty lives. That distinction is important.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"AI didn''t make entrepreneurship easy."},{"type":"paragraph","text":"It changed where the difficulty lives."},{"type":"paragraph","text":"That distinction is important."},{"type":"paragraph","text":"For decades, starting a company required access to scarce capabilities."},{"type":"paragraph","text":"Technical talent was expensive."},{"type":"paragraph","text":"Research was slow."},{"type":"paragraph","text":"Design required specialists."},{"type":"paragraph","text":"Marketing required agencies."},{"type":"paragraph","text":"Customer support required employees."},{"type":"paragraph","text":"Data analysis required analysts."},{"type":"paragraph","text":"Now many of those capabilities can be accessed through software."},{"type":"paragraph","text":"The result isn''t that companies no longer need people."},{"type":"paragraph","text":"It''s that the minimum viable organization is becoming smaller."},{"type":"heading","text":"Building became cheaper","level":2},{"type":"paragraph","text":"Imagine you have an idea for a software product."},{"type":"paragraph","text":"Previously, you might need:"},{"type":"paragraph","text":"a developer,"},{"type":"paragraph","text":"designer,"},{"type":"paragraph","text":"copywriter,"},{"type":"paragraph","text":"researcher,"},{"type":"paragraph","text":"and product manager."},{"type":"paragraph","text":"Today, one founder can use AI and existing infrastructure to perform significant portions of those jobs."},{"type":"paragraph","text":"That changes the first question."},{"type":"paragraph","text":"It used to be:"},{"type":"paragraph","text":"\"Can I afford to build this?\""},{"type":"paragraph","text":"Increasingly it becomes:"},{"type":"paragraph","text":"\"Should I build this at all?\""},{"type":"paragraph","text":"That''s a much more interesting problem."},{"type":"heading","text":"AI compresses the distance between idea and experiment","level":2},{"type":"paragraph","text":"The old process could look like:"},{"type":"paragraph","text":"Idea → business plan → funding → hiring → development → launch."},{"type":"paragraph","text":"The new process can look like:"},{"type":"paragraph","text":"Problem → prototype → customer → payment → iteration."},{"type":"paragraph","text":"That is a dramatic reduction in time."},{"type":"paragraph","text":"And speed matters because entrepreneurship is fundamentally a learning process."},{"type":"paragraph","text":"The faster you can test assumptions, the faster you discover which assumptions are wrong."},{"type":"heading","text":"But AI increases the value of knowing what to test","level":2},{"type":"paragraph","text":"Imagine two founders."},{"type":"paragraph","text":"Founder A asks AI:"},{"type":"paragraph","text":"\"Give me 20 startup ideas.\""},{"type":"paragraph","text":"Founder B asks:"},{"type":"paragraph","text":"\"I spoke to 30 logistics operators. They all spend hours reconciling delivery information. Help me identify the economics of this problem.\""},{"type":"paragraph","text":"Both use AI."},{"type":"paragraph","text":"But the second founder has an enormous advantage."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"Because the bottleneck isn''t generating possibilities."},{"type":"paragraph","text":"It''s identifying valuable reality."},{"type":"heading","text":"AI creates an abundance of supply","level":2},{"type":"paragraph","text":"This may be one of its biggest economic effects."},{"type":"paragraph","text":"Before AI, producing:"},{"type":"paragraph","text":"articles,"},{"type":"paragraph","text":"software,"},{"type":"paragraph","text":"images,"},{"type":"paragraph","text":"research,"},{"type":"paragraph","text":"marketing material,"},{"type":"paragraph","text":"translations,"},{"type":"paragraph","text":"presentations,"},{"type":"paragraph","text":"and analysis"},{"type":"paragraph","text":"required significant human labor."},{"type":"paragraph","text":"Now supply can increase dramatically."},{"type":"paragraph","text":"When supply increases, the scarce resource moves somewhere else."},{"type":"paragraph","text":"And in many markets, that scarce resource is becoming:"},{"type":"paragraph","text":"attention."},{"type":"heading","text":"More content doesn''t mean more attention","level":2},{"type":"paragraph","text":"If everyone can produce ten times as much content, the internet doesn''t become ten times more valuable."},{"type":"paragraph","text":"It becomes noisier."},{"type":"paragraph","text":"This creates a major opportunity for:"},{"type":"paragraph","text":"curation,"},{"type":"paragraph","text":"discovery,"},{"type":"paragraph","text":"reputation,"},{"type":"paragraph","text":"trust,"},{"type":"paragraph","text":"ranking,"},{"type":"paragraph","text":"and filtering."},{"type":"paragraph","text":"When creation becomes cheap, knowing what deserves attention becomes expensive."},{"type":"paragraph","text":"That is a profound shift."},{"type":"heading","text":"AI makes mediocre execution abundant","level":2},{"type":"paragraph","text":"This is uncomfortable."},{"type":"paragraph","text":"A lot of businesses historically survived because execution itself was difficult."},{"type":"paragraph","text":"Building the website took time."},{"type":"paragraph","text":"Writing the copy took time."},{"type":"paragraph","text":"Producing the report took time."},{"type":"paragraph","text":"Creating the design took time."},{"type":"paragraph","text":"Now those barriers are falling."},{"type":"paragraph","text":"That means mediocre execution becomes easier to reproduce."},{"type":"paragraph","text":"So differentiation has to move upward."},{"type":"heading","text":"The moat moves beyond the product","level":2},{"type":"paragraph","text":"If everyone can build a similar interface, the interface isn''t enough."},{"type":"paragraph","text":"What matters more could be:"},{"type":"paragraph","text":"proprietary data,"},{"type":"paragraph","text":"distribution,"},{"type":"paragraph","text":"customer relationships,"},{"type":"paragraph","text":"workflow integration,"},{"type":"paragraph","text":"network effects,"},{"type":"paragraph","text":"brand,"},{"type":"paragraph","text":"community,"},{"type":"paragraph","text":"trust,"},{"type":"paragraph","text":"regulatory positioning,"},{"type":"paragraph","text":"or physical infrastructure."},{"type":"paragraph","text":"AI can accelerate product development."},{"type":"paragraph","text":"It doesn''t automatically give you those things."},{"type":"heading","text":"AI also changes customer expectations","level":2},{"type":"paragraph","text":"Once customers know software can respond instantly, expectations change."},{"type":"paragraph","text":"They expect:"},{"type":"paragraph","text":"faster answers,"},{"type":"paragraph","text":"better personalization,"},{"type":"paragraph","text":"automation,"},{"type":"paragraph","text":"search,"},{"type":"paragraph","text":"recommendations,"},{"type":"paragraph","text":"and intelligent assistance."},{"type":"paragraph","text":"A product that once seemed sophisticated can suddenly feel outdated."},{"type":"paragraph","text":"This creates opportunity for entrepreneurs willing to redesign old workflows."},{"type":"heading","text":"Entire industries may be rebuilt from the workflow outward","level":2},{"type":"paragraph","text":"The strongest AI companies may not simply be:"},{"type":"paragraph","text":"\"ChatGPT for industry X.\""},{"type":"paragraph","text":"They may redesign the entire workflow."},{"type":"paragraph","text":"Instead of helping a lawyer write faster, perhaps the system changes how legal work is researched, reviewed, documented and delivered."},{"type":"paragraph","text":"Instead of helping a doctor write notes, perhaps it changes how clinical information moves through the organization."},{"type":"paragraph","text":"Instead of helping a manufacturer analyze data, perhaps it changes how production decisions are made."},{"type":"paragraph","text":"The deeper opportunity is not:"},{"type":"paragraph","text":"AI feature."},{"type":"paragraph","text":"It is:"},{"type":"paragraph","text":"AI-native workflow."},{"type":"heading","text":"AI changes the cost of experimentation","level":2},{"type":"paragraph","text":"This may be the biggest entrepreneurial advantage."},{"type":"paragraph","text":"You can test:"},{"type":"paragraph","text":"pricing,"},{"type":"paragraph","text":"messaging,"},{"type":"paragraph","text":"interfaces,"},{"type":"paragraph","text":"market segments,"},{"type":"paragraph","text":"content,"},{"type":"paragraph","text":"automation,"},{"type":"paragraph","text":"and product concepts"},{"type":"paragraph","text":"at dramatically lower cost."},{"type":"paragraph","text":"That means the entrepreneur who runs more intelligent experiments can potentially learn faster than competitors."},{"type":"paragraph","text":"But experiments still need to be grounded in reality."},{"type":"paragraph","text":"A beautiful prototype isn''t evidence."},{"type":"paragraph","text":"A paying customer is evidence."},{"type":"heading","text":"The new startup question","level":2},{"type":"paragraph","text":"The old question:"},{"type":"paragraph","text":"\"Can we build it?\""},{"type":"paragraph","text":"The new question:"},{"type":"paragraph","text":"\"Can we build it, distribute it, and create something competitors cannot easily reproduce?\""},{"type":"paragraph","text":"The first question is becoming easier."},{"type":"paragraph","text":"The second is becoming harder."},{"type":"paragraph","text":"And that''s where the next generation of companies will be won."}]'::jsonb, 'TECHNOLOGY', 3, 'published', 'What AI Changed About Starting a Company | Omniv Editorial', 'AI didn''t make entrepreneurship easy. It changed where the difficulty lives. That distinction is important.', 'https://omniv.media/p/what-ai-changed-about-starting-a-company', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"biology","label":"Biology"}]'::jsonb, '{}'::text[], '{technology,artificial-intelligence,infrastructure,startups,biology}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'why-africa-could-produce-a-different-kind-of-startup', 'Why Africa Could Produce a Different Kind of Startup', 'Africa is often described as a collection of problems waiting to be solved. That framing is incomplete. Africa is also a collection of markets being built in real time.', 'Africa is often described as a collection of problems waiting to be solved.

That framing is incomplete.

Africa is also a collection of markets being built in real time.

That creates a different kind of entrepreneurial environment.

In mature markets, entrepreneurs often optimize existing systems.

In developing markets, entrepreneurs can sometimes build systems that didn''t previously exist.

That''s a fundamentally different opportunity.

Consider:

electricity,

payments,

logistics,

transportation,

identity,

housing,

healthcare,

education,

connectivity,

agriculture,

and financial services.

In many African markets, these systems are still developing.

That creates enormous friction.

But friction also creates opportunity.

Many African consumers did not follow the same technological path as consumers in wealthy countries.

In some places, people skipped:

desktop-first computing,

traditional banking,

fixed-line telecommunications,

and other older infrastructure.

They moved directly toward:

mobile phones,

mobile payments,

social platforms,

and digital services.

That creates an important entrepreneurial possibility.

You don''t always have to recreate the old system.

Sometimes you can build around the new one.

A startup in Africa doesn''t necessarily need to be a consumer app.

It could build:

energy infrastructure,

cold storage,

logistics networks,

data centers,

fiber networks,

industrial software,

payment infrastructure,

agricultural processing,

or distributed power systems.

These businesses may look less glamorous than consumer applications.

But they can sit underneath entire economies.

One of Africa''s challenges is also an opportunity.

Countries differ in:

regulations,

currencies,

languages,

payment systems,

infrastructure,

consumer behavior,

and market size.

That makes scaling difficult.

But companies that successfully navigate fragmentation can develop valuable operational knowledge.

And operational knowledge can become a moat.

When infrastructure is imperfect, founders often can''t simply wait for another company to solve the problem.

They have to improvise.

They may build around:

unreliable power,

fragmented logistics,

informal markets,

limited financial infrastructure,

and inconsistent data.

That creates entrepreneurs who become unusually good at navigating complexity.

This distinction matters.

Nigeria isn''t Kenya.

Kenya isn''t Ghana.

Ghana isn''t South Africa.

Different markets have different:

regulatory systems,

consumer behavior,

infrastructure,

capital environments,

and competitive landscapes.

A founder who treats Africa as one homogeneous market can misunderstand the opportunity.

The better strategy is often:

win one market → understand the system → expand carefully.

African founders increasingly operate across borders.

They can access:

local markets,

global capital,

international technology,

diaspora networks,

and customers outside Africa.

This creates an unusual combination:

local problem knowledge + global resources.

That can be powerful.

Imagine an entrepreneur looks at African e-commerce and asks:

"What online store should I build?"

Another asks:

"What infrastructure does every online store need?"

Payments.

Warehousing.

Delivery.

Identity.

Fraud prevention.

Financing.

Customer acquisition.

Data.

The second entrepreneur may discover a much larger opportunity.

A growing and increasingly urban population creates long-term demand for:

housing,

energy,

food,

transport,

communications,

education,

healthcare,

financial services,

and digital infrastructure.

That doesn''t mean every company targeting Africa will succeed.

It means the underlying demand for systems is significant.

A lot of startup discussion focuses on apps.

But Africa''s next major businesses may involve:

manufacturing,

processing,

energy,

construction,

logistics,

industrial technology,

and infrastructure.

Why?

Because as economies grow, physical systems have to grow with them.

Someone has to build the electricity.

Someone has to move the goods.

Someone has to process the raw materials.

Someone has to build the warehouses.

Someone has to connect the factories.

Someone has to finance the expansion.

These are enormous markets.

A startup doesn''t have to be:

an app,

a SaaS company,

or an AI chatbot.

It can be a technology-enabled infrastructure company.

It can combine:

software + energy,

software + logistics,

finance + infrastructure,

AI + industrial systems,

data + marketplaces.

That hybrid model may be particularly powerful in markets where physical infrastructure and digital infrastructure are developing simultaneously.

This may be one of the biggest strategic mistakes.

A business model that works in San Francisco may not work in Lagos.

A product designed for a market with reliable electricity, universal card payments and mature logistics may require fundamental changes elsewhere.

The better question is:

What does this market uniquely need?

Then build from there.

In mature markets, technology often sits on top of infrastructure.

In emerging markets, entrepreneurs may have to build both.

That can create businesses that combine:

software,

hardware,

operations,

financing,

and infrastructure.

They can be harder to build.

But if successful, they can also be harder to replace.

Africa isn''t interesting because it is "the next big thing."

It''s interesting because enormous portions of the economic system are still being built.

And whenever systems are being built, entrepreneurs have the opportunity to decide:

how those systems work.

That is much more important than simply selling another app.', 'Analysis from the Omniv Editorial desk.', 'Africa is often described as a collection of problems waiting to be solved. That framing is incomplete. Africa is also a collection of markets being built in real time.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"Africa is often described as a collection of problems waiting to be solved."},{"type":"paragraph","text":"That framing is incomplete."},{"type":"paragraph","text":"Africa is also a collection of markets being built in real time."},{"type":"paragraph","text":"That creates a different kind of entrepreneurial environment."},{"type":"paragraph","text":"In mature markets, entrepreneurs often optimize existing systems."},{"type":"paragraph","text":"In developing markets, entrepreneurs can sometimes build systems that didn''t previously exist."},{"type":"paragraph","text":"That''s a fundamentally different opportunity."},{"type":"heading","text":"The infrastructure gap changes the startup map","level":2},{"type":"paragraph","text":"Consider:"},{"type":"paragraph","text":"electricity,"},{"type":"paragraph","text":"payments,"},{"type":"paragraph","text":"logistics,"},{"type":"paragraph","text":"transportation,"},{"type":"paragraph","text":"identity,"},{"type":"paragraph","text":"housing,"},{"type":"paragraph","text":"healthcare,"},{"type":"paragraph","text":"education,"},{"type":"paragraph","text":"connectivity,"},{"type":"paragraph","text":"agriculture,"},{"type":"paragraph","text":"and financial services."},{"type":"paragraph","text":"In many African markets, these systems are still developing."},{"type":"paragraph","text":"That creates enormous friction."},{"type":"paragraph","text":"But friction also creates opportunity."},{"type":"heading","text":"Mobile technology changed the starting point","level":2},{"type":"paragraph","text":"Many African consumers did not follow the same technological path as consumers in wealthy countries."},{"type":"paragraph","text":"In some places, people skipped:"},{"type":"paragraph","text":"desktop-first computing,"},{"type":"paragraph","text":"traditional banking,"},{"type":"paragraph","text":"fixed-line telecommunications,"},{"type":"paragraph","text":"and other older infrastructure."},{"type":"paragraph","text":"They moved directly toward:"},{"type":"paragraph","text":"mobile phones,"},{"type":"paragraph","text":"mobile payments,"},{"type":"paragraph","text":"social platforms,"},{"type":"paragraph","text":"and digital services."},{"type":"paragraph","text":"That creates an important entrepreneurial possibility."},{"type":"paragraph","text":"You don''t always have to recreate the old system."},{"type":"paragraph","text":"Sometimes you can build around the new one."},{"type":"heading","text":"Infrastructure can become the product","level":2},{"type":"paragraph","text":"A startup in Africa doesn''t necessarily need to be a consumer app."},{"type":"paragraph","text":"It could build:"},{"type":"paragraph","text":"energy infrastructure,"},{"type":"paragraph","text":"cold storage,"},{"type":"paragraph","text":"logistics networks,"},{"type":"paragraph","text":"data centers,"},{"type":"paragraph","text":"fiber networks,"},{"type":"paragraph","text":"industrial software,"},{"type":"paragraph","text":"payment infrastructure,"},{"type":"paragraph","text":"agricultural processing,"},{"type":"paragraph","text":"or distributed power systems."},{"type":"paragraph","text":"These businesses may look less glamorous than consumer applications."},{"type":"paragraph","text":"But they can sit underneath entire economies."},{"type":"heading","text":"The market can be fragmented","level":2},{"type":"paragraph","text":"One of Africa''s challenges is also an opportunity."},{"type":"paragraph","text":"Countries differ in:"},{"type":"paragraph","text":"regulations,"},{"type":"paragraph","text":"currencies,"},{"type":"paragraph","text":"languages,"},{"type":"paragraph","text":"payment systems,"},{"type":"paragraph","text":"infrastructure,"},{"type":"paragraph","text":"consumer behavior,"},{"type":"paragraph","text":"and market size."},{"type":"paragraph","text":"That makes scaling difficult."},{"type":"paragraph","text":"But companies that successfully navigate fragmentation can develop valuable operational knowledge."},{"type":"paragraph","text":"And operational knowledge can become a moat."},{"type":"heading","text":"Africa rewards problem-solving ability","level":2},{"type":"paragraph","text":"When infrastructure is imperfect, founders often can''t simply wait for another company to solve the problem."},{"type":"paragraph","text":"They have to improvise."},{"type":"paragraph","text":"They may build around:"},{"type":"paragraph","text":"unreliable power,"},{"type":"paragraph","text":"fragmented logistics,"},{"type":"paragraph","text":"informal markets,"},{"type":"paragraph","text":"limited financial infrastructure,"},{"type":"paragraph","text":"and inconsistent data."},{"type":"paragraph","text":"That creates entrepreneurs who become unusually good at navigating complexity."},{"type":"heading","text":"But the opportunity isn''t \"Africa\" as one market","level":2},{"type":"paragraph","text":"This distinction matters."},{"type":"paragraph","text":"Nigeria isn''t Kenya."},{"type":"paragraph","text":"Kenya isn''t Ghana."},{"type":"paragraph","text":"Ghana isn''t South Africa."},{"type":"paragraph","text":"Different markets have different:"},{"type":"paragraph","text":"regulatory systems,"},{"type":"paragraph","text":"consumer behavior,"},{"type":"paragraph","text":"infrastructure,"},{"type":"paragraph","text":"capital environments,"},{"type":"paragraph","text":"and competitive landscapes."},{"type":"paragraph","text":"A founder who treats Africa as one homogeneous market can misunderstand the opportunity."},{"type":"paragraph","text":"The better strategy is often:"},{"type":"paragraph","text":"win one market → understand the system → expand carefully."},{"type":"heading","text":"The diaspora is another advantage","level":2},{"type":"paragraph","text":"African founders increasingly operate across borders."},{"type":"paragraph","text":"They can access:"},{"type":"paragraph","text":"local markets,"},{"type":"paragraph","text":"global capital,"},{"type":"paragraph","text":"international technology,"},{"type":"paragraph","text":"diaspora networks,"},{"type":"paragraph","text":"and customers outside Africa."},{"type":"paragraph","text":"This creates an unusual combination:"},{"type":"paragraph","text":"local problem knowledge + global resources."},{"type":"paragraph","text":"That can be powerful."},{"type":"heading","text":"The biggest opportunities may be underneath the apps","level":2},{"type":"paragraph","text":"Imagine an entrepreneur looks at African e-commerce and asks:"},{"type":"paragraph","text":"\"What online store should I build?\""},{"type":"paragraph","text":"Another asks:"},{"type":"paragraph","text":"\"What infrastructure does every online store need?\""},{"type":"paragraph","text":"Payments."},{"type":"paragraph","text":"Warehousing."},{"type":"paragraph","text":"Delivery."},{"type":"paragraph","text":"Identity."},{"type":"paragraph","text":"Fraud prevention."},{"type":"paragraph","text":"Financing."},{"type":"paragraph","text":"Customer acquisition."},{"type":"paragraph","text":"Data."},{"type":"paragraph","text":"The second entrepreneur may discover a much larger opportunity."},{"type":"heading","text":"Africa''s demographic trajectory matters","level":2},{"type":"paragraph","text":"A growing and increasingly urban population creates long-term demand for:"},{"type":"paragraph","text":"housing,"},{"type":"paragraph","text":"energy,"},{"type":"paragraph","text":"food,"},{"type":"paragraph","text":"transport,"},{"type":"paragraph","text":"communications,"},{"type":"paragraph","text":"education,"},{"type":"paragraph","text":"healthcare,"},{"type":"paragraph","text":"financial services,"},{"type":"paragraph","text":"and digital infrastructure."},{"type":"paragraph","text":"That doesn''t mean every company targeting Africa will succeed."},{"type":"paragraph","text":"It means the underlying demand for systems is significant."},{"type":"heading","text":"The industrial opportunity is easy to overlook","level":2},{"type":"paragraph","text":"A lot of startup discussion focuses on apps."},{"type":"paragraph","text":"But Africa''s next major businesses may involve:"},{"type":"paragraph","text":"manufacturing,"},{"type":"paragraph","text":"processing,"},{"type":"paragraph","text":"energy,"},{"type":"paragraph","text":"construction,"},{"type":"paragraph","text":"logistics,"},{"type":"paragraph","text":"industrial technology,"},{"type":"paragraph","text":"and infrastructure."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"Because as economies grow, physical systems have to grow with them."},{"type":"paragraph","text":"Someone has to build the electricity."},{"type":"paragraph","text":"Someone has to move the goods."},{"type":"paragraph","text":"Someone has to process the raw materials."},{"type":"paragraph","text":"Someone has to build the warehouses."},{"type":"paragraph","text":"Someone has to connect the factories."},{"type":"paragraph","text":"Someone has to finance the expansion."},{"type":"paragraph","text":"These are enormous markets."},{"type":"heading","text":"The startup definition may need to expand","level":2},{"type":"paragraph","text":"A startup doesn''t have to be:"},{"type":"paragraph","text":"an app,"},{"type":"paragraph","text":"a SaaS company,"},{"type":"paragraph","text":"or an AI chatbot."},{"type":"paragraph","text":"It can be a technology-enabled infrastructure company."},{"type":"paragraph","text":"It can combine:"},{"type":"paragraph","text":"software + energy,"},{"type":"paragraph","text":"software + logistics,"},{"type":"paragraph","text":"finance + infrastructure,"},{"type":"paragraph","text":"AI + industrial systems,"},{"type":"paragraph","text":"data + marketplaces."},{"type":"paragraph","text":"That hybrid model may be particularly powerful in markets where physical infrastructure and digital infrastructure are developing simultaneously."},{"type":"heading","text":"The opportunity is not simply to copy Silicon Valley","level":2},{"type":"paragraph","text":"This may be one of the biggest strategic mistakes."},{"type":"paragraph","text":"A business model that works in San Francisco may not work in Lagos."},{"type":"paragraph","text":"A product designed for a market with reliable electricity, universal card payments and mature logistics may require fundamental changes elsewhere."},{"type":"paragraph","text":"The better question is:"},{"type":"paragraph","text":"What does this market uniquely need?"},{"type":"paragraph","text":"Then build from there."},{"type":"heading","text":"Africa may produce infrastructure-first startups","level":2},{"type":"paragraph","text":"In mature markets, technology often sits on top of infrastructure."},{"type":"paragraph","text":"In emerging markets, entrepreneurs may have to build both."},{"type":"paragraph","text":"That can create businesses that combine:"},{"type":"paragraph","text":"software,"},{"type":"paragraph","text":"hardware,"},{"type":"paragraph","text":"operations,"},{"type":"paragraph","text":"financing,"},{"type":"paragraph","text":"and infrastructure."},{"type":"paragraph","text":"They can be harder to build."},{"type":"paragraph","text":"But if successful, they can also be harder to replace."},{"type":"heading","text":"The deeper opportunity","level":2},{"type":"paragraph","text":"Africa isn''t interesting because it is \"the next big thing.\""},{"type":"paragraph","text":"It''s interesting because enormous portions of the economic system are still being built."},{"type":"paragraph","text":"And whenever systems are being built, entrepreneurs have the opportunity to decide:"},{"type":"paragraph","text":"how those systems work."},{"type":"paragraph","text":"That is much more important than simply selling another app."}]'::jsonb, 'PEOPLE', 4, 'published', 'Why Africa Could Produce a Different Kind of Startup | Omniv Editorial', 'Africa is often described as a collection of problems waiting to be solved. That framing is incomplete. Africa is also a collection of markets being built in real time.', 'https://omniv.media/p/why-africa-could-produce-a-different-kind-of-startup', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"africa","label":"Africa"}]'::jsonb, '{}'::text[], '{people,russia,artificial-intelligence,data-centres,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'the-startup-ideas-hiding-inside-broken-infrastructure', 'The Startup Ideas Hiding Inside Broken Infrastructure', 'When people search for startup ideas, they usually look at screens. Apps. Websites.', 'When people search for startup ideas, they usually look at screens.

Apps.

Websites.

AI tools.

Marketplaces.

Social networks.

But some of the biggest opportunities aren''t on the screen.

They''re underneath it.

Inside the infrastructure everything else depends on.

Take electricity.

Everyone notices the device using electricity.

Few people think about everything required to deliver it:

generation,

transmission,

distribution,

storage,

maintenance,

metering,

financing,

monitoring,

backup power.

Every layer can become a business.

The same applies to:

internet,

payments,

logistics,

data centers,

food systems,

water,

transportation,

and manufacturing.

One of the best ways to identify an infrastructure opportunity is to ask:

What is limiting the growth of everything else?

If businesses can''t grow because electricity is unreliable, energy is a bottleneck.

If online commerce can''t scale because delivery is unreliable, logistics is a bottleneck.

If AI companies can''t expand because compute is scarce, compute infrastructure is a bottleneck.

If manufacturers can''t expand because financing is unavailable, capital may be the bottleneck.

The bottleneck often becomes the business.

A power transformer isn''t exciting.

A warehouse isn''t exciting.

A fiber route isn''t exciting.

A payment-processing layer isn''t necessarily exciting.

But if thousands of businesses depend on them, their economic importance can be enormous.

This is why entrepreneurs should learn to separate:

interesting

from

important.

The two are not the same.

Infrastructure often has an attractive characteristic:

people repeatedly pay to use it.

Energy.

Connectivity.

Storage.

Payments.

Cloud computing.

Transportation.

Warehousing.

The asset may require substantial upfront investment.

But once operational, it can potentially generate recurring cash flows.

That makes infrastructure particularly interesting to long-term capital.

Imagine two companies.

Company A sells a piece of software.

Company B owns critical physical infrastructure that customers depend on.

Which is harder to replace?

It depends.

But physical infrastructure can create significant barriers:

capital requirements,

permits,

land,

construction,

network density,

maintenance,

relationships,

and time.

Competitors cannot necessarily reproduce those assets overnight.

Consider artificial intelligence.

Everyone is talking about models.

But AI requires:

chips,

servers,

data centers,

electricity,

cooling,

networking,

storage,

and specialized infrastructure.

The AI application might change next year.

The underlying infrastructure may remain essential.

This is why entrepreneurs should ask:

What does the future industry need regardless of which company wins?

That''s where infrastructure opportunities often appear.

Infrastructure isn''t necessarily concrete.

APIs can be infrastructure.

Payment rails can be infrastructure.

Identity systems can be infrastructure.

Data networks can be infrastructure.

Cloud platforms can be infrastructure.

Discovery systems can become infrastructure.

The common characteristic is dependence.

If many businesses build on top of you, you stop being merely another product.

You become part of the system.

Here''s a useful exercise.

Choose an industry.

Then map:

What enters the system?

↓

What happens inside?

↓

What leaves the system?

↓

Where does everything slow down?

↓

Where is money lost?

↓

Where does everyone depend on a fragile supplier?

↓

Where is information missing?

That map can reveal opportunities nobody sees when they''re simply brainstorming app ideas.', 'Analysis from the Omniv Editorial desk.', 'When people search for startup ideas, they usually look at screens. Apps. Websites.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"When people search for startup ideas, they usually look at screens."},{"type":"paragraph","text":"Apps."},{"type":"paragraph","text":"Websites."},{"type":"paragraph","text":"AI tools."},{"type":"paragraph","text":"Marketplaces."},{"type":"paragraph","text":"Social networks."},{"type":"paragraph","text":"But some of the biggest opportunities aren''t on the screen."},{"type":"paragraph","text":"They''re underneath it."},{"type":"paragraph","text":"Inside the infrastructure everything else depends on."},{"type":"heading","text":"Infrastructure creates invisible markets","level":2},{"type":"paragraph","text":"Take electricity."},{"type":"paragraph","text":"Everyone notices the device using electricity."},{"type":"paragraph","text":"Few people think about everything required to deliver it:"},{"type":"paragraph","text":"generation,"},{"type":"paragraph","text":"transmission,"},{"type":"paragraph","text":"distribution,"},{"type":"paragraph","text":"storage,"},{"type":"paragraph","text":"maintenance,"},{"type":"paragraph","text":"metering,"},{"type":"paragraph","text":"financing,"},{"type":"paragraph","text":"monitoring,"},{"type":"paragraph","text":"backup power."},{"type":"paragraph","text":"Every layer can become a business."},{"type":"paragraph","text":"The same applies to:"},{"type":"paragraph","text":"internet,"},{"type":"paragraph","text":"payments,"},{"type":"paragraph","text":"logistics,"},{"type":"paragraph","text":"data centers,"},{"type":"paragraph","text":"food systems,"},{"type":"paragraph","text":"water,"},{"type":"paragraph","text":"transportation,"},{"type":"paragraph","text":"and manufacturing."},{"type":"heading","text":"Find the bottleneck","level":2},{"type":"paragraph","text":"One of the best ways to identify an infrastructure opportunity is to ask:"},{"type":"paragraph","text":"What is limiting the growth of everything else?"},{"type":"paragraph","text":"If businesses can''t grow because electricity is unreliable, energy is a bottleneck."},{"type":"paragraph","text":"If online commerce can''t scale because delivery is unreliable, logistics is a bottleneck."},{"type":"paragraph","text":"If AI companies can''t expand because compute is scarce, compute infrastructure is a bottleneck."},{"type":"paragraph","text":"If manufacturers can''t expand because financing is unavailable, capital may be the bottleneck."},{"type":"paragraph","text":"The bottleneck often becomes the business."},{"type":"heading","text":"The most valuable infrastructure is often boring","level":2},{"type":"paragraph","text":"A power transformer isn''t exciting."},{"type":"paragraph","text":"A warehouse isn''t exciting."},{"type":"paragraph","text":"A fiber route isn''t exciting."},{"type":"paragraph","text":"A payment-processing layer isn''t necessarily exciting."},{"type":"paragraph","text":"But if thousands of businesses depend on them, their economic importance can be enormous."},{"type":"paragraph","text":"This is why entrepreneurs should learn to separate:"},{"type":"paragraph","text":"interesting"},{"type":"paragraph","text":"from"},{"type":"paragraph","text":"important."},{"type":"paragraph","text":"The two are not the same."},{"type":"heading","text":"Infrastructure can create recurring revenue","level":2},{"type":"paragraph","text":"Infrastructure often has an attractive characteristic:"},{"type":"paragraph","text":"people repeatedly pay to use it."},{"type":"paragraph","text":"Energy."},{"type":"paragraph","text":"Connectivity."},{"type":"paragraph","text":"Storage."},{"type":"paragraph","text":"Payments."},{"type":"paragraph","text":"Cloud computing."},{"type":"paragraph","text":"Transportation."},{"type":"paragraph","text":"Warehousing."},{"type":"paragraph","text":"The asset may require substantial upfront investment."},{"type":"paragraph","text":"But once operational, it can potentially generate recurring cash flows."},{"type":"paragraph","text":"That makes infrastructure particularly interesting to long-term capital."},{"type":"heading","text":"Infrastructure creates moats","level":2},{"type":"paragraph","text":"Imagine two companies."},{"type":"paragraph","text":"Company A sells a piece of software."},{"type":"paragraph","text":"Company B owns critical physical infrastructure that customers depend on."},{"type":"paragraph","text":"Which is harder to replace?"},{"type":"paragraph","text":"It depends."},{"type":"paragraph","text":"But physical infrastructure can create significant barriers:"},{"type":"paragraph","text":"capital requirements,"},{"type":"paragraph","text":"permits,"},{"type":"paragraph","text":"land,"},{"type":"paragraph","text":"construction,"},{"type":"paragraph","text":"network density,"},{"type":"paragraph","text":"maintenance,"},{"type":"paragraph","text":"relationships,"},{"type":"paragraph","text":"and time."},{"type":"paragraph","text":"Competitors cannot necessarily reproduce those assets overnight."},{"type":"heading","text":"The infrastructure layer beneath AI","level":2},{"type":"paragraph","text":"Consider artificial intelligence."},{"type":"paragraph","text":"Everyone is talking about models."},{"type":"paragraph","text":"But AI requires:"},{"type":"paragraph","text":"chips,"},{"type":"paragraph","text":"servers,"},{"type":"paragraph","text":"data centers,"},{"type":"paragraph","text":"electricity,"},{"type":"paragraph","text":"cooling,"},{"type":"paragraph","text":"networking,"},{"type":"paragraph","text":"storage,"},{"type":"paragraph","text":"and specialized infrastructure."},{"type":"paragraph","text":"The AI application might change next year."},{"type":"paragraph","text":"The underlying infrastructure may remain essential."},{"type":"paragraph","text":"This is why entrepreneurs should ask:"},{"type":"paragraph","text":"What does the future industry need regardless of which company wins?"},{"type":"paragraph","text":"That''s where infrastructure opportunities often appear."},{"type":"heading","text":"Infrastructure can be digital too","level":2},{"type":"paragraph","text":"Infrastructure isn''t necessarily concrete."},{"type":"paragraph","text":"APIs can be infrastructure."},{"type":"paragraph","text":"Payment rails can be infrastructure."},{"type":"paragraph","text":"Identity systems can be infrastructure."},{"type":"paragraph","text":"Data networks can be infrastructure."},{"type":"paragraph","text":"Cloud platforms can be infrastructure."},{"type":"paragraph","text":"Discovery systems can become infrastructure."},{"type":"paragraph","text":"The common characteristic is dependence."},{"type":"paragraph","text":"If many businesses build on top of you, you stop being merely another product."},{"type":"paragraph","text":"You become part of the system."},{"type":"heading","text":"The startup hiding in the bottleneck","level":2},{"type":"paragraph","text":"Here''s a useful exercise."},{"type":"paragraph","text":"Choose an industry."},{"type":"paragraph","text":"Then map:"},{"type":"paragraph","text":"What enters the system?"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"What happens inside?"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"What leaves the system?"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Where does everything slow down?"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Where is money lost?"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Where does everyone depend on a fragile supplier?"},{"type":"paragraph","text":"↓"},{"type":"paragraph","text":"Where is information missing?"},{"type":"paragraph","text":"That map can reveal opportunities nobody sees when they''re simply brainstorming app ideas."}]'::jsonb, 'MONEY', 2, 'published', 'The Startup Ideas Hiding Inside Broken Infrastructure | Omniv Editorial', 'When people search for startup ideas, they usually look at screens. Apps. Websites.', 'https://omniv.media/p/the-startup-ideas-hiding-inside-broken-infrastructure', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"brain-science","label":"Brain Science"}]'::jsonb, '{}'::text[], '{money,russia,artificial-intelligence,data-centres,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'what-investors-actually-mean-when-they-say-moat', 'What Investors Actually Mean When They Say "Moat"', 'Investors love the word moat. A company has a moat. A startup is building a moat.', 'Investors love the word moat.

A company has a moat.

A startup is building a moat.

The business has a defensible position.

But what does that actually mean?

A moat is essentially a reason why another company cannot easily take your economics away from you.

That''s it.

The concept comes from the old defensive structure surrounding a castle.

The castle isn''t valuable simply because it exists.

It''s valuable because attacking it is difficult.

Businesses can work the same way.

Being profitable isn''t necessarily a moat.

Having a popular product isn''t necessarily a moat.

Having lots of users isn''t necessarily a moat.

Even being first isn''t necessarily a moat.

A competitor can sometimes copy all of these.

The real question is:

What makes your position difficult to attack?

Consider a company that has spent decades becoming trusted.

Customers don''t simply buy its product.

They associate the brand with:

quality,

status,

safety,

reliability,

or identity.

A competitor can copy the product.

It cannot instantly copy decades of accumulated trust.

That''s a moat.

A network becomes more valuable as more participants join it.

Social networks.

Marketplaces.

Payment systems.

Professional networks.

Messaging platforms.

The product isn''t just the software.

It''s the network.

A competitor can copy the interface.

But if everyone you need to interact with is already somewhere else, switching becomes difficult.

That''s powerful.

But not all data is valuable.

Public information isn''t necessarily defensible.

The interesting data is often:

proprietary,

hard to collect,

continuously updated,

and directly useful to the product.

A company that has accumulated years of unique operational data may be difficult to reproduce.

Especially if every customer interaction makes the dataset better.

Imagine replacing your email app.

Easy.

Now imagine replacing:

your accounting system,

ERP,

payment infrastructure,

customer database,

or hospital records system.

Much harder.

Why?

Because the system has become embedded in the customer''s operations.

The more deeply integrated a product becomes, the harder it can be to remove.

Some businesses become cheaper to operate as they grow.

A factory can spread fixed costs across more units.

A cloud infrastructure company can spread enormous infrastructure investments across millions of customers.

A logistics network can become more efficient as density increases.

Scale can therefore create an advantage that smaller competitors struggle to reproduce.

Imagine two companies have identical products.

One has:

10 million customers.

The other has:

100,000.

If the first company can launch a new product to its existing audience at almost no incremental acquisition cost, it has an enormous advantage.

Distribution is often underestimated.

Having a great product is one thing.

Being able to reliably put it in front of customers is another.

Some industries require:

licenses,

certifications,

capital requirements,

regulatory approvals,

or infrastructure permissions.

These barriers can make entry difficult.

That doesn''t automatically make the incumbent a great business.

But it can protect existing economics.

A competitor cannot instantly reproduce:

a national fiber network,

a power grid,

a large warehouse network,

a manufacturing facility,

a port,

or a data-center footprint.

Capital and time become barriers.

This is one reason infrastructure businesses can be defensible.

The most powerful businesses may combine several.

More customers →

more data →

better product →

more customers.

Or:

more users →

more liquidity →

more transactions →

more users.

Or:

more scale →

lower costs →

better prices →

more customers →

more scale.

That''s a flywheel.

And flywheels can become extremely difficult to stop once they are established.

This is critical.

Technology changes.

Consumer behavior changes.

Regulation changes.

New distribution channels appear.

A company can have an enormous moat today and lose it tomorrow.

BlackBerry had a powerful position.

Kodak had enormous brand recognition.

Nokia had scale.

Markets changed.

Their old advantages became less relevant.

The best investors therefore ask:

Will this moat still matter ten years from now?', 'Analysis from the Omniv Editorial desk.', 'Investors love the word moat. A company has a moat. A startup is building a moat.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"Investors love the word moat."},{"type":"paragraph","text":"A company has a moat."},{"type":"paragraph","text":"A startup is building a moat."},{"type":"paragraph","text":"The business has a defensible position."},{"type":"paragraph","text":"But what does that actually mean?"},{"type":"paragraph","text":"A moat is essentially a reason why another company cannot easily take your economics away from you."},{"type":"paragraph","text":"That''s it."},{"type":"paragraph","text":"The concept comes from the old defensive structure surrounding a castle."},{"type":"paragraph","text":"The castle isn''t valuable simply because it exists."},{"type":"paragraph","text":"It''s valuable because attacking it is difficult."},{"type":"paragraph","text":"Businesses can work the same way."},{"type":"heading","text":"Revenue isn''t a moat","level":2},{"type":"paragraph","text":"Being profitable isn''t necessarily a moat."},{"type":"paragraph","text":"Having a popular product isn''t necessarily a moat."},{"type":"paragraph","text":"Having lots of users isn''t necessarily a moat."},{"type":"paragraph","text":"Even being first isn''t necessarily a moat."},{"type":"paragraph","text":"A competitor can sometimes copy all of these."},{"type":"paragraph","text":"The real question is:"},{"type":"paragraph","text":"What makes your position difficult to attack?"},{"type":"heading","text":"Brand can be a moat","level":2},{"type":"paragraph","text":"Consider a company that has spent decades becoming trusted."},{"type":"paragraph","text":"Customers don''t simply buy its product."},{"type":"paragraph","text":"They associate the brand with:"},{"type":"paragraph","text":"quality,"},{"type":"paragraph","text":"status,"},{"type":"paragraph","text":"safety,"},{"type":"paragraph","text":"reliability,"},{"type":"paragraph","text":"or identity."},{"type":"paragraph","text":"A competitor can copy the product."},{"type":"paragraph","text":"It cannot instantly copy decades of accumulated trust."},{"type":"paragraph","text":"That''s a moat."},{"type":"heading","text":"Network effects can be a moat","level":2},{"type":"paragraph","text":"A network becomes more valuable as more participants join it."},{"type":"paragraph","text":"Social networks."},{"type":"paragraph","text":"Marketplaces."},{"type":"paragraph","text":"Payment systems."},{"type":"paragraph","text":"Professional networks."},{"type":"paragraph","text":"Messaging platforms."},{"type":"paragraph","text":"The product isn''t just the software."},{"type":"paragraph","text":"It''s the network."},{"type":"paragraph","text":"A competitor can copy the interface."},{"type":"paragraph","text":"But if everyone you need to interact with is already somewhere else, switching becomes difficult."},{"type":"paragraph","text":"That''s powerful."},{"type":"heading","text":"Data can become a moat","level":2},{"type":"paragraph","text":"But not all data is valuable."},{"type":"paragraph","text":"Public information isn''t necessarily defensible."},{"type":"paragraph","text":"The interesting data is often:"},{"type":"paragraph","text":"proprietary,"},{"type":"paragraph","text":"hard to collect,"},{"type":"paragraph","text":"continuously updated,"},{"type":"paragraph","text":"and directly useful to the product."},{"type":"paragraph","text":"A company that has accumulated years of unique operational data may be difficult to reproduce."},{"type":"paragraph","text":"Especially if every customer interaction makes the dataset better."},{"type":"heading","text":"Switching costs can be a moat","level":2},{"type":"paragraph","text":"Imagine replacing your email app."},{"type":"paragraph","text":"Easy."},{"type":"paragraph","text":"Now imagine replacing:"},{"type":"paragraph","text":"your accounting system,"},{"type":"paragraph","text":"ERP,"},{"type":"paragraph","text":"payment infrastructure,"},{"type":"paragraph","text":"customer database,"},{"type":"paragraph","text":"or hospital records system."},{"type":"paragraph","text":"Much harder."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"Because the system has become embedded in the customer''s operations."},{"type":"paragraph","text":"The more deeply integrated a product becomes, the harder it can be to remove."},{"type":"heading","text":"Economies of scale can create moats","level":2},{"type":"paragraph","text":"Some businesses become cheaper to operate as they grow."},{"type":"paragraph","text":"A factory can spread fixed costs across more units."},{"type":"paragraph","text":"A cloud infrastructure company can spread enormous infrastructure investments across millions of customers."},{"type":"paragraph","text":"A logistics network can become more efficient as density increases."},{"type":"paragraph","text":"Scale can therefore create an advantage that smaller competitors struggle to reproduce."},{"type":"heading","text":"Distribution can be a moat","level":2},{"type":"paragraph","text":"Imagine two companies have identical products."},{"type":"paragraph","text":"One has:"},{"type":"paragraph","text":"10 million customers."},{"type":"paragraph","text":"The other has:"},{"type":"paragraph","text":"100,000."},{"type":"paragraph","text":"If the first company can launch a new product to its existing audience at almost no incremental acquisition cost, it has an enormous advantage."},{"type":"paragraph","text":"Distribution is often underestimated."},{"type":"paragraph","text":"Having a great product is one thing."},{"type":"paragraph","text":"Being able to reliably put it in front of customers is another."},{"type":"heading","text":"Regulation can create moats too","level":2},{"type":"paragraph","text":"Some industries require:"},{"type":"paragraph","text":"licenses,"},{"type":"paragraph","text":"certifications,"},{"type":"paragraph","text":"capital requirements,"},{"type":"paragraph","text":"regulatory approvals,"},{"type":"paragraph","text":"or infrastructure permissions."},{"type":"paragraph","text":"These barriers can make entry difficult."},{"type":"paragraph","text":"That doesn''t automatically make the incumbent a great business."},{"type":"paragraph","text":"But it can protect existing economics."},{"type":"heading","text":"Physical infrastructure can be a moat","level":2},{"type":"paragraph","text":"A competitor cannot instantly reproduce:"},{"type":"paragraph","text":"a national fiber network,"},{"type":"paragraph","text":"a power grid,"},{"type":"paragraph","text":"a large warehouse network,"},{"type":"paragraph","text":"a manufacturing facility,"},{"type":"paragraph","text":"a port,"},{"type":"paragraph","text":"or a data-center footprint."},{"type":"paragraph","text":"Capital and time become barriers."},{"type":"paragraph","text":"This is one reason infrastructure businesses can be defensible."},{"type":"heading","text":"The strongest moats often reinforce themselves","level":2},{"type":"paragraph","text":"The most powerful businesses may combine several."},{"type":"paragraph","text":"More customers →"},{"type":"paragraph","text":"more data →"},{"type":"paragraph","text":"better product →"},{"type":"paragraph","text":"more customers."},{"type":"paragraph","text":"Or:"},{"type":"paragraph","text":"more users →"},{"type":"paragraph","text":"more liquidity →"},{"type":"paragraph","text":"more transactions →"},{"type":"paragraph","text":"more users."},{"type":"paragraph","text":"Or:"},{"type":"paragraph","text":"more scale →"},{"type":"paragraph","text":"lower costs →"},{"type":"paragraph","text":"better prices →"},{"type":"paragraph","text":"more customers →"},{"type":"paragraph","text":"more scale."},{"type":"paragraph","text":"That''s a flywheel."},{"type":"paragraph","text":"And flywheels can become extremely difficult to stop once they are established."},{"type":"heading","text":"A moat isn''t permanent","level":2},{"type":"paragraph","text":"This is critical."},{"type":"paragraph","text":"Technology changes."},{"type":"paragraph","text":"Consumer behavior changes."},{"type":"paragraph","text":"Regulation changes."},{"type":"paragraph","text":"New distribution channels appear."},{"type":"paragraph","text":"A company can have an enormous moat today and lose it tomorrow."},{"type":"paragraph","text":"BlackBerry had a powerful position."},{"type":"paragraph","text":"Kodak had enormous brand recognition."},{"type":"paragraph","text":"Nokia had scale."},{"type":"paragraph","text":"Markets changed."},{"type":"paragraph","text":"Their old advantages became less relevant."},{"type":"paragraph","text":"The best investors therefore ask:"},{"type":"paragraph","text":"Will this moat still matter ten years from now?"}]'::jsonb, 'MONEY', 3, 'published', 'What Investors Actually Mean When They Say "Moat" | Omniv Editorial', 'Investors love the word moat. A company has a moat. A startup is building a moat.', 'https://omniv.media/p/what-investors-actually-mean-when-they-say-moat', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"biology","label":"Biology"}]'::jsonb, '{}'::text[], '{money,artificial-intelligence,data-centres,infrastructure,startups,investing}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z'),
((select id from public.discovery_entities where type='company' and slug='omniv'), 'Omniv Editorial', 'article', 'why-timing-matters-more-than-most-founders-admit', 'Why Timing Matters More Than Most Founders Admit', 'A great idea can fail. A mediocre idea can become enormous. The difference isn''t always execution.', 'A great idea can fail.

A mediocre idea can become enormous.

The difference isn''t always execution.

Sometimes it''s timing.

You can build the right product for the wrong moment.

And the market simply isn''t ready.

Imagine someone invents a product that requires:

fast mobile internet,

cheap smartphones,

digital payments,

and widespread cloud computing.

Build it in 2005.

It might fail.

Build essentially the same concept fifteen years later.

It might explode.

The product didn''t necessarily become brilliant.

The environment changed.

A market becomes attractive when several things line up.

Technology.

Consumer behavior.

Infrastructure.

Capital.

Regulation.

Distribution.

Cultural acceptance.

Price.

When enough of those variables move in the same direction, previously difficult businesses become possible.

That''s timing.

The concept of ordering transportation wasn''t new.

But smartphones changed:

location,

communication,

payments,

and coordination.

The technology created a new economic possibility.

Without the underlying infrastructure, the business would have been dramatically harder.

People had spare rooms long before Airbnb.

Travelers needed accommodation long before Airbnb.

The missing pieces included:

online discovery,

digital payments,

reviews,

identity,

and a mechanism for trust.

When enough of those pieces existed simultaneously, the market could scale.

AI research has existed for decades.

Neural networks aren''t new.

Machine learning isn''t new.

But several things changed:

compute became dramatically more capable,

data became abundant,

cloud infrastructure matured,

models improved,

and consumer interfaces became accessible.

Suddenly technologies that existed for years became commercially explosive.

That''s timing.

This is one of the hardest entrepreneurial lessons.

If the market isn''t ready, customers don''t necessarily tell you:

"Come back in five years."

They simply say:

"No."

So an entrepreneur can interpret market rejection as evidence that the idea is bad.

Sometimes it is.

But sometimes the timing is wrong.

Founders sometimes tell themselves:

"The market just isn''t ready."

That can become an excuse.

Maybe customers don''t want the product.

Maybe the problem isn''t painful.

Maybe the economics don''t work.

Maybe the technology is fundamentally limited.

The entrepreneur has to distinguish:

wrong idea

from

right idea, wrong time.

That''s extremely difficult.

Imagine a market is growing 2% per year.

Building a company there might be difficult.

Now imagine the market begins growing 30% annually.

The same product becomes much easier to scale.

Why?

Because the market itself is pulling the company forward.

You don''t have to steal every customer from competitors.

New customers are entering the category continuously.

A powerful way to think about timing is:

What is becoming inevitable?

Not guaranteed.

Inevitable may be too strong.

But directionally difficult to reverse.

Examples might include:

digitization,

urbanization,

aging populations,

AI adoption,

electrification,

data-center growth,

mobile payments,

renewable energy,

automation,

or increasing demand for connectivity.

Entrepreneurs who identify structural trends can position themselves before the market fully matures.

"AI is growing" isn''t a business.

"Energy demand is increasing" isn''t a business.

"Africa has a young population" isn''t a business.

These are trends.

The entrepreneur''s job is to identify:

where the economic bottleneck created by the trend appears.

If AI grows, what becomes scarce?

If cities grow, what becomes scarce?

If electricity demand grows, what becomes scarce?

If businesses digitize, what becomes difficult?

That''s where opportunities appear.

This is particularly important.

Sometimes the consumer demand already exists.

The infrastructure simply hasn''t caught up.

Then infrastructure becomes the timing signal.

For example:

More AI adoption →

more compute demand →

more data centers →

more electricity demand →

more grid pressure →

more need for energy infrastructure.

The original trend creates second- and third-order opportunities.

That''s where sophisticated entrepreneurs look.

There isn''t just one timeline.

There is the:

technology clock

What is becoming possible?

The:

customer clock

What are people beginning to expect?

The:

capital clock

Where is money flowing?

The:

infrastructure clock

What is becoming available?

The:

regulatory clock

What is becoming permitted or restricted?

And the:

competitive clock

Who is moving?

When several clocks align, the opportunity can become unusually attractive.

If you''re entering a market before infrastructure exists, you may need enormous capital.

If you enter after infrastructure is built, you can sometimes build on top of it much more cheaply.

That''s why entrepreneurs need to ask:

What has become cheap enough, fast enough, or accessible enough to make this business possible now?

The answer often reveals why now matters.

A strong entrepreneur should be able to explain:

Why this problem?

Why this customer?

Why this solution?

Why this market?

And most importantly:

Why now?

If the answer is simply:

"Because it''s a good idea."

That''s weak.

If the answer is:

"Because five structural changes just made this possible."

Now you''re looking at a thesis.

Entrepreneurship isn''t just about seeing where the world is.

It''s about seeing where the world is going.

And then asking:

What will become more valuable as it gets there?

That''s where timing becomes powerful.

You don''t necessarily want to build where the market is today.

You want to understand where the market is moving—and determine whether you can arrive early enough to matter without arriving so early that the market cannot support you.

That narrow window is where some of the greatest companies are built.

Solo-founder economy

→ lowers the cost of building.

AI

→ lowers the cost of execution.

Africa

→ creates markets where major systems are still being built.

Broken infrastructure

→ reveals underserved opportunities.

Moats

→ determine which companies can defend those opportunities.

Timing

→ determines whether the opportunity is ready now.

And that leads to the bigger question behind all of them:

When you look at a changing world, how do you know which opportunity is actually worth building?

That''s where the next layer of Omniv''s entrepreneurship content gets much more interesting: finding the opportunity before everyone else sees it.', 'Analysis from the Omniv Editorial desk.', 'A great idea can fail. A mediocre idea can become enormous. The difference isn''t always execution.', '[{"type":"callout","title":"Editorial note","text":"This is Omniv Editorial analysis based on the supplied manuscript. It distinguishes argument from documented fact and does not claim independent reporting where source links are not provided."},{"type":"paragraph","text":"A great idea can fail."},{"type":"paragraph","text":"A mediocre idea can become enormous."},{"type":"paragraph","text":"The difference isn''t always execution."},{"type":"paragraph","text":"Sometimes it''s timing."},{"type":"paragraph","text":"You can build the right product for the wrong moment."},{"type":"paragraph","text":"And the market simply isn''t ready."},{"type":"heading","text":"The market has to catch up","level":2},{"type":"paragraph","text":"Imagine someone invents a product that requires:"},{"type":"paragraph","text":"fast mobile internet,"},{"type":"paragraph","text":"cheap smartphones,"},{"type":"paragraph","text":"digital payments,"},{"type":"paragraph","text":"and widespread cloud computing."},{"type":"paragraph","text":"Build it in 2005."},{"type":"paragraph","text":"It might fail."},{"type":"paragraph","text":"Build essentially the same concept fifteen years later."},{"type":"paragraph","text":"It might explode."},{"type":"paragraph","text":"The product didn''t necessarily become brilliant."},{"type":"paragraph","text":"The environment changed."},{"type":"heading","text":"Timing is about conditions","level":2},{"type":"paragraph","text":"A market becomes attractive when several things line up."},{"type":"paragraph","text":"Technology."},{"type":"paragraph","text":"Consumer behavior."},{"type":"paragraph","text":"Infrastructure."},{"type":"paragraph","text":"Capital."},{"type":"paragraph","text":"Regulation."},{"type":"paragraph","text":"Distribution."},{"type":"paragraph","text":"Cultural acceptance."},{"type":"paragraph","text":"Price."},{"type":"paragraph","text":"When enough of those variables move in the same direction, previously difficult businesses become possible."},{"type":"paragraph","text":"That''s timing."},{"type":"heading","text":"Uber needed smartphones","level":2},{"type":"paragraph","text":"The concept of ordering transportation wasn''t new."},{"type":"paragraph","text":"But smartphones changed:"},{"type":"paragraph","text":"location,"},{"type":"paragraph","text":"communication,"},{"type":"paragraph","text":"payments,"},{"type":"paragraph","text":"and coordination."},{"type":"paragraph","text":"The technology created a new economic possibility."},{"type":"paragraph","text":"Without the underlying infrastructure, the business would have been dramatically harder."},{"type":"heading","text":"Airbnb needed trust infrastructure","level":2},{"type":"paragraph","text":"People had spare rooms long before Airbnb."},{"type":"paragraph","text":"Travelers needed accommodation long before Airbnb."},{"type":"paragraph","text":"The missing pieces included:"},{"type":"paragraph","text":"online discovery,"},{"type":"paragraph","text":"digital payments,"},{"type":"paragraph","text":"reviews,"},{"type":"paragraph","text":"identity,"},{"type":"paragraph","text":"and a mechanism for trust."},{"type":"paragraph","text":"When enough of those pieces existed simultaneously, the market could scale."},{"type":"heading","text":"AI is another timing story","level":2},{"type":"paragraph","text":"AI research has existed for decades."},{"type":"paragraph","text":"Neural networks aren''t new."},{"type":"paragraph","text":"Machine learning isn''t new."},{"type":"paragraph","text":"But several things changed:"},{"type":"paragraph","text":"compute became dramatically more capable,"},{"type":"paragraph","text":"data became abundant,"},{"type":"paragraph","text":"cloud infrastructure matured,"},{"type":"paragraph","text":"models improved,"},{"type":"paragraph","text":"and consumer interfaces became accessible."},{"type":"paragraph","text":"Suddenly technologies that existed for years became commercially explosive."},{"type":"paragraph","text":"That''s timing."},{"type":"heading","text":"Being early can look exactly like being wrong","level":2},{"type":"paragraph","text":"This is one of the hardest entrepreneurial lessons."},{"type":"paragraph","text":"If the market isn''t ready, customers don''t necessarily tell you:"},{"type":"paragraph","text":"\"Come back in five years.\""},{"type":"paragraph","text":"They simply say:"},{"type":"paragraph","text":"\"No.\""},{"type":"paragraph","text":"So an entrepreneur can interpret market rejection as evidence that the idea is bad."},{"type":"paragraph","text":"Sometimes it is."},{"type":"paragraph","text":"But sometimes the timing is wrong."},{"type":"heading","text":"But \"too early\" is dangerous to romanticize","level":2},{"type":"paragraph","text":"Founders sometimes tell themselves:"},{"type":"paragraph","text":"\"The market just isn''t ready.\""},{"type":"paragraph","text":"That can become an excuse."},{"type":"paragraph","text":"Maybe customers don''t want the product."},{"type":"paragraph","text":"Maybe the problem isn''t painful."},{"type":"paragraph","text":"Maybe the economics don''t work."},{"type":"paragraph","text":"Maybe the technology is fundamentally limited."},{"type":"paragraph","text":"The entrepreneur has to distinguish:"},{"type":"paragraph","text":"wrong idea"},{"type":"paragraph","text":"from"},{"type":"paragraph","text":"right idea, wrong time."},{"type":"paragraph","text":"That''s extremely difficult."},{"type":"heading","text":"Timing can create asymmetric opportunity","level":2},{"type":"paragraph","text":"Imagine a market is growing 2% per year."},{"type":"paragraph","text":"Building a company there might be difficult."},{"type":"paragraph","text":"Now imagine the market begins growing 30% annually."},{"type":"paragraph","text":"The same product becomes much easier to scale."},{"type":"paragraph","text":"Why?"},{"type":"paragraph","text":"Because the market itself is pulling the company forward."},{"type":"paragraph","text":"You don''t have to steal every customer from competitors."},{"type":"paragraph","text":"New customers are entering the category continuously."},{"type":"heading","text":"Follow the underlying trend","level":2},{"type":"paragraph","text":"A powerful way to think about timing is:"},{"type":"paragraph","text":"What is becoming inevitable?"},{"type":"paragraph","text":"Not guaranteed."},{"type":"paragraph","text":"Inevitable may be too strong."},{"type":"paragraph","text":"But directionally difficult to reverse."},{"type":"paragraph","text":"Examples might include:"},{"type":"paragraph","text":"digitization,"},{"type":"paragraph","text":"urbanization,"},{"type":"paragraph","text":"aging populations,"},{"type":"paragraph","text":"AI adoption,"},{"type":"paragraph","text":"electrification,"},{"type":"paragraph","text":"data-center growth,"},{"type":"paragraph","text":"mobile payments,"},{"type":"paragraph","text":"renewable energy,"},{"type":"paragraph","text":"automation,"},{"type":"paragraph","text":"or increasing demand for connectivity."},{"type":"paragraph","text":"Entrepreneurs who identify structural trends can position themselves before the market fully matures."},{"type":"heading","text":"But don''t confuse trends with businesses","level":2},{"type":"paragraph","text":"\"AI is growing\" isn''t a business."},{"type":"paragraph","text":"\"Energy demand is increasing\" isn''t a business."},{"type":"paragraph","text":"\"Africa has a young population\" isn''t a business."},{"type":"paragraph","text":"These are trends."},{"type":"paragraph","text":"The entrepreneur''s job is to identify:"},{"type":"paragraph","text":"where the economic bottleneck created by the trend appears."},{"type":"paragraph","text":"If AI grows, what becomes scarce?"},{"type":"paragraph","text":"If cities grow, what becomes scarce?"},{"type":"paragraph","text":"If electricity demand grows, what becomes scarce?"},{"type":"paragraph","text":"If businesses digitize, what becomes difficult?"},{"type":"paragraph","text":"That''s where opportunities appear."},{"type":"heading","text":"Timing and infrastructure are connected","level":2},{"type":"paragraph","text":"This is particularly important."},{"type":"paragraph","text":"Sometimes the consumer demand already exists."},{"type":"paragraph","text":"The infrastructure simply hasn''t caught up."},{"type":"paragraph","text":"Then infrastructure becomes the timing signal."},{"type":"paragraph","text":"For example:"},{"type":"paragraph","text":"More AI adoption →"},{"type":"paragraph","text":"more compute demand →"},{"type":"paragraph","text":"more data centers →"},{"type":"paragraph","text":"more electricity demand →"},{"type":"paragraph","text":"more grid pressure →"},{"type":"paragraph","text":"more need for energy infrastructure."},{"type":"paragraph","text":"The original trend creates second- and third-order opportunities."},{"type":"paragraph","text":"That''s where sophisticated entrepreneurs look."},{"type":"heading","text":"The best founders watch multiple clocks","level":2},{"type":"paragraph","text":"There isn''t just one timeline."},{"type":"paragraph","text":"There is the:"},{"type":"paragraph","text":"technology clock"},{"type":"paragraph","text":"What is becoming possible?"},{"type":"paragraph","text":"The:"},{"type":"paragraph","text":"customer clock"},{"type":"paragraph","text":"What are people beginning to expect?"},{"type":"paragraph","text":"The:"},{"type":"paragraph","text":"capital clock"},{"type":"paragraph","text":"Where is money flowing?"},{"type":"paragraph","text":"The:"},{"type":"paragraph","text":"infrastructure clock"},{"type":"paragraph","text":"What is becoming available?"},{"type":"paragraph","text":"The:"},{"type":"paragraph","text":"regulatory clock"},{"type":"paragraph","text":"What is becoming permitted or restricted?"},{"type":"paragraph","text":"And the:"},{"type":"paragraph","text":"competitive clock"},{"type":"paragraph","text":"Who is moving?"},{"type":"paragraph","text":"When several clocks align, the opportunity can become unusually attractive."},{"type":"heading","text":"Timing also determines how much money you need","level":2},{"type":"paragraph","text":"If you''re entering a market before infrastructure exists, you may need enormous capital."},{"type":"paragraph","text":"If you enter after infrastructure is built, you can sometimes build on top of it much more cheaply."},{"type":"paragraph","text":"That''s why entrepreneurs need to ask:"},{"type":"paragraph","text":"What has become cheap enough, fast enough, or accessible enough to make this business possible now?"},{"type":"paragraph","text":"The answer often reveals why now matters."},{"type":"heading","text":"The best startup thesis contains a \"why now\"","level":2},{"type":"paragraph","text":"A strong entrepreneur should be able to explain:"},{"type":"paragraph","text":"Why this problem?"},{"type":"paragraph","text":"Why this customer?"},{"type":"paragraph","text":"Why this solution?"},{"type":"paragraph","text":"Why this market?"},{"type":"paragraph","text":"And most importantly:"},{"type":"paragraph","text":"Why now?"},{"type":"paragraph","text":"If the answer is simply:"},{"type":"paragraph","text":"\"Because it''s a good idea.\""},{"type":"paragraph","text":"That''s weak."},{"type":"paragraph","text":"If the answer is:"},{"type":"paragraph","text":"\"Because five structural changes just made this possible.\""},{"type":"paragraph","text":"Now you''re looking at a thesis."},{"type":"heading","text":"The deeper lesson","level":2},{"type":"paragraph","text":"Entrepreneurship isn''t just about seeing where the world is."},{"type":"paragraph","text":"It''s about seeing where the world is going."},{"type":"paragraph","text":"And then asking:"},{"type":"paragraph","text":"What will become more valuable as it gets there?"},{"type":"paragraph","text":"That''s where timing becomes powerful."},{"type":"paragraph","text":"You don''t necessarily want to build where the market is today."},{"type":"paragraph","text":"You want to understand where the market is moving—and determine whether you can arrive early enough to matter without arriving so early that the market cannot support you."},{"type":"paragraph","text":"That narrow window is where some of the greatest companies are built."},{"type":"heading","text":"The six ideas connect into one larger thesis","level":3},{"type":"paragraph","text":"Solo-founder economy"},{"type":"paragraph","text":"→ lowers the cost of building."},{"type":"paragraph","text":"AI"},{"type":"paragraph","text":"→ lowers the cost of execution."},{"type":"paragraph","text":"Africa"},{"type":"paragraph","text":"→ creates markets where major systems are still being built."},{"type":"paragraph","text":"Broken infrastructure"},{"type":"paragraph","text":"→ reveals underserved opportunities."},{"type":"paragraph","text":"Moats"},{"type":"paragraph","text":"→ determine which companies can defend those opportunities."},{"type":"paragraph","text":"Timing"},{"type":"paragraph","text":"→ determines whether the opportunity is ready now."},{"type":"paragraph","text":"And that leads to the bigger question behind all of them:"},{"type":"paragraph","text":"When you look at a changing world, how do you know which opportunity is actually worth building?"},{"type":"paragraph","text":"That''s where the next layer of Omniv''s entrepreneurship content gets much more interesting: finding the opportunity before everyone else sees it."}]'::jsonb, 'PEOPLE', 5, 'published', 'Why Timing Matters More Than Most Founders Admit | Omniv Editorial', 'A great idea can fail. A mediocre idea can become enormous. The difference isn''t always execution.', 'https://omniv.media/p/why-timing-matters-more-than-most-founders-admit', '[{"name":"Omniv Editorial","title":"Editorial disclosure and source policy","url":"https://omniv.media"}]'::jsonb, 'This article is editorial analysis. Verify consequential claims against primary sources before relying on them as fact.', 'Which parts of this argument are documented fact, and which are analysis or uncertainty?', '[{"type":"project","slug":"russia","label":"Russia"},{"type":"project","slug":"artificial-intelligence","label":"Artificial Intelligence"},{"type":"project","slug":"data-centres","label":"Data Centres"},{"type":"project","slug":"infrastructure","label":"Infrastructure"},{"type":"project","slug":"startups","label":"Startups"},{"type":"project","slug":"investing","label":"Investing"},{"type":"project","slug":"biology","label":"Biology"},{"type":"project","slug":"africa","label":"Africa"}]'::jsonb, '{}'::text[], '{people,russia,artificial-intelligence,data-centres,infrastructure,startups}', 'Omniv Editorial · analysis', 50, '2026-09-29T09:00:00Z')
on conflict (slug) do update set publisher_id=excluded.publisher_id, publisher_name=excluded.publisher_name, title=excluded.title, summary=excluded.summary, body=excluded.body, subtitle=excluded.subtitle, excerpt=excluded.excerpt, content=excluded.content, category_id=excluded.category_id, reading_time=excluded.reading_time, status='published', seo_title=excluded.seo_title, seo_description=excluded.seo_description, canonical_url=excluded.canonical_url, sources=excluded.sources, what_this_means=excluded.what_this_means, question_nobody_asks=excluded.question_nobody_asks, entity_refs=excluded.entity_refs, tags=excluded.tags, meta=excluded.meta, heat=excluded.heat, published_at=excluded.published_at, updated_at=now();
commit;

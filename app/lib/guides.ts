import type {Article} from './journal';

/**
 * Gift guides. These answer the questions people actually type into a search
 * box or ask an assistant ("gift for someone who moved away", "Rust Belt
 * gifts"), so each one leads with a plain answer, links into real products,
 * and ends with a short FAQ that renders as FAQPage structured data.
 *
 * Every handle here is checked against the live catalogue. Links in body
 * paragraphs use [text](/path) and render as internal links.
 */
export const GUIDES: Article[] = [
  {
    slug: 'gifts-for-someone-who-moved-away-from-home',
    title: 'Gifts for someone who moved away from home',
    dek: 'The short answer is a souvenir from the place they left. The long answer is below, along with why it works better than a candle.',
    date: '2026-11-25',
    readingMinutes: 4,
    relatedHandles: [
      'moose-jaw-sk-greetings',
      'sudbury-on-varsity',
      'erie-pa-i-heart',
      'duluth-mn-tour',
      'gander-nl-greetings',
      'butte-mt-varsity',
      'brandon-mb-i-heart',
      'utica-ny-greetings',
    ],
    body: [
      'The best gift for someone who moved away is something from the town they moved away from. Not something about home in general. Their town, by name, the one they complain about and defend in the same breath. A shirt with it printed across the chest does a job no candle can: it lets them say where they are from without having to bring it up.',
      '## Why a hometown shirt works',
      'People who leave a small town spend years explaining it. Where it is, what it is near, why they left, why they still go back at Christmas. A souvenir shirt answers all of that before anyone asks. It is also a garment, which means it gets worn, which means it gets noticed, which is the entire point. A framed print of the old main street goes on a wall in a hallway. A shirt goes to the grocery store.',
      'It works best for the towns nobody sells souvenirs for. Anyone can buy a Toronto shirt at the airport. Nobody has ever been able to buy a [Sudbury](/collections/ontario) shirt that treats the Big Nickel with the reverence it is owed, and that gap is exactly where we work. We carry more than 650 towns across Canada and the US, most of which have never had a souvenir of any kind.',
      '## How to choose',
      'Start with the town they still call home when someone asks, which is not always the town they were born in. Then pick a style. [Varsity](/collections/varsity) is arched college lettering and reads as quietly proud. [Greetings](/collections/greetings) is the big-letter postcard and reads as affectionate. [I Heart](/collections/i-heart) is the oldest declaration in the souvenir trade and reads as sincere to the point of being funny. [Tour](/collections/tour) bills the town as the headline date and suits anyone who has ever called their hometown a scene.',
      'For size, the shirts are a relaxed unisex cut on a garment-dyed heavyweight blank. Most people take their usual size. If they like a looser, borrowed-from-a-dad fit, go one up. The [size guide](/size-guide) has the measurements.',
      '## If they moved from a town we do not carry yet',
      'Tell us. The [request list](/request-a-town) decides what we print next, and a town with enough requests moves up the queue. We will email you when it is ready, which is a perfectly respectable gift in itself if the timing works.',
      '## The part about money',
      'Each shirt is $36 USD. Two shirts are 15% off, three or more are 20% off, applied automatically at checkout. That makes the obvious move buying one for them and one for whoever else left the same town, which is usually a sibling. Shipping to Canada and the US is $6.95, and free on orders of $60 or more.',
    ],
    faq: [
      {
        q: 'What is a good gift for someone who moved away from their hometown?',
        a: 'A souvenir from that specific town, ideally something they will use every week. A hometown t-shirt works well because it gets worn and starts the conversation about where they are from without them having to.',
      },
      {
        q: 'Can I get a souvenir shirt for a small town?',
        a: 'Yes. Mediocre Souvenir Co. makes souvenir t-shirts for more than 650 overlooked towns in Canada and the US, from Moose Jaw to Matewan. If a town is not in the catalogue yet, you can request it.',
      },
      {
        q: 'How long does a hometown shirt take to arrive?',
        a: 'Each shirt is printed to order. Allow about 8 to 18 business days to the US and 11 to 22 to Canada, including printing.',
      },
      {
        q: 'Can I return it if the size is wrong?',
        a: 'Yes. Returns are accepted within 30 days of delivery with no restocking fee.',
      },
    ],
  },
  {
    slug: 'trans-canada-highway-souvenirs',
    title: 'The Trans-Canada Highway, one souvenir per stop',
    dek: 'A coast-to-coast road trip through the towns the highway passes on its way somewhere else, each with a shirt that says you stopped.',
    date: '2026-11-24',
    readingMinutes: 5,
    relatedHandles: [
      'kamloops-bc-varsity',
      'medicine-hat-ab-greetings',
      'swift-current-sk-i-heart',
      'moose-jaw-sk-tour',
      'brandon-mb-varsity',
      'kenora-on-greetings',
      'thunder-bay-on-i-heart',
      'sault-ste-marie-on-tour',
      'moncton-nb-greetings',
      'truro-ns-i-heart',
      'gander-nl-greetings',
    ],
    body: [
      'The Trans-Canada Highway runs nearly 8,000 kilometres from Victoria to St. John’s, and most of the people who drive it are trying to get to the end. The towns along the way are where they stop for gas. This guide is for the stops.',
      '## British Columbia and the Prairies',
      'Kamloops sits where the North and South Thompson rivers meet, in country dry enough that first-time visitors assume they have taken a wrong turn into somewhere hotter. It is the first real city east of the coast mountains and is treated accordingly, as a place to refuel. We disagree with the treatment, not the refuelling.',
      'Medicine Hat has the Saamis Tepee, the tallest tepee in the world, visible from the highway and almost never stopped for. Swift Current is the stop between Medicine Hat and Moose Jaw that nobody plans and everybody makes. Moose Jaw has a giant moose statue by the visitor centre and a network of tunnels under its downtown with a history colourful enough to fill a gift shop of its own, which it does.',
      'Brandon is Manitoba’s second city, a phrase that does a lot of quiet work. It is where the highway meets the Assiniboine and the prairie starts to think about becoming something else.',
      '## Northern Ontario',
      'Kenora is where the highway reaches Lake of the Woods and Ontario begins, and where Ontario goes on for the next day and a half. Thunder Bay has the Sleeping Giant across the harbour and the Terry Fox monument above it, which is the most affecting roadside stop in the country and should be treated as such. Sault Ste. Marie has the locks and a view of Michigan, which it is polite about.',
      'See the full [Ontario rack](/collections/ontario) for Sudbury, Timmins, North Bay and the rest of the north.',
      '## The Maritimes and the Rock',
      'Moncton has Magnetic Hill, where a car in neutral appears to roll uphill. Science has an explanation and Moncton has a gift shop, and only one of them is open on Sunday. Truro is the hub town where every Nova Scotia road eventually meets every other one. Gander, near the end of the line, became the town that took in thousands of stranded air passengers in September 2001 and has been quietly famous for its kindness ever since.',
      '## Collecting the set',
      'Two shirts are 15% off and three or more are 20% off, so a road trip is the rare case where buying a souvenir at every stop is the financially responsible option. Shipping to Canada is $6.95, free on orders of $60 or more. The whole [Canada collection](/collections/canada) covers every province and territory.',
    ],
    faq: [
      {
        q: 'What are good souvenirs from a Trans-Canada Highway road trip?',
        a: 'Souvenirs from the towns you actually stopped in, rather than the big cities at either end. Mediocre Souvenir Co. makes faux-vintage t-shirts for Trans-Canada towns including Kamloops, Medicine Hat, Swift Current, Moose Jaw, Brandon, Kenora, Thunder Bay, Sault Ste. Marie, Moncton, Truro and Gander.',
      },
      {
        q: 'Is there a discount for buying several souvenir shirts?',
        a: 'Yes. Two shirts are 15% off and three or more are 20% off, applied automatically at checkout. You can mix any towns and styles.',
      },
    ],
  },
  {
    slug: 'rust-belt-gift-guide',
    title: 'A Rust Belt gift guide',
    dek: 'For people from the cities that made the things that made the twentieth century, and who are tired of explaining that to people from elsewhere.',
    date: '2026-11-23',
    readingMinutes: 4,
    relatedHandles: [
      'toledo-oh-varsity',
      'akron-oh-greetings',
      'dayton-oh-i-heart',
      'youngstown-oh-varsity',
      'flint-mi-varsity',
      'erie-pa-greetings',
      'scranton-pa-i-heart',
      'buffalo-ny-tour',
      'gary-in-greetings',
      'rockford-il-i-heart',
    ],
    body: [
      'The Rust Belt is a name given to a region by people who did not live in it. The people who do live there tend to describe it by city, and by what the city made. This guide does the same.',
      '## Ohio',
      'Toledo made glass for a century and has the museum to prove it. Akron made tyres, enough of them to call itself the rubber capital of the world without anyone seriously disputing it. Dayton is where two bicycle mechanics taught themselves to fly, and it would like that mentioned more often. Youngstown made steel, and the people from Youngstown are as durable as the product. The full [Ohio rack](/collections/ohio) has the rest of the state.',
      '## Michigan, Pennsylvania and New York',
      'Flint is the birthplace of General Motors and is owed more than the last few decades have paid it. Erie has Presque Isle and a lake-effect snow total it brings up unprompted. Scranton was a coal city long before it was a television setting, and residents would like both facts kept in proportion. Buffalo has the wings, the snow, the architecture, and the most loyal football fans in the country. Browse [Michigan](/collections/michigan), [Pennsylvania](/collections/pennsylvania) and [New York](/collections/new-york).',
      '## Indiana and Illinois',
      'Gary was built from nothing in 1906 by a steel company and has a national park of dunes on its doorstep that surprises everyone who has only read the headlines. Rockford made the tools that made the machines. See [Indiana](/collections/indiana) and [Illinois](/collections/illinois).',
      '## Why these make good gifts',
      'Because nobody else sells them. A city of a hundred thousand people with a century of industry behind it will usually have a sports team shirt and nothing else. A souvenir shirt says something different: not that you support the team, but that you are from the place, and that the place deserves a souvenir. Every shirt is printed on a garment-dyed Comfort Colors 1717 heavyweight, which already looks like it has been through a few winters.',
    ],
    faq: [
      {
        q: 'What are good gifts for someone from a Rust Belt city?',
        a: 'Something that names their actual city, not the region. Mediocre Souvenir Co. makes faux-vintage souvenir t-shirts for Rust Belt cities including Toledo, Akron, Dayton, Youngstown, Flint, Erie, Scranton, Buffalo, Gary and Rockford, at $36 USD each.',
      },
      {
        q: 'Where can I buy a vintage-style shirt for my hometown?',
        a: 'Mediocre Souvenir Co. sells faux-vintage souvenir t-shirts for more than 650 towns and cities in Canada and the United States, printed to order on garment-dyed heavyweight cotton.',
      },
    ],
  },
  {
    slug: 'christmas-gifts-for-people-who-are-impossible-to-shop-for',
    title: 'Christmas gifts for people who are impossible to shop for',
    dek: 'They have everything, they want nothing, and they have never once been given a souvenir from their own hometown.',
    date: '2026-11-22',
    readingMinutes: 3,
    relatedHandles: [
      'punxsutawney-pa-i-heart',
      'fargo-nd-greetings',
      'sault-ste-marie-on-varsity',
      'moncton-nb-i-heart',
      'akron-oh-tour',
      'medicine-hat-ab-varsity',
    ],
    body: [
      'Every family has one. The father who says he does not need anything, the aunt who returns everything, the friend whose house already contains every object. These people are not impossible to shop for. They are impossible to surprise, which is a different problem with a different answer.',
      '## Give them something they could not have bought',
      'The trouble with the person who has everything is that they bought it themselves. What they have not done, and could not have done, is buy a souvenir shirt from the town they grew up in, because until recently nobody made one. A [hometown gift](/postcards/gifts-for-someone-who-moved-away-from-home) works on the hard-to-shop-for because it is about them rather than about stuff.',
      'If they are from somewhere with a single claim to fame, lean into it. [Punxsutawney](/collections/pennsylvania) has a groundhog. [Fargo](/collections/north-dakota) has a film that was mostly shot elsewhere. Medicine Hat has the world’s tallest tepee. They have heard all the jokes. A shirt that treats the place with total sincerity is the one joke they have not heard.',
      '## Timing',
      'Every shirt is printed to order, so give it time. Delivery takes about 8 to 18 business days to the US and 11 to 22 to Canada, including printing, which at the slow end is close to a month. Our honest advice for anything with a date attached is to order a month ahead. If Christmas is closer than that, order anyway and wrap a printed picture of the shirt: the real one turning up in January is, for this particular brand, entirely in character.',
      '## Buying for the whole family',
      'Two shirts are 15% off and three or more are 20% off, automatically. Families who all come from the same place tend to end up in matching shirts, which is either a lovely tradition or a photograph they will be shown at future weddings. Possibly both.',
    ],
    faq: [
      {
        q: 'What is a good Christmas gift for someone who has everything?',
        a: 'Something they could not have bought for themselves, like a souvenir from their own hometown. Mediocre Souvenir Co. makes souvenir t-shirts for more than 650 overlooked towns in Canada and the US.',
      },
      {
        q: 'When should I order a souvenir shirt to arrive by Christmas?',
        a: 'Shirts are printed to order and take about 8 to 18 business days to the US and 11 to 22 to Canada. For Christmas, order about a month ahead to be safe.',
      },
    ],
  },
];

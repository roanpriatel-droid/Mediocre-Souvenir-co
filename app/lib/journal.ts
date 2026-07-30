/**
 * The Journal — seeded editorial. Real substance in brand voice: deadpan,
 * affectionate, never mean, no exclamation points. Each article links back
 * into the catalog.
 */

export interface Article {
  slug: string;
  title: string;
  dek: string;
  date: string; // ISO
  readingMinutes: number;
  relatedHandles: string[];
  body: string[]; // paragraphs; lines starting with "## " render as h2
}

export const ARTICLES: Article[] = [
  {
    slug: 'a-postcard-from-toledo',
    title: 'A postcard from Toledo',
    dek: 'Ohio’s fourth-largest city, a glass museum nobody expects, and an afternoon that refused to become an anecdote.',
    date: '2026-07-24',
    readingMinutes: 3,
    relatedHandles: ['toledo-oh-varsity'],
    body: [
      'Toledo, Ohio sits at the western end of Lake Erie doing something most cities have given up on: existing at a reasonable scale. Two hundred and seventy thousand people, a river running through the middle of it, and a skyline that resolves in about four seconds from the interstate. You have driven past it. Almost everybody has driven past it — it is on the way from Detroit to almost anywhere, and being on the way is Toledo’s great structural misfortune.',
      'The thing nobody tells you is that Toledo has a glass museum, and the glass museum is genuinely, unarguably excellent. This is the sort of fact that ought to change a town’s reputation and never does. The city made glass for a century, made it well, and built a building to say so. Admission is free. On a Tuesday afternoon there were perhaps eleven people in it, all moving at the speed of people who have nowhere else to be.',
      '## The correct way to see it',
      'Drive in over the river. Eat something. Look at the glass. Leave without having formed a strong opinion. Toledo does not ask for a strong opinion and gets suspicious when offered one — it has spent decades being described by people passing through, and has developed the healthy indifference of a place that knows it will still be here after the sentence ends.',
      'We printed the shirt because a city of two hundred and seventy thousand with a hundred years of industry and a world-class collection of glass should not have to explain itself to anybody. It has a skyline. It has a river. It has a museum better than the one in your city. That is more than enough, and it is exactly the amount of enough that never makes a postcard.',
      'Wear it somewhere that has heard of Toledo and watch what happens. Usually nothing. Occasionally, someone from there.',
    ],
  },
  {
    slug: 'a-postcard-from-gary',
    title: 'A postcard from Gary',
    dek: 'A steel town on a great lake, thirty miles from Chicago and a world away from being mentioned in the same sentence.',
    date: '2026-07-22',
    readingMinutes: 3,
    relatedHandles: ['gary-in-varsity'],
    body: [
      'Gary, Indiana was built on purpose, in 1906, by a steel company that needed somewhere for the steel to happen. That is a rarer origin than it sounds. Most towns accumulate. Gary was drawn, sited, and named after a chairman of the board, which is the least romantic founding story available and also completely honest about what the twentieth century actually was.',
      'It sits on the southern shore of Lake Michigan with the Indiana Dunes to one side and Chicago glittering thirty miles up the shoreline, close enough to be permanently compared to and never confused with. The comparison has not been kind. It rarely is, when the other party is Chicago.',
      '## What is actually there',
      'A lakefront. Dunes that are a national park, which surprises people who have only read headlines. A grid of streets laid out by someone with a ruler and a deadline. And the specific quiet of a place that was once at the centre of the most important industrial economy on earth and is now mostly left to get on with it.',
      'We do not print a shirt for Gary as a comment. We print it because a city that made the steel for a century of American building is a city that earned a souvenir, and nobody in the souvenir business was ever going to get around to it. The reverence is the point. A town does not stop deserving commemoration because its best decade is behind it — by that standard almost nowhere qualifies, including most of the places that sell keychains.',
      'Greetings from Gary. It is on a great lake. It made the steel. That is the shirt.',
    ],
  },
  {
    slug: 'a-postcard-from-rockford',
    title: 'A postcard from Rockford',
    dek: 'Illinois, second city of the state by most counts, and a place that has quietly been good at things for a hundred and fifty years.',
    date: '2026-07-20',
    readingMinutes: 3,
    relatedHandles: ['rockford-il-varsity'],
    body: [
      'Rockford, Illinois is ninety miles from Chicago and gets described in relation to it roughly every time it is described at all. This is the fate of every mid-sized city within two hours of a large one, and Rockford wears it with the weary competence of a town that has been fine for a hundred and fifty years and expects to remain fine.',
      'It was a machine-tool town. Furniture before that. Fasteners, hardware, the sort of manufacturing that does not photograph well but holds a country together at the joints. There are cities that made famous things and cities that made the things that made the famous things. Rockford is emphatically the second kind, and the second kind never gets the shirt.',
      '## The river and the rest',
      'The Rock River runs through it, which is where the name comes from, which is the most straightforward etymology in the Midwest. There are gardens — an actual, formally excellent Japanese garden that people travel for and then describe, invariably, as "surprising for Rockford". Everything is surprising for Rockford. That is the whole problem with how Rockford gets talked about.',
      'A hundred and forty thousand people live there. They have opinions about where to eat and they are correct. The winters are real winters and nobody makes a performance of it.',
      'We printed it because "surprisingly good, consistently overlooked" is not a flaw in a town, it is a description of most towns, and the ones that fit it best are exactly the ones the souvenir industry decided to skip. Rockford has a river and a garden and a century of making the parts. Ours is a shirt that takes that entirely seriously.',
    ],
  },
  {
    slug: 'in-defense-of-the-water-tower',
    title: 'In defense of the water tower',
    dek: 'Every overlooked town has a landmark. It is usually the water tower. This is not a problem to be solved.',
    date: '2026-07-10',
    readingMinutes: 4,
    relatedHandles: ['trail-t-shirt', 'castlegar-t-shirt', 'kitimat-t-shirt'],
    body: [
      'There is a genre of civic architecture that never gets a postcard, and it is the genre that actually holds a town together. The water tower. The grain elevator. The curling rink with the roof that was redone in 1994 and is, by all accounts, holding. These are the buildings that appear when you type a small town’s name into an image search, usually photographed from the highway, usually a little crooked.',
      'Our badge has a water tower on it where a mountain should be. This was not an accident and it was not a bit. When we started drawing the mark, we tried mountains. Mountains are what souvenir logos are supposed to have — the implication being that you visited somewhere dramatic, somewhere that earned its merchandise through elevation. But the towns we commemorate mostly do not have a dramatic skyline. They have a water tower with the town’s name painted on it in a font nobody chose on purpose, repainted every couple of decades, visible from the road in both directions.',
      'Here is what a water tower actually is: a promise. It says a town decided, at some point, that it planned to still be there in fifty years, and did the municipal math to prove it. Nobody builds a water tower for a town they intend to abandon. It is infrastructure as optimism — a hundred and forty feet of quiet confidence that the taps will keep running and the kids will keep coming back for Christmas.',
      '## The landmark test',
      'When we add a town to the catalog, we ask one question: what would the gift shop have put on the shirt in 1978? Not what a brand consultant would choose now — what the person behind the counter, who had lived there for forty years, would have pointed to. Sometimes it is a bridge. Sarnia has a bridge. It is a good bridge. Sometimes it is a lake, a smelter, a statue of a fruit. In Trail, British Columbia, it is arguably the smelter, which has been smelting since 1901 and does not care whether you find that glamorous.',
      'The point is that every town has one. The landmark test has never once failed us, because the landmark test is really a question about whether a place has a story, and every place where people have lived for a hundred years has a story. It is usually a modest story. Modest stories are the ones people actually belong to.',
      '## Wearing infrastructure',
      'So when you wear a shirt with a water tower on it, you are not wearing a joke about a small town. You are wearing the most honest monument the twentieth century produced. The Eiffel Tower was built for an exposition. The water tower was built so that Mrs. Kowalski on Third Street could water her tomatoes during a dry August. One of these is more famous. We would gently argue the other one is more important.',
      'Our position, stated plainly: the water tower deserves the reverence. The town of eleven thousand deserves the merch. And if your town’s tower has the name painted in that slightly-wrong municipal serif, we would like to hear about it. That font is exactly what our display face is trying to remember.',
    ],
  },
  {
    slug: 'the-case-for-heavyweight-cotton',
    title: 'The case for heavyweight cotton',
    dek: 'Why every shirt we print starts as a Comfort Colors 1717, and why the fade is the whole point.',
    date: '2026-07-08',
    readingMinutes: 5,
    relatedHandles: ['tofino-t-shirt', 'revelstoke-t-shirt', 'osoyoos-t-shirt'],
    body: [
      'A souvenir shirt from 1978 that survives to the present day has certain properties. It is heavy. It is faded in a way no factory can fully counterfeit. The collar has relaxed but not surrendered. It belongs, by now, to whoever in the family fits it best. We spent a long time figuring out how to sell you that shirt new, and the answer starts with the blank.',
      'Every shirt we print is a Comfort Colors 1717. This is not a negotiable detail of our supply chain; it is close to the entire product. The 1717 is a heavyweight tee — 6.1 ounces per square yard of 100% ring-spun cotton, which is the sort of number that means nothing until you hold one. Most modern t-shirts run around 4 ounces. The difference in the hand is the difference between a shirt and a garment. One drapes like it has somewhere else to be. The other settles on your shoulders like it has agreed to stay.',
      '## Garment-dyed, which is to say: pre-faded honestly',
      'The important part is what happens after the shirt is sewn. Most shirts are cut from fabric that was dyed as yardage, which produces a uniform color with the emotional range of a parking lot. The 1717 is garment-dyed: the finished shirt goes into the dye, seams and collar and all. The color takes unevenly in exactly the way thirty summers of sun would have faded it — a little lighter along the seams, a little softer everywhere. The fade is not printed on. It is structural.',
      'This is why our colorways are called things like Ivory, Butter, Blue Jean, Brick, and Sage rather than anything urgent. Garment dye produces colors that look found rather than chosen. You cannot get a neon out of the process, which suits us, because we would not print one.',
      '## The print, at 88 percent',
      'On top of that blank, we print like it is not the shirt’s first day. Our slogan template runs the ink at less than full density on purpose — the screen-print equivalent of a voice that does not need to raise itself. The registration on our badge work is allowed to sit a hair off, the way an actual 1978 print shop’s would have, because their registration was off and their shirts outlived the shop.',
      'Softness deserves a word. Ring-spun cotton means the fibers are twisted before spinning, which makes a smoother, stronger yarn than the open-end alternative — smoother against the skin on day one, and far better at aging. An open-end shirt pills. A ring-spun heavyweight breaks in, which is a different thing entirely. Breaking in is what happens when a garment and a person come to an arrangement.',
      '## Built to be inherited',
      'The honest pitch is this: we are selling you a shirt that intends to be in a thrift store in thirty years, mislabeled as vintage, priced higher than we sold it for. Double-needle stitching at the sleeves and hem, taped shoulder seams, a collar with actual structure. Machine wash cold, hang dry if you love it. It has already been through the dye tank. It has seen worse.',
      'A town of nine thousand does not need a fast-fashion tribute. It needs the shirt equivalent of the water tower: heavier than strictly necessary, built by people who assumed the future, still standing when everyone gets home.',
    ],
  },
  {
    slug: 'how-to-wear-a-souvenir-from-somewhere-you-have-never-been',
    title: 'How to wear a souvenir from somewhere you have never been',
    dek: 'A styling guide, and a short ethics ruling on claiming Prince Rupert without having dried off there.',
    date: '2026-07-05',
    readingMinutes: 4,
    relatedHandles: ['prince-rupert-t-shirt', 'hope-t-shirt', '100-mile-house-t-shirt'],
    body: [
      'A question arrives more often than you would think: am I allowed to wear the shirt if I have never been to the town? We have consulted ourselves at length and the ruling is yes. A souvenir commemorates a place, not your attendance record. Nobody interrogates a person in a NASA shirt about their spacewalks. The town exists. You are celebrating that. Proceed.',
      'That settled, some notes on wearing one well, because a heavyweight garment-dyed tee is one of the few pieces of clothing that improves almost any outfit it enters, provided you let it be what it is.',
      '## The base case',
      'Worn straight — with jeans, work pants, or the kind of shorts you own two of — the shirt does everything on its own. The fit is honest: not boxy enough to be a statement, not slim enough to be a suggestion. Sleeves hit mid-bicep. If you are between sizes and you want the true vintage-find silhouette, size up once; garment-dyed cotton relaxes about half a size with wear, so buying your usual size gives you the fit the shirt intends.',
      'The faded palette is the styling cheat. Ivory, Butter, Blue Jean, Brick, and Sage were chosen because they were all, at some point, a brighter color that calmed down. They sit next to denim, canvas, khaki, and each other without friction. There is no colorway in the catalog that fights a brown jacket. This was deliberate.',
      '## Layering, or: the gas station rule',
      'The correct outer layer for a souvenir tee is anything you would wear to a gas station in October. An open flannel. A canvas chore coat. A crewneck thrown over it with the shirt’s hem showing, which is the only approved way to wear two casual garments at once. Under a blazer it becomes a look, and we will neither encourage nor prevent this.',
      'The one mistake available to you is polish. A souvenir shirt tucked into pressed trousers with white sneakers reads as a costume of a person, which is the opposite of the shirt’s whole argument. Keep one thing in the outfit slightly worn — the shirt handles this automatically for the first year, after which everything you own will have caught up.',
      '## On collecting',
      'The shirts are designed as a set the way postcards are: one is a memento, three is a collection, and a drawer of them is a worldview. People do tend to acquire the towns they have some claim to first — born there, grandmother there, broke down there once for four hours. Then the criteria loosen. We have watched people buy the 100 Mile House shirt purely because the name is a measurement, which we consider a fully valid form of citizenship.',
      'Wear it with the quiet pride it deserves. That is the entire instruction. Everything above is elaboration.',
    ],
  },
  {
    slug: 'a-field-guide-to-overlooked-towns',
    title: 'A field guide to overlooked towns',
    dek: 'How we decide what belongs in the catalog, and why "boring" is a slur we do not recognize.',
    date: '2026-07-02',
    readingMinutes: 5,
    relatedHandles: ['smithers-t-shirt', 'merritt-t-shirt', 'ladysmith-t-shirt'],
    body: [
      'People ask how a town qualifies for the catalog, usually while nominating their own. The honest answer is that the bar is low and the standards are high. Low bar: the town has to exist, and people have to live there. High standards: we have to be able to commemorate it the way it deserves, which means finding the one true thing — the landmark, the claim, the weather event — that the town itself would put on the shirt.',
      'Overlooked is not an insult in our catalog. It is a category error made by everyone else. A town is overlooked the way a good diner is overlooked: constantly, by people on their way to something they saw an ad for.',
      '## The taxonomy',
      'After forty towns of fieldwork, some genres have emerged. The Mile Zero town, which is the start of something enormous and is treated as a parking lot for it — Dawson Creek begins the entire Alaska Highway and would like you to notice. The Capital-of-Something town, which holds a title of narrow but genuine supremacy: salmon capital, country music capital briefly, sunniest city in the province apparently. The Technicality town, incorporated on a boundary, a parallel, or a surveyor’s rounding error — Ladysmith sits where it sits because of the 49th parallel, and we find that story better than most castles’.',
      'Then there is the Planned town, which is our favorite genre and Kitimat is the type specimen. Kitimat was designed entirely in advance — streets, neighborhoods, the works — by people who believed a town could be drawn before it was lived in. Whether that worked is a question for urbanists. That it was attempted with total sincerity is exactly our department.',
      '## What we look for',
      'The research process is unglamorous in a way we feel matches the material. Incorporation dates from municipal records. Populations from the census, rounded honestly and marked approximate. The known-for line is the hard part, because it has to pass two tests at once: the town would agree with it, and a stranger would want to know more. "Mostly farmland" passes for Abbotsford because Abbotsford would shrug and agree, and because it is true in the way that matters — you can smell the agriculture before you can see the town.',
      'What never goes on a shirt: anything a town would wince at. The humor lives in the sincerity or it does not live here. A slogan shirt that reads "I survived winter in Winnipeg" works because every person in Winnipeg has earned it and knows it. A slogan that punches at the town instead of standing in it would not survive our first meeting, and there is only one of us in that meeting.',
      '## Nominate accordingly',
      'The waitlist drives the whole print schedule — enough requests and a town jumps the queue, which means the catalog is ultimately written by homesick people, which is the correct authorship. When you submit yours, include the one thing it is known for. You know what it is. It is usually not the thing on the highway sign. It is the thing you would point at, driving in, when you said: that’s us.',
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

/**
 * A date string that is identical on the server and in the browser.
 *
 * `new Date('2026-07-24').toLocaleDateString('en-CA', …)` parses an ISO date
 * as UTC midnight and then formats it in the *local* zone. On Oxygen that zone
 * is UTC; in a browser west of Greenwich it is not, so the server rendered
 * "July 24, 2026" and the client rendered "July 23, 2026" — a hydration
 * mismatch, which is React error #418 on /postcards.
 *
 * Pinning the format to UTC makes both sides agree, and the date shown is the
 * one written in the article data rather than one shifted by the reader's
 * timezone.
 */
export function articleDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

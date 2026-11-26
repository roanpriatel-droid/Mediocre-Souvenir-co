"""Match every catalogue town to a GeoNames coordinate.

Usage: python3 -I towns_geo.py <products.json> <cities500.txt> <out.json>
Writes {"Akron, OH": [lon, lat], ...} and prints the towns it could not place.
"""
import json
import sys
import unicodedata

CA_ADMIN = {
    '01': 'AB', '02': 'BC', '03': 'MB', '04': 'NB', '05': 'NL', '07': 'NS',
    '08': 'ON', '09': 'PE', '10': 'QC', '11': 'SK', '12': 'YT', '13': 'NT',
    '14': 'NU',
}


def norm(s):
    s = unicodedata.normalize('NFKD', s)
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    s = s.replace('saint ', 'st ').replace('sainte ', 'ste ').replace('st. ', 'st ')
    s = s.replace('-', ' ').replace('.', '').replace("'", '')
    return ' '.join(s.split())


products = json.load(open(sys.argv[1]))
places = sorted({p['title'].split(' — ')[0] for p in products})

# (normalised name, region) -> best (population, lon, lat)
best = {}
with open(sys.argv[2], encoding='utf8') as fh:
    for line in fh:
        f = line.rstrip('\n').split('\t')
        country, admin1 = f[8], f[10]
        if country == 'US':
            region = admin1
        elif country == 'CA':
            region = CA_ADMIN.get(admin1)
        else:
            continue
        if not region:
            continue
        pop = int(f[14] or 0)
        # Cities and towns outrank villages, localities and neighbourhoods.
        rank = pop + (10**9 if f[7] in ('PPLA', 'PPLA2', 'PPLC') else 0)
        lon, lat = float(f[5]), float(f[4])
        names = {f[1], f[2]} | set(f[3].split(',')[:40])
        for name in names:
            if not name:
                continue
            key = (norm(name), region)
            if key not in best or rank > best[key][0]:
                best[key] = (rank, lon, lat, pop)

out, missing = {}, []
for place in places:
    name, _, region = place.rpartition(', ')
    hit = best.get((norm(name), region))
    if not hit and '(' in name:
        hit = best.get((norm(name.split('(')[0]), region))
    if hit:
        out[place] = [round(hit[1], 3), round(hit[2], 3), hit[3]]
    else:
        missing.append(place)

out.update({'Chatham-Kent, ON': [-82.183, 42.404, 101647], 'Faro, YT': [-133.355, 62.23, 440], 'Matewan, WV': [-82.169, 37.623, 499]})
json.dump(out, open(sys.argv[3], 'w'), indent=0, sort_keys=True)
print(len(out), 'placed;', len(missing), 'missing:', missing)

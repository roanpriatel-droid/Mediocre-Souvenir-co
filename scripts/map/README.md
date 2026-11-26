# Region map data

`app/lib/map-shapes.ts` is generated from Natural Earth 1:50m data (public
domain): `ne_50m_admin_1_states_provinces` and `ne_50m_lakes`.

```bash
npm i --no-save d3-geo mapshaper
npx mapshaper admin1.geojson -filter "(iso_a2=='US'||iso_a2=='CA') && postal!='DC' && postal!='HI'" -filter-fields postal,name,iso_a2 -simplify 6% keep-shapes -filter-islands min-area=600km2 remove-empty -o shapes.json format=geojson -points inner -o labels.json format=geojson
npx mapshaper admin1.geojson -filter "postal=='HI' && iso_a2=='US'" -filter-fields postal,name,iso_a2 -simplify 25% keep-shapes -filter-islands min-area=500km2 -o hi.json format=geojson
npx mapshaper lakes.geojson -filter "['Lake Superior','Lake Michigan','Lake Huron','Lake Erie','Lake Ontario','Great Bear Lake','Great Slave Lake','Lake Winnipeg','Lake Athabasca','Lake Winnipegosis','Reindeer Lake','Great Salt Lake','Lake of the Woods','Lake Nipigon','Smallwood Reservoir','Lake Mistassini'].indexOf(name)>-1" -filter-fields name -simplify 8% keep-shapes -o lakes.json format=geojson
node project.mjs ../../app/lib/map-shapes.ts
```

## Region page maps

`app/lib/region-maps.server.ts` holds one pre-drawn map per region page, from
Natural Earth 1:10m (`ne_10m_admin_1_states_provinces`, `ne_10m_lakes`,
`ne_10m_admin_0_countries`) and GeoNames `cities500` town coordinates
(CC BY 4.0, credited on the region pages).

```bash
npm i --no-save d3-geo mapshaper simplify-js
python3 towns_geo.py products.json cities500.txt towns_geo.json   # Printify product dump
npx mapshaper admin1_10m.geojson -filter "(iso_a2=='US'||iso_a2=='CA') && postal!='DC'" -filter-fields postal -simplify interval=150 keep-shapes -filter-islands min-area=8km2 remove-empty -o d10.json format=geojson precision=0.0005
npx mapshaper lakes_10m.geojson -clip bbox=-170,15,-50,85 -filter "scalerank<=7" -filter-fields name -simplify interval=150 keep-shapes -o l10.json format=geojson precision=0.0005
npx mapshaper countries_10m.geojson -filter "['MEX','GRL','CUB','BHS','RUS','GTM','BLZ'].indexOf(ADM0_A3)>-1" -clip bbox=-179.9,12,-40,84 -filter-fields ADM0_A3 -simplify interval=300 keep-shapes -filter-islands min-area=50km2 -o f10.json format=geojson precision=0.0005
node region_maps.mjs ../../app/lib/region-maps.server.ts
```

Bump `REGION_MAP_VERSION` in `app/lib/region-map.server.ts` after regenerating,
so browsers drop the cached `/maps/{code}.svg` files.

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

const assets = [
  {id:1,name:"North Semarang Government Service Office",city:"Semarang",type:"Property",lat:-6.956,lng:110.424,value:186,age:18,criticality:.72,vulnerability:.52,h:{sea:[.32,.48,.71],rob:[.55,.68,.84],fire:[.05,.07,.1]}},
  {id:2,name:"Tanjung Emas Logistics Warehouse Complex",city:"Semarang",type:"Property",lat:-6.946,lng:110.418,value:328,age:24,criticality:.81,vulnerability:.68,h:{sea:[.56,.7,.88],rob:[.68,.8,.94],fire:[.06,.09,.12]}},
  {id:3,name:"Kaligawe Infrastructure Corridor",city:"Semarang",type:"Infrastructure",lat:-6.951,lng:110.468,value:742,age:13,criticality:.93,vulnerability:.61,h:{sea:[.37,.55,.75],rob:[.61,.75,.9],fire:[.04,.07,.09]}},
  {id:4,name:"Old Town Public Service Building",city:"Semarang",type:"Property",lat:-6.969,lng:110.428,value:124,age:31,criticality:.76,vulnerability:.57,h:{sea:[.25,.39,.6],rob:[.47,.6,.78],fire:[.04,.06,.08]}},
  {id:5,name:"East Canal Bridge",city:"Semarang",type:"Infrastructure",lat:-6.972,lng:110.452,value:415,age:16,criticality:.88,vulnerability:.48,h:{sea:[.2,.31,.5],rob:[.43,.57,.73],fire:[.03,.05,.08]}},
  {id:6,name:"Tembalang Government Education Complex",city:"Semarang",type:"Property",lat:-7.052,lng:110.438,value:267,age:11,criticality:.84,vulnerability:.34,h:{sea:[.02,.03,.04],rob:[.03,.05,.08],fire:[.2,.29,.44]}},
  {id:7,name:"West Padang Government Service Office",city:"Padang",type:"Property",lat:-0.948,lng:100.355,value:143,age:21,criticality:.74,vulnerability:.55,h:{sea:[.29,.43,.64],rob:[.37,.51,.7],fire:[.06,.08,.11]}},
  {id:8,name:"Muaro Infrastructure Corridor",city:"Padang",type:"Infrastructure",lat:-0.965,lng:100.351,value:598,age:17,criticality:.91,vulnerability:.64,h:{sea:[.52,.68,.86],rob:[.58,.73,.9],fire:[.04,.06,.09]}},
  {id:9,name:"Teluk Bayur Warehouse Complex",city:"Padang",type:"Property",lat:-1.003,lng:100.379,value:354,age:27,criticality:.79,vulnerability:.7,h:{sea:[.49,.64,.82],rob:[.51,.67,.85],fire:[.07,.11,.16]}},
  {id:10,name:"Bungus Access Bridge",city:"Padang",type:"Infrastructure",lat:-1.034,lng:100.402,value:462,age:12,criticality:.86,vulnerability:.49,h:{sea:[.27,.41,.62],rob:[.31,.46,.68],fire:[.12,.19,.3]}},
  {id:11,name:"Koto Tangah Public Service Centre",city:"Padang",type:"Property",lat:-0.88,lng:100.393,value:179,age:9,criticality:.8,vulnerability:.38,h:{sea:[.08,.13,.22],rob:[.11,.18,.29],fire:[.21,.32,.48]}},
  {id:12,name:"Lubuk Kilangan Infrastructure Corridor",city:"Padang",type:"Infrastructure",lat:-0.954,lng:100.47,value:687,age:20,criticality:.9,vulnerability:.58,h:{sea:[.02,.03,.05],rob:[.05,.08,.13],fire:[.45,.61,.8]}}
];

const yearIndex={present:0,"2030":1,"2050":2};
const hazardNames={sea:"Sea-level rise",rob:"Coastal flood",fire:"Forest fire"};
const hazardColors={sea:"#337f9d",rob:"#72aabd",fire:"#e07b45"};
const riskColors={low:"#3f9c70",medium:"#d7a93c",high:"#e07b45",critical:"#b9473e"};
let currentYear="present", selectedAsset=null, markers=[];

const map=L.map("map",{zoomControl:false,attributionControl:true}).setView([-3.3,107.8],5);
L.control.zoom({position:"bottomright"}).addTo(map);
const carto=L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:20,attribution:"&copy; OpenStreetMap contributors &copy; CARTO"}).addTo(map);
const osmFallback=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"});
const satellite=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:"Imagery &copy; Esri, Maxar, Earthstar Geographics"});
L.control.layers({"CARTO Light":carto,"Esri Satellite":satellite,"OSM fallback":osmFallback},null,{position:"topright",collapsed:false}).addTo(map);
const mapStatus=document.querySelector('#map-status');
let cartoErrors=0;
carto.once('load',()=>mapStatus.classList.add('ready'));
carto.on('tileerror',()=>{cartoErrors+=1;if(cartoErrors===4&&map.hasLayer(carto)){map.removeLayer(carto);osmFallback.addTo(map);mapStatus.className='map-status error';mapStatus.innerHTML='<strong>CARTO is unavailable.</strong><small>The map has switched to OpenStreetMap. Use the layer control to retry CARTO or Esri.</small>';setTimeout(()=>mapStatus.classList.add('ready'),5000)}});
satellite.on('tileerror',()=>{if(map.hasLayer(satellite)){mapStatus.className='map-status error';mapStatus.innerHTML='<strong>Esri satellite tiles could not be loaded.</strong><small>Check the connection or return to CARTO Light using the layer control.</small>'}});
const baseButtons=[document.querySelector('#base-map'),document.querySelector('#base-satellite')];
function setBasemap(mode){
  [carto,satellite,osmFallback].forEach(layer=>map.hasLayer(layer)&&map.removeLayer(layer));
  (mode==='satellite'?satellite:carto).addTo(map);
  baseButtons.forEach(button=>button.classList.toggle('active',button.id===`base-${mode}`));
  mapStatus.classList.add('ready');
}
document.querySelector('#base-map').addEventListener('click',()=>setBasemap('map'));
document.querySelector('#base-satellite').addEventListener('click',()=>setBasemap('satellite'));

const syntheticZones=[
  {city:"Semarang",hazard:"rob",center:[-6.956,110.435],r:5600},{city:"Semarang",hazard:"sea",center:[-6.947,110.421],r:3900},{city:"Semarang",hazard:"fire",center:[-7.07,110.45],r:4800},
  {city:"Padang",hazard:"rob",center:[-.968,100.355],r:5200},{city:"Padang",hazard:"sea",center:[-.985,100.35],r:4400},{city:"Padang",hazard:"fire",center:[-.95,100.46],r:6200}
];
let zoneLayers=[];

function enabledHazards(){return [...document.querySelectorAll('.check input:checked')].map(x=>x.value)}
function filteredAssets(){const city=document.querySelector('#city-filter').value,type=document.querySelector('#type-filter').value;return assets.filter(a=>(city==='all'||a.city===city)&&(type==='all'||a.type===type))}
function calculation(a){
  const idx=yearIndex[currentYear], enabled=enabledHazards();
  const weighted=enabled.reduce((sum,key)=>sum+a.h[key][idx],0)/(enabled.length||1);
  const expectedLoss=Math.min(.48,weighted*a.vulnerability*(.18+.12*a.criticality));
  const physicalDep=Math.min(.36,a.age*(a.type==='Infrastructure'?.007:.009));
  const adjusted=a.value*(1-physicalDep)*(1-expectedLoss);
  const loss=a.value-adjusted;
  const score=weighted*a.vulnerability*a.criticality;
  const risk=score>=.39?'critical':score>=.24?'high':score>=.12?'medium':'low';
  const decision=risk==='critical'?'Adapt now · insure residual risk':risk==='high'?'Detailed appraisal + adaptation option':risk==='medium'?'Monitor · preventive maintenance':'Routine asset management';
  const insurance=(risk==='high'||risk==='critical')&&a.criticality>.75;
  return {weighted,expectedLoss,physicalDep,adjusted,loss,score,risk,decision,insurance};
}
function rupiah(v){return `IDR ${v.toLocaleString('en-US',{maximumFractionDigits:0})} bn`}
function updateMetrics(list){
  const calcs=list.map(a=>calculation(a));
  const total=list.reduce((s,a)=>s+a.value,0),loss=calcs.reduce((s,c)=>s+c.loss,0);
  document.querySelector('#portfolio-value').textContent=rupiah(total);
  document.querySelector('#value-at-risk').textContent=rupiah(loss);
  document.querySelector('#var-note').textContent=`indicative loss · ${currentYear}`;
  document.querySelector('#high-risk').textContent=calcs.filter(c=>['high','critical'].includes(c.risk)).length;
  document.querySelector('#insurance-count').textContent=calcs.filter(c=>c.insurance).length;
  document.querySelector('#visible-assets').textContent=`${list.length} / ${assets.length}`;
}
function renderZones(){zoneLayers.forEach(l=>map.removeLayer(l));zoneLayers=[];const enabled=enabledHazards(),city=document.querySelector('#city-filter').value,idx=yearIndex[currentYear];syntheticZones.filter(z=>enabled.includes(z.hazard)&&(city==='all'||city===z.city)).forEach(z=>{const layer=L.circle(z.center,{radius:z.r*(1+idx*.18),color:hazardColors[z.hazard],weight:1,fillColor:hazardColors[z.hazard],fillOpacity:.1+idx*.025,dashArray:'5 4',interactive:false}).addTo(map);zoneLayers.push(layer)})}
function renderMarkers(fit=false){
  markers.forEach(m=>map.removeLayer(m));markers=[];const list=filteredAssets();
  list.forEach(a=>{const c=calculation(a);const icon=L.divIcon({className:'',html:`<div class="asset-marker" style="width:${13+a.criticality*7}px;height:${13+a.criticality*7}px;background:${riskColors[c.risk]}"></div>`,iconSize:[20,20],iconAnchor:[10,10]});const marker=L.marker([a.lat,a.lng],{icon}).addTo(map).bindTooltip(`<div class="popup-name">${a.name}</div><div class="popup-meta">${a.city} · ${c.risk.toUpperCase()} RISK</div>`,{direction:'top',offset:[0,-8]});marker.on('click',()=>showAsset(a));markers.push(marker)});
  renderZones();updateMetrics(list);if(fit&&list.length){map.fitBounds(L.latLngBounds(list.map(a=>[a.lat,a.lng])),{padding:[35,35],maxZoom:12})}if(selectedAsset&&!list.some(a=>a.id===selectedAsset.id))closeAsset();
}
function showAsset(a){selectedAsset=a;const c=calculation(a),idx=yearIndex[currentYear];document.querySelector('#empty-state').classList.add('hidden');document.querySelector('#asset-detail').classList.remove('hidden');document.querySelector('#asset-city').textContent=a.city;document.querySelector('#asset-name').textContent=a.name;document.querySelector('#asset-type').textContent=`${a.type} · synthetic asset ID BMN-${String(a.id).padStart(4,'0')}`;const chip=document.querySelector('#risk-chip');chip.textContent=`${c.risk} climate risk`;chip.style.background=riskColors[c.risk];document.querySelector('#book-value').textContent=rupiah(a.value);document.querySelector('#adjusted-value').textContent=rupiah(c.adjusted);document.querySelector('#loss-value').textContent=`− ${rupiah(c.loss)} total indicative depreciation`;document.querySelector('#decision-signal').textContent=c.decision;document.querySelector('#insurance-note').textContent=c.insurance?'Candidate for climate-conditioned BMN insurance screening.':'Retain within portfolio monitoring; insurance trigger not reached.';document.querySelector('#hazard-bars').innerHTML=Object.keys(hazardNames).map(k=>`<div class="hazard-row"><span>${hazardNames[k]}</span><div class="bar"><i style="width:${a.h[k][idx]*100}%;background:${hazardColors[k]}"></i></div><strong>${Math.round(a.h[k][idx]*100)}</strong></div>`).join('')}
function closeAsset(){selectedAsset=null;document.querySelector('#empty-state').classList.remove('hidden');document.querySelector('#asset-detail').classList.add('hidden')}

document.querySelectorAll('.scenario').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.scenario').forEach(b=>b.classList.remove('active'));btn.classList.add('active');currentYear=btn.dataset.year;document.querySelector('#scenario-label').textContent=currentYear==='present'?'Observed baseline':currentYear==='2030'?'Near-term transition':'Long-term climate stress';renderMarkers();if(selectedAsset)showAsset(selectedAsset)}));
document.querySelectorAll('#city-filter,#type-filter').forEach(el=>el.addEventListener('change',()=>renderMarkers(true)));
document.querySelectorAll('.check input').forEach(el=>el.addEventListener('change',()=>{renderMarkers();if(selectedAsset)showAsset(selectedAsset)}));
document.querySelector('#reset-filters').addEventListener('click',()=>{document.querySelector('#city-filter').value='all';document.querySelector('#type-filter').value='all';document.querySelectorAll('.check input').forEach(x=>x.checked=true);renderMarkers(true)});
document.querySelector('#close-detail').addEventListener('click',closeAsset);
renderMarkers(false);
setTimeout(()=>map.invalidateSize(),150);
window.addEventListener('load',()=>setTimeout(()=>map.invalidateSize(),100));

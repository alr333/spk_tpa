// Data default
const defaultKecamatan = [
  {name:'Cibinong', ton:120},
  {name:'Dramaga', ton:90},
  {name:'Bogor Selatan', ton:200},
  {name:'Ciampea', ton:70},
  {name:'Ciseeng', ton:60}
];

let capacity = 1100;
let kecamatan = JSON.parse(localStorage.getItem('kecamatan_v1')) || defaultKecamatan.slice();

// Elemen DOM
const capacityEl = document.getElementById('capacityValue');
const totalTonEl = document.getElementById('totalTon');
const countyStatusEl = document.getElementById('countyStatus');
const kListEl = document.getElementById('kList');
const tableBody = document.getElementById('tableBody');
const form = document.getElementById('formData');

// Chart.js setup
const barCtx = document.getElementById('barChart').getContext('2d');
const pieCtx = document.getElementById('pieChart').getContext('2d');

let barChart = new Chart(barCtx, {
  type:'bar',
  data:{labels:[], datasets:[{label:'Tonase / Hari', data:[], backgroundColor:'#3498db'}]},
  options:{responsive:true}
});

let pieChart = new Chart(pieCtx, {
  type:'pie',
  data:{labels:[], datasets:[{data:[], backgroundColor:['#27ae60','#f39c12','#c0392b','#3498db','#9b59b6','#1abc9c']}]},
  options:{responsive:true}
});

capacityEl.textContent = capacity;

// Helpers
function save(){ localStorage.setItem('kecamatan_v1', JSON.stringify(kecamatan)); }

function calcCountyStatus(total){
  const ratio = total / capacity;
  if(ratio > 1) return {label:'Danger', cls:'danger', color:'var(--red)'};
  if(ratio > 0.8) return {label:'Warning', cls:'warning', color:'var(--orange)'};
  return {label:'Safety', cls:'safety', color:'var(--green)'};
}

// Render fungsi utama
function render(){
  const total = kecamatan.reduce((s,k)=>s + Number(k.ton || 0),0);
  totalTonEl.textContent = total;

  // Status Kabupaten
  const st = calcCountyStatus(total);
  countyStatusEl.className = 'status-pill ' + st.cls;
  countyStatusEl.innerHTML = `<span class="dot" style="background:${st.color}"></span> ${st.label}`;

  // List Kecamatan (kanan)
  kListEl.innerHTML = '';
  kecamatan.forEach(k=>{
    const item = document.createElement('div'); item.className='k-item';
    const left = document.createElement('div'); left.innerHTML = `<strong>${k.name}</strong><div class="small">ritasi (ton/hari)</div>`;
    const right = document.createElement('div'); right.innerHTML = `<div class="ton">${k.ton}</div>`;
    const actions = document.createElement('div'); actions.style.display='flex'; actions.style.gap='8px';
    const editBtn = document.createElement('button'); editBtn.textContent='Edit';
    editBtn.onclick=()=>{document.getElementById('kecamatan').value=k.name;document.getElementById('tonase').value=k.ton}
    const delBtn = document.createElement('button'); delBtn.textContent='Hapus';
    delBtn.onclick=()=>{kecamatan = kecamatan.filter(x=>x.name!==k.name); save(); render();};
    actions.appendChild(editBtn); actions.appendChild(delBtn);
    item.appendChild(left); item.appendChild(right); item.appendChild(actions);
    kListEl.appendChild(item);
  });

  // Tabel laporan bawah
  tableBody.innerHTML = '';
  kecamatan.forEach((k,i)=>{
    let kstatus = '<span style="color:var(--green)">Safety</span>';
    const proportion = (k.ton / capacity);
    if(proportion > 1) kstatus = '<span style="color:var(--red)">Danger</span>';
    else if(proportion > 0.8) kstatus = '<span style="color:var(--orange)">Warning</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${k.name}</td><td>${k.ton} ton</td><td>${kstatus}</td>`;
    tableBody.appendChild(tr);
  });

  // Update Chart
  const labels = kecamatan.map(k=>k.name);
  const tonaseData = kecamatan.map(k=>k.ton);
  barChart.data.labels = labels;
  barChart.data.datasets[0].data = tonaseData;
  barChart.update();
  pieChart.data.labels = labels;
  pieChart.data.datasets[0].data = tonaseData;
  pieChart.update();
}

render();

document.getElementById('addBtn').addEventListener('click', ()=>{
      const name = document.getElementById('kName').value.trim();
      const ton = Number(document.getElementById('kTon').value || 0);
      if(!name || ton<0){ alert('Isi nama kecamatan dan ton (>=0)'); return; }
      const idx = kecamatan.findIndex(k=>k.name.toLowerCase()===name.toLowerCase());
      if(idx>=0){ kecamatan[idx].ton = ton; }
      else { kecamatan.push({name, ton}); }
      save(); render();
      document.getElementById('kName').value=''; document.getElementById('kTon').value='';
    });

    document.getElementById('presetSel').addEventListener('change',(e)=>{
      if(!e.target.value) return; const obj = JSON.parse(e.target.value); document.getElementById('kName').value=obj.name; document.getElementById('kTon').value=obj.ton; e.target.value='';
    });

    document.getElementById('resetBtn').addEventListener('click', ()=>{ if(confirm('Reset semua data kecamatan ke default?')){ kecamatan = defaultKecamatan.slice(); save(); render(); } });

// Form submit
/**form.addEventListener('submit', function(e){
  e.preventDefault();
  const name = document.getElementById('kecamatan').value.trim();
  const ton = Number(document.getElementById('tonase').value || 0);
  if(!name || ton<0){ alert('Isi nama kecamatan dan ton (>=0)'); return; }
  const idx = kecamatan.findIndex(k=>k.name.toLowerCase()===name.toLowerCase());
  if(idx>=0){ kecamatan[idx].ton = ton; }
  else { kecamatan.push({name, ton}); }
  save(); render();
  form.reset();
});**/

// Reset data
document.getElementById('resetBtn').addEventListener('click', ()=>{
  if(confirm('Reset semua data kecamatan ke default?')){
    kecamatan = defaultKecamatan.slice(); save(); render();
  }
});

// Fungsi animasi persentase CH4
function animateMethane(prev, target) {
  const methaneEl = document.getElementById('methanePercent');
  let current = prev;

  const step = () => {
    if(Math.abs(current - target) < 0.1) {
      current = target;
      updateMethaneDisplay(current);
      return;
    }
    current += (target - current) * 0.05; // smoothing
    updateMethaneDisplay(current);
    requestAnimationFrame(step);
  };
  
  step();
}

// Update tampilan CH4
function updateMethaneDisplay(value) {
  const methaneEl = document.getElementById('methanePercent');
  const percent = Math.min(value, 100);
  let cls='safety', color='var(--green)';

  if(percent > 100) { cls='danger'; color='var(--red)'; }
  else if(percent > 80) { cls='warning'; color='var(--orange)'; }

  methaneEl.className = 'status-pill ' + cls;
  methaneEl.innerHTML = `<span class="dot" style="background:${color}"></span> ${percent.toFixed(1)}%`;
}

// Ambil total CH4 dan animasi
const CH4_LIMIT = 50; // ton/hari sebagai batas aman
const totalCH4 = kecamatan.reduce((s,k)=>s + k.ton * 0.05, 0); // ton CH4/hari
let riskPercent = Math.min((totalCH4 / CH4_LIMIT) * 100, 100); // batas max 100%
animateMethane(0, riskPercent); // animasi dari 0% ke nilai sekarang

//login
// Cek apakah sudah login → langsung masuk dashboard


    // logout
    function logout(){
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    }

  // Fungsi logout
  function logout(){
    localStorage.removeItem("loggedInUser");
    alert("Anda telah logout ✅");
    window.location.href = "login.html";
  }

  


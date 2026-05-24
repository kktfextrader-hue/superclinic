# Search List with Inline "Create New" — Pattern Reference

> Pattern นี้ใช้ใน **ลงทะเบียนก่อนรักษา (page-register)** ตั้งแต่ v57
> เรียกใช้ไฟล์นี้เมื่อต้องการเพิ่ม search+create pattern ในส่วนอื่นของระบบ

---

## สรุป Pattern

**ช่องค้นหา** → แสดงผลลัพธ์ที่พบ + ปุ่ม "+ สร้างใหม่" ด้านล่างเสมอ
- ถ้าพบ: รายการผู้ป่วย + ปุ่มสร้างใหม่
- ถ้าไม่พบ: ปุ่มสร้างใหม่อย่างเดียว (ไม่แสดง "ไม่พบผู้ป่วย" แล้ว)
- กดปุ่มสร้างใหม่ → เปิด modal เพิ่มผู้ป่วย + **pre-fill ชื่อที่พิมพ์ไว้**
- หลัง save → **auto-select** ผู้ป่วยใหม่ในฟอร์มทันที

---

## HTML — input + result box

```html
<div class="search-wrap" style="width:100%;">
  <i class="ti ti-search"></i>
  <input id="reg-search" class="search-input" style="width:100%;"
    placeholder="ค้นหาชื่อ / HN / เบอร์โทร..."
    oninput="searchRegPatient(this.value)"
    onkeydown="regSearchKeyNav(event)">
</div>
<div id="reg-search-result" style="max-height:320px;overflow-y:auto;"></div>
```

---

## JavaScript — 4 functions หลัก

### 1. `searchRegPatient(q)` — ค้นหาและ render

```js
function searchRegPatient(q){
  const el = document.getElementById('reg-search-result');
  if(!el) return;
  _regCursor = -1;
  if(!q.trim()){ renderRegRecentPatients(); _regSearchResults=[]; return; }

  if(!allPatients.length){
    el.innerHTML='<div style="padding:12px;text-align:center;color:#aaa;">กำลังโหลด...</div>';
    callApi('patients','list').then(r=>{
      allPatients=(r.data?.rows||[]).filter(p=>p.is_active!=='FALSE'&&p.is_active!==false);
      searchRegPatient(document.getElementById('reg-search')?.value||q);
    }).catch(()=>{ el.innerHTML='<div style="padding:12px;text-align:center;color:#aaa;">โหลดไม่ได้</div>'; });
    return;
  }

  _regSearchResults = allPatients.filter(p=>{
    const name = (p.prefix||'')+(p.first_name||'')+' '+(p.last_name||'');
    return name.toLowerCase().includes(q.toLowerCase())
      || (p.hn||'').toLowerCase().includes(q.toLowerCase())
      || String(p.phone||'').includes(q);
  }).slice(0,10);

  renderRegSearchList(q);  // ⚠️ ต้องส่ง q เสมอ — ห้าม early return ก่อนถึงบรรทัดนี้
}
```

> **⚠️ Bug ที่เคยเกิด:** มี `if(!_regSearchResults.length){ return; }` ก่อน `renderRegSearchList()`
> ทำให้ปุ่มสร้างใหม่ไม่แสดงเมื่อไม่พบผู้ป่วย — **ต้องลบ early return นี้ออก**

---

### 2. `renderRegSearchList(q)` — แสดง list + ปุ่มสร้างใหม่

```js
function renderRegSearchList(q){
  const el = document.getElementById('reg-search-result');
  if(!el) return;

  const rows = _regSearchResults.map((p,i)=>{
    const name = `${p.prefix||''}${p.first_name||''} ${p.last_name||''}`.trim();
    const isActive = i===_regCursor;
    return `<div id="reg-row-${i}" onclick="selectRegPatient('${p.id}','${name.replace(/'/g,"\\'")}','${p.hn||''}')"
      style="...border:1px solid ${isActive?'var(--go)':'rgba(200,169,107,0.15)'};background:${isActive?'#f8f4ed':''};">
      <div class="av">${initials(name)}</div>
      <div>
        <div>${name}</div>
        <div style="color:#999;">${p.hn||''} • ${p.phone||'—'}</div>
      </div>
    </div>`;
  }).join('');

  const sv = (q || document.getElementById('reg-search')?.value || '').trim();
  const newBtn = sv ? `<div onclick="openAddPatient('${sv.replace(/'/g,"\\'")}')"
    style="...background:#f0f7f4;border:1px solid rgba(47,93,80,0.3);"
    onmouseover="this.style.background='#e0f0e8'" onmouseout="this.style.background='#f0f7f4'">
    <div class="av" style="background:var(--g1);color:#fff;">+</div>
    <div>
      <div style="color:var(--g1);font-weight:600;">+ สร้างผู้ป่วยใหม่</div>
      <div style="color:#888;">ชื่อ: "${sv}"</div>
    </div>
  </div>` : '';

  el.innerHTML = (rows || newBtn)
    ? rows + newBtn
    : '<div style="padding:16px;text-align:center;color:#aaa;">ไม่พบผู้ป่วย</div>';
}
```

---

### 3. `openAddPatient(prefillName)` — pre-fill ชื่อใน modal

```js
function openAddPatient(prefillName){
  openModal('➕ เพิ่มผู้ป่วยใหม่', `<form id="fp-add" ...>...</form>`, `...`);

  setTimeout(()=>{
    // render body map
    const w = document.getElementById('addpat-bodymap-wrap');
    if(w){ w.innerHTML = bodyMapHTML('addpat'); _bmLevel['addpat']=1; }

    // pre-fill ชื่อ-นามสกุล
    if(prefillName){
      const parts = prefillName.trim().split(/\s+/);
      const fnEl = document.querySelector('#fp-add [name="first_name"]');
      const lnEl = document.querySelector('#fp-add [name="last_name"]');
      if(fnEl) fnEl.value = parts[0]||'';
      if(lnEl && parts.length>1) lnEl.value = parts.slice(1).join(' ');
    }
  }, 50);
}
```

---

### 4. `submitAddPatient(e)` — auto-select หลัง save

```js
async function submitAddPatient(e){
  e.preventDefault();
  // ... build data ...

  const res = await callApi('patients','create',data);
  const newId = res?.data?.id || res?.id || '';
  const fullName = `${data.first_name||''} ${data.last_name||''}`.trim();
  closeModal();
  showToast(`✅ เพิ่มผู้ป่วย ${fullName} สำเร็จ`);
  await loadPatients();

  // auto-select ถ้าอยู่ในหน้า register
  if(newId && document.getElementById('page-register')?.classList.contains('active')){
    const newPat = allPatients.find(x=>x.id===newId)
      || {id:newId, first_name:data.first_name, last_name:data.last_name||'', hn:''};
    const nn = `${newPat.prefix||''}${newPat.first_name||''} ${newPat.last_name||''}`.trim();
    selectRegPatient(newId, nn, newPat.hn||'');
  }
}
```

---

## Keyboard Navigation

ใช้ `regSearchKeyNav(event)` บน input — รองรับ ↑↓ Enter Esc
- ↑↓ เลื่อน highlight ใน `_regSearchResults` (ไม่รวมปุ่มสร้างใหม่)
- Enter เลือก item ที่ highlight
- Esc ล้างผลลัพธ์

---

## State Variables

```js
let _regSearchResults = [];  // ผลลัพธ์ค้นหาล่าสุด
let _regCursor = -1;         // index ที่ highlight (-1 = ไม่มี)
```

---

## การนำ Pattern ไปใช้ในส่วนอื่น

1. เปลี่ยน `reg-search` / `reg-search-result` เป็น id ของตัวเอง
2. เปลี่ยน `selectRegPatient()` เป็น callback ของตัวเอง
3. `openAddPatient(prefillName)` ใช้ร่วมกันได้เลย
4. ถ้าต้องการ entity อื่น (ไม่ใช่ patient) ให้สร้าง `openAddXxx(prefillName)` แยก

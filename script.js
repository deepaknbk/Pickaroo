// Name Picker - script.js
(function(){
  const nameInput = document.getElementById('nameInput');
  const addBtn = document.getElementById('addBtn');
  const namesListEl = document.getElementById('namesList');
  const countEl = document.getElementById('count');
  const pickBtn = document.getElementById('pickBtn');
  const clearBtn = document.getElementById('clearBtn');
  const resultEl = document.getElementById('result');
  const messageEl = document.getElementById('message');
  const allowDuplicatesEl = document.getElementById('allowDuplicates');
  const persistEl = document.getElementById('persist');
  const removeAfterPickEl = document.getElementById('removeAfterPick');
  const groupInput = document.getElementById('groupInput');
  const addGroupBtn = document.getElementById('addGroupBtn');

  let names = [];
  let isAnimating = false;
  const STORAGE_KEY = 'namepicker:names';

  // load persisted
  function load() {
    try{
      if (persistEl.checked){
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) names = JSON.parse(raw);
      }
    }catch(e){console.warn('load error', e)}
  }

  function save(){
    try{
      if (persistEl.checked){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }catch(e){console.warn('save error', e)}
  }

  function render(){
    namesListEl.innerHTML = '';
    names.forEach((n, i) => {
      const li = document.createElement('li');
      li.textContent = n;
      li.dataset.index = i;

      const rem = document.createElement('button');
      rem.className = 'remove';
      rem.title = 'Remove';
      rem.innerHTML = '✕';
      rem.addEventListener('click', ()=>{ removeAt(i); });

      li.appendChild(rem);
      namesListEl.appendChild(li);
    });
    countEl.textContent = names.length;
    save();
  }

  function addName(name){
    const trimmed = name.trim();
    if (!trimmed) { showMessage('Enter a non-empty name.'); return; }
    if (!allowDuplicatesEl.checked){
      if (names.includes(trimmed)) { showMessage('Name already exists in the pool.'); return; }
    }
    names.push(trimmed);
    nameInput.value = '';
    nameInput.focus();
    render();
    clearMessage();
  }

  function addGroup(){
    const raw = groupInput.value;
    if (!raw || !raw.trim()) { showMessage('Enter 3–10 names in the group box.'); return; }
    // split by newline or comma
    const parts = raw.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
    if (parts.length < 3 || parts.length > 10){
      showMessage('Please enter between 3 and 10 names (after splitting by comma or newline).');
      return;
    }

    // apply duplicates rule
    let toAdd = parts.slice();
    if (!allowDuplicatesEl.checked){
      toAdd = toAdd.filter(p => !names.includes(p));
      if (toAdd.length === 0){
        showMessage('No new names to add (all duplicates).');
        return;
      }
      if (toAdd.length < 3){
        showMessage(`After removing duplicates, only ${toAdd.length} new name(s) remain — at least 3 are required.`);
        return;
      }
      if (toAdd.length > 10){
        // keep safe, though parts.length <=10
        toAdd = toAdd.slice(0,10);
      }
    }

    // finally add
    toAdd.forEach(n => names.push(n));
    groupInput.value = '';
    render();
    clearMessage();
  }

  function removeAt(index){
    names.splice(index,1);
    render();
  }

  function clearAll(){
    if (!names.length) return;
    if (!confirm('Clear all names from the pool?')) return;
    names = [];
    render();
    resultEl.textContent = '';
  }

  function showMessage(text){ messageEl.textContent = text; }
  function clearMessage(){ messageEl.textContent = ''; }

  function secureRandomInt(max){
    // returns integer in [0, max)
    if (window.crypto && window.crypto.getRandomValues){
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      return array[0] % max;
    }
    return Math.floor(Math.random()*max);
  }

  function pickName(){
    if (isAnimating) return;
    if (!names.length){ showMessage('No names to pick. Add some names first.'); return; }
    clearMessage();
    isAnimating = true;
    pickBtn.disabled = true;
    addBtn.disabled = true;
    nameInput.disabled = true;

    // visual animation: quickly highlight random items for a duration
    const items = Array.from(namesListEl.children);
    let idx = 0;
    let interval = 80;
    const runs = 24; // number of highlights
    let step = 0;

    const tick = () => {
      items.forEach(it => it.classList.remove('highlight'));
      const pick = (secureRandomInt(items.length));
      items[pick].classList.add('highlight');
      step++;
      // gradually slow down
      if (step >= runs){
        finishPick(items[pick], parseInt(items[pick].dataset.index,10));
        return;
      }
      interval = Math.min(300, interval + 12);
      setTimeout(tick, interval);
    };

    // start
    setTimeout(tick, interval);
  }

  function finishPick(liEl, index){
    // compute final choice using secure random over current array to ensure fairness
    const finalIndex = secureRandomInt(names.length);
    // clear highlight on DOM and highlight the chosen element (it might differ from liEl)
    Array.from(namesListEl.children).forEach(it => it.classList.remove('highlight'));
    const chosenEl = namesListEl.children[finalIndex];
    if (chosenEl) chosenEl.classList.add('highlight');

    const winner = names[finalIndex];
    resultEl.textContent = `Winner: ${winner}`;

    // optionally remove
    if (removeAfterPickEl.checked){
      names.splice(finalIndex,1);
      setTimeout(render, 600);
    }

    // re-enable controls
    isAnimating = false;
    pickBtn.disabled = false;
    addBtn.disabled = false;
    nameInput.disabled = false;
  }

  // event wiring
  addBtn.addEventListener('click', ()=> addName(nameInput.value));
  addGroupBtn.addEventListener('click', addGroup);
  nameInput.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') addName(nameInput.value); });
  pickBtn.addEventListener('click', pickName);
  clearBtn.addEventListener('click', clearAll);
  persistEl.addEventListener('change', ()=>{ save(); });

  // initialize
  load();
  render();
})();

(function(){
  const qInput = document.getElementById('qInput');
  const saveBtn = document.getElementById('saveQBtn');
  const clearBtn = document.getElementById('clearQBtn');
  const qDisplay = document.getElementById('qDisplay');
  const persistCheckbox = document.getElementById('persist');
  const STORAGE_KEY = 'pickaroo:question';

  function loadQuestion(){
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if(saved){
        if(qDisplay) qDisplay.textContent = saved;
        if(qInput) qInput.value = saved;
      } else {
        if(qDisplay) qDisplay.textContent = 'No question set';
      }
    } catch(e){
      if(qDisplay) qDisplay.textContent = qInput && qInput.value ? qInput.value : 'No question set';
    }
  }

  function saveQuestion(){
    if(!qInput) return;
    const text = qInput.value.trim();
    if(qDisplay) qDisplay.textContent = text || 'No question set';
    try {
      if(persistCheckbox && persistCheckbox.checked && text){
        localStorage.setItem(STORAGE_KEY, text);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch(e){
      // ignore storage errors
    }
  }

  if(saveBtn) saveBtn.addEventListener('click', saveQuestion);
  if(clearBtn) clearBtn.addEventListener('click', () => { if(qInput) qInput.value = ''; saveQuestion(); });

  if(persistCheckbox){
    persistCheckbox.addEventListener('change', () => {
      if(!persistCheckbox.checked){
        try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
      } else {
        const cur = qInput ? qInput.value.trim() : '';
        if(cur){
          try { localStorage.setItem(STORAGE_KEY, cur); } catch(e){}
        }
      }
    });
  }

  // initialize immediately (script is loaded at end of body)
  loadQuestion();
})();

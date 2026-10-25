(() => {
  'use strict';

  const form = document.getElementById('signup-form');
  const playersBox = document.getElementById('players');
  const subsBox = document.getElementById('substitutes');
  const addSubBtn = document.getElementById('add-sub');
  const countEl = document.getElementById('jiangsu-count');
  const countEl2 = document.getElementById('jiangsu-count-2');
  const warnEl = document.getElementById('jiangsu-warn');
  const errorsBox = document.getElementById('form-errors');
  const errorsList = document.getElementById('form-errors-list');
  const endpointNotice = document.getElementById('endpoint-notice');
  const submitBtn = document.getElementById('submit-btn');
  const successBox = document.getElementById('success');
  const successTeam = document.getElementById('success-team');
  const successTime = document.getElementById('success-time');
  const againBtn = document.getElementById('again-btn');

  let subCount = 0;
  let jiangsuTouched = false;
  let submitAttempted = false;

  const cfg = (window.YIWEIBEI_CONFIG && window.YIWEIBEI_CONFIG.FORM_ENDPOINT) || '';
  const endpointConfigured = cfg.trim() !== '' && !cfg.includes('REPLACE');

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function playerCard(prefix, title, removable) {
    const card = el(`
      <div class="player-card" data-prefix="${prefix}">
        <h4>${title}</h4>
        <div class="field">
          <label for="${prefix}-name">姓名 *</label>
          <input id="${prefix}-name" type="text" autocomplete="off">
          <p class="field-error" id="err-${prefix}-name" hidden></p>
        </div>
        <div class="field">
          <label for="${prefix}-school">学校名称 *</label>
          <input id="${prefix}-school" type="text" autocomplete="off">
          <p class="field-error" id="err-${prefix}-school" hidden></p>
        </div>
        <div class="field">
          <fieldset style="border:0;padding:0;margin:0;">
            <legend style="font-weight:700;padding:0;">是否为江苏高校在读 *</legend>
            <div class="radio-row">
              <label><input type="radio" name="${prefix}-jiangsu" value="yes"> 是</label>
              <label><input type="radio" name="${prefix}-jiangsu" value="no"> 否</label>
            </div>
          </fieldset>
          <p class="field-error" id="err-${prefix}-jiangsu" hidden></p>
        </div>
        <div class="field">
          <label for="${prefix}-five">5E ID *</label>
          <input id="${prefix}-five" type="text" autocomplete="off">
          <p class="field-error" id="err-${prefix}-five" hidden></p>
        </div>
        ${removable ? '<button class="btn btn-ghost remove-sub" type="button">移除该替补</button>' : ''}
      </div>`);
    if (removable) {
      card.querySelector('.remove-sub').addEventListener('click', () => {
        card.remove();
        subCount -= 1;
        addSubBtn.disabled = false;
        addSubBtn.textContent = '添加替补';
      });
    }
    return card;
  }

  for (let i = 1; i <= 5; i++) {
    playersBox.appendChild(playerCard('p' + i, '队员 ' + i, false));
  }

  addSubBtn.addEventListener('click', () => {
    if (subCount >= 2) return;
    subCount += 1;
    subsBox.appendChild(playerCard('s' + subCount, '替补 ' + subCount, true));
    if (subCount >= 2) {
      addSubBtn.disabled = true;
      addSubBtn.textContent = '已达到替补上限（2 人）';
    }
  });

  function starterPrefixes() {
    return ['p1', 'p2', 'p3', 'p4', 'p5'];
  }
  function subPrefixes() {
    return Array.from(subsBox.querySelectorAll('.player-card')).map(c => c.dataset.prefix);
  }
  function jiangsuValue(prefix) {
    const checked = document.querySelector(`input[name="${prefix}-jiangsu"]:checked`);
    return checked ? checked.value : null;
  }
  function updateCounter() {
    const n = starterPrefixes().filter(p => jiangsuValue(p) === 'yes').length;
    countEl.textContent = String(n);
    countEl2.textContent = String(n);
    warnEl.hidden = !(n < 4 && (jiangsuTouched || submitAttempted));
    return n;
  }
  document.addEventListener('change', (e) => {
    if (e.target && e.target.name && e.target.name.endsWith('-jiangsu')) {
      jiangsuTouched = true;
      updateCounter();
    }
  });

  function setErr(id, msg) {
    const p = document.getElementById('err-' + id);
    if (p) { p.textContent = msg; p.hidden = false; }
    const input = document.getElementById(id) ||
      document.querySelector(`input[name="${id}-jiangsu"]`);
    if (input) input.setAttribute('aria-invalid', 'true');
  }
  function clearErr(id) {
    const p = document.getElementById('err-' + id);
    if (p) { p.hidden = true; p.textContent = ''; }
    const input = document.getElementById(id) ||
      document.querySelector(`input[name="${id}-jiangsu"]`);
    if (input) input.removeAttribute('aria-invalid');
  }
  function clearAllErrors() {
    document.querySelectorAll('.field-error').forEach(p => { p.hidden = true; p.textContent = ''; });
    document.querySelectorAll('[aria-invalid]').forEach(n => n.removeAttribute('aria-invalid'));
    errorsBox.hidden = true;
    errorsList.innerHTML = '';
    endpointNotice.hidden = true;
    endpointNotice.textContent = '';
  }
  form.addEventListener('input', (e) => {
    if (e.target && e.target.id) clearErr(e.target.id.replace(/^err-/, ''));
  });
  form.addEventListener('change', (e) => {
    if (e.target && e.target.name && e.target.name.endsWith('-jiangsu')) {
      clearErr(e.target.name.replace('-jiangsu', '') + '-jiangsu');
    }
  });

  function val(id) {
    const n = document.getElementById(id);
    return n ? n.value.trim() : '';
  }

  function validate() {
    const errors = [];
    const push = (id, msg, focusId) => errors.push({ id, msg, focusId: focusId || id });

    if (!val('team-name')) push('team-name', '队名不能为空。');
    if (!val('captain-name')) push('captain-name', '队长姓名不能为空。');
    const wechat = val('captain-wechat');
    if (!wechat) push('captain-wechat', '队长微信号不能为空。');
    else if (!/^[A-Za-z][A-Za-z0-9_-]{5,19}$/.test(wechat)) push('captain-wechat', '微信号格式不正确：6–20 位，字母开头，可含字母、数字、下划线、连字符。');
    const phone = val('captain-phone');
    if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) push('captain-phone', '手机号格式不正确：请填写 7–15 位数字，可带 + 前缀。');

    const allPrefixes = starterPrefixes().concat(subPrefixes());
    const names = new Map();
    allPrefixes.forEach((prefix, idx) => {
      const isSub = prefix.startsWith('s');
      const label = isSub ? ('替补 ' + prefix.slice(1)) : ('队员 ' + prefix.slice(1));
      const name = val(prefix + '-name');
      const school = val(prefix + '-school');
      const jiangsu = jiangsuValue(prefix);
      const five = val(prefix + '-five');
      if (!name) push(prefix + '-name', label + '姓名不能为空。');
      if (!school) push(prefix + '-school', label + '学校名称不能为空。');
      if (jiangsu === null) push(prefix + '-jiangsu', label + '请选择是否为江苏高校在读。', prefix + '-name');
      if (!five) push(prefix + '-five', label + '5E ID 不能为空。');
      if (name) {
        if (names.has(name)) {
          push(prefix + '-name', '队员姓名不能重复（与' + names.get(name) + '重复）。');
        } else {
          names.set(name, label);
        }
      }
      void idx;
    });

    if (!document.getElementById('agree').checked) {
      push('agree', '请勾选同意规则确认。', 'agree');
    }
    return errors;
  }

  function collectPayload() {
    const readPlayer = (prefix) => ({
      name: val(prefix + '-name'),
      school: val(prefix + '-school'),
      jiangsuStudent: jiangsuValue(prefix) === 'yes',
      fiveId: val(prefix + '-five'),
    });
    return {
      teamName: val('team-name'),
      captain: {
        name: val('captain-name'),
        wechat: val('captain-wechat'),
        phone: val('captain-phone'),
      },
      players: starterPrefixes().map(readPlayer),
      substitutes: subPrefixes().map(readPlayer),
      notes: val('notes'),
      submittedAt: new Date().toISOString(),
    };
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitAttempted = true;
    clearAllErrors();
    updateCounter();
    const errors = validate();
    if (errors.length > 0) {
      errors.forEach(err => setErr(err.id, err.msg));
      errorsList.innerHTML = errors.map(err => `<li>${err.msg}</li>`).join('');
      errorsBox.hidden = false;
      const first = document.getElementById(errors[0].focusId) ||
        document.querySelector(`input[name="${errors[0].id}-jiangsu"]`);
      if (first) {
        first.focus({ preventScroll: false });
        first.scrollIntoView({ block: 'center' });
      }
      return;
    }

    if (!endpointConfigured) {
      endpointNotice.textContent = '提交通道待主办方配置，报名信息尚未发出。请等待组委会配置提交通道后再提交。';
      endpointNotice.hidden = false;
      endpointNotice.scrollIntoView({ block: 'center' });
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '提交中…';
    try {
      const res = await fetch(cfg, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(collectPayload()),
      });
      if (!res.ok) throw new Error('bad status ' + res.status);
      const payload = collectPayload();
      successTeam.textContent = payload.teamName;
      successTime.textContent = new Date().toLocaleString('zh-CN');
      form.hidden = true;
      successBox.hidden = false;
      successBox.scrollIntoView({ block: 'start' });
    } catch (err) {
      endpointNotice.textContent = '提交失败，请稍后重试（网络或提交通道异常），报名信息尚未发出。';
      endpointNotice.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = '提交报名';
    }
  });

  againBtn.addEventListener('click', () => {
    form.reset();
    subsBox.innerHTML = '';
    subCount = 0;
    addSubBtn.disabled = false;
    addSubBtn.textContent = '添加替补';
    jiangsuTouched = false;
    submitAttempted = false;
    clearAllErrors();
    updateCounter();
    successBox.hidden = true;
    form.hidden = false;
    document.getElementById('signup').scrollIntoView({ block: 'start' });
  });

  updateCounter();
})();

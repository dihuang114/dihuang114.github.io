/* Loaded after the local board has initialized. */
(function () {
  'use strict';
  const board = window.dhChess;
  const el = id => document.getElementById(id);
  const key = 'dhchess-room-v2';
  let session = null, latest = null, version = -1, busy = false, online = false, timer;
  function store() { try { session ? sessionStorage.setItem(key, JSON.stringify(session)) : sessionStorage.removeItem(key); } catch (_) {} }
  function message(text) { el('netStatus').textContent = text; }
  function controls() {
    const netMode = el('mode').value === 'net';
    el('netPanel').hidden = !netMode;
    el('mode').disabled = !!session || busy;
    for (const id of ['btnNew', 'btnUndo', 'btnPause', 'btnHint']) el(id).disabled = netMode || busy;
    for (const id of ['diff', 'aiStyle', 'aiEngine']) el(id).closest('label').hidden = netMode;
    el('netCreate').disabled = el('netJoin').disabled = !!session || busy;
    el('netLeave').disabled = !session || busy;
    el('netCopy').disabled = !session;
  }
  async function api(action, data) {
    const response = await fetch('/api/chess/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data || {}), signal: AbortSignal.timeout(8000) });
    let result;
    try { result = await response.json(); } catch (_) { throw new Error('联机服务尚未启动'); }
    if (!response.ok) throw Object.assign(new Error(result.error || '联机服务不可用'), { status: response.status });
    return result;
  }
  function accept(result) {
    online = true;
    if (result.version < version) return;
    latest = result;
    if (version !== result.version) { board.receive(result.game); version = result.version; }
    const prefix = '房间 ' + session.roomId + '  你执' + (session.side === 0 ? '红' : '黑');
    message(prefix + (result.game.over ? '  对局结束' : !result.ready ? '  等待对手加入' : !result.peerOnline ? '  对手暂时离线，等待重连' : '  ' + (result.game.turn === session.side ? '轮到你走棋' : '等待对手走棋')));
  }
  function detach(reset) {
    session = null; latest = null; version = -1; online = false;
    clearTimeout(timer); store(); board.leave(reset); controls();
  }
  async function poll() {
    const current = session;
    if (!current) return;
    try { const result = await api('poll', current); if (session === current) accept(result); }
    catch (e) {
      if (session !== current) return;
      online = false;
      if (e.status === 404 || e.status === 403) { detach(false); message(e.message); return; }
      message('连接中断，正在重试…');
    }
    if (session === current) timer = setTimeout(poll, 1500);
  }
  async function enter(action) {
    if (busy || session) return;
    const roomId = el('netRoom').value.trim();
    if (action === 'join' && !/^\d{4}$/.test(roomId)) { message('请输入 4 位房间号'); return; }
    busy = true; controls(); message('正在连接…');
    try {
      const result = await api(action, { roomId });
      session = { roomId: result.roomId, token: result.token, side: result.side };
      version = -1; store(); board.enter(result.side); accept(result);
      timer = setTimeout(poll, 1500);
    } catch (e) { message(e.message === 'Failed to fetch' ? '联机服务暂时无法连接' : e.message); }
    finally { busy = false; controls(); }
  }
  window.dhChessNet = {
    active: () => !!session,
    canMove: () => !!session && online && !busy && latest?.ready && !latest.game.over && latest.game.turn === session.side,
    async move(mv) {
      if (!this.canMove()) return;
      const current = session;
      busy = true; controls();
      try { const result = await api('move', { ...current, version, from: mv.from, to: mv.to }); if (session === current) accept(result); }
      catch (e) { online = false; message(e.message + '，正在同步棋局'); }
      finally { busy = false; controls(); }
    }
  };
  el('mode').addEventListener('change', controls);
  el('netCreate').onclick = () => enter('create');
  el('netJoin').onclick = () => enter('join');
  el('netLeave').onclick = async () => {
    if (!session || busy) return;
    if (latest?.ready && !latest.game.over && !confirm('退出将判负，确定退出？')) return;
    busy = true; controls();
    try { await api('leave', session); detach(true); message('已退出房间'); }
    catch (e) { message('退出未确认，请重试。' + e.message); }
    finally { busy = false; controls(); }
  };
  el('netCopy').onclick = async () => {
    if (!session) return;
    const url = new URL(location.href); url.searchParams.set('room', session.roomId);
    try { await navigator.clipboard.writeText(url.href); message('邀请链接已复制'); }
    catch (_) { message('房间号 ' + session.roomId + '，请手动分享'); }
  };
  el('netRoom').value = new URLSearchParams(location.search).get('room') || '';
  try {
    const saved = JSON.parse(sessionStorage.getItem(key));
    if (saved && /^\d{4}$/.test(saved.roomId) && /^[a-f0-9]{64}$/.test(saved.token) && [0, 1].includes(saved.side)) session = saved;
  } catch (_) {}
  if (session) { board.enter(session.side); message('正在恢复对局…'); poll(); }
  else if (/^\d{4}$/.test(el('netRoom').value)) { el('mode').value = 'net'; el('mode').dispatchEvent(new Event('change')); }
  controls();
})();

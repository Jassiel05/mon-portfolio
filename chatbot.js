const jChat = (() => {
  const URL = 'https://n8n.srv1139844.hstgr.cloud/webhook/ef811830-f86c-4055-84f7-576d20166357/chat';
  let open = false, busy = false, sid = 'js_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
  const $ = id => document.getElementById(id);

  function toggle() {
    open = !open;
    $('jassiel-window').style.display = open ? 'flex' : 'none';
    if (open) setTimeout(() => $('jassiel-input').focus(), 50);
  }

  function addMsg(txt, user) {
    const b = $('jassiel-messages'), t = $('jassiel-typing'), d = document.createElement('div');
    d.className = 'jmsg ' + (user ? 'user' : 'bot');
    const p = document.createElement('div');
    p.className = 'jbubble';
    p.innerHTML = txt.replace(/\n/g, '<br>');
    d.appendChild(p);
    b.insertBefore(d, t);
    b.scrollTop = b.scrollHeight;
  }

  function typing(show) {
    const t = $('jassiel-typing');
    t.style.display = show ? 'flex' : 'none';
    if (show) $('jassiel-messages').scrollTop = $('jassiel-messages').scrollHeight;
  }

  function suggest(txt) {
    $('jassiel-suggestions').style.display = 'none';
    send(txt);
  }

  async function send(ov) {
    const i = $('jassiel-input'), txt = ov || i.value.trim();
    if (!txt || busy) return;
    i.value = '';
    busy = true;
    $('jassiel-send').disabled = true;
    addMsg(txt, true);
    typing(true);
    try {
      const r = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendMessage', sessionId: sid, chatInput: txt })
      });
      typing(false);
      if (!r.ok) throw new Error();
      const d = await r.json();
      addMsg(d.output || d.text || d.message || "Désolé, une erreur est survenue.", false);
    } catch (e) {
      typing(false);
      addMsg("Une erreur est survenue. Contactez Jassiel via <a href='https://www.jassiel-portfolio.site/#contact' target='_blank' style='color:#6366f1'>son portfolio</a>.", false);
    } finally {
      busy = false;
      $('jassiel-send').disabled = false;
      $('jassiel-input').focus();
    }
  }

  return { toggle, send, suggest };
})();

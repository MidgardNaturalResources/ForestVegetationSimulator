/* Interactive FVS processing sequence figure.
   Data: window.FVS_SEQUENCE (see fvs_sequence_data.js). Container: <div id="fvs-sequence">. */
(function () {
  'use strict';
  var uid = 0;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function secHref(sec) {
    var spans = document.querySelectorAll('.header-section-number');
    for (var i = 0; i < spans.length; i++) {
      var num = spans[i].textContent.trim();
      if (num === sec || num === sec.replace(/\.0$/, '')) {
        var h = spans[i].closest('h1,h2,h3,h4,h5,h6');
        var id = (h && h.id) || (h && h.parentElement && h.parentElement.id);
        if (id) return '#' + id;
      }
    }
    return null;
  }

  function isExpandable(n) {
    return !!(n.desc || (n.subs && n.subs.length) || (n.steps && n.steps.length) || n.sec);
  }

  function addStops(conn, stops, defs) {
    [].concat(stops).forEach(function (s, k) {
      var wrap = el('div', 'stop');
      if (k > 0) wrap.style.top = (50 + 40 * k) + '%';
      wrap.appendChild(el('span', 'dot'));
      wrap.appendChild(el('span', 'dash'));
      var pill = el('span', 'pill', 'Stop point ' + s);
      if (defs && defs[s]) pill.title = defs[s];
      wrap.appendChild(pill);
      conn.appendChild(wrap);
    });
  }

  function renderPanel(n, defs, boxId) {
    var p = el('div', 'panel');
    p.id = boxId + '-panel';
    p.hidden = true;
    [].concat(n.desc || []).forEach(function (d) { p.appendChild(el('p', null, d)); });
    if (n.subs && n.subs.length) {
      var subs = el('div', 'subs');
      n.subs.forEach(function (s) { subs.appendChild(el('code', null, s)); });
      p.appendChild(subs);
    }
    if (n.sec) {
      var s = el('p', 'sec');
      s.appendChild(document.createTextNode('See section '));
      var href = secHref(n.sec);
      if (href) { var a = el('a', null, n.sec); a.href = href; s.appendChild(a); }
      else s.appendChild(document.createTextNode(n.sec));
      p.appendChild(s);
    }
    if (n.steps && n.steps.length) {
      var nest = el('div', 'nested');
      nest.appendChild(renderFlow(n.steps, defs));
      p.appendChild(nest);
    }
    return p;
  }

  function renderFlow(nodes, defs) {
    var ol = el('ol', 'flow');
    nodes.forEach(function (n, i) {
      var li = el('li', 'step kind-' + (n.kind || 'step'));
      var last = i === nodes.length - 1;
      if (n.kind === 'loop') {
        var loop = el('div', 'loop' + (n.steps && n.steps.length && n.steps[n.steps.length - 1].kind === 'decision' ? ' ends-decision' : ''));
        var entry = el('div', 'conn entry' + (n.entryStop ? ' has-stop' : ''));
        entry.appendChild(el('span', 'entry-line'));
        if (n.label) entry.appendChild(el('span', 'loop-label', n.label));
        if (n.entryStop) addStops(entry, n.entryStop, defs);
        loop.appendChild(entry);
        loop.appendChild(renderFlow(n.steps, defs));
        li.appendChild(loop);
      } else {
        var id = 'fs' + (++uid);
        var can = isExpandable(n);
        var box = el(can ? 'button' : 'div', 'box' + (can ? ' can-open' : ''), n.label);
        if (can) {
          box.type = 'button';
          box.setAttribute('aria-expanded', 'false');
          box.setAttribute('aria-controls', id + '-panel');
        }
        box.id = id;
        if (n.kind === 'decision') {
          var row = el('div', 'decision-row');
          if (n.loopBack) {
            var yl = el('div', 'yes-line'); yl.appendChild(el('span', null, n.yes || 'Yes')); row.appendChild(yl);
          } else row.appendChild(el('div', 'spacer'));
          row.appendChild(box);
          row.appendChild(el('div', 'spacer'));
          li.appendChild(row);
        } else li.appendChild(box);
        if (can) {
          var panel = renderPanel(n, defs, id);
          li.appendChild(panel);
          box.addEventListener('click', function () {
            var open = box.getAttribute('aria-expanded') !== 'true';
            box.setAttribute('aria-expanded', open ? 'true' : 'false');
            panel.hidden = !open;
          });
        }
      }
      if (!last || n.stop) {
        var conn = el('div', 'conn' + (n.stop ? ' has-stop' : ''));
        if (n.stop) addStops(conn, n.stop, defs);
        if (n.exit) conn.appendChild(el('span', 'exit', n.exit));
        if (last) conn.style.display = 'none';
        li.appendChild(conn);
      }
      ol.appendChild(li);
    });
    return ol;
  }

  function setAll(root, open) {
    root.querySelectorAll('.box.can-open').forEach(function (b) {
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      var p = document.getElementById(b.getAttribute('aria-controls'));
      if (p) p.hidden = !open;
    });
  }

  function render() {
    var root = document.getElementById('fvs-sequence');
    var data = window.FVS_SEQUENCE;
    if (!root || !data || root.dataset.rendered) return;
    root.dataset.rendered = '1';
    root.classList.add('fvs-seq');
    var bar = el('div', 'fs-toolbar');
    var ex = el('button', null, 'Expand all'); ex.type = 'button';
    var co = el('button', null, 'Collapse all'); co.type = 'button';
    ex.addEventListener('click', function () { setAll(root, true); });
    co.addEventListener('click', function () { setAll(root, false); });
    bar.appendChild(ex); bar.appendChild(co);
    var legend = el('span', 'fs-legend');
    var lg = el('span', 'pill', 'Stop point n');
    lg.style.cssText = 'font:.9em ui-monospace,monospace;background:#fdf3d0;border:1.5px dashed #d9b84a;border-radius:999px;padding:.05em .6em';
    legend.appendChild(lg);
    legend.appendChild(document.createTextNode(' where FVS can stop and restart (hover for location)'));
    bar.appendChild(legend);
    root.appendChild(bar);
    root.appendChild(renderFlow(data.main, data.stops));
    if (data.related && data.related.length) {
      root.appendChild(el('h4', 'fs-h', 'Supporting sequences'));
      var list = el('ul', 'flow fs-related');
      list.style.cssText = 'list-style:none;padding:0;margin:0';
      data.related.forEach(function (r) {
        var li = el('li');
        var id = 'fs' + (++uid);
        var b = el('button', 'box can-open', r.label); b.type = 'button'; b.id = id;
        b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', id + '-panel');
        var pnl = renderPanel(r, data.stops, id);
        b.addEventListener('click', function () {
          var open = b.getAttribute('aria-expanded') !== 'true';
          b.setAttribute('aria-expanded', open ? 'true' : 'false'); pnl.hidden = !open;
        });
        li.appendChild(b); li.appendChild(pnl); list.appendChild(li);
      });
      root.appendChild(list);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();

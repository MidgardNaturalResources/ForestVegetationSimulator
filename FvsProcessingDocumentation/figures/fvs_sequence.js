/* Interactive FVS processing sequence figures.
   Data: window.FVS_SEQUENCE (main chart) and window.FVS_FIGURES (stand-alone sequences), both in fvs_sequence_data.js.
   Containers: <div id="fvs-sequence"> for the main chart, <div data-fvs-seq="key"> for a stand-alone sequence. */
(function () {
  'use strict';
  var uid = 0;
  var stopCtx = null;   // stop point details for the main chart, set in render()

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
      var pill = el('button', 'pill', 'Stop point ' + s);
      pill.type = 'button';
      if (defs && defs[s]) pill.title = defs[s];
      wrap.appendChild(pill);
      conn.appendChild(wrap);
      var node = stopNode(s, defs);
      if (node) {
        var id = 'fs' + (++uid);
        pill.classList.add('can-open');
        pill.id = id;
        pill.setAttribute('aria-expanded', 'false');
        pill.setAttribute('aria-controls', id + '-panel');
        var panel = renderPanel(node, defs, id);
        panel.classList.add('stop-panel');
        (conn._panels = conn._panels || []).push(panel);
        pill.addEventListener('click', function () {
          var open = pill.getAttribute('aria-expanded') !== 'true';
          pill.setAttribute('aria-expanded', open ? 'true' : 'false');
          panel.hidden = !open;
        });
      }
    });
  }

  /* Put the stop point panels after their connector, once the connector is in the document tree. */
  function placePanels(conn) {
    var ref = conn;
    (conn._panels || []).forEach(function (p) {
      ref.parentNode.insertBefore(p, ref.nextSibling);
      ref = p;
    });
  }

  /* Panel content for a stop point: where it is, how FVS stops there, and how a restart resumes. */
  function stopNode(n, defs) {
    if (!stopCtx || !stopCtx.detail || !stopCtx.detail[n]) return null;
    var d = stopCtx.detail[n];
    return {
      desc: [(defs && defs[n] ? 'Stop point ' + n + ': ' + defs[n] + '.' : 'Stop point ' + n + '.'), d.call],
      steps: [
        { label: 'Stopping here', subs: ['fvsStopPoint'], desc: stopCtx.stopDesc, steps: stopCtx.stopSteps },
        { label: 'Restarting from this stop point', subs: ['fvsRestart'], desc: [d.resume, stopCtx.clearDesc], steps: stopCtx.restartSteps }
      ]
    };
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
        placePanels(entry);
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
        placePanels(conn);
      }
      ol.appendChild(li);
    });
    return ol;
  }

  function setAll(root, open) {
    root.querySelectorAll('.box.can-open, .pill.can-open').forEach(function (b) {
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      var p = document.getElementById(b.getAttribute('aria-controls'));
      if (p) p.hidden = !open;
    });
  }

  function toolbar(root, withLegend) {
    var bar = el('div', 'fs-toolbar');
    var ex = el('button', null, 'Expand all'); ex.type = 'button';
    var co = el('button', null, 'Collapse all'); co.type = 'button';
    ex.addEventListener('click', function () { setAll(root, true); });
    co.addEventListener('click', function () { setAll(root, false); });
    bar.appendChild(ex); bar.appendChild(co);
    if (withLegend) {
      var legend = el('span', 'fs-legend');
      var lg = el('span', 'pill', 'Stop point n');
      lg.style.cssText = 'font:.9em ui-monospace,monospace;background:#fdf3d0;border:1.5px dashed #d9b84a;border-radius:999px;padding:.05em .6em';
      legend.appendChild(lg);
      legend.appendChild(document.createTextNode(' where FVS can stop and restart (select to see how)'));
      bar.appendChild(legend);
    }
    root.appendChild(bar);
  }

  function render() {
    var data = window.FVS_SEQUENCE;
    var main = document.getElementById('fvs-sequence');
    if (main && data && !main.dataset.rendered) {
      main.dataset.rendered = '1';
      main.classList.add('fvs-seq');
      stopCtx = data.stopCtx || null;
      toolbar(main, true);
      main.appendChild(renderFlow(data.main, data.stops));
    }
    var figs = window.FVS_FIGURES || {};
    [].forEach.call(document.querySelectorAll('[data-fvs-seq]'), function (root) {
      var node = figs[root.getAttribute('data-fvs-seq')];
      if (!node || root.dataset.rendered) return;
      root.dataset.rendered = '1';
      root.classList.add('fvs-seq', 'fvs-seq-solo');
      toolbar(root, false);
      [].concat(node.desc || []).forEach(function (d) { root.appendChild(el('p', 'fs-intro', d)); });
      root.appendChild(renderFlow(node.steps || [], {}));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();

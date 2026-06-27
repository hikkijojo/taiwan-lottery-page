(function () {
  const GAME_ICONS = { power: '威', lotto: '樂', '539': '539' };

  function padNum(n) {
    return String(n).padStart(2, '0');
  }

  function hitLabel(game, row) {
    if (row.main_hit == null) return '';
    if (game === 'power') {
      const z2 = row.zone2_hit ? '中' : '未中';
      return '第一區 ' + row.main_hit + '/6；第二區 ' + z2;
    }
    if (game === 'lotto') {
      const sp = row.special_hit ? '中' : '未中';
      return '主號 ' + row.main_hit + '/6；特別號 ' + sp;
    }
    return '主號 ' + row.main_hit + '/5';
  }

  function hitTier(game, row) {
    const main = row.main_hit ?? 0;
    const maxMain = game === '539' ? 5 : 6;

    if (main === 0 && !row.special_hit && !row.zone2_hit) return 0;
    if (row.jackpot_match) return 5;
    if (game === '539' && main >= 5) return 5;
    if (game === 'lotto' && main >= 6 && row.special_hit) return 5;
    if (game === 'power' && main >= 6 && row.zone2_hit) return 5;
    if (main >= maxMain) return 4;

    let tier = Math.min(main, 4);
    if (tier === 0 && (row.special_hit || row.zone2_hit)) tier = 1;
    return tier;
  }

  function isMainHit(n, row) {
    return row.actual_numbers && row.actual_numbers.includes(n);
  }

  function isSpecialHit(row) {
    return row.special != null && row.actual_special != null && row.special === row.actual_special;
  }

  function mainBallClass(row, n) {
    if (!row.actual_numbers || !row.actual_numbers.length) return 'ball ball--main';
    return isMainHit(n, row) ? 'ball ball--hit' : 'ball ball--miss';
  }

  function specialBallClass(row) {
    if (!row.actual_numbers || !row.actual_numbers.length) return 'ball ball--special';
    return isSpecialHit(row) ? 'ball ball--hit' : 'ball ball--miss';
  }

  function renderBalls(game, row, evaluated) {
    let html = '<div class="balls">';
    row.numbers.forEach(function (n) {
      const cls = evaluated ? mainBallClass(row, n) : 'ball ball--main';
      html += '<span class="' + cls + '">' + padNum(n) + '</span>';
    });
    if (row.special != null) {
      html += '<span class="ball-sep">+</span>';
      const cls = evaluated ? specialBallClass(row) : 'ball ball--special';
      html += '<span class="' + cls + '">' + padNum(row.special) + '</span>';
    }
    html += '</div>';
    return html;
  }

  function renderPredictionRow(game, row, evaluated) {
    let cls = 'pred-row';
    if (evaluated) {
      const tier = hitTier(game, row);
      cls += ' pred-row--evaluated pred-row--tier-' + tier;
      if (row.jackpot_match) cls += ' pred-row--jackpot';
    }

    let html = '<div class="' + cls + '">';
    html += '<div class="pred-row__head"><strong>' + escapeHtml(row.strategy_label) + '</strong>';
    if (evaluated && row.main_hit != null) {
      const tier = hitTier(game, row);
      let badgeCls = 'hit-badge hit-badge--tier-' + tier;
      if (row.jackpot_match) badgeCls += ' hit-badge--jackpot';
      html += '<span class="' + badgeCls + '">' + hitLabel(game, row) + '</span>';
    }
    html += '</div>';
    if (!evaluated && row.strategy_summary) {
      html += '<p class="pred-summary">' + escapeHtml(row.strategy_summary) + '</p>';
    }
    html += renderBalls(game, row, evaluated);
    html += '</div>';
    return html;
  }

  function renderPending(game, pending) {
    if (!pending || !pending.predictions || !pending.predictions.length) {
      return '';
    }
    let html = '<div class="section">';
    html += '<div class="section__head"><span class="section__title">待開獎預測</span><span class="badge">待開獎</span></div>';
    html += '<p class="meta">統計截至 ' + escapeHtml(pending.based_on_draw_number) +
      ' → 預測 ' + escapeHtml(pending.target_draw_number) + '</p>';
    pending.predictions.forEach(function (row) {
      html += renderPredictionRow(game, row, false);
    });
    html += '</div>';
    return html;
  }

  function renderEvaluated(game, periods) {
    if (!periods || !periods.length) return '';
    let html = '<div class="section">';
    html += '<div class="section__head"><span class="section__title">近三期命中</span></div>';
    html += '<p class="eval-legend">';
    html += '<span><span class="legend-dot legend-dot--hit"></span>中號（紅）</span> ';
    html += '<span><span class="legend-dot legend-dot--miss"></span>未中（灰）</span>';
    html += '</p>';
    periods.forEach(function (period) {
      html += '<div class="period-block">';
      html += '<div class="period-block__head"><strong>期別 ' + escapeHtml(period.target_draw_number) + '</strong>';
      if (period.target_draw_date) {
        html += '<span class="period-block__date">' + escapeHtml(period.target_draw_date) + '</span>';
      }
      html += '</div>';
      period.predictions.forEach(function (row) {
        html += renderPredictionRow(game, row, true);
      });
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  function renderGame(gameData) {
    const game = gameData.game_type;
    let html = '<article class="game-card game-card--' + game + '">';
    html += '<div class="game-card__head">';
    html += '<div class="game-card__icon">' + (GAME_ICONS[game] || '?') + '</div>';
    html += '<div class="game-card__title">' + escapeHtml(gameData.game_name) + '</div>';
    html += '</div>';
    html += renderPending(game, gameData.pending);
    html += renderEvaluated(game, gameData.recent_evaluated);
    if (!gameData.pending && (!gameData.recent_evaluated || !gameData.recent_evaluated.length)) {
      html += '<div class="section"><p class="muted">尚無預測資料</p></div>';
    }
    html += '</article>';
    return html;
  }

  function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatGeneratedAt(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return '更新時間：' + d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    } catch {
      return '更新時間：' + iso;
    }
  }

  function render(data) {
    const app = document.getElementById('app');
    if (!data || !data.games || !data.games.length) {
      app.innerHTML = '<p class="error-msg">尚無預測資料</p>';
      return;
    }
    app.innerHTML = data.games.map(renderGame).join('');
    document.getElementById('disclaimer').textContent = data.disclaimer || '';
    document.getElementById('updated-at').textContent = formatGeneratedAt(data.generated_at);
  }

  fetch('./predictions.json')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(render)
    .catch(function () {
      document.getElementById('app').innerHTML =
        '<p class="error-msg">無法載入預測資料，請稍後再試。</p>';
    });
})();

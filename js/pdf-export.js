/*
 * EXPORT NÁKUPNÍHO SEZNAMU DO PDF (jsPDF + AutoTable, písmo Knauf Screen).
 * Načítá se až při prvním exportu (viz app.js → exportPdf).
 * Vstup: data připravená v app.js (buildPdfData).
 */
(function () {
  'use strict';
  const CYAN = [0, 153, 222];
  const BLUE = [0, 55, 120];
  const INK = [22, 33, 43];
  const GREY = [111, 124, 134];
  const LINE = [221, 226, 229];
  const BG = [235, 238, 240];
  const GREEN = [0, 75, 70];
  const FONT = 'KnaufScreen';

  /** Buňka „název tučně + popis šedě“ – text slouží pro výpočet výšky, kreslí se ručně. */
  const rich = (title, sub) => ({ content: `${title}\n${sub}`, _rich: [title, sub] });
  const richHooks = (doc) => ({
    willDrawCell: (h) => { if (h.cell.raw && h.cell.raw._rich) h.cell.text = []; },
    didDrawCell: (h) => {
      const r = h.cell.raw && h.cell.raw._rich; if (!r) return;
      const x = h.cell.x + h.cell.padding('left'); const w = h.cell.width - h.cell.padding('left') - h.cell.padding('right');
      let y = h.cell.y + h.cell.padding('top') + 3;
      doc.setFont(FONT, 'bold'); doc.setFontSize(8.8); doc.setTextColor(...INK);
      doc.splitTextToSize(r[0], w).forEach((l) => { doc.text(l, x, y); y += 3.7; });
      doc.setFont(FONT, 'normal'); doc.setFontSize(7.4); doc.setTextColor(...GREY);
      doc.splitTextToSize(r[1], w).forEach((l) => { doc.text(l, x, y); y += 3.2; });
    },
  });

  function build(data) {
    const A = window.KI_PDF_ASSETS;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    doc.addFileToVFS('KnaufScreen-Regular.ttf', A.fontRegular);
    doc.addFont('KnaufScreen-Regular.ttf', FONT, 'normal');
    doc.addFileToVFS('KnaufScreen-Bold.ttf', A.fontBold);
    doc.addFont('KnaufScreen-Bold.ttf', FONT, 'bold');
    doc.setFont(FONT, 'normal');
    doc.setProperties({ title: `Nákupní seznam – ${data.projectName}`, subject: 'Plánovač zateplení', author: 'Knauf Insulation – Plánovač zateplení', creator: 'Plánovač zateplení' });

    const W = 210; const M = 15; const CW = W - 2 * M;
    let y = M;

    /* --- hlavička --- */
    const logoH = 8.5;
    doc.addImage(A.logo, 'PNG', M, y, logoH * A.logoRatio, logoH);
    const claimH = 16;
    doc.addImage(A.claim, 'PNG', W - M - claimH * A.claimRatio, y - 2, claimH * A.claimRatio, claimH);
    y += 18;
    doc.setDrawColor(...CYAN); doc.setLineWidth(0.9); doc.line(M, y, W - M, y);
    y += 9;

    doc.setFont(FONT, 'bold'); doc.setFontSize(20); doc.setTextColor(...CYAN);
    doc.text('NÁKUPNÍ SEZNAM', M, y);
    y += 7;
    doc.setFontSize(12.5); doc.setTextColor(...BLUE);
    doc.text(doc.splitTextToSize(data.projectName, CW)[0], M, y);
    y += 5.5;
    doc.setFont(FONT, 'normal'); doc.setFontSize(9); doc.setTextColor(...GREY);
    doc.text(`${data.date}  ·  Úroveň: ${data.levelLabel}  ·  Varianta: ${data.prioLabel}`, M, y);
    y += 7;

    /* --- souhrnné dlaždice --- */
    const tiles = [
      ['Plocha konstrukcí', data.totals.area],
      ['Balení a desek izolace', String(data.totals.packs)],
      ['Orientační cena vč. DPH', data.totals.priceVat],
    ];
    if (data.totals.saving) tiles.push(['Roční úspora za teplo', data.totals.saving]);
    const gap = 3; const tw = (CW - gap * (tiles.length - 1)) / tiles.length;
    tiles.forEach(([label, value], i) => {
      const x = M + i * (tw + gap);
      doc.setFillColor(...BG); doc.rect(x, y, tw, 15, 'F');
      doc.setFillColor(...(i === 3 ? [135, 193, 95] : i === 2 ? CYAN : [207, 215, 217])); doc.rect(x, y, 1.2, 15, 'F');
      doc.setFont(FONT, 'bold'); doc.setFontSize(12.5); doc.setTextColor(...(i === 3 ? GREEN : INK));
      doc.text(value, x + 4, y + 7);
      doc.setFont(FONT, 'normal'); doc.setFontSize(7.5); doc.setTextColor(...GREY);
      doc.text(label, x + 4, y + 11.8);
    });
    y += 21;

    /* --- tabulka položek --- */
    const body = [];
    const group = (label) => body.push([{ content: label.toUpperCase(), colSpan: 5, styles: { fillColor: BG, textColor: GREY, fontStyle: 'bold', fontSize: 7.5, cellPadding: { top: 1.6, bottom: 1.6, left: 2.5, right: 2.5 } } }]);
    group('Izolace');
    data.insulation.forEach((r) => body.push([
      rich(`${r.name} · ${r.t} mm`, r.desc),
      `${r.m2} m²`, `${r.perPack} m²/${r.unit}`,
      { content: `${r.packs} ${r.packsWord}`, styles: { fontStyle: 'bold', textColor: BLUE } },
      r.price,
    ]));
    if (data.accessories.length) {
      group('Vzduchotěsnost a příslušenství');
      data.accessories.forEach((r) => body.push([
        rich(r.name, r.desc), r.need, r.perPack,
        { content: `${r.qty} ${r.qtyWord}`, styles: { fontStyle: 'bold', textColor: BLUE } },
        r.price,
      ]));
    }
    const foot = [
      ['Celkem bez DPH', '', '', '', data.totals.price],
      [`DPH ${data.totals.vatPct} %`, '', '', '', data.totals.vat],
      [{ content: 'Celkem vč. DPH', styles: { fontSize: 11 } }, '', '', '', { content: data.totals.priceVat, styles: { fontSize: 11 } }],
    ];
    doc.autoTable({
      startY: y, margin: { left: M, right: M, bottom: 18 },
      head: [['Produkt', 'Potřeba', 'Balení', 'Koupit', 'Cena bez DPH']],
      body, foot, showFoot: 'lastPage',
      theme: 'plain', rowPageBreak: 'avoid', ...richHooks(doc),
      styles: { font: FONT, fontSize: 8.5, textColor: INK, cellPadding: { top: 2.2, bottom: 2.2, left: 2.5, right: 2.5 }, lineColor: LINE, lineWidth: { bottom: 0.2 }, valign: 'middle' },
      headStyles: { font: FONT, fontStyle: 'bold', fontSize: 7.5, textColor: GREY, fillColor: BG },
      footStyles: { font: FONT, fontStyle: 'bold', fillColor: BLUE, textColor: [255, 255, 255], lineWidth: 0 },
      columnStyles: { 0: { cellWidth: 78 }, 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right', cellWidth: 26 } },
      didParseCell: (h) => {
        if (h.section === 'head' && h.column.index > 0) h.cell.styles.halign = 'right';
        if (h.section === 'foot' && h.column.index === 4) h.cell.styles.halign = 'right';
      },
    });
    y = doc.lastAutoTable.finalY + 4;

    doc.setFont(FONT, 'normal'); doc.setFontSize(7.5); doc.setTextColor(...GREY);
    const notes = [];
    if (data.totals.noPrice) notes.push('Desky Heraklith / Tektalan nejsou ve stavebním ceníku – cenu získáte u prodejce, v součtu nejsou zahrnuty.');
    notes.push(`Ceny dle ${data.priceList}, bez slev. Skutečné ceny u prodejců se mohou lišit. Množství zahrnuje rezervu na prořez a je zaokrouhleno na celá balení.`);
    notes.forEach((n) => { const lines = doc.splitTextToSize(n, CW); doc.text(lines, M, y); y += lines.length * 3.4; });
    y += 4;

    /* --- skladby konstrukcí --- */
    const ensure = (h) => { if (y + h > 297 - 20) { doc.addPage(); y = M + 4; } };
    ensure(30);
    doc.setFont(FONT, 'bold'); doc.setFontSize(12); doc.setTextColor(...BLUE);
    doc.text('DOPORUČENÉ SKLADBY KONSTRUKCÍ', M, y);
    y += 3;
    doc.autoTable({
      startY: y, margin: { left: M, right: M, bottom: 18 },
      head: [['Konstrukce', 'Plocha', 'Doporučená skladba', 'U [W/(m²K)]']],
      body: data.constructions.map((c) => [
        rich(c.name, c.type), c.area, c.layers,
        c.U ? { content: `${c.U}\n${c.ok ? 'splňuje' : 'nesplňuje'} cíl ≤ ${c.target}`, styles: { textColor: c.ok ? GREEN : [168, 77, 0] } } : '—',
      ]),
      theme: 'plain', rowPageBreak: 'avoid', ...richHooks(doc),
      styles: { font: FONT, fontSize: 8.5, textColor: INK, cellPadding: { top: 2.2, bottom: 2.2, left: 2.5, right: 2.5 }, lineColor: LINE, lineWidth: { bottom: 0.2 }, valign: 'middle' },
      headStyles: { font: FONT, fontStyle: 'bold', fontSize: 7.5, textColor: GREY, fillColor: BG },
      columnStyles: { 0: { cellWidth: 46 }, 1: { halign: 'right', cellWidth: 20 }, 3: { halign: 'right', cellWidth: 32 } },
      didParseCell: (h) => { if (h.section === 'head' && (h.column.index === 1 || h.column.index === 3)) h.cell.styles.halign = 'right'; },
    });
    y = doc.lastAutoTable.finalY + 6;

    /* --- dotace --- */
    if (data.subsidy) {
      ensure(24);
      doc.setFillColor(210, 231, 192); doc.rect(M, y, CW, 19, 'F');
      doc.setFillColor(135, 193, 95); doc.rect(M, y, 1.2, 19, 'F');
      doc.setFont(FONT, 'bold'); doc.setFontSize(10); doc.setTextColor(...GREEN);
      doc.text('Dotace Nová zelená úsporám 2026 – orientační odhad', M + 4, y + 5.5);
      doc.setFont(FONT, 'normal'); doc.setFontSize(8.5); doc.setTextColor(...INK);
      doc.text(`${data.subsidy.light}   ·   ${data.subsidy.loan}`, M + 4, y + 10.5);
      doc.setFontSize(7.2); doc.setTextColor(...GREY);
      doc.text(doc.splitTextToSize(data.subsidy.note, CW - 8), M + 4, y + 14.6);
      y += 25;
    }

    /* --- upozornění --- */
    ensure(16);
    doc.setFont(FONT, 'normal'); doc.setFontSize(7.2); doc.setTextColor(...GREY);
    doc.text(doc.splitTextToSize(data.disclaimer, CW), M, y);

    /* --- patička na každé stránce --- */
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(...LINE); doc.setLineWidth(0.3); doc.line(M, 297 - 13, W - M, 297 - 13);
      doc.setFont(FONT, 'normal'); doc.setFontSize(7.5); doc.setTextColor(...GREY);
      doc.text(`Plánovač zateplení · Knauf Insulation · vytvořeno ${data.date}`, M, 297 - 8.5);
      doc.text(`Strana ${i} / ${pages}`, W - M, 297 - 8.5, { align: 'right' });
    }
    return doc;
  }

  window.PlannerPDF = { build };
})();

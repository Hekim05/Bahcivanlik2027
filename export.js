/* Word / PDF / Excel çıktıları – kütüphaneler yalnızca gerektiğinde yüklenir */
(function () {
  const loaded = {};
  function loadScript(src) {
    if (!loaded[src]) {
      loaded[src] = new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = src; s.onload = res;
        s.onerror = () => { delete loaded[src]; rej(new Error("Yüklenemedi: " + src)); };
        document.head.appendChild(s);
      });
    }
    return loaded[src];
  }

  const isWeekRow = r => r.length > 1 && /hafta/i.test(r[0] || "") && r.slice(1).every(c => !String(c || "").trim());
  const isRamazan = r => r.some(c => /ramazan/i.test(String(c || "")));
  const countRows = b => (b.rows || []).filter(r => r.slice(/^no$/i.test((b.head || [])[0] || "") ? 1 : 0).some(c => String(c || "").trim())).length;
  const lines = x => String(x == null ? "" : x).split("\n");

  function blockLines(b) {
    switch (b.t) {
      case "ul": return (b.items || []).map(i => "• " + i);
      case "ol": return (b.items || []).map((i, n) => (n + 1) + ". " + i);
      case "chk": return (b.items || []).map(i => (i.done ? "[x] " : "[ ] ") + i.x);
      case "tbl": return [];
      default: return lines(b.x);
    }
  }

  function safeName(s) {
    return String(s).toLocaleLowerCase("tr").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
      .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function save(blob, filename) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    try {
      const file = new File([blob], filename, { type: blob.type });
      if (isIOS && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return;
      }
    } catch (e) { if (e && e.name === "AbortError") return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  /* ---------- WORD ---------- */
  async function toWord(parts, title, withHeadings) {
    await loadScript("vendor/docx.umd.js");
    const D = window.docx;
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType } = D;
    const runs = (x, o = {}) => lines(x).map((t, i) => new TextRun({ text: t, break: i > 0 ? 1 : 0, ...o }));
    const children = [];
    parts.forEach((part, pi) => {
      if (withHeadings) {
        children.push(new Paragraph({ pageBreakBefore: pi > 0, spacing: { after: 200 },
          children: [new TextRun({ text: part.label, bold: true, size: 30, color: "2F6B3A" })] }));
      }
      part.blocks.forEach(b => {
        if (b.t === "tbl") {
          if (b.count) children.push(new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Toplam: " + countRows(b) + " " + b.count, bold: true })] }));
          const n = (b.head || []).length || Math.max(...(b.rows || [[""]]).map(r => r.length));
          const cell = (txt, shade, bold, span) => new TableCell({
            columnSpan: span || 1,
            shading: shade ? { type: ShadingType.CLEAR, color: "auto", fill: shade } : undefined,
            margins: { top: 40, bottom: 40, left: 80, right: 80 },
            children: [new Paragraph({ children: runs(txt, { size: 18, bold: !!bold }) })]
          });
          const rows = [];
          if (b.head && b.head.length) rows.push(new TableRow({ tableHeader: true, children: b.head.map(h => cell(h, "E3EFE2", true)) }));
          (b.rows || []).forEach(r => {
            if (isWeekRow(r)) rows.push(new TableRow({ children: [cell(r[0], "EEF3EA", true, n)] }));
            else {
              const shade = isRamazan(r) ? "FDF3DC" : null;
              const cells = [];
              for (let i = 0; i < n; i++) cells.push(cell(r[i] || "", shade, false));
              rows.push(new TableRow({ children: cells }));
            }
          });
          children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
          children.push(new Paragraph({ text: "" }));
          return;
        }
        if (b.t === "ul" || b.t === "ol" || b.t === "chk") {
          blockLines(b).forEach(l => children.push(new Paragraph({ indent: { left: 360, hanging: 240 }, spacing: { after: 60 }, children: runs(l) })));
          children.push(new Paragraph({ text: "" }));
          return;
        }
        const opt = { spacing: { after: 120 } };
        let ro = {};
        if (b.t === "h") { ro = { bold: true, size: 26, color: "2F6B3A" }; opt.spacing = { before: 200, after: 100 }; }
        if (b.t === "b") ro = { bold: true };
        if (b.t === "c") { ro = { bold: true }; opt.alignment = AlignmentType.CENTER; opt.spacing = { before: 60, after: 200 }; }
        if (b.t === "r") { opt.alignment = AlignmentType.RIGHT; opt.spacing = { before: 240, after: 240 }; }
        children.push(new Paragraph({ ...opt, children: runs(b.x, ro) }));
      });
    });
    const doc = new Document({
      creator: "Kent Tarım Birimi", title,
      styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
      sections: [{ properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } }, children }]
    });
    const blob = await Packer.toBlob(doc);
    await save(blob, safeName(title) + ".docx");
  }

  /* ---------- PDF ---------- */
  async function toPdf(parts, title, withHeadings) {
    await loadScript("vendor/pdfmake.min.js");
    await loadScript("vendor/vfs_fonts.js");
    const content = [];
    parts.forEach((part, pi) => {
      if (withHeadings) content.push({ text: part.label, bold: true, fontSize: 15, color: "#2f6b3a", margin: [0, 0, 0, 10], pageBreak: pi > 0 ? "before" : undefined });
      part.blocks.forEach(b => {
        switch (b.t) {
          case "h": content.push({ text: b.x, bold: true, fontSize: 12.5, color: "#2f6b3a", margin: [0, 10, 0, 5] }); break;
          case "b": content.push({ text: b.x, bold: true, margin: [0, 2, 0, 6] }); break;
          case "c": content.push({ text: b.x, bold: true, alignment: "center", margin: [0, 4, 0, 12] }); break;
          case "r": content.push({ text: b.x, alignment: "right", margin: [0, 14, 0, 14] }); break;
          case "ul": content.push({ ul: (b.items || []).map(i => i || " "), margin: [0, 0, 0, 8] }); break;
          case "ol": content.push({ ol: (b.items || []).map(i => i || " "), margin: [0, 0, 0, 8] }); break;
          case "chk": content.push({ stack: blockLines(b), margin: [0, 0, 0, 8] }); break;
          case "tbl": {
            if (b.count) content.push({ text: "Toplam: " + countRows(b) + " " + b.count, bold: true, margin: [0, 2, 0, 6] });
            const head = b.head || [];
            const n = head.length || Math.max(...(b.rows || [[""]]).map(r => r.length));
            const maxLen = Array.from({ length: n }, (_, i) => Math.max(String(head[i] || "").length, ...(b.rows || []).filter(r => !isWeekRow(r)).map(r => String(r[i] || "").length)));
            const widths = maxLen.map(l => (l <= 14 ? "auto" : "*"));
            const body = [];
            if (head.length) body.push(head.map(h => ({ text: h, bold: true, fillColor: "#e3efe2" })));
            (b.rows || []).forEach(r => {
              if (isWeekRow(r)) {
                const row = [{ text: r[0], bold: true, colSpan: n, fillColor: "#eef3ea" }];
                for (let i = 1; i < n; i++) row.push({});
                body.push(row);
              } else {
                const fill = isRamazan(r) ? "#fdf3dc" : undefined;
                const row = [];
                for (let i = 0; i < n; i++) { const tx = r[i] || ""; row.push({ text: tx, fillColor: fill, noWrap: tx.length <= 12 && !/\s/.test(tx.trim()) }); }
                body.push(row);
              }
            });
            content.push({ table: { headerRows: head.length ? 1 : 0, widths, body }, fontSize: 8.5,
              layout: { hLineColor: () => "#cfcabd", vLineColor: () => "#cfcabd", hLineWidth: () => 0.5, vLineWidth: () => 0.5,
                paddingTop: () => 3, paddingBottom: () => 3 }, margin: [0, 2, 0, 12] });
            break;
          }
          default: content.push({ text: b.x || "", margin: [0, 0, 0, 7] });
        }
      });
    });
    const wide = parts.some(pt => pt.blocks.some(b => b.t === "tbl" && (b.head || []).length > 7));
    const dd = { pageSize: "A4", pageOrientation: wide ? "landscape" : "portrait", pageMargins: [48, 48, 48, 56], content,
      defaultStyle: { font: "Roboto", fontSize: 10.5, lineHeight: 1.2 },
      info: { title, author: "Kent Tarım Birimi" },
      footer: (cur, total) => ({ text: title + "  ·  " + cur + "/" + total, alignment: "center", fontSize: 8, color: "#888", margin: [0, 20, 0, 0] }) };
    const blob = await new Promise(res => window.pdfMake.createPdf(dd).getBlob(res));
    await save(blob, safeName(title) + ".pdf");
  }

  /* ---------- EXCEL ---------- */
  async function toExcel(parts, title) {
    await loadScript("vendor/xlsx.mini.min.js");
    const X = window.XLSX;
    const wb = X.utils.book_new();
    const used = new Set();
    const sheetName = s => {
      let base = String(s).replace(/[\[\]:*?\/\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 28) || "Sayfa";
      let name = base, k = 2;
      while (used.has(name.toLocaleLowerCase("tr"))) name = base.slice(0, 26) + " " + k++;
      used.add(name.toLocaleLowerCase("tr"));
      return name;
    };
    parts.forEach(part => {
      const aoa = [[part.label], []];
      const widths = [];
      const merges = [];
      part.blocks.forEach(b => {
        if (b.t === "tbl") {
          const head = b.head || [];
          if (b.count) aoa.push(["Toplam: " + countRows(b) + " " + b.count]);
          if (head.length) aoa.push(head.slice());
          (b.rows || []).forEach(r => {
            if (isWeekRow(r)) { merges.push({ s: { r: aoa.length, c: 0 }, e: { r: aoa.length, c: Math.max(head.length - 1, 0) } }); aoa.push([r[0]]); }
            else aoa.push(r.slice());
          });
          aoa.push([]);
        } else {
          blockLines(b).forEach(l => aoa.push([l]));
        }
      });
      aoa.forEach(r => r.forEach((c, i) => { widths[i] = Math.min(60, Math.max(widths[i] || 8, String(c || "").length + 2)); }));
      const ws = X.utils.aoa_to_sheet(aoa);
      ws["!cols"] = widths.map(w => ({ wch: w }));
      if (merges.length) ws["!merges"] = merges;
      X.utils.book_append_sheet(wb, ws, sheetName(part.sheet || part.label));
    });
    const out = X.write(wb, { bookType: "xlsx", type: "array" });
    await save(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), safeName(title) + ".xlsx");
  }

  window.Exporter = { loadReader: () => loadScript("vendor/xlsx.full.min.js"), toWord, toPdf, toExcel, save, safeName, isWeekRow, isRamazan, blockLines };
})();

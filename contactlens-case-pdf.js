// contactlens-case-pdf-emergency-layout.js
// Focus CaseX - Contact Lens Case PDF Export (Emergency Case Layout - Generic Header)
// This file converts the Contact Lens PDF generator to match the Emergency Case professional layout:
// - Top header: "Focus CaseX - Optometry Report" (generic, centered, dark-blue)
// - White-on-blue section bars (same style as Emergency Case)
// - Same fonts, margins, pagination, OD/OS two-column blocks and two-column tables
// - Robust getters for id/name/radio/checkbox/textarea groups
// - Pagination-safe, auto-wrapping, overlap-free layout
// - Triggers immediate download when #downloadPdf is clicked
//
// Requires: jsPDF UMD loaded on the page (window.jspdf.jsPDF)

document.addEventListener('DOMContentLoaded', () => {
  const downloadPdfButton = document.getElementById('downloadPdf');
  const form = document.getElementById('optometryCaseForm');

  if (!downloadPdfButton || !form) {
    console.info('Contact Lens (Emergency Layout): missing #downloadPdf or #optometryCaseForm — handler not initialized.');
    return;
  }
  if (typeof window.jspdf === 'undefined') {
    console.error('Contact Lens (Emergency Layout): jsPDF not loaded. Add jsPDF UMD CDN in <head>.');
    return;
  }

  // -------------------------
  // Layout constants & state
  // -------------------------
  const { jsPDF } = window.jspdf;
  const margin = 15;
  const topMargin = 16;
  const bottomMargin = 18;
  const defaultLineHeight = 5;     // base for ~10pt
  const smallLineHeight = 4.5;
  const tableCellPad = 2;
  const headerBlue = { r: 0, g: 77, b: 128 }; // #004D80
  const sectionBarHeight = 7;
  const pageSize = { format: 'a4', unit: 'mm', orientation: 'p' };

  // -------------------------
  // Helpers: robust field getters
  // -------------------------
  const isEmpty = v => v === null || v === undefined || String(v).trim() === '' || v === 'Select...' || v === 'N/A' || v === '-';

  const elById = id => document.getElementById(id) || null;
  const elByName = name => document.querySelector(`[name="${name}"]`) || null;

  function resolveElement(el) {
    if (!el) return '';
    const tag = el.tagName ? el.tagName.toUpperCase() : '';
    const type = el.type || '';
    try {
      if (tag === 'SELECT') return el.value !== 'Select...' ? el.value : '';
      if (type === 'radio') {
        const checked = document.querySelector(`input[name="${el.name}"]:checked`);
        return checked ? checked.value : '';
      }
      if (type === 'checkbox') {
        // return comma list for group if same name
        const group = document.querySelectorAll(`input[name="${el.name}"]`);
        if (group && group.length > 1) {
          return Array.from(group).filter(g => g.checked).map(g => g.value || 'on').join(', ');
        }
        return el.checked ? (el.value || 'Yes') : 'No';
      }
      if (tag === 'TEXTAREA' || tag === 'INPUT') return el.value || '';
      // fallback
      return el.value || '';
    } catch (e) {
      console.error('resolveElement error', e);
      return el.value || '';
    }
  }

  // Prefer ID first, then name, then attempt groups of same id for checkboxes
  function getValue(key) {
    if (!key) return '';
    // try by id
    let el = elById(key);
    if (el) return resolveElement(el);
    // try by name (first matched input/select/textarea)
    el = document.querySelector(`[name="${key}"]`);
    if (el) return resolveElement(el);
    // try for multiple elements with same id/class (checkbox groups that were assigned similar ids)
    const maybe = document.querySelectorAll(`#${CSS.escape ? CSS.escape(key) : key}`);
    if (maybe && maybe.length > 0) {
      return Array.from(maybe).filter(e => e.checked).map(e => e.value || 'on').join(', ');
    }
    return '';
  }

  // Return checked list by name specifically
  function getCheckedList(name) {
    const boxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    if (!boxes || boxes.length === 0) return '';
    return Array.from(boxes).map(b => b.value).join(', ');
  }

  // Return textarea by name specifically
  function getTextAreaByName(name) {
    const t = document.querySelector(`textarea[name="${name}"]`);
    return t ? (t.value || '') : '';
  }

  // -------------------------
  // PDF helpers & pagination
  // -------------------------
  function createDoc() {
    return new jsPDF(pageSize.orientation, pageSize.unit, pageSize.format);
  }

  downloadPdfButton.addEventListener('click', (evt) => {
    evt.preventDefault();

    const doc = createDoc();
    const PAGE_W = doc.internal.pageSize.width;
    const PAGE_H = doc.internal.pageSize.height;
    const usableWidth = PAGE_W - margin * 2;

    let y = topMargin;
    let pageNumber = 1;

    function addHeader() {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(headerBlue.r, headerBlue.g, headerBlue.b);
      doc.text('Focus CaseX - Optometry Report', PAGE_W / 2, 10, { align: 'center' });

      // thin blue bar below org line (like emergency)
      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text('Contact Lens Case', PAGE_W / 2, 15, { align: 'center' });

      // horizontal line + blue section top area
      doc.setDrawColor(180);
      doc.line(margin, 17, PAGE_W - margin, 17);

      // Reset for body
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0);
      y = topMargin + 6; // small gap after header
    }

    function addFooter() {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`© 2025 Focus CaseX`, margin, PAGE_H - 10);
      doc.text(`Page ${pageNumber}`, PAGE_W - margin, PAGE_H - 10, { align: 'right' });
    }

    function checkPageBreak(spaceNeeded) {
      if (y + spaceNeeded > PAGE_H - bottomMargin) {
        addFooter();
        doc.addPage();
        pageNumber += 1;
        addHeader();
      }
    }

    // White-on-blue section bar (Emergency style)
    function addSectionTitle(title) {
      if (isEmpty(title)) return;
      checkPageBreak(defaultLineHeight * 3 + 8);
      doc.setFillColor(headerBlue.r, headerBlue.g, headerBlue.b);
      doc.rect(margin, y, usableWidth, sectionBarHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255);
      doc.text(title, PAGE_W / 2, y + (sectionBarHeight / 2) + 2, { align: 'center' });
      y += sectionBarHeight + 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0);
    }

    // Add a label:value row (key-value)
    function addKeyValue(label, value) {
      if (isEmpty(value)) return false;
      const labelW = 55;
      const valueW = usableWidth - labelW - 6;
      const labelLines = doc.splitTextToSize(label + ':', labelW);
      const valueLines = doc.splitTextToSize(String(value), valueW);
      const blockH = Math.max(labelLines.length, valueLines.length) * defaultLineHeight + 2;
      checkPageBreak(blockH + 6);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(labelLines, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(valueLines, margin + labelW + 6, y);
      y += blockH + 6;
      return true;
    }

    // Eye group: OD/OS columns, OU below if provided
    function addEyeGroup(title, odValue, osValue, ouValue = '') {
      odValue = odValue ? String(odValue).trim() : '';
      osValue = osValue ? String(osValue).trim() : '';
      ouValue = ouValue ? String(ouValue).trim() : '';

      if (isEmpty(odValue) && isEmpty(osValue) && isEmpty(ouValue)) return;

      checkPageBreak(defaultLineHeight * 2 + 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(title, margin, y);
      y += defaultLineHeight + 4;
      doc.setFont('helvetica', 'normal');

      const columnGap = 8;
      const colWidth = (usableWidth - columnGap) / 2;

      const odBlock = odValue ? doc.splitTextToSize(`OD: ${odValue}`, colWidth - 4) : [];
      const osBlock = osValue ? doc.splitTextToSize(`OS: ${osValue}`, colWidth - 4) : [];
      const maxLines = Math.max(odBlock.length, osBlock.length);
      const blockH = Math.max(1, maxLines) * defaultLineHeight + 4;

      checkPageBreak(blockH + 6);

      if (odBlock.length > 0) doc.text(odBlock, margin, y);
      if (osBlock.length > 0) doc.text(osBlock, margin + colWidth + columnGap, y);

      y += blockH + 6;

      if (!isEmpty(ouValue)) {
        const ouBlock = doc.splitTextToSize(`OU: ${ouValue}`, usableWidth);
        checkPageBreak(ouBlock.length * defaultLineHeight + 4);
        doc.text(ouBlock, margin, y);
        y += ouBlock.length * defaultLineHeight + 6;
      }
    }

    // Two-column table renderer similar to Emergency (horizontal lines only)
    function renderTwoColTable(opts) {
      const title = opts.title || '';
      const rows = opts.rows || [];
      const totalWidth = opts.totalWidth || usableWidth * 0.85;
      const startX = margin + (usableWidth - totalWidth) / 2;

      const labelColW = opts.labelColW || totalWidth * 0.45;
      const eyeColW = opts.eyeColW || (totalWidth - labelColW) / 2;
      const x1 = startX;
      const x2 = x1 + labelColW;
      const x3 = x2 + eyeColW;
      const x4 = x3 + eyeColW;

      if (title) {
        checkPageBreak(defaultLineHeight * 3 + 6);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(headerBlue.r, headerBlue.g, headerBlue.b);
        doc.text(title, startX + totalWidth / 2, y, { align: 'center' });
        doc.setTextColor(0);
        y += defaultLineHeight + 4;
      }

      // Header background
      checkPageBreak(smallLineHeight * 3 + 6);
      const headerHeight = smallLineHeight + 4;
      doc.setFillColor(240, 240, 240);
      doc.rect(startX, y, totalWidth, headerHeight, 'F');
      doc.setDrawColor(180);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Type', x1 + 2, y + 3 + 1);
      doc.text('OD', x2 + eyeColW / 2, y + 3 + 1, { align: 'center' });
      doc.text('OS', x3 + eyeColW / 2, y + 3 + 1, { align: 'center' });
      y += headerHeight + 2;
      doc.line(startX, y, startX + totalWidth, y);

      // Rows
      let rowsHeightAccumulator = 0;
      rows.forEach(r => {
        const label = r.label || '';
        const c1 = isEmpty(r.c1) ? '' : String(r.c1);
        const c2 = isEmpty(r.c2) ? '' : String(r.c2);
        const c1Lines = doc.splitTextToSize(c1, eyeColW - 4);
        const c2Lines = doc.splitTextToSize(c2, eyeColW - 4);
        const labelLines = doc.splitTextToSize(label, labelColW - 4);
        const maxLines = Math.max(labelLines.length, c1Lines.length, c2Lines.length, 1);
        const rowH = maxLines * smallLineHeight + 4;
        checkPageBreak(rowH + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(labelLines, x1 + 2, y + 3);
        doc.text(c1Lines, x2 + eyeColW / 2, y + 3, { align: 'center' });
        doc.text(c2Lines, x3 + eyeColW / 2, y + 3, { align: 'center' });

        y += rowH;
        rowsHeightAccumulator += rowH;
        doc.line(startX, y, startX + totalWidth, y);
      });

      // Vertical guide lines for visual separation (light)
      const totalTableHeight = headerHeight + 2 + rowsHeightAccumulator;
      doc.setDrawColor(190);
      // left border
      doc.line(x1, y - totalTableHeight, x1, y);
      // label/col border
      doc.line(x2, y - totalTableHeight, x2, y);
      // between eyes
      doc.line(x3, y - totalTableHeight, x3, y);
      // right border
      doc.line(x4, y - totalTableHeight, x4, y);

      y += 6; // small gap after table
    }

    // Lined box (Assessment/Plan)
    function drawLinedBlock(title, content, blockHeight = 54) {
      if (isEmpty(content) && isEmpty(title)) return;
      if (!isEmpty(title)) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(title, margin, y);
        y += 5;
      }
      checkPageBreak(blockHeight + 10);
      const boxW = PAGE_W - margin * 2;
      const top = y;
      doc.setDrawColor(200);
      doc.rect(margin, top, boxW, blockHeight);
      doc.setDrawColor(230);
      const gap = 6;
      let lineY = top + gap;
      while (lineY < top + blockHeight - 4) {
        doc.line(margin + 6, lineY, margin + boxW - 6, lineY);
        lineY += gap;
      }
      if (!isEmpty(content)) {
        const lines = doc.splitTextToSize(content, boxW - 12);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0);
        doc.text(lines, margin + 6, top + 6);
      }
      y = top + blockHeight + 8;
    }

    // -------------------------
    // Start PDF content (Emergency layout)
    // -------------------------
    addHeader();

    // Patient Information
    addSectionTitle('Patient Information');
    addKeyValue('Patient Name', getValue('patientName'));
    addKeyValue('Patient ID', getValue('patientId'));
    addKeyValue('Age / DOB', (getValue('patientAge') || getValue('dateOfBirth')) ? `${getValue('patientAge') || ''}${getValue('patientAge') && getValue('dateOfBirth') ? ' / ' : ''}${getValue('dateOfBirth') || ''}` : '');
    addKeyValue('Gender', getValue('patientGender'));
    addKeyValue('Contact Number', getValue('contactNumber'));
    addKeyValue('Date of Presentation', getValue('dateOfPresentation') || getValue('dateOfOnset'));

    // Chief Complaint & History
    addSectionTitle('Chief Complaint & History');
    addKeyValue('Chief Complaint', getTextAreaByName('chiefComplaint') || getValue('chiefComplaint'));
    addKeyValue('History of Present Illness', getTextAreaByName('hpi'));
    // CL-related symptoms (attempt multiple strategies)
    const clSymptoms = getCheckedList('clSymptoms') || getCheckedList('cl_dryness') || (() => {
      const ids = ['cl_dryness','cl_redness','cl_blurryVision','cl_discomfort','cl_itching','cl_glare','cl_haze'];
      const arr = [];
      ids.forEach(id => {
        const el = elById(id);
        if (el && el.checked) arr.push(el.value);
      });
      return arr.join(', ');
    })();
    addKeyValue('CL Related Symptoms', clSymptoms);

    // Contact Lens History
    addSectionTitle('Contact Lens History');
    addKeyValue('Previous CL History', getValue('previousCLHistory'));
    addKeyValue('Current CL Type', getValue('currentCLType'));
    addKeyValue('Current CL Brand/Params', getValue('currentCLBrand'));
    addKeyValue('Wear Schedule', getValue('wearSchedule'));
    addKeyValue('Replacement Schedule', getValue('replacementSchedule'));
    addKeyValue('Care System Used', getValue('careSystemUsed'));
    addKeyValue('Sleeps in Lenses?', getValue('sleepsInLenses'));
    addKeyValue('Swims/Showers in Lenses?', getValue('swimsInLenses'));

    // Examination - Visual Acuity table (two-column)
    addSectionTitle('Examination (Contact Lens Focused)');

    const vaRows = [
      { label: 'UC VA with CLs', c1: getValue('vaWithClsOD') || getTextAreaByName('vaWithClsOD'), c2: getValue('vaWithClsOS') || getTextAreaByName('vaWithClsOS') },
      { label: 'Near VA with CLs', c1: getValue('vaNearWithClsOD') || getTextAreaByName('vaNearWithClsOD'), c2: getValue('vaNearWithClsOS') || getTextAreaByName('vaNearWithClsOS') },
      { label: 'Over-Refraction', c1: getValue('overRefractionOD') || getValue('overRefractionOD'), c2: getValue('overRefractionOS') || getValue('overRefractionOS') },
      { label: 'Final VA with ORx', c1: getValue('finalVaOverRefractionOD'), c2: getValue('finalVaOverRefractionOS') }
    ];

    renderTwoColTable({
      title: 'Visual Acuity',
      rows: vaRows,
      totalWidth: usableWidth * 0.7,
      labelColW: (usableWidth * 0.7) * 0.42,
      eyeColW: (usableWidth * 0.7 - ((usableWidth * 0.7) * 0.42)) / 2
    });

    // Manifest Refraction (one-column per eye)
    const mrxRows = [
      { label: 'MRx OD', c1: getValue('manifestRefractionOD') },
      { label: 'MRx OS', c1: getValue('manifestRefractionOS') }
    ];
    renderTwoColTable({
      title: 'Manifest Refraction (Spectacle Rx)',
      rows: mrxRows.map(r => ({ label: r.label, c1: r.c1 || '', c2: '' })),
      totalWidth: usableWidth * 0.62,
      labelColW: (usableWidth * 0.62) * 0.35
    });

    // Keratometry
    const kRows = [
      { label: 'K1 OD', c1: getValue('k1OD') },
      { label: 'K2 OD', c1: getValue('k2OD') },
      { label: 'Axis OD', c1: getValue('axisOD') },
      { label: 'K1 OS', c1: getValue('k1OS') },
      { label: 'K2 OS', c1: getValue('k2OS') },
      { label: 'Axis OS', c1: getValue('axisOS') }
    ];
    renderTwoColTable({
      title: 'Keratometry',
      rows: kRows.map(r => ({ label: r.label, c1: r.c1 || '', c2: '' })),
      totalWidth: usableWidth * 0.82,
      labelColW: (usableWidth * 0.82) * 0.18
    });

    // HVID & TBUT
    const htRows = [
      { label: 'HVID OD', c1: getValue('hvidOD') },
      { label: 'HVID OS', c1: getValue('hvidOS') },
      { label: 'TBUT OD (sec)', c1: getValue('tbutOD') },
      { label: 'TBUT OS (sec)', c1: getValue('tbutOS') }
    ];
    renderTwoColTable({
      title: 'HVID & TBUT',
      rows: htRows.map(r => ({ label: r.label, c1: r.c1 || '', c2: '' })),
      totalWidth: usableWidth * 0.6,
      labelColW: (usableWidth * 0.6) * 0.36
    });

    // Slit lamp & corneal findings
    addKeyValue('Slit Lamp with CLs', getTextAreaByName('slitLampWithCls') || getValue('slitLampWithCls'));
    addKeyValue('Conjunctival Findings', getValue('conjunctivalFindings'));
    if (getValue('conjunctivalFindings') === 'Other') addKeyValue('Conjunctival Details', getValue('conjunctivalFindings_details'));

    addKeyValue('Corneal Staining OD?', getValue('cornealStainingOD'));
    if (getValue('cornealStainingOD') === 'Yes') addKeyValue('Staining OD Details', getValue('stainingOD_details'));
    addKeyValue('Corneal Staining OS?', getValue('cornealStainingOS'));
    if (getValue('cornealStainingOS') === 'Yes') addKeyValue('Staining OS Details', getValue('stainingOS_details'));

    addKeyValue('Infiltrates/Ulcers OD?', getValue('infiltratesUlcersOD'));
    if (getValue('infiltratesUlcersOD') === 'Yes') addKeyValue('Infiltrates/Ulcers OD Details', getValue('infiltratesUlcersOD_details'));
    addKeyValue('Infiltrates/Ulcers OS?', getValue('infiltratesUlcersOS'));
    if (getValue('infiltratesUlcersOS') === 'Yes') addKeyValue('Infiltrates/Ulcers OS Details', getValue('infiltratesUlcersOS_details'));

    addKeyValue('Corneal NV OD?', getValue('cornealNVOD'));
    if (getValue('cornealNVOD') === 'Yes') addKeyValue('Corneal NV OD Details', getValue('cornealNVOD_details'));
    addKeyValue('Corneal NV OS?', getValue('cornealNVOS'));
    if (getValue('cornealNVOS') === 'Yes') addKeyValue('Corneal NV OS Details', getValue('cornealNVOS_details'));

    addKeyValue('Lid Eversion Performed?', getValue('lidEversionPerformed'));
    addKeyValue('Lid Wiper Epitheliopathy OD', getValue('lidWiperEpitheliopathyOD'));
    addKeyValue('Lid Wiper Epitheliopathy OS', getValue('lidWiperEpitheliopathyOS'));

    // Contact Lens Parameters
    addSectionTitle('Contact Lens Parameters (Trial / New Rx)');
    addKeyValue('Lens Type', getValue('clLensType'));
    addKeyValue('Material', getValue('clMaterial'));
    addKeyValue('Brand', getValue('clBrand'));
    addKeyValue('Base Curve OD', getValue('clBcOD'));
    addKeyValue('Base Curve OS', getValue('clBcOS'));
    addKeyValue('Diameter OD', getValue('clDiaOD'));
    addKeyValue('Diameter OS', getValue('clDiaOS'));
    addKeyValue('Water Content (%)', getValue('clWaterContent'));
    addKeyValue('Dk/t Value', getValue('clDk_tValue'));
    addKeyValue('Power OD', getValue('clPowerOD'));
    addKeyValue('Power OS', getValue('clPowerOS'));
    addKeyValue('Add OD (multifocal)', getValue('clAddOD'));
    addKeyValue('Add OS (multifocal)', getValue('clAddOS'));

    // Lens Fit Assessment
    addSectionTitle('Lens Fit Assessment (with CLs IN)');
    addKeyValue('Centration OD', getValue('clFitCentrationOD'));
    addKeyValue('Centration OS', getValue('clFitCentrationOS'));
    addKeyValue('Movement OD', getValue('clFitMovementOD'));
    addKeyValue('Movement OS', getValue('clFitMovementOS'));
    addKeyValue('Coverage OD', getValue('clFitCoverageOD'));
    addKeyValue('Coverage OS', getValue('clFitCoverageOS'));
    addKeyValue('Rotation OD', getValue('clFitRotationOD'));
    addKeyValue('Rotation OS', getValue('clFitRotationOS'));

    // Trial lens parameters (only render if present)
    const trialRows = [
      { label: 'Trial BC OD', c1: getValue('trialBcOD') },
      { label: 'Trial BC OS', c1: getValue('trialBcOS') },
      { label: 'Trial DIA OD', c1: getValue('trialDiaOD') },
      { label: 'Trial DIA OS', c1: getValue('trialDiaOS') },
      { label: 'Trial Power OD', c1: getValue('trialPowerOD') },
      { label: 'Trial Power OS', c1: getValue('trialPowerOS') }
    ];
    if (trialRows.some(r => !isEmpty(r.c1))) {
      renderTwoColTable({
        title: 'Trial Lens Parameters (if used)',
        rows: trialRows.map(r => ({ label: r.label, c1: r.c1 || '', c2: '' })),
        totalWidth: usableWidth * 0.82,
        labelColW: (usableWidth * 0.82) * 0.3
      });
    }

    // Over-refraction & final VA
    const orRows = [
      { label: 'Over-refraction OD', c1: getValue('overRefractionOD') },
      { label: 'Over-refraction OS', c1: getValue('overRefractionOS') },
      { label: 'Final VA with ORx OD', c1: getValue('finalVaOverRefractionOD') },
      { label: 'Final VA with ORx OS', c1: getValue('finalVaOverRefractionOS') }
    ];
    renderTwoColTable({
      title: 'Over-refraction & Final VA',
      rows: orRows.map(r => ({ label: r.label, c1: r.c1 || '', c2: '' })),
      totalWidth: usableWidth * 0.72,
      labelColW: (usableWidth * 0.72) * 0.45
    });

    // Prescription / Follow-up
    addSectionTitle('Final Prescription & Follow-up');
    addKeyValue('CL Rx Issued?', getValue('clRxIssued'));
    if (getValue('clRxIssued') === 'Yes') addKeyValue('Contact Lens Prescription', getValue('contactLensRx'));
    addKeyValue('Prognosis', getValue('prognosis'));
    addKeyValue('Follow Up Instructions', getTextAreaByName('followUpInstructions') || getValue('followUpInstructions'));

    // Assessment & Plan (lined blocks)
    addSectionTitle('Assessment & Plan');
    drawLinedBlock('Assessment / Diagnoses', getTextAreaByName('assessmentDiagnoses') || getValue('assessmentDiagnoses'), 58);
    drawLinedBlock('Plan / Treatment', getTextAreaByName('plan') || getValue('plan'), 58);

    // Notes & Reflection
    addSectionTitle('Notes & Reflection');
    addKeyValue('Internal Notes', getTextAreaByName('internalNotes') || getValue('internalNotes'));
    addKeyValue('Personal Reflection / Learning', getTextAreaByName('notesReflection') || getValue('notesReflection'));

    // Report Metadata & Signoff
    addSectionTitle('Report Metadata');
    addKeyValue('Report Generated By', getValue('reportGeneratedBy') || 'Focus CaseX EMR');
    addKeyValue('Date Generated', getValue('reportGeneratedDate') || (new Date()).toLocaleDateString());

    // Finalize PDF
    addFooter();

    // Compose filename and save
    const patientForFile = (getValue('patientName') || 'Untitled').replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-_]/g, '');
    const filename = `ContactLensCase-${patientForFile}.pdf`;

    try {
      doc.save(filename);
    } catch (e) {
      console.error('PDF save error, attempting fallback:', e);
      const dataUrl = doc.output('datauristring');
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${dataUrl}" frameborder="0" style="width:100%;height:100%"></iframe>`);
      } else {
        alert('Unable to open PDF automatically. Check popup blocker or allow downloads for this site.');
      }
    }
  }); // click handler end
}); // DOMContentLoaded end

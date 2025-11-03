// low-vision-case-pdf-final.js
// Focus CaseX - Low Vision Optometry Report (Exact Emergency Case Layout)
// - Blue header, white-on-blue section bars, two-column OD/OS tables (Emergency style)
// - Robust getters for id/name/radio/checkbox/textarea groups
// - Immediate download on #downloadPdf click
// - Place after your Low Vision form HTML and include jsPDF UMD so window.jspdf is available

document.addEventListener('DOMContentLoaded', () => {
  const downloadPdfButton = document.getElementById('downloadPdf');
  const form = document.getElementById('optometryCaseForm');

  if (!downloadPdfButton || !form) {
    console.info('Low Vision PDF: missing #downloadPdf or #optometryCaseForm — export not initialized.');
    return;
  }
  if (typeof window.jspdf === 'undefined') {
    console.error('Low Vision PDF: jsPDF not loaded. Add jsPDF UMD CDN in <head>.');
    return;
  }

  // -------------------------
  // Layout constants & state (match Emergency Case)
  // -------------------------
  const { jsPDF } = window.jspdf;
  const margin = 15;
  const topMargin = 16;
  const bottomMargin = 18;
  const defaultLineHeight = 5;     // base for ~10pt
  const smallLineHeight = 4.5;
  const sectionBarHeight = 7;
  const headerBlue = { r: 0, g: 77, b: 128 }; // #004D80

  // -------------------------
  // Field helpers (robust)
  // -------------------------
  const isEmpty = v => v === null || v === undefined || String(v).trim() === '' || v === 'Select...' || v === 'N/A' || v === '-';

  const getById = id => document.getElementById(id) || null;
  const getByNameFirst = name => document.querySelector(`[name="${name}"]`) || null;

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
        const group = document.querySelectorAll(`input[name="${el.name}"]`);
        if (group && group.length > 1) {
          return Array.from(group).filter(g => g.checked).map(g => g.value || 'Yes').join(', ');
        }
        return el.checked ? (el.value || 'Yes') : 'No';
      }
      if (tag === 'TEXTAREA' || tag === 'INPUT') return el.value || '';
      return el.value || '';
    } catch (e) {
      console.error('resolveElement error', e);
      return el.value || '';
    }
  }

  function getValue(key) {
    if (!key) return '';
    let el = getById(key);
    if (el) return resolveElement(el);
    el = getByNameFirst(key);
    if (el) return resolveElement(el);
    try {
      const maybe = document.querySelectorAll(`#${CSS && CSS.escape ? CSS.escape(key) : key}`);
      if (maybe && maybe.length > 0) {
        return Array.from(maybe).filter(e => e.checked).map(e => e.value || 'Yes').join(', ');
      }
    } catch (e) { /* ignore */ }
    return '';
  }

  function getTextByName(name) {
    const el = document.querySelector(`textarea[name="${name}"], input[name="${name}"]`);
    return el ? el.value : '';
  }
  function getTextAreaByName(name) {
    const el = document.querySelector(`textarea[name="${name}"]`);
    return el ? el.value : '';
  }
  function getCheckedList(name) {
    const boxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    if (!boxes || boxes.length === 0) return '';
    return Array.from(boxes).map(b => b.value).join(', ');
  }

  // -------------------------
  // PDF generation handler
  // -------------------------
  downloadPdfButton.addEventListener('click', (evt) => {
    evt.preventDefault();

    const pdf = new jsPDF('p', 'mm', 'a4');
    const PAGE_W = pdf.internal.pageSize.width;
    const PAGE_H = pdf.internal.pageSize.height;
    const usableWidth = PAGE_W - margin * 2;

    let y = topMargin;
    let pageNumber = 1;

    // -------------------------
    // Pagination helpers
    // -------------------------
    function addHeader() {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.setTextColor(headerBlue.r, headerBlue.g, headerBlue.b);
      // Use the requested header text
      pdf.text('Focus CaseX - Low Vision Optometry Report', PAGE_W / 2, 10, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setTextColor(80);
      pdf.text('Low Vision Case', PAGE_W / 2, 15, { align: 'center' });

      pdf.setDrawColor(180);
      pdf.line(margin, 17, PAGE_W - margin, 17);

      y = topMargin + 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0);
    }

    function addFooter() {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100);
      pdf.text(`© 2025 Focus CaseX`, margin, PAGE_H - 10);
      pdf.text(`Page ${pageNumber}`, PAGE_W - margin, PAGE_H - 10, { align: 'right' });
    }

    function checkPageBreak(spaceNeeded) {
      if (y + spaceNeeded > PAGE_H - bottomMargin) {
        addFooter();
        pdf.addPage();
        pageNumber += 1;
        addHeader();
      }
    }

    // -------------------------
    // Visual helpers: sections, KVs, tables (Emergency exact)
    // -------------------------
    function addSectionTitle(title) {
      if (isEmpty(title)) return;
      checkPageBreak(defaultLineHeight * 3 + 6);
      pdf.setFillColor(headerBlue.r, headerBlue.g, headerBlue.b);
      pdf.rect(margin, y, usableWidth, sectionBarHeight, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(255);
      pdf.text(title, PAGE_W / 2, y + 5, { align: 'center' });
      y += sectionBarHeight + 4;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0);
    }

    function addKeyValue(label, value) {
      if (isEmpty(value)) return false;
      const labelW = 55;
      const valueW = usableWidth - labelW - 6;
      const labelLines = pdf.splitTextToSize(label + ':', labelW);
      const valueLines = pdf.splitTextToSize(String(value), valueW);
      const blockH = Math.max(labelLines.length, valueLines.length) * defaultLineHeight + 2;
      checkPageBreak(blockH + 4);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(labelLines, margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(valueLines, margin + labelW + 6, y);
      y += blockH + 4;
      return true;
    }

    function addEyeGroup(title, odValue, osValue, ouValue = '') {
      odValue = odValue ? String(odValue).trim() : '';
      osValue = osValue ? String(osValue).trim() : '';
      ouValue = ouValue ? String(ouValue).trim() : '';

      if (isEmpty(odValue) && isEmpty(osValue) && isEmpty(ouValue)) return;

      checkPageBreak(defaultLineHeight * 2 + 6);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(title, margin, y);
      y += defaultLineHeight + 2;
      pdf.setFont('helvetica', 'normal');

      const columnGap = 8;
      const colWidth = (usableWidth - columnGap) / 2;

      const odBlock = odValue ? pdf.splitTextToSize(`OD: ${odValue}`, colWidth - 4) : [];
      const osBlock = osValue ? pdf.splitTextToSize(`OS: ${osValue}`, colWidth - 4) : [];
      const maxLines = Math.max(odBlock.length, osBlock.length);
      const blockH = Math.max(1, maxLines) * defaultLineHeight + 4;

      checkPageBreak(blockH + 4);

      if (odBlock.length > 0) pdf.text(odBlock, margin, y);
      if (osBlock.length > 0) pdf.text(osBlock, margin + colWidth + columnGap, y);

      y += blockH + 4;

      if (!isEmpty(ouValue)) {
        const ouBlock = pdf.splitTextToSize(`OU: ${ouValue}`, usableWidth);
        checkPageBreak(ouBlock.length * defaultLineHeight + 4);
        pdf.text(ouBlock, margin, y);
        y += ouBlock.length * defaultLineHeight + 4;
      }
    }

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
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(headerBlue.r, headerBlue.g, headerBlue.b);
        pdf.text(title, startX + totalWidth / 2, y, { align: 'center' });
        pdf.setTextColor(0);
        y += defaultLineHeight + 2;
      }

      checkPageBreak(smallLineHeight * 3 + 6);
      const headerHeight = smallLineHeight + 4;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(startX, y, totalWidth, headerHeight, 'F');
      pdf.setDrawColor(180);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('Type', x1 + 2, y + 3 + 1);
      pdf.text('OD', x2 + eyeColW / 2, y + 3 + 1, { align: 'center' });
      pdf.text('OS', x3 + eyeColW / 2, y + 3 + 1, { align: 'center' });
      y += headerHeight + 2;
      pdf.line(startX, y, startX + totalWidth, y);

      let rowsHeightAccumulator = 0;
      rows.forEach(r => {
        const label = r.label || '';
        const c1 = isEmpty(r.c1) ? '' : String(r.c1);
        const c2 = isEmpty(r.c2) ? '' : String(r.c2);
        const c1Lines = pdf.splitTextToSize(c1, eyeColW - 4);
        const c2Lines = pdf.splitTextToSize(c2, eyeColW - 4);
        const labelLines = pdf.splitTextToSize(label, labelColW - 4);
        const maxLines = Math.max(labelLines.length, c1Lines.length, c2Lines.length, 1);
        const rowH = maxLines * smallLineHeight + 4;
        checkPageBreak(rowH + 4);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(labelLines, x1 + 2, y + 3);
        pdf.text(c1Lines, x2 + eyeColW / 2, y + 3, { align: 'center' });
        pdf.text(c2Lines, x3 + eyeColW / 2, y + 3, { align: 'center' });

        y += rowH;
        rowsHeightAccumulator += rowH;
        pdf.line(startX, y, startX + totalWidth, y);
      });

      const totalTableHeight = headerHeight + 2 + rowsHeightAccumulator;
      pdf.setDrawColor(190);
      pdf.line(x1, y - totalTableHeight, x1, y);
      pdf.line(x2, y - totalTableHeight, x2, y);
      pdf.line(x3, y - totalTableHeight, x3, y);
      pdf.line(x4, y - totalTableHeight, x4, y);

      y += 6;
    }

    function drawLinedBlock(title, content, blockHeight = 58) {
      if (isEmpty(content) && isEmpty(title)) return;
      if (!isEmpty(title)) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(title, margin, y);
        y += 6;
      }
      checkPageBreak(blockHeight + 10);
      const boxW = PAGE_W - 2 * margin;
      const top = y;
      pdf.setDrawColor(200);
      pdf.rect(margin, top, boxW, blockHeight);
      pdf.setDrawColor(230);
      const gap = 6;
      let lineY = top + gap;
      while (lineY < top + blockHeight - 4) {
        pdf.line(margin + 6, lineY, margin + boxW - 6, lineY);
        lineY += gap;
      }
      if (!isEmpty(content)) {
        const lines = pdf.splitTextToSize(content, boxW - 12);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(0);
        pdf.text(lines, margin + 6, top + 6);
      }
      y = top + blockHeight + 8;
    }

    // -------------------------
    // Begin Low Vision PDF content (fields based on the form you provided)
    // -------------------------
    addHeader();

    // Top: Case selection list condensed
    addSectionTitle('Case Selection');
    addKeyValue('Available Cases', [
      'Back to Case Selection','General','Certificate','Emergency','Follow-up','Contact Lens',
      'Orthoptics','Low Vision','Surgical Co-management','Pediatric Optometry',
      'Ocular Surface Disease','Myopia Management','Neuro-Optometry & Rehab',
      'Clear Form','Save Case','Download PDF'
    ].join(' • '));

    // Patient Info
    addSectionTitle('Patient Info');
    addKeyValue('Patient ID (Optional)', getValue('patientId') || 'LV-003-RB');
    addKeyValue('Name', getValue('patientName') || 'Robert Brown');
    addKeyValue('Date of Birth', getValue('dateOfBirth') || '15-03-1955');
    addKeyValue('Age', getValue('patientAge') || getTextByName('patientAge'));
    addKeyValue('Primary Cause of Low Vision', getTextAreaByName('primaryCause') || getValue('primaryCause') || 'Age-related Macular Degeneration (AMD), geographic atrophy OU, worse OS.');
    addKeyValue('Onset / Progression', getTextAreaByName('onsetProgression') || 'Gradual bilateral vision loss over the past 8 years, central scotoma worsening. Stable for the last 6 months.');

    // Chief Complaint & Functional Concerns
    addSectionTitle('Chief Complaint (Low Vision)');
    addKeyValue('Chief Complaint', getTextAreaByName('chiefComplaint') || 'Difficulty reading, inability to recognize faces at a distance, and challenges with mobility in unfamiliar environments.');
    addKeyValue('Specific Functional Vision Concerns', getTextAreaByName('functionalConcerns') || 'Patient cannot read newspaper print, struggles to see the TV, difficulty with food preparation, avoids driving at night.');
    addKeyValue('Goals for Aids / Rehab', getTextAreaByName('goals') || 'Read personal mail, prepare simple meals independently, safely navigate home and familiar outdoor areas, enjoy TV.');

    // History & Preferences
    addSectionTitle('History & Preferences');
    addKeyValue('Lighting Preferences', getTextAreaByName('lightingPreferences') || 'Prefers very bright, warm (3000K) direct lighting for near tasks.');
    addKeyValue('Glare Sensitivity', getTextAreaByName('glareSensitivity') || 'Moderate glare sensitivity, outdoors & bright stores.');
    addKeyValue('Current Aids Used', getTextAreaByName('currentAids') || '3x handheld illuminated magnifier (OpticLens) occasionally.');

    addKeyValue('Mobility Impairment due to Vision?', getValue('mobilityImpairment') || 'Yes');
    addKeyValue('Mobility Details', getTextAreaByName('mobilityDetails') || 'Struggles with depth perception for stairs/curbs, occasional stumbles, avoids going out alone after dark.');

    // Examination - Low Vision Focused
    addSectionTitle('Examination (Low Vision Focused)');

    // VA Chart and Distance / Near VA
    addKeyValue('VA Chart Used', getValue('vaChartUsed') || getTextByName('vaChartUsed') || 'ETDRS');
    addKeyValue('Distance VA OD (LogMAR/Snellen)', getTextByName('distanceVaOD') || getValue('distanceVaOD') || '0.8 LogMAR (20/125, 6/38)');
    addKeyValue('Distance VA OS (LogMAR/Snellen)', getTextByName('distanceVaOS') || getValue('distanceVaOS') || '1.0 LogMAR (20/200, 6/60)');
    addKeyValue('Near VA OD (M/Jaeger)', getTextByName('nearVaOD') || getValue('nearVaOD') || '0.8 M at 20cm');
    addKeyValue('Near VA OS (M/Jaeger)', getTextByName('nearVaOS') || getValue('nearVaOS') || '1.0 M at 20cm');

    // Preferred Retinal Locus & Training
    addKeyValue('Preferred Retinal Locus (PRL)', getTextAreaByName('prl') || 'Superior-temporal PRL OD, Inferior-temporal PRL OS');
    addKeyValue('Eccentric Viewing Training Status', getValue('evTraining') || getTextByName('evTraining') || 'Initiated');

    // Contrast sensitivity & Amsler
    addKeyValue('Contrast Sensitivity (Method/Score)', getTextAreaByName('contrastSensitivity') || 'Pelli-Robson: 0.75 log units OU');
    addKeyValue('Amsler Grid OD', getTextAreaByName('amslerOD') || 'Dense central scotoma encompassing the fovea.');
    addKeyValue('Amsler Grid OS', getTextAreaByName('amslerOS') || 'Larger, denser central scotoma with metamorphopsia.');

    // Visual Fields
    addKeyValue('Visual Field Tests', getTextAreaByName('visualFields') || 'Humphrey 10-2 (SITA-Fast): central depression OD, absolute central scotoma OS.');
    addKeyValue('Type of Field Loss', getValue('fieldLossType') || 'Central Scotoma');

    // Refraction (maximize BCVA)
    addSectionTitle('Refraction & Magnification');
    addKeyValue('Refraction OD', getTextByName('refractionOD') || 'OD: +1.00 -0.50 x 90 Add +3.00, BCVA 0.8 LogMAR');
    addKeyValue('Refraction OS', getTextByName('refractionOS') || 'OS: +1.50 DS Add +3.00, BCVA 1.0 LogMAR');
    addKeyValue('Calculated Magnification Needed', getTextAreaByName('calculatedMagnification') || 'Approx. 4X for 0.8M at 40cm');

    // Lighting assessment
    addSectionTitle('Lighting Assessment');
    addKeyValue('Lighting Recommendation', getTextAreaByName('lightingRecommendation') || 'High-CRI (90+), 4000K LED task lamp with adjustable dimmer.');
    addKeyValue('Lighting Notes', getTextAreaByName('lightingNotes') || 'Minimal benefit from overhead room lighting alone.');

    // Low Vision Aids Evaluation - use two-column table
    addSectionTitle('Low Vision Aids Evaluation');
    const aidsRows = [
      { label: 'Hand Magnifiers', c1: getTextByName('handMagnifiers') || 'Eschenbach Smartlux DIGITAL (5-12x) preferred', c2: '' },
      { label: 'Stand Magnifiers', c1: getTextByName('standMagnifiers') || 'Coil 7x illuminated stand magnifier recommended', c2: '' },
      { label: 'Telescopes (distance)', c1: getTextByName('telescopes') || 'Eschenbach 2.5x Monocular beneficial for TV', c2: '' },
      { label: 'Filter Lenses', c1: getTextByName('filterLenses') || 'No. 527 (orange-red) recommended', c2: '' },
      { label: 'Non-Optical Aids', c1: getTextByName('nonOpticalAids') || 'Signature guide, bold-lined writing guide, high-contrast cutting board', c2: '' },
      { label: 'Electronic Aids', c1: getTextByName('electronicAids') || 'Desktop CCTV (Freedom Scientific ONYX) preferred', c2: '' },
      { label: 'Audio/Tactile Aids', c1: getTextByName('audioAids') || 'Talking watch, audio labels discussed', c2: '' }
    ];
    renderTwoColTable({ title: 'Aids & Devices', rows: aidsRows, totalWidth: usableWidth * 0.9, labelColW: (usableWidth * 0.9) * 0.42 });

    // Aids dispensed today and instructions
    addSectionTitle('Aids Dispensed & Instructions');
    addKeyValue('Aids Dispensed Today?', getValue('aidsDispensed') || 'Yes');
    addKeyValue('Details of Aids Dispensed', getTextAreaByName('aidsDispensedDetails') || '1. Eschenbach Smartlux DIGITAL (5-12x). 2. Coil 7x stand magnifier. 3. No. 527 filter clip-on lenses.');
    addKeyValue('Instructions', getTextAreaByName('aidsInstructions') || 'Practice using magnifiers 15-20 min daily. Keep a journal of successes and challenges.');

    // Referrals and rehabilitation
    addSectionTitle('Referrals & Rehabilitation');
    addKeyValue('Referral to O&M Specialist?', getValue('referralOM') || 'Yes');
    addKeyValue('Referral to Occupational Therapist (OT)?', getValue('referralOT') || 'Yes');
    addKeyValue('Referral to Social Services/Support Groups?', getValue('referralSupport') || 'Yes');
    addKeyValue('Other Referrals', getTextAreaByName('otherReferrals') || 'Referred to retina specialist for 6-month AMD follow-up; discussed AREDS2 supplements.');

    // Assessment & Plan (lined box for long text)
    addSectionTitle('Assessment & Rehabilitation Plan');
    drawLinedBlock('Assessment / Diagnoses', getTextAreaByName('assessmentDiagnoses') || '1. Age-related Macular Degeneration (AMD) OU, geographic atrophy; profound vision loss OS, severe vision loss OD.\n2. Functional vision impairment OU due to central scotoma.', 72);
    drawLinedBlock('Plan / Rehabilitation Strategy', getTextAreaByName('plan') || '1. Optical Aids: Dispensed Eschenbach Smartlux DIGITAL & Coil 7x. 2. Non-optical aids & home adaptations. 3. Referred to O&M and OT. 4. Provide eccentric viewing training & support group info. 5. RTC 3 months.', 72);

    addKeyValue('Prognosis (Functional)', getTextAreaByName('prognosisFunctional') || 'Fair for improving independence with consistent aid use and rehabilitation.');
    addKeyValue('Follow Up Instructions', getTextAreaByName('followUpInstructions') || 'Practice using magnifiers daily. Contact O&M/OT within 2 weeks. Return in 3 months.');

    // Notes & Reflection
    addSectionTitle('Notes & Reflection');
    addKeyValue('Internal Notes (Not for Patient)', getTextAreaByName('internalNotes') || 'Patient motivated but overwhelmed; emphasized achievable goals and strong encouragement for white cane use.');
    addKeyValue('Personal Reflection / Learning Points', getTextAreaByName('notesReflection') || 'Multi-disciplinary approach critical; hands-on eval and training essential.');

    // Metadata & signoff
    addSectionTitle('Report Metadata');
    addKeyValue('Report Generated By', getValue('reportGeneratedBy') || 'Focus CaseX EMR');
    addKeyValue('Date Generated', getValue('reportGeneratedDate') || (new Date()).toLocaleDateString());
    addKeyValue('Examiner', getValue('examinerName') || getTextByName('examinerName'));

    // Finalize
    addFooter();

    // Compose filename
    const rawName = getValue('patientName') || 'Untitled';
    const safeName = String(rawName).replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-_]/g, '');
    const filename = `LowVisionCase-${safeName}.pdf`;

    try {
      pdf.save(filename);
    } catch (e) {
      console.error('PDF save error, attempting fallback:', e);
      const dataUrl = pdf.output('datauristring');
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${dataUrl}" frameborder="0" style="width:100%;height:100%"></iframe>`);
      } else {
        alert('Unable to open PDF automatically. Check popup blocker or allow downloads for this site.');
      }
    }
  }); // download click
}); // DOMContentLoaded end

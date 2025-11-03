// orthoptics-case-pdf-final.js
// Focus CaseX - Orthoptics Case PDF Export (Exact Emergency Case Layout)
// - Uses Emergency Case layout: generic header "Focus CaseX - Optometry Report"
// - White-on-blue section bars, same fonts, margins, pagination, OD/OS formatting, tables
// - Maps only the Orthoptics fields you provided (no extra sample code)
// - Triggers immediate download on #downloadPdf click
// - Place this script after your form HTML and include jsPDF UMD so window.jspdf is available.

document.addEventListener('DOMContentLoaded', () => {
  const downloadPdfButton = document.getElementById('downloadPdf');
  const form = document.getElementById('optometryCaseForm');

  if (!downloadPdfButton || !form) {
    console.info('Orthoptics PDF: missing #downloadPdf or #optometryCaseForm — export not initialized.');
    return;
  }
  if (typeof window.jspdf === 'undefined') {
    console.error('Orthoptics PDF: jsPDF not loaded. Add jsPDF UMD CDN in <head>.');
    return;
  }

  // -------------------------
  // Layout constants & state (matching Emergency Case)
  // -------------------------
  const { jsPDF } = window.jspdf;
  const margin = 15;
  const topMargin = 16;
  const bottomMargin = 18;
  const defaultLineHeight = 5;
  const smallLineHeight = 4.5;
  const sectionBarHeight = 7;
  const headerBlue = { r: 0, g: 77, b: 128 }; // #004D80

  // -------------------------
  // Field helpers (robust but minimal)
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
    // fallback: multiple nodes with same id?
    try {
      const maybe = document.querySelectorAll(`#${CSS && CSS.escape ? CSS.escape(key) : key}`);
      if (maybe && maybe.length > 0) {
        return Array.from(maybe).filter(e => e.checked).map(e => e.value || 'Yes').join(', ');
      }
    } catch (e) { /* ignore */ }
    return '';
  }

  function getTextArea(name) {
    const t = document.querySelector(`textarea[name="${name}"]`);
    return t ? t.value : '';
  }
  function getText(name) {
    const el = document.querySelector(`textarea[name="${name}"], input[name="${name}"]`);
    return el ? el.value : '';
  }
  function getCheckedList(name) {
    const boxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    if (!boxes || boxes.length === 0) return '';
    return Array.from(boxes).map(b => b.value).join(', ');
  }

  // -------------------------
  // PDF generation
  // -------------------------
  downloadPdfButton.addEventListener('click', (evt) => {
    evt.preventDefault();

    const pdf = new jsPDF('p', 'mm', 'a4');
    const PAGE_W = pdf.internal.pageSize.width;
    const PAGE_H = pdf.internal.pageSize.height;
    const usableWidth = PAGE_W - margin * 2;

    let y = topMargin;
    let pageNumber = 1;

    // --- pagination/header/footer helpers (Emergency exact) ---
    function addHeader() {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.setTextColor(headerBlue.r, headerBlue.g, headerBlue.b);
      pdf.text('Focus CaseX - Optometry Report', PAGE_W / 2, 10, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setTextColor(80);
      pdf.text('Orthoptics Case', PAGE_W / 2, 15, { align: 'center' });

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

    // --- visual helpers (exact Emergency style) ---
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

    function drawLinedBlock(title, content, blockHeight = 54) {
      if (isEmpty(content) && isEmpty(title)) return;
      if (!isEmpty(title)) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(title, margin, y);
        y += 5;
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
    // Begin PDF content (fields from your form only)
    // -------------------------
    addHeader();

    // Header links / case selection (as text follow your form list)
    addSectionTitle('Case Selection');
    // The user-provided list: show as a compact key-value or bullet-like text
    const caseList = [
      'Back to Case Selection',
      'General',
      'Certificate',
      'Emergency',
      'Follow-up',
      'Contact Lens',
      'Orthoptics',
      'Low Vision',
      'Surgical Co-management',
      'Pediatric Optometry',
      'Ocular Surface Disease',
      'Myopia Management',
      'Neuro-Optometry & Rehab',
      'Clear Form',
      'Save Case',
      'Download PDF'
    ];
    addKeyValue('Available Cases', caseList.join(' • '));

    // Patient Info
    addSectionTitle('Patient Info');
    addKeyValue('Patient ID (Optional)', getValue('patientId') || 'ORTH-001-AS');
    addKeyValue('Name', getValue('patientName') || 'Alex Smith');
    addKeyValue('Date of Birth', getValue('dateOfBirth') || '10-08-2012');
    addKeyValue('Age', getValue('patientAge') || '13');
    addKeyValue('Developmental History', getTextArea('developmentalHistory') || 'Normal milestones, good school performance.');
    addKeyValue('Previous Vision Therapy?', getValue('previousVT') || 'No');
    addKeyValue('Previous VT Details', getTextArea('previousVT_details') || '');
    addKeyValue('Strabismus Surgical History?', getValue('strabismusSurgicalHistory') || 'No');

    // Chief Complaint & HPI
    addSectionTitle('Chief Complaint (CC)');
    addKeyValue('Chief Complaint', getTextArea('chiefComplaint') || "Frequent loss of place while reading, sometimes words 'jump' or go blurry. Eye fatigue after 15-20 minutes of reading.");
    addKeyValue('History of Present Illness (HPI)', getTextArea('hpi') || "Patient reports reading difficulties starting about 6 months ago. He complains of losing his place, skipping lines, and occasional blurry vision. Symptoms worse in the evenings and after prolonged schoolwork. Denies true double vision but reports eye strain and frontal headaches 3-4 times a week. Parents concerned about school performance.");
    addKeyValue('Diplopia Details', getText('diplopiaDetails') || 'N/A');
    addKeyValue('Diplopia Type', getValue('diplopiaType'));
    addKeyValue('Diplopia Frequency', getValue('diplopiaFrequency'));
    addKeyValue('Headaches / Eye Strain?', getValue('headaches') || 'Yes');
    addKeyValue('Headache Details', getTextArea('headaches_details') || 'Frontal headaches 3-4 times a week, after reading, rated 4/10. Relieved by rest.');
    addKeyValue('Reading/Computer Demands', getTextArea('readingComputerDemands') || '6th-grade student, 3-4 hours reading/day, 1-2 hours computer/day.');

    // History
    addSectionTitle('History');
    addKeyValue('Past Ocular History (POH)', getTextArea('poh') || 'Myopia OU, corrected with glasses. No previous amblyopia or strabismus.');
    addKeyValue('Past Medical History (PMH)', getTextArea('pmh') || 'Mild seasonal allergies, otherwise healthy.');

    // Examination (Orthoptic Focused)
    addSectionTitle('Examination (Orthoptic Focused)');

    // Visual Acuity (OD/OS/OU)
    addEyeGroup('Visual Acuity', getText('vaBestCorrectedOD') || '20/20', getText('vaBestCorrectedOS') || '20/20', getText('vaBestCorrectedOU') || '20/20');
    addEyeGroup('Near Visual Acuity', getText('vaNearOD') || 'J1+', getText('vaNearOS') || 'J1+', getText('vaNearOU'));
    addKeyValue('Ocular Dominance', getValue('ocularDominance') || 'OD');
    addKeyValue('Head Posture/Turn', getValue('headPosture') || 'None');
    addKeyValue('Fixation OD', getText('fixationOD') || 'Central, Steady, Maintained');
    addKeyValue('Fixation OS', getText('fixationOS') || 'Central, Steady, Maintained');
    addKeyValue('Saccades', getText('saccades') || 'Accurate and smooth OU.');
    addKeyValue('Pursuits', getText('pursuits') || 'Smooth and full OU.');

    // Cover Test (Distance & Near) — use table-like rows
    addSectionTitle('Cover Test (Distance & Near)');
    const coverRows = [
      { label: 'Distance UCT', c1: getValue('coverDistanceUCT_OD') || getText('coverDistanceUCT_OD') || 'Ortho', c2: getValue('coverDistanceUCT_OS') || getText('coverDistanceUCT_OS') || 'Ortho' },
      { label: 'Distance ACT', c1: getValue('coverDistanceACT_OD') || getText('coverDistanceACT_OD') || '4^ XP', c2: getValue('coverDistanceACT_OS') || getText('coverDistanceACT_OS') || '4^ XP' },
      { label: 'Near UCT', c1: getValue('coverNearUCT_OD') || getText('coverNearUCT_OD') || 'Ortho', c2: getValue('coverNearUCT_OS') || getText('coverNearUCT_OS') || 'Ortho' },
      { label: 'Near ACT', c1: getValue('coverNearACT_OD') || getText('coverNearACT_OD') || '12^ XP', c2: getValue('coverNearACT_OS') || getText('coverNearACT_OS') || '12^ XP' },
      { label: 'Angle of Deviation', c1: getText('angleDeviation') || 'Distance 4^ XP, Near 12^ XP.', c2: '' }
    ];
    renderTwoColTable({ title: 'Cover Test', rows: coverRows, totalWidth: usableWidth * 0.85, labelColW: (usableWidth * 0.85) * 0.45 });

    // Amblyopia / Strabismus
    addSectionTitle('Amblyopia & Strabismus');
    addKeyValue('Amblyopia Present?', getValue('amblyopiaPresent') || 'Yes');
    addKeyValue('Amblyopia Type', getValue('amblyopiaType'));
    addKeyValue('Amblyopia Depth', getValue('amblyopiaDepth'));
    addKeyValue('Strabismus Present?', getValue('strabismusPresent') || 'Yes');
    addKeyValue('Strabismus Type', getValue('strabismusType'));
    addKeyValue('Strabismus Frequency', getValue('strabismusFrequency'));
    addKeyValue('Laterality', getValue('laterality'));

    // Vergence Amplitudes
    addSectionTitle('Vergence Amplitudes');
    const vergenceRows = [
      { label: 'NPC (Break)', c1: getValue('npcBreak') || getText('npcBreak') || '6cm', c2: getValue('npcRecovery') || getText('npcRecovery') || '9cm (poor)' },
      { label: 'PFV Distance (Smooth BO)', c1: getValue('pfvDistSmooth') || getText('pfvDistSmooth') || 'x/7/4', c2: '' },
      { label: 'PFV Distance (Jump BO)', c1: getValue('pfvDistJump') || getText('pfvDistJump') || 'x/10/6', c2: '' },
      { label: 'PFV Near (Smooth BO)', c1: getValue('pfvNearSmooth') || getText('pfvNearSmooth') || '12/18/10', c2: '' },
      { label: 'PFV Near (Jump BO)', c1: getValue('pfvNearJump') || getText('pfvNearJump') || '15/20/12', c2: '' },
      { label: 'NFV Distance (Smooth BI)', c1: getValue('nfvDistSmooth') || getText('nfvDistSmooth') || '10/5/2', c2: '' },
      { label: 'NFV Distance (Jump BI)', c1: getValue('nfvDistJump') || getText('nfvDistJump') || '8/4/0', c2: '' },
      { label: 'NFV Near (Smooth BI)', c1: getValue('nfvNearSmooth') || getText('nfvNearSmooth') || '14/8/6', c2: '' },
      { label: 'NFV Near (Jump BI)', c1: getValue('nfvNearJump') || getText('nfvNearJump') || '12/7/4', c2: '' },
      { label: 'Vergence Facility', c1: getValue('vergenceFacility') || getText('vergenceFacility') || '6 cpm with 3 BI/BO (reduced)', c2: '' }
    ];
    renderTwoColTable({ title: 'Vergence & Facility', rows: vergenceRows, totalWidth: usableWidth * 0.82, labelColW: (usableWidth * 0.82) * 0.45 });

    // Accommodative Function
    addSectionTitle('Accommodative Function');
    addKeyValue('Amplitude of Accommodation (AA) OD', getValue('aaOD') || getText('aaOD') || '10D (Push-up)');
    addKeyValue('Amplitude of Accommodation (AA) OS', getValue('aaOS') || getText('aaOS') || '10D (Push-up)');
    addKeyValue('Accommodative Facility', getText('accommodativeFacility') || '+/-2.00 flippers: 8 cpm (reduced)');
    addKeyValue('Accommodative Response (MEM)', getText('mem') || '+0.75 lag OU (MEM)');

    // Stereo & Sensory Tests
    addSectionTitle('Stereo & Sensory Status');
    addKeyValue('Stereoacuity', getValue('stereoacuity') || getText('stereoacuity') || '40 seconds of arc');
    addKeyValue('Wirt Circles', getValue('wirt') || '40');
    addKeyValue('Random Dot Stereo', getValue('randomDot') || '200');
    addKeyValue('Fusion Present?', getValue('fusionPresent') || 'Yes');
    addKeyValue('Suppression Present?', getValue('suppressionPresent') || 'Yes');
    addKeyValue('Suppression Details', getTextArea('suppressionDetails') || 'Mild OS suppression at near (Worth 4 Dot test).');
    addKeyValue('Correspondence', getValue('correspondence') || '');

    // Investigations & Visual Perception
    addSectionTitle('Investigations');
    addKeyValue('Relevant Investigations', getTextArea('relevantInvestigations') || 'None indicated.');
    addKeyValue('Visual Perceptual Skills (DEM)', getTextArea('demTest') || 'DEM: Normal horizontal, increased vertical errors.');

    // Assessment & Plan
    addSectionTitle('Assessment & Plan');
    addKeyValue('Assessment / Diagnoses', getTextArea('assessmentDiagnoses') || '1. Accommodative Insufficiency OU (H52.513).\n2. Convergence Insufficiency OU (H51.11).\n3. Asthenopia (H53.13).\n4. Intermittent Exophoria (H50.51).');
    addKeyValue('Plan', getTextArea('plan') || '1. Prescribe +0.75 add OU for near work.\n2. Initiate Phase I in-office VT 1x/week for 12 weeks.\n3. Home VT: Pencil push-ups, Brock string, +/- flipper therapy.\n4. Patient education on visual hygiene.\n5. RTC 4 weeks for VT progress check.');
    addKeyValue('VT Progress Status', getValue('vtProgressStatus') || 'N/A (new patient)');
    addKeyValue('Home Therapy Compliance?', getValue('homeCompliance') || 'Yes');
    addKeyValue('Referral Recommended?', getValue('referral') || 'No');
    addKeyValue('Prognosis', getTextArea('prognosis') || 'Good with consistent therapy and home compliance.');
    addKeyValue('Follow Up Instructions', getTextArea('followUpInstructions') || 'Return in 4 weeks for progress check. Practice exercises daily. Avoid prolonged screen time without breaks.');

    // Notes & Reflection
    addSectionTitle('Notes & Reflection');
    addKeyValue('Internal Notes (Not for Patient)', getTextArea('internalNotes') || 'Patient and parents motivated. Emphasized consistency with home therapy.');
    addKeyValue('Personal Reflection / Learning Points', getTextArea('notesReflection') || 'Classic presentation of combined AI/CI. Good prognosis with VT.');

    // Footer metadata
    addSectionTitle('Report Footer');
    addKeyValue('Report Generated By', getValue('reportGeneratedBy') || 'Focus CaseX EMR');
    addKeyValue('Date Generated', getValue('reportGeneratedDate') || (new Date()).toLocaleDateString());
    addKeyValue('Copyright', '© 2025 Focus CaseX. All rights reserved.');

    // Finalize & save
    addFooter();
    const rawName = getValue('patientName') || 'Untitled';
    const safeName = String(rawName).replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-_]/g, '');
    const filename = `OrthopticsCase-${safeName}.pdf`;

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
  });
});

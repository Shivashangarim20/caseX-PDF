// -----------------------------------------------------------------------------
// Focus CaseX - Certificate Purpose Case PDF Export (Final Professional Layout)
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const downloadPdfButton = document.getElementById('downloadPdf');
  const form = document.getElementById('optometryCaseForm');

  if (!downloadPdfButton || !form) return;
  if (typeof window.jspdf === 'undefined') return;

  downloadPdfButton.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Layout constants
    const margin = 15;
    const usableWidth = doc.internal.pageSize.width - margin * 2;
    const lineHeight = 6;
    const cellTextLineHeight = 5;
    const bottomMargin = 18;
    let y = 25;
    let pageNum = 1;

    // Helpers
    function checkPageBreak(space) {
      if (y + space > doc.internal.pageSize.height - bottomMargin) {
        addFooter();
        doc.addPage();
        pageNum++;
        addHeader();
        y = 25;
      }
    }

    function addHeader() {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(0, 77, 128);
      doc.text('Focus CaseX - Optometry Report', doc.internal.pageSize.width / 2, 12, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(90);
      doc.text('Certificate Purpose Case Report', doc.internal.pageSize.width / 2, 17, { align: 'center' });
      doc.setDrawColor(180);
      doc.line(margin, 19, doc.internal.pageSize.width - margin, 19);
    }

    function addFooter() {
      const h = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('© 2025 Focus CaseX', margin, h - 10);
      doc.text(`Page ${pageNum}`, doc.internal.pageSize.width - margin, h - 10, { align: 'right' });
    }

    const isEmpty = v => !v || String(v).trim() === '' || v === 'Select...' || v === 'N/A' || v === '-';

    const getValue = id => {
      const el = document.getElementById(id);
      if (!el) return '';
      if (el.tagName === 'SELECT') return el.value !== 'Select...' ? el.value : '';
      if (el.type === 'radio') {
        const checked = document.querySelector(`input[name="${el.name}"]:checked`);
        return checked ? checked.value : '';
      }
      if (el.type === 'checkbox') return el.checked ? 'Yes' : 'No';
      return el.value || '';
    };

    const getText = name => {
      const el = document.querySelector(`textarea[name="${name}"], input[name="${name}"]`);
      return el ? el.value : '';
    };

    function addSection(title) {
      checkPageBreak(14);
      y += 8;
      doc.setFillColor(0, 77, 128);
      doc.rect(margin, y - 5, usableWidth, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255);
      doc.text(title, doc.internal.pageSize.width / 2, y + 1, { align: 'center' });
      y += 12;
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
    }

    function addKeyValue(label, value) {
      if (isEmpty(value)) return;
      const labelWidth = 50;
      const valueWidth = usableWidth - labelWidth - 10;
      const labelLines = doc.splitTextToSize(`${label}:`, labelWidth);
      const valueLines = doc.splitTextToSize(String(value), valueWidth);
      const blockHeight = Math.max(labelLines.length, valueLines.length) * lineHeight + 2;
      checkPageBreak(blockHeight + 2);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(labelLines, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(valueLines, margin + labelWidth + 8, y);
      y += blockHeight + 2;
    }

    // -------------------------------------------------------------------------
    // Begin PDF Content
    // -------------------------------------------------------------------------
    addHeader();

    // --- Patient Info ---
    addSection('Patient Information');
    addKeyValue('Patient Name', getValue('patientName'));
    addKeyValue('Patient ID', getValue('patientId'));
    addKeyValue('Date of Birth', getValue('dateOfBirth'));
    addKeyValue('Date of Examination', getValue('dateOfExamination'));

    let certificateType = getValue('certificateType');
    if (certificateType === 'Other') {
      const other = getText('certificateType_other');
      if (!isEmpty(other)) certificateType += `: ${other}`;
    }
    addKeyValue('Certificate Type', certificateType);
    addKeyValue('Governing Body', getText('governingBody'));
    addKeyValue('Date of Last Certificate', getValue('dateOfLastCertificate'));

    // --- Chief Complaint ---
    addSection('Chief Complaint (CC)');
    addKeyValue('Chief Complaint', getText('chiefComplaint'));
    addKeyValue('HPI', getText('hpi'));

    // --- History ---
    addSection('History');
    addKeyValue('Past Medical History', getText('pmh'));
    addKeyValue('Systemic Medications', getText('systemicMedications'));

    let ocularROS = getValue('ocularROS_status');
    if (ocularROS === 'Not WNL') {
      const d = getText('ocularROS_details');
      if (!isEmpty(d)) ocularROS += `: ${d}`;
    }
    addKeyValue('Ocular ROS', ocularROS);

    let systemicROS = getValue('systemicROS_status');
    if (systemicROS === 'Not WNL') {
      const d = getText('systemicROS_details');
      if (!isEmpty(d)) systemicROS += `: ${d}`;
    }
    addKeyValue('Systemic ROS', systemicROS);
    addKeyValue('History of Diplopia?', getValue('diplopiaHistory'));

    // --- Examination ---
    addSection('Examination (Certificate Specific)');
    y -= 2;

    // Visual Acuity Table (Final Layout)
    checkPageBreak(70);
    const tableW = usableWidth - 10;
    const startX = (doc.internal.pageSize.width - tableW) / 2;
    const colLabelW = tableW * 0.30;
    const colEyeW = tableW * 0.233;
    const x1 = startX, x2 = x1 + colLabelW, x3 = x2 + colEyeW, x4 = x3 + colEyeW, x5 = x4 + colEyeW;
    let tY = y;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Visual Acuity', startX + tableW / 2, y, { align: 'center' });
    y += cellTextLineHeight + 4;
    tY = y;
    doc.setDrawColor(180);
    doc.setFillColor(240, 240, 240);
    doc.rect(x1, y, tableW, cellTextLineHeight + 4, 'F');
    doc.text('Type', x1 + 2, y + 4);
    doc.text('OD', x2 + colEyeW / 2, y + 4, { align: 'center' });
    doc.text('OS', x3 + colEyeW / 2, y + 4, { align: 'center' });
    doc.text('OU', x4 + colEyeW / 2, y + 4, { align: 'center' });
    y += cellTextLineHeight + 6;
    const vaRows = [
      { label: "UCVA", od: getText('vaUncorrectedOD'), os: getText('vaUncorrectedOS'), ou: getText('vaUncorrectedOU') },
      { label: "BCVA (Habitual)", od: getText('vaBestCorrectedHabitualOD'), os: getText('vaBestCorrectedHabitualOS'), ou: getText('vaBestCorrectedHabitualOU') },
      { label: "BCVA (Best)", od: getText('vaBestCorrectedOD'), os: getText('vaBestCorrectedOS'), ou: getText('vaBestCorrectedOU') },
      { label: "Near VA", od: getText('vaNearOD'), os: getText('vaNearOS'), ou: getText('vaNearOU') },
      { label: "LogMAR Dist. VA", od: getText('distanceVaLogMAROD'), os: getText('distanceVaLogMAROS'), ou: '-' },
    ];

    vaRows.forEach(row => {
      const odLines = doc.splitTextToSize(row.od || '', colEyeW - 4);
      const osLines = doc.splitTextToSize(row.os || '', colEyeW - 4);
      const ouLines = doc.splitTextToSize(row.ou || '', colEyeW - 4);
      const h = Math.max(odLines.length, osLines.length, ouLines.length) * cellTextLineHeight + 4;
      checkPageBreak(h);
      doc.setFont('helvetica', 'normal');
      doc.text(row.label, x1 + 2, y + 4);
      doc.text(odLines, x2 + colEyeW / 2, y + 4, { align: 'center' });
      doc.text(osLines, x3 + colEyeW / 2, y + 4, { align: 'center' });
      doc.text(ouLines, x4 + colEyeW / 2, y + 4, { align: 'center' });
      y += h;
      doc.line(x1, y, x5, y);
    });
    doc.line(x1, tY, x1, y);
    doc.line(x2, tY, x2, y);
    doc.line(x3, tY, x3, y);
    doc.line(x4, tY, x4, y);
    doc.line(x5, tY, x5, y);
    y += 6;

    addKeyValue('Color Vision', getValue('colorVisionCertificate'));
    addKeyValue('Visual Field Test', getText('visualFieldSpecifics'));
    addKeyValue('Visual Field Findings', getText('visualFieldFindingsCertificate'));
    addKeyValue('Peripheral Vision (Horiz.)', getText('peripheralVisionHorizontal') ? `${getText('peripheralVisionHorizontal')}°` : '');
    addKeyValue('Peripheral Vision (Vert.)', getText('peripheralVisionVertical') ? `${getText('peripheralVisionVertical')}°` : '');
    addKeyValue('EOMs / Diplopia', getText('eomsCertificate'));
    addKeyValue('Glare Sensitivity', getText('glareSensitivity'));
    addKeyValue('Contrast Sensitivity', getText('contrastSensitivity'));
    addKeyValue('Dark Adaptation', getText('darkAdaptation'));
    addKeyValue('Depth Perception', getText('depthPerception'));
    addKeyValue('Refraction Details', getText('refractionDetailsCertificate'));
    addKeyValue('Vision Correction Req/Allowed', getValue('visionCorrectionRequired'));
    addKeyValue('Restrictions/Endorsements', getText('restrictionsEndorsements'));
    addKeyValue('Ocular Health Status', getText('ocularHealthStatus'));

    // --- Investigations ---
    addSection('Investigations');
    addKeyValue('Relevant Investigations', getText('certificateInvestigations'));

    // --- Assessment & Plan ---
    addSection('Assessment & Plan');
    addKeyValue('Assessment / Diagnoses', getText('assessmentDiagnoses'));
    addKeyValue('Meets Visual Standards?', getValue('meetsStandards'));
    addKeyValue('Plan / Recommendations', getText('plan'));
    addKeyValue('Prognosis', getText('prognosis'));

    // --- Notes & Reflection ---
    addSection('Notes & Reflection');
    addKeyValue('Internal Notes', getText('internalNotes'));
    addKeyValue('Personal Reflection/Learning', getText('notesReflection'));

    addFooter();

    const patientName = getValue('patientName').replace(/\s+/g, '-');
    doc.save(`CertificateCase-${patientName || 'Untitled'}.pdf`);
  });
});

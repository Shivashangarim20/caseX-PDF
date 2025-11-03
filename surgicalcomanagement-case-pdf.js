// surgical-comanagement-case-pdf-emergency-layout.js
// Focus CaseX - Surgical Co-management Case PDF Export (Emergency Case Layout)
// This file converts the Surgical Co-management PDF generator to match the Emergency Case professional layout:
// - Top header: "Focus CaseX - Optometry Report" (generic, centered, dark-blue)
// - White-on-blue section bars (same style as Emergency Case)
// - Same fonts, margins, pagination, and now, also uses the standardized TWO-COLUMN TABLES.
// - Robust getters for id/name/radio/checkbox/textarea groups (already mostly present, standardized)
// - Pagination-safe, auto-wrapping, overlap-free layout
// - Triggers immediate download when #downloadPdf is clicked
// - ALL fields are filled with example data for demonstration purposes

document.addEventListener('DOMContentLoaded', () => {
  const downloadPdfButton = document.getElementById('downloadPdf');
  const form = document.getElementById('optometryCaseForm');

  if (!downloadPdfButton || !form) {
    console.info('PDF export not initialized – missing button or form.');
    return;
  }

  if (typeof window.jspdf === 'undefined') {
    console.error('jsPDF not loaded. Add CDN in <head>.');
    return;
  }

  downloadPdfButton.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Layout constants
    const margin = 15;
    const topMargin = 16; // Standard top margin from emergency/CL
    const bottomMargin = 18; // Standard bottom margin
    const usableWidth = doc.internal.pageSize.width - margin * 2;
    const defaultLineHeight = 5; // Standard line height
    const smallLineHeight = 4.5; // Standard small line height for tables
    const sectionBarHeight = 7; // Standard section bar height
    const headerBlue = { r: 0, g: 77, b: 128 }; // Standard header blue color

    let y = topMargin + 6; // Initial y position after header
    let pageNum = 1;

    // ---------------- Page Controls ----------------
    function checkPageBreak(space) {
      if (y + space > doc.internal.pageSize.height - bottomMargin) {
        addFooter();
        doc.addPage();
        pageNum++;
        addHeader();
        y = topMargin + 6; // Reset y after page break
      }
    }

    function addHeader() {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(headerBlue.r, headerBlue.g, headerBlue.b);
      doc.text('Focus CaseX - Optometry Report', doc.internal.pageSize.width / 2, 10, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text('Surgical Co-management Case Report', doc.internal.pageSize.width / 2, 15, { align: 'center' });
      doc.setDrawColor(180);
      doc.line(margin, 17, doc.internal.pageSize.width - margin, 17);
      // Note: y is set by the calling context after addHeader() is done.
    }

    function addFooter() {
      const h = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('© 2025 Focus CaseX', margin, h - 10);
      doc.text(`Page ${pageNum}`, doc.internal.pageSize.width - margin, h - 10, { align: 'right' });
    }

    // ---------------- Helper Functions ----------------
    function isEmpty(v) {
      return !v || String(v).trim() === '' || v === 'Select...' || v === 'N/A' || v === '-';
    }

    // Consolidated getValue function to be more robust, similar to previous scripts
    const getValue = key => {
      if (!key) return '';
      // try by id
      let el = document.getElementById(key);
      if (el) {
        if (el.tagName === 'SELECT') return el.value !== 'Select...' ? el.value : '';
        if (el.type === 'radio') {
          const checked = document.querySelector(`input[name="${el.name}"]:checked`);
          return checked ? checked.value : '';
        }
        if (el.type === 'checkbox') {
          const group = document.querySelectorAll(`input[name="${el.name}"]`);
          if (group && group.length > 1) { // Handle groups of checkboxes if they share a name
              return Array.from(group).filter(g => g.checked).map(g => g.value || 'on').join(', ');
          }
          return el.checked ? (el.value || 'Yes') : 'No';
        }
        return el.value || '';
      }
      // try by name (first matched input/select/textarea)
      el = document.querySelector(`[name="${key}"]`);
      if (el) {
        if (el.tagName === 'SELECT') return el.value !== 'Select...' ? el.value : '';
        if (el.type === 'radio') {
            const checked = document.querySelector(`input[name="${el.name}"]:checked`);
            return checked ? checked.value : '';
        }
        if (el.type === 'checkbox') {
            const group = document.querySelectorAll(`input[name="${el.name}"]`);
            if (group && group.length > 1) {
                return Array.from(group).filter(g => g.checked).map(g => g.value || 'on').join(', ');
            }
            return el.checked ? (el.value || 'Yes') : 'No';
        }
        return el.value || '';
      }
      return '';
    };

    const getTextAreaOrInputByName = name => {
      const el = document.querySelector(`textarea[name="${name}"], input[name="${name}"]`);
      return el ? el.value : '';
    };

    // ---------------- Section Title ----------------
    function addSectionTitle(title) {
      if (isEmpty(title)) return;
      checkPageBreak(defaultLineHeight * 3 + 8);
      doc.setFillColor(headerBlue.r, headerBlue.g, headerBlue.b);
      doc.rect(margin, y, usableWidth, sectionBarHeight, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255);
      doc.text(title, doc.internal.pageSize.width / 2, y + (sectionBarHeight / 2) + 2, { align: 'center' });
      y += sectionBarHeight + 4;
      doc.setTextColor(0);
      doc.setFont('helvetica', 'normal');
    }

    // ---------------- Key-Value Field ----------------
    function addKeyValue(label, value) {
      if (isEmpty(value)) return false; // Return false if value is empty

      const labelWidth = 55;
      const valueWidth = usableWidth - labelWidth - 6;

      const labelLines = doc.splitTextToSize(`${label}:`, labelWidth);
      const valueLines = doc.splitTextToSize(String(value), valueWidth);

      const blockH = Math.max(labelLines.length, valueLines.length) * defaultLineHeight + 2;
      checkPageBreak(blockH + 4);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(labelLines, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.text(valueLines, margin + labelWidth + 6, y);

      y += blockH + 4;
      return true; // Indicate that content was added
    }

    // ---------------- Two-column table renderer (from Emergency/CL) ----------------
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
        y += defaultLineHeight + 2;
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
      doc.setDrawColor(180);
      doc.line(x1, y - totalTableHeight, x1, y);
      doc.line(x2, y - totalTableHeight, x2, y);
      doc.line(x3, y - totalTableHeight, x3, y);
      doc.line(x4, y - totalTableHeight, x4, y);

      y += 6; // small gap after table
    }


    // ---------------- Report Content ----------------
    addHeader();

    // Patient Info
    addSectionTitle('Patient Information');
    addKeyValue('Patient ID', getValue('patientId') || 'SCM-45678');
    addKeyValue('Patient Name', getValue('patientName') || 'Robert Johnson');
    addKeyValue('Date of Birth', getValue('dateOfBirth') || '1965-03-15');
    addKeyValue('Age', getTextAreaOrInputByName('patientAge') || '59');
    addKeyValue('Referring Surgeon', getTextAreaOrInputByName('referringSurgeon') || 'Dr. Eleanor Vance, MD');
    addKeyValue('Date of Surgery', getValue('dateOfSurgery') || '2024-07-10');
    let surgeryType = getValue('typeOfSurgery') || 'Cataract Extraction with IOL Implant';
    if (surgeryType === 'Other') surgeryType += `: ${getTextAreaOrInputByName('surgeryDetails') || 'Example specific details of other surgery'}`;
    addKeyValue('Type of Surgery', surgeryType);

    // Chief Complaint
    addSectionTitle('Chief Complaint (CC)');
    addKeyValue('Chief Complaint', getTextAreaOrInputByName('chiefComplaint') || 'Patient reports blurry vision and glare, worse in the right eye, for several months, now worsened with post-op recovery. Left eye also has some blur.');
    addKeyValue('HPI', getTextAreaOrInputByName('hpi') || 'Patient underwent uncomplicated phacoemulsification with IOL implant (OD) on 2024-07-10. Reports good initial recovery but has noticed significant residual blur OD which he finds bothersome. Left eye visual acuity is also reduced due to cataract. Patient is here for 2-week post-op check and pre-op evaluation for OS.');

    // History
    addSectionTitle('History');
    addKeyValue('Past Ocular History', getTextAreaOrInputByName('poh') || 'OD: Cataract, Pseudoexfoliation Syndrome. OS: Cataract. Mild dry eye OU. No history of glaucoma or retinal disease.');
    addKeyValue('Past Medical History', getTextAreaOrInputByName('pmh') || 'Hypertension, controlled with medication. Type 2 Diabetes, well-controlled (HbA1c 6.5%).');
    addKeyValue('Allergies', getTextAreaOrInputByName('allergies') || 'Penicillin (rash)');
    addKeyValue('Pre-operative Medications', getTextAreaOrInputByName('preOpMeds') || 'OD: Vigamox QID, Pred Forte QID (3 days prior). OU: Lumify PRN dry eye.');
    addKeyValue('Current Post-operative Medications', getTextAreaOrInputByName('postOpMedsCurrent') || 'OD: Pred Forte BID, Nevanac BID, Moxeza QD.');

    // Pre-Operative
    addSectionTitle('Pre-Operative Assessment');

    // Visual Acuity (Pre-op) Table
    const preOpVARows = [
        { label: 'VA (Pre-op)', c1: getTextAreaOrInputByName('preOpVA_OD') || '20/80', c2: getTextAreaOrInputByName('preOpVA_OS') || '20/60' }
    ];
    renderTwoColTable({
        title: 'Visual Acuity (Pre-operative)',
        rows: preOpVARows,
        totalWidth: usableWidth * 0.7,
        labelColW: (usableWidth * 0.7) * 0.42,
        eyeColW: (usableWidth * 0.7 - ((usableWidth * 0.7) * 0.42)) / 2
    });

    // Refraction (Pre-op) Table
    const preOpRefractionRows = [
        { label: 'Refraction (Pre-op)', c1: getTextAreaOrInputByName('preOpRefraction_OD') || '-1.50 -1.00 x 170', c2: getTextAreaOrInputByName('preOpRefraction_OS') || '-2.00 DS' }
    ];
    renderTwoColTable({
        title: 'Refraction (Pre-operative)',
        rows: preOpRefractionRows,
        totalWidth: usableWidth * 0.8,
        labelColW: (usableWidth * 0.8) * 0.42,
        eyeColW: (usableWidth * 0.8 - ((usableWidth * 0.8) * 0.42)) / 2
    });

    // Biometry Table
    const biometryRows = [
        { label: 'Axial Length (mm)', c1: getTextAreaOrInputByName('biometryAxialLengthOD') || '23.85', c2: getTextAreaOrInputByName('biometryAxialLengthOS') || '23.90' },
        { label: 'K1', c1: getTextAreaOrInputByName('biometryK1OD') || '44.25 @ 90', c2: getTextAreaOrInputByName('biometryK1OS') || '43.75 @ 85' },
        { label: 'K2', c1: getTextAreaOrInputByName('biometryK2OD') || '45.00 @ 180', c2: getTextAreaOrInputByName('biometryK2OS') || '44.50 @ 175' }
    ];
    renderTwoColTable({
        title: 'Biometry',
        rows: biometryRows,
        totalWidth: usableWidth * 0.8,
        labelColW: (usableWidth * 0.8) * 0.4,
        eyeColW: (usableWidth * 0.8 - ((usableWidth * 0.8) * 0.4)) / 2
    });

    // IOP (Pre-op) Table
    const preOpIOPRows = [
        { label: 'IOP (mmHg)', c1: getTextAreaOrInputByName('iop_preOp_OD') || '18', c2: getTextAreaOrInputByName('iop_preOp_OS') || '19' }
    ];
    renderTwoColTable({
        title: 'Intraocular Pressure (Pre-operative)',
        rows: preOpIOPRows,
        totalWidth: usableWidth * 0.6,
        labelColW: (usableWidth * 0.6) * 0.35,
        eyeColW: (usableWidth * 0.6 - ((usableWidth * 0.6) * 0.35)) / 2
    });

    // Endothelial Cell Count Table
    const eccRows = [
        { label: 'ECC (cells/mm²)', c1: getTextAreaOrInputByName('endothelialCellCountOD') || '2350', c2: getTextAreaOrInputByName('endothelialCellCountOS') || '2400' }
    ];
    renderTwoColTable({
        title: 'Endothelial Cell Count',
        rows: eccRows,
        totalWidth: usableWidth * 0.7,
        labelColW: (usableWidth * 0.7) * 0.45,
        eyeColW: (usableWidth * 0.7 - ((usableWidth * 0.7) * 0.45)) / 2
    });

    addKeyValue('Lens Status', getValue('preOpLensStatus') || 'OD: 3+ NS, 1+ PSC. OS: 2+ NS, 1+ cortical.');

    // Post-Operative
    addSectionTitle('Post-Operative Examination');
    addKeyValue('Post-op Visit Type', getValue('postOpVisitType') || '2-Week Post-Op');
    addKeyValue('Date of Visit', getValue('postOpVisitDate') || '2024-07-24');

    // Visual Acuity (Post-op) Table
    const postOpVARows = [
        { label: 'VA (Post-op)', c1: getTextAreaOrInputByName('postOpVA_OD') || '20/40 -2', c2: getTextAreaOrInputByName('postOpVA_OS') || '20/60' }
    ];
    renderTwoColTable({
        title: 'Visual Acuity (Post-operative)',
        rows: postOpVARows,
        totalWidth: usableWidth * 0.7,
        labelColW: (usableWidth * 0.7) * 0.42,
        eyeColW: (usableWidth * 0.7 - ((usableWidth * 0.7) * 0.42)) / 2
    });

    // Refraction (Post-op) Table
    const postOpRefractionRows = [
        { label: 'Refraction (Post-op)', c1: getTextAreaOrInputByName('postOpRefraction_OD') || '-0.75 -0.50 x 165', c2: getTextAreaOrInputByName('postOpRefraction_OS') || '-2.00 DS' }
    ];
    renderTwoColTable({
        title: 'Refraction (Post-operative)',
        rows: postOpRefractionRows,
        totalWidth: usableWidth * 0.8,
        labelColW: (usableWidth * 0.8) * 0.42,
        eyeColW: (usableWidth * 0.8 - ((usableWidth * 0.8) * 0.42)) / 2
    });

    // IOP (Post-op) Table
    const postOpIOPRows = [
        { label: 'IOP (mmHg)', c1: getTextAreaOrInputByName('iop_postOp_OD') || '16', c2: getTextAreaOrInputByName('iop_postOp_OS') || '17' }
    ];
    renderTwoColTable({
        title: 'Intraocular Pressure (Post-operative)',
        rows: postOpIOPRows,
        totalWidth: usableWidth * 0.6,
        labelColW: (usableWidth * 0.6) * 0.35,
        eyeColW: (usableWidth * 0.6 - ((usableWidth * 0.6) * 0.35)) / 2
    });

    addKeyValue('External Exam', getTextAreaOrInputByName('externalExam_postOp') || 'OD: Mild conjunctival injection, otherwise WNL. OS: WNL.');
    addKeyValue('Slit Lamp Exam', getTextAreaOrInputByName('slitLampExam_postOp') || 'OD: Well-centered IOL, clear cornea, trace cell/flare in AC. OS: 2+ NS cataract, otherwise WNL.');
    addKeyValue('Fundus Exam', getTextAreaOrInputByName('fundusExam_postOp') || 'OD: Clear media, attached retina, healthy ONH, macula WNL. OS: View hazy due to cataract, ONH/macula appears healthy.');
    let postComp = getValue('postOpComplications') || 'No';
    if (postComp === 'Yes') postComp += `: ${getTextAreaOrInputByName('postOpComplicationsList') || 'Example: Cystoid Macular Edema'}`;
    addKeyValue('Post-operative Complications', postComp);

    // Assessment
    addSectionTitle('Assessment & Plan');
    addKeyValue('Assessment / Diagnoses', getTextAreaOrInputByName('assessmentDiagnoses') || '1. OD: Pseudophakia with residual refractive error. Likely due to mild corneal astigmatism and potentially slight IOL tilt. Trace post-op inflammation. 2. OS: Age-related cataract. 3. OU: Stable ocular health otherwise.');
    addKeyValue('Plan', getTextAreaOrInputByName('plan') || '1. OD: Continue Pred Forte BID, Nevanac BID for 1 week then taper. RTC for glasses Rx in 2 weeks. Discuss options for residual astigmatism if patient remains bothered after 6 weeks (e.g., limbal relaxing incisions or PRK). 2. OS: Schedule pre-op testing for cataract surgery in 3 months. 3. Continue current diabetes and hypertension management. 4. RTC for follow-up on OD inflammation in 1 week.');
    addKeyValue('Prognosis', getTextAreaOrInputByName('prognosis') || 'Good for excellent visual outcomes with spectacle correction OD and planned surgery OS.');
    addKeyValue('Follow Up Instructions', getTextAreaOrInputByName('followUpInstructions') || 'OD: Continue drops as instructed. RTC 1 week for inflammation check, 2 weeks for refraction. OS: Prepare for surgery in 3 months. Contact office if any worsening of vision or pain.');

    // Notes
    addSectionTitle('Notes & Reflection');
    addKeyValue('Internal Notes', getTextAreaOrInputByName('internalNotes') || 'Patient very engaged and asks good questions. Expressed satisfaction with surgeon. Interested in maximizing vision in OD, will be compliant with drops. Referred to optical for temporary post-op glasses if desired.');
    addKeyValue('Personal Reflection / Learning Points', getTextAreaOrInputByName('notesReflection') || 'Even in uncomplicated cases, residual astigmatism can be a patient concern. Important to manage expectations pre-op and have a clear post-op plan for refinement. Pseudoexfoliation often requires careful monitoring for IOP and IOL stability.');

    addFooter();

    // Save file
    const patientForFile = (getValue('patientName') || 'Robert-Johnson').replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-_]/g, '');
    const fileName = `SurgicalComanagementCase-${patientForFile}.pdf`;
    doc.save(fileName);
  });
});
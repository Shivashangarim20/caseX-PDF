// Pediatric Optometry Case Report PDF Generator
// Standardized to the Emergency Case professional layout.
document.addEventListener('DOMContentLoaded', () => {
  const downloadPdfButton = document.getElementById('downloadPdf');
  const form = document.getElementById('optometryCaseForm');

  if (!downloadPdfButton || !form) {
    console.info('PDF export not initialized – missing button or form.');
    return;
  }

  if (typeof window.jspdf === 'undefined') {
    console.error('jsPDF not loaded.');
    return;
  }

  downloadPdfButton.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Layout constants (Standardized to Emergency Case theme)
    const margin = 15;
    const topMargin = 16;
    const bottomMargin = 18;
    const usableWidth = doc.internal.pageSize.width - margin * 2;
    const defaultLineHeight = 5; // Standard line height for ~10pt text
    const smallLineHeight = 4.5; // Standard small line height for 9pt text in tables
    const sectionBarHeight = 7; // Standard section bar height
    const headerBlue = { r: 0, g: 77, b: 128 }; // Standard header blue color

    let y = topMargin + 6; // Standard initial y position after header
    let pageNum = 1;

    // ---------- Page Controls (Standardized) ----------
    function checkPageBreak(space) {
      if (y + space > doc.internal.pageSize.height - bottomMargin) {
        addFooter();
        doc.addPage();
        pageNum++;
        addHeader();
        y = topMargin + 6; // Standard reset y after page break
      }
    }

    function addHeader() {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(headerBlue.r, headerBlue.g, headerBlue.b);
      doc.text('Focus CaseX - Optometry Report', doc.internal.pageSize.width / 2, 10, { align: 'center' }); // Standard y position
      doc.setFontSize(11); // Standard sub-header font size
      doc.setTextColor(80); // Standard sub-header text color
      doc.text('Pediatric Optometry Case Report', doc.internal.pageSize.width / 2, 15, { align: 'center' }); // Standard y position
      doc.setDrawColor(180);
      doc.line(margin, 17, doc.internal.pageSize.width - margin, 17); // Standard y position
    }

    function addFooter() {
      const h = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('© 2025 Focus CaseX', margin, h - 10);
      doc.text(`Page ${pageNum}`, doc.internal.pageSize.width - margin, h - 10, { align: 'right' });
    }

    // ---------- Helpers (Standardized) ----------
    function isEmpty(v) {
      return !v || String(v).trim() === '' || v === 'Select...' || v === 'N/A' || v === '-';
    }

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
          if (group && group.length > 1) {
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

    const getTextAreaOrInputByName = name => { // Renamed from getText for consistency
      const el = document.querySelector(`textarea[name="${name}"], input[name="${name}"]`);
      return el ? el.value : '';
    };

    // ---------- Section Title (Standardized) ----------
    function addSectionTitle(title) { // Renamed from addSection
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

    // ---------- Key-Value (Standardized) ----------
    function addKeyValue(label, value) {
      if (isEmpty(value)) return false;

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
      return true;
    }

    // ---------- Two-column table renderer (Standardized, copied from Emergency/CL) ----------
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


    // ---------- Report Content ----------
    addHeader();

    addSectionTitle('Patient Information'); // Using standardized function
    addKeyValue('Patient ID', getValue('patientId') || 'PED-98765');
    addKeyValue('Patient Name', getValue('patientName') || 'Lily Chen');
    addKeyValue('Date of Birth', getValue('dateOfBirth') || '2018-11-05');
    addKeyValue('Age', getTextAreaOrInputByName('patientAge') || '5 years old');
    addKeyValue('Guardian Name', getTextAreaOrInputByName('guardianName') || 'Sarah Chen');
    addKeyValue('Guardian Contact Number', getTextAreaOrInputByName('guardianContact') || '555-987-6543');
    addKeyValue('School Performance / Current Grade', getTextAreaOrInputByName('schoolPerformance') || 'Pre-K, reports difficulty seeing the board from a distance.');
    addKeyValue('Developmental Milestones Status', getValue('developmentalMilestonesStatus') || 'Met all milestones appropriately.');
    addKeyValue('History of Eye Care', getTextAreaOrInputByName('historyOfEyeCare') || 'First eye exam today. No previous concerns or known issues.');

    addSectionTitle('Chief Complaint (CC)'); // Using standardized function
    addKeyValue('Chief Complaint', getTextAreaOrInputByName('chiefComplaint') || 'Mom concerned about Lily squinting at TV and holding books very close. Teacher noted difficulty seeing the board.');
    addKeyValue('HPI', getTextAreaOrInputByName('hpi') || 'Lily is a 5-year-old female presenting for her first eye exam. Mom reports noticing Lily squinting at the TV for the past 3 months and frequently holding books or toys close to her face. Teacher recently mentioned that Lily struggles to see things from the back of the classroom. Denies headaches, eye pain, redness, or discharge. No known trauma. General health is good.');

    addSectionTitle('History'); // Using standardized function
    addKeyValue('Past Ocular History', getTextAreaOrInputByName('poh') || 'None. No history of amblyopia, strabismus, or congenital eye conditions.');
    addKeyValue('Past Medical History', getTextAreaOrInputByName('pmh') || 'Healthy, full-term birth. No significant medical history. Up-to-date on immunizations.');
    addKeyValue('Allergies', getTextAreaOrInputByName('allergies') || 'No known drug allergies.');
    addKeyValue('Current Medications', getTextAreaOrInputByName('medications') || 'None.');
    addKeyValue('Family Ocular History (FOH)', getTextAreaOrInputByName('familyOcularHistory') || 'Mom: Myopia (-4.00D). Dad: Hyperopia (+2.00D). Paternal Grandfather: Amblyopia.');
    addKeyValue('Family Medical History (FMH)', getTextAreaOrInputByName('familyMedicalHistory') || 'No significant family medical history.');

    addSectionTitle('Examination (Pediatric Focused)'); // Using standardized function

    // Visual Acuity Table
    const vaRows = [
        { label: 'VA', c1: getTextAreaOrInputByName('vaOD') || '20/40 (HOTV)', c2: getTextAreaOrInputByName('vaOS') || '20/30 (HOTV)' }
    ];
    renderTwoColTable({
        title: 'Visual Acuity',
        rows: vaRows,
        totalWidth: usableWidth * 0.7,
        labelColW: (usableWidth * 0.7) * 0.42,
        eyeColW: (usableWidth * 0.7 - ((usableWidth * 0.7) * 0.42)) / 2
    });

    addKeyValue('Age-Appropriate VA Chart Used', getValue('ageAppropriateVA') || 'HOTV Matching');
    addKeyValue('Hirschberg Test', getTextAreaOrInputByName('hirschbergTest') || 'Orthophoric');
    addKeyValue('Brückner Test (Red Reflex)', getTextAreaOrInputByName('brucknerTest') || 'Symmetric red reflexes OU. No leukocoria noted.');
    addKeyValue('Cover Test (Distance)', getTextAreaOrInputByName('coverTestDistance') || 'Ortho');
    addKeyValue('Cover Test (Near)', getTextAreaOrInputByName('coverTestNear') || 'Ortho');
    addKeyValue('Extraocular Motility (EOMs)', getTextAreaOrInputByName('eoms_pediatric') || 'Full and smooth in all gazes OU.');

    // Cycloplegic Refraction Table
    const cycloplegicRefractionRows = [
        { label: 'Cycloplegic Refraction', c1: getTextAreaOrInputByName('cycloplegicRefractionOD') || '-1.50 -0.50 x 180', c2: getTextAreaOrInputByName('cycloplegicRefractionOS') || '-0.75 DS' }
    ];
    renderTwoColTable({
        title: 'Cycloplegic Refraction',
        rows: cycloplegicRefractionRows,
        totalWidth: usableWidth * 0.8,
        labelColW: (usableWidth * 0.8) * 0.42,
        eyeColW: (usableWidth * 0.8 - ((usableWidth * 0.8) * 0.42)) / 2
    });

    addKeyValue('Stereoacuity', getTextAreaOrInputByName('stereoacuity_pediatric') || '40 seconds of arc (Random Dot E)');
    addKeyValue('Pupils', getTextAreaOrInputByName('pupils_pediatric') || 'PERRLA OU. No APD.');
    addKeyValue('Anterior Segment Exam', getTextAreaOrInputByName('anteriorSegmentExam_pediatric') || 'WNL OU. Lids, lashes, conjunctiva, cornea, iris, lens all clear and healthy.');
    addKeyValue('Posterior Segment Exam (DFE)', getTextAreaOrInputByName('posteriorSegmentExam_pediatric') || 'WNL OU. Clear vitreous, healthy optic nerves, maculae and peripheries intact. No significant findings.');

    addSectionTitle('Treatment & Management'); // Using standardized function
    addKeyValue('Spectacles / Contact Lenses Prescribed?', getValue('prescriptionIssued') || 'Yes');
    addKeyValue('Amblyopia History / Management?', getValue('amblyopiaHistory') || 'No history of amblyopia. Preventative monitoring.');
    addKeyValue('Strabismus History / Management?', getValue('strabismusHistory') || 'No strabismus noted. Monitor for development.');
    addKeyValue('Patient Education Provided', getTextAreaOrInputByName('patientEducationProvided') || 'Discussed findings with mom, explained myopia and astigmatism. Emphasized the importance of consistent spectacle wear for clear vision and visual development. Reviewed signs of amblyopia/strabismus to look out for. Explained proper spectacle care and handling.');

    addSectionTitle('Assessment & Plan'); // Using standardized function
    addKeyValue('Assessment / Diagnoses', getTextAreaOrInputByName('assessmentDiagnoses') || '1. OD: Myopia and Astigmatism. 2. OS: Myopia. 3. OU: Normal ocular health. 4. Family history of myopia.');
    addKeyValue('Plan', getTextAreaOrInputByName('plan') || '1. Prescribe spectacles for full-time wear: OD -1.50 -0.50 x 180; OS -0.75 DS. 2. Re-educate on visual hygiene (20-20-20 rule, good lighting). 3. RTC in 6 months for follow-up exam to monitor refractive error progression and ensure adaptation to spectacles. 4. Discuss myopia management options with guardian at next visit if progression noted.');
    addKeyValue('Prognosis', getTextAreaOrInputByName('prognosis') || 'Good with consistent spectacle wear. Will require regular monitoring for refractive error progression.');
    addKeyValue('Follow-up Instructions', getTextAreaOrInputByName('followUpInstructions') || 'Ensure Lily wears her new spectacles full-time. Return in 6 months for re-evaluation. Contact office if any issues with glasses, worsening vision, or new symptoms.');

    addSectionTitle('Notes & Reflection'); // Using standardized function
    addKeyValue('Internal Notes', getTextAreaOrInputByName('internalNotes') || 'Lily was a cooperative patient. Mom was very receptive to information and understood the importance of glasses. Will recommend anti-reflective coating for new spectacles. Noted paternal grandfather\'s amblyopia which warrants close monitoring for Lily.');
    addKeyValue('Personal Reflection / Learning Points', getTextAreaOrInputByName('notesReflection') || 'Early detection of refractive error in children is crucial for preventing amblyopia and supporting academic performance. Thorough history, including family history, guides management and counseling. Need to ensure cycloplegic refraction for accurate Rx in children.');

    addFooter();

    const patientForFile = (getValue('patientName') || 'Lily-Chen').replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-_]/g, ''); // Added default patient name for filename
    const fileName = `PediatricOptometryCase-${patientForFile}.pdf`;
    doc.save(fileName);
  });
});
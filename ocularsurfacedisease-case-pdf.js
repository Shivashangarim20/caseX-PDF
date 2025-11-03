// ocularsurface-case-pdf.js
// Standardized PDF generator for Ocular Surface Disease case (Focus CaseX).
// - Consistent visual structure (headers, section bars, key-value pairs, tables)
// - Uses renderTwoColTable for all bilateral OD/OS data
// - Auto page breaks
// - All fields prefilled with example demo data
// Requires jspdf (https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js)

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  if (typeof window.jspdf === 'undefined') {
    console.error('jsPDF not loaded. Please include jsPDF before this file.');
    return;
  }
  const { jsPDF } = window.jspdf;

  const downloadPdfButton = document.getElementById('downloadPdf');
  const form = document.getElementById('optometryCaseForm');

  if (!downloadPdfButton || !form) {
    console.info('PDF export not initialized – missing button or form.');
    return;
  }

  downloadPdfButton.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default form submission

    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setProperties({ title: 'Focus CaseX - Ocular Surface Disease Case' });

    // --- Config: layout values (standardized to match other reports) ---
    const margin = 15;
    const topMargin = 16;
    const bottomMargin = 18;
    const usableWidth = doc.internal.pageSize.width - margin * 2;
    const defaultLineHeight = 5; // mm per line (approx for 10pt text)
    const smallLineHeight = 4.5; // mm per line (approx for 9pt text in tables)
    const sectionBarHeight = 7;
    const headerBlue = { r: 0, g: 77, b: 128 }; // #004D80

    let y = topMargin + 6; // Standard initial y after header
    let pageNum = 1;

    // --- Helper Functions (Standardized) ---
    function isEmpty(v) {
      return !v || String(v).trim() === '' || v === 'Select...' || v === 'N/A' || v === '-';
    }

    const getValue = key => {
      if (!key) return '';
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

    // --- Page Controls (Standardized) ---
    function checkPageBreak(space) {
      if (y + space > doc.internal.pageSize.height - bottomMargin) {
        addFooter();
        doc.addPage();
        pageNum++;
        addHeader();
        y = topMargin + 6; // Standard reset y
      }
    }

    function addHeader() {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(headerBlue.r, headerBlue.g, headerBlue.b);
      doc.text('Focus CaseX - Optometry Report', doc.internal.pageSize.width / 2, 10, { align: 'center' });
      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text('Ocular Surface Disease Case', doc.internal.pageSize.width / 2, 15, { align: 'center' });
      doc.setDrawColor(180);
      doc.line(margin, 17, doc.internal.pageSize.width - margin, 17);
    }

    function addFooter() {
      const h = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`© 2025 Focus CaseX`, margin, h - 10);
      doc.text(`Page ${pageNum}`, doc.internal.pageSize.width - margin, h - 10, { align: 'right' });
    }

    // --- Section Title (Standardized) ---
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

    // --- Key-Value (Standardized) ---
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

    // --- Two-column table renderer (Standardized, from other reports) ---
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

    // --- Generic Wrapped Text (adapted from OSD script for long blocks) ---
    function addWrappedText(text, options = {}) {
      if (isEmpty(text)) return;
      const fontSize = options.fontSize || 10;
      const font = options.font || 'helvetica';
      const style = options.style || 'normal';
      const lineHeight = options.lineHeight || defaultLineHeight;
      const maxWidth = usableWidth;

      doc.setFont(font, style);
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(String(text), maxWidth);
      const required = lines.length * lineHeight + 2;
      checkPageBreak(required);
      doc.text(lines, margin, y);
      y += required;
      doc.setFont('helvetica', 'normal'); // Reset font
      doc.setFontSize(10); // Reset font size
    }

    // --- Report Content ---
    addHeader();

    // Patient Information
    addSectionTitle('Patient Information');
    addKeyValue('Patient ID', getValue('patientId') || "OSD-2025-001");
    addKeyValue('Patient Name', getValue('patientName') || "Ananya Rao");
    addKeyValue('Age', getValue('patientAge') || "34");
    addKeyValue('Date of Birth', getValue('dateOfBirth') || "1991-05-12");
    addKeyValue('Primary Complaint', getValue('primaryOSDCause') || getValue('chiefComplaint') || "Burning, gritty sensation OU, worse towards evening.");

    // Symptoms & History
    addSectionTitle('Symptoms & History');
    addKeyValue('OSDI Score', getValue('osdiScore') || "48");
    addKeyValue('DEQ-5 Score', getValue('deq5Score') || "16");
    addKeyValue('Symptom Duration / HPI', getValue('hpi') || getValue('symptomDuration') || "6 months history of intermittent burning and foreign body sensation; worsens with prolonged screen time.");
    addKeyValue('Associated Symptoms', getValue('associatedSymptoms') || "Photophobia, tearing, fluctuating vision");
    addKeyValue('Past Ocular History', getValue('poh') || "Occasional allergic conjunctivitis; soft CL wearer previously.");
    addKeyValue('Systemic History', getValue('pmh') || "Hypothyroidism (on levothyroxine).");
    addKeyValue('Allergies', getValue('allergies') || "No known drug allergies.");
    addKeyValue('Medications (Systemic)', getValue('medications') || "Levothyroxine 50 mcg daily.");
    addKeyValue('Ocular Medications', getValue('ocularMedications') || "Lubricant drops PRN.");
    addKeyValue('Environmental Factors', getValue('environmentalFactors') || "Air-conditioned office 8 hrs/day, low humidity, prolonged screen time.");

    // Examination
    addSectionTitle('Examination (OSD Focused)');

    // Ocular Findings Table (replaces addODOSBox)
    const ocularFindingsRows = [
      { label: 'Lid Margin Assessment', c1: getTextAreaOrInputByName('lidMarginAssessmentOD_details') || getValue('lidMarginAssessment_OD') || 'MGD Grade 2: Gland inspissation', c2: getTextAreaOrInputByName('lidMarginAssessmentOS_details') || getValue('lidMarginAssessment_OS') || 'MGD Grade 3: Significant inspissation & telangiectasia' },
      { label: 'Meibography', c1: getValue('meibography_OD') || 'Grade 1 gland dropout (lower lid)', c2: getValue('meibography_OS') || 'Grade 2 gland dropout (lower lid)' },
      { label: 'Non-invasive TBUT (sec)', c1: getValue('tbutNonInvasiveOD') || '5', c2: getValue('tbutNonInvasiveOS') || '4' },
      { label: 'Invasive TBUT (sec)', c1: getValue('tbutInvasiveOD') || '4', c2: getValue('tbutInvasiveOS') || '3' },
      { label: 'Schirmer I (mm/5min)', c1: getValue('schirmer1_OD') || '6', c2: getValue('schirmer1_OS') || '5' },
      { label: 'Tear Osmolarity (mOsm/L)', c1: getValue('tearOsmolarity_OD') || '310', c2: getValue('tearOsmolarity_OS') || '305' },
      { label: 'InflammaDry / MMP-9', c1: (getValue('inflammaDry_OD') || 'Positive') + (getValue('inflammaDryOD_value') ? ' - ' + getValue('inflammaDryOD_value') : ' - MMP-9 positive'), c2: (getValue('inflammaDry_OS') || 'Positive') + (getValue('inflammaDryOS_value') ? ' - ' + getValue('inflammaDryOS_value') : ' - MMP-9 positive') },
      { label: 'Corneal Staining', c1: getTextAreaOrInputByName('cornealStainingOD_details') || getValue('stainingOD') || '2+ inferior SPK with fluorescein', c2: getTextAreaOrInputByName('cornealStainingOS_details') || getValue('stainingOS') || '3+ inferior SPK, punctate staining' },
      { label: 'Conjunctival Staining', c1: getTextAreaOrInputByName('conjunctivalStainingOD_details') || '1+ Lissamine green nasal conjunctiva', c2: getTextAreaOrInputByName('conjunctivalStainingOS_details') || '1+ Lissamine green temporal conjunctiva' },
      { label: 'Conjunctival Injection', c1: getValue('conjunctivalInjectionOD') || 'Diffuse', c2: getValue('conjunctivalInjectionOS') || 'Diffuse' },
    ];

    renderTwoColTable({
      title: 'Ocular Findings',
      rows: ocularFindingsRows,
      totalWidth: usableWidth * 0.95,
      labelColW: (usableWidth * 0.95) * 0.45,
      eyeColW: (usableWidth * 0.95 - ((usableWidth * 0.95) * 0.45)) / 2
    });

    // Management & Treatment
    addSectionTitle('Management & Treatment');
    addKeyValue('Artificial Tears / Lubricants', getValue('artificialTears') || "Preservative-free artificial tears QID OU (Systane Ultra UD).");
    addKeyValue('Anti-inflammatory / Immunomodulatory Drops', getValue('antiInflammatoryDrops') || "Topical cyclosporine A 0.05% BID OU.");
    addKeyValue('Punctal Plugs', getValue('punctalPlugs') + (getValue('punctalPlugsDetails') ? (' - ' + getValue('punctalPlugsDetails')) : ' - No plugs inserted.'));
    addKeyValue('Thermal Pulsation', getValue('thermalPulsation') + (getValue('thermalPulsationDetails') ? (' - ' + getValue('thermalPulsationDetails')) : ' - Not yet performed.'));
    addKeyValue('IPL Treatment', getValue('iplTreatment') + (getValue('iplTreatmentDetails') ? (' - ' + getValue('iplTreatmentDetails')) : ' - Not yet performed.'));
    addKeyValue('Scleral Lenses', getValue('scleralLensesConsidered') + (getValue('scleralLensesDetails') ? (' - ' + getValue('scleralLensesDetails')) : ' - Discussed scleral lenses; trial planned.'));
    addKeyValue('Nutritional Supplements', getValue('nutritionalSupplements') || "Omega-3 1000 mg daily.");
    addKeyValue('Lid Hygiene', getValue('lidHygiene') || "Warm compresses BID; lid scrubs nightly.");
    addKeyValue('Environmental Modifications', getValue('environmentalModifications') || "Humidifier at home; reduce direct fan exposure.");

    // Assessment & Plan
    addSectionTitle('Assessment & Plan');
    addWrappedText(getValue('assessmentDiagnoses') || getValue('assessment') || '1. Moderate evaporative dry eye disease secondary to MGD OU.\n2. Mild aqueous deficiency OU.');
    addWrappedText(getValue('planText') || getValue('plan') || '1. Continue cyclosporine BID and preservative-free tears QID.\n2. Warm compresses & lid hygiene BID.\n3. Consider thermal pulsation if symptoms persist.\n4. Review in 1 month.');
    addKeyValue('Prognosis', getValue('prognosis') || "Good with compliance.");
    addKeyValue('Follow Up Instructions', getValue('followUpInstructions') || "Return in 4 weeks or earlier if worsening of symptoms or new concerns.");

    // Notes & Reflection
    addSectionTitle('Notes & Reflection');
    addWrappedText(getValue('internalNotes') || 'Patient explained chronic nature; needs compliance with lid hygiene. Discussed importance of long-term management.');
    addWrappedText(getValue('notesReflection') || 'Consider early thermal pulsation for faster symptomatic relief in Grade 3 MGD, especially given patient compliance concerns. Early intervention might improve patient satisfaction.');

    // Finalize
    addFooter();
    // Save with patient name sanitized
    const patientForFile = (getValue('patientName') || 'Untitled').replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-_]/g, '');
    const fileName = `OcularSurfaceDiseaseCase-${patientForFile}.pdf`;

    try {
      doc.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Check console for details.');
    }
  }); // End of download button click listener
}); // End of DOMContentLoaded
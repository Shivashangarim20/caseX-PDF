document.addEventListener('DOMContentLoaded', () => {
  const downloadPdfButton = document.getElementById('downloadPdf');
  const form = document.getElementById('optometryCaseForm');

  if (!downloadPdfButton || !form) {
    console.info('No "Download PDF" button or form found on this page. PDF export handler not initialized.');
    return;
  }

  if (typeof window.jspdf === 'undefined') {
    console.error('jsPDF library not loaded. Add CDN in <head>.');
    return;
  }

  // Helper to fetch element by id or name (fallback)
  function getElByIdOrName(idOrName) {
    let el = document.getElementById(idOrName);
    if (!el) {
      // try by name (first match)
      el = document.querySelector(`[name="${idOrName}"]`);
    }
    return el;
  }

  // Generic getters that work with inputs, selects, radios, checkboxes, textareas
  const getFieldValue = (idOrName) => {
    const el = getElByIdOrName(idOrName);
    if (!el) return '';
    const tag = el.tagName ? el.tagName.toUpperCase() : '';
    if (tag === 'SELECT') return el.value !== 'Select...' ? el.value : '';
    if (el.type === 'radio' || el.type === 'checkbox') {
      // if idOrName points to a group name, handle group
      if (el.name) {
        if (document.querySelectorAll(`input[name="${el.name}"]`).length > 1) {
          // radio group -> return selected
          const checked = document.querySelector(`input[name="${el.name}"]:checked`);
          if (checked) return checked.value;
          return '';
        }
      }
      if (el.type === 'checkbox') return el.checked ? (el.value || 'Yes') : 'No';
      return el.value || '';
    }
    return el.value || '';
  };

  const getTextInputValue = (idOrName) => {
    const el = document.querySelector(`input[name="${idOrName}"], input#${idOrName}`);
    return el ? el.value : '';
  };

  const getTextAreaValue = (idOrName) => {
    const el = document.querySelector(`textarea[name="${idOrName}"], textarea#${idOrName}`);
    return el ? el.value : '';
  };

  const getCheckedCheckboxes = (name) => {
    const boxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    if (!boxes || boxes.length === 0) return '';
    return Array.from(boxes).map(b => b.value).join(', ');
  };

  // Main PDF builder
  downloadPdfButton.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // Layout constants
    const pageMargin = 15;
    const usableWidth = doc.internal.pageSize.width - pageMargin * 2;
    const defaultLineHeight = 5; // Standard line height for 10pt text
    const bottomMargin = 18;
    let y = 12;
    let currentPage = 1;

    // Page helpers
    function checkPageBreak(space) {
      if (y + space > doc.internal.pageSize.height - bottomMargin) {
        addFooter();
        doc.addPage();
        currentPage++;
        addHeader();
        y = 20;
      }
    }

    function addHeader() {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(0, 77, 128);
      doc.text('Focus CaseX - Optometry Report', doc.internal.pageSize.width / 2, 10, { align: 'center' });
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text('General Optometry Case', doc.internal.pageSize.width / 2, 14, { align: 'center' });
      doc.setDrawColor(180);
      doc.line(pageMargin, 16, doc.internal.pageSize.width - pageMargin, 16);
      y = 20;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0);
    }

    function addFooter() {
      const h = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text('© 2025 Focus CaseX', pageMargin, h - 10);
      doc.text(`Page ${currentPage}`, doc.internal.pageSize.width - pageMargin, h - 10, { align: 'right' });
    }

    function addSectionTitle(title) {
      checkPageBreak(12);
      // small blue bar with white centered title
      doc.setFillColor(0, 77, 128);
      doc.rect(pageMargin, y, usableWidth, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255);
      doc.text(title, doc.internal.pageSize.width / 2, y + 5, { align: 'center' });
      y += 11;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(0);
    }

    // Standard addKV for non-OD/OS specific fields or single lines
    function addKV(label, value) {
      if (!value || String(value).trim() === '' || value === 'Select...' || value === 'N/A' || value === '-') {
        return false;
      }
      const labelW = 55;
      const valueW = usableWidth - labelW - 6;
      const labelLines = doc.splitTextToSize(label + ':', labelW);
      const valueLines = doc.splitTextToSize(String(value), valueW);
      const blockH = Math.max(labelLines.length, valueLines.length) * defaultLineHeight + 2;
      checkPageBreak(blockH + 2);
      doc.setFont('helvetica', 'bold'); // Label part is bold
      doc.setFontSize(10);
      doc.text(labelLines, pageMargin, y);
      doc.setFont('helvetica', 'normal'); // Value part is normal
      doc.text(valueLines, pageMargin + labelW + 6, y);
      y += blockH + 2;
      return true;
    }

    // New function to add a bold main heading for an OD/OS group (10pt bold)
    function addBoldGroupHeading(text) {
      checkPageBreak(defaultLineHeight + 4); // Space for heading + small gap
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(0); // Ensure black text
      doc.text(text, pageMargin, y);
      y += defaultLineHeight + 2; // Space after heading
      doc.setFont('helvetica', 'normal'); // Reset font to normal for subsequent text
    }

    // New function to add an indented Key-Value pair (for OD/OS/OU sub-items)
    // OD/OS/OU label will be slightly larger (11pt bold)
    const INDENT_LEVEL = 10; // mm for indentation
    const EYE_LABEL_FONT_SIZE = 11; // Slightly larger for OD/OS/OU labels
    const EYE_LABEL_LINE_SPACING_ADJUST = 1; // Extra mm spacing per line for OD/OS/OU items

    function addIndentedEyeKV(label, value) {
      if (!value || String(value).trim() === '' || value === 'Select...' || value === 'N/A' || value === '-') {
        return false;
      }
      const indentedPageMargin = pageMargin + INDENT_LEVEL;
      const effectiveUsableWidth = usableWidth - INDENT_LEVEL;
      const labelW = 45; // Adjusted label width for indented items (e.g., "OD:")
      const valueW = effectiveUsableWidth - labelW - 6;

      // Calculate line height based on potentially larger font size or adjusted spacing
      // defaultLineHeight is for 10pt. For 11pt, it's slightly more. Let's approximate.
      const currentItemLineHeight = (EYE_LABEL_FONT_SIZE / 10) * defaultLineHeight + EYE_LABEL_LINE_SPACING_ADJUST;

      doc.setFontSize(EYE_LABEL_FONT_SIZE); // Set font size for calculating lines based on label
      const labelLines = doc.splitTextToSize(label + ':', labelW);
      doc.setFontSize(10); // Revert to standard for value calculation if needed
      const valueLines = doc.splitTextToSize(String(value), valueW);

      // Max lines, then multiply by estimated line height for this item
      const blockH = Math.max(labelLines.length, valueLines.length) * currentItemLineHeight + 2;
      checkPageBreak(blockH + 2);

      doc.setFont('helvetica', 'bold'); // Sub-label (OD:, OS:) is bold
      doc.setFontSize(EYE_LABEL_FONT_SIZE); // Use larger font size for OD/OS/OU labels
      doc.text(labelLines, indentedPageMargin, y);
      doc.setFont('helvetica', 'normal'); // Value is normal
      doc.setFontSize(10); // Value text is standard 10pt
      doc.text(valueLines, indentedPageMargin + labelW + 6, y);
      y += blockH + 2; // Advance y
      return true;
    }

    // Amount of extra vertical space after a complete OD/OS/OU group
    const OD_OS_GROUP_POST_SPACING = 5;

    // Helper to get eye-specific values, combining status and details string
    function getEyeString(baseId, eyeSuffix, statusSuffix = '_status', detailsSuffix = '') {
      let status = getFieldValue(baseId + eyeSuffix + statusSuffix);
      let details = getTextAreaValue(baseId + eyeSuffix + detailsSuffix) || getTextInputValue(baseId + eyeSuffix + detailsSuffix);

      if (status && (status === 'WNL' || status.toLowerCase() === 'normal' || status.toLowerCase() === 'n/a' || status === 'Select...')) {
        if (details && details.trim() !== '') {
          status = ''; // Clear generic status if details are present, so details take precedence
        } else {
          return status; // Return generic status if no details
        }
      }
      if (status && status.trim() !== '') {
        return (details && details.trim() !== '') ? `${status}: ${details}` : status;
      }
      return details || '';
    }

    // -------------------------------------------------------------------------
    // TWO-COLUMN addEyeGroup: prints OD and OS side-by-side on the same row,
    // keeps OU below if present. Handles wrapping and page breaks.
    // -------------------------------------------------------------------------
    function addEyeGroup(mainHeadingText, odValue, osValue, ouValue = '') {
      // Normalize empty strings
      odValue = odValue ? String(odValue).trim() : '';
      osValue = osValue ? String(osValue).trim() : '';
      ouValue = ouValue ? String(ouValue).trim() : '';

      if (!odValue && !osValue && !ouValue) return; // nothing to print

      addBoldGroupHeading(mainHeadingText);

      const columnGap = 10; // mm gap between columns
      const colWidth = (usableWidth - columnGap) / 2;

      // Create text blocks with labels included
      const odTextBlock = odValue ? doc.splitTextToSize(`OD: ${odValue}`, colWidth - 4) : [];
      const osTextBlock = osValue ? doc.splitTextToSize(`OS: ${osValue}`, colWidth - 4) : [];

      // Height calculation based on maximum lines among OD/OS
      const maxLines = Math.max(odTextBlock.length, osTextBlock.length);
      const blockHeight = Math.max(1, maxLines) * defaultLineHeight + 2;

      // Page break if needed
      checkPageBreak(blockHeight + 4);

      // X positions
      const xOD = pageMargin;
      const xOS = pageMargin + colWidth + columnGap;

      // Draw OD block
      if (odTextBlock.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(odTextBlock, xOD, y);
      }

      // Draw OS block
      if (osTextBlock.length > 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(osTextBlock, xOS, y);
      }

      // Move down
      y += blockHeight + 4;

      // If OU exists, print it full width below
      if (ouValue && ouValue.trim() !== '') {
        const ouBlock = doc.splitTextToSize(`OU: ${ouValue}`, usableWidth);
        checkPageBreak(ouBlock.length * defaultLineHeight + 4);
        doc.text(ouBlock, pageMargin, y);
        y += ouBlock.length * defaultLineHeight + 4;
      }

      // Extra separation after group
      checkPageBreak(OD_OS_GROUP_POST_SPACING);
      y += OD_OS_GROUP_POST_SPACING;
    }

    // Start building PDF
    addHeader();

    // --- Patient Information ---
    addSectionTitle('Patient Information');
    addKV('Patient Name', getFieldValue('patientName') || getFieldValue('patientNameInput') || getFieldValue('name'));
    addKV('Patient ID', getFieldValue('patientId'));
    addKV('Date of Birth', getFieldValue('dateOfBirth'));
    addKV('Age', getTextInputValue('patientAge') || getFieldValue('patientAge'));
    addKV('Gender', getFieldValue('patientGender'));
    addKV('Ethnic Background', getTextInputValue('ethnicBackground'));
    addKV('Height', getTextInputValue('patientHeight') ? `${getTextInputValue('patientHeight')} cm` : '');
    addKV('Weight', getTextInputValue('patientWeight') ? `${getTextInputValue('patientWeight')} kg` : '');
    addKV('Contact Number', getTextInputValue('contactNumber'));
    addKV('Email Address', getTextInputValue('emailAddress'));
    addKV('Address', getTextAreaValue('patientAddress'));
    addKV('Occupation', getTextInputValue('occupation'));
    addKV('Emergency Contact', `${getTextInputValue('emergencyContactName') || ''}${getTextInputValue('emergencyContactRelationship') ? ' (' + getTextInputValue('emergencyContactRelationship') + ')' : ''}`);
    addKV('Emergency Contact Number', getTextInputValue('emergencyContactNumber'));
    addKV('Date of Last Eye Exam', getFieldValue('dateOfLastEyeExam'));
    addKV('Date of Last Physical Exam', getFieldValue('dateOfLastPhysicalExam'));
    const currentSpec = getFieldValue('currentSpectacleWearer') || getFieldValue('currentSpectacleWearer_yesno');
    if (currentSpec) addKV('Current Spectacle Wearer', currentSpec);
    addKV('Current Spectacle Rx', getTextAreaValue('currentSpectacleRx'));
    const currentCL = getFieldValue('currentContactLensWearer') || getFieldValue('currentContactLensWearer_yesno');
    if (currentCL) addKV('Current Contact Lens Wearer', currentCL);
    addKV('Current Contact Lens Rx / Type', getTextAreaValue('currentContactLensRx'));

    // --- Chief Complaint ---
    addSectionTitle('Chief Complaint (CC)');
    addKV('Chief Complaint', getTextAreaValue('chiefComplaint'));
    addKV('Quality of Vision', getFieldValue('qualityOfVision'));
    addKV('Onset/Progression', getFieldValue('onsetOfSymptoms') || getFieldValue('onsetOfSymptomsSelect'));
    addKV('Laterality', getFieldValue('laterality'));
    addKV('Severity', getFieldValue('severity'));
    addKV('History of Present Illness (HPI)', getTextAreaValue('hpi'));
    addKV('Associated Symptoms', getCheckedCheckboxes('associatedSymptoms') || getCheckedCheckboxes('associatedSymptoms[]'));

    // --- History ---
    addSectionTitle('History');
    addKV('Past Ocular History (POH)', getTextAreaValue('poh'));
    addKV('Past Medical History (PMH)', getTextAreaValue('pmh'));
    addKV('Allergies', getTextAreaValue('allergies_details') || getTextAreaValue('allergies'));
    addKV('Allergy Severity', getFieldValue('allergySeverity'));
    addKV('Ocular Medications', getTextAreaValue('ocularMedications'));
    addKV('Systemic Medications', getTextAreaValue('systemicMedications'));
    addKV('Family Ocular History', getTextAreaValue('foh'));
    addKV('Family Medical History', getTextAreaValue('fmh'));
    addKV('Social History', getTextAreaValue('socialHistory'));
    addKV('Smoking Status', getFieldValue('smokingStatus'));
    addKV('Packs/Day', getTextInputValue('packsPerDay'));
    addKV('Years Smoked', getTextInputValue('yearsSmoked'));
    addKV('Alcohol Consumption', getFieldValue('alcoholConsumption'));
    addKV('Recreational Drug Use', getFieldValue('recreationalDrugUse'));
    addKV('Sleep Patterns', getTextAreaValue('sleepPatterns'));
    addKV('Exposure History', getTextAreaValue('exposureHistory'));
    addKV('Birth History', getTextAreaValue('birthHistory'));
    // ROS
    let ocularROS = getFieldValue('ocularROS_status') || getFieldValue('ocularROS');
    if (ocularROS && ocularROS === 'Not WNL') {
      const details = getTextAreaValue('ocularROS_details');
      if (details) ocularROS += `: ${details}`;
    }
    addKV('Ocular ROS', ocularROS);
    let systemicROS = getFieldValue('systemicROS_status') || getFieldValue('systemicROS');
    if (systemicROS && systemicROS === 'Not WNL') {
      const details = getTextAreaValue('systemicROS_details');
      if (details) systemicROS += `: ${details}`;
    }
    addKV('Systemic ROS', systemicROS);

    // --- Examination ---
    addSectionTitle('Examination');

    // Visual Acuity and early eye groups printed in two-column format
    addEyeGroup('UCVA', getTextInputValue('vaUncorrectedOD'), getTextInputValue('vaUncorrectedOS'), getTextInputValue('vaUncorrectedOU'));
    addEyeGroup('BCVA (with current Rx / PH)', getTextInputValue('vaBestCorrectedOD') || getTextInputValue('vaBestCorrectedOD_withRx'), getTextInputValue('vaBestCorrectedOS') || getTextInputValue('vaBestCorrectedOS_withRx'), getTextInputValue('vaBestCorrectedOU'));
    addEyeGroup('Near VA', getTextInputValue('vaNearOD'), getTextInputValue('vaNearOS'), getTextInputValue('vaNearOU'));
    addEyeGroup('Glare Acuity', getTextInputValue('glareAcuityOD'), getTextInputValue('glareAcuityOS'), getTextInputValue('glareAcuityOU'));
    addEyeGroup('Contrast Sensitivity', getTextInputValue('contrastSensitivityOD'), getTextInputValue('contrastSensitivityOS'), getTextInputValue('contrastSensitivityOU'));

    addKV('Pupils', (() => {
      const p = getFieldValue('pupils') || getFieldValue('pupilsNeuro') || getFieldValue('pupilsGeneral');
      if (p && !/PERRLA/i.test(p)) {
        const d = getTextAreaValue('pupils_details');
        return d ? `${p}: ${d}` : p;
      }
      return p || '';
    })());
    addKV('Extraocular Motility (EOMs)', (() => {
      const e = getFieldValue('eoms') || getTextAreaValue('eoms') || getTextInputValue('eomsGeneral');
      if (e && !/Full and Smooth|WNL/i.test(e)) {
        const d = getTextAreaValue('eoms_details');
        return d ? `${e}: ${d}` : e;
      }
      return e || '';
    })());
    addKV('Cover Test (Distance)', getTextInputValue('coverTestDistance'));
    addKV('Cover Test (Near)', getTextInputValue('coverTestNear'));
    addKV('Stereopsis', (() => {
      const s = getFieldValue('stereopsis') || getTextInputValue('stereopsis');
      const sd = getTextInputValue('stereopsis_details');
      return s ? (sd ? `${s}: ${sd}` : s) : '';
    })());
    addKV('Color Vision', (() => {
      const c = getFieldValue('colorVision') || getFieldValue('colorVisionGeneral');
      const cd = getTextInputValue('colorVision_details');
      return c ? (cd ? `${c}: ${cd}` : c) : '';
    })());

    // Amsler grid
    addEyeGroup('Amsler Grid', getEyeString('amslerGrid', 'OD') || getEyeString('amsler', 'OD', '', ''), getEyeString('amslerGrid', 'OS') || getEyeString('amsler', 'OS', '', ''));

    addKV('Lid Position', getFieldValue('lidPosition'));
    addKV('Lid Margin Health', getFieldValue('lidMarginHealth'));
    addEyeGroup('Tear Meniscus Height', getTextInputValue('tearMeniscusHeightOD'), getTextInputValue('tearMeniscusHeightOS'));

    addEyeGroup('Lids & Lashes', getEyeString('lidsLashes', 'OD', '', ''), getEyeString('lidsLashes', 'OS', '', ''));
    addEyeGroup('Conjunctiva & Sclera', getEyeString('conjunctivaSclera', 'OD', '', ''), getEyeString('conjunctivaSclera', 'OS', '', ''));

    addEyeGroup('Conjunctival Injection', getFieldValue('conjunctivalInjectionOD'), getFieldValue('conjunctivalInjectionOS'));

    addEyeGroup('Cornea', getEyeString('cornea', 'OD', '', ''), getEyeString('cornea', 'OS', '', ''));
    addEyeGroup('Anterior Chamber', getEyeString('anteriorChamber', 'OD', '', ''), getEyeString('anteriorChamber', 'OS', '', ''));

    addEyeGroup('AC Depth (Van Herick)', getTextInputValue('acDepthOD'), getTextInputValue('acDepthOS'));

    addEyeGroup('Iris', getEyeString('iris', 'OD', '', ''), getEyeString('iris', 'OS', '', ''));

    // Lens needs special handling for opacity location
    const lensOD_status = getFieldValue('lensOD_status') || getFieldValue('lensOD');
    const lensOD_details = getTextAreaValue('lensOD_details');
    const lensOD_loc = getFieldValue('lensOD_opacityLocation');
    let lensOD_val = (lensOD_status && lensOD_status.trim() !== '') ? (lensOD_details && lensOD_details.trim() !== '' ? `${lensOD_status}: ${lensOD_details}` : lensOD_status) : (lensOD_details || '');
    if (lensOD_val && lensOD_loc) lensOD_val += ` (${lensOD_loc})`;

    const lensOS_status = getFieldValue('lensOS_status') || getFieldValue('lensOS');
    const lensOS_details = getTextAreaValue('lensOS_details');
    const lensOS_loc = getFieldValue('lensOS_opacityLocation');
    let lensOS_val = (lensOS_status && lensOS_status.trim() !== '') ? (lensOS_details && lensOS_details.trim() !== '' ? `${lensOS_status}: ${lensOS_details}` : lensOS_status) : (lensOS_details || '');
    if (lensOS_val && lensOS_loc) lensOS_val += ` (${lensOS_loc})`;

    addEyeGroup('Lens', lensOD_val, lensOS_val);

    // Gonioscopy - grouped manually because it has multiple KVs per eye
    const odGonioscopyPerformed = getFieldValue('gonioscopyPerformedOD');
    const odGonioscopyDetails = getTextAreaValue('gonioscopyOD');
    const osGonioscopyPerformed = getFieldValue('gonioscopyPerformedOS');
    const osGonioscopyDetails = getTextAreaValue('gonioscopyOS');

    if (odGonioscopyPerformed || odGonioscopyDetails || osGonioscopyPerformed || osGonioscopyDetails) {
      addBoldGroupHeading('Gonioscopy');
      addIndentedEyeKV('OD Performed?', odGonioscopyPerformed);
      addIndentedEyeKV('OD Details', odGonioscopyDetails);
      addIndentedEyeKV('OS Performed?', osGonioscopyPerformed);
      addIndentedEyeKV('OS Details', osGonioscopyDetails);
      checkPageBreak(OD_OS_GROUP_POST_SPACING);
      y += OD_OS_GROUP_POST_SPACING;
    }

    addKV('IOP Method', getFieldValue('iopMethod'));
    addEyeGroup('Intraocular Pressure (IOP)', getTextInputValue('iopOD'), getTextInputValue('iopOS'));

    addKV('Confrontation Visual Fields (CVF)', getTextAreaValue('cvf'));

    // Refraction & Prescription
    addSectionTitle('Refraction & Prescription');
    addEyeGroup('Auto-Refractor', getTextInputValue('autoRefractorOD'), getTextInputValue('autoRefractorOS'));
    addEyeGroup('Manifest Refraction', getTextInputValue('manifestRefractionOD'), getTextInputValue('manifestRefractionOS'));
    addEyeGroup('BCVA with MRx', getTextInputValue('bcvaMrxOD'), getTextInputValue('bcvaMrxOS'));
    addEyeGroup('Cycloplegic Refraction', getTextInputValue('cycloplegicRefractionOD'), getTextInputValue('cycloplegicRefractionOS'));

    addKV('Lens Type (Current/New)', getFieldValue('lensType'));

    // Prism - grouped manually
    const prismODDiopters = getTextInputValue('prismDioptersOD');
    const prismODBase = getFieldValue('prismBaseOD');
    const prismOSDiopters = getTextInputValue('prismDioptersOS');
    const prismOSBase = getFieldValue('prismOSBase');

    if (prismODDiopters || prismODBase || prismOSDiopters || prismOSBase) {
      addBoldGroupHeading('Prism');
      addIndentedEyeKV('OD Diopters', prismODDiopters);
      addIndentedEyeKV('OD Base', prismODBase);
      addIndentedEyeKV('OS Diopters', prismOSDiopters);
      addIndentedEyeKV('OS Base', prismOSBase);
      checkPageBreak(OD_OS_GROUP_POST_SPACING);
      y += OD_OS_GROUP_POST_SPACING;
    }

    // Posterior segment / DFE
    addSectionTitle('Posterior Segment Examination (DFE)');
    addEyeGroup('Vitreous', getEyeString('vitreous', 'OD', '', ''), getEyeString('vitreous', 'OS', '', ''));
    addEyeGroup('Optic Disc', getEyeString('opticDisc', 'OD', '', ''), getEyeString('opticDisc', 'OS', '', ''));
    addEyeGroup('Cup/Disc Ratio', getTextInputValue('cupDiscRatioOD'), getTextInputValue('cupDiscRatioOS'));
    addEyeGroup('Optic Disc Hemorrhage', getFieldValue('discHemorrhageOD'), getFieldValue('discHemorrhageOS'));
    addEyeGroup('RNFL Appearance', getFieldValue('rnflAppearanceOD'), getFieldValue('rnflAppearanceOS'));
    addEyeGroup('Macula', getEyeString('macula', 'OD', '', ''), getEyeString('macula', 'OS', '', ''));
    addEyeGroup('Macular Pigment (RPE)', getFieldValue('macularPigmentOD'), getFieldValue('macularPigmentOS'));
    addEyeGroup('Vessels', getEyeString('vessels', 'OD', '', ''), getEyeString('vessels', 'OS', '', ''));
    addEyeGroup('Vessel Tortuosity/Sheathing', getFieldValue('vesselTortuosityOD'), getFieldValue('vesselTortuosityOS'));
    addEyeGroup('Periphery (Dilated)', getEyeString('periphery', 'OD', '', ''), getEyeString('periphery', 'OS', '', ''));

    // Peripheral Lesion
    addEyeGroup('Peripheral Lesion', getEyeString('peripheralLesion', 'OD', '', '_details'), getEyeString('peripheralLesion', 'OS', '', '_details'));

    // Investigations
    addSectionTitle('Investigations');
    addKV('OCT Findings', getTextAreaValue('octFindings'));
    addKV('Visual Field Findings', getTextAreaValue('visualFieldFindings'));
    addKV('Fundus Photography Findings', getTextAreaValue('fundusPhotographyFindings'));
    addKV('Corneal Topography Findings', getTextAreaValue('cornealTopographyFindings'));
    addEyeGroup(
      'Pachymetry (CCT)',
      getTextInputValue('pachymetryOD') ? `${getTextInputValue('pachymetryOD')} microns` : '',
      getTextInputValue('pachymetryOS') ? `${getTextInputValue('pachymetryOS')} microns` : ''
    );
    addKV('Specular Microscopy', getTextAreaValue('specularMicroscopy'));
    addKV('Meibography', getTextAreaValue('meibography'));
    addKV('Dry Eye Specific Tests', getTextAreaValue('dryEyeTests'));
    addKV('Fundus Autofluorescence (FAF)', getTextAreaValue('fundusAutofluorescence'));
    addKV('Other Investigations', getTextAreaValue('otherInvestigations'));

    // Assessment & Plan
    addSectionTitle('Assessment & Plan');
    addKV('Assessment / Diagnoses', getTextAreaValue('assessmentDiagnoses'));
    addKV('Plan', getTextAreaValue('plan'));
    addKV('Prognosis (Overall)', getTextAreaValue('prognosis'));
    addKV('Follow Up Instructions', getTextAreaValue('followUpInstructions'));

    // Notes & Reflection
    addSectionTitle('Notes & Reflection');
    addKV('Internal Notes', getTextAreaValue('internalNotes'));
    addKV('Personal Reflection / Learning Points', getTextAreaValue('notesReflection'));

    // Finalise PDF
    addFooter();
    const patientName = (getFieldValue('patientName') || 'Untitled').replace(/\s+/g, '-');
    const fileName = `GeneralCase-${patientName}.pdf`;
    doc.save(fileName);
  });
});

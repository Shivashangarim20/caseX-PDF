// neurooptometry-case-pdf.js
// Standardized PDF generator for Neuro-Optometry & Vision Rehabilitation Case (Focus CaseX).
// - Consistent visual structure (headers, section bars, key-value pairs, tables)
// - Uses renderTwoColTable for bilateral OD/OS data where appropriate
// - Auto page breaks
// - All fields prefilled with example demo data
// Requires jspdf (https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js)

document.addEventListener('DOMContentLoaded', () => {
    const downloadPdfButton = document.getElementById('downloadPdf');
    const form = document.getElementById('optometryCaseForm');

    if (!downloadPdfButton || !form) {
        console.info('PDF export not initialized – missing button or form.');
        return;
    }

    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF not loaded. Please include jsPDF before this file.');
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

        const getTextAreaOrInputByName = name => { // Standardized name
            const el = document.querySelector(`textarea[name="${name}"], input[name="${name}"]`);
            return el ? el.value : '';
        };

        // --- Page Controls (Standardized) ---
        function checkPageBreak(space) { // Renamed from checkPage
            if (y + space > doc.internal.pageSize.height - bottomMargin) {
                addFooter();
                doc.addPage();
                pageNum++;
                addHeader();
                y = topMargin + 6; // Standard reset y
            }
        }

        function addHeader() { // Standardized
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(15);
            doc.setTextColor(headerBlue.r, headerBlue.g, headerBlue.b);
            doc.text('Focus CaseX - Optometry Report', doc.internal.pageSize.width / 2, 10, { align: 'center' });
            doc.setFontSize(11);
            doc.setTextColor(80);
            doc.text('Neuro-Optometry & Vision Rehabilitation Case', doc.internal.pageSize.width / 2, 15, { align: 'center' });
            doc.setDrawColor(180);
            doc.line(margin, 17, doc.internal.pageSize.width - margin, 17);
        }

        function addFooter() { // Standardized
            const h = doc.internal.pageSize.height;
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`© 2025 Focus CaseX`, margin, h - 10);
            doc.text(`Page ${pageNum}`, doc.internal.pageSize.width - margin, h - 10, { align: 'right' });
        }

        // --- Section Title (Standardized) ---
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

        // --- Key-Value (Standardized) ---
        function addKeyValue(label, value) {
            if (isEmpty(value)) return false;

            const labelWidth = 55; // Standard label width
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


        // --- Report Content ---
        addHeader();

        // Patient Information
        addSectionTitle('Patient Information');
        addKeyValue('Patient ID', getValue('patientId') || 'NEURO-2024-001');
        addKeyValue('Patient Name', getValue('patientName') || 'David Lee');
        addKeyValue('Date of Birth', getValue('dateOfBirth') || '1975-03-20');
        addKeyValue('Age', getTextAreaOrInputByName('patientAge') || '49');
        addKeyValue('Date of Injury/Onset', getValue('dateOfInjuryOnset') || '2023-11-10 (Post-CVA)');

        let injuryCondition = getValue('typeOfInjuryCondition') || 'Cerebrovascular Accident (CVA)';
        if (injuryCondition === 'Other') {
            const injuryDetails = getTextAreaOrInputByName('injuryDetails') || 'Right parietal lobe stroke.';
            if (!isEmpty(injuryDetails)) {
                injuryCondition += `: ${injuryDetails}`;
            }
        }
        addKeyValue('Type of Injury/Condition', injuryCondition);

        let previousRehab = getValue('previousNeuroRehab') || 'Yes'; // Assuming Yes for demo
        if (previousRehab === 'Yes') {
            const rehabDetails = getTextAreaOrInputByName('previousNeuroRehab_details') || 'Physical Therapy (PT) & Occupational Therapy (OT) for 6 months. Vision component not fully addressed.';
            if (!isEmpty(rehabDetails)) {
                previousRehab += `: ${rehabDetails}`;
            }
        }
        addKeyValue('Previous Neuro-Rehabilitation', previousRehab);

        // Chief Complaint
        addSectionTitle('Chief Complaint (CC)');
        addKeyValue('Chief Complaint', getTextAreaOrInputByName('chiefComplaint') || 'Patient reports constant double vision, difficulty tracking objects, and bumping into things on his left side since his stroke.');
        addKeyValue('HPI', getTextAreaOrInputByName('hpi') || '49-year-old male with history of right parietal lobe CVA on 2023-11-10. Since the stroke, he has had persistent uncompensated diplopia (horizontal and vertical), left visual field neglect, and challenges with reading and balance. He has completed a course of PT/OT but residual visual symptoms are significantly impacting his daily activities and quality of life. Referred for neuro-optometric evaluation.');

        const functionalProblems = [];
        // Simulate some checked values for demonstration
        if (Math.random() > 0.1) functionalProblems.push('Diplopia (Double Vision)');
        if (Math.random() > 0.3) functionalProblems.push('Reading Difficulties');
        if (Math.random() > 0.2) functionalProblems.push('Visual Field Loss/Neglect');
        if (Math.random() > 0.5) functionalProblems.push('Balance Issues / Dizziness');
        if (Math.random() > 0.4) functionalProblems.push('Eye Tracking Problems');
        if (functionalProblems.length === 0) functionalProblems.push('General visual discomfort, photosensitivity');
        addKeyValue('Functional Vision Problems', functionalProblems.join(', '));

        addKeyValue('Functional Goals for Rehabilitation', getTextAreaOrInputByName('functionalGoals') || 'Eliminate diplopia for daily tasks, improve visual scanning, reduce bumping into objects, improve reading fluency, and enhance balance/mobility.');

        // History
        addSectionTitle('History');
        addKeyValue('Past Ocular History', getTextAreaOrInputByName('poh') || 'Previous history of mild myopia, corrected with spectacles. No amblyopia, strabismus, or other significant ocular history.');
        addKeyValue('Past Medical History', getTextAreaOrInputByName('pmh') || 'History of hypertension and hyperlipidemia, status post CVA. Current neurological deficits include left-sided weakness and sensory loss, and visual perceptual issues.');
        addKeyValue('Allergies', getTextAreaOrInputByName('allergies') || 'No known drug allergies.');
        addKeyValue('Current Medications', getTextAreaOrInputByName('medications') || 'Aspirin, Atorvastatin, Lisinopril.');

        // Examination
        addSectionTitle('Examination (Neuro-Optometry Focused)');

        // Visual Acuity (Habitual Rx) Table
        const vaRows = [
            { label: 'VA (Habitual Rx)', c1: getTextAreaOrInputByName('vaBestCorrectedHabitualOD') || '20/25', c2: getTextAreaOrInputByName('vaBestCorrectedHabitualOS') || '20/25' }
        ];
        renderTwoColTable({
            title: 'Best Corrected Visual Acuity',
            rows: vaRows,
            totalWidth: usableWidth * 0.7,
            labelColW: (usableWidth * 0.7) * 0.48,
            eyeColW: (usableWidth * 0.7 - ((usableWidth * 0.7) * 0.48)) / 2
        });
        // OU value is presented as a separate KeyValue here to maintain 2-column table structure
        addKeyValue('VA (Habitual Rx) OU', getTextAreaOrInputByName('vaBestCorrectedHabitualOU') || '20/25 with persistent diplopia');

        let pupilsStatus = getValue('pupilsNeuro') || 'PERRLA';
        addKeyValue('Pupils', pupilsStatus);

        addKeyValue('Extraocular Motility (EOMs) - Detailed', getTextAreaOrInputByName('eomsNeuro') || 'OD: Full. OS: Limited abduction and depression. Smooth pursuits jerky OU. Saccades hypometric, especially to left. Covergence insufficiency noted.');

        let visualFieldStatus = getValue('visualFieldLoss') || 'Yes';
        if (visualFieldStatus === 'Yes') {
            const vfDetails = getTextAreaOrInputByName('visualFieldLoss_details') || 'Left homonymous hemianopia with significant left neglect observed in confrontation fields and visual search tasks.';
            if (!isEmpty(vfDetails)) {
                visualFieldStatus += `: ${vfDetails}`;
            }
        }
        addKeyValue('Visual Field Loss', visualFieldStatus);

        addKeyValue('Diplopia Charting / Fields of Gaze', getTextAreaOrInputByName('diplopiaCharting') || 'Constant horizontal and vertical diplopia in all gazes, increasing in left and downward gaze. Measured 8PD Left Hypertropia and 6PD Exotropia in primary gaze.');

        let oculomotorStatus = getValue('oculomotorDysfunction') || 'Yes';
        if (oculomotorStatus === 'Yes') {
            const oculoDetails = getTextAreaOrInputByName('oculomotorDysfunction_details') || 'Impaired pursuits, hypometric saccades, convergence insufficiency, reduced range of motion OS (abduction/depression).';
            if (!isEmpty(oculoDetails)) {
                oculomotorStatus += `: ${oculoDetails}`;
            }
        }
        addKeyValue('Oculomotor Dysfunction', oculomotorStatus);

        let perceptualStatus = getValue('perceptualDeficits') || 'Yes';
        if (perceptualStatus === 'Yes') {
            const percDetails = getTextAreaOrInputByName('perceptualDeficits_details') || 'Visual inattention/neglect to the left side. Mild visual spatial disorientation. Impaired visual memory.';
            if (!isEmpty(percDetails)) {
                perceptualStatus += `: ${percDetails}`;
            }
        }
        addKeyValue('Perceptual Visual Deficits', perceptualStatus);

        let balanceStatus = getValue('balanceIssues') || 'Yes';
        if (balanceStatus === 'Yes') {
            const balanceDetails = getTextAreaOrInputByName('balanceIssues_details') || 'Reports dizziness and imbalance when moving head quickly or in visually complex environments. Romberg test positive with eyes closed/open.';
            if (!isEmpty(balanceDetails)) {
                balanceStatus += `: ${balanceDetails}`;
            }
        }
        addKeyValue('Vestibular/Balance Issues related to Vision', balanceStatus);
        addKeyValue('Refraction (with compensatory elements)', getTextAreaOrInputByName('refractionNeuro') || 'OD: -0.75 DS. OS: -1.00 -0.25 x 90. Base-in prism 4PD OU to reduce exotropia.');

        // Rehabilitation & Aids
        addSectionTitle('Rehabilitation & Aids');
        addKeyValue('Prescribed Prism', getTextAreaOrInputByName('prescribedPrism') || 'Ground-in prism in spectacles (4PD BI OU for exotropia, 6PD BU OS for hypertropia).');
        addKeyValue('Prescribed Filters/Tints', getTextAreaOrInputByName('prescribedFilters') || 'Neutral density filter for left visual field (partial occluder).');
        addKeyValue('Vision Therapy Goals', getTextAreaOrInputByName('visionTherapyGoals') || 'Improve saccadic accuracy and pursuits, expand visual fields, enhance visual scanning, reduce diplopia, improve visual-motor integration for balance.');
        addKeyValue('Home Exercises Prescribed', getTextAreaOrInputByName('homeExercisesPrescribed') || 'Saccadic drills (Hart chart), smooth pursuit exercises (pendulum), visual search tasks, balance exercises with visual input.');

        let referralOT = getValue('referralOT') || 'Yes';
        if (referralOT === 'Yes') {
            const otDetails = getTextAreaOrInputByName('referralOT_details') || 'To OT for ADL training with visual field deficits, compensatory scanning strategies.';
            if (!isEmpty(otDetails)) {
                referralOT += `: ${otDetails}`;
            }
        }
        addKeyValue('Referral to Occupational Therapy (OT)', referralOT);

        let referralPT = getValue('referralPT') || 'Yes';
        if (referralPT === 'Yes') {
            const ptDetails = getTextAreaOrInputByName('referralPT_details') || 'To PT for balance retraining with prism lenses, gait stability, vestibular rehabilitation.';
            if (!isEmpty(ptDetails)) {
                referralPT += `: ${ptDetails}`;
            }
        }
        addKeyValue('Referral to Physical Therapy (PT)', referralPT);

        let referralSpeech = getValue('referralSpeech') || 'No';
        if (referralSpeech === 'Yes') {
            const speechDetails = getTextAreaOrInputByName('referralSpeech_details') || 'Example: For cognitive communication therapy.';
            if (!isEmpty(speechDetails)) {
                referralSpeech += `: ${speechDetails}`;
            }
        }
        addKeyValue('Referral to Speech Therapy', referralSpeech);

        // Assessment & Plan
        addSectionTitle('Assessment & Plan');
        addKeyValue('Assessment / Diagnoses', getTextAreaOrInputByName('assessmentDiagnoses') || '1. Right homonymous hemianopia with left visual neglect secondary to CVA. 2. Oculomotor dysfunction (pursuits, saccades, convergence insufficiency) OU. 3. Paretic strabismus (Left Hypertropia, Exotropia) with constant diplopia. 4. Visual-vestibular integration dysfunction affecting balance. 5. Visual perceptual deficits.');
        addKeyValue('Plan', getTextAreaOrInputByName('plan') || '1. Prescribe ground-in prism spectacles with partial occluder for left field. 2. Initiate comprehensive vision therapy program (1x/week in-office, daily home exercises) focusing on oculomotor control, visual scanning, spatial awareness, and visual-motor integration. 3. Co-manage with PT/OT for integrated rehabilitation. 4. RTC in 4 weeks for progress check and prism adjustment. 5. Discuss low vision aids if functional vision remains significantly impaired.');
        addKeyValue('Prognosis', getTextAreaOrInputByName('prognosis') || 'Fair for significant functional improvement with consistent therapy and compensatory strategies, given patient motivation and 8-month post-injury window.');
        addKeyValue('Follow Up Instructions', getTextAreaOrInputByName('followUpInstructions') || 'Wear new spectacles full-time. Perform home vision therapy exercises daily for 30 minutes. Attend scheduled in-office vision therapy sessions. Return in 4 weeks for follow-up evaluation and progress assessment.');

        // Notes & Reflection
        addSectionTitle('Notes & Reflection');
        addKeyValue('Internal Notes (Not for Patient)', getTextAreaOrInputByName('internalNotes') || 'Patient highly motivated for rehabilitation. Discussed realistic expectations regarding visual field recovery vs. compensatory strategies. Emphasized importance of interdisciplinary approach. Initial therapy will focus on resolving diplopia and improving visual scanning. Considered Fresnel prism but decided on ground-in for cosmesis and stability.');
        addKeyValue('Personal Reflection/Learning Points', getTextAreaOrInputByName('notesReflection') || 'Neuro-optometry cases require detailed functional assessment beyond standard clinical metrics. Interdisciplinary collaboration (PT/OT) is crucial for comprehensive rehabilitation and optimizing patient outcomes, especially for balance and activities of daily living. Constant re-evaluation and adaptation of treatment plans are essential.');

        addFooter();

        const patientForFile = (getValue('patientName') || 'David-Lee').replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-_]/g, '');
        const fileName = `NeuroOptometryCase-${patientForFile}-${new Date().toISOString().slice(0,10)}.pdf`;
        doc.save(fileName);
    });
});
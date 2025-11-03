// followup-case-pdf.js
// Focus CaseX - Follow-up Case PDF Export (Standardized section bars & VA table)
document.addEventListener('DOMContentLoaded', () => {
    const downloadPdfButton = document.getElementById('downloadPdf');
    const form = document.getElementById('optometryCaseForm');

    if (!downloadPdfButton || !form) {
        console.info('No "Download PDF" button or form found on this page. PDF export handler not initialized.');
        return;
    }

    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF library not loaded. PDF export functionality will not work. Ensure CDN link is in HTML <head>.');
        return;
    }

    downloadPdfButton.addEventListener('click', () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4'); // portrait, millimeters, A4

        // -------------------------
        // Layout constants & state
        // -------------------------
        const pageMargin = 15;
        const topMargin = 16;
        const bottomMargin = 18;
        const defaultLineHeight = 5;     // base for 10pt
        const smallLineHeight = 4.5;     // slightly tighter spacing for compact rows
        const tableCellPadding = 2;
        let yPos = topMargin;
        let pageNumber = 1;

        // -------------------------
        // Helpers: safe access to DOM values
        // -------------------------
        const isEmpty = v => !v || String(v).trim() === '' || v === 'Select...' || v === 'N/A' || v === '-';

        const getById = id => document.getElementById(id) || null;
        const getValue = id => {
            const el = getById(id);
            if (!el) return '';
            const tag = el.tagName ? el.tagName.toUpperCase() : '';
            if (tag === 'SELECT') return el.value !== 'Select...' ? el.value : '';
            if (el.type === 'radio') {
                const checked = document.querySelector(`input[name="${el.name}"]:checked`);
                return checked ? checked.value : '';
            }
            if (el.type === 'checkbox') {
                const group = document.querySelectorAll(`input[name="${el.name}"]`);
                if (group && group.length > 1) {
                    return Array.from(group).filter(g => g.checked).map(g => g.value).join(', ');
                }
                return el.checked ? (el.value || 'Yes') : 'No';
            }
            return el.value || '';
        };

        const getTextByName = name => {
            const el = document.querySelector(`textarea[name="${name}"], input[name="${name}"]`);
            return el ? el.value : '';
        };

        const getTextAreaByName = name => {
            const el = document.querySelector(`textarea[name="${name}"]`);
            return el ? el.value : '';
        };

        const getCheckedList = name => {
            const boxes = document.querySelectorAll(`input[name="${name}"]:checked`);
            if (!boxes || boxes.length === 0) return '';
            return Array.from(boxes).map(b => b.value).join(', ');
        };

        // -------------------------
        // Pagination helpers
        // -------------------------
        function addHeader() {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(15);
            doc.setTextColor(0, 77, 128);
            doc.text('Focus CaseX - Optometry Report', doc.internal.pageSize.width / 2, 10, { align: 'center' });
            doc.setFontSize(11);
            doc.setTextColor(80);
            doc.text('Follow-up Case', doc.internal.pageSize.width / 2, 15, { align: 'center' });
            doc.setDrawColor(180);
            doc.line(pageMargin, 17, doc.internal.pageSize.width - pageMargin, 17);
            yPos = topMargin + 6; // leave a small gap after header
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(0);
        }

        function addFooter() {
            const h = doc.internal.pageSize.height;
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(`© 2025 Focus CaseX`, pageMargin, h - 10);
            doc.text(`Page ${pageNumber}`, doc.internal.pageSize.width - pageMargin, h - 10, { align: 'right' });
        }

        function checkPageBreak(spaceNeeded) {
            if (yPos + spaceNeeded > doc.internal.pageSize.height - bottomMargin) {
                addFooter();
                doc.addPage();
                pageNumber += 1;
                addHeader();
            }
        }

        // -------------------------
        // Section title (dark blue bar with white centered text)
        // Matches Emergency case style exactly (height ≈7)
        // -------------------------
        function addSectionTitle(title) {
            checkPageBreak(defaultLineHeight * 3 + 8);
            const startX = pageMargin;
            const totalWidth = doc.internal.pageSize.width - (2 * pageMargin);
            const barHeight = 7; // same as Emergency case
            doc.setFillColor(0, 77, 128); // dark blue #004D80
            doc.rect(startX, yPos, totalWidth, barHeight, 'F'); // filled bar
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(255);
            doc.text(title, startX + totalWidth / 2, yPos + 5, { align: 'center' });
            yPos += barHeight + 4; // gap after bar
            // reset for body text
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(0);
        }

        // -------------------------
        // Key/value helper
        // -------------------------
        function addKeyValue(label, value) {
            if (isEmpty(value)) return false;
            const labelW = 55;
            const valueW = doc.internal.pageSize.width - (pageMargin * 2) - labelW - 6;
            const labelLines = doc.splitTextToSize(label + ':', labelW);
            const valueLines = doc.splitTextToSize(String(value), valueW);
            const blockH = Math.max(labelLines.length, valueLines.length) * defaultLineHeight + 2;
            checkPageBreak(blockH + 4);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(labelLines, pageMargin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(valueLines, pageMargin + labelW + 6, yPos);
            yPos += blockH + 4;
            return true;
        }

        // -------------------------
        // Eye group (OD/OS side-by-side)
        // -------------------------
        function addEyeGroup(title, odValue, osValue, ouValue = '') {
            odValue = odValue ? String(odValue).trim() : '';
            osValue = osValue ? String(osValue).trim() : '';
            ouValue = ouValue ? String(ouValue).trim() : '';

            if (isEmpty(odValue) && isEmpty(osValue) && isEmpty(ouValue)) return;

            checkPageBreak(defaultLineHeight * 2 + 6);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(title, pageMargin, yPos);
            yPos += defaultLineHeight + 2;
            doc.setFont('helvetica', 'normal');

            const columnGap = 8;
            const usableWidth = doc.internal.pageSize.width - (pageMargin * 2);
            const colWidth = (usableWidth - columnGap) / 2;

            const odBlock = odValue ? doc.splitTextToSize(`OD: ${odValue}`, colWidth - 4) : [];
            const osBlock = osValue ? doc.splitTextToSize(`OS: ${osValue}`, colWidth - 4) : [];
            const maxLines = Math.max(odBlock.length, osBlock.length);
            const blockH = Math.max(1, maxLines) * defaultLineHeight + 4;

            checkPageBreak(blockH + 4);

            if (odBlock.length > 0) {
                doc.text(odBlock, pageMargin, yPos);
            }
            if (osBlock.length > 0) {
                doc.text(osBlock, pageMargin + colWidth + columnGap, yPos);
            }

            yPos += blockH + 4;

            if (!isEmpty(ouValue)) {
                const ouBlock = doc.splitTextToSize(`OU: ${ouValue}`, doc.internal.pageSize.width - (pageMargin * 2));
                checkPageBreak(ouBlock.length * defaultLineHeight + 4);
                doc.text(ouBlock, pageMargin, yPos);
                yPos += ouBlock.length * defaultLineHeight + 4;
            }
        }

        // -------------------------
        // Two-column table renderer (label | OD | OS)
        // Copied/adapted from Emergency case to ensure exact match
        // -------------------------
        function renderTwoColTable(opts) {
            const title = opts.title || '';
            const rows = opts.rows || [];
            const totalWidth = opts.totalWidth || (doc.internal.pageSize.width - (2 * pageMargin)) * 0.85;
            const startX = pageMargin + ((doc.internal.pageSize.width - (2 * pageMargin) - totalWidth) / 2);

            const labelColW = opts.labelColW || totalWidth * 0.45;
            const eyeColW = opts.eyeColW || (totalWidth - labelColW) / 2;
            const x1 = startX;
            const x2 = x1 + labelColW;
            const x3 = x2 + eyeColW;
            const x4 = x3 + eyeColW;

            // Title as dark-blue bar with white centered title (match Emergency case)
            if (title) {
                checkPageBreak(defaultLineHeight * 3 + 6);
                doc.setFillColor(0, 77, 128);
                doc.rect(startX, yPos, totalWidth, 7, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(11);
                doc.setTextColor(255);
                doc.text(title, startX + totalWidth / 2, yPos + 5, { align: 'center' });
                yPos += 11;
                // reset
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(0);
            }

            // Header background
            checkPageBreak(smallLineHeight * 3 + 6);
            const headerHeight = smallLineHeight + 4;
            doc.setFillColor(240, 240, 240);
            doc.rect(startX, yPos, totalWidth, headerHeight, 'F');
            doc.setDrawColor(180);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text('Type', x1 + 2, yPos + 3 + 1);
            doc.text('OD', x2 + eyeColW / 2, yPos + 3 + 1, { align: 'center' });
            doc.text('OS', x3 + eyeColW / 2, yPos + 3 + 1, { align: 'center' });
            yPos += headerHeight + 2;
            doc.line(startX, yPos, startX + totalWidth, yPos);

            // Rows
            const rowsStartY = yPos;
            rows.forEach(r => {
                const label = r.label || '';
                const c1 = isEmpty(r.c1) ? '' : String(r.c1);
                const c2 = isEmpty(r.c2) ? '' : String(r.c2);
                const c1Lines = doc.splitTextToSize(c1, eyeColW - 4);
                const c2Lines = doc.splitTextToSize(c2, eyeColW - 4);
                const labelLines = doc.splitTextToSize(label, labelColW - 4);
                const maxLines = Math.max(labelLines.length, c1Lines.length, c2Lines.length, 1);
                const rowH = maxLines * defaultLineHeight + 4;
                checkPageBreak(rowH + 4);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.text(labelLines, x1 + 2, yPos + 3);
                doc.text(c1Lines, x2 + eyeColW / 2, yPos + 3, { align: 'center' });
                doc.text(c2Lines, x3 + eyeColW / 2, yPos + 3, { align: 'center' });

                yPos += rowH;
                doc.line(startX, yPos, startX + totalWidth, yPos);
            });

            // Vertical borders
            const bottomY = yPos;
            doc.line(x1, rowsStartY - (smallLineHeight + 4) - 2, x1, bottomY);
            doc.line(x2, rowsStartY - (smallLineHeight + 4) - 2, x2, bottomY);
            doc.line(x3, rowsStartY - (smallLineHeight + 4) - 2, x3, bottomY);
            doc.line(x4, rowsStartY - (smallLineHeight + 4) - 2, x4, bottomY);

            yPos += 6; // small gap after table
        }

        // -------------------------
        // Begin PDF content
        // -------------------------
        addHeader();

        // Patient Information
        addSectionTitle('Patient Information');
        addKeyValue('Patient Name', getValue('patientName'));
        addKeyValue('Patient ID', getValue('patientId'));
        addKeyValue('Date of Visit', getValue('dateOfVisit'));
        addKeyValue('Previous Visit Date', getValue('previousVisitDate'));
        addKeyValue('Referencing Previous Case ID', getValue('referencingPreviousCaseId'));

        // Chief Complaint / Status Update
        addSectionTitle('Chief Complaint (CC) / Status Update');
        addKeyValue('Chief Complaint / Status Since Last Visit', getTextAreaByName('chiefComplaint'));
        addKeyValue('Compliance with Treatment', getTextAreaByName('complianceStatus'));
        addKeyValue('Any New Ocular Symptoms?', getTextAreaByName('newSymptoms'));
        addKeyValue('Condition Status (Overall)', getValue('conditionStatus'));
        let sideEffects = getValue('treatmentSideEffects');
        if (sideEffects === 'Yes') {
            const details = getTextAreaByName('treatmentSideEffects_details');
            if (!isEmpty(details)) sideEffects += `: ${details}`;
        }
        addKeyValue('Adverse Effects from Treatment?', sideEffects);

        // History Update
        addSectionTitle('History Update');
        addKeyValue('Changes in POH/PMH/Medications?', getTextAreaByName('changesInMedicalHistory'));
        addKeyValue('Changes in Social History?', getTextAreaByName('changesInSocialHistory'));
        addKeyValue('Current Spectacles Adequate?', getValue('spectaclesAdequate'));
        addKeyValue('Current Contact Lenses Adequate?', getValue('contactLensesAdequate'));

        // Examination (Focused)
        addSectionTitle('Examination (Focused)');

        // Visual Acuity table - using standardized renderTwoColTable (Emergency style)
        const vaRows = [
            { label: 'UCVA', c1: getValue('vaUncorrectedOD') || getTextByName('vaUncorrectedOD'), c2: getValue('vaUncorrectedOS') || getTextByName('vaUncorrectedOS') },
            { label: 'PH VA', c1: getValue('vaPinHoleOD') || getTextByName('vaPinHoleOD'), c2: getValue('vaPinHoleOS') || getTextByName('vaPinHoleOS') },
            { label: 'Near VA', c1: getValue('vaNearOD') || getTextByName('vaNearOD'), c2: getValue('vaNearOS') || getTextByName('vaNearOS') }
        ];

        renderTwoColTable({
            title: 'Visual Acuity',
            rows: vaRows,
            totalWidth: (doc.internal.pageSize.width - (2 * pageMargin)) * 0.7,
            labelColW: ((doc.internal.pageSize.width - (2 * pageMargin)) * 0.7) * 0.42,
            eyeColW: (((doc.internal.pageSize.width - (2 * pageMargin)) * 0.7) - (((doc.internal.pageSize.width - (2 * pageMargin)) * 0.7) * 0.42)) / 2
        });

        // Pupil & EOM
        let pupils = getValue('pupilsFollowup') || getTextByName('pupilsFollowup');
        if (!isEmpty(pupils) && pupils !== 'PERRLA') {
            const det = getTextAreaByName('pupilsFollowup_details');
            if (!isEmpty(det)) pupils += `: ${det}`;
        }
        addKeyValue('Pupils', pupils);

        let eoms = getValue('eomsFollowup') || getTextByName('eomsFollowup');
        if (!isEmpty(eoms) && eoms !== 'Full and Smooth') {
            const det = getTextAreaByName('eomsFollowup_details');
            if (!isEmpty(det)) eoms += `: ${det}`;
        }
        addKeyValue('EOMs / Diplopia', eoms);

        // IOP Table (kept as in your follow-up script)
        addSectionTitle('Intraocular Pressure (IOP)');
        const iopRows = [
            { label: 'OD', c1: getValue('iopOD') || getTextByName('iopOD'), c2: '' },
            { label: 'OS', c1: getValue('iopOS') || getTextByName('iopOS'), c2: '' }
        ];

        // reuse renderTwoColTable with a narrower width for single-column values
        renderTwoColTable({
            title: '', // no bar, since addSectionTitle already added
            rows: iopRows,
            totalWidth: (doc.internal.pageSize.width - (2 * pageMargin)) * 0.6,
            labelColW: ((doc.internal.pageSize.width - (2 * pageMargin)) * 0.6) * 0.35,
            eyeColW: (((doc.internal.pageSize.width - (2 * pageMargin)) * 0.6) - (((doc.internal.pageSize.width - (2 * pageMargin)) * 0.6) * 0.35)) / 2
        });

        addKeyValue('Globe Rupture Suspected?', getValue('globeRuptureSuspected'));
        addKeyValue('IOP Method', getValue('iopMethodFollowup'));
        addKeyValue('IOP Consistency (Palpation)', getValue('iopConsistencyFollowup'));

        // Slit lamp / Anterior segment findings
        addKeyValue('Slit Lamp Exam (Anterior Segment)', getTextAreaByName('slitLampFollowup'));

        // Corneal findings, Seidel, AC, Iris, Lens
        let corneaOD = getValue('cornealFindingOD');
        if (corneaOD && corneaOD !== 'Clear') {
            const d = getTextByName('cornealFindingOD_details') || getTextByName('cornealFindingOD_details');
            if (!isEmpty(d)) corneaOD += `: ${d}`;
        }
        addKeyValue('Corneal Finding OD', corneaOD);

        let corneaOS = getValue('cornealFindingOS');
        if (corneaOS && corneaOS !== 'Clear') {
            const d = getTextByName('cornealFindingOS_details') || getTextByName('cornealFindingOS_details');
            if (!isEmpty(d)) corneaOS += `: ${d}`;
        }
        addKeyValue('Corneal Finding OS', corneaOS);

        addKeyValue('Seidel Test OD', getValue('seidelTestOD'));
        addKeyValue('Seidel Test OS', getValue('seidelTestOS'));
        addKeyValue('Anterior Chamber OD', getValue('acFindingOD'));
        addKeyValue('Anterior Chamber OS', getValue('acFindingOS'));
        addKeyValue('Iris OD', getValue('irisFindingOD'));
        addKeyValue('Iris OS', getValue('irisFindingOS'));
        addKeyValue('Lens OD', getValue('lensFindingOD'));
        addKeyValue('Lens OS', getValue('lensFindingOS'));

        // Posterior segment
        addKeyValue('Posterior Segment Exam (DFE)', getTextAreaByName('posteriorSegmentFollowup'));
        addKeyValue('Vitreous Hemorrhage OD', getValue('vitreousHemorrhageOD'));
        addKeyValue('Vitreous Hemorrhage OS', getValue('vitreousHemorrhageOS'));
        addKeyValue('Retinal Finding OD', getValue('retinalFindingOD'));
        addKeyValue('Retinal Finding OS', getValue('retinalFindingOS'));

        // Investigations
        addSectionTitle('Investigations');
        addKeyValue('OCT Findings', getTextAreaByName('octFollowup'));
        addKeyValue('OCT RNFL/GCC Change', getValue('octRnflChange'));
        addKeyValue('Visual Field Findings', getTextAreaByName('visualFieldFollowup'));
        addKeyValue('Visual Field MD/PSD Change', getTextByName('visualFieldMdChange'));
        addKeyValue('Macular Edema Status', getValue('macularEdemaStatus'));
        addKeyValue('Other Investigations', getTextAreaByName('otherInvestigationsFollowup'));

        // Assessment & Plan
        addSectionTitle('Assessment & Plan');
        addKeyValue('Assessment / Diagnoses (Current Status)', getTextAreaByName('assessmentDiagnoses'));
        addKeyValue('Plan / Adjustments', getTextAreaByName('plan'));
        addKeyValue('Patient Education Provided/Reinforced', getTextAreaByName('patientEducationProvided'));
        addKeyValue('Prognosis', getTextAreaByName('prognosis'));
        addKeyValue('Follow Up Instructions', getTextAreaByName('followUpInstructions'));

        // Notes & Reflection
        addSectionTitle('Notes & Reflection');
        addKeyValue('Internal Notes', getTextAreaByName('internalNotes'));
        addKeyValue('Personal Reflection/Learning', getTextAreaByName('notesReflection'));

        // Finalize
        addFooter();
        const patientForFile = (getValue('patientName') || 'Untitled').replace(/\s+/g, '-');
        doc.save(`FollowupCase-${patientForFile}.pdf`);
    });
});

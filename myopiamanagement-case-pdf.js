// myopiamanagement-case-pdf.js
// Standardized PDF generator for Myopia Management Case (Focus CaseX).
// - Consistent visual structure (headers, section bars, key-value pairs, tables)
// - Uses renderTwoColTable for all bilateral OD/OS data
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
        const sectionBarHeight = 7;
        const headerBlue = { r: 0, g: 77, b: 128 }; // #004D80

        let y = topMargin + 6; // Standard initial y after header
        let pageNum = 1;

        // --- Page Controls (Standardized) ---
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
            doc.text('Focus CaseX - Optometry Report', doc.internal.pageSize.width / 2, 10, { align: 'center' });
            doc.setFontSize(11);
            doc.setTextColor(80);
            doc.text('Myopia Management Case', doc.internal.pageSize.width / 2, 15, { align: 'center' });
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
        function addKeyValue(label, value) { // Renamed from addKeyValuePair
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


        // ---- Report Content ----
        addHeader();

        // ---- Patient Info ----
        addSectionTitle('Patient Information');
        addKeyValue('Patient ID', getValue('patientId') || 'MM-2024-001');
        addKeyValue('Patient Name', getValue('patientName') || 'Ethan Young');
        addKeyValue('Date of Birth', getValue('dateOfBirth') || '2016-08-22');
        addKeyValue('Age', getTextAreaOrInputByName('patientAge') || '7 years old');
        addKeyValue('Parental Myopia History', getTextAreaOrInputByName('parentalMyopiaHistory') || 'Both parents myopic (Mom: -6.00D, Dad: -4.50D).');
        addKeyValue('Date of First Myopia Diagnosis', getValue('dateOfFirstMyopiaDiagnosis') || '2023-01-15');

        // ---- Chief Complaint ----
        addSectionTitle('Chief Complaint (CC)');
        addKeyValue('Chief Complaint', getTextAreaOrInputByName('chiefComplaint') || 'Mom concerned about progressive worsening of vision, especially distance vision, in both eyes. Ethan reports difficulty reading the board at school.');
        addKeyValue('Myopia Progression Concern', getTextAreaOrInputByName('myopiaProgressionConcern') || 'Myopia increased by -1.00D OU in the last year.');
        addKeyValue('Near Work Hours/Day', getTextAreaOrInputByName('nearWorkHoursPerDay') || '3-4 hours/day (tablet, books)');
        addKeyValue('Outdoor Hours/Day', getTextAreaOrInputByName('outdoorHoursPerDay') || '1 hour/day');
        addKeyValue('HPI', getTextAreaOrInputByName('hpi') || 'Ethan is a 7-year-old male with diagnosed myopia OU. First diagnosed 1.5 years ago. Current concern is rapid progression, as his glasses prescription has changed significantly in the past year. Reports clear near vision but struggles with distance tasks like recognizing faces or reading signs. No eye pain, redness, or headaches.');

        // ---- History ----
        addSectionTitle('History');
        addKeyValue('Past Ocular History', getTextAreaOrInputByName('poh') || 'Diagnosed with myopia OU. No amblyopia or strabismus. Wears full-time spectacles.');
        addKeyValue('Past Medical History', getTextAreaOrInputByName('pmh') || 'Healthy, full-term birth. No systemic conditions.');
        addKeyValue('Allergies', getTextAreaOrInputByName('allergies') || 'No known allergies.');
        addKeyValue('Current Medications', getTextAreaOrInputByName('medications') || 'None.');

        // ---- Examination ----
        addSectionTitle('Examination (Myopia Focused)');

        // BCVA (Habitual Rx) Table
        const bcvaRows = [
            { label: 'BCVA (Habitual Rx)', c1: getTextAreaOrInputByName('vaBestCorrectedHabitualOD') || '20/20', c2: getTextAreaOrInputByName('vaBestCorrectedHabitualOS') || '20/20' }
        ];
        renderTwoColTable({
            title: 'Best Corrected Visual Acuity',
            rows: bcvaRows,
            totalWidth: usableWidth * 0.7,
            labelColW: (usableWidth * 0.7) * 0.48,
            eyeColW: (usableWidth * 0.7 - ((usableWidth * 0.7) * 0.48)) / 2
        });

        // Manifest Refraction Table
        const manifestRefractionRows = [
            { label: 'Manifest Refraction', c1: getTextAreaOrInputByName('manifestRefractionOD') || '-3.00 DS', c2: getTextAreaOrInputByName('manifestRefractionOS') || '-3.25 DS' }
        ];
        renderTwoColTable({
            title: 'Manifest Refraction',
            rows: manifestRefractionRows,
            totalWidth: usableWidth * 0.8,
            labelColW: (usableWidth * 0.8) * 0.42,
            eyeColW: (usableWidth * 0.8 - ((usableWidth * 0.8) * 0.42)) / 2
        });

        // Cycloplegic Refraction Table
        const cycloplegicRefractionRows = [
            { label: 'Cycloplegic Refraction', c1: getTextAreaOrInputByName('cycloplegicRefractionOD') || '-3.00 DS', c2: getTextAreaOrInputByName('cycloplegicRefractionOS') || '-3.25 DS' }
        ];
        renderTwoColTable({
            title: 'Cycloplegic Refraction',
            rows: cycloplegicRefractionRows,
            totalWidth: usableWidth * 0.8,
            labelColW: (usableWidth * 0.8) * 0.42,
            eyeColW: (usableWidth * 0.8 - ((usableWidth * 0.8) * 0.42)) / 2
        });

        // Axial Length Table
        const axialLengthRows = [
            { label: 'Axial Length (mm)', c1: getTextAreaOrInputByName('axialLengthOD') || '24.50', c2: getTextAreaOrInputByName('axialLengthOS') || '24.60' }
        ];
        renderTwoColTable({
            title: 'Axial Length',
            rows: axialLengthRows,
            totalWidth: usableWidth * 0.7,
            labelColW: (usableWidth * 0.7) * 0.45,
            eyeColW: (usableWidth * 0.7 - ((usableWidth * 0.7) * 0.45)) / 2
        });

        // Peripheral Refraction Table
        const peripheralRefractionRows = [
            { label: 'Peripheral Refraction', c1: getTextAreaOrInputByName('peripheralRefractionOD') || '-1.00 @ 30° temporal', c2: getTextAreaOrInputByName('peripheralRefractionOS') || '-1.25 @ 30° temporal' }
        ];
        renderTwoColTable({
            title: 'Peripheral Refraction',
            rows: peripheralRefractionRows,
            totalWidth: usableWidth * 0.85,
            labelColW: (usableWidth * 0.85) * 0.45,
            eyeColW: (usableWidth * 0.85 - ((usableWidth * 0.85) * 0.45)) / 2
        });


        // ---- Management ----
        addSectionTitle('Management & Treatment');
        const method = getValue('currentManagementMethod') || 'Low-dose Atropine';
        addKeyValue('Current/Proposed Management Method', method);
        if (method === 'Atropine' || method === 'Low-dose Atropine') addKeyValue('Atropine Concentration', getTextAreaOrInputByName('atropineConcentration') || '0.025% QD OU');
        if (method === 'Orthokeratology') addKeyValue('Ortho-K Lens Parameters', getTextAreaOrInputByName('orthoKLensParameters') || 'Example: BC 7.80, DIA 10.5, -3.00D');
        if (method === 'Multifocal Soft Contact Lenses') addKeyValue('MFCL Parameters', getTextAreaOrInputByName('mfclLensParameters') || 'Example: Acuvue Oasys, -3.00D D, Mid add');
        if (['DIMS/HAL Spectacles', 'Single Vision Spectacles', 'Bifocal Spectacles'].includes(method)) addKeyValue('Spectacle Lens Type Details', getTextAreaOrInputByName('spectacleLensTypeDetails') || 'Example: MiSight Spectacles, HOYA MiyoSmart or Zeiss MyoVision');
        addKeyValue('Compliance with Management', getTextAreaOrInputByName('complianceManagement') || 'Good compliance reported by parents for daily drops.');
        addKeyValue('Side Effects from Management', getTextAreaOrInputByName('sideEffectsManagement') || 'Mild light sensitivity noted initially, now resolved.');
        addKeyValue('Patient Education Provided', getTextAreaOrInputByName('patientEducationProvided') || 'Discussed myopia progression, risks, and benefits of atropine. Emphasized importance of outdoor time and regular breaks during near work.');

        // ---- Assessment & Plan ----
        addSectionTitle('Assessment & Plan');
        addKeyValue('Assessment / Diagnoses', getTextAreaOrInputByName('assessmentDiagnoses') || '1. Progressive myopia OU. 2. Positive family history of myopia. 3. Current management with low-dose atropine.');
        addKeyValue('Plan', getTextAreaOrInputByName('plan') || '1. Continue Atropine 0.025% QD OU. 2. Increase outdoor time to >1.5 hours daily. 3. Implement 20-20-20 rule during near work. 4. Monitor Axial Length and Cycloplegic Refraction every 6 months. 5. RTC in 6 months.');
        addKeyValue('Prognosis', getTextAreaOrInputByName('prognosis') || 'Fair for slowing progression with continued management and lifestyle modifications.');
        addKeyValue('Follow Up Instructions', getTextAreaOrInputByName('followUpInstructions') || 'Continue atropine drops as prescribed. Increase outdoor activities. Schedule next appointment in 6 months for re-evaluation.');

        // ---- Notes & Reflection ----
        addSectionTitle('Notes & Reflection');
        addKeyValue('Internal Notes', getTextAreaOrInputByName('internalNotes') || 'Parents are highly motivated. Ethan tolerates drops well. Axial length data consistent with progression. Discussed potential for combination therapy in future if progression continues.');
        addKeyValue('Personal Reflection/Learning', getTextAreaOrInputByName('notesReflection') || 'Early intervention and multimodal approach are key in myopia management. Patient compliance and parental education are crucial for success. Long-term monitoring of axial length provides objective measure of efficacy.');

        addFooter();

        const patientForFile = (getValue('patientName') || 'Ethan-Young').replace(/\s+/g, '-').replace(/[^A-Za-z0-9\-_]/g, '');
        const fileName = `MyopiaManagementCase-${patientForFile}.pdf`;
        doc.save(fileName);
    });
});
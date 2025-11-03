// This file is general-case-script.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optometryCaseForm');
    if (!form) {
        console.warn('No form found with ID "optometryCaseForm" on this page. Script may not function as expected.');
        return;
    }

    const fillDemoDataButton = document.getElementById('fillDemoData'); // Added this button
    const clearFormButton = document.getElementById('clearForm');
    const saveCaseButton = document.getElementById('saveCase');
    const caseTypeElement = form.querySelector('input[name="caseType"]');
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'general';

    /**
     * Helper to set value and dispatch change event for an input.
     * Handles radio buttons and select elements correctly.
     */
    function setInputValue(id, value, type = 'text') {
        const input = document.getElementById(id);
        if (!input) {
            // console.warn(`setInputValue: Element with ID "${id}" not found. Skipping.`); // Keep console clean unless debugging
            return;
        }

        try {
            if (type === 'radio') {
                const radioButtons = form.querySelectorAll(`input[type="radio"][name="${input.name}"]`);
                let found = false;
                radioButtons.forEach(radio => {
                    if (radio.value === value) {
                        radio.checked = true;
                        found = true;
                    } else {
                        radio.checked = false; // Ensure other radios in group are unchecked
                    }
                });
                if (!found && value !== '') { // Only warn if value wasn't empty and not found
                    // console.warn(`setInputValue: Radio button with name "${input.name}" and value "${value}" not found to check.`);
                }
            } else if (input.tagName === 'SELECT') {
                input.value = value;
            } else if (input.type === 'checkbox') {
                input.checked = value; // Checkboxes expect true/false
            } else {
                input.value = value;
            }
            // Dispatch change event for all types to trigger conditional displays/enabling
            input.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (e) {
            console.error(`Error setting value for ID "${id}" (type: ${type}, value: "${value}"):`, e);
        }
    }

    // NEW HELPER FUNCTION TO TRULY CLEAR ALL FORM FIELDS REGARDLESS OF HTML 'value' ATTRIBUTES
    function clearAllFormFields() {
        form.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.tagName === 'SELECT') {
                // Try to set to the first option which often has value="" or is a "Select..." prompt
                const firstOption = input.querySelector('option[value=""]');
                if (firstOption) {
                    input.value = ''; // This will select the option with value=""
                } else if (input.options.length > 0) {
                    input.selectedIndex = 0; // Fallback to first option if no blank value option
                }
            } else {
                input.value = ''; // Clear text, number, date inputs, textareas
            }
            // Dispatch change event for each input to ensure conditional logic reacts
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    // Function to fill all fields with demo data for General Case (manual trigger)
    function fillDemoDataGeneral() {
        console.log("Manually filling demo data for General Case...");

        // Clear existing local storage data for this case type before filling
        localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);

        // Use clearAllFormFields to reset the form to a truly empty state first
        clearAllFormFields(); 

        const today = new Date();
        const dob = new Date('1990-07-20');
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        // --- Patient Info ---
        setInputValue('patientId', 'GEN-001-JD');
        setInputValue('patientName', 'Jane Doe');
        setInputValue('dateOfBirth', '1990-07-20');
        // patientAge is calculated by script, not directly set here but triggers on DOB change
        setInputValue('patientGender', 'female');
        setInputValue('ethnicBackground', 'Caucasian');
        setInputValue('patientHeight', '165');
        setInputValue('patientWeight', '60');
        setInputValue('contactNumber', '(555) 111-2222');
        setInputValue('emailAddress', 'jane.doe@example.com');
        setInputValue('patientAddress', '456 Oak Ave, Townsville, USA');
        setInputValue('occupation', 'Teacher');
        setInputValue('emergencyContactName', 'John Doe');
        setInputValue('emergencyContactRelationship', 'Husband');
        setInputValue('emergencyContactNumber', '(555) 333-4444');
        setInputValue('dateOfLastEyeExam', '2023-01-10');
        setInputValue('dateOfLastPhysicalExam', '2023-06-01');
        setInputValue('spectaclesYes', 'Yes', 'radio'); // Trigger currentSpectacleRx_group
        setInputValue('currentSpectacleRx', 'OD: -2.00 -0.50 x 180 Add +1.50, OS: -1.75 DS Add +1.50. Progressive.');
        setInputValue('contactLensNo', 'No', 'radio'); // Trigger currentContactLensRx_group (to hide it)
        // currentContactLensRx will be cleared by conditional logic

        // --- Chief Complaint (CC) ---
        setInputValue('chiefComplaint', 'Blurry vision at near and distance, worse by end of day. Recent headaches.');
        setInputValue('qualityOfVision', 'Blurry');
        setInputValue('onsetOfSymptoms', 'Gradual');
        setInputValue('laterality', 'OU');
        setInputValue('severity', 'Moderate');
        setInputValue('hpi', 'Patient reports gradually worsening blurry vision for both distance and near over the past 3 months. Noticed difficulty reading small print and driving at night. Vision feels worse after prolonged computer use. Also reports frontal headaches 2-3 times a week, relieved by rest. Denies flashes, floaters, pain, or redness.');
        setInputValue('cc_redness', false, 'checkbox');
        setInputValue('cc_pain', false, 'checkbox');
        setInputValue('cc_discharge', false, 'checkbox');
        setInputValue('cc_itching', false, 'checkbox');
        setInputValue('cc_flashes', false, 'checkbox');
        setInputValue('cc_floaters', false, 'checkbox');
        setInputValue('cc_diplopia', false, 'checkbox');
        setInputValue('cc_photophobia', false, 'checkbox');
        setInputValue('cc_headache', true, 'checkbox'); // Check this one

        // --- History ---
        setInputValue('poh', 'Dry eye syndrome (diagnosed 1 year ago), managed with OTC artificial tears. No previous surgeries.');
        setInputValue('pmh', 'Controlled Migraines (occasional, managed with sumatriptan), mild seasonal allergies.');
        setInputValue('allergies_details', 'Pollen (seasonal itchy eyes)');
        setInputValue('allergySeverity', 'mild'); // Use value from select option
        setInputValue('ocularMedications', 'OTC Artificial Tears QID OU PRN.');
        setInputValue('systemicMedications', 'Sumatriptan PRN for migraines. Oral contraceptive.');
        setInputValue('foh', 'Mother: Glaucoma, Father: Cataracts.');
        setInputValue('fmh', 'Mother: Hypertension, Sister: Type 1 Diabetes.');
        setInputValue('socialHistory', 'Non-smoker, occasional alcohol. Works as a teacher (heavy computer and reading use).');
        setInputValue('smokingStatus', 'never'); // Trigger smokingDetails_group (to hide it)
        // packsPerDay, yearsSmoked will be cleared by conditional
        setInputValue('alcoholConsumption', 'social'); // Use value from select option
        setInputValue('drugsNo', 'No', 'radio'); // Trigger drugsDetails_group (to hide it)
        setInputValue('sleepPatterns', 'Adequate (7-8 hours/night).');
        setInputValue('exposureHistory', 'High screen time exposure (teaching, lesson planning).');
        setInputValue('birthHistory', 'N/A (adult patient).');
        setInputValue('ocularROS_notwnl', 'Not WNL', 'radio'); // Trigger ocularROS_details
        setInputValue('ocularROS_details_text', 'Occasional dryness, mild photophobia with headaches.'); // Note: ID in HTML is `ocularROS_details_text`
        setInputValue('systemicROS_notwnl', 'Not WNL', 'radio'); // Trigger systemicROS_details
        setInputValue('systemicROS_details_text', 'Occasional headaches (migraine history).'); // Note: ID in HTML is `systemicROS_details_text`

        // --- Examination ---
        // Visual Acuity
        setInputValue('vaUncorrectedOD', '20/60');
        setInputValue('vaUncorrectedOS', '20/60');
        setInputValue('vaUncorrectedOU', '20/50');
        setInputValue('vaBestCorrectedOD', '20/20 with -2.00DS');
        setInputValue('vaBestCorrectedOS', '20/20 with -1.75DS');
        setInputValue('vaBestCorrectedOU', '20/20');
        setInputValue('vaNearOD', 'J5');
        setInputValue('vaNearOS', 'J5');
        setInputValue('vaNearOU', 'J3');
        setInputValue('glareAcuityOD', 'Not tested');
        setInputValue('glareAcuityOS', 'Not tested');
        setInputValue('contrastSensitivityOD', 'WNL');
        setInputValue('contrastSensitivityOS', 'WNL');

        // Pupils
        setInputValue('pupils', 'PERRLA'); // Trigger pupils_details (to hide it)
        // pupils_details_text will be cleared by conditional

        // EOMs
        setInputValue('eoms', 'Full and Smooth'); // Trigger eoms_details (to hide it)
        // eoms_details_text will be cleared by conditional

        // Other Visual
        setInputValue('coverTestDistance', 'Ortho');
        setInputValue('coverTestNear', '2^ XP');
        setInputValue('stereopsis', 'Present'); // Trigger stereopsis_details
        setInputValue('stereopsis_details_text', '40 seconds of arc (Titmus Fly Test)'); // Note: ID in HTML is `stereopsis_details_text`
        setInputValue('colorVision', 'Normal'); // Trigger colorVision_details (to hide it)
        setInputValue('amslerGridOD', 'WNL'); // Trigger amslerGridOD_details (to hide it)
        setInputValue('amslerGridOS', 'WNL'); // Trigger amslerGridOS_details (to hide it)

        // Anterior Seg General
        setInputValue('lidsLashesOD_wnl', 'WNL', 'radio'); // Trigger lidsLashesOD (to hide it)
        setInputValue('lidsLashesOS_wnl', 'WNL', 'radio'); // Trigger lidsLashesOS (to hide it)
        setInputValue('conjunctivaScleraOD_wnl', 'WNL', 'radio'); // Trigger conjunctivaScleraOD (to hide it)
        setInputValue('conjunctivaScleraOS_wnl', 'WNL', 'radio'); // Trigger conjunctivaScleraOS (to hide it)
        setInputValue('conjunctivalInjectionOD', 'WNL');
        setInputValue('conjunctivalInjectionOS', 'WNL');
        setInputValue('corneaOD_wnl', 'WNL', 'radio'); // Trigger corneaOD (to hide it)
        setInputValue('corneaOS_wnl', 'WNL', 'radio'); // Trigger corneaOS (to hide it)
        setInputValue('anteriorChamberOD_wnl', 'WNL', 'radio'); // Trigger anteriorChamberOD (to hide it)
        setInputValue('anteriorChamberOS_wnl', 'WNL', 'radio'); // Trigger anteriorChamberOS (to hide it)
        setInputValue('acDepthOD', 'Grade 4');
        setInputValue('acDepthOS', 'Grade 4');
        setInputValue('irisOD_wnl', 'WNL', 'radio'); // Trigger irisOD (to hide it)
        setInputValue('irisOS_wnl', 'WNL', 'radio'); // Trigger irisOS (to hide it)
        setInputValue('lensOD_status', 'ns-1'); // Trigger lensOD_details (to hide it)
        setInputValue('lensOD_opacityLocation', 'Central');
        setInputValue('lensOS_status', 'ns-1'); // Trigger lensOS_details (to hide it)
        setInputValue('lensOS_opacityLocation', 'Central');
        setInputValue('gonioscopyPerformedOD_no', 'No', 'radio'); // Trigger gonioscopyOD (to hide it)
        setInputValue('gonioscopyPerformedOS_no', 'No', 'radio'); // Trigger gonioscopyOS (to hide it)

        // IOP
        setInputValue('iopOD', '15 @ 10:30 AM');
        setInputValue('iopOS', '16 @ 10:30 AM');
        setInputValue('iopMethod', 'Goldmann');
        setInputValue('cvf', 'Full to finger counting OU. No gross defects.');

        // Refraction & Prescription
        setInputValue('autoRefractorOD', '-1.75 -0.25 x 180');
        setInputValue('autoRefractorOS', '-1.50 DS');
        setInputValue('manifestRefractionOD', '-2.00 -0.50 x 180 Add +1.50');
        setInputValue('manifestRefractionOS', '-1.75 DS Add +1.50');
        setInputValue('bcvaMrxOD', '20/20');
        setInputValue('bcvaMrxOS', '20/20');
        setInputValue('cycloplegicRefractionOD', '-1.75 -0.50 x 175');
        setInputValue('cycloplegicRefractionOS', '-1.50 DS');
        setInputValue('lensType', 'progressive');
        setInputValue('prismDioptersOD', '');
        setInputValue('prismBaseOD', '');
        setInputValue('prismDioptersOS', '');
        setInputValue('prismBaseOS', '');
        setInputValue('finalRxNotes', 'Patient prefers progressive lenses.');

        // --- Posterior Segment Examination (DFE) ---
        setInputValue('vitreousOD_wnl', 'WNL', 'radio'); // Trigger vitreousOD (to hide it)
        setInputValue('vitreousOS_wnl', 'WNL', 'radio'); // Trigger vitreousOS (to hide it)
        setInputValue('opticDiscOD_status', 'WNL'); // Trigger opticDiscOD (to hide it)
        setInputValue('opticDiscOS_status', 'WNL'); // Trigger opticDiscOS (to hide it)
        setInputValue('cupDiscRatioOD', '0.3 H / 0.4 V');
        setInputValue('cupDiscRatioOS', '0.3 H / 0.3 V');
        setInputValue('discHemorrhageODNo', 'No', 'radio');
        setInputValue('discHemorrhageOSNo', 'No', 'radio');
        setInputValue('rnflAppearanceOD', 'WNL');
        setInputValue('rnflAppearanceOS', 'WNL');
        setInputValue('maculaOD_status', 'WNL'); // Trigger maculaOD (to hide it)
        setInputValue('maculaOS_status', 'WNL'); // Trigger maculaOS (to hide it)
        setInputValue('macularPigmentOD', 'WNL');
        setInputValue('macularPigmentOS', 'WNL');
        setInputValue('vesselsOD_wnl', 'WNL', 'radio'); // Trigger vesselsOD (to hide it)
        setInputValue('vesselsOS_wnl', 'WNL', 'radio'); // Trigger vesselsOS (to hide it)
        setInputValue('vesselTortuosityOD', 'Normal');
        setInputValue('vesselTortuosityOS', 'Normal');
        setInputValue('peripheryOD_status', 'WNL'); // Trigger peripheryOD (to hide it)
        setInputValue('peripheryOS_status', 'WNL'); // Trigger peripheryOS (to hide it)
        setInputValue('peripheralLesionOD', 'None'); // Trigger peripheralLesionOD_details (to hide it)
        setInputValue('peripheralLesionOS', 'None'); // Trigger peripheralLesionOS_details (to hide it)

        // --- Investigations ---
        setInputValue('octFindings', 'Macular OCT OU: Normal retinal layers, no edema, good foveal contour. RNFL OCT OU: Within normal limits for age, symmetric.');
        setInputValue('visualFieldFindings', 'Humphrey 24-2 SITA-Standard: Reliable, no significant defects OU. MD and PSD within normal limits.');
        setInputValue('fundusPhotographyFindings', 'Documented optic disc and macular appearance as noted in exam. Healthy optic nerve, no new drusen or retinal changes.');
        setInputValue('cornealTopographyFindings', 'OD: Regular astigmatism, with-the-rule. OS: Regular astigmatism, with-the-rule.');
        setInputValue('pachymetryOD', '540');
        setInputValue('pachymetryOS', '535');
        setInputValue('specularMicroscopy', 'Not performed.');
        setInputValue('meibography', 'Meibomian gland loss Grade 1 (minimal, upper and lower lids OU).');
        setInputValue('dryEyeTests', 'OSDI Score: 20 (mild dry eye symptoms). Schirmer I OD: 10mm, OS: 12mm. TBUT OD: 6s, OS: 7s.');
        setInputValue('fundusAutofluorescence', 'N/A (not indicated).');
        setInputValue('otherInvestigations', 'N/A.');

        // --- Assessment & Plan ---
        setInputValue('assessmentDiagnoses', '1. Myopia OU (H52.1): Stable with current spectacles, but patient needs update for better clarity.\n2. Presbyopia OU (H52.4): Mild progression, causing more difficulty at near.\n3. Dry Eye Syndrome OU (H04.123): Mild, well-controlled with OTC artificial tears.\n4. Nuclear Sclerotic Cataract OU (H25.013): Early stage, not visually significant yet, monitor annually.');
        setInputValue('plan', '1. Rx Spectacles: Prescribe new progressive addition lenses (PALs) with updated distance and near prescription.\n2. Continue artificial tears QID OU PRN for dry eye. Advise on warm compresses for MGD.\n3. Patient education on signs/symptoms of early cataracts and importance of UV protection. Also discuss visual hygiene for computer use.\n4. RTC 1 year for comprehensive eye exam, or sooner if any new symptoms or worsening vision/headaches.');
        setInputValue('prognosis', 'Good visual prognosis with updated spectacles and continued management of dry eye. Cataracts are early and will be monitored.');
        setInputValue('followUpInstructions', 'Return in 1 year for comprehensive eye exam. Contact office sooner if new flashes/floaters, sudden vision loss, severe pain, or persistent/worsening headaches. Use new spectacles as prescribed.');
        setInputValue('nextAppointmentDate', '2025-01-15');

        // --- Notes & Reflection ---
        setInputValue('internalNotes', 'Patient was very engaged in discussion about presbyopia progression and dry eye management. Discussed ergonomic setup for computer work. Shared FOH/FMH concerns (glaucoma, diabetes) and stressed preventative measures.');
        setInputValue('notesReflection', 'This general case highlights the typical presentation and management of presbyopia and early cataracts in a patient with mild dry eye. The updated Rx will significantly improve quality of life. Emphasized preventive care (UV protection, ergonomic adjustments) and monitoring for glaucoma due to FOH. Also, the importance of listening to "headaches" in HPI and considering refractive component.');

        // Final dispatch for all elements to ensure all conditional displays are correctly updated
        form.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        document.getElementById('dateOfBirth').dispatchEvent(new Event('change', { bubbles: true })); // Trigger age calc
    }


    // --- General Conditional Toggle Logic (UPDATED to use .conditional-group classes) ---
    function setupConditionalToggle(triggerInputId, triggerValues, targetSelector, actionType = 'display', defaultValue = '') {
        const triggerInput = document.getElementById(triggerInputId);
        const targets = document.querySelectorAll(targetSelector);

        if (!triggerInput || targets.length === 0) {
            // console.warn(`Conditional Toggle setup failed: Missing elements for trigger ID "${triggerInputId}" or target selector "${targetSelector}"`);
            return;
        }

        const valuesToActivate = Array.isArray(triggerValues) ? triggerValues : [triggerValues];

        const applyToggleState = () => {
            let activate = false;

            if (triggerInput.type === 'checkbox') {
                activate = triggerInput.checked;
            } else if (triggerInput.type === 'radio') {
                // For radio buttons, check the *specific trigger radio*'s state
                const actualTriggerRadio = document.getElementById(triggerInputId);
                if (actualTriggerRadio) {
                    activate = actualTriggerRadio.checked && valuesToActivate.includes(actualTriggerRadio.value);
                }
            } else if (triggerInput.tagName === 'SELECT') {
                activate = valuesToActivate.includes(triggerInput.value);
            }

            targets.forEach(target => {
                const conditionalGroup = target.closest('.conditional-group');
                // PRIORITIZE conditionalGroup for animation and robust state management
                if (conditionalGroup) {
                    if (activate) {
                        conditionalGroup.setAttribute('aria-expanded', 'true');
                        conditionalGroup.style.maxHeight = '150px'; // Expand, adjust as needed
                        conditionalGroup.style.opacity = '1';
                        conditionalGroup.style.pointerEvents = 'auto';
                        conditionalGroup.style.padding = '10px';
                        conditionalGroup.style.marginTop = '10px';
                        // Enable inputs within the expanded group
                        conditionalGroup.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
                            input.disabled = false;
                        });
                    } else {
                        conditionalGroup.setAttribute('aria-expanded', 'false');
                        conditionalGroup.style.maxHeight = '0'; // Collapse
                        conditionalGroup.style.opacity = '0';
                        conditionalGroup.style.pointerEvents = 'none';
                        conditionalGroup.style.padding = '0 10px';
                        conditionalGroup.style.marginTop = '0';

                        // Also clear and disable inputs within the collapsed group
                        conditionalGroup.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
                            input.value = defaultValue; // Clear value
                            input.disabled = true; // Disable
                            if (input.type === 'checkbox' || input.type === 'radio') {
                                input.checked = false;
                            } else if (input.tagName === 'SELECT') {
                                input.selectedIndex = 0; // Reset select to first option
                            }
                        });
                    }
                } else { // Fallback for targets that are NOT a .conditional-group
                    if (actionType === 'display') {
                        target.style.display = activate ? 'block' : 'none';
                        if (triggerInput.hasAttribute('aria-controls') && triggerInput.getAttribute('aria-controls').includes(target.id)) {
                            target.setAttribute('aria-expanded', activate); // Only if aria-controls points to it
                        }
                        if (!activate) {
                            target.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
                                input.value = defaultValue;
                                input.disabled = true;
                                if (input.type === 'checkbox' || input.type === 'radio') {
                                    input.checked = false;
                                } else if (input.tagName === 'SELECT') {
                                     input.selectedIndex = 0;
                                }
                            });
                        } else {
                            target.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
                                input.disabled = false;
                            });
                        }
                    } else if (actionType === 'disabled') {
                        if (activate) {
                            target.disabled = false;
                        } else {
                            target.value = defaultValue;
                            target.disabled = true;
                            if (target.type === 'checkbox' || target.type === 'radio') {
                                input.checked = false;
                            } else if (input.tagName === 'SELECT') {
                                 input.selectedIndex = 0;
                            }
                        }
                    }
                }
            });
        };

        // Attach listener to the *specific* trigger input
        triggerInput.addEventListener('change', applyToggleState);

        // For radio groups, *all* radios in the group need to trigger the toggle check
        if (triggerInput.type === 'radio') {
            document.querySelectorAll(`input[type="radio"][name="${triggerInput.name}"]`).forEach(radio => {
                // Ensure we don't double-add the listener if it's already on triggerInput
                if (radio.id !== triggerInputId) { 
                    radio.addEventListener('change', applyToggleState);
                }
            });
        }
        applyToggleState(); // Apply initial state on load
    }

    // --- Data-driven setup for all conditional toggles ---
    const conditionalRules = [
        { triggerId: 'spectaclesYes', triggerValues: 'Yes', targetSelector: '#currentSpectacleRx_group', actionType: 'display' },
        { triggerId: 'spectaclesNo', triggerValues: 'No', targetSelector: '#currentSpectacleRx_group', actionType: 'display', defaultValue: '' },
        { triggerId: 'contactLensYes', triggerValues: 'Yes', targetSelector: '#currentContactLensRx_group', actionType: 'display' },
        { triggerId: 'contactLensNo', triggerValues: 'No', targetSelector: '#currentContactLensRx_group', actionType: 'display', defaultValue: '' },
        { triggerId: 'smokingStatus', triggerValues: ['former', 'current'], targetSelector: '#smokingDetails_group', actionType: 'display' },
        { triggerId: 'smokingStatus', triggerValues: 'never', targetSelector: '#smokingDetails_group', actionType: 'display', defaultValue: '' },
        { triggerId: 'drugsYes', triggerValues: 'Yes', targetSelector: '#drugsDetails_group', actionType: 'display' },
        { triggerId: 'drugsNo', triggerValues: 'No', targetSelector: '#drugsDetails_group', actionType: 'display', defaultValue: '' },
        { triggerId: 'ocularROS_notwnl', triggerValues: 'Not WNL', targetSelector: '#ocularROS_details', actionType: 'display' },
        { triggerId: 'ocularROS_wnl', triggerValues: 'WNL', targetSelector: '#ocularROS_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'systemicROS_notwnl', triggerValues: 'Not WNL', targetSelector: '#systemicROS_details', actionType: 'display' },
        { triggerId: 'systemicROS_wnl', triggerValues: 'WNL', targetSelector: '#systemicROS_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'pupils', triggerValues: ['APD OD', 'APD OS', 'Irregular Shape', 'Fixed/Dilated', 'Fixed/Constricted', 'Other'], targetSelector: '#pupils_details', actionType: 'display' },
        { triggerId: 'pupils', triggerValues: 'PERRLA', targetSelector: '#pupils_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'eoms', triggerValues: ['Restricted', 'Painful', 'Overaction', 'Underaction', 'Other'], targetSelector: '#eoms_details', actionType: 'display' },
        { triggerId: 'eoms', triggerValues: 'Full and Smooth', targetSelector: '#eoms_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'stereopsis', triggerValues: 'Present', targetSelector: '#stereopsis_details', actionType: 'display' },
        { triggerId: 'stereopsis', triggerValues: 'Absent', targetSelector: '#stereopsis_details', actionType: 'display' }, // Keep open for absent details
        { triggerId: 'colorVision', triggerValues: ['Red-Green Deficiency', 'Blue-Yellow Deficiency', 'Acquired Deficiency', 'Other'], targetSelector: '#colorVision_details', actionType: 'display' },
        { triggerId: 'colorVision', triggerValues: ['Normal', 'Not Tested'], targetSelector: '#colorVision_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'amslerGridOD', triggerValues: ['Metamorphopsia', 'Scotoma', 'Distortion'], targetSelector: '#amslerGridOD_details', actionType: 'display' },
        { triggerId: 'amslerGridOD', triggerValues: ['WNL', 'Not Tested'], targetSelector: '#amslerGridOD_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'amslerGridOS', triggerValues: ['Metamorphopsia', 'Scotoma', 'Distortion'], targetSelector: '#amslerGridOS_details', actionType: 'display' },
        { triggerId: 'amslerGridOS', triggerValues: ['WNL', 'Not Tested'], targetSelector: '#amslerGridOS_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'lidsLashesOD_notwnl', triggerValues: 'Not WNL', targetSelector: '#lidsLashesOD', actionType: 'display' },
        { triggerId: 'lidsLashesOD_wnl', triggerValues: 'WNL', targetSelector: '#lidsLashesOD', actionType: 'display', defaultValue: '' },
        { triggerId: 'lidsLashesOS_notwnl', triggerValues: 'Not WNL', targetSelector: '#lidsLashesOS', actionType: 'display' },
        { triggerId: 'lidsLashesOS_wnl', triggerValues: 'WNL', targetSelector: '#lidsLashesOS', actionType: 'display', defaultValue: '' },
        { triggerId: 'conjunctivaScleraOD_notwnl', triggerValues: 'Not WNL', targetSelector: '#conjunctivaScleraOD', actionType: 'display' },
        { triggerId: 'conjunctivaScleraOD_wnl', triggerValues: 'WNL', targetSelector: '#conjunctivaScleraOD', actionType: 'display', defaultValue: '' },
        { triggerId: 'conjunctivaScleraOS_notwnl', triggerValues: 'Not WNL', targetSelector: '#conjunctivaScleraOS', actionType: 'display' },
        { triggerId: 'conjunctivaScleraOS_wnl', triggerValues: 'WNL', targetSelector: '#conjunctivaScleraOS', actionType: 'display', defaultValue: '' },
        { triggerId: 'corneaOD_notwnl', triggerValues: 'Not WNL', targetSelector: '#corneaOD', actionType: 'display' },
        { triggerId: 'corneaOD_wnl', triggerValues: 'WNL', targetSelector: '#corneaOD', actionType: 'display', defaultValue: '' },
        { triggerId: 'corneaOS_notwnl', triggerValues: 'Not WNL', targetSelector: '#corneaOS', actionType: 'display' },
        { triggerId: 'corneaOS_wnl', triggerValues: 'WNL', targetSelector: '#corneaOS', actionType: 'display', defaultValue: '' },
        { triggerId: 'anteriorChamberOD_notwnl', triggerValues: 'Not WNL', targetSelector: '#anteriorChamberOD', actionType: 'display' },
        { triggerId: 'anteriorChamberOD_wnl', triggerValues: 'WNL', targetSelector: '#anteriorChamberOD', actionType: 'display', defaultValue: '' },
        { triggerId: 'anteriorChamberOS_notwnl', triggerValues: 'Not WNL', targetSelector: '#anteriorChamberOS', actionType: 'display' },
        { triggerId: 'anteriorChamberOS_wnl', triggerValues: 'WNL', targetSelector: '#anteriorChamberOS', actionType: 'display', defaultValue: '' },
        { triggerId: 'irisOD_notwnl', triggerValues: 'Not WNL', targetSelector: '#irisOD', actionType: 'display' },
        { triggerId: 'irisOD_wnl', triggerValues: 'WNL', targetSelector: '#irisOD', actionType: 'display', defaultValue: '' },
        { triggerId: 'irisOS_notwnl', triggerValues: 'Not WNL', targetSelector: '#irisOS', actionType: 'display' },
        { triggerId: 'irisOS_wnl', triggerValues: 'WNL', targetSelector: '#irisOS', actionType: 'display', defaultValue: '' },
        { triggerId: 'lensOD_status', triggerValues: 'other', targetSelector: '#lensOD_details', actionType: 'display' },
        { triggerId: 'lensOS_status', triggerValues: 'other', targetSelector: '#lensOS_details', actionType: 'display' },
        { triggerId: 'gonioscopyPerformedOD_yes', triggerValues: 'Yes', targetSelector: '#gonioscopyOD', actionType: 'display' },
        { triggerId: 'gonioscopyPerformedOD_no', triggerValues: 'No', targetSelector: '#gonioscopyOD', actionType: 'display', defaultValue: '' },
        { triggerId: 'gonioscopyPerformedOS_yes', triggerValues: 'Yes', targetSelector: '#gonioscopyOS', actionType: 'display' },
        { triggerId: 'gonioscopyPerformedOS_no', triggerValues: 'No', targetSelector: '#gonioscopyOS', actionType: 'display', defaultValue: '' },
        { triggerId: 'vitreousOD_notwnl', triggerValues: 'Not WNL', targetSelector: '#vitreousOD', actionType: 'display' },
        { triggerId: 'vitreousOD_wnl', triggerValues: 'WNL', targetSelector: '#vitreousOD', actionType: 'display', defaultValue: '' },
        { triggerId: 'vitreousOS_notwnl', triggerValues: 'Not WNL', targetSelector: '#vitreousOS', actionType: 'display' },
        { triggerId: 'vitreousOS_wnl', triggerValues: 'WNL', targetSelector: '#vitreousOS', actionType: 'display', defaultValue: '' },
        { triggerId: 'opticDiscOD_status', triggerValues: ['Pallor', 'Edema', 'Cupping', 'Other'], targetSelector: '#opticDiscOD', actionType: 'display' },
        { triggerId: 'opticDiscOD_status', triggerValues: 'WNL', targetSelector: '#opticDiscOD', actionType: 'display', defaultValue: '' },
        { triggerId: 'opticDiscOS_status', triggerValues: ['Pallor', 'Edema', 'Cupping', 'Other'], targetSelector: '#opticDiscOS', actionType: 'display' },
        { triggerId: 'opticDiscOS_status', triggerValues: 'WNL', targetSelector: '#opticDiscOS', actionType: 'display', defaultValue: '' },
        { triggerId: 'maculaOD_status', triggerValues: ['Drusen', 'Edema', 'Hemorrhage', 'Cyst', 'Elevated', 'Other'], targetSelector: '#maculaOD', actionType: 'display' },
        { triggerId: 'maculaOD_status', triggerValues: 'WNL', targetSelector: '#maculaOD', actionType: 'display', defaultValue: '' },
        { triggerId: 'maculaOS_status', triggerValues: ['Drusen', 'Edema', 'Hemorrhage', 'Cyst', 'Elevated', 'Other'], targetSelector: '#maculaOS', actionType: 'display' },
        { triggerId: 'maculaOS_status', triggerValues: 'WNL', targetSelector: '#maculaOS', actionType: 'display', defaultValue: '' },
        { triggerId: 'vesselsOD_notwnl', triggerValues: 'Not WNL', targetSelector: '#vesselsOD', actionType: 'display' },
        { triggerId: 'vesselsOD_wnl', triggerValues: 'WNL', targetSelector: '#vesselsOD', actionType: 'display', defaultValue: '' },
        { triggerId: 'vesselsOS_notwnl', triggerValues: 'Not WNL', targetSelector: '#vesselsOS', actionType: 'display' },
        { triggerId: 'vesselsOS_wnl', triggerValues: 'WNL', targetSelector: '#vesselsOS', actionType: 'display', defaultValue: '' },
        { triggerId: 'peripheryOD_status', triggerValues: ['Attached', 'Detachment', 'Holes/Tears', 'Degeneration', 'Other'], targetSelector: '#peripheryOD', actionType: 'display' },
        { triggerId: 'peripheryOD_status', triggerValues: 'WNL', targetSelector: '#peripheryOD', actionType: 'display', defaultValue: '' },
        { triggerId: 'peripheryOS_status', triggerValues: ['Attached', 'Detachment', 'Holes/Tears', 'Degeneration', 'Other'], targetSelector: '#peripheryOS', actionType: 'display' },
        { triggerId: 'peripheryOS_status', triggerValues: 'WNL', targetSelector: '#peripheryOS', actionType: 'display', defaultValue: '' },
        { triggerId: 'peripheralLesionOD', triggerValues: ['Lattice Degeneration', 'Retinal Hole', 'Retinal Tear', 'CHRPE', 'Nevus', 'Other'], targetSelector: '#peripheralLesionOD_details', actionType: 'display' },
        { triggerId: 'peripheralLesionOD', triggerValues: 'None', targetSelector: '#peripheralLesionOD_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'peripheralLesionOS', triggerValues: ['Lattice Degeneration', 'Retinal Hole', 'Retinal Tear', 'CHRPE', 'Nevus', 'Other'], targetSelector: '#peripheralLesionOS_details', actionType: 'display' },
        { triggerId: 'peripheralLesionOS', triggerValues: 'None', targetSelector: '#peripheralLesionOS_details', actionType: 'display', defaultValue: '' },
    ];

    conditionalRules.forEach(rule => {
        setupConditionalToggle(rule.triggerId, rule.triggerValues, rule.targetSelector, rule.actionType, rule.defaultValue);
    });

    // --- Function to calculate age from Date of Birth ---
    function calculateAge() {
        const dobInput = document.getElementById('dateOfBirth');
        const patientAgeInput = document.getElementById('patientAge'); 

        if (!dobInput || !patientAgeInput) return;

        dobInput.addEventListener('change', () => {
            const dob = new Date(dobInput.value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            if (!isNaN(age) && age >= 0) {
                patientAgeInput.value = age;
            } else {
                patientAgeInput.value = '';
            }
        });

        if (dobInput.value) {
            dobInput.dispatchEvent(new Event('change'));
        }
    }
    calculateAge();

    // --- Function to gather all form data ---
    function collectFormData() {
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            const conditionalGroup = input.closest('.conditional-group');
            const isVisibleAndEnabled = !input.disabled && (!conditionalGroup || conditionalGroup.getAttribute('aria-expanded') === 'true');

            if (input.name && isVisibleAndEnabled) {
                if (input.type === 'checkbox') {
                    // For checkboxes, group values if multiple share the same name
                    if (formData[input.name] === undefined) {
                        formData[input.name] = [];
                    }
                    if (input.checked) {
                        formData[input.name].push(input.value);
                    }
                } else if (input.type === 'radio') {
                    if (input.checked) {
                        formData[input.name] = input.value;
                    }
                } else if (input.tagName === 'SELECT') {
                    formData[input.name] = input.value;
                } else {
                    formData[input.name] = input.value;
                }
            }
        });
        // Convert checkbox arrays to comma-separated strings if they exist
        for (const key in formData) {
            if (Array.isArray(formData[key])) {
                formData[key] = formData[key].join(', ');
            }
        }
        return formData;
    }

    // --- Form Submission Handler ---
    if (saveCaseButton) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!form.checkValidity()) {
                alert('Please fill out all required fields (marked with *).');
                return;
            }

            const caseData = collectFormData();
            console.log(`Submitting ${currentCaseType.replace(/([A-Z])/g, ' $1').trim()} Case Data:`, caseData);

            alert(`Case (${currentCaseType.replace(/([A-Z])/g, ' $1').trim()}) saved successfully! (Data logged to console)`);
            
            // Re-dispatch events for radios/selects and calculate age if the form is NOT cleared
            // This is if 'form.reset()' was used, which you're now replacing.
            // document.querySelectorAll('input[type="checkbox"], input[type="radio"], select').forEach(input => {
            //     input.dispatchEvent(new Event('change'));
            // });
            // calculateAge();
        });
    }

    // --- Clear Form Handler ---
    if (clearFormButton) {
        clearFormButton.addEventListener('click', () => {
            clearAllFormFields(); // Use our new function for a true clear
            localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);
            // calculateAge() will be implicitly called by dateOfBirth dispatch
            alert('Form cleared!');
        });
    }

    // --- Manual Fill Demo Data Button ---
    if (fillDemoDataButton) {
        fillDemoDataButton.addEventListener('click', fillDemoDataGeneral);
    }

    // --- Local Storage for saving draft ---
    const localStorageKey = `focusCaseXDraft_${currentCaseType}`;
    let saveTimer;

    form.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            const caseData = collectFormData();
            localStorage.setItem(localStorageKey, JSON.stringify(caseData));
        }, 800);
    });

    // Load data from Local Storage on page load
    const savedDraft = localStorage.getItem(localStorageKey);
    if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        for (const key in draftData) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    // For checkboxes, stored value is a comma-separated string
                    const storedValues = String(draftData[key]).split(', ').map(s => s.trim());
                    const checkboxes = form.querySelectorAll(`input[type="checkbox"][name="${key}"]`);
                    checkboxes.forEach(cb => {
                        cb.checked = storedValues.includes(cb.value);
                    });
                } else if (input.type === 'radio') {
                    const radioButtons = form.querySelectorAll(`input[type="radio"][name="${key}"]`);
                    radioButtons.forEach(radio => {
                        if (radio.value === draftData[key]) {
                            radio.checked = true;
                        } else {
                            radio.checked = false; // Ensure others are unchecked
                        }
                    });
                } else {
                    input.value = draftData[key];
                }
                // Dispatch change event after setting value to update conditionals
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        calculateAge(); // Recalculate age after loading DOB
        alert(`Loaded saved draft for ${currentCaseType.replace(/([A-Z])/g, ' $1').trim()} case from previous session.`);
    }

    // Final initial dispatch for all elements on page load to ensure all conditional displays are correctly updated.
    // This ensures any default HTML values or interactions from demo data/local storage correctly trigger conditionals.
    form.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
});
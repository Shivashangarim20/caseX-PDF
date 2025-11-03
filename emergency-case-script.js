// This file is emergency-case-script.js
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
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'emergency';

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

    // Function to fill all fields with demo data for Emergency Case (manual trigger)
    function fillDemoDataEmergency() {
        console.log("Manually filling demo data for Emergency Case...");
        
        // Clear existing local storage data for this case type before filling
        localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);
        
        // Use clearAllFormFields to reset the form to a truly empty state first
        clearAllFormFields(); 

        const today = new Date();
        const currentTime = today.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format

        // --- Patient Info ---
        setInputValue('patientId', 'EM-012-FG');
        setInputValue('patientName', 'Frank Green');
        setInputValue('dateOfBirth', '1978-03-25');
        setInputValue('contactNumber', '(555) 987-6543');
        setInputValue('dateOfOnset', today.toISOString().split('T')[0]);
        setInputValue('timeOfPresentation', currentTime);
        setInputValue('emergencyContactName', 'Alice Green');
        setInputValue('emergencyContactRelationship', 'Wife');
        setInputValue('emergencyContactNumber', '(555) 987-1234');

        // --- Chief Complaint (CC) - Emergency ---
        setInputValue('chiefComplaint', 'Sudden onset of severe sharp pain, redness, and foreign body sensation in OD since 3 hours ago.');
        setInputValue('painScale', '7');
        setInputValue('natureOfInjuryOnset', 'Red Eye/Pain');
        setInputValue('natureOfInjuryOnset_other', '');
        setInputValue('traumaDetails', 'Patient was welding without safety glasses. Felt a "ping" in the right eye, followed by immediate pain and watering.');
        setInputValue('hpi', 'Patient reports working on a metal project using a welder, confirms no eye protection was worn. Approximately 3 hours ago, felt sudden foreign body sensation, sharp pain, tearing, and mild photophobia in the right eye (OD). Attempted to rinse eye with tap water but symptoms persisted and worsened. Denies significant vision loss, flashes, floaters, or diplopia.');
        setInputValue('em_nauseaVomiting', false, 'checkbox');
        setInputValue('em_headache', false, 'checkbox');
        setInputValue('em_diplopia', false, 'checkbox');
        setInputValue('em_photophobia', true, 'checkbox');
        setInputValue('em_discharge', false, 'checkbox');

        // --- History ---
        setInputValue('poh', 'No significant POH. Last eye exam 2 years ago, reportedly WNL. Wears reading glasses.');
        setInputValue('pmh', 'Controlled hypertension (since 5 years ago).');
        setInputValue('allergies', 'NKDA (No Known Drug Allergies).');
        setInputValue('currentMedications', 'Lisinopril 10mg QD.');
        setInputValue('tetanusStatus', 'Unknown, last booster likely >10 years ago.');
        setInputValue('lastMeal', 'Ate sandwich at 12:00 PM (2.5 hours prior).');

        // --- Examination (Emergency Focused) ---
        // Visual Acuity
        setInputValue('vaUncorrectedOD', '20/200');
        setInputValue('vaUncorrectedOS', '20/20');
        setInputValue('vaPinHoleOD', '20/100');
        setInputValue('vaPinHoleOS', '20/20');

        // External Exam
        setInputValue('externalExam_statusOD', 'Lid Edema');
        setInputValue('externalExamOD', 'Moderate lid edema and erythema OD.');
        setInputValue('externalExam_statusOS', 'WNL');
        setInputValue('externalExamOS', '');

        // Pupils
        setInputValue('pupilsEmergency', 'Irregular Shape');
        setInputValue('pupilsEmergency_details', 'OD: Pupil irregular, peaking nasally. OS: PERRLA. No APD.');

        // EOMs
        setInputValue('eomsEmergency', 'Full and Smooth');
        setInputValue('eomsEmergency_details', '');

        // Visual Field Gross
        setInputValue('visualFieldGross', 'Full');

        // IOP
        setInputValue('globeRuptureSuspected_no', 'No', 'radio');
        setInputValue('iopOD', '18 mmHg @ 2:40 PM');
        setInputValue('iopOS', '16 mmHg @ 2:40 PM');
        setInputValue('iopMethodEmergency', 'Icare');
        setInputValue('iopConsistency', 'N/A');

        // Slit Lamp Exam
        setInputValue('slitLampEmergency', 'OD: Conjunctiva: 360 degrees injection, chemosis. Cornea: Deep stromal foreign body 2mm from limbus at 3 o\'clock with surrounding rust ring. No obvious penetration into anterior chamber. AC: Deep and quiet. Iris: Flat and intact. Lens: Clear. OS: WNL.');
        setInputValue('cornealFindingOD', 'FB');
        setInputValue('cornealFindingOD_details', 'Deep stromal metallic FB 2mm from limbus at 3 o\'clock with rust ring.');
        setInputValue('cornealFindingOS', 'Clear');
        setInputValue('cornealFindingOS_details', '');
        setInputValue('foreignBodyType', 'Metallic');
        setInputValue('acFindingOD', 'Deep & Quiet');
        setInputValue('acFindingOS', 'Deep & Quiet');
        setInputValue('irisFindingOD', 'Flat & Intact');
        setInputValue('irisFindingOS', 'Flat & Intact');
        setInputValue('lensFindingOD', 'Clear');
        setInputValue('lensFindingOS', 'Clear');
        setInputValue('seidelTestOD', 'Negative');
        setInputValue('seidelTestOS', 'Not Performed');

        // Posterior Segment
        setInputValue('posteriorSegmentEmergency', 'OD: Clear vitreous, attached retina, healthy optic disc and macula. OS: WNL.');
        setInputValue('vitreousHemorrhageOD', 'None');
        setInputValue('vitreousHemorrhageOS', 'None');
        setInputValue('retinalFindingOD', 'Attached');
        setInputValue('retinalFindingOS', 'Attached');

        // --- Investigations ---
        setInputValue('fluoresceinStaining', 'OD: Small epithelial defect surrounding metallic foreign body. Negative Seidel test confirms no globe perforation.');
        setInputValue('imagingOrdered', 'Orbital X-ray ordered STAT to rule out intraocular foreign body (IOFB).');
        setInputValue('otherEmergencyTests', 'None.');

        // --- Assessment & Plan ---
        setInputValue('urgencyLevel', 'Emergency');
        setInputValue('assessmentDiagnoses', '1. Corneal foreign body, metallic, OD (T15.01XA).\n2. Suspected open globe injury, rule out (S05.61XA).\n3. Traumatic iritis OD (H20.021).');
        setInputValue('plan', '1. Attempt foreign body removal OD by irrigation and gentle spud removal. Advise patient of IOFB risk. If unable to remove or if globe rupture suspected, urgent referral to ophthalmology.\n2. Topical antibiotic (Moxifloxacin QID OD), Cycloplegic (Cyclopentolate 1% BID OD).\n3. Oral pain relief (Paracetamol 500mg PRN).\n4. Urgent orbital X-ray STAT for IOFB rule-out.\n5. Tetanus status updated if necessary.\n6. Urgent referral to Ophthalmologist for foreign body removal / further evaluation if required.');
        setInputValue('referralMadeYes', 'Yes', 'radio');
        setInputValue('referralDetails', 'Urgent referral placed to Dr. Eye Surgeon at City Hospital ER. Patient advised to proceed there directly for further management. Sent clinical notes via secure fax.');
        setInputValue('patientStatusOnArrival', 'Alert & Oriented x3');
        setInputValue('transportMethod', 'Private Vehicle');
        setInputValue('followUpInstructions', 'Patient instructed to go directly to City Hospital ER for ophthalmology consultation. Advised to avoid rubbing eye, wear eye shield (provided). Return to our office for follow-up in 24-48 hours if instructed by ophthalmology. Call immediately for worsening pain or vision.');

        // --- Notes & Reflection ---
        setInputValue('internalNotes', 'Patient was very anxious about vision. Counselled thoroughly on risks and the need for urgent specialist care. Documented clear communication with patient and ophthalmology office.');
        setInputValue('notesReflection', 'This emergency required rapid assessment for globe integrity and urgent referral. Emphasized systematic approach: history, VA, pupils, IOP, slit lamp with fluorescein, DFE. The importance of clear communication with both patient and specialist is paramount in such cases.');
        
        // Final dispatch for all elements to ensure all conditional displays are correctly updated
        form.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
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
                                target.checked = false;
                            } else if (target.tagName === 'SELECT') {
                                 target.selectedIndex = 0;
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
        { triggerId: 'natureOfInjuryOnset', triggerValues: 'Other', targetSelector: '#natureOfInjuryOnset_other', actionType: 'display' },
        { triggerId: 'externalExam_statusOD', triggerValues: ['Lid Edema', 'Ecchymosis', 'Proptosis', 'Orbital Fx Suspected', 'Other'], targetSelector: '#externalExamOD', actionType: 'display' },
        { triggerId: 'externalExam_statusOS', triggerValues: ['Lid Edema', 'Ecchymosis', 'Proptosis', 'Orbital Fx Suspected', 'Other'], targetSelector: '#externalExamOS', actionType: 'display' },
        { triggerId: 'pupilsEmergency', triggerValues: ['APD OD', 'APD OS', 'Fixed/Dilated', 'Fixed/Constricted', 'Irregular Shape', 'Other'], targetSelector: '#pupilsEmergency_details', actionType: 'display' },
        { triggerId: 'eomsEmergency', triggerValues: ['Restricted', 'Painful', 'Overaction', 'Underaction', 'Other'], targetSelector: '#eomsEmergency_details', actionType: 'display' },
        { triggerId: 'cornealFindingOD', triggerValues: ['Abrasion', 'FB', 'Infiltrate', 'Edema', 'Laceration', 'Other'], targetSelector: '#cornealFindingOD_details', actionType: 'display' },
        { triggerId: 'cornealFindingOS', triggerValues: ['Abrasion', 'FB', 'Infiltrate', 'Edema', 'Laceration', 'Other'], targetSelector: '#cornealFindingOS_details', actionType: 'display' },
        { triggerId: 'referralMadeYes', triggerValues: 'Yes', targetSelector: '#referralDetails', actionType: 'display' },
        { triggerId: 'referralMadeNo', triggerValues: 'No', targetSelector: '#referralDetails', actionType: 'display', defaultValue: '' },
    ];

    conditionalRules.forEach(rule => {
        setupConditionalToggle(rule.triggerId, rule.triggerValues, rule.targetSelector, rule.actionType, rule.defaultValue);
    });

    // --- Function to gather all form data ---
    function collectFormData() {
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Check if the input is part of a collapsed conditional group
            // Now that setupConditionalToggle disables inputs, we can just check `!input.disabled`
            if (input.name && !input.disabled) {
                if (input.type === 'checkbox') {
                    formData[input.name] = input.checked;
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
            
            // If you want to clear after saving, uncomment the next line:
            // clearFormButton.click(); // Simulate a click on the clear button
        });
    }

    // --- Clear Form Handler ---
    if (clearFormButton) {
        clearFormButton.addEventListener('click', () => {
            clearAllFormFields(); // Use our new function for a true clear
            localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);
            // No calculateAge() needed as this form doesn't have patientAge
            alert('Form cleared!');
        });
    }

    // --- Manual Fill Demo Data Button ---
    if (fillDemoDataButton) {
        fillDemoDataButton.addEventListener('click', fillDemoDataEmergency);
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
                    input.checked = draftData[key];
                } else if (input.type === 'radio') {
                    // Need to find the correct radio button in the group and check it
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
        // No calculateAge() needed as this form doesn't have patientAge
        alert(`Loaded saved draft for ${currentCaseType.replace(/([A-Z])/g, ' $1').trim()} case from previous session.`);
    }

    // Final initial dispatch for all elements on page load to ensure all conditional displays are correctly updated.
    // This ensures any default HTML values or interactions from demo data/local storage correctly trigger conditionals.
    form.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
});
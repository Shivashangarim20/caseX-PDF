// This file is certificate_script.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optometryCaseForm');
    if (!form) {
        console.warn('No form found with ID "optometryCaseForm" on this page. Script may not function as expected.');
        return;
    }

    const clearFormButton = document.getElementById('clearForm');
    const saveCaseButton = document.getElementById('saveCase');
    const caseTypeElement = form.querySelector('input[name="caseType"]');
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'certificate';

    /**
     * Helper to set value and dispatch change event for an input.
     * Handles radio buttons and select elements correctly.
     */
    function setInputValue(id, value, type = 'text') {
        const input = document.getElementById(id);
        if (!input) {
            // console.warn(`setInputValue: Element with ID "${id}" not found. Skipping.`);
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

    // Function to fill all fields with demo data for Certificate Purpose Case
    function fillDemoDataCertificate() {
        console.log("Filling demo data for Certificate Purpose Case...");

        // Using setInputValue ensures change events are dispatched for all fields
        // --- Patient Info ---
        setInputValue('patientId', 'CERT-005-JD');
        setInputValue('patientName', 'Jane Doe');
        setInputValue('dateOfBirth', '1985-05-15');
        setInputValue('dateOfExamination', new Date().toISOString().split('T')[0]); // Today's date
        setInputValue('certificateType', 'Driving License (Private)');
        // certificateType_other is handled by conditional logic if certificateType changes from 'Other'
        setInputValue('governingBody', 'Local Department of Motor Vehicles');
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        setInputValue('dateOfLastCertificate', twoYearsAgo.toISOString().split('T')[0]); // 2 years ago

        // --- Chief Complaint (CC) ---
        setInputValue('chiefComplaint', 'Routine vision examination for renewal of private driving license.');
        setInputValue('hpi', 'Patient reports no new visual symptoms or changes since last examination. Wears spectacles daily. Comfortable with current vision. No history of ocular trauma or surgery.');

        // --- History ---
        setInputValue('pmh', 'Controlled Type 2 Diabetes (diagnosed 5 years ago), Mild Hypertension.');
        setInputValue('systemicMedications', 'Metformin, Lisinopril.');
        setInputValue('ocularROS_wnl', 'WNL', 'radio'); // Set 'WNL' radio button as checked
        setInputValue('systemicROS_wnl', 'WNL', 'radio'); // Set 'WNL' radio button as checked
        setInputValue('diplopiaHistoryNo', 'No', 'radio'); // Set 'No' radio button as checked

        // --- Examination (Certificate Specific) ---
        // Visual Acuity
        setInputValue('vaUncorrectedOD', '20/60 (6/18)');
        setInputValue('vaUncorrectedOS', '20/80 (6/24)');
        setInputValue('vaUncorrectedOU', '20/50 (6/15)');
        setInputValue('vaBestCorrectedHabitualOD', '20/20 (6/6) with -2.50DS');
        setInputValue('vaBestCorrectedHabitualOS', '20/25 (6/7.5) with -2.75DS');
        setInputValue('vaBestCorrectedHabitualOU', '20/20 (6/6)');
        setInputValue('vaBestCorrectedOD', '20/20 (6/6)');
        setInputValue('vaBestCorrectedOS', '20/20 (6/6)');
        setInputValue('vaBestCorrectedOU', '20/20 (6/6)');
        setInputValue('vaNearOD', 'J1 / N4');
        setInputValue('vaNearOS', 'J1 / N4');
        setInputValue('vaNearOU', 'J1 / N4');
        setInputValue('distanceVaLogMAROD', '0.0');
        setInputValue('distanceVaLogMAROS', '0.1');

        setInputValue('colorVisionCertificate', 'Normal');
        // colorVisionCertificate_details will be cleared by conditional if trigger is 'Normal'
        setInputValue('visualFieldSpecifics', 'Confrontation Fields performed.');
        setInputValue('visualFieldFindingsCertificate', 'Full to confrontation OU. No gross scotomas detected. Patient reports no visual field defects.');
        setInputValue('peripheralVisionHorizontal', '150');
        setInputValue('peripheralVisionVertical', '100');
        setInputValue('eomsCertificate', 'Full and smooth in all gazes, no diplopia reported or observed. No nystagmus.');
        setInputValue('glareSensitivity', 'Not tested, patient denies issues.');
        setInputValue('contrastSensitivity', 'Not tested, patient denies issues.');
        setInputValue('darkAdaptation', 'Not tested, patient denies issues.');
        setInputValue('depthPerception', '40 seconds of arc (Stereo Fly Test)');
        setInputValue('refractionDetailsCertificate', 'Current Spectacle Rx: OD: -2.50 DS, OS: -2.75 DS. Best corrected to 20/20 OU.');
        setInputValue('visionCorrectionRequired', 'Yes (Spectacles Only)');
        setInputValue('restrictionsEndorsements', 'Must wear corrective lenses while driving.');
        setInputValue('ocularHealthStatus', 'Anterior and posterior segments appear healthy, stable, and show no progressive disease that would impair fitness for driving.');

        // --- Investigations ---
        setInputValue('certificateInvestigations', 'No additional specific investigations required beyond routine optometric examination for this certificate type.');

        // --- Assessment & Plan ---
        setInputValue('assessmentDiagnoses', '1. Myopia OU (H52.1).\n2. Presbyopia OU (H52.4).\n3. History of Controlled Type 2 Diabetes (E11.9).\n4. Patient meets visual standards for private driving license.');
        setInputValue('meetsStandards', 'Yes');
        setInputValue('plan', '1. Complete and sign the vision certificate form for private driving license renewal.\n2. Advise patient to continue wearing prescribed spectacles for all driving activities.\n3. Recommend annual eye examinations due to history of diabetes.\n4. Provide patient with a copy of the completed certificate form.');
        setInputValue('prognosis', 'Good, visual status is stable and meets requirements for the certificate with corrective lenses.');

        // --- Notes & Reflection ---
        setInputValue('internalNotes', 'Patient was cooperative. Discussed the importance of annual exams due to diabetic status, even though retinopathy is not currently observed.');
        setInputValue('notesReflection', 'This case was straightforward for a driving license renewal. It reinforced the importance of thoroughly documenting BCVA and visual field, even for routine certifications. Also, ensuring the correct restrictions are noted as per local regulations.');
        
        // Final dispatch for all elements to ensure all conditional displays are correctly updated.
        // This is important if some fields were set that *weren't* triggers but might have nested conditionals,
        // or if their default HTML values needed to be overridden and conditional state re-evaluated.
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        document.getElementById('dateOfBirth').dispatchEvent(new Event('change', { bubbles: true })); // Trigger age calc (if patientAge field was there)
    }

    // --- General Conditional Toggle Logic ---
    function setupConditionalToggle(triggerInputId, triggerValues, targetSelector, actionType = 'display', defaultValue = '') {
        const triggerInput = document.getElementById(triggerInputId);
        const targets = document.querySelectorAll(targetSelector);

        if (!triggerInput || targets.length === 0) {
            // console.warn(`Conditional Toggle setup failed: Missing elements for trigger ID "${triggerInputId}" or target selector "${targetSelector}"`);
            return;
        }

        const valuesToActivate = Array.isArray(triggerValues) ? triggerValues : [triggerValues];

        const applyToggleState = () => {
            // console.log(`applyToggleState triggered for "${triggerInputId}" (Current value: "${triggerInput.value}", Checked: ${triggerInput.checked}, Type: ${triggerInput.type})`);

            let activate = false;

            if (triggerInput.type === 'checkbox') {
                activate = triggerInput.checked;
            } else if (triggerInput.type === 'radio') {
                // For radio buttons, we need to check if *this specific radio* is checked AND its value is among the activating values
                // Or, if the event came from another radio in the same group, re-evaluate based on the intended trigger radio's state
                const actualTriggerRadio = document.getElementById(triggerInputId);
                if (actualTriggerRadio) {
                    activate = actualTriggerRadio.checked && valuesToActivate.includes(actualTriggerRadio.value);
                }
            } else if (triggerInput.tagName === 'SELECT') {
                activate = valuesToActivate.includes(triggerInput.value);
            }

            targets.forEach(target => {
                const conditionalGroup = target.closest('.conditional-group');
                if (conditionalGroup) {
                    if (activate) {
                        conditionalGroup.setAttribute('aria-expanded', 'true');
                        conditionalGroup.style.maxHeight = '150px'; // Expand
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
                } else { // Handle non-conditional-group targets (e.g., direct display changes)
                    if (actionType === 'display') {
                        target.style.display = activate ? 'block' : 'none';
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
        { triggerId: 'certificateType', triggerValues: 'Other', targetSelector: '#certificateType_other', actionType: 'display' },
        // IMPORTANT: For radios, the triggerId should be the ID of the radio that *activates* the conditional
        { triggerId: 'ocularROS_notwnl', triggerValues: 'Not WNL', targetSelector: '#ocularROS_details', actionType: 'display' },
        { triggerId: 'systemicROS_notwnl', triggerValues: 'Not WNL', targetSelector: '#systemicROS_details', actionType: 'display' },
        { triggerId: 'colorVisionCertificate', triggerValues: ['Red-Green Deficiency', 'Blue-Yellow Deficiency', 'Acquired Deficiency', 'Other'], targetSelector: '#colorVisionCertificate_details', actionType: 'display' },
    ];

    conditionalRules.forEach(rule => {
        setupConditionalToggle(rule.triggerId, rule.triggerValues, rule.targetSelector, rule.actionType, rule.defaultValue);
    });

    // --- Function to calculate age from Date of Birth ---
    function calculateAge() {
        const dobInput = document.getElementById('dateOfBirth');
        // No 'patientAge' field in certificate-case.html, so this part is commented out or adjusted
        // const patientAgeInput = document.getElementById('patientAge'); 

        if (!dobInput) return; // if (!dobInput || !patientAgeInput) return;

        dobInput.addEventListener('change', () => {
            const dob = new Date(dobInput.value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            if (!isNaN(age) && age >= 0) {
                // if (patientAgeInput) patientAgeInput.value = age;
                // console.log("Calculated Age:", age); // For debugging
            } else {
                // if (patientAgeInput) patientAgeInput.value = '';
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
            // Check if the input is part of a collapsed conditional group
            const conditionalGroup = input.closest('.conditional-group');
            // An input is considered "active" if it's not disabled AND (either not in a conditional group OR the conditional group is expanded)
            const isVisibleAndEnabled = !input.disabled && (!conditionalGroup || conditionalGroup.getAttribute('aria-expanded') === 'true');

            if (input.name && isVisibleAndEnabled) {
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
            
            // Do NOT call form.reset() or clearAllFormFields() here if you want the data to remain visible after saving.
            // If you want to clear after saving, uncomment the next line:
            // clearFormButton.click(); // Simulate a click on the clear button

            // No need to dispatch events or calculateAge here if form isn't reset.
        });
    }

    // --- Clear Form Handler ---
    if (clearFormButton) {
        clearFormButton.addEventListener('click', () => {
            clearAllFormFields(); // Use our new function for a true clear
            localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);
            // calculateAge(); // Will be implicitly called by dateOfBirth dispatch
            alert('Form cleared!');
        });
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
                    const radioButtons = form.querySelectorAll(`input[type="radio"][name="${key}"]`);
                    radioButtons.forEach(radio => {
                        if (radio.value === draftData[key]) {
                            radio.checked = true;
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

    // --- AUTO-FILL ON PAGE LOAD ---
    // This will ONLY run if no saved draft is found for this case type.
    if (!savedDraft && currentCaseType === 'certificate') { 
        fillDemoDataCertificate();
    }

    // Final initial dispatch for all elements on page load to ensure all conditional displays are correctly updated.
    // This catches anything missed by previous dispatches, especially if default HTML values change state.
    // This also ensures that if fillDemoDataCertificate() was NOT called, the conditional fields still collapse
    // if their HTML default values don't activate them.
    form.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
});
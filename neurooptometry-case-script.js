document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optometryCaseForm');
    if (!form) {
        console.warn('Neuro-Optometry Script: No form found with ID "optometryCaseForm". Exiting.');
        return;
    }

    // Removed: const fillDemoDataButton = document.getElementById('fillDemoData'); // No longer needed
    const clearFormButton = document.getElementById('clearForm');
    const saveCaseButton = document.getElementById('saveCase');
    const caseTypeElement = form.querySelector('input[name="caseType"]');
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'neurooptometry';

    /**
     * Helper to set value and dispatch change event for an input.
     * Handles radio buttons and select elements correctly.
     * For checkboxes, `value` should be a boolean (true/false) to check/uncheck.
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
                        radio.checked = false;
                    }
                });
                if (!found && value !== '') {
                    // console.warn(`setInputValue: Radio button with name "${input.name}" and value "${value}" not found to check.`);
                }
            } else if (input.tagName === 'SELECT') {
                input.value = value;
            } else if (input.type === 'checkbox') {
                input.checked = value; // `value` here is expected to be a boolean
            } else {
                input.value = value;
            }
            input.dispatchEvent(new Event('change', { bubbles: true }));
        } catch (e) {
            console.error(`Error setting value for ID "${id}" (type: ${type}, value: "${value}")`, e);
        }
    }

    // Function to handle setting checkbox group values (where checkboxes share the same name)
    // NOTE: Your HTML checkboxes have unique names (e.g., vfp_visualFieldLoss, vfp_diplopia), 
    // so `setInputValue` for each ID with a boolean will be used.
    // This function is kept for reference if you change your HTML structure.
    function setCheckboxGroupValues(name, valuesArray) {
        const checkboxes = form.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
        checkboxes.forEach(cb => {
            cb.checked = valuesArray.includes(cb.value);
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    function clearAllFormFields() {
        form.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.tagName === 'SELECT') {
                const firstOption = input.querySelector('option[value=""]');
                if (firstOption) {
                    input.value = '';
                } else if (input.options.length > 0) {
                    input.selectedIndex = 0;
                }
            } else {
                input.value = '';
            }
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    // Function to fill all fields with demo data for Neuro-Optometry Case
    function fillDemoDataNeuroOptometry() {
        console.log("Filling demo data for Neuro-Optometry Case automatically...");

        // Clear existing local storage data for this case type before filling
        localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);
        
        // Use clearAllFormFields to reset the form to a truly empty state first
        clearAllFormFields(); 

        const today = new Date();
        const dob = new Date('1978-03-25');
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        // --- Patient Info ---
        setInputValue('patientId', 'NEURO-007-SJ');
        setInputValue('patientName', 'Sarah Johnson');
        setInputValue('dateOfBirth', '1978-03-25');
        // 'patientAge' is populated by the calculateAge function, no direct set needed here
        setInputValue('dateOfInjuryOnset', '2023-10-10');
        setInputValue('typeOfInjuryCondition', 'Traumatic Brain Injury (TBI)');
        setInputValue('injuryDetails', 'Fall, hit head, sustained moderate TBI. Hospitalized for 3 days.'); 
        setInputValue('previousNeuroRehabYes', 'Yes', 'radio');
        setInputValue('previousNeuroRehab_details', 'Physical Therapy and Occupational Therapy for 3 months post-injury. Completed 1 month ago.');

        // --- Chief Complaint (CC) ---
        setInputValue('chiefComplaint', 'Persistent double vision, blurry vision, and dizziness since TBI.');
        setInputValue('hpi', 'Patient reports onset of binocular double vision, intermittent blurry vision, and generalized dizziness following a TBI sustained 8 months ago. Symptoms worsen with head movement, reading, and prolonged visual tasks. Avoids busy environments. Headaches are frequent, 6/10 intensity, throbbing, located frontal/temporal. Denies flashes, floaters, or pain.');
        // Corrected: Set individual checkboxes for Functional Vision Problems
        setInputValue('vfp_visualFieldLoss', true, 'checkbox');
        setInputValue('vfp_diplopia', true, 'checkbox');
        setInputValue('vfp_spatialDisorientation', true, 'checkbox');
        setInputValue('vfp_balanceIssues', true, 'checkbox');
        setInputValue('vfp_readingDifficulty', true, 'checkbox');
        setInputValue('vfp_photophobia', false, 'checkbox'); // Example of unchecking
        setInputValue('vfp_visualMidlineShift', true, 'checkbox');
        setInputValue('vfp_visualConfusion', false, 'checkbox'); // Example of unchecking
        setInputValue('functionalGoals', 'Reduce double vision, improve reading comfort, decrease dizziness, return to work as an accountant.');

        // --- History ---
        setInputValue('poh', 'No significant POH prior to TBI. Last eye exam 1 year prior to injury, WNL.');
        setInputValue('pmh', 'Controlled hypertension (started after TBI). No other systemic conditions.');
        setInputValue('allergies', 'NKDA (No Known Drug Allergies).');
        setInputValue('medications', 'Lisinopril 10mg QD, Acetaminophen PRN for headaches.');

        // --- Examination (Neuro-Optometry Focused) ---
        setInputValue('vaBestCorrectedHabitualOD', '20/25');
        setInputValue('vaBestCorrectedHabitualOS', '20/25');
        setInputValue('vaBestCorrectedHabitualOU', '20/30 (with diplopia)');
        setInputValue('pupilsNeuro', 'PERRLA');
        // Corrected: eomsNeuro is a textarea
        setInputValue('eomsNeuro', 'OD: Abduction limitation 1+. OS: Mild adduction overshoot. Pursuit asymmetry. Saccades: hypometric OD, normal OS. Pursuits: jerky OU.'); 
        setInputValue('visualFieldLossYes', 'Yes', 'radio');
        setInputValue('visualFieldLoss_details', 'Confrontation field shows mild restriction inferonasally OS.');
        setInputValue('diplopiaCharting', 'Eso XT 8PD at distance, Eso XT 12PD at near. Worse in right gaze. Vertical component 2PD R/L.');
        setInputValue('oculomotorDysfunctionYes', 'Yes', 'radio');
        setInputValue('oculomotorDysfunction_details', 'Saccadic inaccuracy, dysmetric pursuits, convergence insufficiency (NPC to 15cm break/20cm recovery).');
        setInputValue('perceptualDeficitsYes', 'Yes', 'radio');
        setInputValue('perceptualDeficits_details', 'Visuospatial neglect (mild left-sided), visual midline shift (to the right).');
        setInputValue('balanceIssuesYes', 'Yes', 'radio');
        setInputValue('balanceIssues_details', 'Sway noted on tandem stance with eyes closed. Reports veering to the left.');
        setInputValue('refractionNeuro', 'OD: +0.25 -0.50 x 180, OS: PL -0.25 x 90. No significant change from previous.');

        // --- Rehabilitation & Aids ---
        setInputValue('prescribedPrism', 'Yoked prism 2^ BO OD, 2^ BI OS, with 2^BD R/L for symptom relief. Trialed Fresnel.');
        setInputValue('prescribedFilters', 'FL-41 tint (rose) for photophobia and reducing visual stress.');
        setInputValue('visionTherapyGoals', 'Improve saccadic accuracy, pursuit initiation/accuracy, convergence amplitude/facility, visual-vestibular integration, and visual midline awareness.');
        setInputValue('homeExercisesPrescribed', 'Pencil push-ups, Brock String, Saccadic training with Marsden balls, Balance board with visual targets.');
        setInputValue('referralOTYes', 'Yes', 'radio');
        setInputValue('referralOT_details', 'Referral to Occupational Therapy for ADL training with visual deficits, spatial organization, and visual motor integration.');
        setInputValue('referralPTYes', 'Yes', 'radio');
        setInputValue('referralPT_details', 'Referral to Physical Therapy for balance and gait training, especially with visual input/challenge.');
        setInputValue('referralSpeechNo', 'No', 'radio'); // Explicitly set to No

        // --- Assessment & Plan ---
        setInputValue('assessmentDiagnoses', '1. Post-concussive syndrome with oculomotor dysfunction OU (H53.20).\n2. Convergence insufficiency (H51.11).\n3. Binocular diplopia (H53.2).\n4. Visuospatial neglect (H53.19).\n5. Visual midline shift syndrome.');
        setInputValue('plan', '1. Prescribe corrective lenses with prescribed prism and FL-41 filters.\n2. Initiate Phase 1 Vision Therapy (8-10 sessions) focusing on oculomotor control, vergence, and visual-vestibular integration.\n3. Home exercises: Start with basic pencil push-ups, Brock String, and saccadic drills 2-3x daily.\n4. Referrals to OT and PT for co-management.\n5. RTC 2 weeks for dispensing new Rx and VT instruction, then 4 weeks for VT progress evaluation.');
        setInputValue('prognosis', 'Good for significant improvement in symptoms and functional vision with consistent therapy and compliance with prescribed aids.');
        setInputValue('followUpInstructions', 'Wear new spectacles full-time. Perform home exercises daily. Attend all therapy appointments. Contact office immediately for worsening symptoms or new visual changes. Return in 2 weeks for VT initiation.');

        // --- Notes & Reflection ---
        setInputValue('internalNotes', 'Patient is highly motivated but easily overwhelmed. Emphasized gradual progression of therapy. Counseled on importance of consistency. Provided handouts for visual hygiene.');
        setInputValue('notesReflection', 'This case showcases a complex TBI presentation requiring a multi-faceted neuro-optometric approach. The combination of prism, filters, and structured vision therapy, alongside interdisciplinary referrals, is crucial for addressing the wide range of visual and perceptual deficits.'); 
    }


    // --- General Conditional Toggle Logic (UPDATED to prevent double listeners) ---
    function setupConditionalToggle(triggerInputId, triggerValues, targetSelector, actionType = 'display', defaultValue = '') {
        const triggerInput = document.getElementById(triggerInputId);
        const targets = document.querySelectorAll(targetSelector);

        if (!triggerInput || targets.length === 0) {
            // console.warn(`Neuro-Optometry Toggle: Setup failed - Missing elements for trigger ID "${triggerInputId}" or target selector "${targetSelector}"`);
            return;
        }

        const valuesToActivate = Array.isArray(triggerValues) ? triggerValues : [triggerValues];

        const applyToggleState = () => {
            let activate = false;

            if (triggerInput.type === 'checkbox') {
                activate = triggerInput.checked;
            } else if (triggerInput.type === 'radio') {
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
                        conditionalGroup.style.maxHeight = '150px'; // Adjust as needed for content
                        conditionalGroup.style.opacity = '1';
                        conditionalGroup.style.pointerEvents = 'auto';
                        conditionalGroup.style.padding = '10px';
                        conditionalGroup.style.marginTop = '10px';
                        conditionalGroup.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
                            input.disabled = false;
                        });
                    } else {
                        conditionalGroup.setAttribute('aria-expanded', 'false');
                        conditionalGroup.style.maxHeight = '0';
                        conditionalGroup.style.opacity = '0';
                        conditionalGroup.style.pointerEvents = 'none';
                        conditionalGroup.style.padding = '0 10px';
                        conditionalGroup.style.marginTop = '0';

                        conditionalGroup.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(input => {
                            input.value = defaultValue;
                            input.disabled = true;
                            if (input.type === 'checkbox' || input.type === 'radio') {
                                input.checked = false;
                            } else if (input.tagName === 'SELECT') {
                                input.selectedIndex = 0;
                            }
                        });
                    }
                } else {
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

        // For radio groups, *all* radios in the group need to trigger the toggle check.
        // IMPORTANT: Prevent double-attaching to the triggerInput itself.
        if (triggerInput.type === 'radio') {
            document.querySelectorAll(`input[type="radio"][name="${triggerInput.name}"]`).forEach(radio => {
                // Only add listener if it's a *different* radio in the group, to prevent double-firing
                if (radio.id !== triggerInputId) { 
                    radio.addEventListener('change', applyToggleState);
                }
            });
        }
        applyToggleState(); // Apply initial state on load
    }

    // --- Data-driven setup for all conditional toggles ---
    const conditionalRules = [
        { triggerId: 'typeOfInjuryCondition', triggerValues: 'Other', targetSelector: '#injuryDetails', actionType: 'display' },
        { triggerId: 'typeOfInjuryCondition', triggerValues: ['Traumatic Brain Injury (TBI)', 'Stroke', 'Concussion', 'Multiple Sclerosis (MS)', 'Other Neurological Condition', ''], targetSelector: '#injuryDetails', actionType: 'display', defaultValue: '' },

        { triggerId: 'previousNeuroRehabYes', triggerValues: 'Yes', targetSelector: '#previousNeuroRehab_details', actionType: 'display' },
        { triggerId: 'previousNeuroRehabNo', triggerValues: 'No', targetSelector: '#previousNeuroRehab_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'visualFieldLossYes', triggerValues: 'Yes', targetSelector: '#visualFieldLoss_details', actionType: 'display' },
        { triggerId: 'visualFieldLossNo', triggerValues: 'No', targetSelector: '#visualFieldLoss_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'oculomotorDysfunctionYes', triggerValues: 'Yes', targetSelector: '#oculomotorDysfunction_details', actionType: 'display' },
        { triggerId: 'oculomotorDysfunctionNo', triggerValues: 'No', targetSelector: '#oculomotorDysfunction_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'perceptualDeficitsYes', triggerValues: 'Yes', targetSelector: '#perceptualDeficits_details', actionType: 'display' },
        { triggerId: 'perceptualDeficitsNo', triggerValues: 'No', targetSelector: '#perceptualDeficits_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'balanceIssuesYes', triggerValues: 'Yes', targetSelector: '#balanceIssues_details', actionType: 'display' },
        { triggerId: 'balanceIssuesNo', triggerValues: 'No', targetSelector: '#balanceIssues_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'referralOTYes', triggerValues: 'Yes', targetSelector: '#referralOT_details', actionType: 'display' },
        { triggerId: 'referralOTNo', triggerValues: 'No', targetSelector: '#referralOT_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'referralPTYes', triggerValues: 'Yes', targetSelector: '#referralPT_details', actionType: 'display' },
        { triggerId: 'referralPTNo', triggerValues: 'No', targetSelector: '#referralPT_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'referralSpeechYes', triggerValues: 'Yes', targetSelector: '#referralSpeech_details', actionType: 'display' },
        { triggerId: 'referralSpeechNo', triggerValues: 'No', targetSelector: '#referralSpeech_details', actionType: 'display', defaultValue: '' },
    ];
    conditionalRules.forEach(rule => {
        setupConditionalToggle(rule.triggerId, rule.triggerValues, rule.targetSelector, rule.actionType, rule.defaultValue);
    });

    // --- Function to calculate age from Date of Birth ---
    function calculateAge() {
        const dobInput = document.getElementById('dateOfBirth');
        const patientAgeInput = document.getElementById('patientAge');
        if (!dobInput || !patientAgeInput) return;

        const updateAge = () => {
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
        };

        dobInput.addEventListener('change', updateAge);
        // Do not call updateAge here on initial load, it will be called after data is set
    }


    // --- Function to gather all form data ---
    function collectFormData() {
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            const conditionalGroup = input.closest('.conditional-group');
            // Check if the input itself is disabled or if its parent conditional group is collapsed
            const isVisibleAndEnabled = !input.disabled && (!conditionalGroup || conditionalGroup.getAttribute('aria-expanded') === 'true');

            if (input.name && isVisibleAndEnabled) {
                if (input.type === 'checkbox') {
                    // Checkboxes with unique names are treated individually
                    // Checkboxes for the same logical group (e.g., vfp_*) are collected if checked
                    // If a checkbox is part of a group but has a unique name, it will be added as a boolean or its value
                    // The HTML currently has unique names for vfp_ checkboxes, so this logic will treat them as individual booleans/values
                    if (input.checked) {
                        if (!formData[input.name]) { // If it's the first time seeing this name
                            formData[input.name] = input.value; // Store its value
                        } else if (Array.isArray(formData[input.name])) { // If it's already an array (multiple checkboxes with same name)
                            formData[input.name].push(input.value);
                        } else { // If it's a single value already, convert to array
                            formData[input.name] = [formData[input.name], input.value];
                        }
                    } else {
                        // If unchecked, ensure it's not stored or stored as false if needed (for simplicity, we omit unchecked values)
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
        // Post-processing for fields that might have become arrays (e.g., if you had multiple checkboxes with the SAME name)
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
            
            // Re-dispatch change events to update any UI elements that rely on form state
            form.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
            calculateAge(); // Ensure age is up to date
        });
    }

    // --- Clear Form Handler ---
    if (clearFormButton) {
        clearFormButton.addEventListener('click', (e) => {
            e.preventDefault();
            clearAllFormFields();
            localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);
            calculateAge();
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

    // Load data from Local Storage on page load OR fill demo data
    const savedDraft = localStorage.getItem(localStorageKey);
    if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        for (const key in draftData) {
            const inputElements = form.querySelectorAll(`[name="${key}"]`);
            if (inputElements.length > 0) {
                if (inputElements[0].type === 'checkbox') {
                    const storedValue = String(draftData[key]);
                    inputElements.forEach(cb => {
                        cb.checked = (storedValue === cb.value); // Checks if the stored value matches THIS checkbox's value
                        cb.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                } else if (inputElements[0].type === 'radio') {
                    inputElements.forEach(radio => {
                        if (radio.value === draftData[key]) {
                            radio.checked = true;
                        } else {
                            radio.checked = false;
                        }
                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                } else {
                    inputElements[0].value = draftData[key];
                    inputElements[0].dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }
        alert(`Loaded saved draft for ${currentCaseType.replace(/([A-Z])/g, ' $1').trim()} case from previous session.`);
    } else {
        // If no saved draft, automatically fill demo data
        fillDemoDataNeuroOptometry();
    }

    // Initial dispatch for all elements and age calculation after data (draft or demo) is set
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    calculateAge(); // Calculate age after all data is loaded/filled
});
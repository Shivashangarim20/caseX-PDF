// This file is lowvision-case-script.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optometryCaseForm');
    if (!form) {
        console.warn('No form found with ID "optometryCaseForm" on this page. Script may not function as expected.');
        return;
    }

    const fillDemoDataButton = document.getElementById('fillDemoData');
    const clearFormButton = document.getElementById('clearForm');
    const saveCaseButton = document.getElementById('saveCase');
    const caseTypeElement = form.querySelector('input[name="caseType"]');
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'lowvision';

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

    // Function to handle setting checkbox group values (e.g., ADLs)
    function setCheckboxGroupValues(name, valuesArray) {
        const checkboxes = form.querySelectorAll(`input[type="checkbox"][name="${name}"]`);
        checkboxes.forEach(cb => {
            cb.checked = valuesArray.includes(cb.value);
            cb.dispatchEvent(new Event('change', { bubbles: true }));
        });
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

    // Function to fill all fields with demo data for Low Vision Case (manual trigger)
    function fillDemoDataLowVision() {
        console.log("Manually filling demo data for Low Vision Case...");

        // Clear existing local storage data for this case type before filling
        localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);

        // Use clearAllFormFields to reset the form to a truly empty state first
        clearAllFormFields(); 
        // NOTE: This will also trigger all conditionals to collapse and clear, then demo data fills them in.

        const today = new Date();
        const dob = new Date('1955-03-15');
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        // --- Patient Info ---
        setInputValue('patientId', 'LV-003-RB');
        setInputValue('patientName', 'Robert Brown');
        setInputValue('dateOfBirth', '1955-03-15');
        // Age will be calculated by the 'change' event on dateOfBirth
        setInputValue('primaryLowVisionCause', 'Age-related Macular Degeneration (AMD), geographic atrophy OU, worse OS.');
        setInputValue('onsetProgressionLv', 'Gradual bilateral vision loss over the past 8 years, central scotoma worsening. Stable for the last 6 months.');

        // --- Chief Complaint (CC) - Low Vision ---
        setInputValue('chiefComplaint', 'Difficulty reading, inability to recognize faces at a distance, and challenges with mobility in unfamiliar environments.');
        setInputValue('functionalVisionConcerns', 'Patient cannot read newspaper print, struggles to see the TV, has difficulty with food preparation (chopping), and avoids driving at night. Finds it hard to see steps or curbs.');
        setCheckboxGroupValues('adl_reading', ['Reading', 'Writing', 'Cooking', 'Mobility', 'Face Recognition', 'TV/Computer Use']); // Use helper
        setInputValue('lvGoals', 'Patient wants to be able to read personal mail, prepare simple meals independently, and safely navigate his home and familiar outdoor areas. Would like to enjoy watching TV again.');

        // --- History ---
        setInputValue('lightingPreferences', 'Prefers very bright, warm (3000K) direct lighting for near tasks. Finds natural daylight comfortable for general activities.');
        setInputValue('glareSensitivityLv', 'Moderate glare sensitivity, particularly outdoors on sunny days or in brightly lit stores.');
        setInputValue('currentAidsUsed', 'Currently uses a 3x handheld illuminated magnifier (OpticLens) for occasional large print, but finds it cumbersome. No other specialized aids.');
        setInputValue('mobilityImpairmentYes', 'Yes', 'radio');
        setInputValue('mobility_details_group', 'Struggles with depth perception for stairs and curbs, leading to occasional stumbles. Avoids going out alone after dark.');

        // --- Examination (Low Vision Focused) ---
        setInputValue('vaChartUsed', 'ETDRS');
        // vaChartUsed_other will be cleared by conditional
        setInputValue('vaDistanceOD', '0.8 LogMAR (20/125, 6/38)');
        setInputValue('vaDistanceOS', '1.0 LogMAR (20/200, 6/60)');
        setInputValue('vaNearOD', '0.8 M at 20cm');
        setInputValue('vaNearOS', '1.0 M at 20cm');
        setInputValue('prl', 'Superior-temporal PRL OD, Inferior-temporal PRL OS (verified with Macular Perimeter).');
        setInputValue('eccentricViewingStatus', 'Initiated');
        setInputValue('contrastSensitivityLv', 'Pelli-Robson chart: 0.75 log units OU.');
        setInputValue('contrastSensitivityChart', 'Pelli-Robson');
        // contrastSensitivityChart_other will be cleared by conditional
        setInputValue('amslerGridOD', 'Dense central scotoma encompassing the fovea.');
        setInputValue('amslerGridOS', 'Larger, denser central scotoma with adjacent metamorphopsia.');
        setInputValue('visualFieldSpecificsLv', 'Humphrey 10-2 test (SITA-Fast): Significant central depression OD, absolute central scotoma OS.');
        setInputValue('visualFieldType', 'Central Scotoma');
        // visualFieldType_other will be cleared by conditional
        setInputValue('refractionLv', 'OD: +1.00 -0.50 x 90 Add +3.00, BCVA 0.8 LogMAR\nOS: +1.50 DS Add +3.00, BCVA 1.0 LogMAR');
        setInputValue('magnificationNeeded', 'For 0.8M print at 40cm, approx. 4X magnification for OS.');
        setInputValue('lightingAssessment', 'Patient benefits significantly from a high-CRI (90+), 4000K LED task lamp with adjustable dimmer. Minimal benefit from overhead room lighting alone.');

        // --- Low Vision Aids Evaluation ---
        setInputValue('handMagnifiers', 'Evaluated various handheld magnifiers. Patient found an Eschenbach Smartlux DIGITAL (5-12x) easier to manage and preferred its adjustable illumination and contrast modes for spot reading and labels.');
        setInputValue('standMagnifiers', 'Recommended a Coil 7x illuminated stand magnifier. Patient found it stable and useful for longer reading tasks with both eyes.');
        setInputValue('telescopes', 'Tried an Eschenbach 2.5x Monocular for TV viewing, found some benefit but needs training. Patient not interested in bifocal telescopes at this time.');
        setInputValue('filterLenses', 'Recommended No. 527 (orange-red) filter lenses for outdoor use to reduce glare and improve contrast, patient found it comfortable.');
        setInputValue('nonOpticalAids', 'Provided a signature guide and a bold-lined writing guide. Discussed large print calendars, check registers, and adapted kitchen tools. Recommended high-contrast cutting board.');
        setInputValue('electronicAids', 'Demonstrated a desktop CCTV (Freedom Scientific ONYX) and a portable video magnifier (VisioBook). Patient preferred the desktop unit for home use, but found the portable too small. Referred for training on electronic aids.');
        setInputValue('audioTactileAids', 'Discussed talking watch and audio labels. Patient showed interest in audiobooks via library services.');
        setInputValue('aidsDispensedYes', 'Yes', 'radio');
        setInputValue('aidsDispensedList', '1. Eschenbach Smartlux DIGITAL (5-12x) handheld video magnifier.\n2. Coil 7x illuminated stand magnifier.\n3. No. 527 filter clip-on lenses.\nInstructions: Practice using magnifiers for 15-20 min daily. Keep a journal of successes and challenges.');

        // --- Referrals & Rehabilitation ---
        setInputValue('referralOMYes', 'Yes', 'radio');
        setInputValue('referralOM_details', 'Referral to local O&M specialist (Community Vision Services) for outdoor mobility training, especially for curbs, stairs, and navigating unfamiliar public spaces. Emphasis on use of white cane for safety.');
        setInputValue('referralOTYes', 'Yes', 'radio');
        setInputValue('referralOT_details', 'Referral to Occupational Therapist (Hospital Rehabilitation Dept) for ADL training, focusing on kitchen safety, medication management, and general home independence. Also for assessment of home modifications.');
        setInputValue('referralSSYes', 'Yes', 'radio');
        setInputValue('referralSS_details', 'Provided information for the local Low Vision Support Group and the National Federation of the Blind. Discussed applying for disability benefits if needed.');
        setInputValue('otherReferralsLv', 'Referred to retina specialist for 6-month follow-up on AMD status. Discussed nutritional supplements for AMD (AREDS 2).');

        // --- Assessment & Plan ---
        setInputValue('assessmentDiagnoses', '1. Age-related Macular Degeneration (AMD) OU, geographic atrophy (H35.313), profound vision loss OS, severe vision loss OD.\n2. Functional vision impairment OU due to central scotoma affecting reading, face recognition, and mobility.\n3. Goals: Improve functional independence and safety for ADLs.');
        setInputValue('plan', '1. Optical Aids: Dispensed and trained on Eschenbach Smartlux DIGITAL and Coil 7x stand magnifier. Prescribed No. 527 filter lenses.\n2. Non-optical Aids: Provided writing guides. Discussed adapted kitchen tools and high-contrast items.\n3. Rehabilitation: Referred to O&M specialist for mobility training and OT for ADL training and home modifications.\n4. Patient Education: Discussed eccentric viewing practice, proper lighting, and glare control.\n5. Follow-up: RTC 3 months for low vision evaluation to assess aid effectiveness and further training. Encourage patient to attend support group.');
        setInputValue('prognosis', 'Fair for improving functional independence and quality of life with consistent use of prescribed aids and engagement in rehabilitation services.');
        setInputValue('followUpInstructions', 'Practice using new magnifiers daily. Contact O&M and OT services within 2 weeks. Return to clinic in 3 months for follow-up low vision evaluation. Report any sudden changes in vision immediately.');

        // --- Notes & Reflection ---
        setInputValue('internalNotes', 'Patient is motivated but somewhat overwhelmed by the extent of vision loss. Emphasized small, achievable goals. Needs strong encouragement to use the white cane. Provided contact details for local low vision agencies.');
        setInputValue('notesReflection', 'This case underscores the critical role of a multi-disciplinary approach in low vision. Patient\'s frustration with current aids highlighted the need for hands-on evaluation and training with a range of devices. The comprehensive referral plan addresses multiple areas of functional impairment, which is key for improving quality of life beyond just optical correction. Patience and clear communication of realistic expectations are paramount.');

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
                // For checkboxes, triggerValues must include the actual checkbox's value to activate.
                // This means if it's a multi-select checkbox group, activating only if *this* checkbox's value matches a trigger value.
                activate = triggerInput.checked && valuesToActivate.includes(triggerInput.value); 
                // OR if the conditional should activate if *any* of the checkboxes in a group is checked:
                // activate = Array.from(document.querySelectorAll(`input[type="checkbox"][name="${triggerInput.name}"]:checked`))
                //                 .some(cb => valuesToActivate.includes(cb.value));
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
                        // if (triggerInput.hasAttribute('aria-controls') && triggerInput.getAttribute('aria-controls').includes(target.id)) {
                        //     target.setAttribute('aria-expanded', activate); // Only if aria-controls points to it
                        // }
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
        { triggerId: 'mobilityImpairmentYes', triggerValues: 'Yes', targetSelector: '#mobility_details_group', actionType: 'display' },
        { triggerId: 'mobilityImpairmentNo', triggerValues: 'No', targetSelector: '#mobility_details_group', actionType: 'display', defaultValue: '' },
        { triggerId: 'vaChartUsed', triggerValues: 'Other', targetSelector: '#vaChartUsed_other', actionType: 'display' },
        { triggerId: 'vaChartUsed', triggerValues: ['ETDRS', 'Lighthouse', 'Feinbloom', 'Snellen', ''], targetSelector: '#vaChartUsed_other', actionType: 'display', defaultValue: '' }, // Added empty value to deactivate
        { triggerId: 'contrastSensitivityChart', triggerValues: 'Other', targetSelector: '#contrastSensitivityChart_other', actionType: 'display' },
        { triggerId: 'contrastSensitivityChart', triggerValues: ['Pelli-Robson', 'LEA Symbols', 'FACT', ''], targetSelector: '#contrastSensitivityChart_other', actionType: 'display', defaultValue: '' }, // Added empty value
        { triggerId: 'visualFieldType', triggerValues: 'Other', targetSelector: '#visualFieldType_other', actionType: 'display' },
        { triggerId: 'visualFieldType', triggerValues: ['Central Scotoma', 'Peripheral Field Loss', 'Hemianopsia', 'Tunnel Vision', 'Generalized Depression', ''], targetSelector: '#visualFieldType_other', actionType: 'display', defaultValue: '' }, // Added empty value
        { triggerId: 'aidsDispensedYes', triggerValues: 'Yes', targetSelector: '#aidsDispensedList', actionType: 'display' },
        { triggerId: 'aidsDispensedNo', triggerValues: 'No', targetSelector: '#aidsDispensedList', actionType: 'display', defaultValue: '' },
        { triggerId: 'referralOMYes', triggerValues: 'Yes', targetSelector: '#referralOM_details', actionType: 'display' },
        { triggerId: 'referralOMNo', triggerValues: 'No', targetSelector: '#referralOM_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'referralOTYes', triggerValues: 'Yes', targetSelector: '#referralOT_details', actionType: 'display' },
        { triggerId: 'referralOTNo', triggerValues: 'No', targetSelector: '#referralOT_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'referralSSYes', triggerValues: 'Yes', targetSelector: '#referralSS_details', actionType: 'display' },
        { triggerId: 'referralSSNo', triggerValues: 'No', targetSelector: '#referralSS_details', actionType: 'display', defaultValue: '' },
    ];

    conditionalRules.forEach(rule => {
        setupConditionalToggle(rule.triggerId, rule.triggerValues, rule.targetSelector, rule.actionType, rule.defaultValue);
    });

    // --- Function to calculate age from Date of Birth ---
    function calculateAge() {
        const dobInput = document.getElementById('dateOfBirth');
        const patientAgeInput = form.querySelector('[name="patientAge"]'); // Assuming there's a patientAge input somewhere

        if (!dobInput) return; // Only trigger if dobInput exists

        const updateAge = () => {
            const dob = new Date(dobInput.value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            if (patientAgeInput) { // Only update if patientAge input exists
                if (!isNaN(age) && age >= 0) {
                    patientAgeInput.value = age;
                } else {
                    patientAgeInput.value = '';
                }
            }
        };

        dobInput.addEventListener('change', updateAge);

        if (dobInput.value) {
            updateAge(); // Calculate on load if DOB is already set
        }
    }
    calculateAge();

    // --- Function to gather all form data ---
    function collectFormData() {
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Check if the input is part of a collapsed conditional group
            // Now that setupConditionalToggle disables inputs, we can just check `!input.disabled`
            if (input.name && !input.disabled) {
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
            
            // If you want to clear after saving, uncomment the next line:
            // clearFormButton.click(); // Simulate a click on the clear button
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
        fillDemoDataButton.addEventListener('click', fillDemoDataLowVision);
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
                        cb.dispatchEvent(new Event('change', { bubbles: true })); // Dispatch change event
                    });
                } else if (input.type === 'radio') {
                    const radioButtons = form.querySelectorAll(`input[type="radio"][name="${key}"]`);
                    radioButtons.forEach(radio => {
                        if (radio.value === draftData[key]) {
                            radio.checked = true;
                        } else {
                            radio.checked = false; // Ensure others are unchecked
                        }
                        radio.dispatchEvent(new Event('change', { bubbles: true })); // Dispatch change event
                    });
                } else {
                    input.value = draftData[key];
                    input.dispatchEvent(new Event('change', { bubbles: true })); // Dispatch change event
                }
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
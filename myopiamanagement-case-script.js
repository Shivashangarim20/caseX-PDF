// This file is myopiamanagement-case-script.js
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
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'myopiamanagement';

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

    // Function to handle setting checkbox group values (if any)
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

    // Function to fill all fields with demo data for Myopia Management Case (manual trigger)
    function fillDemoDataMyopiaManagement() {
        console.log("Manually filling demo data for Myopia Management Case...");

        // Clear existing local storage data for this case type before filling
        localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);

        // Use clearAllFormFields to reset the form to a truly empty state first
        clearAllFormFields(); 

        const today = new Date();
        const dob = new Date('2015-08-20');
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }

        // --- Patient Info ---
        setInputValue('patientId', 'MM-005-LC');
        setInputValue('patientName', 'Lily Chen');
        setInputValue('dateOfBirth', '2015-08-20');
        setInputValue('patientAge', age); // Set calculated age
        setInputValue('parentalMyopiaHistory', 'Mother: -6.00D, Father: -4.50D. Both had high myopia progression in childhood.');
        setInputValue('dateOfFirstMyopiaDiagnosis', '2023-03-01');

        // --- Chief Complaint (CC) ---
        setInputValue('chiefComplaint', 'Myopia progression, glasses getting stronger every 6-8 months. Parents concerned about high myopia risks.');
        setInputValue('myopiaProgressionConcern', 'Patient has had a -0.75D to -1.00D increase annually for the last 2 years. Parents are anxious and asking for management options.');
        setInputValue('nearWorkHoursPerDay', '6');
        setInputValue('outdoorHoursPerDay', '1.0');
        setInputValue('hpi', 'Lily is a 9-year-old female diagnosed with myopia at age 7. Her prescription has progressed from -0.75D OU to -2.50D OU over the last two years, with the latest change being -0.75D in the last 8 months. She spends approximately 6 hours on near work (tablet for school, reading) and 1 hour outdoors daily. No ocular pain, redness, or other visual symptoms. Parents are highly motivated for intervention.');

        // --- History ---
        setInputValue('poh', 'Diagnosed with simple myopia at age 7. No amblyopia or strabismus history. No previous myopia management interventions.');
        setInputValue('pmh', 'Healthy, no systemic conditions.');
        setInputValue('allergies', 'No known allergies.');
        setInputValue('medications', 'None.');

        // --- Examination (Myopia Focused) ---
        setInputValue('vaBestCorrectedHabitualOD', '20/20 (6/6) with -2.50 -0.25 x 180');
        setInputValue('vaBestCorrectedHabitualOS', '20/20 (6/6) with -2.25 -0.50 x 005');
        setInputValue('manifestRefractionOD', '-2.75 -0.25 x 180');
        setInputValue('manifestRefractionOS', '-2.50 -0.50 x 005');
        setInputValue('cycloplegicRefractionOD', '-2.50 -0.25 x 175');
        setInputValue('cycloplegicRefractionOS', '-2.25 -0.50 x 005');
        setInputValue('axialLengthOD', '24.25');
        setInputValue('axialLengthOS', '24.18');
        setInputValue('k1OD', '43.75');
        setInputValue('k2OD', '44.25');
        setInputValue('axisOD', '175');
        setInputValue('k1OS', '43.80');
        setInputValue('k2OS', '44.30');
        setInputValue('axisOS', '005');
        setInputValue('peripheralRefractionOD', 'Slight hyperopic shift +0.25D at 30 degrees nasal.');
        setInputValue('peripheralRefractionOS', 'Slight hyperopic shift +0.50D at 30 degrees temporal.');

        // --- Management & Treatment ---
        setInputValue('currentManagementMethod', 'Multifocal Soft Contact Lenses'); // This will trigger MFCL group
        // No explicit dispatch needed here because setInputValue already dispatches.
        
        setInputValue('mfclLensParameters', 'OD: MiSight -2.50D, medium add. OS: MiSight -2.25D, medium add.');
        // Atropine, OrthoK, Spectacle details will be cleared by conditional logic

        setInputValue('complianceManagement', 'Anticipated good compliance given parental motivation and patient\'s comfort with handling lenses.');
        setInputValue('sideEffectsManagement', 'Discussed potential dryness or initial discomfort with contact lenses. Advised on proper hygiene and wearing schedule.');
        setInputValue('patientEducationProvided', 'Reinforced importance of daily outdoor time (aim for 2+ hours), 20-20-20 rule, proper lighting, and ergonomics for near work. Explained risks associated with high myopia (retinal detachment, glaucoma, maculopathy) and how management aims to reduce these risks. Discussed adaptation period for MFCL.');

        // --- Assessment & Plan ---
        setInputValue('assessmentDiagnoses', '1. Myopia OU (H52.1), moderate progression. (-0.75D/year, +0.07mm AL/year).\n2. High risk for future high myopia due to strong parental history and current progression rate.\n3. Patient and parents highly motivated for active management.');
        setInputValue('plan', '1. Prescribe MiSight 1-day multifocal soft contact lenses OU with new prescription.\n2. Initiate MiSight treatment: OD: -2.50D, medium add. OS: -2.25D, medium add.\n3. Patient education on lens wear, care, hygiene, and progressive adaptation.\n4. Lifestyle modifications: Reinforce 2+ hours outdoor time daily. Implement 20-20-20 rule for near work. Optimize lighting and ergonomics.\n5. RTC 1 month for contact lens follow-up and adaptation check. Then RTC 3 months for full myopia management follow-up including repeat refraction, axial length, and keratometry.');
        setInputValue('prognosis', 'Good prognosis for slowing myopia progression with consistent use of MiSight lenses and adherence to lifestyle recommendations.');
        setInputValue('followUpInstructions', 'Wear contact lenses daily as prescribed. Remove before swimming/showering. Practice good hand hygiene. Increase outdoor time to at least 2 hours daily. Use the 20-20-20 rule for near work. Return in 1 month for contact lens check, then 3 months for myopia management check-up.');

        // --- Notes & Reflection ---
        setInputValue('internalNotes', 'Lily is a bright and cooperative child. Parents were thoroughly engaged in the discussion about MiSight and committed to ensuring compliance. Scheduled comprehensive contact lens training for next week. Highlighted importance of long-term commitment.');
        setInputValue('notesReflection', 'This case emphasizes the importance of early intervention in myopia management for children with strong family history and rapid progression. A clear explanation of the "why" behind interventions and consistent reinforcement of lifestyle modifications are crucial for parental buy-in and patient compliance. Axial length tracking is essential for objective measurement of treatment efficacy.');

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

            // Handle the specific case for 'currentManagementMethod' where triggerInput is a select
            if (triggerInput.id === 'currentManagementMethod') {
                const selectedValue = triggerInput.value;
                // Check if the selected value is exactly one of the triggerValues or includes any of them if a list
                activate = valuesToActivate.includes(selectedValue);
            } else if (triggerInput.type === 'checkbox') {
                activate = triggerInput.checked;
            } else if (triggerInput.type === 'radio') {
                 // For radio buttons, check the *specific trigger radio*'s state
                const actualTriggerRadio = document.getElementById(triggerInputId);
                if (actualTriggerRadio) {
                    activate = actualTriggerRadio.checked && valuesToActivate.includes(actualTriggerRadio.value);
                }
            } else if (triggerInput.tagName === 'SELECT') { // General select handling for other selects
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
        { triggerId: 'currentManagementMethod', triggerValues: 'Atropine', targetSelector: '#atropineConcentration_group', actionType: 'display' },
        { triggerId: 'currentManagementMethod', triggerValues: ['None', 'Orthokeratology', 'Multifocal Soft Contact Lenses', 'DIMS/HAL Spectacles', 'Single Vision Spectacles', 'Bifocal Spectacles', 'Other', ''], targetSelector: '#atropineConcentration_group', actionType: 'display', defaultValue: '' },

        { triggerId: 'currentManagementMethod', triggerValues: 'Orthokeratology', targetSelector: '#orthoKLensParameters_group', actionType: 'display' },
        { triggerId: 'currentManagementMethod', triggerValues: ['None', 'Atropine', 'Multifocal Soft Contact Lenses', 'DIMS/HAL Spectacles', 'Single Vision Spectacles', 'Bifocal Spectacles', 'Other', ''], targetSelector: '#orthoKLensParameters_group', actionType: 'display', defaultValue: '' },

        { triggerId: 'currentManagementMethod', triggerValues: 'Multifocal Soft Contact Lenses', targetSelector: '#mfclLensParameters_group', actionType: 'display' },
        { triggerId: 'currentManagementMethod', triggerValues: ['None', 'Atropine', 'Orthokeratology', 'DIMS/HAL Spectacles', 'Single Vision Spectacles', 'Bifocal Spectacles', 'Other', ''], targetSelector: '#mfclLensParameters_group', actionType: 'display', defaultValue: '' },

        { triggerId: 'currentManagementMethod', triggerValues: ['DIMS/HAL Spectacles', 'Single Vision Spectacles', 'Bifocal Spectacles'], targetSelector: '#spectacleLensType_group', actionType: 'display' },
        { triggerId: 'currentManagementMethod', triggerValues: ['None', 'Atropine', 'Orthokeratology', 'Multifocal Soft Contact Lenses', 'Other', ''], targetSelector: '#spectacleLensType_group', actionType: 'display', defaultValue: '' },
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
            const conditionalGroup = input.closest('.conditional-group');
            // Check if the input itself is disabled or if its parent conditional group is collapsed
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
        fillDemoDataButton.addEventListener('click', fillDemoDataMyopiaManagement);
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
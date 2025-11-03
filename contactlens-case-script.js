// This file is contactlens-case-script.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optometryCaseForm');
    if (!form) {
        console.warn('No form found with ID "optometryCaseForm" on this page. Script may not function as expected.');
        return;
    }

    const clearFormButton = document.getElementById('clearForm');
    const saveCaseButton = document.getElementById('saveCase');
    const caseTypeElement = form.querySelector('input[name="caseType"]');
    // Ensure currentCaseType is correctly identified for contactlens
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'contactlens'; 

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

    // Function to fill all fields with demo data
    function fillDemoDataContactLens() {
        console.log("Filling demo data for Contact Lens Case...");

        // Ensure currentCaseType is 'contactlens' before filling
        if (currentCaseType !== 'contactlens') {
            console.warn("Attempted to fill Contact Lens demo data on a non-contactlens case type.");
            return;
        }

        // Using setInputValue ensures change events are dispatched for all fields
        const today = new Date();
        const twoYearsAgo = new Date(today);
        twoYearsAgo.setFullYear(today.getFullYear() - 2);

        // --- Patient Info ---
        setInputValue('patientId', 'CL-042-SMITH');
        setInputValue('patientName', 'Sarah Smith');
        setInputValue('dateOfBirth', '1998-11-20');
        setInputValue('clPatientProfile', 'Existing Patient');
        setInputValue('motivationForCL', 'Comfort issues with current lenses; occasional dryness and blurred vision after 8 hours of wear. Wants to continue daily disposable wear for sports.');
        setInputValue('lensModalityPreference', 'Daily Disposable');
        setInputValue('lensMaterialPreference', 'Silicone Hydrogel');

        // --- Chief Complaint (CC) ---
        setInputValue('chiefComplaint', 'Reports discomfort and dryness with current contact lenses (Acuvue Oasys 1-Day) by late afternoon. Vision sometimes fluctuating.');
        setInputValue('hpi', 'Patient has worn Acuvue Oasys 1-Day for 2 years. Recently started experiencing increased dryness and awareness of lenses after 8 hours. Often feels the need to remove lenses earlier than planned. Denies redness, pain, or photophobia, but notes occasional blurry vision which clears with a blink. Works on computer 6-8 hours daily.');
        setInputValue('cl_dryness', true, 'checkbox');
        setInputValue('cl_discomfort', true, 'checkbox');
        setInputValue('cl_blurryVision', true, 'checkbox');
        setInputValue('cl_redness', false, 'checkbox'); 
        setInputValue('cl_itching', false, 'checkbox');
        setInputValue('cl_glare', false, 'checkbox');
        setInputValue('cl_haze', false, 'checkbox');

        // --- Contact Lens History (if applicable) ---
        setInputValue('previousCLHistory', 'Wore various daily disposable soft lenses since age 16. Switched to Acuvue Oasys 1-Day 2 years ago for better comfort, but now experiencing issues.');
        setInputValue('currentCLType', 'Soft Spherical Daily Disposable');
        setInputValue('currentCLBrand', 'Acuvue Oasys 1-Day, OD -3.00 DS, OS -3.25 DS, BC 8.5, DIA 14.3');
        setInputValue('wearSchedule', 'Daily wear, 10-12 hours/day, 7 days/week');
        setInputValue('replacementSchedule', 'daily');
        setInputValue('compliance', 'Reports good compliance with daily replacement. Uses Refresh Optive Fusion eye drops PRN.');
        setInputValue('careSystemUsed', 'None (Daily Disposable)'); 
        setInputValue('sleepsInLensesNo', 'No', 'radio');
        setInputValue('swimsInLensesNo', 'No', 'radio');
        setInputValue('complianceReplacementSchedule', 'On Time');

        // --- Examination (Contact Lens Focused) ---
        // Visual Acuity with CLs
        setInputValue('vaWithClsOD', '20/25');
        setInputValue('vaWithClsOS', '20/25');
        setInputValue('vaNearWithClsOD', 'J1 / N4');
        setInputValue('vaNearWithClsOS', 'J1 / N4');
        setInputValue('overRefractionOD', 'PL');
        setInputValue('overRefractionOS', 'PL -0.25DS');
        setInputValue('finalVaOverRefractionOD', '20/20');
        setInputValue('finalVaOverRefractionOS', '20/20');

        // Manifest Refraction (Spectacle Rx)
        setInputValue('manifestRefractionOD', '-3.00 DS');
        setInputValue('manifestRefractionOS', '-3.50 DS');

        // Keratometry
        setInputValue('k1OD', '43.25');
        setInputValue('k2OD', '44.00');
        setInputValue('axisOD', '180');
        setInputValue('k1OS', '43.50');
        setInputValue('k2OS', '44.50');
        setInputValue('axisOS', '175');
        setInputValue('hvidOD', '12.0');
        setInputValue('hvidOS', '11.9');
        setInputValue('tbutOD', '4'); 
        setInputValue('tbutOS', '5'); 

        // Lens Fit Assessment (with CLs IN)
        setInputValue('clFitCentrationOD', 'Good');
        setInputValue('clFitCentrationOS', 'Good');
        setInputValue('clFitMovementOD', 'Tight (<0.5mm)'); 
        setInputValue('clFitMovementOS', 'Optimal');
        setInputValue('clFitCoverageOD', 'Full');
        setInputValue('clFitCoverageOS', 'Full');
        setInputValue('clFitRotationOD', 'Stable');
        setInputValue('clFitRotationOS', 'Stable');

        // Slit Lamp & Complications
        setInputValue('slitLampWithCls', 'OD: Good lens condition. Mild diffuse superficial punctate keratitis (SPK) 1+ inferior. OS: Good lens condition. Mild localized SPK 2+ at 6 o\'clock. Mild papillary conjunctivitis 1+ superior tarsal.');
        setInputValue('stainingOD_yes', 'Yes', 'radio'); // Trigger conditional for details
        setInputValue('stainingOD_details', '1+ inferior diffuse SPK');
        setInputValue('stainingOS_yes', 'Yes', 'radio'); // Trigger conditional for details
        setInputValue('stainingOS_details', '2+ at 6 o\'clock localized SPK');
        setInputValue('infiltratesUlcersODNo', 'No', 'radio');
        setInputValue('infiltratesUlcersOSNo', 'No', 'radio');
        setInputValue('cornealNVODNo', 'No', 'radio');
        setInputValue('cornealNVOSNo', 'No', 'radio');
        setInputValue('lidEversionPerformedYes', 'Yes', 'radio'); // Trigger conditional group for conjunctival findings
        setInputValue('conjunctivalFindings', 'Papillae 1+'); 
        // conjunctivalFindings_details will not be active if 'Papillae 1+' is selected.

        setInputValue('lidWiperEpitheliopathyOD', 'Mild');
        setInputValue('lidWiperEpitheliopathyOS', 'Moderate');

        // Contact Lens Parameters (Trial/New Rx)
        setInputValue('clLensType', 'soft-spherical');
        setInputValue('clMaterial', 'Samfilcon A (Silicone Hydrogel)');
        setInputValue('clBrand', 'MyDay Daily Disposable');
        setInputValue('clBcOD', '8.4');
        setInputValue('clBcOS', '8.4');
        setInputValue('clDiaOD', '14.2');
        setInputValue('clDiaOS', '14.2');
        setInputValue('clWaterContent', '49');
        setInputValue('clDk_tValue', '100');
        setInputValue('clPowerOD', '-3.00 DS');
        setInputValue('clPowerOS', '-3.25 DS');
        setInputValue('clAddOD', ''); 
        setInputValue('clAddOS', '');

        // --- Assessment & Plan ---
        setInputValue('assessmentDiagnoses', '1. Contact Lens Induced Dry Eye OU (H16.223).\n2. Contact Lens Induced Papillary Conjunctivitis OS (H10.122).\n3. Tight Contact Lens Fit OD (H27.121).\n4. Myopia OU (H52.1).\n5. New CL trial successful OU with MyDay Daily Disposable.');
        setInputValue('plan', '1. Discontinue current Acuvue Oasys 1-Day lenses.\n2. Dispense trial of MyDay Daily Disposable lenses OU (OD: -3.00 DS, OS: -3.25 DS) with BC 8.4, DIA 14.2.\n3. Patient education on proper insertion/removal, importance of daily replacement, and artificial tear use (Systane Hydration PF).\n4. RTC 1 week for CL follow-up and assessment of new fit and comfort.\n5. Upon successful follow-up, provide 1-year prescription for MyDay Daily Disposable lenses.');
        setInputValue('clRxIssuedYes', 'Yes', 'radio'); // Trigger CL Rx details
        setInputValue('contactLensRx', 'OD: MyDay Daily Disposable, -3.00 DS, BC 8.4, DIA 14.2. \nOS: MyDay Daily Disposable, -3.25 DS, BC 8.4, DIA 14.2. Quantity: 90 lenses per eye (3-month supply).');
        setInputValue('prognosis', 'Good with change to new daily disposable lens material and regular use of artificial tears.');
        setInputValue('followUpInstructions', 'Return in 1 week (on [Date + 7 days]) for contact lens follow-up. Use new MyDay lenses. Use Systane Hydration PF 2-3 times daily. Immediately remove lenses and call office if experiencing severe pain, redness, discharge, or sudden vision changes.');

        // --- Notes & Reflection ---
        setInputValue('internalNotes', 'Patient seems motivated for better comfort. Counseled on lens rotation if comfort is still an issue. Explained benefits of higher Dk/t and different material for dry eye.');
        setInputValue('notesReflection', 'This case highlighted the importance of re-evaluating lens parameters and materials when patients experience comfort issues, even with a seemingly good lens. The change in material and fit seems promising for resolving dryness and tight fit issues. Thorough patient education on compliance and dry eye management is crucial.');
        
        // Final dispatch for all elements to ensure all conditional displays are correctly updated
        form.querySelectorAll('input, select, textarea').forEach(input => {
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
        // Contact Lens Case Specific
        { triggerId: 'stainingOD_yes', triggerValues: 'Yes', targetSelector: '#stainingOD_details', actionType: 'display' },
        { triggerId: 'stainingOD_no', triggerValues: 'No', targetSelector: '#stainingOD_details', actionType: 'display', defaultValue: '' }, // Reset on 'No'
        { triggerId: 'stainingOS_yes', triggerValues: 'Yes', targetSelector: '#stainingOS_details', actionType: 'display' },
        { triggerId: 'stainingOS_no', triggerValues: 'No', targetSelector: '#stainingOS_details', actionType: 'display', defaultValue: '' }, // Reset on 'No'
        { triggerId: 'infiltratesUlcersODYes', triggerValues: 'Yes', targetSelector: '#infiltratesUlcersOD_details', actionType: 'display' },
        { triggerId: 'infiltratesUlcersODNo', triggerValues: 'No', targetSelector: '#infiltratesUlcersOD_details', actionType: 'display', defaultValue: '' }, // Reset
        { triggerId: 'infiltratesUlcersOSYes', triggerValues: 'Yes', targetSelector: '#infiltratesUlcersOS_details', actionType: 'display' },
        { triggerId: 'infiltratesUlcersOSNo', triggerValues: 'No', targetSelector: '#infiltratesUlcersOS_details', actionType: 'display', defaultValue: '' }, // Reset
        { triggerId: 'cornealNVODYes', triggerValues: 'Yes', targetSelector: '#cornealNVOD_details', actionType: 'display' },
        { triggerId: 'cornealNVODNo', triggerValues: 'No', targetSelector: '#cornealNVOD_details', actionType: 'display', defaultValue: '' }, // Reset
        { triggerId: 'cornealNVOSYes', triggerValues: 'Yes', targetSelector: '#cornealNVOS_details', actionType: 'display' },
        { triggerId: 'cornealNVOSNo', triggerValues: 'No', targetSelector: '#cornealNVOS_details', actionType: 'display', defaultValue: '' }, // Reset
        { triggerId: 'lidEversionPerformedYes', triggerValues: 'Yes', targetSelector: '#conjunctivalFindings_group', actionType: 'display' },
        { triggerId: 'lidEversionPerformedNo', triggerValues: 'No', targetSelector: '#conjunctivalFindings_group', actionType: 'display', defaultValue: '' }, // Reset
        { triggerId: 'conjunctivalFindings', triggerValues: 'Other', targetSelector: '#conjunctivalFindings_details', actionType: 'display' },
        { triggerId: 'clRxIssuedYes', triggerValues: 'Yes', targetSelector: '#contactLensRx_group', actionType: 'display' },
        { triggerId: 'clRxIssuedNo', triggerValues: 'No', targetSelector: '#contactLensRx_group', actionType: 'display', defaultValue: '' }, // Reset
        
        // These are examples from other cases, if your contactlens-case.html has similar fields, uncomment and use correct IDs/names
        // { triggerId: 'ocularROS_notwnl', triggerValues: 'Not WNL', targetSelector: '#ocularROS_details', actionType: 'display' },
        // { triggerId: 'systemicROS_notwnl', triggerValues: 'Not WNL', targetSelector: '#systemicROS_details', actionType: 'display' },
    ];

    conditionalRules.forEach(rule => {
        setupConditionalToggle(rule.triggerId, rule.triggerValues, rule.targetSelector, rule.actionType, rule.defaultValue);
    });

    // --- Function to calculate age from Date of Birth ---
    function calculateAge() {
        const dobInput = document.getElementById('dateOfBirth');
        const patientAgeInput = document.getElementById('patientAge'); // Assuming 'patientAge' input might exist

        if (!dobInput || !patientAgeInput) return; // Only run if both inputs exist

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
            // calculateAge() will be called implicitly if dateOfBirth is cleared and dispatches change.
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
        calculateAge(); // Recalculate age after loading DOB
        alert(`Loaded saved draft for ${currentCaseType.replace(/([A-Z])/g, ' $1').trim()} case from previous session.`);
    }

    // --- AUTO-FILL ON PAGE LOAD ---
    // This will ONLY run if no saved draft is found for this type of case.
    if (!savedDraft && currentCaseType === 'contactlens') { 
        fillDemoDataContactLens();
    }

    // Final initial dispatch for all elements on page load to ensure all conditional displays are correctly updated.
    // This ensures any default HTML values or interactions from demo data/local storage correctly trigger conditionals.
    form.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
});
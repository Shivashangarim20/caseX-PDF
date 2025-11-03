// This file is followup-case-script.js
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
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'followup';

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

    // Function to fill all fields with demo data for Follow-up Case (manual trigger)
    function fillDemoDataFollowup() {
        console.log("Manually filling demo data for Follow-up Case...");

        // Clear existing local storage data for this case type before filling
        localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);

        // Use clearAllFormFields to reset the form to a truly empty state first
        clearAllFormFields(); 

        const today = new Date();
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        // --- Patient Info ---
        setInputValue('patientId', 'FU-001-JS');
        setInputValue('patientName', 'John Smith');
        setInputValue('dateOfVisit', today.toISOString().split('T')[0]);
        setInputValue('previousVisitDate', threeMonthsAgo.toISOString().split('T')[0]);
        setInputValue('referencingPreviousCaseId', 'P00123-20240319');

        // --- Chief Complaint (CC) / Status Update ---
        setInputValue('chiefComplaint', 'Patient reports symptoms of dry eye are much improved with artificial tears, vision remains stable. Denies new flashes/floaters or pain.');
        setInputValue('complianceStatus', 'Patient reports excellent compliance with artificial tears QID and punctual plug hygiene.');
        setInputValue('newSymptoms', 'Denies any new ocular symptoms. Occasional mild headache, consistent with previous reports.');
        setInputValue('conditionStatus', 'Improved');
        setInputValue('treatmentSideEffectsNo', 'No', 'radio');
        // treatmentSideEffects_details will be cleared by conditional logic
        setInputValue('treatmentSideEffects_details', '');

        // --- History Update ---
        setInputValue('changesInMedicalHistory', 'No new medical diagnoses, surgeries, or changes to systemic medications since last visit. Continues glaucoma drops (Latanoprost OU QHS).');
        setInputValue('changesInSocialHistory', 'No significant changes in social history or work environment.');
        setInputValue('spectaclesAdequateYes', 'Yes', 'radio');
        setInputValue('contactLensesAdequateYes', 'Yes', 'radio');

        // --- Examination (Focused) ---
        // Visual Acuity
        setInputValue('vaUncorrectedOD', '20/40 (6/12)');
        setInputValue('vaUncorrectedOS', '20/40 (6/12)');
        setInputValue('vaBestCorrectedOD', '20/20 (6/6)');
        setInputValue('vaBestCorrectedOS', '20/20 (6/6)');

        // Pupils
        setInputValue('pupilsFollowup', 'PERRLA');
        // pupilsFollowup_details will be cleared by conditional logic
        setInputValue('pupilsFollowup_details', '');

        // EOMs
        setInputValue('eomsFollowup', 'Full and Smooth');
        // eomsFollowup_details will be cleared by conditional logic
        setInputValue('eomsFollowup_details', '');

        // IOP
        setInputValue('iopOD', '15 @ 10:45 AM');
        setInputValue('iopOS', '16 @ 10:45 AM');
        setInputValue('iopMethodFollowup', 'Goldmann');
        setInputValue('iopTarget', '14');
        setInputValue('iopTargetMetYes', 'Yes', 'radio');

        // Slit Lamp Exam
        setInputValue('slitLampFollowup_wnl', 'WNL', 'radio');
        // slitLampFollowup will be cleared by conditional logic
        setInputValue('slitLampFollowup', '');

        // Posterior Segment Exam
        setInputValue('posteriorSegmentFollowup_wnl', 'WNL', 'radio');
        // posteriorSegmentFollowup will be cleared by conditional logic
        setInputValue('posteriorSegmentFollowup', '');

        // --- Investigations ---
        setInputValue('octFollowup', 'RNFL OCT OU: Stable compared to 3-month baseline. No new areas of thinning. Macular OCT: No significant changes, foveal contour maintained.');
        setInputValue('octRnflChange', 'Stable');
        setInputValue('visualFieldFollowup', 'Humphrey 24-2 OU: Stable compared to previous, no progression of existing arcuate defect OS. Reliability indices good.');
        setInputValue('visualFieldMdChange', 'MD OD -1.2 dB (stable), MD OS -3.5 dB (stable)');
        setInputValue('macularEdemaStatus', 'Stable');
        setInputValue('otherInvestigationsFollowup', 'None performed today.');

        // --- Assessment & Plan ---
        setInputValue('assessmentDiagnoses', '1. Primary Open Angle Glaucoma OU (H40.113): IOPs stable and at target, visual fields stable, OCT RNFL/GCC stable.\n2. Moderate Dry Eye Syndrome OU (H16.223): Significantly improved with current management (artificial tears + punctual plugs).');
        setInputValue('plan', '1. Continue current management for Primary Open Angle Glaucoma OU: Latanoprost OU QHS. IOPs are at target, fields and OCT are stable.\n2. Continue current management for Dry Eye Syndrome OU: Artificial tears QID and punctual plug hygiene. Symptoms are well-controlled.\n3. RTC 6 months for repeat comprehensive ocular exam, including IOP, Visual Fields, and OCT RNFL/GCC.\n4. Reinforce patient education on compliance with glaucoma drops and continued monitoring for changes in dry eye symptoms.');
        setInputValue('patientEducationProvided', 'Reinforced importance of 100% compliance with glaucoma medication. Discussed importance of regular follow-up for glaucoma progression detection. Reviewed dry eye management techniques.');
        setInputValue('prognosis', 'Good prognosis for both glaucoma and dry eye syndrome with continued good compliance to treatment and regular monitoring.');
        setInputValue('followUpInstructions', 'Return in 6 months (on [Date + 6 months]) for follow-up comprehensive eye examination, including IOP, Visual Fields, and OCT. Contact the office sooner if any new symptoms, worsening vision, or sudden changes are experienced.');

        // --- Notes & Reflection ---
        setInputValue('internalNotes', 'Patient is engaged and cooperative with treatment. Glaucoma appears well-controlled at this stage. Dry eye management effective. Will continue monitoring closely for any subtle changes.');
        setInputValue('notesReflection', 'This follow-up case highlights successful chronic disease management. Emphasized systematic comparison of current findings to baseline and previous visits (IOP, VF, OCT). Confirmed patient understanding of lifelong management for glaucoma and continued management for chronic dry eye.');

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
        { triggerId: 'treatmentSideEffectsYes', triggerValues: 'Yes', targetSelector: '#treatmentSideEffects_details', actionType: 'display' },
        { triggerId: 'treatmentSideEffectsNo', triggerValues: 'No', targetSelector: '#treatmentSideEffects_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'pupilsFollowup', triggerValues: ['APD OD', 'APD OS', 'Other'], targetSelector: '#pupilsFollowup_details', actionType: 'display' },
        { triggerId: 'eomsFollowup', triggerValues: ['Restricted', 'Other'], targetSelector: '#eomsFollowup_details', actionType: 'display' },
        { triggerId: 'slitLampFollowup_notwnl', triggerValues: 'Not WNL', targetSelector: '#slitLampFollowup', actionType: 'display' },
        { triggerId: 'slitLampFollowup_wnl', triggerValues: 'WNL', targetSelector: '#slitLampFollowup', actionType: 'display', defaultValue: '' },
        { triggerId: 'posteriorSegmentFollowup_notwnl', triggerValues: 'Not WNL', targetSelector: '#posteriorSegmentFollowup', actionType: 'display' },
        { triggerId: 'posteriorSegmentFollowup_wnl', triggerValues: 'WNL', targetSelector: '#posteriorSegmentFollowup', actionType: 'display', defaultValue: '' },
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
        fillDemoDataButton.addEventListener('click', fillDemoDataFollowup);
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
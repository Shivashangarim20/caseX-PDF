document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optometryCaseForm');
    if (!form) {
        console.warn('No form found with ID "optometryCaseForm" on this page. Script may not function as expected.');
        return;
    }

    const clearFormButton = document.getElementById('clearForm');
    const saveCaseButton = document.getElementById('saveCase');
    const caseTypeElement = form.querySelector('input[name="caseType"]');
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'pediatricoptometry';

    /**
     * Helper to set value and dispatch change event for an input.
     * Handles radio buttons and select elements correctly.
     * (Retained for local storage loading and clear form functionality)
     */
    function setInputValue(id, value, type = 'text') {
        const input = document.getElementById(id);
        if (!input) {
            return;
        }

        try {
            if (type === 'radio') {
                const radioButtons = form.querySelectorAll(`input[type="radio"][name="${input.name}"]`);
                radioButtons.forEach(radio => {
                    if (radio.value === value) {
                        radio.checked = true;
                    } else {
                        radio.checked = false;
                    }
                });
            } else if (input.tagName === 'SELECT') {
                input.value = value;
            } else if (input.type === 'checkbox') {
                input.checked = value;
            } else {
                input.value = value;
            }
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
                const firstOption = input.querySelector('option[value=""]');
                if (firstOption) {
                    input.value = ''; // This will select the option with value=""
                } else if (input.options.length > 0) {
                    input.selectedIndex = 0; // Fallback to first option if no blank value option
                }
            } else {
                input.value = ''; // Clear text, number, date inputs, textareas
            }
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    // --- General Conditional Toggle Logic ---
    function setupConditionalToggle(triggerInputId, triggerValues, targetSelector, actionType = 'display', defaultValue = '') {
        const triggerInput = document.getElementById(triggerInputId);
        const targets = document.querySelectorAll(targetSelector);

        if (!triggerInput || targets.length === 0) {
            return;
        }

        const valuesToActivate = Array.isArray(triggerValues) ? triggerValues : [triggerValues];

        const applyToggleState = () => {
            let activate = false;

            if (triggerInput.type === 'checkbox') {
                activate = triggerInput.checked;
            } else if (triggerInput.type === 'radio') {
                // For radio buttons, check if the *currently checked* radio's value matches the activation values
                const checkedRadio = document.querySelector(`input[type="radio"][name="${triggerInput.name}"]:checked`);
                activate = checkedRadio && valuesToActivate.includes(checkedRadio.value);
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
                            input.value = defaultValue;
                            input.disabled = true;
                            if (input.type === 'checkbox' || input.type === 'radio') {
                                input.checked = false;
                            } else if (input.tagName === 'SELECT') {
                                input.selectedIndex = 0;
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
                                 input.selectedIndex = 0;
                            }
                        }
                    }
                }
            });
        };

        // Attach listener to the *specific* trigger input
        triggerInput.addEventListener('change', applyToggleState);

        // For radio groups, *all* radios in the group need to trigger the toggle check.
        // For SELECT elements, the `triggerInput` itself is sufficient.
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
        { triggerId: 'developmentalMilestonesStatus', triggerValues: 'Delayed', targetSelector: '#developmentalMilestones_details_group', actionType: 'display' },
        { triggerId: 'developmentalMilestonesStatus', triggerValues: ['Normal', ''], targetSelector: '#developmentalMilestones_details_group', actionType: 'display', defaultValue: '' },

        // Grouped condition for 'prescriptionIssued_group'
        { triggerId: 'prescriptionIssuedSpectacles', triggerValues: ['Spectacles'], targetSelector: '#prescriptionIssued_group', actionType: 'display' },
        { triggerId: 'prescriptionIssuedContactLenses', triggerValues: ['Contact Lenses'], targetSelector: '#prescriptionIssued_group', actionType: 'display' },
        { triggerId: 'prescriptionIssuedNone', triggerValues: 'None', targetSelector: '#prescriptionIssued_group', actionType: 'display', defaultValue: '' },
        // IMPORTANT: Add extra rules for 'prescriptionIssued_group' to cover combinations or empty state for clearing
        { triggerId: 'prescriptionIssuedSpectacles', triggerValues: [], targetSelector: '#prescriptionIssued_group', actionType: 'display', defaultValue: '' },
        { triggerId: 'prescriptionIssuedContactLenses', triggerValues: [], targetSelector: '#prescriptionIssued_group', actionType: 'display', defaultValue: '' },


        { triggerId: 'glassesToleranceStatus', triggerValues: ['Fair', 'Poor'], targetSelector: '#glassesTolerance_details', actionType: 'display' },
        { triggerId: 'glassesToleranceStatus', triggerValues: ['Excellent', 'Good', ''], targetSelector: '#glassesTolerance_details', actionType: 'display', defaultValue: '' },

        { triggerId: 'amblyopiaHistoryYes', triggerValues: 'Yes', targetSelector: '#amblyopiaHistory_details_group', actionType: 'display' },
        { triggerId: 'amblyopiaHistoryNo', triggerValues: 'No', targetSelector: '#amblyopiaHistory_details_group', actionType: 'display', defaultValue: '' },

        { triggerId: 'amblyopiaTreatment', triggerValues: 'Patching', targetSelector: '#patchingHours', actionType: 'display' },
        { triggerId: 'amblyopiaTreatment', triggerValues: ['Atropine', 'Vision Therapy', 'Optical Correction', 'None', ''], targetSelector: '#patchingHours', actionType: 'display', defaultValue: '' },

        { triggerId: 'strabismusHistoryYes', triggerValues: 'Yes', targetSelector: '#strabismusHistory_details_group', actionType: 'display' },
        { triggerId: 'strabismusHistoryNo', triggerValues: 'No', targetSelector: '#strabismusHistory_details_group', actionType: 'display', defaultValue: '' },

        { triggerId: 'strabismusManagement', triggerValues: 'Surgery Referral', targetSelector: '#surgeryReferralDetails', actionType: 'display' },
        { triggerId: 'strabismusManagement', triggerValues: ['Glasses', 'Vision Therapy', 'Monitor', ''], targetSelector: '#surgeryReferralDetails', actionType: 'display', defaultValue: '' },
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

        // Trigger calculation on load to set initial age for pre-filled DOB
        // This will be called after potential local storage load, so it's correct.
        if (dobInput.value) {
            updateAge();
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
            
            // Re-dispatch change events for all relevant inputs to ensure UI is consistent
            form.querySelectorAll('input[type="checkbox"], input[type="radio"], select, input[type="date"]').forEach(input => {
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
    }

    // --- Clear Form Handler ---
    if (clearFormButton) {
        clearFormButton.addEventListener('click', (e) => { // Added 'e' parameter
            e.preventDefault(); // Prevent default form submission/reset behavior that might interfere
            clearAllFormFields(); // Call the robust clearing function
            localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);
            calculateAge(); // Recalculate age after reset (DOB is cleared)
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
            // console.log("Draft saved:", caseData);
        }, 800);
    });

    // Load data from Local Storage on page load (still useful even with pre-filled HTML for user edits)
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
                    });
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
            }
        }
        // Dispatch change events after loading from local storage to update conditional fields
        form.querySelectorAll('input, select, textarea').forEach(input => {
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        calculateAge();
        alert(`Loaded saved draft for ${currentCaseType.replace(/([A-Z])/g, ' $1').trim()} case from previous session.`);
    }

    // Initial dispatch for all elements to ensure all conditional displays are correctly updated for the pre-filled HTML
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
});
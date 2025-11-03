document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optometryCaseForm');
    if (!form) {
        console.warn('OSD Script: No form found with ID "optometryCaseForm". Exiting.');
        return;
    }

    const clearFormButton = document.getElementById('clearForm');
    const saveCaseButton = document.getElementById('saveCase');
    const caseTypeElement = form.querySelector('input[name="caseType"]');
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'ocularsurfacedisease';

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
                        radio.checked = false;
                    }
                });
                if (!found && value !== '') {
                    // console.warn(`setInputValue: Radio button with name "${input.name}" and value "${value}" not found to check.`);
                }
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

    // --- General Conditional Toggle Logic (Corrected version) ---
    function setupConditionalToggle(triggerInputId, triggerValues, targetSelector, actionType = 'display', defaultValue = '') {
        const triggerInput = document.getElementById(triggerInputId);
        const targets = document.querySelectorAll(targetSelector);

        if (!triggerInput || targets.length === 0) {
            // console.warn(`OSD Toggle: Setup failed - Missing elements for trigger ID "${triggerInputId}" or target selector "${targetSelector}"`);
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
                        conditionalGroup.style.maxHeight = '150px';
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

        triggerInput.addEventListener('change', applyToggleState);

        if (triggerInput.type === 'radio') {
            document.querySelectorAll(`input[type="radio"][name="${triggerInput.name}"]`).forEach(radio => {
                if (radio.id !== triggerInputId) {
                    radio.addEventListener('change', applyToggleState);
                }
            });
        }

        applyToggleState();
    }

    // --- Data-driven setup for all conditional toggles ---
    const conditionalRules = [
        { triggerId: 'inflammaDry_OD', triggerValues: 'Positive', targetSelector: '#inflammaDryOD_value', actionType: 'display' },
        { triggerId: 'inflammaDry_OD', triggerValues: ['Negative', ''], targetSelector: '#inflammaDryOD_value', actionType: 'display', defaultValue: '' },
        { triggerId: 'inflammaDry_OS', triggerValues: 'Positive', targetSelector: '#inflammaDryOS_value', actionType: 'display' },
        { triggerId: 'inflammaDry_OS', triggerValues: ['Negative', ''], targetSelector: '#inflammaDryOS_value', actionType: 'display', defaultValue: '' },
        { triggerId: 'lidMarginAssessment_OD', triggerValues: ['MGD Grade 1', 'MGD Grade 2', 'MGD Grade 3', 'Anterior Blepharitis', 'Posterior Blepharitis', 'Demodex', 'Other'], targetSelector: '#lidMarginAssessmentOD_details', actionType: 'display' },
        { triggerId: 'lidMarginAssessment_OD', triggerValues: ['WNL', ''], targetSelector: '#lidMarginAssessmentOD_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'lidMarginAssessment_OS', triggerValues: ['MGD Grade 1', 'MGD Grade 2', 'MGD Grade 3', 'Anterior Blepharitis', 'Posterior Blepharitis', 'Demodex', 'Other'], targetSelector: '#lidMarginAssessmentOS_details', actionType: 'display' },
        { triggerId: 'lidMarginAssessment_OS', triggerValues: ['WNL', ''], targetSelector: '#lidMarginAssessmentOS_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'cornealStainingOD_notwnl', triggerValues: 'Not WNL', targetSelector: '#cornealStainingOD_details', actionType: 'display' },
        { triggerId: 'cornealStainingOD_wnl', triggerValues: ['WNL', ''], targetSelector: '#cornealStainingOD_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'cornealStainingOS_notwnl', triggerValues: 'Not WNL', targetSelector: '#cornealStainingOS_details', actionType: 'display' },
        { triggerId: 'cornealStainingOS_wnl', triggerValues: ['WNL', ''], targetSelector: '#cornealStainingOS_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'conjunctivalStainingOD_notwnl', triggerValues: 'Not WNL', targetSelector: '#conjunctivalStainingOD_details', actionType: 'display' },
        { triggerId: 'conjunctivalStainingOD_wnl', triggerValues: ['WNL', ''], targetSelector: '#conjunctivalStainingOD_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'conjunctivalStainingOS_notwnl', triggerValues: 'Not WNL', targetSelector: '#conjunctivalStainingOS_details', actionType: 'display' },
        { triggerId: 'conjunctivalStainingOS_wnl', triggerValues: ['WNL', ''], targetSelector: '#conjunctivalStainingOS_details', actionType: 'display', defaultValue: '' },
        { triggerId: 'punctalPlugsYes', triggerValues: 'Yes', targetSelector: '#punctalPlugsDetails', actionType: 'display' },
        { triggerId: 'punctalPlugsNo', triggerValues: 'No', targetSelector: '#punctalPlugsDetails', actionType: 'display', defaultValue: '' },
        { triggerId: 'thermalPulsationYes', triggerValues: 'Yes', targetSelector: '#thermalPulsationDetails', actionType: 'display' },
        { triggerId: 'thermalPulsationNo', triggerValues: 'No', targetSelector: '#thermalPulsationDetails', actionType: 'display', defaultValue: '' },
        { triggerId: 'iplTreatmentYes', triggerValues: 'Yes', targetSelector: '#iplTreatmentDetails', actionType: 'display' },
        { triggerId: 'iplTreatmentNo', triggerValues: 'No', targetSelector: '#iplTreatmentDetails', actionType: 'display', defaultValue: '' },
        { triggerId: 'scleralLensesConsideredYes', triggerValues: 'Yes', targetSelector: '#scleralLensesDetails', actionType: 'display' },
        { triggerId: 'scleralLensesConsideredNo', triggerValues: 'No', targetSelector: '#scleralLensesDetails', actionType: 'display', defaultValue: '' },
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
            
            form.querySelectorAll('input:not([type="hidden"]), select, textarea').forEach(input => {
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
            calculateAge();
        });
    }

    // --- Clear Form Handler ---
    if (clearFormButton) {
        // DEBUG: Add a console log to see if this listener itself is fired twice
        console.log('OSD Script: Attaching clearFormButton listener once.'); 
        clearFormButton.addEventListener('click', (e) => {
            e.preventDefault(); 
            console.log('OSD Script: Clear Form button CLICK event triggered.'); // DEBUG: Confirm click event
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
            // console.log("Draft saved:", caseData);
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
                        cb.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                } else if (input.type === 'radio') {
                    const radioButtons = form.querySelectorAll(`input[type="radio"][name="${key}"]`);
                    radioButtons.forEach(radio => {
                        if (radio.value === draftData[key]) {
                            radio.checked = true;
                        } else {
                            radio.checked = false;
                        }
                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                    });
                } else {
                    input.value = draftData[key];
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }
        calculateAge();
        alert(`Loaded saved draft for ${currentCaseType.replace(/([A-Z])/g, ' $1').trim()} case from previous session.`);
    }

    // Initial dispatch for all elements to ensure all conditional displays are correctly updated
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
});
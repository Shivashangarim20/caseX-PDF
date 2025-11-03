document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('optometryCaseForm');
    if (!form) {
        console.warn('No form found with ID "optometryCaseForm" on this page. Script may not function as expected.');
        return;
    }

    const clearFormButton = document.getElementById('clearForm');
    const saveCaseButton = document.getElementById('saveCase');
    const caseTypeElement = form.querySelector('input[name="caseType"]');
    const currentCaseType = caseTypeElement ? caseTypeElement.value : 'surgicalcomanagement';

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
                activate = triggerInput.checked && valuesToActivate.includes(triggerInput.value);
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
                                 target.selectedIndex = 0;
                            }
                        }
                    }
                }
            });
        };

        triggerInput.addEventListener('change', applyToggleState);

        if (triggerInput.type === 'radio' || triggerInput.tagName === 'SELECT') { // Listen to all radios in group or select
            document.querySelectorAll(`[name="${triggerInput.name}"]`).forEach(input => {
                input.addEventListener('change', applyToggleState);
            });
        }
        applyToggleState(); // Apply initial state on load
    }

    // --- Data-driven setup for all conditional toggles ---
    const conditionalRules = [
        { triggerId: 'typeOfSurgery', triggerValues: 'Other', targetSelector: '#surgeryDetails', actionType: 'display' },
        { triggerId: 'typeOfSurgery', triggerValues: ['Cataract Extraction (Phaco)', 'LASIK', 'PRK', 'ICL (Implantable Collamer Lens)', 'Glaucoma Surgery', 'Retinal Surgery', 'Pterygium Excision', 'Eyelid Surgery', ''], targetSelector: '#surgeryDetails', actionType: 'display', defaultValue: '' },

        { triggerId: 'postOpVisitType', triggerValues: ['Day 1', 'Week 1', 'Month 1', 'Month 3', 'Month 6', 'Annual', 'PRN'], targetSelector: '#postOpVisitDate_group', actionType: 'display' },
        { triggerId: 'postOpVisitType', triggerValues: '', targetSelector: '#postOpVisitDate_group', actionType: 'display', defaultValue: '' },

        { triggerId: 'postOpComplicationsYes', triggerValues: 'Yes', targetSelector: '#postOpComplicationsList', actionType: 'display' },
        { triggerId: 'postOpComplicationsNo', triggerValues: 'No', targetSelector: '#postOpComplicationsList', actionType: 'display', defaultValue: '' },
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

        // Trigger calculation on load to set initial age for pre-filled DOB
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
            // form.reset(); // Don't reset immediately after saving in this context, just log
            // localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`); // Keep draft after saving

            document.querySelectorAll('input[type="checkbox"], input[type="radio"], select').forEach(input => {
                input.dispatchEvent(new Event('change'));
            });
            calculateAge();
        });
    }

    // --- Clear Form Handler ---
    if (clearFormButton) {
        clearFormButton.addEventListener('click', () => {
            form.reset();
            // Manually re-dispatch change events for all inputs to reset conditional groups and calculated fields
            document.querySelectorAll('input[type="checkbox"], input[type="radio"], select').forEach(input => {
                input.dispatchEvent(new Event('change'));
            });
            localStorage.removeItem(`focusCaseXDraft_${currentCaseType}`);
            calculateAge(); // Recalculate age after reset
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
        document.querySelectorAll('input[type="checkbox"], input[type="radio"], select').forEach(input => {
            input.dispatchEvent(new Event('change'));
        });
        calculateAge();
        alert(`Loaded saved draft for ${currentCaseType.replace(/([A-Z])/g, ' $1').trim()} case from previous session.`);
    }

    // Initial dispatch for all elements to ensure all conditional displays are correctly updated for the pre-filled HTML
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
});
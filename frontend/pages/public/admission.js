// ============================================
// Configuration & State
// ============================================

const CONFIG = {
    API_BASE: 'http://localhost:5001/api',
    TOAST_DURATION: 3000,
    TOTAL_STEPS: 5,
    AUTO_SAVE_DELAY: 3000
};

const STATE = {
    currentStep: 1,
    formData: {},
    completedSteps: new Set(),
    autoSaveTimer: null
};

const GRADE_OPTIONS = {
    JHS: [7, 8, 9, 10],
    SHS: [11, 12]
};

// ============================================
// Field Name Mapping
// ============================================

const FIELD_MAPPING = {
    'firstName': 'first_name',
    'middleName': 'middle_name',
    'lastName': 'last_name',
    'suffix': 'suffix',
    'dateOfBirth': 'date_of_birth',
    'gender': 'gender',
    'email': 'email',
    'phoneNumber': 'phone_number',
    'street': 'street',
    'barangay': 'barangay',
    'city': 'city',
    'province': 'province',
    'zipCode': 'zip_code',
    'guardianName': 'guardian_name',
    'guardianRelationship': 'guardian_relationship',
    'guardianPhone': 'guardian_phone',
    'guardianEmail': 'guardian_email',
    'guardianAddress': 'guardian_address',
    'schoolLevel': 'school_level',
    'gradeLevel': 'grade_level',
    'strand': 'strand',
    'previousSchool': 'previous_school',
    'applicationType': 'application_type'
};

// ============================================
// Utility Functions
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, CONFIG.TOAST_DURATION);
}

function showAlert(message, type = 'error') {
    const alertDiv = document.getElementById('alert');
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAlert() {
    document.getElementById('alert').classList.add('hidden');
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function saveToLocalStorage() {
    localStorage.setItem('admissionFormData', JSON.stringify(STATE.formData));
    localStorage.setItem('admissionFormStep', STATE.currentStep);
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('admissionFormData');
    const savedStep = localStorage.getItem('admissionFormStep');
    if (savedData) {
        STATE.formData = JSON.parse(savedData);
        populateFormWithSavedData();
    }
    if (savedStep) {
        STATE.currentStep = Math.min(parseInt(savedStep), CONFIG.TOTAL_STEPS);
    }
}

function populateFormWithSavedData() {
    Object.entries(STATE.formData).forEach(([key, value]) => {
        const input = document.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = value;
            } else {
                input.value = value;
            }
        }
    });
}

function clearFormData() {
    STATE.formData = {};
    STATE.completedSteps.clear();
    STATE.currentStep = 1;
    localStorage.removeItem('admissionFormData');
    localStorage.removeItem('admissionFormStep');
    document.getElementById('admissionForm').reset();
}

// ============================================
// Grade Level Updates
// ============================================

function updateGradeLevels() {
    const schoolLevel = document.getElementById('schoolLevel').value;
    const gradeLevelSelect = document.getElementById('gradeLevel');
    const strandGroup = document.getElementById('strandGroup');
    const strandSelect = document.getElementById('strand');
    
    gradeLevelSelect.innerHTML = '<option value="">Select Grade</option>';
    
    if (schoolLevel === 'JHS') {
        GRADE_OPTIONS.JHS.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = `Grade ${grade}`;
            gradeLevelSelect.appendChild(option);
        });
        strandGroup.classList.add('hidden');
        strandSelect.removeAttribute('required');
    } else if (schoolLevel === 'SHS') {
        GRADE_OPTIONS.SHS.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = `Grade ${grade}`;
            gradeLevelSelect.appendChild(option);
        });
        strandGroup.classList.remove('hidden');
        strandSelect.setAttribute('required', 'required');
    }
}

// ============================================
// Form Validation
// ============================================

// ============================================
// Form Validation (UPDATED)
// ============================================

function validateStep(stepNumber) {
    const step = document.getElementById(`formStep${stepNumber}`);
    const inputs = step.querySelectorAll('input[required], select[required]');
    
    for (let input of inputs) {
        // Skip hidden fields
        if (input.offsetHeight === 0 || getComputedStyle(input).display === 'none') {
            continue;
        }
        
        if (!input.value.trim()) {
            showAlert(`Please fill in all required fields in this step`, 'warning');
            input.focus();
            return false;
        }
        
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                showAlert(`Please enter a valid email address`, 'error');
                input.focus();
                return false;
            }
        }
        
        if (input.type === 'tel' && input.value) {
            const phoneRegex = /^[\d\s\+\-\(\)]{10,}$/;
            if (!phoneRegex.test(input.value.replace(/\s/g, ''))) {
                showAlert(`Please enter a valid phone number`, 'error');
                input.focus();
                return false;
            }
        }
    }
    
    return true;
}


function validateStep5() {
    const agreeTerms = document.querySelector('input[name="agreeTerms"]').checked;
    const agreePrivacy = document.querySelector('input[name="agreePrivacy"]').checked;
    
    if (!agreeTerms || !agreePrivacy) {
        showAlert('Please agree to the terms and privacy policy', 'warning');
        return false;
    }
    
    return true;
}

// ============================================
// Form Data Management
// ============================================

function collectFormData() {
    const form = document.getElementById('admissionForm');
    const formData = new FormData(form);
    
    for (let [key, value] of formData.entries()) {
        STATE.formData[key] = value;
    }
    
    saveToLocalStorage();
}

function transformDataForDatabase() {
    const dbData = {};
    
    Object.entries(STATE.formData).forEach(([formField, value]) => {
        if (formField === 'agreeTerms' || formField === 'agreePrivacy') {
            return;
        }
        
        const dbField = FIELD_MAPPING[formField] || formField;
        dbData[dbField] = value || null;
    });
    
    console.log('Original Form Data:', STATE.formData);
    console.log('Transformed to API Format:', dbData);
    
    return dbData;
}

function updateProgressBar() {
    const progress = (STATE.currentStep / CONFIG.TOTAL_STEPS) * 100;
    const progressBar = document.querySelector('.progress-bar::after');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    for (let i = 1; i <= CONFIG.TOTAL_STEPS; i++) {
        const step = document.getElementById(`step${i}`);
        step.classList.remove('active', 'completed');
        
        if (i < STATE.currentStep) {
            step.classList.add('completed');
        } else if (i === STATE.currentStep) {
            step.classList.add('active');
        }
    }
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    prevBtn.style.display = STATE.currentStep > 1 ? 'flex' : 'none';
    nextBtn.style.display = STATE.currentStep < CONFIG.TOTAL_STEPS ? 'flex' : 'none';
    submitBtn.style.display = STATE.currentStep === CONFIG.TOTAL_STEPS ? 'flex' : 'none';
}

// ============================================
// Step Navigation
// ============================================

function nextStep() {
    hideAlert();
    
    if (!validateStep(STATE.currentStep)) {
        return;
    }
    
    collectFormData();
    STATE.completedSteps.add(STATE.currentStep);
    
    if (STATE.currentStep === 4) {
        generateReview();
    }
    
    if (STATE.currentStep < CONFIG.TOTAL_STEPS) {
        STATE.currentStep++;
        showStep();
    }
}

function previousStep() {
    hideAlert();
    collectFormData();
    
    if (STATE.currentStep > 1) {
        STATE.currentStep--;
        showStep();
    }
}

function showStep() {
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    document.getElementById(`formStep${STATE.currentStep}`).classList.add('active');
    
    updateProgressBar();
    updateNavigationButtons();
    
    if (STATE.currentStep === 1) {
        const dobInput = document.querySelector('input[name="dateOfBirth"]');
        if (dobInput.value) {
            updateAgeDisplay();
        }
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// Review Generation
// ============================================

function generateReview() {
    const reviewContent = document.getElementById('reviewContent');
    reviewContent.innerHTML = '';
    
    const sections = [
        {
            title: 'Personal Information',
            fields: [
                { label: 'First Name', name: 'firstName' },
                { label: 'Middle Name', name: 'middleName' },
                { label: 'Last Name', name: 'lastName' },
                { label: 'Suffix', name: 'suffix' },
                { label: 'Date of Birth', name: 'dateOfBirth' },
                { label: 'Gender', name: 'gender' }
            ]
        },
        {
            title: 'Contact Information',
            fields: [
                { label: 'Email', name: 'email' },
                { label: 'Phone', name: 'phoneNumber' },
                { label: 'Street Address', name: 'street' },
                { label: 'Barangay', name: 'barangay' },
                { label: 'City', name: 'city' },
                { label: 'Province', name: 'province' },
                { label: 'Zip Code', name: 'zipCode' }
            ]
        },
        {
            title: 'Guardian Information',
            fields: [
                { label: 'Guardian Name', name: 'guardianName' },
                { label: 'Relationship', name: 'guardianRelationship' },
                { label: 'Phone', name: 'guardianPhone' },
                { label: 'Email', name: 'guardianEmail' },
                { label: 'Address', name: 'guardianAddress' }
            ]
        },
        {
            title: 'Academic Information',
            fields: [
                { label: 'School Level', name: 'schoolLevel' },
                { label: 'Grade Level', name: 'gradeLevel' },
                { label: 'Strand', name: 'strand' },
                { label: 'Previous School', name: 'previousSchool' },
                { label: 'Application Type', name: 'applicationType' }
            ]
        }
    ];
    
    sections.forEach(section => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'review-section';
        
        let html = `<h4>${section.title}</h4><div class="review-grid">`;
        
        section.fields.forEach(field => {
            const value = STATE.formData[field.name] || '(Not provided)';
            html += `
                <div class="review-item">
                    <div class="review-label">${field.label}</div>
                    <div class="review-value">${value}</div>
                </div>
            `;
        });
        
        html += '</div>';
        sectionDiv.innerHTML = html;
        reviewContent.appendChild(sectionDiv);
    });
}

// ============================================
// Age Display
// ============================================

function updateAgeDisplay() {
    const dobInput = document.querySelector('input[name="dateOfBirth"]');
    const ageDisplay = document.getElementById('ageDisplay');
    
    if (dobInput.value) {
        const age = calculateAge(dobInput.value);
        ageDisplay.textContent = `Age: ${age} years old`;
    }
}

// ============================================
// Form Submission
// ============================================

async function submitForm(e) {
    e.preventDefault();
    hideAlert();
    
    if (!validateStep5()) {
        return;
    }
    
    collectFormData();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const dbData = transformDataForDatabase();
        
        const response = await fetch(`${CONFIG.API_BASE}/admission/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dbData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            document.getElementById('formContainer').style.display = 'none';
            document.getElementById('successMessage').classList.remove('hidden');
            document.getElementById('referenceNumber').textContent = result.referenceNumber || result.applicationId;
            
            clearFormData();
            showToast('Application submitted successfully!', 'success');
        } else {
            showAlert(result.error + ': ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showAlert('Connection error: ' + error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
    }
}

function resetForm() {
    clearFormData();
    location.reload();
}

// ============================================
// Event Listeners
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    
    document.getElementById('admissionForm').addEventListener('submit', submitForm);
    
    document.getElementById('admissionForm').addEventListener('change', () => {
        clearTimeout(STATE.autoSaveTimer);
        STATE.autoSaveTimer = setTimeout(() => {
            collectFormData();
            showToast('Form saved automatically', 'info');
        }, CONFIG.AUTO_SAVE_DELAY);
    });
    
    document.querySelector('input[name="dateOfBirth"]').addEventListener('change', updateAgeDisplay);
    
    document.getElementById('schoolLevel').addEventListener('change', updateGradeLevels);
    
    showStep();
});

// Philippine Address Data
const addressData = {
    "Quezon Province": {
        "Lucena City": ["Barangay 1", "Barangay 2", "Barangay 3", "Gulang-Gulang", "Ibabang Dupay", "Ilayang Dupay"],
        "Tayabas City": ["Alsam Ibaba", "Alsam Ilaya", "Angustias", "Ayusan I", "Ayusan II", "Baguio"],
        "Sariaya": ["Barangay 1", "Barangay 2", "Barangay 3", "Concepcion Ibaba", "Concepcion Palad"],
        "Candelaria": ["Buenavista East", "Buenavista West", "Malabanban Norte", "Malabanban Sur"],
        "Tiaong": ["Anastacia", "Aquino", "Behia", "Bukal", "Buhay"],
        "Pagbilao": ["Pag-asa", "Pinagbayanan", "Silangang Malicboy", "Binahaan"],
        "Infanta": ["Alitas", "Antikin", "Bantilan", "Binulasan", "Boboin"],
        "Mauban": ["Alitao", "Bagong Bayan", "Balaybalay", "Bato", "Cagbalogo I"],
        "Gumaca": ["Adia Bitaog", "Bagong Buhay", "Bamban", "Bantad"],
        "Lopez": ["Bagacay", "Banabahin Ibaba", "Banabahin Ilaya", "Bantilan"]
    },
    "Laguna": {
        "Calamba": ["Bagong Kalsada", "Banadero", "Banlic", "Barandal", "Barangay 1"],
        "San Pablo": ["Atisan", "Barangay I-A", "Barangay I-B", "Barangay II-A"],
        "Biñan": ["Biñan", "Bungahan", "Canlalay", "Casile", "De La Paz"],
        "Santa Rosa": ["Aplaya", "Balibago", "Caingin", "Dila", "Dita"],
        "Cabuyao": ["Baclaran", "Banaybanay", "Banlic", "Barangay Dos", "Bigaa"],
        "Los Baños": ["Anos", "Bagong Silang", "Bambang", "Batong Malake", "Baybayin"]
    },
    "Batangas": {
        "Batangas City": ["Alangilan", "Balagtas", "Balete", "Banaba Center", "Banaba Ibaba"],
        "Lipa City": ["Adya", "Anilao", "Antipolo del Norte", "Bagong Pook"],
        "Tanauan City": ["Altura Bata", "Altura Matanda", "Altura South", "Ambulong"],
        "Santo Tomas": ["San Agustin", "San Antonio", "San Bartolome", "San Felix"],
        "Nasugbu": ["Aga", "Balaytigui", "Banilad", "Barangay 1"],
        "Lemery": ["Anak-Dagat", "Arumahan", "Ayao-iyao", "Bagong Pook"]
    },
    "Cavite": {
        "Bacoor": ["Alima", "Aniban I", "Aniban II", "Banalo", "Bayanan"],
        "Dasmariñas": ["Burol I", "Burol II", "Burol III", "Emmanuel Bergado I"],
        "Imus": ["Alapan I-A", "Alapan I-B", "Alapan II-A", "Anabu I-A"],
        "Cavite City": ["Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4"],
        "General Trias": ["Alingaro", "Arnaldo Poblacion", "Bacao I", "Bacao II"],
        "Trece Martires": ["Aguado", "Cabezas", "Cabuco", "De Ocampo"]
    },
    "Rizal": {
        "Antipolo": ["Bagong Nayon", "Beverly Hills", "Calawis", "Dalig", "Dela Paz"],
        "Cainta": ["San Andres", "San Isidro", "San Juan", "San Roque"],
        "Taytay": ["Dolores", "Muzon", "San Isidro", "San Juan", "Santa Ana"],
        "Binangonan": ["Bangad", "Batingan", "Bilibiran", "Binitagan"],
        "San Mateo": ["Ampid I", "Ampid II", "Banaba", "Burgos", "Dulongbayan"],
        "Rodriguez": ["Balite", "Burgos", "Geronimo", "Macabud"]
    },
    "Metro Manila": {
        "Quezon City": ["Bagong Pag-asa", "Bahay Toro", "Balingasa", "Batasan Hills"],
        "Manila": ["Binondo", "Ermita", "Intramuros", "Malate", "Paco", "Pandacan"],
        "Makati": ["Bel-Air", "Dasmariñas", "Forbes Park", "Guadalupe Nuevo", "Poblacion"],
        "Pasig": ["Bagong Ilog", "Bagong Katipunan", "Kapitolyo", "Manggahan", "Oranbo"],
        "Taguig": ["Bagumbayan", "Bambang", "Calzada", "Central Bicutan", "Fort Bonifacio"],
        "Pasay": ["Barangay 1", "Barangay 76", "Malibay", "San Isidro", "Villamor"],
        "Parañaque": ["Baclaran", "BF Homes", "Don Bosco", "La Huerta", "San Antonio"],
        "Las Piñas": ["Almanza Uno", "Almanza Dos", "BF International", "Daniel Fajardo"],
        "Muntinlupa": ["Alabang", "Bayanan", "Buli", "Cupang", "Poblacion"],
        "Caloocan": ["Barangay 1", "Barangay 2", "Bagong Silang", "Camarin"],
        "Malabon": ["Acacia", "Baritan", "Catmon", "Concepcion", "Dampalit"],
        "Navotas": ["Bagumbayan North", "Bagumbayan South", "Bangculasi", "Daanghari"],
        "Valenzuela": ["Arkong Bato", "Bagbaguin", "Balangkas", "Bignay"],
        "Marikina": ["Barangka", "Calumpang", "Concepcion Uno", "Industrial Valley"],
        "San Juan": ["Addition Hills", "Balong-Bato", "Corazon de Jesus", "Ermitaño"],
        "Mandaluyong": ["Addition Hills", "Bagong Silang", "Barangka Drive", "Buayang Bato"]
    }
};

// Get dropdown elements
const provinceSelect = document.getElementById('province');
const citySelect = document.getElementById('city');
const barangaySelect = document.getElementById('barangay');

// Province change event
provinceSelect.addEventListener('change', function() {
    const selectedProvince = this.value;
    
    // Reset and disable city and barangay
    citySelect.innerHTML = '<option value="">Select City/Municipality</option>';
    barangaySelect.innerHTML = '<option value="">Select city first</option>';
    citySelect.disabled = true;
    barangaySelect.disabled = true;
    
    if (selectedProvince && addressData[selectedProvince]) {
        // Populate cities
        const cities = Object.keys(addressData[selectedProvince]);
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;
    }
});

// City change event
citySelect.addEventListener('change', function() {
    const selectedProvince = provinceSelect.value;
    const selectedCity = this.value;
    
    // Reset barangay
    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
    barangaySelect.disabled = true;
    
    if (selectedCity && addressData[selectedProvince][selectedCity]) {
        // Populate barangays
        const barangays = addressData[selectedProvince][selectedCity];
        barangays.forEach(barangay => {
            const option = document.createElement('option');
            option.value = barangay;
            option.textContent = barangay;
            barangaySelect.appendChild(option);
        });
        barangaySelect.disabled = false;
    }
});

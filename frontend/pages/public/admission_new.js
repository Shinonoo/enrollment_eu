// ============================================
// ADMISSION NEW STUDENT JAVASCRIPT
// Manuel S. Enverga University Foundation Inc.
// ============================================

// ============================================
// CONFIGURATION & STATE MANAGEMENT
// ============================================

const CONFIG = {
    API_BASE: 'http://localhost:5001/api',
    TOAST_DURATION: 3000,
    TOTAL_STEPS: 5,
    AUTO_SAVE_DELAY: 3000,
    STORAGE_EXPIRY_HOURS: 24  // **NEW: Data expires after 24 hours**
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
// PHILIPPINE ADDRESS DATA
// ============================================

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

// ============================================
// UTILITY FUNCTIONS
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

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ============================================
// LOCAL STORAGE MANAGEMENT (WITH EXPIRATION)
// ============================================

function saveToLocalStorage() {
    const dataWithExpiry = {
        data: STATE.formData,
        step: STATE.currentStep,
        timestamp: Date.now(),
        expiresIn: CONFIG.STORAGE_EXPIRY_HOURS * 60 * 60 * 1000 // Convert hours to milliseconds
    };
    
    localStorage.setItem('admissionFormData', JSON.stringify(dataWithExpiry));
    
    console.log(`Form saved. Expires in ${CONFIG.STORAGE_EXPIRY_HOURS} hours.`);
}

function loadFromLocalStorage() {
    const savedDataString = localStorage.getItem('admissionFormData');
    
    if (!savedDataString) {
        console.log('No saved data found');
        return;
    }
    
    try {
        const savedDataObject = JSON.parse(savedDataString);
        
        // Check if data has expiration info (new format)
        if (savedDataObject.timestamp && savedDataObject.expiresIn) {
            const now = Date.now();
            const expiryTime = savedDataObject.timestamp + savedDataObject.expiresIn;
            const timeRemaining = expiryTime - now;
            
            // Check if data has expired
            if (timeRemaining <= 0) {
                console.log('Saved data has expired. Clearing...');
                clearExpiredData();
                showToast('Your saved form data has expired. Please start fresh.', 'info');
                return;
            }
            
            // Data is still valid
            const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            
            console.log(`Saved data found. Expires in ${hoursRemaining}h ${minutesRemaining}m`);
            
            // Show notification about saved data
            showToast(`Previous form data restored (expires in ${hoursRemaining}h ${minutesRemaining}m)`, 'info');
            
            // Restore the data
            STATE.formData = savedDataObject.data || {};
            STATE.currentStep = Math.min(parseInt(savedDataObject.step) || 1, CONFIG.TOTAL_STEPS);
            
            populateFormWithSavedData();
            
            // Restore cascading dropdowns after populating
            setTimeout(() => {
                restoreCascadingDropdowns();
            }, 100);
            
        } else {
            // Old format without expiration - migrate it
            console.log('Old data format detected. Migrating...');
            STATE.formData = savedDataObject;
            populateFormWithSavedData();
            
            // Re-save in new format
            saveToLocalStorage();
            
            setTimeout(() => {
                restoreCascadingDropdowns();
            }, 100);
        }
        
    } catch (error) {
        console.error('Error loading form data:', error);
        clearExpiredData();
    }
}

function clearExpiredData() {
    localStorage.removeItem('admissionFormData');
    STATE.formData = {};
    STATE.completedSteps.clear();
    STATE.currentStep = 1;
}

function checkDataExpiration() {
    const savedDataString = localStorage.getItem('admissionFormData');
    
    if (!savedDataString) return;
    
    try {
        const savedDataObject = JSON.parse(savedDataString);
        
        if (savedDataObject.timestamp && savedDataObject.expiresIn) {
            const now = Date.now();
            const expiryTime = savedDataObject.timestamp + savedDataObject.expiresIn;
            
            if (now >= expiryTime) {
                console.log('Data expired during session. Clearing...');
                clearExpiredData();
                showAlert('Your form session has expired. Please start over.', 'warning');
                location.reload();
            }
        }
    } catch (error) {
        console.error('Error checking expiration:', error);
    }
}

function getTimeRemaining() {
    const savedDataString = localStorage.getItem('admissionFormData');
    
    if (!savedDataString) return null;
    
    try {
        const savedDataObject = JSON.parse(savedDataString);
        
        if (savedDataObject.timestamp && savedDataObject.expiresIn) {
            const now = Date.now();
            const expiryTime = savedDataObject.timestamp + savedDataObject.expiresIn;
            const timeRemaining = expiryTime - now;
            
            if (timeRemaining <= 0) return null;
            
            const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            
            return { hours, minutes, milliseconds: timeRemaining };
        }
    } catch (error) {
        return null;
    }
    
    return null;
}

function clearFormData() {
    if (confirm('Are you sure you want to clear all saved data and start fresh?')) {
        clearExpiredData();
        location.reload();
    }
}

// ============================================
// CASCADING ADDRESS DROPDOWNS
// ============================================

function initializeAddressDropdowns() {
    const provinceSelect = document.getElementById('province');
    const citySelect = document.getElementById('city');
    
    if (provinceSelect) {
        provinceSelect.addEventListener('change', function() {
            const selectedProvince = this.value;
            populateCities(selectedProvince);
        });
    }
    
    if (citySelect) {
        citySelect.addEventListener('change', function() {
            const selectedProvince = provinceSelect.value;
            const selectedCity = this.value;
            populateBarangays(selectedProvince, selectedCity);
        });
    }
}

function populateCities(province) {
    const citySelect = document.getElementById('city');
    const barangaySelect = document.getElementById('barangay');
    
    // Reset and disable city and barangay
    citySelect.innerHTML = '<option value="">Select City/Municipality</option>';
    barangaySelect.innerHTML = '<option value="">Select city first</option>';
    citySelect.disabled = true;
    barangaySelect.disabled = true;
    
    if (province && addressData[province]) {
        // Populate cities
        const cities = Object.keys(addressData[province]);
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        citySelect.disabled = false;
    }
}

function populateBarangays(province, city) {
    const barangaySelect = document.getElementById('barangay');
    
    // Reset barangay
    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';
    barangaySelect.disabled = true;
    
    if (city && addressData[province] && addressData[province][city]) {
        // Populate barangays
        const barangays = addressData[province][city];
        barangays.forEach(barangay => {
            const option = document.createElement('option');
            option.value = barangay;
            option.textContent = barangay;
            barangaySelect.appendChild(option);
        });
        barangaySelect.disabled = false;
    }
}

// ============================================
// GRADE LEVEL & ACADEMIC UPDATES
// ============================================

function updateGradeLevels() {
    const schoolLevel = document.getElementById('schoolLevel').value;
    const gradeLevelSelect = document.getElementById('gradeLevel');
    const strandGroup = document.getElementById('strandGroup');
    const strandSelect = document.getElementById('strand');
    const previousAcademicInfo = document.getElementById('previousAcademicInfo');
    
    // Clear existing options
    gradeLevelSelect.innerHTML = '<option value="">Select grade level</option>';
    gradeLevelSelect.disabled = false;
    
    if (schoolLevel === 'JHS') {
        // Junior High School grades (7-10)
        GRADE_OPTIONS.JHS.forEach(grade => {
            const option = document.createElement('option');
            option.value = `Grade ${grade}`;
            option.textContent = `Grade ${grade}`;
            gradeLevelSelect.appendChild(option);
        });
        
        // Hide strand selection for JHS
        strandGroup.classList.add('hidden');
        strandSelect.disabled = true;
        strandSelect.removeAttribute('required');
        
        // Show previous academic info section
        previousAcademicInfo.classList.remove('hidden');
        enableAcademicFields();
        
    } else if (schoolLevel === 'SHS') {
        // Senior High School grades (11-12)
        GRADE_OPTIONS.SHS.forEach(grade => {
            const option = document.createElement('option');
            option.value = `Grade ${grade}`;
            option.textContent = `Grade ${grade}`;
            gradeLevelSelect.appendChild(option);
        });
        
        // Show strand selection for SHS
        strandGroup.classList.remove('hidden');
        strandSelect.disabled = false;
        strandSelect.setAttribute('required', 'required');
        
        // Show previous academic info section
        previousAcademicInfo.classList.remove('hidden');
        enableAcademicFields();
        
    } else {
        // If no school level selected, disable grade level
        gradeLevelSelect.disabled = true;
        gradeLevelSelect.innerHTML = '<option value="">First select a school level</option>';
        
        // Hide strand selection
        strandGroup.classList.add('hidden');
        strandSelect.disabled = true;
        strandSelect.removeAttribute('required');
        
        // Hide previous academic info
        previousAcademicInfo.classList.add('hidden');
        disableAcademicFields();
    }
}

function enableAcademicFields() {
    document.getElementById('previousSchool').disabled = false;
    document.getElementById('lastGradeCompleted').disabled = false;
    document.getElementById('yearCompleted').disabled = false;
    document.getElementById('generalAverage').disabled = false;
}

function disableAcademicFields() {
    document.getElementById('previousSchool').disabled = true;
    document.getElementById('lastGradeCompleted').disabled = true;
    document.getElementById('yearCompleted').disabled = true;
    document.getElementById('generalAverage').disabled = true;
}

function handleGradeLevelChange() {
    const gradeLevel = document.getElementById('gradeLevel').value;
    const academicHonorGroup = document.getElementById('academicHonorGroup');
    const generalAverage = document.getElementById('generalAverage');
    
    if (!gradeLevel) {
        academicHonorGroup.innerHTML = '';
        return;
    }
    
    // Check if Grade 7 or Grade 11 - show academic distinction
    if (gradeLevel === 'Grade 7' || gradeLevel === 'Grade 11') {
        const title = gradeLevel === 'Grade 7' ? 'Elementary' : 'Junior High School';
        const lastGrade = gradeLevel === 'Grade 7' ? 'Grade 6' : 'Grade 10';
        
        academicHonorGroup.innerHTML = `
            <label>Academic Distinction (${title})</label>
            <select name="academicHonor" id="academicHonor">
                <option value="">Select if applicable</option>
                <option value="Valedictorian">Valedictorian (Highest Honors)</option>
                <option value="Salutatorian">Salutatorian (2nd Highest Honors)</option>
                <option value="With High Honors">With High Honors</option>
                <option value="With Honors">With Honors</option>
                <option value="None">None</option>
            </select>
            <small class="field-hint">Select your academic achievement in ${lastGrade}</small>
        `;
        
        // Update average label
        const averageLabel = generalAverage.previousElementSibling;
        averageLabel.innerHTML = `General Average (${lastGrade}) <span class="required">*</span>`;
        generalAverage.placeholder = `Your final average in ${lastGrade}`;
        
    } else {
        // For other grades, no academic distinction field
        academicHonorGroup.innerHTML = '';
        
        // Update average label to generic
        const averageLabel = generalAverage.previousElementSibling;
        averageLabel.innerHTML = `General Average <span class="required">*</span>`;
        generalAverage.placeholder = 'e.g., 90.5';
    }
}

// ============================================
// AGE DISPLAY & CALCULATION
// ============================================

function updateAgeDisplay() {
    const dobInput = document.querySelector('input[name="dateOfBirth"]');
    const ageDisplay = document.getElementById('ageDisplay');
    const ageField = document.getElementById('ageField');
    
    if (dobInput && dobInput.value) {
        const age = calculateAge(dobInput.value);
        
        // Update the hint text below date of birth
        if (ageDisplay) {
            if (age < 10) {
                ageDisplay.textContent = `⚠️ Age: ${age} years old - Minimum age is 10 years`;
                ageDisplay.style.color = 'var(--danger)';
                ageDisplay.style.fontWeight = '600';
            } else if (age >= 10 && age <= 25) {
                ageDisplay.textContent = `✓ Age: ${age} years old`;
                ageDisplay.style.color = 'var(--success)';
                ageDisplay.style.fontWeight = '600';
            } else {
                ageDisplay.textContent = `Age: ${age} years old`;
                ageDisplay.style.color = 'var(--gray-600)';
                ageDisplay.style.fontWeight = '400';
            }
        }
        
        // Update the age textbox
        if (ageField) {
            ageField.value = `${age} years old`;
            STATE.formData['age'] = `${age} years old`;
        }
    } else {
        // Clear age field if no date selected
        if (ageField) {
            ageField.value = '';
        }
        if (ageDisplay) {
            ageDisplay.textContent = 'You must be at least 10 years old to enroll';
            ageDisplay.style.color = 'var(--gray-600)';
            ageDisplay.style.fontWeight = '400';
        }
    }
}

// ============================================
// PHOTO UPLOAD HANDLING
// ============================================

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    const photoPreview = document.getElementById('photoPreview');
    const photoFileName = document.getElementById('photoFileName');
    const photoFileSize = document.getElementById('photoFileSize');
    
    if (!file) {
        photoPreviewContainer.style.display = 'none';
        return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
        showAlert('Please upload a valid image file (JPEG, JPG, or PNG only)', 'error');
        event.target.value = '';
        return;
    }
    
    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        showAlert('Photo size must be less than 2MB. Please choose a smaller file.', 'error');
        event.target.value = '';
        return;
    }
    
    // Read and display the image
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Check minimum dimensions
            if (img.width < 400 || img.height < 400) {
                showToast('Photo resolution is low. Recommended: 800x800 pixels or higher', 'warning');
            }
            
            // Display preview
            photoPreview.src = e.target.result;
            photoFileName.textContent = `File: ${file.name}`;
            photoFileSize.textContent = `Size: ${formatFileSize(file.size)}`;
            photoPreviewContainer.style.display = 'block';
            
            // Store in STATE for form submission
            STATE.formData['studentPhoto'] = file;
            STATE.formData['studentPhotoPreview'] = e.target.result;
            STATE.formData['studentPhotoName'] = file.name;
            STATE.formData['studentPhotoSize'] = formatFileSize(file.size);
            
            showToast('Photo uploaded successfully!', 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function removePhoto() {
    const photoInput = document.getElementById('studentPhoto');
    const photoPreviewContainer = document.getElementById('photoPreviewContainer');
    
    photoInput.value = '';
    photoPreviewContainer.style.display = 'none';
    
    delete STATE.formData['studentPhoto'];
    delete STATE.formData['studentPhotoPreview'];
    delete STATE.formData['studentPhotoName'];
    delete STATE.formData['studentPhotoSize'];
    
    showToast('Photo removed', 'info');
}

// ============================================
// FORM VALIDATION (ENHANCED WITH VISUAL FEEDBACK)
// ============================================

function validateStep(stepNumber) {
    const step = document.getElementById(`formStep${stepNumber}`);
    const inputs = step.querySelectorAll('input[required], select[required]');
    let firstInvalidInput = null;
    let isValid = true;
    
    // Clear previous error highlights
    clearErrorHighlights(step);
    
    for (let input of inputs) {
        // Skip hidden or disabled fields
        if (input.offsetParent === null || input.disabled) {
            continue;
        }
        
        // Check if field is empty
        if (!input.value || input.value.trim() === '') {
            highlightError(input, 'This field is required');
            isValid = false;
            
            if (!firstInvalidInput) {
                firstInvalidInput = input;
            }
            continue;
        }
        
        // Email validation
        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                highlightError(input, 'Please enter a valid email address');
                isValid = false;
                
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
                continue;
            }
        }
        
        // Phone validation
        if (input.type === 'tel' && input.value) {
            const phoneRegex = /^09\d{9}$/;
            if (!phoneRegex.test(input.value.replace(/\s/g, ''))) {
                highlightError(input, 'Please enter a valid Philippine mobile number (e.g., 09123456789)');
                isValid = false;
                
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
                continue;
            }
        }
        
        // Number validation (for general average)
        if (input.type === 'number' && input.value) {
            const value = parseFloat(input.value);
            const min = parseFloat(input.min);
            const max = parseFloat(input.max);
            
            if (min && value < min) {
                highlightError(input, `Value must be at least ${min}`);
                isValid = false;
                
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
                continue;
            }
            
            if (max && value > max) {
                highlightError(input, `Value must be at most ${max}`);
                isValid = false;
                
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
                continue;
            }
        }
        
        // Date validation (age check)
        if (input.type === 'date' && input.name === 'dateOfBirth' && input.value) {
            const age = calculateAge(input.value);
            if (age < 10) {
                highlightError(input, 'Student must be at least 10 years old');
                isValid = false;
                
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
                continue;
            }
        }
        
        // File validation (photo)
        if (input.type === 'file' && input.hasAttribute('required')) {
            if (!input.files || input.files.length === 0) {
                highlightError(input, 'Please upload your photo');
                isValid = false;
                
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
                continue;
            }
        }
    }
    
    if (!isValid) {
        // Show summary alert
        showAlert('Please fill in all required fields correctly (highlighted in red)', 'warning');
        
        // Scroll to first error
        if (firstInvalidInput) {
            firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidInput.focus();
        }
        
        return false;
    }
    
    return true;
}

function highlightError(input, message) {
    // Add error class to input
    input.classList.add('input-error');
    
    // Create or update error message
    let errorMsg = input.parentElement.querySelector('.error-message');
    
    if (!errorMsg) {
        errorMsg = document.createElement('small');
        errorMsg.className = 'error-message';
        
        // Insert after the input
        if (input.nextElementSibling && input.nextElementSibling.classList.contains('field-hint')) {
            input.nextElementSibling.insertAdjacentElement('afterend', errorMsg);
        } else {
            input.insertAdjacentElement('afterend', errorMsg);
        }
    }
    
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

function clearErrorHighlights(step) {
    // Remove all error classes
    const errorInputs = step.querySelectorAll('.input-error');
    errorInputs.forEach(input => {
        input.classList.remove('input-error');
    });
    
    // Remove all error messages
    const errorMessages = step.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}

function validateStep5() {
    const agreeTerms = document.querySelector('input[name="agreeTerms"]');
    const agreePrivacy = document.querySelector('input[name="agreePrivacy"]');
    
    let isValid = true;
    
    if (!agreeTerms.checked) {
        highlightCheckboxError(agreeTerms, 'You must agree to the terms');
        isValid = false;
    }
    
    if (!agreePrivacy.checked) {
        highlightCheckboxError(agreePrivacy, 'You must agree to the privacy policy');
        isValid = false;
    }
    
    if (!isValid) {
        showAlert('Please agree to the terms and privacy policy', 'warning');
        return false;
    }
    
    return true;
}

function highlightCheckboxError(checkbox, message) {
    const label = checkbox.closest('label');
    if (label) {
        label.style.border = '2px solid var(--danger)';
        label.style.padding = '0.5rem';
        label.style.borderRadius = '6px';
        label.style.backgroundColor = 'rgba(220, 53, 69, 0.05)';
    }
}

// Clear errors on input change
function initializeErrorClearing() {
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', function() {
            if (this.classList.contains('input-error')) {
                this.classList.remove('input-error');
                
                const errorMsg = this.parentElement.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        });
        
        input.addEventListener('change', function() {
            if (this.classList.contains('input-error')) {
                this.classList.remove('input-error');
                
                const errorMsg = this.parentElement.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        });
    });
}

// ============================================
// FORM DATA MANAGEMENT
// ============================================

function collectFormData() {
    const form = document.getElementById('admissionForm');
    const formData = new FormData(form);
    
    for (let [key, value] of formData.entries()) {
        STATE.formData[key] = value;
    }
    
    saveToLocalStorage();
}

// ============================================
// STEP NAVIGATION
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
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`formStep${STATE.currentStep}`).classList.add('active');
    
    // Update UI
    updateProgressBar();
    updateNavigationButtons();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgressBar() {
    const progress = (STATE.currentStep / CONFIG.TOTAL_STEPS) * 100;
    document.querySelector('.progress-bar').style.setProperty('--progress', `${progress}%`);
    
    // Update step indicators
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
// REVIEW GENERATION (SINGLE CARD - CLEAN)
// ============================================

function generateReview() {
    const reviewContent = document.getElementById('reviewContent');
    reviewContent.innerHTML = '';
    
    // Helper to get plain value without HTML
    const getPlainValue = (name) => {
        const value = STATE.formData[name];
        return value && value.trim() !== '' ? value : '';
    };
    
    // Helper to get value with "Not provided" message
    const getValue = (name) => {
        const value = STATE.formData[name];
        return value && value.trim() !== '' ? value : '<span class="not-provided">Not provided</span>';
    };
    
    // Build full name properly
    const buildFullName = () => {
        const firstName = getPlainValue('firstName');
        const middleName = getPlainValue('middleName');
        const lastName = getPlainValue('lastName');
        const suffix = getPlainValue('suffix');
        
        if (!firstName && !lastName) {
            return '<span class="not-provided">Not provided</span>';
        }
        
        const nameParts = [firstName, middleName, lastName, suffix].filter(part => part !== '');
        return nameParts.join(' ');
    };
    
    // Build full address
    const buildFullAddress = () => {
        const street = getPlainValue('streetAddress');
        const barangay = getPlainValue('barangay');
        const city = getPlainValue('city');
        const province = getPlainValue('province');
        const zip = getPlainValue('zipCode');
        
        if (!street && !city) {
            return '<span class="not-provided">Not provided</span>';
        }
        
        let address = '';
        if (street) address += street;
        if (barangay) address += (address ? ', ' : '') + 'Brgy. ' + barangay;
        if (city) address += (address ? ', ' : '') + city;
        if (province) address += (address ? ', ' : '') + province;
        if (zip) address += ' ' + zip;
        
        return address || '<span class="not-provided">Not provided</span>';
    };
    
    // === SINGLE MAIN CARD ===
    const mainCard = document.createElement('div');
    mainCard.className = 'review-main-card';
    
    let html = `
        <!-- Photo Section -->
        <div class="review-photo-header">
            ${STATE.formData['studentPhotoPreview'] ? 
                `<img src="${STATE.formData['studentPhotoPreview']}" alt="Student Photo" class="review-student-photo">` :
                `<div class="review-photo-placeholder">
                    <span style="font-size: 3rem;">👤</span>
                </div>`
            }
            <div class="review-name-section">
                <h2 class="review-full-name">${buildFullName()}</h2>
                <p class="review-subtitle">${getValue('schoolLevel')} - ${getValue('gradeLevel')}</p>
            </div>
        </div>
        
        <!-- Information Grid -->
        <div class="review-info-grid">
            
            <!-- Personal Information Section -->
            <div class="review-section-header">
                <span class="section-icon">👤</span>
                <h3>Personal Information</h3>
            </div>
            
            <div class="review-row">
                <div class="review-field">
                    <span class="field-label">Date of Birth</span>
                    <span class="field-value">${getValue('dateOfBirth')}</span>
                </div>
                <div class="review-field">
                    <span class="field-label">Age</span>
                    <span class="field-value">${getValue('age')}</span>
                </div>
            </div>
            
            <div class="review-row">
                <div class="review-field">
                    <span class="field-label">Gender</span>
                    <span class="field-value">${getValue('gender')}</span>
                </div>
                <div class="review-field">
                    <span class="field-label">Nationality</span>
                    <span class="field-value">${getValue('nationality')}</span>
                </div>
            </div>
            
            <div class="review-row-full">
                <div class="review-field">
                    <span class="field-label">Place of Birth</span>
                    <span class="field-value">${getValue('placeOfBirth')}</span>
                </div>
            </div>
            
            <div class="review-divider"></div>
            
            <!-- Contact Information Section -->
            <div class="review-section-header">
                <span class="section-icon">📍</span>
                <h3>Contact Information</h3>
            </div>
            
            <div class="review-row-full">
                <div class="review-field">
                    <span class="field-label">Complete Address</span>
                    <span class="field-value">${buildFullAddress()}</span>
                </div>
            </div>
            
            <div class="review-row">
                <div class="review-field">
                    <span class="field-label">Email Address</span>
                    <span class="field-value">${getValue('email')}</span>
                </div>
                <div class="review-field">
                    <span class="field-label">Mobile Number</span>
                    <span class="field-value">${getValue('phoneNumber')}</span>
                </div>
            </div>
            
            <div class="review-divider"></div>
            
            <!-- Guardian Information Section -->
            <div class="review-section-header">
                <span class="section-icon">👨‍👩‍👧</span>
                <h3>Guardian Information</h3>
            </div>
            
            <div class="review-row">
                <div class="review-field">
                    <span class="field-label">Guardian Name</span>
                    <span class="field-value">${getValue('guardianName')}</span>
                </div>
                <div class="review-field">
                    <span class="field-label">Relationship</span>
                    <span class="field-value">${getValue('guardianRelationship')}</span>
                </div>
            </div>
            
            <div class="review-row">
                <div class="review-field">
                    <span class="field-label">Contact Number</span>
                    <span class="field-value">${getValue('guardianPhone')}</span>
                </div>
                <div class="review-field">
                    <span class="field-label">Email Address</span>
                    <span class="field-value">${getValue('guardianEmail')}</span>
                </div>
            </div>
            
            ${getPlainValue('guardianAddress') ? `
            <div class="review-row-full">
                <div class="review-field">
                    <span class="field-label">Guardian Address</span>
                    <span class="field-value">${getValue('guardianAddress')}</span>
                </div>
            </div>
            ` : ''}
            
            <div class="review-divider"></div>
            
            <!-- Academic Information Section -->
            <div class="review-section-header">
                <span class="section-icon">🎓</span>
                <h3>Academic Background</h3>
            </div>
            
            <div class="review-row">
                <div class="review-field">
                    <span class="field-label">School Level</span>
                    <span class="field-value">${getValue('schoolLevel')}</span>
                </div>
                <div class="review-field">
                    <span class="field-label">Grade Level</span>
                    <span class="field-value">${getValue('gradeLevel')}</span>
                </div>
            </div>
            
            ${getPlainValue('strand') ? `
            <div class="review-row-full">
                <div class="review-field">
                    <span class="field-label">Strand</span>
                    <span class="field-value">${getValue('strand')}</span>
                </div>
            </div>
            ` : ''}
            
            <div class="review-row-full">
                <div class="review-field">
                    <span class="field-label">Previous School</span>
                    <span class="field-value">${getValue('previousSchool')}</span>
                </div>
            </div>
            
            <div class="review-row">
                <div class="review-field">
                    <span class="field-label">Last Grade Completed</span>
                    <span class="field-value">${getValue('lastGradeCompleted')}</span>
                </div>
                <div class="review-field">
                    <span class="field-label">School Year Completed</span>
                    <span class="field-value">${getValue('yearCompleted')}</span>
                </div>
            </div>
            
            <div class="review-row-highlight">
                <div class="review-field-highlight">
                    <span class="field-label">General Average</span>
                    <span class="field-value-big">${getValue('generalAverage')}</span>
                </div>
                ${getPlainValue('academicHonor') && getPlainValue('academicHonor') !== 'None' ? `
                <div class="review-field-highlight">
                    <span class="field-label">Academic Distinction</span>
                    <span class="field-value-big">${getValue('academicHonor')}</span>
                </div>
                ` : ''}
            </div>
            
            ${getPlainValue('referralSource') ? `
            <div class="review-row-full">
                <div class="review-field">
                    <span class="field-label">How did you hear about MSEUF?</span>
                    <span class="field-value">${getValue('referralSource')}</span>
                </div>
            </div>
            ` : ''}
            
        </div>
    `;
    
    mainCard.innerHTML = html;
    reviewContent.appendChild(mainCard);
}

// ============================================
// FORM SUBMISSION
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
    submitBtn.textContent = '⏳ Submitting...';
    
    try {
        const response = await fetch(`${CONFIG.API_BASE}/admission/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(STATE.formData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            document.getElementById('formContainer').style.display = 'none';
            document.getElementById('successMessage').classList.remove('hidden');
            document.getElementById('referenceNumber').textContent = result.referenceNumber || result.applicationId;
            
            // Clear saved data
            localStorage.removeItem('admissionFormData');
            localStorage.removeItem('admissionFormStep');
            
            showToast('Application submitted successfully!', 'success');
        } else {
            showAlert(result.message || 'Submission failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showAlert('Connection error. Please check your internet and try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '🎓 Submit Application';
    }
}

function resetForm() {
    localStorage.removeItem('admissionFormData');
    localStorage.removeItem('admissionFormStep');
    location.reload();
}

// ============================================
// GENERAL AVERAGE VALIDATION & FEEDBACK
// ============================================

function initializeAverageValidation() {
    const generalAverage = document.getElementById('generalAverage');
    const hint = document.getElementById('averageHint');
    
    if (generalAverage && hint) {
        generalAverage.addEventListener('input', function() {
            const value = parseFloat(this.value);
            
            if (value < 75 || value > 100) {
                this.setCustomValidity('Average must be between 75 and 100');
            } else {
                this.setCustomValidity('');
            }
            
            // Visual feedback
            if (value >= 95 && value <= 100) {
                hint.style.color = 'var(--success)';
                hint.style.fontWeight = '600';
                hint.textContent = '🏆 Outstanding! You may qualify for academic scholarships';
            } else if (value >= 90 && value < 95) {
                hint.style.color = 'var(--success)';
                hint.style.fontWeight = '600';
                hint.textContent = '⭐ Excellent academic performance!';
            } else if (value >= 85 && value < 90) {
                hint.style.color = 'var(--primary)';
                hint.style.fontWeight = '600';
                hint.textContent = '✓ Very good academic performance';
            } else if (value >= 75 && value < 85) {
                hint.style.color = 'var(--gray-600)';
                hint.style.fontWeight = '400';
                hint.textContent = 'Your final general average (75-100 scale)';
            }
        });
    }
}

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // **NEW: Confirm application type on first visit**
    const hasShownWarning = sessionStorage.getItem('admissionTypeWarning');
    const hasSavedData = localStorage.getItem('admissionFormData');
    
    if (!hasShownWarning && !hasSavedData) {
        setTimeout(() => {
            const userConfirmed = confirm(
                '📋 CONFIRM APPLICATION TYPE\n\n' +
                'You are starting a NEW STUDENT application.\n' +
                'This is for students enrolling at MSEUF for the first time.\n\n' +
                'Is this correct?\n\n' +
                '• Click OK to continue with New Student application\n' +
                '• Click Cancel to go back and choose a different type'
            );
            
            if (!userConfirmed) {
                window.location.href = 'admission.html';
                return;
            }
            
            sessionStorage.setItem('admissionTypeWarning', 'true');
        }, 500); // Small delay so page loads smoothly first
    }
    
    // Load saved data
    loadFromLocalStorage();
    
    // Initialize error clearing
    initializeErrorClearing();
    
    // Check for expiration every 5 minutes
    setInterval(checkDataExpiration, 5 * 60 * 1000);
    
    // Show expiration warning when 1 hour remaining
    const timeRemaining = getTimeRemaining();
    if (timeRemaining && timeRemaining.hours <= 1) {
        setTimeout(() => {
            const remaining = getTimeRemaining();
            if (remaining) {
                showToast(`⏰ Your form data will expire in ${remaining.hours}h ${remaining.minutes}m`, 'warning');
            }
        }, 2000);
    }
    
    // Initialize components
    initializeAddressDropdowns();
    initializeAverageValidation();
    
    // Form submission
    document.getElementById('admissionForm').addEventListener('submit', submitForm);
    
    // Auto-save on change (also updates timestamp)
    document.getElementById('admissionForm').addEventListener('change', () => {
        clearTimeout(STATE.autoSaveTimer);
        STATE.autoSaveTimer = setTimeout(() => {
            collectFormData();
            updateFieldProgress(STATE.currentStep); // Track progress
            showToast('Form saved automatically', 'info');
        }, CONFIG.AUTO_SAVE_DELAY);
    });
    
    // Date of birth change
    const dobInput = document.querySelector('input[name="dateOfBirth"]');
    if (dobInput) {
        dobInput.addEventListener('change', updateAgeDisplay);
        dobInput.addEventListener('input', updateAgeDisplay);
        
        if (dobInput.value) {
            updateAgeDisplay();
        }
    }
    
    // School level change
    const schoolLevel = document.getElementById('schoolLevel');
    if (schoolLevel) {
        schoolLevel.addEventListener('change', updateGradeLevels);
    }
    
    // Grade level change
    const gradeLevel = document.getElementById('gradeLevel');
    if (gradeLevel) {
        gradeLevel.addEventListener('change', handleGradeLevelChange);
    }
    
    // Photo upload
    const photoInput = document.getElementById('studentPhoto');
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
    }
    
    // Show initial step
    showStep();
});

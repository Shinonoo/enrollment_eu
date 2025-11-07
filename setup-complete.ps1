# ============================================
# ENROLLMENT SYSTEM - PowerShell Setup Script
# ============================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ENROLLMENT SYSTEM SETUP" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Create backend directories
Write-Host "Creating backend structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path backend\config | Out-Null
New-Item -ItemType Directory -Force -Path backend\middleware | Out-Null
New-Item -ItemType Directory -Force -Path backend\controllers | Out-Null
New-Item -ItemType Directory -Force -Path backend\routes | Out-Null
New-Item -ItemType Directory -Force -Path backend\utils | Out-Null

# Create frontend directories
Write-Host "Creating frontend structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path frontend\public\css\pages | Out-Null
New-Item -ItemType Directory -Force -Path frontend\public\js\utils | Out-Null
New-Item -ItemType Directory -Force -Path frontend\public\js\components | Out-Null
New-Item -ItemType Directory -Force -Path frontend\public\js\pages | Out-Null
New-Item -ItemType Directory -Force -Path frontend\public\images | Out-Null
New-Item -ItemType Directory -Force -Path frontend\views\public | Out-Null
New-Item -ItemType Directory -Force -Path frontend\views\registrar | Out-Null
New-Item -ItemType Directory -Force -Path frontend\views\accountant | Out-Null
New-Item -ItemType Directory -Force -Path frontend\views\cashier | Out-Null
New-Item -ItemType Directory -Force -Path frontend\views\admin | Out-Null
New-Item -ItemType Directory -Force -Path frontend\components | Out-Null

# Create database directory
New-Item -ItemType Directory -Force -Path database | Out-Null

# Create backend files
Write-Host "Creating backend files..." -ForegroundColor Yellow
New-Item -ItemType File -Force -Path backend\config\database.js | Out-Null
New-Item -ItemType File -Force -Path backend\config\env.js | Out-Null
New-Item -ItemType File -Force -Path backend\middleware\auth.js | Out-Null
New-Item -ItemType File -Force -Path backend\middleware\roleCheck.js | Out-Null
New-Item -ItemType File -Force -Path backend\middleware\errorHandler.js | Out-Null
New-Item -ItemType File -Force -Path backend\controllers\authController.js | Out-Null
New-Item -ItemType File -Force -Path backend\controllers\admissionController.js | Out-Null
New-Item -ItemType File -Force -Path backend\controllers\studentController.js | Out-Null
New-Item -ItemType File -Force -Path backend\controllers\sectionController.js | Out-Null
New-Item -ItemType File -Force -Path backend\controllers\facultyController.js | Out-Null
New-Item -ItemType File -Force -Path backend\controllers\paymentController.js | Out-Null
New-Item -ItemType File -Force -Path backend\controllers\reportController.js | Out-Null
New-Item -ItemType File -Force -Path backend\routes\auth.js | Out-Null
New-Item -ItemType File -Force -Path backend\routes\admission.js | Out-Null
New-Item -ItemType File -Force -Path backend\routes\students.js | Out-Null
New-Item -ItemType File -Force -Path backend\routes\sections.js | Out-Null
New-Item -ItemType File -Force -Path backend\routes\faculty.js | Out-Null
New-Item -ItemType File -Force -Path backend\routes\payments.js | Out-Null
New-Item -ItemType File -Force -Path backend\routes\reports.js | Out-Null
New-Item -ItemType File -Force -Path backend\utils\pdfGenerator.js | Out-Null
New-Item -ItemType File -Force -Path backend\utils\reportGenerator.js | Out-Null
New-Item -ItemType File -Force -Path backend\utils\studentNumberGenerator.js | Out-Null
New-Item -ItemType File -Force -Path backend\server.js | Out-Null

# Create CSS files
Write-Host "Creating CSS files..." -ForegroundColor Yellow
New-Item -ItemType File -Force -Path frontend\public\css\design-system.css | Out-Null
New-Item -ItemType File -Force -Path frontend\public\css\components.css | Out-Null
New-Item -ItemType File -Force -Path frontend\public\css\pages\login.css | Out-Null
New-Item -ItemType File -Force -Path frontend\public\css\pages\admission.css | Out-Null
New-Item -ItemType File -Force -Path frontend\public\css\pages\dashboard.css | Out-Null
New-Item -ItemType File -Force -Path frontend\public\css\pages\student-profile.css | Out-Null
New-Item -ItemType File -Force -Path frontend\public\css\pages\section-list.css | Out-Null

# Create JS files
Write-Host "Creating JavaScript files..." -ForegroundColor Yellow
New-Item -ItemType File -Force -Path frontend\public\js\utils\api.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\utils\validation.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\utils\notifications.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\utils\helpers.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\components\sidebar.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\components\table.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\components\modal.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\pages\login.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\pages\admission.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\pages\dashboard.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\pages\student-profile.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\pages\admission-management.js | Out-Null
New-Item -ItemType File -Force -Path frontend\public\js\pages\section-list.js | Out-Null

# Create HTML files
Write-Host "Creating HTML files..." -ForegroundColor Yellow
New-Item -ItemType File -Force -Path frontend\views\public\index.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\public\login.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\public\admission.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\registrar\dashboard.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\registrar\admission-management.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\registrar\student-profile.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\registrar\section-list.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\registrar\faculty.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\registrar\completers.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\registrar\transferred-out.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\registrar\graduated.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\registrar\dropped.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\accountant\dashboard.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\accountant\pending-admissions.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\accountant\payment-schemes.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\accountant\registration-forms.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\cashier\dashboard.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\cashier\pending-payments.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\cashier\payment-processing.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\admin\dashboard.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\admin\user-management.html | Out-Null
New-Item -ItemType File -Force -Path frontend\views\admin\system-settings.html | Out-Null
New-Item -ItemType File -Force -Path frontend\components\sidebar.html | Out-Null
New-Item -ItemType File -Force -Path frontend\components\header.html | Out-Null
New-Item -ItemType File -Force -Path frontend\components\modal.html | Out-Null

# Database files
Write-Host "Creating database files..." -ForegroundColor Yellow
New-Item -ItemType File -Force -Path database\seed.sql | Out-Null

# Root files
Write-Host "Creating config files..." -ForegroundColor Yellow
New-Item -ItemType File -Force -Path .env | Out-Null
New-Item -ItemType File -Force -Path .gitignore | Out-Null
New-Item -ItemType File -Force -Path package.json | Out-Null
New-Item -ItemType File -Force -Path README.md | Out-Null

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Import schema.sql to MySQL/phpMyAdmin" -ForegroundColor Cyan
Write-Host "  2. Run: npm install" -ForegroundColor Cyan
Write-Host "  3. Configure .env file" -ForegroundColor Cyan
Write-Host "  4. Run: npm run dev`n" -ForegroundColor Cyan

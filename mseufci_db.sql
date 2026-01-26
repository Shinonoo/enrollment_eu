-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 26, 2026 at 08:35 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mseufci_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action_type` enum('login','logout','create','update','delete','approve','reject','payment','document_verify','status_change','assessment') NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `old_value` text DEFAULT NULL,
  `new_value` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`log_id`, `user_id`, `action_type`, `table_name`, `record_id`, `description`, `old_value`, `new_value`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 3, 'create', 'payment_schemes', 19, 'Created payment scheme: JHS Grade 13 - Full Payment', NULL, '{\"schemeName\":\"JHS Grade 13 - Full Payment\",\"schoolLevel\":\"SHS\",\"gradeLevel\":12,\"totalAmount\":20000}', NULL, NULL, '2026-01-20 05:31:30'),
(2, 3, 'create', 'payment_schemes', 20, 'Created payment scheme: JHS Grade 13 - Full Payment', NULL, '{\"schemeName\":\"JHS Grade 13 - Full Payment\",\"schoolLevel\":\"SHS\",\"gradeLevel\":12,\"totalAmount\":20000}', NULL, NULL, '2026-01-20 05:31:30'),
(3, 3, 'delete', 'payment_schemes', 20, 'Deleted payment scheme: JHS Grade 13 - Full Payment', '{\"scheme_id\":20,\"scheme_name\":\"JHS Grade 13 - Full Payment\",\"school_level\":\"SHS\",\"grade_level\":12,\"school_year_id\":1,\"total_amount\":\"20000.00\",\"upon_enrollment\":\"0.00\",\"installment_count\":1,\"installment_amount\":\"20000.00\",\"cash_discount\":\"500.00\",\"description\":null,\"is_active\":1,\"created_at\":\"2026-01-20T05:31:29.000Z\",\"updated_at\":\"2026-01-20T05:31:29.000Z\"}', NULL, NULL, NULL, '2026-01-20 05:31:49'),
(4, 3, 'delete', 'payment_schemes', 19, 'Deleted payment scheme: JHS Grade 13 - Full Payment', '{\"scheme_id\":19,\"scheme_name\":\"JHS Grade 13 - Full Payment\",\"school_level\":\"SHS\",\"grade_level\":12,\"school_year_id\":1,\"total_amount\":\"20000.00\",\"upon_enrollment\":\"0.00\",\"installment_count\":1,\"installment_amount\":\"20000.00\",\"cash_discount\":\"500.00\",\"description\":null,\"is_active\":1,\"created_at\":\"2026-01-20T05:31:29.000Z\",\"updated_at\":\"2026-01-20T05:31:29.000Z\"}', NULL, NULL, NULL, '2026-01-20 05:31:57');

-- --------------------------------------------------------

--
-- Table structure for table `admissions`
--

CREATE TABLE `admissions` (
  `admission_id` int(11) NOT NULL,
  `application_number` varchar(20) NOT NULL,
  `school_year_id` int(11) NOT NULL,
  `application_type` enum('new','transferee','returning') NOT NULL,
  `current_status` enum('submitted','pending_verification','documents_verified','sent_to_accounting','payment_assessed','ready_for_payment','partial_payment','payment_completed','approved','enrolled','rejected') DEFAULT 'submitted',
  `grade_level_id` int(11) NOT NULL,
  `strand_id` int(11) DEFAULT NULL,
  `payment_scheme` enum('full_payment','15_percent_down','10_percent_down','custom_arrangement') DEFAULT '15_percent_down',
  `school_level` enum('JHS','SHS') NOT NULL,
  `preferred_payment_scheme` enum('full','installment_2','installment_3','installment_4','custom') DEFAULT NULL,
  `approved_payment_scheme` enum('full','installment_2','installment_3','installment_4','custom') DEFAULT NULL,
  `custom_downpayment_percentage` decimal(5,2) DEFAULT NULL,
  `total_assessed` decimal(10,2) DEFAULT 0.00,
  `total_paid` decimal(10,2) DEFAULT 0.00,
  `remaining_balance` decimal(10,2) DEFAULT 0.00,
  `rejection_reason` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `verified_at` timestamp NULL DEFAULT NULL,
  `sent_to_accounting_at` timestamp NULL DEFAULT NULL,
  `assessed_at` timestamp NULL DEFAULT NULL,
  `payment_completed_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `enrolled_at` timestamp NULL DEFAULT NULL,
  `rejected_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admissions`
--

INSERT INTO `admissions` (`admission_id`, `application_number`, `school_year_id`, `application_type`, `current_status`, `grade_level_id`, `strand_id`, `payment_scheme`, `school_level`, `preferred_payment_scheme`, `approved_payment_scheme`, `custom_downpayment_percentage`, `total_assessed`, `total_paid`, `remaining_balance`, `rejection_reason`, `submitted_at`, `verified_at`, `sent_to_accounting_at`, `assessed_at`, `payment_completed_at`, `approved_at`, `enrolled_at`, `rejected_at`) VALUES
(3, 'MSEUFCI-2026-5762', 1, 'new', 'submitted', 2, NULL, '', 'JHS', NULL, NULL, NULL, 0.00, 0.00, 0.00, NULL, '2026-01-12 14:25:50', NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `admission_documents`
--

CREATE TABLE `admission_documents` (
  `document_id` int(11) NOT NULL,
  `admission_id` int(11) NOT NULL,
  `document_type` enum('birth_certificate','report_card_form138','form137','good_moral','transfer_credentials','medical_certificate','student_photo','other') NOT NULL,
  `document_name` varchar(200) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_physical` tinyint(1) DEFAULT 0,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admission_workflow`
--

CREATE TABLE `admission_workflow` (
  `workflow_id` int(11) NOT NULL,
  `admission_id` int(11) NOT NULL,
  `from_status` enum('submitted','pending_verification','documents_verified','sent_to_accounting','payment_assessed','ready_for_payment','partial_payment','payment_completed','approved','enrolled','rejected') DEFAULT NULL,
  `to_status` enum('submitted','pending_verification','documents_verified','sent_to_accounting','payment_assessed','ready_for_payment','partial_payment','payment_completed','approved','enrolled','rejected') NOT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admission_workflow`
--

INSERT INTO `admission_workflow` (`workflow_id`, `admission_id`, `from_status`, `to_status`, `changed_by`, `remarks`, `changed_at`) VALUES
(2, 3, NULL, 'submitted', NULL, 'Online application submitted', '2026-01-12 14:25:50');

-- --------------------------------------------------------

--
-- Table structure for table `applicants_academic`
--

CREATE TABLE `applicants_academic` (
  `academic_id` int(11) NOT NULL,
  `admission_id` int(11) NOT NULL,
  `lrn` varchar(12) NOT NULL,
  `previous_school_name` varchar(200) NOT NULL,
  `last_grade_completed` varchar(50) NOT NULL,
  `year_completed` varchar(20) NOT NULL,
  `general_average` decimal(5,2) NOT NULL,
  `referral_source` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applicants_academic`
--

INSERT INTO `applicants_academic` (`academic_id`, `admission_id`, `lrn`, `previous_school_name`, `last_grade_completed`, `year_completed`, `general_average`, `referral_source`) VALUES
(3, 3, '111111111111', 'asd', 'Grade 7', '2024-2025', 90.00, 'Alumni');

-- --------------------------------------------------------

--
-- Table structure for table `applicants_address`
--

CREATE TABLE `applicants_address` (
  `address_id` int(11) NOT NULL,
  `admission_id` int(11) NOT NULL,
  `street_address` varchar(200) NOT NULL,
  `barangay` varchar(100) NOT NULL,
  `city_municipality` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `zip_code` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applicants_address`
--

INSERT INTO `applicants_address` (`address_id`, `admission_id`, `street_address`, `barangay`, `city_municipality`, `province`, `zip_code`) VALUES
(3, 3, '123', 'Adia Bitaog', 'Gumaca', 'Quezon Province', '123');

-- --------------------------------------------------------

--
-- Table structure for table `applicants_guardians`
--

CREATE TABLE `applicants_guardians` (
  `guardian_id` int(11) NOT NULL,
  `admission_id` int(11) NOT NULL,
  `guardian_name` varchar(150) NOT NULL,
  `guardian_relationship` enum('Mother','Father','Legal Guardian','Grandmother','Grandfather','Aunt','Uncle','Other') NOT NULL,
  `guardian_phone` varchar(20) NOT NULL,
  `guardian_email` varchar(100) DEFAULT NULL,
  `guardian_address` text DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applicants_guardians`
--

INSERT INTO `applicants_guardians` (`guardian_id`, `admission_id`, `guardian_name`, `guardian_relationship`, `guardian_phone`, `guardian_email`, `guardian_address`, `is_primary`) VALUES
(3, 3, 'asd', 'Mother', '09121212121', 'a@a', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `applicants_personal_info`
--

CREATE TABLE `applicants_personal_info` (
  `personal_info_id` int(11) NOT NULL,
  `admission_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('Male','Female','Prefer not to say') NOT NULL,
  `place_of_birth` varchar(100) NOT NULL,
  `nationality` varchar(50) DEFAULT 'Filipino',
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `photo_filename` varchar(255) DEFAULT NULL,
  `photo_path` varchar(500) DEFAULT NULL,
  `photo_uploaded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `applicants_personal_info`
--

INSERT INTO `applicants_personal_info` (`personal_info_id`, `admission_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `date_of_birth`, `age`, `gender`, `place_of_birth`, `nationality`, `email`, `phone_number`, `photo_filename`, `photo_path`, `photo_uploaded_at`) VALUES
(3, 3, 'asd', 'asd', 'asd', 'asd', '2015-12-31', 10, 'Male', 'asd', 'Filipino', 'a@a', '0919898231', 'student-1768227950115-96092676.jpg', '/uploads/student_photos/student-1768227950115-96092676.jpg', '2026-01-12 14:25:50');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_items`
--

CREATE TABLE `assessment_items` (
  `assessment_item_id` int(11) NOT NULL,
  `assessment_id` int(11) NOT NULL,
  `fee_structure_id` int(11) NOT NULL,
  `item_description` varchar(200) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_structures`
--

CREATE TABLE `fee_structures` (
  `fee_structure_id` int(11) NOT NULL,
  `school_year_id` int(11) NOT NULL,
  `grade_level_id` int(11) NOT NULL,
  `fee_type` enum('tuition','miscellaneous','laboratory','registration','library','id_card','insurance','other') NOT NULL,
  `fee_name` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `is_required` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fee_structures`
--

INSERT INTO `fee_structures` (`fee_structure_id`, `school_year_id`, `grade_level_id`, `fee_type`, `fee_name`, `amount`, `is_required`) VALUES
(1, 1, 1, 'tuition', 'Tuition Fee', 25000.00, 1),
(2, 1, 1, 'miscellaneous', 'Miscellaneous Fee', 3000.00, 1),
(3, 1, 1, 'registration', 'Registration Fee', 500.00, 1),
(4, 1, 1, 'library', 'Library Fee', 300.00, 1),
(5, 1, 1, 'id_card', 'ID Card', 150.00, 1),
(6, 1, 1, 'insurance', 'Student Insurance', 200.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `grade_levels`
--

CREATE TABLE `grade_levels` (
  `grade_level_id` int(11) NOT NULL,
  `grade_name` varchar(50) NOT NULL,
  `grade_number` int(11) NOT NULL,
  `school_level` enum('JHS','SHS') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grade_levels`
--

INSERT INTO `grade_levels` (`grade_level_id`, `grade_name`, `grade_number`, `school_level`, `is_active`) VALUES
(1, 'Grade 7', 7, 'JHS', 1),
(2, 'Grade 8', 8, 'JHS', 1),
(3, 'Grade 9', 9, 'JHS', 1),
(4, 'Grade 10', 10, 'JHS', 1),
(5, 'Grade 11', 11, 'SHS', 1),
(6, 'Grade 12', 12, 'SHS', 1);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `admission_id` int(11) NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `or_number` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','check','bank_transfer','gcash','paymaya','online') NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `check_number` varchar(50) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `payment_type` enum('downpayment','installment','full_payment','partial') NOT NULL,
  `received_by` int(11) NOT NULL,
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `payments`
--
DELIMITER $$
CREATE TRIGGER `trg_update_admission_balance_after_payment` AFTER INSERT ON `payments` FOR EACH ROW BEGIN
    UPDATE admissions
    SET total_paid = (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE admission_id = NEW.admission_id
    ),
    remaining_balance = total_assessed - (
        SELECT COALESCE(SUM(amount), 0)
        FROM payments
        WHERE admission_id = NEW.admission_id
    )
    WHERE admission_id = NEW.admission_id;

    -- Update payment schedule if linked
    IF NEW.schedule_id IS NOT NULL THEN
        UPDATE payment_schedules
        SET amount_paid = amount_paid + NEW.amount,
            is_paid = (amount_paid + NEW.amount >= amount_due),
            paid_at = IF(amount_paid + NEW.amount >= amount_due, NEW.payment_date, NULL)
        WHERE schedule_id = NEW.schedule_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `payment_assessments`
--

CREATE TABLE `payment_assessments` (
  `assessment_id` int(11) NOT NULL,
  `admission_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `discount_reason` varchar(200) DEFAULT NULL,
  `net_amount` decimal(10,2) NOT NULL,
  `approved_payment_scheme` enum('full','installment_2','installment_3','installment_4','custom') NOT NULL,
  `custom_downpayment_percentage` decimal(5,2) DEFAULT NULL,
  `downpayment_amount` decimal(10,2) NOT NULL,
  `number_of_installments` int(11) DEFAULT 1,
  `assessed_by` int(11) NOT NULL,
  `assessed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_schedules`
--

CREATE TABLE `payment_schedules` (
  `schedule_id` int(11) NOT NULL,
  `assessment_id` int(11) NOT NULL,
  `installment_number` int(11) NOT NULL,
  `installment_label` varchar(50) DEFAULT NULL,
  `due_date` date NOT NULL,
  `amount_due` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT 0.00,
  `is_paid` tinyint(1) DEFAULT 0,
  `paid_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_schemes`
--

CREATE TABLE `payment_schemes` (
  `scheme_id` int(11) NOT NULL,
  `scheme_name` varchar(100) NOT NULL,
  `school_level` enum('JHS','SHS') NOT NULL,
  `grade_level` int(11) NOT NULL,
  `school_year_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `upon_enrollment` decimal(10,2) NOT NULL DEFAULT 0.00,
  `installment_count` int(11) DEFAULT 1,
  `installment_amount` decimal(10,2) DEFAULT 0.00,
  `cash_discount` decimal(10,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_schemes`
--

INSERT INTO `payment_schemes` (`scheme_id`, `scheme_name`, `school_level`, `grade_level`, `school_year_id`, `total_amount`, `upon_enrollment`, `installment_count`, `installment_amount`, `cash_discount`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'JHS Grade 7 - Cash Payment', 'JHS', 7, 1, 15000.00, 0.00, 1, 15000.00, 500.00, 'Full cash payment with 500 PHP discount', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(2, 'JHS Grade 7 - 25% Down + 9 Months', 'JHS', 7, 1, 15000.00, 3750.00, 9, 1250.00, 0.00, 'Pay 25% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(3, 'JHS Grade 7 - 15% Down + 9 Months', 'JHS', 7, 1, 15000.00, 2250.00, 9, 1416.67, 0.00, 'Pay 15% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(4, 'JHS Grade 8 - Cash Payment', 'JHS', 8, 1, 15500.00, 0.00, 1, 15500.00, 500.00, 'Full cash payment with 500 PHP discount', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(5, 'JHS Grade 8 - 25% Down + 9 Months', 'JHS', 8, 1, 15500.00, 3875.00, 9, 1291.67, 0.00, 'Pay 25% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(6, 'JHS Grade 8 - 15% Down + 9 Months', 'JHS', 8, 1, 15500.00, 2325.00, 9, 1463.89, 0.00, 'Pay 15% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(7, 'JHS Grade 9 - Cash Payment', 'JHS', 9, 1, 16000.00, 0.00, 1, 16000.00, 750.00, 'Full cash payment with 750 PHP discount', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(8, 'JHS Grade 9 - 25% Down + 9 Months', 'JHS', 9, 1, 16000.00, 4000.00, 9, 1333.33, 0.00, 'Pay 25% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(9, 'JHS Grade 9 - 15% Down + 9 Months', 'JHS', 9, 1, 16000.00, 2400.00, 9, 1511.11, 0.00, 'Pay 15% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(10, 'JHS Grade 10 - Cash Payment', 'JHS', 10, 1, 16500.00, 0.00, 1, 16500.00, 750.00, 'Full cash payment with 750 PHP discount', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(11, 'JHS Grade 10 - 25% Down + 9 Months', 'JHS', 10, 1, 16500.00, 4125.00, 9, 1375.00, 0.00, 'Pay 25% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(12, 'JHS Grade 10 - 15% Down + 9 Months', 'JHS', 10, 1, 16500.00, 2475.00, 9, 1558.33, 0.00, 'Pay 15% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:35', '2026-01-14 10:00:35'),
(13, 'SHS Grade 11 - Cash Payment', 'SHS', 11, 1, 20000.00, 0.00, 1, 20000.00, 1000.00, 'Full cash payment with 1000 PHP discount', 1, '2026-01-14 10:00:36', '2026-01-14 10:00:36'),
(14, 'SHS Grade 11 - 25% Down + 9 Months', 'SHS', 11, 1, 20000.00, 5000.00, 9, 1666.67, 0.00, 'Pay 25% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:36', '2026-01-14 10:00:36'),
(15, 'SHS Grade 11 - 15% Down + 9 Months', 'SHS', 11, 1, 20000.00, 3000.00, 9, 1888.89, 0.00, 'Pay 15% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:36', '2026-01-14 10:00:36'),
(16, 'SHS Grade 12 - Cash Payment', 'SHS', 12, 1, 20500.00, 0.00, 1, 20500.00, 1000.00, 'Full cash payment with 1000 PHP discount', 1, '2026-01-14 10:00:36', '2026-01-14 10:00:36'),
(17, 'SHS Grade 12 - 25% Down + 9 Months', 'SHS', 12, 1, 20500.00, 5125.00, 9, 1708.33, 0.00, 'Pay 25% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:36', '2026-01-14 10:00:36'),
(18, 'SHS Grade 12 - 15% Down + 9 Months', 'SHS', 12, 1, 20500.00, 3075.00, 9, 1936.11, 0.00, 'Pay 15% down, balance in 9 monthly installments', 1, '2026-01-14 10:00:36', '2026-01-14 10:00:36'),
(19, 'JHS Grade 13 - Full Payment', 'SHS', 12, 1, 20000.00, 0.00, 1, 20000.00, 500.00, NULL, 0, '2026-01-20 05:31:29', '2026-01-20 05:31:57'),
(20, 'JHS Grade 13 - Full Payment', 'SHS', 12, 1, 20000.00, 0.00, 1, 20000.00, 500.00, NULL, 0, '2026-01-20 05:31:29', '2026-01-20 05:31:49');

-- --------------------------------------------------------

--
-- Table structure for table `reenrollment_applications`
--

CREATE TABLE `reenrollment_applications` (
  `reenrollment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `school_year_id` int(11) NOT NULL,
  `previous_grade_level_id` int(11) NOT NULL,
  `new_grade_level_id` int(11) NOT NULL,
  `new_strand_id` int(11) DEFAULT NULL,
  `current_status` enum('submitted','pending_assessment','payment_assessed','payment_completed','approved','rejected') DEFAULT 'submitted',
  `total_assessed` decimal(10,2) DEFAULT 0.00,
  `total_paid` decimal(10,2) DEFAULT 0.00,
  `remaining_balance` decimal(10,2) DEFAULT 0.00,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `school_years`
--

CREATE TABLE `school_years` (
  `school_year_id` int(11) NOT NULL,
  `year_start` int(11) NOT NULL,
  `year_end` int(11) NOT NULL,
  `year_label` varchar(20) NOT NULL,
  `is_current` tinyint(1) DEFAULT 0,
  `enrollment_start_date` date DEFAULT NULL,
  `enrollment_end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `school_years`
--

INSERT INTO `school_years` (`school_year_id`, `year_start`, `year_end`, `year_label`, `is_current`, `enrollment_start_date`, `enrollment_end_date`, `created_at`) VALUES
(1, 2025, 2026, '2025-2026', 1, '2025-05-01', '2025-06-30', '2026-01-12 11:32:40');

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `section_id` int(11) NOT NULL,
  `section_name` varchar(50) NOT NULL,
  `grade_level_id` int(11) NOT NULL,
  `strand_id` int(11) DEFAULT NULL,
  `school_year_id` int(11) NOT NULL,
  `capacity` int(11) DEFAULT 40,
  `current_count` int(11) DEFAULT 0,
  `adviser_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `strands`
--

CREATE TABLE `strands` (
  `strand_id` int(11) NOT NULL,
  `strand_code` varchar(10) NOT NULL,
  `strand_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `strands`
--

INSERT INTO `strands` (`strand_id`, `strand_code`, `strand_name`, `description`, `is_active`) VALUES
(1, 'STEM', 'Science, Technology, Engineering, and Mathematics', 'For students interested in engineering, medicine, and technology', 1),
(2, 'HUMSS', 'Humanities and Social Sciences', 'For students interested in law, education, and social services', 1),
(3, 'ABM', 'Accountancy, Business, and Management', 'For students pursuing business, accounting, and entrepreneurship', 1),
(4, 'TVL', 'Technical-Vocational-Livelihood', 'For students interested in technical skills and entrepreneurship', 1),
(5, 'GAS', 'General Academic Strand', 'For students who are still undecided on their career path', 1);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `student_number` varchar(20) NOT NULL,
  `admission_id` int(11) NOT NULL,
  `lrn` varchar(12) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('Male','Female','Prefer not to say') NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `current_status` enum('active','graduated','dropped','transferred','suspended') DEFAULT 'active',
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status_changed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_enrollment_history`
--

CREATE TABLE `student_enrollment_history` (
  `enrollment_history_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `school_year_id` int(11) NOT NULL,
  `grade_level_id` int(11) NOT NULL,
  `strand_id` int(11) DEFAULT NULL,
  `section_id` int(11) DEFAULT NULL,
  `enrollment_status` enum('enrolled','completed','dropped','transferred') DEFAULT 'enrolled',
  `enrollment_date` date NOT NULL,
  `completion_date` date DEFAULT NULL,
  `final_average` decimal(5,2) DEFAULT NULL,
  `is_reenrolled` tinyint(1) DEFAULT 0,
  `reenrollment_date` date DEFAULT NULL,
  `remarks` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_sections`
--

CREATE TABLE `student_sections` (
  `student_section_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `school_year_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `student_sections`
--
DELIMITER $$
CREATE TRIGGER `trg_decrement_section_count` AFTER DELETE ON `student_sections` FOR EACH ROW BEGIN
    UPDATE sections
    SET current_count = current_count - 1
    WHERE section_id = OLD.section_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_increment_section_count` AFTER INSERT ON `student_sections` FOR EACH ROW BEGIN
    UPDATE sections
    SET current_count = current_count + 1
    WHERE section_id = NEW.section_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `student_subjects`
--

CREATE TABLE `student_subjects` (
  `student_subject_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `school_year_id` int(11) NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subject_id` int(11) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `grade_level_id` int(11) NOT NULL,
  `strand_id` int(11) DEFAULT NULL,
  `units` int(11) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_at`, `updated_by`) VALUES
(1, 'school_name', 'Tayabas Western Academy', 'string', 'Official school name', '2026-01-12 11:32:40', NULL),
(2, 'school_address', 'Tayabas City, Quezon Province', 'string', 'School address', '2026-01-12 11:32:40', NULL),
(3, 'school_contact', '+63-XXX-XXX-XXXX', 'string', 'School contact number', '2026-01-12 11:32:40', NULL),
(4, 'school_email', 'info@twa.edu.ph', 'string', 'School email address', '2026-01-12 11:32:40', NULL),
(5, 'application_prefix', 'TWA', 'string', 'Prefix for application numbers', '2026-01-12 11:32:40', NULL),
(6, 'student_number_prefix', 'TWA', 'string', 'Prefix for student numbers', '2026-01-12 11:32:40', NULL),
(7, 'max_section_capacity', '40', 'number', 'Maximum students per section', '2026-01-12 11:32:40', NULL),
(8, 'enable_online_payment', 'false', 'boolean', 'Enable online payment option', '2026-01-12 11:32:40', NULL),
(9, 'require_downpayment', 'true', 'boolean', 'Require downpayment before enrollment', '2026-01-12 11:32:40', NULL),
(10, 'photo_upload_max_size_mb', '2', 'number', 'Maximum photo upload size in MB', '2026-01-12 11:32:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','registrar','accounting_clerk','cashier') NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `role`, `first_name`, `last_name`, `is_active`, `created_at`, `updated_at`, `last_login`) VALUES
(1, 'admin', 'admin@mseufci.edu.ph', '$2b$10$ofVeUsOsMsIGqrzJ.tyfKOe8DxJGRlA2I.ueBF8PNw5LZkoO3lpPq', 'admin', 'System', 'Administrator', 1, '2026-01-13 03:32:40', '2026-01-25 04:59:46', '2026-01-25 04:59:46'),
(2, 'registrar', 'registrar@mseufci.edu.ph', '$2b$10$ofVeUsOsMsIGqrzJ.tyfKOe8DxJGRlA2I.ueBF8PNw5LZkoO3lpPq', 'registrar', 'Registration', 'Office', 1, '2026-01-13 03:32:40', '2026-01-13 14:14:04', NULL),
(3, 'accounting', 'accounting@mseufci.edu.ph', '$2b$10$ofVeUsOsMsIGqrzJ.tyfKOe8DxJGRlA2I.ueBF8PNw5LZkoO3lpPq', 'accounting_clerk', 'Accounting', 'Department', 1, '2026-01-13 03:32:40', '2026-01-23 06:39:18', '2026-01-23 06:39:18'),
(4, 'cashier', 'cashier@mseufci.edu.ph', '$2b$10$ofVeUsOsMsIGqrzJ.tyfKOe8DxJGRlA2I.ueBF8PNw5LZkoO3lpPq', 'cashier', 'Cashier', 'Office', 1, '2026-01-13 03:32:40', '2026-01-13 14:14:04', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action_type`),
  ADD KEY `idx_timestamp` (`created_at`),
  ADD KEY `idx_table_record` (`table_name`,`record_id`);

--
-- Indexes for table `admissions`
--
ALTER TABLE `admissions`
  ADD PRIMARY KEY (`admission_id`),
  ADD UNIQUE KEY `application_number` (`application_number`),
  ADD KEY `grade_level_id` (`grade_level_id`),
  ADD KEY `strand_id` (`strand_id`),
  ADD KEY `idx_status` (`current_status`),
  ADD KEY `idx_school_year` (`school_year_id`),
  ADD KEY `idx_application_number` (`application_number`),
  ADD KEY `idx_application_type` (`application_type`),
  ADD KEY `idx_balance` (`remaining_balance`);

--
-- Indexes for table `admission_documents`
--
ALTER TABLE `admission_documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `verified_by` (`verified_by`),
  ADD KEY `idx_admission` (`admission_id`),
  ADD KEY `idx_verification` (`is_verified`,`admission_id`);

--
-- Indexes for table `admission_workflow`
--
ALTER TABLE `admission_workflow`
  ADD PRIMARY KEY (`workflow_id`),
  ADD KEY `changed_by` (`changed_by`),
  ADD KEY `idx_admission` (`admission_id`),
  ADD KEY `idx_status_timeline` (`admission_id`,`changed_at`);

--
-- Indexes for table `applicants_academic`
--
ALTER TABLE `applicants_academic`
  ADD PRIMARY KEY (`academic_id`),
  ADD UNIQUE KEY `admission_id` (`admission_id`),
  ADD UNIQUE KEY `lrn` (`lrn`),
  ADD KEY `idx_lrn` (`lrn`);

--
-- Indexes for table `applicants_address`
--
ALTER TABLE `applicants_address`
  ADD PRIMARY KEY (`address_id`),
  ADD UNIQUE KEY `admission_id` (`admission_id`);

--
-- Indexes for table `applicants_guardians`
--
ALTER TABLE `applicants_guardians`
  ADD PRIMARY KEY (`guardian_id`),
  ADD KEY `idx_admission` (`admission_id`);

--
-- Indexes for table `applicants_personal_info`
--
ALTER TABLE `applicants_personal_info`
  ADD PRIMARY KEY (`personal_info_id`),
  ADD UNIQUE KEY `admission_id` (`admission_id`),
  ADD KEY `idx_name` (`last_name`,`first_name`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `assessment_items`
--
ALTER TABLE `assessment_items`
  ADD PRIMARY KEY (`assessment_item_id`),
  ADD KEY `fee_structure_id` (`fee_structure_id`),
  ADD KEY `idx_assessment` (`assessment_id`);

--
-- Indexes for table `fee_structures`
--
ALTER TABLE `fee_structures`
  ADD PRIMARY KEY (`fee_structure_id`),
  ADD KEY `grade_level_id` (`grade_level_id`),
  ADD KEY `idx_school_grade` (`school_year_id`,`grade_level_id`);

--
-- Indexes for table `grade_levels`
--
ALTER TABLE `grade_levels`
  ADD PRIMARY KEY (`grade_level_id`),
  ADD UNIQUE KEY `unique_grade` (`grade_name`),
  ADD KEY `idx_school_level` (`school_level`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `or_number` (`or_number`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `received_by` (`received_by`),
  ADD KEY `idx_admission` (`admission_id`),
  ADD KEY `idx_or_number` (`or_number`),
  ADD KEY `idx_payment_date` (`payment_date`);

--
-- Indexes for table `payment_assessments`
--
ALTER TABLE `payment_assessments`
  ADD PRIMARY KEY (`assessment_id`),
  ADD UNIQUE KEY `admission_id` (`admission_id`),
  ADD KEY `assessed_by` (`assessed_by`),
  ADD KEY `idx_admission` (`admission_id`);

--
-- Indexes for table `payment_schedules`
--
ALTER TABLE `payment_schedules`
  ADD PRIMARY KEY (`schedule_id`),
  ADD UNIQUE KEY `unique_assessment_installment` (`assessment_id`,`installment_number`),
  ADD KEY `idx_assessment` (`assessment_id`),
  ADD KEY `idx_due_date` (`due_date`,`is_paid`);

--
-- Indexes for table `payment_schemes`
--
ALTER TABLE `payment_schemes`
  ADD PRIMARY KEY (`scheme_id`),
  ADD KEY `idx_school_level` (`school_level`),
  ADD KEY `idx_grade_level` (`grade_level`),
  ADD KEY `fk_school_year` (`school_year_id`);

--
-- Indexes for table `reenrollment_applications`
--
ALTER TABLE `reenrollment_applications`
  ADD PRIMARY KEY (`reenrollment_id`),
  ADD KEY `previous_grade_level_id` (`previous_grade_level_id`),
  ADD KEY `new_grade_level_id` (`new_grade_level_id`),
  ADD KEY `new_strand_id` (`new_strand_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_school_year` (`school_year_id`),
  ADD KEY `idx_status` (`current_status`);

--
-- Indexes for table `school_years`
--
ALTER TABLE `school_years`
  ADD PRIMARY KEY (`school_year_id`),
  ADD UNIQUE KEY `unique_year` (`year_start`,`year_end`),
  ADD KEY `idx_current` (`is_current`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`section_id`),
  ADD KEY `strand_id` (`strand_id`),
  ADD KEY `school_year_id` (`school_year_id`),
  ADD KEY `adviser_id` (`adviser_id`),
  ADD KEY `idx_grade_year` (`grade_level_id`,`school_year_id`);

--
-- Indexes for table `strands`
--
ALTER TABLE `strands`
  ADD PRIMARY KEY (`strand_id`),
  ADD UNIQUE KEY `strand_code` (`strand_code`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `student_number` (`student_number`),
  ADD UNIQUE KEY `admission_id` (`admission_id`),
  ADD UNIQUE KEY `lrn` (`lrn`),
  ADD KEY `idx_student_number` (`student_number`),
  ADD KEY `idx_lrn` (`lrn`),
  ADD KEY `idx_status` (`current_status`),
  ADD KEY `idx_name` (`last_name`,`first_name`);

--
-- Indexes for table `student_enrollment_history`
--
ALTER TABLE `student_enrollment_history`
  ADD PRIMARY KEY (`enrollment_history_id`),
  ADD UNIQUE KEY `unique_student_year` (`student_id`,`school_year_id`),
  ADD KEY `grade_level_id` (`grade_level_id`),
  ADD KEY `strand_id` (`strand_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `idx_school_year` (`school_year_id`),
  ADD KEY `idx_status` (`enrollment_status`),
  ADD KEY `idx_reenrollment` (`is_reenrolled`);

--
-- Indexes for table `student_sections`
--
ALTER TABLE `student_sections`
  ADD PRIMARY KEY (`student_section_id`),
  ADD UNIQUE KEY `unique_student_section_year` (`student_id`,`school_year_id`),
  ADD KEY `school_year_id` (`school_year_id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_section` (`section_id`);

--
-- Indexes for table `student_subjects`
--
ALTER TABLE `student_subjects`
  ADD PRIMARY KEY (`student_subject_id`),
  ADD UNIQUE KEY `unique_student_subject_year` (`student_id`,`subject_id`,`school_year_id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `school_year_id` (`school_year_id`),
  ADD KEY `idx_student_year` (`student_id`,`school_year_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subject_id`),
  ADD UNIQUE KEY `subject_code` (`subject_code`),
  ADD KEY `strand_id` (`strand_id`),
  ADD KEY `idx_grade_strand` (`grade_level_id`,`strand_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_key` (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD KEY `idx_token` (`token_hash`),
  ADD KEY `idx_user_expires` (`user_id`,`expires_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `admissions`
--
ALTER TABLE `admissions`
  MODIFY `admission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `admission_documents`
--
ALTER TABLE `admission_documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admission_workflow`
--
ALTER TABLE `admission_workflow`
  MODIFY `workflow_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `applicants_academic`
--
ALTER TABLE `applicants_academic`
  MODIFY `academic_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `applicants_address`
--
ALTER TABLE `applicants_address`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `applicants_guardians`
--
ALTER TABLE `applicants_guardians`
  MODIFY `guardian_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `applicants_personal_info`
--
ALTER TABLE `applicants_personal_info`
  MODIFY `personal_info_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `assessment_items`
--
ALTER TABLE `assessment_items`
  MODIFY `assessment_item_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_structures`
--
ALTER TABLE `fee_structures`
  MODIFY `fee_structure_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `grade_levels`
--
ALTER TABLE `grade_levels`
  MODIFY `grade_level_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_assessments`
--
ALTER TABLE `payment_assessments`
  MODIFY `assessment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_schedules`
--
ALTER TABLE `payment_schedules`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_schemes`
--
ALTER TABLE `payment_schemes`
  MODIFY `scheme_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `reenrollment_applications`
--
ALTER TABLE `reenrollment_applications`
  MODIFY `reenrollment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `school_years`
--
ALTER TABLE `school_years`
  MODIFY `school_year_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `strands`
--
ALTER TABLE `strands`
  MODIFY `strand_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_enrollment_history`
--
ALTER TABLE `student_enrollment_history`
  MODIFY `enrollment_history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_sections`
--
ALTER TABLE `student_sections`
  MODIFY `student_section_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_subjects`
--
ALTER TABLE `student_subjects`
  MODIFY `student_subject_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `admissions`
--
ALTER TABLE `admissions`
  ADD CONSTRAINT `admissions_ibfk_1` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`),
  ADD CONSTRAINT `admissions_ibfk_2` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`grade_level_id`),
  ADD CONSTRAINT `admissions_ibfk_3` FOREIGN KEY (`strand_id`) REFERENCES `strands` (`strand_id`);

--
-- Constraints for table `admission_documents`
--
ALTER TABLE `admission_documents`
  ADD CONSTRAINT `admission_documents_ibfk_1` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`admission_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admission_documents_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `admission_workflow`
--
ALTER TABLE `admission_workflow`
  ADD CONSTRAINT `admission_workflow_ibfk_1` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`admission_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `admission_workflow_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `applicants_academic`
--
ALTER TABLE `applicants_academic`
  ADD CONSTRAINT `applicants_academic_ibfk_1` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`admission_id`) ON DELETE CASCADE;

--
-- Constraints for table `applicants_address`
--
ALTER TABLE `applicants_address`
  ADD CONSTRAINT `applicants_address_ibfk_1` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`admission_id`) ON DELETE CASCADE;

--
-- Constraints for table `applicants_guardians`
--
ALTER TABLE `applicants_guardians`
  ADD CONSTRAINT `applicants_guardians_ibfk_1` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`admission_id`) ON DELETE CASCADE;

--
-- Constraints for table `applicants_personal_info`
--
ALTER TABLE `applicants_personal_info`
  ADD CONSTRAINT `applicants_personal_info_ibfk_1` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`admission_id`) ON DELETE CASCADE;

--
-- Constraints for table `assessment_items`
--
ALTER TABLE `assessment_items`
  ADD CONSTRAINT `assessment_items_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `payment_assessments` (`assessment_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assessment_items_ibfk_2` FOREIGN KEY (`fee_structure_id`) REFERENCES `fee_structures` (`fee_structure_id`);

--
-- Constraints for table `fee_structures`
--
ALTER TABLE `fee_structures`
  ADD CONSTRAINT `fee_structures_ibfk_1` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`),
  ADD CONSTRAINT `fee_structures_ibfk_2` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`grade_level_id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`admission_id`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `payment_schedules` (`schedule_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `payment_assessments`
--
ALTER TABLE `payment_assessments`
  ADD CONSTRAINT `payment_assessments_ibfk_1` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`admission_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_assessments_ibfk_2` FOREIGN KEY (`assessed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `payment_schedules`
--
ALTER TABLE `payment_schedules`
  ADD CONSTRAINT `payment_schedules_ibfk_1` FOREIGN KEY (`assessment_id`) REFERENCES `payment_assessments` (`assessment_id`) ON DELETE CASCADE;

--
-- Constraints for table `payment_schemes`
--
ALTER TABLE `payment_schemes`
  ADD CONSTRAINT `fk_payment_schemes_school_year` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`) ON DELETE SET NULL;

--
-- Constraints for table `reenrollment_applications`
--
ALTER TABLE `reenrollment_applications`
  ADD CONSTRAINT `reenrollment_applications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reenrollment_applications_ibfk_2` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`),
  ADD CONSTRAINT `reenrollment_applications_ibfk_3` FOREIGN KEY (`previous_grade_level_id`) REFERENCES `grade_levels` (`grade_level_id`),
  ADD CONSTRAINT `reenrollment_applications_ibfk_4` FOREIGN KEY (`new_grade_level_id`) REFERENCES `grade_levels` (`grade_level_id`),
  ADD CONSTRAINT `reenrollment_applications_ibfk_5` FOREIGN KEY (`new_strand_id`) REFERENCES `strands` (`strand_id`);

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`grade_level_id`),
  ADD CONSTRAINT `sections_ibfk_2` FOREIGN KEY (`strand_id`) REFERENCES `strands` (`strand_id`),
  ADD CONSTRAINT `sections_ibfk_3` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`),
  ADD CONSTRAINT `sections_ibfk_4` FOREIGN KEY (`adviser_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`admission_id`) REFERENCES `admissions` (`admission_id`);

--
-- Constraints for table `student_enrollment_history`
--
ALTER TABLE `student_enrollment_history`
  ADD CONSTRAINT `student_enrollment_history_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_enrollment_history_ibfk_2` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`),
  ADD CONSTRAINT `student_enrollment_history_ibfk_3` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`grade_level_id`),
  ADD CONSTRAINT `student_enrollment_history_ibfk_4` FOREIGN KEY (`strand_id`) REFERENCES `strands` (`strand_id`),
  ADD CONSTRAINT `student_enrollment_history_ibfk_5` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`) ON DELETE SET NULL;

--
-- Constraints for table `student_sections`
--
ALTER TABLE `student_sections`
  ADD CONSTRAINT `student_sections_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_sections_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`),
  ADD CONSTRAINT `student_sections_ibfk_3` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`),
  ADD CONSTRAINT `student_sections_ibfk_4` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `student_subjects`
--
ALTER TABLE `student_subjects`
  ADD CONSTRAINT `student_subjects_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`),
  ADD CONSTRAINT `student_subjects_ibfk_3` FOREIGN KEY (`school_year_id`) REFERENCES `school_years` (`school_year_id`);

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`grade_level_id`) REFERENCES `grade_levels` (`grade_level_id`),
  ADD CONSTRAINT `subjects_ibfk_2` FOREIGN KEY (`strand_id`) REFERENCES `strands` (`strand_id`);

--
-- Constraints for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

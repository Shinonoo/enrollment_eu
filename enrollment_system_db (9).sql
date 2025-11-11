-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 11, 2025 at 01:27 AM
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
-- Database: `enrollment_system_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `table_affected` varchar(50) NOT NULL,
  `record_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admission_applications`
--

CREATE TABLE `admission_applications` (
  `application_id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `barangay` varchar(100) DEFAULT NULL,
  `guardian_name` varchar(100) NOT NULL,
  `guardian_relationship` varchar(50) NOT NULL,
  `guardian_phone` varchar(20) NOT NULL,
  `guardian_email` varchar(100) DEFAULT NULL,
  `school_level` enum('JHS','SHS') NOT NULL,
  `grade_level` tinyint(4) NOT NULL,
  `previous_school` varchar(200) DEFAULT NULL,
  `strand` varchar(50) DEFAULT NULL,
  `status` enum('pending','for_review','approved','rejected','enrolled','completed','dropped') DEFAULT 'pending',
  `application_type` enum('new','returning','transferee') NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_by_registrar` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `sent_to_accountant_at` datetime DEFAULT NULL,
  `sent_to_cashier_at` datetime DEFAULT NULL,
  `payment_record_id` int(11) DEFAULT NULL,
  `school_year` varchar(20) DEFAULT '2025-2026',
  `student_number` varchar(20) DEFAULT NULL,
  `registrar_notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `lrn` varchar(12) DEFAULT NULL
) ;

--
-- Dumping data for table `admission_applications`
--

INSERT INTO `admission_applications` (`application_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `date_of_birth`, `gender`, `email`, `phone_number`, `city`, `province`, `zip_code`, `street`, `barangay`, `guardian_name`, `guardian_relationship`, `guardian_phone`, `guardian_email`, `school_level`, `grade_level`, `previous_school`, `strand`, `status`, `application_type`, `submitted_at`, `reviewed_by_registrar`, `reviewed_at`, `sent_to_accountant_at`, `sent_to_cashier_at`, `payment_record_id`, `school_year`, `student_number`, `registrar_notes`, `rejection_reason`, `created_at`, `updated_at`, `lrn`) VALUES
(24, 'Maria', 'Santos', 'Lopez', NULL, '2012-06-15', 'Female', 'maria.santos@gmail.com', '09171234567', 'Manila', 'Metro Manila', '1000', '123 Mabini St', 'Santo Niño', 'Jose Santos', 'Father', '09181234567', 'jose.santos@gmail.com', 'JHS', 7, 'Barangay Santo Niño Elementary', NULL, 'approved', 'new', '2025-11-08 23:46:00', 2, '2025-11-09 07:47:27', '2025-11-09 07:47:27', NULL, NULL, '2025-2026', NULL, NULL, NULL, '2025-11-08 23:46:00', '2025-11-08 23:47:27', '123456789012'),
(25, 'Juan', 'Dela Cruz', 'Reyes', 'Jr.', '2010-11-23', 'Male', 'juan.reyes@hotmail.com', '09201234567', 'Quezon City', 'Metro Manila', '1100', '456 Bonifacio Ave', 'Bagumbayan', 'Ana Reyes', 'Mother', '09211234567', 'ana.reyes@gmail.com', 'JHS', 9, 'Quezon City High School', NULL, 'enrolled', 'transferee', '2025-11-08 23:46:00', 2, '2025-11-09 09:01:59', '2025-11-09 09:01:59', '2025-11-09 09:13:33', 4, '2025-2026', NULL, NULL, NULL, '2025-11-08 23:46:00', '2025-11-09 01:17:51', '987654321098'),
(26, 'Sofia', 'Isabel', 'Garcia', NULL, '2008-03-30', 'Female', 'sofia.garcia@yahoo.com', '09351234568', 'Makati City', 'Metro Manila', '1200', '789 Roxas Blvd', 'Poblacion', 'Roberto Garcia', 'Father', '09361234568', 'roberto.garcia@gmail.com', 'SHS', 11, 'Makati Science High School', 'STEM', 'enrolled', 'new', '2025-11-08 23:46:00', 2, '2025-11-09 09:01:49', '2025-11-09 09:01:50', '2025-11-10 12:11:58', 6, '2025-2026', NULL, NULL, NULL, '2025-11-08 23:46:00', '2025-11-10 07:25:24', '112233445566'),
(27, 'Carlos', 'Miguel', 'Torres', NULL, '2007-09-18', 'Male', 'carlos.torres@gmail.com', '09451234569', 'Pasig City', 'Metro Manila', '1600', '321 Luna St', 'San Antonio', 'Elena Torres', 'Mother', '09461234569', 'elena.torres@gmail.com', 'SHS', 12, 'Pasig Catholic College', 'ABM', 'approved', 'returning', '2025-11-08 23:46:00', 2, '2025-11-09 09:02:03', '2025-11-09 09:02:03', NULL, NULL, '2025-2026', NULL, NULL, NULL, '2025-11-08 23:46:00', '2025-11-09 01:02:03', '556677889900'),
(28, 'Anna', 'Marie', 'Fernandez', NULL, '2009-12-05', 'Female', 'anna.fernandez@hotmail.com', '09551234570', 'Paranaque City', 'Metro Manila', '1700', '147 Quirino Ave', 'Barangay 1', 'Luis Fernandez', 'Father', '09561234570', 'luis.fernandez@gmail.com', 'JHS', 10, 'Paranaque National High School', NULL, 'approved', 'new', '2025-11-08 23:46:00', 2, '2025-11-09 09:01:54', '2025-11-09 09:01:54', '2025-11-10 11:40:39', 5, '2025-2026', NULL, NULL, NULL, '2025-11-08 23:46:00', '2025-11-10 03:40:39', '998877665544'),
(29, 'oreo', NULL, 'abno', NULL, '2025-11-10', 'Male', NULL, NULL, 'st', 'st', NULL, 'st', NULL, 'st', 'st', '12', NULL, 'JHS', 7, NULL, NULL, 'enrolled', 'new', '2025-11-10 04:38:46', 2, '2025-11-10 12:40:37', '2025-11-10 12:40:37', '2025-11-10 12:42:59', 7, '2025-2026', NULL, NULL, NULL, '2025-11-10 04:38:46', '2025-11-10 07:21:51', NULL),
(30, 'pix', 'pix', 'pix', 'pix', '2025-11-10', 'Female', 'pix@gmail.com', '123456', '123', '123', '123', '123', '123', 'pix', 'pix', '123', NULL, 'JHS', 7, 'twa', NULL, 'enrolled', 'new', '2025-11-10 06:54:07', 2, '2025-11-10 14:54:36', '2025-11-10 14:54:36', '2025-11-10 14:55:31', 8, '2025-2026', NULL, NULL, NULL, '2025-11-10 06:54:07', '2025-11-10 07:21:23', NULL),
(31, 'Test', 'Middle', 'Student', NULL, '2010-05-15', 'Male', 'test.student@gmail.com', '09123456789', 'Manila', 'Metro Manila', '1000', '123 Test Street', 'Test Barangay', 'Test Guardian', 'Father', '09987654321', 'guardian@gmail.com', 'JHS', 7, 'Test Elementary School', NULL, 'approved', 'new', '2025-11-10 07:01:48', 2, '2025-11-10 15:01:48', '2025-11-10 15:01:48', '2025-11-10 15:02:43', 9, '2025-2026', NULL, 'Ready for payment assignment', NULL, '2025-11-10 07:01:48', '2025-11-10 07:02:43', '123456789999'),
(32, 'Bea', 'Baticados', 'Baldonado', NULL, '2025-11-19', 'Female', 'Bea@gmail.com', '09132338913', 'Candelaria', 'Quezon', '4323', 'Mahogany St.', 'Pahinga Norte', 'Nicole Baldonado', 'Mother', '09328481234', NULL, 'JHS', 7, NULL, NULL, 'pending', 'returning', '2025-11-10 16:38:07', NULL, NULL, NULL, NULL, NULL, '2025-2026', NULL, NULL, NULL, '2025-11-10 16:38:07', '2025-11-10 16:38:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `completers`
--

CREATE TABLE `completers` (
  `completer_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `completion_year` varchar(20) NOT NULL,
  `completion_date` date NOT NULL,
  `will_continue_shs` tinyint(1) DEFAULT 0,
  `continued_to_shs_at` date DEFAULT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `curricula`
--

CREATE TABLE `curricula` (
  `curriculum_id` int(11) NOT NULL,
  `curriculum_code` varchar(20) NOT NULL,
  `curriculum_name` varchar(100) NOT NULL,
  `school_level` enum('JHS','SHS') NOT NULL,
  `grade_level` enum('7','8','9','10','11','12') NOT NULL,
  `strand` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `curricula`
--

INSERT INTO `curricula` (`curriculum_id`, `curriculum_code`, `curriculum_name`, `school_level`, `grade_level`, `strand`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'ICT', 'ICT Curriculum Grade 11', 'SHS', '11', 'ICT', 'Test', 1, '2025-11-08 05:28:55', '2025-11-08 05:28:55'),
(2, 'G7-24-25', 'Grade 7 2024 - 2025', 'JHS', '7', NULL, '', 1, '2025-11-08 10:41:47', '2025-11-08 10:41:47');

-- --------------------------------------------------------

--
-- Table structure for table `curriculum_subjects`
--

CREATE TABLE `curriculum_subjects` (
  `curriculum_subject_id` int(11) NOT NULL,
  `curriculum_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `semester` enum('1','2','Both') DEFAULT 'Both',
  `is_required` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `curriculum_subjects`
--

INSERT INTO `curriculum_subjects` (`curriculum_subject_id`, `curriculum_id`, `subject_id`, `semester`, `is_required`, `created_at`) VALUES
(1, 2, 5, 'Both', 1, '2025-11-08 10:41:47'),
(2, 2, 9, 'Both', 1, '2025-11-08 10:41:47'),
(3, 2, 8, 'Both', 1, '2025-11-08 10:41:47'),
(4, 2, 2, 'Both', 1, '2025-11-08 10:41:47'),
(5, 2, 1, 'Both', 1, '2025-11-08 10:41:47'),
(6, 2, 3, 'Both', 1, '2025-11-08 10:41:47'),
(7, 2, 7, 'Both', 1, '2025-11-08 10:41:47'),
(8, 2, 4, 'Both', 1, '2025-11-08 10:41:47'),
(9, 2, 6, 'Both', 1, '2025-11-08 10:41:47');

-- --------------------------------------------------------

--
-- Table structure for table `dropped_students`
--

CREATE TABLE `dropped_students` (
  `drop_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `drop_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `processed_by` int(11) NOT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enrollment_reports`
--

CREATE TABLE `enrollment_reports` (
  `report_id` int(11) NOT NULL,
  `report_type` enum('daily','monthly','yearly') NOT NULL,
  `report_date` date NOT NULL,
  `school_year` varchar(20) NOT NULL,
  `total_enrollments` int(11) DEFAULT 0,
  `new_students` int(11) DEFAULT 0,
  `returning_students` int(11) DEFAULT 0,
  `transferees` int(11) DEFAULT 0,
  `jhs_count` int(11) DEFAULT 0,
  `shs_count` int(11) DEFAULT 0,
  `generated_by` int(11) NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `report_file_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `faculty_id` int(11) NOT NULL,
  `employee_number` varchar(20) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `position` enum('Teacher','Head Teacher','Principal','Assistant Principal') NOT NULL,
  `qualifications` text DEFAULT NULL,
  `years_of_service` int(11) DEFAULT 0,
  `department` enum('JHS','SHS','Both') NOT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `hired_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`faculty_id`, `employee_number`, `first_name`, `middle_name`, `last_name`, `suffix`, `email`, `phone_number`, `position`, `qualifications`, `years_of_service`, `department`, `specialization`, `is_active`, `hired_date`, `created_at`, `updated_at`) VALUES
(1, '', 'asd', 'asd', 'asd', 'asd', 'asd@gmail.com', '09217701136', 'Teacher', NULL, 0, 'JHS', 'asd', 1, '2025-11-06', '2025-11-06 09:16:43', '2025-11-06 09:16:43'),
(11, '', 'John', NULL, 'Smith', NULL, 'john.smith@school.com', NULL, 'Teacher', 'BS in Mathematics', 5, 'JHS', NULL, 1, NULL, '2025-11-07 02:21:19', '2025-11-07 02:21:19'),
(12, '', 'Maria', NULL, 'Garcia', NULL, 'maria.garcia@school.com', '09217701136', 'Teacher', 'MA in English Literature', 8, 'JHS', NULL, 1, NULL, '2025-11-07 02:21:19', '2025-11-07 02:32:23'),
(13, '', 'Robert', NULL, 'Johnson', NULL, 'robert.johnson@school.com', NULL, 'Head Teacher', 'BS in Physics, MS in Education', 12, 'Both', NULL, 1, NULL, '2025-11-07 02:21:19', '2025-11-07 02:21:19');

-- --------------------------------------------------------

--
-- Table structure for table `family_members`
--

CREATE TABLE `family_members` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `relationship` varchar(50) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `graduated_students`
--

CREATE TABLE `graduated_students` (
  `graduation_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `graduation_date` date NOT NULL,
  `graduation_year` varchar(20) NOT NULL,
  `strand` varchar(50) NOT NULL,
  `with_honors` tinyint(1) DEFAULT 0,
  `honor_type` varchar(50) DEFAULT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_records`
--

CREATE TABLE `payment_records` (
  `payment_record_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `scheme_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT 0.00,
  `payment_status` enum('pending','partial','paid','processing','completed') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_custom_payment` tinyint(1) DEFAULT 0 COMMENT 'Whether this uses custom payment terms',
  `custom_reason` text DEFAULT NULL COMMENT 'Reason for custom payment arrangement',
  `upon_enrollment` decimal(10,2) DEFAULT 0.00 COMMENT 'Down payment amount',
  `installment_count` int(11) DEFAULT 1 COMMENT 'Number of installments',
  `installment_amount` decimal(10,2) DEFAULT 0.00 COMMENT 'Amount per installment'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_records`
--

INSERT INTO `payment_records` (`payment_record_id`, `application_id`, `scheme_id`, `total_amount`, `amount_paid`, `payment_status`, `notes`, `created_by`, `created_at`, `updated_at`, `is_custom_payment`, `custom_reason`, `upon_enrollment`, `installment_count`, `installment_amount`) VALUES
(1, 11, 4, 15000.00, 5000.00, 'processing', '', 6, '2025-11-08 15:41:09', '2025-11-08 15:43:26', 0, NULL, 0.00, 1, 0.00),
(2, 24, 2, 15000.00, 0.00, 'pending', 'installment', 6, '2025-11-08 23:48:43', '2025-11-08 23:48:43', 0, NULL, 0.00, 1, 0.00),
(3, 27, 12, 20000.00, 20000.00, 'paid', '', 6, '2025-11-09 01:03:54', '2025-11-10 08:37:48', 0, NULL, 0.00, 1, 0.00),
(4, 25, 6, 15000.00, 5000.00, 'completed', '', 6, '2025-11-09 01:13:33', '2025-11-09 01:17:51', 0, NULL, 0.00, 1, 0.00),
(5, 28, 8, 15000.00, 15000.00, 'paid', '', 6, '2025-11-10 03:40:38', '2025-11-10 07:28:17', 0, NULL, 0.00, 1, 0.00),
(6, 26, 10, 20000.00, 20000.00, 'paid', '\n\n[CUSTOM PAYMENT] financial hardship', 6, '2025-11-10 04:11:58', '2025-11-10 07:25:24', 0, NULL, 0.00, 1, 0.00),
(7, 29, 1, 15000.00, 15000.00, 'processing', '\n\n[CUSTOM PAYMENT] Kulang sa money', 6, '2025-11-10 04:42:59', '2025-11-10 08:39:03', 0, NULL, 0.00, 1, 0.00),
(8, 30, 2, 15000.00, 10000.00, 'partial', 'HAHAHAHA', 6, '2025-11-10 06:55:31', '2025-11-10 08:38:55', 0, NULL, 0.00, 1, 0.00),
(9, 31, 13, 15000.00, 3500.00, 'processing', '', 6, '2025-11-10 07:02:43', '2025-11-10 07:25:32', 0, NULL, 3500.00, 9, 1277.78);

-- --------------------------------------------------------

--
-- Table structure for table `payment_schemes`
--

CREATE TABLE `payment_schemes` (
  `scheme_id` int(11) NOT NULL,
  `scheme_name` varchar(100) NOT NULL,
  `school_level` enum('JHS','SHS') NOT NULL,
  `grade_level` enum('7','8','9','10','11','12') DEFAULT NULL,
  `school_year` varchar(20) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `upon_enrollment` decimal(10,2) NOT NULL,
  `installment_count` int(11) DEFAULT 0,
  `installment_amount` decimal(10,2) DEFAULT 0.00,
  `cash_discount` decimal(10,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment_schemes`
--

INSERT INTO `payment_schemes` (`scheme_id`, `scheme_name`, `school_level`, `grade_level`, `school_year`, `total_amount`, `upon_enrollment`, `installment_count`, `installment_amount`, `cash_discount`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'JHS Grade 7 - Full Payment', 'JHS', '7', '', 15000.00, 0.00, 1, 0.00, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-06 07:03:08'),
(2, 'JHS Grade 7 25%  - Installment', 'JHS', '7', '', 15000.00, 6000.00, 9, 1000.00, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-10 03:19:52'),
(3, 'JHS Grade 8 - Full Payment', 'JHS', '8', '', 15000.00, 6000.00, 1, 9000.00, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-10 03:30:27'),
(4, 'JHS Grade 8 - Installment', 'JHS', '8', '', 15000.00, 0.00, 4, 0.00, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-06 07:03:08'),
(5, 'JHS Grade 9 - Full Payment', 'JHS', '9', '', 15000.00, 0.00, 1, 0.00, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-06 07:03:08'),
(6, 'JHS Grade 9 - Installment', 'JHS', '9', '', 15000.00, 0.00, 4, 0.00, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-06 07:03:08'),
(7, 'JHS Grade 10 - Full Payment', 'JHS', '10', '', 15000.00, 0.00, 1, 0.00, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-06 07:03:08'),
(8, 'JHS Grade 10 15% - Installment', 'JHS', '10', '', 15000.00, 3500.00, 9, 1277.78, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-10 03:32:29'),
(9, 'SHS Grade 11 - Full Payment', 'SHS', '11', '', 20000.00, 0.00, 1, 0.00, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-06 07:03:08'),
(10, 'SHS Grade 11 - Installment', 'SHS', '11', '', 20000.00, 5000.00, 5, 3000.00, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-10 03:41:38'),
(11, 'SHS Grade 12 - Full Payment', 'SHS', '12', '', 20000.00, 0.00, 1, 0.00, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-06 07:03:08'),
(12, 'SHS Grade 12 - Installment', 'SHS', '12', '', 20000.00, 0.00, 4, 0.00, 0.00, NULL, 1, '2025-11-06 07:03:08', '2025-11-06 07:03:08'),
(13, 'JHS Grade 7 15% - Installment', 'JHS', '7', '', 15000.00, 3500.00, 9, 1277.78, 0.00, NULL, 1, '2025-11-10 03:19:37', '2025-11-10 03:20:27'),
(14, 'JHS Grade 8 25% - Installment', 'JHS', '8', '2025-2026', 15000.00, 6000.00, 9, 1000.00, 0.00, NULL, 1, '2025-11-10 03:26:34', '2025-11-10 03:30:44'),
(15, 'JHS Grade 8 15%  - Installment', 'JHS', '8', '2025-2026', 15000.00, 3500.00, 9, 1277.78, 0.00, NULL, 1, '2025-11-10 03:31:25', '2025-11-10 03:31:25');

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `transaction_id` int(11) NOT NULL,
  `payment_record_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `transaction_date` datetime DEFAULT current_timestamp(),
  `processed_by_cashier` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `recorded_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_transactions`
--

INSERT INTO `payment_transactions` (`transaction_id`, `payment_record_id`, `amount`, `payment_method`, `reference_number`, `transaction_date`, `processed_by_cashier`, `created_at`, `recorded_by`) VALUES
(1, 2, 15000.00, 'cash', '123456', '2025-11-07 09:18:32', 8, '2025-11-07 01:18:32', NULL),
(2, 3, 10000.00, 'cash', '123451', '2025-11-07 09:25:09', 8, '2025-11-07 01:25:09', NULL),
(3, 3, 5000.00, 'cash', '123452', '2025-11-07 09:26:00', 8, '2025-11-07 01:26:00', NULL),
(4, 4, 15000.00, 'cash', '123123', '2025-11-07 13:41:33', 8, '2025-11-07 05:41:33', NULL),
(5, 5, 15000.00, 'cash', '123456', '2025-11-07 14:33:36', 8, '2025-11-07 06:33:36', NULL),
(6, 6, 15000.00, 'cash', '123789', '2025-11-07 14:56:50', 8, '2025-11-07 06:56:50', NULL),
(7, 1, 5000.00, 'cash', '124578', '2025-11-08 23:43:05', NULL, '2025-11-08 15:43:05', 8),
(8, 4, 5000.00, 'cash', '879123', '2025-11-09 09:16:03', NULL, '2025-11-09 01:16:03', 8),
(10, 9, 3500.00, 'cash', '256325', '2025-11-10 15:10:34', NULL, '2025-11-10 07:10:34', 8),
(11, 8, 10000.00, 'cash', '785478', '2025-11-10 15:12:35', NULL, '2025-11-10 07:12:35', 8),
(13, 7, 15000.00, 'cash', '123654', '2025-11-10 15:21:51', NULL, '2025-11-10 07:21:51', 8),
(14, 6, 10000.00, 'cash', '741258', '2025-11-10 15:25:06', NULL, '2025-11-10 07:25:06', 8),
(15, 6, 10000.00, 'cash', '75369', '2025-11-10 15:25:24', NULL, '2025-11-10 07:25:24', 8),
(16, 5, 15000.00, 'cash', '123987', '2025-11-10 15:28:16', NULL, '2025-11-10 07:28:16', 8),
(17, 3, 10000.00, 'cash', '258147', '2025-11-10 16:24:25', NULL, '2025-11-10 08:24:25', 8),
(19, 3, 10000.00, 'cash', '12376', '2025-11-10 16:37:48', NULL, '2025-11-10 08:37:48', 8);

-- --------------------------------------------------------

--
-- Table structure for table `registration_forms`
--

CREATE TABLE `registration_forms` (
  `form_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `form_number` varchar(50) NOT NULL,
  `generated_by_accountant` int(11) NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `printed_count` int(11) DEFAULT 0,
  `last_printed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sections`
--

CREATE TABLE `sections` (
  `section_id` int(11) NOT NULL,
  `section_name` varchar(100) NOT NULL,
  `school_level` enum('JHS','SHS') NOT NULL,
  `grade_level` enum('7','8','9','10','11','12') NOT NULL,
  `strand` varchar(50) DEFAULT NULL,
  `school_year` varchar(20) NOT NULL,
  `adviser_id` int(11) DEFAULT NULL,
  `max_capacity` int(11) DEFAULT 40,
  `next_section_id` int(11) DEFAULT NULL,
  `current_capacity` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `adviser` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sections`
--

INSERT INTO `sections` (`section_id`, `section_name`, `school_level`, `grade_level`, `strand`, `school_year`, `adviser_id`, `max_capacity`, `next_section_id`, `current_capacity`, `is_active`, `created_at`, `updated_at`, `adviser`) VALUES
(1, '7 astig', 'JHS', '7', NULL, '2025-2026', NULL, 40, 13, 0, 1, '2025-11-07 00:56:08', '2025-11-08 18:45:00', NULL),
(8, '8 lipit', 'JHS', '8', NULL, '2025-2026', NULL, 40, 10, 0, 0, '2025-11-07 03:24:04', '2025-11-08 10:08:54', NULL),
(9, '8 nakopo', 'JHS', '8', NULL, '2025-2026', NULL, 40, NULL, 0, 0, '2025-11-07 03:33:04', '2025-11-08 10:22:11', NULL),
(10, '9 lol', 'JHS', '9', NULL, '2025-2026', NULL, 40, NULL, 0, 1, '2025-11-07 04:30:16', '2025-11-07 04:30:16', NULL),
(12, '9 haha', 'SHS', '9', NULL, '2025-2026', NULL, 40, NULL, 0, 0, '2025-11-08 10:04:40', '2025-11-08 10:22:20', NULL),
(13, '8 lupet', 'JHS', '8', NULL, '2025-2026', NULL, 40, NULL, 0, 1, '2025-11-08 10:05:02', '2025-11-08 10:05:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `section_subjects`
--

CREATE TABLE `section_subjects` (
  `id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `is_active` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `section_subjects`
--

INSERT INTO `section_subjects` (`id`, `section_id`, `subject_name`, `is_active`, `created_at`) VALUES
(1, 13, 'English', 0, '2025-11-08 10:26:20'),
(2, 1, 'English', 0, '2025-11-08 10:27:12'),
(3, 1, 'Mathematics', 0, '2025-11-08 10:27:19'),
(4, 1, 'Computer 7', 1, '2025-11-08 10:58:22');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `student_number` varchar(20) NOT NULL,
  `application_id` int(11) DEFAULT NULL,
  `first_name` varchar(50) NOT NULL,
  `middle_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) NOT NULL,
  `suffix` varchar(10) DEFAULT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `guardian_name` varchar(100) NOT NULL,
  `guardian_relationship` varchar(50) NOT NULL,
  `guardian_phone` varchar(20) NOT NULL,
  `guardian_email` varchar(100) DEFAULT NULL,
  `school_level` enum('JHS','SHS') NOT NULL,
  `current_grade_level` enum('7','8','9','10','11','12') NOT NULL,
  `strand` varchar(50) DEFAULT NULL,
  `student_type` enum('regular','irregular','transferee') DEFAULT 'regular',
  `enrollment_status` enum('enrolled','completed','transferred_out','dropped','graduated') DEFAULT 'enrolled',
  `school_year` varchar(20) NOT NULL,
  `is_returning_student` tinyint(1) DEFAULT 0,
  `previous_student_number` varchar(20) DEFAULT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ext_name` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `barangay` varchar(100) DEFAULT NULL,
  `lrn` varchar(12) DEFAULT NULL,
  `citizenship` varchar(100) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `previous_school` varchar(255) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `application_status` varchar(50) DEFAULT 'pending',
  `enrollment_type` varchar(50) DEFAULT NULL,
  `is_valedictorian` tinyint(1) DEFAULT 0,
  `is_salutatorian` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `student_number`, `application_id`, `first_name`, `middle_name`, `last_name`, `suffix`, `date_of_birth`, `gender`, `email`, `phone_number`, `city`, `province`, `zip_code`, `guardian_name`, `guardian_relationship`, `guardian_phone`, `guardian_email`, `school_level`, `current_grade_level`, `strand`, `student_type`, `enrollment_status`, `school_year`, `is_returning_student`, `previous_student_number`, `enrolled_at`, `created_at`, `updated_at`, `ext_name`, `age`, `nationality`, `street`, `barangay`, `lrn`, `citizenship`, `religion`, `previous_school`, `department`, `application_status`, `enrollment_type`, `is_valedictorian`, `is_salutatorian`) VALUES
(8, '2025-000001', 25, 'Juan', 'Dela Cruz', 'Reyes', 'Jr.', '2010-11-22', 'Male', 'juan.reyes@hotmail.com', '09201234567', 'Quezon City', 'Metro Manila', '1100', 'Ana Reyes', 'Mother', '09211234567', 'ana.reyes@gmail.com', 'JHS', '7', NULL, 'regular', 'enrolled', '2025-2026', 0, NULL, '2025-11-09 01:17:50', '2025-11-09 01:17:50', '2025-11-10 15:30:47', NULL, NULL, NULL, '456 Bonifacio Ave', 'Bagumbayan', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 1, 0),
(9, '2025-000002', NULL, 'pix', 'pix', 'pix', 'pix', '2025-11-10', 'Female', 'pix@gmail.com', '123456', '123', '123', '123', 'pix', 'pix', '123', NULL, 'JHS', '8', NULL, 'regular', 'enrolled', '2025-2026', 0, NULL, '2025-11-10 07:21:23', '2025-11-10 07:21:23', '2025-11-10 15:44:34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, 0),
(10, '2025-000003', NULL, 'oreo', NULL, 'abno', NULL, '2025-11-09', 'Male', NULL, NULL, 'st', 'st', NULL, 'st', 'Mother', '12', NULL, 'JHS', '8', NULL, 'regular', 'enrolled', '2025-2026', 0, NULL, '2025-11-10 07:21:51', '2025-11-10 07:21:51', '2025-11-10 23:49:22', NULL, NULL, NULL, 'asd', 'asd', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, 0),
(11, '2025-000004', NULL, 'Sofia', 'Isabel', 'Garcia', NULL, '2008-03-29', 'Female', 'sofia.garcia@yahoo.com', '09351234568', 'Makati City', 'Metro Manila', '1200', 'Roberto Garcia', 'Father', '09361234568', 'roberto.garcia@gmail.com', 'SHS', '9', 'STEM', 'regular', 'enrolled', '2025-2026', 0, NULL, '2025-11-10 07:25:24', '2025-11-10 07:25:24', '2025-11-10 23:50:11', NULL, NULL, NULL, 'qwe', 'qwe', NULL, NULL, NULL, NULL, NULL, 'pending', NULL, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `student_history`
--

CREATE TABLE `student_history` (
  `history_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `school_year` varchar(20) NOT NULL,
  `grade_level` enum('7','8','9','10','11','12') NOT NULL,
  `section_id` int(11) DEFAULT NULL,
  `enrollment_status` enum('enrolled','completed','transferred_out','dropped','graduated') NOT NULL,
  `promoted` tinyint(1) DEFAULT 0,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_payments`
--

CREATE TABLE `student_payments` (
  `payment_record_id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `application_id` int(11) DEFAULT NULL,
  `scheme_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT 0.00,
  `balance` decimal(10,2) NOT NULL,
  `payment_status` enum('pending','partial','paid','overdue') DEFAULT 'pending',
  `created_by_accountant` int(11) NOT NULL,
  `sent_to_cashier_at` datetime DEFAULT NULL,
  `accountant_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_payments`
--

INSERT INTO `student_payments` (`payment_record_id`, `student_id`, `application_id`, `scheme_id`, `total_amount`, `amount_paid`, `balance`, `payment_status`, `created_by_accountant`, `sent_to_cashier_at`, `accountant_notes`, `created_at`, `updated_at`) VALUES
(1, NULL, 4, 5, 15000.00, 15000.00, 0.00, 'paid', 6, NULL, 'hi', '2025-11-06 07:37:20', '2025-11-06 07:47:12'),
(2, NULL, 5, 1, 15000.00, 15000.00, 0.00, 'paid', 6, NULL, 'hi', '2025-11-07 01:12:11', '2025-11-07 01:18:32'),
(3, NULL, 6, 4, 15000.00, 15000.00, 0.00, 'paid', 2, NULL, 'add', '2025-11-07 01:24:35', '2025-11-07 01:26:01'),
(4, NULL, 7, 1, 15000.00, 15000.00, 0.00, 'paid', 6, NULL, 'bnbm', '2025-11-07 05:40:57', '2025-11-07 05:41:33'),
(5, NULL, 3, 5, 15000.00, 15000.00, 0.00, 'paid', 6, NULL, 'hi', '2025-11-07 06:33:02', '2025-11-07 06:33:37'),
(6, NULL, 2, 3, 15000.00, 15000.00, 0.00, 'paid', 6, NULL, '', '2025-11-07 06:55:40', '2025-11-07 06:56:50'),
(7, NULL, 8, 1, 15000.00, 0.00, 0.00, 'pending', 6, NULL, '', '2025-11-07 18:55:49', '2025-11-07 18:55:49');

-- --------------------------------------------------------

--
-- Table structure for table `student_sections`
--

CREATE TABLE `student_sections` (
  `enrollment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `section_id` int(11) NOT NULL,
  `school_year` varchar(20) NOT NULL,
  `enrolled_date` date NOT NULL,
  `is_current` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `enrollment_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_subjects`
--

CREATE TABLE `student_subjects` (
  `assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `school_year` varchar(20) NOT NULL,
  `semester` enum('1','2') NOT NULL,
  `status` enum('enrolled','completed','failed','dropped') DEFAULT 'enrolled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `subject_id` int(11) NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `school_level` enum('JHS','SHS') NOT NULL,
  `grade_level` enum('7','8','9','10','11','12') NOT NULL,
  `strand` varchar(50) DEFAULT NULL,
  `semester` enum('1','2','Both') DEFAULT 'Both',
  `units` int(11) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`subject_id`, `subject_code`, `subject_name`, `school_level`, `grade_level`, `strand`, `semester`, `units`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'FIL7', 'Filipino 7', 'JHS', '7', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(2, 'ENG7', 'English 7', 'JHS', '7', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(3, 'MATH7', 'Mathematics 7', 'JHS', '7', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(4, 'SCI7', 'Science & Technology 7', 'JHS', '7', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(5, 'AP7', 'Araling Panlipunan (AP) 7', 'JHS', '7', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(6, 'TLE7', 'Technology & Livelihood Education (TLE) 7', 'JHS', '7', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(7, 'MAPEH7', 'Music, Arts, Physical Education & Health (MAPEH) 7', 'JHS', '7', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(8, 'EP7', 'Edukasyong Pagpapahalaga (EP) 7', 'JHS', '7', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(9, 'COMP7', 'Computer 7', 'JHS', '7', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(10, 'FIL8', 'Filipino 8', 'JHS', '8', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(11, 'ENG8', 'English 8', 'JHS', '8', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(12, 'MATH8', 'Mathematics 8', 'JHS', '8', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(13, 'SCI8', 'Science & Technology 8', 'JHS', '8', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(14, 'AP8', 'Araling Panlipunan (AP) 8', 'JHS', '8', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(15, 'TLE8', 'Technology & Livelihood Education (TLE) 8', 'JHS', '8', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(16, 'MAPEH8', 'Music, Arts, Physical Education & Health (MAPEH) 8', 'JHS', '8', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(17, 'EP8', 'Edukasyong Pagpapahalaga (EP) 8', 'JHS', '8', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(18, 'COMP8', 'Computer 8', 'JHS', '8', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(19, 'FIL9', 'Filipino 9', 'JHS', '9', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(20, 'ENG9', 'English 9', 'JHS', '9', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(21, 'MATH9', 'Mathematics 9', 'JHS', '9', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(22, 'SCI9', 'Science & Technology 9', 'JHS', '9', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(23, 'AP9', 'Araling Panlipunan (AP) 9', 'JHS', '9', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(24, 'TLE9', 'Technology & Livelihood Education (TLE) 9', 'JHS', '9', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(25, 'MAPEH9', 'Music, Arts, Physical Education & Health (MAPEH) 9', 'JHS', '9', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(26, 'EP9', 'Edukasyong Pagpapahalaga (EP) 9', 'JHS', '9', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(27, 'COMP9', 'Computer 9', 'JHS', '9', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(28, 'FIL10', 'Filipino 10', 'JHS', '10', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(29, 'ENG10', 'English 10', 'JHS', '10', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(30, 'MATH10', 'Mathematics 10', 'JHS', '10', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(31, 'SCI10', 'Science & Technology 10', 'JHS', '10', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(32, 'AP10', 'Araling Panlipunan (AP) 10', 'JHS', '10', NULL, 'Both', 3, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(33, 'TLE10', 'Technology & Livelihood Education (TLE) 10', 'JHS', '10', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(34, 'MAPEH10', 'Music, Arts, Physical Education & Health (MAPEH) 10', 'JHS', '10', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(35, 'EP10', 'Edukasyong Pagpapahalaga (EP) 10', 'JHS', '10', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18'),
(36, 'COMP10', 'Computer 10', 'JHS', '10', NULL, 'Both', 2, 1, '2025-11-08 05:37:18', '2025-11-08 05:37:18');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `description` text DEFAULT NULL,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_id`, `setting_key`, `setting_value`, `description`, `updated_by`, `updated_at`) VALUES
(1, 'current_school_year', '2025-2026', 'Current active school year', NULL, '2025-11-06 05:29:45'),
(2, 'enrollment_open', 'true', 'Is enrollment currently open', NULL, '2025-11-06 05:29:45'),
(3, 'student_number_prefix', 'STU', 'Prefix for student numbers', NULL, '2025-11-06 05:29:45'),
(4, 'registration_form_prefix', 'RF', 'Prefix for registration form numbers', NULL, '2025-11-06 05:29:45');

-- --------------------------------------------------------

--
-- Table structure for table `transferred_out`
--

CREATE TABLE `transferred_out` (
  `transfer_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `transfer_date` date NOT NULL,
  `transfer_school` varchar(200) NOT NULL,
  `transfer_address` text DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `processed_by` int(11) NOT NULL,
  `archived_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','registrar_shs','registrar_jhs','cashier','accountant') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `full_name`, `role`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(2, 'admin', '$2b$10$qYTr7SoFnsZ4jvfrJSfhw.3DGTmm9wph4RkGMR4p1HVr15kGi6XNi', 'admin@school.edu', 'System Administrator', 'admin', 1, '2025-11-10 22:34:16', '2025-11-06 05:56:37', '2025-11-10 14:34:16'),
(3, 'registrar', '$2a$10$N9qo8uLOickgx2ZMRZoMye7IxIJp5jA0iJVLY1VfFqK6RYzUhZqZi', 'registrar@school.edu', 'Jane Registrar', 'registrar_jhs', 1, NULL, '2025-11-06 06:43:47', '2025-11-06 06:43:47'),
(6, 'accountant', '$2b$10$pEaWVuJppgB4uJ0QtipVJuPmbZBwRxEXEHSu.IRJWE1E4Y5uWTr/u', 'accountant@school.edu', 'Maria Accountant', 'accountant', 1, '2025-11-10 22:29:52', '2025-11-06 07:06:33', '2025-11-10 14:29:52'),
(8, 'cashier', '$2b$10$pEaWVuJppgB4uJ0QtipVJuPmbZBwRxEXEHSu.IRJWE1E4Y5uWTr/u', 'cashier@school.edu', 'Jane Cashier', 'cashier', 1, '2025-11-10 22:32:27', '2025-11-06 07:21:08', '2025-11-10 14:32:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action_type` (`action_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `admission_applications`
--
ALTER TABLE `admission_applications`
  ADD PRIMARY KEY (`application_id`),
  ADD UNIQUE KEY `student_number` (`student_number`),
  ADD KEY `reviewed_by_registrar` (`reviewed_by_registrar`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_school_level` (`school_level`),
  ADD KEY `idx_grade_level` (`grade_level`),
  ADD KEY `idx_application_type` (`application_type`),
  ADD KEY `idx_payment_record_id` (`payment_record_id`),
  ADD KEY `idx_student_number` (`student_number`);

--
-- Indexes for table `completers`
--
ALTER TABLE `completers`
  ADD PRIMARY KEY (`completer_id`),
  ADD KEY `idx_completion_year` (`completion_year`),
  ADD KEY `idx_student` (`student_id`);

--
-- Indexes for table `curricula`
--
ALTER TABLE `curricula`
  ADD PRIMARY KEY (`curriculum_id`),
  ADD UNIQUE KEY `curriculum_code` (`curriculum_code`),
  ADD KEY `idx_grade_level` (`grade_level`),
  ADD KEY `idx_school_level` (`school_level`);

--
-- Indexes for table `curriculum_subjects`
--
ALTER TABLE `curriculum_subjects`
  ADD PRIMARY KEY (`curriculum_subject_id`),
  ADD UNIQUE KEY `unique_curriculum_subject` (`curriculum_id`,`subject_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `dropped_students`
--
ALTER TABLE `dropped_students`
  ADD PRIMARY KEY (`drop_id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_drop_date` (`drop_date`);

--
-- Indexes for table `enrollment_reports`
--
ALTER TABLE `enrollment_reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `generated_by` (`generated_by`),
  ADD KEY `idx_report_date` (`report_date`),
  ADD KEY `idx_report_type` (`report_type`),
  ADD KEY `idx_school_year` (`school_year`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`faculty_id`),
  ADD KEY `idx_department` (`department`),
  ADD KEY `idx_employee_number` (`employee_number`);

--
-- Indexes for table `family_members`
--
ALTER TABLE `family_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `graduated_students`
--
ALTER TABLE `graduated_students`
  ADD PRIMARY KEY (`graduation_id`),
  ADD KEY `idx_graduation_year` (`graduation_year`),
  ADD KEY `idx_student` (`student_id`);

--
-- Indexes for table `payment_records`
--
ALTER TABLE `payment_records`
  ADD PRIMARY KEY (`payment_record_id`),
  ADD UNIQUE KEY `unique_application` (`application_id`),
  ADD KEY `scheme_id` (`scheme_id`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_application_payment` (`application_id`);

--
-- Indexes for table `payment_schemes`
--
ALTER TABLE `payment_schemes`
  ADD PRIMARY KEY (`scheme_id`),
  ADD KEY `idx_school_level` (`school_level`),
  ADD KEY `idx_school_year` (`school_year`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `processed_by_cashier` (`processed_by_cashier`),
  ADD KEY `idx_payment_transactions` (`payment_record_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Indexes for table `registration_forms`
--
ALTER TABLE `registration_forms`
  ADD PRIMARY KEY (`form_id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD UNIQUE KEY `form_number` (`form_number`),
  ADD KEY `generated_by_accountant` (`generated_by_accountant`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_form_number` (`form_number`);

--
-- Indexes for table `sections`
--
ALTER TABLE `sections`
  ADD PRIMARY KEY (`section_id`),
  ADD UNIQUE KEY `unique_section` (`section_name`,`school_year`),
  ADD KEY `adviser_id` (`adviser_id`),
  ADD KEY `idx_grade_level` (`grade_level`),
  ADD KEY `idx_school_level` (`school_level`),
  ADD KEY `idx_school_year` (`school_year`),
  ADD KEY `next_section_id` (`next_section_id`);

--
-- Indexes for table `section_subjects`
--
ALTER TABLE `section_subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_subject` (`section_id`,`subject_name`),
  ADD KEY `idx_section` (`section_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `student_number` (`student_number`),
  ADD UNIQUE KEY `application_id` (`application_id`),
  ADD KEY `idx_student_number` (`student_number`),
  ADD KEY `idx_school_level` (`school_level`),
  ADD KEY `idx_grade_level` (`current_grade_level`),
  ADD KEY `idx_enrollment_status` (`enrollment_status`),
  ADD KEY `idx_school_year` (`school_year`),
  ADD KEY `idx_student_type` (`student_type`);

--
-- Indexes for table `student_history`
--
ALTER TABLE `student_history`
  ADD PRIMARY KEY (`history_id`),
  ADD KEY `section_id` (`section_id`),
  ADD KEY `idx_student_year` (`student_id`,`school_year`),
  ADD KEY `idx_school_year` (`school_year`);

--
-- Indexes for table `student_payments`
--
ALTER TABLE `student_payments`
  ADD PRIMARY KEY (`payment_record_id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `scheme_id` (`scheme_id`),
  ADD KEY `created_by_accountant` (`created_by_accountant`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_student` (`student_id`);

--
-- Indexes for table `student_sections`
--
ALTER TABLE `student_sections`
  ADD PRIMARY KEY (`enrollment_id`),
  ADD UNIQUE KEY `unique_student_section` (`student_id`,`section_id`,`school_year`),
  ADD UNIQUE KEY `idx_student_section_unique` (`student_id`,`section_id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_section` (`section_id`),
  ADD KEY `idx_current` (`is_current`);

--
-- Indexes for table `student_subjects`
--
ALTER TABLE `student_subjects`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `unique_student_subject` (`student_id`,`subject_id`,`school_year`,`semester`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_subject` (`subject_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`subject_id`),
  ADD UNIQUE KEY `subject_code` (`subject_code`),
  ADD KEY `idx_grade_level` (`grade_level`),
  ADD KEY `idx_school_level` (`school_level`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `transferred_out`
--
ALTER TABLE `transferred_out`
  ADD PRIMARY KEY (`transfer_id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_transfer_date` (`transfer_date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admission_applications`
--
ALTER TABLE `admission_applications`
  MODIFY `application_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `completers`
--
ALTER TABLE `completers`
  MODIFY `completer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `curricula`
--
ALTER TABLE `curricula`
  MODIFY `curriculum_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `curriculum_subjects`
--
ALTER TABLE `curriculum_subjects`
  MODIFY `curriculum_subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `dropped_students`
--
ALTER TABLE `dropped_students`
  MODIFY `drop_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enrollment_reports`
--
ALTER TABLE `enrollment_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `faculty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `family_members`
--
ALTER TABLE `family_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `graduated_students`
--
ALTER TABLE `graduated_students`
  MODIFY `graduation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payment_records`
--
ALTER TABLE `payment_records`
  MODIFY `payment_record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `payment_schemes`
--
ALTER TABLE `payment_schemes`
  MODIFY `scheme_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `registration_forms`
--
ALTER TABLE `registration_forms`
  MODIFY `form_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sections`
--
ALTER TABLE `sections`
  MODIFY `section_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `section_subjects`
--
ALTER TABLE `section_subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `student_history`
--
ALTER TABLE `student_history`
  MODIFY `history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_payments`
--
ALTER TABLE `student_payments`
  MODIFY `payment_record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `student_sections`
--
ALTER TABLE `student_sections`
  MODIFY `enrollment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `student_subjects`
--
ALTER TABLE `student_subjects`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `subject_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `transferred_out`
--
ALTER TABLE `transferred_out`
  MODIFY `transfer_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `admission_applications`
--
ALTER TABLE `admission_applications`
  ADD CONSTRAINT `admission_applications_ibfk_1` FOREIGN KEY (`reviewed_by_registrar`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `completers`
--
ALTER TABLE `completers`
  ADD CONSTRAINT `completers_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `curriculum_subjects`
--
ALTER TABLE `curriculum_subjects`
  ADD CONSTRAINT `curriculum_subjects_ibfk_1` FOREIGN KEY (`curriculum_id`) REFERENCES `curricula` (`curriculum_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `curriculum_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`) ON DELETE CASCADE;

--
-- Constraints for table `dropped_students`
--
ALTER TABLE `dropped_students`
  ADD CONSTRAINT `dropped_students_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  ADD CONSTRAINT `dropped_students_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `enrollment_reports`
--
ALTER TABLE `enrollment_reports`
  ADD CONSTRAINT `enrollment_reports_ibfk_1` FOREIGN KEY (`generated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `family_members`
--
ALTER TABLE `family_members`
  ADD CONSTRAINT `family_members_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `graduated_students`
--
ALTER TABLE `graduated_students`
  ADD CONSTRAINT `graduated_students_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`);

--
-- Constraints for table `payment_records`
--
ALTER TABLE `payment_records`
  ADD CONSTRAINT `payment_records_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `admission_applications` (`application_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_records_ibfk_2` FOREIGN KEY (`scheme_id`) REFERENCES `payment_schemes` (`scheme_id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `payment_transactions_ibfk_1` FOREIGN KEY (`payment_record_id`) REFERENCES `payment_records` (`payment_record_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `payment_transactions_ibfk_2` FOREIGN KEY (`processed_by_cashier`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `payment_transactions_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `registration_forms`
--
ALTER TABLE `registration_forms`
  ADD CONSTRAINT `registration_forms_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  ADD CONSTRAINT `registration_forms_ibfk_2` FOREIGN KEY (`generated_by_accountant`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `sections`
--
ALTER TABLE `sections`
  ADD CONSTRAINT `sections_ibfk_1` FOREIGN KEY (`adviser_id`) REFERENCES `faculty` (`faculty_id`),
  ADD CONSTRAINT `sections_ibfk_2` FOREIGN KEY (`next_section_id`) REFERENCES `sections` (`section_id`) ON DELETE SET NULL;

--
-- Constraints for table `section_subjects`
--
ALTER TABLE `section_subjects`
  ADD CONSTRAINT `section_subjects_ibfk_1` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `admission_applications` (`application_id`);

--
-- Constraints for table `student_history`
--
ALTER TABLE `student_history`
  ADD CONSTRAINT `student_history_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  ADD CONSTRAINT `student_history_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`);

--
-- Constraints for table `student_payments`
--
ALTER TABLE `student_payments`
  ADD CONSTRAINT `student_payments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  ADD CONSTRAINT `student_payments_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `admission_applications` (`application_id`),
  ADD CONSTRAINT `student_payments_ibfk_3` FOREIGN KEY (`scheme_id`) REFERENCES `payment_schemes` (`scheme_id`),
  ADD CONSTRAINT `student_payments_ibfk_4` FOREIGN KEY (`created_by_accountant`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `student_sections`
--
ALTER TABLE `student_sections`
  ADD CONSTRAINT `student_sections_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_sections_ibfk_2` FOREIGN KEY (`section_id`) REFERENCES `sections` (`section_id`);

--
-- Constraints for table `student_subjects`
--
ALTER TABLE `student_subjects`
  ADD CONSTRAINT `student_subjects_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_subjects_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`subject_id`);

--
-- Constraints for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `transferred_out`
--
ALTER TABLE `transferred_out`
  ADD CONSTRAINT `transferred_out_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`),
  ADD CONSTRAINT `transferred_out_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

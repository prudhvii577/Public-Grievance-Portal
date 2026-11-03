-- =====================================================================
-- PUBLIC GRIEVANCE REDRESSAL PORTAL (PGRP)
-- MySQL Database Schema and Seed Data
-- Database Name: grievance_portal
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `grievance_portal` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `grievance_portal`;

SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables if re-importing
DROP TABLE IF EXISTS `Feedback`;
DROP TABLE IF EXISTS `ComplaintHistory`;
DROP TABLE IF EXISTS `ComplaintAssignments`;
DROP TABLE IF EXISTS `Complaints`;
DROP TABLE IF EXISTS `ComplaintCategories`;
DROP TABLE IF EXISTS `Users`;
DROP TABLE IF EXISTS `Departments`;

-- 1. Departments Table
CREATE TABLE `Departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `description` TEXT,
  `contact_email` VARCHAR(254) NOT NULL DEFAULT '',
  `contact_phone` VARCHAR(20) NOT NULL DEFAULT '',
  `head_officer_name` VARCHAR(100) NOT NULL DEFAULT '',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Users Table
CREATE TABLE `Users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `password` VARCHAR(128) NOT NULL,
  `last_login` DATETIME(6) NULL,
  `is_superuser` TINYINT(1) NOT NULL DEFAULT 0,
  `username` VARCHAR(150) NOT NULL UNIQUE,
  `first_name` VARCHAR(150) NOT NULL DEFAULT '',
  `last_name` VARCHAR(150) NOT NULL DEFAULT '',
  `is_staff` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `date_joined` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `email` VARCHAR(254) NOT NULL UNIQUE,
  `role` VARCHAR(20) NOT NULL DEFAULT 'citizen',
  `phone_number` VARCHAR(20) NOT NULL DEFAULT '',
  `address` TEXT,
  `designation` VARCHAR(100) NOT NULL DEFAULT '',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `department_id` INT NULL,
  CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `Departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Complaint Categories Table
CREATE TABLE `ComplaintCategories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `sla_days` INT UNSIGNED NOT NULL DEFAULT 7,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `default_department_id` INT NULL,
  CONSTRAINT `fk_category_dept` FOREIGN KEY (`default_department_id`) REFERENCES `Departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Complaints Table
CREATE TABLE `Complaints` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `address` LONGTEXT NOT NULL,
  `image` VARCHAR(100) NULL,
  `submission_date` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `priority` VARCHAR(20) NOT NULL DEFAULT 'Medium',
  `status` VARCHAR(30) NOT NULL DEFAULT 'Submitted',
  `authority_remarks` LONGTEXT,
  `resolution_notes` LONGTEXT,
  `reopen_reason` LONGTEXT,
  `last_updated_date` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `assigned_department_id` INT NULL,
  `assigned_officer_id` INT NULL,
  `category_id` INT NOT NULL,
  `citizen_id` INT NOT NULL,
  CONSTRAINT `fk_complaints_dept` FOREIGN KEY (`assigned_department_id`) REFERENCES `Departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaints_officer` FOREIGN KEY (`assigned_officer_id`) REFERENCES `Users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_complaints_category` FOREIGN KEY (`category_id`) REFERENCES `ComplaintCategories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_complaints_citizen` FOREIGN KEY (`citizen_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Complaint Assignments Table
CREATE TABLE `ComplaintAssignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `priority` VARCHAR(20) NOT NULL DEFAULT 'Medium',
  `notes` LONGTEXT,
  `assigned_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `assigned_by_id` INT NOT NULL,
  `assigned_to_id` INT NULL,
  `complaint_id` INT NOT NULL,
  `department_id` INT NOT NULL,
  CONSTRAINT `fk_assignment_by` FOREIGN KEY (`assigned_by_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignment_to` FOREIGN KEY (`assigned_to_id`) REFERENCES `Users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_assignment_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `Complaints` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assignment_department` FOREIGN KEY (`department_id`) REFERENCES `Departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Complaint History Table
CREATE TABLE `ComplaintHistory` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `status` VARCHAR(30) NOT NULL,
  `action_type` VARCHAR(50) NOT NULL,
  `remarks` LONGTEXT,
  `timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `action_by_id` INT NULL,
  `complaint_id` INT NOT NULL,
  CONSTRAINT `fk_history_action_by` FOREIGN KEY (`action_by_id`) REFERENCES `Users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_history_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `Complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Feedback Table
CREATE TABLE `Feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rating` SMALLINT UNSIGNED NOT NULL,
  `comments` LONGTEXT,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `citizen_id` INT NOT NULL,
  `complaint_id` INT NOT NULL UNIQUE,
  CONSTRAINT `fk_feedback_citizen` FOREIGN KEY (`citizen_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_feedback_complaint` FOREIGN KEY (`complaint_id`) REFERENCES `Complaints` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- SEED DATA INSERTION
-- =====================================================================

-- Departments
INSERT INTO `Departments` (`id`, `name`, `code`, `description`, `contact_email`, `contact_phone`, `head_officer_name`) VALUES
(1, 'Roads & Bridges Department', 'ROADS', 'Maintenance of city roads, potholes, pavements, and flyovers.', 'roads@pgrp.gov.in', '+91 11 2345 6780', 'Er. Vikram Malhotra'),
(2, 'Water Supply & Sewerage Board', 'WATER', 'Potable water distribution, pipeline leak repairs, and water contamination checks.', 'water@pgrp.gov.in', '+91 11 2345 6781', 'Er. S. Venkatraman'),
(3, 'Solid Waste & Sanitation Management', 'WASTE', 'Daily garbage collection, community dustbins, and zero-waste initiatives.', 'sanitation@pgrp.gov.in', '+91 11 2345 6782', 'Dr. Neha Kulkarni'),
(4, 'Drainage & Stormwater Department', 'DRAIN', 'Drain cleaning, monsoon flood mitigation, and underground sewer maintenance.', 'drainage@pgrp.gov.in', '+91 11 2345 6783', 'Er. Rajesh Verma'),
(5, 'Electricity & Street Lighting Board', 'ELECT', 'Public streetlight poles, transformer repairs, and municipal power grids.', 'electricity@pgrp.gov.in', '+91 11 2345 6784', 'Er. Priya Sharma'),
(6, 'Public Health & Civic Hygiene', 'HEALTH', 'Mosquito fogging, stray animal control, public restrooms maintenance.', 'health@pgrp.gov.in', '+91 11 2345 6785', 'Dr. Arvind Swaminathan');

-- Complaint Categories (8 Predefined Categories)
INSERT INTO `ComplaintCategories` (`id`, `name`, `description`, `default_department_id`, `sla_days`) VALUES
(1, 'Road Damage', 'Potholes, broken asphalt, damaged footpaths, or cave-ins.', 1, 5),
(2, 'Water Supply Issues', 'Disrupted tap water supply, low water pressure, contaminated water, or burst pipes.', 2, 3),
(3, 'Garbage Collection', 'Uncollected trash heaps, overflowing public dustbins, and irregular garbage trucks.', 3, 2),
(4, 'Drainage Problems', 'Clogged stormwater drains, water-logging during rains, and open manholes.', 4, 4),
(5, 'Streetlight Issues', 'Flickering lights, dark streets at night, or exposed electrical wiring on poles.', 5, 3),
(6, 'Electricity Problems', 'Substation transformer sparkings, loose high-voltage cables, or municipal power cut.', 5, 2),
(7, 'Public Sanitation', 'Dirty public toilets, stagnant sewage pools, and pest breeding areas.', 6, 3),
(8, 'Other Civic Issues', 'General civic infrastructure inquiries, encroached sidewalks, or nuisance complaints.', 1, 7);

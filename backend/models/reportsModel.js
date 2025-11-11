// models/reportsModel.js - ONLY database queries
const db = require('../config/database');

exports.getDailyStats = async (date) => {
    const [stats] = await db.query(`
        SELECT 
            COUNT(*) as total_enrollments,
            SUM(CASE WHEN application_type = 'new' THEN 1 ELSE 0 END) as new_students,
            SUM(CASE WHEN application_type = 'returning' THEN 1 ELSE 0 END) as returning_students,
            SUM(CASE WHEN application_type = 'transferee' THEN 1 ELSE 0 END) as transferees,
            SUM(CASE WHEN school_level = 'JHS' THEN 1 ELSE 0 END) as jhs_count,
            SUM(CASE WHEN school_level = 'SHS' THEN 1 ELSE 0 END) as shs_count
        FROM admission_applications 
        WHERE DATE(enrolled_at) = ? AND status = 'approved'
    `, [date]);
    return stats[0];
};

exports.getMonthlyStats = async (year, month) => {
    const [stats] = await db.query(`
        SELECT 
            COUNT(*) as total_enrollments,
            SUM(CASE WHEN application_type = 'new' THEN 1 ELSE 0 END) as new_students,
            SUM(CASE WHEN application_type = 'returning' THEN 1 ELSE 0 END) as returning_students,
            SUM(CASE WHEN application_type = 'transferee' THEN 1 ELSE 0 END) as transferees,
            SUM(CASE WHEN school_level = 'JHS' THEN 1 ELSE 0 END) as jhs_count,
            SUM(CASE WHEN school_level = 'SHS' THEN 1 ELSE 0 END) as shs_count
        FROM admission_applications 
        WHERE YEAR(enrolled_at) = ? AND MONTH(enrolled_at) = ? AND status = 'approved'
    `, [year, month]);
    return stats[0];
};

exports.getYearlyStats = async (schoolYear) => {
    const [stats] = await db.query(`
        SELECT 
            COUNT(*) as total_enrollments,
            SUM(CASE WHEN application_type = 'new' THEN 1 ELSE 0 END) as new_students,
            SUM(CASE WHEN application_type = 'returning' THEN 1 ELSE 0 END) as returning_students,
            SUM(CASE WHEN application_type = 'transferee' THEN 1 ELSE 0 END) as transferees,
            SUM(CASE WHEN school_level = 'JHS' THEN 1 ELSE 0 END) as jhs_count,
            SUM(CASE WHEN school_level = 'SHS' THEN 1 ELSE 0 END) as shs_count
        FROM students 
        WHERE school_year = ? AND enrollment_status = 'enrolled'
    `, [schoolYear]);
    return stats[0];
};

exports.insertDailyReport = async (date, schoolYear, stats, userId) => {
    const [result] = await db.query(`
        INSERT INTO enrollment_reports 
        (report_type, report_date, school_year, total_enrollments, new_students, 
         returning_students, transferees, jhs_count, shs_count, generated_by)
        VALUES ('daily', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        date, schoolYear,
        stats.total_enrollments || 0,
        stats.new_students || 0,
        stats.returning_students || 0,
        stats.transferees || 0,
        stats.jhs_count || 0,
        stats.shs_count || 0,
        userId
    ]);
    return result;
};

exports.insertMonthlyReport = async (reportDate, schoolYear, stats, userId) => {
    const [result] = await db.query(`
        INSERT INTO enrollment_reports 
        (report_type, report_date, school_year, total_enrollments, new_students, 
         returning_students, transferees, jhs_count, shs_count, generated_by)
        VALUES ('monthly', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        reportDate, schoolYear,
        stats.total_enrollments || 0,
        stats.new_students || 0,
        stats.returning_students || 0,
        stats.transferees || 0,
        stats.jhs_count || 0,
        stats.shs_count || 0,
        userId
    ]);
    return result;
};

exports.insertYearlyReport = async (schoolYear, stats, userId) => {
    const [result] = await db.query(`
        INSERT INTO enrollment_reports 
        (report_type, report_date, school_year, total_enrollments, new_students, 
         returning_students, transferees, jhs_count, shs_count, generated_by)
        VALUES ('yearly', CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        schoolYear,
        stats.total_enrollments || 0,
        stats.new_students || 0,
        stats.returning_students || 0,
        stats.transferees || 0,
        stats.jhs_count || 0,
        stats.shs_count || 0,
        userId
    ]);
    return result;
};

exports.getAllReports = async (filters) => {
    let query = 'SELECT * FROM enrollment_reports WHERE 1=1';
    const params = [];

    if (filters.reportType) {
        query += ' AND report_type = ?';
        params.push(filters.reportType);
    }

    if (filters.schoolYear) {
        query += ' AND school_year = ?';
        params.push(filters.schoolYear);
    }

    query += ' ORDER BY generated_at DESC LIMIT 50';

    const [reports] = await db.query(query, params);
    return reports;
};

exports.getStatsByType = async (year, statType) => {
    const [stats] = await db.query(`
        SELECT 
            student_type,
            COUNT(*) as count
        FROM students 
        WHERE school_year = ?
        GROUP BY student_type
    `, [year]);
    return stats;
};

exports.getStatsByLevel = async (year) => {
    const [stats] = await db.query(`
        SELECT 
            school_level,
            COUNT(*) as count
        FROM students 
        WHERE school_year = ?
        GROUP BY school_level
    `, [year]);
    return stats;
};

exports.getStatsByGrade = async (year) => {
    const [stats] = await db.query(`
        SELECT 
            current_grade_level,
            COUNT(*) as count
        FROM students 
        WHERE school_year = ?
        GROUP BY current_grade_level
        ORDER BY current_grade_level
    `, [year]);
    return stats;
};

exports.getStatsByStatus = async (year) => {
    const [stats] = await db.query(`
        SELECT 
            enrollment_status,
            COUNT(*) as count
        FROM students 
        WHERE school_year = ?
        GROUP BY enrollment_status
    `, [year]);
    return stats;
};

exports.getTrendingData = async (monthCount) => {
    const [trendData] = await db.query(`
        SELECT 
            DATE_TRUNC(enrolled_at, MONTH) as month,
            COUNT(*) as count
        FROM admission_applications
        WHERE status = 'approved' 
            AND enrolled_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY DATE_TRUNC(enrolled_at, MONTH)
        ORDER BY month ASC
    `, [monthCount]);
    return trendData;
};

const db = require('../config/database');

// Generate daily enrollment report
const generateDailyReport = async (req, res) => {
    try {
        const { reportDate } = req.body;
        const date = reportDate || new Date().toISOString().split('T')[0];
        const schoolYear = '2025-2026';

        // Get statistics for the day
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

        // Insert report
        const [result] = await db.query(`
            INSERT INTO enrollment_reports 
            (report_type, report_date, school_year, total_enrollments, new_students, 
             returning_students, transferees, jhs_count, shs_count, generated_by)
            VALUES ('daily', ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            date, schoolYear,
            stats[0].total_enrollments || 0,
            stats[0].new_students || 0,
            stats[0].returning_students || 0,
            stats[0].transferees || 0,
            stats[0].jhs_count || 0,
            stats[0].shs_count || 0,
            req.user.userId
        ]);

        res.status(201).json({
            success: true,
            message: 'Daily report generated successfully',
            report: {
                reportId: result.insertId,
                date,
                ...stats[0]
            }
        });

    } catch (error) {
        console.error('Generate daily report error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to generate daily report'
        });
    }
};

// Generate monthly enrollment report
const generateMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.body;
        const currentYear = year || new Date().getFullYear();
        const currentMonth = month || (new Date().getMonth() + 1);
        const schoolYear = '2025-2026';

        // Get statistics for the month
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
        `, [currentYear, currentMonth]);

        const reportDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;

        // Insert report
        const [result] = await db.query(`
            INSERT INTO enrollment_reports 
            (report_type, report_date, school_year, total_enrollments, new_students, 
             returning_students, transferees, jhs_count, shs_count, generated_by)
            VALUES ('monthly', ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            reportDate, schoolYear,
            stats[0].total_enrollments || 0,
            stats[0].new_students || 0,
            stats[0].returning_students || 0,
            stats[0].transferees || 0,
            stats[0].jhs_count || 0,
            stats[0].shs_count || 0,
            req.user.userId
        ]);

        res.status(201).json({
            success: true,
            message: 'Monthly report generated successfully',
            report: {
                reportId: result.insertId,
                month: currentMonth,
                year: currentYear,
                ...stats[0]
            }
        });

    } catch (error) {
        console.error('Generate monthly report error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to generate monthly report'
        });
    }
};

// Generate yearly enrollment report
const generateYearlyReport = async (req, res) => {
    try {
        const { schoolYear } = req.body;
        const year = schoolYear || '2025-2026';

        // Get statistics for the year
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
        `, [year]);

        // Insert report
        const [result] = await db.query(`
            INSERT INTO enrollment_reports 
            (report_type, report_date, school_year, total_enrollments, new_students, 
             returning_students, transferees, jhs_count, shs_count, generated_by)
            VALUES ('yearly', CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            year,
            stats[0].total_enrollments || 0,
            stats[0].new_students || 0,
            stats[0].returning_students || 0,
            stats[0].transferees || 0,
            stats[0].jhs_count || 0,
            stats[0].shs_count || 0,
            req.user.userId
        ]);

        res.status(201).json({
            success: true,
            message: 'Yearly report generated successfully',
            report: {
                reportId: result.insertId,
                schoolYear: year,
                ...stats[0]
            }
        });

    } catch (error) {
        console.error('Generate yearly report error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to generate yearly report'
        });
    }
};

// Get all reports
const getAllReports = async (req, res) => {
    try {
        const { reportType, schoolYear } = req.query;

        let query = 'SELECT * FROM enrollment_reports WHERE 1=1';
        const params = [];

        if (reportType) {
            query += ' AND report_type = ?';
            params.push(reportType);
        }

        if (schoolYear) {
            query += ' AND school_year = ?';
            params.push(schoolYear);
        }

        query += ' ORDER BY generated_at DESC LIMIT 50';

        const [reports] = await db.query(query, params);

        res.json({
            success: true,
            count: reports.length,
            reports
        });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch reports'
        });
    }
};

// Get student statistics for chart
// Get student statistics for chart
const getStudentStatisticsChart = async (req, res) => {
    try {
        const { statType, schoolYear } = req.query;
        const year = schoolYear || '2025-2026';

        let chartData = [];

        if (statType === 'by_type') {
            // Student Type: regular, irregular, transferee
            const [stats] = await db.query(`
                SELECT 
                    student_type,
                    COUNT(*) as count
                FROM students 
                WHERE school_year = ?
                GROUP BY student_type
            `, [year]);

            chartData = stats.map(s => ({
                label: s.student_type ? s.student_type.charAt(0).toUpperCase() + s.student_type.slice(1) : 'Unknown',
                value: s.count || 0
            }));

        } else if (statType === 'by_level') {
            // JHS vs SHS
            const [stats] = await db.query(`
                SELECT 
                    school_level,
                    COUNT(*) as count
                FROM students 
                WHERE school_year = ?
                GROUP BY school_level
            `, [year]);

            chartData = stats.map(s => ({
                label: s.school_level,
                value: s.count || 0
            }));

        } else if (statType === 'by_grade') {
            // By grade level
            const [stats] = await db.query(`
                SELECT 
                    current_grade_level,
                    COUNT(*) as count
                FROM students 
                WHERE school_year = ?
                GROUP BY current_grade_level
                ORDER BY current_grade_level
            `, [year]);

            chartData = stats.map(s => ({
                label: `Grade ${s.current_grade_level}`,
                value: s.count || 0
            }));

        } else if (statType === 'by_status') {
            // By enrollment status
            const [stats] = await db.query(`
                SELECT 
                    enrollment_status,
                    COUNT(*) as count
                FROM students 
                WHERE school_year = ?
                GROUP BY enrollment_status
            `, [year]);

            chartData = stats.map(s => ({
                label: s.enrollment_status.replace(/_/g, ' ').toUpperCase(),
                value: s.count || 0
            }));
        } else {
            // Default: by_level if no statType specified
            const [stats] = await db.query(`
                SELECT 
                    school_level,
                    COUNT(*) as count
                FROM students 
                WHERE school_year = ?
                GROUP BY school_level
            `, [year]);

            chartData = stats.map(s => ({
                label: s.school_level,
                value: s.count || 0
            }));
        }

        res.json({
            success: true,
            chartType: 'pie',
            data: chartData
        });

    } catch (error) {
        console.error('Get chart statistics error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch chart data'
        });
    }
};


// Get trending data
const getTrendingData = async (req, res) => {
    try {
        const { months } = req.query;
        const monthCount = parseInt(months) || 6;

        // Get monthly enrollment trend
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

        res.json({
            success: true,
            trend: trendData
        });

    } catch (error) {
        console.error('Get trending data error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to fetch trending data'
        });
    }
};

module.exports = {
    generateDailyReport,
    generateMonthlyReport,
    generateYearlyReport,
    getAllReports,
    getStudentStatisticsChart,
    getTrendingData
};

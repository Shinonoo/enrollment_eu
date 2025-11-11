// controllers/reportsController.js - ONLY logic & responses
const ReportsModel = require('../models/reportsModel');

const generateDailyReport = async (req, res) => {
    try {
        const { reportDate } = req.body;
        const date = reportDate || new Date().toISOString().split('T')[0];
        const schoolYear = '2025-2026';

        const stats = await ReportsModel.getDailyStats(date);
        const result = await ReportsModel.insertDailyReport(date, schoolYear, stats, req.user.userId);

        res.status(201).json({
            success: true,
            message: 'Daily report generated successfully',
            report: {
                reportId: result.insertId,
                date,
                ...stats
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

const generateMonthlyReport = async (req, res) => {
    try {
        const { month, year } = req.body;
        const currentYear = year || new Date().getFullYear();
        const currentMonth = month || (new Date().getMonth() + 1);
        const schoolYear = '2025-2026';

        const stats = await ReportsModel.getMonthlyStats(currentYear, currentMonth);
        const reportDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const result = await ReportsModel.insertMonthlyReport(reportDate, schoolYear, stats, req.user.userId);

        res.status(201).json({
            success: true,
            message: 'Monthly report generated successfully',
            report: {
                reportId: result.insertId,
                month: currentMonth,
                year: currentYear,
                ...stats
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

const generateYearlyReport = async (req, res) => {
    try {
        const { schoolYear } = req.body;
        const year = schoolYear || '2025-2026';

        const stats = await ReportsModel.getYearlyStats(year);
        const result = await ReportsModel.insertYearlyReport(year, stats, req.user.userId);

        res.status(201).json({
            success: true,
            message: 'Yearly report generated successfully',
            report: {
                reportId: result.insertId,
                schoolYear: year,
                ...stats
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

const getAllReports = async (req, res) => {
    try {
        const { reportType, schoolYear } = req.query;

        const reports = await ReportsModel.getAllReports({
            reportType,
            schoolYear
        });

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

const getStudentStatisticsChart = async (req, res) => {
    try {
        const { statType, schoolYear } = req.query;
        const year = schoolYear || '2025-2026';

        let stats = [];
        let chartData = [];

        if (statType === 'by_type') {
            stats = await ReportsModel.getStatsByType(year);
            chartData = stats.map(s => ({
                label: s.student_type ? s.student_type.charAt(0).toUpperCase() + s.student_type.slice(1) : 'Unknown',
                value: s.count || 0
            }));
        } else if (statType === 'by_level') {
            stats = await ReportsModel.getStatsByLevel(year);
            chartData = stats.map(s => ({
                label: s.school_level,
                value: s.count || 0
            }));
        } else if (statType === 'by_grade') {
            stats = await ReportsModel.getStatsByGrade(year);
            chartData = stats.map(s => ({
                label: `Grade ${s.current_grade_level}`,
                value: s.count || 0
            }));
        } else if (statType === 'by_status') {
            stats = await ReportsModel.getStatsByStatus(year);
            chartData = stats.map(s => ({
                label: s.enrollment_status.replace(/_/g, ' ').toUpperCase(),
                value: s.count || 0
            }));
        } else {
            stats = await ReportsModel.getStatsByLevel(year);
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

const getTrendingData = async (req, res) => {
    try {
        const { months } = req.query;
        const monthCount = parseInt(months) || 6;

        const trendData = await ReportsModel.getTrendingData(monthCount);

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

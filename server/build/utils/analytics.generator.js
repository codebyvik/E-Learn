"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOneYearData = void 0;
async function generateOneYearData(model) {
    const lastOneYearData = [];
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    for (let i = 11; i >= 0; i--) {
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - i * 28);
        const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 28);
        const monthYear = endDate.toLocaleDateString("default", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        const count = await model.countDocuments({
            createdAt: {
                $gte: startDate,
                $lt: endDate,
            },
        });
        lastOneYearData.push({
            month: monthYear,
            count,
        });
    }
    return { lastOneYearData };
}
exports.generateOneYearData = generateOneYearData;

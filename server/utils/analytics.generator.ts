import { Document, Model } from "mongoose";

interface MonthData {
  month: string;
  count: number;
}

export async function generateOneYearData<T extends Document>(
  model: Model<T>
): Promise<{ lastOneYearData: MonthData[] }> {
  const lastOneYearData: MonthData[] = [];
  const currentDate = new Date();
  //   currentDate.setDate(currentDate.getDate() + 1);

  for (let i = 11; i >= 0; i--) {
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - i * 28
    );

    const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 28);

    const monthYear = endDate.toLocaleDateString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const count = await model.countDocuments({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    lastOneYearData.push({
      month: monthYear,
      count,
    });
  }

  return { lastOneYearData };
}

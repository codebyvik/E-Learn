import React from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, Label, YAxis, LabelList } from "recharts";
import Loader from "../../Loader/Loader";
import { Styles } from "../../../styles/style";
import { useGetCoursesAnalyticsQuery } from "@/redux/features/analytics/analytics.api";

type Props = {};

const CourseAnalytics = (props: Props) => {
  const { data, isLoading } = useGetCoursesAnalyticsQuery({});

  const analyticsData: any = [];

  data &&
    data.courses.lastOneYearData.forEach((item: any) => {
      analyticsData.push({ name: item.month, uv: item.count });
    });

  const minValue = 0;

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="h-screen">
          <div className="mt-[50px]">
            <h1 className={`${Styles.title} px-5 !text-start`}>Courses Analytics</h1>
            <p className={`${Styles.label} px-5`}>Last 12 months analytics data </p>
          </div>

          <div className="w-full h-[90%] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="50%">
              <BarChart width={250} height={300} data={analyticsData}>
                <XAxis dataKey="name">
                  <Label offset={0} position="insideBottom" />
                </XAxis>
                <YAxis domain={[minValue, "auto"]} />
                <Bar dataKey="uv" fill="#3faf82">
                  <LabelList dataKey="uv" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseAnalytics;

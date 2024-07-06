"use client";
import { FC } from "react";
import Header from "../utils/header";

import { Toaster } from "react-hot-toast";
import AdminProtected from "../hooks/adminProtected";
import AdminSidebar from "../components/Admin/sidebar/adminSidebar";
import DashboardHero from "../components/Admin/dashboardHero";
type Props = {};

const Page: FC<Props> = (props) => {
  return (
    <div>
      <AdminProtected>
        <Header
          title={`E-Learn Admin`}
          description="E-Learning platform for students to learn and get help"
          keywords="Programming , MERN , REDUX ,Machine Learning"
        />

        <Toaster position="top-center" reverseOrder={false} />
        <div className="flex h-[200vh]">
          <div className="1500px:w-[16%] w-[1/5]">
            <AdminSidebar />
          </div>
          <div className="w-[85%]">
            <DashboardHero isDashboard={true} />
          </div>
        </div>
      </AdminProtected>
    </div>
  );
};

export default Page;

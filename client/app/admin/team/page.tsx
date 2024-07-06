"use client";
import AllUsers from "../../components/Admin/users/allUsers";
import React from "react";
import AdminSidebar from "../../components/Admin/sidebar/adminSidebar";
import DashboardHero from "../../components/Admin/dashboardHero";
import AdminProtected from "../..//hooks/adminProtected";
import { Toaster } from "react-hot-toast";
import Header from "../../utils/header";

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <AdminProtected>
        <Header
          title="Elearning - Admin"
          description="ELearning is a platform for students to learn and get help from teachers"
          keywords="Programming,MERN,Redux,Machine Learning"
        />
        <Toaster position="top-center" reverseOrder={false} />
        <div className="flex h-screen">
          <div className="1500px:w-[16%] w-1/5">
            <AdminSidebar />
          </div>
          <div className="w-[85%]">
            <DashboardHero />
            <AllUsers isTeam={true} />
          </div>
        </div>
      </AdminProtected>
    </div>
  );
};

export default page;

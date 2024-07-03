"use client";
import React from "react";
import AdminSidebar from "../../components/Admin/sidebar/adminSidebar";
import DashboardHeader from "../../../app/components/Admin/DashboardHeader";
import Header from "../../utils/header";
import CreateCourse from "@/app/components/Admin/course/createCourse";
import { Toaster } from "react-hot-toast";

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <Header
        title="E-learn - Admin"
        description="ELearning is a platform for students to learn and get help from teachers"
        keywords="Prograaming,MERN,Redux,Machine Learning"
      />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex">
        <div className="1500px:w-[16%] w-1/5">
          <AdminSidebar />
        </div>
        <div className="w-[85%]">
          <DashboardHeader />
          <CreateCourse />
        </div>
      </div>
    </div>
  );
};

export default page;

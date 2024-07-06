"use client";
import React from "react";
import AdminSidebar from "../../components/Admin/sidebar/adminSidebar";
import Header from "../../utils/header";
import DashboardHeader from "../../../app/components/Admin/DashboardHeader";
import AllInvoices from "../../../app/components/Admin/orders/all_Invoices";

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <Header
        title="Elearning - Admin"
        description="ELearning is a platform for students to learn and get help from teachers"
        keywords="Prograaming,MERN,Redux,Machine Learning"
      />
      <div className="flex">
        <div className="1500px:w-[16%] w-1/5">
          <AdminSidebar />
        </div>
        <div className="w-[85%]">
          <DashboardHeader />
          <AllInvoices />
        </div>
      </div>
    </div>
  );
};

export default page;

"use client";
import React, { useState } from "react";
import Header from "../utils/header";
import Head from "../components/Head";
import Footer from "../components/footer";
import Policy from "./policy";

type Props = {};

const Page = (props: Props) => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(3);
  const [route, setRoute] = useState("Login");

  return (
    <div>
      <Header
        title="Policy - Elearn"
        description="Elearning is a learning management system for helping programmers."
        keywords="programming,mern"
      />
      <Head
        open={open}
        setOpen={setOpen}
        activeItem={activeItem}
        setRoute={setRoute}
        route={route}
      />
      <Policy />
      <Footer />
    </div>
  );
};

export default Page;

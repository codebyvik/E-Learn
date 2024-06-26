"use client";
import React, { FC, useState } from "react";
import Header from "./utils/header";
import Head from "./components/Head";
import Hero from "./components/routes/Hero";
import { Toaster } from "react-hot-toast";

interface Props {}

const Page: FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const [route, setRoute] = useState("Login");

  return (
    <>
      <Header
        title="E-Learn"
        description="E-Learning platform for students to learn and get help"
        keywords="Programming , MERN , REDUX ,Machine Learning"
      />
      <Head
        open={open}
        setOpen={setOpen}
        activeItem={activeItem}
        route={route}
        setRoute={setRoute}
      />
      <Toaster position="top-center" reverseOrder={false} />
      <Hero />
    </>
  );
};

export default Page;

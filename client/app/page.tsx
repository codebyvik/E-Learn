"use client";
import React, { FC, useState } from "react";
import Header from "./utils/header";
import Head from "./components/Head";
import Hero from "./components/routes/Hero";

interface Props {}

const Page: FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

  return (
    <>
      <Header
        title="E-Learn"
        description="E-Learning platform for students to learn and get help"
        keywords="Programming , MERN , REDUX ,Machine Learning"
      />
      <Head open={open} setOpen={setOpen} activeItem={activeItem} />
      <Hero />
    </>
  );
};

export default Page;

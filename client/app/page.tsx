"use client";
import React, { FC, useState } from "react";
import Header from "./utils/header";
import Head from "./components/Head";

interface Props {}

const Page: FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);

  return (
    <div>
      <Header
        title="E-Learn"
        description="E-Learning platform for students to learn and get help"
        keywords="Programming , MERN , REDUX ,Machine Learning"
      />
      <Head open={open} setOpen={setOpen} activeItem={activeItem} />
    </div>
  );
};

export default Page;

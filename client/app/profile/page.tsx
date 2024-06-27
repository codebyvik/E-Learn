"use client";
import { FC, useState } from "react";
import Protected from "../hooks/useProtected";
import Header from "../utils/header";
import Head from "../components/Head";
import Profile from "../components/profile/profile";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
type Props = {};

const Page: FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(5);
  const [route, setRoute] = useState("Login");
  const { user } = useSelector((state: any) => state.auth);

  return (
    <div>
      <Protected>
        <Header
          title={`${user.name} profile - E-Learn`}
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
        <Profile user={user} />
      </Protected>
    </div>
  );
};

export default Page;

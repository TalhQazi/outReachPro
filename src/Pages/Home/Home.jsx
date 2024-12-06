import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GrGraphQl } from "react-icons/gr";
import { MdEmail } from "react-icons/md";
import { BsGraphUpArrow } from "react-icons/bs";

const Home = () => {
  const [userData, setUserdata] = useState({});

  const navigate = useNavigate();
  useEffect(() => {
    const data = sessionStorage.getItem("data");
    const id = sessionStorage.getItem("id");

    if (!id) {
      navigate("/login");
    }
  }, []);

  const { name } = userData;

  return (
    <>
      <main className="flex items-center mx-4 mt-8 mb-8 text-4xl">
        <GrGraphQl className="text-green-700 text-8xl" />
        <div className="ml-6">
          <h1 className="text-[2rem] font-semibold ">OutReachPro</h1>
          <h1 className="mt-3 ml-2 text-xl">Email Merge App Gmail</h1>
        </div>
      </main>
      <Link to={"/send"}>
        <button className="inline-flex items-center w-full gap-5 p-6 text-3xl text-left border-t-2 border-b-2 ">
          <MdEmail className="text-5xl text-green-700 " />
          <p className="flex flex-col gap-1">
            Start Your Campaign{" "}
            <span className="text-base">Send your Mail</span>
          </p>
        </button>
      </Link>
      <Link to={"/tracking"}>
        <button className="inline-flex items-center w-full gap-5 p-6 text-3xl text-left border-b-2 ">
          <BsGraphUpArrow className="text-5xl text-green-700 " />
          <p className="flex flex-col gap-1">
            Compaign Tracking Report{" "}
            <span className="text-base">Moniter Your Compaign Success</span>
          </p>
        </button>
      </Link>
    </>
  );
};

export default Home;

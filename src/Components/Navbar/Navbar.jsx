import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiDotsVertical } from "react-icons/hi";
import { BsArrowLeft } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import {jwtDecode} from "jwt-decode";

const Navbar = () => {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const id = sessionStorage.getItem("id");
    const data = sessionStorage.getItem("data");
    if (id && data) {
      const userdata = jwtDecode(data);
      setUser(userdata.name);
      setEmail(userdata.email);
      sessionStorage.setItem("email", userdata.email);
    }
  }, []);

  const logOut = () => {
    sessionStorage.clear();
    alert("Session has been Logout");
    navigate("/login");
    window.location.reload();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.9, y: -10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <nav className="flex items-center justify-between w-full h-24 px-6 bg-green-600">
      <main className="flex items-center gap-3">
        <BsArrowLeft
          className="text-4xl text-white cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h1 className="text-3xl text-white">OutReachPro</h1>
      </main>
      <main>
        {sessionStorage.getItem("id") ? (
          <div className="relative">
            <button onClick={toggleDropdown}>
              <HiDotsVertical className="text-3xl text-white" />
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  className="absolute right-0 z-10 w-[24rem] mt-2 bg-white text-2xl border rounded-lg shadow-lg"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="p-4">
                    <h2 className="mb-4 font-semibold">User Information</h2>
                    <p>Name: {user}</p>
                    <p>Email: {email}</p>
                  </div>
                  <Link to={"/draft"}>
                    <button
                      onClick={toggleDropdown}
                      className="block w-full px-4 py-6 text-left border-2 hover:bg-gray-300"
                    >
                      Draft
                    </button>
                  </Link>
                  <Link to={"/test"}>
                    <button
                      onClick={toggleDropdown}
                      className="block w-full px-4 py-6 text-left border-2 hover:bg-gray-300"
                    >
                      Test / Preview
                    </button>
                  </Link>
                  <Link to={"/bcc"}>
                    <button
                      onClick={toggleDropdown}
                      className="block w-full px-4 py-6 text-left border-2 hover:bg-gray-300"
                    >
                      Add CC / BCC Columns
                    </button>
                  </Link>
                  <Link to={"/send"}>
                    <button
                      onClick={toggleDropdown}
                      className="block w-full px-4 py-6 text-left border-2 hover:bg-gray-300"
                    >
                      Add Files
                    </button>
                  </Link>
                  <Link to={"/send/responde"}>
                    <button
                      onClick={toggleDropdown}
                      className="block w-full px-4 py-6 text-left border-2 hover:bg-gray-300"
                    >
                      Reply To
                    </button>
                  </Link>
                  <button
                    onClick={() => window.location.reload()}
                    className="block w-full px-4 py-6 text-left border-2 hover:bg-gray-300"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={logOut}
                    className="block w-full px-4 py-6 text-left border-2 hover:bg-gray-300"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="relative">
            <button onClick={toggleDropdown}>
              <HiDotsVertical className="text-3xl text-white" />
            </button>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  className="absolute right-0 z-10 w-[20rem] mt-2 bg-white border rounded-lg shadow-lg"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Link to={"/"}>
                    <button
                      onClick={toggleDropdown}
                      className="block w-full px-4 py-6 text-3xl text-left border-b hover:bg-gray-200"
                    >
                      Contact Option
                    </button>
                  </Link>
                  <Link to={"/login"}>
                    <button
                      onClick={toggleDropdown}
                      className="block w-full px-4 py-6 text-3xl text-left border-b hover:bg-gray-200"
                    >
                      Login
                    </button>
                  </Link>
                  <button
                    onClick={toggleDropdown}
                    className="block w-full px-4 py-6 text-3xl text-left hover:bg-gray-200"
                  >
                    Refresh
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </nav>
  );
};

export default Navbar;

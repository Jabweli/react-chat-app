import React, { useState } from "react";
import styles from "./login.module.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";

function Login() {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [avatar, setAvatar] = useState({
    file: "",
    url: "",
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      let avatarUrl;
      if (avatar.file) {
        avatarUrl = await upload(avatar.file);
      } else {
        avatarUrl = "";
      }

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: avatarUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      if (res) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Welcome Account created!");
      }

      // window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData(e.target);

    const { email, password } = Object.fromEntries(formData);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (res) {
        toast.success("Logged in successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.container}>
      {/* login form */}
      {isLogin ? (
        <div className={styles.left}>
          <h2>Welcome back 👋</h2>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              name="email"
              className={styles.formControl}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              className={styles.formControl}
            />
            <button disabled={loading} type="submit" className={styles.button}>
              {loading ? "Submitting..." : "Sign In"}
            </button>
          </form>
          <p className={styles.loginText}>
            Don't have an account?{" "}
            <span role="button" onClick={() => setIsLogin(false)}>
              Sign Up
            </span>
          </p>
        </div>
      ) : (
        <div className={styles.right}>
          <h2>Create Account</h2>
          <form onSubmit={handleRegister}>
            <label htmlFor="file">
              <img
                src={avatar.url || "./avatar.png"}
                alt=""
                className={styles.imgPreview}
              />
              Upload Image
            </label>
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleAvatar}
            />
            <input
              type="text"
              placeholder="Username"
              name="username"
              className={styles.formControl}
            />
            <input
              type="email"
              placeholder="Email"
              name="email"
              className={styles.formControl}
            />
            <input
              type="password"
              placeholder="Password"
              name="password"
              className={styles.formControl}
            />
            <button disabled={loading} type="submit" className={styles.button}>
              {loading ? "Submitting..." : "Sign Up"}
            </button>
          </form>
          <p className={styles.loginText}>
            Have an account?{" "}
            <span role="button" onClick={() => setIsLogin(true)}>
              Sign In
            </span>
          </p>
        </div>
      )}

      {/* <div className={styles.separator}></div> */}
    </div>
  );
}

export default Login;

import React, { useEffect, useRef } from "react";
import styles from "./detail.module.css";
import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useShowStore } from "../../lib/isShow";

function Detail() {
  const currentUser = useUserStore((state) => state.currentUser);
  const user = useChatStore((state) => state.user);
  const isCurrentUserBlocked = useChatStore(
    (state) => state.isCurrentUserBlocked
  );
  const isReceiverBlocked = useChatStore((state) => state.isReceiverBlocked);
  const changeBlock = useChatStore((state) => state.changeBlock);
  const clearChat = useChatStore((state) => state.clearChat);

  // toggle the detail component on small screens
  const isShown = useShowStore((state) => state.isShown);
  const closeShow = useShowStore((state) => state.closeShow);
  const detailRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (detailRef.current && !detailRef.current.contains(event.target)) {
        closeShow();
      }
    }

    if (isShown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShown, closeShow]);

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      ref={detailRef}
      className={`${styles.detail} ${isShown ? styles.show : ""}`}
    >
      <div className={styles.user}>
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${user?.username}&background=random`
          }
          alt=""
        />
        <h2>{user?.username}</h2>
        <p>
          {isCurrentUserBlocked
            ? "You are blocked  🔏!"
            : "Lorem ipsum dolor sit amet."}
        </p>
      </div>

      <div className={styles.info}>
        <div className={styles.option}>
          <div className={styles.title}>
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className={styles.option}>
          <div className={styles.title}>
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className={styles.option}>
          <div className={styles.title}>
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className={styles.option}>
          <div className={styles.title}>
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>

          <div className={styles.photos}>
            <div className={styles.photoItem}>
              <div className={styles.photoDetail}>
                <img src="./v-camera.jpg" alt="" />
                <span>Vide Camera</span>
              </div>
              <img src="./download.png" alt="" className={styles.icon} />
            </div>
            <div className={styles.photoItem}>
              <div className={styles.photoDetail}>
                <img src="./v-camera.jpg" alt="" />
                <span>Vide Camera</span>
              </div>
              <img src="./download.png" alt="" className={styles.icon} />
            </div>
          </div>
        </div>

        <div className={styles.option}>
          <div className={styles.title}>
            <span>Shared files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <button type="button" className={styles.blockBtn} onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are blocked!"
            : isReceiverBlocked
            ? "User Blocked | Unblock"
            : "Block User"}
        </button>

        <button
          type="button"
          className={styles.logoutBtn}
          onClick={() => {
            auth.signOut();
            clearChat();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Detail;

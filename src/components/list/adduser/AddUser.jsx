import { toast } from "react-toastify";
import styles from "./adduser.module.css";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useState } from "react";
import { useUserStore } from "../../../lib/userStore";

function AddUser() {
  const [user, setUser] = useState(null);

  const currentUser = useUserStore((state) => state.currentUser);

  const handleSearch = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      } else {
        toast.error("Could not find user");
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not find user");
    }
  };

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.addUser}>
      <form onSubmit={handleSearch}>
        <div className={styles.form}>
          <input type="text" placeholder="Username" name="username" />
          <button type="submit">Search</button>
        </div>
      </form>

      {user && (
        <div className={styles.user}>
          <div className={styles.detail}>
            <img
              src={
                user.avatar ||
                `https://ui-avatars.com/api/?name=${user.username}&background=random`
              }
              alt={user.username}
            />
            <span>{user.username}</span>
          </div>
          <button type="button" onClick={handleAdd}>
            Add User
          </button>
        </div>
      )}
    </div>
  );
}

export default AddUser;

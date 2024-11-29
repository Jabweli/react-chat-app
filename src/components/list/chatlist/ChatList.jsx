import React, { useEffect, useState } from "react";
import "./chatlist.css";
import AddUser from "../adduser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useChatStore } from "../../../lib/chatStore";
import LoadingSpinner from "../../LoadingSpinner/Loading";

dayjs.extend(relativeTime);

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const currentUser = useUserStore((state) => state.currentUser);
  const changeChat = useChatStore((state) => state.changeChat);
  const chatId = useChatStore((state) => state.chatId);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    if (unSub) {
      setIsLoading(false);
    }

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  // console.log("Chats => ", chats);

  const handleSelect = async (chat) => {
    // update isSeen for selected chat
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;
    const userChatRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className={`chatlist ${chatId ? "hide" : ""}`}>
      <div className="search">
        <div className="searchbar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : chats && chats.length > 0 ? (
        filteredChats.map((chat, index) => (
          <div
            className="item"
            key={index}
            onClick={() => handleSelect(chat)}
            style={{
              backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
            }}
          >
            <img
              src={
                chat.user.avatar ||
                `https://ui-avatars.com/api/?name=${chat.user.username}&background=random`
              }
              alt=""
            />
            <div className="texts">
              <span>{chat.user.username}</span>
              <p>{chat?.lastMessage}</p>
              <span className="time">{dayjs(chat.updatedAt).fromNow()}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="no-chat-item">
          <p className="no-chat-text">No chats available</p>
        </div>
      )}

      {addMode && <AddUser />}
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { PaperAirplaneIcon } from "@heroicons/react/16/solid";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useShowStore } from "../../lib/isShow";

dayjs.extend(relativeTime);

const format = "MMMM D, YYYY [at] h:mm:ss A [UTC]Z";

export default function Chat() {
  // toggle the detail component on small screens
  const toggleShow = useShowStore((state) => state.toggleShow);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chatImg, setChatImg] = useState({
    file: null,
    url: "",
  });
  const [chat, setChat] = useState(null);

  const currentUser = useUserStore((state) => state.currentUser);
  const chatId = useChatStore((state) => state.chatId);
  const clearChat = useChatStore((state) => state.clearChat);
  const receiverUser = useChatStore((state) => state.user);
  const isCurrentUserBlocked = useChatStore(
    (state) => state.isCurrentUserBlocked
  );
  const isReceiverBlocked = useChatStore((state) => state.isReceiverBlocked);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setChatImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleSend = async () => {
    if (text === "") return;

    let imgUrl = null;

    try {
      if (chatImg.file) {
        imgUrl = await upload(chatImg.file);
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: Date.now(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, receiverUser.id];

      userIDs.forEach(async (id) => {
        const userDocRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userDocRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userDocRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      setText("");
      setChatImg({
        file: null,
        url: "",
      });
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // console.log(chat?.messages);

  return (
    <div className={`chat ${chatId ? "show" : ""}`}>
      <div className="top">
        <div className="user">
          <button
            type="button"
            className="back-btn"
            onClick={() => clearChat()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </button>

          <img
            src={`https://ui-avatars.com/api/?name=${receiverUser?.username}&background=random`}
            alt=""
          />
          <div className="texts">
            <h2>{receiverUser?.username}</h2>
            <p>Lorem ipsum.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" onClick={() => toggleShow()} />
        </div>
      </div>

      <div className="center">
        {chat?.messages && chat?.messages?.length > 0 ? (
          chat?.messages?.map((message, index) => (
            <div
              className={`message ${
                message.senderId === currentUser.id ? "own" : ""
              }`}
              key={message?.createdAt + index}
            >
              <div className="texts">
                {message.img && <img src={message.img} alt="" />}

                <p>{message.text}</p>
                <span>{dayjs(message.createdAt).fromNow()}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">No messages !!!</div>
        )}

        {chatImg.url && (
          <div className="message own">
            <div className="texts">
              <img src={chatImg.url} alt="" />
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <label htmlFor="chat-image">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="chat-image"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          {/* <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" /> */}
        </div>
        <div className="input-container">
          <input
            type="text"
            placeholder={
              isCurrentUserBlocked || isReceiverBlocked
                ? "Chat is disabled"
                : "Type a message..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
          <div className="emoji-container">
            <div className="emoji">
              {!isCurrentUserBlocked && !isReceiverBlocked && (
                <img
                  src="./emoji.png"
                  alt=""
                  onClick={() => setOpen((prev) => !prev)}
                />
              )}

              <div className="picker">
                <EmojiPicker open={open} onEmojiClick={handleEmoji} />
              </div>
            </div>
          </div>
        </div>

        <button
          className="sendBtn"
          type="button"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send <PaperAirplaneIcon className="send-icon" />
        </button>
      </div>
    </div>
  );
}

import React from "react";
import "./userinfo.css";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { useShowStore } from "../../../lib/isShow";

function UserInfo() {
  // toggle the detail component on small screens
  const toggleShow = useShowStore((state) => state.toggleShow);
  const user = useUserStore((state) => state.currentUser);
  const chatId = useChatStore((state) => state.chatId);
  return (
    <div className={`userInfo ${chatId ? "hide" : ""}`}>
      <div className="user">
        <img
          src={
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${user.username}&background=random`
          }
          alt=""
        />
        <div>
          <h2>{user.username}</h2>
          <span className="email">{user.email}</span>
        </div>
      </div>
      <div className="icons">
        <img
          src="./info.png"
          alt=""
          className="info-icon"
          onClick={() => toggleShow()}
        />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  );
}

export default UserInfo;

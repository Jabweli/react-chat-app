import React from "react";
import "./list.css";
import UserInfo from "./userinfo/UserInfo";
import ChatList from "./chatlist/ChatList";
// import { useChatStore } from "../../../lib/chatStore";

export default function List() {
  // const chatId = useChatStore((state) => state.chatId);
  return (
    <div className={`list`}>
      <UserInfo />
      <ChatList />
    </div>
  );
}

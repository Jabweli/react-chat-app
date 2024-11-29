import React from "react";
import UserInfo from "./userinfo/UserInfo";
import ChatList from "./chatlist/ChatList";
import { useChatStore } from "../../lib/chatStore";

export default function ListContainer() {
  const chatId = useChatStore((state) => state.chatId);
  return (
    <div className={`list ${chatId ? "hide" : ""}`}>
      <UserInfo />
      <ChatList />
    </div>
  );
}

import React from "react";
import "./chat.css";

export default function EmptyChat() {
  return (
    <div className="empty-chat">
      <img src="./3d-chat.webp" alt="" style={{ width: 250, height: 250 }} />
      <p>Select a converstion to chat!</p>
    </div>
  );
}

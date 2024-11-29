import { useEffect, useState } from "react";
import List from "./components/list/List";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import EmptyChat from "./components/chat/EmptyChat";
import ListContainer from "./components/list/ListContainer";
import LoadingSpinner from "./components/LoadingSpinner/Loading";

function App() {
  const currentUser = useUserStore((state) => state.currentUser);
  const isLoading = useUserStore((state) => state.isLoading);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);

  const chatId = useChatStore((state) => state.chatId);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <LoadingSpinner isBg={true} />;

  return (
    <div className="container">
      {currentUser ? (
        <>
          <ListContainer />
          {chatId ? <Chat /> : <EmptyChat />}
          <Detail />
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
}

export default App;

import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import { Modal } from "@/components/Modal";
import { ChatManagement } from "@/core/ChatManagement";
import { ChatList } from "@/components/ChatList";
import { Layout, theme } from "antd";
import { Setting } from "@/components/Setting";
import { Chat } from "@/components/Chat";

export default function Home() {
  const { token } = theme.useToken();
  const [chatMgt, setChatMgt] = useState<ChatManagement>();
  const [settingIsShow, setSettingShow] = useState(false);
  const [listIsShow, setlistIsShow] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  let init = useCallback(async () => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    setWindowWidth(window.innerWidth || 0);
    window.addEventListener("resize", handleResize);
    await ChatManagement.load().then(() => {
      let chats = ChatManagement.getGroups();
      if (chats.length == 0) return;
      setChatMgt(new ChatManagement(chats[0]));
    });
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [init]);

  return (
    <Layout
      style={{
        display: "flex",
        height: "100%",
        flexDirection: "row",
        maxHeight: "100%",
        flexWrap: "nowrap",
        color: token.colorTextBase,
        backgroundColor: token.colorBgContainer,
      }}
    >
      <Head>
        <title>助手 bot</title>
      </Head>
      {chatMgt ? (
        <Chat
          chat={chatMgt}
          setSettingShow={setSettingShow}
          setlistIsShow={() => {
            setlistIsShow((v) => !v);
          }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            height: "100%",
            maxHeight: "100%",
          }}
        ></div>
      )}

      {windowWidth > 1420 && listIsShow ? (
        <ChatList
          onCacle={() => {
            setlistIsShow(false);
          }}
          onSelected={(mgt) => {
            setChatMgt(new ChatManagement(mgt));
            setlistIsShow(false);
          }}
        ></ChatList>
      ) : (
        <></>
      )}

      <Modal
        isShow={settingIsShow}
        onCancel={() => {
          setSettingShow(false);
        }}
      >
        <Setting
          onCancel={() => {
            setSettingShow(false);
          }}
          onSaved={() => {
            setChatMgt(new ChatManagement(chatMgt!));
            setSettingShow(false);
          }}
          chatMgt={chatMgt}
        ></Setting>
      </Modal>
      <Modal
        isShow={listIsShow && windowWidth <= 1420}
        onCancel={() => {
          setlistIsShow(false);
        }}
      >
        <ChatList
          onCacle={() => {
            setlistIsShow(false);
          }}
          onSelected={(mgt) => {
            setChatMgt(new ChatManagement(mgt));
            setlistIsShow(false);
          }}
        ></ChatList>
      </Modal>
    </Layout>
  );
}

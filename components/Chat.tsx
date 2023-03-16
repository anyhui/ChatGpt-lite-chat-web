import { ChatManagement } from "@/core/ChatManagement";
import { ChatMessage } from "@/components/ChatMessage";
import { useEffect, useState } from "react";
import {
  SettingOutlined,
  UnorderedListOutlined,
  MessageOutlined,
  CommentOutlined,
  VerticalAlignMiddleOutlined,
} from "@ant-design/icons";
import style from "../styles/index.module.css";
import {
  Layout,
  Button,
  Input,
  Space,
  Checkbox,
  Select,
  theme,
  Typography,
} from "antd";
import React from "react";
import { KeyValueData } from "@/core/KeyValueData";
import { Message } from "@/Models/DataBase";
import { sendMessageToChatGpt } from "@/core/apiClient";
const { Content } = Layout;

export const Chat = ({
  chat,
  setlistIsShow,
  setSettingShow,
}: {
  chat: ChatManagement;
  setlistIsShow: (b: boolean) => void;
  setSettingShow: (b: boolean) => void;
}) => {
  const inputRef = React.createRef<HTMLInputElement>();
  const { token } = theme.useToken();
  const [chatMgt, setChatMgt] = useState<ChatManagement[]>([chat]);
  const [loading, setLoading] = useState(false);
  const [messageInput, setmessageInput] = useState("");
  function deleteChatMsg(msg: Message): void {
    chat.removeMessage(msg).then(() => {
      setChatMgt([...chatMgt]);
    });
  }
  /**
   * 提交内容
   * @param isPush 是否对话模式
   * @returns
   */
  async function onSubmit(isPush: boolean) {
    if (!messageInput.trim() && !chat.config.enableVirtualRole) return;
    if (!isPush) chat.newTopic(messageInput);
    await chat.pushMessage(messageInput, false);
    setmessageInput("");
    setLoading(true);
    await sendMessage(chat);
    setChatMgt([...chatMgt]);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }
  let closeAllTopic: () => void = () => {};
  const onTextareaTab = (
    start: number,
    end: number,
    textarea: EventTarget & HTMLTextAreaElement
  ) => {
    setmessageInput((v) => v.substring(0, start) + "    " + v.substring(start));
    setTimeout(() => {
      textarea.selectionStart = start + 4;
      textarea.selectionEnd = end + 4;
    }, 0);
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        height: "100%",
        maxHeight: "100%",
      }}
    >
      <div
        style={{
          flexWrap: "nowrap",
          gap: "10px",
          width: "100%",
          justifyContent: "flex-end",
          display: "flex",
          alignItems: "center",
          marginBottom: "3px",
          padding: "10px 10px 10px",
        }}
      >
        <Select
          style={{ width: "160px" }}
          defaultValue={chat?.gptConfig.model || models[0]}
          options={models.map((v) => ({ value: v, label: v }))}
        />
        <span style={{ flex: 1 }}></span>
        <Checkbox
          checked={chat?.config.enableVirtualRole}
          onChange={(e) => {
            chat!.config.enableVirtualRole = e.target.checked;
            setChatMgt([...chatMgt]);
          }}
        >
          {"助理"}
        </Checkbox>
        <SettingOutlined onClick={() => setSettingShow(true)} />
        <UnorderedListOutlined
          onClick={() => {
            setlistIsShow(true);
          }}
          style={{ marginLeft: "10px", marginRight: "10px" }}
        />
      </div>
      <Content id="content" style={{ overflow: "auto" }}>
        <ChatMessage
          chat={chat}
          onDel={(m) => {
            deleteChatMsg(m);
          }}
          rBak={(v) => {
            setmessageInput((m) => (m ? m + "\n\n" : m) + v.text);
            inputRef.current?.focus();
          }}
          handerCloseAll={(cb) => (closeAllTopic = cb)}
        />
      </Content>
      <div className={style.loading}>
        {loading ? (
          <div className={style.loading}>
            {[0, 1, 2, 3, 4].map((v) => (
              <div
                key={v}
                style={{ backgroundColor: token.colorPrimary }}
                className={style.loadingBar}
              ></div>
            ))}
          </div>
        ) : (
          <div className={style.loading}></div>
        )}
      </div>
      <div style={{ width: "100%", padding: "0px 10px 25px" }}>
        <div
          style={{
            flexWrap: "nowrap",
            gap: "10px",
            width: "100%",
            justifyContent: "flex-end",
            display: "flex",
            alignItems: "center",
            marginBottom: "3px",
          }}
        >
          <Typography.Text
            style={{ marginRight: "20px", maxWidth: "40vw" }}
            ellipsis={true}
          >
            {chat.topic.filter((f) => f.id === chat.activityTopicId)[0].name}
          </Typography.Text>
          <span style={{ flex: 1 }}></span>
          <Button
            shape="round"
            size="small"
            onClick={() => {
              closeAllTopic();
            }}
          >
            <CommentOutlined />
            <VerticalAlignMiddleOutlined />
          </Button>
          <Button
            shape="circle"
            icon={<CommentOutlined />}
            onClick={() => onSubmit(false)}
          ></Button>
          <Button
            shape="circle"
            icon={<MessageOutlined />}
            onClick={() => onSubmit(true)}
          ></Button>
        </div>
        <div style={{ width: "100%" }}>
          <Input.TextArea
            placeholder="Alt s 继续  Ctrl Enter新话题"
            autoSize
            allowClear
            ref={inputRef}
            autoFocus={true}
            value={messageInput}
            onChange={(e) => setmessageInput(e.target.value)}
            onKeyUp={(e) =>
              (e.key === "s" && e.altKey && onSubmit(true)) ||
              (e.key === "Enter" && e.ctrlKey && onSubmit(false))
            }
            onKeyDown={(e) =>
              e.key === "Tab" &&
              (e.preventDefault(),
              onTextareaTab(
                e.currentTarget?.selectionStart,
                e.currentTarget?.selectionEnd,
                e.currentTarget
              ))
            }
          />
        </div>
      </div>
    </div>
  );
};

let models = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-0301",
  // "text-davinci-003",
  // "text-davinci-002	",
  // "text-curie-001",
  // "text-babbage-001",
  // "text-ada-001",
  // "davinci",
  // "curie",
  // "babbage",
  // "ada",
];
/**
 * 提交内容
 * @param isPush 是否对话模式
 * @returns
 */
async function sendMessage(chat: ChatManagement) {
  const messages = chat.getAskContext();
  if (messages.length == 0) return;
  const topicId = chat.activityTopicId;
  try {
    if (KeyValueData.instance().getApiKey()) {
      const res = await sendMessageToChatGpt({
        messages,
        model: chat.gptConfig.model,
        max_tokens: chat.gptConfig.max_tokens,
        top_p: chat.gptConfig.top_p,
        temperature: chat.gptConfig.temperature,
        user: "user",
        token: KeyValueData.instance().getApiKey(),
        baseUrl: chat.config.baseUrl || undefined,
      });
      return chat.pushMessage(res, true, topicId);
    }
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messages,
        model: chat.gptConfig.model,
        max_tokens: chat.gptConfig.max_tokens,
        top_p: chat.gptConfig.top_p,
        temperature: chat.gptConfig.temperature,
        user: "user",
        token: KeyValueData.instance().getAutoToken(),
      }),
    });
    const data = await response.json();
    if (response.status !== 200) {
      throw (
        data.error || new Error(`Request failed with status ${response.status}`)
      );
    }
    chat.pushMessage(data.result, true, topicId);
  } catch (error: any) {
    chat.pushMessage(error.message, true, topicId);
  }
}
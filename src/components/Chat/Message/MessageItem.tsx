import { LocalDbImg } from '@/components/common/LocalDbImg';
import { useService } from '@/core/AiService/ServiceProvider';
import { ChatContext } from '@/core/ChatManagement';
import { loadingMessages, useScreenSize } from '@/core/hooks/hooks';
import { createThrottleAndDebounce, onTextareaTab } from '@/core/utils/utils';
import { CtxRole } from '@/Models/CtxRole';
import { Message } from '@/Models/DataBase';
import styleCss from '@/styles/index.module.css';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  ForwardOutlined,
  MessageOutlined,
  PauseOutlined,
  PlusOutlined,
  RollbackOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SaveOutlined,
  SwapOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Checkbox,
  Divider,
  Flex,
  Image as AntdImage,
  message,
  Popconfirm,
  Segmented,
  Space,
  theme,
  Tooltip,
  Typography
} from 'antd';
import copy from 'copy-to-clipboard';
import Image from 'next/image';
import React, { CSSProperties, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Hidden } from '../../common/Hidden';
import { MarkdownView } from '../../common/MarkdownView';
import { SkipExport } from '../../common/SkipExport';
import { TextEditor } from '../../common/TextEditor';
import { reloadTopic } from './MessageList';

const MemoMarkdownView = React.memo(MarkdownView);
export const MessageItem = ({
  msg,
  renderMessage,
  rBak,
  onDel,
  onCite,
  onPush,
  onSned,
  style,
}: {
  msg: Message;
  renderMessage: { [key: string]: () => void };
  rBak: (v: Message) => void;
  onDel: (v: Message) => void;
  onCite: (message: Message) => void;
  onPush: () => void;
  onSned: () => void;
  style?: CSSProperties | undefined;
}) => {
  const { chatMgt: chat, loadingMsgs, reloadNav } = useContext(ChatContext);
  const topic = useMemo(() => chat.topics.find((f) => f.id == msg.topicId)!, [chat.topics, msg.topicId]);
  const { aiService } = useService();
  const { token } = theme.useToken();
  const [edit, setEdit] = useState(false);
  const [messageText, setMessage] = useState({ text: msg.text });
  // const inputRef = useMemo(()=>createRef<TextAreaRef>(),[]);
  const [successLines, setSuccessLines] = useState(msg.text);
  const [isPause, setIsPause] = useState(false);
  const [ctxRole, setCtxRole] = useState(msg.ctxRole);
  const screenSize = useScreenSize();
  const [messageApi, contextHolder] = message.useMessage();
  const [renderType, setRenderType] = useState(
    topic?.overrideSettings?.renderType === undefined ? chat.config.renderType : topic.overrideSettings.renderType
  );
  useEffect(() => {
    setRenderType(topic?.overrideSettings?.renderType === undefined ? chat.config.renderType : topic.overrideSettings.renderType);
  }, [chat.config.renderType, topic?.overrideSettings?.renderType]);

  const saveMsg = useCallback(
    async (msg: Message, messageText: string, ctxRole: CtxRole) => {
      const isReloadNav = /^#{1,5}\s/.test(msg.text) || /^#{1,5}\s/.test(messageText);
      msg.text = messageText;
      msg.ctxRole = ctxRole;
      return await chat.pushMessage(msg).then((res) => {
        if (isReloadNav) {
          var topic = chat.topics.find((f) => f.id === msg.topicId);
          if (topic) reloadNav(topic);
        }
        reloadTopic(msg.topicId, msg.id);
        setEdit(false);
        setMessage({ text: res.text });
        setSuccessLines(msg.text);
      });
    },
    [chat, reloadNav]
  );
  // 下方工具条
  const utilsEle = (
    <>
      <Checkbox
        disabled={!aiService?.customContext}
        checked={msg.checked || false}
        onChange={(e) => {
          msg.checked = e.target.checked;
          setMessage({ text: messageText.text });
        }}
      >
        <Hidden hidden={renderType != 'document'}>
          <span>
            {'字数：'}
            {msg.text.length}
          </span>
        </Hidden>
        <Hidden hidden={renderType == 'document'}>
          <span>{new Date(msg.updateTime || msg.timestamp).toLocaleTimeString()}</span>
        </Hidden>
      </Checkbox>
      <span
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          setEdit(false);
        }}
        style={{ flex: 1 }}
      ></span>
      <Hidden hidden={!edit}>
        <SkipExport>
          <SaveOutlined
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => saveMsg(msg, messageText.text, ctxRole)}
            style={{ paddingLeft: 16 }}
          />
        </SkipExport>
      </Hidden>
      <span style={{ marginLeft: 16 }}></span>
      <SkipExport>
        <Hidden hidden={!!loadingMsgs[msg.id]}>
          <EditOutlined
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (!edit) setMessage({ text: msg.text });
              setEdit(!edit);
            }}
          />
        </Hidden>
      </SkipExport>
      <span style={{ marginLeft: 16 }}></span>
      <SkipExport>
        {
          <CopyOutlined
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (copy(msg.text.toString())) {
                messageApi.success('已复制');
              }
            }}
          />
        }
      </SkipExport>
      <span style={{ marginLeft: 16 }}></span>
      <SkipExport>
        {
          <RollbackOutlined
            onMouseDown={(e) => e.preventDefault()}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              rBak(msg);
            }}
          />
        }
      </SkipExport>
      <span style={{ marginLeft: '30px' }}></span>
      {loadingMsgs[msg.id] ? (
        <SkipExport>
          <Popconfirm
            placement="topRight"
            overlayInnerStyle={{ whiteSpace: 'nowrap' }}
            title={'确定停止？'}
            onConfirm={() => {
              if (typeof loadingMsgs[msg.id]?.stop == 'function') loadingMsgs[msg.id]?.stop();
              delete loadingMsgs[msg.id];
              setMessage({ text: msg.text });
            }}
          >
            <PauseOutlined style={{ color: '#ff8d8f' }}></PauseOutlined>
          </Popconfirm>
        </SkipExport>
      ) : (
        <SkipExport>
          <Popconfirm
            placement="topRight"
            overlayInnerStyle={{ whiteSpace: 'nowrap' }}
            okType="danger"
            title="确定删除此消息？"
            onConfirm={() => {
              onDel(msg);
            }}
          >
            <DeleteOutlined style={{ color: '#ff8d8f' }}></DeleteOutlined>
          </Popconfirm>
        </SkipExport>
      )}
    </>
  );

  // 下方悬浮按钮
  const Extend = useMemo(() => {
    if (msg.skipCtx) return <></>;
    return (
      <div className={styleCss.message_extend_but} style={{ ...style, zIndex: 9 }}>
        <Divider style={{ margin: 0 }}>
          <Flex gap={6}>
            {aiService?.customContext && (
              <Button
                shape="circle"
                type="text"
                icon={
                  <SkipExport>
                    <MessageOutlined />
                  </SkipExport>
                }
                onClick={onSned}
              ></Button>
            )}
            <Button
              shape="circle"
              type="text"
              icon={
                <SkipExport>
                  <PlusOutlined />
                </SkipExport>
              }
              onClick={onPush}
            ></Button>
          </Flex>
        </Divider>
      </div>
    );
  }, [aiService?.customContext, msg.skipCtx, onPush, onSned, style]);
  const EditUtil = useMemo(
    () => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 5,
          maxWidth: '100%',
          flexWrap: 'wrap',
        }}
      >
        <Segmented
          size="small"
          value={ctxRole}
          onChange={(val) => {
            setCtxRole(val as CtxRole);
          }}
          options={[
            { label: '助理', value: 'assistant' },
            { label: '系统', value: 'system' },
            { label: '用户', value: 'user' },
          ]}
        />
        <Button.Group size="small">
          <Button
            onClick={() => {
              saveMsg(msg, messageText.text, ctxRole);
            }}
          >
            {'保存'}
          </Button>
          <Button
            onClick={() => {
              setTimeout(() => {
                saveMsg(msg, messageText.text, ctxRole).then(() => {
                  onSned();
                });
              }, 50);
            }}
          >
            {'提交'}
          </Button>
        </Button.Group>
      </div>
    ),
    [ctxRole, messageText, msg, onSned, saveMsg]
  );
  const RuningText = () => {
    const [runLines, setRunLines] = useState(msg.text.slice(successLines.length));
    useEffect(() => {
      renderMessage[msg.id] = createThrottleAndDebounce((reloadStatus = false) => {
        // 如果正在运行，则分成两部分显示
        if (loadingMessages[msg.id]) {
          if (!isPause) {
            let runText = msg.text.slice(successLines.length);
            let enterIdx = (runText.match(/\n/g) || []).length > 2 ? runText.lastIndexOf('\n') : -1;
            let successText = successLines;
            if (enterIdx >= 0) {
              // 最新的内容里面有换行符
              successText = msg.text.slice(0, successLines.length + enterIdx + 1);
              runText = runText.substring(enterIdx + 1);
            }
            setRunLines(runText);
            if (successText != successLines) {
              setSuccessLines(successText);
            }
          }
        } else {
          if (!reloadStatus) setMessage({ text: msg.text });
          setSuccessLines(msg.text);
          setRunLines('');
        }
        if (reloadStatus) {
          setMessage({ text: msg.text });
        }
      }, 40);
      return () => {
        delete renderMessage[msg.id];
      };
    }, []);
    if (!loadingMessages[msg.id]) return <></>;
    return (
      <div
        style={{
          minHeight: '3.5em',
          position: 'relative',
          whiteSpace: 'pre-line',
        }}
      >
        {runLines || 'loading...'}
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: 24,
            position: 'absolute',
            bottom: 0,
            opacity: 0.7,
          }}
          onClick={() => {
            setIsPause((v) => !v);
          }}
        >
          {isPause ? (
            <ForwardOutlined style={{ color: token.colorPrimaryActive }} />
          ) : (
            <PauseOutlined style={{ color: token.colorPrimary }}></PauseOutlined>
          )}
        </div>
      </div>
    );
  };
  // 内容显示
  const Content = useMemo(() => {
    return (
      <div>
        {edit ? (
          <>
            <Hidden hidden={!edit}>{EditUtil}</Hidden>
            <TextEditor
              autoSize={renderType == 'document' ? true : { maxRows: 10 }}
              input={messageText}
              onKeyDown={(e) => {
                if (e.key === 's' && e.ctrlKey) {
                  e.preventDefault();
                  saveMsg(msg, messageText.text, ctxRole);
                }
                if (e.key === 'Tab') {
                  e.preventDefault();
                  setMessage((v) => ({
                    text: onTextareaTab(
                      v.text,
                      e.currentTarget?.selectionStart,
                      e.currentTarget?.selectionEnd,
                      e.currentTarget,
                      e.shiftKey
                    ),
                  }));
                }
              }}
              onFocus={(e) => {
                e.target.selectionStart = msg.text.length;
                e.target.selectionEnd = msg.text.length;
              }}
              // ref={inputRef}
              autoFocus={true}
            />
          </>
        ) : (
          <>
            <MemoMarkdownView
              markdown={chat.config.disableStrikethrough ? successLines.replaceAll('~', '～') : successLines}
              doubleClick={() => {
                setMessage({ text: msg.text });
                setEdit(true);
              }}
              // lastBlockLines={loadingMsgs[msg.id] ? 3 : 0}
            />
          </>
        )}
        <Flex gap={10} wrap={'wrap'}>
          <AntdImage.PreviewGroup
            preview={{
              toolbarRender: (
                _,
                { transform: { scale }, current, actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn } }
              ) => (
                <Space size={12} className="toolbar-wrapper">
                  <SwapOutlined rotate={90} onClick={onFlipY} />
                  <SwapOutlined onClick={onFlipX} />
                  <RotateLeftOutlined onClick={onRotateLeft} />
                  <RotateRightOutlined onClick={onRotateRight} />
                  <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                  <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
                  <DeleteOutlined
                    onClick={() => {
                      msg.imageIds?.splice(current, 1);
                      chat.pushMessage(msg);
                    }}
                  />
                </Space>
              ),
            }}
          >
            {msg.imageIds?.map((id, i) => {
              if (id == 'error') {
                return <AntdImage key={id + i} height={100} src={'/images/error.png'} />;
              }
              if (id == 'loading') {
                return <AntdImage key={id + i} height={100} src={'/images/loading.gif'} />;
              }
              return (
                <>
                  <LocalDbImg key={id + i} id={id} />
                </>
              );
            })}
          </AntdImage.PreviewGroup>
        </Flex>
      </div>
    );
  }, [edit, EditUtil, renderType, messageText, chat, successLines, msg, saveMsg, ctxRole]);
  if (renderType == 'document') {
    return (
      <>
        {contextHolder}
        <div
          className={styleCss.message_box + (chat.config.limitPreHeight ? ' limt-hight' : '') + ' ' + styleCss.message_box_hiddel_tool}
          style={{
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            flexDirection: 'column',
            marginTop: '18px',
          }}
          id={msg.id}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              paddingBottom: 15,
            }}
          >
            <div className={styleCss.message_item}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  padding: '0 5px 0 20px',
                  flexDirection: msg.ctxRole == 'assistant' ? 'row' : 'row-reverse',
                }}
              >
                {loadingMsgs[msg.id] ? (
                  <SkipExport>
                    <Popconfirm
                      placement="topRight"
                      overlayInnerStyle={{ whiteSpace: 'nowrap' }}
                      title="确定停止？"
                      onConfirm={() => {
                        if (typeof loadingMsgs[msg.id]?.stop == 'function') loadingMsgs[msg.id]?.stop();
                        delete loadingMsgs[msg.id];
                        setMessage({ text: msg.text });
                      }}
                    >
                      <PauseOutlined style={{ color: '#ff8d8f' }}></PauseOutlined>
                    </Popconfirm>
                  </SkipExport>
                ) : (
                  <></>
                )}
              </div>
              <div
                className={[
                  styleCss.top_label,
                  msg.ctxRole == 'assistant'
                    ? styleCss.top_label_assistant
                    : msg.ctxRole == 'user'
                    ? styleCss.top_label_user
                    : msg.ctxRole == 'system'
                    ? styleCss.top_label_system
                    : '',
                ].join(' ')}
                style={{
                  flex: 1,
                  display: 'flex',
                  paddingLeft: screenSize.width >= 1200 ? 28 : 10,
                  paddingRight: screenSize.width >= 1200 ? 28 : 10,
                  flexDirection: 'column',
                  lineHeight: 1.7,
                }}
              >
                <Hidden hidden={!msg.searchQueries && !msg.searchResults}>
                  <Hidden hidden={!msg.searchQueries}>
                    <p>搜索关键词：</p>
                    {msg.searchQueries?.map((v) => (
                      <p>{v}</p>
                    ))}
                  </Hidden>
                  <Hidden hidden={!msg.searchResults}>
                    <p>搜索结果：</p>
                    {msg.searchResults?.map((v) => (
                      <p>
                        {v.timestamp}
                        <Typography.Link rel="noopener noreferrer" target={'_blank'} href={v.url}>
                          {v.title}
                        </Typography.Link>
                      </p>
                    ))}
                  </Hidden>
                </Hidden>
                <Tooltip
                  placement="rightBottom"
                  title={msg.ctxRole == 'assistant' ? '助理' : msg.ctxRole == 'user' ? '用户' : msg.ctxRole == 'system' ? '系统' : ''}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      position: 'absolute',
                      left: 0,
                      top: 0,
                    }}
                  >
                    <span></span>
                  </div>
                </Tooltip>
                {Content}
                <RuningText></RuningText>
                <div
                  style={{
                    display: 'flex',
                    borderTop: '1px solid #ccc3',
                    justifyContent: 'flex-end',
                    padding: '5px 5px',
                    opacity: 0.6,
                  }}
                >
                  {utilsEle}
                </div>
              </div>
            </div>
          </div>
          {!loadingMessages[msg.id] && Extend}
        </div>
      </>
    );
  }
  if (msg.ctxRole === 'system') {
    return (
      <div
        style={{
          padding: '1em 42px 10px',
          textAlign: 'center',
        }}
        id={msg.id}
        className={styleCss.message_box}
      >
        {contextHolder}
        {Content}
        <RuningText></RuningText>
        <div
          style={{
            display: 'flex',
            borderTop: '1px solid #ccc3',
            justifyContent: 'flex-end',
            padding: '5px 5px',
            opacity: 0.6,
          }}
        >
          {utilsEle}
        </div>
        {Extend}
      </div>
    );
  }
  return (
    <div
      className={styleCss.message_box + (chat.config.limitPreHeight ? ' limt-hight' : '')}
      style={{
        display: 'flex',
        justifyContent: msg.ctxRole == 'assistant' ? 'flex-start' : 'flex-end',
        position: 'relative',
        flexDirection: 'column',
        marginTop: '12px',
      }}
      id={msg.id}
    >
      {contextHolder}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: msg.ctxRole == 'assistant' ? 'row' : 'row-reverse',
          paddingLeft: msg.ctxRole == 'assistant' ? 10 : screenSize.width > 1300 ? 120 : 20,
          paddingRight: msg.ctxRole == 'assistant' ? (screenSize.width > 1300 ? 120 : 20) : 10,
        }}
      >
        <Avatar
          src={msg.ctxRole == 'assistant' ? chat.virtualRole.avatar || undefined : chat.user.avatar || undefined}
          style={{ flex: 'none', borderRadius: msg.ctxRole == 'assistant' ? '50% 50% 50% 5px' : '50% 50% 5px 50%' }}
          size={50}
          icon={<Image width={50} height={50} src={'/logo.png'} alt="logo" />}
        />
        <div className={styleCss.message_item}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              padding: '0 5px',
              flexDirection: msg.ctxRole == 'assistant' ? 'row' : 'row-reverse',
            }}
          >
            <span>{msg.ctxRole == 'assistant' ? chat.virtualRole.name : chat.user?.name}</span>
            <span style={{ marginLeft: '30px' }}></span>
            <Hidden hidden={loadingMsgs[msg.id] == undefined}>
              <SkipExport>
                <Popconfirm
                  placement="topRight"
                  overlayInnerStyle={{ whiteSpace: 'nowrap' }}
                  title="确定停止？"
                  onConfirm={() => {
                    if (typeof loadingMsgs[msg.id]?.stop == 'function') loadingMsgs[msg.id]?.stop();
                    delete loadingMsgs[msg.id];
                    setMessage({ text: msg.text });
                  }}
                >
                  <PauseOutlined style={{ color: '#ff8d8f' }}></PauseOutlined>
                </Popconfirm>
              </SkipExport>
            </Hidden>
          </div>
          <Hidden hidden={!msg.searchQueries && !msg.searchResults}>
            <div
              style={{
                flex: 1,
                display: 'flex',
                padding: '10px 16px',
                flexDirection: 'column',
                boxSizing: 'border-box',
                borderRadius: token.borderRadiusLG,
                border: '1px solid ' + token.colorFillAlter,
                backgroundColor: token.colorInfoBg,
                marginBottom: '12px',
                boxShadow: token.boxShadowTertiary,
                lineHeight: 1.7,
              }}
            >
              <Hidden hidden={!msg.searchQueries}>
                <p>
                  {'搜索关键词：'}
                  {msg.searchQueries?.map((v) => (
                    <i>{v}</i>
                  ))}
                </p>
              </Hidden>
              <Hidden hidden={!msg.searchResults}>
                <p>{'参考文档：'}</p>
                {msg.searchResults?.map((v) => (
                  <h5>
                    <Typography.Link rel="noopener noreferrer" target={'_blank'} href={v.url}>
                      {v.title}
                      <span style={{ marginLeft: '2em' }}>{v.timestamp}</span>
                    </Typography.Link>
                  </h5>
                ))}
              </Hidden>
            </div>
          </Hidden>
          <div
            style={{
              flex: 1,
              display: 'flex',
              padding: '6px 10px 0',
              flexDirection: 'column',
              boxSizing: 'border-box',
              borderRadius: token.borderRadiusLG,
              border: '1px solid ' + token.colorFillAlter,
              backgroundColor: token.colorInfoBg,
              marginBottom: '12px',
              boxShadow: token.boxShadowTertiary,
              lineHeight: 1.7,
              ...(msg.ctxRole == 'assistant' ? { marginLeft: -10 } : { marginRight: -10 }),
            }}
            className={chat.config.autoWrapCode ? 'auto-wrap' : undefined}
          >
            {Content}
            <RuningText></RuningText>
            <div
              style={{
                display: 'flex',
                borderTop: '1px solid #ccc3',
                justifyContent: 'flex-end',
                opacity: 0.6,
              }}
            >
              {utilsEle}
            </div>
          </div>
        </div>
      </div>
      <Hidden hidden={!!loadingMsgs[msg.id]}>{Extend}</Hidden>
    </div>
  );
};

export const MemoMessageItem = React.memo(MessageItem);

import { getUuid } from "@/core/utils/utils";
import { CtxRole } from "@/Models/CtxRole";
import { VirtualRoleSetting } from "@/Models/VirtualRoleSetting";
import { VirtualRoleSettingItem } from "@/Models/VirtualRoleSettingItem";
import {
  DeleteOutlined,
  PlusOutlined
} from "@ant-design/icons";

import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Popconfirm,
  Segmented,
  Select,
  Space,
  Tag,
  theme
} from "antd";
import copy from "copy-to-clipboard";
import { useCallback, useEffect, useState } from "react";
import { DragItem, DragList } from "../common/DragList";
import { Hidden } from "../common/Hidden";
import { Modal } from "../common/Modal";
import { SkipExport } from "../common/SkipExport";
const ContentItem = ({
  item,
  idx,
  del,
  disabledEdit,
}: {
  item: VirtualRoleSettingItem;
  idx: number;
  del: (key: string) => void;

  disabledEdit?: boolean;
}) => {
  const [text, setText] = useState(item.content);
  const [role, setRole] = useState(item.role);
  const [checked, setChecked] = useState(item.checked);
  const [inputValue, setInputValue] = useState("");
  const [zone, setZone] = useState([]);
  useEffect(() => {
    setText(item.content);
    setRole(item.role);
    setChecked(item.checked);
  }, [item]);
  return (
    <div
      style={{
        position: "relative",
        marginBottom: 0,
        marginLeft: 10,
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <Form.Item noStyle>
          <Segmented
            disabled={disabledEdit}
            size="small"
            value={role ? role : "null"}
            onChange={(val) => {
              item.role = val != "null" ? (val as CtxRole) : undefined;
              setRole(item.role);
            }}
            options={[
              { label: "助理", value: "assistant" },
              { label: "系统", value: "system" },
              { label: "用户", value: "user" },
              ...(idx > 0 ? [{ label: "向上合并", value: "null" }] : []),
            ]}
          />
        </Form.Item>
        <span></span>
        <span>
          <SkipExport>
            <Hidden hidden={disabledEdit}>
              <Popconfirm
                overlayInnerStyle={{ whiteSpace: "nowrap" }}
                title="确定删除？"
                placement="topRight"
                onConfirm={() => {
                  del(item.key);
                }}
              >
                <DeleteOutlined></DeleteOutlined>
              </Popconfirm>
            </Hidden>
          </SkipExport>
          <span style={{ marginLeft: "15px" }}></span>
          <Form.Item noStyle>
            <Checkbox
              checked={checked}
              onChange={(e) => {
                item.checked = e.target.checked;
                setChecked(item.checked);
              }}
            ></Checkbox>
          </Form.Item>
        </span>
      </div>
      <div style={{ marginBottom: 5 }}>
        <Space size={[0, 8]} wrap>
          {item.keyWords?.map((v, idx) => (
            <Tag
              key={v}
              closable={true}
              onClose={(e) => {
                item.keyWords?.splice(idx, 1);
              }}
            >
              {v}
            </Tag>
          ))}
          <Input
            type="text"
            size="small"
            placeholder={"关键词"}
            style={{
              width: 64,
              height: 22,
              marginInlineEnd: 8,
              verticalAlign: "top",
            }}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              e.preventDefault()
              Array.isArray(item.keyWords)
                ? item.keyWords.push(inputValue)
                : (item.keyWords = [inputValue]);
              setInputValue("");
            }}
          />
          {/* <Tag.CheckableTag
            onClick={(e) => e.stopPropagation()}
            checked={Array.isArray(item.keyWords)}
            onChange={(checked: boolean) => {
              item.keyWords = checked ? [] : undefined;
              setZone([]);
            }}
          >
            {"关键词"}
            <span onClick={(e) => e.stopPropagation()}>
              <Tooltip
                trigger={"click"}
                title="关键词用于自动选中设定，仅在设定开启【自动】且勾选时生效"
              >
                <QuestionOutlined />
              </Tooltip>
            </span>
          </Tag.CheckableTag> */}
        </Space>
      </div>
      <Form.Item
        valuePropName="content"
        validateTrigger={["onChange", "onBlur"]}
        noStyle
      >
        <Input.TextArea
          readOnly={disabledEdit}
          placeholder="追加内容"
          autoSize={{ maxRows: 10 }}
          value={text}
          style={{
            paddingRight: "1em",
            paddingLeft: "1em",
          }}
          onChange={(e) => {
            setText(e.target.value);
            item.content = e.target.value;
          }}
        />
      </Form.Item>
    </div>
  );
};
export function EditVirtualRoleSetting({
  item,
  onSave,
  visible,
  onCancel,
  allTags,
  disabledEdit,
}: {
  item: VirtualRoleSetting & DragItem & { edit: boolean };
  visible: boolean;
  onSave: (item: VirtualRoleSetting & DragItem & { edit: boolean }) => void;
  onCancel: () => void;
  allTags: string[];
  disabledEdit?: boolean;
}) {
  const [tags, setTags] = useState<string[]>(item.tags);
  const { token } = theme.useToken();
  const [filterText, setFilterText] = useState("");
  const [ctx, setCtx] = useState<
    {
      key: string;
      role?: CtxRole | undefined;
      content: string;
      checked?: boolean | undefined;
    }[]
  >(item.ctx);
  const [messageApi, contextHolder] = message.useMessage();
  const renderItem = useCallback(
    (
      item: {
        key: string;
        role?: CtxRole | undefined;
        content: string;
        checked?: boolean | undefined;
      },
      idx: number
    ) => {
      if (filterText && !item.content.includes(filterText)) return undefined;
      return (
        <ContentItem
          disabledEdit={disabledEdit}
          item={item}
          idx={idx}
          del={(key) => {
            setCtx((v) => v.filter((f) => f.key !== key));
          }}
        />
      );
    },
    [disabledEdit, filterText]
  );
  const [title, setTitle] = useState(item.title);
  if (!visible) return <></>;
  return (
    <Modal
      open={visible}
      onOk={() => {
        setCtx((ctx) => {
          ctx.forEach((v) => (v.content = v.content?.trim()));
          let next_ctx = ctx.filter((f) => f.content);
          onSave({
            ...item,
            tags,
            ctx: next_ctx,
            title: title,
          });
          return next_ctx;
        });
      }}
      width="min(860px, 100%)"
      onCancel={onCancel}
      bodyStyle={{
        maxHeight: "calc(100vh - 200px)",
        minHeight: "50vh",
        overflow: "auto",
      }}
    >
      {contextHolder}
      <div>
        <Form.Item>
          <Button.Group>
            <Button
              onClick={() => {
                if (
                  copy(
                    JSON.stringify(
                      Object.assign({}, item, {
                        extensionId: undefined,
                      })
                    )
                  )
                ) {
                  messageApi.success("已复制");
                }
              }}
            >
              {"复制"}
            </Button>

            <Hidden hidden={disabledEdit}>
              <Button
                onClick={() => {
                  navigator?.clipboard.readText().then((text) => {
                    try {
                      if (!text) return;
                      let res: VirtualRoleSetting = JSON.parse(text);
                      if (typeof res == "string") res = JSON.parse(res);
                      if (!res || !res.ctx) return;
                      setTags(res.tags);
                      setTitle(res.title);
                      setCtx(res.ctx);
                    } catch (err) {
                      item.ctx.push({
                        key: getUuid(),
                        role: "system",
                        content: text,
                        checked: true,
                      });
                    }
                  });
                }}
              >
                {"粘贴"}
              </Button>
            </Hidden>
          </Button.Group>
        </Form.Item>
        <Form.Item style={{ marginBottom: 10 }}>
          <Input.Search
            placeholder={"搜索关键字"}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            onSearch={(val) => {
              setFilterText(val);
            }}
          />
        </Form.Item>
        <Form.Item validateTrigger={["onChange", "onBlur"]}>
          <Input.TextArea
            readOnly={disabledEdit}
            placeholder="标题，不影响上下文，可不填"
            autoSize
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            style={{
              paddingRight: "1em",
              paddingLeft: "1em",
            }}
          />
        </Form.Item>
        <Form.Item>
          <Select
            placeholder={"tag 按下Enter新增新tag"}
            disabled={disabledEdit}
            mode="tags"
            style={{ width: "100%" }}
            value={tags}
            onChange={(vals) => {
              setTags(vals);
            }}
            tokenSeparators={[","]}
            options={allTags.map((v) => ({ label: v, value: v }))}
          />
        </Form.Item>

        <div style={{ overflow: "auto" }}>
          <Hidden hidden={ctx.length < 3 || disabledEdit}>
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  setCtx((v) => [
                    {
                      content: "",
                      role: undefined,
                      key: getUuid(),
                      checked: true,
                    },
                    ...v,
                  ]);
                }}
                block
                icon={
                  <SkipExport>
                    <PlusOutlined />
                  </SkipExport>
                }
              >
                {"增加设定"}
              </Button>
            </Form.Item>
          </Hidden>
          <DragList
            data={ctx}
            readonly={disabledEdit}
            onChange={(data) => {
              data.forEach((item, idx) => {
                if (idx == 0 && !item.role) item.role = "system";
              });
              setCtx(data);
            }}
            style={{
              borderRadius: 8,
              border: "1px solid " + token.colorBorder,
              padding: 5,
              marginBottom: 8,
              // backgroundColor: token.colorFillContent,
            }}
            itemDom={renderItem}
          ></DragList>
          <Hidden hidden={disabledEdit}>
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  setCtx((v) => [
                    ...v,
                    {
                      content: "",
                      role: v.length == 0 ? "system" : undefined,
                      key: getUuid(),
                      checked: true,
                    },
                  ]);
                }}
                block
                icon={
                  <SkipExport>
                    <PlusOutlined />
                  </SkipExport>
                }
              >
                {"增加设定"}
              </Button>
            </Form.Item>
          </Hidden>
        </div>
      </div>
    </Modal>
  );
}

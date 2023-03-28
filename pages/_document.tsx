import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="zh-cn">
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta
          name="keywords"
          content="便捷使用ChatGPT的工具,ChatGPT聊天界面,ChatGPT助手,ChatGPT长文本聊天,尽可能自由的ChatGPT访问客户端"
        ></meta>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

# Github 原始文件代理

### 功能介绍

-   Github 原始文件代理
-   私有仓库认证代理，多用户 (仓库) 独立 Token 认证
-   最大可能保持原站点功能（缓存控制，协商头，断点续传）

### 参数说明

| 环境变量名 | 可选值                                        | 说明         | 示例                                                 |
| ---------- | --------------------------------------------- | ------------ | ---------------------------------------------------- |
| Token      | URL 规范允许的字符                            | 口令         | "666666"                                             |
| AuthTable  | URL 规范允许的字符<br>分隔符 `:` `;` 除外     | 授权表       | "user1:token1;user2/repo1:token2;user2/repo2:token3" |
| HomeMode   | default<br>rewrite<br>redirect                | 主页伪装模式 | "default"                                            |
| HomePage   | 网址；必须带协议头<br>`https://` 或 `http://` | 主页         | "https://www.baidu.com"                              |

### 部署说明

1. **Cloudflare Workers** 部署：复制 \_worker.js 代码至 Workers 编译面版，保存并部署

    [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/pierre-primary/cloudflare-workers-github-raw)

2. **Cloudflare Pages** 部署：Fork 项目后；创建 Pages 时连接 GitHub 一键部署

3. **配置参数**: 如果特殊要求可跳过；复制项目中 vars.tmpl 的内容，粘贴到 Cloudflare 环境变量编辑页，修改为自己的值，保存并重新部署

### 使用说明

-   Url 模板

    > https://自己的二级域名.pages.dev/\${GITHUB_USER}/\${GITHUB_REPO}/\${GITHUB_BRANCH}/\${FILE_PATH}?token=\${口令}

-   Url 示例

    > https://自己的二级域名.pages.dev/pierre-primary/cloudflare-workers-github-raw/main/\_worker.js?token=666666

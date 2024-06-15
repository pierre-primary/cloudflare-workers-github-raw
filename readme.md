# Github 原始文件代理

### 功能介绍

-   Github 原始文件代理
-   私有仓库认证代理，多用户 (仓库) 独立 Token 认证
-   最大可能保持原站点功能（缓存控制，协商头，断点续传）

### 参数说明

| 环境变量名 | 可选值                                         | 说明         | 示例                                                 |
| ---------- | ---------------------------------------------- | ------------ | ---------------------------------------------------- |
| Token      | 满足 URL 规范就行                              | 口令         | "666666"                                             |
| AuthTable  | 除了分隔符外；<br>只允许 `[a-zA-Z0-9_]` 和 `-` | 授权表       | "user1@token1;user2/repo1@token2;user2/repo2@token3" |
| HomeMode   | default<br>rewrite<br>redirect                 | 主页伪装模式 | "default"                                            |
| HomePage   | 网址；必须带协议头<br>`https://` 或 `http://`  | 主页         | "https://www.baidu.com"                              |

### 部署说明

1. 自行搜索 Cloudflare Workers/Pages 的部署方式
2. 快捷方式

    [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/pierre-primary/cloudflare-workers-github-raw)

### 使用说明

-   访问 Url 模板：

    `https://自己的二级域名.pages.dev/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${FILE_PATH}?token=${口令}`

-   访问 Url 示例：

    `https://自己的二级域名.pages.dev/pierre-primary/cloudflare-workers-github-raw/main/_worker.js?token=${666666}`

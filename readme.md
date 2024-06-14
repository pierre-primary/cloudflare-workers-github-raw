# Github 原始文件代理

-   多用户 (仓库) 独立 Token 认证
-   最大可能保持原站点功能（缓存控制，协商头，断点续传）

| 环境变量名 | 可选值                         | 说明                | 示例                                                 |
| ---------- | ------------------------------ | ------------------- | ---------------------------------------------------- |
| Token      |                                | 密钥                | "666666"                                             |
| AuthTable  |                                | 授权表              | "user1@token1;user2/repo1@token2;user2/repo2@token3" |
| HomeMode   | default<br>rewrite<br>redirect | 主页伪装模式        | "default"                                            |
| HomePage   |                                | 主页 (必须带协议头) | "https://www.baidu.com"                              |

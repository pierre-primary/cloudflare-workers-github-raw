const BaseURL = 'https://raw.githubusercontent.com';

function respNginx(request) {
    const Welcome = `<!DOCTYPE html>
    <html>
    <head>
    <title>Welcome to nginx!</title>
    <style>
    html { color-scheme: light dark; }
    body { width: 35em; margin: 0 auto;
    font-family: Tahoma, Verdana, Arial, sans-serif; }
    </style>
    </head>
    <body>
    <h1>Welcome to nginx!</h1>
    <p>If you see this page, the nginx web server is successfully installed and
    working. Further configuration is required.</p>

    <p>For online documentation and support please refer to
    <a href="http://nginx.org/">nginx.org</a>.<br/>
    Commercial support is available at
    <a href="http://nginx.com/">nginx.com</a>.</p>

    <p><em>Thank you for using nginx.</em></p>
    </body>
    </html>
    `;

    const etag = 'HelloNginx'
    if (request.headers.get('if-none-match') === etag)
        return new Response(null, { status: 304 });
    return new Response(Welcome, {
        headers: {
            'content-type': 'text/html;charset=utf-8',
            'cache-control': 'max-age=86400', // 强制缓存
            'etag': etag, // 协商缓存
        },
    });
}

function trimStartSlashs(src, offset = 0) {
    // const slashRegex = /^\/+/; 正则开销大
    for (; offset < src.length && src[offset] === '/'; offset++);
    return src.substring(offset);
}

function convertToArray(src) {
    if (src instanceof Array) return src;
    if (typeof src === 'string') return src.split(/[,;|\s\t\r\n]+/);
    return [];
}

export default {
    /**
     * @param {Request} request 请求
     * @param {Record<string, any>} env 环境变量注入
     * @returns
     */
    async fetch(request, env) {
        const url = new URL(request.url);

        let pathname = trimStartSlashs(url.pathname);
        if (pathname) {
            let token = url.searchParams.get('token');
            if (env.Token && env.Token !== token) {
                return new Response('Unauthorized', { status: 401 });
            }

            const target = new URL(pathname, BaseURL);
            request = new Request(target, request); // 直接传递请求，保持缓存控制头，部分下载头等功能
            request.headers.set('host', target.host);

            while (env.GithubUser && env.GithubToken) { // 对指定用户/仓库开启 Github 认证
                let checkname, idx;

                checkname = (idx = pathname.indexOf('/')) >= 0 ? pathname.substring(0, idx) : pathname;
                if (checkname !== env.GithubUser)  // 检查用户
                    break;

                idx >= 0 && (pathname = trimStartSlashs(pathname, idx + 1));

                if (env.GithubRepos) { // 检查仓库
                    checkname = (idx = pathname.indexOf('/')) >= 0 ? pathname.substring(0, idx) : pathname;
                    const repos = env.GithubRepos ? convertToArray(env.GithubRepos) : [];
                    if (repos.length > 0 && !repos.includes(checkname))
                        break;
                }

                request.headers.set('authorization', `token ${env.GithubToken}`);
                break;
            }

            return await fetch(request); // 直接传递响应，保持缓存控制头，部分下载头等功能
        }

        // 伪装首页
        if (env.HomePage) try {
            switch (env.HomeMode) {
                case 'redirect': // 重定向
                    return Response.redirect(env.HomePage, 302);
                case 'rewrite':  // 重写
                    return await fetch(env.HomePage);
            }
        } catch {
            return new Response('Internal Server Error', { status: 500 });
        }

        // 默认首页
        return respNginx(request);
    },
};

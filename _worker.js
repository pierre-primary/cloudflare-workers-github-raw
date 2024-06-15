
// 多用户 (仓库) 独立 Token 认证表；不建议在此修改
let AuthTable; // { "user1": "token", "user2/repo1": "token", $NoEmpty: true };

const BaseURL = 'https://raw.githubusercontent.com';
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

function respNginx(request) {
    const etag = 'HelloNginx';
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

function parseTable(src) {
    const CONCAT = '@', DELIM = ';';
    let table = {}, noempty = false, concat, delim;
    for (let i = 0; i < src.length;) {
        if ((concat = src.indexOf(CONCAT, i)) <= i)
            break; // Empty Key

        if ((delim = src.indexOf(DELIM, concat + 1)) < 0)
            delim = src.length; // Last Value

        if (delim > concat + 1) { // Non-Empty Value
            table[src.substring(i, concat)] = src.substring(concat + 1, delim);
            if (!noempty) noempty = true;
        }
        i = delim + 1;
    }
    table.$NoEmpty = noempty; // 空和非空都记录，避免查找原型链
    table.$Lock = true;
    return table;
}

function getToken(pathname, src) {
    let table = AuthTable;
    if (!table || !table.$Lock) {
        AuthTable = table = typeof src === 'string' ?
            parseTable(src) : { $Lock: true };
    }

    if (!table.$NoEmpty) return;

    const regex = /^(([-\w]{1,32})(?:\/[-\w]{1,32})?)(?:\/|$)/;
    const match = pathname.match(regex);

    if (!match) return;

    if (table[match[1]]) return table[match[1]];

    return table[match[2]];
}

export default {
    /**
     * @param {Request} request 请求
     * @param {Record<string, any>} env 环境变量注入
     * @returns
     */
    async fetch(request, env) {
        const url = new URL(request.url);

        let pathname = url.pathname.replace(/^\/+/, '');
        if (pathname) {
            let token = url.searchParams.get('token');
            if (env.Token && env.Token !== token) {
                return new Response('Unauthorized', { status: 401 });
            }

            const target = new URL(pathname, BaseURL);
            request = new Request(target, request); // 直接传递请求，保持缓存控制头，部分下载头等功能
            request.headers.set('host', target.host);

            token = getToken(pathname, env.AuthTable); // 独立 Token 认证
            if (token) {
                request.headers.set('authorization', `token ${token}`);
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

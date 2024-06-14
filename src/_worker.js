const Host = 'raw.githubusercontent.com';

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

export default {
    /**
     * @param {Request} request 请求
     * @param {Record<string, any>} env 环境变量注入
     * @returns
     */
    async fetch(request, env) {
        const url = new URL(request.url);

        const slashRegex = /^\/+/;

        let pathname = url.pathname.replace(slashRegex, '');
        if (pathname) {
            let token = url.searchParams.get('token');
            if (env.Token && env.Token !== token) {
                return new Response('Unauthorized', { status: 401 });
            }

            if (URL.canParse(pathname)) { // 完整路径；
                const target = new URL(pathname);
                if (target.protocol !== 'https:' || target.host !== Host) { // 非 Github 域名；禁止访问
                    return new Response('Forbidden ', { status: 403 });
                }
                pathname = target.pathname.replace(slashRegex, '');
            }

            request = new Request(`https://${Host}/${pathname}`, request);
            request.headers.set('host', Host);

            if (env.GithubUser && env.GithubToken && pathname.startsWith(env.GithubUser)) // Github 认证
                request.headers.set('authorization', `token ${env.GithubToken}`);

            return await fetch(request);
        }

        // 伪装首页
        if (env.HomePage) try {
            switch (env.HomeMode) {
                case 'redirect':
                    return Response.redirect(env.HomePage, 302);
                case 'rewrite':
                    return await fetch(env.HomePage);
            }
        } catch {
            return new Response('Internal Server Error', { status: 500 });
        }

        // 默认首页
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
    },
};

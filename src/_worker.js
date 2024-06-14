/**
 * @description：GitHub Raw Rewrite in Cloudflare Workers
 * @author：Pierre Jiang
 * @home：https://github.com/pierre-primary
 * @link：https://github.com/pierre-primary/cloudflare-workers-github-raw
 */

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

        if (!pathname) {
            if (env.HomePage) {
                try {
                    switch (env.HomeMode) {
                        case 'redirect':
                            return Response.redirect(env.HomePage, 302);
                        case 'rewrite':
                            return await fetch(env.HomePage);
                    }
                } catch {
                    return new Response('Internal Server Error', { status: 500 });
                }
            }

            if (request.headers.get('if-none-match') === 'HelloNginx') return new Response(null, { status: 304 });

            return new Response(Welcome, {
                headers: {
                    'content-type': 'text/html;charset=utf-8',
                    'cache-control': 'max-age=86400', // 强制缓存
                    'etag': 'HelloNginx', // 协商缓存
                },
            });
        }

        let token = url.searchParams.get('token') || null;
        if (token === (env.Token || null)) {
            token = env.GithubToken;
        }

        if (URL.canParse(pathname)) { // 完整路径；严格匹配
            const target = new URL(pathname);
            if (target.host !== Host) {
                return new Response('Not Found', { status: 404 });
            }
            pathname = target.pathname.replace(slashRegex, '');
            if (env.PathPrefix && !path.startsWith(env.PathPrefix)) {
                return new Response('Not Found', { status: 404 });
            }
        } else if (env.PathPrefix && !path.startsWith(env.PathPrefix)) { // 非完整路径；自动补全
            pathname = `${env.PathPrefix}/${pathname}`;
        }

        request = new Request(`https://${Host}/${pathname}`, request);
        request.headers.set('host', Host);

        if (token) {
            request.headers.set('authorization', `token ${token}`);
        }

        return await fetch(request);
    },
};

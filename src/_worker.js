/**
 * @description：GitHub Raw Rewrite in Cloudflare Workers
 * @author：Pierre Jiang
 * @home：https://github.com/pierre-primary
 * @link：https://github.com/pierre-primary/cloudflare-workers-github-raw
 */

let PathPrefix = '';            // 路径前缀；用于限定指定账户（如 pierre-primary）或仓库（如 pierre-primary/cloudflare-workers-github-raw）的访问;
let Token = '';                 // 本站令牌；提示：推荐使用 Workers 的环境变量
let GithubToken = '';           // GitHub 令牌；提示：设置后不要提交到仓库 ！！！；同上

const welcome = `<!DOCTYPE html>
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
     * @param {Record<string, string>} env 环境变量注入
     * @returns
     */
    async fetch(request, env) {
        const url = new URL(request.url);

        const slashRegex = /^\/+/;
        let path = url.pathname.replace(slashRegex, '');

        if (!path) {
            if (env.HomePage) {
                try {
                    switch (env.HomeMode) {
                        case 'redirect':
                            return Response.redirect(env.HomePage, 302);
                        case 'rewrite':
                            return await fetch(env.HomePage);
                    }
                } catch {
                    return new Response("Internal Server Error", { status: 500 });
                }
            }

            if (request.headers.get('if-none-match') === "HelloNginx")
                return new Response(null, { status: 304 });

            return new Response(welcome, {
                headers: {
                    'content-type': 'text/html;charset=utf-8',
                    'cache-control': 'max-age=86400',
                    'etag': 'HelloNginx', // 协商缓存
                },
            });
        }

        const baseUrl = 'https://raw.githubusercontent.com';
        if (path.startsWith(`${baseUrl}/`)) {
            path = path.substring(baseUrl.length).replace(slashRegex, '');
        }

        let target = baseUrl;
        PathPrefix = env.PathPrefix || PathPrefix;
        if (PathPrefix) {
            let segments = PathPrefix.split('/');
            for (let i = 0; i < segments.length; i++) {
                if (!segments[i]) continue;
                if (!path.startsWith(`${segments[i]}/`)) break;
                path = path.substring(segments[i].length).replace(slashRegex, '');
            }
            target = `${target}/${PathPrefix}/${path}`;
        } else {
            target = `${target}/${path}`;
        }

        let tok = url.searchParams.get('token');
        Token = env.Token || Token;
        if ((tok || null) === (Token || null)) {
            tok = env.GithubToken || GithubToken;
        }

        request = new Request(target, request);
        if (tok) {
            request.headers.set('authorization', `token ${tok}`);
        }

        return await fetch(request)
    },
};

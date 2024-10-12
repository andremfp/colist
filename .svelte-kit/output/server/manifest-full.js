export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["apple-touch-icon.png","favicon-48x48.png","favicon.ico","favicon.svg","images/colist.png","images/github_dark.svg","images/github_light.svg","images/svelte-logo.svg","site.webmanifest","svelte-logo.svg","web-app-manifest-192x192.png","web-app-manifest-512x512.png","service-worker.js"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml",".webmanifest":"application/manifest+json"},
	_: {
		client: {"start":"_app/immutable/entry/start.Bcty1OzB.js","app":"_app/immutable/entry/app.CkV6cbg5.js","imports":["_app/immutable/entry/start.Bcty1OzB.js","_app/immutable/chunks/entry.DQhsLhOf.js","_app/immutable/chunks/scheduler.BRxxf2Ee.js","_app/immutable/entry/app.CkV6cbg5.js","_app/immutable/chunks/scheduler.BRxxf2Ee.js","_app/immutable/chunks/index.DvX7goLC.js"],"stylesheets":[],"fonts":[],"uses_env_dynamic_public":false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/lists",
				pattern: /^\/lists\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/lists/[id]",
				pattern: /^\/lists\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/register",
				pattern: /^\/register\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			}
		],
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

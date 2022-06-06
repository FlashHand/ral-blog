const {description} = require('../../package')
const { backToTopPlugin } = require('@vuepress/plugin-back-to-top')
const {mediumZoom} = require('@vuepress/plugin-medium-zoom');
const { prismjsPlugin } = require('@vuepress/plugin-prismjs')

const ralConfig = {
	/**
	 * Ref：https://v1.vuepress.vuejs.org/config/#title
	 */
	title: 'r4l-blog',
	/**
	 * Ref：https://v1.vuepress.vuejs.org/config/#description
	 */
	description: 'full stack and some other things💡',

	/**
	 * Extra tags to be injected to the page HTML `<head>`
	 *
	 * ref：https://v1.vuepress.vuejs.org/config/#head
	 */
	head: [
		['meta', {name: 'theme-color', content: '#3eaf7c'}],
		['meta', {name: 'apple-mobile-web-app-capable', content: 'yes'}],
		['meta', {name: 'apple-mobile-web-app-status-bar-style', content: 'black'}]
	],

	/**
	 * Theme configuration, here is the default theme configuration for VuePress.
	 *
	 * ref：https://v1.vuepress.vuejs.org/theme/default-theme-config.html
	 */
	themeConfig: {
		repo: '',
		editLinks: false,
		docsDir: '',
		editLinkText: '',
		lastUpdated: false,
		nav: [
			{
				text: 'iOS',
				ariaLabel: 'iOS Menu',
				items: [
					{text: 'WKWebView', link: '/iOS/WKWebView/'},
				]
			},
			{
				text: 'Github',
				link: 'https://github.com/FlashHand'
			}
		],
		sidebar: {
			// '/iOS/': [
			// 	{
			// 		title: 'iOS',
			// 		path:'/iOS/',
			// 		collapsable: true,
			// 		sidebarDepth:2,
			// 		children: [
			// 			'/iOS/WKWebView/',
			// 		]
			// 	}
			// ],
			'/iOS/WKWebView/': [
				{
					title: 'WKWebView',
					path: '/iOS/WKWebView/',
					// initialOpenGroupIndex: 1,
					collapsable: true,
					sidebarDepth: 1,
					children: [
						'swizzling-input-tag.md',
						'jspatch',
					]
				}
			],
		}
	},

	/**
	 * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
	 */
	plugins: [
		backToTopPlugin(),
		mediumZoom({}),
		prismjsPlugin({}),
	],
	chainWebpack: (config, isServer) => {
		config.module.rules.push = {
			test: /\.(png|svg|jpg|jpeg|gif)$/i,
			use: [
				'file-loader',
			],
		}
	}
};
export default ralConfig;

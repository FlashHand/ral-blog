const { prismjsPlugin } = require('@vuepress/plugin-prismjs')
const { searchPlugin } = require('@vuepress/plugin-search')

const plugins = [
	[
		prismjsPlugin({
			preloadLanguages: ['markdown', 'jsdoc', 'yaml','objectivec']
		}),
		searchPlugin({})
	]
];
export default plugins

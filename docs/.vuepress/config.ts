const { defaultTheme } = require('@vuepress/theme-default')
import plugins from './plugins';
import navbar from './navbar';
 import sidebar from './sidebar';

const ralConfig = {
	title: 'r4l-blog',
	description: 'full stack and some other things💡',
	head: [
		['meta', {name: 'theme-color', content: '#3eaf7c'}],
		['meta', {name: 'apple-mobile-web-app-capable', content: 'yes'}],
		['meta', {name: 'apple-mobile-web-app-status-bar-style', content: 'black'}]
	],
	theme: defaultTheme({
		navbar,
		sidebarDepth: 0,
		sidebar
	}),
	plugins
};
export default ralConfig;

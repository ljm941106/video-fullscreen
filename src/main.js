import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue(App)
app.$mount()

export default {
	// 这个字段走 app.json
	config: {
		// 页面前带有 ^ 符号的，会被编译成首页，其他页面可以选填，我们会自动把 webpack entry 里面的入口页面加进去
		pages: ['^pages/index/main'],
		window: {
			backgroundTextStyle: 'light',
			navigationBarBackgroundColor: '#fff',
			navigationBarTitleText: '视听版纳',
			navigationBarTextStyle: 'black',
			enablePullDownRefresh: true,
			onReachBottomDistance: 50,
		},
		tabBar: {
			color: '#999',
			selectedColor: '#333',
			borderStyle: 'white',
			backgroundColor: '#f8f9fb',
			list: [{
				text: '首页',
				pagePath: 'pages/index/main',
				iconPath: 'static/index.png',
				selectedIconPath: 'static/index_h.png'
			}, {
				text: '专题',
				pagePath: 'pages/dissertation/main',
				iconPath: 'static/pro.png',
				selectedIconPath: 'static/pro_h.png'
			}]
		}
	}
}
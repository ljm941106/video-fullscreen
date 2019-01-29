var Fly = require('flyio/dist/npm/wx')
var fly = new Fly()

fly.config.baseURL = 'https://stbn.bnjykj.com/index.php/phone/data/';

fly.interceptors.request.use((config, promise) => {
	wx.showLoading({
		title: '拼命加载中...'
	})
	return config
})

fly.interceptors.response.use(
	response => {
		wx.hideLoading()
		return response.data
	},
	(error, promise) => {
		wx.hideLoading()
		wx.showToast({
			title: err.message,
			icon: 'none'
		})
		return promise.resolve(error)
	}
)

export default fly
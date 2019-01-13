<template>
	<div>
		<!--<ul class="container log-list">
      <li v-for="(log, index) in logs" :class="{ red: aa }" :key="index" class="log-item">
      </li>
   </ul>-->
		<canvas :style="{width:width,height:height}" canvas-id="myCanvas"></canvas>
	</div>
</template>

<script>
	import { formatTime } from '@/utils/index'

	export default {
		components: {

		},

		data() {
			return {
				logs: [],
				width: '',
				height: '',
			}
		},

		created() {
			const logs = (wx.getStorageSync('logs') || [])
			this.logs = logs.map(log => formatTime(new Date(log)))
		},
		mounted() {
			var that = this
			const ctx = wx.createCanvasContext('myCanvas')
			wx.downloadFile({
				url: 'https://www.svlec.cn/qr_code/23.jpg',
				success: function(res1) {
					console.log(res1.tempFilePath);
					ctx.drawImage(res1.tempFilePath, 0, 0, windowWidth, windowHeight)
					ctx.draw();
				}
			})
			//			var bgPath = 'http://www.svlec.cn/public/static/img/banner.png'
			var portraitPath = 'http://www.svlec.cn/public/static/img/index.png'
			var hostNickname = 'pluie'

			var qrPath = 'http://www.svlec.cn/public/static/img/index.png'
			var windowWidth = wx.getSystemInfoSync().screenWidth
			var windowHeight = wx.getSystemInfoSync().screenHeight
			this.width = windowWidth + 'px';
			this.height = windowHeight + 'px';
			console.log(windowWidth, windowHeight)
			//绘制背景图片
			//			ctx.drawImage(bgPath, 0, 0, windowWidth, windowHeight)
			//绘制白色背景
			ctx.setFillStyle('white')
			ctx.fillRect(0, 0, windowWidth, windowHeight);
			//绘制第一段文本
			ctx.setFillStyle('#000')
			ctx.setFontSize(0.037 * windowWidth)
			ctx.setTextAlign('center')
			ctx.fillText(hostNickname + ' 正在参加疯狂红包活动', windowWidth / 2, 0.52 * windowWidth)
			//绘制第二段文本
			ctx.setFillStyle('#000')
			ctx.setFontSize(0.037 * windowWidth)
			ctx.setTextAlign('center')
			ctx.fillText('邀请你一起来领券抢红包啦~', windowWidth / 2, 0.57 * windowWidth)
			//绘制第三段文本
			ctx.setFillStyle('#000')
			ctx.setFontSize(0.037 * windowWidth)
			ctx.setTextAlign('center')
			ctx.fillText('长按二维码领红包', windowWidth / 2, 1.36 * windowWidth)
//			ctx.draw();
			setTimeout(() => {
				wx.canvasToTempFilePath({
					//					x: 0,
					//					y: 0,
					//					width: windowWidth,
					//					height: windowHeight,
					//					destWidth: windowWidth,
					//					destHeight: windowHeight,
					canvasId: 'myCanvas',
					success: function(res) {
						console.log('朋友圈分享图生成成功:' + res.tempFilePath)
						wx.previewImage({
							current: res.tempFilePath, // 当前显示图片的http链接
							urls: [res.tempFilePath] // 需要预览的图片http链接列表
						})
					},
					fail: function(err) {
						console.log('失败')
						console.log(err)
					}
				})
			}, 1000)
		}
	}
</script>

<style lang="scss">
	.canvas_con {
		width: 100vw;
		height: 100vh;
	}
</style>
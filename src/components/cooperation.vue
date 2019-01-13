<template>
	<div class="">
		<div class="operation">
			<div class="share" @click.stop="producePic">
				<img src="http://www.svlec.cn/public/static/img/share.png" />
			</div>
			<div class="like">
				<img src="http://www.svlec.cn/public/static/img/like.png" />&nbsp;58
			</div>
			<div class="comment">
				<img src="http://www.svlec.cn/public/static/img/comment.png" />&nbsp;78
			</div>
		</div>
		<view class="canvas-box">
			<canvas canvas-id="myCanvas"></canvas>
		</view>
		{{fullName}}
	</div>

</template>

<script>
	export default {
		props: ['imgUrl'],
		data() {
			return {
				scale: 1.618,
				windowWidth: ''
			}
		},
		mounted() {
			//			console.log(this.$root.$mp.query.pid)
		},
		methods: {
			producePic() {
				this.drawImage();
			},
			drawImage() {
				//绘制canvas图片
				var that = this
				const ctx = wx.createCanvasContext('myCanvas')
				var bgPath = 'http://www.svlec.cn/public/static/img/whitePlay.png'
				var portraitPath = this.imgUrl
				//				var hostNickname = app.globalData.userInfo.nickName

				//				var qrPath = that.data.qrcode_temp
				var windowWidth = 375
				//绘制背景图片
				ctx.drawImage(bgPath, 0, 0, windowWidth, that.scale * windowWidth)

				//绘制头像
				ctx.save()
				ctx.beginPath()
				ctx.arc(windowWidth / 2, 0.32 * windowWidth, 0.15 * windowWidth, 0, 2 * Math.PI)
				ctx.clip()
				ctx.drawImage(portraitPath, 0.7 * windowWidth / 2, 0.17 * windowWidth, 0.3 * windowWidth, 0.3 * windowWidth)
				ctx.restore()
				//绘制第一段文本
				ctx.setFillStyle('#ffffff')
				ctx.setFontSize(0.037 * windowWidth)
				ctx.setTextAlign('center')
				//				ctx.fillText(hostNickname + ' 正在参加疯狂红包活动', windowWidth / 2, 0.52 * windowWidth)
				//绘制第二段文本
				ctx.setFillStyle('#ffffff')
				ctx.setFontSize(0.037 * windowWidth)
				ctx.setTextAlign('center')
				ctx.fillText('邀请你一起来领券抢红包啦~', windowWidth / 2, 0.57 * windowWidth)
				//绘制二维码
				//				ctx.drawImage(qrPath, 0.64 * windowWidth / 2, 0.75 * windowWidth, 0.36 * windowWidth, 0.36 * windowWidth)
				//绘制第三段文本
				ctx.setFillStyle('#ffffff')
				ctx.setFontSize(0.037 * windowWidth)
				ctx.setTextAlign('center')
				ctx.fillText('长按二维码领红包', windowWidth / 2, 1.36 * windowWidth)
				ctx.draw();
			},
			canvasToImage() {
				var that = this
				wx.canvasToTempFilePath({
					x: 0,
					y: 0,
					width: that.windowWidth,
					height: that.windowWidth * that.scale,
					destWidth: that.windowWidth * 4,
					destHeight: that.windowWidth * 4 * that.scale,
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
			},
		}
	}
</script>

<style lang="scss">
	.operation {
		margin-top: 10rpx;
		display: flex;
		justify-content: flex-end;
		.like,
		.comment,
		.share {
			display: flex;
			align-items: center;
			justify-content: flex-end;
			height: 40rpx;
			width: 90rpx;
			font-size: 20rpx;
			color: #999;
		}
		.share {
			width: 40rpx;
		}
		img {
			width: 32rpx;
			height: 32rpx;
		}
	}
	
	.canvas-box {
		width: 100%;
		height: 0;
		position: fixed;
		left: 0;
		top: 0;
	}
</style>
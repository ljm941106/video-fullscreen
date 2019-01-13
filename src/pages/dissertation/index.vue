<template>
	<div class="container dissertation">
		<div class="class_con">
			<div class="class_list" v-for="(i,index) in list" :key="index" @click="gotoItemList('/pages/itemList/main?cid='+i.id)">
				<div class="img_con">
					<img class="img" :src="i.img" />
					<span class="num">{{i.num}}个视频</span>
				</div>
				<div class="intro">
					<h3>{{i.name}}</h3>
					<view class='date'>{{i.modtime}}更新</view>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import fly from '../../utils/fly'
	export default {
		data() {
			return {
				list: [],
				page: 1,
				totalPages: 1
			}
		},

		components: {

		},
		onShareAppMessage: function(res) {
			if(res.from === 'button') {
				// 来自页面内转发按钮
				console.log(res.target)
			}
			return {
				title: '',
				path: '/pages/dissertation/main',
				success: function(res) {
					// 转发成功
				},
				fail: function(res) {
					// 转发失败
				}
			}
		},
		mounted() {
			this.init()
		},
		onReachBottom() {
			if(this.totalPages > this.page) {
				this.loadMore()
			}
		},
		async onPullDownRefresh() {
			await this.init()
			wx.stopPullDownRefresh()
		},
		methods: {
			init() {
				fly.get('get_class').then(data => {
					this.list = data.data.list
					this.page = data.data.page
					this.totalPages = data.data.total_pages
				})
			},
			loadMore() {
				this.page++;
				fly.get('get_class', {
					page: this.page
				}).then(data => {
					data.data.list.forEach(i => {
						this.list.push(i)
					})
				})
			},
			gotoItemList(path) {
				wx.navigateTo({
					url: path
				})
			}
		},
	}
</script>

<style lang="scss">
	.dissertation {
		.class_con {
			width: 100vw;
			box-sizing: border-box;
			display: flex;
			justify-content: flex-start;
			flex-wrap: wrap;
			padding: 0 5vw;
			&::after {
				content: '';
				flex-grow: 1;
				flex-shrink: 1;
			}
		}
		.class_list {
			width: 42.5vw;
			margin-top: 30rpx;
			margin-right: 5vw;
			flex-shrink: 0;
			&:nth-child(2n){
				margin-right: 0;
			}
			.img_con {
				position: relative;
				width: 42.5vw;
				height: 42.5vw;
				overflow: hidden;
				border-radius: 10rpx;
				.num {
					position: absolute;
					right: 2vw;
					bottom: 2vw;
					color: #fff;
					font-size: 24rpx;
				}
				.img {
					width: 100%;
					height: 100%;
				}
			}
			.intro {
				margin-top: 16rpx;
				h3 {
					font-size: initial;
				}
				.date {
					font-size: 22rpx;
					color: #999;
				}
			}
		}
	}
</style>
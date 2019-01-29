<template>
  <div class="container index">
    <video class="video" id="videoPlay" :src="videoUrl" loop="true" @fullscreenchange='fullscreenchange' controls @ended="videoEnd" @play="onVideoplay"></video>
    <div class="item" v-for="(i,index) in list" wx:key="index">
      <div class="img" @click="playVideo(i,i.url)"> <img class="display_img" :src="i.img" /> <img class="absolute_play" src="https://stbn.bnjykj.com/public/static/img/whitePlay.png" /> </div>
      <div class="intro" @click="gotoItem('/pages/item/main?pid=' + i.id+'&cid='+i.class_id)">
        <h2>{{i.title}}</h2>
        <p :class="{low:!i.showP}">{{i.description}}</p>
        <div class="more">
          <span>{{i.modtime}}</span>
          <span @click.stop="slideP(i,index)">
						 <template v-if="!i.showP">
						 	<img src="https://stbn.bnjykj.com/public/static/img/drection_bottom.png"/>&nbsp;展开
						 </template>
						 <template v-else>
						 	<img src="https://stbn.bnjykj.com/public/static/img/drection_top.png"/>&nbsp;收起
						 </template>
					</span>
        </div>
        <div class="operation">
          <div class="share" @click.stop="producePoster(i.img,i.title,i.times,i.description,i.qr_code,i.id)">
            <img src="https://stbn.bnjykj.com/public/static/img/share.png" />
          </div>
          <div class="like" @click.stop="like(i)">
            <img v-if="!i.liked" src="https://stbn.bnjykj.com/public/static/img/like.png" /><img src="https://stbn.bnjykj.com/public/static/img/liked.png" v-if="i.liked" /><span>{{i.likes}}</span>
          </div>
          <div class="comment" @click.stop="gotoComment('/pages/item/main?pid=' + i.id+'&cid='+i.class_id+'&s=s')">
            <img src="https://stbn.bnjykj.com/public/static/img/comment.png" /> <span>{{i.comment_nums}}</span>
          </div>
        </div>
        <div class="canvas_box" :style="{width:canvasWidth+'px',height:canvasHeight+'px'}">
          <canvas style="width: 100%;height: 100%;" :canvas-id="i.id"></canvas>
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
        totalPages: 1,
        theVideo: '',
        videoUrl: '',
        theVideo: '',
        videoLength: 0,
        shareShow: false,
        shareImg: 'https://stbn.bnjykj.com/public/static/img/banner.png',
        shareTitle: '测试标题',
        canvasToImg: '',
        sharedImg: false, //展示海报
        likedList: [], //用户点赞列表
        canvasWidth: '375',
        canvasHeight: '667',
      }
    },
    components: {},
    onShareAppMessage: function(res) {
      if(res.from === 'button') {
        // 来自页面内转发按钮
        console.log(res.target)
      }
      return {
        title: '',
        path: '/pages/itemList/main',
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    },
    mounted() {
      this.classID = this.$root.$mp.query.cid
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
        fly.get('get_list', {
          class_id: this.classID
        }).then(data => {
          data.data.list.forEach(i => {
            i.showP = false
          })
          this.list = data.data.list
          this.page = data.data.page
          this.totalPages = data.data.total_pages
        })
      },
      loadMore() {
        this.page++;
        fly.get('get_list', {
          class_id: this.classID,
          page: this.page
        }).then(data => {
          data.data.list.forEach(i => {
            i.showP = false
          })
          data.data.list.forEach(i => {
            this.list.push(i)
          })
        })
      },
      slideP(i, index) {
        i.showP = !i.showP;
      },
      playVideo(i, videoUrl) {
        this.videoUrl = videoUrl;
        this.direction = i.direction;
        wx.showLoading({
          title: '视频加载中...'
        })
        setTimeout(() => {
          this.theVideo = wx.createVideoContext('videoPlay')
          this.theVideo.play();
        }, 500)
      },
      //视频开始播放
      onVideoplay() {
        let direction = '';
        if(this.direction == 1) {
          direction = 90
        } else if(this.direction == 2) {
          direction = 0
        }
        this.theVideo.requestFullScreen({
          direction: direction
        })
        wx.hideLoading()
      },
      //视频播放结束
      videoEnd() {
        this.theVideo = wx.createVideoContext('videoPlay');
        setTimeout(() => {
          this.theVideo.stop()
          this.theVideo.exitFullScreen()
        }, 500)
      },
      fullscreenchange(e) {
        if(!e.mp.detail.fullScreen) {
          this.theVideo = wx.createVideoContext('videoPlay');
          setTimeout(() => {
            this.theVideo.pause();
            this.videoUrl = ''
          }, 500)
        }
      },
      gotoItem(path) {
        wx.navigateTo({
          url: path
        })
      },
      producePoster(img, title, times, description, qrCode, canvasID) {
        wx.showLoading({
          title: '生成中...',
        })
        const ctx = wx.createCanvasContext(canvasID) //初始化canvas画图
        const _this = this;
        //修改http为https
        let reg = /^http:\/\//;
        img = img.replace(reg, 'https://');
        //获取分享背景
        let getBgImg = new Promise((resovle, reject) => {
          wx.downloadFile({
            url: 'https://stbn.bnjykj.com/public/static/img/timg.jpg',
            success: function(qrCode) {
              resovle(qrCode)
            }
          })
        })
        //获取分享主图
        let getMainImg = new Promise((resovle, reject) => {
          wx.downloadFile({
            url: img,
            success: function(qrCode) {
              resovle(qrCode)
            }
          })
        })
        //获取小程序码
        let getQrCodeImg = new Promise((resovle, reject) => {
          wx.downloadFile({
            url: qrCode,
            success: function(qrCode) {
              resovle(qrCode)
            }
          })
        })
        Promise.all([getBgImg, getMainImg, getQrCodeImg]).then(data => {
          //绘制背景图片

          ctx.drawImage(data[0].tempFilePath, 0, 0, this.canvasWidth, this.canvasHeight)
          //绘制主图
          ctx.drawImage(data[1].tempFilePath, 0.1 * this.canvasWidth, 0.1 * this.canvasHeight, 0.8 * this.canvasWidth, 0.45 * this.canvasWidth)
          //绘制白色背景

          ctx.setFillStyle('white')
          ctx.fillRect(0.1 * this.canvasWidth, 0.55 * this.canvasWidth, 0.8 * this.canvasWidth, (this.canvasHeight - (0.7 * this.canvasWidth)));
          //绘制视频标题
          ctx.setFillStyle('#000')
          ctx.setFontSize(20)
          ctx.setTextAlign('center');
          let titleTop = 0.65;
          for(let k = 0; k < title.length; k += 11) {
            ctx.fillText(title.substring(k, k + 11), 0.5 * this.canvasWidth, titleTop * this.canvasWidth, 0.8 * this.canvasWidth)
            ctx.fillText(title.substring(k, k + 11), 0.5025 * this.canvasWidth, titleTop * this.canvasWidth, 0.8 * this.canvasWidth);
            titleTop += 0.07
          }
          if(times) {
            //绘制视频长度
            ctx.setTextAlign('left')
            ctx.setFontSize(16)
            ctx.fillText('时长', 0.4 * this.canvasWidth, 0.81 * this.canvasWidth)
            ctx.fillText('时长', 0.4025 * this.canvasWidth, 0.81 * this.canvasWidth)
            ctx.fillText(times, 0.525 * this.canvasWidth, 0.81 * this.canvasWidth)
          }
          //分割线
          ctx.setLineDash([1, 3], 0)
          ctx.setStrokeStyle('Gray')
          ctx.beginPath()
          ctx.moveTo(0.14 * this.canvasWidth, 0.85 * this.canvasWidth)
          ctx.lineTo(0.86 * this.canvasWidth, 0.85 * this.canvasWidth)
          ctx.stroke()
          //绘制描述
          let lastTop = 0.95;
          ctx.setFillStyle('#000')
          ctx.setFontSize(14)
          ctx.setTextAlign('left')
          for(let k = 0; k < 50; k += 19) {
            if(k > 38) {
              ctx.fillText(description.substring(k, k + 19) + '...', 0.145 * this.canvasWidth, lastTop * this.canvasWidth)
            } else {
              ctx.fillText(description.substring(k, k + 19), 0.145 * this.canvasWidth, lastTop * this.canvasWidth)
            }
            lastTop += 0.05;
          }

          //分割线
          ctx.setLineDash([1, 3], 0)
          ctx.setStrokeStyle('Gray')
          ctx.beginPath()
          ctx.moveTo(0.14 * this.canvasWidth, 1.13 * this.canvasWidth)
          ctx.lineTo(0.86 * this.canvasWidth, 1.13 * this.canvasWidth)
          ctx.stroke()
          //					//绘制小圆点
          //					ctx.arc(0.12 * this.canvasWidth, 1.135 * this.canvasWidth, 50, 0, 2 * Math.PI)
          //					ctx.setFillStyle('transparent')
          //					ctx.fill()
          //绘制小程序码
          ctx.drawImage(data[2].tempFilePath, 0.15 * this.canvasWidth, 1.2 * this.canvasWidth, 0.36 * this.canvasWidth, 0.36 * this.canvasWidth)
          //绘制小程序码介绍
          ctx.setFillStyle('#000')
          ctx.setFontSize(14)
          ctx.setTextAlign('left')
          ctx.fillText('长按小程序码查看', .55 * this.canvasWidth, 1.32 * this.canvasWidth);
          ctx.setFillStyle('#000')
          ctx.setFontSize(20)
          ctx.setTextAlign('left')
          ctx.fillText('视听版纳', .55 * this.canvasWidth, 1.42 * this.canvasWidth)
          ctx.fillText('视听版纳', .5525 * this.canvasWidth, 1.42 * this.canvasWidth)
          //绘制
          ctx.draw();

          setTimeout(() => {
            wx.canvasToTempFilePath({
              canvasId: canvasID,
              success: function(res) {
                wx.previewImage({
                  current: res.tempFilePath, // 当前显示图片的http链接
                  urls: [res.tempFilePath] // 需要预览的图片http链接列表
                })
              },
              fail: function(res) {
                console.log(res)
              }
            })
            wx.hideLoading()
          }, 500)
        })
      },
      like(i) {
        if(i.liked) {
          fly.post('not_like', {
            id: i.id
          }).then((data) => {
            if(data.code == 1) {
              i.likes--;
              i.liked = false;
              for(let j in this.likedList) {
                if(this.likedList[j] == i.id) {
                  this.likedList.splice(j, 1)
                }
              }
              wx.setStorageSync('likedList', this.likedList)
            } else {
              wx.showToast({
                title: '系统错误，请稍候重试',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else {
          fly.post('like', {
            id: i.id
          }).then((data) => {
            if(data.code == 1) {
              i.likes++;
              i.liked = true;
              this.likedList.push(i.id)
              wx.setStorageSync('likedList', this.likedList)
            } else {
              wx.showToast({
                title: '系统错误，请稍候重试',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      },
      gotoComment(path) {
        wx.navigateTo({
          url: path
        })
      }
    },
  }
</script>
<style lang="scss">
  .index {
    .item {
      position: relative;
      margin-bottom: 40rpx;
      .img {
        width: 100vw;
        height: 56.25vw;
        position: relative;
        .display_img {
          width: 100%;
          height: 100%;
        }
        .absolute_play {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 100rpx;
          height: 100rpx;
        }
      }
      .video {
        position: absolute;
        left: 0;
        top: 0;
        width: 0;
        height: 0;
        overflow: hidden;
      }
      .intro {
        padding: 0 40rpx;
        h2 {
          margin: 30rpx 0 20rpx;
          font-size: 38rpx;
          color: #333;
        }
        p {
          font-size: 28rpx;
          color: #666;
          &.low {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
          }
        }
        .more {
          margin-top: 20rpx;
          display: flex;
          justify-content: space-between;
          span {
            font-size: 22rpx;
            color: #aaa;
            img {
              width: 32rpx;
              height: 32rpx;
              vertical-align: bottom;
            }
          }
        }
      }
    }
    .search {
      width: calc(100vw - 80rpx);
      margin: 0 auto 20rpx;
      background: #eee;
      color: #999;
      font-size: 32rpx;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 40rpx;
      text-align: center;
      img {
        vertical-align: middle;
        margin-top: -3rpx;
      }
    }
  }
  
  .operation {
    margin-top: 10rpx;
    display: flex;
    justify-content: flex-end;
    .like,
    .comment,
    .share {
      display: flex;
      justify-content: flex-end;
      align-items: stretch;
      line-height: 40rpx;
      height: 40rpx;
      width: 90rpx;
      font-size: 20rpx;
      color: #999;
    }
    .share {
      width: 40rpx;
    }
    img {
      margin-right: 6rpx;
      width: 32rpx;
      height: 32rpx;
    }
  }
  
  .canvas_box {
    z-index: 9;
    position: fixed;
    left: 99999999rpx;
    top: -99999999rpx;
  }
</style>
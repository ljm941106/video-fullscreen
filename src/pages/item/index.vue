<template>
  <div class="container item_info">
    <div class="item">
      <video class="video" id='itemVideoPlay' :direction="direction" @fullscreenchange="fullscreenchange" @ended="videoEnd" @play="onVideoplay" :src="item.url" controls>
      </video>
      <div class="img" @click="playVideo()">
        <img class="display_img" :src="item.img" />
        <img class="absolute_play" src="http://www.svlec.cn/public/static/img/whitePlay.png" />
      </div>
      <div class="intro">
        <h2>{{item.title}}</h2>
        <p>{{item.description}}</p>
        <!--<p>标签：宝能/万科</p>-->
        <div class="more">
          <span>{{item.modtime}}</span>
        </div>
        <div class="operation">
          <div class="share" @click.stop="producePoster(item.img,item.title,item.times,item.description,item.qr_code)">
            <img src="http://www.svlec.cn/public/static/img/share.png" />
          </div>
          <div class="like" @click.stop="like(i)">
            <img v-if="!liked" src="http://www.svlec.cn/public/static/img/like.png" /><img src="http://www.svlec.cn/public/static/img/liked.png" v-else="" /><span>{{item.likes}}</span>
          </div>
          <div class="comment_num">
            <img src="http://www.svlec.cn/public/static/img/comment.png" /><span>{{item.comment_nums}}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="related" v-if="relatedList.length>0">
      <h3>相关视频</h3>
      <swiper class="swiper_con" :indicator-dots="false" :autoplay="false" :interval="5000" :duration="500" display-multiple-items="1.5" next-margin="30rpx">
        <block v-for="(i,index) in relatedList" :key="index">
          <swiper-item class='swiper_item' @click="gotoOtherItem('/pages/item/main?pid=' + i.id+'&cid='+i.class_id)">
            <div class="img">
              <image :src="i.img" class="slide-image" />
            </div>
            <div class="title">
              {{i.title}}
            </div>
          </swiper-item>
        </block>
      </swiper>
    </div>
    <div class="comment_list" id="comment_list">
      <div class="comment_item" v-for="i in commentList" :key='i.id'>
        <div class="time">
          {{i.addtime}}
        </div>
        <div class="content">
          {{i.content}}
        </div>
      </div>
    </div>
    <div class="comment_box">
      <div class="comment" :class="{active:!commentNormal}">
        <div class="comment_normal" v-if="commentNormal" @click="showCommentCon">我来说几句</div>
        <div class="comment_con" v-if="!commentNormal">
          <textarea placeholder="发表你的评论吧" v-model="commentInfo"></textarea>
          <div class="comment_operation">
            <button type="warn" @click="closeCommentCon">取消</button>
            <button type="primary" @click="submitComment">确定</button>
          </div>
        </div>
      </div>
    </div>
    <div class="canvas_box" :style="{width:canvasWidth+'px',height:canvasHeight+'px'}">
      <canvas style="width: 100%;height: 100%;" canvas-id="myCanvas"></canvas>
    </div>
  </div>
</template>

<script>
  import fly from '../../utils/fly'
  export default {
    data() {
      return {
        item: '',
        relatedList: [],
        lower: true,
        direction: '',
        showImg: true,
        commentNormal: true,
        commentInfo: '', //发表评论
        commentList: [], //评论列表
        commentListTotalPages: 1, //评论列表总页数
        commentListPage: 1, //当前列表页数
        liked: false,
        likedList: [], //用户点赞列表
        canvasWidth: '375',
        canvasHeight: '667',
        sceneTest: ''
      }
    },

    components: {

    },
    //分享
    onShareAppMessage: function(res) {
      if(res.from === 'button') {
        // 来自页面内转发按钮
        console.log(res.target)
      }
      return {
        title: '',
        path: '/pages/item/main?pid=' + this.productID + '&cid=' + this.classID,
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    },
    //上拉加载
    onReachBottom() {
      if(this.commentListTotalPages > this.commentListPage) {
        this.commentLoadMore()
      }
    },
    //		onLoad: function(options) {
    //			// options 中的 scene 需要使用 decodeURIComponent 才能获取到生成二维码时传入的 scene
    //			var scene = decodeURIComponent(options.scene)
    //			console.log(scene)
    //			//				this.sceneTest=scene
    //		},
    mounted() {
      let scene = decodeURIComponent(this.$root.$mp.query.scene)
      let division = scene.indexOf('&');
      let pid = scene.substring(4, division);
      let cid = scene.substring(division + 5);
      this.sceneTest = scene
      //页面信息
      this.productID = this.$root.$mp.query.pid ? this.$root.$mp.query.pid : pid;
      this.classID = this.$root.$mp.query.cid ? this.$root.$mp.query.cid : cid;

      console.log(this.productID)
      console.log(this.classID)
      console.log(pid)
      console.log(cid)
      //设备信息
      let sysInfo = wx.getSystemInfoSync();
      this.canvasWidth = sysInfo.screenWidth;
      this.canvasHeight = sysInfo.screenHeight;
      //滚动到评论
      //			if(this.$root.$mp.query.s) {
      //				wx.pageScrollTo({
      //					scrollTop: 300,
      //					duration: 300
      //				})
      //			}
      //视频信息
      fly.get('get_info', {
        id: this.productID
      }).then(data => {
        if(data.data.direction == 1) {
          this.direction = 90
        } else if(data.data.direction == 2) {
          this.direction = 0
        }
        this.item = data.data;
        this.likedList = wx.getStorageSync('likedList') ? wx.getStorageSync('likedList') : [];
        this.likedList.forEach(k => {
          if(k == this.productID) {
            this.liked = true
          }
        })
      })
      //相关推荐
      fly.get('get_relative', {
        class_id: this.classID,
        id: this.productID
      }).then(data => {
        this.relatedList = data.data
      })
      //视频评论
      fly.get('get_comment', {
        id: this.productID
      }).then(data => {
        data.data.list.forEach(i => {
          let time = new Date(i.addtime * 1000)
          i.addtime = time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
        })
        this.commentList = data.data.list
        this.commentListTotalPages = data.data.total_pages
        this.commentListPage = data.data.page
      })
    },
    methods: {
      gotoOtherItem(path) {
        wx.navigateTo({
          url: path
        })
      },
      playVideo() {
        this.theVideo = wx.createVideoContext('itemVideoPlay');
        wx.showLoading({
          title: '视频加载中...'
        })
        //      setTimeout(() => {
        this.theVideo.play()
        //      }, 500)
      },
      onVideoplay() {
        let direction = '';
        if(this.item.direction == 1) {
          direction = 90
        } else if(this.item.direction == 2) {
          direction = 0
        }
//      this.theVideo = wx.createVideoContext('itemVideoPlay');
        this.theVideo.requestFullScreen({
          direction: direction
        });
        wx.hideLoading()
      },
      //视频播放结束
      videoEnd() {
        this.theVideo = wx.createVideoContext('itemVideoPlay')
        this.theVideo.exitFullScreen()
        this.theVideo.pause()
      },
      fullscreenchange(e) {
        if(!e.mp.detail.fullScreen) {
          this.theVideo = wx.createVideoContext('itemVideoPlay');
          this.theVideo.pause()
        }
      },
      showCommentCon() {
        this.commentNormal = false
      },
      closeCommentCon() {
        this.commentNormal = true
      },
      submitComment() {
        if(this.commentInfo.length > 0) {
          fly.post('comment', {
            id: this.productID,
            content: this.commentInfo
          }).then(data => {
            if(data.code == 1) {
              wx.showToast({
                title: '评论成功，等待审核',
                icon: 'none',
                duration: 2000
              })
              this.commentInfo = '';
            } else {
              wx.showToast({
                title: '系统错误，请稍候再试',
                icon: 'none',
                duration: 2000
              })
            }
            this.commentNormal = true
          })
        } else {
          wx.showToast({
            title: '不能发送空评论',
            icon: 'none',
            duration: 2000
          })
        }
      },
      commentLoadMore() {
        this.commentListPage++;
        fly.get('get_comment', {
          id: this.productID,
          page: this.commentListPage
        }).then(data => {
          data.data.list.forEach(i => {
            let time = new Date(i.addtime * 1000)
            i.addtime = time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate() + ' ' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
            this.commentList.push(i)
          })
        })
      },
      //点赞
      like() {
        if(this.liked) {
          fly.post('not_like', {
            id: this.productID
          }).then((data) => {
            if(data.code == 1) {
              this.item.likes--;
              this.liked = false;
              for(let j in this.likedList) {
                if(this.likedList[j] == this.productID) {
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
            id: this.productID
          }).then((data) => {
            if(data.code == 1) {
              this.item.likes++;
              this.liked = true;
              this.likedList.push(this.productID)
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
      producePoster(img, title, times, description, qrCode) {
        wx.showLoading({
          title: '生成中...',
        })
        const ctx = wx.createCanvasContext('myCanvas') //初始化canvas画图
        const _this = this;
        //获取手机屏幕信息
        //修改http为https
        let reg = /^http:\/\//;
        img = img.replace(reg, 'https://');
        //获取分享背景
        let getBgImg = new Promise((resovle, reject) => {
          wx.downloadFile({
            url: 'https://www.svlec.cn/public/static/img/timg.jpg',
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
          //					console.log(data[1].tempFilePath)
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
          ctx.setTextAlign('center')
          let titleTop = 0.65;
          for(let k = 0; k < title.length; k += 11) {
            ctx.fillText(title.substring(k, k + 11), 0.5 * this.canvasWidth, titleTop * this.canvasWidth, 0.8 * this.canvasWidth)
            ctx.fillText(title.substring(k, k + 11), 0.5025 * this.canvasWidth, titleTop * this.canvasWidth, 0.8 * this.canvasWidth);
            titleTop += 0.07
          }
          //绘制视频长度
          ctx.setTextAlign('left')
          ctx.setFontSize(16)
          ctx.fillText('时长', 0.4 * this.canvasWidth, 0.81 * this.canvasWidth)
          ctx.fillText('时长', 0.4025 * this.canvasWidth, 0.81 * this.canvasWidth)
          ctx.fillText(times, 0.525 * this.canvasWidth, 0.81 * this.canvasWidth)
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
              //										x: 0,
              //										y: 0,
              //										width: this.canvasWidth,
              //										height: this.canvasHeight,
              //										destWidth: this.canvasWidth,
              //										destHeight: this.canvasHeight,
              canvasId: 'myCanvas',
              success: function(res) {
                console.log(res.tempFilePath);
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
    },
  }
</script>

<style lang="scss">
  .item_info {
    .item {
      width: 100%;
      .img {
        position: relative;
        width: 100vw;
        height: 56.25vw;
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
      .intro {
        width: calc(100vw - 80rpx);
        margin: 0 auto;
        padding-bottom: 40rpx;
        border-bottom: 1rpx solid #e5e5e5;
        h2 {
          margin: 30rpx 0 20rpx;
          font-size: 38rpx;
          color: #333;
        }
        p {
          font-size: 28rpx;
          color: #666;
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
    .related {
      width: 100%;
      h3 {
        padding-left: 40rpx;
        font-weight: bold;
        line-height: 100rpx;
      }
      .swiper_con {
        width: 100%;
        height: 50vw;
      }
      .swiper_item {
        box-sizing: border-box;
        padding-left: 40rpx;
      }
      .img {
        width: 100%;
        height: calc(36vw - 22.5rpx);
        border-radius: 15rpx;
        overflow: hidden;
        image {
          width: 100%;
          height: 100%;
        }
      }
      .title {
        margin-top: 10rpx;
        font-size: 28rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
  
  .comment_box {
    height: 70rpx;
  }
  
  .comment {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 70rpx;
    padding: 10rpx 3vw;
    box-sizing: border-box;
    overflow: hidden;
    transition: .3s;
    background: #ffffff;
    &.active {
      height: 100vh;
    }
    .comment_normal {
      width: 100%;
      height: 50rpx;
      line-height: 50rpx;
      padding: 0 10rpx;
      background: #f5f5f5;
      border-radius: 6rpx;
      color: #999999;
      font-size: 24rpx;
    }
    .comment_con textarea {
      padding: 10rpx;
      width: 100%;
      min-height: 200rpx;
      border-radius: 10rpx;
      border: #E5E5E5 solid 2rpx;
    }
    .comment_operation {
      margin-top: 50rpx;
      display: flex;
      justify-content: center;
      button {
        width: 200rpx;
        margin: 0 40rpx;
      }
    }
  }
  
  .comment_list {
    width: 100%;
    padding: 0 40rpx;
    .comment_item {
      border-bottom: 1rpx solid #E5E5E5;
      padding: 10rpx 0;
      &:last-child {
        border-bottom: none;
      }
    }
    .time {
      color: #999999;
      text-align: left;
      font-size: .24rem;
    }
    .content {
      margin-top: 10rpx;
    }
  }
  
  .operation {
    margin-top: 10rpx;
    display: flex;
    justify-content: flex-end;
    .like,
    .comment_num,
    .share {
      display: flex;
      justify-content: flex-end;
      align-items: stretch;
      line-height: 40rpx;
      height: 40rpx;
      width: 90rpx;
      font-size: 20rpx;
      color: #999;
      span {
        font-size: 20rpx;
      }
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
    left: 0;
    top: -99999999rpx;
  }
</style>
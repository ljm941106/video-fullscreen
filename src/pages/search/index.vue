<template>
  <div class="search_page">
    <video class="video" id="videoPlay" :src="videoUrl" loop="true" @fullscreenchange='fullscreenchange' controls @ended="videoEnd" @play="onVideoplay"></video>
    <div class="search_box">
      <img src="http://www.svlec.cn/public/static/img/search.png" style="width: 27rpx;height: 30rpx;" />
      <input type="search" v-model.lazy="keyword" placeholder="搜索" @keypress="keySearch($event)" @change="search()" />
    </div>
    <div class="searched_list" v-if="list.length>0">
      <div class="item" v-for="(i,index) in list" wx:key="index">
        <div class="img" @click="playVideo(i,i.url)">
          <img class="display_img" :src="i.img" />
          <img class="absolute_play" src="http://www.svlec.cn/public/static/img/whitePlay.png" />
        </div>
        <div class="intro" @click="gotoItem('/pages/item/main?pid=' + i.id+'&cid='+i.class_id)">
          <h2>{{i.title}}</h2>
          <p :class="{low:!i.showP}">{{i.description}}</p>
          <div class="more">
            <span>{{i.modtime}}</span>
            <span @click.stop="slideP(i,index)">
						 <template v-if="!i.showP">
						 <img src="http://www.svlec.cn/public/static/img/drection_bottom.png"/>&nbsp;展开
						 </template>
						 <template v-else="">
						 <img src="http://www.svlec.cn/public/static/img/drection_top.png"/>&nbsp;收起
						 </template>
					</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="list.length==0&&searchedHistory.length>0" class="search_history">
      <div class="title">
        <strong>搜索历史</strong>
        <span>清空历史记录</span>
      </div>
      <ul>
        <li v-for="(i,index) in searchedHistory" :key="index" @click="historyToSearch(i)">
          <img src="http://www.svlec.cn/public/static/img/search.png" style="width: 27rpx;height: 30rpx;" />
          <span>{{i}}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import fly from '../../utils/fly'
  export default {
    components: {

    },
    data() {
      return {
        keyword: '',
        list: [],
        searchedHistory: [],
        theVideo: '',
        videoUrl: ''
      }
    },
    onShareAppMessage: function(res) {
      if(res.from === 'button') {
        // 来自页面内转发按钮
        console.log(res.target)
      }
      return {
        title: '',
        path: '/pages/search/main',
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    },
    mounted() {
      this.historyInit()
    },
    methods: {
      historyInit() {
        this.searchedHistory = wx.getStorageSync('searchedHistory') || []
      },
      search() {
        let keyword = this.keyword.trim()
        if(keyword.length > 0) {
          fly.get('get_list', {
            keyword: keyword
          }).then(data => {
            if(data.data.list.length == 0) {
              wx.showToast({
                title: '暂无搜索结果',
                icon: 'none',
                duration: 2000
              })
            } else {
              data.data.list.forEach(i => {
                i.showP = false
              })
              this.list = data.data.list
              this.page = data.data.page
              this.totalPages = data.data.total_pages
              //历史记录
              if(this.searchedHistory.length > 0) {
                let indexed, flag = this.searchedHistory.some(i => {
                  return i == keyword
                })
                this.searchedHistory.some((i, index) => {
                  if(i == keyword) {
                    indexed = index
                  }
                })

                if(flag) {
                  this.searchedHistory.splice(indexed, 1)
                  this.searchedHistory.unshift(keyword)
                  wx.setStorage({
                    key: "searchedHistory",
                    data: this.searchedHistory
                  })
                } else {
                  this.searchedHistory.unshift(keyword)
                  wx.setStorage({
                    key: "searchedHistory",
                    data: this.searchedHistory
                  })
                }
              } else {
                this.searchedHistory.unshift(keyword)
                wx.setStorage({
                  key: "searchedHistory",
                  data: this.searchedHistory
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '请输入搜索条件',
            icon: 'none',
            duration: 2000
          })
        }
      },
      keySearch(e) {
        if(e.keyCode == 13) {
          this.search()
        }
      },
      historyToSearch(keyword) {
        fly.get('get_list', {
          keyword: keyword
        }).then(data => {
          if(data.data.list.length == 0) {
            wx.showToast({
              title: '暂无搜索结果',
              icon: 'none',
              duration: 2000
            })
          } else {
            data.data.list.forEach(i => {
              i.showP = false
            })
            this.list = data.data.list
            this.page = data.data.page
            this.totalPages = data.data.total_pages
            //历史记录
            if(this.searchedHistory.length > 0) {
              let indexed, flag = this.searchedHistory.some(i => {
                return i == keyword
              })
              this.searchedHistory.some((i, index) => {
                if(i == keyword) {
                  indexed = index
                }
              })
              if(flag) {
                this.searchedHistory.splice(indexed, 1)
                this.searchedHistory.unshift(keyword)
                wx.setStorage({
                  key: "searchedHistory",
                  data: this.searchedHistory
                })
              } else {
                this.searchedHistory.unshift(keyword)
                wx.setStorage({
                  key: "searchedHistory",
                  data: this.searchedHistory
                })
              }
            } else {
              this.searchedHistory.unshift(keyword)
              wx.setStorage({
                key: "searchedHistory",
                data: this.searchedHistory
              })
            }
          }
        })
      },
      slideP(i, index) {
        i.showP = !i.showP
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
      }
    }
  }
</script>

<style lang="scss">
  .search_page {
    .search_box {
      width: calc(100vw - 80rpx);
      display: flex;
      align-items: center;
      background: #eee;
      height: 80rpx;
      margin: 0 auto;
      overflow: hidden;
      border-radius: 40rpx;
      input {
        width: 100%;
        color: #999;
      }
      img {
        flex-shrink: 0;
        margin: 5rpx 20rpx 0 20rpx;
      }
    }
    .search_history {
      margin-top: 20rpx;
      padding: 0 40rpx;
      .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100rpx;
      }
      strong {
        font-size: 40rpx;
        font-weight: bold;
      }
      span {
        font-size: 28rpx;
        color: #999;
      }
      li {
        display: flex;
        height: 80rpx;
        justify-content: flex-start;
        border-top: 1rpx solid #E5E5E5;
        align-items: center;
        img {
          margin-top: 5rpx;
          margin-right: 15rpx;
        }
      }
    }
    .searched_list {
      margin-top: 40rpx;
    }
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
  }
</style>
//index.js
var util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    feed: [],
    feed_length: 0
  },
  /**
   * 项目点击函数
   */
  bindEventTap: function() {
    wx.navigateTo({
      url: '../answer/answer'
    })
  },
  /**
   * ‘创建协游’按钮点击函数
   */
  bindCreateEvent: function() {
    if (app.globalData.userInfo.openid == "") { //未登录，跳转登陆页面
      wx.switchTab({
        url: '../more/more',
      })
      wx.showToast({
        title: '您未登录，请先登录！',
        icon: 'none',
        duration: 2000
      })
    } else { // 已登录，跳转创建页面
      wx.navigateTo({
        url: '../event/event'
      })
    }
  },
  /**
   * 页面显示函数
   */
  onShow: function() {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    //this.getData();
    wx.cloud.callFunction({
      name: 'queryEvent',
      complete: res => {
        this.setData({
          feed: res.result.queryRes.data
        });
      }
    })
    wx.getSetting({
      success: function(res) {
        //如果用户已经授权过
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function(res) {
              console.log(res.userInfo)
              //调用云函数登录
              wx.cloud.callFunction({
                name: 'queryUser',
                complete: res => {
                  console.log('queryUser调用结果:', res)
                  if (res.result.query) { // 用户已注册
                    var resData = res.result.queryRes.data[0]
                    // 将数据库查询结果保存全局变量
                    app.globalData.userInfo.openid = resData.openid
                    app.globalData.userInfo.avatarUrl = resData.avatarUrl
                    app.globalData.userInfo.nickName = resData.nickName
                    app.globalData.userInfo.gender = resData.gender
                    app.globalData.userInfo.region = resData.region
                  }
                }
              })
            }
          })
        }
      }
    })
  },
  upper: function() {
    wx.showNavigationBarLoading()
    this.refresh();
    console.log("upper");
    setTimeout(function() {
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    }, 2000);
  },
  lower: function(e) {
    wx.showNavigationBarLoading();
    var that = this;
    setTimeout(function() {
      wx.hideNavigationBarLoading();
      that.nextLoad();
    }, 1000);
    console.log("lower")
  },

  //网络请求数据, 实现首页刷新
  refresh0: function() {
    var index_api = '';
    util.getData(index_api)
      .then(function(data) {
        //this.setData({
        //
        //});
        console.log(data);
      });
  },

  //使用本地 fake 数据实现刷新效果
  getData: function() {
    var feed = util.getData2();
    console.log("loaddata");
    var feed_data = feed.data;
    this.setData({
      feed: feed_data,
      feed_length: feed_data.length
    });
  },
  refresh: function() {
    wx.showToast({
      title: '刷新中',
      icon: 'loading',
      duration: 3000
    });
    var feed = util.getData2();
    console.log("loaddata");
    var feed_data = feed.data;
    this.setData({
      feed: feed_data,
      feed_length: feed_data.length
    });
    setTimeout(function() {
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 2000
      })
    }, 3000)

  },

  //使用本地 fake 数据实现继续加载效果
  nextLoad: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 4000
    })
    var next = util.getNext();
    console.log("continueload");
    var next_data = next.data;
    this.setData({
      feed: this.data.feed.concat(next_data),
      feed_length: this.data.feed_length + next_data.length
    });
    setTimeout(function() {
      wx.showToast({
        title: '加载成功',
        icon: 'success',
        duration: 2000
      })
    }, 3000)
  }


})
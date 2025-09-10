<template>
  <el-row :gutter="20" type="flex" align="middle" class="header-container">
    <el-col :xs="24" :sm="8" :md="6">
      <div class="header-title-container" id="main">
        <!-- ECharts 动画区域 -->
      </div>
    </el-col>
    <el-col :xs="24" :sm="16" :md="12" class="nav-container">
      <el-button type="text" class="nav-button" @click="navigateTo('/contractlist')">合同列表</el-button>
      <el-button type="text" class="nav-button" @click="navigateTo('/createcontract')">创建合同</el-button>
      <el-button type="text" class="nav-button" @click="navigateTo('/templatemanagement')">模板管理</el-button>
      <el-button type="text" class="nav-button" @click="navigateTo('/aiconsultingt')">AI咨询</el-button>
      <el-button type="text" class="nav-button" @click="navigateTo('/blockmessage')">区块详情</el-button>
      <el-button type="text" class="nav-button" @click="navigateTo('/userll')">用户认证</el-button>
      <el-button type="text" class="nav-button" @click="navigateTo('/face')">人脸录入</el-button>
    </el-col>
    <el-col :xs="24" :sm="8" :md="6" class="user-container">
      <div class="user-options">
        <!-- 用户名点击后弹出下拉框 -->
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <i class="fas fa-user-circle"></i> <span class="username">{{ username }}</span>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-button type="text" class="logout-button" @click="logout">登出</el-button>
            <!-- <el-dropdown-item @click="logout">登出</el-dropdown-item> -->
            <!-- <el-dropdown-item @click="navigateTo('/userll')">用户认证</el-dropdown-item>
            <el-dropdown-item @click="navigateTo('/face')">人脸录入</el-dropdown-item> -->
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import axios from 'axios';
import { gsap } from "gsap";
import * as echarts from 'echarts';

export default {
  name: "Header",
  data() {
    return {
      username: '' // 根据实际情况更新
    };
  },
  methods: {
    logout() {
      this.$cookies.remove("orgType");
      this.$cookies.remove("address");
      this.$router.push("/login");
    },
    handleAccount() {
      const userId = this.$cookies.get('userId');
      if (userId) {
        axios.get(`/contract/user/uName/${userId}`)
          .then(response => {
            if (response.data && response.data.data) {
              this.username = response.data.data; // 直接将用户名赋值给 username
            }
          })
          .catch(error => {
            console.error("Failed to fetch username:", error);
          });
      } else {
        console.error("User ID not found in cookies");
      }
    },
    handleSettings() {
      // 处理设置逻辑
    },
    animateHeader() {
      gsap.fromTo(".header-container", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 1 });
      gsap.fromTo(".header-title", { opacity: 0 }, { opacity: 1, duration: 1.5, delay: 0.5 });
    },
    initChart() {
      var chartDom = document.getElementById('main');
      var myChart = echarts.init(chartDom);
      var option = {
        graphic: {
          elements: [
            {
              type: 'text',
              left: 'center',
              top: 'center',
              style: {
                text: '区块链智能合同管理与签约平台',
                fontSize: 25,
                fontWeight: 'normal',
                lineDash: [0, 200],
                lineDashOffset: 0,
                fill: 'transparent',
                stroke: '#fff',  // 设置初始边框颜色为白色
                lineWidth: 1
              },
              keyframeAnimation: {
                duration: 3000,
                loop: false,
                keyframes: [
                  {
                    percent: 0.7,
                    style: {
                      fill: 'transparent',
                      lineDashOffset: 200,
                      lineDash: [200, 0]
                    }
                  },
                  {
                    percent: 0.8,
                    style: {
                      fill: 'transparent'
                    }
                  },
                  {
                    percent: 1,
                    style: {
                      fill: 'white',  // 最终填充颜色为白色
                      stroke: 'white' // 最终边框颜色为白色
                    }
                  }
                ]
              },
              // 添加点击事件处理
              onclick: () => {
                this.$router.push('/dashboard');
              }
            }
          ]
        }
      };
      option && myChart.setOption(option);
    },
    navigateTo(path) {
      this.$router.push(path);
    }
  },
  mounted() {
    this.animateHeader();
    this.initChart(); // 初始化ECharts动画
    this.handleAccount()
  }
}
</script>

<style scoped>
.header-container {
  background-color: #3498db;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.header-title-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100px;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.nav-button {
  color: #fff;
  /* 将字体颜色设置为白色 */
  margin: 0 0px;
  /* 减少按钮之间的间距 */
  padding: 1px 1px;
  /* 缩小内边距以使布局更紧凑 */
  font-size: 14px;
  /* 字体大小调整为14px */
}

.header-title {
  margin: 0;
  color: white;
  font-weight: bold;
}

.user-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.user-options {
  display: flex;
  align-items: center;
}

.logout-button {
  font-size: 16px;
  color: #fff;
  padding: 0 10px;
}

.username {
  font-size: 20px;
  color: #fff;
  border-radius: 20%;
}

.username:hover {
  background-color: #2980b9;
}

.logout-button {
  color: #000;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  color: #000000;
}

.el-dropdown-link:hover {
  color: #ecf0f1;
}

.el-dropdown-menu {
  background-color: #ffffff;
  border-color: #ffffff;
}

.el-dropdown-menu__item {
  color: #000;
}

.el-dropdown-menu__item:hover {
  background-color: #ffffff;
}

.logout-button:hover {
  color: #ecf0f1;
}
</style>

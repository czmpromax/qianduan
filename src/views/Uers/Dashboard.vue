<template>
  <div id="app">
    <el-container>
      <el-header class="header">
        <Header />
      </el-header>
      <el-container>
        <el-main style="padding-top:10px">
          <!-- 合同状态图表和用户信息 -->
          <el-row :gutter="20" class="dashboard-row">
            <!-- 合同状态图表 -->
            <el-col :span="16">
              <el-card class="equal-height-card">
                <h3>合同状态图表</h3>
                <div id="contract-chart" style="height: 400px;"></div>
              </el-card>
            </el-col>
            <!-- 用户信息 -->
            <el-col :span="8">
              <el-card class="equal-height-card user-info-card">
                <h3>用户信息</h3>
                <el-divider></el-divider>
                <el-row>
                  <el-col :span="8"><strong>用户名:</strong></el-col>
                  <el-col :span="16">{{ userInfo.username }}</el-col>
                </el-row>
                <el-divider></el-divider>
                <el-row>
                  <el-col :span="8"><strong>邮箱:</strong></el-col>
                  <el-col :span="16">{{ userInfo.email }}</el-col>
                </el-row>
                <el-divider></el-divider>
                <el-row>
                  <el-col :span="8"><strong>区块链地址:</strong></el-col>
                  <el-col :span="16" class="blockchain-address">{{ userInfo.blockchainAddress }}</el-col>
                </el-row>
              </el-card>
            </el-col>
          </el-row>
          <!-- 倒计时进度条页面 -->
          <el-row :gutter="20" style="margin-top: 20px; text-align: center;">
            <el-card>
              <h3>合同倒计时进度条</h3>
              <el-row :gutter="20">
                <el-col v-for="(timer, index) in timers" :key="index" :span="6" class="countdown-timer-container">
                  <div class="countdown-timer-header">
                    <strong>{{ timer.name }}</strong>
                  </div>
                  <div :id="'countdown-chart-' + index" class="countdown-chart" style="height: 150px;"></div>
                </el-col>
              </el-row>
            </el-card>
          </el-row>

        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Header from '@/components/Header';
import * as echarts from 'echarts';
import axios from 'axios';

export default {
  name: "Dashboard",
  components: {
    Header,
  },
  data() {
    return {
      userInfo: {
        username: '',
        email: '',
        blockchainAddress: ''
      },
      recentActivities: [
        { timestamp: '2024-08-10 12:30', content: '合同#1234 已签署' },
        { timestamp: '2024-08-09 10:00', content: '合同#5678 执行完成' },
        { timestamp: '2024-08-08 14:20', content: '合同#9101 新建' },
      ],
      contractData: [], // 合同状态数据
      timers: [], // 倒计时数据
    };
  },
  mounted() {
    this.fetchUserInfo(); // 获取用户信息
    this.fetchContractData(); //获取合同状态数据并初始化图表
    this.fetchCountdownData();
  },
  beforeDestroy() {
    this.timers.forEach((timer) => {
      if (timer.intervalId) {
        clearInterval(timer.intervalId);
      }
    });
  },
  methods: {
    // 获取用户信息
    fetchUserInfo() {
      const userId = this.$cookies.get('userId');
      axios.get(`/contract/user/details/${userId}`)
        .then(response => {
          this.userInfo = response.data.data;
        })
        .catch(error => {
          console.error('Failed to fetch user details:', error);
        });
    },
    // 获取合同状态数据并初始化图表
    fetchContractData() {
      const userId = this.$cookies.get('userId');
      axios.get(`/contract/countStatusByUser/${userId}`)
        .then(response => {
          const statusCounts = response.data.data;
          this.contractData = [
            { value: statusCounts['已完成'], name: '已完成', itemStyle: { color: '#7cb5ec' } },
            { value: statusCounts['未上链'], name: '未上链', itemStyle: { color: '#f7a35c' } },
            { value: statusCounts['执行中'], name: '执行中', itemStyle: { color: '#90ed7d' } }
          ];
          this.initContractChart();
        })
        .catch(error => {
          console.error('Failed to fetch contract status data:', error);
        });
    },
    // 初始化合同状态图表
    initContractChart() {
      this.$nextTick(() => {
        const chartDom = document.getElementById('contract-chart');
        if (chartDom) {
          const myChart = echarts.init(chartDom);
          const option = {
            tooltip: {
              trigger: 'item'
            },
            legend: {
              top: '5%',
              left: 'center'
            },
            series: [
              {
                name: '合同状态',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                padAngle: 5,
                itemStyle: {
                  borderRadius: 10
                },
                label: {
                  show: false,
                  position: 'center'
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: 40,
                    fontWeight: 'bold'
                  }
                },
                labelLine: {
                  show: false
                },
                data: this.contractData // 动态数据绑定
              }
            ]
          };
          myChart.setOption(option);
        }
      });
    },
    // 获取倒计时数据并初始化倒计时图表
    fetchCountdownData() {
      const userId = this.$cookies.get('userId');
      axios.get(`/contract/activeContractsEndDateDifference/${userId}`)
        .then(response => {
          const { contractNames, endDateDifferences } = response.data.data;

          // 动态生成倒计时计时器数据，并过滤掉倒计时小于等于 0 的合同
          this.timers = contractNames
            .map((name, index) => ({
              id: index + 1,
              name: name,
              countdownTimeInSeconds: endDateDifferences[name] * 86400, // 将天转换为秒
            }))
            .filter(timer => timer.countdownTimeInSeconds > 0); // 过滤小于等于 0 的倒计时

          // 初始化所有倒计时图表
          this.$nextTick(() => {
            this.timers.forEach((timer, index) => {
              this.initCountdownChart(index);
              this.startCountdown(index);
            });
          });
        })
        .catch(error => {
          console.error('Failed to fetch contract countdown data:', error);
        });
    },
    // 初始化倒计时图表
    initCountdownChart(index) {
      const chartDom = document.getElementById('countdown-chart-' + index);
      if (chartDom) {
        const myChart = echarts.init(chartDom);
        const option = {
          series: [
            {
              name: '倒计时',
              type: 'gauge',
              radius: '100%',
              startAngle: 90,
              endAngle: -269.9999,
              pointer: {
                show: false
              },
              progress: {
                show: true,
                overlap: false,
                roundCap: true,
                clip: false,
                itemStyle: {
                  color: '#FF6E76'  // 红色圈
                }
              },
              axisLine: {
                lineStyle: {
                  width: 15,
                  color: [[1, '#eaeaea']]
                }
              },
              axisTick: {
                show: false
              },
              splitLine: {
                show: false
              },
              axisLabel: {
                show: false
              },
              detail: {
                valueAnimation: true,
                rich: {
                  a: {
                    fontSize: 20,
                    color: '#FF6E76',
                    align: 'center'
                  }
                },
                formatter: (value) => {
                  const days = Math.floor(value);
                  return `{a|${days}天}`;
                },
                offsetCenter: ['0%', '0%']
              },
              data: [
                {
                  value: (this.timers[index].countdownTimeInSeconds / 86400).toFixed(2)  // 转换为天并保留两位小数
                }
              ]
            },
            {
              name: '秒进度',
              type: 'gauge',
              radius: '65%',  // 调整半径，留出间隔
              startAngle: 90,
              endAngle: -269.9999,
              pointer: {
                show: false
              },
              progress: {
                show: true,
                overlap: false,
                roundCap: true,
                clip: false,
                itemStyle: {
                  color: '#90ed7d'  // 绿色圈
                }
              },
              axisLine: {
                lineStyle: {
                  width: 8,
                  color: [[1, '#eaeaea']]
                }
              },
              axisTick: {
                show: false
              },
              splitLine: {
                show: false
              },
              axisLabel: {
                show: false
              },
              detail: {
                show: false
              },
              data: [
                {
                  value: 0 // 初始值为0
                }
              ]
            }
          ]
        };
        this.$set(this.timers[index], 'chart', myChart);
        myChart.setOption(option);
      } else {
        console.error(`Element with id countdown-chart-${index} not found`);
      }
    },
    // 启动倒计时
    startCountdown(index) {
      const timer = this.timers[index];
      timer.intervalId = setInterval(() => {
        if (timer.countdownTimeInSeconds > 0) {
          timer.countdownTimeInSeconds--;
          this.updateCountdownChart(index);
        } else {
          clearInterval(timer.intervalId);
          this.removeCountdownChart(index);
        }
      }, 1000); // 每秒减少一次
    },
    // 更新倒计时图表
    updateCountdownChart(index) {
      this.timers[index].chart.setOption({
        series: [
          {
            data: [
              {
                value: (this.timers[index].countdownTimeInSeconds / 86400).toFixed(2) // 转换为天并保留两位小数
              }
            ]
          }
        ]
      });
    },

    // 更新秒数进度圈
    updateSecondsChart(index, secondsProgress) {
      this.timers[index].chart.setOption({
        series: [
          {},
          {
            data: [
              {
                value: secondsProgress * 100
              }
            ]
          }
        ]
      });
    },
    removeCountdownChart(index) {
      const timer = this.timers[index];
      if (timer && timer.chart) {
        timer.chart.dispose(); // 销毁图表实例
      }
      this.timers.splice(index, 1); // 从数组中移除对应的计时器
    },
  }
}
</script>

<style scoped>
.header {
  color: #fff;
  line-height: 20px;
}

.el-card {
  padding: 20px;
  box-sizing: border-box;
}

.el-button {
  margin-right: 10px;
  margin-top: 10px;
}

.dashboard-row {
  display: flex;
  align-items: stretch;
}

.equal-height-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-align: center;
}

.user-info-card {
  background-color: #f9f9f9;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 20px;
}

.user-info-card h3 {
  color: #409EFF;
  font-weight: bold;
}

.user-info-card .el-row {
  margin-bottom: 10px;
}

#contract-chart,
.countdown-chart {
  width: 100%;
}

.countdown-timer-container {
  text-align: center;
  margin-bottom: 20px;
}

.countdown-timer-header {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
  line-height: 1.5;
}

.blockchain-address {
  word-wrap: break-word;
  word-break: break-all;
  font-size: 14px;
  /* 可以根据需要调整字体大小 */
  line-height: 1.6;
}
</style>

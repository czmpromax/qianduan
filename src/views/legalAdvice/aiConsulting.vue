  <template>
    <div id="app">
      <el-container>
        <el-header class="header">
          <Header />
        </el-header>
        <el-container>
          <el-main style="padding-top: 10px">
            <el-row :gutter="20" style="margin-top: 20px;">
              <el-col :span="24">
                <el-card class="card response-card scrollable-content" ref="responseCard" id="chat-output">
                  <h3 style="text-align: center;">AI 咨询</h3>

                  <!-- 遍历 messages 数组，交叉显示用户和 AI 的消息 -->
                  <div v-for="(message, index) in messages" :key="index">
                    <!-- 用户消息 -->
                    <p v-if="message.role === 'user'" :class="message.role">{{ message.content }}</p>

                    <!-- AI 消息，渲染 Markdown -->
                    <div v-else-if="message.role === 'ai'" class="ai" v-html="renderMarkdown(message.content)"></div>
                  </div>

                  <!-- 显示正在生成的 AI 响应 -->
                  <div class="ai" v-if="currentResponse" v-html="renderMarkdown(currentResponse)"></div>
                </el-card>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-card class="card consultation-card" ref="consultationCard">

                  <el-form :model="consultationForm" class="consultation-form">
                    <el-form-item label="咨询描述">
                      <el-input v-model="consultationForm.description" type="textarea" placeholder="请输入详细描述"
                        :disabled="isResponding"></el-input>
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="submitConsultation" class="animated-button"
                        :disabled="isResponding">
                        提交咨询
                      </el-button>
                      <el-button @click="SelectContract" :disabled="isResponding">
                        合同风险评估
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-col>
            </el-row>
          </el-main>
          <el-dialog title="选择合同进行风险评估" :visible.sync="contractDialogVisible" width="50%"
            @close="resetSelectedContract">
            <el-table :data="contracts" highlight-current-row @current-change="handleContractSelection"
              style="width: 100%;">
              <el-table-column prop="name" label="合同名称"></el-table-column>
            </el-table>
            <div style="margin-top: 20px; text-align: right;">
              <el-button @click="closeContractDialog">取消</el-button>
              <el-button type="primary" @click="confirmContractSelection" :disabled="!selectedContract">
                确定
              </el-button>
            </div>
          </el-dialog>
        </el-container>
      </el-container>
    </div>
  </template>



<script>
import Header from '@/components/Header';
import { gsap } from 'gsap';
import { marked } from 'marked'; // 导入 marked
import DOMPurify from 'dompurify'; // 导入 DOMPurify
import axios from 'axios';

export default {
  name: 'AIConsultation',
  data() {
    return {
      consultationForm: {
        description: '',
      },
      messages: [], // 用于保存所有的消息
      currentResponse: '',
      websocket: null, // WebSocket 连接对象
      isResponding: false, // 标识 AI 是否正在响应
      contractDialogVisible: false, // 控制合同选择弹窗
      contracts: [], // 存储可选择的合同列表
      selectedContract: null, // 当前选中的合同
      contractsterms: '',
    };
  },
  components: {
    Header,
  },
  methods: {
    // 初始化 WebSocket 连接
    connectWebSocket() {
      // 创建新的 WebSocket 对象   WebSocket连接地址：wss://192.168.0.2:8041/ai-chat-websocket
      this.websocket = new WebSocket("ws://169.254.43.131:8042/ai-chat-websocket");

      // WebSocket 连接成功
      this.websocket.onopen= ()=>{
        console.log("连接成功");
      };

      // 接收消息并逐步拼接响应
      this.websocket.onmessage = (event) => {
        //获取收到的消息
        let message = event.data;

        // 忽略空消息和结束标志
        if (!message.trim()) {
          return;
        }

        console.log("接收到消息:", message);

        // 如果是完成标志，将当前响应保存到 messages 数组
        if (message.trim() === '[DONE]') {
          console.log("消息接收完成");
          if (this.currentResponse.trim()) {
            this.messages.push({ role: 'ai', content: this.currentResponse });
          }
          this.currentResponse = ''; // 清空当前响应
          this.isResponding = false; // 标记响应已完成，解锁输入
          return;
        }

        // 逐步拼接 AI 的响应
        this.currentResponse += message;
      };

      // WebSocket 连接关闭
      this.websocket.onclose = () => {
        console.log("WebSocket 连接已关闭");
      };

      // 处理 WebSocket 错误
      this.websocket.onerror = (error) => {
        console.error("WebSocket 出现错误:", error);
      };
    },
    SelectContract() {
      this.contractDialogVisible = true; // 打开弹窗

      // 模拟从后端加载合同数据（实际需要通过接口获取合同列表）
      this.fetchContracts();
    },
    fetchContracts() {
      const userId = this.$cookies.get('userId');
      axios
        .get('/contract/getcontractmseege', {
          params: { userId: userId }
        })
        .then((response) => {
          if (response.data.code === 200) {
            this.contracts = response.data.data; // 假设这是一个合同数组
          } else {
            this.$message.error('获取合同列表失败');
          }
        })
        .catch(() => {
          this.$message.error('网络错误，请稍后重试');
        });
    },
    evaluateAndAnalyzeContractRisk() {
      if (!this.selectedContract) {
        this.$message.error('请先选择一个合同进行风险分析');
        return;
      }

      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        // 构造 WebSocket 消息对象并发送
        const payload = {
          action: 'evaluateContractRisk',
          contractId: this.selectedContract.id,
          contractTerms: this.contractsterms,
          userDescription: this.consultationForm.description,
        };

        this.websocket.send(JSON.stringify(payload));

        // 清空输入框内容
        this.resetForm();

        // 标记为正在响应，禁用输入
        this.isResponding = true;

        // 关闭弹窗
        this.closeContractDialog();
      } else {
        this.$message.error('WebSocket 未连接，请稍后重试');
        console.error('WebSocket 未连接');
      }
    },
    // 发送消息到 WebSocket 服务
    submitConsultation() {
      if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
        // 获取用户输入的内容
        const message = this.consultationForm.description;

        // 将用户的消息保存到 messages 数组
        this.messages.push({ role: 'user', content: message });

        // 通过 WebSocket 发送消息
        this.websocket.send(message);

        // 清空表单
        this.resetForm();

        // 标记为正在响应，禁用输入
        this.isResponding = true;
      } else {
        console.error("WebSocket 未连接");
      }
    },

    resetForm() {
      this.consultationForm.description = ''; // 清空表单
    },

    // 渲染并净化 Markdown 内容
    renderMarkdown(content) {
      const rawHtml = marked(content);
      const cleanHtml = DOMPurify.sanitize(rawHtml);
      return cleanHtml;
    },
    handleContractSelection(row) {
      this.selectedContract = row; // 记录当前选中的合同
      this.contractsterms = row.terms; // 从选中的合同中读取 terms
    },

    closeContractDialog() {
      this.contractDialogVisible = false; // 关闭弹窗
      this.resetSelectedContract();
    },

    confirmContractSelection() {
      if (this.selectedContract) {
        this.evaluateAndAnalyzeContractRisk();
      } else {
        this.$message.error('请选择一个合同进行分析');
      }
    },


    resetSelectedContract() {
      this.selectedContract = null; // 清空选中的合同
      this.contractsterms = ''; // 清空合同条款
    },
  },
  mounted() {
    // 在组件加载时连接 WebSocket
    this.connectWebSocket();

    gsap.fromTo('.header', { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 1 });
    gsap.fromTo('.navigator-container', { opacity: 0, x: -200 }, { opacity: 1, x: 0, duration: 0.8 });
    gsap.fromTo('.card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 });
  },
};
</script>



<style scoped>
body,
html,
#app {
  margin: 0;
  padding: 0;
  background-color: rgba(234, 246, 255, 0.9);
  /* 淡蓝色背景 */
  color: #333;
  /* 默认文字颜色 */
  background-image: url("../img/12.png");
  background-size: cover;
  /* 背景图片铺满整个容器 */
  background-repeat: no-repeat;
  /* 防止背景图片重复 */
  background-position: center center;
  /* 背景图片居中显示 */

}

.header {
  background-color: #409eff;
  /* 蓝色背景 */
  color: #fff;
  height: 60px;
  line-height: 60px;
  text-align: center;
}

.el-card {
  padding: 20px;
  box-sizing: border-box;
}

.el-button {
  margin-right: 10px;
  margin-top: 10px;
}

.consultation-card {
  background-color: rgba(255, 255, 255, 0.5);
}

.response-card {
  background-color: rgba(255, 255, 255, 0.5);
}

.animated-button {
  transition: transform 0.3s ease;
}

.animated-button:hover {
  transform: scale(1.05);
}

/* 聊天消息的样式 */
.user {
  background-color: #d0f0c0;
  /* 淡绿色背景 */
  color: #333;
  padding: 10px 20px;
  border-radius: 18px;
  max-width: 20%;
  margin: 10px 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
  margin-left: auto;
  text-align: left;
  /* 右对齐 */
}

.ai {
  background-color: #f4f4f8;
  /* 淡灰色背景 */
  color: #333;
  padding: 10px 20px;
  border-radius: 18px;
  max-width: 80%;
  margin: 10px 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: relative;
  margin-right: auto;
  /* 左对齐 */
  text-align: left;
  /* 修复文字对齐方式 */
}

.ai p {
  text-align: left;
  /* 修复拼写错误 */
  margin: 10px 0;
  line-height: 1.6;
}

.ai pre {
  background-color: #2d2d2d;
  color: #ccc;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
}

.ai code {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 4px;
}

.ai a {
  color: #409eff;
  text-decoration: none;
}

.ai a:hover {
  text-decoration: underline;
}

.scrollable-content {
  max-height: 60vh;
  /* 设置最大高度为视口高度的 60% */
  overflow-y: auto;
  /* 内容超出时显示滚动条 */
  padding: 20px;
  /* 内边距 */
  background-color: rgba(255, 255, 255, 0.8);
  /* 背景色调整为半透明白色 */
  border-radius: 8px;
  /* 圆角 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  /* 添加阴影 */
}

/* 可选：隐藏滚动条样式，保留滚动功能 */
.scrollable-content::-webkit-scrollbar {
  width: 8px;
  /* 滚动条宽度 */
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: #ccc;
  /* 滚动条颜色 */
  border-radius: 4px;
  /* 滚动条圆角 */
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: #b3b3b3;
  /* 滚动条悬浮颜色 */
}

.scrollable-content::-webkit-scrollbar-track {
  background-color: #f5f5f5;
  /* 滚动条轨道颜色 */
}
</style>

<template>
  <div id="app">
    <el-container>
      <el-header class="header animate__animated animate__fadeInDown">
        <Header />
      </el-header>
      <el-container>
        <el-main style="padding-top:10px">
          <el-row :gutter="20">
            <!-- 创建新合同表单 -->
            <el-col :span="24">
              <el-card class="animate__animated animate__fadeInUp">
                <div>
                  <h3 class="card-title"><i class="fas fa-file-contract"></i> 创建新合同</h3>
                </div>
                <!-- 操作按钮 -->
                <div class="form-item">
                  <el-button type="primary" @click="openTemplateDialog">导入模板</el-button>
                  <el-button type="primary" @click="submitContract" class="animate__animated animate__pulse"
                    style="margin-right: 10px;">提交合同</el-button>
                  <el-upload class="upload-demo" :auto-upload="false" :file-list="fileList"
                    :on-change="handleFileChange" :on-remove="handleRemove" :before-remove="beforeRemove" multiple
                    :limit="3" :on-exceed="handleExceed">
                    <el-button type="primary" class="animate__animated animate__pulse"
                      style="margin-right: 10px;">上传附件</el-button>
                  </el-upload>
                  <el-button @click="resetForm" class="animate__animated animate__pulse"
                    style="margin-right: 10px;">重置</el-button>

                </div>

                <!-- 合同名称 -->
                <div class="form-item">
                  <label class="form-item-label">合同名称</label>
                  <el-input v-model="contractForm.name" placeholder="请输入合同名称" style="flex: 1;"></el-input>
                </div>
                <!-- 合同条款 -->
                <div class="form-item">
                  <label class="form-item-label">合同条款</label>
                  <div style="flex: 1;">
                    <div id="toolbar-container">
                      <span class="ql-formats">
                        <select class="ql-font"></select>
                        <select class="ql-size"></select>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-bold"></button>
                        <button class="ql-italic"></button>
                        <button class="ql-underline"></button>
                        <button class="ql-strike"></button>
                      </span>
                      <span class="ql-formats">
                        <select class="ql-color"></select>
                        <select class="ql-background"></select>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-script" value="sub"></button>
                        <button class="ql-script" value="super"></button>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-header" value="1"></button>
                        <button class="ql-header" value="2"></button>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-blockquote"></button>
                        <button class="ql-code-block"></button>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-list" value="ordered"></button>
                        <button class="ql-list" value="bullet"></button>
                        <button class="ql-indent" value="-1"></button>
                        <button class="ql-indent" value="+1"></button>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-direction" value="rtl"></button>
                        <select class="ql-align"></select>
                      </span>
                      <span class="ql-formats">
                        <button class="ql-clean"></button>
                      </span>
                    </div>
                    <div id="editor"></div>
                  </div>
                </div>

                <!-- 合同有效期 -->
                <div class="form-item">
                  <label class="form-item-label">合同有效期</label>
                  <el-date-picker v-model="contractForm.validity" type="daterange" start-placeholder="开始日期"
                    end-placeholder="结束日期" style="flex: 1;"></el-date-picker>
                </div>

                <!-- 签署方地址 -->
                <div class="form-item">
                  <label class="form-item-label">签署方地址</label>
                  <div class="blockchain-address" style="flex: 1; display: flex; align-items: center;">
                    <el-input v-model="userBlockchainAddress" disabled class="address-input"
                      style="width: calc(100% - 150px);"></el-input>
                    <span style="margin-left: 10px;">(已导入)</span>
                  </div>


                </div>
                <div v-for="(address, index) in contractForm.blockchainAddresses" :key="index"
                  class="blockchain-address"
                  style="display: flex; align-items: center; margin-top: 10px;margin-left: 120px;">
                  <el-autocomplete v-model="contractForm.blockchainAddresses[index]" placeholder="请选择签署方地址"
                    class="address-select" style="width: calc(100% - 150px);" :fetch-suggestions="querySearchAddress"
                    @select="handleAddressSelect(index, $event)">
                  </el-autocomplete>
                  <el-button type="danger" icon="fas fa-minus" @click="removeBlockchainAddress(index)"
                    class="animate__animated animate__bounceIn" style="margin-left: 10px;">删除</el-button>
                </div>

                <div style="justify-content: center; display: flex;">
                  <el-button type=" primary" icon="fas fa-plus" @click="addBlockchainAddress"
                    class="animate__animated animate__bounceIn" style="margin-top: 10px;margin-bottom: 10px;"> 添加区块链地址
                  </el-button>
                </div>

              </el-card>
            </el-col>
          </el-row>
        </el-main>
        <!-- 模板选择弹窗 -->
        <el-dialog title="选择模板" :visible.sync="templateDialogVisible" width="50%" :before-close="closeTemplateDialog">
          <el-table ref="templateTable" :data="templates" highlight-current-row @current-change="handleTemplateChange"
            :height="dialogHeight" style="width: 100%;">
            <el-table-column property="name" label="模板名称">
            </el-table-column>
            <el-table-column property="category" label="模板类别">
            </el-table-column>
          </el-table>
          <div style="margin-top: 20px; text-align: right;">
            <el-button @click="closeTemplateDialog">取消</el-button>
            <el-button type="primary" @click="confirmTemplateSelection">确定</el-button>
          </div>
        </el-dialog>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Header from '@/components/Header';
import axios from 'axios';
import 'quill/dist/quill.snow.css'; // 引入 Quill 样式
import Quill from 'quill'; // 引入 Quill

export default {
  name: "CreateContract",
  data() {
    return {
      contractForm: {
        name: '',
        terms: '', // 将合同条款与 Quill 编辑器的内容绑定
        validity: [],
        blockchainAddresses: [], // 初始化为空，其他签署方的地址
      },
      fileList: [], //上传文件
      userBlockchainAddress: '',// 存储当前用户的区块链地址
      availableAddresses: [], // 动态存储后端返回的地址列表
      templates: [
      ],
      templateDialogVisible: false, // 控制弹窗显示
      selectedTemplate: null, // 当前选中的模板
    }
  },
  components: {
    Header,
  },
  mounted() {
    // 初始化 Quill 编辑器
    this.quill = new Quill('#editor', {
      modules: {
        syntax: true,
        toolbar: '#toolbar-container',
      },
      placeholder: '请输入合同条款内容...',
      theme: 'snow',
    });

    // 监听 Quill 编辑器内容的变化，将其与 Vue 数据模型绑定
    this.quill.on('text-change', () => {
      this.contractForm.terms = this.quill.root.innerHTML;
    });


    this.userBlockchainAddress = axios.get(`/contract/user/details/${this.$cookies.get('userId')}`)
      .then(response => {
        this.userBlockchainAddress = response.data.data.blockchainAddress;
      })
      .catch(error => {
        console.error('Failed to fetch user details:', error);
      });

    // 调用后端接口获取所有用户地址
    this.fetchUserAddresses();
    //初始化列表
    this.fetchTemplates();
  },
  methods: {
    fetchTemplates() {
      axios.get("contract/allTemplate").then(response => {
        if (response.data.code === 200) {
          this.templates = response.data.data;
        } else {
          this.$message.error("获取模板失败");
        }
      }).catch(() => {
        this.$message.error("网络错误，请稍后重试");
      });
    },
    async fetchUserAddresses() {
      try {
        const response = await axios.get('/contract/user/userAllAddress'); // 替换为你的后端接口
        this.availableAddresses = response.data.data; // 假设接口返回的是地址数组
      } catch (error) {
        console.error('获取用户地址失败:', error);
        alert('无法加载用户地址列表，请重试');
      }
    },
    openTemplateDialog() {
      this.templateDialogVisible = true; // 打开弹窗
    },
    closeTemplateDialog() {
      this.templateDialogVisible = false; // 关闭弹窗
      this.selectedTemplate = null; // 清空选中模板
    },
    handleTemplateChange(val) {
      this.selectedTemplate = val; // 当选中行变化时，更新选中的模板
    },
    setCurrentTemplate(row) {
      // 手动设置当前选中的模板行
      this.$refs.templateTable.setCurrentRow(row);
    },
    confirmTemplateSelection() {
      if (this.selectedTemplate) {
        this.contractForm.name = this.selectedTemplate.name;
        this.quill.root.innerHTML = this.selectedTemplate.content;
        this.contractForm.terms = this.selectedTemplate.content;
      }
      this.templateDialogVisible = false;
    },
    //
    submitContract() {
      if (this.contractForm.name && this.contractForm.terms && this.contractForm.validity.length) {
        const userId = this.getCookie('userId');
        const start_date = new Date(this.contractForm.validity[0]);
        const end_date = new Date(this.contractForm.validity[1]);

        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('name', this.contractForm.name);
        formData.append('terms', this.contractForm.terms);
        formData.append('start_date', start_date.toISOString().split('T')[0]);
        formData.append('end_date', end_date.toISOString().split('T')[0]);

        // 添加区块链地址
        const blockchainAddresses = [this.userBlockchainAddress, ...this.contractForm.blockchainAddresses.filter(address => address.trim() !== '')];
        blockchainAddresses.forEach((address) => {
          formData.append('blockchain_addresses', address);
        });

        // 添加上传的文件
        this.fileList.forEach((file) => {
          formData.append('files', file.raw); // 确保是 file.raw
        });

        axios.post('/contract/addContractWithSignatories', formData)
          .then(response => {
            alert('合同创建成功: ' + response.data.message);
            this.resetForm();
          })
          .catch(error => {
            console.error('合同创建失败:', error);
            alert('合同创建失败');
          });
      } else {
        alert('请填写完整的合同信息');
      }
    },
    resetForm() {
      this.contractForm = {
        name: '',
        terms: '',
        validity: [],
        blockchainAddresses: [],
        fileList: []
      };
      this.quill.root.innerHTML = '';
    },
    querySearchAddress(queryString, cb) {
      // 如果输入长度太短，不进行匹配
      if (!queryString || queryString.trim().length < 2) {
        return cb([]);
      }

      // 转小写方便大小写不敏感匹配
      const lowerQuery = queryString.toLowerCase();
      const results = this.availableAddresses
        .filter(addr => addr.toLowerCase().includes(lowerQuery))
        .map(addr => ({ value: addr }));

      cb(results);
    },

    addBlockchainAddress() {
      this.contractForm.blockchainAddresses.push('');
    },
    removeBlockchainAddress(index) {
      if (this.contractForm.blockchainAddresses.length > 0) {
        this.contractForm.blockchainAddresses.splice(index, 1);
      }
    },
    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    },
    handleFileChange(file, fileList) {
      // 更新 fileList
      this.fileList = fileList;
      console.log('文件已变更:', this.fileList);
    },
    handleRemove(file, fileList) {
      console.log('文件已移除:', file, fileList);
    },
    handleExceed(files, fileList) {
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {
      return this.$confirm(`确定移除 ${file.name}？`);
    },
  }
}
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
  background-image: url("../img/3.png");
  background-size: cover;
  /* 背景图片铺满整个容器 */
  background-repeat: no-repeat;
  /* 防止背景图片重复 */
  background-position: center center;
  /* 背景图片居中显示 */

}

.header {
  color: #fff;
  line-height: 20px;
  text-align: center;
}

.el-card {
  padding: 20px;
  box-sizing: border-box;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background-color: rgba(234, 246, 255, 0.8);
  ;
}

.card-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  font-weight: bold;
}

.form-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;

}

.form-item-label {
  width: 120px;
  font-weight: bold;
}

#toolbar-container {
  border: 1px solid #ccc;
  border-radius: 5px 5px 0 0;
  background-color: rgba(234, 246, 255, 0.8);
  padding: 8px 12px;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  gap: 10px;
}

#editor {
  height: 200px;
  border: 1px solid #ccc;
  border-radius: 0 0 5px 5px;
  padding: 10px;
  background-color: #fff;
}

.el-table__row--current {
  background-color: #f0f9ff !important;
  /* 高亮背景 */
  color: #409eff;
  /* 字体颜色 */
}
</style>
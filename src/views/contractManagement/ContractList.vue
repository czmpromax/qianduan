<template>
  <div id="app">
    <el-container>
      <el-header class="header">
        <Header />
      </el-header>
      <el-container>

        <el-main style="padding-top:10px">
          <!-- 合同搜索和过滤 -->
          <el-row :gutter="20">
            <el-col :span="24">
              <el-card class="card" ref="filterCard">
                <h3>合同搜索和过滤</h3>
                <el-form :inline="true" :model="searchForm" class="demo-form-inline">
                  <el-form-item label="合同状态">
                    <el-select v-model="searchForm.status" placeholder="请选择">
                      <el-option label="全部" value=""></el-option>
                      <el-option label="待处理" value="待处理"></el-option>
                      <el-option label="执行中" value="执行中"></el-option>
                      <el-option label="已完成" value="已完成"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="签署日期">
                    <el-date-picker v-model="searchForm.date" type="daterange" placeholder="选择日期范围">
                    </el-date-picker>
                  </el-form-item>
                  <el-form-item>
                    <el-input v-model="searchForm.keyword" placeholder="输入关键词"></el-input>
                  </el-form-item>
                </el-form>
              </el-card>
            </el-col>
          </el-row>

          <!-- 合同列表 -->
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :span="24">
              <el-card class="card" ref="contractListCard">
                <h3 style="text-align: center;">合同列表</h3>
                <el-table :data="filteredContracts" style="width: 100%" ref="contractTable" class="ContractTable">
                  <el-table-column prop="name" label="合同名称"></el-table-column>
                  <el-table-column prop="status" label="状态"></el-table-column>
                  <el-table-column prop="signer" label="签署方"></el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-button type="success" @click="signContract(scope.row)" class="animated-button"
                        :disabled="scope.row.status === '已完成' || scope.row.status === '执行中'">
                        上链
                      </el-button>
                      <el-button type="primary" @click="signOrCheck(scope.row)" class="animated-button"
                        :disabled="scope.row.signed === '1'" :class="{ 'signed-button': scope.row.signed === '1' }">
                        签署
                      </el-button>

                      <el-button type="primary" @click="viewDetail(scope.row)" class="animated-button">
                        查看详情
                      </el-button>
                      <el-button type="success" @click="downloadContract(scope.row)" class="animated-button">
                        下载
                      </el-button>
                      <el-button type="warning" @click="editContract(scope.row)" class="animated-button"
                        :disabled="scope.row.status === '已完成' || scope.row.status === '执行中'">
                        修改
                      </el-button>
                      <el-button type="danger" @click="deleteContract(scope.row)" class="animated-button"
                        :disabled="scope.row.status === '已完成' || scope.row.status === '执行中'">
                        删除
                      </el-button>

                      <!-- 更多操作的下拉菜单 -->
                      <el-dropdown trigger="click" placement="bottom-end">
                        <el-button class="dropdown-button" type="primary">
                          更多操作
                          <i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item @click.native="downloadEvidence(scope.row)">下载存证</el-dropdown-item>
                          <el-dropdown-item @click.native="applyExtension(scope.row)">申请仲裁</el-dropdown-item>
                          <el-dropdown-item @click.native="antiCounterfeiting(scope.row)">防伪打印</el-dropdown-item>
                          <el-dropdown-item @click.native="promptDelivery(scope.row)">提醒/送达</el-dropdown-item>
                          <el-dropdown-item @click.native="certificatePackage(scope.row)">证据包下载</el-dropdown-item>
                          <el-dropdown-item @click.native="uploadEvidenceFile(scope.row)">上传履约文件</el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>

          <!-- 合同详情弹窗 -->
          <el-dialog :visible.sync="detailDialogVisible" title="合同详情" width="50%" :before-close="handleClose"
            custom-class="custom-dialog animate__animated animate__fadeIn">
            <div v-if="currentContract" class="dialog-content">
              <div class="contract-header">
                <h2><i class="fas fa-file-contract"></i> {{ currentContract.name }}</h2>
                <p>签署方: <strong>{{ currentContract.signer }}</strong></p>
              </div>
              <div class="contract-details">
                <p><i class="fas fa-scroll"></i> 合同条款:</p>
                <div v-html="currentContract.terms"></div>
                <p><i class="fas fa-calendar-alt"></i> 开始日期: {{ formatDate(currentContract.startDate) }}</p>
                <p><i class="fas fa-calendar-alt"></i> 结束日期: {{ formatDate(currentContract.endDate) }}</p>
                <p><i class="fas fa-info-circle"></i> 状态: {{ currentContract.status }}</p>
              </div>
              <!-- 签署信息 -->
              <div v-if="currentContract.signatures && currentContract.signatures.length" class="signature-info">
                <h3><i class="fas fa-user-check"></i> 签署信息：</h3>
                <ul>
                  <li v-for="signature in currentContract.signatures" :key="signature.id">
                    <i class="fas fa-user"></i> {{ signature.blockchainAddress }} -
                    签署状态: <span :class="{ 'signed': signature.signed, 'unsigned': !signature.signed }">
                      {{ signature.signed ? '已签署' : '未签署' }}
                    </span> - 签署时间: {{ formatDate(signature.createdAt) }}
                  </li>
                </ul>
              </div>
            </div>
            <span slot="footer" class="dialog-footer">
              <el-button @click="detailDialogVisible = false" class="custom-button">关闭</el-button>
            </span>
          </el-dialog>

          <!-- 修改合同弹窗 -->
          <el-dialog :visible.sync="editDialogVisible" title="修改合同" width="50%" @open="animateDialogOpen"
            @close="animateDialogClose">
            <div v-if="currentContract" class="dialog-content">
              <el-form :model="currentContract">
                <el-form-item label="合同名称">
                  <el-input v-model="currentContract.name"></el-input>
                </el-form-item>

                <!-- 合同条款 -->
                <el-form-item label="合同条款">
                </el-form-item>
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

                <el-form-item label="开始日期" style="margin-top: 15px;">
                  <el-date-picker v-model="currentContract.startDate" type="date"></el-date-picker>
                </el-form-item>
                <el-form-item label="结束日期">
                  <el-date-picker v-model="currentContract.endDate" type="date"></el-date-picker>
                </el-form-item>
                <el-form-item label="签署方地址(默认已导入用户地址)">
                  <el-input v-model="blockchainAddress" disabled class="address-input"
                    style="width: calc(100% - 150px);"></el-input>
                  <span style="margin-left: 10px;">(已导入)</span>
                  <div v-for="(address, index) in currentContract.blockchainAddresses" :key="index"
                    class="blockchain-address">
                    <el-autocomplete v-model="currentContract.blockchainAddresses[index]" placeholder="请选择签署方地址"
                      class="address-input" style="width: calc(100% - 150px);" :fetch-suggestions="querySearchAddress"
                      @select="handleAddressSelect(index, $event)">
                    </el-autocomplete>
                    <el-button type="danger" icon="el-icon-minus" @click="removeBlockchainAddress(index)"></el-button>
                  </div>
                  <el-button type="primary" icon="el-icon-plus" @click="addBlockchainAddress">添加地址</el-button>
                </el-form-item>
              </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
              <el-button @click="editDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="saveChanges">保存</el-button>
            </span>
          </el-dialog>

          <el-dialog :visible.sync="signatureDialogVisible" title="选择签署方式" width="30%">
            <div class="dialog-content">
              <p>请选择签署方式：</p>
              <el-radio-group v-model="selectedSignatureMethod">
                <el-radio label="privateKey">私钥签署</el-radio>
                <el-radio label="faceRecognition">人脸识别签署</el-radio>
              </el-radio-group>
            </div>
            <span slot="footer" class="dialog-footer">
              <el-button @click="signatureDialogVisible = false">取消</el-button>
              <el-button type="primary" @click="handleSignature">确定</el-button>
            </span>
          </el-dialog>

          <!-- 人脸识别签署对话框 -->
          <el-dialog :visible.sync="faceRecognitionDialogVisible" title="人脸识别签署" width="50%">
            <div style="position: relative; overflow: hidden;  text-align: center;">
              <h1>使用人脸识别签署合同</h1>

              <!-- 视频元素，用于显示摄像头画面 -->
              <video id="video" autoplay
                style="border: 1px solid black; width: 100%; height: auto; position: relative;"></video>

              <!-- 扫描线 -->
              <div id="scan-line"
                style="display: none; position: absolute; width: 100%; height: 2px; background-color: rgba(0, 255, 0, 0.5); top: 0;">
              </div>

              <!-- 捕捉按钮 -->
              <el-button type="primary" @click="captureFace" style="margin-top: 20px;">捕获人脸图像</el-button>

              <!-- 显示捕获的图像 -->
              <canvas id="canvas" width="320" height="240" style="display:none; margin-top: 20px;"></canvas>

              <!-- 显示结果 -->
              <p id="result" style="margin-top: 10px; color: green;"></p>
            </div>
          </el-dialog>

        </el-main>
      </el-container>
    </el-container>
  </div>
</template>


<script>
import axios from 'axios';
import Navigator from "@/components/Navigator";
import Header from '@/components/Header';
import { gsap } from "gsap";
import Quill from 'quill';
import * as faceapi from 'face-api.js';


export default {
  name: "ContractList",
  data() {
    return {
      isSigning: false,
      searchForm: {
        status: '',
        date: [],
        keyword: ''
      },
      contracts: [],
      detailDialogVisible: false,
      editDialogVisible: false,
      currentContract: null,
      currentContractId: null,
      signatoryInformation: null,
      quillEditor: null,
      blockchainAddress: this.$cookies.get('blockchainAddress') || '',
      availableAddresses: [],
      isSigning: false,  // 控制签署操作状态
      signatureDialogVisible: false,  // 控制签署方式选择框的显示与否
      selectedSignatureMethod: '',  // 选择的签署方式：'privateKey' 或 'faceRecognition'
      videoStream: null,  // 存储视频流
      scanning: false, // 控制扫描状态
      scanInterval: null, // 扫描定时器
      faceRecognitionDialogVisible: false,
    };
  },
  watch: {
    blockchainAddress(newAddress) {
      // 每当 blockchainAddress 发生变化时，更新 cookies
      this.$cookies.set('blockchainAddress', newAddress);
    },
  },
  computed: {
    filteredContracts() {
      return this.contracts.filter(contract => {
        return (!this.searchForm.status || contract.status === this.searchForm.status) &&
          (!this.searchForm.keyword || contract.name.includes(this.searchForm.keyword) || contract.signer.includes(this.searchForm.keyword)) &&
          (!this.searchForm.date.length || (new Date(contract.date) >= new Date(this.searchForm.date[0]) && new Date(contract.date) <= new Date(this.searchForm.date[1])));
      });
    },

  },
  components: {
    Navigator,
    Header,
  },
  methods: {
    downloadContract(contract) {
      axios.get(`/contract/download/${contract.id}`, { responseType: 'blob' })
        .then(response => {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${contract.name}.pdf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch(error => {
          console.error('下载失败:', error);
          alert('下载失败，请重试');
        });
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
      if (!this.currentContract.blockchainAddresses) {
        this.$set(this.currentContract, 'blockchainAddresses', []);
      }
      this.currentContract.blockchainAddresses.push('');
    },
    removeBlockchainAddress(index) {
      this.currentContract.blockchainAddresses.splice(index, 1);
    },
    viewDetail(contract) {
      this.detailDialogVisible = false;
      this.$nextTick(() => {
        this.currentContractId = contract.id;
        this.currentContract = null;
        this.fetchContractDetails();
      });
    },
    async fetchContractDetails() {
      try {
        const contractResponse = await axios.get(`/contract/get/${this.currentContractId}`);
        this.currentContract = contractResponse.data.data;
        const signaturesResponse = await axios.get(`/contract/signatures/${this.currentContractId}`);
        this.currentContract.blockchainAddresses = signaturesResponse.data.data.map(s => s.blockchainAddress);
        this.detailDialogVisible = true;
      } catch (error) {
        console.error('获取合同详情或签署信息失败:', error);
      }
    },
    async loadContracts() {
      const blockchainAddress = this.$cookies.get('blockchainAddress');
      try {
        const response = await axios.get('/contract/search', {
          headers: {
            'Blockchain-Address': blockchainAddress
          }
        });
        this.contracts = response.data.data;
        console.log('Contracts:', this.contracts);


        for (let contract of this.contracts) {
          const signedStatuses = await this.getSignedStatusByContractId(contract.id);
          const allSigned = signedStatuses.every(status => status === 1);
          this.$set(contract, 'signed', allSigned ? '1' : '0');
        }

        this.animateTableLoad();
      } catch (error) {
        console.error('加载合同列表失败:', error);
      }
    },
    signContract(contract) {
      //通过axios向后端发送post请求
      axios.post('/contract/upperChain?contractId=' + contract.id)
        .then(response => {
          //判断后端返回的状态码是否为200
          if (response.data && response.data.code === 200) {
            //更新合同
            this.updateContractStatus(contract.id, "执行中");
            //加载合同
            this.loadContracts();
            alert("上链成功");
          } else {
            alert(response.data.message || "上链失败")
          }
        })
        .catch(error => {
          console.error('合同上链失败:', error);
          const errorMessage = error.response && error.response.data && error.response.data.message
            ? error.response.data.message
            : error.message;
          alert('合同上链失败: ' + errorMessage);
        });
    },
    updateContractStatus(contractId, status) {
      axios.post('/contract/updateStatus', null, {
        params: {
          id: contractId,
          status: status
        }
      })
        .then(response => {
          this.loadContracts();
        })
        .catch(error => {
          console.error('更新合同状态失败:', error);
          alert('更新合同状态失败');
        });
    }, async signOrCheck(contract) {
      // 显示签署方式选择框
      this.signatureDialogVisible = true;
      this.contractToSign = contract;  // 保存当前签署的合同信息
    },
    async signWithPrivateKey(contract) {
      this.isSigning = true;
      const blockchainAddress = this.$cookies.get('blockchainAddress');
      const privateKey = prompt("请输入私钥进行验证");
      if (!privateKey) {
        alert("签署取消，未输入私钥。");
        this.isSigning = false;
        return;
      }
      try {
        const response = await axios.post('/contract/updateSignedStatus', null, {
          params: { contractId: contract.id, blockchainAddress, privateKey }
        });
        if ( response.datd.code === 200 ) {
          this.$set(contract, "signed", "1");
          // 使用持久化通知框
          this.$notify({
            title: '成功',
            message: '签署成功！合同已上链。',
            type: 'success',
            duration: 3000, // 持续3秒
            duration: 0, // 持久化显示
            showClose: true,
            customClass: 'large-notification', // 应用自定义样式
            onClose: () => {
              location.reload(); // 页面刷新
            },
          });
        } else {
          alert(response.data.message || "签署失败");
        }
      } catch (error) {
        console.error("签署失败", error);
        this.$notify({
          title: '失败',
          message: `${response.data.message}`,
          type: 'error',
          duration: 3000, // 持续3秒
          duration: 0,
          showClose: true,
          customClass: 'large-notification', // 应用自定义样式
          onClose: () => {
            location.reload(); // 页面刷新
          },
        });
      } finally {
        this.isSigning = false;
      }
    },
    async getSignedStatusByContractId(contractId) {
      try {
        const response = await axios.get('/contract/getSignedStatusByContractId', {
          params: { contractId }
        });
        return response.data.data;
      } catch (error) {
        console.error('获取签署状态失败:', error);
        return [];
      }
    },
    async loadContracts() {
      const blockchainAddress = this.$cookies.get('blockchainAddress');
      try {
        const response = await axios.get('/contract/search', {
          headers: {
            'Blockchain-Address': blockchainAddress,
          },
        });

        // 预先填充 contracts 数据，避免逐步禁用问题
        this.contracts = response.data.data.map(contract => ({
          ...contract,
          signed: '0', // 默认值，防止空值导致响应式问题
        }));

        // 同步更新每个合同的签署状态
        for (let contract of this.contracts) {
          const signedStatuses = await this.getSignedStatusByContractId(contract.id);
          const allSigned = signedStatuses.every(status => status === 1);
          this.$set(contract, 'signed', allSigned ? '1' : '0');
        }

        // 动画加载表格
        this.animateTableLoad();
      } catch (error) {
        console.error('加载合同列表失败:', error);
      }
    },
    async updateContractStatusFromServer(contractId) {
      try {
        const response = await axios.post('/contract/checkAndUpdateStatus', null, {
          params: { contractId }
        });
        return response.data.data.split(':')[1];
      } catch (error) {
        console.error('获取合同状态失败:', error);
        return '获取失败';
      }
    },
    //选择签署方法
    handleSignature() {
      this.signatureDialogVisible = false;  // 关闭选择框

      // 根据选择的签署方式进行不同的操作
      if (this.selectedSignatureMethod === 'privateKey') {
        this.signWithPrivateKey(this.contractToSign);
      } else if (this.selectedSignatureMethod === 'faceRecognition') {
        this.openFaceRecognitionDialog();
      }
      this.selectedSignatureMethod = '';
    },

    // 打开人脸识别对话框
    openFaceRecognitionDialog() {
      this.faceRecognitionDialogVisible = true;
      this.scanning = true; // 开始扫描

      // 访问摄像头
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          this.videoStream = stream;
          const video = document.getElementById('video');
          video.srcObject = stream;

          // 启动扫描动画
          this.startScanning();
        })
        .catch(err => {
          console.error("无法访问摄像头: ", err);
          this.showErrorMessage("无法访问摄像头，请检查摄像头权限");
        });
    },

    // 捕获人脸图像
    captureFace() {
      const video = document.getElementById('video');
      const canvas = document.getElementById('canvas');

      // 检查 DOM 元素是否存在
      if (!video || !canvas) {
        console.error('视频或 Canvas 元素未找到！');
        this.showErrorMessage('捕获失败，请重试！');
        return;
      }

      const context = canvas.getContext('2d');

      // 从视频流中捕获图像到 canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 停止扫描和摄像头流
     this.stopScanning();
     this.stopCamera();

      // 隐藏视频流，显示捕获的图像
      video.style.display = 'none';
      canvas.style.display = 'block';

      // 提示捕获成功
      document.getElementById('result').textContent = '人脸图像捕获成功！';

      const contract = this.contractToSign;
      this.submitFaceSignature(contract);
    },

    // 停止摄像头流
    stopCamera() {
      if (this.videoStream) {
        const tracks = this.videoStream.getTracks();
        tracks.forEach(track => track.stop());
        this.videoStream = null;
      }
    },

    // 启动扫描动画
    startScanning() {
      const scanLine = document.getElementById('scan-line');
      if (!scanLine) {
        console.error('扫描线元素未找到！');
        return;
      }
      scanLine.style.display = 'block'; // 显示扫描线

      let position = 0;
      const video = document.getElementById('video');
      const videoHeight = video.offsetHeight;

      // 使用定时器移动扫描线
      this.scanInterval = setInterval(() => {
        position += 5; // 每次移动 5px
        if (position >= videoHeight) {
          position = -2; // 重新从顶部开始，确保扫描线能覆盖底部
        }
        scanLine.style.top = `${position}px`;
      }, 30); // 每 30ms 更新一次位置
    }
    ,

    // 停止扫描动画
    stopScanning() {
      const scanLine = document.getElementById('scan-line');
      if (scanLine) {
        scanLine.style.display = 'none'; // 隐藏扫描线
      }
      if (this.scanInterval) {
        clearInterval(this.scanInterval); // 清除定时器
        this.scanInterval = null;
      }
    },

    // 提交人脸图像进行签署（保持和之前一致）
    submitFaceSignature(contract) {
      const canvas = document.getElementById('canvas');

      if (!canvas) {
        console.error('Canvas 元素未找到！');
        this.showErrorMessage('提交失败，未捕获人脸图像！');
        return;
      }

      canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('contractId', contract.id);
        formData.append('userId', this.$cookies.get('userId'));
        formData.append('blockchainAddress', this.$cookies.get('blockchainAddress'));
        formData.append('image', blob, 'face.png');

        try {
          axios.post('/contract/signWithFaceRecognition', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
            .then(response => {
              if (response.data.code === 200) {
                this.$set(contract, "signed", "1");
                // 使用持久化通知框
                this.$notify({
                  title: '成功',
                  message: '签署成功！合同已上链。',
                  type: 'success',
                  duration: 3000, // 持续3秒
                  duration: 0, // 持久化显示
                  showClose: true,
                  customClass: 'large-notification', // 应用自定义样式
                  onClose: () => {
                    location.reload(); // 页面刷新
                  },
                });
              } else {
                this.$notify({
                  title: '失败',
                  message: `${response.data.message}`,
                  type: 'error',
                  duration: 3000, // 持续3秒
                  duration: 0,
                  showClose: true,
                  customClass: 'large-notification', // 应用自定义样式
                  onClose: () => {
                    location.reload(); // 页面刷新
                  },
                });
              }
              this.faceRecognitionDialogVisible = false;
            })
        } catch (error) {
          console.error('签署失败:', error);
          this.showErrorMessage('签署失败，请重试！');
        } finally {
          this.isSigning = false;
        }
      }, 'image/png');
    },

    startFaceTracking() {
      const video = document.getElementById('video');

      // 人脸检测并绘制
      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

        if (detections.length > 0) {
          // 在视频画面上绘制人脸框
          const canvas = faceapi.createCanvasFromMedia(video);
          document.body.append(canvas);
          faceapi.matchDimensions(canvas, video);
          canvas?.detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors()
            .drawDetections();
        }
      }, 100); // 每 100ms 检测一次
    },



    // 显示错误消息
    showErrorMessage(message) {
      this.$notify({
        title: '错误',
        message: message,
        type: 'error',
        duration: 0, // 持久化显示
        showClose: true,
      });
    },


    animateTableLoad() {
      gsap.fromTo(".el-table .el-table__body-wrapper tbody tr", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 });
    },
    animateDialogOpen() {
      gsap.fromTo(".dialog-content", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.3 });
    },
    animateDialogClose() {
      gsap.to(".dialog-content", { opacity: 0, scale: 0.8, duration: 0.3 });
    },
    handleClose(done) {
      this.animateDialogClose();
      setTimeout(() => {
        this.currentContract = null;
        this.detailDialogVisible = false;
        done();
      }, 300);
    },
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    editContract(contract) {
      this.currentContract = { ...contract };
      this.editDialogVisible = true;
      this.initializeQuillEditor(); // 初始化 Quill 编辑器
    },
    initializeQuillEditor() {
      this.$nextTick(() => {
        this.quillEditor = new Quill('#editor', {
          theme: 'snow',
          modules: {
            toolbar: '#toolbar-container',
            syntax: true,
          },
        });

        // 确保 currentContractId 已正确设置
        if (!this.currentContract.id) {
          console.error('currentContractId 未正确设置');
          return;
        }

        // 使用 .then() 处理 Promise
        axios.get(`/contract/get/${this.currentContract.id}`)
          .then(response => {
            if (response.data && response.data.data) {
              this.currentContract.terms = response.data.data.terms;

              if (this.currentContract.terms) {
                this.quillEditor.clipboard.dangerouslyPasteHTML(this.currentContract.terms);
              }
            } else {
              console.error('响应数据结构不正确:', response.data);
            }
          })
          .catch(error => {
            console.error('获取合同条款时出错:', error);
          });
      });
    },
    saveChanges() {
      const terms = this.quillEditor.root.innerHTML;
      this.currentContract.terms = terms;

      const blockchainAddress = this.$cookies.get('blockchainAddress');
      if (!blockchainAddress) {
        alert('无法获取区块链地址，请检查Cookie设置。');
        return;
      }

      // 初始化 blockchainAddresses 为一个空数组
      if (!Array.isArray(this.currentContract.blockchainAddresses)) {
        this.$set(this.currentContract, 'blockchainAddresses', []);
      }

      // 检查 blockchainAddress 是否已存在
      if (!this.currentContract.blockchainAddresses.includes(blockchainAddress)) {
        this.currentContract.blockchainAddresses.push(blockchainAddress);
      }

      const params = new URLSearchParams();
      params.append('contractId', this.currentContract.id);
      params.append('name', this.currentContract.name);
      params.append('terms', terms);
      params.append('startDate', this.currentContract.startDate);
      params.append('endDate', this.currentContract.endDate);

      axios.post(`/contract/updateContractAndSignatories?${params.toString()}`, this.currentContract.blockchainAddresses)
        .then(response => {
          if (response.data.code === 200) {
            alert('合同更新成功');
            this.editDialogVisible = false;
            this.loadContracts();
            location.reload(); // 刷新页面
          } else {
            alert('合同更新失败: ' + response.data.message);
          }
        })
        .catch(error => {
          console.error('合同更新失败:', error);
          alert('合同更新失败');
        });

    },
    deleteContract(contract) {
      if (confirm(`确定删除合同: ${contract.name} 吗?`)) {
        axios.delete(`/contract/delete/${contract.id}`)
          .then(() => {
            alert('合同删除成功');
            this.loadContracts();
          })
          .catch(error => {
            console.error('删除失败:', error);
          });
      }
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
  },
  mounted() {
    this.loadContracts();
    gsap.fromTo(".header", { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 1 });
    gsap.fromTo(".navigator-container", { opacity: 0, x: -200 }, { opacity: 1, x: 0, duration: 0.8 });
    gsap.fromTo(".card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1 });
    // 调用后端接口获取所有用户地址
    this.fetchUserAddresses();

  }
}
</script>



<style scoped>
@import url("../../assets/css/ContractList.css");
</style>
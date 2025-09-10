<template>
    <el-container>
        <el-header class="header">
            <Header />
        </el-header>
        <el-main>
            <el-row :gutter="20">
                <!-- 人脸识别部分 -->
                <div class="face">
                    <h1>请对准摄像头</h1>
                    <!-- 摄像头画面 -->
                    <video id="video" autoplay v-show="!photoCaptured" class="video-frame"></video>

                    <!-- 显示捕获的图像 -->
                    <canvas id="canvas" width="710px" height="530px" v-show="photoCaptured"
                        class="canvas-frame"></canvas>
                    <img v-if="capturedImage" :src="capturedImage" alt="Captured Face" class="captured-image" />

                    <!-- 捕获和上传按钮 -->
                    <div class="button-group">
                        <el-button type="primary" @click="captureFace" v-if="!photoCaptured">捕获人脸图像</el-button>
                        <el-button type="success" @click="uploadFaceImage" v-if="photoCaptured">上传人脸图像</el-button>
                        <el-button type="danger" @click="retryCapture" v-if="photoCaptured">重新捕获</el-button>
                    </div>

                    <!-- 提示结果 -->
                    <p :style="{ color: resultColor }" class="result-text" v-if="resultMessage">{{ resultMessage }}</p>
                </div>
            </el-row>
        </el-main>
    </el-container>
</template>

<script>
import Header from '@/components/Header';
import axios from 'axios';

export default {
    name: "Dashboard",
    components: {
        Header,
    },
    data() {
        return {
            videoStream: null, // 存储摄像头流
            photoCaptured: false, // 是否已经捕获照片
            userId: '',
            capturedImage: null, // 存储捕获的图像数据
            resultMessage: '', // 显示上传结果的提示信息
            resultColor: '', // 提示信息的颜色
        };
    },
    mounted() {
        this.openFaceRecognitionDialog(); // 页面加载时直接打开摄像头
    },
    beforeDestroy() {
        this.stopCamera(); // 页面销毁时释放摄像头资源
    },
    methods: {
        // 打开摄像头
        openFaceRecognitionDialog() {
            this.photoCaptured = false; // 每次重置状态

            // 访问摄像头
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    this.videoStream = stream;
                    const video = document.getElementById('video');
                    video.srcObject = stream;
                })
                .catch(err => {
                    console.error("无法访问摄像头: ", err);
                    this.$message.error("无法访问摄像头，请检查摄像头权限或设备。");
                });
        },

        // 捕获人脸图像
        captureFace() {
            const video = document.getElementById('video');
            const canvas = document.getElementById('canvas');
            const context = canvas.getContext('2d');

            console.log('Capturing image...');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // 获取捕获的图像数据
            const imageData = canvas.toDataURL("image/png");

            // 存储捕获的图像
            this.capturedImage = imageData;

            // 停止摄像头流并隐藏视频
            this.photoCaptured = true;
            this.stopCamera();

            // 更新提示文本
            this.resultMessage = '人脸图像捕获成功！';
            this.resultColor = 'green'; // 设置成功提示为绿色
        },

        // 重新捕获图像
        retryCapture() {
            this.photoCaptured = false;
            this.capturedImage = null; // 清空捕获的图像
            this.resultMessage = ''; // 清空提示信息
            this.resultColor = ''; // 清空提示颜色
            this.openFaceRecognitionDialog(); // 重新启用摄像头
        },

        // 上传人脸图像到后端
        uploadFaceImage() {
            const canvas = document.getElementById('canvas');
            this.userId = this.$cookies.get('userId');
            // 将图像从 Canvas 转换为 Blob
            canvas.toBlob(blob => {
                const formData = new FormData();
                formData.append("userId", this.userId); // 示例用户 ID，可替换为实际数据
                formData.append("image", blob, "face.png");

                // 提交到后端接口
                axios.post("/contract/uploadFaceImage", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                    .then(response => {
                        if (response.data.code === 200) {
                            this.$message.success({
                                message: '人脸图像上传成功！',
                                duration: 1500 // 设置为 1.5 秒
                            });
                        } else {
                            this.$message.error({
                                message: '上传失败：' + response.data.message,
                                duration: 1500 // 设置为 1.5 秒
                            });
                        }
                    })
                    .catch(error => {
                        console.error("上传失败: ", error);
                        this.$message.error({
                            message: '上传失败，请重试！',
                            duration: 1500 // 设置为 1.5 秒
                        });
                    });
            }, "image/png");
        },

        // 停止摄像头流
        stopCamera() {
            if (this.videoStream) {
                const tracks = this.videoStream.getTracks();
                tracks.forEach(track => track.stop());
                this.videoStream = null;
            }
        },
    },
};
</script>

<style scoped>
/* 整体背景样式 */
body,
html {
    margin: 0;
    padding: 0;
    background-color: #f5f7fa;
    font-family: 'Arial', sans-serif;
    color: #333;
}

h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
}

#video,
#canvas {
    border: 1px solid #dcdfe6;
    width: 693px;
    /* 设置视频宽度为600px */
    height: auto;
    /* 设置视频高度为600px */
    border-radius: 4px;
}

.button-group {
    text-align: center;
    margin-top: 10px;
}

.result-text {
    text-align: center;
    font-size: 16px;
    margin-top: 10px;
}

.upload-card {
    padding: 20px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    background-color: #ffffff;
}

.upload-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.preview-container {
    margin-top: 15px;
}

.preview-image {
    max-width: 100%;
    height: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
}

@media (max-width: 768px) {
    .upload-container {
        flex-direction: column;
        align-items: stretch;
    }

    .button-group {
        display: flex;
        flex-direction: column;
    }
}

.face {
    width: 60%;
    margin: 0 auto;
    height: 100%;
    text-align: center;
}

.captured-image {
    margin-top: 20px;
    max-width: 100%;
    height: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
}
</style>

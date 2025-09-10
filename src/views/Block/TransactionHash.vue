<template>
    <!-- 交易信息页面 -->
    <div>
        <!-- 页面容器 -->
        <el-container>
            <!-- 顶部标题栏 -->
            <el-header class="header">
                <Header />
            </el-header>

            <!-- 页面主体内容 -->
            <el-main>
                <div class="details-container">
                    <!-- 页面标题 -->
                    <h1 class="page-title">交易详情</h1>

                    <!-- 交易哈希信息 -->
                    <p class="hash-info"><strong>传递的交易哈希：</strong> {{ transactionHash }}</p>

                    <!-- 交易详情卡片 -->
                    <el-card v-if="transactionData" class="transaction-card">
                        <h2 class="card-title">交易信息</h2>
                        <div class="card-content">
                            <p><strong>区块高度：</strong> {{ transactionData.blockHeight }}</p>
                            <p><strong>交易状态：</strong> {{ transactionData.status ? '成功' : '失败' }}</p>
                            <p><strong>发送方：</strong> {{ transactionData.from }}</p>
                            <p><strong>接收方：</strong> {{ transactionData.to }}</p>
                            <p><strong>交易哈希：</strong> {{ transactionData.transactionHash }}</p>
                        </div>
                    </el-card>
                </div>
                <!-- 合同信息 -->
            </el-main>
        </el-container>
    </div>
</template>

<script>
import Header from '@/components/Header';


export default {
    data() {
        return {
            transactionHash: '',
            transactionData: null, // 用于存储接口返回的交易详情数据
        };
    },
    components: {
        Header
    },
    created() {
        const transactionHash = this.$route.query.transactionHash; // 从路由参数中获取
        this.transactionHash = transactionHash; // 保存到 data 中
        this.fetchTransactionData(this.transactionHash); // 调用接口

    },
    methods: {
        fetchTransactionData(transactionHash) {
            this.axios.get('/contract/getTransactionHash', { params: { transactionHash } })
                .then((response) => {
                    const data = response.data;

                    // 格式化时间戳
                    if (data.timestamp) {
                        const date = new Date(data.timestamp);
                        data.timestamp = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
                    }

                    this.$set(this, 'transactionData', data);
                })
                .catch((error) => {
                    console.error('获取交易详情失败:' + error);
                    this.$message.error('获取交易详情失败');
                });
        }
    }
};

</script>
<style scoped>
@import url("../../assets/css/TransactionHash.css");
</style>

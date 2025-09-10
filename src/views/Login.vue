<template>
  <div class="contentBox">
    <div class="login-container">
      <div class="left-section">
        <img src="../assets/logo4.png" alt="logo" class="logo">
      </div>
      <div class="right-section">
        <el-card class="login-card" shadow="hover">
          <div class="login-text">
            <a href="javascript:;" :class="typeView == 0 ? 'active' : ''">登录</a>
            <b>·</b>
            <a href="javascript:;" :class="typeView == 1 ? 'active' : ''" @click="register">注册</a>
          </div>
          <el-form :model="loginForm" :rules="rules" ref="loginForm" label-width="80px" class="login-form">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="loginForm.email" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input type="password" v-model="loginForm.password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="验证码" prop="validCode">
              <el-input v-model="loginForm.validCode" autocomplete="off"></el-input>
              <ValidCode @input="createValidCode" />
            </el-form-item>
            <el-form-item>
              <el-row :gutter="20">
                <el-col :span="10">
                  <el-button type="primary" @click="submitForm('loginForm')" style="width: 80%;">登录</el-button>
                </el-col>
                <el-col :span="10" :offset="4">
                  <el-button @click="resetForm('loginForm')" style="width: 20%;">重置</el-button>
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ValidCode from '@/components/ValidCode.vue';
export default {
  components: {
    ValidCode,
  },
  data() {
    return {
      typeView: 0,
      loginForm: {
        email: '',
        password: '',
        valid: ''
      },
      validCode: '',
      rules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        validCode: [  // 添加验证码的必填规则
          { required: true, message: '请输入验证码', trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    // 接收验证码组件提交的 4位验证码
    createValidCode(data) {
      this.validCode = data
    },
    register() {
      this.$router.push('/register');
    },
    async submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          // 校验验证码是否正确
          if (this.loginForm.validCode.toLowerCase() !== this.validCode.toLowerCase()) {
            this.$message.error('验证码错误，请重新输入。');
            return;
          }

          try {
            const response = await axios.post('/api/login', this.loginForm);
            if (response.data.code === 200) {
              this.$message({
                message: '登录成功!',
                type: 'success',
                duration: 1000,
              });

              // 保存 JWT 令牌到 cookie 中
              this.$cookies.set('token', response.data.data.token);
              this.$cookies.set('userId', response.data.data.userId);
              const userId = response.data.data.userId;

              console.log('User ID:', userId);
              // 获取区块链地址并保存到 cookie
              axios.get(`/contract/user/${userId}/blockchain-address`)
                .then(response => {
                  console.log('Blockchain address:', response.data.data.blockchainAddress);
                  this.$cookies.set('blockchainAddress', response.data.data.blockchainAddress);
                })
                .catch(error => {
                  console.error('Error fetching blockchain address:', error);
                });

              // 跳转到仪表盘页面
              this.$router.push('/dashboard');
            } else {
              // 登录失败的错误提示
              this.$message.error(response.data.message);
            }
          } catch (error) {
            console.error('Login error:', error);
            this.$message.error('登录失败，请检查网络或稍后重试。');
          }
        } else {
          this.$message.error('请填写完整的表单信息。');
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

  },
};
</script>


<style scoped>
.contentBox {
  width: 100%;
  height: 100vh;
  background: url('./img/loginBg.png') no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-container {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.left-section {
  width: 30%;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.left-section .logo {
  width: 100%;
  height: auto;
}

.right-section {
  width: 70%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-card {
  width: 100%;
  border: none;
}

.login-text {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  font-size: 24px;
}

.login-text a {
  padding: 10px;
  color: #969696;
  cursor: pointer;
}

.login-text a.active {
  font-weight: 600;
  color: #409EFF;
  border-bottom: 2px solid #409EFF;
}

.login-text b {
  padding: 0 10px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-button {
  margin-bottom: 10px;
}

.el-form-item:last-child .el-button:last-child {
  margin-bottom: 0;
}
</style>

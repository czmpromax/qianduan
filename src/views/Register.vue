<template>
  <div class="contentBox">
    <div class="register-container">
      <div class="left-section">
        <img src="../assets/logo4.png" alt="logo" class="logo">
      </div>
      <div class="right-section">
        <el-card class="register-card" shadow="hover">
          <div class="register-text">
            <a href="javascript:;" :class="typeView == 0 ? 'active' : ''" @click="login">登录</a>
            <b>·</b>
            <a href="javascript:;" :class="typeView == 1 ? 'active' : ''">注册</a>
          </div>
          <el-form :model="registerForm" :rules="rules" ref="registerForm" label-width="80px" class="register-form">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="registerForm.username" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="registerForm.email" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input type="password" v-model="registerForm.password" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input type="password" v-model="registerForm.confirmPassword" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item>
              <div v-if="registerForm.password && passwordStrengthBar.width > 0" class="password-strength-bar">
                <div :style="{ width: passwordStrengthBar.width + '%', background: passwordStrengthBar.color }"></div>
              </div>
              <div v-if="registerForm.password && passwordStrengthText" :style="{ color: passwordStrengthBar.color }"
                class="password-strength-text">
                {{ passwordStrengthText }}
              </div>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm('registerForm')">注册</el-button>
              <el-button @click="resetForm('registerForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      typeView: 1, // 1表示注册，0表示登录
      registerForm: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
          { validator: this.validateEmail, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' },
          { validator: this.validatePasswordComplexity, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ]
      },
      passwordStrengthBar: { width: 0, color: '' },
      passwordStrengthText: ''
    };
  },
  watch: {
    'registerForm.password': {
      handler(newVal) {
        this.updatePasswordStrength(newVal);
      },
      immediate: true
    }
  },
  methods: {
    login() {
      this.$router.push('/login');
    },
    async submitForm(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          try {
            const response = await axios.post('/api/register', this.registerForm);
            if (response.data.code === 200) {
              const privateKey = response.data.data.privateKey;
              this.$alert(
                `注册成功！请妥善保存您的私钥：<br><b style="word-break: break-all;">${privateKey}</b>`,
                '注册成功',
                {
                  dangerouslyUseHTMLString: true,
                  confirmButtonText: '确定',
                  callback: () => {
                    this.$router.push('/login'); // 跳转到登录页面
                  },
                });
            } else {
              this.$message.error(`${response.data.message}`);
            }
          } catch (error) {
            console.error(error);
            this.$message.error('注册失败，请稍后重试');
          }
        } else {
          console.log('注册表单验证失败!!');
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.resetPasswordStrength();
    },
    updatePasswordStrength(password) {
      // 如果密码为空，重置并返回
      if (!password) {
        this.resetPasswordStrength();
        return;
      }

      const levels = [
        { regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{12,}$/, color: 'darkgreen', text: '极强', width: 100 },
        { regex: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/, color: 'green', text: '强', width: 80 },
        { regex: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/, color: 'blue', text: '中', width: 60 },
        { regex: /^(?=.*[A-Za-z\d]).{6,}$/, color: 'orange', text: '弱', width: 40 },
        { regex: /^.{0,5}$/, color: 'red', text: '极弱', width: 20 }
      ];


      this.resetPasswordStrength();

      for (const level of levels) {
        if (level.regex.test(password)) {
          this.passwordStrengthBar.color = level.color;
          this.passwordStrengthBar.width = level.width;
          this.passwordStrengthText = level.text;
          break;
        }
      }
    },
    resetPasswordStrength() {
      this.passwordStrengthBar = { width: 0, color: '' };
      this.passwordStrengthText = '';
    },
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    },
    validateEmail(rule, value, callback) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        callback(new Error('请输入有效的电子邮箱'));
      } else {
        callback();
      }
    }
  }
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

.register-container {
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

.register-card {
  width: 100%;
  border: none;
}

.register-text {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  font-size: 24px;
}

.register-text a {
  padding: 10px;
  color: #969696;
  cursor: pointer;
}

.register-text a.active {
  font-weight: 600;
  color: #409EFF;
  border-bottom: 2px solid #409EFF;
}

.register-text b {
  padding: 0 10px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-button {
  width: 100%;
  margin-bottom: 10px;
}

.el-form-item:last-child .el-button:last-child {
  margin-bottom: 0;
}

.password-strength-bar {
  height: 5px;
  border-radius: 3px;
  overflow: hidden;
  background-color: #f0f0f0;
}

.password-strength-bar div {
  height: 100%;
  transition: width 0.3s;
}

.password-strength-text {
  margin-top: 5px;
  font-size: 12px;
}
</style>

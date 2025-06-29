class AuthManager {
  constructor() {
    this.initializeAuth();
    this.checkAuthState();
  }

  initializeAuth() {
    // 登入表單處理
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    // 註冊表單處理
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }

    // 社交登入按鈕（簡化版）
    const googleBtn = document.querySelector(".social-button.google");
    const facebookBtn = document.querySelector(".social-button.facebook");

    if (googleBtn) {
      googleBtn.addEventListener("click", () =>
        this.handleSocialSignIn("google")
      );
    }
    if (facebookBtn) {
      facebookBtn.addEventListener("click", () =>
        this.handleSocialSignIn("facebook")
      );
    }

    // 登出功能
    document.addEventListener("click", (e) => {
      if (e.target.matches(".auth-signout")) {
        this.signOut();
      }
    });
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      // 簡化的登入驗證（在實際應用中應該與後端API驗證）
      if (email && password.length >= 6) {
        const user = {
          email: email,
          displayName: email.split("@")[0],
          loginTime: new Date().toISOString(),
        };

        localStorage.setItem("currentUser", JSON.stringify(user));
        this.showSuccess("登入成功！");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        throw new Error("請輸入有效的電子郵件和密碼（至少6位字符）");
      }
    } catch (error) {
      this.showError(error.message);
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const fullName = document.getElementById("fullName").value;

    if (password !== confirmPassword) {
      this.showError("密碼不匹配");
      return;
    }

    if (password.length < 6) {
      this.showError("密碼至少需要6位字符");
      return;
    }

    try {
      const user = {
        email: email,
        displayName: fullName || email.split("@")[0],
        registerTime: new Date().toISOString(),
      };

      localStorage.setItem("currentUser", JSON.stringify(user));
      this.showSuccess("註冊成功！");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } catch (error) {
      this.showError(error.message);
    }
  }

  handleSocialSignIn(provider) {
    try {
      // 模擬社交登入
      const user = {
        email: `user@${provider}.com`,
        displayName: `${
          provider.charAt(0).toUpperCase() + provider.slice(1)
        } User`,
        provider: provider,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("currentUser", JSON.stringify(user));
      this.showSuccess(`${provider} 登入成功！`);

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } catch (error) {
      this.showError(`${provider} 登入失敗：${error.message}`);
    }
  }

  checkAuthState() {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.handleAuthStateChange(user);
    }
  }

  handleAuthStateChange(user) {
    // 根據認證狀態更新UI
    const authButtons = document.querySelectorAll(
      ".auth-button.login, .auth-button.register"
    );
    const userProfile = document.querySelector(".user-profile");

    if (authButtons) {
      authButtons.forEach((button) => {
        button.style.display = user ? "none" : "inline-block";
      });
    }

    // 更新用戶資料（如果可用）
    if (userProfile && user) {
      userProfile.style.display = "flex";
      userProfile.innerHTML = `
                <div class="profile-info">
                    <span class="user-name">${user.displayName}</span>
                    <span class="user-email">${user.email}</span>
                </div>
                <button class="auth-signout">登出</button>
            `;
    }
  }

  showError(message) {
    this.showMessage(message, "error");
  }

  showSuccess(message) {
    this.showMessage(message, "success");
  }

  showMessage(message, type) {
    // 創建或更新訊息元素
    let messageElement = document.querySelector(".auth-message");
    if (!messageElement) {
      messageElement = document.createElement("div");
      messageElement.className = "auth-message";
      const form = document.querySelector(".auth-form");
      if (form) {
        form.prepend(messageElement);
      }
    }

    messageElement.textContent = message;
    messageElement.className = `auth-message ${type}`;
    messageElement.style.display = "block";

    // 5秒後隱藏訊息
    setTimeout(() => {
      messageElement.style.display = "none";
    }, 5000);
  }

  async signOut() {
    try {
      localStorage.removeItem("currentUser");
      this.showSuccess("已成功登出");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch (error) {
      this.showError(error.message);
    }
  }

  getCurrentUser() {
    const currentUser = localStorage.getItem("currentUser");
    return currentUser ? JSON.parse(currentUser) : null;
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }
}

// 初始化認證管理器
const authManager = new AuthManager();

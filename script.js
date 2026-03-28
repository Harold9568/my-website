document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("theme-toggle");
    const icon = toggleButton.querySelector("i");
    const body = document.body;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    // --- 核心函数：应用主题 ---
    // mode: "light" | "dark" | "auto"
    const applyMode = (mode) => {
        let isDark = false;

        // 1. 逻辑判断
        if (mode === "auto") {
            isDark = systemPrefersDark.matches;
            // 提示用户当前状态
            toggleButton.setAttribute("title", "Auto (System Theme)");
            console.log("Theme mode: Auto (System)"); // 调试用
        } else {
            isDark = mode === "dark";
            toggleButton.setAttribute(
                "title",
                `${isDark ? "Dark Mode" : "Light Mode"} (Hold to Auto)`
            );
        }

        // 2. DOM 操作
        if (isDark) {
            body.classList.add("dark-mode");
            icon.classList.remove("fa-moon");
            icon.classList.add("fa-sun");
        } else {
            body.classList.remove("dark-mode");
            icon.classList.remove("fa-sun");
            icon.classList.add("fa-moon");
        }

        // 3. 存储状态
        if (mode === "auto") {
            localStorage.removeItem("theme");
        } else {
            localStorage.setItem("theme", mode);
        }
    };

    // --- 初始化 ---
    const savedTheme = localStorage.getItem("theme");
    applyMode(savedTheme ? savedTheme : "auto");

    // --- 交互逻辑变量 ---
    let longPressTimer;
    let isLongPress = false; // 用于标记是否触发了长按，防止松手时触发点击

    // --- 1. 按下 (鼠标/手指) ---
    const startPress = (e) => {
        // 如果是右键点击则忽略
        if (e.type === "mousedown" && e.button !== 0) return;

        isLongPress = false; // 重置标记

        // 开启定时器，1000毫秒(1秒)后触发重置
        longPressTimer = setTimeout(() => {
            isLongPress = true; // 标记为已触发长按
            applyMode("auto"); // 执行重置

            // 可选：给个震动反馈 (仅安卓有效) 或者 视觉反馈
            if (navigator.vibrate) navigator.vibrate(50);
            // 简单的视觉反馈：让图标闪一下
            toggleButton.style.opacity = "0.5";
            setTimeout(() => (toggleButton.style.opacity = "1"), 200);
        }, 800); // 800ms 算长按，比较舒服
    };

    // --- 2. 松开/移开 ---
    const cancelPress = () => {
        clearTimeout(longPressTimer); // 清除定时器
        // 注意：这里不恢复 opacity，依靠 CSS hover 自动恢复或上面的 setTimeout
    };

    // --- 3. 点击事件 (短按) ---
    const handleClick = (e) => {
        // 如果刚才触发了长按逻辑，这里就直接拦截，不再执行切换
        if (isLongPress) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // 正常的短按切换逻辑
        const currentIsDark = body.classList.contains("dark-mode");
        const newMode = currentIsDark ? "light" : "dark"; // 强制切换到反向
        applyMode(newMode);
    };

    // --- 绑定事件 ---

    // 鼠标/触摸按下
    toggleButton.addEventListener("mousedown", startPress);
    toggleButton.addEventListener("touchstart", startPress, { passive: true });

    // 鼠标/触摸松开或离开
    toggleButton.addEventListener("mouseup", cancelPress);
    toggleButton.addEventListener("mouseleave", cancelPress);
    toggleButton.addEventListener("touchend", cancelPress);

    // 点击
    toggleButton.addEventListener("click", handleClick);

    // --- 监听系统变化 (自动模式下生效) ---
    systemPrefersDark.addEventListener("change", () => {
        if (!localStorage.getItem("theme")) {
            applyMode("auto");
        }
    });
});

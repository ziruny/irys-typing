// ==UserScript==
// @name         SpriteType 自动打字助手
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动刷新页面并执行打字游戏
// @author       ZY
// @match        https://spritetype.irys.xyz/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 刷新间隔：10分钟 = 600000毫秒
    const REFRESH_INTERVAL = 10 * 60 * 1000;

    // 页面加载完成后的延迟时间
    const PAGE_LOAD_DELAY = 3000;

    let refreshTimer = null;
    let isScriptRunning = false;

    // 工具函数
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function triggerInput(input, value) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        const inputEvent = new Event('input', { bubbles: true });

        nativeInputValueSetter.call(input, value);
        input.dispatchEvent(inputEvent);
    }

    function triggerTab() {
        const el = document.activeElement || document.body;
        el.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', code: 'Tab', keyCode: 9, bubbles: true}));
        el.dispatchEvent(new KeyboardEvent('keyup', {key: 'Tab', code: 'Tab', keyCode: 9, bubbles: true}));
    }

    // 模拟人类延迟
    function getHumanDelay() {
        const baseDelay = 80 + Math.random() * 70;
        if (Math.random() < 0.08) {
            return baseDelay + 150 + Math.random() * 200;
        }
        return baseDelay;
    }

    function getWordDelay() {
        return 200 + Math.random() * 150;
    }

    function getReadingDelay() {
        return 100 + Math.random() * 100;
    }

    // 检查游戏是否完成
    function isGameCompleted() {
        const spaceY3Container = document.querySelector('.space-y-3');
        if (!spaceY3Container) return false;

        const buttons = spaceY3Container.querySelectorAll('button');
        return buttons.length >= 2;
    }

    // 提交分数
    async function submitScore() {
        console.log('🎯 游戏完成，准备提交分数...');

        const spaceY3Container = document.querySelector('.space-y-3');
        if (!spaceY3Container) {
            console.log('❌ 未找到按钮容器');
            return false;
        }

        const buttons = spaceY3Container.querySelectorAll('button');
        if (buttons.length < 2) {
            console.log('❌ 按钮数量不足');
            return false;
        }

        const submitButton = buttons[1];
        console.log('📤 点击提交分数按钮...');
        submitButton.click();

        await sleep(5000);
        return true;
    }

    // 重新开始游戏
    async function restartGame() {
        console.log('🔄 准备重新开始游戏...');

        const spaceY3Container = document.querySelector('.space-y-3');
        if (!spaceY3Container) {
            console.log('❌ 未找到按钮容器');
            return false;
        }

        const buttons = spaceY3Container.querySelectorAll('button');
        if (buttons.length < 1) {
            console.log('❌ 未找到重新开始按钮');
            return false;
        }

        const restartButton = buttons[0];
        console.log('🎮 点击重新开始按钮...');
        restartButton.click();

        await sleep(1000);

        console.log('⌨️ 按Tab键开始新游戏...');
        triggerTab();
        await sleep(600);

        return true;
    }

    // 自动打字主函数
    async function autoType() {
        if (isScriptRunning) {
            console.log('⚠️ 脚本已在运行中，跳过重复执行');
            return;
        }

        isScriptRunning = true;
        let gameStartTime = Date.now();
        const GAME_DURATION = 15000; // 15秒
        const ERROR_PROBABILITY = 0.02; // 2% 的错误概率

        console.log('🎮 开始自动打字游戏循环...');

        // 初始按Tab键获得焦点
        triggerTab();
        await sleep(600);

        while (true) {
            // 检查游戏是否完成（15秒或出现完成界面）
            const currentTime = Date.now();
            const gameElapsed = currentTime - gameStartTime;

            if (gameElapsed >= GAME_DURATION || isGameCompleted()) {
                console.log('⏰ 游戏时间到或检测到完成界面');

                // 等待完成界面完全加载
                await sleep(10000);

                // 提交分数
                const submitSuccess = await submitScore();
                if (!submitSuccess) {
                    console.log('❌ 提交分数失败，等待重试...');
                    await sleep(2000);
                    continue;
                }

                // 重新开始游戏
                const restartSuccess = await restartGame();
                if (!restartSuccess) {
                    console.log('❌ 重新开始失败，等待重试...');
                    await sleep(2000);
                    continue;
                }

                // 重置游戏开始时间
                gameStartTime = Date.now();
                console.log('🎮 新一轮游戏开始！');
                continue;
            }

            const input = document.querySelector('input[type="text"]');
            if (!input) {
                await sleep(1000);
                continue;
            }

            input.focus();

            const wordElems = document.querySelectorAll('div[class*="text-"]');
            const activeWord = Array.from(wordElems).find(el =>
                el.innerText.trim().length > 0 &&
                window.getComputedStyle(el).color === 'rgb(255, 255, 255)'
            );

            if (!activeWord) {
                await sleep(500);
                continue;
            }

            const word = activeWord.innerText.trim();
            console.log(`📝 输入单词: ${word}`);

            await sleep(getReadingDelay());

            let current = '';
            for (let i = 0; i < word.length; i++) {
                const char = word[i];
                current += char;

                // 以 ERROR_PROBABILITY 的概率输入错误
                if (Math.random() < ERROR_PROBABILITY) {
                    current = current.slice(0, -1) + String.fromCharCode(Math.floor(Math.random() * 26) + 97);
                    console.log(`📝 输入错误: ${current}`);
                } else {
                    triggerInput(input, current);
                }

                const delay = getHumanDelay();
                await sleep(delay);

                if (Math.random() < 0.02) {
                    await sleep(100 + Math.random() * 150);
                }
            }

            triggerInput(input, current + ' ');
            await sleep(getWordDelay());

            if (wordElems.length === 1) {
                console.log('📝 本轮单词完成，继续下一个...');
                await sleep(150);
            }

            await sleep(150);
        }
    }

    // 设置定时刷新
    function setupAutoRefresh() {
        console.log('⏰ 设置自动刷新定时器，间隔：10分钟');

        refreshTimer = setInterval(() => {
            console.log('🔄 定时刷新页面...');
            location.reload();
        }, REFRESH_INTERVAL);
    }

    // 页面加载完成后启动脚本
    function initializeScript() {
        console.log('🚀 SpriteType 自动打字助手已启动');
        console.log('📅 每10分钟自动刷新页面');

        // 等待页面完全加载
        setTimeout(() => {
            autoType();
        }, PAGE_LOAD_DELAY);

        // 设置自动刷新
        setupAutoRefresh();
    }

    // 页面卸载时清理定时器
    window.addEventListener('beforeunload', () => {
        if (refreshTimer) {
            clearInterval(refreshTimer);
            console.log('🧹 清理定时器');
        }
    });

    // 启动脚本
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeScript);
    } else {
        initializeScript();
    }

})();

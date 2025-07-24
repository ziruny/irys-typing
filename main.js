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
    // 检查是否有提交分数的按钮出现
    const spaceY3Container = document.querySelector('.space-y-3');
    if (!spaceY3Container) return false;
    
    const buttons = spaceY3Container.querySelectorAll('button');
    return buttons.length >= 2; // 有提交分数和重新开始按钮
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
    
    // 点击第二个按钮（提交分数）
    const submitButton = buttons[1];
    console.log('📤 点击提交分数按钮...');
    submitButton.click();
    
    // 等待5秒
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
    
    // 点击第一个按钮（重新开始）
    const restartButton = buttons[0];
    console.log('🎮 点击重新开始按钮...');
    restartButton.click();
    
    // 等待页面响应
    await sleep(1000);
    
    // 按Tab键开始新游戏
    console.log('⌨️ 按Tab键开始新游戏...');
    triggerTab();
    await sleep(600);
    
    return true;
}

async function autoType() {
    let gameStartTime = Date.now();
    const GAME_DURATION = 15000; // 15秒
    
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
            await sleep(2000);
            
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
            triggerInput(input, current);
            
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

// 开始自动打字
console.log('🎮 开始自动打字游戏循环...');
autoType();

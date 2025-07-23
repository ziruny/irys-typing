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
    // 基础延迟 80-150ms，较快速度
    const baseDelay = 80 + Math.random() * 70;
    
    // 8% 概率有较长停顿
    if (Math.random() < 0.08) {
        return baseDelay + 150 + Math.random() * 200;
    }
    
    return baseDelay;
}

// 单词间的停顿
function getWordDelay() {
    return 200 + Math.random() * 150; // 200-350ms
}

// 模拟阅读时间
function getReadingDelay() {
    return 100 + Math.random() * 100; // 100-200ms
}

async function autoType() {
    // 先按 Tab 键获得焦点
    triggerTab();
    await sleep(600);
    
    while (true) {
        const input = document.querySelector('input[type="text"]');
        if (!input) {
            await sleep(1000);
            continue;
        }
        
        // 确保输入框获得焦点
        input.focus();
        
        // 查找当前需要输入的单词
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
        
        // 单词开始前的快速阅读
        await sleep(getReadingDelay());
        
        // 逐字符输入
        let current = '';
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            current += char;
            triggerInput(input, current);
            
            // 较快速度延迟
            const delay = getHumanDelay();
            await sleep(delay);
            
            // 偶尔会有轻微犹豫
            if (Math.random() < 0.02) { // 2% 概率
                await sleep(100 + Math.random() * 150);
            }
        }
        
        // 添加空格，单词间停顿
        triggerInput(input, current + ' ');
        await sleep(getWordDelay());
        
        // 检查是否是最后一个单词
        if (wordElems.length === 1) {
            console.log('🎉 本轮完成，等待新单词...');
            await sleep(1500 + Math.random() * 800); // 1.5-2.3秒等待
            triggerTab();
            await sleep(600);
        }
        
        await sleep(150);
    }
}

// 开始自动打字
console.log('🎮 开始自动打字游戏...');
autoType();

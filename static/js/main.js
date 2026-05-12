let currentAlgo = 'caesar';
let history = JSON.parse(localStorage.getItem('crypto_history') || '[]');

document.addEventListener('DOMContentLoaded', () => {
    updateHistoryUI();
    // Load theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light');
        updateThemeIcon();
    }
});

function toggleTheme() {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (document.body.classList.contains('light')) {
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.364 17.636l-.707.707M17.636 17.636l-.707.707M6.364 6.364l-.707.707M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>';
    } else {
        icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>';
    }
}

function setAlgo(algo) {
    currentAlgo = algo;
    
    // Update Tabs UI
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`tab-${algo}`).classList.add('active');

    // Update Input Visibility
    document.querySelectorAll('.key-group').forEach(group => {
        group.classList.add('hidden');
    });

    if (algo === 'caesar') {
        document.getElementById('caesar-keys').classList.remove('hidden');
    } else if (algo === 'vigenere' || algo === 'playfair') {
        document.getElementById('string-keys').classList.remove('hidden');
    } else if (algo === 'affine') {
        document.getElementById('affine-keys').classList.remove('hidden');
    } else if (algo === 'hill') {
        document.getElementById('hill-keys').classList.remove('hidden');
    }
}

async function process(mode) {
    const text = document.getElementById('inputText').value;
    if (!text) {
        alert('Masukkan pesan terlebih dahulu!');
        return;
    }

    let payload = {
        algo: currentAlgo,
        text: text,
        mode: mode
    };

    if (currentAlgo === 'caesar') {
        payload.key = document.getElementById('caesar-shift').value;
    } else if (currentAlgo === 'vigenere' || currentAlgo === 'playfair') {
        payload.key = document.getElementById('keyword').value;
    } else if (currentAlgo === 'affine') {
        payload.a = document.getElementById('affine-a').value;
        payload.b = document.getElementById('affine-b').value;
    } else if (currentAlgo === 'hill') {
        payload.matrix = [
            [parseInt(document.getElementById('h00').value), parseInt(document.getElementById('h01').value)],
            [parseInt(document.getElementById('h10').value), parseInt(document.getElementById('h11').value)]
        ];
    }

    try {
        const response = await fetch('/api/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            alert(data.error);
            return;
        }

        displayResult(data.result, data.steps);
        addToHistory(currentAlgo, mode, text, data.result);
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan pada server.');
    }
}

function displayResult(result, steps) {
    document.getElementById('result-panel').classList.remove('hidden');
    document.getElementById('output-text').textContent = result;

    const stepsList = document.getElementById('steps-list');
    stepsList.innerHTML = '';

    steps.forEach((step, index) => {
        const stepEl = document.createElement('div');
        stepEl.className = 'step-item flex gap-3 p-3 rounded-lg bg-white/5 border border-white/5';
        stepEl.style.animationDelay = `${index * 0.1}s`;
        
        // Special rendering for Hill Cipher steps
        if (step.includes('Baris') && currentAlgo === 'hill') {
            step = step.replace('mod 26', '<span class="text-indigo-400 font-bold">mod 26</span>');
        }

        // Special rendering for Playfair matrix
        if (step.includes('|') && currentAlgo === 'playfair') {
            const cells = step.split('|').map(s => s.trim());
            let tableHtml = '<table class="playfair-table"><tr>';
            cells.forEach(c => tableHtml += `<td>${c}</td>`);
            tableHtml += '</tr></table>';
            stepEl.innerHTML = `
                <div class="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">${index + 1}</div>
                <div>${tableHtml}</div>
            `;
        } else {
            stepEl.innerHTML = `
                <div class="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">${index + 1}</div>
                <div class="flex-1 overflow-x-auto">${step}</div>
            `;
        }
        stepsList.appendChild(stepEl);
    });

    // Re-render math if KaTeX is available
    if (window.renderMathInElement) {
        renderMathInElement(stepsList);
    }
}

function addToHistory(algo, mode, input, output) {
    const item = {
        algo: algo,
        mode: mode,
        input: input.substring(0, 20) + (input.length > 20 ? '...' : ''),
        output: output.substring(0, 20) + (output.length > 20 ? '...' : ''),
        time: new Date().toLocaleTimeString()
    };

    history.unshift(item);
    if (history.length > 10) history.pop();
    localStorage.setItem('crypto_history', JSON.stringify(history));
    updateHistoryUI();
}

function updateHistoryUI() {
    const historyList = document.getElementById('history-list');
    if (history.length === 0) {
        historyList.innerHTML = '<p class="text-center text-gray-600 text-sm py-8">Belum ada riwayat</p>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="flex justify-between items-start mb-1">
                <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-400">${item.algo} | ${item.mode}</span>
                <span class="text-[10px] text-gray-500">${item.time}</span>
            </div>
            <div class="text-xs text-gray-400 truncate">In: ${item.input}</div>
            <div class="text-xs text-indigo-300 font-mono truncate">Out: ${item.output}</div>
        </div>
    `).join('');
}

function clearHistory() {
    history = [];
    localStorage.removeItem('crypto_history');
    updateHistoryUI();
}

function copyResult() {
    const result = document.getElementById('output-text').textContent;
    navigator.clipboard.writeText(result).then(() => {
        alert('Hasil disalin ke clipboard!');
    });
}

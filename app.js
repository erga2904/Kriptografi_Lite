let currentCipher = 'vigenere';

function showAppWarning(message, title = 'Input belum lengkap') {
    const container = document.getElementById('app-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'app-toast';
    toast.innerHTML = `
        <div class="app-toast-icon" aria-hidden="true">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-.01-12a9 9 0 100 18 9 9 0 000-18z"/>
            </svg>
        </div>
        <div>
            <p class="app-toast-title">${title}</p>
            <p class="app-toast-message">${message}</p>
        </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 220);
    }, 2600);
}

function switchTab(cipher) {
    currentCipher = cipher;
    const vigenereTab = document.getElementById('tab-vigenere');
    const caesarTab = document.getElementById('tab-caesar');
    const indicator = document.getElementById('tab-indicator');

    if (cipher === 'vigenere') {
        vigenereTab.classList.add('active');
        vigenereTab.classList.remove('text-gray-400');
        caesarTab.classList.remove('active');
        caesarTab.classList.add('text-gray-400');
        indicator.style.transform = 'translateX(0)';
    } else {
        caesarTab.classList.add('active');
        caesarTab.classList.remove('text-gray-400');
        vigenereTab.classList.remove('active');
        vigenereTab.classList.add('text-gray-400');
        indicator.style.transform = 'translateX(calc(100% + var(--tab-gap)))';
    }

    const keyLabel = document.getElementById('keyLabel');
    const inputKey = document.getElementById('inputKey');

    if (cipher === 'caesar') {
        keyLabel.textContent = 'Geseran (Shift - Angka)';
        inputKey.placeholder = 'Contoh: 3';
        inputKey.type = 'number';
    } else {
        keyLabel.textContent = 'Kunci (Key - Teks)';
        inputKey.placeholder = 'Contoh: RAHASIA';
        inputKey.type = 'text';
    }
    
    // Clear previous results
    document.getElementById('outputText').textContent = '';
    document.getElementById('stepsContainer').classList.add('hidden');
    document.getElementById('stepsList').innerHTML = '';
}

function process(mode) {
    const text = document.getElementById('inputText').value.toUpperCase();
    const key = document.getElementById('inputKey').value.toUpperCase();

    if (!text || !key) {
        showAppWarning('Harap isi teks dan kunci!');
        return;
    }

    let result = '';
    let steps = [];

    if (currentCipher === 'vigenere') {
        ({ result, steps } = processVigenere(text, key, mode));
    } else {
        ({ result, steps } = processCaesar(text, key, mode));
    }

    document.getElementById('outputText').textContent = result;
    
    // Add animation to output container
    const outputContainer = document.getElementById('outputContainer');
    outputContainer.classList.remove('animate-scale-in');
    void outputContainer.offsetWidth; // Trigger reflow
    outputContainer.classList.add('animate-scale-in');

    displaySteps(steps);
}

function processVigenere(text, key, mode) {
    let result = '';
    let steps = [];
    let keyIndex = 0;
    const cleanKey = key.replace(/[^A-Z]/g, '');

    steps.push({
        title: "Inisialisasi",
        desc: `<div class="bg-black/20 rounded-lg p-3 border border-white/5 space-y-1">
            <p><span class="text-gray-500">Pesan:</span> <span class="text-white font-mono">${text}</span></p>
            <p><span class="text-gray-500">Kunci:</span> <span class="text-white font-mono">${cleanKey}</span></p>
            <p><span class="text-gray-500">Mode:</span> <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${mode === 'encrypt' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-purple-500/20 text-purple-400'}">${mode === 'encrypt' ? 'Enskripsi' : 'Dekripsi'}</span></p>
        </div>`
    });

    let details = '<div class="overflow-x-auto mt-4"><table class="w-full text-left text-xs font-mono border-collapse"><thead><tr class="border-b border-white/20 text-indigo-300"><th class="py-3 px-4">Char</th><th class="py-3 px-4 text-center">P</th><th class="py-3 px-4 text-center">K</th><th class="py-3 px-4">Rumus</th><th class="py-3 px-4 text-right">Hasil</th></tr></thead><tbody class="divide-y divide-white/5">';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char.match(/[A-Z]/)) {
            const p = char.charCodeAt(0) - 65;
            const k = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 65;
            let resIdx;
            let formula = '';

            if (mode === 'encrypt') {
                resIdx = (p + k) % 26;
                formula = `(${p} + ${k}) mod 26 = ${resIdx}`;
            } else {
                resIdx = (p - k + 26) % 26;
                formula = `(${p} - ${k} + 26) mod 26 = ${resIdx}`;
            }

            const resChar = String.fromCharCode(resIdx + 65);
            result += resChar;

            details += `<tr><td class="py-3 px-4 font-bold text-gray-200">${char}</td><td class="py-3 px-4 text-center text-gray-400 font-medium">${p}</td><td class="py-3 px-4 text-center text-gray-400 font-medium">${k}</td><td class="py-3 px-4 text-indigo-400/80">${formula}</td><td class="py-3 px-4 text-right text-indigo-400 font-bold">${resChar}</td></tr>`;
            
            keyIndex++;
        } else {
            result += char;
        }
    }

    details += '</tbody></table></div>';
    
    steps.push({
        title: "Proses Per Karakter",
        desc: details + `
        <div class="mt-6 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-3">
            <h5 class="text-indigo-300 font-semibold flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Cara Membaca Tabel:
            </h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                <ul class="space-y-1.5 text-gray-400">
                    <li><strong class="text-gray-300">Konversi Huruf:</strong> Setiap huruf diubah menjadi angka (A=0, B=1, ..., Z=25).</li>
                    <li><strong class="text-gray-300">P (Plaintext):</strong> Nilai angka dari huruf pesan asli Anda.</li>
                    <li><strong class="text-gray-300">K (Key):</strong> Nilai angka dari huruf kunci yang sejajar.</li>
                </ul>
                <ul class="space-y-1.5 text-gray-400">
                    <li><strong class="text-gray-300">Mod 26:</strong> Sisa bagi 26 (memastikan hasil tetap dalam rentang A-Z).</li>
                    <li><strong class="text-gray-300">Hasil:</strong> Angka hasil perhitungan dikonversi kembali menjadi huruf.</li>
                    <li><strong class="text-gray-300">Dekripsi:</strong> Ditambah 26 sebelum Mod agar hasil tidak negatif.</li>
                </ul>
            </div>
        </div>`
    });

    return { result, steps };
}

function processCaesar(text, key, mode) {
    let result = '';
    let steps = [];
    const shift = parseInt(key) % 26;

    steps.push({
        title: "Inisialisasi",
        desc: `Pesan: ${text}<br>Geseran: ${shift}<br>Mode: ${mode === 'encrypt' ? 'Enskripsi' : 'Dekripsi'}`
    });

    let details = '<div class="space-y-2 font-mono text-sm">';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char.match(/[A-Z]/)) {
            const p = char.charCodeAt(0) - 65;
            let resIdx;
            let formula = '';

            if (mode === 'encrypt') {
                resIdx = (p + shift) % 26;
                formula = `(${p} + ${shift}) mod 26 = ${resIdx}`;
            } else {
                resIdx = (p - shift + 26) % 26;
                formula = `(${p} - ${shift} + 26) mod 26 = ${resIdx}`;
            }

            const resChar = String.fromCharCode(resIdx + 65);
            result += resChar;
            details += `<div>${char} (${p}) &rarr; ${formula} &rarr; <span class="text-purple-400 font-bold">${resChar} (${resIdx})</span></div>`;
        } else {
            result += char;
        }
    }

    details += '</div>';
    steps.push({
        title: "Perhitungan Geseran",
        desc: details
    });

    return { result, steps };
}

function displaySteps(steps) {
    const container = document.getElementById('stepsContainer');
    const list = document.getElementById('stepsList');
    list.innerHTML = '';
    container.classList.remove('hidden');

    steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item glass-card p-4 space-y-2';
        stepDiv.style.animationDelay = `${index * 0.1}s`;
        
        stepDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                    ${index + 1}
                </span>
                <h4 class="font-medium text-gray-200">${step.title}</h4>
            </div>
            <div class="pl-9 text-sm text-gray-400 leading-relaxed">
                ${step.desc}
            </div>
        `;
        list.appendChild(stepDiv);
    });
}

function copyResult() {
    const text = document.getElementById('outputText').textContent;
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('[onclick="copyResult()"]');
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>';
        setTimeout(() => btn.innerHTML = originalIcon, 2000);
    });
}
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
    const tabs = ['vigenere', 'caesar', 'affine', 'hill', 'playfair', 'rsa'];
    const indicator = document.getElementById('tab-indicator');
    
    tabs.forEach((t, idx) => {
        const el = document.getElementById(`tab-${t}`);
        if (t === cipher) {
            el.classList.add('active');
            el.classList.remove('text-gray-400');
            // Update indicator position and width
            // Gunakan setTimeout 0 untuk memastikan elemen sudah dirender sempurna
            setTimeout(() => {
                indicator.style.width = `${el.offsetWidth}px`;
                indicator.style.left = `${el.offsetLeft}px`;
            }, 0);
        } else {
            el.classList.remove('active');
            el.classList.add('text-gray-400');
        }
    });

    const keyLabel = document.getElementById('keyLabel');
    const inputKey = document.getElementById('inputKey');
    const affineKeys = document.getElementById('affineKeys');
    const hillKeys = document.getElementById('hillKeys');
    const rsaKeys = document.getElementById('rsaKeys');
    const vigenereVisualizerSection = document.getElementById('vigenereVisualizerSection');

    // Reset all special key inputs visibility
    affineKeys.classList.add('hidden');
    hillKeys.classList.add('hidden');
    rsaKeys.classList.add('hidden');
    inputKey.classList.remove('hidden');
    
    // Default hiding visualizer, will show only for Vigenere
    if (vigenereVisualizerSection) vigenereVisualizerSection.classList.add('hidden');

    if (cipher === 'caesar') {
        keyLabel.textContent = 'Geseran (Shift - Angka)';
        inputKey.placeholder = 'Contoh: 3';
        inputKey.type = 'number';
    } else if (cipher === 'affine') {
        keyLabel.textContent = 'Kunci Kriptografi Affine (a & b)';
        inputKey.classList.add('hidden');
        affineKeys.classList.remove('hidden');
    } else if (cipher === 'hill') {
        keyLabel.textContent = 'Matriks Kunci Hill 2x2';
        inputKey.classList.add('hidden');
        hillKeys.classList.remove('hidden');
    } else if (cipher === 'playfair') {
        keyLabel.textContent = 'Kunci Kalimat (Key)';
        inputKey.placeholder = 'Contoh: MONARCHY';
        inputKey.type = 'text';
    } else if (cipher === 'rsa') {
        keyLabel.textContent = 'Parameter RSA (e, d, n)';
        inputKey.classList.add('hidden');
        rsaKeys.classList.remove('hidden');
    } else if (cipher === 'vigenere') {
        keyLabel.textContent = 'Kunci (Key - Teks)';
        inputKey.placeholder = 'Contoh: RAHASIA';
        inputKey.type = 'text';
        // Show visualizer for Vigenere
        if (vigenereVisualizerSection) vigenereVisualizerSection.classList.remove('hidden');
    }
    
    // Clear previous results
    document.getElementById('outputText').textContent = '';
    document.getElementById('stepsContainer').classList.add('hidden');
    document.getElementById('stepsList').innerHTML = '';
}

// Inisialisasi posisi tab saat pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
    initVigenereTable();
    switchTab('vigenere');
});

function initVigenereTable() {
    const grid = document.getElementById('vigenereGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    // Top-left empty cell
    const tl = document.createElement('div');
    tl.className = 'cell cell-header top left';
    tl.textContent = 'P\\K';
    grid.appendChild(tl);
    
    // Header Row (Plaintext)
    for (let i = 0; i < 26; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell cell-header top';
        cell.id = `col-header-${i}`;
        cell.textContent = alphabet[i];
        grid.appendChild(cell);
    }
    
    // Body
    for (let r = 0; r < 26; r++) {
        // Left Header (Key)
        const hl = document.createElement('div');
        hl.className = 'cell cell-header left';
        hl.id = `row-header-${r}`;
        hl.textContent = alphabet[r];
        grid.appendChild(hl);
        
        for (let c = 0; c < 26; c++) {
            const cell = document.createElement('div');
            const val = (r + c) % 26;
            cell.className = 'cell';
            cell.id = `vignere-cell-${r}-${c}`;
            cell.textContent = alphabet[val];
            grid.appendChild(cell);
        }
    }
}

let lastVigenereCoords = { row: 0, col: 0, stepInfo: '' };

function highlightVigenereCell(rowIdx, colIdx, stepInfo) {
    lastVigenereCoords = { row: rowIdx, col: colIdx, stepInfo: stepInfo };
    
    // Show the "Look at last result" button now that we have one
    const btnLast = document.getElementById('btnLastResult');
    if (btnLast) btnLast.classList.remove('hidden');

    // Row and Col are 0-indexed abjad (0=A, 1=B, etc)
    // Row is based on Key, Col is based on Plaintext
    
    // Clear previous highlights
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach(c => {
        c.classList.remove('highlight', 'active-row', 'active-col');
    });
    
    const targetId = `vignere-cell-${rowIdx}-${colIdx}`;
    const target = document.getElementById(targetId);
    
    if (target) {
        // Overlay logic Morph
        const overlay = document.getElementById('tableOverlay');
        const container = document.getElementById('vigenereTableContainer');
        const floatWin = document.getElementById('floatingSteps');

        overlay.style.display = 'flex';
        // Force reflow for transition
        overlay.offsetHeight; 
        overlay.classList.add('active');
        overlay.classList.remove('hidden');
        
        // Hide elements initially for fade-in effect
        container.classList.remove('visible');
        floatWin.classList.remove('visible');
        floatWin.classList.add('hidden');

        // Delay table appearance after morph transition (roughly 600ms)
        setTimeout(() => {
            container.classList.add('visible');
        }, 600);

        // Highlight row
        for(let i=0; i<26; i++) {
            const rowCell = document.getElementById(`vignere-cell-${rowIdx}-${i}`);
            if(rowCell) rowCell.classList.add('active-row');
        }
        // Highlight col
        for(let i=0; i<26; i++) {
            const colCell = document.getElementById(`vignere-cell-${i}-${colIdx}`);
            if(colCell) colCell.classList.add('active-col');
        }
        
        // Add extreme highlight to target
        target.classList.add('highlight');

        // Logic: Positioning Floating Window
        // For Mobile: Always Bottom Center
        if (window.innerWidth < 640) {
            floatWin.style.left = '1rem';
            floatWin.style.right = '1rem';
            floatWin.style.bottom = '1rem';
            floatWin.style.width = 'calc(100% - 2rem)';
        } else {
            // For Desktop: Dynamic Left/Right
            floatWin.style.width = '320px';
            if (colIdx > 13) {
                floatWin.style.left = '2rem';
                floatWin.style.right = 'auto';
            } else {
                floatWin.style.right = '2rem';
                floatWin.style.left = 'auto';
            }
            floatWin.style.bottom = '2rem';
        }

        if (stepInfo) {
            const stepsContent = document.getElementById('floatingStepsContent');
            stepsContent.innerHTML = stepInfo;
        }
        
        // Ensure the grid container scrolls to show the target
        if (container) {
            setTimeout(() => {
                const scrollLeft = target.offsetLeft - (container.offsetWidth / 2) + (target.offsetWidth / 2);
                const scrollTop = target.offsetTop - (container.offsetHeight / 2) + (target.offsetHeight / 2);
                
                container.scrollTo({
                    left: scrollLeft,
                    top: scrollTop,
                    behavior: 'smooth'
                });

                // Show floating window AFTER scroll/animation is almost done
                setTimeout(() => {
                    floatWin.classList.remove('hidden');
                    setTimeout(() => floatWin.classList.add('visible'), 50);
                }, 800);
            }, 600);
        }
    }
}

function searchVigenereCoord() {
    const plainInput = document.getElementById('searchPlain').value.toUpperCase();
    const keyInput = document.getElementById('searchKey').value.toUpperCase();

    if (!plainInput || !keyInput || !plainInput.match(/[A-Z]/) || !keyInput.match(/[A-Z]/)) {
        alert("Masukkan satu huruf (A-Z) untuk Plaintext dan Kunci!");
        return;
    }

    const p = plainInput.charCodeAt(0) - 65;
    const k = keyInput.charCodeAt(0) - 65;
    const resIdx = (p + k) % 26;
    const resChar = String.fromCharCode(resIdx + 65);

    const stepDetail = `
        <div class="space-y-4">
            <div class="flex items-center justify-between border-b border-indigo-500/30 pb-2">
                <span class="text-xs text-indigo-400 uppercase tracking-widest font-bold">Hasil Pencarian</span>
                <span class="px-2 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full border border-green-500/30">Ditemukan</span>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p class="text-gray-500 text-[10px] uppercase mb-1">Plaintext (P)</p>
                    <p class="text-white font-bold text-lg">${plainInput} <span class="text-indigo-400 text-xs font-normal">(${p})</span></p>
                </div>
                <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p class="text-gray-500 text-[10px] uppercase mb-1">Kunci (K)</p>
                    <p class="text-white font-bold text-lg">${keyInput} <span class="text-indigo-400 text-xs font-normal">(${k})</span></p>
                </div>
            </div>
            <div class="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <p class="text-gray-500 text-[10px] uppercase mb-2">Penjelasan</p>
                <div class="text-xs text-gray-400 space-y-2">
                    <p>Pertemuan Kolom <span class="text-white font-bold">${plainInput}</span> dan Baris <span class="text-white font-bold">${keyInput}</span>.</p>
                    <code class="text-indigo-300 font-mono">(${p} + ${k}) mod 26 = ${resIdx}</code>
                </div>
            </div>
            <div class="p-4 bg-gradient-to-br from-green-600/20 to-indigo-600/20 border border-white/10 rounded-xl shadow-inner">
                <p class="text-gray-400 text-[10px] uppercase mb-1">Hasil Perpotongan</p>
                <p class="text-2xl font-black text-white tracking-widest">${resChar}</p>
            </div>
        </div>
    `;

    // Re-use highlight logic to jump to the searched cell
    highlightVigenereCell(k, p, stepDetail);
}

function openPlainVigenere() {
    // Clear all highlights
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach(c => c.classList.remove('highlight', 'active-row', 'active-col'));

    const overlay = document.getElementById('tableOverlay');
    const container = document.getElementById('vigenereTableContainer');
    const floatWin = document.getElementById('floatingSteps');

    overlay.style.display = 'flex';
    overlay.offsetHeight; 
    overlay.classList.add('active');
    overlay.classList.remove('hidden');
    
    container.classList.remove('visible');
    floatWin.classList.add('hidden');

    setTimeout(() => {
        container.classList.add('visible');
    }, 600);
}

function reOpenVigenereOverlay() {
    highlightVigenereCell(lastVigenereCoords.row, lastVigenereCoords.col, lastVigenereCoords.stepInfo);
}

function closeOverlay() {
    const overlay = document.getElementById('tableOverlay');
    overlay.classList.remove('active');
    document.getElementById('vigenereTableContainer').classList.remove('visible');
    document.getElementById('floatingSteps').classList.remove('visible');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        document.getElementById('floatingSteps').classList.add('hidden');
    }, 600);
}

function process(mode) {
    const text = document.getElementById('inputText').value.toUpperCase();
    let key = document.getElementById('inputKey').value.toUpperCase();
    
    // Handle special multi-input keys
    if (currentCipher === 'affine') {
        const a = document.getElementById('inputA').value;
        const b = document.getElementById('inputB').value;
        if (!a || !b) { showAppWarning('Harap isi a dan b!'); return; }
        key = { a: parseInt(a), b: parseInt(b) };
    } else if (currentCipher === 'hill') {
        const m00 = document.getElementById('m00').value;
        const m01 = document.getElementById('m01').value;
        const m10 = document.getElementById('m10').value;
        const m11 = document.getElementById('m11').value;
        if (!m00 || !m01 || !m10 || !m11) { showAppWarning('Harap lengkapi matriks!'); return; }
        key = [[parseInt(m00), parseInt(m01)], [parseInt(m10), parseInt(m11)]];
    } else if (currentCipher === 'rsa') {
        const e = document.getElementById('rsa_e').value;
        const d = document.getElementById('rsa_d').value;
        const n = document.getElementById('rsa_n').value;
        if (!e || !n || (mode === 'decrypt' && !d)) { showAppWarning('Harap isi e, n (dan d untuk dekripsi)!'); return; }
        key = { e: parseInt(e), d: parseInt(d), n: parseInt(n) };
    }

    if (!text || (typeof key === 'string' && !key && currentCipher !== 'rsa')) {
        showAppWarning('Harap isi teks dan kunci!');
        return;
    }

    let result = '';
    let steps = [];

    try {
        if (currentCipher === 'vigenere') {
            ({ result, steps } = processVigenere(text, key, mode));
        } else if (currentCipher === 'caesar') {
            ({ result, steps } = processCaesar(text, key, mode));
        } else if (currentCipher === 'affine') {
            ({ result, steps } = processAffine(text, key, mode));
        } else if (currentCipher === 'hill') {
            ({ result, steps } = processHill(text, key, mode));
        } else if (currentCipher === 'playfair') {
            ({ result, steps } = processPlayfair(text, key, mode));
        } else if (currentCipher === 'rsa') {
            ({ result, steps } = processRSA(text, key, mode));
        }
    } catch (err) {
        showAppWarning(err.message, 'Kesalahan Proses');
        return;
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
    
    // Pastikan key adalah string dan bersihkan teks
    const keyStr = String(key || "").toUpperCase();
    const cleanKey = keyStr.replace(/[^A-Z]/g, '');

    if (cleanKey.length === 0) {
        throw new Error("Kunci Vigenere harus mengandung setidaknya satu huruf abjad (A-Z).");
    }

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

            const stepDetail = `
                <div class="space-y-4">
                    <div class="flex items-center justify-between border-b border-white/10 pb-2">
                        <span class="text-xs text-gray-500 uppercase tracking-widest font-bold">Langkah Saat Ini</span>
                        <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] rounded-full border border-indigo-500/30">Karakter ${i+1}/${text.length}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                            <p class="text-gray-500 text-[10px] uppercase mb-1">Plaintext (P)</p>
                            <p class="text-white font-bold text-lg">${char} <span class="text-indigo-400 text-xs font-normal">(${p})</span></p>
                        </div>
                        <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                            <p class="text-gray-500 text-[10px] uppercase mb-1">Key (K)</p>
                            <p class="text-white font-bold text-lg">${cleanKey[keyIndex % cleanKey.length]} <span class="text-indigo-400 text-xs font-normal">(${k})</span></p>
                        </div>
                    </div>
                    <div class="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <p class="text-gray-500 text-[10px] uppercase mb-2">Rumus ${mode === 'encrypt' ? 'Enkripsi' : 'Dekripsi'}</p>
                        <code class="text-indigo-300 font-mono text-sm">${formula}</code>
                    </div>
                    <div class="p-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-xl shadow-inner">
                        <p class="text-gray-400 text-[10px] uppercase mb-1">Hasil (Ciphertext)</p>
                        <p class="text-2xl font-black text-white tracking-widest">${resChar}</p>
                    </div>
                </div>
            `;

            // Highlight table for the character processed
            if (mode === 'encrypt') highlightVigenereCell(k, p, stepDetail);
            else highlightVigenereCell(k, resIdx, stepDetail);

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

// --- Tambahan Algoritma Baru ---

function gcd(a, b) {
    while (b) {
        a %= b;
        [a, b] = [b, a];
    }
    return a;
}

function modInverse(a, m) {
    for (let x = 1; x < m; x++) {
        if (((a % m) * (x % m)) % m == 1) return x;
    }
    return null;
}

function processAffine(text, key, mode) {
    let result = '';
    let steps = [];
    const { a, b } = key;

    if (gcd(a, 26) !== 1) {
        throw new Error(`Nilai 'a' (${a}) harus relatif prima dengan 26 agar bisa didekripsi (gcd=1).`);
    }

    steps.push({
        title: "Konfigurasi Affine",
        desc: `Kunci a: ${a}, b: ${b}<br>Rumus Enkripsi: (a*x + b) mod 26<br>Rumus Dekripsi: a⁻¹*(y - b) mod 26`
    });

    let details = '<div class="space-y-1 font-mono text-xs">';
    const aInv = modInverse(a, 26);

    for (let char of text) {
        if (char.match(/[A-Z]/)) {
            const x = char.charCodeAt(0) - 65;
            let resIdx, formula;
            if (mode === 'encrypt') {
                resIdx = (a * x + b) % 26;
                formula = `(${a}*${x} + ${b}) mod 26 = ${resIdx}`;
            } else {
                resIdx = (aInv * (x - b + 26)) % 26;
                formula = `${aInv}*(${x} - ${b}) mod 26 = ${resIdx}`;
            }
            const resChar = String.fromCharCode(resIdx + 65);
            result += resChar;
            details += `<div>${char}(${x}) &rarr; ${formula} &rarr; <b>${resChar}</b></div>`;
        } else {
            result += char;
        }
    }
    steps.push({ title: "Proses Transformasi", desc: details + "</div>" });
    return { result, steps };
}

function processHill(text, key, mode) {
    let result = '';
    let steps = [];
    // key is [[m00, m01], [m10, m11]]
    const det = (key[0][0] * key[1][1] - key[0][1] * key[1][0]) % 26;
    const detActual = (det + 26) % 26;

    if (gcd(detActual, 26) !== 1) {
        throw new Error(`Determinan matriks (${detActual}) harus relatif prima dengan 26.`);
    }

    steps.push({
        title: "Analisis Matriks",
        desc: `Matriks: [[${key[0][0]}, ${key[0][1]}], [${key[1][0]}, ${key[1][1]}]]<br>Determinan: ${detActual}`
    });

    // Clean text to only A-Z
    let cleanText = text.replace(/[^A-Z]/g, '');
    if (cleanText.length % 2 !== 0) cleanText += 'X';

    let matrixToUse = key;
    if (mode === 'decrypt') {
        const invDet = modInverse(detActual, 26);
        matrixToUse = [
            [(key[1][1] * invDet) % 26, ((-key[0][1] + 26) * invDet) % 26],
            [((-key[1][0] + 26) * invDet) % 26, (key[0][0] * invDet) % 26]
        ];
        steps.push({ title: "Matriks Invers", desc: `Invers Modulo 26: [[${matrixToUse[0][0]}, ${matrixToUse[0][1]}], [${matrixToUse[1][0]}, ${matrixToUse[1][1]}]]` });
    }

    let details = '<div class="space-y-2 font-mono text-xs">';
    for (let i = 0; i < cleanText.length; i += 2) {
        const p1 = cleanText[i].charCodeAt(0) - 65;
        const p2 = cleanText[i+1].charCodeAt(0) - 65;
        
        const c1 = (matrixToUse[0][0] * p1 + matrixToUse[0][1] * p2) % 26;
        const c2 = (matrixToUse[1][0] * p1 + matrixToUse[1][1] * p2) % 26;
        
        const resBlock = String.fromCharCode(c1 + 65, c2 + 65);
        result += resBlock;
        details += `<div>[${cleanText[i]}${cleanText[i+1]}] &rarr; [${c1}, ${c2}] &rarr; <b>${resBlock}</b></div>`;
    }

    steps.push({ title: "Perkalian Matriks", desc: details + "</div>" });
    return { result, steps };
}

function processPlayfair(text, key, mode) {
    let result = '';
    let steps = [];
    
    // Create matrix
    let alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // No J
    let matrixStr = (key.replace(/J/g, "I") + alphabet).replace(/[^A-Z]/g, "");
    let finalKey = "";
    for(let char of matrixStr) {
        if(!finalKey.includes(char)) finalKey += char;
    }
    
    let matrix = [];
    for(let i=0; i<25; i+=5) matrix.push(finalKey.slice(i, i+5).split(''));

    steps.push({
        title: "Playfair Square (5x5)",
        desc: `<div class="grid grid-cols-5 gap-1 w-32 font-mono text-center">
            ${finalKey.split('').map(c => `<div class="bg-indigo-500/10 border border-indigo-500/20">${c}</div>`).join('')}
        </div>`
    });

    // Prepare pairs
    let clean = text.replace(/J/g, "I").replace(/[^A-Z]/g, "");
    let pairs = [];
    for(let i=0; i<clean.length; i++) {
        let a = clean[i];
        let b = (i+1 < clean.length) ? clean[i+1] : 'X';
        if(a === b) {
            pairs.push(a + 'X');
        } else {
            pairs.push(a + b);
            i++;
        }
    }

    const findPos = (c) => {
        for(let r=0; r<5; r++) {
            let col = matrix[r].indexOf(c);
            if(col !== -1) return [r, col];
        }
        return [0,0];
    };

    let details = '<div class="space-y-1 font-mono text-xs">';
    for(let pair of pairs) {
        let [r1, c1] = findPos(pair[0]);
        let [r2, c2] = findPos(pair[1]);
        let outA, outB;

        if (r1 === r2) { // Same row
            let shift = mode === 'encrypt' ? 1 : 4;
            outA = matrix[r1][(c1 + shift) % 5];
            outB = matrix[r2][(c2 + shift) % 5];
        } else if (c1 === c2) { // Same col
            let shift = mode === 'encrypt' ? 1 : 4;
            outA = matrix[(r1 + shift) % 5][c1];
            outB = matrix[(r2 + shift) % 5][c2];
        } else { // Rectangle
            outA = matrix[r1][c2];
            outB = matrix[r2][c1];
        }
        result += outA + outB;
        details += `<div>${pair} &rarr; <b>${outA}${outB}</b></div>`;
    }
    
    steps.push({ title: "Transformasi Pasangan", desc: details + "</div>" });
    return { result, steps };
}

function powerMod(base, exp, mod) {
    let res = 1n;
    base = BigInt(base) % BigInt(mod);
    exp = BigInt(exp);
    while (exp > 0n) {
        if (exp % 2n === 1n) res = (res * base) % BigInt(mod);
        base = (base * base) % BigInt(mod);
        exp = exp / 2n;
    }
    return res;
}

function processRSA(text, key, mode) {
    let result = '';
    let steps = [];
    const { e, d, n } = key;

    steps.push({
        title: "Parameter RSA",
        desc: `e: ${e}, d: ${d || '?'}, n: ${n}`
    });

    if (mode === 'encrypt') {
        let codes = [];
        for (let char of text) {
            let m = BigInt(char.charCodeAt(0));
            let c = powerMod(m, e, n);
            codes.push(c.toString());
        }
        result = codes.join(' ');
        steps.push({ title: "Enkripsi RSA", desc: `Setiap karakter dihitung: C = M^e mod n` });
    } else {
        let codes = text.trim().split(/\s+/);
        let chars = [];
        for (let code of codes) {
            if(!code) continue;
            let c = BigInt(code);
            let m = powerMod(c, d, n);
            chars.push(String.fromCharCode(Number(m)));
        }
        result = chars.join('');
        steps.push({ title: "Dekripsi RSA", desc: `Setiap angka dihitung: M = C^d mod n` });
    }

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

from flask import Flask, render_template, request, jsonify
from crypto_logic import caesar_cipher, vigenere_cipher, affine_cipher, hill_cipher, playfair_cipher, rsa_cipher

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/process', methods=['POST'])
def process():
    data = request.json
    print(f"DEBUG: Payload received: {data}")
    algo = data.get('algo')
    text = data.get('text', '')
    mode = data.get('mode', 'encrypt').lower() # Default to encrypt and lower case
    
    result = ""
    steps = []
    
    try:
        if algo == 'caesar':
            shift = data.get('key', 0)
            result, steps = caesar_cipher(text, shift, mode)
        elif algo == 'vigenere':
            key = data.get('key', '')
            result, steps = vigenere_cipher(text, key, mode)
        elif algo == 'affine':
            a = data.get('a')
            b = data.get('b')
            result, steps = affine_cipher(text, a, b, mode)
        elif algo == 'hill':
            m = data.get('matrix') # expects [[m00, m01], [m10, m11]]
            result, steps = hill_cipher(text, m, mode)
        elif algo == 'playfair':
            key = data.get('key')
            result, steps = playfair_cipher(text, key, mode)
        elif algo == 'rsa':
            e = data.get('e')
            d = data.get('d')
            n = data.get('n')
            result, steps = rsa_cipher(text, e, d, n, mode)
        else:
            return jsonify({'error': 'Algorithm not found'}), 400
            
        if result is None:
            return jsonify({'error': steps[0]}), 400
            
        # Format steps for the original UI
        formatted_steps = []
        viz_steps = []
        
        if algo == 'vigenere' and text:
            key_str = data.get('key', '').upper()
            if key_str:
                clean_key = "".join([c for c in key_str if c.isalpha()])
                if clean_key:
                    k_idx = 0
                    char_idx = 0
                    for char in text:
                        if char.isalpha():
                            p = ord(char.upper()) - ord('A')
                            k_char = clean_key[k_idx % len(clean_key)]
                            k = ord(k_char) - ord('A')
                            
                            res_idx = (p + k) % 26 if mode == 'encrypt' else (p - k + 26) % 26
                            res_char = chr(res_idx + ord('A'))
                            formula = f"({p} + {k}) mod 26 = {res_idx}" if mode == 'encrypt' else f"({p} - {k} + 26) mod 26 = {res_idx}"
                            
                            viz_steps.append({
                                'row': k,
                                'col': p if mode == 'encrypt' else res_idx,
                                'info': f'''
                                    <div class="space-y-4">
                                        <div class="flex items-center justify-between border-b border-indigo-500/30 pb-2">
                                            <span class="text-xs text-indigo-400 uppercase tracking-widest font-bold">Langkah Otomatis</span>
                                            <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] rounded-full border border-indigo-500/30">Karakter {char_idx + 1}/{len([c for c in text if c.isalpha()])}</span>
                                        </div>
                                        <div class="grid grid-cols-2 gap-4 text-sm">
                                            <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                                                <p class="text-gray-500 text-[10px] uppercase mb-1">Plaintext (P)</p>
                                                <p class="text-white font-bold text-lg">{char.upper()} <span class="text-indigo-400 text-xs font-normal">({p})</span></p>
                                            </div>
                                            <div class="p-3 bg-white/5 rounded-xl border border-white/5">
                                                <p class="text-gray-500 text-[10px] uppercase mb-1">Kunci (K)</p>
                                                <p class="text-white font-bold text-lg">{k_char} <span class="text-indigo-400 text-xs font-normal">({k})</span></p>
                                            </div>
                                        </div>
                                        <div class="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                            <p class="text-gray-500 text-[10px] uppercase mb-2">Penjelasan</p>
                                            <div class="text-xs text-gray-400 space-y-2">
                                                <p>Pertemuan Kolom <span class="text-white font-bold">{char.upper() if mode == 'encrypt' else res_char}</span> dan Baris <span class="text-white font-bold">{k_char}</span>.</p>
                                                <code class="text-indigo-300 font-mono">{formula}</code>
                                            </div>
                                        </div>
                                        <div class="p-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-white/10 rounded-xl shadow-inner">
                                            <p class="text-gray-400 text-[10px] uppercase mb-1">Hasil ({mode.capitalize()})</p>
                                            <p class="text-2xl font-black text-white tracking-widest">{res_char}</p>
                                        </div>
                                    </div>
                                '''
                            })
                            k_idx += 1
                        char_idx += 1

            formatted_steps.append({'title': 'Inisialisasi', 'desc': f'Pesan: {text}<br>Kunci: {data.get("key")}<br>Mode: {mode}'})
            formatted_steps.append({'title': 'Proses Per Karakter', 'desc': '<br>'.join(steps[1:])})
        elif algo == 'playfair' and steps:
            # Format Playfair Matrix
            matrix_html = '<div class="mb-4 overflow-x-auto"><table class="border-collapse border border-indigo-500/30 mx-auto">'
            for i in range(1, 6): # Rows 1 to 5
                row_vals = steps[i].split(" | ")
                matrix_html += '<tr>'
                for val in row_vals:
                    matrix_html += f'<td class="border border-indigo-500/30 p-2 text-center w-10 h-10 font-bold text-indigo-400">{val}</td>'
                matrix_html += '</tr>'
            matrix_html += '</table></div>'
            
            formatted_steps.append({'title': 'Matriks Playfair (5x5)', 'desc': matrix_html})
            formatted_steps.append({'title': 'Proses Per Pasangan', 'desc': '<br>'.join(steps[6:])})
        elif algo == 'hill' and steps:
            # Format Hill Matrix
            matrix_html = '<div class="mb-4 overflow-x-auto"><table class="border-collapse border border-indigo-500/30 mx-auto">'
            for i in range(1, 3): # Rows 1 and 2
                row_vals = steps[i].split()
                matrix_html += '<tr>'
                for val in row_vals:
                    matrix_html += f'<td class="border border-indigo-500/30 p-2 text-center w-12 h-10 font-bold text-indigo-400">{val}</td>'
                matrix_html += '</tr>'
            matrix_html += '</table></div>'
            
            formatted_steps.append({'title': 'Matriks Kunci Hill (2x2)', 'desc': matrix_html})
            formatted_steps.append({'title': 'Proses Per Blok', 'desc': '<br>'.join(steps[3:])})
        else:
            formatted_steps.append({'title': 'Jalan Penyelesaian', 'desc': '<br>'.join(steps)})
            
        return jsonify({
            'result': result,
            'steps': formatted_steps,
            'viz_steps': viz_steps
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

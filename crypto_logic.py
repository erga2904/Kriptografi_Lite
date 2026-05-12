import math

def caesar_cipher(text, shift, mode='encrypt'):
    result = ""
    steps = []
    shift = int(shift)
    if mode == 'decrypt':
        shift = -shift
    
    steps.append(f"Rumus: $C = (P + k) \\pmod{{26}}$ untuk enkripsi, $P = (C - k) \\pmod{{26}}$ untuk dekripsi.")
    steps.append(f"Kunci pergeseran (shift): {abs(shift)}")
    
    for char in text:
        if char.isalpha():
            start = ord('A') if char.isupper() else ord('a')
            p = ord(char) - start
            c = (p + shift) % 26
            new_char = chr(c + start)
            result += new_char
            steps.append(f"'{char}' ({p}) {'+' if shift >= 0 else '-'} {abs(shift)} = {c} -> '{new_char}'")
        else:
            result += char
            steps.append(f"'{char}' (Karakter non-alfabet tetap)")
            
    return result, steps

def vigenere_cipher(text, key, mode='encrypt'):
    print(f"DEBUG: vigenere_cipher called with text='{text}', key='{key}', mode='{mode}'")
    result = ""
    steps = []
    
    # Clean key: only letters
    clean_key = "".join([c.upper() for c in key if c.isalpha()])
    if not clean_key:
        return None, ["Kunci harus mengandung setidaknya satu huruf."]
        
    key_idx = 0
    mode = mode.lower() if mode else 'encrypt'
    
    steps.append(f"Rumus: $C_i = (P_i + K_i) \\pmod{{26}}$")
    steps.append(f"Kata kunci: {clean_key}")
    
    for char in text:
        if char.isalpha():
            is_upper = char.isupper()
            p = ord(char.upper()) - ord('A')
            k_char = clean_key[key_idx % len(clean_key)]
            k = ord(k_char) - ord('A')
            
            if mode == 'encrypt':
                c = (p + k) % 26
            elif mode == 'decrypt':
                c = (p - k + 26) % 26
            else:
                # Fallback to encrypt if unknown mode
                c = (p + k) % 26
                
            new_char = chr(c + ord('A'))
            if not is_upper:
                new_char = new_char.lower()
            
            result += new_char
            steps.append(f"P: '{char}' ({p}), K: '{k_char}' ({k}) -> {mode.capitalize()}: {new_char} ({c})")
            key_idx += 1
        else:
            result += char
            steps.append(f"'{char}' (Karakter non-alfabet tetap)")
            
    print(f"DEBUG: vigenere_cipher returning result='{result}'")
    return result, steps

def modInverse(a, m):
    for x in range(1, m):
        if (((a % m) * (x % m)) % m == 1):
            return x
    return -1

def affine_cipher(text, a, b, mode='encrypt'):
    result = ""
    steps = []
    a = int(a)
    b = int(b)
    
    if math.gcd(a, 26) != 1:
        return None, ["Nilai 'a' harus koprima dengan 26."]

    if mode == 'encrypt':
        steps.append(f"Rumus Enkripsi: $E(x) = (ax + b) \\pmod{{26}}$")
        for char in text:
            if char.isalpha():
                is_upper = char.isupper()
                x = ord(char.upper()) - ord('A')
                c = (a * x + b) % 26
                new_char = chr(c + ord('A'))
                if not is_upper:
                    new_char = new_char.lower()
                result += new_char
                steps.append(f"'{char}' ({x}) -> ({a} * {x} + {b}) mod 26 = {c} -> '{new_char}'")
            else:
                result += char
    else:
        a_inv = modInverse(a, 26)
        if a_inv == -1:
            return None, ["Invers modular 'a' tidak ditemukan."]
        steps.append(f"Rumus Dekripsi: $D(c) = a^{{-1}}(c - b) \\pmod{{26}}$")
        steps.append(f"Invers modular $a={a}$ mod 26 adalah {a_inv}")
        for char in text:
            if char.isalpha():
                is_upper = char.isupper()
                c = ord(char.upper()) - ord('A')
                x = (a_inv * (c - b)) % 26
                new_char = chr(x + ord('A'))
                if not is_upper:
                    new_char = new_char.lower()
                result += new_char
                steps.append(f"'{char}' ({c}) -> {a_inv} * ({c} - {b}) mod 26 = {x} -> '{new_char}'")
            else:
                result += char
                
    return result, steps

def hill_cipher(text, matrix, mode='encrypt'):
    # For simplicity, supporting 2x2 matrix
    # matrix is list of lists [[m00, m01], [m10, m11]]
    steps = []
    size = len(matrix)
    
    # Pre-process text: remove non-alpha, uppercase
    clean_text = "".join([c.upper() for c in text if c.isalpha()])
    while len(clean_text) % size != 0:
        clean_text += 'X'
        steps.append("Menambahkan padding 'X' agar panjang teks sesuai ukuran matriks.")
    
    if mode == 'decrypt':
        # Calculate matrix inverse mod 26
        det = (matrix[0][0]*matrix[1][1] - matrix[0][1]*matrix[1][0]) % 26
        det_inv = modInverse(det, 26)
        if det_inv == -1:
            return None, ["Determinan matriks tidak memiliki invers mod 26. Matriks tidak bisa didekripsi."]
        
        # Adjugate matrix
        adj = [[matrix[1][1], -matrix[0][1]], [-matrix[1][0], matrix[0][0]]]
        inv_matrix = [[(det_inv * adj[i][j]) % 26 for j in range(2)] for i in range(2)]
        steps.append(f"Determinan: {det}, Invers Determinan: {det_inv}")
        steps.append(f"Matriks Invers: {inv_matrix}")
        matrix = inv_matrix

    result = ""
    for i in range(0, len(clean_text), size):
        block = [ord(clean_text[i+j]) - ord('A') for j in range(size)]
        res_block = []
        for r in range(size):
            val = 0
            calc_str = ""
            for c in range(size):
                val += matrix[r][c] * block[c]
                calc_str += f"({matrix[r][c]} * {block[c]})" + (" + " if c < size-1 else "")
            val %= 26
            res_block.append(val)
            steps.append(f"Blok {clean_text[i:i+size]}: Baris {r+1} -> {calc_str} mod 26 = {val} ({chr(val + ord('A'))})")
        
        for val in res_block:
            result += chr(val + ord('A'))
            
    return result, steps

def playfair_matrix(key):
    key = key.upper().replace('J', 'I')
    alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"
    matrix_str = ""
    for char in key:
        if char.isalpha() and char not in matrix_str:
            matrix_str += char
    for char in alphabet:
        if char not in matrix_str:
            matrix_str += char
    
    matrix = [list(matrix_str[i:i+5]) for i in range(0, 25, 5)]
    return matrix

def playfair_cipher(text, key, mode='encrypt'):
    matrix = playfair_matrix(key)
    steps = []
    steps.append("Matriks Playfair (5x5):")
    for row in matrix:
        steps.append(" | ".join(row))
    
    clean_text = "".join([c.upper() for c in text if c.isalpha()]).replace('J', 'I')
    # Pairing
    pairs = []
    i = 0
    while i < len(clean_text):
        a = clean_text[i]
        b = ''
        if i + 1 < len(clean_text):
            b = clean_text[i+1]
            if a == b:
                b = 'X'
                i += 1
            else:
                i += 2
        else:
            b = 'X'
            i += 1
        pairs.append(a + b)
    
    steps.append(f"Pasangan huruf: {', '.join(pairs)}")
    
    def find_pos(char):
        for r in range(5):
            for c in range(5):
                if matrix[r][c] == char:
                    return r, c
        return None

    result = ""
    for pair in pairs:
        r1, c1 = find_pos(pair[0])
        r2, c2 = find_pos(pair[1])
        
        if r1 == r2: # Same row
            if mode == 'encrypt':
                nc1, nc2 = (c1 + 1) % 5, (c2 + 1) % 5
            else:
                nc1, nc2 = (c1 - 1 + 5) % 5, (c2 - 1 + 5) % 5
            nr1, nr2 = r1, r2
        elif c1 == c2: # Same column
            if mode == 'encrypt':
                nr1, nr2 = (r1 + 1) % 5, (r2 + 1) % 5
            else:
                nr1, nr2 = (r1 - 1 + 5) % 5, (r2 - 1 + 5) % 5
            nc1, nc2 = c1, c2
        else: # Rectangle
            nr1, nc1 = r1, c2
            nr2, nc2 = r2, c1
            
        res_pair = matrix[nr1][nc1] + matrix[nr2][nc2]
        result += res_pair
        steps.append(f"'{pair}' -> ({r1},{c1}) & ({r2},{c2}) -> '{res_pair}'")
        
    return result, steps

def rsa_cipher(text, e_val, d_val, n_val, mode='encrypt'):
    e = int(e_val)
    d = int(d_val)
    n = int(n_val)
    steps = []
    
    if mode == 'encrypt':
        steps.append(f"Rumus Enkripsi: $C = M^e \\pmod{{n}}$")
        steps.append(f"Kunci Publik: (e={e}, n={n})")
        results = []
        for char in text:
            m = ord(char)
            c = pow(m, e, n)
            results.append(str(c))
            steps.append(f"'{char}' ({m}) -> {m}^{e} mod {n} = {c}")
        return " ".join(results), steps
    else:
        steps.append(f"Rumus Dekripsi: $M = C^d \\pmod{{n}}$")
        steps.append(f"Kunci Privat: (d={d}, n={n})")
        # Assume input is space-separated numbers
        try:
            parts = text.split()
            result_chars = []
            for part in parts:
                c = int(part)
                m = pow(c, d, n)
                char = chr(m)
                result_chars.append(char)
                steps.append(f"{c} -> {c}^{d} mod {n} = {m} ('{char}')")
            return "".join(result_chars), steps
        except Exception as ex:
            return None, [f"Format ciphertext salah untuk RSA dekripsi. Gunakan angka dipisah spasi. Error: {str(ex)}"]

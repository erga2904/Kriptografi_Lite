from crypto_logic import vigenere_cipher

def test(t, k, m):
    res, _ = vigenere_cipher(t, k, m)
    print(f"Text: {t}, Key: {k}, Mode: {m} -> Result: {res}")

test("erga", "erga", "encrypt")
test("erga", "erga", "decrypt")
test("aaaa", "aaaa", "encrypt")
test("hello", "key", "encrypt")
test("test", "test", "encrypt")

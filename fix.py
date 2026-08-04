with open('app_utf8.js', 'r', encoding='utf-8') as f:
    text = f.read()

if text.startswith('\ufeff'):
    text = text[1:]

out_bytes = bytearray()
for i, c in enumerate(text):
    try:
        out_bytes.extend(c.encode('cp1252'))
    except UnicodeEncodeError:
        if ord(c) < 256:
            out_bytes.append(ord(c))
        else:
            print(f"Warning: Cannot decode character {repr(c)} at {i}")
            out_bytes.append(ord('?'))

with open('app_recovered.js', 'wb') as f:
    f.write(out_bytes)
print('Success')

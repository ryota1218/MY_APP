import re
with open('c:/Users/243202/Desktop/MY_APP/karaage.copy/js/diagram.js', 'r', encoding='utf-8') as f:
    content = f.read()

replace_str = '''portDiv.className = 'diagram-conn-port';
        if (conn.textSize) portDiv.style.fontSize = str(conn.textSize) + 'px';
        if (conn.textColor) portDiv.style.color = conn.textColor;'''

content = content.replace("portDiv.className = 'diagram-conn-port';", replace_str)

with open('c:/Users/243202/Desktop/MY_APP/karaage.copy/js/diagram.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Applied style logic to ports.')

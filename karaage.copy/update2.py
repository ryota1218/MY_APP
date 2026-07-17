with open('c:/Users/243202/Desktop/MY_APP/karaage.copy/html/diagram-template.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add text size input
insert_str = '''        <div class="property-group" style="margin-top: 8px;">
          <label>テキストサイズ</label>
          <input type="number" id="{{prefix}}-prop-connfontsize" class="property-input" min="10" max="48" placeholder="例: 11">
        </div>'''

if 'prop-connfontsize' not in content:
    content = content.replace('<div class="property-group" id="{{prefix}}-prop-group-conn-only" style="display:none;">\n        <div id="{{prefix}}-prop-port-mode-container">', '<div class="property-group" id="{{prefix}}-prop-group-conn-only" style="display:none;">\n' + insert_str + '\n        <div id="{{prefix}}-prop-port-mode-container">')

    with open('c:/Users/243202/Desktop/MY_APP/karaage.copy/html/diagram-template.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated HTML.')

with open('c:/Users/243202/Desktop/MY_APP/karaage.copy/js/property-panel.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

if 'connfontsize' not in js_content:
    js_content = js_content.replace(\"bindInput('fontsize', 'textSize', Number);\", \"bindInput('fontsize', 'textSize', Number);\n    bindInput('connfontsize', 'textSize', Number);\")
    
    js_content = js_content.replace(\"setVal('conntype', node.connType || 'association');\", \"setVal('conntype', node.connType || 'association');\n      setVal('connfontsize', node.textSize || 11);\")

    with open('c:/Users/243202/Desktop/MY_APP/karaage.copy/js/property-panel.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
    print('Updated JS.')


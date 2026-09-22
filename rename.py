import os

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace("MooSic", "CoKo")
    content = content.replace("M o o S i c", "C o K o")
    content = content.replace("moosic", "coko") # for IDs like why-moosic
    
    with open(filepath, 'w') as f:
        f.write(content)

replace_in_file('index.html')
replace_in_file('style.css')

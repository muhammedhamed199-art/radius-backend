import re

text = '<input placeholder="اسم المشترك" />\n<div>مرحبا بك</div>\nconst x = "قيمة";'

def replace_jsx_text(m):
    return f'>{t("{m.group(1)}")}<'

def replace_attr(m):
    return f'{m.group(1)}={{t("{m.group(2)}")}}{m.group(3)}'

def replace_string(m):
    return f't("{m.group(1)}")'

# It's better to just translate the dictionary and use a global context wrapper or MutationObserver.

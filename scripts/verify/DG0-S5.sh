#!/usr/bin/env bash
# Verify DG0-S5: sanitizer policy and representative fragments.
# Exit 0 = valid. 1 = invalid. 2 = not ready.

set -euo pipefail

ARTIFACT="migration-data/sanitizer-policy.md"

if [ ! -f "$ARTIFACT" ]; then
  echo "not ready: $ARTIFACT does not exist yet"
  exit 2
fi

for needle in "sanitize-html" "Planning Center" "YouTube" "Google Maps" "Formidable" "SiteOrigin"; do
  if ! grep -qi "$needle" "$ARTIFACT"; then
    echo "fail: missing policy reference '$needle'"
    exit 1
  fi
done

node --input-type=module <<'NODE'
import sanitizeHtml from 'sanitize-html';

const policy = {
  allowedTags: [
    'a', 'abbr', 'article', 'aside', 'b', 'blockquote', 'br', 'button', 'caption', 'code',
    'div', 'dl', 'dt', 'dd', 'em', 'figure', 'figcaption', 'form', 'h1', 'h2', 'h3', 'h4',
    'h5', 'h6', 'hr', 'i', 'iframe', 'img', 'input', 'label', 'legend', 'li', 'ol', 'p',
    'picture', 'pre', 'section', 'select', 'small', 'source', 'span', 'strong', 'table',
    'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul', 'video'
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel', 'class'],
    img: ['src', 'alt', 'width', 'height', 'srcset', 'sizes', 'loading', 'decoding', 'class', 'title'],
    iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'title', 'loading', 'referrerpolicy', 'class'],
    video: ['controls', 'preload', 'poster', 'class', 'id'],
    source: ['src', 'type'],
    form: ['action', 'method', 'class', 'id'],
    input: ['type', 'name', 'value', 'placeholder', 'checked', 'selected', 'id', 'class', 'required'],
    textarea: ['name', 'id', 'rows', 'cols', 'class', 'required'],
    select: ['name', 'id', 'class', 'required'],
    option: ['value', 'selected'],
    '*': ['class', 'id', 'role', 'title', 'aria-label', 'data-*', 'style']
  },
  allowedIframeHostnames: [
    'www.youtube.com',
    'youtube.com',
    'www.youtube-nocookie.com',
    'youtu.be',
    'player.vimeo.com',
    'www.google.com',
    'maps.google.com',
    'thetabletx.churchcenter.com',
    'churchcenter.com',
    'planningcenteronline.com'
  ],
  allowedStyles: {
    '*': {
      color: [/^.+$/],
      'background-color': [/^.+$/],
      'text-align': [/^(left|right|center|justify)$/],
      'font-size': [/^.+$/],
      'font-weight': [/^.+$/],
      display: [/^(block|inline|inline-block|flex|grid|none)$/],
      'flex-direction': [/^(row|row-reverse|column|column-reverse)$/],
      gap: [/^.+$/],
      margin: [/^.+$/],
      padding: [/^.+$/],
      width: [/^.+$/],
      height: [/^.+$/],
      'max-width': [/^.+$/],
      'max-height': [/^.+$/],
      'object-fit': [/^(cover|contain|fill|none|scale-down)$/],
      border: [/^.+$/],
      'border-radius': [/^.+$/]
    }
  }
};

const fragments = [
  {
    name: 'siteorigin hero',
    input: '<div class="panel" style="text-align:center"><h1 onclick="evil()">Come Join Us</h1><script>alert(1)</script></div>',
    expect: ['Come Join Us'],
    reject: ['onclick', 'script']
  },
  {
    name: 'formidable form',
    input: '<form action="/submit"><label for="field">Email</label><input id="field" type="email" name="email" value=""><script>bad()</script></form>',
    expect: ['<form', 'Email', 'type="email"'],
    reject: ['script']
  },
  {
    name: 'youtube embed',
    input: '<iframe src="https://www.youtube.com/embed/xbtuP_UITPo" title="Video"></iframe>',
    expect: ['youtube.com/embed/xbtuP_UITPo'],
    reject: []
  },
  {
    name: 'google maps embed',
    input: '<iframe src="https://www.google.com/maps/embed?pb=abc" title="Map"></iframe>',
    expect: ['google.com/maps/embed?pb=abc'],
    reject: []
  }
];

for (const fragment of fragments) {
  const output = sanitizeHtml(fragment.input, policy);
  for (const token of fragment.expect) {
    if (!output.includes(token)) {
      throw new Error(`${fragment.name}: missing expected token ${token}\n${output}`);
    }
  }
  for (const token of fragment.reject) {
    if (output.includes(token)) {
      throw new Error(`${fragment.name}: unexpected token ${token}\n${output}`);
    }
  }
}

console.log('DG0-S5 ok (policy and representative fragments validated)');
NODE

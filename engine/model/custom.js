// A custom quiz as a link and back, and practice from the review page.
//
//   custom.encode(kind, ids)    '<kind>.<bits>': one bit per item of the kind (each once, in its order), base64url
//   custom.decode(text)         { kind, ids } or null
//   custom.practice(kind, items)   ?practice=<kind>&items=<ids, each URI-encoded, apart by commas>: { kind, ids,
//                               practice: true } or null
//   custom.name(text)           a quiz's name as given: trimmed, at most 40 letters

export function makeCustom(quiz, kinds) {
  const listOf = kind => [...new Set(kinds.byKey[kind].ids)];
  function encode(kind, ids) {
    const set = new Set(ids), list = listOf(kind), bytes = new Uint8Array(Math.ceil(list.length / 8));
    list.forEach((id, i) => { if (set.has(id)) bytes[i >> 3] |= 1 << (i & 7); });
    return kind + '.' + btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(text) {
    const [kind, bits] = (text || '').split('.');
    if (!kinds.byKey[kind] || !bits) return null;
    try {
      const bin = atob(bits.replace(/-/g, '+').replace(/_/g, '/'));
      const ids = listOf(kind).filter((id, i) => (bin.charCodeAt(i >> 3) >> (i & 7)) & 1);
      return ids.length ? { kind, ids } : null;
    } catch (e) { return null; }
  }
  function practice(kind, items) {
    const K = kinds.byKey[kind]; if (!K || !items) return null;
    const own = new Map(listOf(kind).map(x => [String(x), x]));
    const ids = [...new Set(items.split(',').map(x => { try { return decodeURIComponent(x); } catch (e) { return x; } }).filter(x => own.has(x)).map(x => own.get(x)))].filter(id => K.areas[id]);
    return ids.length ? { kind, ids, practice: true } : null;
  }
  return { encode, decode, practice, name: text => String(text || '').trim().slice(0, 40) };
}

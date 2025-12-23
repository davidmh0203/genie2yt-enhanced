import { parseGeniePlaylist } from '../src/lib/parseGeniePlaylist';

describe('TC-10: parseGeniePlaylist - MCDC Test', () => {
  describe('TC-10: 곡 추가 조건 - title && artist && title !== "TITLE" && artist !== "ARTIST"', () => {
    // TC-10-01: C1=참, C2=참, C3=참, C4=참 → 결과=참
    test('TC-10-01: title=true && artist=true && title!="TITLE" && artist!="ARTIST" → 곡 추가', () => {
      const html = `
        <tr>
          <td><a class="title" title="좋은날">좋은날</a></td>
          <td><a class="artist" title="아이유">아이유</a></td>
        </tr>
      `;

      const result = parseGeniePlaylist(html);
      expect(result.length).toBeGreaterThan(0);
      if (result.length > 0) {
        expect(result[0].title).not.toBe('TITLE');
        expect(result[0].artist).not.toBe('ARTIST');
        expect(result[0].title).toBe('좋은날');
        expect(result[0].artist).toBe('아이유');
      }
    });

    // TC-10-02: C1=참, C2=참, C3=참, C4=거짓 → 결과=거짓
    test('TC-10-02: title=true && artist=true && title!="TITLE" && artist="ARTIST" → 곡 추가 안됨', () => {
      const html = `
        <tr>
          <td><a class="title" title="좋은날">좋은날</a></td>
          <td><a class="artist" title="ARTIST">ARTIST</a></td>
        </tr>
      `;

      const result = parseGeniePlaylist(html);
      // ARTIST인 경우 추가되지 않아야 함
      const hasArtist = result.some((song) => song.artist === 'ARTIST');
      expect(hasArtist).toBe(false);
    });

    // TC-10-03: C1=참, C2=참, C3=거짓, C4=참 → 결과=거짓
    test('TC-10-03: title=true && artist=true && title="TITLE" && artist!="ARTIST" → 곡 추가 안됨', () => {
      const html = `
        <tr>
          <td><a class="title" title="TITLE">TITLE</a></td>
          <td><a class="artist" title="아이유">아이유</a></td>
        </tr>
      `;

      const result = parseGeniePlaylist(html);
      // TITLE인 경우 추가되지 않아야 함
      const hasTitle = result.some((song) => song.title === 'TITLE');
      expect(hasTitle).toBe(false);
    });

    // TC-10-04: C1=참, C2=거짓, C3=참, C4=참 → 결과=거짓
    test('TC-10-04: title=true && artist=false && title!="TITLE" && artist!="ARTIST" → 곡 추가 안됨', () => {
      const html = `
        <div>
          <span class="title">좋은날</span>
        </div>
      `;

      const result = parseGeniePlaylist(html);
      // artist가 없으면 추가되지 않아야 함
      const hasNoArtist = result.some((song) => song.title === '좋은날' && !song.artist);
      expect(hasNoArtist).toBe(false);
    });

    // TC-10-05: C1=거짓, C2=참, C3=참, C4=참 → 결과=거짓
    test('TC-10-05: title=false && artist=true && title!="TITLE" && artist!="ARTIST" → 곡 추가 안됨', () => {
      const html = `
        <div>
          <span class="artist">아이유</span>
        </div>
      `;

      const result = parseGeniePlaylist(html);
      // title이 없으면 추가되지 않아야 함
      const hasNoTitle = result.some((song) => !song.title && song.artist === '아이유');
      expect(hasNoTitle).toBe(false);
    });

    // TC-10-06: C1=거짓, C2=거짓, C3=참, C4=참 → 결과=거짓
    test('TC-10-06: title=false && artist=false && title!="TITLE" && artist!="ARTIST" → 곡 추가 안됨', () => {
      const html = `<div></div>`;

      const result = parseGeniePlaylist(html);
      // title과 artist가 모두 없으면 추가되지 않아야 함
      expect(result.length).toBe(0);
    });

    // TC-10-07: C1=참, C2=참, C3=거짓, C4=거짓 → 결과=거짓
    test('TC-10-07: title=true && artist=true && title="TITLE" && artist="ARTIST" → 곡 추가 안됨', () => {
      const html = `
        <tr>
          <td><a class="title" title="TITLE">TITLE</a></td>
          <td><a class="artist" title="ARTIST">ARTIST</a></td>
        </tr>
      `;

      const result = parseGeniePlaylist(html);
      // TITLE과 ARTIST인 경우 추가되지 않아야 함
      const hasBoth = result.some((song) => song.title === 'TITLE' && song.artist === 'ARTIST');
      expect(hasBoth).toBe(false);
    });

    // TC-10-08: C1=거짓, C2=거짓, C3=거짓, C4=거짓 → 결과=거짓
    test('TC-10-08: title=false && artist=false && title="TITLE" && artist="ARTIST" → 곡 추가 안됨', () => {
      const html = `<div></div>`;

      const result = parseGeniePlaylist(html);
      expect(result.length).toBe(0);
    });
  });
});


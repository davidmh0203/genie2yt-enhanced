import type { ParsedSong, YouTubeVideo } from '../../../types';

export class TitleExactMatch {
  match(song: ParsedSong, video: YouTubeVideo): number {
    const songTitle = song.title.toLowerCase().trim();
    const videoTitle = video.title.toLowerCase().trim();

    if (songTitle === videoTitle) {
      return 1.0;
    }

    const artist = song.artist.toLowerCase().trim();
    if (videoTitle.includes(songTitle) && videoTitle.includes(artist)) {
      return 0.95;
    }

    if (videoTitle.includes(songTitle)) {
      return 0.8;
    }

    return 0;
  }
}











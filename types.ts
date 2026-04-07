export interface SongDetails {
  title: string;
  artist: string;
  album: string;
  year: string;
  genre: string;
  description: string;
}

export enum AppStep {
  SEARCH = 'SEARCH',
  VERIFY = 'VERIFY',
  STYLE_SELECT = 'STYLE_SELECT',
  CONVERTING = 'CONVERTING',
  RESULT = 'RESULT',
}

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
}

export interface ConversionResult {
  audioUrl: string;
  description: string;
}

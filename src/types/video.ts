export interface VideoItem {
  id: string;
  url: string;
  title: string;
  likes: number;
}

export type FeedItem = 
  | { type: "video"; data: VideoItem }
  | { type: "ad"; id: string };

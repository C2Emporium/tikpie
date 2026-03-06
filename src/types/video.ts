export interface VideoItem {
  id: string;
  url: string;
  title: string;
  likes: number;
  mediaType?: "video" | "image";
}

export type FeedItem =
  | { type: "video"; data: VideoItem }
  | { type: "ad"; id: string };

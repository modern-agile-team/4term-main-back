export interface Announce<T> {
  no: number;
  title: string;
  description: string;
  imageUrls: T;
}

export interface AnnounceImage {
  imageUrl: string;
  announceNo: number;
}

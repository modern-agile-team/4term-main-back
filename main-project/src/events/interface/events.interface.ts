export interface Event<T> {
  no: number;
  title: string;
  description: string;
  createdDate: Date;
  isDone: boolean;
  imageUrls: T;
}

export interface EventImage<T> {
  imageUrl: T;
  eventNo?: number;
}

export interface EventPagenation {
  events: Event<string[]>[];
  totalPage: number;
  page: number;
}

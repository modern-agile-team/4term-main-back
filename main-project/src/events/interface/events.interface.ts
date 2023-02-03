export interface Event<T> {
  no: number;
  title: string;
  description: string;
  createdDate: Date;
  isDone: boolean;
  imageUrls: T;
}

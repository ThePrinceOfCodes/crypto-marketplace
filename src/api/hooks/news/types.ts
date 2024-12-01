export interface INews {
  date: string;
  imageUrl: string;
  uuid: string;
  createdAt: string;
  subtitle: string;
  url: string;
  title: string;
}

export interface IAddNewsReq {
  date: string;
  imageUrl: string;
  subtitle: string;
  url: string;
  title: string;
}

export interface IUpdateNewsReq extends IAddNewsReq {
  id: string;
}

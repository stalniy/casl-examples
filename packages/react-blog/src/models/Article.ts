import { User } from './User';

export interface Article {
  id: string
  title: string
  body: string
  published: boolean
  createdAt: string
  author: string
  createdBy: User
}

export type TPostSerializer = {
  id: string;
  title: string;
  main_text:  string;
  hashtags: string;
  picture?: string
  planning_date_time?: string;
  like?: boolean;
  active?: boolean;
}

export enum ContentPlanPostingType {
  UNKNOWN = 'UNKNOWN',
  POST = 'POST',
  REELS = 'REELS',
  STORIES = 'STORIES',
}
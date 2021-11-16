export const pageStatusKey = "pageStatus";
export const userKey = "user";
export const shownPostsKey = "shownPosts";
export const nextUSTKey = 'nextUSTTime';

export const isVotedText = "You\'ve already voted.";
export const isAuthorText = "You cannot vote on your own post or comment.";
export const notLoginText = "Sign in to participate.";
export const loadingText = "Some action is pending, please wait...";
export const expiredText = "You cannot vote on posts with expired epoch key."

export interface User {
    identity: string,
    epoch_keys: string[],
    all_epoch_keys: string[],
    reputation: number,
    current_epoch: number,
    isConfirmed: boolean,
    spent: number,
    userState: any,
}

export interface Vote {
    upvote: number,
    downvote: number,
    epoch_key: string,
}

export interface Comment {
    type: DataType,
    id: string,
    post_id: string,
    content: string,
    votes: Vote[],
    upvote: number,
    downvote: number,
    isUpvoted: boolean,
    isDownvoted: boolean,
    epoch_key: string,
    username: string,
    post_time: number,
    reputation: number,
    isAuthor: boolean,
    current_epoch: number,
}

export interface Post {
    type: DataType,
    id: string,
    content: string,
    votes: Vote[],
    upvote: number,
    downvote: number,
    isUpvoted: boolean,
    isDownvoted: boolean,
    epoch_key: string,
    username: string,
    post_time: number,
    reputation: number,
    comments: Comment[],
    isAuthor: boolean,
    current_epoch: number,
}

export interface History {
    action: ActionType,
    epoch_key: string,
    upvote: number, 
    downvote: number,
    epoch: number,
    time: number,
    data_id: string,
}

export type FeedChoices = {
    query0: QueryType, // popularity or time
    query1: QueryType, // pos or neg
    query2: QueryType, // main type
    query3: QueryType  // period
}

export enum PageStatus {
    None,
    SignUp,
    SignIn,
}

export enum DataType {
    Post,
    Comment,
}

export enum ActionType {
    Post = "Post",
    Comment = "Comment",
    Vote = "Vote",
    UST = "UST",
}

export enum Page {
    Home,
    Post,
    User,
}

export enum ChoiceType {
    Feed,
    Epk,
}

export enum UserPageType {
    Posts = "Posts",
    History = "History",
    Settings = "Settings",
}

export enum QueryType {
    most = 'most',
    fewest = 'fewest',
    newest = 'newest', 
    oldest ='oldest',
    popularity = 'popularity',
    time = 'time',
    reputation = 'reputation',
    votes = 'votes',
    upvotes = 'upvotes',
    comments = 'comments',
    posts = 'posts',
    today = 'today',
    this_week = 'this week',
    this_month = 'this month',
    this_year = 'this year',
    all_time = 'all time'
}

export interface Params {
    id: string,
}

export const getDaysByString = (value: string) => {
    if (value === 'today') return 1;
    else if (value === 'this week') return 7;
    else if (value === 'this month') return 30;
    else if (value === 'this year') return 365;
    else return 365000;
}

export const diffDays = (date: number, otherDate: number) => Math.ceil(Math.abs(date - otherDate) / (1000 * 60 * 60 * 24));

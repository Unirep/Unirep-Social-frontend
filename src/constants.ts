export const pageStatusKey = "pageStatus";
export const userKey = "user";
export const shownPostsKey = "shownPosts";
export const nextUSTKey = 'nextUSTTime';

export const isVotedText = "You\'ve already voted.";
export const isAuthorText = "You cannot vote on your own post or comment.";
export const notLoginText = "Sign in to participate.";
export const loadingText = "Some action is pending, please wait...";
export const expiredText = "You cannot vote on posts with expired epoch key."
export const offChainText = "This post is not able to be voted yet."

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
    id: string, // === txHash
    post_id: string,
    content: string,
    votes: Vote[],
    upvote: number,
    downvote: number,
    epoch_key: string,
    username: string,
    post_time: number,
    reputation: number,
    current_epoch: number,
    proofIndex: number,
}

export interface Post {
    type: DataType,
    id: string, // txHash
    title: string,
    content: string,
    votes: Vote[],
    upvote: number,
    downvote: number,
    epoch_key: string,
    username: string,
    post_time: number,
    reputation: number,
    comments: Comment[],
    commentsCount: number,
    current_epoch: number,
    proofIndex: number,
}

export enum ButtonType {
    Comments = "comments",
    Boost = "boost",
    Squash = "squash",
    Share = "share",
    Post = "post",
    Activity = "activity",
    Save = "save",
}

export enum InfoType {
    epk4Post = 'Select one of epoch key as the persona to post this post',
    epk4Comment = 'Select one of epoch key as the persona to post this comment',
    rep = 'Show off or being modest. This might influence how other people think of the content',
    countdown = 'Not yet decide what to say',
    persona = 'Not yet decide what to say'
}

export interface Record {
    action: ActionType,
    from: string,
    to: string,
    upvote: number, 
    downvote: number,
    epoch: number,
    time: number,
    data_id: string,
    content: string,
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
    Signup = "Signup",
}

export enum Page {
    Home,
    Post,
    User,
    New,
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
    New = 'new',
    Boost = 'boost',
    Comments = 'comments',
    Squash = 'squash',
    Rep = 'rep',
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

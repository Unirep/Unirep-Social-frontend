import { useState, useEffect } from 'react';

import { FetchType, ActionType, Post, Vote, Comment, DataType } from '../constants';
import useFetch from './useFetch';

const useGetData = (action: ActionType, param: string|null, args: string|null) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    const { 
        data: fetchData, 
        loading: fetchLoading, 
        error: fetchError
    } = useFetch(FetchType.GET, action, param, args, null);

    const convertDataToPost = (data: any, commentsOnlyId: boolean = true) => {

        const {votes, upvote, downvote} = convertDataToVotes(data.votes);
    
        let comments: Comment[] = [];
        if (!commentsOnlyId) {
            for (var i = 0; i < data.comments.length; i ++) {
                const comment = convertDataToComment(data.comments[i]);
                comments = [...comments, comment];
            }
        }
    
        const post: Post = {
            type: DataType.Post,
            id: data.transactionHash,
            title: data.title,
            content: data.content,
            votes,
            upvote,
            downvote,
            epoch_key: data.epochKey,
            username: '',
            post_time: Date.parse(data.created_at),
            reputation: data.minRep,
            comments,
            commentsCount: data.comments? data.comments.length : 0,
            current_epoch: data.epoch,
            proofIndex: data.proofIndex,
        }
    
        return post;
    }

    const convertDataToVotes = (data: any) => {
        if (data === null || data === undefined) return {votes: [], upvote: 0, downvote: 0};
        let votes: Vote[] = [];
        let upvote: number = 0;
        let downvote: number = 0;
        for (var i = 0; i < data.length; i ++) {
            const posRep = Number(data[i].posRep);
            const negRep = Number(data[i].negRep);
            const vote: Vote = {
                upvote: posRep,
                downvote: negRep,
                epoch_key: data[i].voter,
            }
            upvote += posRep;
            downvote += negRep;
            votes = [...votes, vote];
        }
    
        return {votes, upvote, downvote};
    }
    
    const convertDataToComment = (data: any) => {
        const {votes, upvote, downvote} = convertDataToVotes(data.votes);
        const comment = {
            type: DataType.Comment,
            id: data.transactionHash,
            post_id: data.postId,
            content: data.content,
            votes,
            upvote,
            downvote,
            epoch_key: data.epochKey,
            username: '',
            post_time: Date.parse(data.created_at),
            reputation: data.minRep,
            current_epoch: data.epoch,
            proofIndex: data.proofIndex,
        }
    
        return comment;
    }

    const parseData = () => {
        let ret: any;
        if (action === ActionType.Post) { // getPosts
            ret = [];
            for (var i = 0; i < fetchData.length; i ++) {
                const post = convertDataToPost(fetchData[i]);
                ret = [...ret, post];
            }
        } else if (action === ActionType.Comment) { // getComments
            ret = [];
            for (var i = 0; i < data.length; i ++) {
                const comment = convertDataToComment(data[i]);
                ret = [...ret, comment];
            }
        }

        setData(ret);
    } 

    useEffect(() => {
        if (fetchData !== null) {
            parseData();
            setLoading(false);
        }
    }, [fetchData]);

    useEffect(() => {
        if (fetchLoading) {
            setLoading(fetchLoading);
        }
    }, [fetchLoading]);

    useEffect(() => {
        setError(fetchError);
        if (!fetchLoading) {
            setLoading(fetchLoading);
        }
    }, [fetchError]);


    return { data, loading, error };
}

export default useGetData;
import React from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { useRouter } from 'next/router'
import ReactMarkDown from 'react-markdown'

import { listTodos, getTodo } from '@/src/graphql/queries'
import { GetTodoQuery, ListTodosQuery } from '../api/API'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import NavBar from '../components/navbar'

interface PostPage {
    post: {
        __typename: "Todo";
        id: string;
        title: string;
        content: string;
        username?: string | null | undefined;
        coverImage?: string | null | undefined;
        createdAt: string;
        updatedAt: string;
    }
}

export const getStaticPaths: GetStaticPaths = async () => {
    const postsData = (await API.graphql(graphqlOperation(listTodos))) as {
        data: ListTodosQuery
    }
    const paths = postsData.data.listTodos?.items.map(post => ({ params: { id: post?.id }}));
    
    return {
        paths: paths!,
        fallback: false
    };
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const { id } = params!;
    const postData = (await API.graphql(graphqlOperation(getTodo, {
        id
    }))) as {
        data: GetTodoQuery,
    };

    return {
        props: {
            post: postData.data.getTodo!
        }
    }
}

const Post: NextPage<PostPage> = ({ post }) => { 
    const router = useRouter();

    if (router.isFallback) {
        return (
            <div>Loading...</div>
        );
    }

    return (
        <>
            <Head>
                <title>Amplify Blog | {post.title}</title>
                <meta name="description" content="This is a blog developed with Next and Amplify" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`min-h-screen w-full bg-neutral-900 pt-60`}>
                <NavBar />
                <div className='max-w-xl w-full mx-auto shadow-lg bg-neutral-800 p-3 rounded-lg border border-yellow-500'>
                    <div className='text-5xl text-white font-bold mb-5'>{post.title}</div>
                    <div className='text-lg font-light text-white'>{post.username}</div>
                    <ReactMarkDown className='text-white'>{post.content}</ReactMarkDown>
                </div>
            </main>
        </>
    )
}

export default Post

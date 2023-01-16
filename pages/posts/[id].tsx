import React, { useEffect, useState } from 'react'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { API, graphqlOperation, Storage } from 'aws-amplify'
import { useRouter } from 'next/router'
import ReactMarkDown from 'react-markdown'
import Head from 'next/head'
import Image from 'next/image'
import moment from 'moment';

import NavBar from '../components/navbar'
import { listTodos, getTodo } from '@/src/graphql/queries'
import { GetTodoQuery, ListTodosQuery } from '../api/API'

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
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
      updateCoverImage();
    }, [])
    
    const updateCoverImage = async () => {
        if(post.coverImage) {
            const imageKey = await Storage.get(post.coverImage);
            setCoverImage(imageKey);
        }
    }

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
                    {coverImage && (
                        <Image src={coverImage} width={50} height={50} alt="Cover Image" className='my-2 object-cover object-center w-full h-24 rounded-lg' />
                    )}
                    <div className='text-5xl text-white font-bold mb-5'>{post.title}</div>
                    <div className='text-lg font-light text-white'>by {post.username ? post.username : "Unknown"} {moment(post.updatedAt).fromNow()}</div>
                    <ReactMarkDown className='text-white mt-5 text-lg'>{post.content}</ReactMarkDown>
                </div>
            </main>
        </>
    )
}

export default Post

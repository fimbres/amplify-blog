import React, { useEffect, useState } from 'react'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import { API, graphqlOperation, Storage, Auth } from 'aws-amplify'
import { useRouter } from 'next/router'
import ReactMarkDown from 'react-markdown'
import Head from 'next/head'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import moment from 'moment';
import { v4 as uuid } from 'uuid';

import NavBar from '../../components/navbar'
import { listTodos, getTodo } from '@/src/graphql/queries'
import { GetTodoQuery, ListTodosQuery } from '../../src/graphql/API'
import { createComment } from '@/src/graphql/mutations'

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })

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
    const [message, setMessage] = useState('');
    const [showEditor, setShowEditor] = useState(false);
    const router = useRouter();
    const [user, setUser] = useState<any | null>(null);

    const getUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
        setUser(user);
    }

    useEffect(() => {
      updateCoverImage();
      getUser();
    }, [])
    
    const updateCoverImage = async () => {
        if(post.coverImage) {
            const imageKey = await Storage.get(post.coverImage);
            setCoverImage(imageKey);
        }
    }

    const sendComment = async () => {
        if(!message) return;

        const id = uuid();
        const comment = {
            id,
            message,
            postID: post.id
        };

        try {
            await API.graphql({
                query: createComment,
                variables: {
                    input: {
                        ...comment
                    }
                },
                authMode: 'AMAZON_COGNITO_USER_POOLS'
            });

            router.push("/");
        } catch (error) {
            console.error(error);
        }
    }

    if(!post){
        router.push("/");
    }

    if (router.isFallback) {
        return (
            <div>Loading...</div>
        );
    }

    return (
        <>
            <Head>
                <title>Amplify Blog | {post?.title ? post.title : "Post"}</title>
                <meta name="description" content="This is a blog developed with Next and Amplify" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`min-h-screen w-full bg-neutral-900 pt-36`}>
                <NavBar />
                <div className='max-w-xl w-full mx-auto shadow-lg bg-neutral-800 p-3 rounded-lg border border-yellow-500'>
                    {coverImage && (
                        <Image src={coverImage} width={50} height={50} alt="Cover Image" className='my-2 object-cover object-center w-full h-24 rounded-lg' />
                    )}
                    <div className='text-5xl text-white font-bold mb-5'>{post.title}</div>
                    <div className='text-lg font-light text-white'>by {post.username ? post.username : "Unknown"} {moment(post.updatedAt).fromNow()}</div>
                    <ReactMarkDown className='text-white mt-5 text-lg'>{post.content}</ReactMarkDown>
                </div>
                {user && <div className='max-w-xl w-full mx-auto shadow-lg'>
                    <button className='w-full text-center py-2 bg-black rounded-md text-white font-medium text-lg my-4 hover:opacity-90' type='button' onClick={() => setShowEditor(!showEditor)}>Write a Comment</button>
                    {showEditor && (
                        <>
                            <SimpleMDE 
                                value={message}
                                onChange={setMessage}
                                placeholder='Content...'
                                className='shadow-2xl border border-yellow-400 rounded-md overflow-hidden'
                            />
                            <button className='w-full text-center py-2 bg-yellow-400 rounded-md text-white font-medium text-lg my-4 hover:opacity-90' type='button' onClick={sendComment}>Save</button>
                        </>
                    )}
                </div>}
            </main>
        </>
    )
}

export default Post

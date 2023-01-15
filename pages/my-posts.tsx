import React, { useEffect, useState } from 'react'
import { API, graphqlOperation, Auth } from "aws-amplify";
import moment from "moment";
import Link from 'next/link';
import Head from 'next/head';
import ReactMarkDown from 'react-markdown'

import { PostsByUsernameQuery } from './api/API';
import { postsByUsername } from '@/src/graphql/queries';
import NavBar from './components/navbar';
import { deleteTodo } from '@/src/graphql/mutations';

const MyPosts = () => {
    const [posts, setPosts] = useState<PostsByUsernameQuery>();
    const buttonClassName = ' w-full text-center py-1.5 text-white font-medium rounded-lg hover:opacity-70 ';

    const fetchPosts = async () => {
        const user = await Auth.currentAuthenticatedUser();
        const postsData = (await API.graphql(graphqlOperation(postsByUsername, { username: `${user.attributes.sub}::${user.username}` }))) as {
            data: PostsByUsernameQuery
        }
        setPosts(postsData.data);
    }

    const deletePost = async (id: string) => {
        await API.graphql({
            query: deleteTodo,
            variables: { input: { id } },
            authMode: 'AMAZON_COGNITO_USER_POOLS'
        });

        fetchPosts();
    }

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <>
            <Head>
                <title>Amplify Blog | Home</title>
                <meta name="description" content="This is a blog developed with Next and Amplify" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className='min-h-screen w-full bg-neutral-900'>
                <NavBar />
                <div className='max-w-xl w-full mx-auto pt-28'>
                    <div className='text-4xl font-bold text-white'>My Posts</div>
                    <div className='min-h-full w-full'>
                        {posts ? (
                            <div className='flex justify-center items-center min-h-full mt-10 flex-col'>
                                {posts.postsByUsername?.items.map((post, index) => (
                                    <div key={index} className='bg-neutral-800 w-full rounded-lg px-5 py-3 mb-7'>
                                        <div className='flex space-x-3 items-center'>
                                        <div className='text-white text-lg font-medium'>{post?.title}</div>
                                        <div className='text-gray-400 text-sm font-light'>by {post?.username} {moment(post?.updatedAt).fromNow()}</div>
                                        </div>
                                        <ReactMarkDown className='text-white text-lg'>{post?.content!}</ReactMarkDown>
                                        <div className='w-full flex justify-between space-x-2 mt-4'>
                                            <Link href={`/posts/${post?.id}`} className={buttonClassName + 'bg-black'}>See Post</Link>
                                            <Link href={`/edit-post/${post?.id}`} className={buttonClassName + 'bg-yellow-400'}>Edit Post</Link>
                                            <button className={buttonClassName + 'bg-red-500'} onClick={() => deletePost(post?.id!)}>Delete Post</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='flex justify-center items-center min-h-full mt-44'>
                                <div className='text-2xl text-white'>You don&apos;t have any posts!</div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}

export default MyPosts;

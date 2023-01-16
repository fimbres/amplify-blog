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
import PostCard from './components/postcard';

const MyPosts = () => {
    const [posts, setPosts] = useState<PostsByUsernameQuery>();

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
                <title>Amplify Blog | My Posts</title>
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
                                {posts.postsByUsername?.items.map((post, index) => <PostCard key={index} post={post!} deletePost={deletePost} />)}
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

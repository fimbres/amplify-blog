import React, { ChangeEvent, FC, useEffect, useState } from 'react'
import { AmplifyAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { API, Auth } from 'aws-amplify'
import NavBar from './components/navbar';
import { useRouter } from 'next/router';
import { v4 as uuid } from "uuid";
import { createTodo } from '@/src/graphql/mutations';
import Head from 'next/head';
import dynamic from 'next/dynamic'

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })

interface Post {
    id?: string;
    title: string;
    content: string;
}

const CreatePost: FC = () => {
    const [post, setPost] = useState<Post>({
        title: "",
        content: "",
    });
    const router = useRouter();

    const checkUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
        
        if(!user){
            router.push("/profile");
        }
    } 

    useEffect(() => {
        checkUser();
    }, []);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPost({
            ...post,
            [e.target.name]: e.target.value
        });
    }

    const createPost = async () => {
        if(!post.title || !post.content) return;

        const id = uuid();
        post.id = id;

        await API.graphql({
            query: createTodo,
            variables: { input: post },
            authMode: "AMAZON_COGNITO_USER_POOLS"
        });
        router.push("/posts/" + id);
    }

    return (
        <>
            <Head>
                <title>Amplify Blog | Create Post</title>
                <meta name="description" content="This is a blog developed with Next and Amplify" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={`min-h-screen w-full bg-neutral-900 pt-60`}>
                <NavBar />
                <div className='max-w-xl w-full mx-auto shadow-lg bg-neutral-800 p-3 rounded-lg border border-yellow-500'>
                    <div className='text-5xl text-white font-bold mb-5'>New Post</div>
                    <form>
                        <input onChange={onChange} name='title' placeholder='Title...' value={post.title} className='w-full px-3 py-1.5 rounded-lg bg-neutral-900 text-white'/>
                        <SimpleMDE 
                            value={post.content}
                            onChange={(value) => setPost({...post, content: value})}
                            placeholder='Content...'
                            className='mt-3'
                        />
                        <button type='button' onClick={createPost} className='w-full text-center py-2 bg-yellow-500 rounded-md text-white font-medium text-lg mt-4 hover:opacity-90'>Create Post</button>
                    </form>
                </div>
            </main>
        </>
  )
}

export default CreatePost

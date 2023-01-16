import React, { ChangeEvent, FC, useEffect, useState, useRef } from 'react'
import { API, Auth, Storage } from 'aws-amplify'
import { useRouter } from 'next/router';
import { v4 as uuid } from "uuid";
import Head from 'next/head';
import dynamic from 'next/dynamic'
import Image from 'next/image';

import NavBar from '../components/navbar';
import { createTodo } from '@/src/graphql/mutations';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false })

interface Post {
    id?: string;
    title: string;
    content: string;
    coverImage?: string;
}

const CreatePost: FC = () => {
    const [post, setPost] = useState<Post>({
        title: "",
        content: "",
    });
    const [image, setImage] = useState<File | null>(null);
    const router = useRouter();
    const imageFileInput = useRef<HTMLInputElement>(null);

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

    const uploadImage = async () => {
        imageFileInput?.current?.click();

    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileUploaded = e?.target?.files ? e.target.files[0] : undefined;
        
        if(!fileUploaded) return;

        setImage(fileUploaded);
    }

    const createPost = async () => {
        if(!post.title || !post.content) return;

        const id = uuid();
        post.id = id;

        if(image) {
            const filename = `${image.name}_${uuid()}`;
            post.coverImage = filename;
            await Storage.put(filename, image);
        }

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
            <main className={`min-h-screen w-full bg-neutral-900 pt-32`}>
                <NavBar />
                <div className='max-w-xl w-full mx-auto shadow-lg bg-neutral-800 p-3 rounded-lg border border-yellow-500'>
                    <div className='text-5xl text-white font-bold mb-5'>New Post</div>
                    <form>
                        {image && (
                            <Image src={URL.createObjectURL(image)} width={50} height={50} alt="Cover Image" className='my-2 object-cover object-center w-full h-24 rounded-lg' />
                        )}
                        <input onChange={onChange} name='title' placeholder='Title...' value={post.title} className='w-full px-3 py-1.5 rounded-lg bg-neutral-900 text-white'/>
                        <SimpleMDE 
                            value={post.content}
                            onChange={(value) => setPost({...post, content: value})}
                            placeholder='Content...'
                            className='mt-3'
                        />
                        <input type="file" ref={imageFileInput} onChange={handleChange} className='invisible w-0 h-0'/>
                        <button type='button' onClick={uploadImage} className='w-full text-center py-2 bg-black rounded-md text-white font-medium text-lg mt-4 hover:opacity-90'>Upload Cover Image</button>
                        <button type='button' onClick={createPost} className='w-full text-center py-2 bg-yellow-500 rounded-md text-white font-medium text-lg mt-4 hover:opacity-90'>Create Post</button>
                    </form>
                </div>
            </main>
        </>
  )
}

export default CreatePost

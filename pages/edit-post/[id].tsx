import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import { API, graphqlOperation, Storage } from 'aws-amplify'
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic'
import { v4 as uuid } from "uuid";
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Image from 'next/image';

import NavBar from '../../components/navbar';
import { getTodo, listTodos } from '@/src/graphql/queries';
import { GetTodoQuery, ListTodosQuery } from '../../src/graphql/API';
import { updateTodo } from '@/src/graphql/mutations';

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

interface Post {
    id?: string;
    title: string;
    content: string;
    coverImage?: string;
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

const EditPost: NextPage<PostPage> = ({ post }) => {
    const [inputPost, setInputPost] = useState<Post>({ id: post.id, title: post.title, content: post.content})
    const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
    const [inputImage, setInputImage] = useState<File | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
      if(post.coverImage){
        updateCoverImage(post.coverImage);
      }
    }, []);

    const updateCoverImage = async (imageKey: string) => {
        const image = await Storage.get(imageKey);
        setCoverImage(image);
    }

    const uploadImage = async () => {
        fileInput?.current?.click();
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileUpload = e.target?.files ? e.target.files[0] : undefined;

        if(!fileUpload) return;

        setCoverImage(URL.createObjectURL(fileUpload));
        setInputImage(fileUpload);
    }

    if (router.isFallback) {
        return (
            <div>Loading...</div>
        );
    }
    
    if(!id || !post) router.push("/my-posts");

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setInputPost({
            ...inputPost,
            [e.target.name]: e.target.value
        });
    }

    const updatePost = async () => {
        if(!inputPost.title || !inputPost.content || !inputPost.id) return;

        if(coverImage && inputImage) {
            const fileName = `${inputImage.name}_${uuid()}`;
            inputPost.coverImage = fileName;

            await Storage.put(fileName, inputImage);
        }

        await API.graphql({
            query: updateTodo,
            variables: {
                input: {
                    ...inputPost
                }
            },
            authMode: 'AMAZON_COGNITO_USER_POOLS'
        });

        router.push('/my-posts');
    }

    return (
        <>
            <Head>
                <title>Amplify Blog | Edit Post</title>
                <meta name="description" content="This is a blog developed with Next and Amplify" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className='min-h-screen w-full bg-neutral-900 pt-32'>
                <NavBar />
                <div className='max-w-xl w-full mx-auto shadow-lg bg-neutral-800 p-3 rounded-lg border border-yellow-500'>
                    <div className='text-5xl text-white font-bold mb-5'>Edit Post</div>
                    <form>
                        {coverImage && (
                            <Image src={coverImage} width={50} height={50} alt="Cover Image" className='my-2 object-cover object-center w-full h-24 rounded-lg' />
                        )}
                        <input onChange={onChange} name='title' placeholder='Title...' value={inputPost.title} className='w-full px-3 py-1.5 rounded-lg bg-neutral-900 text-white'/>
                        <SimpleMDE 
                            value={inputPost.content}
                            onChange={(value) => setInputPost({...inputPost, content: value})}
                            placeholder='Content...'
                            className='mt-3'
                        />
                        <input type="file" ref={fileInput} onChange={handleChange} className='invisible h-0 w-0'/>
                        <button type='button' onClick={uploadImage} className='w-full text-center py-2 bg-black rounded-md text-white font-medium text-lg mt-4 hover:opacity-90'>Upload Image</button>
                        <button type='button' onClick={updatePost} className='w-full text-center py-2 bg-yellow-500 rounded-md text-white font-medium text-lg mt-4 hover:opacity-90'>Edit Post</button>
                    </form>
                </div>
            </main>
        </>
    )
}

export default EditPost

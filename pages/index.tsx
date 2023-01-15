import { useState, useEffect } from 'react';
import Head from 'next/head'
import { API, graphqlOperation } from 'aws-amplify'
import Link from 'next/link';
import moment from 'moment';

import { listTodos } from 'src/graphql/queries';
import { ListTodosQuery } from 'pages/api/API';
import NavBar from './components/navbar';

export default function Home() {
  const [posts, setPosts] = useState<ListTodosQuery>();

  const fetchPosts = async () => {
    const postsData = (await API.graphql(graphqlOperation(listTodos))) as {
      data: ListTodosQuery
    }
    setPosts(postsData.data);
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
          <div className='text-4xl font-bold text-white'>All Posts</div>
          <div className='min-h-full w-full'>
            {posts ? (
              <div className='flex justify-center items-center min-h-full mt-10 flex-col'>
                {posts.listTodos?.items.map((post, index) => (
                  <Link key={index} href={`/posts/${post?.id}`} className='bg-neutral-800 w-full rounded-lg px-5 py-3 mb-7'>
                    <div className='flex space-x-3 items-center'>
                      <div className='text-white text-lg font-medium'>{post?.title}</div>
                      <div className='text-gray-400 text-sm font-light'>by {post?.username} {moment(post?.updatedAt).fromNow()}</div>
                    </div>
                    <div className='text-white text-lg'>{post?.content}</div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className='flex justify-center items-center min-h-full mt-44'>
                <div className='text-2xl text-white'>There is no posts registered!</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

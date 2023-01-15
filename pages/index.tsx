import { useState, useEffect } from 'react';
import Head from 'next/head'
import { API, graphqlOperation } from 'aws-amplify'

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
        <title>Amplify Blog</title>
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
              <div className='flex justify-center items-center min-h-full mt-44 flex-col'>
                {posts.listTodos?.items.map((post, index) => (
                  <div key={index} className='text-white mb-8'>{post?.title}</div>
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

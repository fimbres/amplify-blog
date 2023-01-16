import React, { FC, useState, useEffect } from 'react'
import { Storage } from 'aws-amplify'
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkDown from 'react-markdown'
import moment from 'moment';

interface PostCardProps {
  post: {
    __typename: "Todo";
    id: string;
    title: string;
    content: string;
    username?: string | null | undefined;
    coverImage?: string | null | undefined;
    comments?: {
        __typename: "ModelCommentConnection";
        nextToken?: string | null | undefined;
        items?: any[];
    } | null | undefined;
    createdAt: string;
    updatedAt: string;
  },
  deletePost?: (id: string) => void;
}

const PostCard: FC<PostCardProps> = ({ post, deletePost }) => {
    const [image, setImage] = useState<string | undefined>(undefined);
    const buttonClassName = ' w-full text-center py-1.5 text-white font-medium rounded-lg hover:opacity-70 ';

    const fetchImage = async () => {
        if(!post.coverImage) return undefined;

        const image = await Storage.get(post?.coverImage!);

        setImage(image);
    }

    useEffect(() => {
      fetchImage();
    }, []);
    
    return (
      <Link href={`/posts/${post?.id}`} className='bg-neutral-800 w-full rounded-lg px-5 py-3 mb-7'>
        <div className='flex space-x-3 items-center'>
          <div className='text-white text-lg font-medium'>{post?.title}</div>
          <div className='text-gray-400 text-sm font-light'>by {post?.username ? post?.username : "Unknown"} {moment(post?.updatedAt).fromNow()}</div>
        </div>
        {image && <Image src={image} width={50} height={50} alt="Cover Image" className='my-2 object-cover object-center w-full h-24 rounded-lg'/>}
        <ReactMarkDown className='text-white text-lg'>{post?.content!}</ReactMarkDown>
        {post.comments?.items && post.comments.items.map(comment => (
          <div key={comment.id} className='bg-black rounded-lg my-2 text-white ml-5 shadow-2xl px-3 py-1.5 font-light'>
            {comment.createdBy ? comment.createdBy : "Unknown"}: {comment.message}
          </div>
        ))}
        {deletePost && <div className='w-full flex justify-between space-x-2 mt-4'>
          <Link href={`/posts/${post?.id}`} className={buttonClassName + 'bg-black'}>See Post</Link>
          <Link href={`/edit-post/${post?.id}`} className={buttonClassName + 'bg-yellow-400'}>Edit Post</Link>
          <button className={buttonClassName + 'bg-red-500'} onClick={() => deletePost(post?.id!)}>Delete Post</button>
        </div>}
      </Link>
    );
}

export default PostCard;

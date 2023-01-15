import React, { FC, useEffect, useState } from 'react'
import { AmplifyAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { Auth } from 'aws-amplify'

const Profile: FC = () => {
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
      getUser();
    }, []);

    const getUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
        setUser(user);
    }
    
    return (
        <main className='min-h-screen w-full bg-neutral-900 pt-60'>
            <AmplifyAuthenticator>
                <div className='max-w-xl w-full mx-auto shadow-lg bg-neutral-800 p-3 rounded-lg border border-yellow-500'>
                    <div className='text-5xl text-white font-bold mb-5'>Profile</div>
                    <div className='text-xl text-white'>{user?.username}</div>
                    <div className='text-lg text-white font-light mt-1 mb-7'>{user?.attributes.email}</div>
                    <AmplifySignOut />
                </div>
            </AmplifyAuthenticator>
        </main>
    )
}

export default Profile

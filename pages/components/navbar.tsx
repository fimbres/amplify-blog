import React, { useEffect, useState} from "react";
import Link from "next/link";
import { Auth } from "aws-amplify";
import { useRouter } from "next/router";

import "../../configureAmplify"; 

const NavBar = () => {
    const [user, setUser] = useState<any | null>(null);
    const router = useRouter();
    const privateNavLinks = user ? [
        {
            label: "Create Post",
            to: "/create-post"
        },
        {
            label: "My Posts",
            to: "/my-posts"
        },
        {
            label: "Profile",
            to: "/profile"
        }
    ] : [
        {
            label: "Sign In",
            to: "/profile"
        },
    ];
    const navLinks = [
        {
            label: "Home",
            to: "/"
        },
        ...privateNavLinks,
    ];

    const getUser = async () => {
        const user = await Auth.currentAuthenticatedUser();
        setUser(user);
    } 

    useEffect(() => {
        getUser();
    }, []);

    return (
        <nav className="flex justify-between fixed top-0 right-0 left-0 w-full py-4 px-8 bg-neutral-800 border-b border-yellow-500">
            <div className="text-xl font-bold text-yellow-500">Amplify Blog</div>
            <div className="flex space-x-3">
                {navLinks.map((link, index) => {
                    const isCurrent = link.to === router.pathname;

                    return (
                        <Link key={index} href={link.to} className={`text-xl hover:opacity-70 ${isCurrent ? "text-yellow-400" : "text-white"}`}>{link.label}</Link>
                    );
                })}
            </div>
        </nav>
    )
}

export default NavBar

import React, { useEffect, useState} from "react";
import Link from "next/link";
import { Auth } from "aws-amplify";

import "../../configureAmplify"; 

const NavBar = () => {
    const [user, setUser] = useState<any | null>(null);
    const privateNavLinks = user ? [
        {
            label: "Create Post",
            to: "/create-post"
        },
        {
            label: "Profile",
            to: "/profile"
        }
    ] : [
        {
            label: "Sign In",
            to: "/sign-in"
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
        <nav className="flex justify-between fixed top-0 right-0 left-0 w-full py-4 px-8 bg-neutral-800 border-b">
            <div className="text-xl font-bold text-white">Amplify Blog</div>
            <div className="flex space-x-3">
                {navLinks.map((link, index) => (
                    <Link key={index} href={link.to} className="text-xl text-white hover:opacity-70">{link.label}</Link>
                ))}
            </div>
        </nav>
    )
}

export default NavBar
